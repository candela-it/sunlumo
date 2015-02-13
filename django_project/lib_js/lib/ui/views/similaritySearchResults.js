'use strict';

var m = require('mithril');


var render = function(ctrl) {
    return m('ul', [
        ctrl.vm.result_list.map(function(item) {
            return m('li', {
                onclick: ctrl.vm.ev_clickResult.bind(ctrl, item)
                }, item.index_value()
            );
        })]
    );
};

var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

module.exports = VIEW;
