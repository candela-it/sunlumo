'use strict';

var _ = require('lodash');
var m = require('mithril');

// global events
var EVENTS = require('../../events');


var DistanceTool = function () {
    this.active = m.prop(false);
    this.controlType = m.prop('LineString');
};



var Result = function(data) {
    this.order = m.prop(data.order);
    this.result = m.prop(data.result);
};

var ResultList = Array;


var VIEWMODEL = function (options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function () {
        this.list = new ResultList();

        this.control = new DistanceTool();
    },

    // add layer to the list
    add: function(result) {
        var order = this.list.length + 1;
        this.list.push(new Result({
            'order': order,
            'result': result
        }));
    },

    update: function(result) {
        var lastResult = this.list.length - 1;
        this.list[lastResult].result(result);
        m.redraw(); // TODO: use startComputation, endComputation
    },

    ev_toggleControl: function() {
        if (this.vm.control.active()) {
            this.vm.control.active(false);
            EVENTS.emit('control.DistanceTool.deactivate');
        } else {
            this.vm.control.active(true);
            EVENTS.emit('control.DistanceTool.activate', {
                'CtrlType': this.vm.control.controlType()
            });
        }
    },

    ev_toggleControlType: function(CtrlType) {
        if (CtrlType !== this.vm.control.controlType()) {
            this.vm.control.controlType(CtrlType);
            EVENTS.emit('control.DistanceTool.changedType', {
                'CtrlType': this.vm.control.controlType()
            });
        }
    }
};

module.exports = VIEWMODEL;
