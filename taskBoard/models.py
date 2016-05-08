from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from projects.models import MEDIA_TYPE_CHOICES, project
from gitweb.models import commitNotification
# Create your models here.
from time import time

def getTaskUploadsPath(instance , filename ):
    return 'tasks/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

class media(models.Model):
    user = models.ForeignKey(User , related_name = 'tasksUploads' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getTaskUploadsPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')
    name = models.CharField(max_length = 100 , null = True)

class task(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    title = models.CharField(blank = False , max_length = 200)
    description = models.TextField(max_length=2000 , blank=False)
    files = models.ManyToManyField(media , related_name='tasks', blank = True)
    followers = models.ManyToManyField(User , related_name = 'taskFollowing', blank = True)
    dueDate = models.DateTimeField(null = False)
    user = models.ForeignKey(User , null = True)
    to = models.ForeignKey(User , null = True , related_name='tasks')
    personal = models.BooleanField(default = False)
    project = models.ForeignKey(project , null = True)

TASK_STATUS_CHOICES = (
    ('notStarted','notStarted'),
    ('inProgress','inProgress'),
    ('stuck','stuck'),
    ('complete','complete'),
)

class subTask(models.Model):
    user = models.ForeignKey(User , null = True)
    task = models.ForeignKey(task , null = False, related_name='subTasks')
    title = models.CharField(blank = False , max_length = 200)
    status = models.CharField(choices = TASK_STATUS_CHOICES , default = 'notStarted' , max_length = 30)

TIMELINE_ITEM_CATEGORIES = (
    ('message' , 'message'),
    ('git' , 'git'),
    ('file' , 'file'),
    ('system' , 'system'),
)

class timelineItem(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user =  models.ForeignKey(User , null = True)
    category = models.CharField(choices = TIMELINE_ITEM_CATEGORIES , max_length = 50 , default = 'message')
    task = models.ForeignKey(task , null = False)
    text = models.TextField(max_length=1000 , null=True)
    commit = models.ManyToManyRel(commitNotification, blank = True)
