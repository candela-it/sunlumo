'use strict';

var _ = require('lodash');
var m = require('mithril');
var EVENTS = require('./events');

var DisplayFeaturesComponent = function() {
    var component = {};

    component.zoomTo = function(item) {
        EVENTS.emit('qgis.gfi.zoomTo', {
            'extent': item.OLFeature.getGeometry().getExtent()
        });
        EVENTS.emit('qgis.featureoverlay.add', {
            'feature': item.OLFeature
        });
    };

    component.view = function(ctrl) {
        return [
            ctrl.data.map(function(item){
                return m('div.feature-result', [
                    _.map(item.properties, function(val, attr){
                        return m('div.item', { 'class': (item.toggled()) ? '' : 'hide' }, attr + ': ' + val());
                    }),
                    m('div.item.head.mouse-pointer',
                        {
                            'class': (item.toggled()) ? 'hide' : '',
                            'onclick': item.toggle
                        },
                        Object.keys(item.properties)[0] + ': ' + item.properties[Object.keys(item.properties)[0]]()
                    ),
                    m('div.item.toggle-icon', { 'onclick': item.toggle },  [
                        m('i.mouse-pointer', {
                            'class': item.toggled() ? 'fi-minus' : 'fi-plus'
                        })
                    ]),
                    m('div.item.locate-icon',
                        {
                            'onclick': component.zoomTo.bind(ctrl, item),
                            'class': item.toggled() ? '' : 'hide'
                        },
                        [
                            m('i.mouse-pointer.fi-marker')
                        ]
                    )
                ]);
            })
        ];
    };

    return component;
};

module.exports = DisplayFeaturesComponent;
