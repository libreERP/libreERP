from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from gitweb.serializers import repoLiteSerializer

class mediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = media
        fields = ( 'pk', 'link' , 'attachment' , 'mediaType', 'name', 'user' , 'created')
        read_only_fields = ('fileName' ,'user',)
    def create(self , validated_data):
        m = media(**validated_data)
        m.name = validated_data['attachment'].name
        m.user = self.context['request'].user
        m.save()
        return m

class subTasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = subTask
        fields = ('pk' , 'title' , 'status')
    def create(self , validated_data):
        st = subTask(**validated_data)
        st.task = task.objects.get(pk = self.context['request'].data['task'])
        st.user = self.context['request'].user
        st.save()
        return st
    def update(self , instance , validated_data):
        instance.title = validated_data['title']
        instance.status = validated_data['status']
        instance.save()
        return instance

class taskSerializer(serializers.ModelSerializer):
    subTasks = subTasksSerializer(many = True , read_only = True)
    files = mediaSerializer(many = True , read_only = True)
    class Meta:
        model = task
        fields = ( 'pk', 'title' , 'description' , 'files', 'followers', 'user' , 'created', 'dueDate', 'to', 'subTasks', 'project', 'personal')
        read_only_fields = ('user','followers',)
    def create(self , validated_data):
        t = task(**validated_data)
        req = self.context['request']
        t.user = req.user
        t.save()
        for u in req.data['followers']:
            t.followers.add(User.objects.get(pk=u))
        for f in req.data['files']:
            t.files.add(media.objects.get(pk = f))
        t.save()
        return t
    def update(self , instance , validated_data):
        for u in self.context['request'].data['followers']:
            instance.followers.add(User.objects.get(pk=u))
        for f in self.context['request'].data['files']:
            instance.files.add(media.objects.get(pk = f))
        instance.title = validated_data['title']
        instance.description = validated_data['description']
        instance.dueDate = validated_data['dueDate']
        instance.to = validated_data['to']
        instance.save()
        return instance
