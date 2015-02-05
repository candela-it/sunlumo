'use strict';

var EVENTS = require('./events');

var m = require('mithril');

var ol = require('../contrib/ol');

var UI_LayerControl = require('./ui/layerControl');
var UI_SimilaritySearch = require('./ui/similaritySearch');
var UI_GetFeatureInfo = require('./ui/getFeatureInfo');
var UI_PrintControl = require('./ui/printControl');
var UI_DistanceTool = require('./ui/distanceTool');
var UI_SpinnerComponent = require('./ui/spinnerComponent');

var SL_Map = require('./sl_map');
var SL_QGISLayerControl = require('./sl_QGISLayerControl');
var SL_GFIControl = require('./sl_getfeatureinfoControl');
var SL_DistanceToolControl = require('./sl_distanceToolControl');
var SL_SimilaritySearchControl = require('./sl_similaritySearchControl');
var SL_PrintControl = require('./sl_printControl');
var SL_FeatureOverlay = require('./sl_FeatureOverlay');

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
    this._initUI();
};


SL_Project.prototype = {

    _init: function (){

        var sl_map = new SL_Map(this.options);

        // these two layers should be added as last overlays
        // add qgis_layer to the map
        var qgis_layer = new SL_QGISLayerControl(sl_map, this.options);

        // // add qgis_GFIControl Layer to the map
        var qgis_GFI_layer = new SL_GFIControl(sl_map, this.options);

        new SL_DistanceToolControl(sl_map, this.options);

        // add similarity search control
        var qgis_Similarity_layer = new SL_SimilaritySearchControl(sl_map, this.options);

        new SL_PrintControl(sl_map, this.options);
        new SL_FeatureOverlay(sl_map, this.options);
    },

    _initUI: function() {
        // layer control
        var ui_lc = new UI_LayerControl(this.options);
        m.module(document.getElementById('panelLayers'), {
            controller: function () {return ui_lc.controller;},
            view: function (ctrl) {return [ui_lc.view(ctrl)];},
        });

        var ui_ss = new UI_SimilaritySearch(this.options);
        m.module(document.getElementById('panelSearch'), {
            controller: function () {return ui_ss.controller;},
            view: function (ctrl) {return [ui_ss.view(ctrl)];},
        });

        var ui_gfi = new UI_GetFeatureInfo(this.options);
        m.module(document.getElementById('resultsToolControl'), {
            controller: function () {return ui_gfi.controller;},
            view: function (ctrl) {return [ui_gfi.view(ctrl)];},
        });

        // printControl depends on active layers and transparencies so we need
        // to pass them as initialState
        var ui_pc = new UI_PrintControl(this.options, {
            'layers': ui_lc.controller.vm.getLayersParam(),
            'transparencies': ui_lc.controller.vm.getTransparencyParam()
        });
        m.module(document.getElementById('panelPrint'), {
            controller: function () {return ui_pc.controller;},
            view: function (ctrl) {return [ui_pc.view(ctrl)];},
        });

        var ui_dt = new UI_DistanceTool(this.options);
        m.module(document.getElementById('distanceToolControl'), {
            controller: function () {return ui_dt.controller;},
            view: function (ctrl) {return [ui_dt.view(ctrl)];},
        });

        var ui_spin = new UI_SpinnerComponent(this.options);
        m.module(document.getElementById('logo'), {
            controller: function () {return ui_spin.controller;},
            view: function (ctrl) {return [ui_spin.view(ctrl)];},
        });
    }
};

module.exports = SL_Project;
