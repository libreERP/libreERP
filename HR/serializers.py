from django.contrib.auth.models import User , Group
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

class groupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('url' , 'name')
