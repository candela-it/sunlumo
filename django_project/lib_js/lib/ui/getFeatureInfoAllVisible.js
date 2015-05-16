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

var GetFeatureInfoAllVisible = function(options) {
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

GetFeatureInfoAllVisible.prototype = {

    init: function() {
        var gfi_controller = new Controller(this.options);
        var gfi_view = View;

        var panel = new UI_Panel(this.options, {
            title: 'Rezultati',
            component: {controller: gfi_controller, view: gfi_view},
            width: '200px',
            top: '56px',
            right: '10px'
        });

        this.controller = panel.controller;
        this.view = panel.view;

        EVENTS.on('getFeatureInfoAllVisible.results', function(options) {
            gfi_controller.vm.set(options.features);
        });

        gfi_controller.vm.events.on('results.show', function(options) {
            panel.controller.vm.show();
        });
        gfi_controller.vm.events.on('results.hide', function(options) {
            panel.controller.vm.hide();
        });

        gfi_controller.vm.events.on('result.click', function(options) {
            EVENTS.emit('getFeatureInfoAllVisible.result.clicked', options);
        });

        panel.controller.vm.events.on('panel.closed', function () {
            EVENTS.emit('getFeatureInfoAllVisible.results.closed');
        });

        EVENTS.on('getFeatureInfoAllVisible.tool.deactivate', function () {
            panel.controller.vm.hide();
        });
    }
};

module.exports = GetFeatureInfoAllVisible;
