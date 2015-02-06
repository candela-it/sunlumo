'use strict';

var m = require('mithril');


var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

var render = function(ctrl) {
    return m('div', {}, [
        ctrl.vm.index_list.map(function(index) {
                return m('label', index.index_name(), [
                    m('input[type=checkbox]', {
                        'onclick': ctrl.vm.ev_clickIndex.bind(ctrl, index),
                        'checked': index.visible()
                    })
                ]);
        }),
        m('input', {
            'onchange':ctrl.vm.ev_inputChanged.bind(ctrl),
            'onkeypress':ctrl.vm.ev_keypressAction.bind(ctrl)
        }),
        m('button', {'onclick':ctrl.vm.ev_clickSearch.bind(ctrl)}, 'Search'),
        m('ul', [
            ctrl.vm.result_list.map(function(item) {
                return m('li', {
                    'onclick': ctrl.vm.ev_clickResult.bind(ctrl, item)
                }, item.index_value());
            })]
        )]
    );
};

module.exports = VIEW;
