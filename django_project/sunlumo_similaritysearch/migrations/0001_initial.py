# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SimilarityIndex',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('qgis_project', models.TextField()),
                ('qgis_layer_id', models.TextField()),
                ('feature_id', models.TextField()),
                ('text', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterIndexTogether(
            name='similarityindex',
            index_together=set([('qgis_project', 'qgis_layer_id', 'feature_id')]),
        ),
        migrations.RunSQL('CREATE EXTENSION pg_trgm;'),
        migrations.RunSQL(
            'CREATE INDEX similarityindex_idx ON sunlumo_similaritysearch_similarityindex USING gin (text gin_trgm_ops);'
        )
    ]
