function element(Type, arg1, arg2) {
  let result = new Type();
  let block = function() {};

  if (typeof arg1 == "function") {
    block = arg1;
  } else if (typeof arg2 == "function") {
    block = arg2;
  }

  block.call(result, result);

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

class Node {
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
  register(type, block) {
    this[type] = block;
  };
};

class Base extends Node {
  constructor(type) {
    super(type);
    this.register("span", element.bind(this, Span));
    this.register("div", element.bind(this, Div));
  }
}

class Div extends Base {
  constructor() {
    super("div");
  }
}

class Span extends Base {
  constructor() {
    super("span");
  }
}

module.exports.div = element.bind(this, Div);
