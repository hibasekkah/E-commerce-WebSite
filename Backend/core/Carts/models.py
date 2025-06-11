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
    def total_price(self):
        """Calculates the total price of all items in the cart."""
        return sum(item.line_total for item in self.items.all())

    @property
    def total_items(self):
        """Calculates the total number of items in the cart."""
        return sum(item.quantity for item in self.items.all())


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
    def line_total(self):
        """Calculates the total price for this specific cart item line."""
        # Ensure product_item exists and has a price to avoid errors
        if self.product_item and hasattr(self.product_item, 'price'):
            return self.quantity * self.product_item.price
        return 0
