from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
from django.core.mail import send_mail
import hashlib, datetime, random
from django.utils import timezone
from time import time
import requests

# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from HR.models import accountsKey
from rest_framework.decorators import api_view

def ecommerceHome(request):
    return render(request , 'ngEcommerce.html' , {'wampServer' : globalSettings.WAMP_SERVER,})

def serviceRegistration(request): # the landing page for the vendors registration page
    return render(request , 'app.ecommerce.register.service.html')

class locationAutoCompleteApi(APIView): # suggest places for a query
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        query = request.GET['query']
        r = requests.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?types=geocode&language=in&key=AIzaSyDqZoDeSwSbtfkFawD-VoO7nx2WLD3mCgU&input=' + query)
        return Response(r.json(),status = status.HTTP_200_OK)

class locationDetailsApi(APIView): # returns location details such as lattitude and longitude for a given location id
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def get(self , request , format = None):
        id = request.GET['id']
        print id
        r = requests.get('https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyDqZoDeSwSbtfkFawD-VoO7nx2WLD3mCgU&placeid=' + id)
        return Response(r.json(),status = status.HTTP_200_OK)


class supportApi(APIView): # on the support tab of the accounts page , the users have a form with subject and body input , they can use that to send a main to the support team
    def post(self , request , format = None):
        subject = request.data['subject']
        body = request.data['body']
        user = self.request.user

        send_mail(subject, body, 'ciocpky@gmail.com', # support email , it should be something line support@ecommerce.com
        [user.email , 'help@ecommerce.com'], fail_silently=False) # here the email is an array of email address
        return Response(status = status.HTTP_200_OK)


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

            salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
            activation_key = hashlib.sha1(salt+email).hexdigest()
            key_expires = datetime.datetime.today() + datetime.timedelta(2)

            ak = accountsKey(user=user, activation_key=activation_key,
                key_expires=key_expires)
            ak.save()

            # Send email with activation key
            email_subject = 'Account confirmation'
            email_body = "Hey %s, thanks for signing up. To activate your account, click this link within 48hours http://127.0.0.1:8000/token/?key=%s" % (user.first_name, activation_key)

            send_mail(email_subject, email_body, 'pkyisky@gmail.com',
                [email], fail_silently=False)

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
        if 'mode' in self.request.GET:
            u = self.request.user
            if self.request.GET['mode'] == 'provider':
                return order.objects.filter(item__in = u.ecommerceListings.all())
            elif self.request.GET['mode'] == 'consumer':
                return u.ecommerceOrders.all()
        else:
            content = {'mode' : 'You mode specified , please specified either of mode = provider or consumer'}
            raise PermissionDenied(detail=content)


class savedViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = savedSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id']
    def get_queryset(self):
        u = self.request.user
        return saved.objects.filter(user = u)

class customerProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = customerProfileSerializer
    def get_queryset(self):
        u = self.request.user
        return customerProfile.objects.filter(user = u)
