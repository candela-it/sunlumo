'use strict';

var m = require('mithril');
var _ = require('lodash');
var uuid = require('node-uuid');

var Jvent = require('jvent');

var TreeItem = function (data) {
    this.type = m.prop(data.type);
    this.item_uuid = m.prop(data.item_uuid);
    this.items = m.prop(data.items);
};

var Layer = function (data) {
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
    this.group_uuid = m.prop(data.group_uuid);
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

        // init local layers and groups
        this.layers = {};
        this.layer_uuid_mapping = {};
        this.groups = {};

        this.layerTree = [];
        this.layerOrder = this.options.layer_order;

        _.forEach(this.options.layer_tree, function (treeItem) {
            var ly_item = self.readTreeItem(treeItem);
            self.layerTree.push(ly_item);
        });
    },

    readTreeItem: function (treeItem) {
        var self = this;
        if (treeItem.layer) {
            var layer = self.options.layers[treeItem.layer.layer_id];

            var layer_uuid = uuid.v1();
            var layer_instance = new Layer({
                l_id: treeItem.layer.layer_id,
                name: layer.layer_name,
                visible: layer.visible,
                transparency: layer.transparency
            });

            self.layers[layer_uuid] = layer_instance;
            self.layer_uuid_mapping[treeItem.layer.layer_id] = layer_uuid;

            return new TreeItem({
               type: 'layer',
               item_uuid: layer_uuid
            });
        }

        if (treeItem.group) {
            var group = treeItem.group;
            // read group layers
            var groupItems = _.map(treeItem.layers, function(groupLayer) {
                return self.readTreeItem(groupLayer);
            });

            var group_uuid = uuid.v1();

            var group_instance = new Group({
                group_uuid: group_uuid,
                name: group.name,
                visible: group.visible,
                collapsed: group.collapsed
            });
            self.groups[group_uuid] = group_instance;

            return new TreeItem({
                type: 'group',
                item_uuid: group_uuid,
                items: groupItems
            });
        }
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
            var mapped_layer = this.layers[this.layer_uuid_mapping[layerInOrder]];
            if (mapped_layer.visible()) {
                visible_layers.push(mapped_layer.l_id());
            }
        }

        return visible_layers.join(',');
    },

    getTransparencyParam: function () {
        // return comma concatenated string of visible layers transparencies
        var layers_transparencies = [];

        for (var k = 0; k < this.layerOrder.length; k += 1) {
            var layerInOrder = this.layerOrder[k];
            var mapped_layer = this.layers[this.layer_uuid_mapping[layerInOrder]];
            if (mapped_layer.visible()) {
                layers_transparencies.push(mapped_layer.transparency());
            }
        }

        return layers_transparencies.join(',');
    },

    getQueryLayersParam: function () {
        // return comma concatenated string of queryable layers
        var query_layers = [];

        for (var k = 0; k < this.layerOrder.length; k += 1) {
            var layerInOrder = this.layerOrder[k];
            var mapped_layer = this.layers[this.layer_uuid_mapping[layerInOrder]];
            if (mapped_layer.visible() && mapped_layer.query()) {
                query_layers.push(mapped_layer.l_id());
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

    toggleTreeItem: function (treeItem, callback) {
        var self = this;
        if (treeItem.type() === 'layer') {
            var layer = this.layers[treeItem.item_uuid()];
            callback(layer);
        } else {
            var group = this.groups[treeItem.item_uuid()];

            // toggle visible and query properties on a subgroup
            callback(group);

            _.forEach(treeItem.items(), function (tItem) {
                self.toggleTreeItem(tItem, callback);
            });
        }
    },

    ev_queryGroupToggle: function(treeItem) {
        var self = this;
        var group = this.vm.groups[treeItem.item_uuid()];

        if (group.query()) {
            group.query(false);
            _.forEach(treeItem.items(), function (tItem) {
                self.vm.toggleTreeItem(tItem, function (layer) {
                    layer.query(false);
                });
            });
        } else if (group.visible()) {
            group.query(true);

            _.forEach(treeItem.items(), function (tItem) {
                self.vm.toggleTreeItem(tItem, function (layer) {
                    if (layer.visible()) {
                        layer.query(true);
                    }
                });
            });
        }
        this.vm.emitQueryLayersUpdated();
    },

    ev_groupToggle: function(treeItem) {
        var self = this;
        var group = this.vm.groups[treeItem.item_uuid()];

        if (group.visible()) {
            group.visible(false);
            group.query(false);

            _.forEach(treeItem.items(), function (tItem) {
                self.vm.toggleTreeItem(tItem, function (layer) {
                    layer.visible(false);
                    layer.query(false);
                });
            });
        } else {
            group.visible(true);

            _.forEach(treeItem.items(), function (tItem) {
                self.vm.toggleTreeItem(tItem, function (layer) {
                    layer.visible(true);
                });
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

    ev_toggleGroupCollapse: function(treeItem) {
        var group = this.vm.groups[treeItem.item_uuid()];
        if (group.collapsed()) {
            group.collapsed(false);
        } else {
            group.collapsed(true);
        }
    }
};

module.exports = VIEWMODEL;
