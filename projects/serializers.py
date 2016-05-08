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

class projectCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = projectComment
        fields = ( 'user' , 'text' , 'media')

class projectSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    repos = repoLiteSerializer(many = True , read_only = True)
    comments = projectCommentSerializer(many = True , read_only = True)
    class Meta:
        model = project
        fields = ('pk','dueDate', 'created' , 'title' , 'description' , 'files' , 'team', 'comments', 'repos')
        read_only_fields = ('user', 'team',)
    def create(self , validated_data):
        p = project(**validated_data)
        p.user = self.context['request'].user
        p.save()
        for u in self.context['request'].data['team']:
            p.team.add(User.objects.get(pk=u))
        for f in self.context['request'].data['files']:
            p.files.add(media.objects.get(pk = f))
        p.save()
        return p
    def update(self, instance , validated_data):
        if 'files' in self.context['request'].data:
            instance.files.clear()
            for f in self.context['request'].data['files']:
                instance.files.add(media.objects.get(pk = f))
        else:
            instance.dueDate = validated_data['dueDate']
            instance.description = validated_data['description']
            instance.team.clear()
            for u in self.context['request'].data['team']:
                instance.team.add(User.objects.get(pk=u))
        instance.save()
        return instance
