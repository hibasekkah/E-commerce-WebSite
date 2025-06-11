from rest_framework import serializers
from .models import ShippingMethod


class ShippingMethodSerializer(serializers.ModelSerializer):
    """
    Serializer for listing available shipping methods.
    """
    class Meta:
        model = ShippingMethod
        fields = ['id', 'name', 'price']

# Add these imports
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import ShippingMethod
from .serializers import ShippingMethodSerializer

# ... your other views (OrderListCreateAPIView, etc.)

class ShippingMethodListView(generics.ListAPIView):
    """
    A public API endpoint that lists all available shipping methods.
    This endpoint does not require authentication.
    """
    queryset = ShippingMethod.objects.all().order_by('price') # Order from cheapest to most expensive
    serializer_class = ShippingMethodSerializer




