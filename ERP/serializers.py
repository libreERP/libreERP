from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer


class moduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = module
        fields = ( 'pk', 'name' , 'description' , 'icon' )

class applicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = application
        fields = ( 'pk', 'name', 'module' , 'description' , 'icon', 'canConfigure')

class applicationSettingsSerializer(serializers.ModelSerializer):
    # non admin mode
    class Meta:
        model = appSettingsField
        fields = ( 'pk', 'name', 'flag' , 'value' , 'fieldType')




class applicationAdminSerializer(serializers.ModelSerializer):
    module = moduleSerializer(read_only = True , many = False)
    owners = userSearchSerializer(read_only = True , many = True)
    class Meta:
        model = application
        fields = ( 'pk', 'name', 'module' , 'owners' , 'description' , 'created' , 'icon', 'canConfigure')
    def create(self , validated_data):
        app =  application(**validated_data)
        app.module = module.objects.get(pk = self.context['request'].data['module']);
        app.save()
        return app

    def update (self, instance, validated_data):
        instance.owners.clear()
        for pk in self.context['request'].data['owners']:
            instance.owners.add(User.objects.get(pk = pk))
        instance.save()
        return instance

class applicationSettingsAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = appSettingsField
        fields = ( 'pk', 'name', 'flag' , 'value' , 'description' , 'created' , 'app', 'fieldType')
    def create(self , validated_data):
        s = appSettingsField()
        s.name = validated_data.pop('name')
        s.flag = validated_data.pop('flag')
        if 'value' in self.context['request'].data:
            s.value = self.context['request'].data['value']
        s.description = validated_data.pop('description')
        s.fieldType = validated_data.pop('fieldType')
        if s.fieldType == 'flag':
            s.value = ""
        s.app = validated_data.pop('app')
        s.save()
        return s

class permissionSerializer(serializers.ModelSerializer):
    app = applicationSerializer(read_only = True, many = False)
    class Meta:
        model = permission
        fields = ( 'pk' , 'app' , 'user' )
    def create(self , validated_data):
        user = self.context['request'].user
        app =application.objects.get(pk = self.context['request'].data['app'])
        if not user.is_superuser and user not in app.owners.all():
            raise PermissionDenied(detail=None)
        perm , created = permission.objects.get_or_create(app =  app, user = validated_data['user'] , givenBy = user)
        return perm

class groupPermissionSerializer(serializers.ModelSerializer):
    app = applicationSerializer(read_only = True, many = False)
    class Meta:
        model = groupPermission
        fields = ( 'pk' , 'app' , 'group' )
