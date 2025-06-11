from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from Users.models import User
from django.utils import timezone
from django.conf import settings
import os


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, verbose_name="Category Name", db_index=True)
    description = models.TextField(blank=True, null=True)
    parent_category = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='subcategories',
        db_index=True
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Détermine l'ordre d'affichage dans les listes (les nombres inférieurs apparaissent en premier)"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    deleted_at = models.DateTimeField(blank=True, null=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['name', 'deleted_at']),
            models.Index(fields=['display_order', 'parent_category']),
        ]
    
    def __str__(self):
        return self.name


def category_image_upload_path(instance, filename):
    return f'categories/{instance.category.id}/{filename}'

class CategoryImage(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=category_image_upload_path)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage des images de la catégorie"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'created_at']

    def __str__(self):
        return f"Image for {self.category.name}"

    def image_url(self):
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None

class Variation(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=100, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True,blank=True, null=True)

    class Meta:
        unique_together = ('category', 'name')
        indexes = [
            models.Index(fields=['category', 'name']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class VariationOption(models.Model):
    variation = models.ForeignKey(Variation, on_delete=models.CASCADE, db_index=True)
    value = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True,blank=True, null=True)

    class Meta:
        unique_together = ('variation', 'value')
        indexes = [
            models.Index(fields=['variation', 'value']),
        ]

    def __str__(self):
        return f"{self.variation.name}: {self.value}"

class Product(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('DRAFT', 'Draft'),
        ('DISCONTINUED', 'Discontinued'),
    ]
    
    id = models.AutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField()

    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Ordre d'affichage des produits en vedette",
        blank=True, null=True,
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True,blank=True, null=True,)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        db_index=True
    )

    class Meta:
        ordering = ['display_order', '-created_at']
        indexes = [
            models.Index(fields=['status', 'deleted_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['created_at', 'status']),
            models.Index(fields=['category', 'display_order', 'status']),
        ]

    def __str__(self):
        return self.name

class ProductItem(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('OUT_OF_STOCK', 'Out of Stock'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_index=True)
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    stock_quantity = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True, db_index=True, blank=True, null=True,)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage des déclinaisons de produit"
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True,)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        db_index=True
    )

    class Meta:
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['product', 'status']),
            models.Index(fields=['sku']),
            models.Index(fields=['status', 'deleted_at']),
            models.Index(fields=['product', 'display_order']),
        ]


class ProductConfiguration(models.Model):
    product_item = models.ForeignKey(ProductItem, on_delete=models.CASCADE, db_index=True)
    variation_option = models.ForeignKey(VariationOption, on_delete=models.CASCADE, db_index=True)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage des configurations"
    )

    class Meta:
        unique_together = ('product_item', 'variation_option')
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['product_item', 'variation_option']),
        ]

    def __str__(self):
        return f"{self.product_item} - {self.variation_option}"
    
def product_image_upload_path(instance, filename):
    return f'products/{instance.product.id}/{filename}'

class ProductImage(models.Model):
    product = models.ForeignKey(ProductItem, on_delete=models.CASCADE, related_name='images', db_index=True)
    image = models.ImageField(upload_to=product_image_upload_path)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage dans les galeries"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'created_at']
        indexes = [
            models.Index(fields=['product', 'is_primary']),
            models.Index(fields=['product', 'display_order']),
        ]


    def image_url(self):
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None


class Promotion(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField()
    discount_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    start_date = models.DateTimeField(db_index=True)
    end_date = models.DateTimeField(db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Ordre d'affichage sur la page d'accueil"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True,blank=True, null=True,)

    class Meta:
        ordering = ['display_order', '-start_date']
        indexes = [
            models.Index(fields=['start_date', 'end_date', 'is_active']),
            models.Index(fields=['is_active', 'start_date']),
            models.Index(fields=['is_active', 'display_order']),
        ]

    def __str__(self):
        return self.name

class PromotionProduct(models.Model):
    product = models.ForeignKey(ProductItem, on_delete=models.CASCADE, db_index=True)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, db_index=True,related_name='products')
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage des produits en promotion"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'promotion')
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['product', 'promotion']),
            models.Index(fields=['promotion', 'created_at']),
        ]

class ProductQuestion(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('PENDING', 'Pending Answer'),
        ('ANSWERED', 'Answered'),
    ]
    
    id = models.AutoField(primary_key=True)
    question = models.TextField()
    answer = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        db_index=True
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='questions',
        db_index=True
    )
    question_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='asked_questions',
        db_index=True
    )
    answer_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='answered_questions',
        db_index=True
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage des questions"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'created_at']
        indexes = [
            models.Index(fields=['product', 'status']),
            models.Index(fields=['question_user', 'created_at']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"Question about {self.product.name if self.product else 'General'}"

class ProductReview(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('PENDING', 'Pending Approval'),
        ('REJECTED', 'Rejected'),
    ]
    
    id = models.AutoField(primary_key=True)
    rating = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review_text = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        db_index=True
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='reviews',
        db_index=True
    )
    review_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='product_reviews',
        db_index=True
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage des avis"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'review_user')
        ordering = ['display_order', '-created_at']
        indexes = [
            models.Index(fields=['product', 'status', 'rating']),
            models.Index(fields=['review_user', 'created_at']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['product', 'created_at']),
        ]

    def __str__(self):
        return f"Review for {self.product.name if self.product else 'Unknown'} by {self.review_user}"
    
    
def review_image_upload_path(instance, filename):
    return f'reviews/{instance.review.id}/{filename}'
class ProductReviewImage(models.Model):
    review = models.ForeignKey(ProductReview, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=review_image_upload_path)
    alt_text = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage des images dans l'avis"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'created_at']

    def __str__(self):
        return f"Image for review {self.review.id}"

    def image_url(self):
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None
    

