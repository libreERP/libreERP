from django.db import models
from django.contrib.auth.models import User
from time import time
from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
import requests
from django.conf import settings as globalSettings
from PIM.models import *
from django.core.exceptions import ObjectDoesNotExist

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
    created = models.DateTimeField(auto_now_add = True)
    tagged = models.ManyToManyField(User)
    def __unicode__(self):
        return self.text

class postHistory(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    text = models.TextField(null = False , max_length = 300)
    attachment = models.FileField(upload_to = getPostAttachmentPath , null = True)
    parent = models.ForeignKey(post , related_name = 'history' , null = False)

class album(models.Model):
    user = models.ForeignKey(User , related_name = 'socialAlbums')
    created = models.DateTimeField(auto_now_add = True)
    title = models.CharField(max_length = 50, null = True)
    tagged = models.ManyToManyField(User , related_name = 'taggedAlbums' , blank = True)

class picture(models.Model):
    user = models.ForeignKey(User , related_name = 'socialPhotos' , null = False)
    photo = models.ImageField(upload_to = getSocialPictureUploadPath , null = False)
    created = models.DateTimeField (auto_now_add = True)
    tagged = models.ManyToManyField(User , related_name = 'taggedPictures' , blank = True)
    album = models.ForeignKey(album , related_name = 'photos' , null = True)

SUBSCRIPTION_CHOICES = (
    ('all' , 'all'), # all the updates will be sent
    ('daily' , 'daily'), # updates consolidated on per day basis
    ('weekly' , 'weekly'),
    ('monthly' , 'monthly'),
    ('available' ,'available'),
)
FOLLOW_TYPE_CHOICES = (
    ('tagged' , 'tagged'), # when the other user tagged the follower
    ('starred' , 'starred'), # when the user subscribe to a given object
    ('action' , 'action') # used when the following is based on the users action such as like or comment
)

class follow(models.Model):
    user = models.ForeignKey(User , related_name ='following')
    created = models.DateTimeField(auto_now_add = True)
    subscription = models.CharField(choices = SUBSCRIPTION_CHOICES , default = 'all' , max_length = 10)
    enrollment = models.CharField(choices = FOLLOW_TYPE_CHOICES , default = 'tagged' , max_length = 10)

class postFollower(follow):
    parent = models.ForeignKey(post , related_name = 'followers')

class albumFollower(follow):
    parent = models.ForeignKey(album , related_name = 'followers')

class comment(models.Model):
    user = models.ForeignKey(User , related_name = 'comments')
    created = models.DateTimeField(auto_now_add = True)
    attachment = models.FileField(upload_to = getCommentAttachmentPath , null = True)
    text = models.CharField(max_length = 200 , null = False)
    tagged = models.ManyToManyField(User , related_name = 'taggedComments' , blank = True)

class like(models.Model):
    user = models.ForeignKey(User , related_name = 'likes')
    created = models.DateTimeField(auto_now_add = True)

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
    print "Upto here"
    for sub in subscribers:
        if sub != instance.user:
            print "will send to" + str(sub.username)
            requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",
                json={
                  'topic': 'service.updates.' + sub.username,
                  'args': [{'type' : type ,'parent': instance.parent.pk , 'action' : action , 'id' : instance.pk}]
                }
            )

@receiver(post_save, sender=postComment, dispatch_uid="server_post_save")
@receiver(post_save, sender=postLike, dispatch_uid="server_post_save")
@receiver(post_save, sender=pictureComment, dispatch_uid="server_post_save")
@receiver(post_save, sender=pictureLike, dispatch_uid="server_post_save")
@receiver(post_save, sender=commentLike, dispatch_uid="server_post_save")
def postLikeNotification(sender, instance, **kwargs):

    if sender == commentLike:
        try:
            prnt = picture.objects.get(comments = instance.parent)
        except:
            prnt = post.objects.get(comments = instance.parent)

        if prnt.__class__ == picture:
            subscribers = albumFollower.objects.filter(parent = album.objects.get(photos = prnt))
        else:
            subscribers = postFollower.objects.filter(parent = instance.parent.parent)
    elif sender == postComment or sender == postLike:
        subscribers = []
        for sub in postFollower.objects.filter(parent = instance.parent):
            subscribers.append(sub.user)
        for sub in instance.parent.tagged.all():
            if sub not in subscribers:
                subscribers.append(sub)
    elif sender == pictureComment or sender == pictureLike:
        a = album.objects.get(photos = instance.parent)
        subscribers = []
        for sub in albumFollower.objects.filter(parent = a):
            subscribers.append(sub.user)
        for sub in a.tagged.all():
            if sub not in subscribers:
                subscribers.append(sub)

    shortInfo = sender.__name__

    notifyUpdates( 'social.' + shortInfo , 'created' , subscribers , instance)
    if instance.parent.user == instance.user or sender == commentLike:
        return
    shortInfo += ':' + str(instance.pk) + ':' + str(instance.parent.pk)
    if sender==pictureComment:
        shortInfo += ':' + str(a.pk)
    n , new = notification.objects.get_or_create(user = instance.parent.user , domain = 'APP' , originator = 'social' , shortInfo = shortInfo)
    if new:
        notify('social' , n.pk , 'created' , instance)


@receiver(pre_delete, sender=postLike, dispatch_uid="server_post_delete")
@receiver(pre_delete, sender=postComment, dispatch_uid="server_post_delete")
@receiver(pre_delete, sender=pictureComment, dispatch_uid="server_post_delete")
@receiver(pre_delete, sender=pictureLike, dispatch_uid="server_post_delete")
@receiver(pre_delete, sender=commentLike, dispatch_uid="server_post_delete")
def postCommentNotificationDelete(sender, instance, **kwargs):

    if sender == commentLike:
        try:
            prnt = picture.objects.get(comments = instance.parent)
        except:
            prnt = post.objects.get(comments = instance.parent)

        if prnt.__class__ == picture:
            subscribers = albumFollower.objects.filter(parent = album.objects.get(photos = prnt))
        else:
            subscribers = postFollower.objects.filter(parent = prnt)
    elif sender == postComment or sender == postLike:
        subscribers = []
        for sub in postFollower.objects.filter(parent = instance.parent):
            subscribers.append(sub.user)
        for sub in instance.parent.tagged.all():
            if sub not in subscribers:
                subscribers.append(sub)
    elif sender == pictureComment or sender == pictureLike:
        a = album.objects.get(photos = instance.parent)
        subscribers = []
        for sub in albumFollower.objects.filter(parent = a):
            subscribers.append(sub.user)
        for sub in a.tagged.all():
            if sub not in subscribers:
                subscribers.append(sub)
    shortInfo = sender.__name__

    notifyUpdates( 'social.' + shortInfo , 'deleted' , subscribers , instance)
    if instance.parent.user == instance.user or sender == commentLike:
        return
    shortInfo += ':' + str(instance.pk) + ':' + str(instance.parent.pk)
    if sender==pictureComment:
        shortInfo += ':' + str(a.pk)
    n = notification.objects.filter(user = instance.parent.user , domain = 'APP' , originator = 'social' , shortInfo = shortInfo)
    if n.count() != 0:
        for i in n:
            notify('social' , i.pk , 'deleted' , instance)
        n.delete()
