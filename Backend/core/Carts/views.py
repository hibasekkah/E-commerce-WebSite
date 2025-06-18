from django.shortcuts import render
from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveDestroyAPIView
from Products.models import ProductItem
from .models import ShoppingCart, CartItem
from .serializers import (
    ShoppingCartSerializer, 
    CartItemSerializer, 
    CartItemCreateSerializer, 
    CartItemUpdateSerializer
)

class CartView(RetrieveDestroyAPIView):
    """
    An API endpoint for the current user's shopping cart.
    - GET: Retrieve the full details of the user's cart.
    - DELETE: Clear all items from the user's cart.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ShoppingCartSerializer

    def get_object(self):
        """
        Gets or creates the user's cart and, most importantly, pre-fetches
        all related data needed by the model properties to calculate prices efficiently.
        """
        cart, created = ShoppingCart.objects.get_or_create(user=self.request.user)

        # THIS IS THE ESSENTIAL QUERY THAT MAKES THE MODEL PROPERTIES FAST.
        # It must be here.
        return ShoppingCart.objects.prefetch_related(
            # This follows the path: Cart -> CartItem -> ProductItem -> Product -> PromotionLink -> Promotion
            'items__product_item__product__promotions'
        ).get(user=self.request.user)

    def perform_destroy(self, instance):
        """Instead of deleting the cart itself, just clear its items."""
        instance.items.all().delete()


class CartItemViewSet(mixins.CreateModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    """
    A ViewSet for managing items within a user's cart.
    - POST: Add an item to the cart (or increase quantity if it exists).
    - PATCH: Update an item's quantity.
    - DELETE: Remove an item from the cart.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should only return items from the current user's cart.
        """
        user = self.request.user
        return CartItem.objects.filter(cart__user=user)

    def get_serializer_class(self):
        """
        Return the appropriate serializer for the action.
        """
        if self.action == 'create':
            return CartItemCreateSerializer
        if self.action in ['update', 'partial_update']:
            return CartItemUpdateSerializer
        return CartItemSerializer

    def create(self, request, *args, **kwargs):
        """
        Custom logic to add an item to the cart.
        If the item already exists, its quantity is increased.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product_item_id = serializer.validated_data['product_item_id']
        quantity = serializer.validated_data['quantity']
        
        # Check if the product exists
        try:
            ProductItem.objects.get(pk=product_item_id)
        except ProductItem.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = ShoppingCart.objects.get_or_create(user=request.user)
        
        # Check if item is already in the cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_item_id=product_item_id,
            defaults={'quantity': quantity}
        )

        if not created:
            # If item already exists, just update the quantity
            cart_item.quantity += quantity
            cart_item.save()

        # Return the updated cart item's data
        response_serializer = CartItemSerializer(cart_item)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
