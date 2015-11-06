from django.db import models
from django.contrib.auth.models import User
from time import time
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
