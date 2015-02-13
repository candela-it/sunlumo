'use strict';

var uuid = require('node-uuid');

var m = require('mithril');

// global events
var Jvent = require('jvent');


var VIEWMODEL = function (options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function (options) {
        this.active = m.prop();

        this.uuid = m.prop(uuid.v1());

        this.style = m.prop(options.style);

        // initialize component events
        this.events = new Jvent();
    },

    activate: function () {
        this.active(true);
        this.events.emit('button.activated', {
            uuid: this.uuid()
        });
    },

    deactivate: function (stopPropagation) {
        this.active(false);
        if (!stopPropagation) {
            this.events.emit('button.deactivated', {
                uuid: this.uuid()
            });
        }
    },

    ev_toggleButton: function() {
        if (this.vm.active()) {
            this.vm.deactivate();
        } else {
            this.vm.activate();
        }
    }
};

module.exports = VIEWMODEL;
