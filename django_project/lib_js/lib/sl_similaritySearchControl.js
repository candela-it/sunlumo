'use strict';

var _ = require('lodash');
var m = require('mithril');
var cookie = require('../contrib/cookie');
var ol = require('../contrib/ol');

var EVENTS = require('./events');


var Result = function (data) {
    this.id = m.prop(data.id);
    this.geojson = m.prop(data.geojson);
    this.index = m.prop(data.index);
};

var ResultList = Array;

Result.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = new ResultList();

        vm.search_string = m.prop('');

        vm.map_file = m.prop('');

        vm.resultSource = null;

        vm.geojsonFormat = new ol.format.GeoJSON();
    };

    // add layer to the list
    vm.add = function(id, geojson, index) {
        vm.list.push(new Result({
            'id': id,
            'geojson': geojson,
            'index': index
        }));
    };

    return vm;
}());

var xhrConfig = function(xhr) {
    xhr.setRequestHeader('Content-Type', 'application/json');
    // read csrftoken form the cookie and set header
    xhr.setRequestHeader('X-CSRFToken', cookie.get('csrftoken'));
};

Result.controller = function() {
    Result.vm.init();

    this.clickSearch = function() {
        m.request({
            config: xhrConfig,
            method: 'POST',
            url: '/api/search',
            // json encoded data
            data: {
                'map_file': Result.vm.map_file(),
                'search_string': Result.vm.search_string()
            }
        }).then(function (response) {
            // clear current result list
            Result.vm.list = new ResultList();

            _.forEach(response.features, function (feature) {
                Result.vm.add(feature.id, feature, feature.properties.index);
            });
        });
    };

    this.inputChanged = function (event) {
        // set the changed value
        Result.vm.search_string(event.originalTarget.value);
    };

    this.keypressAction = function (event) {
        if (event.key === 'Enter') {
            // read search string
            Result.vm.search_string(event.originalTarget.value);
            // execute search
            this.clickSearch();
        }
    };
    this.clickResult = function (item) {
        Result.vm.resultSource.clear(true);
        Result.vm.resultSource.addFeatures(
            Result.vm.geojsonFormat.readFeatures(item.geojson())
        );

        EVENTS.emit('.map.fitExtent', {'extent': Result.vm.resultSource.getExtent()});
    };
};

Result.view = function(ctrl) {
    return m('div', {}, [
        m('input', {
            'onchange':ctrl.inputChanged.bind(ctrl),
            'onkeypress':ctrl.keypressAction.bind(ctrl)
        }),
        m('button', {'onclick':ctrl.clickSearch.bind(ctrl)}, 'Search'),
        m('ul', [
            Result.vm.list.map(function(item) {
                return m('li', {
                    'onclick': ctrl.clickResult.bind(ctrl, item)
                }, item.index());
            })]
        )]
    );
};

m.module(document.getElementById('panelSearch'), {controller: Result.controller, view: Result.view});

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

        // set map file for search requests
        // this assumes that Result.vm has been initialized by Mithril controler
        // TODO: refactor viewmodel to be shared with SimilaritySearchControl
        Result.vm.map_file(this.options.map);

        Result.vm.resultSource = this.SL_Result_Source;
    },
    _handleEvents: function() {
        var self = this;
        EVENTS.on('.map.fitExtent', function (options) {
            self.map.getView().fitExtent(options.extent, self.map.getSize());
        });
    }
};

module.exports = SL_SimilaritySearchControl;