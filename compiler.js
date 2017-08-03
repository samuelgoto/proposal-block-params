var acorn = require("acorn");
var tt = acorn.tokTypes;
// var babel = require("babel-core");
// var babylon = require("babylon");
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
      node.update(`__docscript__("${callee}", function() ${block.source()})`);
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
// var result = falafel(`
// a {
//   b {
//     c('hi')
//   }
// };
// `, {
// var result = falafel("var a = b {};", {
var result = falafel("var a = b {};", {
  parser: acorn, plugins: { docscript: true }
}, visitor);

console.log(result);

return;



//walk.simple(ast, {
//  Literal(node) {
//    console.log("foobar");
//  }
//});

function transform(ast) {
  var result = {};
  for (prop in ast) {
    if (typeof ast[prop] == "object") {
    } else if (typeof ast[prop]) {
    }
    // result[prop] = transform(ast[prop]);
  }
  return result;
}

console.log(JSON.stringify(transform(ast), undefined, " "));

// console.log(generate(ast));

return;

// console.log(babel);

function plugin({types}) {
  return {
    visitor: {
      CallExpression(path, state) {
	if (path.node.arguments.length > 0 &&
	    path.node.arguments[path.node.arguments.length - 1] &&
	    path.node.arguments[path.node.arguments.length - 1].docscript
	   ) {
	  console.log("This is a call expression for a docscript!!");

	  let builtin = types.identifier("__docscript__");
	  let callee = path.node.callee.name;
	  let lambda = path.node.arguments[path.node.arguments.length - 1];
	  lambda.docscript = false;
	  let code = types.callExpression(builtin, [
	    types.stringLiteral(callee),
	    lambda]);
	  // console.log(path.node.arguments[path.node.arguments.length - 1]);
	  // console.log(path.node.callee.name);

	  // path.replaceWith(types.numericLiteral(2));
	  path.replaceWith(code);
	}
	// console.log(path.node.arguments);
	// console.log("hi");
	// console.log(path);
      },
    }
  }
}

const {code} = babel.transformFromAst(ast, undefined, {
  // plugins: [plugin]
});

console.log(code);

return;

class Element {
  constructor(name, args) {
    this.name = name;
    this.args = args;
    this.children = [];
  }

  addChild(el) {
    this.children.push(el);
  }
}

function __generic__(name, args, body) {
  console.log(`__generic__ ${name} ${args} ${body}`);
  let el = new Element(name, args);
  body.call(el);
  if (this instanceof Element) {
    console.log(`I have a parent!!`);
    this.addChild(el);
  } else {
    console.log(`I don't have a parent :(`);
    return el;
  }
}

let foo = __generic__.call(this, "div", {foo: 1}, function() {
  console.log("am i an element?");
  console.log(this);
  __generic__.call(this, "span", {bar: 2}, function() {
    // hello world
  });
});

console.log(foo);
