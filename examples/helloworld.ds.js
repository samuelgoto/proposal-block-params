// Pretends to be in a browser context.
let document = { cookies: "fake cookie" };

let head = span { "Hello World!" };

let body = div {
  if (document.cookies) {
    // TODO(goto): figure out why this isn't working.
    "Welcome back!"
  }
  for (let page of ["about", "contact"]) {
    a({href: `${page}.html`}) { page }
  }
  div({onclick: function() { console.log("Hi!"); }}) {
    "click me!"
  }
}

function extra() {
  return span { "extra info" };
}

let html = div {
  head
  extra()
  body
}

// Prints the tree.
console.log(JSON.stringify(html, undefined, ' '));

// Clicks on div.
html.children[2].children[2].attributes.onclick();
