'use strict';

var _ = require('lodash');
var m = require('mithril');
var cookie = require('../contrib/cookie');
var ol = require('../contrib/ol');

// internal events
var jvents = require('jvent');

var events = new jvents();

var SearchResult = function (data) {
    this.id = m.prop(data.id);
    this.geojson = m.prop(data.geojson);
    this.index_value = m.prop(data.index_value);
};

var SearchResultCollection = Array;


var SimilarityIndex = function (data) {
    this.index_name = m.prop(data.index_name);
    this.visible = m.prop(data.visible);
};

var SimilarityIndexCollection = Array;


// Similarity ViewModel, Controller and View
var SimilaritySearch = {};

SimilaritySearch.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.result_list = new SearchResultCollection();
        vm.index_list = new SimilarityIndexCollection();

        vm.search_string = m.prop('');
        vm.map_file = m.prop('');
        vm.resultSource = null;

        vm.geojsonFormat = new ol.format.GeoJSON();
    };

    // add layer to the result_list
    vm.add = function(id, geojson, index_value) {
        vm.result_list.push(new SearchResult({
            'id': id,
            'geojson': geojson,
            'index_value': index_value
        }));
    };

    vm.getSearchLayers = function() {
        var search_layers = [];
        _.forEach(SimilaritySearch.vm.index_list, function (index) {
            if (index.visible() === true) {
                search_layers.push(index.index_name());
            }
        });
        return search_layers;
    };

    return vm;
}());

var xhrConfig = function(xhr) {
    xhr.setRequestHeader('Content-Type', 'application/json');
    // read csrftoken form the cookie and set header
    xhr.setRequestHeader('X-CSRFToken', cookie.get('csrftoken'));
};

SimilaritySearch.controller = function() {

    this.clickSearch = function() {
        m.request({
            config: xhrConfig,
            method: 'POST',
            url: '/api/search',
            // json encoded data
            data: {
                'map_file': SimilaritySearch.vm.map_file(),
                'search_string': SimilaritySearch.vm.search_string(),
                'search_layers': SimilaritySearch.vm.getSearchLayers()
            }
        }).then(function (response) {
            // clear current result list
            SimilaritySearch.vm.result_list = new SearchResultCollection();

            _.forEach(response.features, function (feature_geojson) {
                SimilaritySearch.vm.add(
                    feature_geojson.id, feature_geojson, feature_geojson.properties.index_value
                );
            });
        });
    };

    this.inputChanged = function (event) {
        // set the changed value
        SimilaritySearch.vm.search_string(event.originalTarget.value);
    };

    this.keypressAction = function (event) {
        if (event.key === 'Enter') {
            // read search string
            SimilaritySearch.vm.search_string(event.originalTarget.value);
            // execute search
            this.clickSearch();
        }
    };
    this.clickResult = function (item) {
        SimilaritySearch.vm.resultSource.clear(true);
        SimilaritySearch.vm.resultSource.addFeatures(
            SimilaritySearch.vm.geojsonFormat.readFeatures(item.geojson())
        );

        events.emit('.map.fitExtent', {'extent': SimilaritySearch.vm.resultSource.getExtent()});
    };

    this.clickIndex = function (index) {
        if (index.visible() === true) {
            index.visible(false);
        } else {
            index.visible(true);
        }
    };
};

SimilaritySearch.view = function(ctrl) {
    return m('div', {}, [
        SimilaritySearch.vm.index_list.map(function(index) {
                return m('label', index.index_name(), [
                    m('input[type=checkbox]', {
                        'onclick': ctrl.clickIndex.bind(ctrl, index),
                        'checked': index.visible()
                    })
                ]);
        }),
        m('input', {
            'onchange':ctrl.inputChanged.bind(ctrl),
            'onkeypress':ctrl.keypressAction.bind(ctrl)
        }),
        m('button', {'onclick':ctrl.clickSearch.bind(ctrl)}, 'Search'),
        m('ul', [
            SimilaritySearch.vm.result_list.map(function(item) {
                return m('li', {
                    'onclick': ctrl.clickResult.bind(ctrl, item)
                }, item.index_value());
            })]
        )]
    );
};

var SL_SimilaritySearchControl = function (map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!map || Object.getOwnPropertyNames(map).length === 0) {
        throw new Error('SL_SimilaritySearchControl map parameter must be defined');
    }


    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_SimilaritySearchControl options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    // internal reference to the map object
    this.map = map;

    // initialize the getfeatureinfo control
    this._init();

    // bind event handlers
    this._handleEvents();
};


SL_SimilaritySearchControl.prototype = {
    _init: function() {

        this.SL_Result_Source = new ol.source.Vector();

        this.SL_Result_Layer = new ol.layer.Vector({
            source: this.SL_Result_Source
        });

        // initiliaze viewmodel
        SimilaritySearch.vm.init();

        SimilaritySearch.vm.map_file(this.options.map);

        SimilaritySearch.vm.resultSource = this.SL_Result_Source;

        // Add available indices to the viewmodel
        _.forEach(this.options.similarity_indices, function (index) {
            SimilaritySearch.vm.index_list.push(new SimilarityIndex({
                'index_name': index,
                'visible': true
            }));
        });

        m.module(document.getElementById('panelSearch'), {controller: SimilaritySearch.controller, view: SimilaritySearch.view});
    },
    _handleEvents: function() {
        var self = this;
        events.on('.map.fitExtent', function (options) {
            self.map.getView().fitExtent(options.extent, self.map.getSize());
        });
    }
};

module.exports = SL_SimilaritySearchControl;