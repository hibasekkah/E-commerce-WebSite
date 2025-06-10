from django.db import models

# Create your models here.

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

class OrderStatus(models.Model):
    status = models.CharField(max_length=50)
    
    def __str__(self):
        return self.status

class ShippingMethod(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.name} (${self.price})"

class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.ForeignKey('UserPaymentMethod', on_delete=models.SET_NULL, null=True)
    shipping_address = models.ForeignKey('Address', on_delete=models.SET_NULL, null=True, related_name='shipping_orders')
    shipping_method = models.ForeignKey(ShippingMethod, on_delete=models.SET_NULL, null=True)
    order_total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.ForeignKey(OrderStatus, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-order_date']
    
    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"

class OrderLine(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_lines')
    product_item = models.ForeignKey('ProductItem', on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} x {self.product_item.name} in Order #{self.order.id}"
    
    @property
    def line_total(self):
        return self.quantity * self.price
