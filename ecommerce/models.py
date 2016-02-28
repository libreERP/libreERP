from __future__ import unicode_literals
from time import time
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver

# Create your models here.

def getEcommercePictureUploadPath(instance , filename ):
    return 'ecommerce/pictureUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

def getEcommerceBannerUploadPath(instance , filename ):
    return 'ecommerce/bannerUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)


class address(models.Model):
    street = models.CharField(max_length=300 , null = True)
    city = models.CharField(max_length=100 , null = True)
    state = models.CharField(max_length=50 , null = True)
    pincode = models.PositiveIntegerField(null = True)
    lat = models.CharField(max_length=15 ,null = True)
    lon = models.CharField(max_length=15 ,null = True)

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
    source = models.TextField(max_length = 40000 , null = True)
    # ths may contain the html source for the description giving the admin a way to full featured webpage description

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
    quantity = models.PositiveIntegerField(null=False , default = 0) # if the price model is wright then this is in grams and when its time in minutes
    start = models.DateTimeField(null = True)
    end = models.DateTimeField(null = True)
    quantity = models.PositiveIntegerField(null=False , default = 0) # if the price model is wright then this is in grams and when its time in minutes

class customerProfile(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceProfile' , null = False)
    address = models.ForeignKey(address , null = False , related_name=None )
    sendUpdates = models.BooleanField(default = True)
    mobile = models.PositiveIntegerField( null = True)
    attachment = models.ForeignKey(media , related_name='files', null = True)

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
    active = models.BooleanField(default = True)
    class Meta:
        unique_together = ('service', 'item',)

ORDER_STATUS_CHOICES = (
    ('new' , 'new'),
    ('inProgress' , 'inProgress'),
    ('processing' , 'processing'),
    ('acceptedByVendor' , 'acceptedByVendor'),
    ('canceledByCustomer' , 'canceledByCustomer'),
    ('canceledByVendor' , 'canceledByVendor'),
    ('complete' , 'complete'),
)

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
    rate = models.CharField(max_length = 20 , null = True)
    quantity = models.PositiveIntegerField(null=False , default = 0) # if the price model is wright then this is in grams and when its time in minutes
    start = models.DateTimeField(null = True)
    end = models.DateTimeField(null = True)
    status = models.CharField(choices = ORDER_STATUS_CHOICES , null = True , max_length = 20 , default = 'new')

class offerBanner(models.Model):
    user = models.ForeignKey(User, null = False)
    created = models.DateTimeField(auto_now_add = True)
    level = models.PositiveIntegerField(null = False) # level indicates the position of display , 1 means the main banner , 2 for side and 3 for flash messages
    image = models.ImageField(null = False , upload_to = getEcommerceBannerUploadPath)
    title = models.CharField(max_length = 20 , null = True)
    subtitle = models.CharField(max_length = 20 , null = True)
    state = models.CharField(max_length = 20 , null = True)
    params = models.CharField(max_length = 200 , null = True) # string repr of json obj to be passed as params
    active = models.BooleanField(default = False)

class feedback(models.Model):
    email = models.EmailField(null = False)
    mobile = models.PositiveIntegerField(null = False)
    message = models.CharField(max_length = 400 , null = False)
    created = models.DateTimeField(auto_now_add = True)

class review(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.ForeignKey(User, null = False)
    rating = models.PositiveIntegerField(null = True)
    heading = models.CharField(max_length = 75 , null = True)
    text = models.TextField(max_length=1000 , null = True)
    verified = models.BooleanField(default = False)
    item = models.ForeignKey(listing , related_name= 'reviews' , null = False)

class reviewLike(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.ForeignKey(User, null = False)
    review = models.ForeignKey(review , null = False , related_name= 'likes')
    positive = models.BooleanField(default = True)


from .views import sendSMS, sendEmail

@receiver(post_save, sender=order, dispatch_uid="server_post_save")
def orderCreateUpdate(sender, instance, **kwargs):
    sendSMS(instance , 'customer')
    sendSMS(instance , 'vendor')
    sendEmail(instance , 'customer')
    sendEmail(instance , 'vendor')
