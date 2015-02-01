'use strict';

var _ = require('lodash');
var m = require('mithril');
var ol = require('../contrib/ol');

// global events
var EVENTS = require('./events');

// local events
var jvents = require('jvent');

var events = new jvents();


var SL_LayerControl = function (map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!map || Object.getOwnPropertyNames(map).length === 0) {
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
    this.map = map;

    // check if we got right flavour of options
    this._checkOptions();

    // initialize the layer control
    this._init();

    // initialize the layer control event handling
    this._initEvents();
};


SL_LayerControl.prototype = {

    _initQGISLayer: function () {
        this.SL_Source = new ol.source.ImageWMS({
            url: '/getmap',
            params: {
                'VERSION':'1.1.1',
                'FORMAT':'image/png'
            },
            ratio: 1
        });

        this.SL_QGIS_Layer = new ol.layer.Image({
            // extent: extent,
            transparent:true,
            source: this.SL_Source
        });
    },

    _init: function () {
        var self = this;
        this._initQGISLayer();
    },

    _updateSourceParams: function(options) {
        this.SL_Source.updateParams({
            'LAYERS':options.layers,
            'TRANSPARENCIES': options.transparencies,
            'MAP': this.options.map
        });
    },

    _initEvents: function () {
        var self = this;

        EVENTS.on('layers.updated', function(options) {
            self._updateSourceParams(options);
            // EVENTS.emit('read.layers.and.transparencies', {
            //     'layers': self.getLayersParam(),
            //     'transparencies': self.getTransparencyParam()
            // });
        });
        EVENTS.on('layers.initialized', function(options) {
            self._updateSourceParams(options);
        });

        EVENTS.on('query.layers.updated', function(options) {
            self.queryLayersParam = options.query_layers;
        });

        EVENTS.on('map.singleclick', function(data) {
            var viewResolution = self.map.getView().getResolution();
            var url = self.SL_Source.getGetFeatureInfoUrl(
                data.coordinate, viewResolution, self.map.getView().getProjection(), {
                   'INFO_FORMAT': 'application/json',
                   'QUERY_LAYERS': self.queryLayersParam
               });

            // emit updated url to the GFI control
            EVENTS.emit('qgis.gfi.url.changed', {
                'url': url
            });
        });


        EVENTS.on('print.area.updated', function() {
            // send back layers.and.transparencies
            // EVENTS.emit('read.layers.and.transparencies', {
            //     'layers': self.getLayersParam(),
            //     'transparencies': self.getTransparencyParam()
            // });
        });

    },

    _checkOptions: function () {
        var properties = Object.getOwnPropertyNames(this.options);

        if (!_.contains(properties, 'layers')) {
            throw new Error('SL_LayerControl options must contain "layers" property');
        }

        if (Object.getOwnPropertyNames(this.options.layers).length === 0) {
            throw new Error('SL_LayerControl "layers" must not be empty');
        }

    }
};

module.exports = SL_LayerControl;
