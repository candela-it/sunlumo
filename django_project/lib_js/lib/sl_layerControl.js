'use strict';

var _ = require('lodash');
var m = require('mithril');
var ol = require('../contrib/ol');

var EVENTS = require('./events');

var Layer = function (data) {
    this.l_id = m.prop(data.l_id);
    this.name = m.prop(data.name);
    this.visible = m.prop(data.visible);
    this.transparency = m.prop(data.transparency);
    // should we query this layer 'GetFeatureInfo'
    this.query = m.prop(false);
};

var LayerList = Array;

Layer.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = new LayerList();
    };

    // add layer to the list
    vm.add = function(id, name, visible, transparency) {
        vm.list.push(new Layer({
            'l_id': id,
            'name': name,
            'visible': visible,
            'transparency': transparency
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
        // Fix for Firefox (maybe others), prevents dragstart event bubbling
        // on range input elements
        if (document.activeElement.type === 'range') {
            return false; // block dragging
        }

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
        EVENTS.emit('layers.updated', {
            'layers': this.items
        });
    };

    this.layerToggle = function (item, e) {
        item.visible(e.target.checked);

        EVENTS.emit('layers.updated');
    };

    this.queryLayerToggle = function (item, e) {
        item.query(e.target.checked);
    };

    this.layerTransparency = function (item, e) {
        item.transparency(e.target.value);

        EVENTS.emit('layers.updated');
    };
};

Layer.view = function(ctrl) {
    return m('div', {'class': 'layer_list'}, [
        Layer.vm.list.map(function(item, index) {
            // determine if the element is currently being dragged
            var dragging = (index === ctrl.dragging()) ? 'dragging' : '';

            return m('div.layer', {
              'data-id': index,
              'class': dragging,
              'draggable': 'true',
              'ondragstart': ctrl.dragStart.bind(ctrl),
              'ondragover': ctrl.dragOver.bind(ctrl),
              'ondragend': ctrl.dragEnd.bind(ctrl)
            }, [
                m('input[type=checkbox]', {
                    'checked': item.visible(),
                    'onchange': ctrl.layerToggle.bind(ctrl, item)
                }),
                item.name(),
                m('input[type=range]', {
                    'draggable': false,
                    'value': item.transparency(),
                    'onchange': ctrl.layerTransparency.bind(ctrl, item)
                }),
                m('div', [
                    m('input[type=checkbox]', {
                        'checked': item.query(),
                        'onchange': ctrl.queryLayerToggle.bind(ctrl, item)
                    }),
                    'Q'
                ])
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
                //'LAYERS': 'Cres  Corine LC,Cres obala,hillshade',
                //'MAP':'/data/simple.qgs',
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
    },

    _init: function () {
        var self = this;
        this._initQGISLayer();
        // add layers to the control, maintaining the initial order
        _.forEach(this.options.layers_order, function (l_id) {
            var layer = self.options.layers[l_id];
            Layer.vm.add(l_id, layer.layer_name, layer.visible, layer.transparency);
        });
        // force redraw
        m.redraw(true);

        this.SL_Source.updateParams({
            'LAYERS':this.getLayersParam(),
            'MAP': this.options.map,
            'TRANSPARENCIES': this.getTransparencyParam()
        });
    },

    _initEvents: function () {
        var self = this;
        EVENTS.on('layers.updated', function() {
            self.SL_Source.updateParams({
                'LAYERS':self.getLayersParam(),
                'TRANSPARENCIES': self.getTransparencyParam()
            });
        });

        EVENTS.on('map.singleclick', function(data) {
            var viewResolution = data.map.getView().getResolution();
            var url = self.SL_Source.getGetFeatureInfoUrl(
                data.coordinate, viewResolution, data.map.getView().getProjection(), {
                    'INFO_FORMAT': 'application/json',
                    'QUERY_LAYERS': self.getQueryLayersParam()
                }
            );

            if (url) {
                var geojson_source = new ol.source.GeoJSON({
                    url: url,
                    // projection: data.map.getView().getProjection(),
                    defaultProjection: data.map.getView().getProjection()
                });

                var geojson_layer = new ol.layer.Vector({
                    source: geojson_source
                });
                data.map.addLayer(geojson_layer);
            }
        });
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
        // return comma concatenated string of visible layers
        var visible_layers = [];

        for (var i = 0; i < Layer.vm.list.length; i++) {
            var layer = Layer.vm.list[i];
            if (layer.visible()) {
                visible_layers.push(layer.name());
            }
        }
        return visible_layers.join(',');
    },
    getTransparencyParam: function () {
        // return comma concatenated string of visible layers transparencies
        var layers_transparencies = [];

        for (var i = 0; i < Layer.vm.list.length; i++) {
            var layer = Layer.vm.list[i];
            if (layer.visible()) {
                layers_transparencies.push(layer.transparency());
            }
        }
        return layers_transparencies.join(',');
    },
    getQueryLayersParam: function () {
        // return comma concatenated string of queryable layers
        var query_layers = [];

        for (var i = 0; i < Layer.vm.list.length; i++) {
            var layer = Layer.vm.list[i];
            if (layer.query()) {
                query_layers.push(layer.name());
            }
        }
        return query_layers.join(',');
    }
};

module.exports = SL_LayerControl;
