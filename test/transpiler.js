'use strict';

const Assert = require('assert');
const {DocScript} = require('./../docscript');
var expect = require('chai').expect;
var acorn = require("acorn");
var tt = acorn.tokTypes;
const { generate } = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');

describe("Transpiler", function() {
  it("Visiting basic", function() {
    let result = DocScript.compile(`d {};`);
    Assert.equal(result,
        `DocScript.createElement.call(this, "d", undefined, function(parent) {});`);
  });

  it("Visiting empty attributes", function() {
    let result = DocScript.compile(`d({}) {};`);
    // console.log(result);
    Assert.equal(result,
        `DocScript.createElement.call(this, "d", {}, function(parent) {});`);
  });

  it("Visiting attributes", function() {
    let result = DocScript.compile(`d({a: 1}) {};`);
    Assert.equal(result,
        `DocScript.createElement.call(this, "d", {a: 1}, function(parent) {});`);
  });

  it("Visiting function attributes binds this", function() {
    let result = DocScript.compile(`d({a: function() { return this; } }) {};`);
    Assert.equal(result,
        `DocScript.createElement.call(this, "d", {a: (function() { return this; }).bind(this) }, function(parent) {});`);
  });
});
