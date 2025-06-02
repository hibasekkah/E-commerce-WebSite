from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from Users.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
import base64
import mimetypes

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

class CategoryImage(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='images')
    image_data = models.BinaryField()
    image_name = models.CharField(max_length=255)
    image_type = models.CharField(max_length=50)
    image_size = models.PositiveIntegerField()
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
    
    def save_image_from_file(self, image_file):
        if hasattr(image_file, 'read'):
            self.image_data = image_file.read()
            self.image_name = getattr(image_file, 'name', 'unknown')
            self.image_size = len(self.image_data)
            self.image_type = getattr(image_file, 'content_type', None) or mimetypes.guess_type(self.image_name)[0] or 'image/jpeg'
        else:
            with open(image_file, 'rb') as f:
                self.image_data = f.read()
                self.image_name = image_file.split('/')[-1]
                self.image_size = len(self.image_data)
                self.image_type = mimetypes.guess_type(image_file)[0] or 'image/jpeg'
    
    def get_image_url(self):
        if self.image_data:
            encoded_image = base64.b64encode(self.image_data).decode('utf-8')
            return f"data:{self.image_type};base64,{encoded_image}"
        return None

class Variation(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=100, db_index=True)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'apparition des variations dans la configuration du produit"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('category', 'name')
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['category', 'name']),
            models.Index(fields=['category', 'display_order']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class VariationOption(models.Model):
    variation = models.ForeignKey(Variation, on_delete=models.CASCADE, db_index=True)
    value = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'apparition des options dans les sélecteurs"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('variation', 'value')
        ordering = ['display_order', 'value']
        indexes = [
            models.Index(fields=['variation', 'value']),
            models.Index(fields=['variation', 'display_order']),
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
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Ordre d'affichage des produits en vedette"
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        db_index=True
    )
    tax_percentage = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    brand = models.CharField(max_length=255, db_index=True)
    brand_model = models.CharField(max_length=255)

    class Meta:
        ordering = ['display_order', '-created_at']
        indexes = [
            models.Index(fields=['status', 'deleted_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['brand', 'status']),
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
    name = models.CharField(max_length=200)
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    description = models.TextField()
    stock_quantity = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordre d'affichage des déclinaisons de produit"
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        db_index=True
    )

    class Meta:
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['product', 'status']),
            models.Index(fields=['sku']),
            models.Index(fields=['status', 'deleted_at']),
            models.Index(fields=['product', 'display_order']),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.name}"

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

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', db_index=True)
    image_data = models.BinaryField()
    image_name = models.CharField(max_length=255)
    image_type = models.CharField(max_length=50)
    image_size = models.PositiveIntegerField()
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

    def __str__(self):
        return f"Image for {self.product.name}"

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
    updated_at = models.DateTimeField(auto_now=True)

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
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_index=True)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, db_index=True)
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

    def __str__(self):
        return f"{self.product.name} - {self.promotion.name}"

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

class ProductReviewImage(models.Model):
    review = models.ForeignKey(ProductReview, on_delete=models.CASCADE, related_name='images')
    image_data = models.BinaryField()
    image_name = models.CharField(max_length=255)
    image_type = models.CharField(max_length=50)
    image_size = models.PositiveIntegerField()
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