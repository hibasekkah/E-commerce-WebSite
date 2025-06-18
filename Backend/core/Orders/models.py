from decimal import Decimal
from django.db import models, transaction
from django.conf import settings
from django.core.validators import MinValueValidator

# It's good practice to define choices as constants for reusability
class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'          # Order received, waiting for payment confirmation
    PROCESSING = 'PROCESSING', 'Processing'  # Payment confirmed, order is being prepared
    SHIPPED = 'SHIPPED', 'Shipped'          # Order has been dispatched
    DELIVERED = 'DELIVERED', 'Delivered'      # Order has been received by the customer
    CANCELLED = 'CANCELLED', 'Cancelled'      # Order was cancelled by user or admin
    REFUNDED = 'REFUNDED', 'Refunded'        # Order was returned and refunded
    FAILED = 'FAILED', 'Failed'            # Order failed due to payment or other issue

class ShippingMethod(models.Model):
    """
    Stores the available shipping options and their base prices.
    e.g., "Standard Ground", "Express Overnight"
    """
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.name} (${self.price})"


class Order(models.Model):
    """
    Represents the complete record of a customer's purchase. It acts as an
    immutable "snapshot" of all details at the time of purchase for historical accuracy.
    """
    # --- Core Relationships ---
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, 
        null=True,
        related_name='orders',
        help_text="The customer who placed the order."
    )
    payment = models.OneToOneField(
        'Payments.Payment',         
        on_delete=models.SET_NULL,  
        null=True, blank=True,
        related_name='order',
        help_text="The financial transaction associated with this order."
    )
    
    # --- Fulfillment & Shipping ---
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True,
        help_text="The current fulfillment status of the order."
    )
    # --- CRITICAL: Address is stored as a snapshot, not a foreign key ---
    shipping_address_snapshot = models.JSONField(
        null=True, blank=True,
        help_text="A JSON copy of the shipping address at the time of order creation."
    )
    # --- CRITICAL: Shipping details are stored as a snapshot ---
    shipping_method_name = models.CharField(max_length=100, blank=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tracking_number = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    # --- Financial Snapshot ---
    # These fields store a permanent record of the order's value.
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    order_total = models.DecimalField(max_digits=10, decimal_places=2, default=0, db_index=True)

    # --- Timestamps & Notes ---
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True, help_text="Internal notes for this order.")
    cancellation_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order #{self.id} for {self.user.email if self.user else 'Guest'}"

    @transaction.atomic
    def recalculate_totals(self):
        """
        Recalculates and saves order totals from its line items.
        Should be called whenever an order is created or its lines change.
        """
        calculated_subtotal = self.lines.aggregate(
            total=models.Sum(models.F('quantity') * models.F('price'))
        )['total'] or Decimal('0.00')

        self.subtotal = calculated_subtotal
        self.order_total = self.subtotal + self.shipping_cost + self.tax_amount - self.discount_amount
        
        self.save(update_fields=['subtotal', 'order_total'])
        return self


class OrderLine(models.Model):
    """
    Represents a single line item within an Order. This model "freezes" the
    product details and price at the time of purchase.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='lines' # Allows my_order.lines.all()
    )
    product_item = models.ForeignKey(
        'Products.ProductItem',     # Assumes a 'products' app
        on_delete=models.SET_NULL,  # Keep line item even if product is deleted
        null=True
    )
    
    # --- CRITICAL: Product details are stored as a snapshot ---
    product_sku = models.CharField(max_length=100, blank=True, db_index=True,null=True)
    product_name = models.CharField(max_length=255)
    
    # --- CRITICAL: Financial details are stored as a snapshot ---
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="Price of a single item at the time of purchase."
    )

    @property
    def line_total(self):
        """Calculates the total price for this line item."""
        return self.quantity * self.price

    def __str__(self):
        return f"{self.quantity} x {self.product_name or self.product_sku} in Order #{self.order.id}"

    class Meta:
        ordering = ['id'] # Order lines by creation order