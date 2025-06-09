from django.contrib import admin

# Register your models here.

from .models import (
    Category, CategoryImage,
    Variation, VariationOption,
    Product, ProductItem,
    ProductConfiguration, ProductImage,
    # Add other models you want in the admin
    Promotion, PromotionProduct, ProductQuestion, ProductReview
)

# ==============================================================================
# 1. Category and Variation Management
# ==============================================================================

class CategoryImageInline(admin.TabularInline):
    """Allows adding/editing CategoryImages directly within the Category admin page."""
    model = CategoryImage
    extra = 1  # Number of empty forms to display
    fields = ('image', 'alt_text', 'is_primary', 'display_order')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent_category', 'display_order', 'created_at')
    list_filter = ('parent_category', 'created_at')
    search_fields = ('name', 'description')
    inlines = [CategoryImageInline]
    prepopulated_fields = {'name': ()} # Changed to avoid issues with non-ascii chars if needed

class VariationOptionInline(admin.TabularInline):
    """Allows adding/editing VariationOptions directly within the Variation admin page."""
    model = VariationOption
    extra = 2

@admin.register(Variation)
class VariationAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)
    inlines = [VariationOptionInline]


# ==============================================================================
# 2. Product and Product Item Management (The Core)
# ==============================================================================

# These three inlines are the key to a good ProductItem admin experience.
# They allow you to manage configurations and images from the ProductItem page.

class ProductConfigurationInline(admin.TabularInline):
    """Inline for managing ProductConfigurations on the ProductItem page."""
    model = ProductConfiguration
    extra = 1
    # Use autocomplete_fields for a better UX with many variation options
    autocomplete_fields = ['variation_option']

class ProductImageInline(admin.TabularInline):
    """Inline for managing ProductImages on the ProductItem page."""
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'display_order')


@admin.register(ProductItem)
class ProductItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'sku', 'price', 'stock_quantity', 'status')
    list_filter = ('status', 'product__category')
    search_fields = ('sku', 'product__name')
    list_editable = ('price', 'stock_quantity', 'status')
    # Use autocomplete_fields for the product ForeignKey
    autocomplete_fields = ['product']
    # Add the inlines here
    inlines = [ProductConfigurationInline, ProductImageInline]


# This inline allows creating ProductItems directly from the Product page.
class ProductItemInline(admin.StackedInline): # StackedInline is often better here
    """Inline for managing ProductItems on the Product page."""
    model = ProductItem
    extra = 0 # Don't show empty forms by default, admin can click "Add another"
    fields = ('sku', 'price', 'stock_quantity', 'status', 'display_order')
    show_change_link = True # Adds a link to edit the full ProductItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('name', 'description')
    inlines = [ProductItemInline]
    date_hierarchy = 'created_at'


# ==============================================================================
# 3. Registering Other Standalone Models
# ==============================================================================

# It's good practice to register all your models, even if they don't have
# special configurations. The autocomplete fields above require the
# related models to be registered.

@admin.register(VariationOption)
class VariationOptionAdmin(admin.ModelAdmin):
    """
    It's important to register VariationOption so that the
    autocomplete_fields in ProductConfigurationInline will work.
    """
    list_display = ('value', 'variation')
    search_fields = ('value', 'variation__name') # Enable searching

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'alt_text', 'is_primary')
    search_fields = ('product__sku', 'product__product__name')


# Registering other models with basic settings
admin.site.register(Promotion)
admin.site.register(PromotionProduct)
admin.site.register(ProductQuestion)
admin.site.register(ProductReview)