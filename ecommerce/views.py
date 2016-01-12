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
from rest_framework.response import Response
from rest_framework.views import APIView
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from rest_framework.decorators import api_view

def ecommerceHome(request):
    return render(request , 'ngEcommerce.html' , {'wampServer' : globalSettings.WAMP_SERVER,})

def serviceRegistration(request): # the landing page for the vendors registration page
    return render(request , 'app.ecommerce.register.service.html')

class serviceRegistrationApi(APIView):
    permission_classes = (permissions.AllowAny ,)

    def post(self, request, format=None):
        first_name = request.data['first_name']
        last_name = request.data['last_name']
        email = request.data['email']
        password = request.data['password']

        # serviceForm1 data
        name = request.data['name'] # company's name
        cin = request.data['cin']
        tin = request.data['tin']
        mobile = request.data['mobile']
        telephone = request.data['telephone']

        # serviceForm2 data
        street = request.data['street']
        pincode = request.data['pincode']
        city = request.data['city']
        state = request.data['state']
        about = request.data['about']

        if User.objects.filter(email = email).exists():
            content = { 'email' : 'Email ID already exists' }
            return Response(content, status=status.HTTP_400_BAD_REQUEST)
        else:
            user = User.objects.create(username = email.replace('@' , '').replace('.' ,''))
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.set_password(password)
            user.is_active = False
            user.save()
            ad = address(street = street , city = city , state = state , pincode = pincode )
            ad.save()
            se = service(name = name , user = user , cin = cin , tin = tin , address = ad , mobile = mobile, telephone = telephone , about = about)
            se.save()
            content = {'pk' : user.pk , 'username' : user.username , 'email' : user.email}
            return Response(content , status = status.HTTP_200_OK)

class fieldViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    queryset = field.objects.all()
    serializer_class = fieldSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class genericTypeViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin, )
    queryset = genericType.objects.all()
    serializer_class = genericTypeSerializer

class genericProductViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    queryset = genericProduct.objects.all()
    serializer_class = genericProductSerializer

class addressViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    queryset = address.objects.all()
    serializer_class = addressSerializer

class serviceViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    queryset = service.objects.all()
    serializer_class = serviceSerializer

class mediaViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    queryset = media.objects.all()
    serializer_class = mediaSerializer

class listingViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    queryset = listing.objects.all()
    serializer_class = listingSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['description']

class orderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = orderSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id']
    def get_queryset(self):
        u = self.request.user
        return order.objects.filter(item__in = u.ecommerceListings.all())

class savedViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = savedSerializer
    def get_queryset(self):
        u = self.request.user
        return saved.objects.filter(user = u)
