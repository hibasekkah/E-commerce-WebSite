# Products/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryCreateView, CategorylistView, ProductBulkStatusView, ProductDetailView, ProductImageBulkView, ProductImageView, ProductItemCreateView, ProductItemDetailView, ProductListView,
    VariationViewSet, VariationOptionViewSet
)

router = DefaultRouter()
router.register(r'variations', VariationViewSet, basename='variation')
router.register(r'variation-options', VariationOptionViewSet, basename='variation-option')


urlpatterns = [
    path('categories/create/', CategoryCreateView.as_view(), name='create-category'),
    path('categories/list/', CategorylistView.as_view(), name='list-category'),
    path('', include(router.urls)),

    # Product URLs
    path('products/', ProductListView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/bulk-status/', ProductBulkStatusView.as_view(), name='product-bulk-status'),
    
    # Product Item URLs
    path('product-items/', ProductItemCreateView.as_view(), name='product-item-create'),
    # This NEW URL is for GET, PUT, PATCH, DELETE on a SINGLE item
    path('product-items/<int:pk>/', ProductItemDetailView.as_view(), name='product-item-detail'),
    
    # Product Image URLs
    path('product-items/<int:item_id>/images/', ProductImageView.as_view(), name='product-images'),
    path('product-items/<int:item_id>/images/<int:image_id>/', ProductImageView.as_view(), name='product-image-detail'),
    path('product-images/bulk/', ProductImageBulkView.as_view(), name='product-images-bulk'),
]