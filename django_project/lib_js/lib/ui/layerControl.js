'use strict';

var _ = require('lodash');
var m = require('mithril');

// global events
var EVENTS = require('../events');

// local events
var jvents = require('jvent');
var events = new jvents();

var layerContorlViewModel = require('./models/layerControl');

var View = require('./views/layerControl');



var Controller = function(options) {

    this.dragged_item = m.prop();

    // initialize VM
    this.vm = new layerContorlViewModel(options);

    this.items = this.vm.layerTree;
};

Controller.prototype = {

    sort: function (layers, dragged_item) {
        // set new layers
        this.items = layers;
        // track dragging element
        this.dragged_item = m.prop(dragged_item);
    },

    dragStart: function(e) {
        // Fix for Firefox (maybe others), prevents dragstart event bubbling
        // on range input elements
        if (document.activeElement.type === 'range') {
            return false; // block dragging
        }

        // get the index (position in a list) of the dragged element
        this.cur_dragged = Number(e.currentTarget.dataset.id);
        e.dataTransfer.effectAllowed = 'move';

        // HACK: don't show dragging ghost image
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 1, 1);
        e.dataTransfer.setDragImage(canvas, 0, 0);

        // we need to set some data to trigger ondragover element
        e.dataTransfer.setData('text/html', undefined);

    },

    dragOver: function(e) {
        // element that's being currently dragged over
        var over = e.currentTarget;

        var dragged_item = this.dragged_item();

        var previous_pos = isFinite(dragged_item) ? dragged_item : this.cur_dragged;
        var next_pos = Number(over.dataset.id);

        if((e.clientY - over.offsetTop) > (over.offsetHeight / 2)) {
            next_pos++;
        }
        if(previous_pos < next_pos) {
            next_pos--;
        }

        var layers = this.items;
        layers.splice(next_pos, 0, layers.splice(previous_pos, 1)[0]);
        this.sort(layers, next_pos);

        // it's important to prevent event bubbling as it would trigger ondragstart
        // when dragging over 'draggable' elements
        return false;
    },

    dragEnd: function() {
        this.sort(this.items, undefined);
        events.emit('.layers.updated', {
            'layers': this.items
        });
    },

    layerToggle: function (item) {
        if (item.visible()) {
            item.visible(false);
        } else {
            item.visible(true);
        }
        events.emit('.layers.updated');
    },

    queryLayerToggle: function (item) {
        if (item.query()) {
            item.query(false);
        } else {
            item.query(true);
        }
    },

    queryGroupToggle: function(item) {
          if (item.query()) {
            item.query(false);

            _.forEach(item.layers(), function (layer) {
                layer.query(false);
            });
        } else {
            item.query(true);

            _.forEach(item.layers(), function (layer) {
                layer.query(true);
            });
        }
    },

    groupToggle: function(item) {
        if (item.visible()) {
            item.visible(false);

            _.forEach(item.layers(), function (layer) {
                layer.visible(false);
            });
        } else {
            item.visible(true);

            _.forEach(item.layers(), function (layer) {
                layer.visible(true);
            });
        }

        events.emit('.layers.updated');
    },

    layerTransparency: function (item, e) {
        item.transparency(e.target.value);

        events.emit('.layers.updated');
    },

    mouseOver: function(item) {
        item.showLayerControl(true);
    },

    mouseOut: function(item) {
        item.showLayerControl(false);
    },

    toggleShowControl: function(item) {
        if (item.showLayerDetails()) {
            item.showLayerDetails(false);
        } else {
            item.showLayerDetails(true);
        }
    },

    toggleGroupCollapse: function(item) {
        if (item.collapsed()) {
            item.collapsed(false);
        } else {
            item.collapsed(true);
        }
    }

};


var LayerController = function(options) {
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

LayerController.prototype = {

    init: function(){
        this.controller = new Controller(this.options);
        this.view = View;
    }
};

module.exports = LayerController;