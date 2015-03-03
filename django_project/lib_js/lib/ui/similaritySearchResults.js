'use strict';

var EVENTS = require('./../events');

var ViewModel = require('./models/similaritySearchResults');

var View = require('./views/similaritySearchResults');

var UI_Panel = require('./panel');

var Controller = function(options) {
    // initialize VM, and that's all a controller should EVER do, everything
    // else is handled by the vm and model
    this.vm = new ViewModel(options);
};

var SimilaritySearchResults = function(options) {
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

SimilaritySearchResults.prototype = {

    init: function() {
        var ssr_controller = new Controller(this.options);
        var ssr_view = View;

        var panel = new UI_Panel(this.options, {
            title: 'Rezultati',
            component: {controller: ssr_controller, view: ssr_view},
            width: '200px',
            top: '56px',
            left: '550px'
        });

        this.controller = panel.controller;
        this.view = panel.view;

        EVENTS.on('similaritySearch.results', function (options) {
            ssr_controller.vm.addResults(options.features);
        });

        ssr_controller.vm.events.on('results.found', function(options) {
            panel.controller.vm.show();
        });
        ssr_controller.vm.events.on('results.empty', function(options) {
            panel.controller.vm.hide();
        });
        ssr_controller.vm.events.on('result.clicked', function(options) {
            EVENTS.emit('similaritySearch.result.clicked', options);
        });

        panel.controller.vm.events.on('panel.closed', function () {
            EVENTS.emit('similaritySearch.results.closed');
        });
    }
};

module.exports = SimilaritySearchResults;
