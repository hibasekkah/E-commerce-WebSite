from rest_framework import serializers
from .models import Payment, Transaction

from rest_framework import serializers
from .models import Payment, Transaction # Import your payment models

class TransactionSerializer(serializers.ModelSerializer):
    """A simple serializer for transaction logs."""
    class Meta:
        model = Transaction
        fields = ['event_type', 'amount', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    """
    A read-only serializer for displaying Payment details.
    """
    # Use the TextChoices display name (e.g., "Stripe", "Completed")
    gateway_display = serializers.CharField(source='get_gateway_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Nest the transaction logs for a complete history
    transactions = TransactionSerializer(many=True, read_only=True)

    # --- THIS IS THE META CLASS THAT WAS MISSING ---
    class Meta:
        model = Payment
        fields = [
            'id',
            'amount',
            'currency',
            'gateway',
            'gateway_display',
            'status',
            'status_display',
            'external_payment_id',
            'created_at',
            'updated_at',
            'transactions' # The nested list of logs
        ]