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
        qgis_project = settings.QGIS_PROJECT

        sunlumo_project = SunlumoProject(settings.QGIS_PROJECT)

        with change_directory(sunlumo_project.project_root):
            for layerid, attributes in settings.QGIS_SIMILARITY_SEARCH.items():
                qgs_layer = sunlumo_project.layerRegistry.mapLayer(layerid)

                features = qgs_layer.getFeatures()
                with transaction.atomic():
                    for feature in features:
                        text = u' '.join([
                            self._getAttr(feature, attr)
                            for attr in attributes
                        ])
                        si_record = SimilarityIndex.objects.update_or_create(
                            qgis_project=qgis_project,
                            qgis_layer_id=layerid,
                            feature_id=feature.id(),
                            defaults={'text': text}
                        )
                        if si_record[1]:
                            print 'Created: ', si_record[0].pk
                        else:
                            print 'Updated: ', si_record[0].pk

    def _getAttr(self, feature, attribute):
        attr_val = feature.attribute(attribute)
        if attr_val:
            return attr_val
        else:
            return ''
