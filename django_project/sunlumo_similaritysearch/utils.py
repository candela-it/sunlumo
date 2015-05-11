# -*- coding: utf-8 -*-
import logging

LOG = logging.getLogger(__name__)

from .models import IndexData


def _get_attr(feature, attribute):
    attr_val = feature.attribute(attribute)
    if attr_val:
        return unicode(attr_val)
    else:
        return u''


def index_features(features, index):
    """
    Create or update indexData for features

    Parameters:
        features (iterator): a list of QgsFeature objects
        index (object): an IndexSpecification object
    """
    field_mapping = list(
        index.indexattribute_set.filter(ordering__gt=0)
        .order_by('ordering')
        .values_list(
            'attribute__name', flat=True
        )
    )
    pk_field = (
        index.indexattribute_set.filter(primary_key=True)
        .values_list(
            'attribute__name', flat=True
        )[0]
    )

    for feature in features:
        # index data is simply joined by spaces
        text = u' '.join([
            _get_attr(feature, attr).upper()
            for attr in field_mapping
        ])
        si_record = IndexData.objects.update_or_create(
            index_id=index.pk,
            feature_id=feature.attribute(pk_field),
            # update index field
            defaults={'text': text}
        )
        if si_record[1] is True:
            LOG.debug(
                'Created: %s (%s)', si_record[0].feature_id, si_record[0].pk
            )
        else:
            LOG.debug(
                'Updated: %s (%s)', si_record[0].feature_id, si_record[0].pk
            )
