# -*- coding: utf-8 -*-
import logging

from itertools import chain
from collections import OrderedDict

from PyQt4.QtCore import QSize
from PyQt4.QtGui import QImage


from qgis.core import (
    QgsCoordinateReferenceSystem,
    QgsRectangle,
    QgsFeatureRequest,
    QgsRenderContext,
    QgsMapRenderer,
    QgsScaleCalculator,
    QgsMapLayer
)

from django.conf import settings

from .utils import change_directory, featureToGeoJSON, writeGeoJSON
from .project import SunlumoProject


LOG = logging.getLogger(__name__)


class FeatureInfo(SunlumoProject):

    def check_required_params(self, params):
        req_prams = [
            'bbox', 'srs', 'query_layers', 'click_point'
        ]

        if not(all(param in params.keys() for param in req_prams)):
            raise RuntimeError('Missing render process params!')

    def identify(self, params):
        self.check_required_params(params)

        feature_collections = []

        with change_directory(self.project_root):

            crs = QgsCoordinateReferenceSystem()
            crs.createFromSrid(params.get('srs'))

            search_box = self._calcSearchBox(
                params.get('bbox'), params.get('image_size')[0],
                params.get('image_size')[1],
                params.get('click_point')[0], params.get('click_point')[1]
            )

            # initialize mapRenderer and a rendering context in order to be
            # to check if a feature will actually be rendered
            # we don't want to return features that are not visible
            img = QImage(
                QSize(settings.QGIS_GFI_BUFFER*2, settings.QGIS_GFI_BUFFER*2),
                QImage.Format_ARGB32_Premultiplied
            )
            dpm = 1 / 0.00028
            img.setDotsPerMeterX(dpm)
            img.setDotsPerMeterY(dpm)

            mapRenderer = QgsMapRenderer()
            mapRenderer.clearLayerCoordinateTransforms()
            mapRenderer.setOutputSize(
                QSize(settings.QGIS_GFI_BUFFER*2, settings.QGIS_GFI_BUFFER*2),
                img.logicalDpiX()
            )

            mapRenderer.setDestinationCrs(crs)
            mapRenderer.setProjectionsEnabled(True)
            mapUnits = crs.mapUnits()
            mapRenderer.setMapUnits(mapUnits)

            mapExtent = QgsRectangle(*search_box)
            mapRenderer.setExtent(mapExtent)

            renderContext = QgsRenderContext()
            renderContext.setExtent(mapRenderer.extent())
            renderContext.setRasterScaleFactor(1.0)
            renderContext.setMapToPixel(mapRenderer.coordinateTransform())
            renderContext.setRendererScale(mapRenderer.scale())
            renderContext.setScaleFactor(mapRenderer.outputDpi() / 25.4)
            renderContext.setPainter(None)

            qfr = QgsFeatureRequest()
            qfr.setFilterRect(QgsRectangle(*search_box))

            for q_layer in params.get('query_layers'):
                layer = self.layerRegistry.mapLayer(q_layer)

                if layer.type() == QgsMapLayer.RasterLayer:
                    # skip raster layer processing
                    continue

                # update layer fields (expressions, calculated, joined)
                layer.updateFields()

                scaleCalc = QgsScaleCalculator(
                    (img.logicalDpiX() + img.logicalDpiY()) / 2,
                    mapRenderer.destinationCrs().mapUnits()
                )
                scaleDenom = scaleCalc.calculate(mapExtent, img.width())

                # skip the layer if it's not visible at the current map scale
                if layer.hasScaleBasedVisibility():
                    if not(layer.minimumScale()
                            < scaleDenom < layer.maximumScale()):
                        continue

                # read layer field names
                layer_field_names = [
                    layer.attributeDisplayName(idx)
                    for idx in layer.pendingAllAttributesList()
                ]

                # visible features generator
                visible_features = self._visibleFeatures(
                    layer, renderContext, layer.getFeatures(qfr)
                )

                layer_features = [featureToGeoJSON(
                    feature.id(), feature.geometry(), OrderedDict(zip(
                        layer_field_names, [
                            attr if attr else None
                            for attr in feature.attributes()
                        ]
                    )))
                    for feature in visible_features
                ]

                feature_collections.append(layer_features)

            return writeGeoJSON(chain(*feature_collections))

    def _visibleFeatures(self, layer, renderContext, features):
        renderer = layer.rendererV2()
        for feature in features:
            renderer.startRender(renderContext, layer.pendingFields())
            feature_rendered = renderer.willRenderFeature(feature)
            renderer.stopRender(renderContext)

            if feature_rendered:
                yield feature

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
