'use strict';

var _ = require('lodash');
var m = require('mithril');

// global events
var EVENTS = require('../events');

var ViewModel = require('./models/similaritySearch');

var View = require('./views/similaritySearch');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options);
};

var SimilaritySearch = function(options) {
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

SimilaritySearch.prototype = {

    init: function(){
        this.controller = new Controller(this.options);
        this.view = View;
    }
};

module.exports = SimilaritySearch;
