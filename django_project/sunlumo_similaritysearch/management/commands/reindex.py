# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction

from sunlumo_mapserver.project import SunlumoProject
from sunlumo_mapserver.utils import change_directory

from ...models import SimilarityIndex


class Command(BaseCommand):
    help = 'Reindex QGIS project layers'

    def handle(self, *args, **options):
        sunlumo_project = SunlumoProject(settings.QGIS_PROJECT)
        with transaction.atomic():
            with change_directory(sunlumo_project.project_root):
                for l_id, mapping in settings.QGIS_SIMILARITY_SEARCH.items():
                    qgs_layer = sunlumo_project.layerRegistry.mapLayer(l_id)

                    self._indexFeatures(qgs_layer.getFeatures(), l_id, mapping)

    def _getAttr(self, feature, attribute):
        attr_val = feature.attribute(attribute)
        if attr_val:
            return attr_val
        else:
            return ''

    def _indexFeatures(self, features, layer_id, mapping):
        qgis_project = settings.QGIS_PROJECT
        for feature in features:
            # indexable field is simply joined by spaces
            text = u' '.join([
                self._getAttr(feature, attr) for attr in mapping.get('fields')
            ])
            si_record = SimilarityIndex.objects.update_or_create(
                qgis_project=qgis_project,
                qgis_layer_id=layer_id,
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
