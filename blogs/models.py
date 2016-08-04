from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from PIM.models import blogPost
# Create your models here.

class blogBookmark(models.Model):
    user = models.ForeignKey(User , related_name = 'blogsBookmarked' , null = False)
    blog = models.ForeignKey(blogPost , related_name = 'bookmarks' , null = False)
    created = models.DateTimeField(auto_now_add = True)
