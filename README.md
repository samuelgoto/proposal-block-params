Domain Specific Languages
=========

This is a very early [stage 0](https://tc39.github.io/process-document/) exploration of a syntactical simplication (heavily inspired by [Kotlin](https://kotlinlang.org/docs/reference/lambdas.html) and [Groovy](http://docs.groovy-lang.org/docs/latest/html/documentation/core-domain-specific-languages.html)) that enables domain specific languages to be polyfilled.

In its basic form, it is an affordance that lets you omit parantheses around the arguments of function calls for lambdas. For example, ```a {}``` is isomorphic to ```a(function() {})``` or ```a(1) {b()}``` is equivalent to ```a(1, function() {b()})```.

While a simple syntactical change, it enables an interesting set of code patterns.

# Use cases

A random list of possibilities collected from kotlin/groovy (links to equivalent idea in kotlin/groovy at the headers), somewhat sorted by most to least compelling.

## [lock](https://kotlinlang.org/docs/reference/lambdas.html)

```javascript
lock (resource) {
  resource.kill();
}
```

## [node](http://melix.github.io/javaone-groovy-dsls/#/ratpack)

```javascript
const express = require("express");
const app = express();

server (app) {
  get("/") {
     response().send("hello world" + request().get("param1"));
  }

  listen(3000) {
    console.log("hello world");
  }
}
```

## [HTML](https://kotlinlang.org/docs/reference/type-safe-builders.html)

```javascript
let body = html {
  head {
    title("Welcome!")
  }
  body {
    div {
      span("Hello World")
    }
    a({href: "contact.html"}) { span("contact me") }
  }
}
```

## [graphql](https://www.kotlinresources.com/library/kraph/)

```javascript
// hero uses proxies/getters to know when properties
// are requested.
let heroes = hero {
  name
  height
  mass
  friends {
    name
    home {
      name
      climate
    }
  }
}
```

## [configuration ](https://github.com/jenkinsci/job-dsl-plugin)

```javascript
job('PROJ-unit-tests') {
  scm {
      git(gitUrl)
  }
  triggers {
      scm('*/15 * * * *')
  }
  steps {
      maven('-e clean test')
  }
}
```

## [android](https://github.com/Kotlin/anko)

```javascript
VerticalLayout {
  ImageView ({width: matchParent}) {
      padding = dip(20)
      margin = dip(15)
    }
    Button("Tap to Like") {
      onclick { toast("Thanks for the love!") }
    }
  }
}
```

## [assert](https://artemzin.com/blog/ui-testing-separating-assertions-from-actions-with-kotlin-dsl/)

```javascript
assert (expr) {
  console.log("blahh something went wrong!");
}
```

## [run](http://melix.github.io/javaone-groovy-dsls/#/gradle-task-execution)

```javascript
run (100) {
  // internally calls setTimeout
  alert("hello world");
}
```

## [regexes](https://github.com/h0tk3y/regex-dsl)

```javascript
// NOTE(goto): inspired by https://github.com/MaxArt2501/re-build too.
let re = regex {
  start()
  literally("a")
  optionally("b")
  one().of() {
    exactly(5).characters()
    some(3).words()
  }
  end()
}
```

## [testing](http://hadihariri.com/2013/01/21/extension-function-literals-in-kotlin-or-how-to-enforce-restrictions-on-your-dsl/)

```javascript
given("a calculator", {

  val calculator = Calculator()

  on("calling sum with two numbers", {

    val sum = calculator.sum(2, 3)

    it("should return the sum of the two numbers", {

      shouldEqual(5, sum)
    }
  }
}
```

## do

```javascript
let a = do {  
  if (expr)
    return 1;
  else
    return 2;
};
```

## [unless](https://www.slideshare.net/glaforge/practical-groovy-dsl)

```javascript
unless (expr) {
  // statements
}
```


# Polyfill

  This is currently polyfilled as a transpiler. You can find a lot of examples [here](test/runtime.js).

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
