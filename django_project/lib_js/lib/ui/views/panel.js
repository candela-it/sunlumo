'use strict';

var m = require('mithril');
var _ = require('lodash');


var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

var render = function(ctrl) {
    if (ctrl.vm.visible()) {
        return m('div.sl-panel', {'style': ctrl.vm.style()}, [
            m('div.heading', [
                m('i.fa.fa-times-circle.mouse-pointer', {
                    onclick: ctrl.vm.ev_closeclick.bind(ctrl)
                }),
                ctrl.vm.component.title()
            ]),
            m('div.content.active', [
                ctrl.vm.component.view(ctrl.vm.component.controller)
            ])
        ]);
    } else {
        return undefined;
    }
};


module.exports = VIEW;
