from django.db import models
from django.contrib.auth.models import User
from time import time
from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
import requests
from django.conf import settings as globalSettings
from PIM.models import *

# Create your models here.
def getCommentAttachmentPath(instance , filename ):
    return 'social/commentAttachments/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getPostAttachmentPath(instance , filename ):
    return 'social/postAttachments/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getSocialPictureUploadPath(instance , filename ):
    return 'social/pictureUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

class post(models.Model):
    user = models.ForeignKey(User , related_name = 'socialPost' , null = False)
    text = models.TextField(null = False , max_length = 300)
    attachment = models.FileField(upload_to = getPostAttachmentPath , null = True)
    created = models.DateTimeField(auto_now = True)
    def __unicode__(self):
        return self.text

class postHistory(models.Model):
    created = models.DateTimeField(auto_now = True)
    text = models.TextField(null = False , max_length = 300)
    attachment = models.FileField(upload_to = getPostAttachmentPath , null = True)
    parent = models.ForeignKey(post , related_name = 'history' , null = False)

class album(models.Model):
    user = models.ForeignKey(User , related_name = 'socialAlbums')
    created = models.DateTimeField(auto_now = True)
    title = models.CharField(max_length = 50, null = True)
class picture(models.Model):
    user = models.ForeignKey(User , related_name = 'socialPhotos' , null = False)
    photo = models.ImageField(upload_to = getSocialPictureUploadPath , null = False)
    created = models.DateTimeField (auto_now = True)
    tagged = models.CharField(max_length = 1000, null = True)
    album = models.ForeignKey(album , related_name = 'photos' , null = True)

class follow(models.Model):
    user = models.ForeignKey(User , related_name ='itemsFollowing')
    created = models.DateTimeField(auto_now = True)

class comment(models.Model):
    user = models.ForeignKey(User , related_name = 'postsCommented')
    created = models.DateTimeField(auto_now = True)
    attachment = models.FileField(upload_to = getCommentAttachmentPath , null = True)
    text = models.CharField(max_length = 200 , null = False)

class like(models.Model):
    user = models.ForeignKey(User , related_name = 'commentsLiked')
    created = models.DateTimeField(auto_now = True)

class postLike(like):
    parent = models.ForeignKey(post , related_name = 'likes')
class postComment(comment):
    parent = models.ForeignKey(post , related_name ='comments')
class commentLike(like):
    parent = models.ForeignKey(comment , related_name = 'likes')
class pictureLike(like):
    parent = models.ForeignKey(picture , related_name  = 'likes')
class pictureComment(comment):
    parent = models.ForeignKey(picture , related_name = 'comments')

def getSocialCoverPictureUploadPath(instance , filename ):
    return 'social/pictureUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
class social(models.Model):
    user = models.OneToOneField(User)
    aboutMe = models.TextField(max_length = 1000 , null = True)
    status = models.CharField(max_length = 100 , null = True) # social status
    coverPic = models.ImageField(upload_to = getSocialCoverPictureUploadPath , null = True , blank = True)

User.social = property(lambda u : social.objects.get_or_create(user = u)[0])

def notify(type , id , action , instance):
    requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",
        json={
          'topic': 'service.notification.' + instance.parent.user.username,
          'args': [{'type' : type ,'id': id , 'action' : action , 'objID' : instance.pk}]
        }
    )
def notifyUpdates(type , action , subscribers , instance):
    for user in subscribers:
        requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",
            json={
              'topic': 'service.updates.' + user.username,
              'args': [{'type' : type ,'parent': instance.parent.pk , 'action' : action , 'id' : instance.pk}]
            }
        )

@receiver(post_save, sender=postComment, dispatch_uid="server_post_save")
@receiver(post_save, sender=postLike, dispatch_uid="server_post_save")
def postLikeNotification(sender, instance, **kwargs):

    subscribers = []
    for c in postComment.objects.filter(parent = instance.parent):
        if c.user not in subscribers and c.user != instance.parent.user and c.user != instance.user:
            subscribers.append(c.user)
    if sender == postLike:
        notifyUpdates('social.postLike' , 'created' , subscribers , instance)
        shortInfo = 'postLike:'
    elif sender == postComment:
        shortInfo = 'postComment:'
        notifyUpdates('social.postComment' , 'created' , subscribers , instance)
    if instance.parent.user == instance.user:
        return
    shortInfo += str(instance.pk)
    n , new = notification.objects.get_or_create(user = instance.parent.user , domain = 'APP' , originator = 'social' , shortInfo = shortInfo)
    if new:
        notify('social' , n.pk , 'created' , instance)


@receiver(pre_delete, sender=postLike, dispatch_uid="server_post_delete")
@receiver(pre_delete, sender=postComment, dispatch_uid="server_post_delete")
def postCommentNotificationDelete(sender, instance, **kwargs):
    subscribers = []
    for c in postComment.objects.filter(parent = instance.parent):
        if c.user not in subscribers and c.user != instance.parent.user and c.user != instance.user:
            subscribers.append(c.user)
    if sender == postLike:
        notifyUpdates('social.postLike' , 'deleted' , subscribers , instance)
        shortInfo = 'postLike:'
    elif sender == postComment:
        shortInfo = 'postComment:'
        notifyUpdates('social.postComment' , 'deleted' , subscribers , instance)
    if instance.parent.user == instance.user:
        return
    shortInfo += str(instance.pk)

    n = notification.objects.filter(user = instance.parent.user , domain = 'APP' , originator = 'social' , shortInfo = shortInfo)
    if n.count() != 0:
        for i in n:
            notify('social' , i.pk , 'deleted' , instance)
        n.delete()
