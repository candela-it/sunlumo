'use strict';

var ol = require('../contrib/ol');

var _ = require('lodash');

// initialize projections
require('./proj');

var SL_LayerControl = require('./sl_layerControl');

var EVENTS = require('./events');


var SL_Project = function (options) {
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


SL_Project.prototype = {

    _init: function (){
        // initialize

        EVENTS.on('layer.order.updated', function(payload) {
            _.forEach(payload.layers, function(layer) {
                console.log(layer.name(), layer.visible());
            });
        });

        new SL_LayerControl(this.options);

        var projection = ol.proj.get('EPSG:3765');

        var extent = [208311.05, 4614890.75, 724721.78, 5159767.36];
        projection.setExtent(extent);

        var dgu_dof = new ol.layer.Tile({
            extent: extent,
            source: new ol.source.TileWMS(({
                url: 'http://geoportal.dgu.hr/wms',
                params: {'LAYERS': 'DOF', 'TILED':true, 'FORMAT':'image/jpeg'}
                // serverType: 'geoserver'
            }))
        });

        var sunlumo_QGIS = new ol.layer.Image({
            extent: extent,
            transparent:true,
            source: new ol.source.ImageWMS({
                url: '/getmap',
                params: {'LAYERS': 'Cres  Corine LC,Cres obala,hillshade', 'MAP':'/data/simple.qgs', 'VERSION':'1.1.1', 'FORMAT':'image/png'},
                ratio: 1
            })
        });

        var map = new ol.Map({
            target: 'map',
            view: new ol.View({
                projection: projection,
                center: ol.proj.transform([14.5, 44.7], 'EPSG:4326', 'EPSG:3765'),
                zoom: 3,
                extent: extent
            })
        });

        map.addLayer(dgu_dof);
        map.addLayer(sunlumo_QGIS);
    },
};

module.exports = SL_Project;