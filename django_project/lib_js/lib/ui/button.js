'use strict';

// global events
var EVENTS = require('../events');

var ViewModel = require('./models/button');

var View = require('./views/button');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options);
};

var Button = function(options) {
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

Button.prototype = {

    init: function() {
        this.controller = new Controller(this.options);
        this.view = View;
    }
};

module.exports = Button;
