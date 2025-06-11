from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartView, CartItemViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'cart/items', CartItemViewSet, basename='cart-item')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('', include(router.urls)),
]