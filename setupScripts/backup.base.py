import os
from fabric.api import *

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
]

mode = 0 # 0 for backup and 1 for load

if mode==0:
    with lcd(BASE_DIR):
        for t in tablesToBackup:
            local('python manage.py dumpdata %s > ./setupScripts/baseDB/%s.json' %(t, t))
elif mode==1:
    with lcd(BASE_DIR):
        for t in tablesToBackup:
            local('python manage.py loaddata ./setupScripts/baseDB/%s.json' %(t))
print BASE_DIR
