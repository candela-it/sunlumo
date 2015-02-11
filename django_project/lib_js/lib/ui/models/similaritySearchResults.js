'use strict';

var _ = require('lodash');
var m = require('mithril');

// global events
var EVENTS = require('../../events');

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
                    'id': feature.id,
                    'geojson': feature,
                    'index_value': feature.properties.index_value
                })
            );
        });

        // if there are some results
        if (this.result_list.length > 0) {
            EVENTS.emit('ss.results.show');
        } else {
            EVENTS.emit('ss.results.hide');
        }
    },

    ev_clickResult: function (item) {
        EVENTS.emit('search.clicked', {'geojson': item.geojson()});
    }
};

module.exports = VIEWMODEL;
