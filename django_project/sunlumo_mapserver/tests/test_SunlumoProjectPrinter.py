# -*- coding: utf-8 -*-

from django.test import TestCase

from ..printer import Printer


class TestSunlumoProjectPrinter(TestCase):
    def test_printer(self):
        sl_prj = Printer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        layers = sl_prj.parseLayers()

        self.assertListEqual(
            layers, [
                u'lines20141208133737878', u'points20141208133705287',
                u'polygons20141208133824264'
            ]
        )

        tmpFile = '/tmp/printtmp'
        sl_prj.printToPdf({
            'tmpFile': tmpFile,
            'layout': 'test_layout'
        })

        with open(tmpFile + '.pdf', 'r') as pdfFile:
            # we just want to test if the PDF file in not blank
            self.assertGreaterEqual(len(pdfFile.read()), 200000)

    def test_printer_missing_required_params(self):

        sl_prj = Printer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        with self.assertRaises(RuntimeError):
            sl_prj.printToPdf({})
