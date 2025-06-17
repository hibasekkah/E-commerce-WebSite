from rest_framework import serializers
from .models import Payment, Transaction

class SimpleTransactionSerializer(serializers.ModelSerializer):
    """A lightweight serializer to show transaction events."""
    class Meta:
        model = Transaction
        fields = ['event_type', 'amount', 'created_at', 'message']


class PaymentSerializer(serializers.ModelSerializer):
    """
    A read-only serializer to display the details of a Payment,
    often nested within an Order.
    """
    