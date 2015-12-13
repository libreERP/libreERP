from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *

class mailAttachmentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = mailAttachment
        fields = ('url' , 'user' , 'attachment', 'created' )
    def create(self , validated_data):
        a = mailAttachment()
        a.user = self.context['request'].user
        a.attachment = validated_data.pop('attachment')
        a.save()
        return a
