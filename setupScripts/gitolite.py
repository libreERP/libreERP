from fabric.api import *
import sys

print sys.argv
mode = sys.argv[1]


if mode=='root':
    local('userdel git')
    local('echo "y\n" | rm -r /home/git')
    local('adduser git')
    local('cat /etc/passwd');
    local('adduser git sudo');
    local('ls /home/')

elif mode=='git':
    local('pwd')
    local('git config --global user.name "git"')
    local('git config --global user.email "git@libreERP"')
    local('ssh-keygen')
    with lcd('/home/git/'):
        local('mkdir -p ~/bin')
        local('git clone git://github.com/sitaramc/gitolite')
        local('gitolite/install -ln ~/bin')
        local('cp ~/.ssh/id_rsa.pub ~/git.pub')
        local('~/bin/gitolite setup -pk ~/git.pub')
        local('ssh git@localhost info')
        local('git clone git@localhost:gitolite-admin')
        local('git clone http://github.com/pkyad/libreERP-main')


# nano gitolite/src/triggers/notify.py
# #!/usr/bin/python
#
# import requests
# import sys
#
# #msg = str(sys.argv)
# msg = ''
# for i in sys.argv:
#         msg += i + ','
#
# r = requests.post('http://127.0.0.1:8000/api/git/gitoliteNotification/?data=%s&key=%s' %(msg , '123'))
#
# Run the following command to make the script executable
# sudo chmod u+x gitolite/src/triggers/notify.py
#
# add the following in the  $HOME/.gitolite.rc
# -------------
# POST_GIT => [
#     'notify.py'
# ],
