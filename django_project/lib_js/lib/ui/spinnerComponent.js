'use strict';

var EVENTS = require('../events');

var ViewModel = require('./models/spinnerComponent');

var View = require('./views/spinnerComponent');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options);
};

var SpinnerComponent = function(options) {
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

SpinnerComponent.prototype = {

    init: function() {
        var self = this;
        this.controller = new Controller(this.options);
        this.view = View;

        EVENTS.on('spinner.activate', function() {
            self.controller.vm.activate();
        });

        EVENTS.on('spinner.deactivate', function() {
            self.controller.vm.deactivate();
        });
    }
};

module.exports = SpinnerComponent;
