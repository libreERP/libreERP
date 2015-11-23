# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0002_social'),
    ]

    operations = [
        migrations.CreateModel(
            name='albumFollowing',
            fields=[
                ('follow_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='social.follow')),
                ('parent', models.ForeignKey(related_name='followers', to='social.album')),
            ],
            bases=('social.follow',),
        ),
        migrations.CreateModel(
            name='postFollowing',
            fields=[
                ('follow_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='social.follow')),
                ('parent', models.ForeignKey(related_name='followers', to='social.post')),
            ],
            bases=('social.follow',),
        ),
        migrations.AddField(
            model_name='follow',
            name='enrollment',
            field=models.CharField(default=b'tagged', max_length=10, choices=[(b'tagged', b'tagged'), (b'starred', b'starred')]),
        ),
        migrations.AddField(
            model_name='follow',
            name='subscription',
            field=models.CharField(default=b'all', max_length=10, choices=[(b'all', b'all'), (b'daily', b'daily'), (b'weekly', b'weekly'), (b'monthly', b'monthly'), (b'available', b'available')]),
        ),
    ]
