from rest_framework import serializers
from .models import ShippingMethod
from Users.serializers import AddressCreateSerializer # Assuming you have this


class ShippingMethodSerializer(serializers.ModelSerializer):
    """
    Serializer for listing available shipping methods.
    """
    class Meta:
        model = ShippingMethod
        fields = ['id', 'name', 'price']

# Add these imports
from rest_framework import generics
from .serializers import ShippingMethodSerializer

# ... your other views (OrderListCreateAPIView, etc.)

class ShippingMethodListView(generics.ListAPIView):
    """
    A public API endpoint that lists all available shipping methods.
    This endpoint does not require authentication.
    """
    queryset = ShippingMethod.objects.all().order_by('price') # Order from cheapest to most expensive
    serializer_class = ShippingMethodSerializer

from django.db import transaction
from decimal import Decimal
from django.utils import timezone
from .models import Order, OrderLine, OrderStatus
from Users.models import UserShippingAddress, User # Assuming Address is in a 'users' app
from Carts.models import ShoppingCart

from rest_framework import serializers
from .models import Order, OrderLine
# We'll need serializers from other apps to show nested details
from Products.serializers import SimpleProductItemSerializer # Assuming you have this
from Users.serializers import AddressCreateSerializer # Assuming you have this
from Payments.serializers import PaymentSerializer # Assuming you have this

class OrderLineSerializer(serializers.ModelSerializer):
    """
    Formats a single line item within an order, showing product details.
    """
    # Use a nested serializer to show product details instead of just an ID
    product_item = SimpleProductItemSerializer(read_only=True)
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderLine
        fields = [
            'id', 
            'quantity', 
            'price',        # The final price after discounts
            'line_total',
            'product_item'
        ]

class OrderSerializer(serializers.ModelSerializer):
    """
    A detailed, read-only serializer for a single Order.
    It includes nested information about lines, payment, and address.
    """
    # --- Nested Relationships ---
    lines = OrderLineSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    
    # --- Helper/Calculated Fields ---
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # --- Snapshot Fields ---
    # The shipping_address_snapshot is a JSONField, so we can represent it as such
    shipping_address = serializers.JSONField(source='shipping_address_snapshot', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'status',
            'status_display', # e.g., "Processing"
            'created_at',
            'updated_at',
            'payment', # Nested payment details
            'shipping_address', # The address snapshot
            'shipping_method_name', # The shipping method name snapshot
            'tracking_number',
            # Financial Breakdown
            'subtotal',
            'shipping_cost',
            'discount_amount',
            'order_total',
            # Line Items
            'lines'
        ]

class OrderCreateSerializer(serializers.Serializer):
    """
    An enhanced serializer to create a new Order from a user's cart.
    It now supports creating a new address on the fly and applies promotions.
    """
    # ### MODIFIED: These two fields are now mutually exclusive ###
    # A user can provide an existing address ID OR a new address object.
    shipping_address_id = serializers.IntegerField(required=False)
    new_shipping_address = AddressCreateSerializer(required=False)

    # This field remains the same
    shipping_method_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_shipping_method_id(self, value):
        if not ShippingMethod.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid shipping method selected.")
        return value
    
    def validate(self, data):
        """
        Ensure that either an existing address ID or a new address object is provided, but not both.
        """
        address_id = data.get('shipping_address_id')
        new_address = data.get('new_shipping_address')

        if not address_id and not new_address:
            raise serializers.ValidationError("You must provide either 'shipping_address_id' or a 'new_shipping_address' object.")
        
        if address_id and new_address:
            raise serializers.ValidationError("Please provide either 'shipping_address_id' or 'new_shipping_address', not both.")
            
        return data

    @transaction.atomic
    
    def create(self, validated_data):
        
        user = self.context['request'].user
        
        # 1. Get the user's shopping cart items (no change here, this is perfect)
        try:
            cart = ShoppingCart.objects.get(user=user)
            cart_items = cart.items.select_related('product_item__product').all()
            if not cart_items.exists():
                raise serializers.ValidationError({"cart": "Cannot create an order from an empty cart."})
        except ShoppingCart.DoesNotExist:
            raise serializers.ValidationError({"cart": "Shopping cart not found for this user."})

        # 2. Get Shipping Method (no change)
        shipping_method = ShippingMethod.objects.get(id=validated_data['shipping_method_id'])
        
        # ### NEW: Logic to handle either an existing address or create a new one ###
        address_snapshot = {}
        if validated_data.get('new_shipping_address'):
            address_data = validated_data['new_shipping_address']
            # Create a new address in the user's address book
            # We use update_or_create to avoid creating duplicate addresses for the user.
            address, created = UserShippingAddress.objects.update_or_create(
                user=user,
                address=address_data['address'],
                city=address_data['city'],
                state=address_data['state'],
                postal_code=address_data['postal_code'],
                country=address_data['country'],
                defaults=address_data
            )
            address_snapshot = address_data
        else:
            # Use the existing address
            address = UserShippingAddress.objects.get(id=validated_data['shipping_address_id'], user=user)
            address_snapshot = {
                "address": address.street_address,
                "city": address.city,
                "state": address.state,
                "postal_code": address.postal_code,
                "country": address.country,
            }

        # 3. Create the main Order object (no change)
        order = Order.objects.create(
            user=user,
            status=OrderStatus.PENDING,
            notes=validated_data.get('notes'),
            shipping_address_snapshot=address_snapshot,
            shipping_method_name=shipping_method.name,
            shipping_cost=shipping_method.price,
            subtotal=Decimal('0.00'),
            discount_amount=Decimal('0.00'),
            order_total=Decimal('0.00')
        )

        # 4. Create OrderLine items with promotion logic
        order_lines_to_create = []
        total_discount = Decimal('0.00')
        
        for item in cart_items:
            product_item = item.product_item
            
            # Stock Check (no change)
            if product_item.stock_quantity < item.quantity:
                raise serializers.ValidationError(
                    f"Not enough stock for '{product_item.product.name}'. "
                    f"Available: {item.quantity}, Required: {product_item.stock_quantity}."
                )
            
            base_price = product_item.price
            final_price = base_price
            
            # ### NEW: Promotion Logic ###
            # Find the best active promotion for this product's parent.
            active_promos = product_item.product.promotions.filter(
                is_active=True,
                start_date__lte=timezone.now(),
                end_date__gte=timezone.now()
            )
            
            if active_promos.exists():
                # Find the promotion with the highest discount percentage
                best_promo = max(active_promos, key=lambda p: p.discount_rate)
                discount_rate = best_promo.discount_rate / Decimal('100.0')
                discount_for_this_item = base_price * discount_rate
                final_price = base_price - discount_for_this_item
                total_discount += discount_for_this_item * item.quantity

            order_lines_to_create.append(
                OrderLine(
                    order=order,
                    product_item=item.product_item,
                    quantity=item.quantity,
                    price=final_price, # <-- Use the final price after discount
                    product_name=product_item.product.name,
                    product_sku=product_item.sku
                )
            )
            
            # Decrement stock (no change)
            product_item.stock_quantity -= item.quantity
            product_item.save(update_fields=['stock_quantity'])

        OrderLine.objects.bulk_create(order_lines_to_create)

        # 5. Finalize order totals, now including the discount
        order.discount_amount = total_discount
        order.save(update_fields=['discount_amount']) # Save the discount first
        
        # Now, call the recalculate method which will set and save the final totals.
        order.recalculate_totals() 
        # 6. Clear the cart (no change)
        cart.items.all().delete()
        
        return order
    
class OrderListSerializer(serializers.ModelSerializer):
    """
    A lightweight, read-only serializer for listing a user's orders efficiently.
    """
    lines = OrderLineSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    
    # --- Helper/Calculated Fields ---
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # --- Snapshot Fields ---
    # The shipping_address_snapshot is a JSONField, so we can represent it as such
    shipping_address = serializers.JSONField(source='shipping_address_snapshot', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'status',
            'status_display', # e.g., "Processing"
            'created_at',
            'updated_at',
            'payment', # Nested payment details
            'shipping_address', # The address snapshot
            'shipping_method_name', # The shipping method name snapshot
            'tracking_number',
            # Financial Breakdown
            'subtotal',
            'shipping_cost',
            'discount_amount',
            'order_total',
            # Line Items
            'lines'
        ]


from rest_framework import serializers
from .models import Order, OrderLine
# We'll need serializers from other apps to show nested details
from Products.serializers import SimpleProductItemSerializer # Assuming you have this
from Users.serializers import AddressCreateSerializer # Assuming you have this
from Payments.serializers import PaymentSerializer # Assuming you have this

class OrderLineSerializer(serializers.ModelSerializer):
    """
    Formats a single line item within an order, showing product details.
    """
    # Use a nested serializer to show product details instead of just an ID
    product_item = SimpleProductItemSerializer(read_only=True)
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderLine
        fields = [
            'id', 
            'quantity', 
            'price',        # The final price after discounts
            'line_total',
            'product_item'
        ]

class OrderSerializer(serializers.ModelSerializer):
    """
    A detailed, read-only serializer for a single Order.
    It includes nested information about lines, payment, and address.
    """
    # --- Nested Relationships ---
    lines = OrderLineSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    
    # --- Helper/Calculated Fields ---
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # --- Snapshot Fields ---
    # The shipping_address_snapshot is a JSONField, so we can represent it as such
    shipping_address = serializers.JSONField(source='shipping_address_snapshot', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'status',
            'status_display', # e.g., "Processing"
            'created_at',
            'updated_at',
            'payment', # Nested payment details
            'shipping_address', # The address snapshot
            'shipping_method_name', # The shipping method name snapshot
            'tracking_number',
            # Financial Breakdown
            'subtotal',
            'shipping_cost',
            'discount_amount',
            'order_total',
            # Line Items
            'lines'
        ]




from rest_framework import serializers
from .models import Order, OrderStatus # Import the OrderStatus enum

class AdminOrderUpdateSerializer(serializers.ModelSerializer):
    """
    A specific serializer for admins to update an order's status
    and tracking information.
    """
    # We explicitly define the fields to ensure an admin can only change these.
    status = serializers.ChoiceField(choices=OrderStatus.choices)
    tracking_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Order
        fields = ['status', 'tracking_number']

    def validate(self, data):
        """
        Add crucial business logic: a tracking number is required
        if the new status is 'SHIPPED'.
        """
        # Get the new status from the incoming request data
        new_status = data.get('status')
        
        if new_status == OrderStatus.SHIPPED:
            # If the admin is trying to mark the order as shipped...
            tracking_number = data.get('tracking_number')
            if not tracking_number:
                # ...but didn't provide a tracking number, raise an error.
                raise serializers.ValidationError(
                    {"tracking_number": "A tracking number is required when marking an order as shipped."}
                )
        
        return data