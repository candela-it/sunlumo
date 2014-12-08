# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import contextlib
import os
import json
import tempfile

from PyQt4.QtXml import QDomDocument

from qgis.core import (
    QgsRasterLayer,
    QgsVectorLayer,
    QgsMapLayerRegistry
)


@contextlib.contextmanager
def change_directory(path):
    """
    A context manager which changes the working directory to the given
    path, and then changes it back to its previous value on exit.
    """

    prev_cwd = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(prev_cwd)


def writeParamsToJson(params):
    tmpFile = tempfile.mkstemp()
    with open(tmpFile[1], 'w') as param_file:
        json.dump(params, param_file)

    return tmpFile[1]

# QgsProject.instance().setFileName(QGIS_PROJECT)
# if not(QgsProject.instance().read()):
    # sys.exit(1)
# QgsMapLayerRegistry.instance().mapLayers().values()


class SunlumoProject:

    def __init__(self, project_file):
        self.project_file = project_file
        self._parseProject(project_file)
        self.project_root = os.path.dirname(project_file)

    def _readLayers(self):
        layers = self.doc.elementsByTagName('maplayer')
        for i in xrange(layers.size()):
            yield layers.at(i)

    def _readAttrs(self, layer):
        attrs = layer.attributes()
        for i in xrange(attrs.size()):
            yield attrs.item(i)

    def _getAttr(self, layer, attr):
        attrs = layer.attributes()
        return attrs.namedItem(attr).toAttr()

    def _parseProject(self, project_file):
        with open(project_file, 'rb') as project_data:
            self.doc = QDomDocument()
            validity = self.doc.setContent(project_data.read())

            # check validity of the QGIS Project XML file
            if not(validity[0]):
                raise RuntimeError(validity[1])

    def parseLayers(self):
        with change_directory(self.project_root):
            # remove all layers from the map registry
            QgsMapLayerRegistry.instance().removeAllMapLayers()
            loaded_layers = []
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
                    QgsMapLayerRegistry.instance().addMapLayer(qgsLayer)
                    # add layer to the internal layer registry
                    loaded_layers.append(qgsLayer.id())
                    LOG.debug('Loaded layer: %s', qgsLayer.id())
            return loaded_layers
