# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import json

from qgis.core import (
    QgsCoordinateReferenceSystem,
    QgsRectangle,
    QgsFeatureRequest
)

from .utils import change_directory
from .project import SunlumoProject


class FeatureInfo(SunlumoProject):

    def check_required_params(self, params):
        req_prams = [
            'bbox', 'srs', 'query_layers'
        ]

        if not(all(param in params.keys() for param in req_prams)):
            raise RuntimeError('Missing render process params!')

    def identify(self, params):
        self.check_required_params(params)

        with change_directory(self.project_root):

            crs = QgsCoordinateReferenceSystem()
            crs.createFromSrid(params.get('srs'))

            qfr = QgsFeatureRequest()
            qfr.setFilterRect(QgsRectangle(*params.get('bbox')))

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

                # update layer fields (expressions, calulated, joined)
                layer.updateFields()

                layer_field_names = [
                    layer.attributeDisplayName(idx)
                    for idx in layer.pendingAllAttributesList()
                ]

                features = layer.getFeatures(qfr)

                # feature = QgsFeature()

                # while features.nextFeature(feature):
                #     print feature

                for feat in features:
                    json_feat = {
                        'type': 'Feature',
                        'id': feat.id(),
                        'geometry': json.loads(
                            feat.geometry().exportToGeoJSON()
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
