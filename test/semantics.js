const Assert = require('assert');
const {DocScript} = require('./../docscript');
var expect = require('chai').expect;

describe("Semantics", function() {
  it("Legacy", function() {
    assertThat(`function a() { return 1; } a()`).equals(1);
  });

  it("Simplest", function() {
    assertThat(`function a() { return 1; } a {}`).equals(1);
  });

  it("Parameters", function() {
   assertThat(`
     function a(arg, lambda) {
       return arg;
     }
     a(1) {}
   `).equals(1);
  });

  it("Lambda", function() {
   assertThat(`
     function a(arg, lambda) {
       return lambda();
     }
     a(1) { return 2; }
   `).equals(2);
  });

});

class That {
  constructor(code) {
    this.code = code;
  }

  equals(expected, opt_debug) {
    let result = eval(DocScript.compile(this.code).toString());
    if (opt_debug) {
      console.log(JSON.stringify(result, undefined, ' '));
    }
    Assert.equal(expected, result);
  }
}

function assertThat(code) {
  return new That(code);
}
