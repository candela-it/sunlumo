'use strict';

var m = require('mithril');
var ol = require('../contrib/ol');
var EVENTS = require('./events');

var DistanceTool = function () {
    this.active = m.prop(false);
    this.controlType = m.prop('LineString');
};



var Result = function(data) {
    this.order = m.prop(data.order);
    this.result = m.prop(data.result);

    this.update = function(result) {
        this.result(result);
    };
};

var ResultList = Array;

DistanceTool.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = new ResultList();
    };

    // add layer to the list
    vm.add = function(result) {
        var order = vm.list.length + 1;
        vm.list.push(new Result({
            'order': order,
            'result': result
        }));
        console.log('added');
    };

    vm.update = function(result) {
        var lastResult = vm.list.length -1;
        vm.list[lastResult].update(result);
        console.log('updated');
    };

    return vm;
}());

DistanceTool.controller = function() {
    DistanceTool.vm.init();

    this.control = new DistanceTool();

    this.toggleControl = function() {
        if (this.control.active()) {
            this.control.active(false);
            EVENTS.emit('control.DistanceTool.deactivate');
        } else {
            this.control.active(true);
            EVENTS.emit('control.DistanceTool.activate', {
                'CtrlType': this.control.controlType()
            });
        }
    };

    this.toggleControlType = function(CtrlType) {
        if (CtrlType !== this.control.controlType()) {
            this.control.controlType(CtrlType);
            EVENTS.emit('control.DistanceTool.changedType', {
                'CtrlType': this.control.controlType()
            });
        }
    };
};

DistanceTool.view = function(ctrl) {
    return [
    m('div', {
        'class': (ctrl.control.active()) ? 'button small controlButton' : 'button small info controlButton',
        'onclick': ctrl.toggleControl.bind(ctrl)
    }, [
        m('i', { 'class': 'fi-foot'})
    ]),
    m('div', {
        'class': (ctrl.control.active()) ? 'toolbox-control-results panel' : 'toolbox-control-results panel hide'
    }, [
        m('div', { 'class': 'heading' }, 'Alati za mjerenje'),
        m('div', { 'class': 'content' }, [
            m('div', { 'class': 'text-center' }, [
                m('ul', { 'class': 'button-group'}, [
                    m('li', {}, m('a', {
                        'class': (ctrl.control.controlType() === 'LineString') ? 'button tiny' : 'button tiny info',
                        'onclick': ctrl.toggleControlType.bind(ctrl, 'LineString')
                    }, 'Udaljenost')),
                    m('li', {}, m('a', {
                        'class': (ctrl.control.controlType() === 'Polygon') ? 'button tiny' : 'button tiny info',
                        'onclick': ctrl.toggleControlType.bind(ctrl, 'Polygon')
                    }, 'Površina')),
                ])
            ]),
            m('div', {}, [
                m('ul', {}, [
                    DistanceTool.vm.list.map(function(item) {
                        return m('li', {}, item.result());
                    })
                ])
            ])
        ])
    ])];
};

m.module(document.getElementById('distanceToolControl'), {controller: DistanceTool.controller, view: DistanceTool.view});

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
            DistanceTool.vm.add(self.returnResult(evt.feature));
        });
        this.draw.on('drawend', function(evt) {
            DistanceTool.vm.update(self.returnResult(evt.feature));
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
