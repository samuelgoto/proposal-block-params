function element(Type, arg1, arg2) {
  let result = new Type();
  let block = function() {};

  if (typeof arg1 == "function") {
    block = arg1;
  } else if (typeof arg2 == "function") {
    block = arg2;
  }

  block.call(result);

  if (typeof arg1 == "string") {
    result.children = [arg1];
  }

  if (typeof arg1 == "object") {
    for (prop in arg1) {
      result.setAttribute(prop, arg1[prop]);
    }
  }

  // Appends itself into the parent.

  if (this.node) {
    this.node(result);
  }

  return result;
}

class Element {
  constructor(type) {
    this["@type"] = type;
  }
  root() {
    return this;
  };
  node(child) {
    this.children = this.children || [];
    this.children.push(child);
  };
  setAttribute(name, value) {
    this[name] = value;
  };
};

class Div extends Element {
  constructor() {
    super("div");
  }
}

class Span extends Element {
  constructor() {
    super("span");
  }
}

class Body extends Element {
  constructor() {
    super("body");
  }
}

class Title extends Element {
  constructor() {
    super("title");
  }
}

class Head extends Element {
  constructor() {
    super("head");
  }
}

class Html extends Element {
  constructor() {
    super("html");
  }
}

// This is the function that gets called when one
// annotates a class with @component
function component(type) {
  // console.log(type);
  return type;
}

module.exports.span = function(arg1, arg2) { return element.call(this, Span, arg1, arg2); };
module.exports.div = function(arg1, arg2) { return element.call(this, Div, arg1, arg2); };
module.exports.title = function(arg1, arg2) { return element.call(this, Title, arg1, arg2); };
module.exports.html = function(arg1, arg2) { return element.call(this, Html, arg1, arg2); };
module.exports.body = function(arg1, arg2) { return element.call(this, Body, arg1, arg2); };
module.exports.head = function(arg1, arg2) { return element.call(this, Head, arg1, arg2); };
module.exports.component = component;
