from __future__ import unicode_literals
from time import time
from django.db import models
from django.contrib.auth.models import User
import datetime
# Create your models here.

def getProcessUploadsPath(instance , filename ):
    return 'virtualWorkforce/process/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

DATA_TYPE_CHOICES = (
    ('string' , 'string'),
    ('int' , 'int'),
    ('boolean' , 'boolean'),
)


class process(models.Model):
    name = models.CharField(blank = False , max_length = 200)
    created = models.DateTimeField(auto_now_add = True)
    creator = models.ForeignKey(User , null = False , related_name = 'virtualWorkforceProcess')
    description = models.TextField(max_length = 500 , null = True)
    def __str__(self):
        return self.name



class processFileVersion(models.Model):
    user = models.ForeignKey(User , related_name = 'processFiles' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    attachment = models.FileField(upload_to = getProcessUploadsPath , null = True ) # can be image , video or document
    name = models.CharField(max_length = 100 , null = True)
    version = models.CharField(max_length = 5 , null = False)
    process = models.ForeignKey(process , null = False )

class processRunLog(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    processFile = models.ForeignKey(processFileVersion , null = False)
    user = models.ForeignKey(User , related_name = 'processRunLog' , null = False)
    stageName = models.CharField(max_length = 100 , null = False)
    stageType = models.CharField(max_length = 100 , null = False)
    result = models.CharField(max_length = 100 , null = False)

class logParameter(models.Model):
    direction = models.BooleanField(default = False)
    name = models.CharField(max_length = 50, null = False)
    typ = models.CharField(max_length = 15 , choices = DATA_TYPE_CHOICES , default = 'string')
    value = models.CharField(max_length = 100 , null = False)
    parent = models.ForeignKey(processRunLog , null = False , related_name = 'logParameters')

class robot(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.ForeignKey(User , null = False , related_name = 'robotsOwned')
    name = models.CharField(max_length = 100 , null = False)
    sha = models.CharField(max_length = 500 , null = False) # just another security check , will try to see if i can use the sha authentication
    serverKey = models.CharField(max_length = 200 , null = False) # used to send it in the messages to the robot to authenticate (generated and issued by the robot)
