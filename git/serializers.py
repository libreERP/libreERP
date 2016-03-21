from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *


class repoPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = repoPermission
        fields = ('pk', 'user' , 'canRead' , 'canWrite' , 'canDelete' )

class gitGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = gitGroup
        fields = ('pk', 'users' , 'name' , 'description')


class groupPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = groupPermission
        fields = ('pk', 'group' , 'canRead' , 'canWrite' , 'canDelete')


class repoSerializer(serializers.ModelSerializer):
    # perms = repoPermissionSerializer(many = False)
    class Meta:
        model = repo
        fields = ('pk', 'perms' , 'name' , 'groups' , 'description' )
    def create(self , validated_data):
        r = repo(**validated_data)
        r.creator = self.context['request'].user
        r.save()
        return r
