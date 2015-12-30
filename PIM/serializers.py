from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *

class themeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = theme
        fields = ( 'url' , 'main' , 'highlight' , 'background' , 'backgroundImg')

class settingsSerializer(serializers.HyperlinkedModelSerializer):
    theme = themeSerializer(many = False , read_only = True)
    class Meta:
        model = settings
        fields = ('url' , 'user', 'theme', 'presence')

class notificationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = notification
        fields = ('url' , 'message' ,'shortInfo','domain','onHold', 'link' , 'originator' , 'created' ,'updated' , 'read' , 'user')

class calendarSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = calendar
        fields = ('url' , 'eventType' , 'followers' ,'originator', 'duration' , 'created', 'updated', 'user' , 'text' , 'notification' ,'when' , 'read' , 'deleted' , 'completed' , 'canceled' , 'level' , 'venue' , 'attachment' , 'myNotes')
        read_only_fields = ('followers',)
    def create(self , validated_data):
        cal = calendar.objects.create(**validated_data)
        if 'with' in  self.context['request'].data:
            tagged = self.context['request'].data['with']
            for tag in tagged.split(','):
                cal.followers.add( User.objects.get(username = tag))

        cal.user = self.context['request'].user
        cal.save()
        return cal
    def update(self, instance, validated_data): # like the comment
        user =  self.context['request'].user
        for key in ['eventType', 'duration' , 'text' ,'when' , 'read' , 'deleted' , 'completed' , 'canceled' , 'level' , 'venue' , 'attachment' , 'myNotes']:
            print key
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.followers.clear()
        if 'with' in  self.context['request'].data:
            tagged = self.context['request'].data['with']
            for tag in tagged.split(','):
                instance.followers.add( User.objects.get(username = tag))
        instance.save()
        return instance

class chatMessageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = chatMessage
        fields = ('url' , 'message' ,'attachment', 'originator' , 'created' , 'read' , 'user')
        read_only_fields = ('originator' , )
    def create(self , validated_data):
        im = chatMessage.objects.create(**validated_data)
        im.originator = self.context['request'].user
        if im.originator == im.user:
            im.delete()
            raise ParseError(detail=None)
        else:
            im.save()
            return im
