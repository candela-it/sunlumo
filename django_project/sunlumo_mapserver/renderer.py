# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from PyQt4.QtCore import QSize, QBuffer, QIODevice
from PyQt4.QtGui import QColor, QImage, QPainter

from qgis.core import (
    QgsMapRendererCustomPainterJob,
    QgsCoordinateReferenceSystem,
    QgsMapSettings,
    QgsRectangle
)

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

            layers = self.getLayersForRendering(params.get('layers'))
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
