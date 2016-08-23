from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings

class moduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = module
        fields = ( 'pk', 'name' , 'icon' , 'haveJs' , 'haveCss')

class applicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = application
        fields = ( 'pk', 'name', 'module' , 'description' , 'icon', 'canConfigure'  ,  'haveJs' , 'haveCss' , 'inMenu')

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
        fields = ( 'pk', 'name', 'module' , 'owners' , 'description' , 'created' , 'icon', 'canConfigure', 'haveJs' , 'haveCss' , 'inMenu')
    def create(self , validated_data):
        app =  application(**validated_data)
        app.module = module.objects.get(pk = self.context['request'].data['module']);
        # create the folder too as well as the folowing structure
        # app
        #     ---static
        #         -----js
        #         -----css
        #         -----ngTemplates
        parts = app.name.split('.')
        appName = parts[1]
        if len(app.name.split('.'))==2:
            with lcd(globalSettings.BASE_DIR):
                cmd = 'python manage.py startapp %s' %(appName)
                local(cmd)

        fileName = os.path.join(globalSettings.BASE_DIR , 'libreERP' , 'settings.py') # filepath for settings.py
        f = open(fileName , 'r')
        search = False
        lines = f.readlines()
        for l in lines:
            if l.find('INSTALLED_APPS') != -1:
                search = True
            if search:
                if l.find(')') != -1:
                    index = lines.index(l)
                    break
        lines.insert(index , ("\t'%s',# %s\n" %(appName , app.description)))
        f = open(fileName, "w")
        f.writelines(lines)
        f.close()
        os.makedirs(os.path.join(globalSettings.BASE_DIR ,appName,'static'))
        os.makedirs(os.path.join(globalSettings.BASE_DIR ,appName,'static', 'js'))
        os.makedirs(os.path.join(globalSettings.BASE_DIR ,appName,'static', 'css'))
        os.makedirs(os.path.join(globalSettings.BASE_DIR ,appName,'static', 'ngTemplates'))
        if app.haveJs:
            # create a JS file
            jsPath = os.path.join(globalSettings.BASE_DIR ,appName,'static', 'js' , ('%s.js' %(app.name)))
            f = open(jsPath, 'w')
            f.write('// you need to first configure the states for this app')
            f.close()
        if app.haveCss:
            #create a css file too
            jsPath = os.path.join(globalSettings.BASE_DIR ,appName,'static', 'css' , ('%s.css' %(app.name)))
            f = open(jsPath, 'w')
            f.write('/*here you can place all your app specific css class*/')
            f.close()
        doNothing()
        # app.save()
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
        if not user.is_superuser and user not in app.owners.all():
            raise PermissionDenied(detail=None)
        u = validated_data['user']
        permission.objects.filter(user = u).all().delete()
        for a in self.context['request'].data['apps']:
            app = application.objects.get(pk = a)
            p = permission.objects.create(app =  app, user = u , givenBy = user)
        return p

class groupPermissionSerializer(serializers.ModelSerializer):
    app = applicationSerializer(read_only = True, many = False)
    class Meta:
        model = groupPermission
        fields = ( 'pk' , 'app' , 'group' )
