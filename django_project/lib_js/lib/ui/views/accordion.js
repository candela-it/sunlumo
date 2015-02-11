'use strict';

var m = require('mithril');


var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

var render = function(ctrl) {
    return m('div.sl-accordion', [
        ctrl.vm.components.map(function(component, index) {
            return m('div.accordion-navigation', [
                m('a', {
                    'onclick': ctrl.vm.ev_toggleOpen.bind(ctrl, component)
                }, [component.title()]),
                m('div.content', {'class': component.open() ? 'active' : ''}, [
                    // render component view
                    component.view(component.controller)
                ])
            ]);
        })
    ]
    );
};


module.exports = VIEW;
