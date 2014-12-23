/*jshint expr: true*/
'use strict';

var chai = require('chai');
var expect = chai.expect;
// var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var SLProject = require('../lib/sl_Project');

describe('SL_Project Object', function() {
    it('should not initialize', function() {

        var test_fun  = function () {new SLProject();};

        expect(test_fun).to.throw('SLProject options parameter must be defined');
    });
});
