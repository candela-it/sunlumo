'use strict';

var View = require('./views/layerControl').view;
var Controller = require('./views/layerControl').controller;

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

    init: function(){
        this.controller = this.Controller(this.options);
        this.view = View;
    }
};

module.exports = LayerController;