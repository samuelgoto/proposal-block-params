'use strict';

var acorn = require("acorn");
var tt = acorn.tokTypes;
const { generate } = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');

acorn.plugins.docscript = function(parser) {
  parser.extend("parseExpressionStatement", function(nextMethod) {
    return function(node, expr) {

      // console.log(this.type);
      // console.log("hi");

      if (expr.type == 'Identifier') {
	// console.log(node);
	if (this.type == tt.braceL) {
	  let func = this.startNode();
	  func.docscript = true;
	  func.body = this.parseBlock();
	  func.params = [];
	  func.generator = false;
	  func.expression = false;
	  let arg = this.startNode();
	  arg.start = this.start - 1;
	  arg.properties = [];
	  node.callee = expr;
	  node.arguments = [
	    this.finishNode(arg, "ObjectExpression"),
	    this.finishNode(func, "FunctionExpression")
	  ];
	  this.semicolon();
	  return this.finishNode(node, "CallExpression");
	}
      } else if (expr.type == "CallExpression") {
	// console.log(expr);
	if (this.type == tt.braceL) {
	  let func = this.startNode();
	  func.docscript = true;
	  func.body = this.parseBlock();
	  func.params = [];
	  func.generator = false;
	  func.expression = false;
	  // console.log(expr.arguments);
	  if (expr.arguments.length > 1 ||
	      expr.arguments[0].type != "ObjectExpression") {
	    this.raise(this.start, "First argument isn't an object!!");
	    // this.raise(this.start, "'with' in strict mode")
	  }
	  expr.arguments.push(this.finishNode(func, "FunctionExpression"));
	  this.semicolon();
	  return this.finishNode(expr, "CallExpression");
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
	let arg = this.startNode();
	arg.properties = [];
	let node = this.startNodeAt(startPos, startLoc)
	node.callee = base;
	node.arguments = [
	  this.finishNode(arg, "ObjectExpression"),
	  this.finishNode(func, "FunctionExpression")
	];
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
// let ast = acorn.parse(`d("hi") {};`, {
//   plugins: {docscript: true}
// });
// console.log(JSON.stringify(ast, undefined, " "));
// return;

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
      // console.log(node.parent);
      while (parent) {
	if (parent.type == "FunctionDeclaration" &&
	    !parent.docscript) {
	  // If we are inside a function declaration that is not
	  // a DocScript, that crosses the boundaries of
	  // DocScript inside DocScript because the parameters are
	  // different.
	  break;
	}
	if (parent.docscript) {
	  inside = true;
	  break;
	}
	parent = parent.parent;
      }

      // TODO(goto): there is a bug in the generation of the ObjectExpression
      // that makes props be the empty string that needs further investigation.
      let props = node.arguments[0].source() || "undefined";
      // console.log(node.arguments[0]);
      // console.log(`hello ${props}`);
      let block = node.arguments[node.arguments.length -1];
      let callee = node.callee.name;

      // console.log(node);

      let first = callee.charAt(0);
      if (!(first == first.toUpperCase() && first != first.toLowerCase())) {
	// this is not a custom-class reference, but a literal.
	callee = `"${callee}"`;
      }

      if (!inside) {
	node.update(`DocScript.createElement.call(this, ${callee}, ${props}, function(parent) ${block.source()})`);
      } else {
	node.update(`DocScript.createElement.call(this, ${callee}, ${props}, function(parent) ${block.source()}, parent)`);
      }
    }
  } else if (node.type == "ExpressionStatement") {
    // Wraps non-docscripts ExpressionStatements into
    // a DocScript.createElement to enable composition of
    // function calls, variable references and literals.
    // enables: div { 1 }
    // filters: div { span {}  };
    // This is so far an ExpressionStatement inside a docscript ...
    // console.log(node);
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
	  `DocScript.createExpression.call(this, parent, (function(parent) { return ${node.source()} }).call(this))`);
    }
  }
}

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
  constructor(name, opt_attributes) {
    this.name = name;
    if (opt_attributes) {
      this.attributes = opt_attributes || {};
    }
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
      if (!(parent instanceof Element)) {
	  return;
      }

      // el can be either an Element, a string or an array of those things.
      let children = el instanceof Array ? el : [el];

      children.forEach(x => {
	// console.log(x);
        if (x == null || x == undefined) {
	  // Throws errors for null and undefined to enable developers to catch
          // MemberExpressions early.
	  throw new Error("Tried to add an invalid element into the tree");
        }

	if (x instanceof Element || typeof x == "string") {
	  // Ignores anything that isn't an Element or a String.
          parent.addChild(x);
        }
      });
  }

  static createElement(type, props, body, opt_parent) {
    let el;

    if (typeof type == "string") {
      el = new Element(type, props);
    } else {
      // console.log(type);
      // console.log(new type().render());
      // TODO(goto): this makes things specific to a render()
      // method. Generalize this.
      el = new type().render();
    }

    body.call(this, el);
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

module.exports = {
    DocScript: DocScript
};
