'use strict';

var m = require('mithril');
var _ = require('lodash');


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
        m('button', {
            'onclick': ctrl.vm.ev_onShowPrintAreaClick.bind(ctrl)
        }, 'SHOW PRINT AREA'),
        m('a', {
            // generate printUrl
            'href': ctrl.vm.printUrl()
        }, [
            m('button', ['PRINT']),
        ]),
        m('br'),
        m('button', {
            'onclick': ctrl.vm.ev_onHidePrintAreaClick.bind(ctrl)
        }, 'HIDE'),
    ]);
};

module.exports = VIEW;