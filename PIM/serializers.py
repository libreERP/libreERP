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
        fields = ('url' , 'eventType' ,'originator','created','updated', 'user' , 'text' , 'notification' ,'when' , 'read' , 'deleted' , 'completed' , 'canceled' , 'level' , 'venue' , 'attachment' , 'myNotes')
    def create(self , validated_data):
        cal = calendar.objects.create(**validated_data)
        cal.user = self.context['request'].user
        cal.save()
        return cal

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
