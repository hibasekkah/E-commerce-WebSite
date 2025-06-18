from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers

from Products.serializers import ProductImageSerializer
from .models import ShoppingCart, CartItem
# We need a lightweight serializer for the products shown in the cart
from Products.models import ProductItem 


class SimpleProductItemSerializer(serializers.ModelSerializer):
    """
    A lightweight serializer for displaying product information within the cart.
    """
    # You can add more fields here like a primary image URL if needed
    name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.CharField(source='product.id', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variations = serializers.SerializerMethodField()
    price_after_promotion = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductItem
        fields = [
            'id','product_id','name', 'price', 'price_after_promotion' , 'stock_quantity', 
            'display_order', 'status', 'images', 'variations'
        ]
    
    def get_variations(self, obj):
        """
        This method builds the clean {"Size": "M", "Color": "Red"} object.
        It iterates through the configurations of a single ProductItem instance ('obj').
        """
        return {
            config.variation_option.variation.name: config.variation_option.value
            for config in obj.productconfiguration_set.all()
        }
    
    def get_price_after_promotion(self, product_item):
        """
        Calculates the price after applying the best active promotion.
        Returns the original price if no active promotion is found.
        """
        now = timezone.now()
        original_price = product_item.price
        
        # Access the parent product through the product_item instance
        parent_product = product_item.product
        
        # This assumes your Many-to-One Promotion model where a Promotion
        # has a ForeignKey to a Product. We use the 'promotions' related_name.
        # We filter for promotions that are active AND within their date range.
        active_promotions = parent_product.promotions.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        )
        
        if not active_promotions.exists():
            # If there are no active promotions, return the original price.
            # You could also return `None` if you prefer the frontend to handle it.
            return original_price
            
        # If there could be multiple active promotions, find the one with the best discount.
        # We use .aggregate() and Max() for an efficient database query.
        from django.db.models import Max
        best_discount_rate = active_promotions.aggregate(
            max_discount=Max('discount_rate')
        )['max_discount']

        if best_discount_rate is None:
            return original_price # Should not happen if exists() passed, but safe to have.

        # Calculate the final price
        discount_multiplier = 1 - (best_discount_rate / 100)
        discounted_price = original_price * discount_multiplier
        
        # Return the price formatted to two decimal places
        return round(discounted_price, 2)


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for reading cart items. Includes nested product data.
    """
    product_item = SimpleProductItemSerializer(read_only=True)
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product_item', 'quantity', 'line_total']

    


class ShoppingCartSerializer(serializers.ModelSerializer):
    """
    Serializer for reading the main shopping cart.
    Includes a nested list of all cart items and calculated totals.
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()
    total_items = serializers.ReadOnlyField()

    class Meta:
        model = ShoppingCart
        fields = ['id', 'user', 'total_price', 'total_items', 'items', 'updated_at']


# --- Write-Only Serializers ---

class CartItemCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for adding a new item to the cart.
    Takes only the product_item ID and quantity.
    """
    product_item_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['product_item_id', 'quantity']


class CartItemUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating an existing item's quantity in the cart.
    """
    class Meta:
        model = CartItem
        fields = ['quantity']