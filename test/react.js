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

  it("React framework", function() {
    let code = DocScript.compile(`
      let {div} = require("../examples/framework/react.js");

      div {
	  span {}
      } 
    `);

    let el = eval(code.toString());

    let result = ReactDOMServer.renderToStaticMarkup(el);

    Assert.equal(result, "<div><span></span></div>");
  });
});
