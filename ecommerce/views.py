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

def ecommerceHome(request):
    return render(request , 'ngEcommerce.html' , {'wampServer' : globalSettings.WAMP_SERVER,})

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
