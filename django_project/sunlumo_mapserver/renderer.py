# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from PyQt4.QtCore import QSize, QSizeF, QBuffer, QIODevice
from PyQt4.QtGui import QColor, QImage, QPainter

from qgis.core import (
    QgsMapRendererCustomPainterJob,
    QgsCoordinateReferenceSystem,
    QgsMapSettings,
    QgsRectangle,
    QgsLegendRenderer,
    QgsLayerTreeGroup,
    QgsLayerTreeLayer,
    QgsLayerTreeModel,
    QgsLegendSettings,
    QgsLayerTree,
    QgsComposerLegendStyle
)

from django.conf import settings

from .utils import change_directory
from .project import SunlumoProject


class Renderer(SunlumoProject):

    def check_required_params(self, params):
        req_prams = [
            'bbox', 'image_size', 'srs', 'image_format', 'transparent',
            'bgcolor', 'layers', 'transparencies'
        ]

        if not(all(param in params.keys() for param in req_prams)):
            raise RuntimeError('Missing render process params!')

    def render(self, params):
        self.check_required_params(params)

        with change_directory(self.project_root):

            crs = QgsCoordinateReferenceSystem()
            crs.createFromSrid(params.get('srs'))

            img = QImage(
                QSize(*params.get('image_size')),
                QImage.Format_ARGB32_Premultiplied
            )
            dpm = 1 / 0.00028
            img.setDotsPerMeterX(dpm)
            img.setDotsPerMeterY(dpm)

            # set background color
            bgcolor = params.get('bgcolor')
            if params.get('transparent'):
                # fully transparent
                bgcolor.append(0)
            else:
                # fully opaque
                bgcolor.append(255)

            color = QColor(*bgcolor)
            img.fill(color)

            map_settings = QgsMapSettings()
            map_settings.setBackgroundColor(color)
            map_settings.setDestinationCrs(crs)
            map_settings.setCrsTransformEnabled(True)
            map_settings.setExtent(QgsRectangle(*params.get('bbox')))
            map_settings.setOutputDpi(img.logicalDpiX())
            map_settings.setOutputSize(img.size())
            map_settings.setMapUnits(crs.mapUnits())

            layers = params.get('layers')
            self.setTransparencies(layers, params.get('transparencies'))

            map_settings.setLayers(layers)

            p = QPainter()
            p.begin(img)

            job = QgsMapRendererCustomPainterJob(map_settings, p)
            job.start()
            job.waitForFinished()

            map_buffer = QBuffer()
            map_buffer.open(QIODevice.ReadWrite)

            if params.get('image_format') == 'jpeg':
                img.save(map_buffer, 'JPEG')
            elif params.get('image_format') == 'png8':
                png8 = img.convertToFormat(QImage.Format_Indexed8)
                png8.save(map_buffer, "PNG")
            else:
                img.save(map_buffer, 'PNG')

            # clean up
            p.end()
            map_buffer.close()
            return map_buffer.data()

    def getLegendGraphic(self, params):
        qgsLayer = self.layerRegistry.mapLayer(params.get('layer'))

        boxSpace = 1
        layerSpace = 2
        # layerTitleSpace = 3
        symbolSpace = 2
        iconLabelSpace = 2
        symbolWidth = 5
        symbolHeight = 3

        drawLegendLabel = True

        rootGroup = QgsLayerTreeGroup()
        rootGroup.addLayer(qgsLayer)
        # layer = QgsLayerTreeLayer(qgsLayer)

        # if qgsLayer.title():
        #     layer.setLayerName(qgsLayer.title())

        legendModel = QgsLayerTreeModel(rootGroup)

        rootChildren = rootGroup.children()

        img_tmp = QImage(QSize(1, 1), QImage.Format_ARGB32_Premultiplied)
        dpm = 1 / 0.00028
        img_tmp.setDotsPerMeterX(dpm)
        img_tmp.setDotsPerMeterY(dpm)

        dpmm = img_tmp.dotsPerMeterX() / 1000.0

        del img_tmp

        legendSettings = QgsLegendSettings()
        legendSettings.setTitle('')
        legendSettings.setBoxSpace(boxSpace)
        legendSettings.rstyle(QgsComposerLegendStyle.Subgroup).setMargin(QgsComposerLegendStyle.Top, layerSpace)

        legendSettings.rstyle(QgsComposerLegendStyle.Symbol).setMargin(QgsComposerLegendStyle.Top, symbolSpace)
        legendSettings.rstyle(QgsComposerLegendStyle.SymbolLabel).setMargin(QgsComposerLegendStyle.Left, iconLabelSpace)
        legendSettings.setSymbolSize(QSizeF(symbolWidth, symbolHeight))
        # legendSettings.rstyle(QgsComposerLegendStyle.Subgroup).setFont(layerFont)
        # legendSettings.rstyle(QgsComposerLegendStyle.SymbolLabel).setFont(itemFont)
        # // TODO: not available: layer font color
        # legendSettings.setFontColor( itemFontColor );

        # for node in rootChildren:
        #     if (QgsLayerTree.isLayer(node)):
        #         QgsLegendRenderer.setNodeLegendStyle(node, QgsComposerLegendStyle.Subgroup)
        #     # rule item titles
        #     # if ( !mDrawLegendItemLabel )
        #     #     for legendNode in legendModel.layerLegendNodes(nodeLayer):
        #     #         legendNode.setUserLabel(' ')
        #     # }

        legendRenderer = QgsLegendRenderer(legendModel, legendSettings)
        minSize = legendRenderer.minimumSize()
        s = QSize(minSize.width() * dpmm, minSize.height() * dpmm)

        img = QImage(s, QImage.Format_ARGB32_Premultiplied)
        # fill in the background
        color = QColor(0, 0, 0, 0)
        img.fill(color)

        p = QPainter()
        p.begin(img)

        p.setRenderHint(QPainter.Antialiasing, True)
        p.scale(dpmm, dpmm)
        legendRenderer.drawLegend(p)

        map_buffer = QBuffer()
        map_buffer.open(QIODevice.ReadWrite)

        img.save(map_buffer, 'PNG')
        # clean up

        map_buffer.close()
        p.end()

        # self.layerRegistry.removeAllMapLayers()
        return map_buffer.data()

