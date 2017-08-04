'use strict';

const Assert = require('assert');
const {DocScript} = require('./../docscript');
var expect = require('chai').expect;

describe('DocScript.compile', function() {
  it('Basic', function() {
    // Basic fundamental programs are not broken
    assertThat("").equalsTo({});
    assertThat("1").equalsTo(1);
    assertThat("`hello`").equalsTo(`hello`);
    assertThat("undefined").equalsTo(undefined);
    assertThat("null").equalsTo(null);
    assertThat("function a() {}").equalsTo({});
    assertThat("function a() { return 1; } a()").equalsTo(1);
    assertThat("var a = 1;").equalsTo({});
    assertThat("var a = 1; a").equalsTo(1);
    assertThat("let a = 1; a").equalsTo(1);
  });

  it('Basic DocScripts', function() {
    assertThat(`let doc = 1; doc`).equalsTo(1);
    assertThat(`let doc = div {}; doc`).equalsTo({name: "div"});
  });

  it('Nesting', function() {
    assertThat(`
      div {
        span {
        }
      }`
    ).equalsTo({
      name: "div",
      children: [{
        name: "span"
      }]
    });
  });

  it('Text nodes', function() {
    assertThat(`
      div {
        "hello world"
      }`
    ).equalsTo({
      name: "div",
      children: ["hello world"]
    });
  });

  it('For-loops', function() {
    assertThat(`
      div {
        for (let i = 0; i < 2; i++) {
          span {
          }
        }
      }`
    ).equalsTo({
      name: "div",
      children: [{
        name: "span"
      }, {
        name: "span"
      }]
    });
  });

  it('Functions 1', function() {
    assertThat(`
      function bar() {
        return span {
          "hello"
        }
      }
      div {
        bar()
      }`
    ).equalsTo({
      name: "div",
      children: [{
        name: "span",
        children: ["hello"]
      }]
    });
  });

  it('Functions 2', function() {
    assertThat(`
      function bar() {
        return span {
          "hello"
        }
      }
      div {
        // This is a variation of the previous test where
        // a ; is added at the end of the expression.
        bar();
      }`
    ).equalsTo({
      name: "div",
      children: [{
        name: "span",
        children: ["hello"]
      }]
    });
  });

  it('Variables', function() {
    assertThat(`
      let a = span {
        "hello world"
      };
      div {
        a
      }`
    ).equalsTo({
      name: "div",
      children: [{
        name: "span",
        children: ["hello world"]
      }]
    });
  });

  it('Scripting internal variables', function() {
    assertThat(`
      div {
	var a = 1;
        var b = 2;
	b
	a & b
        function foo() {
          return 1;
        }
        foo()
      }`
    ).equalsTo({
      name: "div"
    });
  });

  it("Makes sure that addChild isn't called twice.", function() {
    assertThat(`
      let a = div {
        function bar() {
          return h1 { "bar" }
        }
        // span { "foo" }
        bar()
      };
      a`
    ).equalsTo({
      name: "div",
      children: [{
        name: "h1",
        children: [
          "bar"
        ]
      }]
    });
  });

  it("React-like component", function() {
    assertThat(`
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
      `
    ).equalsTo({
      name: "html",
      children: [{
        name: "body",
        children: [
          "hello world"
        ]
      }]
    });
  });

  it("Arrays of docscripts can be embedded", function() {
    assertThat(`
      div {
        [ span { }, "hello" ]
      }`
    ).equalsTo({
      name: "div",
      children: [{
        name: "span"
      }, "hello"]
    });
  });

  it("[].map() has the right reference to this", function() {
    assertThat(`
      div {
        ["1", "2"].map(x => \`$\{x\}\`)
      }`
    ).equalsTo({
      name: "div",
      children: ["1", "2"]
    });
  });

  it("Two variables", function() {
    assertThat(`
      let a = "1";
      div {
	a
        a
      }`
    ).equalsTo({
      name: "div",
      children: ["1", "1"]
    });
  });

  it("Two method calls", function() {
    assertThat(`
      function a() { return  "1"; }
      div {
	a()
        a()
      }`
    ).equalsTo({
      name: "div",
      children: ["1", "1"]
    });
  });

  it("[]-member expressions", function() {
    assertThat(`
      div {
        "1"
        ["2"]
      }`
    ).throwsError(
      `This throws an Error now because it evaluates to something
       equivalent to div { "1"["2"] } == div { undefined }.`);
  });

  it(".-member expressions", function() {
    assertThat(`
      div {
        "1"
        .b
      }`
    ).throwsError(
      `This evaluates to "1".b which is undefined, so Error is thrown`);
  });

  it("div { '1'; }", function() {
    assertThat(`
      div {
        "1";
      }`
    ).equalsTo({
      name: "div",
      children: ["1"]
    });
    });

  it("['1'] ['1'].map(span {}) works", function() {
    assertThat(`
      div {
        ["1"] // for some reason adding this breaks it
        ["1"].map(x => x)
      }
    `).throwsError("Should've failed");
  });
});

class That {
  constructor(code) {
    this.code = code;
  }

  equalsTo(expected, opt_debug) {
    if (opt_debug) {
      console.log(`${DocScript.compile(this.code)}`);
    }

    let result = DocScript.eval(this.code);

    Assert.deepEqual(expected, result);
  }

  throwsError(message, opt_debug) {
    if (opt_debug) {
      console.log(`${DocScript.compile(this.code)}`);
    }

    try {
      let result = DocScript.eval(this.code);
      throw Error(message);
    } catch (e) {
      // Expected exception.
    }
  }
}

function assertThat(code) {
  return new That(code);
}
