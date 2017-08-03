var acorn = require("acorn");
var tt = acorn.tokTypes;

const { generate } = require('astring');

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
	  this.enterLexicalScope(); // NOTE(goto): I'm not sure what this does
	  func.body = this.parseBlock();
	  this.exitLexicalScope(); // NOTE(goto): I'm not sure what this does
	  // TODO(goto): figure out what to do with:
	  // - func.params
	  // - generator
	  // - expression
	  // console.log(func);
	  // console.log("bar");
	  // node.callee
	  // console.log(expr);
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

let docscripts = [];

docscripts.push(`
let a = b {};
`);

docscripts.push(`
a {}
`);

docscripts.push(`
a {
  b {
    c("hello");
  }
}
`);

// TODO(goto): figure out how to extent to enable a() {};

let code = `a(function() { b; });`;

let ast = acorn.parse(docscripts[2], {
// let ast = acorn.parse("var a = b();", {
  plugins: {docscript: true}
});

console.log(JSON.stringify(ast, undefined, " "));

console.log(`original: ${docscripts[0]}`);

let result = generate(ast);

console.log(`result: ${result}`);

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
