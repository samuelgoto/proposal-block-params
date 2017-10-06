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

  it("Nesting function declarations", function() {
   assertThat(`
     function a(lambda) {
       return lambda.call(2);
     }
     a {
       function b() {
	 return this;
       }
       return b();
     }
   `).equals(2);
  });

  it("Methods do not get this overriden", function() {
   assertThat(`
     function a(lambda) {
       return lambda.call(2);
     }
     a {
       function b() {
	 return this;
       }
       return b();
     }
   `).equals(2);
  });

});

class That {
  constructor(code) {
    this.code = code;
  }

  eval(opt_debug) {
    let code = DocScript.compile(this.code).toString();
    let result = eval(code);
    if (opt_debug) {
      console.log(code);
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
