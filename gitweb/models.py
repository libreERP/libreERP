from __future__ import unicode_literals
from django.contrib.auth.models import *
from django.db import models
import datetime
import django.utils.timezone
from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver
import requests
from django.conf import settings as globalSettings
from PIM.models import notification
from projects.models import project
# Create your models here.


class repoPermission(models.Model):
    user = models.ForeignKey(User , null = False)
    canRead = models.BooleanField(default = False)
    canWrite = models.BooleanField(default = False)
    canDelete = models.BooleanField(default = False)

class gitGroup(models.Model):
    users = models.ManyToManyField(User)
    name = models.CharField(max_length = 30 , null = True)
    description = models.TextField(max_length=500, null = False)

class groupPermission(models.Model):
    group = models.ForeignKey(gitGroup , null = True)
    canRead = models.BooleanField(default = False)
    canWrite = models.BooleanField(default = False)
    canDelete = models.BooleanField(default = False)

class device(models.Model):
    sshKey = models.CharField(max_length = 500 , null = True)
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length = 50)

class profile(models.Model):
    user = models.ForeignKey(User , null =False , related_name='gitProfile')
    devices = models.ManyToManyField(device)

class repo(models.Model):
    perms = models.ManyToManyField(repoPermission )
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length = 30)
    creator = models.ForeignKey(User , null = False)
    groups = models.ManyToManyField(groupPermission )
    description = models.TextField(max_length=500, null = False)
    lastNotified = models.DateTimeField(default = timezone.now) # used to check the latest commits when gitolite notify the same
    project = models.ForeignKey(project,null = True , related_name='repos')

class commitNotification(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    sha = models.CharField(max_length = 50 , blank = False)
    user = models.ForeignKey(User , null = True)
    message = models.CharField(max_length = 500 , default = '')
    branch = models.CharField(max_length = 100 , default = 'master')
    time = models.DateTimeField(default=timezone.now)
    repo = models.ForeignKey(repo , null = False)

class codeComment(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    sha = models.CharField(max_length = 50 , blank = False)
    user = models.ForeignKey(User , null = True)
    text = models.CharField(max_length = 1500 , default = '')
    path = models.CharField(max_length = 250 , blank = True)
    line = models.PositiveIntegerField(default=-1)
    repo = models.ForeignKey(repo , null = True)


def notify(type , pk , action , sha , user):
    """
        to send the notification object
    """
    print "will notify to " + user.username
    requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",
        json={
          'topic': 'service.notification.' + user.username,
          'args': [{'type' : type ,'pk': pk , 'action' : action , 'parent' : sha}]
        }
    )
def notifyUpdates(type , action , subscribers , instance):
    """
        to send the updates to aside window
    """
    for sub in subscribers:
        if sub != instance.user:
            print "will update " + sub.username
            requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",
                json={
                  'topic': 'service.updates.' + sub.username,
                  'args': [{'type' : type ,'parent': instance.sha , 'action' : action , 'pk' : instance.pk , 'repo'  : instance.repo.pk}]
                }
            )

def getSubscribers(rpo):
    users = []
    for p in rpo.perms.all():
        users.append(p.user)
    for g in rpo.groups.all():
        for u in g.users.all():
            users.append(u)
    return users


def sendNotificationsAndUpdates(sender , instance , mode):
    subscribers = getSubscribers(instance.repo)
    shortInfo = sender.__name__
    notifyUpdates( 'git.' + shortInfo , mode , subscribers , instance)
    shortInfo += ':' + str(instance.pk) + ':' + str(instance.sha)
    for s in subscribers:
        if s == instance.user:
            continue
        n , new = notification.objects.get_or_create(user = s , domain = 'APP' , originator = 'git' , shortInfo = shortInfo)
        if new:
            print "new" , n.pk
            notify('git' , n.pk , mode , instance.sha , s )
        if mode == 'deleted':
            n = notification.objects.filter(user = s ,domain = 'APP' , originator = 'git' , shortInfo = shortInfo)
            if n.count() != 0:
                for i in n:
                    print "deleted" , i.pk
                    notify('git' , i.pk , mode , instance.sha , s)
                n.delete()

@receiver(post_save, sender=codeComment, dispatch_uid="server_post_save")
def gitCreatedUpdate(sender, instance, **kwargs):
    sendNotificationsAndUpdates(sender , instance , 'created')


@receiver(pre_delete, sender=codeComment, dispatch_uid="server_post_save")
def socialDeletedUpdate(sender, instance, **kwargs):
    sendNotificationsAndUpdates(sender , instance , 'deleted')
