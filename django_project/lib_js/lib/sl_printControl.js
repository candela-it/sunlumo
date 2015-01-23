'use strict';

var _ = require('lodash');
var m = require('mithril');
// var cookie = require('../contrib/cookie');
var ol = require('../contrib/ol');

// internal events
var jvents = require('jvent');

var events = new jvents();

var PrintLayout = function(data) {
    this.name = m.prop(data.name);
    this.dimensions = m.prop(data.dimensions);
};

var PrintLayoutCollection = Array;

var Scales = [
    {
        scale: 1000,
        display: '1:1000'
    },
    {
        scale: 2000,
        display: '1:2000'
    },
    {
        scale: 5000,
        display: '1:5000'
    },
    {
        scale: 100000,
        display: '1:100000'
    },
    {
        scale: 500000,
        display: '1:500000'
    }
];

// PrintControl ViewModel, Controller and View
var PrintControl = {};

PrintControl.vm = (function() {
    var vm = {};
    vm.init = function() {
        vm.layouts_list = new PrintLayoutCollection();
        // Set initial scale option.
        vm.selected_scale = Scales[0];
        vm.selected_layout = null;

        vm.fetchLayouts();
    };

    vm.fetchLayouts = function() {
        // GET request -- m.request({})
        // For now simulate...
        var response = {
            layouts: [
                {name: 'Layout-A4', dimensions: {width: 210, height: 297}},
                {name: 'Layout-A3', dimensions: {width: 297, height: 420}},
            ]
        };

        vm.layouts_list = new PrintLayoutCollection();

        _.forEach(response.layouts, function(layout) {
            vm.add(layout.name, layout.dimensions);
        });

        // Set initial layout option.
        vm.selected_layout = vm.layouts_list[0];
    };

    // add layout to layouts list.
    vm.add = function(name, dimensions) {
        vm.layouts_list.push(new PrintLayout({
            'name': name,
            'dimensions': dimensions
        }));
    };

    return vm;
}());

PrintControl.controller = function() {
    this.onScaleClick = function(item) {
        PrintControl.vm.selected_scale = item;
        // Automatically show print area.
        events.emit('.showPrintArea', {
            'scale': PrintControl.vm.selected_scale,
            'layout':PrintControl.vm.selected_layout
        });
    };

    this.onPrintLayoutClick = function(item) {
        PrintControl.vm.selected_layout = item;
        // Automatically show print area.
        events.emit('.showPrintArea', {
            'scale': PrintControl.vm.selected_scale,
            'layout':PrintControl.vm.selected_layout
        });
    };

    this.onShowPrintAreaClick = function() {
        events.emit('.showPrintArea', {
            'scale': PrintControl.vm.selected_scale,
            'layout':PrintControl.vm.selected_layout
        });
    };

    this.onPrintClick = function() {

    };

    this.onHidePrintAreaClick = function() {
        events.emit('.hidePrintArea');
    };
};

PrintControl.view = function(ctrl) {
    return m('div', {}, [
        m('label', 'Scale'),
        m('select', {
            'name': 'print-scales'
        }, [
            Scales.map(function(item) {
                return m('option', {
                    'value': item.scale,
                    'onclick': ctrl.onScaleClick.bind(ctrl, item)
                }, item.display);
            })
        ]),
        m('label', 'Layout'),
        m('select', {
            'name': 'print-layouts'
        }, [
            PrintControl.vm.layouts_list.map(function(item) {
                return m('option', {
                    'value': item.name(),
                    'onclick': ctrl.onPrintLayoutClick.bind(ctrl, item)
                }, item.name());
            })
        ]),
        m('button', {
            'onclick': ctrl.onShowPrintAreaClick.bind(ctrl)
        }, 'SHOW PRINT AREA'),
        m('button', {
            'onclick': ctrl.onPrintClick.bind(ctrl)
        }, 'PRINT'),
        m('br'),
        m('button', {
            'onclick': ctrl.onHidePrintAreaClick.bind(ctrl)
        }, 'HIDE'),
    ]);
};

var SL_PrintControl = function(map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!map || Object.getOwnPropertyNames(map).length === 0) {
        throw new Error('SL_PrintControl map parameter must be defined');
    }


    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_PrintControl options parameter must be defined');
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

SL_PrintControl.prototype = {
    _init: function() {
        this.SL_PrintArea_Source = new ol.source.Vector();

        this.SL_PrintArea_Layer = new ol.layer.Vector({
            source: this.SL_PrintArea_Source
        });

        this.map.addLayer(this.SL_PrintArea_Layer);

        this.SL_PrintArea_Feature = null;
        this.printAreaExist = false;

        // initiliaze viewmodel
        PrintControl.vm.init();

        // Add Drag interaction for PrintControl Features to map.
        this.map.addInteraction(new Drag(this));

        m.module(document.getElementById('panelPrint'), {controller: PrintControl.controller, view: PrintControl.view});
    },

    _handleEvents: function() {
        var self = this;

        events.on('.showPrintArea', function (options) {
            self.onShowPrintArea(options);
        });

        events.on('.hidePrintArea', function () {
            self.onHidePrintArea();
        });
    },

    onShowPrintArea: function(options) {
        var view_center = this.map.getView().getCenter();
        var area_dimensions = this.getAreaDimensionsForScale(options);
        this.createPrintArea(view_center, area_dimensions);

        // If PrintArea doesn't exist in layer add it.
        if (!this.printAreaExist) {
            this.SL_PrintArea_Source.addFeature(this.SL_PrintArea_Feature);
            this.printAreaExist = true;
        }

        this.SL_PrintArea_Layer.setVisible(true);

        this.createPrintAreaNodes(this.SL_PrintArea_Feature);
    },

    getAreaDimensionsForScale: function(printOptions) {
        // Get paper dimensions in meters according to paper dims and scale.
        return {
            width: printOptions.layout.dimensions().width * printOptions.scale.scale / 1000,
            height: printOptions.layout.dimensions().height * printOptions.scale.scale / 1000
        };
    },

    createPrintArea: function(view_center, area_dimensions) {
        // Calculate coordinates for showing print area on map.
        var firstVertex = [view_center[0] - area_dimensions.width/2, view_center[1] + area_dimensions.height/2];
        var secondVertex = [firstVertex[0] + area_dimensions.width, firstVertex[1]];
        var thirdVertex = [secondVertex[0], secondVertex[1] - area_dimensions.height];
        var fourthVertex = [thirdVertex[0] - area_dimensions.width, thirdVertex[1]];

        // If print area doesn't exist then create it, else just change it's coords.
        if (!this.SL_PrintArea_Feature) {
            this.SL_PrintArea_Feature = new ol.Feature({
                geometry: new ol.geom.Polygon(
                    [[firstVertex,
                    secondVertex,
                    thirdVertex,
                    fourthVertex]]
                ),
                isPrintArea: true
            });
        } else {
            this.SL_PrintArea_Feature
                .getGeometry()
                .setCoordinates(
                    [[firstVertex,
                    secondVertex,
                    thirdVertex,
                    fourthVertex
                    ]]);
        }
    },

    createPrintAreaNodes: function(printArea) {
        if (this.printAreaNodes) {
            for (var i = 0; i < this.printAreaNodes.length; i++) {
                this.SL_PrintArea_Source.removeFeature(this.printAreaNodes[i]);
            }
        }

        this.printAreaNodes = [];
        var nodesCoords = printArea.getGeometry().getCoordinates()[0];
        for (var j = 0; j < nodesCoords.length; j++) {
            this.printAreaNodes.push(new ol.Feature({
               geometry: new ol.geom.Point(nodesCoords[j]),
               isPrintAreaNode: true
           }));
        }

        this.SL_PrintArea_Source.addFeatures(this.printAreaNodes);
    },

    onHidePrintArea: function() {
        this.SL_PrintArea_Layer.setVisible(false);
    }
};

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {object} SL_PrintControl instance
 */
var Drag = function(printControl) {
    this.printControl = printControl;

    ol.interaction.Pointer.call(this, {
        handleDownEvent: this.handleDownEvent,
        handleDragEvent: this.handleDragEvent,
        handleMoveEvent: this.handleMoveEvent,
        handleUpEvent: this.handleUpEvent
    });

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;
};
ol.inherits(Drag, ol.interaction.Pointer);

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
Drag.prototype.handleDownEvent = function(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
          return feature;
        });

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
    }

    return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
Drag.prototype.handleDragEvent = function(evt) {
    // Only if feature is PrintArea
    if (this.feature_.getProperties().isPrintArea) {
        var deltaX = evt.coordinate[0] - this.coordinate_[0];
        var deltaY = evt.coordinate[1] - this.coordinate_[1];

        var geometry = /** @type {ol.geom.SimpleGeometry} */
            (this.feature_.getGeometry());

        geometry.translate(deltaX, deltaY);

        this.printControl.SL_PrintArea_Source.forEachFeature(function(feat) {
            if (feat.getProperties().isPrintAreaNode) {
                var node_geometry = feat.getGeometry().translate(deltaX, deltaY);
            }
        });


        this.coordinate_[0] = evt.coordinate[0];
        this.coordinate_[1] = evt.coordinate[1];
    }
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
Drag.prototype.handleMoveEvent = function(evt) {
    if (this.cursor_) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
            return feature;
          });
      var element = evt.map.getTargetElement();
      if (feature) {
        if (element.style.cursor !== this.cursor_) {
          this.previousCursor_ = element.style.cursor;
          element.style.cursor = this.cursor_;
        }
      } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
      }
    }
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
Drag.prototype.handleUpEvent = function(evt) {
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};

module.exports = SL_PrintControl;
