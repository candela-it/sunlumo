'use strict';

var _ = require('lodash');

var SLProject = function (options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SLProject options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }


    // check if we got right flavour of options
    this._checkOptions();

    // initialize the client
    this._init();
};


SLProject.prototype = {

    _init: function (){
        // initialize
    },

    _checkOptions: function () {
        var self = this;
        var properties = Object.getOwnPropertyNames(this.options);

        if (!_.contains(properties, 'layers')) {
            throw new Error('SLProject options must contain "layers" property');
        }

        if (!_.contains(properties, 'layers_order')) {
            throw new Error('SLProject options must contain "layers_order" property');
        }

        if (Object.getOwnPropertyNames(this.options.layers).length === 0) {
            throw new Error('SLProject "layers" must not be empty');
        }

        var layer_keys = Object.getOwnPropertyNames(this.options.layers);

        var allLayersAreOrdered = _.every(layer_keys, function(layer_key) {
            if (_.contains(self.options.layers_order, layer_key)) {
                return true;
            } else {
                return false;
            }
        });

        if (!allLayersAreOrdered) {
            throw new Error('SLProject "layers" and "layers_order" are not matching');
        }

        if (Object.getOwnPropertyNames(this.options.layers).length === 0) {
            throw new Error('SLProject "layers" must not be empty');
        }
    },

    getLayersParam: function () {
        return this.options.layers_order.join(',');  // return comma concatenated string
    }
};

module.exports = SLProject;