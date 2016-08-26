from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *

class processViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = processSerializer
    queryset = process.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class processFileVersionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = processFileVersionSerializer
    queryset = processFileVersion.objects.all()

class processRunLogViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = processRunLogSerializer
    queryset = processRunLog.objects.all()

class logParameterViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = logParameterSerializers
    queryset = logParameter.objects.all()
