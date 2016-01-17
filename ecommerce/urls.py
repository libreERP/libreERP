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
router.register(r'order' , orderViewSet , base_name = 'order')
router.register(r'saved' , savedViewSet , base_name = 'saved')
router.register(r'profile' , customerProfileViewSet , base_name = 'customerProfile')
router.register(r'choiceLabel' , choiceLabelViewSet , base_name = 'choiceLabel')
router.register(r'choiceOption' , choiceOptionViewSet , base_name = 'choiceOption')
router.register(r'offering' , offeringViewSet , base_name = 'offering')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'providerRegistration/$' , serviceRegistrationApi.as_view() ),
    url(r'support/$' , supportApi.as_view() ),
    url(r'suggestLocations/$' , locationAutoCompleteApi.as_view() ),
    url(r'locationDetails/$' , locationDetailsApi.as_view() ),
    url(r'offeringAvailability/$' , offeringAvailabilityApi.as_view() ),
]
