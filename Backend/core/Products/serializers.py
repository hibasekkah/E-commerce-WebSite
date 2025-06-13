from rest_framework import serializers
from .models import Product, ProductImage, Category, CategoryImage, ProductItem, Variation, VariationOption,ProductConfiguration
from Users.serializers import UserSerializer
from django.utils import timezone
from django.db import transaction

#############category

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

################## image product
class ProductImageCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating product images"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'display_order']
        read_only_fields = ['id', 'image_url']
    
    def get_image_url(self, obj):
        return obj.image_url()



from rest_framework import serializers
from django.db import transaction
from .models import (
    Product, ProductItem, ProductImage, 
    ProductConfiguration, VariationOption
)

# ==============================================================================
#  A. READ-ONLY SERIALIZERS (For formatting the JSON response)
# ==============================================================================

class ProductImageSerializer(serializers.ModelSerializer):
    """Formats ProductImage details for API responses."""
    image_url = serializers.CharField(source='image.url', read_only=True)

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_primary', 'display_order']


class ProductConfigurationSerializer(serializers.ModelSerializer):
    """Formats ProductConfiguration details for API responses."""
    variation_name = serializers.CharField(source='variation_option.variation.name', read_only=True)
    value = serializers.CharField(source='variation_option.value', read_only=True)

    class Meta:
        model = ProductConfiguration
        fields = ['id', 'variation_name', 'value']


class ProductItemSerializer(serializers.ModelSerializer):
    """
    The main READ-ONLY serializer used to display a ProductItem in a GET request
    or after a successful creation/update.
    """
    images = ProductImageSerializer(many=True, read_only=True)
    variations = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductItem
        fields = [
            'id', 'price', 'stock_quantity', 
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


# ==============================================================================
class ProductConfigurationWriteSerializer(serializers.Serializer):
    """
    This is a helper for validating the user-friendly format:
    {"variation_name": "Color", "value": "Blue"}
    It does not map directly to a model.
    """
    variation_name = serializers.CharField(max_length=100)
    value = serializers.CharField(max_length=100)
# ==============================================================================
import json

class ProductItemWriteSerializer(serializers.ModelSerializer):
    """
    A single, powerful serializer for CREATING and UPDATING ProductItems
    with their configurations and images in a single multipart/form-data request.
    """
    # We expect 'configurations' to be a JSON string from the form data.
    configurations = serializers.CharField(required=False, write_only=True)
    
    # We expect 'images' to be a list of files from the form data.
    images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        required=False,
        write_only=True
    )

    class Meta:
        model = ProductItem
        fields = [
            'product', 'price', 'stock_quantity', 'sku',
            'display_order', 'status', 'configurations', 'images'
        ]
        extra_kwargs = {
            'product': {'required': False}, # Not required on update
        }

    def validate_configurations(self, value):
        """
        Validates the incoming JSON string for configurations.
        """
        try:
            # Parse the string back into a Python list of dictionaries.
            configurations_data = json.loads(value)
            if not isinstance(configurations_data, list):
                raise serializers.ValidationError("Configurations must be a JSON-encoded list.")
            # You can add more validation for the inner objects if needed.
            return configurations_data
        except json.JSONDecodeError:
            raise serializers.ValidationError("Invalid JSON format for configurations.")

    def _get_or_create_variation_option(self, product, config_data):
        """
        The core logic. Finds or creates the necessary Variation and VariationOption.
        (This helper method remains the same)
        """
        variation_name = config_data.get('variation_name', '').strip()
        value = config_data.get('value', '').strip()
        
        if not variation_name or not value:
            raise serializers.ValidationError("Variation name and value cannot be empty.")

        variation, _ = Variation.objects.get_or_create(
            category=product.category, name__iexact=variation_name,
            defaults={'name': variation_name}
        )
        variation_option, _ = VariationOption.objects.get_or_create(
            variation=variation, value__iexact=value,
            defaults={'value': value}
        )
        return variation_option

    @transaction.atomic
    def create(self, validated_data):
        """
        Handles creating the ProductItem and all its related data.
        """
        if 'product' not in validated_data:
            raise serializers.ValidationError({"product": "This field is required for creation."})
            
        product = validated_data['product']
        configurations_data = validated_data.pop('configurations', [])
        image_files = validated_data.pop('images', [])
        
        # Create the main ProductItem
        product_item = ProductItem.objects.create(**validated_data)

        # Create the configurations
        if configurations_data:
            configs_to_create = [
                ProductConfiguration(
                    product_item=product_item,
                    variation_option=self._get_or_create_variation_option(product, config_data)
                ) for config_data in configurations_data
            ]
            ProductConfiguration.objects.bulk_create(configs_to_create)

        # Create the images
        if image_files:
            for i, image_file in enumerate(image_files):
                ProductImage.objects.create(
                    product=product_item,
                    image=image_file,
                    is_primary=(i == 0),
                    display_order=i
                )
            
        return product_item



class ProductItemUpdateSerializer(serializers.ModelSerializer):
    """Enhanced serializer for updating product items with image support"""
    configurations = ProductConfigurationSerializer(many=True, required=False)
    images = ProductImageCreateUpdateSerializer(many=True, required=False)
    
    class Meta:
        model = ProductItem
        fields = [
            'price', 'stock_quantity',
            'display_order', 'status', 'configurations', 'images'
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
        images_data = validated_data.pop('images', None)
        
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
        
        # Handle images update if provided
        if images_data is not None:
            # Get existing images
            existing_images = {img.id: img for img in instance.images.all()}
            updated_image_ids = []
            
            for image_data in images_data:
                image_id = image_data.get('id')
                if image_id and image_id in existing_images:
                    # Update existing image
                    image = existing_images[image_id]
                    for attr, value in image_data.items():
                        if attr != 'id':
                            setattr(image, attr, value)
                    image.save()
                    updated_image_ids.append(image_id)
                else:
                    # Create new image
                    new_image = ProductImage.objects.create(
                        product=instance,
                        **image_data
                    )
                    updated_image_ids.append(new_image.id)
            
            # Delete images not in update
            for image_id, image in existing_images.items():
                if image_id not in updated_image_ids:
                    image.delete()
        
        return instance



class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'status', 'display_order', 'items_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.productitem_set.filter(deleted_at__isnull=True).count()


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for product retrieval with full image support"""
    items = ProductItemSerializer(source='productitem_set', many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category',
            'status', 'display_order',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    """Enhanced serializer for creating new products with items and images"""
    items = ProductItemSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category',
             'display_order', 'items'
        ]
    
    def validate_category(self, value):
        """Ensure category exists and is not deleted"""
        if value.deleted_at is not None:
            raise serializers.ValidationError("Cannot assign product to deleted category")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        product = Product.objects.create(**validated_data)
        
        # Create product items with their configurations and images
        for item_data in items_data:
            configurations_data = item_data.pop('configurations', [])
            images_data = item_data.pop('images', [])
            
            # Create product item
            product_item = ProductItem.objects.create(product=product, **item_data)
            
            # Create configurations
            for config_data in configurations_data:
                ProductConfiguration.objects.create(
                    product_item=product_item,
                    **config_data
                )
            
            # Create images
            for image_data in images_data:
                ProductImage.objects.create(
                    product=product_item,
                    **image_data
                )
        
        return product


# In serializers.py
from rest_framework import serializers
from django.db import transaction
from .models import Product, ProductItem, ProductConfiguration, VariationOption


# --- For Product ---
class ProductUpdateSerializer(serializers.ModelSerializer):
    """
    WRITE-ONLY serializer for UPDATING a Product. 
    This version only updates the Product's own fields.
    Item management is handled by the dedicated ProductItem endpoints.
    """
    class Meta:
        model = Product
        fields = ['name', 'description', 'category', 'status', 'display_order']


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
    """
    WRITE-ONLY serializer for CREATING a new ProductItem.
    Accepts a list of VariationOption IDs and image files.
    """
    # This field expects a list of integers for the 'configurations' key from your form-data.
    configurations = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    
    # This field expects a list of files for the 'images' key from your form-data.
    images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        required=False,
        write_only=True
    )

    class Meta:
        model = ProductItem
        # These are the fields the API will accept for creation.
        fields = [
            'product', 'price', 'stock_quantity', 'sku',
            'display_order', 'status', 'configurations', 'images'
        ]
        extra_kwargs = {
            'product': {'required': True},
            'price': {'required': True},
            'sku': {'required': False, 'allow_blank': True},
        }

    def validate_configurations(self, value):
        """Checks if all provided VariationOption IDs are valid."""
        if not value:
            return []
        
        existing_ids = VariationOption.objects.filter(id__in=value).values_list('id', flat=True)
        if len(existing_ids) != len(set(value)):
            missing = list(set(value) - set(existing_ids))
            raise serializers.ValidationError(f"Invalid VariationOption IDs: {missing}")
        return list(set(value))

    @transaction.atomic
    def create(self, validated_data):
        """
        This logic is called when `serializer.save()` is executed in the view.
        It creates the ProductItem and all its related objects in one transaction.
        """
        # Separate the related data before creating the main ProductItem.
        config_ids = validated_data.pop('configurations', [])
        image_files = validated_data.pop('images', [])
        
        # Create the main ProductItem object.
        product_item = ProductItem.objects.create(**validated_data)

        # Create the ProductConfiguration links in bulk for efficiency.
        if config_ids:
            ProductConfiguration.objects.bulk_create([
                ProductConfiguration(
                    product_item=product_item, 
                    variation_option_id=cid,
                    display_order=i
                )
                for i, cid in enumerate(config_ids)
            ])
            
        # Create the ProductImage objects.
        if image_files:
            for i, image_file in enumerate(image_files):
                ProductImage.objects.create(
                    product=product_item, # 'product' is the ForeignKey in the ProductImage model
                    image=image_file,
                    alt_text=f"Image for {product_item.product.name}",
                    is_primary=(i == 0), # The first uploaded image is the primary one
                    display_order=i
                )
            
        return product_item


class ProductItemUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating product items"""
    configurations = ProductConfigurationSerializer(many=True, required=False)
    
    class Meta:
        model = ProductItem
        fields = [
            'price', 'stock_quantity',
             'display_order', 'status', 'configurations'
        ]
    
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
    
class ProductImageBulkSerializer(serializers.Serializer):

    """Serializer for bulk image operations on product items"""
    product_item_id = serializers.IntegerField()
    images = ProductImageCreateUpdateSerializer(many=True)
    replace_all = serializers.BooleanField(default=False)
    
    def validate_product_item_id(self, value):
        """Ensure product item exists"""
        try:
            ProductItem.objects.get(id=value, deleted_at__isnull=True)
        except ProductItem.DoesNotExist:
            raise serializers.ValidationError("Product item not found or deleted")
        return value
    
    @transaction.atomic
    def save(self):
        """Save bulk images to product item"""
        product_item = ProductItem.objects.get(id=self.validated_data['product_item_id'])
        images_data = self.validated_data['images']
        replace_all = self.validated_data['replace_all']
        
        if replace_all:
            # Delete all existing images
            product_item.images.all().delete()
        
        # Create new images
        created_images = []
        for image_data in images_data:
            image = ProductImage.objects.create(
                product=product_item,
                **image_data
            )
            created_images.append(image)
        
        return created_images
    


from rest_framework import serializers
from .models import Promotion, PromotionProduct, ProductItem

class ProductItemForPromotionSerializer(serializers.ModelSerializer):
    """
    A lightweight serializer to represent a ProductItem within a promotion list.
    """
    class Meta:
        model = ProductItem
        fields = ['id', 'sku', 'price'] # Add any other fields you want to see here

class PromotionProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the 'through' model, showing the product details.
    """
    product = ProductItemForPromotionSerializer(read_only=True)

    class Meta:
        model = PromotionProduct
        fields = ['id', 'product', 'display_order']


class PromotionSerializer(serializers.ModelSerializer):
    """
    READ-ONLY serializer for listing and retrieving Promotions.
    Includes a nested list of all associated products.
    """
    # Uses the related_name 'products' we added to the model
    products = PromotionProductSerializer(many=True, read_only=True)

    class Meta:
        model = Promotion
        fields = [
            'id', 
            'name', 
            'description', 
            'discount_rate', 
            'start_date', 
            'end_date', 
            'is_active', 
            'display_order',
            'products', # Nested list of products in the promotion
            'created_at',
            'updated_at',
        ]


class PromotionCreateUpdateSerializer(serializers.ModelSerializer):
    """
    WRITE-ONLY serializer for creating and updating Promotions.
    Accepts a list of product item IDs to associate with the promotion.
    """
    # This field will accept a list of integers (ProductItem IDs)
    product_items = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="A list of ProductItem IDs to include in this promotion."
    )

    class Meta:
        model = Promotion
        fields = [
            'name', 
            'description', 
            'discount_rate', 
            'start_date', 
            'end_date', 
            'is_active', 
            'display_order',
            'product_items',
        ]

    def create(self, validated_data):
        """
        Handle creating a Promotion and its associated ProductItems.
        """
        product_item_ids = validated_data.pop('product_items', [])
        promotion = Promotion.objects.create(**validated_data)

        if product_item_ids:
            # Create the links in the through model
            promo_products = [
                PromotionProduct(promotion=promotion, product_id=pid)
                for pid in product_item_ids
            ]
            PromotionProduct.objects.bulk_create(promo_products)
        
        return promotion

    def update(self, instance, validated_data):
        """
        Handle updating a Promotion and its associated ProductItems.
        """
        product_item_ids = validated_data.pop('product_items', None)
        
        # Update the Promotion instance itself
        instance = super().update(instance, validated_data)

        # If a list of product_items was provided, update the relationship
        if product_item_ids is not None:
            # Easiest way to handle updates: delete old links and create new ones.
            instance.products.all().delete()
            
            promo_products = [
                PromotionProduct(promotion=instance, product_id=pid)
                for pid in product_item_ids
            ]
            PromotionProduct.objects.bulk_create(promo_products)

        return instance
    


class ProductItemReadOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductItem
        fields = ['id', 'sku', 'product'] # Add name from product if needed
        # Example to get product name:
        # name = serializers.CharField(source='product.name', read_only=True)


class ProductItemStockAdjustSerializer(serializers.Serializer):
    """
    A specialized serializer for ADJUSTING stock quantity.
    It does not map to a model field directly.
    """
    # We accept an integer, which can be positive (to add) or negative (to remove).
    adjustment = serializers.IntegerField()

    def validate_adjustment(self, value):
        """
        An adjustment of 0 does nothing, so we can disallow it.
        """
        if value == 0:
            raise serializers.ValidationError("Adjustment value cannot be zero.")
        return value

    def update(self, instance, validated_data):
        """
        Custom update logic to perform the incremental update.
        """
        adjustment = validated_data['adjustment']
        
        # Calculate the new stock level
        new_stock = instance.stock_quantity + adjustment

        # Business Logic: Prevent stock from going below zero
        if new_stock < 0:
            raise serializers.ValidationError({
                'adjustment': f"Adjustment of {adjustment} is invalid. Current stock is {instance.stock_quantity}, which would result in a negative quantity."
            })
            
        instance.stock_quantity = new_stock
        
        # Automatically update the status based on the new stock level
        if instance.stock_quantity > 0:
            instance.status = 'ACTIVE'
        else:
            instance.status = 'OUT_OF_STOCK'
            
        instance.save(update_fields=['stock_quantity', 'status', 'updated_at'])
        return instance