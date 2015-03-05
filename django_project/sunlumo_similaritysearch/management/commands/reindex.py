# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction

from sunlumo_project.models import Project

from sunlumo_mapserver.project import SunlumoProject
from sunlumo_mapserver.utils import change_directory

from ...models import IndexSpecification, IndexData, IndexAttribute


class Command(BaseCommand):
    help = 'Reindex SUNLUMO project layers'

    def handle(self, *args, **options):
        project = Project.objects.get(pk=settings.SUNLUMO_PROJECT_ID)

        sunlumo_project = SunlumoProject(project.project_path)
        with transaction.atomic():
            with change_directory(sunlumo_project.project_root):
                # get search indices
                indices = IndexSpecification.objects.filter(
                    project_id=settings.SUNLUMO_PROJECT_ID
                )
                for index in indices:
                    l_id = index.layer_id
                    qgs_layer = sunlumo_project.layerRegistry.mapLayer(l_id)
                    qgs_layer.dataProvider().setEncoding('UTF-8')

                    self._indexFeatures(qgs_layer.getFeatures(), index)

    def _getAttr(self, feature, attribute):
        attr_val = feature.attribute(attribute)
        if attr_val:
            return unicode(attr_val)
        else:
            return u''

    def _indexFeatures(self, features, index):
        field_mapping = list(
            index.indexattribute_set.filter(ordering__gt=0)
            .order_by('ordering')
            .values_list(
                'attribute__name', flat=True
            )
        )
        pk_field = (
            index.indexattribute_set.filter(primary_key=True)
            .values_list(
                'attribute__name', flat=True
            )[0]
        )
        for feature in features:
            # indexable field is simply joined by spaces
            text = u' '.join([
                self._getAttr(feature, attr).upper()
                for attr in field_mapping
            ])
            si_record = IndexData.objects.update_or_create(
                index_id=index.pk,
                feature_id=feature.attribute(pk_field),
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
