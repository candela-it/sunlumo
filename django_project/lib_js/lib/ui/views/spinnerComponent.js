'use strict';

var m = require('mithril');

var render = function(ctrl) {
    return m('i.spinner.fa.fa-2x.fa-refresh.fa-pulse', {
        'class': ctrl.vm.active() ? '' : 'hide'
    });
};

var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

module.exports = VIEW;
