'use strict';

var _ = require('lodash');
var m = require('mithril');

var EVENTS = require('./events');

var layer = {};

layer.Layer = function (data) {
    this.name = m.prop(data.name);
    this.visibility = m.prop(data.visibility);
};

layer.LayerList = Array;

layer.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = new layer.LayerList();
        vm.name = m.prop('');
        vm.visibility = m.prop(true);

        vm.add = function(name, visibility) {
            vm.list.push(new layer.Layer({
                'name': name,
                'visibility': visibility
            }));
        };
    };
    return vm;
}());

layer.controller = function() {
    layer.vm.init();
    layer.vm.add('Cres  Corine LC', true);
    layer.vm.add('Cres obala', true);
    layer.vm.add('hillshade', true);

    this.items = layer.vm.list;
    this.dragging = m.prop(undefined);

    this.sort = function (layers, dragging) {
        // set new layers
        this.items = layers;
        // track dragging element
        this.dragging = m.prop(dragging);
    };

    this.dragStart = function(e) {
        // get the data-id of the dragged element
        this.dragged = Number(e.currentTarget.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', null);
    };

    this.dragOver = function(e) {
        e.preventDefault();

        var over = e.currentTarget;
        var dragging = this.dragging();
        var from = isFinite(dragging) ? dragging : this.dragged;
        var to = Number(over.dataset.id);

        if((e.clientY - over.offsetTop) > (over.offsetHeight / 2)) {
            to++;
        }
        if(from < to) {
            to--;
        }

        var layers = this.items;
        layers.splice(to, 0, layers.splice(from, 1)[0]);
        this.sort(layers, to);
    };
    this.dragEnd = function() {
        this.sort(this.items, undefined);
        EVENTS.emit('layer.order.updated', {
            'layers': this.items
        });
    };
};

layer.view = function(ctrl) {
    return m('div', {'class': 'layer_list'}, [
        layer.vm.list.map(function(item, index) {
            var dragging = (index === ctrl.dragging()) ? 'dragging' : '';

            return m('div', {
              'data-id': index,
              'class': dragging,
              'draggable': 'true',
              'ondragstart': ctrl.dragStart.bind(ctrl),
              'ondragover': ctrl.dragOver.bind(ctrl),
              'ondragend': ctrl.dragEnd.bind(ctrl)
            }, item.name());
        })
    ]);
};

m.module(document.getElementById('sidebar'), {controller: layer.controller, view: layer.view});


var SL_LayerControl = function (options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_LayerControl options parameter must be defined');
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


SL_LayerControl.prototype = {

    _init: function (){
        // initialize
    },

    _checkOptions: function () {
        var self = this;
        var properties = Object.getOwnPropertyNames(this.options);

        if (!_.contains(properties, 'layers')) {
            throw new Error('SL_LayerControl options must contain "layers" property');
        }

        if (Object.getOwnPropertyNames(this.options.layers).length === 0) {
            throw new Error('SL_LayerControl "layers" must not be empty');
        }

        if (!_.contains(properties, 'layers_order')) {
            throw new Error('SL_LayerControl options must contain "layers_order" property');
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
            throw new Error('SL_LayerControl "layers" and "layers_order" are not matching');
        }

    },

    getLayersParam: function () {
        return this.options.layers_order.join(',');  // return comma concatenated string
    }
};

module.exports = SL_LayerControl;