from rest_framework import serializers
from .models import Product, ProductImage, Category, CategoryImage, ProductItem, Variation, VariationOption,ProductConfiguration,Promotion,PromotionProduct,ProductReviewImage,ProductQuestion,ProductReview
from Users.serializers import UserSerializer



class CategoryImageSerializer(serializers.ModelSerializer):
    """Serializer for CategoryImage model"""
    image_url = serializers.ReadOnlyField()
    
    class Meta:
        model = CategoryImage
        fields = [
            'id',
            'image',
            'image_url',
            'alt_text',
            'is_primary',
            'display_order',
        ]
        read_only_fields = ['id', 'image_url']
        extra_kwargs = {
            'name': {
                'validators': [],  # Disable default unique validator
            }
        }

    def _validate_unique_name(self, name, parent_category):
        """
        Helper method to validate unique name within parent category
        """
        queryset = Category.objects.filter(name=name, deleted_at__isnull=True)
        
        if parent_category:
            queryset = queryset.filter(parent_category=parent_category)
        else:
            queryset = queryset.filter(parent_category__isnull=True)
        
        if self.instance:  # For updates, exclude current instance
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError({
                'name': 'A category with this name already exists in this hierarchy.'
            })


class CategorySerializer(serializers.ModelSerializer):
    """Basic Category serializer without nested relationships"""
    images = CategoryImageSerializer(many=True, read_only=True)
    parent_category_name = serializers.CharField(source='parent_category.name', read_only=True)
    
    class Meta:
        model = Category
        fields = [
            'name',
            'description',
            'parent_category',
            'parent_category_name',
            'display_order',
            'images',
        ]
    

class CategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for category lists"""
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'description'
        ]



class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating categories"""
    
    class Meta:
        model = Category
        fields = [
            'name',
            'description',
            'parent_category',
            'display_order'
        ]
    
    def validate_parent_category(self, value):
        """Validate that parent category is not deleted and not creating circular reference"""
        if value:
            # Check if parent category is not deleted
            if value.deleted_at is not None:
                raise serializers.ValidationError("Cannot set a deleted category as parent.")
            
            # Check for circular reference during update
            if self.instance:
                current = value
                while current:
                    if current.id == self.instance.id:
                        raise serializers.ValidationError("Cannot create circular reference in category hierarchy.")
                    current = current.parent_category
        
        return value


# Serializer for bulk operations
class CategoryBulkSerializer(serializers.Serializer):
    """Serializer for bulk category operations"""
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(choices=['delete', 'restore'])
    
    def validate_category_ids(self, value):
        """Validate that all category IDs exist"""
        existing_ids = Category.objects.filter(id__in=value).values_list('id', flat=True)
        missing_ids = set(value) - set(existing_ids)
        if missing_ids:
            raise serializers.ValidationError(f"Categories with IDs {list(missing_ids)} do not exist.")
        return value
    
################    variation   ###################
class VariationOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VariationOption
        fields = ['variation', 'value']


class VariationSerializer(serializers.ModelSerializer):
    options = VariationOptionSerializer(many=True, read_only=True, source='variationoption_set')

    class Meta:
        model = Variation
        fields = ['id', 'category', 'name', 'options']

#####------------------products
# Products/serializers.py

from rest_framework import serializers
from .models import (
    Product, ProductItem, ProductConfiguration,
    ProductImage, Category, VariationOption
)

class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.ReadOnlyField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'display_order', 'image_url']


class ProductConfigurationSerializer(serializers.ModelSerializer):
    variation_option = serializers.PrimaryKeyRelatedField(queryset=VariationOption.objects.all())

    class Meta:
        model = ProductConfiguration
        fields = ['id', 'variation_option', 'display_order']


class ProductItemSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = ProductItem
        fields = [
            'product', 'name', 'description', 'price', 'stock_quantity',
            'sku', 'display_order', 'images'
        ]


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    items = ProductItemSerializer(source='productitem_set', many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'name', 'description', 'price', 'display_order',
            'created_at', 'updated_at', 'deleted_at', 'status',
            'tax_percentage', 'brand', 'brand_model',
            'items'
        ]
