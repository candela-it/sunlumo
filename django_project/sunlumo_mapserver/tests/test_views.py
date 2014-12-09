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
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-a,-b,c,d', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 'a', 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 'b', 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 'a',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': ''
        })

        self.assertEqual(resp.status_code, 404)

    def test_getmap_view(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertGreaterEqual(len(resp.content), 330)

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

        self.assertGreaterEqual(len(resp.content), 330)

        self.assertEqual(resp['Content-Type'], 'pdf')