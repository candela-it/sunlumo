'use strict';

var _ = require('lodash');
var m = require('mithril');
// var ol = require('../contrib/ol');

// var EVENTS = require('./events');


var Result = function (data) {
    this.id = m.prop(data.id);
    this.geometry = m.prop(data.geometry);
};

var ResultList = Array;

Result.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = new ResultList();
    };

    // add layer to the list
    vm.add = function(id, geometry) {
        vm.list.push(new Result({
            'id': id,
            'geometry': geometry
        }));
    };

    return vm;
}());

Result.controller = function() {
    Result.vm.init();

    this.items = Result.vm.list;

    this.clickSearch = function() {
        m.request({
            method: 'GET',
            url: '/search'
        }).then(function (response) {
            _.forEach(response.features, function (feature) {
                Result.vm.add(feature.id, feature.geometry);
            });
        });
    };
};

Result.view = function(ctrl) {
    return m('div', {}, [
        m('input'),
        m('button', {'onclick':ctrl.clickSearch.bind(ctrl)}, 'Search'),
        m('ul', [
            ctrl.items.map(function(item) {
                return m('li', item.id());
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

};


SL_SimilaritySearchControl.prototype = {
    _init: function() {
        // m.redraw(true);
    }
};

module.exports = SL_SimilaritySearchControl;