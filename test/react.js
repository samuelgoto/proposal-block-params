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
      // @component
      class A extends React.Component {
	  render() {
            return div {
  	      span("hello world")
            }
          }
      }

      // console.log(A);
      // let A = B;

      Element.register(A);

      div {
	  A({width: 100}) {}
      }
    `).equalsTo(`<div><div><span>hello world</span></div></div>`, true);
  });

  it("Simplest composition", function() {
    assertThat(`
      class A extends React.Component {
	  render() {
            return div {
  	      span("Hi, from A!")
            }
          }
      }
      class B extends React.Component {
	  render() {
            return div {
  	      span("Hi, from B!")
	      A {}
            } 
          }
      }

      Element.register(A);
      Element.register(B);

      div {
        B {}
      }
    `).equalsTo(`<div><div><span>Hi, from B!</span><div><span>Hi, from A!</span></div></div></div>`);
  });

  it("Properties", function() {
    assertThat(`
      class A extends React.Component {
	  render() {
            let props = this.props;
            return div {
  	      span(props.content)
            }
          }
      }

      Element.register(A);

      div {
	  A({content: "hello world"}) {}
      }
    `).equalsTo(`<div><div><span>hello world</span></div></div>`);
  });

  it("State", function() {
    assertThat(`
      class A extends React.Component {
          constructor(props) {
	    super(props);
            this.state = {foo: "bar"};
          }
          componentWillMount() {
	    this.setFoo("hello");
          }
          setFoo(value) {
	    this.setState({foo: value});
          }
	  render() {
            let state = this.state;
            return div {
  	      span(state.foo)
            }
          }
      }

      Element.register(A);

      div {
	  A {}
      }
    `).equalsTo(`<div><div><span>hello</span></div></div>`);
  });

});

class That {
    constructor(code) {
	this.code = code;
    }
    equalsTo(html, opt_debug) {
	let code = DocScript.compile(`
	  let {div, Element, component} =
              require("../examples/framework/react.js");
	  ${this.code}
       `);

      if (opt_debug) {
	console.log(code.toString());
      }

      let el = eval(code.toString());

      let result = ReactDOMServer.renderToStaticMarkup(el);

      Assert.equal(result, html);
    }
}

function assertThat(code) {
    return new That(code);
}
