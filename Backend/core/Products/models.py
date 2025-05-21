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


class Products(models.Model):
    weight=models.FloatField()
    dimensions=models.CharField(default='0x0x0',max_length=255)
    uom=models.CharField(max_length=255)
    color=models.CharField(max_length=255)
    tax_percentage=models.FloatField()
    brand=models.CharField(max_length=255)
    brand_model=models.CharField(max_length=255)


class Product(models.Model):
    id=models.AutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    specifications=models.JSONField()
    highlights=models.JSONField()
    initial_buying_price=models.FloatField()
    initial_selling_price=models.FloatField()
    created_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(blank=True, null=True)
    updated_at=models.DateTimeField(auto_now=True)
    status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')


    
    def __str__(self):
        return self.name

class ProductQuestions(models.Model):
    id=models.AutoField(primary_key=True)
    question=models.TextField()
    answer=models.TextField()
    status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')
    product_id=models.ForeignKey(Products,on_delete=models.CASCADE,blank=True,null=True,related_name='product_id_questions')
    domain_user_id=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='domain_user_id_questions')
    question_user_id=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='questions_by_user_id_questions')
    answer_user_id=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='answer_by_user_id_questions')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

class ProductReviews(models.Model):
    id=models.AutoField(primary_key=True)
    review_images=models.JSONField()
    rating=models.FloatField()
    reviews=models.TextField()
    status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')
    product_id=models.ForeignKey(Products,on_delete=models.CASCADE,blank=True,null=True,related_name='product_id_reviews')
    domain_user_id=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='domain_user_id_reviews')
    review_user_id=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='added_by_user_id_reviews')
    created_at=models.DateTimeField(auto_now_add=True)

