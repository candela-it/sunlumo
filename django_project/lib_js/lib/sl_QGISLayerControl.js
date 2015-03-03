'use strict';

var _ = require('lodash');
var ol = require('../contrib/ol');

// global events
var EVENTS = require('./events');


var SL_QGISLayerControl = function (sl_map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!sl_map || Object.getOwnPropertyNames(sl_map).length === 0) {
        throw new Error('SL_LayerControl map parameter must be defined');
    }

    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_LayerControl options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    // internal reference to the map object
    this.sl_map = sl_map;

    // check if we got right flavour of options
    this.checkOptions();

    // initialize the layer control
    this.init();

    // initialize the layer control event handling
    this.initEvents();
};


SL_QGISLayerControl.prototype = {

    initQGISLayer: function () {
        this.SL_Source = new ol.source.ImageWMS({
            url: '/getmap',
            params: {
                VERSION: '1.1.1',
                FORMAT: 'image/jpeg',
                BGCOLOR: 'FFFFFF',
                TRANSPARENT: false
            },
            serverType: 'qgis',
            ratio: 1,
            imageLoadFunction: this.customImageLoadFunction.bind(this)
        });

        this.SL_QGIS_Layer = new ol.layer.Image({
            // extent: extent,
            source: this.SL_Source
        });

        // add QGIS Layer to the map
        this.sl_map.addQGISLayer(this.SL_QGIS_Layer);
    },

    customImageLoadFunction: function(image, src) {
        var start_time = new Date().getTime();
        // set loading-status
        EVENTS.emit('spinner.activate');

        // set image source
        image.getImage().src = src;

        // onload triggers when the image is fully loaded
        image.getImage().onload = function(evt) {
            EVENTS.emit('spinner.deactivate');
            var end_time = new Date().getTime();

            console.log('Image loaded:', end_time - start_time);
        };
    },

    init: function () {
        this.initQGISLayer();
    },

    updateSourceParams: function(options) {
        this.SL_Source.updateParams({
            LAYERS: options.layers,
            TRANSPARENCIES: options.transparencies
        });
    },

    initEvents: function () {
        var self = this;

        EVENTS.on('layerControl.layers.initialized', function(options) {
            self.updateSourceParams(options);
        });

        EVENTS.on('layerControl.layers.updated', function(options) {
            self.updateSourceParams(options);
        });

        EVENTS.on('layerControl.query.layers.updated', function(options) {
            self.queryLayersParam = options.query_layers;
        });

        EVENTS.on('getFeatureInfo.url', function(data) {
            var viewResolution = self.sl_map.map.getView().getResolution();
            var url = self.SL_Source.getGetFeatureInfoUrl(
                data.coordinate, viewResolution, self.sl_map.map.getView().getProjection(), {
                   INFO_FORMAT: 'application/json',
                   QUERY_LAYERS: data.queryLayers
               });

            // return URL via callback function
            data.callback(url);
        });
    },

    checkOptions: function () {
        var properties = Object.getOwnPropertyNames(this.options);

        if (!_.contains(properties, 'layers')) {
            throw new Error('SL_LayerControl options must contain "layers" property');
        }

        if (Object.getOwnPropertyNames(this.options.layers).length === 0) {
            throw new Error('SL_LayerControl "layers" must not be empty');
        }
    }
};

module.exports = SL_QGISLayerControl;
