import os

dirName = os.path.dirname(os.path.abspath(__file__))
f = open(os.path.join(dirName , 'libreERP' , 'settings.py'))
search = False
lines = f.readlines()
for l in lines:
    if l.find('INSTALLED_APPS') != -1:
        search = True
    if search:
        if l.find(')') != -1:
            index = lines.index(l)
            break
lines.insert(index , "\t\t'appname',\n")
f = open("foo.txt", "w")
f.writelines(lines)
f.close()
