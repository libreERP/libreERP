from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from API.permissions import *

class deviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = device
        fields = ('pk', 'sshKey' , 'created' , 'name')

class profileSerializer(serializers.ModelSerializer):
    devices = deviceSerializer(many = True , read_only = True)
    class Meta:
        model = profile
        fields = ('pk', 'user' , 'devices')

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
        u = self.context['request'].user
        has_application_permission(u , ['app.GIT' , 'app.ecommerce.groups'])
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
        u = self.context['request'].user
        has_application_permission(u , ['app.GIT' , 'app.ecommerce.repos'])
        r = repo(**validated_data)
        r.creator = u
        r.save()
        for p in self.context['request'].data['perms']:
            r.perms.add(repoPermission.objects.get(pk = p))
        r.save()
        r.groups.clear()
        for p in self.context['request'].data['groups']:
            r.groups.add(groupPermission.objects.get(pk = p))
        r.save()
        return r
    def update(self ,instance , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.GIT' , 'app.ecommerce.repos'])
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

class repoLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = repo
        fields = ('name', 'pk')
        read_only_fields = ('name',)

class commitNotificationSerializer(serializers.ModelSerializer):
    repo = repoLiteSerializer(many = False , read_only = True)
    class Meta:
        model = commitNotification
        fields = ('pk', 'created' , 'sha' , 'user' , 'message' , 'branch' , 'repo' , 'time')
