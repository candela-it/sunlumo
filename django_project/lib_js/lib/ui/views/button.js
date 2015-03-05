'use strict';

var m = require('mithril');

var render = function(ctrl) {
    return m('div.button.small.controlButton', {
        'class': ctrl.vm.active() ? '' : 'info',
        onclick: ctrl.vm.ev_toggleButton.bind(ctrl),
        'title': ctrl.vm.title()
    }, [
        m(ctrl.vm.style())
    ]);
};


var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

module.exports = VIEW;
