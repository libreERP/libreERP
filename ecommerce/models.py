from __future__ import unicode_literals
from time import time
from django.db import models
from django.contrib.auth.models import User

# Create your models here.

def getEcommercePictureUploadPath(instance , filename ):
    return 'ecommerce/pictureUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

class address(models.Model):
    street = models.CharField(max_length=300 , null = False)
    city = models.CharField(max_length=100 , null = False)
    state = models.CharField(max_length=50 , null = False)
    pincode = models.PositiveIntegerField(null = False)
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
    about = models.TextField(max_length = 2000 , null = False) # image/svg link to the logo

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

class choiceLabel(models.Model): # something like mobileCompany or automobileManufacturer etc and under this there will be choices
    icon = models.CharField( null = True , max_length = 50)
    name = models.CharField( null = False , max_length = 50 , unique = True)
    created = models.DateTimeField(auto_now_add = True)

class choiceOption(models.Model): # choices under a given parent label
    parent = models.ForeignKey(choiceLabel , null = False , related_name='choices')
    icon = models.CharField( null = True , max_length = 50) # icon of the company
    name = models.CharField( null = False , max_length = 50 , unique = True)
    created = models.DateTimeField(auto_now_add = True)

FIELD_TYPE_CHOCIE = (
    ('char' , 'char'),
    ('boolean' , 'boolean'),
    ('float' , 'float'),
    ('date' , 'date'),
    ('choice' , 'choice'),
)

class field(models.Model): # this will be used to build the form to be used to post a listing
    fieldType = models.CharField(choices = FIELD_TYPE_CHOCIE , default = 'char' , max_length = 15)
    unit = models.CharField( null = True , max_length = 50)
    name = models.CharField( null = False , max_length = 50 , unique = True)
    created = models.DateTimeField(auto_now_add = True)
    helpText = models.CharField(max_length = 100 , blank = True)
    default = models.CharField(max_length = 100 , blank = True)

class genericType(models.Model): # such as bike , modile , electronics etc
    name = models.CharField( null = False , max_length = 50)
    icon = models.CharField( null = True , max_length = 50) # on the category selection pane this icon will be shown along with the name
    created = models.DateTimeField(auto_now_add = True)

class genericProduct(models.Model): # such as MI5, Nokia N8 etc
    fields = models.ManyToManyField(field , related_name = 'products' , blank = True)
    name = models.CharField( null = False , max_length = 50)
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
    user = models.ForeignKey(User , related_name = 'ecommerceListings' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length = 100 , null = True)
    description = models.TextField(max_length = 2000 , null = False) # image/svg link to the logo
    priceModel = models.CharField(choices = PRICE_MODEL_CHOICES , default = 'quantity' , max_length = 15)
    approved = models.BooleanField(default = False)
    category = models.CharField(choices = CATEGORY_CHOICES , default = 'service' , max_length = 15)
    specifications = models.TextField(max_length = 2000 , null = False) # JSON data with key from one of the spec and value as the value for this perticular item
    files = models.ManyToManyField(media , related_name='listings')
    parentType = models.ForeignKey(genericProduct , related_name='products' , null = True)

PAYMENT_TYPE_CHOICES = (
    ('onlineBanking' , 'onlineBanking'),
    ('COD' , 'COD'),
    ('eMoney' , 'eMoney'),
)

SAVED_TYPE_CHOICES = (
    ('cart' , 'cart'),
    ('wishlist' , 'wishlist'),
)

class saved(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceCart' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    item = models.ForeignKey(listing , related_name = 'inCarts' , null = False)
    category = models.CharField(choices = SAVED_TYPE_CHOICES , max_length = 15 , default = 'cart')

class customerProfile(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceProfile' , null = False)
    address = models.ForeignKey(address , null = False , related_name=None )
    sendUpdates = models.BooleanField(default = True)
    mobile = models.PositiveIntegerField( null = True)

class offering(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceOfferings' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    service = models.ForeignKey(service , related_name='offerings')
    item = models.ForeignKey(listing , related_name='providerOptions')
    cod = models.BooleanField(default = False)
    freeReturns = models.BooleanField(default = False)
    replacementPeriod = models.PositiveIntegerField(null = True)
    rate = models.PositiveIntegerField(null = True)
    shippingOptions = models.CharField(choices = SHIPPING_CHOICES , default = 'pickup' , max_length = 15)
    availability = models.CharField(choices = AVAILABILITY_CHOICES , default = 'local' , max_length = 15)
    shippingFee = models.PositiveIntegerField(null = True)
    inStock = models.PositiveIntegerField(null = True) # the number of items available with this provider

class order(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceOrders' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    offer = models.ForeignKey(offering , related_name = 'orders' , null = True)
    paymentType = models.CharField(choices = PAYMENT_TYPE_CHOICES , max_length = 15 , default = 'COD')
    paid = models.BooleanField(default = False)
    address = models.ForeignKey(address , null = True)
    mobile = models.PositiveIntegerField(null=True)
    shipping = models.CharField(max_length = 20 , null = True)
    coupon = models.CharField(max_length = 20 , null = True)
    quantity = models.PositiveIntegerField(null=False , default = 0) # if the price model is wright then this is in grams and when its time in minutes
