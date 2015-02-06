'use strict';

var ol = require('../contrib/ol');

// global events
var EVENTS = require('./events');

var SL_PrintControl = function(sl_map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!sl_map || Object.getOwnPropertyNames(sl_map).length === 0) {
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
    this.sl_map = sl_map;

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

        this.sl_map.addControlOverlayLayer(this.SL_PrintArea_Layer);

        this.SL_PrintArea_Feature = undefined;
        this.printAreaExist = false;


        // Add Drag interaction for PrintControl Features to map.
        this.sl_map.map.addInteraction(new Drag(this));

    },

    _handleEvents: function() {
        var self = this;

        EVENTS.on('print.show', function (options) {
            self.onShowPrintArea(options);
        });

        EVENTS.on('print.hide', function () {
            self.onHidePrintArea();
        });
    },

    onShowPrintArea: function(options) {
        var view_center = this.sl_map.map.getView().getCenter();
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
            width: printOptions.layout.width() * printOptions.scale.scale / 1000,
            height: printOptions.layout.height() * printOptions.scale.scale / 1000
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
        EVENTS.emit('print.area.updated', {
            'bbox': this.SL_PrintArea_Feature.getGeometry().getExtent()
        });
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

    var feature = map.forEachFeatureAtPixel(
        evt.pixel,
        function (feature) {
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

        // this.printControl.SL_PrintArea_Source.forEachFeature(function(feat) {
            // if (feat.getProperties().isPrintAreaNode) {
            //     var node_geometry = feat.getGeometry().translate(deltaX, deltaY);
            // }
        // });


        this.coordinate_[0] = evt.coordinate[0];
        this.coordinate_[1] = evt.coordinate[1];

        EVENTS.emit('print.area.updated', {
            'bbox': this.SL_PrintArea_Feature.getGeometry().getExtent()
        });
    }
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
Drag.prototype.handleMoveEvent = function(evt) {
    if (this.cursor_) {
      var map = evt.map;
      var feature = map.forEachFeatureAtPixel(
        evt.pixel,
        function(feature) {
            return feature;
        }
    );
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
Drag.prototype.handleUpEvent = function() {
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};

module.exports = SL_PrintControl;
