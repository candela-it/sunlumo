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
    this._init();

};


SL_GetFeatureInfoControl.prototype = {
    _init: function() {
        var self = this;

        var geojsonFormat = new ol.format.GeoJSON();

        this.SL_GFI_Source =  new ol.source.GeoJSON({
            // projection: data.map.getView().getProjection(),
            defaultProjection: this.sl_map.map.getView().getProjection()
        });

        this.SL_GFI_Layer = new ol.layer.Vector({
            source: this.SL_GFI_Source
        });

        this.sl_map.addControlOverlayLayer(this.SL_GFI_Layer);

        // propagate map events
        this.sl_map.map.on('singleclick', function(evt) {
            EVENTS.emit('map.singleclick', {
                'coordinate': evt.coordinate
            });
        });

        EVENTS.on('qgis.gfi.url.changed', function(data) {
            EVENTS.emit('qgs.spinner.activate');
            m.request({
                method: 'GET',
                url: data.url
            }).then(function (response) {
                // reset data of the previous source
                self.SL_GFI_Source.clear(true);

                EVENTS.emit('qgis.featureoverlay.clear');

                var features = geojsonFormat.readFeatures(response);
                self.SL_GFI_Source.addFeatures(features);

                // add new features
                EVENTS.emit('gfi.results', {
                    'features': features
                });

                EVENTS.emit('qgs.spinner.deactivate');
            });
        });

        EVENTS.on('gfi.result.clicked', function(data) {
            var feature = self.SL_GFI_Source.getFeatureById(data.result.id());
            self.sl_map.map.getView().fitExtent(
                feature.getGeometry().getExtent(), self.sl_map.map.getSize()
            );
            EVENTS.emit('qgis.featureoverlay.add', {
                'feature': feature
            });
        });

        EVENTS.on('gfi.results.closed', function () {
            self.SL_GFI_Source.clear(true);
            EVENTS.emit('qgis.featureoverlay.clear');
        });
    }
};

module.exports = SL_GetFeatureInfoControl;
