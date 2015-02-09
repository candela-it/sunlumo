'use strict';

var m = require('mithril');
var _ = require('lodash');

var ContentComponents = function (data) {
    this.id = m.prop(data.id);
    this.view = data.view;
    this.controller = data.controller;
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
                    'id': idx,
                    'view': cmpt.component.view,
                    'controller': cmpt.component.controller
                })
            );
            // handle activated events so we can deactivate all other toolbox buttons
            cmpt.component.controller.vm.events.on(
                'button.activated', self.toggleComponents.bind(self)
            );
        });
    },

    toggleComponents: function (options) {
        _.forEach(this.components, function (cmpt) {
            if (cmpt.controller.vm.uuid() !== options.uuid) {
                cmpt.controller.vm.deactivate();
            }
        });
    }
};

module.exports = VIEWMODEL;
