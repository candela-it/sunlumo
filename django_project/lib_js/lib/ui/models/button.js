'use strict';

var m = require('mithril');

// global events
var Jvent = require('jvent');


var VIEWMODEL = function (options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function (options) {
        this.active = m.prop();

        this.style = m.prop(options.style);

        // initialize component events
        this.events = new Jvent();
    },

    ev_toggleButton: function() {
        if (this.vm.active()) {
            this.vm.active(false);
            this.vm.events.emit('button.deactivated');
        } else {
            this.vm.active(true);
            this.vm.events.emit('button.activated');
        }
    }
};

module.exports = VIEWMODEL;
