'use strict';

var m = require('mithril');


var render = function(ctrl) {
    return m('div', {}, [
        ctrl.vm.index_list.map(function(index) {
            return m('div.search-chk', [
                m('input[type=checkbox]', {
                    onclick: ctrl.vm.ev_clickIndex.bind(ctrl, index),
                    checked: index.visible()
                }),
                m('label', index.index_name())
            ]);
        }),
        m('input', {
            onchange: ctrl.vm.ev_inputChanged.bind(ctrl),
            onkeypress: ctrl.vm.ev_keypressAction.bind(ctrl)
        }),
        m('button.tiny', {onclick: ctrl.vm.ev_clickSearch.bind(ctrl)}, 'Pretraži')
    ]);
};

var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

module.exports = VIEW;
