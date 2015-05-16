'use strict';

var m = require('mithril');
var _ = require('lodash');

var ContentComponents = function (data) {
    this.id = m.prop(data.id);
    this.title = m.prop(data.title);
    this.view = data.view;
    this.controller = data.controller;
    this.open = m.prop(data.open);
};

ContentComponents.prototype = {
    toggleOpen: function () {
        if (this.open()) {
            this.open(false);
        } else {
            this.open(true);
        }
    },

    close: function() {
        this.open(false);
    }
};

var VIEWMODEL = function (options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function (options) {
        this.components = [];
    },

    addComponents: function (components) {
        var self = this;
        _.forEach(components, function(cmpt, idx) {
            self.components.push(
                new ContentComponents({
                    id: idx,
                    title: cmpt.title,
                    view: cmpt.component.view,
                    controller: cmpt.component.controller,
                    open: cmpt.open
                })
            );
        });
    },

    ev_toggleOpen: function (component) {
        _.forEach(this.vm.components, function(cmpt, idx) {
            if (component.id() !== cmpt.id()) {
                cmpt.close();
            }
        });
        component.toggleOpen();
    }

};

module.exports = VIEWMODEL;
