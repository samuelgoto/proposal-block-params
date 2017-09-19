const {html, div, title} = require("./../examples/framework/html.js");

let welcome = "Hello World!";

let content = div {
  if (true) {
    node("Welcome back!")
  }

  for (let page of ["about", "contact"]) {
    span(page)
  }

  div {
    this.onclick = function() { return "Hi!"; };
    span("click me!")
  }
}

let extra = function() {
  return div { node("extra info") };
}

let result = html {
  head {
    title("Sam's Website")
  }
  body {
    div {
      div(welcome)
      node(extra())
      node(content)
    }
  }
}

// Prints the tree.
console.log(JSON.stringify(result, undefined, ' '));

// Clicks on div.
// html.children[2].children[2].onclick();
//console.log(result.children[2].children[3].onclick());
