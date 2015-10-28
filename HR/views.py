from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.template import RequestContext

from .forms import loginForm

def Login(request):
    if request.user.is_authenticated():
        return redirect(reverse('HR:home'))
    if request.method == 'POST':
    	username = request.POST['username']
    	password = request.POST['password']
    	user = authenticate(username = username , password = password)
        print user
    	if user is not None:
    	    login(request , user)
    	    if request.GET:
    		    return redirect(request.GET['next'])
    	    else:
    		    return redirect('index')
    return render(request , 'login.html' , {})

def Logout(request):
    logout(request)
    return redirect('index')
