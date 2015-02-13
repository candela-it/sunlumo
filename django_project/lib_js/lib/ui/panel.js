'use strict';

var ViewModel = require('./models/panel');

var View = require('./views/panel');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options);
};

var Panel = function(options, component) {
    this.component = component;
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

Panel.prototype = {
    init: function() {
        this.controller = new Controller(this.options);
        this.view = View;

        this.controller.vm.addComponent(this.component);
    }
};

module.exports = Panel;
