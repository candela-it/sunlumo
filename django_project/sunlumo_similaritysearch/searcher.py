# -*- coding: utf-8 -*-
import logging

from itertools import groupby, chain

from sunlumo_mapserver.project import SunlumoProject

from sunlumo_mapserver.utils import (
    change_directory,
    featureToGeoJSON,
    writeGeoJSON
)

from .models import IndexData

LOG = logging.getLogger(__name__)


class Searcher(SunlumoProject):
    def check_required_params(self, params):
        req_prams = [
            'search_string', 'search_layers', 'limit'
        ]

        if not(all(param in params.keys() for param in req_prams)):
            raise RuntimeError('Missing render process params!')

    def search(self, params):
        # self.check_required_params(params)

        limit = 20
        search_string = params.get('search_string').strip()

        search_layers = params.get('search_layers')

        similar_results = (
            IndexData.objects
            # .filter(project=settings.QGIS_PROJECT_ID)
            .filter(index__name__in=search_layers)
        )

        if search_string.startswith('='):
            similar_results = similar_results.filter(
                text=search_string[1:].upper()
            )
        elif search_string.startswith('^'):
            similar_results = similar_results.filter(
                text__startswith=search_string[1:].upper()
            )
        else:
            similar_results = similar_results.extra(
                where=['text LIKE %s'],
                params=[self._prepare_search_string(search_string)]
            )

        # groupby (itertools) requires and ordered set
        similar_results = similar_results.order_by('index_id')[:limit]

        with change_directory(self.project_root):
            return self._get_features_for_layers(similar_results)

    def _prepare_search_string(self, search_string):
        params = u'%{}%'.format(u'%'.join([
            param.upper().strip() for param in search_string.split('+')
        ]))

        LOG.info('Similarity search params: %s', params)

        return params

    def _get_features_for_layers(self, similar_results):
        feature_collections = []

        for key, group in groupby(similar_results, lambda x: x.index):

            layer_id = key.layer.layer_id

            qgsLayer = self.layerRegistry.mapLayer(layer_id)
            qgsLayer.dataProvider().setEncoding('UTF-8')
            qgsLayer.updateFields()

            layer_pk = (
                key.indexattribute_set.filter(primary_key=True)
                .values_list(
                    'attribute__name', flat=True
                )[0]
            )

            records = {rec.feature_id: rec.text for rec in group}

            # construct feature IDs search condition
            feature_ids = ','.join(
                ['\'{}\''.format(key) for key, rec in records.items()]
            )
            filter_expression = '{} IN ({})'.format(layer_pk, feature_ids)

            # apply it to the layer
            qgsLayer.setSubsetString(filter_expression)
            qgis_features = qgsLayer.getFeatures()

            layer_geojson = [featureToGeoJSON(
                feature.attribute(layer_pk), feature.geometry(), {
                    'index_value': records.get(
                        unicode(feature.attribute(layer_pk)), 'NoData'
                    )
                })
                for feature in qgis_features
            ]

            feature_collections.append(layer_geojson)

        return writeGeoJSON(chain(*feature_collections))
