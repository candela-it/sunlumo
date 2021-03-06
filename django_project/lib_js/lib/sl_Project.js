'use strict';

var m = require('mithril');

var UI_LayerControl = require('./ui/layerControl');
var UI_SimilaritySearch = require('./ui/similaritySearch');
var UI_SimilaritySearchResults = require('./ui/similaritySearchResults');
var UI_GetFeatureInfo = require('./ui/getFeatureInfo');
var UI_GetFeatureInfoAllVisible = require('./ui/getFeatureInfoAllVisible');
var UI_PrintControl = require('./ui/printControl');
var UI_DistanceTool = require('./ui/distanceTool');
var UI_AreaTool = require('./ui/areaTool');
var UI_GFITool = require('./ui/getFeatureInfoTool');
var UI_GFIAllVisibleTool = require('./ui/getFeatureInfoAllVisibleTool');
var UI_PrintTool = require('./ui/printTool');
var UI_SpinnerComponent = require('./ui/spinnerComponent');
var UI_Sidebar = require('./ui/sidebar');
var UI_Toolbox = require('./ui/toolBox');

var SL_Map = require('./sl_map');
var SL_QGISLayerControl = require('./sl_QGISLayerControl');
var SL_GFIControl = require('./sl_getfeatureinfoControl');
var SL_GFIControlAllVisible = require('./sl_getfeatureinfoAllVisibleControl');
var SL_MeasureTool = require('./sl_measureTool');
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
    this.init();
    this.initUI();
};


SL_Project.prototype = {

    init: function () {
        var sl_map = new SL_Map(this.options);

        // add qgis_layer to the map
        new SL_QGISLayerControl(sl_map, this.options);

        // add qgis_GFIControl Layer to the map
        new SL_GFIControl(sl_map, this.options);
        new SL_GFIControlAllVisible(sl_map, this.options);

        new SL_MeasureTool(sl_map, this.options);

        // add similarity search control
        new SL_SimilaritySearchControl(sl_map, this.options);

        new SL_PrintControl(sl_map, this.options);
        new SL_FeatureOverlay(sl_map, this.options);
    },

    initUI: function() {
        // layer control
        var ui_lc = new UI_LayerControl(this.options);
        var ui_ss = new UI_SimilaritySearch(this.options);
        var ui_pc = new UI_PrintControl(this.options, {
            layers: ui_lc.controller.vm.getLayersParam(),
            transparencies: ui_lc.controller.vm.getTransparencyParam()
        });
        m.module(document.getElementById('printControlPanel'), {
            controller: function () {
                return ui_pc.controller;
            },
            view: function (ctrl) {
                return [ui_pc.view(ctrl)];
            }
        });
        var ui_dt = new UI_DistanceTool(this.options);
        var ui_at = new UI_AreaTool(this.options);
        var ui_gfit = new UI_GFITool(this.options);
        var ui_gfi_all_visible = new UI_GFIAllVisibleTool(this.options);
        var ui_pt = new UI_PrintTool(this.options);

        var ui_toolbox = new UI_Toolbox(this.options, [{
                component: ui_dt
            }, {
                component: ui_at
            }, {
                component: ui_gfit
            }, {
                component: ui_gfi_all_visible
            }, {
                component: ui_pt
            }
        ]);
        m.module(document.getElementById('toolbox'), {
            controller: function () {
                return ui_toolbox.controller;
            },
            view: function (ctrl) {
                return [ui_toolbox.view(ctrl)];
            }
        });

        var ui_sidebar = new UI_Sidebar(this.options, [
            {
                title: 'Pretraživanje',
                component: ui_ss,
                open: false
            },
            {
                title: 'Slojevi',
                component: ui_lc,
                open: true
            }
        ]);
        m.module(document.getElementById('sidebar'), {
            controller: function () {
                return ui_sidebar.controller;
            },
            view: function (ctrl) {
                return [ui_sidebar.view(ctrl)];
            }
        });

        var ui_gfi = new UI_GetFeatureInfo(this.options);
        m.module(document.getElementById('resultsToolControl'), {
            controller: function () {
                return ui_gfi.controller;
            },
            view: function (ctrl) {
                return [ui_gfi.view(ctrl)];
            }
        });

        var ui_gfi_allvisible = new UI_GetFeatureInfoAllVisible(this.options);
        m.module(document.getElementById('resultsToolControlAllVisible'), {
            controller: function () {
                return ui_gfi_allvisible.controller;
            },
            view: function (ctrl) {
                return [ui_gfi_allvisible.view(ctrl)];
            }
        });

        var ui_ssr = new UI_SimilaritySearchResults(this.options);
        m.module(document.getElementById('similaritySearchResults'), {
            controller: function () {
                return ui_ssr.controller;
            },
            view: function (ctrl) {
                return [ui_ssr.view(ctrl)];
            }
        });

        var ui_spin = new UI_SpinnerComponent(this.options);
        m.module(document.getElementById('refresh-notification'), {
            controller: function () {
                return ui_spin.controller;
            },
            view: function (ctrl) {
                return [ui_spin.view(ctrl)];
            }
        });
    }
};

module.exports = SL_Project;
