var acorn = require("acorn");
var tt = acorn.tokTypes;
const { generate } = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');

acorn.plugins.docscript = function(parser) {

  parser.extend("parseExpressionStatement", function(nextMethod) {
    return function(node, expr) {
      // console.log(node);
      // console.log(expr);
      // console.log(this.type == tt.braceL);

      if (expr.type == 'Identifier') {
	if (this.type == tt.braceL) {
	  // console.log("hi");
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

// console.log(JSON.stringify(ast, undefined, " "));

function visitor(node) {
  if (node.type === "CallExpression") {
    if (node.arguments.length > 0 &&
	node.arguments[node.arguments.length - 1].docscript) {
      let block = node.arguments[node.arguments.length -1];
      let callee = node.callee.name;
      node.update(
	  `DocScript.createElement.call(this, "${callee}", function() ${block.source()})`);
    }
  } else if (node.type == "TemplateLiteral") {
    console.log("hello world");
    console.log(node.source());
    // Wraps template literals into a special Document.createElement
    // of type text node.
    if (node.parent &&
	node.parent.type == "ExpressionStatement" &&
	node.parent.parent &&
	node.parent.parent.type == "BlockStatement" &&
	node.parent.parent.parent &&
	node.parent.parent.parent.type == "FunctionExpression" &&
        node.parent.parent.parent.docscript) {
      console.log("found it!");
      node.update(`DocScript.createElement.call(this, "text", ${node.source()});`);
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

let code = `
doc = div {
  span {
    for (var i = 0; i < 5; i++) {
      span {
        \`$\{i\}\`
      }
    }
  }
}
`;

var result = falafel(code, {
  parser: acorn, plugins: { docscript: true }
}, visitor);

console.log(result);

// return;

let docscript = `

class Element {
  constructor(name) {
    this.name = name;
    // this.args = args;
    this.children = [];
  }

  addChild(el) {
    this.children.push(el);
  }

  setValue(value) {
    this.value = value;
  }
}

class DocScript {
  static createElement(name, body) {
    // console.log(this instanceof Element);
    let el = new Element(name);

    // body can either be a function or a literal.
    if (body instanceof Function) {
      body.call(el);
    } else {
      // Text elements don't have children.
      el.setValue(body);
    }
    if (this instanceof Element) {
      // console.log("I have a parent!!");
      this.addChild(el);
    }
    return el;
  }
}
`;

console.log(`${docscript} ${result}`);
console.log(JSON.stringify(eval(`${docscript} ${result}`), undefined, ' '));
// console.log(eval(`${docscript} __docscript__("foo")`));
// console.log(eval("a = 0"));
