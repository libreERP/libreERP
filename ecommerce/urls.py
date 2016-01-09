from django.conf.urls import include, url
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'field' , fieldViewSet , base_name = 'field')
router.register(r'genericType' , genericTypeViewSet , base_name = 'genericType')
router.register(r'genericProduct' , genericProductViewSet , base_name = 'genericProduct')
router.register(r'address' , addressViewSet , base_name = 'address')
router.register(r'service' , serviceViewSet , base_name = 'service')
router.register(r'media' , mediaViewSet , base_name = 'media')
router.register(r'listing' , listingViewSet , base_name = 'listing')

urlpatterns = [
    url(r'^', include(router.urls)),
]
