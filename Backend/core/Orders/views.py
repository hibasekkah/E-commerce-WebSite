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
from .models import Order
from .serializers import OrderCreateSerializer # Assuming you have a read serializer

class OrderCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.none()
    serializer_class = OrderCreateSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def create(self, request, *args, **kwargs):
        write_serializer = self.get_serializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        order = write_serializer.save()
        read_serializer = OrderSerializer(order, context=self.get_serializer_context())
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)