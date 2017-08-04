var acorn = require("acorn");
var tt = acorn.tokTypes;
const { generate } = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');
const {deepEqual} = require('assert');

acorn.plugins.docscript = function(parser) {

  parser.extend("parseExpressionStatement", function(nextMethod) {
    return function(node, expr) {

      if (expr.type == 'Identifier') {
	if (this.type == tt.braceL) {
	  let func = this.startNode();
	  func.docscript = true;
	  func.body = this.parseBlock();
	  func.params = [];
	  func.generator = false;
	  func.expression = false;
	  node.callee = expr;
	  node.arguments = [ this.finishNode(func, "FunctionExpression") ];
	  this.semicolon();
	  return this.finishNode(node, "CallExpression");
	}
      }

      return nextMethod.call(this, node, expr);
    }
  });

  // enables var a = b {} to be parsed
  parser.extend("parseSubscripts", function(nextMethod) {
    return function(base, startPos, startLoc, noCalls) {
      if (!noCalls && this.type == tt.braceL) {
	let func = this.startNode();
	func.docscript = true;
	func.body = this.parseBlock();
	func.params = [];
	func.generator = false;
	func.expression = false;
	let node = this.startNodeAt(startPos, startLoc)
	node.callee = base;
	node.arguments = [ this.finishNode(func, "FunctionExpression") ];
	return this.finishNode(node, "CallExpression")
      }

      return nextMethod.call(
	  this, base, startPos, startLoc, noCalls);
    }
  });
}

// TODO(goto): figure out how to extent to enable a() {};

// let ast = acorn.parse(docscripts[0], {
// let ast = acorn.parse("var a = b(function() {});", {
// let ast = acorn.parse("var a = foo(function() {});", {
// let ast = acorn.parse("var a = b {};", {
// let ast = acorn.parse("b { c {} };", {
// TODO: let ast = acorn.parse(`b { c { d(); } };`, {
// let ast = acorn.parse(`d("hi");`, {
//  plugins: {docscript: true}
// });

function visitor(node) {
  if (node.type === "CallExpression") {
    if (node.arguments.length > 0 &&
	node.arguments[node.arguments.length - 1].docscript) {
      // Makes a distinction between DocScript code inside
      // DocScript (e.g. the span in let a = div { span {} }) code and
      // not (e.g. let a = div {}).
      // TODO(goto): we should probably break on scoping boundaries
      // e.g. is this span within a docscript scope?
      // at the moment, since it is crawling all the way up, i bet
      // that it would eventually hit the div docscript there.
      // function() { div { function bar() { return span {} } } }
      var parent = node.parent;
      var inside = false;
      // console.log(node);
      while (parent) {
	if (parent.docscript) {
	  inside = true;
	  break;
	}
	parent = parent.parent;
      }

      let block = node.arguments[node.arguments.length -1];
      let callee = node.callee.name;
      if (!inside) {
	node.update(`DocScript.createElement("${callee}", function(parent) ${block.source()})`);
      } else {
	node.update(`DocScript.createElement("${callee}", function(parent) ${block.source()}, parent)`);
      }
    }
  } else if (node.type == "ExpressionStatement") {
    // Wraps non-docscripts ExpressionStatements into
    // a DocScript.createElement to enable composition of
    // function calls, variable references and literals.
    // enables: div { 1 }
    // filters: div { span {}  };
    // This is so far an ExpressionStatement inside a docscript ...
    let inside = node.parent &&
	node.parent.type == "BlockStatement" &&
	node.parent.parent &&
	node.parent.parent.type == "FunctionExpression" &&
        node.parent.parent.docscript;
    // ... but we want to filter out double-wrapping ExpressionStatements
    // of DocScripts that have already been wrapped.
    let wrapping = node.expression &&
	node.expression.type == "CallExpression" &&
	node.expression.arguments &&
	node.expression.arguments.length > 0 &&
	node.expression.arguments[node.expression.arguments.length - 1].docscript;
    if (inside && !wrapping) {
      node.update(
	  `DocScript.createExpression(parent, function(parent) { return ${node.source()} } ())`);
    }
  }
}

// let ast = acorn.parse(docscripts[0], {
// let ast = acorn.parse("var a = b(function() {});", {
// let ast = acorn.parse("var a = foo(function() {});", {
// let ast = acorn.parse("var a = b {};", {
// let ast = acorn.parse("b { c {} };", {
// TODO: let ast = acorn.parse(`b { c { d(); } };`, {
// let ast = acorn.parse(`d("hi");`, {
//  plugins: {docscript: true}
// });
// var result = falafel("a {};", {
// var result = falafel("a { b {} };", {
// var result = falafel("a { b { c('hi') } };", {
// var result = falafel("var a = b {};", {
// var result = falafel("var a = b {};", {


class DocScript {
  static compile(code) {
    var result = falafel(code, {
      parser: acorn, plugins: { docscript: true }
    }, visitor);
    return result;
  }

  static eval(code) {
    let docscript = `
class Element {
  constructor(name) {
    this.name = name;
  }

  addChild(el) {
    if (!this.children) {
      // evaluates lazily.
      this.children = [];
    }
    this.children.push(el);
  }
}

class DocScript {

  static createExpression(parent, el) {
    if (parent instanceof Element &&
        (el instanceof Element || typeof el == "string")) {
      parent.addChild(el);
    }
  }

  static createElement(name, body, opt_parent) {
    let el = new Element(name);
    body(el);
    if (opt_parent) {
      opt_parent.addChild(el);
    }
    return el;
  }
}
`;

    let result = DocScript.compile(code);
    // console.log(`${docscript} ${result}`);
    return eval(`${docscript} ${result}`);
  }
}

function assert(code, expected, debug) {
  let result = DocScript.eval(code);

  if (debug) {
    console.log(`${DocScript.compile(code)}`);
  }

  deepEqual(result, expected, `

expected: ${JSON.stringify(expected, undefined, ' ')}

got: ${JSON.stringify(result, undefined, ' ')}

`);
}

/*
console.log(DocScript.eval(`
div {
  function bar() {
    return span {};
  }
}
`));
*/

// return;
/*
console.log(DocScript.eval(`
let a = div {
  function bar() {
    return span { "bar" }
  }
  span { "foo" }
};
a`));
*/

// return;

// console.log(DocScript.compile("div { span {}  }"));

// return;

// Basic fundamental programs are not broken
assert("", {});
assert("1", 1);
assert("`hello`", `hello`);
assert("undefined", undefined);
assert("null", null);
assert("function a() {}", {});
assert("function a() { return 1; } a()", 1);
assert("var a = 1;", {});
assert("var a = 1; a", 1);
assert("let a = 1; a", 1);

// DocScripts
assert(`let doc = 1; doc`, 1);
assert(`let doc = div {}; doc`, {name: "div"});
// Nesting
assert(`
div {
  span {
  }
}`, {
  name: "div",
  children: [{
    name: "span"
  }]
});
// Text nodes
assert(`
div {
  "hello world"
}`, {
  name: "div",
  children: ["hello world"]
});
// Scripting for-loops
assert(`
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
// Scripting calls 1
assert(`
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
// Scripting calls 2
assert(`
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
// Scripting variables
assert(`
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
// Scripting internal variables
assert(`
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

assert(`
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
