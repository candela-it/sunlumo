'use strict';

var m = require('mithril');

var VIEWMODEL = function (options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function () {
        this.active = m.prop(false);
    },

    deactivate: function() {
        var self = this;
        setTimeout(function() {
            m.startComputation();
            self.active(false);
            m.endComputation();
        }, 25);
    },

    activate: function() {
        m.startComputation();
        this.active(true);
        m.endComputation();
    }

};

module.exports = VIEWMODEL;
