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

from .utils import SunlumoProject, change_directory


class Renderer(SunlumoProject):

    def check_required_params(self, params):
        if not(all(param in params.keys() for param in [
                'bbox', 'image_size'])):
            raise RuntimeError('Missing render process params!')

    def render(self, params):
        self.check_required_params(params)

        with change_directory(self.project_root):

            crs = QgsCoordinateReferenceSystem()
            crs.createFromSrid(4326)

            img = QImage(
                QSize(*params.get('image_size')),
                QImage.Format_ARGB32_Premultiplied
            )

            # set transparent backgorund color
            color = QColor(255, 255, 255, 0)
            img.fill(color)

            p = QPainter()
            p.begin(img)
            # p.setRenderHint(QPainter.Antialiasing)

            map_settings = QgsMapSettings()
            map_settings.setBackgroundColor(color)
            map_settings.setDestinationCrs(crs)
            map_settings.setCrsTransformEnabled(True)
            map_settings.setExtent(QgsRectangle(*params.get('bbox')))
            map_settings.setOutputSize(img.size())
            map_settings.setMapUnits(crs.mapUnits())

            loaded_layers = self.parseLayers()
            map_settings.setLayers(loaded_layers)

            job = QgsMapRendererCustomPainterJob(map_settings, p)
            job.start()
            job.waitForFinished()

            map_buffer = QBuffer()
            map_buffer.open(QIODevice.ReadWrite)
            # img2 = img.convertToFormat(QImage.Format_Indexed8)
            # img2.save(map_buffer, "PNG")
            img.save(map_buffer, 'PNG')

            # clean up
            p.end()
            map_buffer.close()
            return map_buffer.data()
