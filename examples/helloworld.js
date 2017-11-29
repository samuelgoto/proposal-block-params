const {html, head, title, body, div, span} = require("./../examples/framework/html.js");

let welcome = "Hello World!";

// A HTML node
let content = div {

  // If-statements!
  if (true) {
      __args__.span("Welcome back!")
  }

  // For-loops!
  for (let page of ["about", "contact"]) {
    __args__.span(page)
  }

  let div = __args__.div.bind(__args__);
  div {
    __args__.onclick = function() { return "Hi!"; };
    __args__.span("click me!")
  }
}

// A function that returns a HTML node
let extra = function() {
  return div { __args__.node("extra info") };
}

// Composing multiple nodes
let result = html {
  let head = __args__.head.bind(__args__);
  head {
      __args__.title("Sam's Website")
  }
  let body = __args__.body.bind(__args__);
  body {
      // CSS in JS!
      __args__.style = {
	  "background-color": "black",
      };
      let div = __args__.div.bind(__args__);
      div {
	  // Variables!
	  __args__.div(welcome)

	  // Functions!
	  __args__.div(extra())

	  // Composition!
	  __args__.div(content)
      }
  }
}

// Prints the tree.
console.log(JSON.stringify(result, undefined, ' '));

// Clicks on div.
// html.children[2].children[2].onclick();
//console.log(result.children[2].children[3].onclick());
