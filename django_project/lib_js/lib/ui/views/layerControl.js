'use strict';

var m = require('mithril');
var _ = require('lodash');


var VIEW = function (ctrl) {
    return render(ctrl);
};


var render = function(ctrl) {
    return m('div', {'class': 'layer_list'}, [
        ctrl.vm.layerTree.map(function (treeItem, index) {
            // is the current treeItem dragged
            var dragging = (index === ctrl.vm.dragged_item()) ? 'dragging' : '';


            if (treeItem.type() === 'layer') {
                return renderLayerItem(ctrl, index, treeItem, dragging);

            } else {
                return renderGroupItem(ctrl, index, treeItem, dragging);
            }
        })
    ]);
};

var renderLayerItem = function (ctrl, index, item, dragging) {
    // group layer handler
    var properties = {
        'onmouseenter': ctrl.vm.mouseOver.bind(ctrl, item),
        'onmouseleave': ctrl.vm.mouseOut.bind(ctrl, item)
    };

    if (index !== undefined) {
        _.extend(properties, {
            'data-id': index,
            'class': dragging,
            'draggable': 'true',
            'ondragstart': ctrl.vm.dragStart.bind(ctrl),
            'ondragover': ctrl.vm.dragOver.bind(ctrl),
            'ondragend': ctrl.vm.dragEnd.bind(ctrl)
        });
    }

    return m('div.layer', properties, [
        m('div', {
            'class': (item.visible()) ? 'layer-control' : 'layer-control deactivated',
            'onclick': ctrl.vm.layerToggle.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fi-eye'
            })
        ]),
        m('div', {
            'class': (item.query()) ? 'layer-control' : 'layer-control deactivated',
            'onclick': ctrl.vm.queryLayerToggle.bind(ctrl, item)
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
            'onclick': ctrl.vm.toggleShowControl.bind(ctrl, item)
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
                'onchange': ctrl.vm.layerTransparency.bind(ctrl, item)
            })
        ])
    ]);
};

var addGroupLayers = function (ctrl, item, dragging) {
    if (!(item.collapsed())) {
        return item.layers().map(function (groupLayer) {
            // set undefined index that will not setup drag events on group layers
            return renderLayerItem(ctrl, undefined, groupLayer, dragging);
        });
    }
    return [];
};

var renderGroupItem = function (ctrl, index, item, dragging) {
    return m('div.group', {
        'data-id': index,
        'class': dragging,
        'draggable': 'true',
        'ondragstart': ctrl.vm.dragStart.bind(ctrl),
        'ondragover': ctrl.vm.dragOver.bind(ctrl),
        'ondragend': ctrl.vm.dragEnd.bind(ctrl),
    }, [
        m('div', {
            'class': (item.visible()) ? 'layer-control' : 'layer-control deactivated',
            'onclick': ctrl.vm.groupToggle.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fi-eye'
            })
        ]),
        m('div', {
            'class': (item.query()) ? 'layer-control' : 'layer-control deactivated',
            'onclick': ctrl.vm.queryGroupToggle.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fi-info'
            })
        ]),
        m('div', {'class': 'group-name'}, [item.name()]),

        m('div', {
            'onclick': ctrl.vm.toggleGroupCollapse.bind(ctrl, item),
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

module.exports = VIEW;
