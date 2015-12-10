# libreERP

I started this project in August of 2015 when I needed a web interface for one of my IOT project.

I dont know why but I once decided to build it further to a collaborative project management suit mainly focused on electronics and CAD projects.

The current state of the project is as follows :

1. The basic authentication with admin interface to manage users and their master data is almost complete.
2. A realtime notification system based on Autobahn and Crossbar.io project is also incorporated which also made it possible to build a realtime chat system.
3. In terms of collaboration and people's profile system I have implemented almost 50 % of Facebook can do. Posting a post, album, photos with comments and like system is also working fine.

Ongoing work :

An API backed IMAP-SMTP web client is being developed, I am facing issue in authenticating the Dovecot IMAP server with the Django's user data. The workaround I am using is that for each user the system will use proxy login to retrieve the mails and return the JSON response.


The best part of the project is that the architecture I designed for this project is absolutely state of the art. Its uses RESTful API interaction, Angular JS bases interactive and responsive frontend makes it fun to work on and more importantly enjoyable to the users.

Feel free to contact me at pkyisky@gmail.com if you have any doubt or question.

I would be very happy if you can help me build this further. I am planning next to build the 3D rendering engine backed by GIT version control for the CAD project management module.

Installation guide for this project is as follows:

The backend is Django powered so you can install it on either of windows or GNU/linux environment. I would recommend GNU/linux as you will be able to run the WAMP router server on the same machine.

Build guide
===========

Run the following commands in your console / command prompt with superuser privilages or in virtualenv

1. pip install django
2. pip install djangorestframework
3. pip install markdown      
4. pip install django-filter
5. pip install django-url-filter
6. pip install django-cors-headers
7. pip install pillow
8. pip install requests

in order to install Crossbar.io router server please head to the Crossbar.io website however here are steps which on the day when I wrote this document worked (For installation on windows please refer http://crossbar.io)

1. apt-get install python-dev
2. apt-get install libffi-dev
3. apt-get install libssl-dev
4. pip install crossbar[all]

WAMP server configuration
=========================
You can initiate a WAMP server using

$ sudo crossbar init


This will create a config.json file in in your /home/{{username}}/.crossbar  folder.
We need to replace the content of the config.json with the settings in {{project folder}}/.crossbar/config.json file

Now you can start the WAMP server with

$ sudo crossbar start

You also need to set the WAMP_SERVER ip address in the ../libreERP/libreERP/settings.py

You can checkout the source code. The source is licensed as per the terms and conditions of GPL 2. Build instructions are very easy to follow and within 10 minutes (on linux) you can have the environment up and ready. The DB is SQLite and already in the project folder but in the settings you can comment out the SQLite part and uncomment the DB connection settings for MySQL

Once setup you can run : $ python manage.py runserver

this will host the app on localhost and can be browsed at http://localhost:8000/login

login with id : "pradeep" , password : "123"
