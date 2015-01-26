'use strict';

var _ = require('lodash');
var m = require('mithril');
var ol = require('../contrib/ol');

// global events
var EVENTS = require('./events');

// local events
var jvents = require('jvent');

var events = new jvents();

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

Layer.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.layers = [];

        vm.layerTree = [];
    };

    return vm;
}());

Layer.controller = function() {

    this.items = Layer.vm.layerTree;

    this.dragged_item = m.prop();

    this.sort = function (layers, dragged_item) {
        // set new layers
        this.items = layers;
        // track dragging element
        this.dragged_item = m.prop(dragged_item);
    };

    this.dragStart = function(e) {
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

    };

    this.dragOver = function(e) {
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
    };
    this.dragEnd = function() {
        this.sort(this.items, undefined);
        events.emit('.layers.updated', {
            'layers': this.items
        });
    };

    this.layerToggle = function (item) {
        if (item.visible()) {
            item.visible(false);
        } else {
            item.visible(true);
        }
        events.emit('.layers.updated');
    };

    this.queryLayerToggle = function (item) {
        if (item.query()) {
            item.query(false);
        } else {
            item.query(true);
        }
    };

    this.queryGroupToggle = function(item) {
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
    };

    this.groupToggle = function(item) {
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
    };

    this.layerTransparency = function (item, e) {
        item.transparency(e.target.value);

        events.emit('.layers.updated');
    };

    this.mouseOver = function(item) {
        item.showLayerControl(true);
    };

    this.mouseOut = function(item) {
        item.showLayerControl(false);
    };

    this.toggleShowControl = function(item) {
        if (item.showLayerDetails()) {
            item.showLayerDetails(false);
        } else {
            item.showLayerDetails(true);
        }
    };

    this.toggleGroupCollapse = function(item) {
        if (item.collapsed()) {
            item.collapsed(false);
        } else {
            item.collapsed(true);
        }
    };
};

var renderLayerItem = function (index, ctrl, item, dragging) {
    // group layer handler
    var properties = {
        'onmouseenter': ctrl.mouseOver.bind(ctrl, item),
        'onmouseleave': ctrl.mouseOut.bind(ctrl, item)
    };

    if (index !== undefined) {
        _.extend(properties, {
            'data-id': index,
            'class': dragging,
            'draggable': 'true',
            'ondragstart': ctrl.dragStart.bind(ctrl),
            'ondragover': ctrl.dragOver.bind(ctrl),
            'ondragend': ctrl.dragEnd.bind(ctrl)
        });
    }

    return m('div.layer', properties, [
        m('div', {
            'class': (item.visible()) ? 'layer-control' : 'layer-control deactivated',
            'onclick': ctrl.layerToggle.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fi-eye'
            })
        ]),
        m('div', {
            'class': (item.query()) ? 'layer-control' : 'layer-control deactivated',
            'onclick': ctrl.queryLayerToggle.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fi-info'
            })
        ]),
        m('div', {
            'class': 'layer-name'
        }, [item.name()]),

        m('div', {
            'class':  (item.showLayerControl()) ? 'layer-control layer-settings-control' : 'layer-control layer-settings-control hide',
            'onclick': ctrl.toggleShowControl.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fi-widget'
            })
        ]),
        m('div', {
            'class': (item.showLayerDetails()) ? 'layer-details' : 'layer-details hide'
        }, [
            m('span', {}, 'TRANSPARENTNOST: '),
            m('input[type=range]', {
                'draggable': false,
                'value': item.transparency(),
                'onchange': ctrl.layerTransparency.bind(ctrl, item)
            })
        ])
    ]);
};


var addGroupLayers = function (ctrl, item, dragging) {
    if (!(item.collapsed())) {
        return item.layers().map(function (groupLayer) {
            // set undefined index that will not setup drag events on group layers
            return renderLayerItem(undefined, ctrl, groupLayer, dragging);
        });
    }
    return [];
};

var renderGroupItem = function (index, ctrl, item, dragging) {
    return m('div.group', {
        'data-id': index,
        'class': dragging,
        'draggable': 'true',
        'ondragstart': ctrl.dragStart.bind(ctrl),
        'ondragover': ctrl.dragOver.bind(ctrl),
        'ondragend': ctrl.dragEnd.bind(ctrl),
    }, [
        m('div', {
            'class': (item.visible()) ? 'layer-control' : 'layer-control deactivated',
            'onclick': ctrl.groupToggle.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fi-eye'
            })
        ]),
        m('div', {
            'class': (item.query()) ? 'layer-control' : 'layer-control deactivated',
            'onclick': ctrl.queryGroupToggle.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fi-info'
            })
        ]),
        m('div', {'class': 'group-name'}, [item.name()]),

        m('div', {
            'onclick': ctrl.toggleGroupCollapse.bind(ctrl, item),
            'class': 'group-control'
        }, [
            m('i', {
                'class': item.collapsed() ? 'fi-plus' : 'fi-minus'
            })
        ]),

        // add group layers
        addGroupLayers(ctrl, item, dragging)
    ]);
};

Layer.view = function(ctrl) {
    return m('div', {'class': 'layer_list'}, [
        Layer.vm.layerTree.map(function (treeItem, index) {
            // is the current treeItem dragged
            var dragging = (index === ctrl.dragged_item()) ? 'dragging' : '';


            if (treeItem.type() === 'layer') {
                return renderLayerItem(index, ctrl, treeItem, dragging);

            } else {
                return renderGroupItem(index, ctrl, treeItem, dragging);
            }
        })
    ]);
};


var SL_LayerControl = function (map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!map || Object.getOwnPropertyNames(map).length === 0) {
        throw new Error('SL_LayerControl map parameter must be defined');
    }

    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_LayerControl options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    // internal reference to the map object
    this.map = map;

    // check if we got right flavour of options
    this._checkOptions();

    // initialize the layer control
    this._init();

    // initialize the layer control event handling
    this._initEvents();
};


SL_LayerControl.prototype = {

    _initQGISLayer: function () {
        this.SL_Source = new ol.source.ImageWMS({
            url: '/getmap',
            params: {
                'VERSION':'1.1.1',
                'FORMAT':'image/png'
            },
            ratio: 1
        });

        this.SL_QGIS_Layer = new ol.layer.Image({
            // extent: extent,
            transparent:true,
            source: this.SL_Source
        });

        this.SL_QGIS_Layer.on('change', function() {
            EVENTS.emit('qgs.spinner.activate');
        });
        this.SL_QGIS_Layer.on('postcompose', function() {
            EVENTS.emit('qgs.spinner.deactivate');
        });
    },

    _init: function () {
        var self = this;
        this._initQGISLayer();

        // init the viewmodel
        Layer.vm.init();

        Layer.vm.layers = self.options.layers;

        _.forEach(this.options.layer_tree, function (treeItem) {
            if (treeItem.layer) {
                var layer = self.options.layers[treeItem.layer];
                Layer.vm.layerTree.push(new Layer({
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

                Layer.vm.layerTree.push(new Group({
                    'type': 'group',
                    'name': group.name,
                    'visible': group.visible,
                    'layers': groupLayers,
                    'collapsed' : group.collapsed
                    })
                );
            }
        });

        this.SL_Source.updateParams({
            'LAYERS':this.getLayersParam(),
            'MAP': this.options.map,
            'TRANSPARENCIES': this.getTransparencyParam()
        });

        // initialize mithril module
        m.module(document.getElementById('panelLayers'), {controller: Layer.controller, view: Layer.view});
    },

    _initEvents: function () {
        var self = this;
        events.on('.layers.updated', function() {
            self.SL_Source.updateParams({
                'LAYERS':self.getLayersParam(),
                'TRANSPARENCIES': self.getTransparencyParam()
            });
            EVENTS.emit('read.layers.and.transparencies', {
                'layers': self.getLayersParam(),
                'transparencies': self.getTransparencyParam()
            });
        });

        EVENTS.on('map.singleclick', function(data) {
            var viewResolution = self.map.getView().getResolution();
            var url = self.SL_Source.getGetFeatureInfoUrl(
                data.coordinate, viewResolution, self.map.getView().getProjection(), {
                   'INFO_FORMAT': 'application/json',
                   'QUERY_LAYERS': self.getQueryLayersParam()
               });

            // emit updated url to the GFI control
            EVENTS.emit('qgis.gfi.url.changed', {
                'url': url
            });
        });


        EVENTS.on('print.area.updated', function() {
            // send back layers.and.transparencies
            EVENTS.emit('read.layers.and.transparencies', {
                'layers': self.getLayersParam(),
                'transparencies': self.getTransparencyParam()
            });
        });

    },

    _checkOptions: function () {
        var properties = Object.getOwnPropertyNames(this.options);

        if (!_.contains(properties, 'layers')) {
            throw new Error('SL_LayerControl options must contain "layers" property');
        }

        if (Object.getOwnPropertyNames(this.options.layers).length === 0) {
            throw new Error('SL_LayerControl "layers" must not be empty');
        }

    },

    getLayersParam: function () {
        // return comma concatenated string of visible layers
        var visible_layers = [];

        for (var i = 0; i < Layer.vm.layerTree.length; i++) {
            var treeItem = Layer.vm.layerTree[i];
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

        for (var i = 0; i < Layer.vm.layerTree.length; i++) {
            var treeItem = Layer.vm.layerTree[i];
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

        for (var i = 0; i < Layer.vm.layerTree.length; i++) {
            var treeItem = Layer.vm.layerTree[i];

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

module.exports = SL_LayerControl;
