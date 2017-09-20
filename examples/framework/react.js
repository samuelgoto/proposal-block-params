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

  block.call(result);

  if (typeof arg1 == "string") {
    result.children = [arg1];
  }

  if (typeof arg1 == "object") {
    for (prop in arg1) {
      result.setAttribute(prop, arg1[prop]);
    }
  }

  // console.log(Type);
  // console.log(result);
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
  static register(Type) {
    Element.prototype[Type.name] = Element.export(Type);
  }
  static define(parent, label, Type) {
    parent.prototype[`${label}`] = function(arg1, arg2) {
      element.call(this, Type, arg1, arg2);
    };
  }
  static export(Type) {
    return function(arg1, arg2) {
      element.call(this, Generic.bind(Generic, Type), arg1, arg2);
    };
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

Element.define(Element, "span", Span);
Element.define(Element, "div", Div);
Element.define(Element, "li", Li);
Element.define(Element, "ol", Ol);
Element.define(Element, "button", Button);
Element.define(Element, "a", A);

class Body extends Element {
  constructor() {
    super("body");
  }
}
Element.define(Body, "div", Div);
Element.define(Body, "span", Span);

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
Element.define(Head, "title", Title);

class Html extends Element {
  constructor() {
    super("html");
  }
}
Element.define(Html, "head", Head);
Element.define(Html, "body", Body);

let scope = typeof module != "undefined" ? module.exports : window;

scope.div = element.bind(this, Div);
scope.title = element.bind(this, Title);
scope.html = element.bind(this, Html);
scope.li = element.bind(this, Li);
scope.a = element.bind(this, A);
scope.button = element.bind(this, Button);
scope.Element = Element;
