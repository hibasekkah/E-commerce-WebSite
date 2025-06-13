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