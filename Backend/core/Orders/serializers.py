from rest_framework import serializers

# In products/serializers.py
from rest_framework import serializers
from .models import ProductItem

class ProductItemReadOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductItem
        fields = ['id', 'sku', 'product'] # Add name from product if needed
        # Example to get product name:
        # name = serializers.CharField(source='product.name', read_only=True)



