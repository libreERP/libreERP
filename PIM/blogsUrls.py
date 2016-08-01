from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from views import *

urlpatterns = [
    url(r'^$', blogs , name="blogsHome"),
    url(r'^pages/(?P<page>\w+)/$', pagesView , name='pageView'),
    url(r'^browse$', browseView , name='browseView'),
    url(r'^browse/(?P<category>[-%&+0-9a-zA-Z ]+)/$', categoryView , name='blogsCategoryView'),
    url(r'^browse/(?P<category>[-%&+0-9a-zA-Z ]+)/(?P<title>[-%&+0-9a-zA-Z ]+)/$', articleView , name = 'blogsArticleView'),
    url(r'^accounts/$', accountsView , name = 'blogsAccountsView'),
    url(r'^search/$', searchView , name = 'blogsSearchView'),
]
