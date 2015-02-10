'use strict';

var _ = require('lodash');
var m = require('mithril');

// global events
var EVENTS = require('../../events');


// serialize object to parameters list
// this should be moved to the generic utils package

var seralizeObjectToParams = function (obj) {
    var str = '';
    for (var key in obj) {
        if(obj.hasOwnProperty(key)) {
            if (str !== '') {
                str += '&';
            }
            str += key + '=' + encodeURIComponent(obj[key]);
        }
    }
    return str;
};

var PrintLayout = function(data) {
    this.name = m.prop(data.name);
    this.width = m.prop(data.width);
    this.height = m.prop(data.height);
};

var PrintLayoutCollection = Array;

var Scales = [
    {scale: 500, display: '1:500'},
    {scale: 1000, display: '1:1000'},
    {scale: 2000, display: '1:2000'},
    {scale: 5000, display: '1:5000'},
    {scale: 10000, display: '1:10000'},
    {scale: 25000, display: '1:25000'},
    {scale: 50000, display: '1:50000'},
    {scale: 100000, display: '1:100000'}
];

var VIEWMODEL = function(options, initialState) {
    this.init(options, initialState);
};

VIEWMODEL.prototype = {
    init: function(options, initialState) {
        var self = this;
        this.options = options;
        this.initialState = initialState;

        this.scales = Scales;
        this.params = {
            'bbox': undefined,
            'layers': this.initialState.layers,
            'transparencies': this.initialState.transparencies,
            'map': this.options.map,
            'layout': undefined,
            'srs': 'EPSG:3765'
        };

        this.printUrl = m.prop(undefined);

        this.layouts_list = new PrintLayoutCollection();
        this.selected_layout = undefined;

        _.forEach(this.options.layouts, function(layout) {
            var layout_data = self.options.layouts_data[layout];
            // add new layout
            self.add(
                layout, Number(layout_data.width), Number(layout_data.height)
            );
        });

        // Set initial layout option.
        this.selected_layout = this.layouts_list[0];
        this.params.layout = this.layouts_list[0].name();
    },

    // add layout to layouts list.
    add: function(name, width, height) {
        this.layouts_list.push(new PrintLayout({
            'name': name,
            'width': width,
            'height': height
        }));
    },

    updatePrintUrl: function () {
        var printParam = seralizeObjectToParams(this.params);
        var url = '/printpdf?';

        var printUrl = url + printParam;
        this.printUrl(printUrl);
    },

    ev_onScaleChange: function(evt) {
        // deduct 1 to account for first artificial option
        this.vm.selected_scale = Scales[evt.currentTarget.selectedIndex - 1];
        // Automatically show print area.
        EVENTS.emit('print.show', {
            'scale': this.vm.selected_scale,
            'layout': this.vm.selected_layout
        });
    },

    ev_onPrintLayoutChange: function(evt) {
        this.vm.selected_layout = this.vm.layouts_list[evt.currentTarget.selectedIndex];
        // Automatically show print area.
        EVENTS.emit('print.show', {
            'scale': this.vm.selected_scale,
            'layout': this.vm.selected_layout
        });
    }
};

module.exports = VIEWMODEL;
