'use strict';

var layerContorlViewModel = require('../models/layerControl');

var m = require('mithril');
var _ = require('lodash');

// global events
var EVENTS = require('../../events');

// local events
var jvents = require('jvent');
var events = new jvents();


var CONTROLLER = function(options) {

    this.dragged_item = m.prop();

    // initialize VM
    this.vm = new layerContorlViewModel(options);

    this.items = this.vm.layerTree;
};

CONTROLLER.prototype = {

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


var VIEW = function (ctrl) {
    // keep the reference to the controller
    this.ctrl = ctrl;

    return this.render();
};

VIEW.prototype = {
    render: function() {
        return m('div', {'class': 'layer_list'}, [
            this.ctrl.vm.layerTree.map(function (treeItem, index) {
                // is the current treeItem dragged
                var dragging = (index === this.ctrl.dragged_item()) ? 'dragging' : '';


                if (treeItem.type() === 'layer') {
                    return this.renderLayerItem(index, treeItem, dragging);

                } else {
                    return this.renderGroupItem(index, treeItem, dragging);
                }
            })
        ]);
    },

    renderLayerItem: function (index, item, dragging) {
        // group layer handler
        var properties = {
            'onmouseenter': this.ctrl.mouseOver.bind(this.ctrl, item),
            'onmouseleave': this.ctrl.mouseOut.bind(this.ctrl, item)
        };

        if (index !== undefined) {
            _.extend(properties, {
                'data-id': index,
                'class': dragging,
                'draggable': 'true',
                'ondragstart': this.ctrl.dragStart.bind(this.ctrl),
                'ondragover': this.ctrl.dragOver.bind(this.ctrl),
                'ondragend': this.ctrl.dragEnd.bind(this.ctrl)
            });
        }

        return m('div.layer', properties, [
            m('div', {
                'class': (item.visible()) ? 'layer-control' : 'layer-control deactivated',
                'onclick': this.ctrl.layerToggle.bind(this.ctrl, item)
            }, [
                m('i', {
                    'class': 'fi-eye'
                })
            ]),
            m('div', {
                'class': (item.query()) ? 'layer-control' : 'layer-control deactivated',
                'onclick': this.ctrl.queryLayerToggle.bind(this.ctrl, item)
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
                'onclick': this.ctrl.toggleShowControl.bind(this.ctrl, item)
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
                    'onchange': this.ctrl.layerTransparency.bind(this.ctrl, item)
                })
            ])
        ]);
    },
    addGroupLayers: function (item, dragging) {
        if (!(item.collapsed())) {
            return item.layers().map(function (groupLayer) {
                // set undefined index that will not setup drag events on group layers
                return this.renderLayerItem(undefined, groupLayer, dragging);
            });
        }
        return [];
    },

    renderGroupItem: function (index, item, dragging) {
        return m('div.group', {
            'data-id': index,
            'class': dragging,
            'draggable': 'true',
            'ondragstart': this.ctrl.dragStart.bind(this.ctrl),
            'ondragover': this.ctrl.dragOver.bind(this.ctrl),
            'ondragend': this.ctrl.dragEnd.bind(this.ctrl),
        }, [
            m('div', {
                'class': (item.visible()) ? 'layer-control' : 'layer-control deactivated',
                'onclick': this.ctrl.groupToggle.bind(this.ctrl, item)
            }, [
                m('i', {
                    'class': 'fi-eye'
                })
            ]),
            m('div', {
                'class': (item.query()) ? 'layer-control' : 'layer-control deactivated',
                'onclick': this.ctrl.queryGroupToggle.bind(this.ctrl, item)
            }, [
                m('i', {
                    'class': 'fi-info'
                })
            ]),
            m('div', {'class': 'group-name'}, [item.name()]),

            m('div', {
                'onclick': this.ctrl.toggleGroupCollapse.bind(this.ctrl, item),
                'class': 'group-control'
            }, [
                m('i', {
                    'class': item.collapsed() ? 'fi-plus' : 'fi-minus'
                })
            ]),

            // add group layers
            this.addGroupLayers(item, dragging)
        ]);
    }
};

module.exports = {
    'view': VIEW,
    'controller': CONTROLLER
};
