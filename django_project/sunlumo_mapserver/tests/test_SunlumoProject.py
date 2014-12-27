# -*- coding: utf-8 -*-

from django.test import TestCase

from ..project import SunlumoProject


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

        self.assertListEqual(
            sl_prj.LAYERS, [
                u'polygons20141208133824264', u'lines20141208133737878',
                u'points20141208133705287', u'raster20141227234036592'
            ]
        )

    def test_parseLayouts(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        layouts = sl_prj._parseLayouts()

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

    def test_readLegend(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        sl_prj._readLegend()

        layers = sl_prj.LAYERS_DATA
        self.assertListEqual(
            layers.keys(), [
                u'lines20141208133737878', u'points20141208133705287',
                u'raster20141227234036592', u'polygons20141208133824264'
            ]
        )

        # all layers should be visible
        self.assertTrue(all([vals['visible'] for key, vals in layers.items()]))

    def test_getLayerIdByName(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        self.assertEqual(
            sl_prj.getLayerIdByName('polygons'), 'polygons20141208133824264'
        )

        # test unknown layer
        self.assertEqual(sl_prj.getLayerIdByName('unknown_layer'), None)

    def test_getLayersForRendering(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        self.assertEqual(
            sl_prj.getLayersForRendering(['polygons', 'unknown_layer']),
            ['polygons20141208133824264']
        )

    def test_getDetails(self):
        sl_prj = SunlumoProject(
            './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        )

        self.assertDictEqual(
            sl_prj.getDetails(), {
                'layers': {
                    u'lines20141208133737878': {
                        'visible': True, 'type': u'vector',
                        'layer_name': u'lines', 'transparency': 0
                    },
                    u'points20141208133705287': {
                        'visible': True, 'type': u'vector',
                        'layer_name': u'points', 'transparency': 0
                    },
                    u'raster20141227234036592': {
                        'visible': True, 'type': u'raster',
                        'layer_name': u'raster', 'transparency': 25
                    },
                    u'polygons20141208133824264': {
                        'visible': True, 'type': u'vector',
                        'layer_name': u'polygons', 'transparency': 50}
                    },
                'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
                'layers_order': [
                    u'polygons20141208133824264', u'lines20141208133737878',
                    u'points20141208133705287', u'raster20141227234036592'
                ]
            }
        )
