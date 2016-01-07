from __future__ import unicode_literals
from django.contrib.auth.models import User, Group
from time import time
from django.db import models

# Create your models here.


class module(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 50 , null = False , unique = True)
    description = models.CharField(max_length = 500 , null = False)
    icon = models.CharField(max_length = 20 , null = True )
    

class application(models.Model):
    # each application in a module will have an instance of this model
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 50 , null = False , unique = True)
    owners = models.ManyToManyField(User , related_name = 'appsManaging' , blank = True)
    icon = models.CharField(max_length = 20 , null = True )
    # only selected users can assign access to the application to other user
    module = models.ForeignKey(module , related_name = "apps" , null=False)
    description = models.CharField(max_length = 500 , null = False)
    canConfigure = models.ForeignKey("self" , null = True, related_name="canBeConfigureFrom")
    def __unicode__(self):
        return self.name

class appSettingsField(models.Model):
    FIELD_TYPE_CHOICES = (
        ('flag' , 'flag'),
        ('value' , 'value')
    )
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 50 , null = False )
    flag = models.BooleanField(default = False)
    value = models.CharField(max_length = 200 , null = True)
    description = models.CharField(max_length = 500 , null = False)
    app = models.ForeignKey(application , related_name='settings' , null = True)
    fieldType = models.CharField(choices = FIELD_TYPE_CHOICES , default = 'flag' , null = False , max_length = 5)
    def __unicode__(self):
        return self.name
    class Meta:
        unique_together = ('name', 'app',)

class permission(models.Model):
    app = models.ForeignKey(application , null=False)
    user = models.ForeignKey(User , related_name = "accessibleApps" , null=False)
    givenBy = models.ForeignKey(User , related_name = "approvedAccess" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    def __unicode__(self):
        return self.app.name

class groupPermission(models.Model):
    app = models.ForeignKey(application , null=False)
    group = models.ForeignKey(Group , related_name = "accessibleApps" , null=False)
    givenBy = models.ForeignKey(User , related_name = "approvedGroupAccess" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    def __unicode__(self):
        return self.app
