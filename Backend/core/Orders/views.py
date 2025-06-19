from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import ShippingMethod
from .serializers import ShippingMethodSerializer


class ShippingMethodListView(generics.ListCreateAPIView):
    """
    A public API endpoint that lists all available shipping methods.
    This endpoint does not require authentication.
    """
    queryset = ShippingMethod.objects.all().order_by('price') # Order from cheapest to most expensive
    serializer_class = ShippingMethodSerializer


from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from .models import Order
from .serializers import (
    OrderSerializer,          # Your detailed READ serializer
    OrderListSerializer,      # Your lightweight LIST serializer
    OrderCreateSerializer     # Your powerful WRITE serializer
)

class OrderListCreateAPIView(generics.ListCreateAPIView):
    """
    Handles both listing a user's orders and creating a new one.
    - GET: Returns a list of all orders for the currently authenticated user.
    - POST: Creates a new order from the user's cart, with a 'PENDING' status.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should only return orders for the currently authenticated user.
        We also annotate the queryset to efficiently count items for the list view.
        """
        user = self.request.user
        return Order.objects.filter(user=user).annotate(
            item_count_annotated=Count('lines')
        )

    def get_serializer_class(self):
        """
        Use the appropriate serializer depending on the request method.
        """
        if self.request.method == 'POST':
            return OrderCreateSerializer
        # For GET requests
        return OrderListSerializer

    def create(self, request, *args, **kwargs):
        """
        Override the default create method to add context and return
        the detailed view of the newly created order.
        """
        # Pass the request context to the serializer so it can access the user
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # The .save() method on our OrderCreateSerializer will trigger all the logic
        # (checking stock, creating snapshots, clearing the cart, etc.)
        order = serializer.save()
        
        # On success, we don't want to return the simple creation data.
        # We want to return the full, detailed order object using our read serializer.
        read_serializer = OrderSerializer(order)
        headers = self.get_success_headers(read_serializer.data)
        
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class OrderRetrieveAPIView(generics.RetrieveAPIView):
    """
    API endpoint for a user to view the full details of a single, specific order.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer # Use the detailed serializer

    def get_queryset(self):
        """
        Ensure users can only retrieve their own orders.
        """
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'lines__product_item__product', 'payment__transactions'
        )
    

from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from .models import Order
from .serializers import OrderSerializer, AdminOrderUpdateSerializer

# ... your other existing views ...

class AdminOrderDetailAPIView(generics.RetrieveUpdateAPIView):
    """
    An API endpoint for an administrator to view the full details of any
    order and to update its fulfillment status.
    """
    permission_classes = [IsAdminUser] # <-- CRITICAL: Only admins can access this
    queryset = Order.objects.all().select_related('user', 'payment')
    
    def get_serializer_class(self):
        """
        Smartly chooses the serializer based on the request method.
        """
        # For GET requests, use the detailed, read-only serializer.
        if self.request.method == 'GET':
            return OrderSerializer
        
        # For PUT or PATCH requests, use our new, specific update serializer.
        return AdminOrderUpdateSerializer