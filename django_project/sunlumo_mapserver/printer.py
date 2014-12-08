# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from PyQt4.QtXml import QDomDocument

from qgis.core import (
    QgsComposition,
    QgsPalLabeling,
    QgsMapRenderer
)

from .utils import SunlumoProject, change_directory


class Printer(SunlumoProject):

    def printToPdf(self, params):
        with change_directory(self.project_root):
            doc = QDomDocument()
            project_data = open(self.project_file, 'r')
            doc.setContent(project_data.read())

            map_layers = self.parseLayers()

            le = QgsPalLabeling()
            rndr = QgsMapRenderer()
            rndr.setLabelingEngine(le)

            rndr.setLayerSet(map_layers)

            test_comp = (
                doc.elementsByTagName('Composer').at(0)
                .firstChildElement('Composition')
            )

            comp = QgsComposition(rndr)
            comp.setPlotStyle(QgsComposition.Print)

            comp.readXML(test_comp, doc)
            # read composition elements
            comp.addItemsFromXML(test_comp, self.doc)

            # save the file
            comp.exportAsPDF(params['tmpFile'] + '.pdf')
