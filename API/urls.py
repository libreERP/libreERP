from django.conf.urls import include, url

urlpatterns = [
    url(r'^HR/', include('HR.urls')),
    url(r'^ERP/', include('ERP.urls')),
    url(r'^social/', include('social.urls')),
    url(r'^mail/', include('mail.urls')),
    url(r'^PIM/', include('PIM.urls')),
    url(r'^ecommerce/', include('ecommerce.urls')),
    url(r'^git/', include('gitweb.urls')),

]
