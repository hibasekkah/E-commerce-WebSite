from django.db import models

from django.db import models
from django.conf import settings

class Payment(models.Model):
    GATEWAY_CHOICES = (
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='MAD')  # e.g., 'USD', 'EUR'
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    external_payment_id = models.CharField(max_length=100, blank=True, null=True)  # e.g., Stripe charge ID
    external_customer_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} via {self.gateway}"


class Transaction(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='transactions')
    status = models.CharField(max_length=20)  # e.g., success, failure
    message = models.TextField(blank=True, null=True)  # error or log
    response_code = models.CharField(max_length=20, blank=True, null=True)
    transaction_date = models.DateTimeField(auto_now_add=True)
    external_transaction_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Transaction for {self.payment} - {self.status}"

