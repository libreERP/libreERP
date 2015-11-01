from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import *


class userDesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = userDesignation
        fields = ('domainType' , 'domain' , 'rank' , 'unit' , 'department' , 'reportingTo' , 'primaryApprover' , 'secondaryApprover')

class userProfileSerializer(serializers.ModelSerializer):
    """ allow all the user """
    class Meta:
        model = userProfile
        fields = ( 'mobile' , 'displayPicture' , 'website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity')
        read_only_fields = ('website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity')

class userProfileAdminModeSerializer(serializers.HyperlinkedModelSerializer):
    """ Only admin """
    class Meta:
        model = userProfile
        fields = ( 'url', 'empID', 'dateOfBirth' , 'anivarsary' , 'permanentAddressStreet' , 'permanentAddressCity' , 'permanentAddressPin', 'permanentAddressState' , 'permanentAddressCountry',
        'localAddressStreet' , 'localAddressCity' , 'localAddressPin' , 'localAddressState' , 'localAddressCountry' , 'prefix', 'gender' , 'email', 'email2', 'mobile' , 'emergency' , 'tele' , 'website',
        'sign', 'IDPhoto' , 'TNCandBond' , 'resume' ,  'certificates', 'transcripts' , 'otherDocs' , 'almaMater' , 'pgUniversity' , 'docUniversity' , 'fathersName' , 'mothersName' , 'wifesName' , 'childCSV',
        'note1' , 'note2' , 'note3')

class userSerializer(serializers.HyperlinkedModelSerializer):
    profile = userProfileSerializer(many=False , read_only=True)
    designation = userDesignationSerializer(many = False , read_only=True) # to get the organisational details for the user
    extra_kwargs = {'password': {'write_only': True}}
    class Meta:
        model = User
        fields = ('url' , 'username' , 'email' , 'first_name' , 'last_name' , 'profile' , 'designation')
    def create(self , validated_data):
        user = User.objects.create(**validated_data)
        if not self.context['request'].user.is_superuser:
            return self.context['request'].user
        user.email = user.username + '@cioc.com'
        password =  self.context['request'].data['password']
        user.set_password(password)
        user.save()
        return user
    def update (self, instance, validated_data):
        user = self.context['request'].user
        user.set_password(validated_data['password'])
        user.save()
        return user

class groupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('url' , 'name')
