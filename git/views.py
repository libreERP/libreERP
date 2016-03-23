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
        f = open( os.path.join(globalSettings.BASE_DIR  , 'git' ,'conf.conf') , 'w')
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
        f.write(rStr)
        f.close()
        # print rStr
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
