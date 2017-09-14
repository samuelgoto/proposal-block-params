const {div} = require("./../examples/framework/framework.js");

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
  //div {
  //  onclick = function() { console.log("Hi!"); }
  //  node("click me!")
  //}
}

function extra() {
  return div { node("extra info") };
}

let html = div {
  node(head)
  node(extra())
  node(body)
}

// Prints the tree.
console.log(JSON.stringify(html, undefined, ' '));

// Clicks on div.
// html.children[2].children[2].attributes.onclick();
