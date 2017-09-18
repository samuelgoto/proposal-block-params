const {div} = require("./../examples/framework/html.js");

let head = div { node("Hello World!") };

let body = div {
  if (true) {
    // TODO(goto): figure out why this isn't working.
    node("Welcome back!")
  }
  for (let page of ["about", "contact"]) {
    span {
      // href = `${page}.html`
      node(page)
    }
  }

  div {
    this.onclick = function() { return "Hi!"; };
    span("click me!")
  }
}

// NOTE(goto): "global" nodejs hack that is not needed in browsers.
global.extra = function(parent) {
  return parent.node(div { node("extra info") });
}

let html = div {
  node(head)
  extra(root())
  node(body)
}

// Prints the tree.
console.log(JSON.stringify(html, undefined, ' '));

// Clicks on div.
// html.children[2].children[2].onclick();
console.log(html.children[2].children[3].onclick());
