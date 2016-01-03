from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *

def loginView(request):
    authStatus = {'status' : 'default' , 'message' : '' }
    if request.user.is_authenticated():
        return redirect(reverse('ERP'))
    if request.method == 'POST':
    	username = request.POST['username']
    	password = request.POST['password']
    	user = authenticate(username = username , password = password)

    	if user is not None:
            if user.is_active:
                login(request , user)
                if request.GET:
                    return redirect(request.GET['next'])
                else:
                    return redirect(reverse('ERP'))
            else:
                authStatus = {'status' : 'warning' , 'message' : 'Your account is not active.' }
        else:
            authStatus = {'status' : 'danger' , 'message' : 'Incorrect username or password.' }
    return render(request , 'login.html' , {'authStatus' : authStatus})

def logoutView(request):
    logout(request)
    return redirect('index')

@login_required(login_url = '/login')
def home(request):

    return render(request , 'ngBase.html' , {'wampServer' : globalSettings.WAMP_SERVER,})

class userProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = userProfileSerializer
    queryset = profile.objects.all()

class userProfileAdminModeViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    serializer_class = userProfileAdminModeSerializer
    queryset = profile.objects.all()

class userDesignationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,isAdminOrReadOnly ,)
    queryset = designation.objects.all()
    serializer_class = userDesignationSerializer

class userAdminViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    queryset = User.objects.all()
    serializer_class = userAdminSerializer

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , readOnly,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username']
    serializer_class = userSerializer
    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                return User.objects.filter(username = self.request.user.username)
            else :
                return User.objects.all().order_by('-date_joined')
        else:
            return User.objects.all().order_by('-date_joined')

class UserSearchViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username']
    serializer_class = userSearchSerializer
    queryset = User.objects.all()

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Group.objects.all()
    serializer_class = groupSerializer
