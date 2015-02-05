'use strict';

// initialize projections
require('./proj');

var ol = require('../contrib/ol');

var EVENTS = require('./events');

var SL_Map = function (options) {
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

        var dgu_dof = new ol.layer.Tile({
            extent: extent,
            source: new ol.source.TileWMS(({
                url: 'http://geoportal.dgu.hr/wms',
                params: {'LAYERS': 'DOF', 'TILED':true, 'FORMAT':'image/jpeg'},
                serverType: 'geoserver'
            }))
        });

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

        this.map.addLayer(dgu_dof);

        // propagate map events
        this.map.on('singleclick', function(evt) {
            EVENTS.emit('map.singleclick', {
                'coordinate': evt.coordinate
            });
        });
    }
};

module.exports = SL_Map;