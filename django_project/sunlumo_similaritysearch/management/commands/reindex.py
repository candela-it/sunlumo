# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction

from sunlumo_project.models import Project

from sunlumo_mapserver.project import SunlumoProject
from sunlumo_mapserver.utils import change_directory

from ...models import IndexSpecification
from ...utils import index_features


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

                    index_features(qgs_layer.getFeatures(), index)
