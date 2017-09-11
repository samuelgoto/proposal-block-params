const Assert = require('assert');
const {DocScript} = require('./../docscript');
var expect = require('chai').expect;

describe("Runtime", function() {
  it('Backwards compatible', function() {
    // Basic fundamental programs are not broken
    assertThat("").equalsTo(undefined);
    assertThat("1").equalsTo(1);
    assertThat("`hello`").equalsTo(`hello`);
    assertThat("undefined").equalsTo(undefined);
    assertThat("null").equalsTo(null);
    assertThat("function a() {}").contains({});
    assertThat("function a() { return 1; } a()").equalsTo(1);
    assertThat("var a = 1;").contains({});
    assertThat("var a = 1; a").contains({});
    assertThat("let a = 1; a").contains({});
  });

  it('Simplest', function() {
    assertThat(`function div() { return 1; } div {}`).equalsTo(1, true);
  });

  let sdk = `
    function div(block) {
      let result = {children: []};
      block({
        __Literal__: function(expr) { result.children.push(expr); }
      });
      return result;
    }
  `;

  it('Expression Statements', function() {
    assertThat(sdk + `
      div { 1 }`
    ).equalsTo({children: [ 1 ]});
  });

  it('Attributes: non-object attribute gets ignored', function() {
    // The literal 1 gets ignored as a parameter because it is not a
    // named key/value object.
    // TODO(goto): possibly allow things like "enabled" that are just
    // key-like objects to exist.
    assertThat(`function div(param) { return param; } div(1) {}`).equalsTo(1);
  });

  it('Attributes', function() {
    assertThat(`function div(param) { return param } div({a: 1}) {}`).equalsTo({
      a: 1
    });
  });

  it('Property access', function() {
    assertThat(`
      function div(block) {
        let result = {
          a: 1,
          b: function() { result.c = 3 }
        };
        block(result);
        return result;
      }
      div {
        a = 2
        b()
      }`
    ).contains({a : 2, c: 3});
  });

  it('Nesting', function() {
    assertThat(`
      function div(block) {
        let result = {};
        block({
          span: function() {
            result.hello = "hi";
          }
        });
        return result;
      }
      div {
        span {
        }
      }`
    ).equalsTo({
      hello: "hi"
    });
  });

  it('Text nodes', function() {
    assertThat(`
      function div(block) {
        let result = '';
        block({
          span: function(text) { result = text; }
        });
        return result;
      }
      div {
        span("hello world")
      }`
    ).equalsTo("hello world");
  });

  it('If statements', function() {
    assertThat(`
      function div(block) {
        let result = "";
        block({
          span: function(text) { result = text; }
        });
        return result;
      }
      div {
        if (true) {
          span("hello world")
        }
      }`
    ).equalsTo("hello world");
  });

  it('For-loops', function() {
    assertThat(`
      function div(block) {
        let result = "";
        block({
          span: function(text) { result += text; }
        });
        return result;
      }
      div {
        for (let i = 0; i < 2; i++) {
          span("<" + i + "> ")
        }
      }`
    ).equalsTo("<0> <1> ");
  });

  it('Functions 1', function() {
    assertThat(`
      function div(block) {
        let result = {};
        block({
          node: function() {
            return result;
          }
        });
        return result;
      }

      function bar(parent) {
        parent.hello = "world";
      }

      div {
        bar(node())
      }`
    ).equalsTo({
      hello: "world"
    });
  });

  it('Variables', function() {
    assertThat(`
      function div(block) {
        let result = { children: [] };
        block({
          append: function(child) { result.children.push(child); }
        });
        return result;
      }
      function span(text) {
        return text;
      }
      let a = span("hello world");
      div {
        append(a)
      }`
    ).equalsTo({
      children: ["hello world"]
    });
  });

  it('Scripting internal variables', function() {
    assertThat(`
      function div(block) {
        let result = { children: [] };
        block({
          append: function(value) {
            result.children.push(value);
          }
        });
        return result;
      }
      div {
	var a = 1;
        var b = 2;
	append(b)
	append(a & b)
        function foo() {
          return 1;
        }
        append(foo())
      }`
    ).equalsTo({
      children: [2, 0, 1]
    });
  });

  it.skip("Arrays can be embedded", function() {
    assertThat(`
      function div(block) {
        let result = {};
        block({
          append: function(children) {
          }
        });
        return result;
      }
      div {
        append([ span { }, "hello" ])
      }`
    ).equalsTo({
      name: "div",
      children: [{
        name: "span"
      }, "hello"]
    });
  });

  it.skip("[].map() has the right reference to this", function() {
    assertThat(`
      div {
        ["1", "2"].map(x => \`$\{x\}\`)
      }`
    ).equalsTo({
      name: "div",
      children: ["1", "2"]
    });
  });

  it.skip("Two variables", function() {
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

  it.skip("Two method calls", function() {
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

  it.skip("[]-member expressions", function() {
    assertThat(`
      div {
        "1"
        ["2"]
      }`
    ).throwsError(
      `This throws an Error now because it evaluates to something
       equivalent to div { "1"["2"] } == div { undefined }.`);
  });

  it.skip(".-member expressions", function() {
    assertThat(`
      div {
        "1"
        .b
      }`
    ).throwsError(
      `This evaluates to "1".b which is undefined, so Error is thrown`);
  });

  it.skip("div { '1'; }", function() {
    assertThat(`
      div {
        "1";
      }`
    ).equalsTo({
      name: "div",
      children: ["1"]
    });
  });

  it.skip("['1'] ['1'].map(span {}) works", function() {
    assertThat(`
      div {
        ["1"] // for some reason adding this breaks it
        ["1"].map(x => x)
      }
    `).throwsError("Should've failed");
  });

  it.skip("div {} expressions become statements", function() {
    assertThat(`
      div {
        span {}
        ["1"]
      }`
    ).equalsTo({
      name: "div",
      children: [{
	name: "span"
      }, "1"]
    });
  });

  it.skip("div {} expressions can follow [].map()", function() {
    assertThat(`
      div {
        span {}
        ["1"].map(x => "foo" + x);
      }`
    ).equalsTo({
      name: "div",
      children: [{
	name: "span"
      }, "foo1"]
    });
  });

  it.skip("this.prop reference on Function.call()", function() {
    assertThat(`
      function foo() {
        return div {
          this.foo;
        };
      }
      foo.call({foo: "bar"});
    `
    ).equalsTo({
      name: "div",
      children: ["bar"]
    });
  });

  it.skip("this.method() reference on Function.call()", function() {
    assertThat(`
      function foo() {
        return div {
          this.foo();
        };
      }
      foo.call({foo: function() { return "bar"} });
    `
    ).equalsTo({
      name: "div",
      children: ["bar"]
    });
  });

  it.skip("this reference on Classes", function() {
    assertThat(`
      class Foo {
        constructor() {
          this.foo = "bar";
        }
        bar() {
          return div {
            this.foo;
          };
        }
      }
      new Foo().bar();
    `
    ).equalsTo({
      name: "div",
      children: ["bar"]
    });
  });

  it.skip("this.method() reference on Classes", function() {
    assertThat(`
      class Foo {
        foo() {
          return "bar";
        }
        bar() {
          return div {
            this.foo();
          };
        }
      }
      new Foo().bar();
    `
    ).equalsTo({
      name: "div",
      children: ["bar"]
    });
  });

  it.skip("Composes classes", function() {
    assertThat(`
      class Foo {
        render() {
          return div {
            // if a docscript expression starts with a capital letter
            // it refers to a custom class type rather than a literal.
            Bar {};
          }
        }
      }
      class Bar {
        render() {
          return div {
            "bar";
          }
        }
      }
      new Foo().render();
    `
    ).equalsTo({
      name: "div",
      children: [{
	name: "div",
        children: ["bar"]
      }]
    });
  });

  it.skip("This-reference of custom elements", function() {
    assertThat(`
      class Foo {
        render() {
          // if a docscript expression starts with a capital letter
          // it refers to a custom class type rather than a literal.
          return Bar {};
        }
      }
      class Bar {
        constructor() {
          this.foo = "bar";
        }
        render() {
          return this.foo;
        }
      }
      new Foo().render();
    `
    ).equalsTo("bar");
  });

  it.skip('Attributes: functions', function() {
    let result = assertThat(`
      div({
        onclick: function() {
          return "hello world";
        }
      }) {
      }
    `).evals();
    let callback = result.attributes.onclick();
    Assert.equal("hello world", callback);
  });

  it.skip('Attributes: functions, classes', function() {
    let result = assertThat(`
      class Foo {
        render() {
          return div({
            onclick: function() {
              return "hello world";
            }
            }) {
          };
        }
      }
      new Foo()
    `).evals();
    let callback = result.render().attributes.onclick();
    Assert.equal("hello world", callback);
  });

  it.skip('Attributes: classes, attributes and this', function() {
    let result = assertThat(`
      class Foo {
        constructor() {
          this.message = "hello world";
        }
        setState() {
          this.state = "changed!";
        }
        render() {
          return div({
            onclick: function() {
              this.setState();
              return this.message;
            }
            }) {
          };
        }
      }
      new Foo()
    `).evals();
    let callback = result.render().attributes.onclick();
    Assert.equal("hello world", callback);
    Assert.equal("changed!", result.state);
  });

  it.skip('Attributes: classes, attributes and this from references', function() {
    let result = assertThat(`
      class Foo {
        constructor() {
          this.message = "hello world";
        }
        render() {
          let props = {
            onclick: function() {
              this.state = "changed!";
              return this.message;
            }
          };
          return div(props) {
          };
        }
      }
      new Foo()
    `).evals();
    let callback = result.render().attributes.onclick();
    Assert.equal("hello world", callback);
    Assert.equal("changed!", result.state);
  });

  it.skip("React-like component testing most features", function() {
    assertThat(`
      class React {
        constructor() {
          this.state = {foo: "this-state-foo"};
        }
        subtree() {
          return "a-sub-tree";
        }
        render() {
          let a = "a-variable";
          return html {
            body {
              "a-string-literal";
              this.state.foo;
              this.subtree();
              a;
              let b = "internal-variable";
              b;
              span {
                "variable-references-works-on-inner-scopes";
                a;
              }
              ["list-comprehensions"].map(x => x + "-also");
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
          "a-string-literal",
	  "this-state-foo",
	  "a-sub-tree",
	  "a-variable",
	  "internal-variable",
	  {
	    name: "span",
	    children: [
	      "variable-references-works-on-inner-scopes",
	      "a-variable"
	    ]
	  },
	  "list-comprehensions-also"
        ]
      }]
    });
  });

  it.skip("React ShoppingList example", function() {
    assertThat(`
      class ShoppingList {
        constructor() {
          this.props = {name: "Sam Goto"};
        }
        render() {
          return div {
            h1 {
              \`Shopping List for \$\{this.props.name\}\`;
            }
            ul {
              li { "Instagram" }
              li { "WhatsApp" }
              li { "Oculus" }
            }
          };
        }
      }
      new ShoppingList().render();
    `
    ).equalsTo({
      name: "div",
      children: [{
	name: "h1",
	children: ["Shopping List for Sam Goto"]
      }, {
	name: "ul",
	children: [{
	  name: "li",
	  children: ["Instagram"]
	}, {
	  name: "li",
	  children: ["WhatsApp"]
	}, {
	  name: "li",
	  children: ["Oculus"]
	}]
      }]
    });
  });
});

class That {
  constructor(code) {
    this.code = code;
  }

}

function assertThat(code) {
  // return new That(code);
  function evals(opt_debug) {
    let compiled = DocScript.compile(code).toString();
    if (opt_debug) {
      console.log(compiled);
    }
    return eval(compiled);
  }
  return {
    equalsTo: function(expected, opt_debug) {
      let result = evals(opt_debug);
      Assert.deepEqual(result, expected);
    },
    contains: function(expected, opt_debug) {
      let result = evals(opt_debug);
      for (ref in expected) {
	Assert.deepEqual(expected[ref], result[ref]);
      }
      // consoel.log(result);
    },
    throwsError: function(message, opt_debug) {
      if (opt_debug) {
	console.log(`${DocScript.compile(this.code)}`);
      }
      let error = true;
      try {
	let result = DocScript.eval(this.code);
	error = false;
      } catch (e) {
	// Expected exception.
      }

      if (!error) {
	throw new Error(message);
      }
    }
  }
}
