'use strict';

var _ = require('lodash');
var m = require('mithril');

// global events
var EVENTS = require('../events');

var ViewModel = require('./models/distanceTool');

var View = require('./views/distanceTool');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options);
};

var DistanceTool = function(options) {
    this.options = {
        // initial module options
    };

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    this.init();

    return {
        controller: this.controller,
        view: this.view
    };
};

DistanceTool.prototype = {

    init: function() {
        var self = this;
        this.controller = new Controller(this.options, this.initialState);
        this.view = View;

        EVENTS.on('distance.draw.start', function (options) {
            self.controller.vm.add(options.result);
        });
        EVENTS.on('distance.draw.update', function (options) {
            self.controller.vm.update(options.result);
        });
    }
};

module.exports = DistanceTool;