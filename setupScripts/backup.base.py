import os
from fabric.api import *
import sys


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

tablesToBackup = ['ERP.module',
    'ERP.application',
    'ERP.appSettingsField',
    'auth.User',
    'gitweb.repo',
    'gitweb.repoPermission',
    'gitweb.gitGroup',
    'gitweb.groupPermission',
    'gitweb.device',
    'gitweb.profile',
    'gitweb.commitNotification',
    'allauth.socialaccount.socialapp.sites',
]

print sys.argv
mode = sys.argv[1] # 0 for backup and 1 for load

if mode=='backup':
    with lcd(BASE_DIR):
        for t in tablesToBackup:
            local('python manage.py dumpdata %s > ./setupScripts/baseDB/%s.json' %(t, t))
elif mode=='load':
    with lcd(BASE_DIR):
        for t in tablesToBackup:
            local('python manage.py loaddata ./setupScripts/baseDB/%s.json' %(t))
print BASE_DIR
