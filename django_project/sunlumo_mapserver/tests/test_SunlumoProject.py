# -*- coding: utf-8 -*-

from django.test import TestCase

from ..utils import SunlumoProject


class TestSunlumoProject(TestCase):
    def test_readProject(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        self.assertNotEqual(sl_prj.doc, None)

        self.assertEqual(
            sl_prj.project_root,
            '/project/django_project/sunlumo_mapserver/test_data'
        )

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

    def test_parseLayouts(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        layouts = sl_prj.parseLayouts()

        self.assertListEqual(
            layouts, [u'test_layout']
        )

    def test_getLayoutByName(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        layout = sl_prj.getLayoutbyName('test_layout')

        self.assertEqual(
            sl_prj._getAttr(layout, 'title').value(), u'test_layout'
        )

    def test_getLayoutByName_nonexistant(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        layout = sl_prj.getLayoutbyName('test_nonexistant_layout')

        with self.assertRaises(RuntimeError):
            sl_prj._getAttr(layout, 'title').value()
