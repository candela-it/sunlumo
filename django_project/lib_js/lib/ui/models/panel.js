'use strict';

var m = require('mithril');

var Jvent = require('jvent');

var ContentComponent = function (data) {
    this.title = m.prop(data.title);
    this.view = data.view;
    this.controller = data.controller;
    this.width = data.width;
    this.top = data.top;
    this.left = data.left;
    this.right = data.right;
};

var VIEWMODEL = function (options) {
    this.init(options);

    this.style = m.prop();

    this.visible = m.prop(false);

    this.minimized = m.prop(false);
};

VIEWMODEL.prototype = {
    init: function (options) {
        this.component = undefined;

        // initialize component events
        this.events = new Jvent();
    },

    addComponent: function (cmpt) {
        this.component = new ContentComponent({
            title: cmpt.title,
            view: cmpt.component.view,
            controller: cmpt.component.controller,
            width: cmpt.width,
            top: cmpt.top,
            left: cmpt.left,
            right: cmpt.right
        });
        // calculate component style
        this.style(this.calculateStyle());
    },

    calculateStyle: function () {
        var top = ['top', this.component.top].join(':');
        var left = ['left', this.component.left].join(':');
        var right = ['right', this.component.right].join(':');
        var width = ['width', this.component.width].join(':');
        return [top, left, right, width].join(';');
    },

    show: function () {
        this.visible(true);
        this.minimized(false);
    },

    hide: function() {
        this.visible(false);
    },

    ev_closeclick: function() {
        this.vm.hide();
        this.vm.events.emit('panel.closed');
    },

    ev_toggleclick: function() {
        if (this.vm.minimized() === true) {
            this.vm.minimized(false);
        } else {
            this.vm.minimized(true);
        }
    }
};

module.exports = VIEWMODEL;
