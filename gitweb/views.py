from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template.loader import render_to_string, get_template
from django.template import RequestContext , Context
from django.conf import settings as globalSettings
from django.core.mail import send_mail , EmailMessage
from django.core import serializers
from django.http import HttpResponse ,StreamingHttpResponse
from django.utils import timezone
from django.db.models import Min , Sum , Avg
import mimetypes
import hashlib, datetime, random
from datetime import timedelta , date
from monthdelta import monthdelta
from time import time
import pytz
import math
import json
import shutil
from StringIO import StringIO
import math
import requests
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from fabric.api import *
# from .helper import *
from API.permissions import *
from HR.models import accountsKey

from django.core import serializers
from django.http import JsonResponse

import os
import platform
from git import Repo

def getFileList(repoName , relPath , pull):
    fullPath = os.path.join(os.path.dirname(globalSettings.BASE_DIR), repoName)
    if pull:
        with lcd(fullPath):
            local('git pull')
    for p in relPath.split('/'):
        fullPath = os.path.join(fullPath , p)
    if not os.path.isdir(fullPath):
        with lcd(os.path.dirname(globalSettings.BASE_DIR)):
            if '@' in globalSettings.GIT_SERVER:
                local('git clone %s' %(globalSettings.GIT_SERVER + ':' + repoName))
            else:
                local('git clone %s' %(globalSettings.GIT_SERVER + repoName))

        # Repo.clone_from('http://github.com/pkyad/libreERP-cli' , os.path.dirname(globalSettings.BASE_DIR) )
    files = []
    for f in os.listdir(fullPath):
        fPath = os.path.join(fullPath , f)
        fo = {'isDir' : os.path.isdir(fPath) , 'size' : os.path.getsize(fPath) , 'name' : f}
        files.append(fo)
    return files

def getDiff(repoName , head = 0 , sha = ''):
    fullPath = os.path.join(os.path.dirname(globalSettings.BASE_DIR), repoName)
    repo = Repo(fullPath)
    if sha !='':
        return repo.git.diff(sha)
    else:
        return repo.git.diff('HEAD~%s' %(head))

def getLog(repoName , pageSize = 10 , page = 1):
    fullPath = os.path.join(os.path.dirname(globalSettings.BASE_DIR), repoName)
    repo = Repo(fullPath)
    c_list = list(repo.iter_commits( max_count=pageSize, skip=int(page)*int(pageSize)))
    stats = []
    for c in c_list:
        stats.append({'files' :c.stats.files , 'message' : c.message , 'id' : c.__str__() , 'committer' : {'email' : c.committer.email , 'name' : c.committer.__str__()} , 'date' : c.committed_date})
    return stats

class logApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        u = self.request.user
        has_application_permission(u , ['app.GIT' , 'app.GIT.repos'])
        r = repo.objects.get(pk = request.GET['repo'])
        if 'page' in request.GET and 'pageSize' in request.GET:
            content = getLog(r.name , request.GET['pageSize'] , request.GET['page'] )
        else:
            content = getLog(r.name )
        return Response({ 'content' : content} , status=status.HTTP_200_OK)


class diffApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        u = self.request.user
        has_application_permission(u , ['app.GIT' , 'app.GIT.repos'])
        r = repo.objects.get(pk = request.GET['repo'])
        if 'head' in request.GET:
            content = getDiff(r.name , request.GET['head'])
        elif 'sha' in request.GET:
            content = getDiff(r.name , 0 , request.GET['sha'])
        else:
            content = getDiff(r.name )
        return Response({ 'content' : content} , status=status.HTTP_200_OK)


def readFile(repoName , relPath):
    fullPath = os.path.join(os.path.dirname(globalSettings.BASE_DIR), repoName)
    for p in relPath.split('/'):
        fullPath = os.path.join(fullPath , p)
    f = open(fullPath , 'r')
    return os.path.getsize(fullPath) , f.read()



class fileExplorerApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        u = self.request.user
        has_application_permission(u , ['app.GIT' , 'app.GIT.repos'])
        r = repo.objects.get(pk = request.GET['repo'])
        relPath = request.GET['relPath']
        if request.GET['mode'] == 'folder':
            content = getFileList(r.name , relPath , request.GET['pull']=='true')
            return Response({'files' :content} , status=status.HTTP_200_OK)
        elif request.GET['mode'] == 'file':
            size , content = readFile(r.name , relPath)
            return Response({'size' :size , 'content' : content} , status=status.HTTP_200_OK)

def getPermStr(p):
    pStr = ''
    if p.canRead:
        pStr += 'R'
    if p.canWrite:
        pStr += 'W'
    if p.canDelete:
        pStr += '+'
    return pStr

def generateGitoliteConf():
    gitoliteDir = os.path.join(os.path.dirname(globalSettings.BASE_DIR) , 'gitolite-admin')
    if not os.path.isdir(gitoliteDir):
        with lcd(os.path.dirname(globalSettings.BASE_DIR)):
            local('git clone git@localhost:gitolite-admin')
    f = open( os.path.join( gitoliteDir , 'conf' ,'gitolite.conf') , 'w')

    for g in gitGroup.objects.all():
        gStr = '@' + g.name + ' ='
        for u in g.users.all():
            gStr += ' ' + u.username
        # print gStr
        f.write('%s\n' %(gStr))
    rStr = '@administrators =  admin cioc\n'
    for r in repo.objects.all():
        rStr += 'repo %s\n' %(r.name)
        for p in r.perms.all():
            rStr += '\t\t%s\t\t=\t\t%s\n' %( getPermStr(p) , p.user.username)
        for g in r.groups.all():
            rStr += '\t\t%s\t\t=\t\t%s\n' %( getPermStr(g) , '@' + g.group.name)
        # print rStr
    rStr += 'repo CREATOR/[a-z].*\n'
    rStr += '\t\t%s\t\t=\t\t%s\n' %('RW+' , 'CREATOR')
    rStr += '\t\t%s\t\t=\t\t%s\n' %('C' , '@all')
    rStr += 'repo @all\n'
    rStr += '\t\t%s\t\t=\t\t%s\n' %('RW+' , '@administrators')
    rStr += 'repo gitolite-admin\n'
    rStr += '\t\t%s\t\t=\t\t%s\n' %('RW+' , '@administrators')
    rStr += 'repo testing\n'
    rStr += '\t\t%s\t\t=\t\t%s\n' %('RW+' , '@all')
    f.write(rStr)
    f.close()
    keyDir = os.path.join(gitoliteDir , 'keydir')
    shutil.rmtree(keyDir)
    os.mkdir(keyDir)
    shutil.copyfile(os.path.join(os.path.dirname(globalSettings.BASE_DIR) , 'admin.pub'), os.path.join(keyDir , 'admin.pub'))
    for p in profile.objects.all():
        idx = 0
        for d in p.devices.all():
            print 'writing for ' , d.name
            print d.sshKey
            print '========================'
            if not os.path.isdir(os.path.join( keyDir ,str(idx))):
                os.mkdir(os.path.join( keyDir ,str(idx)))
            f = open(os.path.join( keyDir ,str(idx), p.user.username + '.pub') , 'w')
            f.write(d.sshKey)
            idx +=1
            f.close()
    with lcd(gitoliteDir):
        # local('dir')
        # print "passed : " , gitoliteDir
        try:
            local('git add -A ./')
        except:
            pass
        try:
            local('git commit -m "%s"' %(request.user.username))
        except:
            pass
        local('git push')

class syncGitoliteApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        u = self.request.user
        has_application_permission(u , ['app.GIT' , 'app.GIT.manage'])
        generateGitoliteConf()
        return Response(status=status.HTTP_200_OK)

class registerDeviceApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        if 'username' in request.data and 'password' in request.data and 'sshKey' in request.data:
            sshKey = request.data['sshKey']
            deviceName =sshKey.split()[2]
            mode = request.data['mode']
            print sshKey
            # print mode
            user = authenticate(username =  request.data['username'] , password = request.data['password'])
            if user is not None:
                if user.is_active:
                    d , n = device.objects.get_or_create(name = deviceName , sshKey = sshKey)
                    gp , n = profile.objects.get_or_create(user = user)
                    if mode == 'logout':
                        print "deleted"
                        gp.devices.remove(d)
                        d.delete()
                        generateGitoliteConf()
                        return Response(status=status.HTTP_200_OK)
                    gp.devices.add(d)
                    gp.save()
                    # print gp
                    generateGitoliteConf()
            else:
                raise NotAuthenticated(detail=None)

        else:
            raise ValidationError(detail={'PARAMS' : 'No data provided'} )
        return Response(status=status.HTTP_200_OK)


class gitGroupViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = gitGroupSerializer
    queryset = gitGroup.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class repoPermissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = repoPermissionSerializer
    queryset = repoPermission.objects.all()

class groupPermissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = groupPermissionSerializer
    queryset = groupPermission.objects.all()

class repoViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = repoSerializer
    queryset = repo.objects.all()


class deviceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = deviceSerializer
    queryset = device.objects.all()

class profileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = profileSerializer
    queryset = profile.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id']
