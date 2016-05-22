from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
# Create your views here.


class mediaViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = mediaSerializer
    queryset = media.objects.all()

class projectCommentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = projectCommentSerializer
    queryset = projectComment.objects.all()

class projectViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = projectSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']
    def get_queryset(self):
        u = self.request.user
        if u.is_superuser:
            return project.objects.all()
        else:
            return u.projectsInitiated.all() | u.projectsInvolvedIn.all()

class projectLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, permissions.DjangoModelPermissionsOrAnonReadOnly)
    serializer_class = projectLiteSerializer
    queryset = project.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class timelineItemViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = timelineItemSerializer
    queryset = timelineItem.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['project', 'category']
