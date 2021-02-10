const Assert = require('assert');
const {DocScript} = require('./../docscript');
var expect = require('chai').expect;

describe.skip("Semantics", function() {
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
       return lambda({});
     }
     a(1) { return 2; }
   `).equals(2);
  });

  it("Nesting", function() {
   assertThat(`
     function a(lambda) {
       let result = undefined;
       lambda({
         b() {
           result = "hello world";
         }
       });
       return result;
     }
     a { 
      // TODO(goto): make the syntactical simplication
      // where :: is equivalent to __args__[Symbol.this]
      let b = __args__.b;
      b {}
     }
   `).deepEquals("hello world");
  });

  it("Nesting function declarations", function() {
   assertThat(`
     function a(lambda) {
       return lambda({foo: "bar"});
     }
     a {
       function b() {
	 return __args__;
       }
       return b();
     }
   `).deepEquals({foo: "bar"});
  });
});

class That {
  constructor(code) {
    this.code = code;
  }

  eval(opt_debug) {
    let code = DocScript.compile(this.code).toString();
    if (opt_debug) {
      console.log(code);
    }
    let result = eval(code);
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
