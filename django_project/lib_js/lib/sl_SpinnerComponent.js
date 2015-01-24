'use strict';

var m = require('mithril');
var EVENTS = require('./events');

var SL_SpinnerComponent = {};

SL_SpinnerComponent.vm = (function() {
    var vm = {};
    vm.init = function() {
        vm.active = m.prop(false);
    };

    vm.deactivate = function() {
        vm.active(false);
    };

    vm.activate = function() {
        vm.active(true);
    };
    return vm;
})();

SL_SpinnerComponent.view = function() {
    return m('img.logo', {
        'src': '/static/img/spinner7.gif',
        'class': (SL_SpinnerComponent.vm.active()) ? '' : 'hide'
    });
};

SL_SpinnerComponent.controller = function() {
    SL_SpinnerComponent.vm.init();

    EVENTS.on('qgs.spinner.activate', function() {
       SL_SpinnerComponent.vm.activate();
    });

    EVENTS.on('qgs.spinner.deactivate', function() {
       SL_SpinnerComponent.vm.deactivate();
    });
};

m.module(document.getElementById('logo'), {controller: SL_SpinnerComponent.controller, view: SL_SpinnerComponent.view});
module.exports = SL_SpinnerComponent;
