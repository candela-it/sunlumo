# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from itertools import groupby

from django.conf import settings

from sunlumo_mapserver.project import SunlumoProject
from sunlumo_mapserver.utils import change_directory

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
        # search_string = 'place+sv.'
        search_string = '81'

        search_layers = [
            'points20150113152732133'
            # 'Cres__Corine_LC20141202224530380'
        ]

        with change_directory(self.project_root):

            similar_results = (
                SimilarityIndex.objects
                .filter(qgis_project__exact=settings.QGIS_PROJECT)
                .filter(qgis_layer_id__in=search_layers)
                .extra(
                    where=['text LIKE %s'],
                    params=[self._prepare_search_string(search_string)]
                )
                # groupby (itertools) requires and ordered set
                .order_by('qgis_layer_id')[:limit]
            )

            self._get_features_for_layers(similar_results)

    def _prepare_search_string(self, search_string):
        params = '%{}%'.format('%'.join([
            param.upper() for param in search_string.split('+')
        ]))

        LOG.info('Similarity search params: %s', params)

        return params

    def _get_features_for_layers(self, similar_results):
        for key, group in groupby(similar_results, lambda x: x.qgis_layer_id):

            qgsLayer = self.layerRegistry.mapLayer(key)
            qgsLayer.updateFields()

            layer_pk = settings.QGIS_SIMILARITY_SEARCH[key].get('pk')

            feature_ids = ','.join(
                ['\'{}\''.format(rec.feature_id) for rec in group]
            )

            filter_expression = '{} IN ({})'.format(layer_pk, feature_ids)

            qgsLayer.setSubsetString(filter_expression)
            qgis_features = qgsLayer.getFeatures()
            print filter_expression

            for feature in qgis_features:
                print feature[layer_pk]
