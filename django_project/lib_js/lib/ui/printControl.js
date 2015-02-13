'use strict';

// global events
var EVENTS = require('../events');

var ViewModel = require('./models/printControl');

var View = require('./views/printControl');

var UI_Panel = require('./panel');

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
    this.initEvents();

    return {
        controller: this.controller,
        view: this.view
    };
};

PrintControl.prototype = {
    init: function() {
        this.print_controller = new Controller(this.options, this.initialState);
        this.print_view = View;

        this.panel = new UI_Panel(this.options, {
            title: 'Print',
            component: {controller: this.print_controller, view: this.print_view},
            width: '200px',
            top: '56px',
            right: '50px'
        });

        this.controller = this.panel.controller;
        this.view = this.panel.view;
    },

    initEvents: function() {
        var self = this;
        EVENTS.on('print.area.updated', function(options) {
            self.print_controller.vm.params.bbox = options.bbox;
            self.print_controller.vm.updatePrintUrl();
        });

        EVENTS.on('layers.updated', function(options) {
            self.print_controller.vm.params.layers = options.layers;
            self.print_controller.vm.params.transparencies = options.transparencies;

            self.print_controller.vm.updatePrintUrl();
        });

        EVENTS.on('control.Print.activate', function () {
            self.panel.controller.vm.show();
        });

        EVENTS.on('control.Print.deactivate', function () {
            self.panel.controller.vm.hide();
        });

        self.panel.controller.vm.events.on('panel.closed', function () {
            EVENTS.emit('control.Print.deactivate');
        });
    }
};

module.exports = PrintControl;
