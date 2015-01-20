# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import contextlib
import os
import json
import tempfile


@contextlib.contextmanager
def change_directory(path):
    """
    A context manager which changes the working directory to the given
    path, and then changes it back to its previous value on exit.
    """

    prev_cwd = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(prev_cwd)


def writeParamsToJson(params):
    tmpFile = tempfile.mkstemp()
    with open(tmpFile[1], 'w') as param_file:
        json.dump(params, param_file)

    return tmpFile[1]


def hex2rgb(hex_value):
    if hex_value.find('0x') > -1:
        hex_value = hex_value[2:]
    if hex_value.find('#') > -1:
        hex_value = hex_value[1:]
    return [int(hex_value[i: i + 2], 16) for i in xrange(0, 6, 2)]


def rgb2hex(rgb_values):
    return '0x{0:02x}{1:02x}{2:02x}'.format(
        *(max(0, min(rgb_val, 255)) for rgb_val in rgb_values)
    )


def str2bool(value):
    valid = {
        'true': True, 't': True, '1': True,
        'false': False, 'f': False, '0': False,
    }

    if isinstance(value, bool):
        return value

    if not isinstance(value, basestring):
        raise ValueError('invalid literal for boolean. Not a string.')

    lower_value = value.lower()
    if lower_value in valid:
        return valid[lower_value]
    else:
        raise ValueError('invalid literal for boolean: "%s"' % value)


def writeGeoJSON(features):
    # expand the features iterator
    geojson = {
        'type': 'FeatureCollection', 'features': [feat for feat in features],
        'crs': {
            'type': 'name', 'properties': {
                'name': 'urn:ogc:def:crs:EPSG::3765'
            }
        }
    }
    return geojson


def featureToGeoJSON(pk, geometry, properties):
    json_feat = {
        'type': 'Feature',
        'id': pk,
        'geometry': json.loads(geometry.exportToGeoJSON()),
        'properties': properties
    }

    return json_feat


def valueParser(value):
    if not(value):
        return ''
    else:
        return value
