'use strict';

var m = require('mithril');
var ol = require('../contrib/ol');

var EVENTS = require('./events');

var SL_GetFeatureInfoControl = function (sl_map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!sl_map || Object.getOwnPropertyNames(sl_map).length === 0) {
        throw new Error('SL_GetFeatureInfoControl map parameter must be defined');
    }


    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_GetFeatureInfoControl options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    // internal reference to the map object
    this.sl_map = sl_map;

    // initialize the getfeatureinfo control
    this.init();

    this.initEvents();
};


SL_GetFeatureInfoControl.prototype = {
    init: function() {
        this.SL_GFI_Source = new ol.source.Vector({
            // projection: data.map.getView().getProjection(),
            defaultProjection: this.sl_map.map.getView().getProjection(),
            format: new ol.format.GeoJSON()
        });

        this.SL_GFI_Layer = new ol.layer.Vector({
            source: this.SL_GFI_Source
        });
    },

    handleMouseClick: function (evt) {
        var self = this;
        EVENTS.emit('layerControl.get.queryLayers', {
            type: 'query',
            callback: function (queryLayers) {
                EVENTS.emit('getFeatureInfo.url', {
                    coordinate: evt.coordinate,
                    queryLayers: queryLayers,
                    callback: self.getFeatureInfo.bind(self)
                });
            }
        });
    },

    getFeatureInfo: function(url) {
        var self = this;

        var geojsonFormat = new ol.format.GeoJSON();

        EVENTS.emit('spinner.activate');
        m.request({
            method: 'GET',
            url: url
        }).then(function (response) {
            // reset data of the previous source
            self.SL_GFI_Source.clear(true);

            EVENTS.emit('featureOverlay.clear');

            var features = geojsonFormat.readFeatures(response);
            self.SL_GFI_Source.addFeatures(features);

            // add new features
            EVENTS.emit('getFeatureInfo.results', {
                features: features
            });

            EVENTS.emit('spinner.deactivate');
        });
    },

    initEvents: function() {
        var self = this;

        EVENTS.on('getFeatureInfo.result.clicked', function(data) {
            var feature = self.SL_GFI_Source.getFeatureById(data.result.id());
            self.sl_map.map.getView().fit(
                feature.getGeometry().getExtent(), self.sl_map.map.getSize()
            );
            EVENTS.emit('featureOverlay.add', {
                feature: feature
            });
        });

        EVENTS.on('getFeatureInfo.results.closed', function () {
            self.SL_GFI_Source.clear(true);
            EVENTS.emit('featureOverlay.clear');
        });

        // handle GFI for queryLayers
        EVENTS.on('getFeatureInfo.tool.activate', function() {
            self.sl_map.addControlOverlayLayer(self.SL_GFI_Layer);
            // bind handleMouseClick context to self
            self.sl_map.map.on('singleclick', self.handleMouseClick, self);
        });

        EVENTS.on('getFeatureInfo.tool.deactivate', function() {
            self.SL_GFI_Source.clear(true);
            self.sl_map.removeControlOverlayLayer(self.SL_GFI_Layer);
            self.sl_map.map.un('singleclick', self.handleMouseClick, self);
        });
    }
};

module.exports = SL_GetFeatureInfoControl;
