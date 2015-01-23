'use strict';

var _ = require('lodash');
var m = require('mithril');
var ol = require('../contrib/ol');
var dc = require('./sl_DisplayFeaturesComponent');

var EVENTS = require('./events');

var ResultsDisplay = function() {
    this.active = m.prop(false);
};

var Feature = function(data) {
    var self = this;
    this.properties = {};
    _.forEach(data.properties, function(value, attribute) {
        self.properties[attribute] = m.prop(value);
    });
    this.toggled = m.prop(false);
    this.toggle = function() {
        if (self.toggled()) {
            self.toggled(false);
        } else {
            self.toggled(true);
        }
    };
};

var FeatureList = Array;

ResultsDisplay.vm = (function() {
    var vm = {};
    vm.init = function() {
        vm.list = new FeatureList();
        vm.control = new ResultsDisplay();
        vm.dc = new dc();
    };
    vm.set = function(data) {
        vm.list = new FeatureList();
        _.each(data.features, function(item) {
            vm.list.push(new Feature(item));
        });
    };
    return vm;
})();

ResultsDisplay.controller = function() {
    this.toggleControl = function() {
        if (ResultsDisplay.vm.control.active()) {
            ResultsDisplay.vm._deactivateControl();
        } else {
            ResultsDisplay.vm._activateControl();
        }
    };

    this.activateControl = function() {
        ResultsDisplay.vm.control.active(true);
    };

    this.deactivateControl = function() {
        ResultsDisplay.vm.control.active(false);
    };
};

ResultsDisplay.view = function(ctrl) {
    return [
        m('div', {
        'class': (ResultsDisplay.vm.control.active()) ? 'toolbox-control-results panel' : 'toolbox-control-results panel hide'
        }, [
            m('div', { 'class': 'heading' }, 'Izabrano'),
            m('div', { 'class': 'content' }, [
                ResultsDisplay.vm.dc.view({ data: ResultsDisplay.vm.list })
            ])
        ])
    ];
};



var SL_GetFeatureInfoControl = function (map, options) {
    // default options
    this.options = {
        // initial module options
    };

    if (!map || Object.getOwnPropertyNames(map).length === 0) {
        throw new Error('SL_GetFeatureInfoControl map parameter must be defined');
    }


    if (!options || Object.getOwnPropertyNames(options).length === 0) {
        throw new Error('SL_GetFeatureInfoControl options parameter must be defined');
    }

    // override and extend default options
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            this.options[opt] = options[opt];
        }
    }

    // internal reference to the map object
    this.map = map;

    // initialize the getfeatureinfo control
    this._init();

};


SL_GetFeatureInfoControl.prototype = {
    _init: function() {
        var self = this;

        this.SL_GFI_Source =  new ol.source.GeoJSON({
            // projection: data.map.getView().getProjection(),
            defaultProjection: this.map.getView().getProjection()
        });

        this.SL_GFI_Layer = new ol.layer.Vector({
            source: this.SL_GFI_Source
        });

        var geojsonFormat = new ol.format.GeoJSON();

        ResultsDisplay.vm.init();


        m.module(document.getElementById('resultsToolControl'), {controller: ResultsDisplay.controller, view: ResultsDisplay.view});

        EVENTS.on('qgis.gfi.url.changed', function(data) {
            m.request({
                method: 'GET',
                url: data.url
            }).then(function (response) {
                // reset data of the previous source
                self.SL_GFI_Source.clear(true);
                // add new features
                self.SL_GFI_Source.addFeatures(geojsonFormat.readFeatures(response));
                ResultsDisplay.vm.set(response);
                ResultsDisplay.vm.control.active(true);
            });
        });
    }
};

module.exports = SL_GetFeatureInfoControl;
