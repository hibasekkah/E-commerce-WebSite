from django.utils import timezone
from decimal import Decimal
from django.db import models
from django.conf import settings


class ShoppingCart(models.Model):
    """
    Represents a user's shopping cart.
    There is a one-to-one relationship between a user and their cart.
    Corresponds to the `shoopping_cart` table in the ERD.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shopping_cart'  # Allows easy access via user.shopping_cart
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shopping Cart for {self.user.username}"

    @property
    def total_price_after_promotions(self):
        """
        Calculates the final total price of all items in the cart AFTER promotions.
        This is the final, customer-facing total.
        It relies on the view pre-fetching 'items' to be efficient.
        """
        if not self.pk: return Decimal('0.00')
        # This now correctly sums up the discounted totals from each item.
        return sum(item.line_total_after_promotion for item in self.items.all()) or Decimal('0.00')

    @property
    def subtotal_before_promotions(self):
        """Calculates the total price of all items WITHOUT promotions (the 'was' price)."""
        if not self.pk: return Decimal('0.00')
        return sum(item.line_total_before_promotion for item in self.items.all()) or Decimal('0.00')
    
    @property
    def total_discount(self):
        """Calculates the total amount saved across the entire cart."""
        return self.subtotal_before_promotions - self.total_price_after_promotions

    @property
    def total_items(self):
        """Calculates the total number of items in the cart."""
        if not self.pk: return 0
        return sum(item.quantity for item in self.items.all()) or 0
    
    # We keep the original 'total_price' property pointing to the new logic
    # to maintain backward compatibility with any serializers that might use it.
    @property
    def total_price(self):
        return self.total_price_after_promotions


class CartItem(models.Model):
    """
    Represents a single item (a product and its quantity) within a ShoppingCart.
    Corresponds to the `shoopping_item` table in the ERD.
    """
    cart = models.ForeignKey(
        ShoppingCart,
        on_delete=models.CASCADE,
        related_name='items'  # Allows easy access via cart.items.all()
    )
    product_item = models.ForeignKey(
        'Products.ProductItem', # Assuming ProductItem is in a 'products' app
        on_delete=models.CASCADE # If a product is deleted, remove it from all carts
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        # Ensures that a user cannot have the same product item twice in their cart.
        # To add more, the quantity of the existing item should be updated.
        unique_together = ('cart', 'product_item')
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity} x {self.product_item} in {self.cart}"
    
    @property
    def unit_price_after_promotion(self):
        """
        Calculates the price after applying the best active promotion.
        Returns the original price if no active promotion is found.
        """
        now = timezone.now()
        original_price = self.product_item.price
        
        # Access the parent product through the product_item instance
        parent_product = self.product_item.product
        
        # This assumes your Many-to-One Promotion model where a Promotion
        # has a ForeignKey to a Product. We use the 'promotions' related_name.
        # We filter for promotions that are active AND within their date range.
        active_promotions = parent_product.promotions.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        )
        
        if not active_promotions.exists():
            # If there are no active promotions, return the original price.
            # You could also return `None` if you prefer the frontend to handle it.
            return original_price
            
        # If there could be multiple active promotions, find the one with the best discount.
        # We use .aggregate() and Max() for an efficient database query.
        from django.db.models import Max
        best_discount_rate = active_promotions.aggregate(
            max_discount=Max('discount_rate')
        )['max_discount']

        if best_discount_rate is None:
            return original_price # Should not happen if exists() passed, but safe to have.

        # Calculate the final price
        discount_multiplier = 1 - (best_discount_rate / 100)
        discounted_price = original_price * discount_multiplier
        
        # Return the price formatted to two decimal places
        return round(discounted_price, 2)


    @property
    def line_total_after_promotion(self):
        """The final, discounted total for this line."""
        if self.product_item:
            return self.quantity * self.unit_price_after_promotion
        return Decimal('0.00')

    @property
    def line_total_before_promotion(self):
        """The original, non-discounted total for this line."""
        if self.product_item:
            return Decimal(self.quantity) * self.product_item.price
        return Decimal('0.00')
    
    # The original `line_total` property is now an alias for the new logic.
    # This ensures that any existing code that calls `item.line_total` will
    # automatically get the new, discounted price.
    @property
    def line_total(self):
        return self.line_total_after_promotion
