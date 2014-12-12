# -*- coding: utf-8 -*-

from django.test import TestCase, Client
from django.core.urlresolvers import reverse


class TestViews(TestCase):
    def setUp(self):
        self.client = Client()

    def test_mapview_view(self):
        resp = self.client.get(reverse('mapview'))

        self.assertEqual(resp.status_code, 200)

        self.assertListEqual(
            [tmpl.name for tmpl in resp.templates], [
                'mapview.html', u'base.html', u'pipeline/css.html',
                u'pipeline/js.html'
            ]
        )

    def test_getmap_view_mising_params(self):
        resp = self.client.get(reverse('getmap'))

        self.assertEqual(resp.status_code, 404)

    def test_getmap_view_bad_params(self):
        # bad bbox
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-a,-b,c,d', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png'
        })

        self.assertEqual(resp.status_code, 404)

        # bad heigth
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 'a', 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png'
        })

        self.assertEqual(resp.status_code, 404)

        # bad width
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 'b', 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png'
        })

        self.assertEqual(resp.status_code, 404)

        # bad srs
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 'a',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png'
        })

        self.assertEqual(resp.status_code, 404)

        # missing map parameter
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': '', 'format': 'image/png'
        })

        self.assertEqual(resp.status_code, 404)

        # unknown image format
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/unknown'
        })

        self.assertEqual(resp.status_code, 404)

        # unparsable image format
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'some_weird_format'
        })

        self.assertEqual(resp.status_code, 404)

    def test_getmap_view(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertTrue(5850 < len(resp.content) < 5950, len(resp.content))

        self.assertEqual(resp['Content-Type'], 'png')

    def test_getmap_view_bgcolor(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'bgcolor': 'FFFFFF', 'transparent': 'TRUE'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertTrue(5100 < len(resp.content) < 5200, len(resp.content))

        self.assertEqual(resp['Content-Type'], 'png')

    def test_printpdf_view_mising_params(self):
        resp = self.client.get(reverse('printpdf'))

        self.assertEqual(resp.status_code, 404)

    def test_printpdf_view_bad_params(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-a,-b,c,d', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': '',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': ''
        })

        self.assertEqual(resp.status_code, 404)

    def test_printpdf_view(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertTrue(220000 < len(resp.content) < 230000, len(resp.content))

        self.assertEqual(resp['Content-Type'], 'pdf')
