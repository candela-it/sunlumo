# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sunlumo_project', '0001_squashed_0009_auto_20150303_1412'),
        ('sunlumo_similaritysearch', '0004_remove_similarityindex_qgis_project'),
    ]

    operations = [
        migrations.CreateModel(
            name='IndexAttribute',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('primary_key', models.BooleanField(default=False)),
                ('attribute', models.ForeignKey(to='sunlumo_project.Attribute')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='IndexData',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('feature_id', models.TextField()),
                ('text', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='IndexSpecification',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=20)),
                ('fields', models.ManyToManyField(to='sunlumo_project.Attribute', through='sunlumo_similaritysearch.IndexAttribute')),
                ('layer', models.ForeignKey(to='sunlumo_project.Layer')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterIndexTogether(
            name='similarityindex',
            index_together=None,
        ),
        migrations.RemoveField(
            model_name='similarityindex',
            name='project',
        ),
        migrations.DeleteModel(
            name='SimilarityIndex',
        ),
        migrations.AddField(
            model_name='indexdata',
            name='index',
            field=models.ForeignKey(to='sunlumo_similaritysearch.IndexSpecification'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='indexdata',
            name='project',
            field=models.ForeignKey(to='sunlumo_project.Project'),
            preserve_default=True,
        ),
        migrations.AlterIndexTogether(
            name='indexdata',
            index_together=set([('project', 'index', 'feature_id')]),
        ),
        migrations.AddField(
            model_name='indexattribute',
            name='index',
            field=models.ForeignKey(to='sunlumo_similaritysearch.IndexSpecification'),
            preserve_default=True,
        ),
    ]
