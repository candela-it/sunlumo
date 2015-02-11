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
        m.startComputation();
        this.active(false);
        m.endComputation();
    },

    activate: function() {
        m.startComputation();
        this.active(true);
        m.endComputation();
    }

};

module.exports = VIEWMODEL;
