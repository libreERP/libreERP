from __future__ import unicode_literals
from time import time
from django.db import models
from django.contrib.auth.models import User

# Create your models here.

def getEcommercePictureUploadPath(instance , filename ):
    return 'ecommerce/pictureUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

class address(models.Model):
    street = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zipcode = models.CharField(max_length=10)
    lat = models.CharField(max_length=15)
    lon = models.CharField(max_length=15)

class service(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 100 , null = False)
    user = models.ForeignKey(User , related_name = 'ecommerceServices' , null = False) # the responsible person for this service
    cin = models.CharField(max_length = 100 , null = False) # company identification number
    tin = models.CharField(max_length = 100 , null = False) # tax identification number
    address = models.ForeignKey(address , null = False )
    mobile = models.PositiveIntegerField( null = False)
    telephone = models.CharField(max_length = 20 , null = False)
    logo = models.CharField(max_length = 200 , null = False) # image/svg link to the logo
    description = models.TextField(max_length = 2000 , null = False) # image/svg link to the logo

MEDIA_TYPE_CHOICES = (
    ('onlineVideo' , 'onlineVideo'),
    ('video' , 'video'),
    ('image' , 'image'),
    ('onlineImage' , 'onlineImage'),
    ('doc' , 'doc'),
)

class media(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceMediaUploads' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getEcommercePictureUploadPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')

FIELD_TYPE_CHOCIE = (
    ('char' , 'char'),
    ('boolean' , 'boolean'),
    ('float' , 'float'),
    ('date' , 'date'),
    ('choice' , 'choice'),
)

class field(models.Model): # this will be used to build the form to be used to post a listing
    fieldType = models.CharField(choices = FIELD_TYPE_CHOCIE , default = 'char' , max_length = 15)
    unit = models.CharField( null = True , max_length = 15)
    name = models.CharField( null = False , max_length = 15 , unique = True)
    created = models.DateTimeField(auto_now_add = True)
    helpText = models.CharField(max_length = 100 , blank = True)
    default = models.CharField(max_length = 100 , blank = True)

class genericType(models.Model): # such as bike , modile , electronics etc
    name = models.CharField( null = False , max_length = 15)
    icon = models.CharField( null = True , max_length = 15) # on the category selection pane this icon will be shown along with the name
    created = models.DateTimeField(auto_now_add = True)

class genericProduct(models.Model): # such as MI5, Nokia N8 etc
    fields = models.ManyToManyField(field , related_name = 'products' , blank = True)
    name = models.CharField( null = False , max_length = 15)
    created = models.DateTimeField(auto_now_add = True)
    productType = models.ForeignKey(genericType , related_name='products' , null = False)



AVAILABILITY_CHOICES = (
    ('local' , 'local'),
    ('state' , 'state'),
    ('national' , 'national'),
    ('international' , 'international'),
)

PRICE_MODEL_CHOICES = (
    ('quantity' , 'quantity'),
    ('weight' , 'weight'),
    ('time' , 'time'),
    ('custom' , 'custom'),
)

SHIPPING_CHOICES = (
    ('pickup' , 'pickup'),
    ('homeDelivary' , 'homeDelivary'),
    ('postal' , 'postal'),
)

CATEGORY_CHOICES = (
    ('product' , 'product'),
    ('service' , 'service'),
)

class listing(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceListingsUploads' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    description = models.TextField(max_length = 2000 , null = False) # image/svg link to the logo
    cod = models.BooleanField(default = False)
    availability = models.CharField(choices = AVAILABILITY_CHOICES , default = 'local' , max_length = 15)
    priceModel = models.CharField(choices = PRICE_MODEL_CHOICES , default = 'quantity' , max_length = 15)
    freeReturns = models.BooleanField(default = False)
    shippingOptions = models.CharField(choices = SHIPPING_CHOICES , default = 'pickup' , max_length = 15)
    replacementPeriod = models.PositiveIntegerField(null = True)
    approved = models.BooleanField(default = False)
    category = models.CharField(choices = CATEGORY_CHOICES , default = 'service' , max_length = 15)
    specifications = models.TextField(max_length = 2000 , null = False) # JSON data with key from one of the spec and value as the value for this perticular item
    files = models.ManyToManyField(media , related_name='listings')
    parentType = models.ForeignKey(genericProduct , related_name='products' , null = True)
    rate = models.PositiveIntegerField(null = True)

PAYMENT_TYPE_CHOICES = (
    ('onlineBanking' , 'onlineBanking'),
    ('COD' , 'COD'),
    ('eMoney' , 'eMoney'),
)

class order(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceOrders' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    item = models.ForeignKey(listing , related_name = 'orders' , null = False)
    paymentType = models.CharField(choices = PAYMENT_TYPE_CHOICES , max_length = 15 , default = 'COD')
    paid = models.BooleanField(default = False)

SAVED_TYPE_CHOICES = (
    ('cart' , 'cart'),
    ('wishlist' , 'wishlist'),
)

class saved(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceCart' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    item = models.ForeignKey(listing , related_name = 'inCarts' , null = False)
    category = models.CharField(choices = SAVED_TYPE_CHOICES , max_length = 15 , default = 'cart')
