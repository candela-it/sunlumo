'use strict';

var m = require('mithril');
var _ = require('lodash');

var renderLayerItem = function (ctrl, index, item, dragging) {
    // group layer handler
    var properties = {
        onmouseenter: ctrl.vm.ev_mouseOver.bind(ctrl, item),
        onmouseleave: ctrl.vm.ev_mouseOut.bind(ctrl, item)
    };

    if (index !== undefined) {
        _.extend(properties, {
            'data-id': index,
            'class': dragging,
            draggable: 'true',
            ondragstart: ctrl.vm.ev_dragStart.bind(ctrl),
            ondragover: ctrl.vm.ev_dragOver.bind(ctrl),
            ondragend: ctrl.vm.ev_dragEnd.bind(ctrl)
        });
    }

    return m('div.layer', properties, [
        m('div.layer-control', {
            'class': item.visible() ? '' : 'deactivated',
            onclick: ctrl.vm.ev_layerToggle.bind(ctrl, item)
        }, [
            m('i.fa.fa-eye')
        ]),
        m('div.layer-control', {
            'class': item.query() ? '' : 'deactivated',
            onclick: ctrl.vm.ev_queryLayerToggle.bind(ctrl, item)
        }, [
            m('i.fa.fa-info-circle')
        ]),
        m('div.layer-name', [item.name()]),

        m('div.layer-control.layer-settings-control', {
            'class': item.showLayerControl() ? '' : 'hide',
            onclick: ctrl.vm.ev_toggleShowControl.bind(ctrl, item)
        }, [
            m('i', {
                'class': 'fa fa-cog'
            })
        ]),
        m('div.layer-details', {
            'class': item.showLayerDetails() ? '' : 'hide'
        }, [
            m('span', {}, 'TRANSPARENTNOST: '),
            m('input[type=range]', {
                draggable: false,
                value: item.transparency(),
                onchange: ctrl.vm.ev_layerTransparency.bind(ctrl, item)
            })
        ])
    ]);
};

var addGroupLayers = function (ctrl, item, dragging) {
    if (!item.collapsed()) {
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
        draggable: 'true',
        ondragstart: ctrl.vm.ev_dragStart.bind(ctrl),
        ondragover: ctrl.vm.ev_dragOver.bind(ctrl),
        ondragend: ctrl.vm.ev_dragEnd.bind(ctrl)
    }, [
        m('div.layer-control', {
            'class': item.visible() ? '' : 'deactivated',
            onclick: ctrl.vm.ev_groupToggle.bind(ctrl, item)
        }, [
            m('i.fa.fa-eye')
        ]),
        m('div.layer-control', {
            'class': item.query() ? '' : 'deactivated',
            onclick: ctrl.vm.ev_queryGroupToggle.bind(ctrl, item)
        }, [
            m('i.fa.fa-info-circle')
        ]),
        m('div.group-name', [item.name()]),

        m('div.group-control', {
            onclick: ctrl.vm.ev_toggleGroupCollapse.bind(ctrl, item)
        }, [
            m('i.fa', {
                'class': item.collapsed() ? 'fa-plus' : 'fa-minus'
            })
        ]),

        // add group layers
        addGroupLayers(ctrl, item, dragging)
    ]);
};

var render = function(ctrl) {
    return m('div.layer-list', [
        ctrl.vm.layerTree.map(function (treeItem, index) {
            // is the current treeItem dragged
            var dragging = index === ctrl.vm.dragged_item() ? 'dragging' : '';


            if (treeItem.type() === 'layer') {
                return renderLayerItem(ctrl, index, treeItem, dragging);
            } else {
                return renderGroupItem(ctrl, index, treeItem, dragging);
            }
        })
    ]);
};

var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};


module.exports = VIEW;
