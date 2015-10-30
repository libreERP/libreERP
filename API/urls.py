from django.conf.urls import include, url

urlpatterns = [
    url(r'^HR/', include('HR.urls')),
]
