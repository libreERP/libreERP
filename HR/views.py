from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect , get_object_or_404
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from ERP.models import application, permission , module
from ERP.views import getApps, getModules
from django.db.models import Q

def tokenAuthentication(request):
    ak = get_object_or_404(accountsKey, activation_key=request.GET['key'])
    #check if the activation key has expired, if it hase then render confirm_expired.html
    if ak.key_expires < timezone.now():
        raise SuspiciousOperation('Expired')
    #if the key hasn't expired save user and set him as active and render some template to confirm activation
    user = ak.user
    user.is_active = True
    user.save()
    user.accessibleApps.all().delete()
    for a in ['app.ecommerce' , 'app.ecommerce.orders' , 'app.ecommerce.offerings','app.ecommerce.earnings']:
        app = application.objects.get(name = a)
        p = permission.objects.create(app =  app, user = user , givenBy = User.objects.get(pk=1))
    login(request , user)
    authStatus = {'status' : 'success' , 'message' : 'Account actived, please login.' }
    return render(request , 'login.html' , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN})


def loginView(request):
    authStatus = {'status' : 'default' , 'message' : '' }
    if request.user.is_authenticated():
        if request.GET:
            return redirect(request.GET['next'])
        else:
            return redirect(reverse('ERP'))
    if request.method == 'POST':
    	usernameOrEmail = request.POST['username']
    	password = request.POST['password']
        if '@' in usernameOrEmail and '.' in usernameOrEmail:
            u = User.objects.get(email = usernameOrEmail)
            username = u.username
        else:
            username = usernameOrEmail

        user = authenticate(username = username , password = password)
    	if user is not None:
            if user.is_active:
                login(request , user)
                if request.GET:
                    return redirect(request.GET['next'])
                else:
                    return redirect(reverse('home'))
            else:
                authStatus = {'status' : 'warning' , 'message' : 'Your account is not active.' }
        else:
            authStatus = {'status' : 'danger' , 'message' : 'Incorrect username or password.' }

    return render(request , 'login.html' , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN})

def registerView(request):
    msg = {'status' : 'default' , 'message' : '' }
    if request.method == 'POST':
    	name = request.POST['name']
    	email = request.POST['email']
    	password = request.POST['password']
        if User.objects.filter(email = email).exists():
            msg = {'status' : 'danger' , 'message' : 'Email ID already exists' }
        else:
            user = User.objects.create(username = email.replace('@' , '').replace('.' ,''))
            user.first_name = name
            user.email = email
            user.set_password(password)
            user.save()
            user = authenticate(username = email.replace('@' , '').replace('.' ,'') , password = password)
            login(request , user)
            if request.GET:
                return redirect(request.GET['next'])
            else:
                return redirect(reverse('ecommerce'))
    return render(request , 'register.html' , {'msg' : msg})


def logoutView(request):
    logout(request)
    return redirect('index')

@login_required(login_url = '/login')
def home(request):
    u = request.user
    if u.is_superuser:
        apps = application.objects.all()
        modules = module.objects.filter(~Q(name='public'))
    else:
        apps = getApps(u)
        modules = getModules(u)
    apps = apps.filter(~Q(name__startswith='configure.' )).filter(~Q(name='app.users')).filter(~Q(name__endswith='.public'))
    # print apps , modules
    return render(request , 'ngBase.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'appsWithJs' : apps.filter(haveJs=True) \
    ,'appsWithCss' : apps.filter(haveCss=True) , 'modules' : modules , 'useCDN' : globalSettings.USE_CDN})

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
    permission_classes = (permissions.IsAuthenticated ,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username']
    serializer_class = userSerializer
    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                print self.request.user
                if self.request.user.is_authenticated:
                    return User.objects.filter(username = self.request.user.username)
                else:
                    raise PermissionDenied()
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
    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                print self.request.user
                if self.request.user.is_authenticated:
                    return User.objects.filter(username = self.request.user.username)
                else:
                    raise PermissionDenied()
            else :
                return User.objects.all().order_by('-date_joined')
        else:
            return User.objects.all().order_by('-date_joined')

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Group.objects.all()
    serializer_class = groupSerializer

class rankViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = rank.objects.all()
    serializer_class = rankSerializer
