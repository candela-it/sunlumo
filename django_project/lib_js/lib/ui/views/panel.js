'use strict';

var m = require('mithril');

var render = function(ctrl) {
    if (ctrl.vm.visible()) {
        return m('div.sl-panel', {style: ctrl.vm.style()}, [
            m('div.heading', [
                ctrl.vm.component.title(),
                m('i.fa.mouse-pointer.toggle-icon', {
                    'class': ctrl.vm.minimized() ? 'fa-chevron-up' : 'fa-chevron-down',
                    onclick: ctrl.vm.ev_toggleclick.bind(ctrl)
                }),
                m('i.fa.fa-times-circle.mouse-pointer.close-icon', {
                    onclick: ctrl.vm.ev_closeclick.bind(ctrl)
                })
            ]),
            m('div.content.active', {
                'class': ctrl.vm.minimized() ? 'hide' : ''
            }, [
                ctrl.vm.component.view(ctrl.vm.component.controller)
            ])
        ]);
    }

    return undefined;
};

var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

module.exports = VIEW;
