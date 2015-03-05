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
        var button = new UI_Button({
            style: 'i.fa.fa-magic',
            title: 'Pronađi objekt (svi vidljivi slojevi)'
        });

        this.controller = button.controller;
        this.view = button.view;

        button.controller.vm.events.on('button.activated', function () {
            EVENTS.emit('getFeatureInfoAllVisible.tool.activate');
        });
        button.controller.vm.events.on('button.deactivated', function () {
            EVENTS.emit('getFeatureInfoAllVisible.tool.deactivate');
        });
    }
};

module.exports = GFITool;
