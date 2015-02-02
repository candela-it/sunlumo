'use strict';

var m = require('mithril');


var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

var render = function(ctrl) {
    return [
        m('div', {
            'class': (ctrl.vm.control.active()) ? 'button small controlButton' : 'button small info controlButton',
            'onclick': ctrl.vm.ev_toggleControl.bind(ctrl)
        }, [
            m('i', { 'class': 'fi-foot'})
        ]),
        m('div.toolbox-control-results.panel.DistanceTool', {
            'class': (ctrl.vm.control.active()) ? '' : 'hide'
        }, [
            m('div', { 'class': 'heading' }, 'Alati za mjerenje'),
            m('div', { 'class': 'content' }, [
                m('div', { 'class': 'text-center' }, [
                    m('ul', { 'class': 'button-group'}, [
                        m('li', {}, m('a', {
                            'class': (ctrl.vm.control.controlType() === 'LineString') ? 'button tiny' : 'button tiny info',
                            'onclick': ctrl.vm.ev_toggleControlType.bind(ctrl, 'LineString')
                        }, 'Udaljenost')),
                        m('li', {}, m('a', {
                            'class': (ctrl.vm.control.controlType() === 'Polygon') ? 'button tiny' : 'button tiny info',
                            'onclick': ctrl.vm.ev_toggleControlType.bind(ctrl, 'Polygon')
                        }, 'Površina')),
                    ])
                ]),
                m('div', {}, [
                    ctrl.vm.list.map(function(item) {
                        return m('div', { 'class': 'item'}, item.order() + '. ' + item.result());
                    })
                ])
            ])
        ])];
};

module.exports = VIEW;