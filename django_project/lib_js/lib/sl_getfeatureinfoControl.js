'use strict';

// var _ = require('lodash');
var m = require('mithril');
var ol = require('../contrib/ol');

var EVENTS = require('./events');


var SL_GetFeatureInfoControl = function (map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!map || Object.getOwnPropertyNames(map).length === 0) {
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
    this.map = map;

    // initialize the getfeatureinfo control
    this._init();

};


SL_GetFeatureInfoControl.prototype = {
    _init: function() {
        var self = this;

        this.SL_GFI_Source =  new ol.source.GeoJSON({
            // projection: data.map.getView().getProjection(),
            defaultProjection: this.map.getView().getProjection()
        });

        this.SL_GFI_Layer = new ol.layer.Vector({
            source: this.SL_GFI_Source
        });

        var geojsonFormat = new ol.format.GeoJSON();

        EVENTS.on('qgis.gfi.url.changed', function(data) {
            m.request({
                method: 'GET',
                url: data.url
            }).then(function (response) {
                // reset data of the previous source
                self.SL_GFI_Source.clear(true);
                // add new features
                self.SL_GFI_Source.addFeatures(geojsonFormat.readFeatures(response));
            });
        });
    }
};

module.exports = SL_GetFeatureInfoControl;