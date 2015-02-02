'use strict';

// global events
var EVENTS = require('../events');

var ViewModel = require('./models/getFeatureInfo');

var View = require('./views/getFeatureInfo');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options);
};

var GetFeatureInfo = function(options) {
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

GetFeatureInfo.prototype = {

    init: function() {
        var self = this;
        this.controller = new Controller(this.options);
        this.view = View;

        EVENTS.on('gfi.results', function(options) {
            self.controller.vm.set(options.features);
        });
    }
};

module.exports = GetFeatureInfo;
