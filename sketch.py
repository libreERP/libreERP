from fabric.api import *

#local('adduser git')
#local('cat /etc/passwd');
#local('ls /home/')
#local('su - git')
# local('pwd')
#local('git config --global user.name "git"')
#local('git config --global user.email "git@libreERP"')

local('ssh-keygen')

local('mkdir -p ~/bin')
local('git clone git://github.com/sitaramc/gitolite')
local('gitolite/install -ln ~/bin')
local('cp ~/.ssh/id_rsa.pub ~/admin.pub')
local('~/bin/gitolite setup -pk admin.pub')

local('ssh git@localhost info')
local('git clone git@localhost:gitolite-admin')
