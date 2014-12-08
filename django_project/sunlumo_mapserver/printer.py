# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from qgis.core import (
    QgsComposition,
    QgsPalLabeling,
    QgsMapRenderer
)

from .utils import SunlumoProject, change_directory


class Printer(SunlumoProject):

    def check_required_params(self, params):
        req_params = ['tmpFile']
        if not(all(param in params.keys() for param in req_params)):
            raise RuntimeError('Missing printer process params!')

    def printToPdf(self, params):
        self.check_required_params(params)

        with change_directory(self.project_root):

            map_layers = self.parseLayers()

            le = QgsPalLabeling()
            rndr = QgsMapRenderer()
            rndr.setLabelingEngine(le)

            rndr.setLayerSet(map_layers)

            test_comp = (
                self.doc.elementsByTagName('Composer').at(0)
                .firstChildElement('Composition')
            )

            comp = QgsComposition(rndr)
            comp.setPlotStyle(QgsComposition.Print)

            comp.readXML(test_comp, self.doc)
            # read composition elements
            comp.addItemsFromXML(test_comp, self.doc)

            # save the file
            comp.exportAsPDF(params['tmpFile'] + '.pdf')
