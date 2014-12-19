/*jshint expr: true*/
'use strict';

var chai = require('chai');
var expect = chai.expect;
// var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var SLProject = require('../lib/sl_project');

describe('SLProject Object', function() {
    it('should not initialize', function() {

        var test_fun  = function () {new SLProject();};

        expect(test_fun).to.throw('SLProject options parameter must be defined');
    });

    it('should not initialize with empty options', function() {

        var test_fun  = function () {new SLProject({});};

        expect(test_fun).to.throw('SLProject options parameter must be defined');
    });

    it('should not initialize when required options are missing', function () {

        var test_fun  = function () {new SLProject({'test': '...'});};

        expect(test_fun).to.throw('SLProject options must contain "layers" property');
    });

    it('should not initialize with empty layers param', function () {

        var test_fun  = function () {new SLProject({'layers': {'layer1':{}}});};

        expect(test_fun).to.throw('SLProject options must contain "layers_order" property');
    });

    it('should not initialize with empty layers_order param', function () {

        var test_fun  = function () {new SLProject({'layers': {}, 'layers_order': {}});};

        expect(test_fun).to.throw('SLProject "layers" must not be empty');
    });

    it('should not initialize when layers_order are not matching layers', function() {

        var test_fun  = function () {
            new SLProject({
                'layers': {
                    'layer1_some_id': {
                        'visible': true, 'layer_name': 'layer1'
                    },
                    'layer2_some_id': {
                        'visible': true, 'layer_name': 'layer2'
                    }
                },
                'layers_order': ['layer1_some_id_fake', 'layer2_some_id']
            });
        };

        expect(test_fun).to.throw('SLProject "layers" and "layers_order" are not matching');
    });

    it('should initialize with options', function() {

        var sl_prj = new SLProject({
            'layers': {
                'layer1_some_id': {
                    'visible': true, 'layer_name': 'layer1'
                },
                'layer2_some_id': {
                    'visible': true, 'layer_name': 'layer2'
                }
            },
            'layers_order': ['layer1_some_id', 'layer2_some_id']
        });

        expect(sl_prj).not.to.be.undefined;
        expect(sl_prj.options.layers).not.to.be.undefined;
        expect(sl_prj.options.layers_order).not.to.be.undefined;
    });

});

describe('SLProject Object public methods', function() {
    it('should return comma separated list of layers in order', function() {

        var sl_prj = new SLProject({
            'layers': {
                'layer1_some_id': {
                    'visible': true, 'layer_name': 'layer1'
                },
                'layer2_some_id': {
                    'visible': true, 'layer_name': 'layer2'
                }
            },
            'layers_order': ['layer1_some_id', 'layer2_some_id']
        });

        expect(sl_prj.getLayersParam()).to.be.equal('layer1_some_id,layer2_some_id');
    });

});