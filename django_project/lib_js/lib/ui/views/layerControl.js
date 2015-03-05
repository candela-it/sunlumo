'use strict';

var m = require('mithril');

var renderLayerItem = function (ctrl, item) {
    // group layer handler
    var properties = {
        onmouseenter: ctrl.vm.ev_mouseOver.bind(ctrl, item),
        onmouseleave: ctrl.vm.ev_mouseOut.bind(ctrl, item)
    };

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
                value: item.transparency(),
                onchange: ctrl.vm.ev_layerTransparency.bind(ctrl, item)
            })
        ])
    ]);
};

var addGroupLayers = function (ctrl, item) {
    if (!item.collapsed()) {
        return item.layers().map(function (groupLayer) {
            // set undefined index that will not setup drag events on group layers
            return renderLayerItem(ctrl, groupLayer);
        });
    }
    return [];
};

var renderGroupItem = function (ctrl, item) {
    return m('div.group', [
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
        addGroupLayers(ctrl, item)
    ]);
};

var render = function(ctrl) {
    return m('div.layer-list', [
        ctrl.vm.layerTree.map(function (treeItem, index) {
            if (treeItem.type() === 'layer') {
                return renderLayerItem(ctrl, treeItem);
            } else {
                return renderGroupItem(ctrl, treeItem);
            }
        })
    ]);
};

var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};


module.exports = VIEW;
