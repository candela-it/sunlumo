# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import os

from PyQt4.QtXml import QDomDocument
from PyQt4.QtCore import QSize, QBuffer, QIODevice, QDir
from PyQt4.QtGui import QColor, QImage, QPainter

from qgis.core import (
    QgsRasterLayer,
    QgsVectorLayer,
    QgsRectangle,
    QgsMapLayerRegistry,
    QgsMapRenderer,
    QgsCoordinateReferenceSystem
)

# QgsProject.instance().setFileName(QGIS_PROJECT)
# if not(QgsProject.instance().read()):
    # sys.exit(1)
# QgsMapLayerRegistry.instance().mapLayers().values()


def _readLayers(doc):
    layers = doc.elementsByTagName('maplayer')
    for i in xrange(layers.size()):
        yield layers.at(i)


def _readAttrs(layer):
    attrs = layer.attributes()
    for i in xrange(attrs.size()):
        yield attrs.item(i)


def _getAttr(layer, attr):
    attrs = layer.attributes()
    return attrs.namedItem(attr).toAttr()


def _parseProject(project_file):
    with open(project_file, 'rb') as project_data:
        doc = QDomDocument()
        doc.setContent(project_data.read())
    return doc


def _parseLayers(doc):
    loaded_layers = []
    for layer in _readLayers(doc):
        layer_type = _getAttr(layer, 'type').value()
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


def render(project_file, params):

    project_root = os.path.dirname(project_file)

    cwd = os.getcwd()
    QDir.setCurrent(project_root)

    doc = _parseProject(project_file)
    loaded_layers = _parseLayers(doc)

    # print extent.toString()
    crs = QgsCoordinateReferenceSystem()
    crs.createFromSrid(3857)
    # crs.createFromSrid(3765)

    img = QImage(QSize(256, 256), QImage.Format_ARGB32_Premultiplied)

    # set transparent backgorund color
    color = QColor(255, 255, 255, 0)
    img.fill(color)

    p = QPainter()
    p.begin(img)
    p.setRenderHint(QPainter.Antialiasing)

    rndr = QgsMapRenderer()
    rndr.clearLayerCoordinateTransforms()
    rndr.setDestinationCrs(crs)
    rndr.setProjectionsEnabled(True)
    rndr.setExtent(QgsRectangle(*params.get('bbox')))
    # rndr.setOutputSize(QSize(256, 256))
    rndr.setLayerSet(loaded_layers)
    rndr.setOutputSize(img.size(), img.logicalDpiX())
    rndr.setMapUnits(crs.mapUnits())

    rndr.render(p)

    map_buffer = QBuffer()
    map_buffer.open(QIODevice.ReadWrite)
    img.save(map_buffer, "PNG")

    # clean up
    QgsMapLayerRegistry.instance().removeAllMapLayers()
    p.end()
    map_buffer.close()
    os.chdir(cwd)
    return map_buffer.data()
