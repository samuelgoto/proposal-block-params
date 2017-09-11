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
        `d(function(scope) { with (scope) {} });`);
  });

  it("Visiting empty attributes", function() {
    let result = DocScript.compile(`d({}) {};`);
    // console.log(result);
    Assert.equal(result, `d({}, function(scope) { with (scope) {} });`);
  });

  it("Visiting single attribute", function() {
    let result = DocScript.compile(`d(1) {};`);
    // console.log(result);
    Assert.equal(result,
        `d(1, function(scope) { with (scope) {} });`);
  });

  it("Visiting object attribute", function() {
    let result = DocScript.compile(`d({a: 1}) {};`);
    Assert.equal(result,
        `d({a: 1}, function(scope) { with (scope) {} });`);
  });

  it("Keeps statements in expressions", function() {
    let result = DocScript.compile(`d { a = 1 };`);
    Assert.equal(result,
        `d(function(scope) { with (scope) { a = 1 } });`);
  });

  it("Keeps statements in calls", function() {
    let result = DocScript.compile(`d(1) { a = 1 };`);
    Assert.equal(result,
        `d(1, function(scope) { with (scope) { a = 1 } });`);
  });

  it("Wraps literals in __Literal__", function() {
    let result = DocScript.compile(`d { 1 };`);
    Assert.equal(result,
        `d(function(scope) { with (scope) { scope.__Literal__(1); } });`);
  });

  it("Wraps variables in __Identifier__", function() {
    let result = DocScript.compile(`d { a };`);
    Assert.equal(result,
        `d(function(scope) { with (scope) { scope.__Identifier__(a); } });`);
  });

  it.skip("Visiting function attributes binds this", function() {
    // NOTE(goto): this was an early design where we fix this at the
    // code generation level. This kind of works, but misses when
    // expressions are used as opposed to code. For example:
    // let a = {b: function() {} }; d(a) {};
    let result = DocScript.compile(`d({a: function() { return this; } }) {};`);
    Assert.equal(result,
        `DocScript.createElement.call(this, "d", {a: (function() { return this; }).bind(this) }, function(parent) {});`);
  });
});
