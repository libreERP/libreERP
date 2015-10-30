from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext

# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *

from .forms import loginForm

def Login(request):
    if request.user.is_authenticated():
        return redirect(reverse('ERP'))
    if request.method == 'POST':
    	username = request.POST['username']
    	password = request.POST['password']
    	user = authenticate(username = username , password = password)
        print user
    	if user is not None:
    	    login(request , user)
    	    if request.GET:
    		    return redirect(request.GET['next'])
    	    else:
    		    return redirect(reverse('ERP'))
    return render(request , 'login.html' , {})

def Logout(request):
    logout(request)
    return redirect('index')

@login_required(login_url = '/login')
def home(request):
    return render(request , 'ngBase.html' , {})

class userProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    serializer_class = userProfileSerializer
    queryset = userProfile.objects.all()

class userDesignationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = userDesignation.objects.all()
    serializer_class = userDesignationSerializer


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    # queryset = User.objects.all().order_by('-date_joined')
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

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = Group.objects.all()
    serializer_class = groupSerializer
