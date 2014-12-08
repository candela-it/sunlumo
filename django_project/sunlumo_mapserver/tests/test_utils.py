# -*- coding: utf-8 -*-
import os
import json

from django.test import TestCase

from ..utils import writeParamsToJson, change_directory


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
