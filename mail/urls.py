from django.conf.urls import include, url
from .views import *
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns

router = routers.DefaultRouter()

router.register(r'attachment' , mailAttachmentViewSet , base_name = "mailattachment" )
router.register(r'account' , proxyAccountViewSet , base_name = "proxyAccount" )

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'mailbox/$' , mailBoxView ),
    url(r'folders/$' , foldersDetailsView ),
    url(r'email/$' , emailView ), # for modifying flags of the mails ,
    url(r'send/$' , sendMailView ),
    url(r'mailAttachment/$' , mailAttachmentView ),
]

# urlpatterns = format_suffix_patterns(urlpatterns)
