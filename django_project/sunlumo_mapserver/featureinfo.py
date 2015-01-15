# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import json

from qgis.core import (
    QgsCoordinateReferenceSystem,
    QgsRectangle,
    QgsFeatureRequest
)

from django.conf import settings

from .utils import change_directory
from .project import SunlumoProject


class FeatureInfo(SunlumoProject):

    def check_required_params(self, params):
        req_prams = [
            'bbox', 'srs', 'query_layers', 'click_point'
        ]

        if not(all(param in params.keys() for param in req_prams)):
            raise RuntimeError('Missing render process params!')

    def identify(self, params):
        self.check_required_params(params)

        with change_directory(self.project_root):

            crs = QgsCoordinateReferenceSystem()
            crs.createFromSrid(params.get('srs'))

            search_box = self._calcSearchBox(
                params.get('bbox'), params.get('image_size')[0],
                params.get('image_size')[1],
                params.get('click_point')[0], params.get('click_point')[1]
            )

            qfr = QgsFeatureRequest()
            qfr.setFilterRect(QgsRectangle(*search_box))

            found_features = {
                'type': 'FeatureCollection', 'features': [],
                'crs': {
                    'type': 'name', 'properties': {
                        'name': 'urn:ogc:def:crs:EPSG::3765'
                    }
                }
            }

            for q_layer in params.get('query_layers'):
                layer_id = self.getLayerIdByName(q_layer)
                layer = self.layerRegistry.mapLayer(layer_id)

                # update layer fields (expressions, calculated, joined)
                layer.updateFields()

                layer_field_names = [
                    layer.attributeDisplayName(idx)
                    for idx in layer.pendingAllAttributesList()
                ]

                features = layer.getFeatures(qfr)

                for feat in features:
                    geom = feat.geometry()

                    json_feat = {
                        'type': 'Feature',
                        'id': feat.id(),
                        'geometry': json.loads(
                            geom.exportToGeoJSON()
                        )
                    }
                    json_feat.update({'properties': dict(zip(
                        layer_field_names, [
                            attr if attr else None
                            for attr in feat.attributes()
                        ])
                    )})
                    found_features['features'].append(json_feat)

        return found_features

    def _calcSearchBox(self, bbox, width, height, i, j):
        x_res = (bbox[2] - bbox[0]) / width
        y_res = (bbox[3] - bbox[1]) / height

        center_x = bbox[0] + i * x_res
        center_y = bbox[1] + j * y_res

        return (
            center_x - settings.QGIS_GFI_BUFFER * x_res,
            center_y - settings.QGIS_GFI_BUFFER * y_res,
            center_x + settings.QGIS_GFI_BUFFER * x_res,
            center_y + settings.QGIS_GFI_BUFFER * y_res
        )
