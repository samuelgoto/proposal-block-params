const {html, head, title, body, div, span} = require("./../examples/framework/html.js");

let welcome = "Hello World!";

// A HTML node
let content = div {

  // If-statements!
  if (true) {
      span("Welcome back!")
  }

  // For-loops!
  for (let page of ["about", "contact"]) {
    span(page)
  }

  div {
    this.onclick = function() { return "Hi!"; };
    span("click me!")
  }
}

// A function that returns a HTML node
let extra = function() {
  return div { this.node("extra info") };
}

// Composing multiple nodes
let result = html {
  head {
      title("Sam's Website")
  }
  body {
      // CSS in JS!
      this.style = {
	  "background-color": "black",
      };
      div {
	  // Variables!
	  div(welcome)

	  // Functions!
	  div(extra())

	  // Composition!
	  div(content)
      }
  }
}

// Prints the tree.
console.log(JSON.stringify(result, undefined, ' '));

// Clicks on div.
// html.children[2].children[2].onclick();
//console.log(result.children[2].children[3].onclick());
