'use strict';

const {deepEqual} = require('assert');
const {DocScript} = require('./../docscript');
var expect = require('chai').expect;

describe('DocScript.compile', function() {
    // TODO(goto): break this down into multiple tests.
    it('all tests', function() {
      // Basic fundamental programs are not broken
      assert("Basic", "", {});
      assert("Basic", "1", 1);
      assert("Basic", "`hello`", `hello`);
      assert("Basic", "undefined", undefined);
      assert("Basic", "null", null);
      assert("Basic", "function a() {}", {});
      assert("Basic", "function a() { return 1; } a()", 1);
      assert("Basic", "var a = 1;", {});
      assert("Basic", "var a = 1; a", 1);
      assert("Basic", "let a = 1; a", 1);

      assert("DocScript", `let doc = 1; doc`, 1);
      assert("DocScript", `let doc = div {}; doc`, {name: "div"});
      assert("Nesting", `
      div {
        span {
        }
      }`, {
        name: "div",
        children: [{
          name: "span"
        }]
      });
      assert("Text nodes", `
      div {
        "hello world"
      }`, {
        name: "div",
        children: ["hello world"]
      });
      assert("Scripting for-loops", `
      div {
        for (let i = 0; i < 2; i++) {
          span {
          }
        }
      }`, {
        name: "div",
        children: [{
          name: "span"
        }, {
          name: "span"
        }]
      });
      assert("Scripting calls 1", `
      function bar() {
        return span {
          "hello"
        }
      }
      div {
        bar()
      }`, {
        name: "div",
        children: [{
          name: "span",
          children: ["hello"]
        }]
      });
      assert("Scripting calls 2", `
      function bar() {
        return span {
          "hello"
        }
      }
      div {
        // This is a variation of the previous test where
        // a ; is added at the end of the expression.
        bar();
      }`, {
        name: "div",
        children: [{
          name: "span",
          children: ["hello"]
        }]
      });
      assert("Scripting variables", `
      let a = span {
        "hello world"
      };
      div {
        a
      }`, {
        name: "div",
        children: [{
          name: "span",
          children: ["hello world"]
        }]
      });
      assert("Scripting internal variables", `
      div {
        var a = 1;
        var b = 2
        b
        a & b
        function foo() {
          return 1;
        }
        foo()
      }`, {
        name: "div"
      });
      assert("Makes sure that addChild isn't called twice.", `
      let a = div {
        function bar() {
          return h1 { "bar" }
        }
        // span { "foo" }
        bar()
      };
      a`, {
        name: "div",
        children: [{
          name: "h1",
          children: [
            "bar"
          ]
        }]
      });
    });

    it("React", function() {
      assert("Testing react", `
      class React {
        constructor() {
          this.state = "foo";
        }
        render() {
          return html {
            body {
              "hello world"
            }
          }
        }
      }
      new React().render()
      `, {
        name: "html",
        children: [{
          name: "body",
          children: [
            "hello world"
          ]
        }]
      });
    });

    it("arrays of docscripts can be embedded", function() {
      assert("[]", `
      div {
        [ span { }, "hello" ]
      }`, {
        name: "div",
        children: [{
          name: "span"
	}, "hello"]
      }, true);
    });

    it("[].map() has the right reference to this", function() {
      assert("[].map()", `
      div {
        ["1", "2"].map(x => \`$\{x\}\`)
      }`, {
        name: "div",
	  children: ["1", "2"]
      });
    });

    it.skip("['1'] ['1'].map(span {}) works", function() {
      assert("[].map()", `
      div {
	["1"] // for some reason adding this breaks it
        ["1"].map(x => span { \`$\{x\}\` })
      }`, {
        name: "div",
	children: [{
	  name: "span",
          children: ["1"]
        }]
      }, true);
    });


});

function assert(title, code, expected, debug) {
  if (debug) {
    console.log(`${DocScript.compile(code)}`);
  }

  let result = DocScript.eval(code);

  deepEqual(expected, result);
}
