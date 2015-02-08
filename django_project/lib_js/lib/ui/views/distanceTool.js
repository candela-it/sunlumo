'use strict';

var m = require('mithril');


var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

var render = function(ctrl) {
    return [
        m('div.button.small.controlButton', {
            'class': (ctrl.vm.control.active()) ? '' : 'info',
            'onclick': ctrl.vm.ev_toggleControl.bind(ctrl)
        }, [
            m('i.fa.fa-arrows')
        ]),
        m('div.toolbox-control-results.sl-panel.DistanceTool', {
            'class': (ctrl.vm.control.active()) ? '' : 'hide'
        }, [
            m('div.heading', 'Alati za mjerenje'),
            m('div.content.active', [
                m('div.text-center', [
                    m('ul.button-group', [
                        m('li', {},
                            m('a.button.tiny', {
                                'class': (ctrl.vm.control.controlType() === 'LineString') ? '' : 'info',
                                'onclick': ctrl.vm.ev_toggleControlType.bind(ctrl, 'LineString')
                                }, 'Udaljenost')
                            ),
                        m('li', {},
                            m('a.button.tiny ', {
                                'class': (ctrl.vm.control.controlType() === 'Polygon') ? '' : 'info',
                                'onclick': ctrl.vm.ev_toggleControlType.bind(ctrl, 'Polygon')
                            }, 'Površina')
                        ),
                    ])
                ]),
                m('div', {}, [
                    ctrl.vm.list.map(function(item) {
                        return m('div.item', item.order() + '. ' + item.result());
                    })
                ])
            ])
        ])];
};

module.exports = VIEW;