from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *

class userDesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = designation
        fields = ('url' , 'domainType' , 'domain' , 'rank' , 'unit' , 'department' , 'reportingTo' , 'primaryApprover' , 'secondaryApprover')

class userProfileSerializer(serializers.ModelSerializer):
    """ allow all the user """
    class Meta:
        model = profile
        fields = ( 'url' , 'mobile' , 'displayPicture' , 'website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity' )
        read_only_fields = ('website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity' , )

class userProfileAdminModeSerializer(serializers.HyperlinkedModelSerializer):
    """ Only admin """
    class Meta:
        model = profile
        fields = ( 'url', 'empID', 'dateOfBirth' , 'anivarsary' , 'permanentAddressStreet' , 'permanentAddressCity' , 'permanentAddressPin', 'permanentAddressState' , 'permanentAddressCountry',
        'localAddressStreet' , 'localAddressCity' , 'localAddressPin' , 'localAddressState' , 'localAddressCountry' , 'prefix', 'gender' , 'email', 'email2', 'mobile' , 'emergency' , 'tele' , 'website',
        'sign', 'IDPhoto' , 'TNCandBond' , 'resume' ,  'certificates', 'transcripts' , 'otherDocs' , 'almaMater' , 'pgUniversity' , 'docUniversity' , 'fathersName' , 'mothersName' , 'wifesName' , 'childCSV',
        'note1' , 'note2' , 'note3')

class userSerializer(serializers.HyperlinkedModelSerializer):
    profile = userProfileSerializer(many=False , read_only=True)
    class Meta:
        model = User
        fields = ('url' , 'username' , 'email' , 'first_name' , 'last_name' , 'designation' ,'profile'  ,'settings' , 'password' , 'social')
        read_only_fields = ('designation' , 'profile' , 'settings' , )
        extra_kwargs = {'password': {'write_only': True} }

    def create(self , validated_data):
        if not self.context['request'].user.is_superuser:
            raise PermissionDenied(detail=None)
        user = User.objects.create(**validated_data)
        user.email = user.username + '@cioc.com'
        password =  self.context['request'].data['password']
        user.set_password(password)
        user.save()
        return user
    def update (self, instance, validated_data):
        user = self.context['request'].user
        u = authenticate(username = user.username , password = self.context['request'].data['oldPassword'])
    	if u is not None:
            user.set_password(validated_data['password'])
            user.save()
        else :
            raise PermissionDenied(detail=None)
        return user

class groupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('url' , 'name')
