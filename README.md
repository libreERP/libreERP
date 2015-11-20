# mERP

I started this project in August of 2015 when I needed a web interface for one of my IOT project. 

I dont know why but I once decided to build it further to a collaborative project management suit mainly focused on electronics and CAD projects.

The current state of the project is as follows :

1. The basic authentication with admin interface to manage users and their master data is almost complete.
2. A realtime notification system based on Autobahn and Crossbar.io project is also incorporated which also made it possible to build a realtime chat system.
3. In terms of collaboration and people's profile system I have implimented almost 50 % of Facebook can do. Posting a post, album, photos with comments and like system is also working fine.

The best part of the project is that the architecture I designed for this project is absoluteley state of the art. Its uses RESTful API interaction, Angular JS bases interactive and responsive frontend makes it fun to work on and more importantly enjoyeble to the users.

Feel free to contact me at pkyisky@gmail.com if you have any doubt or question.

I would be very happy if you can help me build this further. I am planning next to build the 3D rendering engine backed by GIT version control for the CAD project management module.

Installation guide for this project is as follows:

The backend is Django powered to you can install it either windows and linux invironment. I would recomment linux as you will be able to run the websocket router server on the same machine.

Build guide
===========

run the following command in your console / command prompt with superuser privilages or in virtualenv

1. pip install django
2. pip install djangorestframework
3. pip install markdown      
4. pip install django-filter
5. pip install django-url-filter
6. pip install django-cors-headers


