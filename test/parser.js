'use strict';

const Assert = require('assert');
const docscript = require('./../docscript');
var expect = require('chai').expect;
var acorn = require("acorn");
var tt = acorn.tokTypes;
const { generate } = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');

describe("Parser", function() {
  // Asserts that these things, without the plugin, would lead to SyntaxErrors
  it("There docscript in JS", function() {
    assertThat(`foo {}`).syntaxError();
  });

  it("There docscript in JS with attributes", function() {
    assertThat(`foo() {}`).syntaxError();
  });

  it("There is no cast in JS", function() {
    assertThat(`(Foo) foo()`).syntaxError();
  });

  // And with the plugin enabled ...
  it("Parsing basic statement", function() {
    assertThat(`d {};`).parses();
  });

  it("Parsing basic expression", function() {
    assertThat(`let a = d {};`).parses();
  });

  it("Parsing empty attributes", function() {
    assertThat(`d({}) {};`).parses();
  });

  it("Parsing attributes", function() {
    assertThat(`d({a: "hi"}) {};`).parses();
  });

  it("Parsing attributes inside functions", function() {
    assertThat(`
      function bar() {
        return d({a: "hi"}) {};
      }
    `).parses();
  });

  it("Parsing attributes inside methods", function() {
    assertThat(`
      class Foo {
        bar() {
          return d({a: "hi"}) {};
        }
      }
    `).parses();
  });

  it("Parsing attribute that gets ignored", function() {
    // This is allowed, but because this isn't a named object this
    // gets ignored.
    assertThat(`
     d(1) {}
   `).parses();
  });

  it("Extending new in statements", function() {
    assertThat(`new HtmlElement() { div };`).parses();
  });

  it("Extending new in expressions", function() {
    assertThat(`let a = new HtmlElement() { div };`).parses();
  });
});

class That {
  constructor(code) {
    this.code = code;
  }

  syntaxError() {
    let error = true;
    try {
      let result = acorn.parse(this.code);
      error = false;
    } catch (e) {
      // Expected exception.
    }

    if (!error) {
      throw new Error("Syntax Error expected");
    }
  }

  parses(opt_debug) {
    let result = acorn.parse(this.code, {
      plugins: {docscript: true}
    });
    if (opt_debug) {
      console.log(JSON.stringify(result, undefined, ' '));
    }
  }

  throwsError(message) {
    let error = true;
    try {
      let result = acorn.parse(this.code, {
	plugins: {docscript: true}
      });
      error = false;
    } catch (e) {
      // Expected exception.
    }

    if (!error) {
      throw new Error(message);
    }
  }

}

function assertThat(code) {
  return new That(code);
}
