'use strict';

var ol = require('../contrib/ol');
var EVENTS = require('./events');

var SL_FeatureOverlay = function (sl_map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!sl_map || Object.getOwnPropertyNames(sl_map).length === 0) {
        throw new Error('SL_FeatureOverlay map parameter must be defined');
    }


    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_FeatureOverlay options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    // internal reference to the map object
    this.sl_map = sl_map;
    this.HighlightedFeature = undefined;
    // initialize the getfeatureinfo control
    this.init();
};


SL_FeatureOverlay.prototype = {
    init: function() {
        var self = this;

        var collection = new ol.Collection();

        this.SL_FeatureOverlay_Layer = new ol.layer.Vector({
            map: this.sl_map.map,
            source: new ol.source.Vector({
                features: collection,
                useSpatialIndex: false
            }),
            updateWhileAnimating: true,
            updateWhileInteracting: true,
            style: [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#f00',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,0.1)'
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: 'rgba(255,0,0,0.1)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#f00',
                        width: 1.5
                    })
                })
            })]
        });

        EVENTS.on('featureOverlay.add', function(data) {
            if (data.feature !== this.HighlightedFeature) {
                if (this.HighlightedFeature) {
                    self.SL_FeatureOverlay_Layer.getSource().removeFeature(this.HighlightedFeature);
                }
                if (data.feature) {
                    self.SL_FeatureOverlay_Layer.getSource().addFeature(data.feature);
                }
                this.HighlightedFeature = data.feature;
            }
        });

        EVENTS.on('featureOverlay.clear', function() {
            if (this.HighlightedFeature !== undefined) {
                self.SL_FeatureOverlay_Layer.getSource().removeFeature(this.HighlightedFeature);
            }
        });
    }
};

module.exports = SL_FeatureOverlay;
