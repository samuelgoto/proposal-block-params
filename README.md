DocScript
=========

This is an early exploration of an extension to the JS language to enable a [DSL](https://medium.com/@daveford/80-of-my-coding-is-doing-this-or-why-templates-are-dead-b640fc149e22) designed to manipulate the DOM.

The syntax is inspired by [Kotlin builders](https://kotlinlang.org/docs/reference/type-safe-builders.html) (i.e. they look ilke {}-trees rather than XML). It is meant to be used as a DSL like [JSX](https://facebook.github.io/react/docs/introducing-jsx.html) (i.e. templating language to build HTML components).

Like Kotlin, it is designed to enable going back and fourth between the declarative code and the imperative code.

This is currently prototyped as a transpiler.

# Example

DocScript extends the JS syntax to enable declaring tree-like structures and intermingling imperative code back and fourth. Its most simple invocation returns an Element:

```javascript
let head = span { "Hello World!" };
```

Along the lines of [Kotlin builders](https://kotlinlang.org/docs/reference/type-safe-builders.html)'s, what goes inside the ```{}``` is valid JS code, so you can execute real statements. For example:

```javascript
let body = div {
  // This is JS scope, so comments are valid!

  // Like, for real JS. E.g. if statements are executed.
  if (document.cookie) {
    "Welcome back!"
  }

  // Same goes for for loops
  for (let page of ["about", "contact"]) {
    a({href: `${page}.html`}) { page }
  }
  
  // Attributes are passed as ({key: value}) and can contain JS too.
  div({onclick: function() { alert("Hi!"); }}) {
    click me!
  } 
}
```
Finally, a ```dom()``` API is provided so that you can turn the ```Element``` instance into a HTMLElement instance to be embedded in the DOM.

```javascript
function extra() {
  return span { "extra info" }
}

let html = div {
  // Expressions that result into a DocScript are
  // appended as children!
  head // variables get composed
  extra() // functions get called
  body
}

// The .dom() API transforms the Element instance into
// an HTMLElement instance.
document.body.appendChild(html.dom());
```

It plays well with components-like frameworks:

```javascript
class MyComponent extends mixin(Component, React) {
  constructor() {
    this.name = "Sam Goto";
  }
  render() {
    return span { `Welcome back, ${this.foo}!` }
  }
}
```

# Installation

  `npm install -g @docscript/docscript`
  
# Usage

```console
> dsc examples/helloworld.ds.js > /tmp/helloworld.js; node /tmp/helloworld.js
{
 "name": "div",
 "children": [
  {
   "name": "span",
   "children": [
    "Hello World!"
   ]
  },
  {
   "name": "span",
   "children": [
    "extra info"
   ]
  },
  {
   "name": "div",
   "children": [
    {
     "name": "a",
     "attributes": {
      "href": "about.html"
     },
     "children": [
      "about"
     ]
    },
    {
     "name": "a",
     "attributes": {
      "href": "contact.html"
     },
     "children": [
      "contact"
     ]
    },
    {
     "name": "div",
     "attributes": {},
     "children": [
      "click me!"
     ]
    }
   ]
  }
 ]
}
Hi!
```

# Tests

  `npm test`

# Status

  You really don't want to use this right now. Very early prototype.

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
