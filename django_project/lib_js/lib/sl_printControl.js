'use strict';

var ol = require('../contrib/ol');

// global events
var EVENTS = require('./events');


/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
var PrintAreaDragInteraction = function() {
    ol.interaction.Pointer.call(this, {
        handleDownEvent: this.handleDownEvent,
        handleDragEvent: this.handleDragEvent,
        handleMoveEvent: this.handleMoveEvent,
        handleUpEvent: this.handleUpEvent
    });

    this.coordinate = null;
    this.feature = null;

    this.previousCursor = undefined;
    this.cursor = 'pointer';
};

ol.inherits(PrintAreaDragInteraction, ol.interaction.Pointer);

PrintAreaDragInteraction.prototype.handleDownEvent = function(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(
        evt.pixel, function (rt_feature) {
            return rt_feature;
        }
    );

    if (feature) {
        this.coordinate = evt.coordinate;
        this.feature = feature;
        // start the drag sequence
        return true;
    }

    return false;
};

PrintAreaDragInteraction.prototype.handleDragEvent = function(evt) {
    // Only if feature is PrintArea
    if (this.feature.getProperties().isPrintArea) {
        var deltaX = evt.coordinate[0] - this.coordinate[0];
        var deltaY = evt.coordinate[1] - this.coordinate[1];

        var geometry = this.feature.getGeometry();

        geometry.translate(deltaX, deltaY);

        // set new coordinates
        this.coordinate[0] = evt.coordinate[0];
        this.coordinate[1] = evt.coordinate[1];

        EVENTS.emit('print.area.updated', {
            bbox: geometry.getExtent()
        });
    }
};

PrintAreaDragInteraction.prototype.handleMoveEvent = function(evt) {
    if (this.cursor) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(
            evt.pixel,
            function(rt_feature) {
                return rt_feature;
            }
        );

        var element = evt.map.getTargetElement();

        if (feature) {
            if (element.style.cursor !== this.cursor) {
                this.previousCursor = element.style.cursor;
                element.style.cursor = this.cursor;
            }
        } else if (this.previousCursor !== undefined) {
            element.style.cursor = this.previousCursor;
            this.previousCursor = undefined;
        }
    }
};

PrintAreaDragInteraction.prototype.handleUpEvent = function() {
    this.coordinate = null;
    this.feature = null;
    return false;
};

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
    this.init();

    // bind event handlers
    this.handleEvents();
};

SL_PrintControl.prototype = {
    init: function() {
        this.SL_PrintArea_Source = new ol.source.Vector();

        this.SL_PrintArea_Layer = new ol.layer.Vector({
            source: this.SL_PrintArea_Source
        });

        this.SL_PrintArea_Feature = undefined;

        // Add PrintAreaDragInteraction interaction
        this.dragInteraction = new PrintAreaDragInteraction();
    },

    handleEvents: function() {
        var self = this;
        EVENTS.on('print.params.updated', function (options) {
            self.showPrintArea(options);
            self.dragInteraction.setActive(true);
        });

        EVENTS.on('print.activate', function () {
            self.sl_map.addControlOverlayLayer(self.SL_PrintArea_Layer);
            self.sl_map.map.addInteraction(self.dragInteraction);
        });

        EVENTS.on('print.deactivate', function () {
            self.SL_PrintArea_Source.clear(true);

            self.sl_map.removeControlOverlayLayer(self.SL_PrintArea_Layer);
            self.sl_map.map.removeInteraction(self.dragInteraction);
        });
    },

    showPrintArea: function(options) {
        var view_center = this.sl_map.map.getView().getCenter();
        var area_dimensions = this.getAreaDimensionsForScale(options);

        this.createPrintArea(view_center, area_dimensions);
        this.SL_PrintArea_Layer.setVisible(true);
    },

    hidePrintArea: function() {
        this.SL_PrintArea_Layer.setVisible(false);
    },

    getAreaDimensionsForScale: function(options) {
        // Get paper dimensions in meters according to paper dims and scale.
        return {
            width: options.layout.width() * options.scale.scale,
            height: options.layout.height() * options.scale.scale
        };
    },

    createPrintArea: function(view_center, area_dimensions) {
        // Calculate coordinates for showing print area on map.

        var center_x = view_center[0];
        var center_y = view_center[1];

        var dx = area_dimensions.width / 2;
        var dy = area_dimensions.height / 2;

        // calculate bbox coordiantes
        var ul = [center_x - dx, center_y + dy];
        var ur = [center_x + dx, center_y + dy];
        var lr = [center_x + dx, center_y - dy];
        var ll = [center_x - dx, center_y - dy];

        var feature = new ol.Feature({
            geometry: new ol.geom.Polygon([[ul, ur, lr, ll]]),
            isPrintArea: true
        });

        this.SL_PrintArea_Source.clear(true);
        this.SL_PrintArea_Source.addFeature(feature);

        EVENTS.emit('print.area.updated', {
            bbox: feature.getGeometry().getExtent()
        });
    }
};

module.exports = SL_PrintControl;
