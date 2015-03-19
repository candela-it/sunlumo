'use strict';

var ol = require('../contrib/ol');

// global events
var EVENTS = require('./events');

var SL_SimilaritySearchControl = function (sl_map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!sl_map || Object.getOwnPropertyNames(sl_map).length === 0) {
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
    this.sl_map = sl_map;

    // initialize the getfeatureinfo control
    this.init();

    // bind event handlers
    this.handleEvents();
};


SL_SimilaritySearchControl.prototype = {
    init: function() {
        this.SL_Result_Source = new ol.source.Vector();

        this.SL_Result_Layer = new ol.layer.Vector({
            source: this.SL_Result_Source,
            style: this.style_function
        });

        this.geojsonFormat = new ol.format.GeoJSON();

        this.sl_map.addControlOverlayLayer(this.SL_Result_Layer);
    },

    style_function: function(feature, resolution) {
        var stroke = new ol.style.Stroke({
            color: '#FF3333',
            lineDash: [6, 1],
            width: 3
        });
        var styles = new ol.style.Style({
            image: new ol.style.Circle({
                stroke: stroke,
                radius: 10
            }),
            stroke: stroke
        });
        return [styles];
    },

    handleEvents: function() {
        var self = this;

        EVENTS.on('similaritySearch.result.clicked', function (options) {
            var feature = self.geojsonFormat.readFeatures(options.geojson);

            self.SL_Result_Source.clear(true);
            self.SL_Result_Source.addFeatures(feature);

            self.sl_map.map.getView().fitExtent(
                self.SL_Result_Source.getExtent(), self.sl_map.map.getSize()
            );
        });

        EVENTS.on('similaritySearch.results.closed', function () {
            // remove features ftom the source
            self.SL_Result_Source.clear(true);
        });
    }
};

module.exports = SL_SimilaritySearchControl;
