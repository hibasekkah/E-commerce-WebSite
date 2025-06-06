from rest_framework import serializers
from .models import Product, ProductImage, Category, CategoryImage, ProductItem, Variation, VariationOption,ProductConfiguration
from Users.serializers import UserSerializer
from django.utils import timezone
from django.db import transaction


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
                'validators': [], 
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
        
        if self.instance:  
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
            'id',
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
        fields = ['id', 'value', 'variation']  # Inclure id pour la réponse
        read_only_fields = ['variation']  # Empêche la modification directe

    def validate_value(self, value):
        """Validation personnalisée pour la valeur"""
        if not value.strip():
            raise serializers.ValidationError("La valeur ne peut pas être vide")
        return value.strip()

class VariationSerializer(serializers.ModelSerializer):
    options = VariationOptionSerializer(many=True, required=False)

    class Meta:
        model = Variation
        fields = ['id', 'category', 'name', 'options']
        extra_kwargs = {
            'options': {'required': False, 'write_only': True}  # Cache dans la réponse
        }

    def create(self, validated_data):
        with transaction.atomic():  # Transaction atomique
            options_data = validated_data.pop('options', [])
            variation = super().create(validated_data)
            
            # Création en masse avec validation
            options = [
                VariationOption(variation=variation, value=option['value'])
                for option in options_data
            ]
            VariationOption.objects.bulk_create(options)
            
            return variation

    def to_representation(self, instance):
        """Surcharge pour inclure les options dans la réponse"""
        representation = super().to_representation(instance)
        representation['options'] = VariationOptionSerializer(
            instance.variationoption_set.all(), many=True).data
        return representation
#####------------------products
# Products/serializers.py

# from rest_framework import serializers
# from .models import (
#     Product, ProductItem, ProductConfiguration,
#     ProductImage, Category, VariationOption
# )

# class ProductImageSerializer(serializers.ModelSerializer):
#     image_url = serializers.ReadOnlyField()

#     class Meta:
#         model = ProductImage
#         fields = ['id', 'image', 'alt_text', 'display_order', 'image_url']


# class ProductConfigurationSerializer(serializers.ModelSerializer):
#     variation_option = serializers.PrimaryKeyRelatedField(queryset=VariationOption.objects.all())

#     class Meta:
#         model = ProductConfiguration
#         fields = ['id', 'variation_option', 'display_order']


# class ProductItemSerializer(serializers.ModelSerializer):
#     images = ProductImageSerializer(many=True, read_only=True)

#     class Meta:
#         model = ProductItem
#         fields = [
#             'product', 'name', 'description', 'price', 'stock_quantity',
#             'sku', 'display_order', 'images'
#         ]


# class ProductSerializer(serializers.ModelSerializer):
#     category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
#     items = ProductItemSerializer(source='productitem_set', many=True, required=False)

#     class Meta:
#         model = Product
#         fields = [
#             'id', 'category', 'name', 'description', 'price', 'display_order',
#             'created_at', 'updated_at', 'deleted_at', 'status',
#             'tax_percentage', 'brand', 'brand_model',
#             'items'
#         ]

class ProductConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for product configurations"""
    variation_option_detail = VariationOptionSerializer(source='variation_option', read_only=True)
    
    class Meta:
        model = ProductConfiguration
        fields = ['id', 'variation_option', 'variation_option_detail', 'display_order']


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'display_order']
    
    def get_image_url(self, obj):
        return obj.image_url()


class ProductItemSerializer(serializers.ModelSerializer):
    """Serializer for product items (variants)"""
    images = ProductImageSerializer(many=True, read_only=True)
    configurations = ProductConfigurationSerializer(
        source='productconfiguration_set', 
        many=True, 
        read_only=True
    )
    
    class Meta:
        model = ProductItem
        fields = [
            'id', 'name', 'price', 'description', 'stock_quantity', 
            'sku', 'display_order', 'status', 'images', 'configurations',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'category_name',
            'status', 'brand', 'brand_model', 'display_order', 'items_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.productitem_set.filter(deleted_at__isnull=True).count()


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for product retrieval"""
    category_detail = CategorySerializer(source='category', read_only=True)
    items = ProductItemSerializer(source='productitem_set', many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'category_detail',
            'status', 'brand', 'brand_model', 'tax_percentage', 'display_order',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new products"""
    items = ProductItemSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'category', 'status',
            'brand', 'brand_model', 'tax_percentage', 'display_order', 'items'
        ]
    
    def validate_category(self, value):
        """Ensure category exists and is not deleted"""
        if value.deleted_at is not None:
            raise serializers.ValidationError("Cannot assign product to deleted category")
        return value
    
    def validate_price(self, value):
        """Ensure price is positive"""
        if value < 0:
            raise serializers.ValidationError("Price must be positive")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        product = Product.objects.create(**validated_data)
        
        # Create product items if provided
        for item_data in items_data:
            ProductItem.objects.create(product=product, **item_data)
        
        return product


class ProductUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating existing products"""
    items = ProductItemSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'category', 'status',
            'brand', 'brand_model', 'tax_percentage', 'display_order', 'items'
        ]
    
    def validate_category(self, value):
        """Ensure category exists and is not deleted"""
        if value.deleted_at is not None:
            raise serializers.ValidationError("Cannot assign product to deleted category")
        return value
    
    def validate_price(self, value):
        """Ensure price is positive"""
        if value < 0:
            raise serializers.ValidationError("Price must be positive")
        return value
    
    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle items update if provided
        if items_data is not None:
            # Get existing items
            existing_items = {item.id: item for item in instance.productitem_set.all()}
            updated_item_ids = []
            
            for item_data in items_data:
                item_id = item_data.get('id')
                if item_id and item_id in existing_items:
                    # Update existing item
                    item = existing_items[item_id]
                    for attr, value in item_data.items():
                        if attr != 'id':
                            setattr(item, attr, value)
                    item.save()
                    updated_item_ids.append(item_id)
                else:
                    # Create new item
                    new_item = ProductItem.objects.create(product=instance, **item_data)
                    updated_item_ids.append(new_item.id)
            
            # Mark items not in update as deleted (soft delete)
            for item_id, item in existing_items.items():
                if item_id not in updated_item_ids:
                    item.deleted_at = timezone.now()
                    item.save()
        
        return instance


class ProductDeleteSerializer(serializers.Serializer):
    """Serializer for product deletion (soft delete)"""
    confirm_deletion = serializers.BooleanField(required=True)
    delete_reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_confirm_deletion(self, value):
        """Ensure deletion is confirmed"""
        if not value:
            raise serializers.ValidationError("Must confirm deletion by setting to true")
        return value
    
    def save(self, product):
        """Perform soft delete on the product"""
        with transaction.atomic():
            # Soft delete the product
            product.deleted_at = timezone.now()
            product.status = 'DISCONTINUED'
            product.save()
            
            # Soft delete all associated product items
            product.productitem_set.filter(deleted_at__isnull=True).update(
                deleted_at=timezone.now(),
                status='INACTIVE'
            )
        
        return product


class ProductItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating product items separately"""
    configurations = ProductConfigurationSerializer(many=True, required=False)
    
    class Meta:
        model = ProductItem
        fields = [
            'product', 'name', 'price', 'description', 'stock_quantity',
            'sku', 'display_order', 'status', 'configurations'
        ]
    
    def validate_product(self, value):
        """Ensure product exists and is not deleted"""
        if value.deleted_at is not None:
            raise serializers.ValidationError("Cannot add items to deleted product")
        return value
    
    def validate_sku(self, value):
        """Ensure SKU is unique if provided"""
        if value and ProductItem.objects.filter(sku=value).exists():
            raise serializers.ValidationError("SKU must be unique")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        configurations_data = validated_data.pop('configurations', [])
        product_item = ProductItem.objects.create(**validated_data)
        
        # Create configurations if provided
        for config_data in configurations_data:
            ProductConfiguration.objects.create(
                product_item=product_item,
                **config_data
            )
        
        return product_item


class ProductItemUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating product items"""
    configurations = ProductConfigurationSerializer(many=True, required=False)
    
    class Meta:
        model = ProductItem
        fields = [
            'name', 'price', 'description', 'stock_quantity',
            'sku', 'display_order', 'status', 'configurations'
        ]
    
    def validate_sku(self, value):
        """Ensure SKU is unique if provided"""
        if value:
            existing = ProductItem.objects.filter(sku=value).exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError("SKU must be unique")
        return value
    
    @transaction.atomic
    def update(self, instance, validated_data):
        configurations_data = validated_data.pop('configurations', None)
        
        # Update product item fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle configurations update if provided
        if configurations_data is not None:
            # Delete existing configurations
            instance.productconfiguration_set.all().delete()
            
            # Create new configurations
            for config_data in configurations_data:
                ProductConfiguration.objects.create(
                    product_item=instance,
                    **config_data
                )
        
        return instance


class ProductBulkStatusUpdateSerializer(serializers.Serializer):
    """Serializer for bulk status updates"""
    product_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    status = serializers.ChoiceField(choices=Product.STATUS_CHOICES)
    
    def validate_product_ids(self, value):
        """Ensure all products exist"""
        existing_ids = set(Product.objects.filter(
            id__in=value,
            deleted_at__isnull=True
        ).values_list('id', flat=True))
        
        missing_ids = set(value) - existing_ids
        if missing_ids:
            raise serializers.ValidationError(
                f"Products with IDs {missing_ids} do not exist or are deleted"
            )
        return value
    
    def save(self):
        """Perform bulk status update"""
        Product.objects.filter(
            id__in=self.validated_data['product_ids']
        ).update(
            status=self.validated_data['status'],
            updated_at=timezone.now()
        )
        
        return self.validated_data['product_ids']