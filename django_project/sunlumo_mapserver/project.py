# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import os
from PyQt4.QtXml import QDomDocument

from qgis.core import (
    QgsRasterLayer,
    QgsVectorLayer,
    QgsMapLayerRegistry
)

from .utils import change_directory


class SunlumoProject(object):

    LAYERS_DATA = {}  # generic Layer datastructure
    LAYERS = []  # initial layer order

    def __init__(self, project_file):
        self.project_file = project_file
        self.project_root = os.path.abspath(os.path.dirname(project_file))
        self._parseProject(project_file)

    def _readLegend(self):
        # clear layers
        self.LAYERS = []

        lItems = self.doc.elementsByTagName('legend').at(0).childNodes()
        for i in xrange(lItems.size()):
            lItem = lItems.at(i)
            if lItem.nodeName() == 'legendlayer':
                layer_name = self._getAttr(lItem, 'name').value()

                visible_val = self._getAttr(lItem, 'checked').value()
                visible = True if visible_val == 'Qt::Checked' else False

                layer_id = self._getAttr(
                    lItem.firstChild().firstChild(), 'layerid'
                ).value()

                self.LAYERS_DATA[layer_id] = {
                    'layer_name': layer_name,
                    'visible': visible
                }
                # add layer_id to the LAYERS list
                self.LAYERS.append(layer_id)
            else:
                raise RuntimeError('Unknown legend item')

    def _iterateOverTagByName(self, tag):
        elements = self.doc.elementsByTagName(tag)
        for i in xrange(elements.size()):
            yield elements.at(i)

    def _getAttr(self, obj, attr):
        if not(obj):
            raise RuntimeError('XML Object must exist!')

        attrs = obj.attributes()
        return attrs.namedItem(attr).toAttr()

    def _parseProject(self, project_file):
        with open(project_file, 'rb') as project_data:
            self.doc = QDomDocument()
            validity = self.doc.setContent(project_data.read())

            # check validity of the QGIS Project XML file
            if not(validity[0]):
                raise RuntimeError(validity[1])

        self._readLegend()
        self._parseLayers()

    def _parseLayers(self):
        with change_directory(self.project_root):
            # remove all layers from the map registry
            QgsMapLayerRegistry.instance().removeAllMapLayers()
            for layer in self._iterateOverTagByName('maplayer'):
                layer_type = self._getAttr(layer, 'type').value()
                if layer_type == 'vector':
                    qgsLayer = QgsVectorLayer()
                elif layer_type == 'raster':
                    qgsLayer = QgsRasterLayer()

                # read layer from XML
                qgsLayer.readLayerXML(layer.toElement())

                # get layer transparency
                if layer_type == 'vector':
                    self.LAYERS_DATA[qgsLayer.id()].update({
                        'transparency': qgsLayer.layerTransparency()
                    })
                elif layer_type == 'raster':
                    qgsRasterRender = qgsLayer.renderer()
                    self.LAYERS_DATA[qgsLayer.id()].update({
                        'transparency': (
                            int((1 - qgsRasterRender.opacity()) * 100)
                        )
                    })

                # record layer type
                self.LAYERS_DATA[qgsLayer.id()].update({
                    'type': layer_type
                })

                # add layer to the QgsMapLayerRegistry
                if qgsLayer.isValid():
                    QgsMapLayerRegistry.instance().addMapLayer(qgsLayer, False)
                    # add layer to the internal layer registry
                    LOG.debug('Loaded layer: %s', qgsLayer.id())

    def _parseLayouts(self):
        available_layouts = []
        with change_directory(self.project_root):
            for layout in self._iterateOverTagByName('Composer'):
                available_layouts.append(
                    self._getAttr(layout, 'title').value()
                )
        return available_layouts

    def getLayoutbyName(self, name):
        for layout in self._iterateOverTagByName('Composer'):
            if self._getAttr(layout, 'title').value() == name:
                return layout
        else:
            return None

    def getLayersForRendering(self, layers):
        return [
            self.getLayerIdByName(layer) for layer in layers
            if self.getLayerIdByName(layer)
        ]

    def getLayerIdByName(self, layer_name):
        for layer_id, layer in self.LAYERS_DATA.items():
            if layer.get('layer_name') == layer_name:
                return layer_id
        else:
            return None

    def getDetails(self):
        return {
            'map': self.project_file,
            'layers': self.LAYERS_DATA,
            'layers_order': self.LAYERS
        }
