const acorn = require("acorn");
const astring = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');
var tt = acorn.tokTypes;
const babel = require("babel-core");
const es7 = require('acorn-es7')(acorn);


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
	  expr.arguments.push(this.finishNode(func, "FunctionExpression"));
	  this.semicolon();
	  return this.finishNode(expr, "CallExpression");
	}
      }

      return nextMethod.call(this, node, expr);
    }
  });

  parser.extend("parseClassSuper", function(nextMethod) {
    return function(node) {
      // console.log("hello world");
      // console.log(node);
      // node.superClass = this.eat(tt._extends) ? (this.parseExprSubscripts()) : null
      if (this.eat(tt._extends)) {
	this.inExtends = true;
	node.superClass = this.parseExprSubscripts();
        this.inExtends = false;
      }
    }
  });

  // enables var a = b {} to be parsed
  parser.extend("parseSubscripts", function(nextMethod) {
    return function(base, startPos, startLoc, noCalls) {
      // handles a {};
      // console.log("hi");
      // console.log(this);
      // console.log(noCalls);

      // If we are inside a subscript of a class declaration in extends
      // do not enable the syntax simplification.
      if (this.inExtends) {
	return nextMethod.call(this, base, startPos, startLoc, noCalls);
      }

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

  if (node.type == "Identifier") {
    if (inside(node, n => n.docscript) &&
	node.parent.type == "CallExpression" &&
        node.parent.callee == node) {
      // console.log(node);
      node.update(`("${node.name}" in this ? this.${node.name}.bind(this) : ${node.name}.bind(this))`);
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
    if (inside(node, n => n.docscript) &&
	node.expression.type == "CallExpression") {
      // console.log(node);
      node.update(`${node.source()};`);
    }
  } else if (node.type == "ClassDeclaration" &&
	     node.decorators &&
             // TODO(goto): deal with multiple decorators.
	     node.decorators.length == 1) {
    let name = node.id.source();
    let decorator = node.decorators[0].expression.source();
    node.update(`
        let ${name} = (function() {
          class ${name} ${node.body.source()}

          ${name} = ${decorator}(${name}) || ${name};
          return ${name};
        })();`);
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

    // Uses the babel transform to transform @decorators
    // let decorated = babel.transform(code, {
    //  plugins: ["transform-decorators-legacy"]
    // }).code;

    var result = falafel(code, {
      parser: acorn,
      plugins: { docscript: true, es7: true },
      ecmaVersion: 7
    }, visitor);
    return result;
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

// let result = DocScript.compile("let a = 1; @foo class A {} hello {}");
// console.log(result);

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
