'use strict';

var m = require('mithril');


var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

var render = function(ctrl) {
    return m('div', {}, [
        m('label', 'Scale'),
        m('select', {
            'name': 'print-scales'
        }, [
            m('option', ['-- odaberite mjerilo --']),
            ctrl.vm.scales.map(function(item) {
                return m('option', {
                    'value': item.scale,
                    'onclick': ctrl.vm.ev_onScaleClick.bind(ctrl, item)
                }, item.display);
            })
        ]),
        m('label', 'Layout'),
        m('select', {
            'name': 'print-layouts'
        }, [
            ctrl.vm.layouts_list.map(function(item) {
                return m('option', {
                    'value': item.name(),
                    'onclick': ctrl.vm.ev_onPrintLayoutClick.bind(ctrl, item)
                }, item.name());
            })
        ]),
        m('a', {
            // generate printUrl
            'href': ctrl.vm.printUrl()
        }, [
            m('button', ['Print']),
        ])
    ]);
};

module.exports = VIEW;