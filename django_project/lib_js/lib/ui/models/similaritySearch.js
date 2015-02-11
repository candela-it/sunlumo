'use strict';

var _ = require('lodash');
var m = require('mithril');
var cookie = require('../../../contrib/cookie');

// global events
var EVENTS = require('../../events');

var xhrConfig = function(xhr) {
    xhr.setRequestHeader('Content-Type', 'application/json');
    // read csrftoken form the cookie and set header
    xhr.setRequestHeader('X-CSRFToken', cookie.get('csrftoken'));
};


var SimilarityIndex = function (data) {
    this.index_name = m.prop(data.index_name);
    this.visible = m.prop(data.visible);
};

var SimilarityIndexCollection = Array;


// Similarity ViewModel, Controller and View
var VIEWMODEL = function (options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function (options) {
        var self = this;

        this.options = options;

        this.index_list = new SimilarityIndexCollection();

        this.search_string = m.prop('');

        this.map_file = m.prop(this.options.map);

        // Add available indices to the viewmodel
        _.forEach(this.options.similarity_indices, function (index) {
            self.index_list.push(new SimilarityIndex({
                'index_name': index,
                'visible': true
            }));
        });

    },

    getSearchLayers: function() {
        var search_layers = [];

        _.forEach(this.index_list, function (index) {
            if (index.visible() === true) {
                search_layers.push(index.index_name());
            }
        });
        return search_layers;
    },
    ev_clickSearch: function() {
        m.request({
            config: xhrConfig,
            method: 'POST',
            url: '/api/search',
            // json encoded data
            data: {
                'map_file': this.vm.map_file(),
                'search_string': this.vm.search_string(),
                'search_layers': this.vm.getSearchLayers()
            }
        }).then(function (response) {
            EVENTS.emit('ss.results', {
                'features': response.features
            });
        });
    },

    ev_inputChanged: function (event) {
        // set the changed value
        this.vm.search_string(event.currentTarget.value);
    },

    ev_keypressAction: function (event) {
        if (event.key === 'Enter') {
            // read search string
            this.vm.search_string(event.currentTarget.value);
            // execute search
            this.clickSearch();
        }
    },

    ev_clickIndex: function (index) {
        if (index.visible() === true) {
            index.visible(false);
        } else {
            index.visible(true);
        }
    }
};

module.exports = VIEWMODEL;
