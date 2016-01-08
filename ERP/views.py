from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *


class moduleViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = module.objects.all()
    serializer_class = moduleSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        u = self.request.user
        if u.is_superuser:
            return module.objects.all()
        ma = []
        for m in application.objects.filter(owners__in = [u,]).values('module').distinct():
            ma.append(m['module'])
        aa = []
        for a in u.accessibleApps.all().values('app'):
            aa.append(a['app'])
        for m in application.objects.filter(pk__in = aa).values('module').distinct():
            ma.append(m['module'])
        return module.objects.filter(pk__in = ma)

def getApps(user):
    aa = []
    for a in user.accessibleApps.all().values('app'):
        aa.append(a['app'])
    if user.appsManaging.all().count()>0:
        return application.objects.filter(pk__in = aa) | user.appsManaging.all()
    return application.objects.filter(pk__in = aa)

class applicationViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly,)
    serializer_class = applicationSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name' , 'module']
    def get_queryset(self):
        if not self.request.user.is_superuser:
            return getApps(self.request.user)
        else:
            if 'user' in self.request.GET:
                return getApps(User.objects.get(username = self.request.GET['user']))
            return application.objects.all()

class applicationAdminViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin,)
    serializer_class = applicationAdminSerializer
    # queryset = application.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        if not self.request.user.is_superuser:
            raise PermissionDenied(detail=None)
        return application.objects.all()


class applicationSettingsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, readOnly , )
    queryset = appSettingsField.objects.all()
    serializer_class = applicationSettingsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['app']

class applicationSettingsAdminViewSet(viewsets.ModelViewSet):
    # permission_classes = (isAdmin,)
    queryset = appSettingsField.objects.all()
    serializer_class = applicationSettingsAdminSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['app' , 'name']


class groupPermissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = groupPermission.objects.all()
    serializer_class = groupPermissionSerializer

class permissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = permission.objects.all()
    serializer_class = permissionSerializer
