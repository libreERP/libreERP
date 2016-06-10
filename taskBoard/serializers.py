from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from gitweb.serializers import repoLiteSerializer, commitNotificationSerializer
from gitweb.models import commitNotification
from projects.serializers import projectLiteSerializer
from projects.models import project

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
    project = projectLiteSerializer(many = False , read_only = True)
    class Meta:
        model = task
        fields = ( 'pk', 'title' , 'description' , 'files', 'followers', 'user' , 'created', 'dueDate', 'to', 'subTasks', 'project', 'personal' , 'completion')
        read_only_fields = ('user','followers',)
    def create(self , validated_data):
        t = task(**validated_data)
        req = self.context['request']
        t.user = req.user
        t.project = project.objects.get(pk = req.data['project'])
        t.save()
        for u in req.data['followers']:
            t.followers.add(User.objects.get(pk=u))
        for f in req.data['files']:
            t.files.add(media.objects.get(pk = f))
        t.save()
        return t
    def update(self , instance , validated_data):
        data = self.context['request'].data
        if 'followers' in data:
            for u in data['followers']:
                instance.followers.add(User.objects.get(pk=u))
        if 'files' in data:
            for f in data['files']:
                instance.files.add(media.objects.get(pk = f))
        try:
            instance.title = validated_data['title']
            instance.description = validated_data['description']
            instance.dueDate = validated_data['dueDate']
            instance.to = validated_data['to']
        except:
            pass
        instance.save()
        return instance

class timelineItemSerializer(serializers.ModelSerializer):
    commit = commitNotificationSerializer(many = False , read_only = True)
    class Meta:
        model = timelineItem
        fields = ('pk','created' , 'user' , 'category' , 'text' , 'commit' , 'task')
        read_only_fields = ('user',)
    def create(self , validated_data):
        i = timelineItem(**validated_data)
        req = self.context['request']
        if i.category == 'git':
            i.commit = commitNotification.objects.get(pk = req.data['commit'])
        i.user = req.user
        i.save()
        return i
    def update(self , instance , validated_data):
        raise PermissionDenied({'NOT_ALLOWED'})
