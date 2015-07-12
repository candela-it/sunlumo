'use strict';

var m = require('mithril');
var _ = require('lodash');


var render = function(ctrl) {
    return [
        ctrl.vm.list.map(function(item) {
            if (Object.keys(item.properties).length === 0) {
                item.properties = {
                    unknown: function () {
                        return 'unknown';
                    }
                };
            }
            return m('div.feature-result', [
                _.map(item.properties, function(val, attr) {
                    return m('div.item', {'class': item.toggled() ? '' : 'hide'}, attr + ': ' + val());
                }),
                m('div.item.head.mouse-pointer',
                    {
                        'class': item.toggled() ? 'hide' : '',
                        onclick: ctrl.vm.ev_toggleItem.bind(ctrl, item)
                    },
                    Object.keys(item.properties)[0] + ': ' + item.properties[Object.keys(item.properties)[0]]()
                ),
                m('div.item.toggle-icon', {
                        onclick: ctrl.vm.ev_toggleItem.bind(ctrl, item)
                    }, [
                    m('i.mouse-pointer', {
                        'class': item.toggled() ? 'fa fa-minus' : 'fa fa-plus'
                    })
                ]),
                m('div.item.locate-icon',
                    {
                        onclick: ctrl.vm.ev_resultClicked.bind(ctrl, item),
                        'class': item.toggled() ? '' : 'hide'
                    },
                    [
                        m('i.mouse-pointer.fa.fa-map-marker')
                    ]
                )
            ]);
        })
    ];
};


var VIEW = function (ctrl) {
    // do not add anything else to the VIEW, it should never initialize anything
    return render(ctrl);
};

module.exports = VIEW;
