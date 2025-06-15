from django.db import models
from django.conf import settings

class Payment(models.Model):
    """
    Represents the overall financial intent for a transaction, such as an order payment.
    This is the "header" record for the payment.
    """
    # --- Improvement 1: Using TextChoices for better code clarity ---
    class Gateway(models.TextChoices):
        STRIPE = 'STRIPE', 'Stripe'
        PAYPAL = 'PAYPAL', 'PayPal'
        # Add other gateways here
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'
        PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED', 'Partially Refunded'

    # --- No changes needed for these core fields, they are excellent ---
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, # Keep payment record even if user is deleted
        null=True, 
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='MAD') # Use 3-letter ISO codes
    description = models.TextField(blank=True, null=True)

    # Use the TextChoices enum
    gateway = models.CharField(max_length=20, choices=Gateway.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    
    # --- These external ID fields are critical and perfectly designed ---
    external_payment_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    external_customer_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email if self.user else 'Guest'} - {self.amount} {self.currency} via {self.get_gateway_display()}"


class Transaction(models.Model):
    """
    Logs every individual event or attempt related to a Payment.
    This provides a detailed, auditable history.
    """
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='transactions')
    
    # --- Improvement 2: Storing the specific gateway event type ---
    event_type = models.CharField(
        max_length=100,
        help_text="The event type from the gateway (e.g., 'charge.succeeded', 'refund.created')."
    )
    
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="The amount associated with this specific transaction (e.g., for partial refunds)."
    )
    
    # --- Improvement 3: Storing the full raw response for debugging ---
    response_data = models.JSONField(
        null=True, blank=True,
        help_text="The full, raw response data from the payment gateway."
    )
    
    external_transaction_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True) # Renamed for clarity

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Transaction for Payment #{self.payment.id} - Event: {self.event_type}"