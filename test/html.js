const Assert = require('assert');
const {DocScript} = require('./../docscript');
var expect = require('chai').expect;

describe("HTML", function() {
  it('Backwards compatible', function() {
    // Basic fundamental programs are not broken
    assertThat("").equalsTo(undefined);
    assertThat("1").equalsTo(1);
    assertThat("`hello`").equalsTo(`hello`);
    assertThat("undefined").equalsTo(undefined);
    assertThat("null").equalsTo(null);
    assertThat("function b() {}").contains({});
    assertThat("function b() { return 1; } b()").equalsTo(1);
    assertThat("var b = 1;").contains({});
    assertThat("var b = 1; b").contains({});
    assertThat("let b = 1; b").contains({});
  });

  it('Simplest', function() {
    assertThat(`function foo() { return 1; } foo {}`).equalsTo(1);
  });

  it.skip('Expression Statements', function() {
    assertThat(sdk + `
      div { 1 }`
    ).equalsTo({children: [ 1 ]});
  });

  it('Attributes: non-object attribute gets ignored', function() {
    // The literal 1 gets ignored as a parameter because it is not a
    // named key/value object.
    // TODO(goto): possibly allow things like "enabled" that are just
    // key-like objects to exist.
    assertThat(`function foo(param) { return param; } foo(1) {}`).equalsTo(1);
  });

  it('Attributes', function() {
    assertThat(`
      div({width: 100}) {
      }
    `).equalsTo({
      "@type": "div",
      width: 100
    }, true);
  });

  it('Methods', function() {
    assertThat(`
      div({width: 200}) {
      }`
    ).equalsTo({"@type": "div", width : 200});
  });

  it('Nesting', function() {
    assertThat(`
      div {
	let span = __args__.span.bind(__args__);
        span {
        }
      }`
    ).equalsTo({
      "@type": "div",
      children: [{
	"@type": "span"
      }]
    });
  });

  it('Text nodes', function() {
    assertThat(`
      div {
        let span = __args__.span.bind(__args__);
        span("hello world")
      }`
    ).equalsTo({
      "@type": "div",
      children: [{
	"@type": "span",
	children: [ "hello world" ]
      }]
    });
  });

  it('If statements', function() {
    assertThat(`
      div {
        let span = __args__.span.bind(__args__);
        if (true) {
          span("hello world")
        }
      }`
    ).equalsTo({
      "@type": "div",
      children: [{
	"@type": "span",
	children: [ "hello world" ]
      }]
    });
  });

  it('For-loops', function() {
    assertThat(`
      div {
        let span = __args__.span.bind(__args__);
        for (let i = 0; i < 2; i++) {
          span("" + i + "")
        }
      }`
    ).equalsTo({
      "@type": "div",
      "children": [{
	"@type": "span",
	"children": ["0"]
      }, {
	"@type": "span",
	"children": ["1"]
      }]
    });
  });

  it('Functions', function() {
    assertThat(`
      function bar(parent) {
        parent.node("hello world");
      }

      div {
        bar(__args__)
      }`
    ).equalsTo({
      "@type": "div",
      "children": ["hello world"]
    });
  });

  it('Variables', function() {
    assertThat(`
      // TODO(goto): figure out why using "let foo" here breaks.
      var foo = "hello world";
      div {
        __args__.node(foo)
      }`
    ).equalsTo({
      "@type": "div",
      children: ["hello world"]
    });
  });

  it('Children', function() {
    assertThat(`
      div {
        let div = __args__.div.bind(__args__);
        div {
          let span = __args__.span.bind(__args__);
          span {
            let div = __args__.div.bind(__args__);
            let span = __args__.span.bind(__args__);
            div {
            }
            span {
            }
          }
        }
      }`
    ).equalsTo({
      "@type": "div",
      children: [{
        "@type": "div",
	children: [{
	  "@type": "span",
	  children: [{
	    "@type": "div"
	  }, {
	    "@type": "span"
	  }]
	}]
      }]
    }, true);
  });

  it('Scripting internal variables', function() {
    assertThat(`
      div {
	var c = 1;
        var b = 2;
	__args__.node(b)
	__args__.node(c & b)
        function foo() {
          return 1;
        }
        __args__.node(foo())
      }`
    ).equalsTo({
      "@type": "div",
      children: [2, 0, 1]
    });
  });

  it("Arrays can be embedded", function() {
    assertThat(`
      div {
        ["hello", "world"].forEach(function(x) { this.node(x) }, __args__);
      }`
    ).equalsTo({
      "@type": "div",
      children: ["hello", "world"]
    });
  });

  it("Two variables", function() {
    assertThat(`
      var b = "1";
      div {
	__args__.node(b)
        __args__.node(b)
      }`
    ).equalsTo({
      "@type": "div",
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
    `).equalsTo({
    });
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
    assertThat(sdk + `
      div {
        // TODO(goto): span {}; works, debug why omitting it doesn't.
        span {}
        ["1"].map(x => node("foo" + x));
      }`
    ).equalsTo({
      "@type": "div",
      children: [{
	"@type": "span"
      }, "foo1"]
    });
  });

  it("scope reference works on parameters", function() {
    assertThat(`
      function foo(props) {
	return div {
	  __args__.node(props.foo);
        };
      }
      foo({foo: "bar"});
    `
    ).equalsTo({
      "@type": "div",
      children: ["bar"]
    });
  });

  it("method() reference works", function() {
    assertThat(`
      function foo(context) {
        return div {
          __args__.node(context.foo())
        };
      }
      foo({foo: function() { return "bar"} });
    `
    ).equalsTo({
      "@type": "div",
      children: ["bar"]
    });
  });

  it("Simplest usage in Classes", function() {
    assertThat(`
      class Foo {
        bar() {
          return div {
            __args__.span("bar")
          };
        }
      }
      new Foo().bar();
    `
    ).equalsTo({
      "@type": "div",
      children: [{
	"@type": "span",
	children: [ "bar" ]
      }]
    });
  });

  it("this reference on Classes", function() {
    assertThat(`
      class Foo {
        constructor() {
          this.foo = "bar";
        }
        bar() {
          return div {
            __args__.span(this.foo);
          };
        }
      }
      new Foo().bar();
    `
    ).equalsTo({
      "@type": "div",
      children: [{
	"@type": "span",
	children: [ "bar" ]
      }]
    });
  });

  it('Functions and Classes', function() {
    assertThat(`
      function bar(parent) {
        parent.node("hello world");
      }

      // please ignore, nodejs hack not needed
      // in browsers.
      global.bar = bar;

      class A {
        render() {
          return div {
	    bar(__args__)
          }
        }
      }

      new A().render()
    `).equalsTo({
      "@type": "div",
      "children": [ "hello world" ]
    })
  });

  it("this.method() reference on Classes", function() {
    assertThat(`
      class Foo {
        foo() {
          return "bar";
        }
        bar() {
          return div {
            __args__.span(this.foo());
          };
        }
      }
      new Foo().bar();
    `
    ).equalsTo({
      "@type": "div",
      children: [{
	"@type": "span",
	children: [ "bar" ]
      }]
    });
  });

  it.skip("Composes classes", function() {
    assertThat(`
      @component
      class Foo {
        render() {
          return div {
            bar(this) {
            }
          }
        }
      }

      @component
      class Bar {
        render() {
          return div {
            span("bar");
          }
        }
      }

      // nodejs hack, not needed in browsers
      global.bar = function(parent) {
        parent.node(new Bar().render());
      }

      new Foo().render();
    `
    ).equalsTo({
      "@type": "div",
      children: [{
	"@type": "div",
        children: [{
	  "@type": "span",
	  children: [ "bar" ]
	}]
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

  it('Attributes: functions', function() {
    let result = assertThat(`
      div {
	  __args__.onclick = function() {
          return "hello world";
        }
      }
    `).evals();
    let callback = result.onclick();
    Assert.equal("hello world", callback);
  });

  it('Attributes: functions, classes', function() {
    let result = assertThat(`
      class Foo {
        render() {
          return div {
            __args__.onclick = function() {
              return "hello world";
            }
          };
        }
      }
      new Foo()
    `).evals();
    let callback = result.render().onclick();
    Assert.equal("hello world", callback);
  });

  it('Attributes: classes, attributes and this', function() {
    let result = assertThat(`
      class Foo {
        constructor() {
          this.message = "hello world";
        }
        setState() {
          this.state = "changed!";
        }
        render() {
          return div {
            __args__.onclick = function() {
              this.setState();
              return this.message;
            }.bind(this);
          };
        }
      }
      new Foo()
    `).evals();
    let callback = result.render().onclick();
    Assert.equal("hello world", callback);
    Assert.equal("changed!", result.state);
  });

  it('Attributes: classes, attributes and this from references', function() {
    let result = assertThat(`
      class Foo {
        constructor() {
          this.message = "hello world";
        }
        render() {
          return div {
            __args__.onclick = function() {
              this.state = "changed!";
              return this.message;
            }.bind(this);
          };
        }
      }
      new Foo()
    `).evals();
    let callback = result.render().onclick();
    Assert.equal("hello world", callback);
    Assert.equal("changed!", result.state);
  });

  it.skip("React-like component testing most features", function() {
    assertThat(`
      @component
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
      @component
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

  it('XML', function() {
    assertThat(`
      html {
        let head = __args__.head.bind(__args__);
        head {
          let title = __args__.title.bind(__args__);
	  title("hello world")
        }
        let body = __args__.body.bind(__args__);
        body {
          let a = __args__.a.bind(__args__);
	  a({href: "home.html"}) {
            let span = __args__.span.bind(__args__);
	    span("click here!")
          }
        }
      }
    `).equalsTo(`
      <html>
        <head><title>hello world</title></head>
        <body>
          <a href="home.html"><span>click here!</span></a>
        </body>
      </html>
    `, false, true);
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
    let script = `
      const {html, div} = require("../examples/framework/html.js");

      ${code}
    `;
    let compiled = DocScript.compile(script).toString();
    if (opt_debug) {
      console.log(compiled);
    }
    return eval(compiled);
  }

  function clean(obj) {
    // console.log(obj);
    // return obj;
    for (prop in obj) {
      if (typeof obj[prop] == "function" ||
	 obj[prop] == undefined) {
	delete obj[prop];
	continue;
      } else if (typeof obj[prop] == "object") {
        clean(obj[prop]);
	continue;
      }
    }
    return obj;
  }

  return {
    evals: function(opt_debug) {
      return evals(opt_debug);
    },
    equalsTo: function(expected, opt_debug, opt_xml) {
      let result = evals(opt_debug);
      // console.log(result.toXml());
      if (opt_xml) {
          // NOTE(goto): poor man version of comparing XML :)
	  Assert.equal(
            result.toXml().replace(/ /g, "").replace(/\n/g, ""),
            expected.replace(/ /g, "").replace(/\n/g, ''));
      } else {
        Assert.deepEqual(clean(result), expected);
      }
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
