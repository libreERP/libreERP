import os
from fabric.api import *

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

tablesToBackup = ['ERP.application', 'ERP.module' , 'ERP.appSettingsField', 'auth.User']

mode = 0 # 0 for backup and 1 for load

if mode==0:
    with lcd(BASE_DIR):
        for t in tablesToBackup:
            local('python manage.py dumpdata %s > ./scripts/baseDB/%s.json' %(t, t))
elif mode==1:
    with lcd(BASE_DIR):
        for t in tablesToBackup:
            local('python manage.py loaddata ./scripts/baseDB/%s.json' %(t))
print BASE_DIR
