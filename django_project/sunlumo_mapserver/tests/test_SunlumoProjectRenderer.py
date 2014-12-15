# -*- coding: utf-8 -*-

from django.test import TestCase

from ..renderer import Renderer


class TestSunlumoProjectRenderer(TestCase):
    def test_render_png(self):
        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        image = sl_prj.render({
            'bbox': [-1.5, -1.5, 1.5, 1.5], 'image_size': [512, 512],
            'srs': 4326, 'image_format': 'png', 'bgcolor': [255, 255, 255],
            'transparent': True
        })

        # might not be the best approach, but at least it's not a blank image
        self.assertEqual(image.size(), 44735)

    def test_render_png8(self):
        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        image = sl_prj.render({
            'bbox': [-1.5, -1.5, 1.5, 1.5], 'image_size': [512, 512],
            'srs': 4326, 'image_format': 'png8', 'bgcolor': [255, 255, 255],
            'transparent': True
        })

        # might not be the best approach, but at least it's not a blank image
        self.assertEqual(image.size(), 14185)

    def test_render_jpeg(self):
        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        image = sl_prj.render({
            'bbox': [-1.5, -1.5, 1.5, 1.5], 'image_size': [512, 512],
            'srs': 4326, 'image_format': 'jpeg', 'bgcolor': [255, 255, 255],
            'transparent': True
        })

        # might not be the best approach, but at least it's not a blank image
        self.assertEqual(image.size(), 13044)

    def test_render_missing_required_params(self):

        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        with self.assertRaises(RuntimeError):
            sl_prj.render({})
