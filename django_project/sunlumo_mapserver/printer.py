# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from qgis.core import (
    QgsComposition,
    QgsPalLabeling,
    QgsMapRenderer,
    QgsRectangle
)

from .utils import change_directory
from .project import SunlumoProject


class Printer(SunlumoProject):

    def check_required_params(self, params):
        req_params = ['tmpFile', 'layout', 'bbox']
        if not(all(param in params.keys() for param in req_params)):
            raise RuntimeError('Missing printer process params!')

    def printToPdf(self, params):
        self.check_required_params(params)

        with change_directory(self.project_root):

            le = QgsPalLabeling()
            rndr = QgsMapRenderer()
            rndr.setLabelingEngine(le)

            rndr.setLayerSet(self.LAYERS)

            composer = (
                self.getLayoutbyName(params['layout'])
                .firstChildElement('Composition')
            )

            comp = QgsComposition(rndr)
            comp.setPlotStyle(QgsComposition.Print)

            comp.readXML(composer, self.doc)
            # read composition elements
            comp.addItemsFromXML(composer, self.doc)

            # set bbox for the first Map in the layout
            comp_map = comp.getComposerMapById(0)
            comp_map.setNewExtent(QgsRectangle(*params.get('bbox')))

            # save the file
            comp.exportAsPDF(params['tmpFile'] + '.pdf')
