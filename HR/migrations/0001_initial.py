# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import HR.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='userDesignation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('domainType', models.CharField(default=b'NOT', max_length=3, choices=[(b'NOT', b'Not selected..'), (b'RND', b'Research and Development'), (b'OPE', b'Operational'), (b'MAN', b'Management')])),
                ('domain', models.CharField(default=b'NA', max_length=15, choices=[(b'NA', b'Not Assigned'), (b'AUTO', b'Automotive'), (b'SERVICE', b'Service'), (b'RND', b'University'), (b'FMCG', b'FMCG'), (b'POWER', b'Power'), (b'PHARMA', b'Pharmaceuticals'), (b'MANUFAC', b'Manufacturing'), (b'TELE', b'Tele Communications')])),
                ('unit', models.CharField(max_length=30, null=True)),
                ('department', models.CharField(max_length=30, null=True)),
                ('rank', models.CharField(max_length=8, null=True)),
                ('primaryApprover', models.ForeignKey(related_name='approving', to=settings.AUTH_USER_MODEL, null=True)),
                ('reportingTo', models.ForeignKey(related_name='managing', to=settings.AUTH_USER_MODEL, null=True)),
                ('secondaryApprover', models.ForeignKey(related_name='alsoApproving', to=settings.AUTH_USER_MODEL, null=True)),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='userProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('empID', models.PositiveIntegerField(unique=True, null=True)),
                ('displayPicture', models.ImageField(upload_to=HR.models.getDisplayPicturePath)),
                ('dateOfBirth', models.DateField(null=True)),
                ('anivarsary', models.DateField(null=True)),
                ('permanentAddressStreet', models.TextField(max_length=100, null=True, blank=True)),
                ('permanentAddressCity', models.CharField(max_length=15, null=True, blank=True)),
                ('permanentAddressPin', models.IntegerField(null=True, blank=True)),
                ('permanentAddressState', models.CharField(max_length=20, null=True, blank=True)),
                ('permanentAddressCountry', models.CharField(max_length=20, null=True, blank=True)),
                ('localAddressStreet', models.TextField(max_length=100, null=True)),
                ('localAddressCity', models.CharField(max_length=15, null=True)),
                ('localAddressPin', models.IntegerField(null=True)),
                ('localAddressState', models.CharField(max_length=20, null=True)),
                ('localAddressCountry', models.CharField(max_length=20, null=True)),
                ('prefix', models.CharField(default=b'NA', max_length=4, choices=[(b'NA', b'NA'), (b'Mr', b'Mr'), (b'Mrs', b'Mrs'), (b'Smt', b'Smt'), (b'Shri', b'Shri')])),
                ('gender', models.CharField(default=b'M', max_length=6, choices=[(b'M', b'Male'), (b'F', b'Female'), (b'O', b'Other')])),
                ('email', models.EmailField(max_length=50)),
                ('email2', models.EmailField(max_length=50, blank=True)),
                ('mobile', models.PositiveIntegerField(null=True)),
                ('emergency', models.PositiveIntegerField(null=True)),
                ('tele', models.PositiveIntegerField(null=True, blank=True)),
                ('website', models.URLField(max_length=100, null=True, blank=True)),
                ('sign', models.ImageField(null=True, upload_to=HR.models.getSignaturesPath)),
                ('IDPhoto', models.ImageField(null=True, upload_to=HR.models.getDisplayPicturePath)),
                ('TNCandBond', models.FileField(null=True, upload_to=HR.models.getTNCandBondPath)),
                ('resume', models.FileField(null=True, upload_to=HR.models.getResumePath)),
                ('certificates', models.FileField(null=True, upload_to=HR.models.getCertificatesPath)),
                ('transcripts', models.FileField(null=True, upload_to=HR.models.getTranscriptsPath)),
                ('otherDocs', models.FileField(null=True, upload_to=HR.models.getOtherDocsPath, blank=True)),
                ('almaMater', models.CharField(max_length=100, null=True)),
                ('pgUniversity', models.CharField(max_length=100, null=True, blank=True)),
                ('docUniversity', models.CharField(max_length=100, null=True, blank=True)),
                ('fathersName', models.CharField(max_length=100, null=True)),
                ('mothersName', models.CharField(max_length=100, null=True)),
                ('wifesName', models.CharField(max_length=100, null=True, blank=True)),
                ('childCSV', models.CharField(max_length=100, null=True, blank=True)),
                ('note1', models.TextField(max_length=500, null=True, blank=True)),
                ('note2', models.TextField(max_length=500, null=True, blank=True)),
                ('note3', models.TextField(max_length=500, null=True, blank=True)),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
