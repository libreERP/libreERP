from django.db import models
from django.contrib.auth.models import User
from time import time


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

class userProfile(models.Model):
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

    mobile = models.PositiveIntegerField( null = True)
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

User.profile = property(lambda u : userProfile.objects.get_or_create(user = u)[0])

class userDesignation(models.Model):

    UNIT_TYPE_CHOICE = (
        ('NOT' , 'Not selected..'),
        ('RND' , 'Research and Development'),
        ('OPE' , 'Operational'),
        ('MAN' , 'Management'),
    )

    RND_RANK_CHOICE = (
        ('Not Selected..' , 'Not Selected..'),
        ('Director' , 'Director'),
        ('Deputy Director' , 'Deputy Director'),
        ('Department Head' , 'Department Head'),
        ('Prof. InCharge' , 'Prof. InCharge'),
        ('Group Leader' , 'Group Leader'),
        ('Senior Scientist' , 'Senior Scientist'),
        ('Scientist' , 'Scientist'),
        ('Undergraduate Student' , 'Undergraduate Student'),
        ('Master Student' , 'Master Student'),
        ('PhD Candidate' , 'PhD Candidate'),
        ('Post Doctoral Candidate' , 'Post Doctoral Candidate'),
        ('Senior Engineer' , 'Senior Engineer'),
        ('Engineer' , 'Engineer'),
        ('Technician' , 'Technician'),
        ('General Staff' , 'General Staff'),
    )

    OPERATIONAL_RANK_CHOICE = (
        ('NOTS' , 'Not Selected..'),
        ('DIRE' , 'Director'),
        ('DEPD' , 'Deputy Director'),
        ('MANA' , 'Manager'),
        ('LEAD' , 'lead'),
        ('SENG' , 'Senior Engineer'),
        ('ENGI' , 'Engineer'),
        ('TECH' , 'Technician'),
        ('GENS' , 'General Staff'),
    )

    MANAGEMENT_RANK_CHOICE = (
        ('NOTS' , 'Not Selected..'),
        ('DIRE' , 'Director'),
        ('DEPD' , 'Deputy Director'),
        ('MANA' , 'Manager'),
        ('DMAN' , 'Deputy Manager'),
        ('EXEC' , 'Executive'),
        ('ASSO' , 'Associate'),
        ('GENS' , 'General Staff'),
    )
    DOMAIN_CHOICES = (
        ('NA' , 'Not Assigned'),
        ('AUTO' , 'Automotive'),
        ('SERVICE' , 'Service'),
        ('RND' , 'University'),
        ('FMCG' , 'FMCG'),
        ('POWER' , 'Power'),
        ('PHARMA' , 'Pharmaceuticals'),
        ('MANUFAC' , 'Manufacturing'),
        ('TELE' , 'Tele Communications'),
    )

    """ One more field can be user here
    """
    user = models.OneToOneField(User)
    domainType = models.CharField(choices = UNIT_TYPE_CHOICE , default = 'NOT' , max_length = 3)
    domain = models.CharField(max_length = 15 , choices = DOMAIN_CHOICES , default = 'NA')
    unit = models.CharField(max_length = 30 , null = True) # this should be unique for a given facilty
    department = models.CharField(max_length = 30 , null = True)
    rank = models.CharField( null = True , max_length = 8)
    reportingTo = models.ForeignKey(User , related_name = "managing" , null=True)
    primaryApprover = models.ForeignKey(User, related_name = "approving" , null=True)
    secondaryApprover = models.ForeignKey(User , related_name = "alsoApproving" , null=True)

User.designation = property(lambda u : userDesignation.objects.get_or_create(user = u)[0])
