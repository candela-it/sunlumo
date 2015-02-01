'use strict';

var m = require('mithril');
var ol = require('../contrib/ol');
var EVENTS = require('./events');


var SL_DistanceToolControl = function (map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!map || Object.getOwnPropertyNames(map).length === 0) {
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
    this.map = map;

    // initialize the distance tool control
    this._init();

    this._initEvents();

};

SL_DistanceToolControl.prototype = {
    _init: function() {
        this.source = new ol.source.Vector();
    },

    _initEvents: function () {
        var self = this;
        EVENTS.on('control.DistanceTool.activate', function(payload) {
            self._activateControl(payload.CtrlType);
        });
        EVENTS.on('control.DistanceTool.deactivate', function() {
            self._deactivateControl();
        });
        EVENTS.on('control.DistanceTool.changedType', function(payload) {
            self._changeControlType(payload.CtrlType);
        });
    },

    _initControl: function(CtrlType) {
        var self = this;
        this.draw = new ol.interaction.Draw({
            source: this.source,
            type: /** @type {ol.geom.GeometryType} */ (CtrlType)
        });
        this.draw.on('drawstart', function(evt) {
            EVENTS.emit('distance.draw.start', {
                'result': self.returnResult(evt.feature)
            });
        });
        this.draw.on('drawend', function(evt) {
            EVENTS.emit('distance.draw.update', {
                'result': self.returnResult(evt.feature)
            });
        });
    },

    _activateControl: function(CtrlType) {
        this._initControl(CtrlType);
        this.map.addInteraction(this.draw);
    },

    _deactivateControl: function() {
        this.map.removeInteraction(this.draw);
    },

    _changeControlType: function(CtrlType) {
        this._deactivateControl();
        this._activateControl(CtrlType);
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
            output = (Math.round(area * 100) / 100) + ' ' + 'm2>';
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
    }
};

module.exports = SL_DistanceToolControl;
