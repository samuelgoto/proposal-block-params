High Order Functions
=========

This is a very early [stage 0](https://tc39.github.io/process-document/) exploration of a syntactical sugar extension to JS heavily inspired by [Kotlin lambdas](https://kotlinlang.org/docs/reference/lambdas.html) that enables an interest set of code patterns.

The syntactical sugar is to enable function `{}` blocks of the last parameter to be declared outside of the closing `)` of function calls. For example:

```javascript
function a(b) {
  b();
}

// when {}-blocks follow function calls ...
a {
  // random code
}

// ... they get appended to the function call as the last parameter.
a(() => {
  // random code
});
```

While a simple syntactical change, this enables interesting use cases.

# Use cases

## Builders

https://engineering.facile.it/blog/eng/kotlin-dsl/

```javascript


```

## with

```javascript
let person = new Person();
let kids = [{name: "leo", age: 4}, {name: "anna", age: 1}];

with (person) {
  setName("Sam Goto");
  setFavoriteSuperHero("Iron Man");
  for (kid in kids) {
    let child = new Child();
    with (child) {
      setName(kid.name);
      setAge(kid.age);
    }
    addChild(kid);
  }
}

function with(obj, body) {
  body.call(obj);
}
```

## lock

```javascript
lock (resource) {
  resource.kill();
}

function lock(resource, body) {
  Atomic.wait();
  body();
  Atomic.release(); // TODO(goto): get this right
}
```

# do

```javascript
let a = do {  
  if (expr)
    return 1;
  else
    return 2;
};

function do(body) {
  return body();
}
```

# graphql

https://www.kotlinresources.com/library/kraph/

# HTML

Much like in [Kotlin Builders](https://kotlinlang.org/docs/reference/type-safe-builders.html) the general trick in the language is to enable {} expressions to follow functions and embed that as the last argument of the function. For example, the example below: 

It is designed to intermingle well with [CSS in JS](https://speakerdeck.com/vjeux/react-css-in-js) and [HTML in JS](https://facebook.github.io/react/docs/introducing-jsx.html).

Like Kotlin, it is designed to enable going back and fourth between the declarative code and the full set of imperative code (statements in addition to expressions).

You can find a good analysis of alternatives [here](https://medium.com/@daveford/80-of-my-coding-is-doing-this-or-why-templates-are-dead-b640fc149e22).



```javascript
let head = span { text("Hello World!") };
```

is isomorphic to the code below:


```javascript
let head = span(function() { text("Hello World!") });
```

Along the lines of [Kotlin builders](https://kotlinlang.org/docs/reference/type-safe-builders.html)'s, what goes inside the ```{}``` is valid JS code, so you can execute real JS imperative statements. For example:

```javascript
let body = div {
  // This is JS scope, so comments are valid!

  // Like, for real JS. E.g. if statements are executed.
  if (document.cookie) {
    text("Welcome back!")
  }

  // Same goes for for loops
  for (let page of ["about", "contact"]) {
    a({href: `${page}.html`}) { page }
  }
  
  // Attributes are passed as ({key: value}) and can contain JS too.
  div({onclick: function() { alert("Hi!"); }}) {
    text("click me!")
  } 
  
  // CSS in JS!
  let COMMON_WIDTH = 1000;
  span({
    style : {  
      width: COMMON_WIDTH, // imperative css!
    }
  }) {
    text("hello world!")
  }
}
```


# Installation

  This is currently prototyped as a transpiler. You can find a lot of examples [here](test/runtime.js).

  `npm install -g @docscript/docscript`
  

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
