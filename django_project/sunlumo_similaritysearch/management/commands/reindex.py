# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction

from sunlumo_project.models import Project

from sunlumo_mapserver.project import SunlumoProject
from sunlumo_mapserver.utils import change_directory

from ...models import SimilarityIndex


class Command(BaseCommand):
    help = 'Reindex QGIS project layers'

    def handle(self, *args, **options):
        project = Project.objects.get(pk=settings.QGIS_PROJECT_ID)

        sunlumo_project = SunlumoProject(project.project_path)
        with transaction.atomic():
            with change_directory(sunlumo_project.project_root):
                for s_ind, mapping in settings.QGIS_SIMILARITY_SEARCH.items():
                    l_id = mapping.get('layer_id')
                    qgs_layer = sunlumo_project.layerRegistry.mapLayer(l_id)
                    qgs_layer.dataProvider().setEncoding('UTF-8')

                    self._indexFeatures(
                        qgs_layer.getFeatures(), s_ind, mapping
                    )

    def _getAttr(self, feature, attribute):
        attr_val = feature.attribute(attribute)
        if attr_val:
            return attr_val
        else:
            return ''

    def _indexFeatures(self, features, index_name, mapping):
        qgis_project = settings.QGIS_PROJECT
        for feature in features:
            # indexable field is simply joined by spaces
            text = u' '.join([
                self._getAttr(feature, attr).upper()
                for attr in mapping.get('fields')
            ])
            si_record = SimilarityIndex.objects.update_or_create(
                qgis_project=qgis_project,
                index_name=index_name,
                feature_id=feature.attribute(mapping.get('pk')),
                # update index field
                defaults={'text': text}
            )
            if si_record[1]:
                print 'Created: {} ({})'.format(
                    si_record[0].feature_id, si_record[0].pk
                )
            else:
                print 'Updated: {} ({})'.format(
                    si_record[0].feature_id, si_record[0].pk
                )
