# Products/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryCreateView, CategorylistView,
    VariationViewSet, VariationOptionViewSet,
    ProductViewSet,  ProductItemViewSet, ProductImageViewSet
)

router = DefaultRouter()
router.register(r'variations', VariationViewSet, basename='variation')
router.register(r'variation-options', VariationOptionViewSet, basename='variation-option')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'product-items', ProductItemViewSet, basename='product-item')
router.register(r'product-images', ProductImageViewSet, basename='product-image')

urlpatterns = [
    path('categories/create/', CategoryCreateView.as_view(), name='create-category'),
    path('categories/list/', CategorylistView.as_view(), name='list-category'),
    path('', include(router.urls)),
]
