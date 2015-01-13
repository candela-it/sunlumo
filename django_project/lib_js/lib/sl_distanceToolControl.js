'use strict';

var m = require('mithril');
var ol = require('../contrib/ol');
var EVENTS = require('./events');

var DistanceTool = function () {
    this.active = m.prop(false);
    this.showDistance = m.prop(false);
    this.distance = m.prop(0);
};



DistanceTool.controller = function() {

    this.control = new DistanceTool();

    // this.activateControl = function() {
    //     this.draw = new ol.interaction.Draw({
    //         source: source,
    //         type: 'LineString'
    //       });
    //       map.addInteraction(draw);
    // };

    this.toggleControl = function() {
        if (this.control.active()) {
            this.control.active(false);
            EVENTS.emit('control.DistanceTool.deactivate');
        } else {
            this.control.active(true);
            EVENTS.emit('control.DistanceTool.activate');
        }
    };
};

DistanceTool.view = function(ctrl) {
    return [
    m('div', {
        'class': (ctrl.control.active()) ? 'toolbox-control active' : 'toolbox-control',
        'onclick': ctrl.toggleControl.bind(ctrl)
    }, [
        m('i', { 'class': 'fi-foot'}),
        m('span', {}, 'UDALJENOST')
    ]),
    m('div', {
        'class': (ctrl.control.active()) ? 'toolbox-control-results' : 'toolbox-control-results hide'
    }, 'test')];
};

m.module(document.getElementById('panelTools'), {controller: DistanceTool.controller, view: DistanceTool.view});

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
        var source = new ol.source.Vector();
        this.draw = new ol.interaction.Draw({
            source: source,
            type: 'LineString'
        });
    },

    _initEvents: function () {
        var self = this;
        EVENTS.on('control.DistanceTool.activate', function() {
            self._activateControl();
        });
        EVENTS.on('control.DistanceTool.deactivate', function() {
            self._deactivateControl();
        });
    },

    _activateControl: function() {
        this.map.addInteraction(this.draw);
    },

    _deactivateControl: function() {
        this.map.removeInteraction(this.draw);
    }
};

module.exports = SL_DistanceToolControl;
