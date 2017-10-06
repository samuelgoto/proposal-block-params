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

  it("Nesting", function() {
   assertThat(`
     function a(lambda) {
       let result = {};
       lambda.call(result);
       return result;
     }
     function b(lambda) {
       this["hello"] = "world";
     }
     a { 
       b {}
     }
   `).deepEquals({hello: "world"});
  });

});

class That {
  constructor(code) {
    this.code = code;
  }

  eval(opt_debug) {
    let result = eval(DocScript.compile(this.code).toString());
    if (opt_debug) {
      console.log(JSON.stringify(result, undefined, ' '));
    }
    return result;
  }

  deepEquals(expected, opt_debug) {
    let result = this.eval(opt_debug);
    Assert.deepEqual(expected, result);
  }

  equals(expected, opt_debug) {
    let result = this.eval(opt_debug);
    Assert.equal(expected, result);
  }
}

function assertThat(code) {
  return new That(code);
}
