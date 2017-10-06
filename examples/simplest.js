const {div} = require("./../examples/framework/html.js");

let head = div { this.node("hello world") };

console.log(JSON.stringify(head, undefined, ' '));
