DocScript
=========

This is an early exploration of an extension to the JS language to enable a [DSL](https://medium.com/@daveford/80-of-my-coding-is-doing-this-or-why-templates-are-dead-b640fc149e22) designed to manipulate the DOM.

The syntax is largely inspired by [Kotlin builders](https://kotlinlang.org/docs/reference/type-safe-builders.html) (i.e. they look ilke {}-trees rather than XML) and the application is largely inspired by [JSX](https://facebook.github.io/react/docs/introducing-jsx.html) (i.e. templating language to build HTML components).

This is currently prototyped as a transpiler.

# Example

DocScript extends the JS syntax to enable declaring tree-like structures and intermingling imperative code back and fourth. Its most simple invocation returns an Element:

```javascript
let head = span { 
  // This is JS, so comments are valid!
  
  // String expressions added as text nodes!
  "Sam's home page"
};
```

Along the lines of [Kotlin builders](https://kotlinlang.org/docs/reference/type-safe-builders.html)'s, what goes inside the ```{}``` is valid Javavscript code, so you can execute real statements. For example:

```javascript
let body = div {
  // Like, for real JS. E.g. if statements are executed.
  if (document.cookie) {
    "Welcome back!"
  }

  // Same goes for for loops
  for (let page in ["about", "contact"]) {
    a(href=`${page}.html`) { page }
  }
  
  div({onclick: function() { alert("Hi!"); }}) {
    click me!
  }
  
  // Promises!
  fetch("data.pb").then(data => {
    data.forEach(user => {
      `${user.name}`
    });
  });
}
```
Finally, a ```dom()``` API is provided so that you can turn the ```Element``` instance into a HTMLElement instance to be embedded in the DOM.

```
let html = div {
  // Expressions that result into a DocScript are
  // appended as children!
  head
  body
}

// The .dom() API transforms the Element instance into
// an HTMLElement instance.
document.body.appendChild(html.dom());
```

# Installation

  `npm install @docscript/docscript`
  
# Usage

```console
  dsc file.js
```

# Tests

  `npm test`


# Related work

* JSX
* Kotlin typed builders
* Elm
* Hyperscript
* json-ish
* Om
* Flutter
* Anko layouts
* E4X
* [Curl](https://en.wikipedia.org/wiki/Curl_(programming_language))
* [JFX Script](https://en.wikipedia.org/wiki/JavaFX_Script)
* [JXON](https://developer.mozilla.org/en-US/docs/Archive/JXON)
* [Protocol Buffers](https://developers.google.com/protocol-buffers/docs/overview)
* [JSON-ish](http://blog.sgo.to/2015/09/json-ish.html)