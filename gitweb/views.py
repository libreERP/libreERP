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
import time
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

def getOverview(repo):
    branches = []
    for b in repo.branches:
        branches.append(b.name)
    tags = []
    for t in repo.tags:
        tags.append(t.name)
    return {'branches': branches , 'tags' : tags}

def getCommits(repo , branch , page , limit):
    b = repo.branches[branch]
    c_list = list(repo.iter_commits( b, max_count=limit, skip=int(page)*int(limit)))
    stats = []
    for c in c_list:
        stats.append({'files' :c.stats.files , 'message' : c.message , 'id' : c.__str__() , 'committer' : {'email' : c.committer.email , 'name' : c.committer.__str__()} , 'date' : time.asctime(time.gmtime(c.committed_date))})
    return stats , c_list

def getCommit(repo , sha):
    c = repo.commit(sha)
    return {'files' :c.stats.files , 'message' : c.message , 'id' : c.__str__() , 'committer' : {'email' : c.committer.email , 'name' : c.committer.__str__()} , 'date' : time.asctime(time.gmtime(c.committed_date))}

def getDiff(repo , sha):
    c = repo.commit(sha)
    diffs = []
    for p in c.parents:
        for x in p.diff(c, create_patch=True):
            cont = False
            for ex in ['.svg' , '.jpg' , '.png']:
                if x.a_path.endswith(ex):
                    cont = True
                    break
            if not cont:
                diffs.append({'path' : x.a_path , 'diff' : x.diff})
    return {'summary' : c.summary ,'diffs' : diffs}

def getFileFromCommit(commit , fileName , relPath = ''):
    t = commit.tree
    for p in relPath.split('/'):
        if p != '':
            t = t.__getitem__(p)
    f = t[fileName]
    return {'src' : f.data_stream.read() , 'name' : f.name , 'size' : f.size}

def getFiles(commit , relPath = ''):
    t = commit.tree
    for p in relPath.split('/'):
        if p != '':
            t = t.__getitem__(p)
    files = []
    for b in t.blobs:
        files.append({'name' : b.name , 'size':b.size , 'isDir' : False })
    for tr in t.trees:
        files.append({'name' : tr.name , 'size':tr.size , 'isDir' : True })
    return files

def getRepo(repoName):
    repoName += '.git'
    repoPath = os.path.join(os.path.dirname(globalSettings.BASE_DIR) ,'repositories')
    if '/' in repoName:
        for p in repoName.split('/'):
            repoPath = os.path.join(repoPath, p)
    else:
        repoPath = os.path.join(repoPath, repoName)
    return Repo(repoPath)

class browseRepoApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        if 'mode' in request.GET:
            print 'in Get'
            r = getRepo(repo.objects.get(pk = request.GET['repo']).name)
            mode = request.GET['mode']
            if mode == 'overview':
                content = getOverview(r)
            elif mode == 'commits' and 'branch' in request.GET and 'limit' in request.GET and 'page' in request.GET:
                branch = request.GET['branch']
                page = request.GET['page']
                limit = request.GET['limit']
                content , commits = getCommits(r , branch , page , limit)
            elif mode == 'commit' and 'sha' in request.GET:
                content = getCommit(r , request.GET['sha'])
            elif mode == 'diff' and 'sha' in request.GET:
                content = getDiff(r , request.GET['sha'])
            elif mode == 'folder' and 'sha' in request.GET and 'relPath' in request.GET:
                content = getFiles(r.commit(request.GET['sha']) , request.GET['relPath'])
            elif mode == 'file' and 'sha' in request.GET and 'relPath' in request.GET and 'name' in request.GET:
                content = getFileFromCommit(r.commit(request.GET['sha']) , request.GET['name'] ,request.GET['relPath'])
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            return Response(content , status=status.HTTP_200_OK)
        else:
            content = {'mode' : 'No mode specified'}
            raise NotAcceptable(detail=content )

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
            print '===================================='
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
            print 'Error in git add'
        try:
            local('git commit -m "gitweb"')
        except:
            print 'Error in git commit'
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

def notifyUpdates(instance,sha,type):
    """
        to send the updates to the dash board of git
        pk : pk of the commitNotification ,
        sha : git commit object sha,
        type : commitNotification,
    """
    for sub in getSubscribers(instance.repo):
        print "will update " + sub.username
        requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",
            json={
              'topic': 'service.updates.' + sub.username,
              'args': [{'type' : type ,'sha': sha , 'action' : 'created' , 'pk' : instance.pk , 'repo'  : instance.repo.pk}]
            }
        )

class gitoliteNotificationApi(APIView):
    """
    sample request : /api/git/gitoliteNotification/?data=/home/git/gitolite/src/triggers/notify.py,POST_GIT,libreERP-main,cioc,R,any,git-upload-pack,&key=123
    """
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def get(self , request , format = None):
        if request.GET['key'] != globalSettings.GITOLITE_KEY:
            return Response(status=status.HTTP_403_FORBIDDEN)
        parts = request.GET['data'].split(',')
        accessType = parts[4]
        # print accessType
        utc=pytz.UTC
        repoName = parts[2]
        if accessType == 'W':
            r = repo.objects.get(name = repoName) # DB object
            if r is None:
                return Response(status=status.HTTP_404_NOT_FOUND)
            rpo = getRepo(repoName) # git object
            print rpo
            dtStr = r.lastNotified.strftime('%Y-%m-%d %H:%M:%S')
            print dtStr
            for b in rpo.branches:
                c_list = list(rpo.iter_commits( b , since = dtStr))
                for c in c_list:
                    sha = c.__str__()
                    br = rpo.git.branch('--contains' , sha)
                    t = datetime.datetime(*time.gmtime(c.committed_date)[:6])
                    t = t.replace(tzinfo=utc)
                    print sha , t , c.summary
                    cn , new = commitNotification.objects.get_or_create(sha = sha , repo = r , branch = br , user = User.objects.get(username = parts[3]) , message = c.summary , time = t )
                    if new:
                        notifyUpdates(cn , sha, 'git.commitNotification')
            r.lastNotified = django.utils.timezone.now()
            r.save()
        return Response(status=status.HTTP_200_OK)
class commitNotificationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = commitNotificationSerializer
    queryset = commitNotification.objects.all().order_by('-time')
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id' , 'sha']

class codeCommentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isOwnerOrReadOnly)
    serializer_class = codeCommentSerializer
    queryset = codeComment.objects.all().order_by('created')
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['sha']
