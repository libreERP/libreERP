from __future__ import unicode_literals

from django.contrib.auth.models import *
from django.db import models
import datetime
import django.utils.timezone
from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver
import requests
from django.conf import settings as globalSettings
# Create your models here.
from gitweb.models import repo
from time import time

def getProjectsUploadsPath(instance , filename ):
    return 'projects/doc/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

MEDIA_TYPE_CHOICES = (
    ('onlineVideo' , 'onlineVideo'),
    ('video' , 'video'),
    ('image' , 'image'),
    ('onlineImage' , 'onlineImage'),
    ('doc' , 'doc'),
)

class media(models.Model):
    user = models.ForeignKey(User , related_name = 'projectsUploads' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getProjectsUploadsPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')

class comment(models.Model):
    created = models.DateTimeField (auto_now_add = True,null = True)
    user = models.ForeignKey(User, null = False , related_name='projectsComment')
    text = models.TextField(max_length=200 , null=True)
    media = models.ForeignKey(media , null = True)

class project(models.Model):
    user = models.ForeignKey(User , null = False ) # the creator
    dueDate = models.DateTimeField(null = False)
    created = models.DateTimeField (auto_now_add = True)
    title = models.CharField(blank = False , max_length = 200)
    description = models.TextField(max_length=2000 , blank=False)
    files = models.ManyToManyField(media , related_name='projects')
    team = models.ManyToManyField(User , related_name = 'projectsFollowing')
    repos = models.ManyToManyField(repo , related_name='projects')

class projectComment(comment):
    project = models.ForeignKey(project , null= False , related_name='comments')
