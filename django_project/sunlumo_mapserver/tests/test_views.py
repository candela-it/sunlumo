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
            'bbox': '-a,-b,c,d', 'width': 100, 'height': 100
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 'a'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 'b', 'height': 100
        })

        self.assertEqual(resp.status_code, 404)

    def test_getmap_view(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100
        })

        self.assertEqual(resp.status_code, 200)

        self.assertGreaterEqual(len(resp.content), 330)

        self.assertEqual(resp['Content-Type'], 'png')

    def test_printpdf_view_mising_params(self):
        resp = self.client.get(reverse('printpdf'))

        self.assertEqual(resp.status_code, 404)

    def test_printpdf_view_bad_params(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-a,-b,c,d', 'composer_template': 'test'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'composer_template': ''
        })

        self.assertEqual(resp.status_code, 404)

    def test_printpdf_view(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'composer_template': 'test'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertGreaterEqual(len(resp.content), 330)

        self.assertEqual(resp['Content-Type'], 'pdf')
