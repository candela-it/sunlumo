# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Attribute',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=60)),
                ('visible', models.BooleanField(default=True)),
                ('identifier', models.BooleanField(default=False)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Layer',
            fields=[
                ('layer_id', models.CharField(max_length=60, serialize=False, editable=False, primary_key=True)),
                ('title', models.CharField(max_length=60)),
                ('visible', models.BooleanField(default=True)),
                ('layer_type', models.CharField(max_length=20)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, verbose_name='created', editable=False)),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, verbose_name='modified', editable=False)),
                ('title', models.CharField(max_length=60)),
                ('logo', models.ImageField(null=True, upload_to='project_logos', blank=True)),
                ('project_file', models.FileField(upload_to='projects')),
                ('project_path', models.CharField(help_text='Full path on the server to the project file', max_length=255)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='layer',
            name='project',
            field=models.ForeignKey(to='sunlumo_project.Project'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='attribute',
            name='layer',
            field=models.ForeignKey(to='sunlumo_project.Layer'),
            preserve_default=True,
        ),
    ]
