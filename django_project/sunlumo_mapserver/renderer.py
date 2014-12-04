# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import os
import contextlib

from PyQt4.QtXml import QDomDocument
from PyQt4.QtCore import QSize, QBuffer, QIODevice
from PyQt4.QtGui import QColor, QImage, QPainter

from qgis.core import (
    QgsRasterLayer,
    QgsVectorLayer,
    QgsRectangle,
    QgsMapLayerRegistry,
    QgsMapRendererCustomPainterJob,
    QgsCoordinateReferenceSystem,
    QgsMapSettings
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


# QgsProject.instance().setFileName(QGIS_PROJECT)
# if not(QgsProject.instance().read()):
    # sys.exit(1)
# QgsMapLayerRegistry.instance().mapLayers().values()


class SunlumoProject:

    def __init__(self, project_file):
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
            self.doc.setContent(project_data.read())

    def _parseLayers(self):
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

    def render(self, params):

        with change_directory(self.project_root):

            crs = QgsCoordinateReferenceSystem()
            crs.createFromSrid(3857)
            # crs.createFromSrid(3765)

            img = QImage(
                QSize(*params.get('image_size')),
                QImage.Format_ARGB32_Premultiplied
            )

            # set transparent backgorund color
            color = QColor(255, 255, 255, 0)
            img.fill(color)

            p = QPainter()
            p.begin(img)
            p.setRenderHint(QPainter.Antialiasing)

            map_settings = QgsMapSettings()
            map_settings.setBackgroundColor(color)
            map_settings.setDestinationCrs(crs)
            map_settings.setCrsTransformEnabled(True)
            map_settings.setExtent(QgsRectangle(*params.get('bbox')))
            map_settings.setOutputSize(img.size())
            map_settings.setMapUnits(crs.mapUnits())

            loaded_layers = self._parseLayers()
            map_settings.setLayers(loaded_layers)

            job = QgsMapRendererCustomPainterJob(map_settings, p)
            job.start()
            job.waitForFinished()

            map_buffer = QBuffer()
            map_buffer.open(QIODevice.ReadWrite)
            img.save(map_buffer, "PNG")

            # clean up
            p.end()
            map_buffer.close()
            return map_buffer.data()
