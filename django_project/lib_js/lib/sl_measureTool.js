'use strict';

var ol = require('../contrib/ol');
var EVENTS = require('./events');
var _ = require('lodash');


var SL_DistanceToolControl = function (sl_map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!sl_map || Object.getOwnPropertyNames(sl_map).length === 0) {
        throw new Error('SL_DistanceToolControl map parameter must be defined');
    }


    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_DistanceToolControl options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    // internal reference to the map object
    this.sl_map = sl_map;
    // initialize the distance tool control
    this._init();

    this._initEvents();
};

SL_DistanceToolControl.prototype = {
    _init: function() {
        this.measure_source = new ol.source.Vector();

        var style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 3
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        });

        this.measure_line_layer = new ol.layer.Vector({
            source: this.measure_source,
            style: style
        });

        this.measure_area_layer = new ol.layer.Vector({
            source: this.measure_source,
            style: style
        });

        this.feature = undefined;

        this.line_overlays = [];
        this.area_overlays = [];

        this.draw_line = this._initControl('LineString');
        this.draw_area = this._initControl('Polygon');

    },

    _initEvents: function () {
        var self = this;
        // handle line measurement
        EVENTS.on('control.DistanceTool.activate', function() {
            self.sl_map.map.addInteraction(self.draw_line);
            self.sl_map.map.on('pointermove', self.pointerMoveHandler.bind(self));
            self.sl_map.addControlOverlayLayer(self.measure_line_layer);
        });
        EVENTS.on('control.DistanceTool.deactivate', function() {
            self.feature = undefined;
            self.sl_map.map.removeInteraction(self.draw_line);
            self.sl_map.map.un('pointermove', self.pointerMoveHandler.bind(self));
            self.measure_source.clear(true);
            self.sl_map.removeControlOverlayLayer(self.measure_line_layer);
            // remove overlayes from the map
            _.forEach(self.line_overlays, function (overlay) {
                self.sl_map.map.removeOverlay(overlay);
            });
        });

        // handle area measurement
        EVENTS.on('control.AreaTool.activate', function() {
            self.sl_map.map.addInteraction(self.draw_area);
            self.sl_map.map.on('pointermove', self.pointerMoveHandler, self);
            self.sl_map.addControlOverlayLayer(self.measure_area_layer);
        });
        EVENTS.on('control.AreaTool.deactivate', function() {
            self.feature = undefined;
            self.sl_map.map.removeInteraction(self.draw_area);
            self.sl_map.map.un('pointermove', self.pointerMoveHandler, self);
            self.measure_source.clear(true);
            self.sl_map.removeControlOverlayLayer(self.measure_area_layer);
            // remove overlayes from the map
            _.forEach(self.area_overlays, function (overlay) {
                self.sl_map.map.removeOverlay(overlay);
            });
        });
    },

    _initControl: function(CtrlType) {
        var self = this;
        var draw = new ol.interaction.Draw({
            source: this.measure_source,
            type: /** @type {ol.geom.GeometryType} */ (CtrlType)
        });

        draw.on('drawstart', function(evt) {
            self.feature = evt.feature;

            self.currentTooltip = self.createOverlay();
            if (CtrlType === 'Polygon') {
                self.area_overlays.push(self.currentTooltip);
            } else {
                self.line_overlays.push(self.currentTooltip);
            }
            self.sl_map.map.addOverlay(self.currentTooltip);
        }, this);
        draw.on('drawend', function(evt) {

            self.currentTooltip.getElement().className = 'tooltip tooltip-static';

            self.feature = undefined;
        }, this);

        return draw;
    },

    formatLength: function(line) {
        var length = Math.round(line.getLength() * 100) / 100;
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm';
        }
        return output;
    },

    formatArea: function(polygon) {
        var area = polygon.getArea();
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
        }
        return output;
    },

    returnResult: function(feat) {
        var geom = (feat.getGeometry());
        if (geom instanceof ol.geom.Polygon) {
          return this.formatArea((geom));
        } else if (geom instanceof ol.geom.LineString) {
          return this.formatLength((geom));
        }
    },

    pointerMoveHandler: function(evt) {
        // don't process if user is dragging (panning the map)
        if (evt.dragging) {
            return;
        }

        if (this.feature) {
            var tooltipCoord;
            var geom = (this.feature.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else {
                tooltipCoord = geom.getLastCoordinate();
            }
            this.currentTooltip.getElement().innerHTML = this.returnResult(this.feature);
            this.currentTooltip.setPosition(tooltipCoord);

        }
    },

    createOverlay: function() {
        var measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'tooltip tooltip-measure';
        var measureTooltip = new ol.Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        return measureTooltip;
    }
};

module.exports = SL_DistanceToolControl;
