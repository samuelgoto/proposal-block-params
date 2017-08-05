'use strict';

const Assert = require('assert');
const docscript = require('./../docscript');
var expect = require('chai').expect;
var acorn = require("acorn");
var tt = acorn.tokTypes;
const { generate } = require('astring');
const walk = require("acorn/dist/walk");
const falafel = require('falafel');

describe("Parser", function() {
  it("Parsing basic", function() {
    let ast = acorn.parse(`d {};`, {
      plugins: {docscript: true}
    });
    Assert.deepEqual(ast, {
      "type": "Program",
      "start": 0,
      "end": 5,
      "body": [
	{
	  "type": "ExpressionStatement",
	  "start": 0,
	  "end": 5,
	  "expression": {
	    "type": "CallExpression",
	    "start": 0,
	    "end": 4,
	    "callee": {
	      "type": "Identifier",
	      "start": 0,
	      "end": 1,
	      "name": "d"
	    },
	    "arguments": [
	      {
		"type": "ObjectExpression",
		"start": 4,
		"end": 4,
		"properties": []
	      },
	      {
		"type": "FunctionExpression",
		"start": 2,
		"end": 4,
		"docscript": true,
		"body": {
		  "type": "BlockStatement",
		  "start": 2,
		  "end": 4,
		  "body": []
		},
		"params": [],
		"generator": false,
		"expression": false
	      }
	    ]
	  }
	}
      ],
      "sourceType": "script"
    });
  });

  it("Parsing empty attributes", function() {
    let ast = acorn.parse(`d({}) {};`, {
      plugins: {docscript: true}
    });
    Assert.deepEqual(ast, {
      "type": "Program",
      "start": 0,
      "end": 9,
      "body": [
	{
	  "type": "CallExpression",
	  "start": 0,
	  "end": 9,
	  "callee": {
	    "type": "Identifier",
	    "start": 0,
	    "end": 1,
	    "name": "d"
	  },
	  "arguments": [
	    {
	      "type": "ObjectExpression",
	      "start": 2,
	      "end": 4,
	      "properties": []
	    },
	    {
	      "type": "FunctionExpression",
	      "start": 6,
	      "end": 8,
	      "docscript": true,
	      "body": {
		"type": "BlockStatement",
		"start": 6,
		"end": 8,
		"body": []
	      },
	      "params": [],
	      "generator": false,
	      "expression": false
	    }
	  ]
	}
      ],
      "sourceType": "script"
    });
  });

  it("Parsing attributes", function() {
    let ast = acorn.parse(`d({a: "hi"}) {};`, {
      plugins: {docscript: true}
    });
    Assert.deepEqual(ast, {
      "type": "Program",
      "start": 0,
      "end": 16,
      "body": [
	{
	  "type": "CallExpression",
	  "start": 0,
	  "end": 16,
	  "callee": {
	    "type": "Identifier",
	    "start": 0,
	    "end": 1,
	    "name": "d"
	  },
	  "arguments": [
	    {
	      "type": "ObjectExpression",
	      "start": 2,
	      "end": 11,
	      "properties": [
		{
		  "type": "Property",
		  "start": 3,
		  "end": 10,
		  "method": false,
		  "shorthand": false,
		  "computed": false,
		  "key": {
		    "type": "Identifier",
		    "start": 3,
		    "end": 4,
		    "name": "a"
		  },
		  "value": {
		    "type": "Literal",
		    "start": 6,
		    "end": 10,
		    "value": "hi",
		    "raw": "\"hi\""
		  },
		  "kind": "init"
		}
	      ]
	    },
	    {
	      "type": "FunctionExpression",
	      "start": 13,
	      "end": 15,
	      "docscript": true,
	      "body": {
		"type": "BlockStatement",
		"start": 13,
		"end": 15,
		"body": []
	      },
	      "params": [],
	      "generator": false,
	      "expression": false
	    }
	  ]
	}
      ],
      "sourceType": "script"
    });
  });

  it("Parsing invalid attributes throws SyntaxError", function() {
    throwsError(`d("hi") {};`);
  });
});

function throwsError(code) {
  let error = true;
  try {
    let result = acorn.parse(code, {
      plugins: {docscript: true}
    });
    error = false;
  } catch (e) {
    // Expected exception.
  }

  if (!error) {
    throw new Error(message);
  }
}
