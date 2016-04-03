from fabric.api import *

runOn = 1

if runOn==0:
    local('userdel git')
    local('echo "y\n" | rm -r /home/git')
    local('adduser git')
    local('cat /etc/passwd');
    local('ls /home/')

if runOn==1:
    local('pwd')
    local('git config --global user.name "git"')
    local('git config --global user.email "git@libreERP"')
    local('ssh-keygen')
    local('mkdir -p ~/bin')
    local('git clone git://github.com/sitaramc/gitolite')
    local('gitolite/install -ln ~/bin')
    local('cp ~/.ssh/id_rsa.pub ~/admin.pub')
    local('~/bin/gitolite setup -pk ~/admin.pub')
    local('ssh git@localhost info')
    local('git clone git@localhost:gitolite-admin')
