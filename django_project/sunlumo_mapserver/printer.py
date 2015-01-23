# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from qgis.core import (
    QgsComposition,
    QgsPalLabeling,
    QgsMapRenderer,
    QgsRectangle,
    QgsCoordinateReferenceSystem
)

from .utils import change_directory
from .project import SunlumoProject


class Printer(SunlumoProject):

    def check_required_params(self, params):
        req_params = [
            'tmpFile', 'layout', 'bbox', 'layers', 'transparencies', 'srs'
        ]
        if not(all(param in params.keys() for param in req_params)):
            raise RuntimeError('Missing printer process params!')

    def printToPdf(self, params):
        self.check_required_params(params)

        with change_directory(self.project_root):

            crs = QgsCoordinateReferenceSystem()
            crs.createFromSrid(params.get('srs'))

            mapRenderer = QgsMapRenderer()
            mapUnits = crs.mapUnits()
            mapRenderer.setMapUnits(mapUnits)

            mapExtent = QgsRectangle(*params.get('bbox'))
            mapRenderer.setExtent(mapExtent)

            le = QgsPalLabeling()
            mapRenderer.setLabelingEngine(le)

            layers = self.getLayersForRendering(params.get('layers'))
            self.setTransparencies(layers, params.get('transparencies'))
            mapRenderer.setLayerSet(layers)

            composer = (
                self.getLayoutbyName(params['layout'])
                .firstChildElement('Composition')
            )

            comp = QgsComposition(mapRenderer)
            comp.setPlotStyle(QgsComposition.Print)

            comp.readXML(composer, self.doc)
            # read composition elements
            comp.addItemsFromXML(composer, self.doc)

            comp.setPrintResolution(90)

            # set bbox for the first Map in the layout
            comp_map = comp.getComposerMapById(0)

            comp_map.setNewExtent(QgsRectangle(*params.get('bbox')))
            # comp_map.setNewScale(10000)

            # comp_map.setLayerSet(layers)
            # comp_map.setKeepLayerSet(True)

            # save the file
            comp.exportAsPDF(params['tmpFile'] + '.pdf')
