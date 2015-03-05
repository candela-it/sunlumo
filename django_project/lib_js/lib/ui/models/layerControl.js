'use strict';

var m = require('mithril');
var _ = require('lodash');

var Jvent = require('jvent');

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

        // initialize component events
        this.events = new Jvent();

        this.options = options;
        this.layers = {};

        this.layerTree = [];
        this.layerOrder = this.options.layer_order;

        _.forEach(this.options.layer_tree, function (treeItem) {
            if (treeItem.layer) {
                var layer = self.options.layers[treeItem.layer];

                self.layerTree.push(new Layer({
                    type: 'layer',
                    l_id: treeItem.layer,
                    name: layer.layer_name,
                    visible: layer.visible,
                    transparency: layer.transparency
                    })
                );
            }

            if (treeItem.group) {
                var group = treeItem.group;

                // read group layers
                var groupLayers = _.map(group.layers, function(groupLayer) {
                    var gr_layer = self.options.layers[groupLayer.layer];
                    return new Layer({
                        type: 'layer',
                        l_id: groupLayer.layer,
                        name: gr_layer.layer_name,
                        visible: gr_layer.visible,
                        transparency: gr_layer.transparency
                    });
                });

                self.layerTree.push(new Group({
                    type: 'group',
                    name: group.name,
                    visible: group.visible,
                    layers: groupLayers,
                    collapsed: group.collapsed
                    })
                );
            }
        });
    },

    emitLayersUpdated: function() {
        this.events.emit('layers.updated', {
            layers: this.getLayersParam(),
            transparencies: this.getTransparencyParam()
        });
    },

    emitQueryLayersUpdated: function () {
        this.events.emit('query.layers.updated', {
            query_layers: this.getQueryLayersParam(),
            transparencies: this.getTransparencyParam()
        });
    },

    getLayersParam: function () {
        // return comma concatenated string of visible layers
        var visible_layers = [];

        for (var k = 0; k < this.layerOrder.length; k += 1) {
            var layerInOrder = this.layerOrder[k];
            for (var i = 0; i < this.layerTree.length; i += 1) {
                var treeItem = this.layerTree[i];
                if (treeItem.type() === 'layer') {
                    if (treeItem.visible() && treeItem.l_id() === layerInOrder) {
                        visible_layers.push(treeItem.l_id());
                    }
                } else {
                    for (var j = 0; j < treeItem.layers().length; j += 1) {
                        var groupLayer = treeItem.layers()[j];
                        if (groupLayer.visible() && groupLayer.l_id() === layerInOrder) {
                            visible_layers.push(groupLayer.l_id());
                        }
                    }
                }
            }
        }

        return visible_layers.join(',');
    },
    getTransparencyParam: function () {
        // return comma concatenated string of visible layers transparencies
        var layers_transparencies = [];

        for (var k = 0; k < this.layerOrder.length; k += 1) {
            var layerInOrder = this.layerOrder[k];
            for (var i = 0; i < this.layerTree.length; i += 1) {
                var treeItem = this.layerTree[i];
                if (treeItem.type() === 'layer') {
                    if (treeItem.visible() && treeItem.l_id() === layerInOrder) {
                        layers_transparencies.push(treeItem.transparency());
                    }
                } else {
                    for (var j = 0; j < treeItem.layers().length; j += 1) {
                        var groupLayer = treeItem.layers()[j];
                        if (groupLayer.visible() && groupLayer.l_id() === layerInOrder) {
                            layers_transparencies.push(groupLayer.transparency());
                        }
                    }
                }
            }
        }

        return layers_transparencies.join(',');
    },
    getQueryLayersParam: function () {
        // return comma concatenated string of queryable layers
        var query_layers = [];

        for (var i = 0; i < this.layerTree.length; i += 1) {
            var treeItem = this.layerTree[i];

            if (treeItem.type() === 'layer') {
                if (treeItem.visible() && treeItem.query()) {
                    query_layers.push(treeItem.l_id());
                }
            } else {
                for (var j = 0; j < treeItem.layers().length; j += 1) {
                    var groupLayer = treeItem.layers()[j];
                    if (groupLayer.visible() && groupLayer.query()) {
                        query_layers.push(groupLayer.l_id());
                    }
                }
            }
        }

        return query_layers.join(',');
    },

    ev_layerToggle: function (item) {
        if (item.visible()) {
            item.visible(false);
            item.query(false);
        } else {
            item.visible(true);
        }
        this.vm.emitLayersUpdated();
        this.vm.emitQueryLayersUpdated();
    },

    ev_queryLayerToggle: function (item) {
        if (item.query()) {
            item.query(false);
        } else if (item.visible()) {
            item.query(true);
        }
        this.vm.emitQueryLayersUpdated();
    },

    ev_queryGroupToggle: function(item) {
        if (item.query()) {
            item.query(false);

            _.forEach(item.layers(), function (layer) {
                layer.query(false);
            });
        } else {
            if (item.visible()) {
                item.query(true);
            }

            _.forEach(item.layers(), function (layer) {
                if (layer.visible()) {
                    layer.query(true);
                }
            });
        }
        this.vm.emitQueryLayersUpdated();
    },

    ev_groupToggle: function(item) {
        if (item.visible()) {
            item.visible(false);

            _.forEach(item.layers(), function (layer) {
                layer.visible(false);
                layer.query(false);
            });
        } else {
            item.visible(true);

            _.forEach(item.layers(), function (layer) {
                layer.visible(true);
            });
        }

        this.vm.emitLayersUpdated();
        this.vm.emitQueryLayersUpdated();
    },

    ev_layerTransparency: function (item, e) {
        item.transparency(e.target.value);

        this.vm.emitLayersUpdated();
    },

    ev_mouseOver: function(item) {
        item.showLayerControl(true);
    },

    ev_mouseOut: function(item) {
        item.showLayerControl(false);
    },

    ev_toggleShowControl: function(item) {
        if (item.showLayerDetails()) {
            item.showLayerDetails(false);
        } else {
            item.showLayerDetails(true);
        }
    },

    ev_toggleGroupCollapse: function(item) {
        if (item.collapsed()) {
            item.collapsed(false);
        } else {
            item.collapsed(true);
        }
    }
};

module.exports = VIEWMODEL;
