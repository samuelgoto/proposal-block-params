if (typeof module != "undefined") {
    var React = require("react");
}

function element(Type, arg1, arg2) {
  let result = new Type();
  let block = function() {};

  if (typeof arg1 == "function") {
    block = arg1;
  } else if (typeof arg2 == "function") {
    block = arg2;
  }

  block(result);

  if (typeof arg1 == "string") {
    result.children = [arg1];
  }

  if (typeof arg1 == "object") {
    for (prop in arg1) {
      result.setAttribute(prop, arg1[prop]);
    }
  }

  let el = React.createElement(result.type, result.attributes, ...result.children);

  // Appends itself into the parent.
  if (this.node) {
     this.node(el);
  }

  return el;
}

class Element {
  constructor(type) {
    this.type = type;
    this.children = [];
    this.attributes = {};
  }
  root() {
    return this;
  };
  node(child) {
    this.children.push(child);
  };
  setAttribute(name, value) {
    this.attributes[name] = value;
  };
  static export(Type) {
    Element.prototype[Type.name] = function(arg1, arg2) {
      return element.call(this, Generic.bind(null, Type), arg1, arg2);
    };
  }
  static register(Type) {
    Element.prototype[Type] = function(arg1, arg2) {
      return element.call(this, Generic.bind(null, Type), arg1, arg2);
    }
  }
};

class Generic extends Element {
    constructor(type) {
	super(type);
    }
}

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

class Li extends Element {
  constructor() {
    super("li");
  }
}

class Ol extends Element {
  constructor() {
    super("Ol");
  }
}

class Button extends Element {
  constructor() {
    super("button");
  }
}

class A extends Element {
  constructor() {
    super("a");
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

// NOTE(goto): this is the function that gets called everytime
// an @component annotation gets attached to a class.
function component(type) {
  return function(props) {
    console.log("hi");
    console.log(props);
    console.log(type.toString());
    return new type(props);
  }
  // return type;
}

let scope = typeof module != "undefined" ? module.exports : window;

scope.div = function(arg1, arg2) { return element.call(this, Div, arg1, arg2); };
scope.span = function(arg1, arg2) { return element.call(this, Span, arg1, arg2); };
scope.title = function(arg1, arg2) { return element.call(this, Title, arg1, arg2); };
scope.html = function(arg1, arg2) { return element.call(this, Html, arg1, arg2); };
scope.li = function(arg1, arg2) { return element.call(this, Li, arg1, arg2); };
scope.a = function(arg1, arg2) { return element.call(this, A, arg1, arg2); };
scope.button = function(arg1, arg2) { return element.call(this, Button, arg1, arg2); };
scope.Element = Element;
scope.component = component;

Element.register("div");
Element.register("span");
Element.register("title");
Element.register("html");
Element.register("li");
Element.register("a");