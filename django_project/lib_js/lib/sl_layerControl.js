'use strict';

var _ = require('lodash');
var m = require('mithril');

var EVENTS = require('./events');

var Layer = function (data) {
    this.l_id = m.prop(data.l_id);
    this.name = m.prop(data.name);
    this.visible = m.prop(data.visible);
};

var LayerList = Array;

Layer.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = new LayerList();
    };

    // add layer to the list
    vm.add = function(id, name, visible) {
        vm.list.push(new Layer({
            'l_id': id,
            'name': name,
            'visible': visible
        }));
    };

    return vm;
}());

Layer.controller = function() {
    Layer.vm.init();

    this.items = Layer.vm.list;
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

Layer.view = function(ctrl) {
    return m('div', {'class': 'layer_list'}, [
        Layer.vm.list.map(function(item, index) {
            var dragging = (index === ctrl.dragging()) ? 'dragging' : '';

            return m('div', {
              'data-id': index,
              'class': dragging,
              'draggable': 'true',
              'ondragstart': ctrl.dragStart.bind(ctrl),
              'ondragover': ctrl.dragOver.bind(ctrl),
              'ondragend': ctrl.dragEnd.bind(ctrl)
            }, [
                m('input[type=checkbox]', {
                    'id': item.l_id(),
                    'checked': item.visible(),
                    'onchange': m.withAttr('checked', item.visible)
                }),
                item.name()
            ]);
        })
    ]);
};

m.module(document.getElementById('sidebar'), {controller: Layer.controller, view: Layer.view});


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
        var self = this;

        // add layers to the control, maintaining the initial order
        _.forEach(this.options.layers_order, function (l_id) {
            var layer = self.options.layers[l_id];
            Layer.vm.add(l_id, layer.layer_name, layer.visible);
        });
        // force redraw
        m.redraw(true);
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