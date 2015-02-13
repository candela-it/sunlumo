'use strict';

var m = require('mithril');

var render = function(ctrl) {
    return m('div', {}, [
        m('label', 'Scale'),
        m('select', {
            name: 'print-scales',
            onchange: ctrl.vm.ev_onScaleChange.bind(ctrl)
        }, [
            m('option', ['-- odaberite mjerilo --']),
            ctrl.vm.scales.map(function(item) {
                return m('option', {
                    value: item.scale
                }, item.display);
            })
        ]),
        m('label', 'Layout'),
        m('select', {
            name: 'print-layouts',
            onchange: ctrl.vm.ev_onPrintLayoutChange.bind(ctrl)
        }, [
            ctrl.vm.layouts_list.map(function(item) {
                return m('option', {
                    value: item.name()
                }, item.name());
            })
        ]),
        m('a', {
            // generate printUrl
            href: ctrl.vm.printUrl()
        }, [
            m('button', ['Print'])
        ])
    ]);
};

var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

module.exports = VIEW;
