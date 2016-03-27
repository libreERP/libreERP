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
    group = gitGroupSerializer(many = False , read_only = True)
    class Meta:
        model = groupPermission
        fields = ('pk', 'group' , 'canRead' , 'canWrite' , 'canDelete')
    def create(self , validated_data):
        gp = groupPermission(**validated_data)
        gp.group = gitGroup.objects.get(pk = self.context['request'].data['group'])
        gp.save()
        return gp


class repoSerializer(serializers.ModelSerializer):
    perms = repoPermissionSerializer(many = True , read_only = True)
    groups = groupPermissionSerializer(many = True , read_only = True)
    class Meta:
        model = repo
        fields = ('pk', 'perms' , 'name' , 'groups' , 'description' )
    def create(self , validated_data):
        r = repo(**validated_data)
        r.creator = self.context['request'].user
        r.save()
        return r
    def update(self ,instance , validated_data):
        instance.description = validated_data.pop('description')
        instance.perms.clear()
        for p in self.context['request'].data['perms']:
            instance.perms.add(repoPermission.objects.get(pk = p))
        instance.save()
        instance.groups.clear()
        for p in self.context['request'].data['groups']:
            instance.groups.add(groupPermission.objects.get(pk = p))
        instance.save()
        return instance