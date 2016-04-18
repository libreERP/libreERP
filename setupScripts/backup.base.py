import os
from fabric.api import *

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

tablesToBackup = ['ERP.application',
    'ERP.module',
    'ERP.appSettingsField',
    'auth.User',
    'gitolite.repoPermission',
    'gitolite.gitGroup',
    'gitolite.groupPermission',
    'gitolite.device',
    'gitolite.profile',
    'gitolite.repo',
    'gitolite.commitNotification',
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
