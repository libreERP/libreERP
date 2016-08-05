from django.db import models
from django.contrib.auth.models import User, Group
from time import time
from django.utils import timezone
import datetime
from allauth.socialaccount.signals import social_account_added
from allauth.account.signals import user_signed_up
from django.dispatch import receiver

def getSignaturesPath(instance , filename):
    return 'HR/images/Sign/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getDisplayPicturePath(instance , filename):
    return 'HR/images/DP/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getIDPhotoPath(instance , filename ):
    return 'HR/images/ID/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getTNCandBondPath(instance , filename ):
    return 'HR/doc/TNCBond/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getResumePath(instance , filename ):
    return 'HR/doc/Resume/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getCertificatesPath(instance , filename ):
    return 'HR/doc/Cert/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getTranscriptsPath(instance , filename ):
    return 'HR/doc/Transcripts/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getOtherDocsPath(instance , filename ):
    return 'HR/doc/Others/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

class accountsKey(models.Model):
    user = models.ForeignKey(User , related_name='accountKey')
    activation_key = models.CharField(max_length=40, blank=True)
    key_expires = models.DateTimeField(default=timezone.now)

class profile(models.Model):
    user = models.OneToOneField(User)
    PREFIX_CHOICES = (
        ('NA' , 'NA'),
        ('Mr' , 'Mr'),
        ('Mrs' , 'Mrs'),
        ('Smt' , 'Smt'),
        ('Shri' ,'Shri'),
    )
    GENDER_CHOICES = (
        ('M' , 'Male'),
        ('F' , 'Female'),
        ('O' , 'Other'),
    )

    empID = models.PositiveIntegerField(unique = True , null = True)
    displayPicture = models.ImageField(upload_to = getDisplayPicturePath)
    dateOfBirth = models.DateField( null= True )
    anivarsary = models.DateField( null= True )
    permanentAddressStreet = models.TextField(max_length = 100 , null= True , blank=True)
    permanentAddressCity = models.CharField(max_length = 15 , null= True , blank=True)
    permanentAddressPin = models.IntegerField(null= True ,  blank=True)
    permanentAddressState = models.CharField(max_length = 20 , null= True , blank=True)
    permanentAddressCountry = models.CharField(max_length = 20 , null= True , blank=True)

    localAddressStreet = models.TextField(max_length = 100 , null= True )
    localAddressCity = models.CharField(max_length = 15 , null= True )
    localAddressPin = models.IntegerField(null= True )
    localAddressState = models.CharField(max_length = 20 , null= True )
    localAddressCountry = models.CharField(max_length = 20 , null= True )

    prefix = models.CharField(choices = PREFIX_CHOICES , default = 'NA' , max_length = 4)
    gender = models.CharField(choices = GENDER_CHOICES , default = 'M' , max_length = 6)

    email = models.EmailField(max_length = 50)
    email2 = models.EmailField(max_length = 50, blank = True)

    mobile = models.CharField(null = True , max_length = 14)
    emergency = models.PositiveIntegerField(null = True)
    tele = models.PositiveIntegerField(null = True , blank = True)
    website = models.URLField(max_length = 100 , null = True , blank = True)

    sign = models.ImageField(upload_to = getSignaturesPath ,  null = True)
    IDPhoto = models.ImageField(upload_to = getDisplayPicturePath ,  null = True)
    TNCandBond = models.FileField(upload_to = getTNCandBondPath ,  null = True)
    resume = models.FileField(upload_to = getResumePath ,  null = True)
    certificates = models.FileField(upload_to = getCertificatesPath ,  null = True)
    transcripts = models.FileField(upload_to = getTranscriptsPath ,  null = True)
    otherDocs = models.FileField(upload_to = getOtherDocsPath ,  null = True , blank = True)
    almaMater = models.CharField(max_length = 100 , null = True)
    pgUniversity = models.CharField(max_length = 100 , null = True , blank = True)
    docUniversity = models.CharField(max_length = 100 , null = True , blank = True)

    fathersName = models.CharField(max_length = 100 , null = True)
    mothersName = models.CharField(max_length = 100 , null = True)
    wifesName = models.CharField(max_length = 100 , null = True , blank = True)
    childCSV = models.CharField(max_length = 100 , null = True , blank = True)

    note1 = models.TextField(max_length = 500 , null = True , blank = True)
    note2 = models.TextField(max_length = 500 , null = True , blank = True)
    note3 = models.TextField(max_length = 500 , null = True , blank = True)

User.profile = property(lambda u : profile.objects.get_or_create(user = u)[0])

class rank(models.Model):
    CATEGORY_CHOICES = (
        ('management' , 'management'),
        ('rnd' , 'rnd'),
        ('operations' , 'operations'),
    )
    title = models.CharField(max_length = 100 , null = False , unique=True)
    category = models.CharField(choices = CATEGORY_CHOICES , max_length = 100 , null = False)
    user = models.ForeignKey(User , related_name = "ranksAuthored" , null=False)
    created = models.DateTimeField(auto_now_add = True)


class designation(models.Model):
    DOMAIN_CHOICES = (
        ('Not selected..' , 'Not selected..'),
        ('Automotive' , 'Automotive'),
        ('Service' , 'Service'),
        ('University' , 'University'),
        ('FMCG' , 'FMCG'),
        ('Power' , 'Power'),
        ('Pharmaceuticals' , 'Pharmaceuticals'),
        ('Manufacturing' , 'Manufacturing'),
        ('Tele Communications' , 'Tele Communications'),
    )
    UNIT_TYPE_CHOICE = (
        ('Not selected..' , 'Not selected..'),
        ('Research and Development' , 'Research and Development'),
        ('Operational' , 'Operational'),
        ('Management' , 'Management'),
    )

    """ One more field can be user here
    """
    user = models.OneToOneField(User)
    unitType = models.CharField(choices = UNIT_TYPE_CHOICE , default = 'Not selected..' , max_length = 30)
    domain = models.CharField(max_length = 15 , choices = DOMAIN_CHOICES , default = 'Not selected..')
    unit = models.CharField(max_length = 30 , null = True) # this should be unique for a given facilty
    department = models.CharField(max_length = 30 , null = True)
    rank = models.ForeignKey( rank , null = True )
    reportingTo = models.ForeignKey(User , related_name = "managing" , null=True)
    primaryApprover = models.ForeignKey(User, related_name = "approving" , null=True)
    secondaryApprover = models.ForeignKey(User , related_name = "alsoApproving" , null=True)

User.designation = property(lambda u : designation.objects.get_or_create(user = u)[0])

@receiver(social_account_added, dispatch_uid="some.unique.string.id.for.allauth.user_signed_up")
def newSocialAccountCallback(request, sociallogin,**kwargs):
    print sociallogin
    print dir(sociallogin)
    print request
    print dir(request)

@receiver(user_signed_up, dispatch_uid="some.unique.string.id.for.allauth.user_signed_up")
def user_signed_up_(request, user, **kwargs):
    user.username = user.email
    user.save()
