'use strict';

var _ = require('lodash');
var m = require('mithril');

var Jvent = require('jvent');

var SearchResult = function (data) {
    this.id = m.prop(data.id);
    this.geojson = m.prop(data.geojson);
    this.index_value = m.prop(data.index_value);
};

var SearchResultCollection = Array;


// Similarity ViewModel, Controller and View
var VIEWMODEL = function (options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function (options) {
        this.options = options;

        // initialize component events
        this.events = new Jvent();

        this.result_list = new SearchResultCollection();
    },

    // add layer to the result_list
    addResults: function(features) {
        var self = this;

        // empty results list
        this.result_list = new SearchResultCollection();

        _.forEach(features, function (feature) {
            self.result_list.push(
                new SearchResult({
                    id: feature.id,
                    geojson: feature,
                    index_value: feature.properties.index_value
                })
            );
        });

        // if there are some results
        if (this.result_list.length > 0) {
            this.events.emit('results.found');
        } else {
            this.events.emit('results.empty');
        }
    },

    ev_clickResult: function (item) {
        this.vm.events.emit('result.clicked', {geojson: item.geojson()});
    }
};

module.exports = VIEWMODEL;
