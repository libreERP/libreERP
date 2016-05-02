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
        local('cp ~/.ssh/id_rsa.pub ~/admin.pub')
        local('~/bin/gitolite setup -pk ~/admin.pub')
        local('ssh git@localhost info')
        local('git clone git@localhost:gitolite-admin')
        local('git clone http://github.com/pkyad/libreERP-main')
