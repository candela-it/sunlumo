'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);


var SLProject = require('../lib/sl_project');

describe('SLProject', function() {
    it('should initialize', function() {

        var sl_prj = new SLProject();

        expect(sl_prj).not.to.be.undefined;
        expect(sl_prj.options).not.to.be.undefined;
        expect(sl_prj.options).to.eql({});
    });

    it('should initialize with empty options', function() {

        var sl_prj = new SLProject({});

        expect(sl_prj).not.to.be.undefined;
        expect(sl_prj.options).not.to.be.undefined;
        expect(sl_prj.options).to.eql({});

    });

    it('should initialize with options', function() {

        var sl_prj = new SLProject({'test': 'a new option'});

        expect(sl_prj).not.to.be.undefined;
        expect(sl_prj.options).not.to.be.undefined;
        expect(sl_prj.options).to.eql({'test': 'a new option'});
        expect(sl_prj.options['test']).to.eql('a new option');

    });
});