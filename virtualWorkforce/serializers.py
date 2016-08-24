from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *


class processSerializer(serializers.ModelSerializer):
    class Meta:
        model = process
        fields = ( 'pk', 'name' , 'created' , 'creator', 'description', 'description')
        read_only_fields = ('creator',)
    def create(self , validated_data):
        p = process(**validated_data)
        p.creator = self.context['request'].user
        p.save()
        return p

class processFileVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = processFileVersion
        fields = ('pk' , 'user' , 'created' , 'attachment' , 'name' , 'version' , 'process')
        read_only_fields = ('user',)
    def create(self , validated_data):
        pfv = processFileVersion(**validated_data)
        pfv.user = self.context['request'].user
        pfv.save()
        return pfv

class processRunLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = processRunLog
        fields = ('pk' , 'created' , 'processFile', 'user' , 'stageName' , 'stageType' , 'result')

class logParameterSerializers(serializers.ModelSerializer):
    class Meta:
        model = logParameter
        fields = ('pk' , 'direction' , 'name' , 'typ' , 'value' , 'parent')
