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
        `d(function() {});`);
  });

  it("Visiting empty attributes", function() {
    let result = DocScript.compile(`d({}) {};`);
    // console.log(result);
    Assert.equal(result, `d({}, function() {});`);
  });

  it("Visiting single attribute", function() {
    let result = DocScript.compile(`d(1) {};`);
    // console.log(result);
    Assert.equal(result,
        `d(1, function() {});`);
  });

  it("Visiting object attribute", function() {
    let result = DocScript.compile(`d({a: 1}) {};`);
    Assert.equal(result,
        `d({a: 1}, function() {});`);
  });

  it("Keeps statements in expressions", function() {
    let result = DocScript.compile(`d { a = 1 };`);
    Assert.equal(result,
        `d(function() { a = 1 });`);
  });

  it("Keeps statements in calls", function() {
    let result = DocScript.compile(`d(1) { a = 1 };`);
    Assert.equal(result,
        `d(1, function() { a = 1 });`);
  });

  it.skip("Wraps literals in __Literal__", function() {
    let result = DocScript.compile(`d { 1 };`);
    Assert.equal(result,
        `d(function() { with (this) { scope.__Literal__(1); } });`);
  });

  it.skip("Wraps variables in __Identifier__", function() {
    let result = DocScript.compile(`d { a };`);
    Assert.equal(result,
        `d(function() { with (this) { scope.__Identifier__(a); } });`);
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

  it("Inner functions", function() {
    let result = DocScript.compile(`d { a() };`);
    Assert.equal(result, `d(function() { a.call(this); });`);
  });

  it("Inner functions with params", function() {
    let result = DocScript.compile(`d { a(c) };`);
    Assert.equal(result, `d(function() { a.call(this, c); });`);
  });

  it("Inner nested functions", function() {
    let result = DocScript.compile(`d { a { } };`);
    Assert.equal(result, `d(function() { a.call(this, function() { }); });`);
  });

  it("Property access remains the same for objects", function() {
    let result = DocScript.compile(`d { a.b };`);
    Assert.equal(result, `d(function() { a.b });`);
  });

  it("Property access remains the same for functions", function() {
    let result = DocScript.compile(`d { a.b() };`);
    Assert.equal(result, `d(function() { a.b(); });`);
  });

  it("Property access remains the same for assignments", function() {
    let result = DocScript.compile(`d { a.b = 1 };`);
    Assert.equal(result,
        `d(function() { a.b = 1 });`);
  });

  it("Property access isn't done on lets", function() {
    let result = DocScript.compile(`d { let a = 1 };`);
    Assert.equal(result,
        `d(function() { let a = 1 });`);
  });

  it("Doesn't expand class extends expressions", function() {
    let result = DocScript.compile(`class A extends b() {}`);
    Assert.equal(result, `class A extends b() {}`);
  });

  it("Transpiles annotations", function() {
    // NOTE(goto): de-sugaring from
    // https://github.com/wycats/javascript-decorators
    // Example:
    // > require("babel-core").transform("@foo class A {}", {
    //     plugins: ["transform-decorators-legacy"]}).code
    // > 'var _class;\n\nlet A = foo(_class = class A {}) || _class;'
    //
    // NOTE(goto): only delta is that we use "let" as opposed to "var".
    let result = DocScript.compile(`@foo class A { b() { return 1;} }`);
    Assert.equal(result,`
        let A = (function() {
          class A { b() { return 1;} }

          A = foo(A) || A;
          return A;
        })();`);
  });
});
