'use strict';

// initialize projections
require('./proj');

var ol = require('../contrib/ol');

var EVENTS = require('./events');

var SL_Map = function (options) {

    this.baseLayers = new ol.layer.Group();
    this.baseLayerCollection = new ol.Collection();
    this.baseLayers.setLayers(this.baseLayerCollection);

    this.qgisOverlay = new ol.layer.Group();
    this.qgisOverlayCollection = new ol.Collection();
    this.qgisOverlay.setLayers(this.qgisOverlayCollection);

    this.controlOverlays = new ol.layer.Group();
    this.controlOverlaysCollection = new ol.Collection();
    this.controlOverlays.setLayers(this.controlOverlaysCollection);



    // default options
    this.options = {
        // initial module options
    };

    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SLProject options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    // initialize the client
    this._init();
};

SL_Map.prototype = {
    _init: function() {
        // initialize

        var projection = ol.proj.get('EPSG:3765');

        var extent = [250515.0793, 4698849.3024, 747014.5638, 5163391.4419];
        projection.setExtent(extent);

        this.map = new ol.Map({
            target: 'map',
            logo: {
                src: '/static/images/candelaIT_logo.png',
                href: 'http://candela-it.com'
            },
            view: new ol.View({
                projection: projection,
                center: ol.proj.transform([17.02, 43.5], 'EPSG:4326', 'EPSG:3765'),
                zoom: 6,
                maxZoom: 14,  // optimal for EPSG:3765
                extent: extent
            })
        });

        this.map.addLayer(this.baseLayers);
        this.map.addLayer(this.qgisOverlay);
        this.map.addLayer(this.controlOverlays);
    },

    addBaseLayer: function (layer) {
        this.baseLayerCollection.push(layer);
    },
    removeBaseLayer: function (layer) {
        this.baseLayerCollection.remove(layer);
    },

    addQGISLayer: function (layer) {
        this.qgisOverlayCollection.push(layer);
    },
    removeQGISLayer: function (layer) {
        this.qgisOverlayCollection.remove(layer);
    },

    addControlOverlayLayer: function (layer) {
        this.controlOverlaysCollection.push(layer);
    },
    removeControlOverlayLayer: function (layer) {
        this.controlOverlaysCollection.remove(layer);
    },
};

module.exports = SL_Map;