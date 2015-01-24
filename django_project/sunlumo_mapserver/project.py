# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import os

from django.conf import settings

from PyQt4.QtXml import QDomDocument

from qgis.core import (
    QgsRasterLayer,
    QgsVectorLayer,
    QgsMapLayerRegistry,
    QgsCredentials
)

from .utils import change_directory


class QgsCredentialsNull(QgsCredentials):
    def __init__(self):
        super(QgsCredentialsNull, self).__init__()
        self.setInstance(self)

    def request(self, realm, username, password, message):
        LOG.warning('%s %s %s %s', realm, username, password, message)
        return False

NULLCREDENTIALS = QgsCredentialsNull()


class SunlumoProject(object):

    LAYER_TREE = []  # hierarchical Layer datastructure
    LAYERS_DATA = {}  # generic Layer datastructure
    LAYOUTS = []
    LAYOUTS_DATA = {}

    def __init__(self, project_file):
        self.layerRegistry = QgsMapLayerRegistry.instance()

        self.project_file = project_file
        self.project_root = os.path.abspath(os.path.dirname(project_file))
        self._parseProject(project_file)

    def _readLegendLayer(self, layer_xml):
        layer_name = self._getAttr(layer_xml, 'name').value()

        visible_val = self._getAttr(layer_xml, 'checked').value()
        visible = True if visible_val == 'Qt::Checked' else False

        layer_id = self._getAttr(
            layer_xml.firstChild().firstChild(), 'layerid'
        ).value()

        return (layer_id, layer_name, visible)

    def _readLegend(self):
        # clear layers
        self.LAYER_TREE = []
        self.LAYERS_DATA = {}

        lItems = self.doc.elementsByTagName('legend').at(0).childNodes()
        for i in xrange(lItems.size()):
            lItem = lItems.at(i)
            if lItem.nodeName() == 'legendlayer':
                layer_id, layer_name, visible = self._readLegendLayer(lItem)

                self.LAYER_TREE.append({'layer': layer_id})

                self.LAYERS_DATA[layer_id] = {
                    'layer_name': layer_name,
                    'visible': visible
                }

            elif lItem.nodeName() == 'legendgroup':
                group_name = self._getAttr(lItem, 'name').value()

                grp_visible_val = self._getAttr(lItem, 'checked').value()
                grp_visible = (
                    True if grp_visible_val == 'Qt::Checked' else False
                )

                grp_open_val = self._getAttr(lItem, 'open').value()
                if grp_open_val == 'true':
                    grp_collapsed = False
                elif grp_open_val == 'false':
                    grp_collapsed = True
                else:
                    raise RuntimeError('Unknown value for grp_open')

                group_data = {
                    'group': {
                        'name': group_name,
                        'visible': grp_visible,
                        'collapsed': grp_collapsed
                    }
                }

                groupLayers = lItem.childNodes()

                group_layer_list = []
                for sub_layer_idx in xrange(groupLayers.size()):
                    subItem = groupLayers.at(sub_layer_idx)
                    if subItem.nodeName() == 'legendlayer':
                        layer_id, layer_name, visible = (
                            self._readLegendLayer(subItem)
                        )

                        self.LAYERS_DATA[layer_id] = {
                            'layer_name': layer_name,
                            'visible': visible
                        }

                        group_layer_list.append({'layer': layer_id})

                    else:
                        raise RuntimeError('Unknown sublegend item')

                group_data['group'].update({
                    'layers': group_layer_list
                })
                self.LAYER_TREE.append(group_data)
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

        self._parseLayouts()

    def _parseLayers(self):
        with change_directory(self.project_root):
            # remove map layers
            self.layerRegistry.removeMapLayers(
                self.layerRegistry.mapLayers().keys()
            )

            for layer in self._iterateOverTagByName('maplayer'):
                layer_type = self._getAttr(layer, 'type').value()
                if layer_type == 'vector':
                    qgsLayer = QgsVectorLayer()
                elif layer_type == 'raster':
                    qgsLayer = QgsRasterLayer()

                # read layer from XML
                if not(qgsLayer.readLayerXML(layer.toElement())):
                    raise RuntimeError(
                        'Layer is not readable: {}'.format(
                            layer.firstChildElement('id').text()
                        )
                    )

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
                    del qgsRasterRender

                # record layer type
                self.LAYERS_DATA[qgsLayer.id()].update({
                    'type': layer_type
                })

                # add layer to the QgsMapLayerRegistry
                if qgsLayer.isValid():
                    self.layerRegistry.addMapLayer(qgsLayer, False)
                    LOG.debug('Loaded layer: %s', qgsLayer.id())

    def _parseLayouts(self):
        self.LAYOUTS = []
        self.LAYOUTS_DATA = {}

        with change_directory(self.project_root):
            for layout in self._iterateOverTagByName('Composer'):
                layout_name = self._getAttr(layout, 'title').value()

                self.LAYOUTS.append(layout_name)

                composerMapItem = (
                    layout
                    .firstChildElement('Composition')
                    .firstChildElement('ComposerMap')
                    .firstChildElement('ComposerItem')
                )
                width = self._getAttr(composerMapItem, 'width').value()
                height = self._getAttr(composerMapItem, 'height').value()

                self.LAYOUTS_DATA[layout_name] = {
                    'width': width,
                    'height': height
                }

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

    def _readSimilarityIndexes(self):
        similarity_index = settings.QGIS_SIMILARITY_SEARCH

        return [key for key in similarity_index.keys()]

    def getDetails(self):
        return {
            'map': self.project_file,
            'layers': self.LAYERS_DATA,
            'layer_tree': self.LAYER_TREE,
            'layouts': self.LAYOUTS,
            'layouts_data': self.LAYOUTS_DATA,
            'similarity_indices': self._readSimilarityIndexes()
        }

    def setTransparency(self, layer_id, transparency):
        qgsLayer = self.layerRegistry.mapLayer(layer_id)
        layer_type = self.LAYERS_DATA[layer_id].get('type')
        if layer_type == 'vector':
            qgsLayer.setLayerTransparency(transparency)
        elif layer_type == 'raster':
            qgsRasterRender = qgsLayer.renderer()
            qgsRasterRender.setOpacity(1 - (transparency / 100.0))

            del qgsRasterRender

    def setTransparencies(self, layers, transparencies):
        for idx, layer_id in enumerate(layers):
            self.setTransparency(layer_id, transparencies[idx])
