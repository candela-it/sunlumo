'use strict';

var _ = require('lodash');
var m = require('mithril');
var ol = require('../../../contrib/ol');

// global events
var EVENTS = require('../../events');

var ResultsDisplay = function() {
    this.active = m.prop(false);
};

var Feature = function(data) {
    this.id = m.prop(data.id);
    this.toggled = m.prop(false);

    this.properties = {};
};

Feature.prototype = {
    toggle: function() {
        if (this.toggled()) {
            this.toggled(false);
        } else {
            this.toggled(true);
        }
    },

    setProperties: function(properties){
        var self = this;
        _.forEach(properties, function(value, attribute) {
            if (properties.hasOwnProperty(attribute)) {
                self.properties[attribute] = m.prop(value);
            }
        });
    }
};

var FeatureList = Array;

var VIEWMODEL = function(options) {
    this.init(options);
};

VIEWMODEL.prototype = {
    init: function(options) {
        this.list = new FeatureList();
        this.control = new ResultsDisplay();
    },
    set: function(data) {
        var self = this;
        this.list = new FeatureList();

        _.each(data, function(feature) {
            var geometryName = feature.getGeometryName();
            var properties = feature.getProperties();

            var newFeature = new Feature({
                'id': feature.getId()
            });
            // omit geometry from properties (OL3 api) as it's included
            newFeature.setProperties(_.omit(properties, geometryName));
            self.list.push(newFeature);
        });

        this.control.active(true);
    },
    toggleControl: function() {
        if (this.vm.control.active()) {
            this.vm._deactivateControl();
        } else {
            this.vm._activateControl();
        }
    },

    activateControl: function() {
        this.vm.control.active(true);
    },

    deactivateControl: function() {
        this.vm.control.active(false);
    },

    ev_resultClicked: function(item) {
        EVENTS.emit('gfi.result.clicked', {
            'result': item
        });
    },

    ev_toggleItem: function (item) {
        item.toggle();
    }
};

module.exports = VIEWMODEL;
