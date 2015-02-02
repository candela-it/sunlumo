'use strict';

// global events
var EVENTS = require('../events');

var ViewModel = require('./models/printControl');

var View = require('./views/printControl');

var Controller = function(options, initialState) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options, initialState);
};

var PrintControl = function(options, initialState) {
    this.options = {
        // initial module options
    };

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    this.initialState = initialState;
    this.init();

    return {
        controller: this.controller,
        view: this.view
    };
};

PrintControl.prototype = {

    init: function() {
        var self = this;
        this.controller = new Controller(this.options, this.initialState);
        this.view = View;

        EVENTS.on('print.area.updated', function(options) {
            self.controller.vm.params.bbox = options.bbox;
            self.controller.vm.updatePrintUrl();
        });

        EVENTS.on('layers.updated', function(options) {
            self.controller.vm.params.layers = options.layers;
            self.controller.vm.params.transparencies = options.transparencies;

            self.controller.vm.updatePrintUrl();
        });
    }
};

module.exports = PrintControl;