'use strict';

var m = require('mithril');
var _ = require('lodash');

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


var VIEWMODEL = function () {
    this.init();
};

VIEWMODEL.prototype = {
    init: function (options) {
        var self = this;

        this.layers = options.layers;

        this.layerTree = [];

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
    }
};

module.exports = VIEWMODEL;
