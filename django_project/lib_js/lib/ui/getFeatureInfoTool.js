'use strict';

// global events
var EVENTS = require('../events');

var UI_Button = require('./button');

var GFITool = function(options) {
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

GFITool.prototype = {

    init: function() {
        var self = this;
        // this.controller = new Controller(this.options);
        // this.view = View;

        var button = new UI_Button({
            'style': 'i.fa.fa-info-circle'
        });

        this.controller = button.controller;
        this.view = button.view;

        button.controller.vm.events.on('button.activated', function () {
            EVENTS.emit('control.GFI.activate');
        });
        button.controller.vm.events.on('button.deactivated', function () {
            EVENTS.emit('control.GFI.deactivate');
        });
    }
};

module.exports = GFITool;
