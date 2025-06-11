from rest_framework import serializers
from .models import ShoppingCart, CartItem
# We need a lightweight serializer for the products shown in the cart
from Products.models import ProductItem 


class SimpleProductItemSerializer(serializers.ModelSerializer):
    """
    A lightweight serializer for displaying product information within the cart.
    """
    # You can add more fields here like a primary image URL if needed
    name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductItem
        fields = ['id', 'name', 'price', 'sku']


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