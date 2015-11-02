# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PIM', '0002_auto_20151102_2251'),
    ]

    operations = [
        migrations.AlterField(
            model_name='theme',
            name='parent',
            field=models.ForeignKey(related_name='theme', to='PIM.settings'),
        ),
    ]
