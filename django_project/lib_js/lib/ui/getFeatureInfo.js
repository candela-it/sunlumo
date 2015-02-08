'use strict';

// global events
var EVENTS = require('../events');

var ViewModel = require('./models/getFeatureInfo');

var View = require('./views/getFeatureInfo');

var UI_Panel = require('./panel');

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
        var gfi_controller = new Controller(this.options);
        var gfi_view = View;

        var panel = new UI_Panel(this.options, {
            'title': 'Rezultati',
            'component': {controller: gfi_controller, view: gfi_view},
            'width': '200px',
            'top': '56px',
            'left': '350px'
        });

        this.controller = panel.controller;
        this.view = panel.view;

        EVENTS.on('gfi.results', function(options) {
            gfi_controller.vm.set(options.features);
        });

        EVENTS.on('gfi.results.show', function(options) {
            panel.controller.vm.show();
        });
        EVENTS.on('gfi.results.hide', function(options) {
            panel.controller.vm.hide();
        });

        panel.controller.vm.events.on('panel.closed', function () {
            EVENTS.emit('gfi.results.closed');
        });
    }
};

module.exports = GetFeatureInfo;
