'use strict';

// global events
var EVENTS = require('../events');

var ViewModel = require('./models/accordion');

var View = require('./views/accordion');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options);
};

var Accordion = function(options, components) {

    this.components = components;
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

Accordion.prototype = {

    init: function() {
        var self = this;
        this.controller = new Controller(this.options);
        this.view = View;

        this.controller.vm.addComponents(this.components);
    }
};

module.exports = Accordion;