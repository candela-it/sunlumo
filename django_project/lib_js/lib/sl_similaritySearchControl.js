'use strict';

var _ = require('lodash');
var m = require('mithril');
var ol = require('../contrib/ol');

// global events
var EVENTS = require('./events');

var SL_SimilaritySearchControl = function (map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!map || Object.getOwnPropertyNames(map).length === 0) {
        throw new Error('SL_SimilaritySearchControl map parameter must be defined');
    }


    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_SimilaritySearchControl options parameter must be defined');
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

    // bind event handlers
    this._handleEvents();
};


SL_SimilaritySearchControl.prototype = {
    _init: function() {

        this.SL_Result_Source = new ol.source.Vector();

        this.SL_Result_Layer = new ol.layer.Vector({
            source: this.SL_Result_Source
        });

        this.geojsonFormat = new ol.format.GeoJSON();
    },

    _handleEvents: function() {
        var self = this;

        EVENTS.on('search.clicked', function (options) {
            var feature = self.geojsonFormat.readFeatures(options.geojson);

            self.SL_Result_Source.clear(true);
            self.SL_Result_Source.addFeatures(feature);

            self.map.getView().fitExtent(
                self.SL_Result_Source.getExtent(), self.map.getSize()
            );
        });
    }
};

module.exports = SL_SimilaritySearchControl;