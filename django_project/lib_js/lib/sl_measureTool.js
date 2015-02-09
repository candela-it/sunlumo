'use strict';

var ol = require('../contrib/ol');
var EVENTS = require('./events');


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

        this.draw_line = this._initControl('LineString');
        this.draw_area = this._initControl('Polygon');
    },

    _initEvents: function () {
        var self = this;
        EVENTS.on('control.DistanceTool.activate', function() {
            self.sl_map.map.addInteraction(self.draw_line);
            self.sl_map.map.on('pointermove', self.pointerMoveHandler, self);
            self.sl_map.addControlOverlayLayer(self.measure_line_layer);
        });
        EVENTS.on('control.DistanceTool.deactivate', function() {
            self.sl_map.map.removeInteraction(self.draw_line);
            self.sl_map.map.un('pointermove', self.pointerMoveHandler, self);
            self.measure_source.clear(true);
            self.sl_map.removeControlOverlayLayer(self.measure_line_layer);
        });

        EVENTS.on('control.AreaTool.activate', function() {
            self.sl_map.map.addInteraction(self.draw_area);
            self.sl_map.map.on('pointermove', self.pointerMoveHandler, self);
            self.sl_map.addControlOverlayLayer(self.measure_area_layer);
        });
        EVENTS.on('control.AreaTool.deactivate', function() {
            self.sl_map.map.removeInteraction(self.draw_area);
            self.sl_map.map.un('pointermove', self.pointerMoveHandler, self);
            self.measure_source.clear(true);
            self.sl_map.removeControlOverlayLayer(self.measure_area_layer);
        });
    },

    _initControl: function(CtrlType) {
        var self = this;
        var draw = new ol.interaction.Draw({
            source: this.measure_source,
            type: /** @type {ol.geom.GeometryType} */ (CtrlType)
        });

        draw.on('drawstart', function(evt) {
            // EVENTS.emit('distance.draw.start', {
            //     'result': self.returnResult(evt.feature)
            // });
            self.feature = evt.feature;
        }, this);
        draw.on('drawend', function(evt) {
            self.feature = undefined;
            // EVENTS.emit('distance.draw.update', {
            //     'result': self.returnResult(evt.feature)
            // });
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
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km2';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm2';
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
            EVENTS.emit('distance.draw.update', {
                'result': this.returnResult(this.feature)
            });
        }
    }
};

module.exports = SL_DistanceToolControl;
