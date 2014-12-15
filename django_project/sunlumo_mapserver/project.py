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

    LAYERS = {}
    RENDER_ORDER = []

    def __init__(self, project_file):
        self.project_file = project_file
        self._parseProject(project_file)
        self.project_root = os.path.abspath(os.path.dirname(project_file))

    def _readLegend(self):
        self.RENDER_ORDER = []
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

                self.LAYERS[layer_id] = {
                    'layer_name': layer_name,
                    'visible': visible
                }
                self.RENDER_ORDER.append(layer_id)
            else:
                raise RuntimeError('Unknown legend item')

    def _readLayers(self):
        layers = self.doc.elementsByTagName('maplayer')
        for i in xrange(layers.size()):
            yield layers.at(i)

    def _readLayouts(self):
        layouts = self.doc.elementsByTagName('Composer')
        for i in xrange(layouts.size()):
            yield layouts.at(i)

    def _readAttrs(self, obj):
        attrs = obj.attributes()
        for i in xrange(attrs.size()):
            yield attrs.item(i)

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

    def parseLayers(self):
        self._readLegend()
        with change_directory(self.project_root):
            # remove all layers from the map registry
            QgsMapLayerRegistry.instance().removeAllMapLayers()
            for layer in self._readLayers():
                layer_type = self._getAttr(layer, 'type').value()
                if layer_type == 'vector':
                    qgsLayer = QgsVectorLayer()
                elif layer_type == 'raster':
                    qgsLayer = QgsRasterLayer()

                # read layer from XML
                qgsLayer.readLayerXML(layer.toElement())

                # add layer to the QgsMapLayerRegistry
                if qgsLayer.isValid():
                    QgsMapLayerRegistry.instance().addMapLayer(qgsLayer, False)
                    # add layer to the internal layer registry
                    LOG.debug('Loaded layer: %s', qgsLayer.id())
            # from qgis.core import QgsProject
            # lnames = QgsProject.instance().layerTreeRoot()

    def parseLayouts(self):
        available_layouts = []
        with change_directory(self.project_root):
            for layout in self._readLayouts():
                available_layouts.append(
                    self._getAttr(layout, 'title').value()
                )
        return available_layouts

    def getLayoutbyName(self, name):
        for layout in self._readLayouts():
            if self._getAttr(layout, 'title').value() == name:
                return layout
        else:
            return None

    def getDetails(self):
        return {}
