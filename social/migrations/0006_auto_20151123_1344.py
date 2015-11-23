# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0005_auto_20151123_1330'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='albumFollowing',
            new_name='albumFollower',
        ),
        migrations.RenameModel(
            old_name='postFollowing',
            new_name='postFollower',
        ),
    ]
