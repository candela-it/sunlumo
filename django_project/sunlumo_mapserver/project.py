# -*- coding: utf-8 -*-
import logging

import os

from django.conf import settings

from PyQt4.QtXml import QDomDocument

from qgis.core import (
    QgsRasterLayer,
    QgsVectorLayer,
    QgsMapLayerRegistry,
    QgsCredentials,
    QgsMapLayer
)

from sunlumo_similaritysearch.models import IndexSpecification

from .utils import change_directory


LOG = logging.getLogger(__name__)


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
    LAYER_ORDER = []
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

        return {
            'layer': {
                'layer_id': layer_id,
                'layer_name': layer_name,
                'visible': visible
            }
        }

    def _readLegendGroup(self, legend_item):
        group_name = self._getAttr(legend_item, 'name').value()

        grp_visible_val = self._getAttr(legend_item, 'checked').value()
        grp_visible = (
            True if grp_visible_val == 'Qt::Checked' else False
        )

        grp_open_val = self._getAttr(legend_item, 'open').value()
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

        return group_data

    def _readLegendItem(self, legend_item):
        if legend_item.nodeName() == 'legendlayer':
            layer_data = self._readLegendLayer(legend_item)

            layer = layer_data.get('layer');
            self.LAYERS_DATA[layer['layer_id']] = {
                'layer_name': layer['layer_name'],
                'visible': layer['visible']
            }
            return layer_data

        elif legend_item.nodeName() == 'legendgroup':
            group_data = self._readLegendGroup(legend_item)

            groupLayers = legend_item.childNodes()

            group_layer_list = []
            for sub_layer_idx in xrange(groupLayers.size()):
                subItem = groupLayers.at(sub_layer_idx)

                group_layer_list.append(self._readLegendItem(subItem))

            group_data.update({
                'layers': group_layer_list
            })
            return group_data

    def _readLegend(self):
        # clear layers
        self.LAYER_TREE = []
        self.LAYERS_DATA = {}

        lItems = self.doc.elementsByTagName('legend').at(0).childNodes()
        for i in xrange(lItems.size()):
            lItem = lItems.at(i)
            self.LAYER_TREE.append(self._readLegendItem(lItem))

    def _readLayerOrder(self):
        self.LAYER_ORDER = []
        customOrder = (
            self.doc.elementsByTagName('layer-tree-canvas').at(0)
            .firstChildElement('custom-order')
        )
        # enabled = self._getAttr(customOrder, 'enabled').value()
        layer_items = customOrder.childNodes()
        for idx in xrange(layer_items.size()):
            layer_item = layer_items.at(idx)
            self.LAYER_ORDER.append(layer_item.firstChild().nodeValue())

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
        self._readLayerOrder()
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

                tmpWidth = self._getAttr(composerMapItem, 'width').value()
                tmpHeight = self._getAttr(composerMapItem, 'height').value()
                # convert width and height to meters
                width = float(tmpWidth) / 1000
                height = float(tmpHeight) / 1000

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
        similarity_indices = IndexSpecification.objects.filter(
            project_id=settings.SUNLUMO_PROJECT_ID
        ).values_list('name', flat=True)

        # we need to expand Django ValuesListQuerySet for JSON serialization
        return list(similarity_indices)

    def getDetails(self):
        return {
            'layers': self.LAYERS_DATA,
            'layer_tree': self.LAYER_TREE,
            'layouts': self.LAYOUTS,
            'layouts_data': self.LAYOUTS_DATA,
            'layer_order': self.LAYER_ORDER,
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

    def getAttributesForALayer(self, layer_id):
        qgs_layer = self.layerRegistry.mapLayer(layer_id)
        if qgs_layer.type() == QgsMapLayer.RasterLayer:
            return []

        layer_field_names = [
            qgs_layer.attributeDisplayName(idx)
            for idx in qgs_layer.pendingAllAttributesList()
        ]

        return layer_field_names
