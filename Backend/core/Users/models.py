from django.db import models

# Create your models here
from django.contrib.auth.models import AbstractUser
from django_countries.fields import CountryField

    
# Create your models here.
class User(AbstractUser):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username','dob', 'role', 'account_status','phone']
    phone=models.CharField(max_length=15,blank=True,null=True)
    gender = models.CharField(max_length=50,blank=True,null=True,choices=(('Femme','Femme'),('Homme','Homme')))
    account_status=models.CharField(max_length=50,blank=True,null=True,default='Active',choices=(('Active','Active'),('Inactive','Inactive'),('Blocked','Blocked')))
    role=models.CharField(max_length=50,blank=True,null=True,default='Admin',choices=(('Admin','Admin'),('Supplier','Supplier'),('Customer','Customer')))
    dob=models.DateField(blank=True,null=True)
    currency=models.CharField(max_length=50,blank=True,null=True,default='USD',choices=(('USD','USD'),('INR','INR'),('EUR','EUR'),('GBP','GBP'),('AUD','AUD'),('CAD','CAD'),('JPY','JPY'),('CNY','CNY'),('RUB','RUB'),('BRL','BRL'),('ZAR','ZAR'),('NGN','NGN'),('MXN','MXN'),('ARS','ARS'),('CHF','CHF'),('SEK','SEK'),('NOK','NOK'),('DKK','DKK'),('PLN','PLN'),('CZK','CZK'),('TRY','TRY'),('UAH','UAH'),('HUF','HUF'),('RON','RON'),('BGN','BGN'),('HRK','HRK'),('SLO','SLO'),('SK','SK'),('LT','LT'),('LV','LV'),('EE','EE'),('IE','IE'),('SC','SC'),('WL','WL'),('NI','NI'),('NZ','NZ'),('SGD','SGD'),('MYR','MYR'),('THB','THB'),('IDR','IDR'),('PHP','PHP'),('VND','VND'),('KRW','KRW'),('KPW','KPW'),('TWD','TWD'),('HKD','HKD'),('MOP','MOP'),('BDT','BDT'),('PKR','PKR'),('LKR','LKR'),('NPR','NPR'),('BTN','BTN'),('MVR','MVR'),('AFN','AFN'),('IRR','IRR'),('IQD','IQD'),('SYP','SYP'),('LBN','LBN')))
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def defaultkey():
        return 'username'
  

class UserShippingAddress(models.Model):
    id=models.AutoField(primary_key=True)
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='user_shipping_address')
    address=models.TextField()
    city=models.CharField(max_length=50)
    state=models.CharField(max_length=50)
    postal_code=models.CharField(max_length=10)
    country = CountryField(blank=True, null=True, default='MA')    
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

class Module(models.Model):
    id=models.AutoField(primary_key=True)
    module_name=models.CharField(max_length=50,unique=True)
    module_icon=models.CharField(null=True,blank=True,max_length=50)
    is_menu=models.BooleanField(default=True)
    is_active=models.BooleanField(default=True)
    module_url=models.CharField(null=True,blank=True,max_length=50)
    parent_id=models.ForeignKey('self',on_delete=models.CASCADE,blank=True,null=True)
    display_order=models.IntegerField(default=0)
    module_description=models.CharField(null=True,blank=True,max_length=255)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)


class UserPermission(models.Model):
    id=models.AutoField(primary_key=True)
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='user_permissions_1')
    module=models.ForeignKey(Module,on_delete=models.CASCADE)
    is_permission=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

class ModuleUrl(models.Model):
    id=models.AutoField(primary_key=True)
    module=models.ForeignKey(Module,on_delete=models.CASCADE,blank=True,null=True)
    url=models.CharField(max_length=255)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

