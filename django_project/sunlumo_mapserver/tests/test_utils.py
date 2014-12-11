# -*- coding: utf-8 -*-
import os
import json

from django.test import TestCase

from ..utils import writeParamsToJson, change_directory, hex2rgb, rgb2hex


class TestUtils(TestCase):
    def test_writeParamsToJson(self):
        params = {'test': 1}
        fileName = writeParamsToJson(params)

        self.assertTrue(os.access(fileName, os.F_OK))
        self.assertTrue(os.access(fileName, os.R_OK))
        self.assertTrue(os.access(fileName, os.W_OK))

        saved_params = json.load(open(fileName))

        self.assertEqual(params, saved_params)

    def test_change_directory(self):
        old_cwd = os.getcwd()
        with change_directory('/tmp'):
            test_wd = os.getcwd()

            self.assertNotEqual(test_wd, old_cwd)

        new_cwd = os.getcwd()

        self.assertEqual(new_cwd, old_cwd)

    def test_hex2rgb(self):
        rgb = hex2rgb('0xFFFFFF')
        self.assertListEqual(rgb, [255, 255, 255])

        rgb = hex2rgb('FF00FF')
        self.assertListEqual(rgb, [255, 0, 255])

    def test_rgb2hex(self):
        hex_color = rgb2hex([255, 255, 255])
        self.assertEqual(hex_color, '0xffffff')

        hex_color = rgb2hex([255, 0, 255])
        self.assertEqual(hex_color, '0xff00ff')
