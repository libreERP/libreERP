# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PIM', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='theme',
            name='parent',
            field=models.OneToOneField(related_name='theme', to='PIM.settings'),
        ),
    ]
