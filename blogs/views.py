from rest_framework import viewsets , permissions , serializers
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
from django.contrib import messages
from django.contrib.auth import authenticate
from API.permissions import *
from PIM.models import *
from HR.models import profile

def blogs(request):
    print 'home'
    recents = blogPost.objects.all().order_by('-created')[:5]
    print recents
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.home.html', {'totalContribution' : totalContribution , 'recents' : recents})

def donateView(request):
    print 'donate'
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.donate.html', {'totalContribution' : totalContribution})

def savedView(request):
    print 'saved'
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.saved.html', {'totalContribution' : totalContribution})


def accountsView(request):
    usrProfile = profile.objects.get(user = request.user)
    if request.method == 'POST':
        if request.GET['page'] == 'profile' :
            if 'dp' in request.FILES:
                dp = request.FILES['dp']
                usrProfile.displayPicture = dp
            if 'email' in request.POST:
                eml = request.POST['email']
                usrProfile.email = eml
            usrProfile.save()
            messages.success(request, "Profile updated successfully!")
        elif request.GET['page'] == 'password':
            p = request.POST['oldpassword']
            p1 = request.POST['password1']
            p2 = request.POST['password2']
            if p1 != p2:
                messages.error(request, "New password and confirm password does not match!")
            if len(p) == 0:
                messages.error(request, "Please provide the current password!")
            user = request.user
            if p1 == p2 and authenticate(username = user.username , password = p) is not None:
                user.set_password(p1)
                user.save()
                messages.success(request, "Password updated successfully!")
    if 'page' in request.GET:
        tab = request.GET['page']
        if tab == 'profile':
            profileTab = True
            passwordTab = False
        else:
            profileTab = False
            passwordTab = True
    else:
        passwordTab = False
        profileTab = False
    if request.user.is_anonymous():
        totalContribution = 0
        contributedArticles = []
    else:
        contributedArticles = request.user.articles.all()
        totalContribution = contributedArticles.count()

    if profile.objects.get(user = request.user).displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = usrProfile.displayPicture.url
    # messages.error(request, "Huge success!")
    # messages.info(request, "Huge success!")
    ctx = {'totalContribution' : totalContribution ,
        'contributedArticles' : contributedArticles,
        'DPSrc' : DPSrc,
        'email' : usrProfile.email,
        'profileTab' : profileTab,
        'passwordTab' : passwordTab}
    return render(request , 'blogs.accounts.html', ctx)

def searchView(request):
    key = request.POST['key']
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()

    blogs = blogPost.objects.filter(title__contains=key)

    return render(request , 'blogs.search.html', {'totalContribution' : totalContribution , 'results' : blogs})

def browseView(request):
    print 'home'
    categories = blogCategory.objects.all()
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.browse.html', {'totalContribution' : totalContribution , 'categories' : categories})

def pagesView(request , page):
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.'+page+'.html', {'totalContribution' : totalContribution})

def categoryView(request , category):
    print 'cat' , category
    blogs = blogCategory.objects.get(title = category).articles.all()
    print blogs
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    print totalContribution
    return render(request , 'blogs.list.html', {'blogs' : blogs , 'totalContribution' : totalContribution})

def articleView(request , title):
    print 'article' , title
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    blog = blogPost.objects.get(title=title)
    return render(request , 'blogs.article.view.html', {'blog' : blog, 'totalContribution' : totalContribution })
