function div(block) {
  let result = new DIV();
  block.call(result, result);
  return result;
}

function NODE(type) {
  this["@type"] = type;
};
NODE.prototype.root = function() {
  return this;
};
NODE.prototype.node = function(child) {
  this.children = this.children || [];
  this.children.push(child);
};
NODE.prototype.setAttribute = function(name, value) {
  this[name] = value;
};

function DIV() {
  NODE.call(this, "div");
  this.width = undefined;
  this.height = undefined;
  // this.setAttribute = function(name, value) {
  // };
  // this.root = function() {
  //  return this;
  //};
  // this.node = function(child) {
  // };
  this.span = function(arg1, arg2) {
    let result = new SPAN();
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
    this.node(result);
    return result;
  }
}
DIV.prototype = Object.create(NODE.prototype);
function SPAN() {
  NODE.call(this, "span");
}
SPAN.prototype = Object.create(NODE.prototype);

module.exports.div = div;
