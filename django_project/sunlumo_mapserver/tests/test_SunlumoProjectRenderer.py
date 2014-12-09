# -*- coding: utf-8 -*-

from django.test import TestCase

from ..renderer import Renderer


class TestSunlumoProjectRenderer(TestCase):
    def test_render_png(self):
        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        layers = sl_prj.parseLayers()

        self.assertListEqual(
            layers, [
                u'lines20141208133737878', u'points20141208133705287',
                u'polygons20141208133824264'
            ]
        )

        image = sl_prj.render({
            'bbox': [-1.5, -1.5, 1.5, 1.5], 'image_size': [512, 512],
            'srs': 4326, 'image_format': 'png'
        })

        # might not be the best approach, but at least it's not a blank image
        self.assertGreaterEqual(image.size(), 40000)

    def test_render_png8(self):
        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        layers = sl_prj.parseLayers()

        self.assertListEqual(
            layers, [
                u'lines20141208133737878', u'points20141208133705287',
                u'polygons20141208133824264'
            ]
        )

        image = sl_prj.render({
            'bbox': [-1.5, -1.5, 1.5, 1.5], 'image_size': [512, 512],
            'srs': 4326, 'image_format': 'png8'
        })

        # might not be the best approach, but at least it's not a blank image
        self.assertGreaterEqual(image.size(), 14000)

    def test_render_jpeg(self):
        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        layers = sl_prj.parseLayers()

        self.assertListEqual(
            layers, [
                u'lines20141208133737878', u'points20141208133705287',
                u'polygons20141208133824264'
            ]
        )

        image = sl_prj.render({
            'bbox': [-1.5, -1.5, 1.5, 1.5], 'image_size': [512, 512],
            'srs': 4326, 'image_format': 'jpeg'
        })

        # might not be the best approach, but at least it's not a blank image
        self.assertGreaterEqual(image.size(), 13000)

    def test_render_missing_required_params(self):

        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        with self.assertRaises(RuntimeError):
            sl_prj.render({})
