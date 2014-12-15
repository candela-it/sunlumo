# -*- coding: utf-8 -*-

from django.test import TestCase

from ..printer import Printer


class TestSunlumoProjectPrinter(TestCase):
    def test_printer(self):
        sl_prj = Printer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        tmpFile = '/tmp/printtmp'
        sl_prj.printToPdf({
            'tmpFile': tmpFile,
            'layout': 'test_layout',
            'bbox': [-2, -2, 2, 2]
        })

        with open(tmpFile + '.pdf', 'rb') as pdfFile:
            # we just want to test if the PDF file in not blank
            data = pdfFile.read()
            self.assertEqual(len(data), 243851)

    def test_printer_missing_required_params(self):

        sl_prj = Printer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        with self.assertRaises(RuntimeError):
            sl_prj.printToPdf({})
