'use strict';

var acorn = require("acorn");
var tt = acorn.tokTypes;
const { generate } = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');

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
	  `DocScript.createExpression(parent, function(parent) { return ${node.source()} } ())`);
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

module.exports = {
    DocScript: DocScript
};
