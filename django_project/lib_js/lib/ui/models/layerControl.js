'use strict';

var m = require('mithril');
var _ = require('lodash');

// global events
var EVENTS = require('../../events');


var Layer = function (data) {
    this.type = m.prop(data.type);
    this.l_id = m.prop(data.l_id);
    this.name = m.prop(data.name);
    this.visible = m.prop(data.visible);
    this.transparency = m.prop(data.transparency);
    // should we query this layer 'GetFeatureInfo'
    this.query = m.prop(false);
    this.showLayerControl = m.prop(false);
    this.showLayerDetails = m.prop(false);
};

var Group = function (data) {
    this.type = m.prop(data.type);
    this.name = m.prop(data.name);
    this.visible = m.prop(data.visible);
    this.collapsed = m.prop(data.collapsed);
    this.layers = m.prop(data.layers);

    this.query = m.prop(false);
};


var VIEWMODEL = function (options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function (options) {
        var self = this;
        this.options = options;

        this.layers = this.options.layers;

        this.layerTree = [];

        this.dragged_item = m.prop();
        this.items = this.layerTree;

        _.forEach(this.options.layer_tree, function (treeItem) {
            if (treeItem.layer) {
                var layer = self.options.layers[treeItem.layer];
                self.layerTree.push(new Layer({
                    'type': 'layer',
                    'l_id':treeItem.layer,
                    'name':layer.layer_name,
                    'visible': layer.visible,
                    'transparency': layer.transparency
                    })
                );
            }

            if (treeItem.group) {
                var group = treeItem.group;

                // read group layers
                var groupLayers = _.map(group.layers, function(groupLayer) {
                    var layer = self.options.layers[groupLayer.layer];
                    return new Layer({
                        'type': 'layer',
                        'l_id':groupLayer.layer,
                        'name':layer.layer_name,
                        'visible': layer.visible,
                        'transparency': layer.transparency
                    });
                });

                self.layerTree.push(new Group({
                    'type': 'group',
                    'name': group.name,
                    'visible': group.visible,
                    'layers': groupLayers,
                    'collapsed' : group.collapsed
                    })
                );
            }
        });


    },

    getLayersParam: function () {
        // return comma concatenated string of visible layers
        var visible_layers = [];

        for (var i = 0; i < this.layerTree.length; i++) {
            var treeItem = this.layerTree[i];
            if (treeItem.type() === 'layer') {
                if (treeItem.visible()) {
                    visible_layers.push(treeItem.name());
                }
            } else {
                for (var j = 0; j < treeItem.layers().length; j++) {
                    var groupLayer = treeItem.layers()[j];
                    if (groupLayer.visible()) {
                        visible_layers.push(groupLayer.name());
                    }
                }
            }
        }

        return visible_layers.join(',');
    },
    getTransparencyParam: function () {
        // return comma concatenated string of visible layers transparencies
        var layers_transparencies = [];

        for (var i = 0; i < this.layerTree.length; i++) {
            var treeItem = this.layerTree[i];
            if (treeItem.type() === 'layer') {
                if (treeItem.visible()) {
                    layers_transparencies.push(treeItem.transparency());
                }
            } else {
                for (var j = 0; j < treeItem.layers().length; j++) {
                    var groupLayer = treeItem.layers()[j];
                    if (groupLayer.visible()) {
                        layers_transparencies.push(groupLayer.transparency());
                    }
                }
            }
        }

        return layers_transparencies.join(',');
    },
    getQueryLayersParam: function () {
        // return comma concatenated string of queryable layers
        var query_layers = [];

        for (var i = 0; i < this.layerTree.length; i++) {
            var treeItem = this.layerTree[i];

            if (treeItem.type() === 'layer') {
                if (treeItem.visible() && treeItem.query()) {
                    query_layers.push(treeItem.name());
                }
            } else {
                for (var j = 0; j < treeItem.layers().length; j++) {
                    var groupLayer = treeItem.layers()[j];
                    if (groupLayer.visible() && groupLayer.query()) {
                        query_layers.push(groupLayer.name());
                    }
                }
            }
        }

        return query_layers.join(',');
    },

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
        EVENTS.emit('layers.updated', {
            'layers': this.items
        });
    },

    layerToggle: function (item) {
        if (item.visible()) {
            item.visible(false);
        } else {
            item.visible(true);
        }
        EVENTS.emit('.layers.updated');
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

        EVENTS.emit('layers.updated');
    },

    layerTransparency: function (item, e) {
        item.transparency(e.target.value);

        EVENTS.emit('layers.updated');
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

module.exports = VIEWMODEL;
