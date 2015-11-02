from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *

class themeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = theme
        fields = ( 'url' , 'main' , 'highlight' , 'background' , 'backgroundImg')

class userSettingsSerializer(serializers.HyperlinkedModelSerializer):
    theme = themeSerializer(many = False , read_only = True)
    class Meta:
        model = settings
        fields = ('url' , 'user', 'theme', 'presence')
