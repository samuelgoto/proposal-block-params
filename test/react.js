const Assert = require('assert');
const {DocScript} = require('./../docscript');
var expect = require('chai').expect;
var acorn = require("acorn");
var React = require("react");
var ReactDOMServer = require('react-dom/server');

describe("React", function() {
  it("React hello world HTML", function() {
    let result = ReactDOMServer.renderToStaticMarkup(
      React.createElement("div", null, "hello world"));
    Assert.equal(result, "<div>hello world</div>");
  });

  it("React nesting HTML", function() {
    let result = ReactDOMServer.renderToStaticMarkup(
      React.createElement("div", null,
        React.createElement("span", null, "hello world")));
    Assert.equal(result, "<div><span>hello world</span></div>");
  });

  it("Simplest", function() {
    assertThat(`
      div {
      } 
    `).equalsTo(`<div></div>`);
  });

  it("Nesting", function() {
    assertThat(`
      div {
	  span {}
      } 
    `).equalsTo(`<div><span></span></div>`);
  });

  it("Attributes", function() {
    assertThat(`
      div {
	  span({width: 100}) {}
      } 
    `).equalsTo(`<div><span width="100"></span></div>`);
  });

  it("Text nodes", function() {
    assertThat(`
      div {
	  span("hello world")
      }
    `).equalsTo(`<div><span>hello world</span></div>`);
  });

  it("Simplest component", function() {
    assertThat(`
      class A extends React.Component {
	  render() {
            return div {
  	      span("hello world")
            } 
          }
      }
      let a = Element.export(A);
      div {
	  a({width: 100}) {}
      }
    `).equalsTo(`<div><div><span>hello world</span></div></div>`);
  });
});

class That {
    constructor(code) {
	this.code = code;
    }
    equalsTo(html, opt_debug) {
	let code = DocScript.compile(`
	  let {div, Element} = require("../examples/framework/react.js");
	  ${this.code}			     
       `);

	let el = eval(code.toString());

	let result = ReactDOMServer.renderToStaticMarkup(el);

	Assert.equal(result, html);
    }
}

function assertThat(code) {
    return new That(code);
}
