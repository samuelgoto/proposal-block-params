const {div} = require("./../examples/framework/framework.js");

let head = div { node("hello world") };

console.log(JSON.stringify(head, undefined, ' '));
