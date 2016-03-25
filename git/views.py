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

from StringIO import StringIO
import math
import requests
# related to the invoice generator
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Table, TableStyle, Image
from PIL import Image
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

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

def getPermStr(p):
    pStr = ''
    if p.canRead:
        pStr += 'R'
    if p.canWrite:
        pStr += 'W'
    if p.canDelete:
        pStr += '+'
    return pStr

class syncGitoliteApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        gitoliteDir = os.path.join(os.path.dirname(globalSettings.BASE_DIR) , 'gitolite-admin')
        f = open( os.path.join( gitoliteDir , 'conf' ,'gitolite.conf') , 'w')
        for g in gitGroup.objects.all():
            gStr = '@' + g.name
            for u in g.users.all():
                gStr += ' ' + u.username
            # print gStr
            f.write('%s\n' %(gStr))
        for r in repo.objects.all():
            rStr = 'repo %s\n' %(r.name)
            for p in r.perms.all():
                rStr += '\t\t%s\t\t=\t\t%s\n' %( getPermStr(p) , p.user.username)
            for g in r.groups.all():
                rStr += '\t\t%s\t\t=\t\t%s\n' %( getPermStr(g) , '@' + g.group.name)
            # print rStr
        rStr += 'repo CREATOR/[a-z].*\n'
        rStr += '\t\t%s\t\t=\t\t%s\n' %('RW+' , 'CREATOR')
        rStr += 'repo gitolite-admin\n'
        rStr += '\t\t%s\t\t=\t\t%s\n' %('RW+' , 'admin')
        rStr += 'repo testing\n'
        rStr += '\t\t%s\t\t=\t\t%s\n' %('RW+' , '@all')
        f.write(rStr)
        f.close()
        keyDir = os.path.join(gitoliteDir , 'keydir')
        for p in profile.objects.all():
            for d in p.devices.all():
                f = open(os.path.join( keyDir , p.user.username + '.pub') , 'w')
                f.write(d.sshKey)
                f.close()
        with lcd(gitoliteDir):
            local('git add *')
            try:
                local('git commit -m "%s"' %(request.user.username))
            except:
                pass
            local('git push')
        return Response(status=status.HTTP_200_OK)

class registerDeviceApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        if 'username' in request.data and 'password' in request.data and 'sshKey' in request.data:
            sshKey = request.data['sshKey']
            deviceName =sshKey.split()[2]
            mode = request.data['mode']
            # print mode
            user = authenticate(username =  request.data['username'] , password = request.data['password'])
            if user is not None:
                if user.is_active:
                    d , n = device.objects.get_or_create(name = deviceName)
                    print sshKey
                    print d
                    if mode == 'logout':
                        d.delete()
                        return Response(status=status.HTTP_200_OK)
                    d.sshKey = sshKey
                    d.save()
                    gp , n = profile.objects.get_or_create(user = user)
                    gp.devices.add(d)
                    gp.save()
                    # print gp
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
