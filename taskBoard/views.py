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

class taskViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = taskSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title', 'project' , 'user', 'to']
    def get_queryset(self):
        u = self.request.user
        qs1 = task.objects.filter(to = u) # someone assigned to me
        qs2 = task.objects.filter(followers__in = [u,]) # I am one of the followers
        qs3 = task.objects.filter(user = u) # i assigned to sometone
        qs = qs1 | qs2 | qs3
        return qs.order_by('-created').distinct()

class subTaskViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = subTasksSerializer
    queryset = subTask.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class timelineItemViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = timelineItemSerializer
    queryset = timelineItem.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['task', 'category']
