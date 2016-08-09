from rest_framework import viewsets , permissions , serializers
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
from django.contrib import messages
from django.contrib.auth import authenticate
from API.permissions import *
from PIM.models import *
from HR.models import profile
from django.contrib.auth.decorators import login_required
from .models import *
from ERP.models import appSettingsField , application
from django.conf import settings as globalSettings

def getSettings():
    sts = appSettingsField.objects.filter(app = application.objects.get(name = 'app.blogs.public'))
    toReturn = {}
    for s in sts:
        if s.fieldType == 'flag':
            toReturn[s.name] = s.flag
        else:
            toReturn[s.name] = s.value
    return toReturn

def blogs(request):
    sts = getSettings()
    user = request.user
    recents = blogPost.objects.all().order_by('-created')[:5]
    if user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = user.articles.all().count()
    if user.is_anonymous() or user.profile.displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url
    ctx = {'totalContribution' : totalContribution , 'recents' : recents,'DPSrc':DPSrc, 'USE_CDN' : globalSettings.USE_CDN }
    return render(request , 'blogs.home.html', dict(sts.items() + ctx.items()))

@login_required(login_url = globalSettings.LOGIN_URL)
def donateView(request):
    sts = getSettings()
    user = request.user
    if user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = user.articles.all().count()
    if user.is_anonymous() or user.profile.displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url
    ctx = {'totalContribution' : totalContribution,'DPSrc':DPSrc,'USE_CDN' : globalSettings.USE_CDN}
    return render(request , 'blogs.donate.html', dict(sts.items() + ctx.items()))

def savedView(request):
    sts = getSettings()
    user = request.user
    if user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = user.articles.all().count()
    bookmarks = user.blogsBookmarked.all()
    if user.is_anonymous() or user.profile.displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url
    ctx = {'totalContribution' : totalContribution , 'bookmarks':bookmarks,'DPSrc':DPSrc, 'USE_CDN' : globalSettings.USE_CDN}
    return render(request , 'blogs.saved.html', dict(sts.items() + ctx.items()))

@login_required(login_url = globalSettings.LOGIN_URL)
def accountsView(request):
    sts = getSettings()
    user = request.user
    usrProfile = user.profile
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
            if len(p1) == 0:
                messages.error(request, "New password can not be left blank!")
            if p1 == p2 and len(p1)!=0 and authenticate(username = user.username , password = p) is not None:
                user.set_password(p1)
                user.save()
                messages.success(request, "Password updated successfully!")
            else:
                if len(p) != 0:
                    messages.error(request, "Current password is not correct!")

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
    if user.is_anonymous():
        totalContribution = 0
        contributedArticles = []
    else:
        contributedArticles = user.articles.all()
        totalContribution = contributedArticles.count()

    if user.is_anonymous() or profile.objects.get(user = user).displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url

    if user.username == user.email + str(user.pk):
        showPasswordTab = False
    else:
        showPasswordTab = True
    contributed = False
    if totalContribution>0:
        contributed = True
    ctx = {'totalContribution' : totalContribution ,
        'contributedArticles' : contributedArticles,
        'DPSrc' : DPSrc,
        'email' : user.profile.email,
        'profileTab' : profileTab,
        'passwordTab' : passwordTab,
        'showPasswordTab' : showPasswordTab,
        'DPSrc':DPSrc,
        'contributed' : contributed,
        'USE_CDN' : globalSettings.USE_CDN}
    return render(request , 'blogs.accounts.html', dict(sts.items() + ctx.items()))

def searchView(request):
    sts = getSettings()
    key = request.POST['key']
    user = request.user
    if user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = user.articles.all().count()

    blogs = blogPost.objects.filter(title__contains=key)
    if user.is_anonymous() or profile.objects.get(user = user).displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url
    ctx = {'totalContribution' : totalContribution , 'results' : blogs , 'key' : key,'DPSrc':DPSrc,'USE_CDN' : globalSettings.USE_CDN}
    return render(request , 'blogs.search.html',  dict(sts.items() + ctx.items()))

def browseView(request):
    sts = getSettings()
    categories = blogCategory.objects.all()
    user = request.user
    if user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = user.articles.all().count()
    if user.is_anonymous() or profile.objects.get(user = user).displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url
    ctx = {'totalContribution' : totalContribution , 'categories' : categories,'DPSrc':DPSrc,'USE_CDN' : globalSettings.USE_CDN}
    return render(request , 'blogs.browse.html', dict(sts.items() + ctx.items()))

def pagesView(request , page):
    sts = getSettings()
    user = request.user
    if user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = user.articles.all().count()
    if request.user.is_anonymous() or user.profile.displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url
    ctx = {'totalContribution' : totalContribution,'DPSrc':DPSrc,'USE_CDN' : globalSettings.USE_CDN}
    return render(request , 'blogs.'+page+'.html', dict(sts.items() + ctx.items()))

def categoryView(request , category):
    sts = getSettings()
    blogs = blogCategory.objects.get(title = category).articles.all()
    user = request.user
    if user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = user.articles.all().count()
    if user.is_anonymous() or user.profile.displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url
    ctx = {'blogs' : blogs , 'totalContribution' : totalContribution,'DPSrc':DPSrc,'USE_CDN' : globalSettings.USE_CDN}
    return render(request , 'blogs.list.html', dict(sts.items() + ctx.items()))

# @login_required(login_url = globalSettings.LOGIN_URL)
def articleView(request , title):
    sts = getSettings()
    blog = blogPost.objects.filter(title=title)[0]
    user = request.user
    if user.is_anonymous():
        totalContribution = 0
    else:
        if 'action' in request.GET:
            act = request.GET['action']
            if act == 'save':
                bb , new = blogBookmark.objects.get_or_create(user = user , blog = blog)
                bb.save()
            elif act == 'removeSave':
                bb = blogBookmark.objects.get(user = user , blog = blog)
                bb.delete()
            elif act == 'removeLike':
                bl = blogLike.objects.get(user = user , parent = blog)
                bl.delete()
            elif act == 'like':
                bl , new = blogLike.objects.get_or_create(user = user , parent = blog)
                bl.save()
            elif act == 'comment' and 'textarea' in request.POST:
                txt = request.POST['textarea']
                c = blogComment(user = user , parent = blog , text = txt)
                c.save()
        totalContribution = user.articles.all().count()
    if not user.is_anonymous() and blogBookmark.objects.filter(user = user , blog = blog).count() >0:
        saved = True
    else:
        saved = False
    likesCount = blogLike.objects.filter(parent = blog).count()
    if not user.is_anonymous() and blogLike.objects.filter(user = user , parent = blog).count() >0:
        liked = True
    else:
        liked = False
    comments = []
    for c in blogComment.objects.filter(parent = blog):
        dp = c.user.profile.displayPicture
        if dp == '':
            dp = '/static/images/userIcon.png'
        else:
            dp = dp.url
        comments.append({
            'name' : c.user.get_full_name(),
            'image' : dp,
            'text' : c.text
        })
    if user.is_anonymous() or user.profile.displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = user.profile.displayPicture.url
    if globalSettings.LOGIN_URL == 'login':
        login_url = 'login'
    else:
        login_url = 'accounts/login/'
    u = blog.users.all()[0]
    ctx = {'blog' : blog,
        'author' : u,
        'totalContribution' : totalContribution,
        'saved': saved,
        'liked' : liked,
        'likesCount':likesCount,
        'comments' : comments,
        'DPSrc':DPSrc,
        'USE_CDN' : globalSettings.USE_CDN,
        'login_url' : login_url}
    return render(request , 'blogs.article.view.html', dict(sts.items() + ctx.items()) )
