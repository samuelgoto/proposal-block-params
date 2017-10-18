Block Params
=========

Early feedback from @adamk, @domenic, @slightlyoff, @erights, @waldemarhowart and @bterlson (click [here](https://github.com/samuelgoto/proposal-block-params/issues/new) to send feedback).

This is a very early [stage 0](https://tc39.github.io/process-document/) exploration of a syntactical simplication (heavily inspired by [Kotlin](https://kotlinlang.org/docs/reference/type-safe-builders.html) and [Groovy](http://docs.groovy-lang.org/docs/latest/html/documentation/core-domain-specific-languages.html)) that enables domain specific languages to be developed in userland.

It is syntactic sugar that allows on function calls, omitting parantheses around the ***last*** parameter when that's a lambda.

For example:

```javascript
// this ...
a("hello") { ... }
// ... is desugared to ...
a.call(this, "hello", function() { ... })
```

Functions that take just a single block parameter can also be called:

```javascript
 // this ...
 a { ... }
 // ... is desugared to ...
 a.call(this, function() { ... })
``` 
To preserve Tennent's Corresponde Principle, certain [restrictions apply](#tennents-correspondence-principle) inside the block param.

While a simple syntactical simplification, it enables an interesting set of userland frameworks to be built, taking off presure from TC39 to design them (and an extensible [shadowing mechanism](#forward-compatibility) that enables to bake them natively when/if time comes):

Here are some interesting scenarios:

* [flow control](#flow-control) (e.g. [lock](#lock), [unless](#perls-unless), [guard](#swifts-guard), [defer](#swifts-defer), [foreach](#cs-foreach), [select](#vbs-select))
* [builders](#builders) (e.g. [map](#map), [dot](#dot), [data](#custom-data))
* [layout](#layout) (e.g. [html](#kotlins-template), [android](#android))
* [configuration](#configuration) (e.g. [node](#node), [makefiles](#makefiles))
* [others](#misc) (e.g. [regexes](#regexes), [graphql](#graphql), [testing](#testing))

And interesting applications in [DOM construction](https://medium.com/@daveford/80-of-my-coding-is-doing-this-or-why-templates-are-dead-b640fc149e22):

* [JSX](#jsx)
* [template literals](#template-literals)
* [new paradigms](#kotlins-templates)

This is early, so there are still lots of [alternatives to consider](#alternatives-considered) as well as strategic problems to overcome (e.g. [forward compatibility](#forward-compatibility)).

There are many ways this could evolve too, so we list here a few ideas that could serve as [extensions](#extensions) (e.g. [return](#return) and [bindings]()).

There is a [polyfill](#polyfill), but I wouldn't say it is a great one quite yet :)

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
assert (document.cookie) {
  alert("blargh, you are not signed in!");
}
```

### [Swift's defer](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/ErrorHandling.html)

* aka [run](http://melix.github.io/javaone-groovy-dsls/#/gradle-task-execution)

```javascript
defer(100) {
  // internally calls setTimeout(100)
  alert("hello world");
}
```


### [C#'s foreach](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/foreach-in)

```javascript
// works on arrays, maps and streams
foreach (array) {
  console.log(item());
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

```javascript
// ... and sets ...
let a = map {
  put("hello", "world")
  put("foo, "bar")
}
```

### [dot](https://en.wikipedia.org/wiki/DOT_(graph_description_language))

```javascript
let a = graph("architecture") {
  edge("a", "b") {}
  edge("b", "c") {}
  // ...
}
```

### custom data

```javascript
let data = survey("TC39 Meeting Schedule") {
  question("Where should we host the European meeting?") {
    option("Paris") {}
    option("Barcelona") {}
    option("London") {}
  }
}
```

## layout

### [kotlin's templates](https://kotlinlang.org/docs/reference/type-safe-builders.html)

```javascript
let body = html {
  head {
    title("Hello World!") {}
  }
  body {
    div {
      span("Welcome to my Blog!") {}
    }
    for (page of ["contact", "guestbook"]) {
      a({href: `${page}.html`}) { span(`${page}`) } {}
    }
  }
}
```

### [android](https://github.com/Kotlin/anko)

```javascript
let layout =
  VerticalLayout {
    ImageView ({width: matchParent}) {
        ::padding = dip(20)
        ::margin = dip(15)
      }
      Button("Tap to Like") {
        ::onclick { toast("Thanks for the love!") }
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
     this.response.send("hello world" + request().get("param1"));
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
      git(gitUrl) {}
  }
  triggers {
      scm('*/15 * * * *') {}
  }
  steps {
      maven('-e clean test') {}
  }
}
```

## Misc

### [regexes](https://github.com/h0tk3y/regex-dsl)

```javascript
// NOTE(goto): inspired by https://github.com/MaxArt2501/re-build too.
let re = regex {
  ::start()
  ::then("a")
  ::then(2, "letters")
  ::maybe("#")
  ::oneof("a", "b")
  ::between([2, 4], "a")
  ::insensitively()
  ::end()
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

# Tennent's Correspondence Principle

To preserve tennent's correspondence principle as much as possible, here are some considerations of what goes into a block param:

* ```return``` statements inside the block throws ```SyntaxError``` (same strategy as kotlin's [non-local returns](https://kotlinlang.org/docs/reference/inline-functions.html#non-local-returns))
* ```break```, ```continue```  and ```yield``` can't be used as top level statements (same strategy as ```() => { ... }```)
* ```throw``` works
* the last statement expression is used to return values from the block param (strategy borrowed from [kotlin](#kotlin))

It is important to note that ```return```, ```break``` and ```continue``` could be made to work but are left as a non-cornering extension of this minimally-viable proposal (see [extensions](#return)).

# Forward Compatibility

If we bake this in, do we corner ourselves from ever exposing new control structures (e.g. unless () {})?

That's a good question, and we are still evaluating what the answer should be. Here are a few ideas that have been thrown around:

* user defined form shadows built-in ones
* sigils (e.g. for! {})

It is important to note that the **current** built-in ones can't be shadowed because they are ```reserved keywords```. So, you can't override ```for``` or ```if``` or ```while``` (which I think is working as intended), but you could override ones that are not reserved keywords (e.g. ```until```).

# Extensions

This can open a stream of future extensions that would enable further constructs to be added. Here are some that occurred to us while developing this.

These are listed here as extensions because I believe we don't corner ourselves by shipping without them (i.e. they can be sequenced independently).

## chaining

From @erights:

To enable something like ```if (arg1) { ... } else if (arg2) { ... } else { ... }``` you'd have to chain the various things together. @erights proposed something along the lines of making the chains be passed as parameters to the first function. So, that would transpile to something like ```if(arg1, function() { ... }, "else if", arg2, function { ... }, "else", function () { ... })```.

Another notable example may be to enable ```try { ... } catch (e) { ... } finally { ... }```

## functization

From @erights:

To enable control structures that repeat over the lambda (e.g. for-loops), we would need to re-execute the stop condition. Something along the lines of:

```repeat { ... } until ( expr )``` we would want to turn ```expr``` into a function that evaluates ```expr``` so that it could be re-evaluated multiple times. For example ```repeat { ... } until (() => expr)```.

TODO(goto): should we do that by default with all parameters?

## binding

From @bterlson:

There are a variety of cases where binding helps. Currently, we pass parameters back to the block via ```this```. For example, we would want to enable something like the following:

```foreach ({key, value} in map) { ... }``` to be given by the foreach function implementation.

```javascript
foreach ({key, value} in map) {
  // ...
}
// ... gets desugared to ...
foreach (map, function({key, value}) {
})
```
Another alternative syntax could be something along the lines of:

```javascript
foreach (map) { |key, value|
  // ...
}
```

## return

From @bterlson:

It would be great if we could make ```return``` to return from the lexically enclosing function.

Kotlin allows ```return``` from inlined functions, so maybe semantically there is a way out here.

One challenge with ```return``` is for block params that outlive the outer scope. For example:

```javascript
function foobar() {
  start (100) {
    // calls setTimeout(1, block) internally
    return 1;
  }
  return 2;
}
foobar() // returns 2
// after 100 ms
// block() returns 1. does that get ignored?
```

## continue, break

```Continue``` and ```break``` are interesting cases because they could have different interpretations. For example:

```javascript
for (let i = 0; i < 10; i++) {
  unless (i == 5) {
    // You'd expect the continue to apply to the
    // lexical for, not to the unless
    continue;
  }
}
```

Whereas:

```javascript
for (let i = 0; i < 10; i++) {
  foreach (array) {
    if (::item == 5) {
      // You'd expect the continue here to apply to
      // the foreach, not the lexical for.
      continue;
    }
  }
}
```

One interesting approach here is to make ```continue``` and ```break``` throw a special standard Exception (say, ContinueException and BreakException), which can then be re-thrown or not (and understood by the lexical blocks).

TODO(goto): check how kotlin is planning to include [continue/break](https://kotlinlang.org/docs/reference/inline-functions.html#non-local-returns).

NOTE(goto): would love to hear about alternatives here.

# Alternatives Considered

The DOM construction mechanisms depend on being able to hang things into a tree-like structure. So, one needs to find the reference of the parent context to hang to. Here are some of the ideas that were thrown before:

## Implicit

In this formulation, the expansion would implicitly include the ```this``` binding. So, ```a { ... }``` would be equivalent to ```a.call(function { ... })```.

```javascript
let html = div {
  span("hello world") {}
}
```
## ```this``` method resolution

In this formulation, the resolution of methods looks first for the presence in the ```this``` object for function calls before looking at the local scope and later at the global scope. e.g. ```a { b() }``` is equivalent to ```a(function() { (b in this ? this.b : b)() }).

For example:

```javascript
let html = div {
  // "span" would first be looked at 'this' before looking at the global scope
  span {
  }
}
```

This may be isomorphic to the equivalency ```a { b() }``` to ```a(function() { with (this) { b() } })```

## bind operator

In this formulation, the expansion would be simply ```a { ... }``` to ```a(function() { ... })``` and ```this``` would be passed via the [bind operator](https://github.com/tc39/proposal-bind-operator)

```javascript
let html = div {
  ::div {
    ::span {
      ::p("hello world")
    }
  }
}
```

## special character

In this formulation, we would pick a special syntax space to make the distinction between the ```this``` binding and regular function calls.

```javascript
let html = <div> {
  <div> {
    <span> {
      <p>("hello world")
    }
  }
}
```

# Prior Art

## TC39

* [block lambdas](https://web.archive.org/web/20161123223104/http://wiki.ecmascript.org/doku.php?id=strawman:block_lambda_revival) and [discussion](https://esdiscuss.org/topic/block-lambdas-break-and-continue)
* [javascript needs blocks](http://yehudakatz.com/2012/01/10/javascript-needs-blocks/) by @wycats

## SmallTalk

## Ruby

## Groovy

## Kotlin

```kotlin
fun main(args: Array<String>) {
    unless (false) {
      println("foo bar");
      "hello"  // "this expression is unused"
      "world" // "this expression is unused"
      1  // last expression statement is used as return value
        
      // "return is not allowed here"
      // return "hello"
      // 
      // "break and continue are only allowed inside a loop"
      // continue;
      // 
      // throwing is allowed.
      // throw IllegalArgumentException("hello world"); 
    };
    
    var foo = "hello";
    
    switch (foo) {
        case ("hello") {
            
        } 
        case ("world") {
            
        }
    }
}

fun unless(expr: Boolean, block: () -> Any) {
    if (!expr) {
      var bar = block();
      println("Got: ${bar}") 
    }
}

fun switch(expr: Any, block: Select.() -> Any) {
    var structure = Select(expr);
    structure.block();
}

fun case() {
    println("hi from global case");
}

class Select constructor (head: Any) {
    var result = null;
    fun case(expr: Any, block: () -> Any) {
        if (this.head == expr) {
          println("hi from case");
          result = block();
        }
    }
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