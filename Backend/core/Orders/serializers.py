from rest_framework import serializers
from .models import ShippingMethod


class ShippingMethodSerializer(serializers.ModelSerializer):
    """
    Serializer for listing available shipping methods.
    """
    class Meta:
        model = ShippingMethod
        fields = ['id', 'name', 'price']

# Add these imports
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import ShippingMethod
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
from rest_framework import serializers
from .models import Order, OrderLine, ShippingMethod, OrderStatus
from Users.models import UserShippingAddress  # Assuming Address is in a 'users' app
from Carts.models import ShoppingCart # To get the items from the cart
from Products.models import ProductItem # To check stock

class OrderCreateSerializer(serializers.Serializer):
    """
    A write-only serializer to create a new Order from a user's shopping cart,
    based on the snapshot-oriented model design.
    """
    # These are the IDs the frontend will send in the request body
    shipping_address_id = serializers.IntegerField()
    shipping_method_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_shipping_address_id(self, value):
        """Check if the address exists and belongs to the current user."""
        user = self.context['request'].user
        if not UserShippingAddress.objects.filter(id=value, user=user).exists():
            raise serializers.ValidationError("Invalid shipping address selected.")
        return value

    def validate_shipping_method_id(self, value):
        """Check if the shipping method exists."""
        if not ShippingMethod.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid shipping method selected.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        """
        The main logic for creating the Order. This is a critical transaction.
        """
        user = self.context['request'].user
        
        # 1. Get the user's shopping cart items
        try:
            cart = ShoppingCart.objects.get(user=user)
            cart_items = cart.items.select_related('product_item__product').all()
            if not cart_items.exists():
                raise serializers.ValidationError({"cart": "Cannot create an order from an empty cart."})
        except ShoppingCart.DoesNotExist:
            raise serializers.ValidationError({"cart": "Shopping cart not found for this user."})

        # 2. Get related objects to create snapshots
        shipping_method = ShippingMethod.objects.get(id=validated_data['shipping_method_id'])
        address = address.objects.get(id=validated_data['shipping_address_id'])
        
        # 3. Create the address snapshot
        address_snapshot = {
            "street_address": address.street_address,
            "city": address.city,
            "state": address.state,
            "postal_code": address.postal_code,
            "country": address.country,
        }

        # 4. Create the main Order object with snapshot data
        order = Order.objects.create(
            user=user,
            status=OrderStatus.PENDING,
            notes=validated_data.get('notes'),
            # Snapshots:
            shipping_address_snapshot=address_snapshot,
            shipping_method_name=shipping_method.name,
            shipping_cost=shipping_method.price,
            # We will calculate financial totals later
        )

        # 5. Create OrderLine items from cart items, check stock, and create snapshots
        order_lines_to_create = []
        
        for item in cart_items:
            product_item = item.product_item
            
            # Business Rule: Check stock
            if product_item.stock_quantity < item.quantity:
                raise serializers.ValidationError(
                    f"Not enough stock for '{product_item.product.name}' (SKU: {product_item.sku}). "
                    f"Required: {item.quantity}, Available: {product_item.stock_quantity}."
                )
            
            order_lines_to_create.append(
                OrderLine(
                    order=order,
                    product_item=product_item,
                    quantity=item.quantity,
                    # Financial Snapshot:
                    price=product_item.price, # Lock in the price at time of purchase
                    # Product Details Snapshot:
                    product_name=product_item.product.name,
                    product_sku=product_item.sku
                )
            )
            
            # Decrement stock
            product_item.stock_quantity -= item.quantity
            product_item.save(update_fields=['stock_quantity'])

        # Create all lines in a single efficient query
        OrderLine.objects.bulk_create(order_lines_to_create)

        # 6. Finalize order totals by calling the model's own method
        order.recalculate_totals()

        # 7. Clear the user's shopping cart
        cart.items.all().delete()
        
        return order


