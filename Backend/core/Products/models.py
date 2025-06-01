from django.db import models

from Users.models import User
from django.utils import timezone


# Create your models here.
class Category(models.Model):
    id=models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, verbose_name="Category Name")
    description = models.TextField(blank=True, null=True)
    image=models.JSONField(blank=True,null=True)
    parent_category = models.ForeignKey('self', on_delete=models.SET_NULL, blank=True, null=True, related_name='subcategories')
    created_at=models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Variation(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.category.category_name})"

class VariationOption(models.Model):
    variation = models.ForeignKey(Variation, on_delete=models.CASCADE)
    value = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.variation.name}: {self.value}"

class Product(models.Model):
    id=models.AutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, blank=True)
    updated_at=models.DateTimeField(auto_now=True)
    status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')
    tax_percentage=models.FloatField()
    brand=models.CharField(max_length=255)
    brand_model=models.CharField(max_length=255)

    def __str__(self):
        return self.name

class ProductItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, blank=True)
    updated_at=models.DateTimeField(auto_now=True)
    status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')
    # etc: autres champs spécifiques à ProductItem

    def __str__(self):
        return f"{self.product.name} - {self.name}"

class ProductConfiguration(models.Model):
    product_item = models.ForeignKey(ProductItem, on_delete=models.CASCADE)
    variation_option = models.ForeignKey(VariationOption, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('product_item', 'variation_option')

    def __str__(self):
        return f"{self.product_item} - {self.variation_option}"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product_images/')

    def __str__(self):
        return f"Image for {self.product.name}"

class Promotion(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    def __str__(self):
        return self.name

class PromotionProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('product', 'promotion')

    def __str__(self):
        return f"{self.product.name} - {self.promotion.name}"

class ProductQuestion(models.Model):
    id=models.AutoField(primary_key=True)
    question=models.TextField()
    answer=models.TextField()
    status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')
    product_id=models.ForeignKey(Product,on_delete=models.CASCADE,blank=True,null=True,related_name='product_id_questions')
    question_user_id=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='questions_by_user_id_questions')
    answer_user_id=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='answer_by_user_id_questions')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

# class ProductReview(models.Model):
#     id=models.AutoField(primary_key=True)
#     review_images=models.JSONField()
#     rating=models.FloatField()
#     reviews=models.TextField()
#     status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')
#     product_id=models.ForeignKey(Product,on_delete=models.CASCADE,blank=True,null=True,related_name='product_id_reviews')
#     review_user_id=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='added_by_user_id_reviews')
#     created_at=models.DateTimeField(auto_now_add=True)
#     updated_at=models.DateTimeField(auto_now=True)

