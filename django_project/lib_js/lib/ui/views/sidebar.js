'use strict';

var m = require('mithril');

var render = function(ctrl) {
    return m('div.sl-sidebar', [
        m('div.content-holder', [
            ctrl.vm.components.map(function(component, index) {
                return m('div.content', {'class': component.open() ? 'show' : ''}, [
                    // render component view
                    component.view(component.controller)
                ]);
            })
        ]),
        m('div.content-side', [
            ctrl.vm.components.map(function(component, index) {
                return m('div.item', {
                    'class': component.open() ? 'show' : '',
                    onclick: ctrl.vm.ev_toggleOpen.bind(ctrl, component)
                }, [
                    m('a', [component.title()])
                ]);
            })
        ])
    ]);
};

var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

module.exports = VIEW;
