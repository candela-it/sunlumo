# -*- coding: utf-8 -*-
from django.test import TestCase
from django.core.management import call_command
from django.core.management.base import CommandError

from ..utils import writeParamsToJson


class TestManagementCommands(TestCase):
    def test_print_map(self):

        params = {
            'bbox': [-2, -2, 2, 2], 'layout': 'test_layout',
            'map_file': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': ['polygons', 'lines', 'points'],
            'transparencies': [50, 0, 0]
        }

        fileName = writeParamsToJson(params)

        call_command(
            'print_map', fileName
        )

        with open(fileName + '.pdf', 'rb') as pdfFile:
            # we just want to test if the PDF file in not blank
            data = pdfFile.read()
            self.assertEqual(len(data), 426652)

    def test_print_map_missing_args(self):

        with self.assertRaises(CommandError):
            call_command('print_map')
