const acorn = require("acorn");
const astring = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');
var tt = acorn.tokTypes;

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
	  //if (expr.arguments.length > 1 ||
	  //    expr.arguments[0].type != "ObjectExpression") {
	  //  this.raise(this.start, "First argument isn't an object!!");
	  //}
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
      // handles a {};
      if (!noCalls && this.type == tt.braceL) {
	let func = this.startNode();
	func.docscript = true;
	func.body = this.parseBlock();
	func.params = [];
	func.generator = false;
	func.expression = false;
	// let arg = this.startNode();
	// arg.properties = [];
	let node = this.startNodeAt(startPos, startLoc)
	node.callee = base;
	node.arguments = [
	  // this.finishNode(arg, "ObjectExpression"),
	  this.finishNode(func, "FunctionExpression")
	];
	return this.finishNode(node, "CallExpression")
      }

      let expr = nextMethod.call(
	  this, base, startPos, startLoc, noCalls);

      // If we are in a CallExpression which is followed by a {
      // then eat that and move that into the arguments of the call.
      if (expr.type == "CallExpression" && this.type == tt.braceL) {
	// Makes sure that the first argument of the call is an
	// ObjectExpression.
	// if (expr.arguments.length != 1) {
	//  this.raise(this.start, "More than 1 argument");
	// } else if (expr.arguments[0].type != "ObjectExpression") {
	//  this.raise(this.start, "First argument isn't an object!!");
	// }

	let func = this.startNode();
	func.docscript = true;
	func.body = this.parseBlock();
	func.params = [];
	func.generator = false;
	func.expression = false;
	// func.parent = undefined;
	// Adds the function body as an argument
	expr.arguments.push(this.finishNode(func, "FunctionExpression"));
	// And fixes the start and end indexes to include the function
	// block.
	expr.end = func.end;
	// console.log(expr);
        // debugger;
      }

      return expr;
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
// let ast = acorn.parse(`d {};`, {
//    plugins: {docscript: true}
// });
// console.log(JSON.stringify(ast, undefined, " "));

// console.log(generate(ast));

// return;

function visitor(node) {

  function inside(node, pred) {
    // let inside = false;
    let parent = node.parent;
    while (parent) {
      if (pred(parent)) {
	// inside = true;
	// break;
	return true;
      }
      parent = parent.parent;
    };
    return false;
  }

  if (node.type == "AssignmentExpression" &&
      inside(node, n => n.docscript)) {
    // console.log(node);
    let left = node.left.source();
    let right = node.right.source();
    //console.log(node.left);
    let prop = left;
    if (node.left.type == "MemberExpression") {
      prop = node.left.object.source();
    }
    node.update(`("${prop}" in this ? this.${left} = ${right} : ${left} = ${right})`);
  } else if (node.type == "Identifier") {
    // NOTE(goto): I am very confident I am forgetting a corner case here.
    if (!(node.parent.type == "MemberExpression" &&
	  node.parent.property == node) &&
        !(node.parent.type == "VariableDeclarator") &&
	inside(node, n => n.docscript) &&
	!inside(node, n => n.type == "AssignmentExpression")) {

      // console.log(node);
      // For method calls, bind to the right instance.
      let bind = node.parent.type == "CallExpression" ? ".bind(this)" : "";

      // console.log(inside(node));

      // node.update(`(this.${node.name} || ${node.name})`);
      node.update(`("${node.name}" in this ? this.${node.name}${bind} : ${node.name})`);
    }
  } else if (node.type === "CallExpression") {
    // return;
    if (node.arguments.length > 0 &&
	node.arguments[node.arguments.length - 1].docscript) {
      let params = ``;
      for (let i = 0; i < node.arguments.length; i++) {
	// console.log(i);
	let param = node.arguments[i];
	if (!param.docscript) {
	  params += `${param.source()}, `;
	  continue;
	}

	params += `function() ${param.source() }`;
      }

      node.update(`${node.callee.source()}(${params})`);
    }
  } else if (node.type == "ExpressionStatement") {
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
    if (inside) {
      // console.log("hi");
      // console.log(node);
      // console.log(node.expression.type == "");
      // console.log(node.source());
      let type = node.expression.type;
      if (type == "Identifier" || type == "Literal") {
        node.update(`scope.__${type}__(${node.source()});`);
      }
    }
  }
}

class DocScript {
  static compile(code) {
    // NOTE(goto): major hack ahead, parses using acorn, generates
    // text source code again, then uses falafel to parse (again!)
    // from the source code generated from the ast.
    // There is a bug in falafel where it takes the code as input rather
    // than taking it from the resulting ast constructed by the parser
    // to generate the result.
    // This has certainly performance implications (as you are parsing twice)
    // but may have semantic implications too. This ought to be fixed.
    // let ast = acorn.parse(code, {
    //  plugins: {docscript: true}
    // });
    // let generated = astring.generate(ast);
    var result = falafel(code, {
      parser: acorn, plugins: { docscript: true }
    }, visitor);
    return result;
  }

  static api() {
    return `
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

    let attributes = props.length > 0 ? {} : undefined;

    props.forEach(arg => {
      if (typeof arg == "object") {
        for (let prop in arg) {
          if (!(arg[prop] instanceof Function)) {
            attributes[prop] = arg[prop];
          } else {
            attributes[prop] = (arg[prop]).bind(this);
          }
        }
      }
    });

    if (typeof type == "string") {
      el = new Element(type, attributes);
    } else {
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
  }

  static eval(code, opt_stdout) {
    let result = DocScript.compile(code);
    let stdout = `
    var console = {
      log: function(str) {
	if (opt_stdout) {
          opt_stdout.push(str);
	}
      }
    };
    `;

    // console.log(`${docscript} ${result}`);
    return eval(`${DocScript.api()}; ${stdout}; ${result}`);
  }
}

//console.log(JSON.stringify(acorn.parse(`d() { 1 };`, {
//    plugins: {docscript: true}
//}), undefined, " "));

// return;

// let code = `d({}) {};`;

// let ast = acorn.parse(code, {
//  plugins: {docscript: true}
// });

// var result = falafel(code, {
//  parser: acorn, plugins: { docscript: true }
// }, visitor);

// console.log(result);

module.exports = {
    DocScript: DocScript
};
