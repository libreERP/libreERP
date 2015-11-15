from django.db import models
from django.contrib.auth.models import User

# Create your models here.
def getThemeImageUploadPath(instance , filename ):
    return 'PIM/images/theme/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

PRESENCE_CHOICES = (
    ('NA' , 'NA'),
    ('Available' , 'Available'),
    ('Busy' , 'Busy'),
    ('Away' , 'Away'),
    ('On Leave' ,'On Leave'),
    ('In A Meeting' ,'In a meeting'),
)
class settings(models.Model):
    presence = models.CharField(max_length = 15 , choices = PRESENCE_CHOICES , null = False , default = 'NA')
    user = models.OneToOneField(User)

class theme(models.Model):
    main = models.CharField(max_length=10 , null = True)
    highlight = models.CharField(max_length=10 , null = True)
    background = models.CharField(max_length=10 , null = True)
    backgroundImg = models.ImageField(upload_to = getThemeImageUploadPath , null = True)
    parent = models.OneToOneField(settings , related_name = 'theme')

User.settings = property(lambda u : settings.objects.get_or_create(user = u)[0])
settings.theme = property(lambda s : theme.objects.get_or_create(parent = s)[0])

DOMAIN_CHOICES = (
    ('SYS' , 'System'),
    ('ADM' , 'Administration'),
    ('APP' , 'Application')
)

class notification(models.Model):
    message = models.TextField(max_length = 300 , null=True)
    link = models.URLField(max_length = 100 , null = True)
    shortInfo = models.CharField(max_length = 30 , null = True)
    read = models.BooleanField(default = False)
    user = models.ForeignKey(User)
    domain = models.CharField(null = False , default = 'SYS' , choices = DOMAIN_CHOICES , max_length = 3)
    originator = models.CharField(null = True , max_length = 20)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    onHold = models.BooleanField(default = False)

def getChatMessageAttachment(instance , filename ):
    return 'chat/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, instance.originator.username, filename)

class chatMessage(models.Model):
    message = models.CharField(max_length = 200 , null=True)
    attachment = models.FileField(upload_to = getChatMessageAttachment ,  null = True)
    originator = models.ForeignKey(User , related_name = "sentIMs" , null = True)
    created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User)
    read = models.BooleanField(default = False)

def getCalendarAttachment(instance , filename ):
    return 'calendar/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, instance.originator.username, filename)

class calenderItem(models.Model):
    TYPE_CHOICE =(
        ('NONE' , 'Not Available'),
        ('MEET' , 'Meeting'),
        ('REMI' , 'Reminder'),
        ('TODO' , 'ToDo'),
        ('EVEN' , 'EVENT'),
        ('DEAD' , 'Deadline'),
        ('OTHE' , 'Other'),
    )

    LEVEL_CHOICE = (
        ('NOR' , 'Normal'),
        ('CRI' , 'Critical'),
        ('OPT' , 'Optional'),
        ('MAN' , 'Mandatory'),
    )

    eventType = models.CharField(choices = TYPE_CHOICE , default = 'NONE' , max_length = 4)
    originator = models.CharField(null = True , max_length = 20)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User)
    text = models.CharField(max_length = 200 , null = True)
    notification = models.ForeignKey(notification)
    when = models.DateTimeField(null = True)
    checked = models.BooleanField(default = False)
    deleted = models.BooleanField(default = False)
    completed = models.BooleanField(default = False)
    canceled = models.BooleanField(default = False)
    level = models.CharField(choices = LEVEL_CHOICE , default = 'NOR' , max_length = 3)
    venue = models.CharField(max_length = 50)
    attachment = models.FileField(upload_to = getCalendarAttachment , null = True)
    myNotes = models.CharField(max_length = 100)
