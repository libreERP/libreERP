from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
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
        if 'responsible' not in self.request.GET and 'assignee' not in self.request.GET and 'follower' not in self.request.GET:
            qs1 = task.objects.filter(user = u) # i assigned to sometone
            qs2 = task.objects.filter(to = u) # someone assigned to me
            qs3 = task.objects.filter(followers__in = [u,]) # I am one of the followers
            qs = qs1 | qs2 | qs3
        if 'responsible' in self.request.GET and self.request.GET['responsible'] == '1':
            qs = task.objects.filter(to = u) # someone assigned to me
        if 'assignee' in self.request.GET and self.request.GET['assignee'] == '1':
            try:
                qs = qs | task.objects.filter(user = u) # i assigned to sometone
            except:
                qs = task.objects.filter(user = u) # i assigned to sometone
        if 'follower' in self.request.GET and self.request.GET['follower'] == '1':
            try:
                qs = qs | task.objects.filter(followers__in = [u,]) # I am one of the followers
            except:
                qs = task.objects.filter(followers__in = [u,]) # I am one of the followers
        if 'orderBy' in self.request.GET:
            ordr = self.request.GET['orderBy'].split(':')
            if ordr[1] == 'true':
                ordrStr = '-'
            else:
                ordrStr = ''
            ordrStr += ordr[0]
            return qs.order_by(ordrStr).distinct()
        else:
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
