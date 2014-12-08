# -*- coding: utf-8 -*-

from django.test import TestCase

from ..utils import SunlumoProject


class TestSunlumoProject(TestCase):
    def test_readProject(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        self.assertNotEqual(sl_prj.doc, None)

        self.assertEqual(sl_prj.project_root, './sunlumo_mapserver/test_data')
        self.assertEqual(
            sl_prj.project_file,
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

    def test_readNonExistantProject(self):

        self.assertRaises(
            IOError, SunlumoProject,
            './sunlumo_mapserver/test_data/test_noexistant_sunlumo.qgs'
        )

    def test_readBadProject(self):

        self.assertRaises(
            RuntimeError, SunlumoProject,
            './sunlumo_mapserver/test_data/test_sunlumo_bad.qgs'
        )

    def test_parseLayers(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        layers = sl_prj.parseLayers()

        self.assertListEqual(
            layers, [
                u'lines20141208133737878', u'points20141208133705287',
                u'polygons20141208133824264'
            ]
        )
