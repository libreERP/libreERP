from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import *


class userDesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = userDesignation
        fields = ('domainType' , 'domain' , 'rank' , 'unit' , 'department' , 'reportingTo' , 'primaryApprover' , 'secondaryApprover')

class userProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = userProfile
        fields = ( 'mobile' , 'displayPicture' , 'website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity')

class userSerializer(serializers.HyperlinkedModelSerializer):
    profile = userProfileSerializer(many=False , read_only=True)
    designation = userDesignationSerializer(many = False , read_only=True) # to get the organisational details for the user
    class Meta:
        model = User
        fields = ('url' , 'username' , 'email' , 'first_name' , 'last_name' , 'profile' , 'designation')
    def create(self , validated_data):
        user = User.objects.create(**validated_data)
        user.email = user.username + '@cioc.com'
        password =  self.context['request'].data['password']
        user.set_password(password)
        user.save()
        return user

class groupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('url' , 'name')
