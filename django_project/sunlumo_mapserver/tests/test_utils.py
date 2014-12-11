# -*- coding: utf-8 -*-
import os
import json

from django.test import TestCase

from ..utils import (
    writeParamsToJson,
    change_directory,
    hex2rgb,
    rgb2hex,
    str2bool
)


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

    def test_str2bool(self):
        self.assertTrue(str2bool('true'))
        self.assertTrue(str2bool('True'))
        self.assertTrue(str2bool('TRue'))
        self.assertTrue(str2bool('TRUE'))
        self.assertTrue(str2bool('T'))
        self.assertTrue(str2bool('t'))
        self.assertTrue(str2bool('1'))
        self.assertTrue(str2bool(True))
        self.assertTrue(str2bool(u'true'))

        self.assertFalse(str2bool('false'))
        self.assertFalse(str2bool('False'))
        self.assertFalse(str2bool('FAlse'))
        self.assertFalse(str2bool('FALSE'))
        self.assertFalse(str2bool('F'))
        self.assertFalse(str2bool('f'))
        self.assertFalse(str2bool('0'))
        self.assertFalse(str2bool(False))
        self.assertFalse(str2bool(u'false'))

        self.assertRaises(ValueError, str2bool, '')
        self.assertRaises(ValueError, str2bool, 12)
        self.assertRaises(ValueError, str2bool, [])
        self.assertRaises(ValueError, str2bool, 'yes')
        self.assertRaises(ValueError, str2bool, 'FOObar')
