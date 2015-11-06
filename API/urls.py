from django.conf.urls import include, url

urlpatterns = [
    url(r'^HR/', include('HR.urls')),
    url(r'^social/', include('social.urls')),
    url(r'^PIM/', include('PIM.urls')),
]
