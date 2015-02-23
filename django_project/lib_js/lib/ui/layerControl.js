'use strict';

var LayerControlViewModel = require('./models/layerControl');

var View = require('./views/layerControl');

// global events
var EVENTS = require('../events');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new LayerControlViewModel(options);
};


var LayerController = function(options) {
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

LayerController.prototype = {

    init: function() {
        var self = this;

        this.controller = new Controller(this.options);
        this.view = View;

        // notify other components that layers have been initialized
        EVENTS.emit('layerControl.layers.initialized', {
            layers: this.controller.vm.getLayersParam(),
            transparencies: this.controller.vm.getTransparencyParam()
        });

        this.controller.vm.events.on('layers.updated', function (options) {
            EVENTS.emit('layerControl.layers.updated', options);
        });

        this.controller.vm.events.on('query.layers.updated', function (options) {
            EVENTS.emit('layerControl.query.layers.updated', options);
        });

        EVENTS.on('layerControl.get.queryLayers', function (data) {
            if (data.type === 'query') {
                data.callback(self.controller.vm.getQueryLayersParam());
            } else if (data.type === 'visible') {
                data.callback(self.controller.vm.getLayersParam());
            } else {
                throw new Error('Unsupported layer type for getFeatureInfo');
            }
        });
    }
};

module.exports = LayerController;
