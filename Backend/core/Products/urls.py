# Products/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryCreateView, CategorylistView, ProductBulkStatusView, ProductDetailView, ProductItemView, ProductListView,
    VariationViewSet, VariationOptionViewSet
)

router = DefaultRouter()
router.register(r'variations', VariationViewSet, basename='variation')
router.register(r'variation-options', VariationOptionViewSet, basename='variation-option')


urlpatterns = [
    path('categories/create/', CategoryCreateView.as_view(), name='create-category'),
    path('categories/list/', CategorylistView.as_view(), name='list-category'),
    path('', include(router.urls)),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('product-items/', ProductItemView.as_view(), name='product-item-list'),
    path('product-items/<int:item_id>/', ProductItemView.as_view(), name='product-item-detail'),
    path('products/bulk-status/', ProductBulkStatusView.as_view(), name='product-bulk-status'),
]