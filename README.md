Domain Specific Languages
=========

This is a very early [stage 0](https://tc39.github.io/process-document/) exploration of a syntactical simplication (heavily inspired by [Kotlin](https://kotlinlang.org/docs/reference/lambdas.html) and [Groovy](http://docs.groovy-lang.org/docs/latest/html/documentation/core-domain-specific-languages.html)) that enables domain specific languages to be developed in userland.

It is syntactic sugar that allows:

* on function calls, omitting parantheses around the ***last*** parameter when that's a lambda
* on function calls inside the lambda, passing the context of the lambda

For example, ```a("hello") { ... }``` is desugared to ```a("hello", function() { ... })```.

Functions that take just a single parameter can also be called as ```a { ... }``` which is desugared to ```a(function() { ... })```.

To enable calls inside the lambda to keep track of the context, function calls are passed the context ```this``` as a ```.call``` argument.

For example, ```a { b("hi") }``` is desugared to ```a(function() { b.call(this, "hi") })```.

While a simple syntactical simplification, it enables an interesting set of userland frameworks to be built.

There are interesting scenarios in:

* [flow control](#flow-control) (e.g. [lock](#lock), [unless](#perls-unless), [guard](#swifts-guard), [defer](#swifts-defer), [foreach](#cs-foreach), [vbs-select](#select))
* [builders](#builders) (e.g. [map](#map), [dot](#dot), [data](#custom-data))
* [layout](#layout) (e.g. [html](#kotlins-template), [android](#android))
* [configuration](#configuration) (e.g. [node](#node), [makefiles](#makefiles))
* [others](#misc) (e.g. [regexes](#regexes), [graphql](#graphql), [testing](#testing))

And interesting applications in:

* [JSX](#jsx)
* [template literals](#template-literals)

This is early, so we have a list of open questions in the form of an [FAQ](#FAQ).

# Use cases

A random list of possibilities collected from kotlin/groovy (links to equivalent idea in kotlin/groovy at the headers), somewhat sorted by most to least compelling.

## flow control

### [lock](https://kotlinlang.org/docs/reference/lambdas.html)

* [java's synchronized](http://winterbe.com/posts/2015/04/30/java8-concurrency-tutorial-synchronized-locks-examples/x)

```javascript
lock (resource) {
  resource.kill();
}
```

### [Perl's unless](https://www.tutorialspoint.com/perl/perl_unless_statement.htm)

* [groovy's](https://www.slideshare.net/glaforge/practical-groovy-dsl)

```javascript
unless (expr) {
  // statements
}
```

### [Swift's guard](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/ErrorHandling.html)

* aka [assert](https://artemzin.com/blog/ui-testing-separating-assertions-from-actions-with-kotlin-dsl/)

```javascript
guard (document.cookie) {
  alert("blargh, you are not signed in!");
}
```

### [Swift's defer](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/ErrorHandling.html)

* aka [run](http://melix.github.io/javaone-groovy-dsls/#/gradle-task-execution)

```javascript
defer {
  // internally calls setTimeout(0)
  alert("hello world");
}
```


### [C#'s foreach](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/foreach-in)

```javascript
foreach (array) {
  console.log(item());
}
foreach (map) {
  console.log(`${key()}: ${value()}`);
}
foreach (stream) {
  console.log(`new piece! ${value}`);
}
```

### [VB's select](https://docs.microsoft.com/en-us/dotnet/visual-basic/language-reference/statements/select-case-statement)

```javascript
let a = select (foo) {
  when (bar) { 1 }
  when (hello) { 2 }
  otherwise { 3 }
}
```

### [C#'s using](https://stackoverflow.com/questions/212198/what-is-the-c-sharp-using-block-and-why-should-i-use-it)

```javascript
using (stream) {
  // stream gets closed automatically.
}
```

## builders

### [maps](http://openjdk.java.net/jeps/269)

... and sets ...

```javascript
let a = map {
  put("hello", "world")
  put("foo, "bar")
}
```

### [dot](https://en.wikipedia.org/wiki/DOT_(graph_description_language))

```javascript
let a = graph("architecture") {
  edge("a", "b")
  edge("b", "c")
  // ...
}
```

### custom data

```javascript
let data = survey("TC39 Meeting Schedule") {
  question("Where should we host the European meeting?") {
    option("Paris")
    option("Barcelona")
    option("London")
  }
}
```

## layout

### [kotlin's templates](https://kotlinlang.org/docs/reference/type-safe-builders.html)

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

### [android](https://github.com/Kotlin/anko)

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

## Configuration

### [node](http://melix.github.io/javaone-groovy-dsls/#/ratpack)

* http://www.sinatrarb.com/

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

### [makefiles](https://github.com/jenkinsci/job-dsl-plugin)

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

## Misc

### [regexes](https://github.com/h0tk3y/regex-dsl)

```javascript
// NOTE(goto): inspired by https://github.com/MaxArt2501/re-build too.
let re = regex {
  start()
  then("a")
  then(2, "letters")
  maybe("#")
  oneof("a", "b")
  between([2, 4], "a")
  insensitively()
  end()
}
```

### [graphql](https://www.kotlinresources.com/library/kraph/)

```javascript
// NOTE(goto): hero uses proxies/getters to know when properties
// are requested. depending on the semantics of this proposal
// this may not be possible to cover.
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

### [testing](http://hadihariri.com/2013/01/21/extension-function-literals-in-kotlin-or-how-to-enforce-restrictions-on-your-dsl/)

* http://rspec.info/

```javascript
// mocha
describe("a calculator") {

  val calculator = Calculator()

  on("calling sum with two numbers") {

    val sum = calculator.sum(2, 3)

    it("should return the sum of the two numbers") {

      shouldEqual(5, sum)
    }
  }
}
```

# Applications

One of the most interesting aspects of this proposal is that it opens the door to statement-like structures inside expressions, which are most notably useful in constructing the DOM.

## JSX

For example, instead of:

```jsx
// JSX
var box =
  <Box>
    {
      shouldShowAnswer(user) ?
      <Answer value={false}>no</Answer> :
      <Box.Comment>
         Text Content
      </Box.Comment>
    }
  </Box>;
```

One could write:

```jsx
// JSX
var box =
  <Box>
    {
      select (shouldShowAnswer(user)) {
        when (true) {
          <Answer value={false}>no</Answer>
        }
        when (false) {
          <Box.Comment>
             Text Content
          </Box.Comment>
        }
      }
    }
  </Box>;
```

## Template Literals

For example, instead of:

```javascript
let html = `<div>`;
for (let product of ["apple", "oranges"]) {
  html += `<span>${product}</span>`;
}
html += `</div>`;
```

or

```javascript
let html = `
  <div>
  ${["apple", "oranges"].forEach(product => `<span>${product}</span>`)}
  </div>
`;
```

One could write:

```javascript
let html = `
  <div>
  ${foreach (["apple", "orange"]) {
    `<span>${item()}</span>`
  }}
  </div>
`;
```

# Prior Art

# FAQ

## Do the benefits of growing the language outweight its cost ([mark miller](https://mail.mozilla.org/pipermail/es-discuss/2015-June/043307.html), [guy steele](https://www.youtube.com/watch?v=_ahvzDzKdB0))?

We are still evaluating feasibility and long term benefits. The intuition is that it may (particurlary when it comes to constructing DOM, which accounts to a significant portion of the time spent developing on the web), but we certainly acknowledge that there is a significant cognitive growth of the language.

## Do you corner yourself from ever enabling further control structures (e.g. match?)?

Unclear.

TODO(goto): how does kotlin/groovy get away with this?

Here are some of the alternatives we are considering, somewhat sorted by most to least appealing:

* user defined forms take precendence over {"future", "all"} built-in ones
* enumerate and reserve all keywords
* sigils (e.g. for! {})

## Do you allow ```return```, ```throws```, ```break``` and ```continue``` inside the lambdas?

Unclear.

TODO(goto): kotlin does, has it been a problem?

Here are some alternatives we are considering, somewhat sorted by most to least compelling:

* yes, burden on the user to know the transformation
* no

## What would it take to enable things like if {} else {} to be done? do {}? match {}? for (;;) {}?

Unclear at this point if DSLs are a good idea or not, so these are left as possible future extensions:

* ```if () {} elseif() {} else {}``` would require some sort of chaining between the calls. something along the lines of ```if(expr, () => { ... }).else( ... )```.
* ```for (;;)``` would require some sort of: (a) a ```;``` divider for parameters and (b) passing expressions as functions that can be re-evaluated.

## What else do other languages support for DSL?

TBD.

## What other mechanisms have you explored for identifier resolution?

* with (this) {}
* receivers
* for (let i in foo) {}
* named parameters

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
