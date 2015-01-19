# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from itertools import groupby, chain

from django.conf import settings

from sunlumo_mapserver.project import SunlumoProject

from sunlumo_mapserver.utils import (
    change_directory,
    featureToGeoJSON,
    writeGeoJSON
)

from .models import SimilarityIndex


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
        search_string = params.get('search_string')

        search_layers = ['cres code', 'osm amenity']

        with change_directory(self.project_root):

            similar_results = (
                SimilarityIndex.objects
                .filter(qgis_project__exact=settings.QGIS_PROJECT)
                .filter(index_name__in=search_layers)
                .extra(
                    where=['text LIKE %s'],
                    params=[self._prepare_search_string(search_string)]
                )
                # groupby (itertools) requires and ordered set
                .order_by('index_name')[:limit]
            )

            return self._get_features_for_layers(similar_results)

    def _prepare_search_string(self, search_string):
        params = u'%{}%'.format(u'%'.join([
            param.upper().strip() for param in search_string.split('+')
        ]))

        LOG.info('Similarity search params: %s', params)

        return params

    def _get_features_for_layers(self, similar_results):
        feature_collections = []
        for key, group in groupby(similar_results, lambda x: x.index_name):

            layer_id = settings.QGIS_SIMILARITY_SEARCH[key].get('layer_id')

            qgsLayer = self.layerRegistry.mapLayer(layer_id)
            qgsLayer.updateFields()

            layer_pk = settings.QGIS_SIMILARITY_SEARCH[key].get('pk')

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
                    'index': records.get(feature.attribute(layer_pk), 'NoData')
                })
                for feature in qgis_features
            ]

            feature_collections.append(layer_geojson)

        return writeGeoJSON(chain(*feature_collections))
