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
        self.assertTrue(44000 < image.size() < 45000, image.size())

    def test_render_png8(self):
        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        image = sl_prj.render({
            'bbox': [-1.5, -1.5, 1.5, 1.5], 'image_size': [512, 512],
            'srs': 4326, 'image_format': 'png8', 'bgcolor': [255, 255, 255],
            'transparent': True
        })

        # might not be the best approach, but at least it's not a blank image
        self.assertTrue(14000 < image.size() < 15000, image.size())

    def test_render_jpeg(self):
        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        image = sl_prj.render({
            'bbox': [-1.5, -1.5, 1.5, 1.5], 'image_size': [512, 512],
            'srs': 4326, 'image_format': 'jpeg', 'bgcolor': [255, 255, 255],
            'transparent': True
        })

        # might not be the best approach, but at least it's not a blank image
        self.assertTrue(13000 < image.size() < 14000, image.size())

    def test_render_missing_required_params(self):

        sl_prj = Renderer('./sunlumo_mapserver/test_data/test_sunlumo.qgs')

        with self.assertRaises(RuntimeError):
            sl_prj.render({})
