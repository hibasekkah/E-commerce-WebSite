from django.db import models

# Create your models here.

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class ShippingMethod(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.name} (${self.price})"

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
        ('FAILED', 'Failed'),
        ('ON_HOLD', 'On Hold'),
    ]

    # Primary key
    id = models.AutoField(primary_key=True)

    # Foreign keys
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    payment_method = models.ForeignKey(
        'UserPaymentMethod',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    shipping_address = models.ForeignKey(
        'Address',
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders'
    )
    shipping_method = models.ForeignKey(
        'ShippingMethod',
        on_delete=models.SET_NULL,
        null=True
    )

    # Status field with choices
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        db_index=True
    )

    # Date fields
    order_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Financial fields
    order_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # Tracking information
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    tracking_url = models.URLField(blank=True, null=True)

    # Additional information
    notes = models.TextField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-order_date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['order_date', 'status']),
        ]

    def __str__(self):
        return f"Order #{self.id} - {self.user.email} ({self.get_status_display()})"

    def update_total(self):
        """Recalculates order total from order lines"""
        subtotal = sum(line.line_total for line in self.order_lines.all())
        self.order_total = subtotal + self.shipping_cost + self.tax_amount
        self.save()

    @property
    def subtotal(self):
        """Sum of all order lines before shipping and tax"""
        return sum(line.line_total for line in self.order_lines.all())

    @property
    def item_count(self):
        """Total number of items in the order"""
        return sum(line.quantity for line in self.order_lines.all())

class OrderLine(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_lines')
    product_item = models.ForeignKey('ProductItem', on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} x {self.product_item} in Order #{self.order.id}"
    
    @property
    def line_total(self):
        return self.quantity * self.price
