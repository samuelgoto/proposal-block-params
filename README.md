Early feedback from @adamk, @domenic, @slightlyoff, @erights, @waldemarhowart, @bterlson and @rwaldron (click [here](https://github.com/samuelgoto/proposal-block-params/issues/new) to send feedback).

Block Params
=========

This is a very early [stage 0](https://tc39.github.io/process-document/) exploration of a syntactical simplication (heavily inspired by [Kotlin](https://kotlinlang.org/docs/reference/type-safe-builders.html), [Ruby](#ruby) and [Groovy](http://docs.groovy-lang.org/docs/latest/html/documentation/core-domain-specific-languages.html)) that enables domain specific languages to be developed in userland.

It is a syntactic simplification that allows, on function calls, to omit parantheses around the ***last***  parameter when that's a lambda.

For example:

```javascript
a("hello") {
  ...
}
```

Is equivalent to this:

```javascript
a("hello", function() {
  ...
})
```

Functions that take just a single block parameter can also be called parentheses-less:

```javascript
a {
  ...
}
```

Is equivalent to this:

```javascript
a(function() {
  ...
})
```

Block params that are lexically nested in block params get a reference to this:

```javascript
a {
  ...
  b {
    ...
  }
  ...
}
```

Is equivalent to this:

```javascript
// ... is equivalent to ...
a(function() {
  ...
  b.call(this, function() {
    ...
  })
  ...
});
```

To preserve Tennent's Corresponde Principle, we are exploring which  [restrictions apply](#tennents-correspondence-principle) inside the block param.

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

This is early, so there are still a lot of [areas to explore](#areas-of-exploration) (e.g. [```continue``` and ```break```](#continue-break), [return](#return), [bindings](#bindings) and [```this```](https://github.com/samuelgoto/proposal-block-params/issues/9)) as well as strategic problems to overcome (e.g. [forward compatibility](#forward-compatibility)) and things to check feasibility (e.g. [completion values](#completion-values)).

There is a [polyfill](#polyfill), but I wouldn't say it is a great one quite yet :)

It is probably constructive to start reading from the [prior art](#prior-art) section.

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
defer (100) {
  // internally calls setTimeout(100)
  alert("hello world");
}
```


### [C#'s foreach](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/foreach-in)

```javascript
// works on arrays, maps and streams
foreach (array) {
  console.log(this.item);
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
  put("hello", "world") {}
  put("foo", "bar") {}
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

# Tennent's Correspondence Principle

To preserve tennent's correspondence principle as much as possible, here are some considerations as we decide what can go into block params:

* ```return``` statements inside the block should either throw ```SyntaxError```  (e.g. kotlin) or jump to a [non-local return](#return) (e.g. kotlin's inline functions [non-local returns](https://kotlinlang.org/docs/reference/inline-functions.html#non-local-returns))
* ```break```, ```continue```  should either throw ```SyntaxError``` or control the [lexical flow](#continue-break)
* ```yield``` can't be used as top level statements (same strategy as ```() => { ... }```)
* ```throw``` works (e.g. can be re-thrown from function that takes the block param)
* the [completion values](#completion-value) are used to return values from the block param (strategy borrowed from [kotlin](#kotlin))
* as opposed to arrow functions, ```this``` can be bound.

## Completion Values

Like Kotlin, it is possible to return values from the block params to the original function calling it. We aren't entirely sure yet what this looks like, but it will most probably borrow the same semantics we end up using in [do expressions](https://github.com/tc39/proposal-do-expressions) and other [statement-like expressions](https://github.com/rbuckton/proposal-statements-as-expressions#compound-statements).

```javascript
let result = foreach (numbers) do (number) {
  number * 2 // gets returned to foreach
}
``` 

# Forward Compatibility

If we bake this in, do we corner ourselves from ever exposing new control structures (e.g. unless () {})?

That's a good question, and we are still evaluating what the answer should be. Here are a few ideas that have been thrown around:

* user defined form shadows built-in ones
* sigils (e.g. for! {})

In this formulation, we are leaning towards the former.

It is important to note that the **current** built-in ones can't be shadowed because they are ```reserved keywords```. So, you can't override ```for``` or ```if``` or ```while``` (which I think is working as intended), but you could override ones that are not reserved keywords (e.g. ```until``` or ```match```).

# Extensions

This can open a stream of future extensions that would enable further constructs to be added. Here are some that occurred to us while developing this.

These are listed here as extensions because I believe we don't corner ourselves by shipping without them (i.e. they can be sequenced independently).

## chaining

From @erights:

To enable something like
```javascript 
if (arg1) {
  ...
} else if (arg2) {
  ...
} else {
  ...
}
```

You'd have to chain the various things together. @erights proposed something along the lines of making the chains be passed as parameters to the first function. So, that would transpile to something like

```javascript 
if (arg1, function() {
  ...
},
"else if", arg2, function {
  ...
},
"else", function () {
  ...
})
```

Another notable example may be to enable ```try { ... } catch (e) { ... } finally { ... }```

## functization

From @erights:

To enable control structures that repeat over the lambda (e.g. for-loops), we would need to re-execute the stop condition. Something along the lines of:

```javascript
let i = 0;
until (i == 10) {
  ...
  i++
}
```

We would want to turn ```expr``` into a function that evaluates ```expr``` so that it could be re-evaluated multiple times. For example

```javascript
let i = 0;
until (() => i == 10, function() {
  ...
  i++
})
```

TODO(goto): should we do that by default with all parameters?

## bindings

From @bterlson:

There are a variety of cases where binding helps. For example, we would want to enable something like the following:

```foreach (map) do (key, value) { ... }``` to be given by the foreach function implementation.

```javascript
foreach (map) do (key, value) {
  // ...
}
```

To be equivalent to:

```javascript
// ... is equivalent to ...
foreach (map, function(key, value) {
})
```

Exactly which keyword we pick (e.g. ```in``` or ```with``` or ```:``` etc) and its position (e.g. ```foreach (item in array)``` or ```foreach (array with item)```) TBD.

Another alternative syntax could be something along the lines of:

```javascript
foreach (map) { |key, value|
  // ...
}
```

Or

```javascript
foreach (let {key, value} in map) {
  // ...
}
```

We probably need to do a better job at exploring the design space of use cases before debating syntax, hence leaving this as a future extension.

# Areas of Exploration

These are some areas that we are still exploring.

## scoping

There are certain block params that go together and they need to be somehow aware of each other. For example, ```select``` and ```when```:

```javascript
select (foo) {
  when (bar) {
    ...
  }
}
```

How does ```when``` get resolved?

The global scope? If so, how does it connect with ```select``` to test ```bar``` with ```foo```?

From ```select```? If so, [how does it avoid using the ```this``` reference](https://github.com/samuelgoto/proposal-block-params/issues/16) and have [```with```-like performance implications](https://github.com/samuelgoto/proposal-block-params/issues/13)? perhaps [@@this](https://github.com/samuelgoto/proposal-block-params/issues/20)?

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
Note that Java throws a [```TransferException```](http://tronicek.blogspot.com/2008/08/nonlocal-transfer.html) when that happens. SmallTalk allows that too, so the intuition is that this is solvable.

## continue, break

```continue``` and ```break``` are interesting because their interpretation can be defined by the user. For example:

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
  foreach (array) do (item) {
    if (item == 5) {
      // You'd expect the continue here to apply to
      // the foreach, not the lexical for.
      continue;
    }
  }
}
```

It is still unclear if this can be left as an extension without cornering ourselves.

We are exploring other alternatives [here](https://github.com/samuelgoto/proposal-block-params/issues/8).


# Polyfill

  This is currently polyfilled as a transpiler. You can find a lot of examples [here](test/runtime.js).

  `npm install -g @docscript/docscript`

# Tests

  `npm test`

# Status

  You really don't want to use this right now. Very early prototype.

# Prior Art

The following is a list of previous discussions at TC39 and related support in other languages.

## TC39

* [block lambdas](https://web.archive.org/web/20161123223104/http://wiki.ecmascript.org/doku.php?id=strawman:block_lambda_revival) and [discussion](https://esdiscuss.org/topic/block-lambdas-break-and-continue)
* [Allen's considerations on break and continue](http://wirfs-brock.com/allen/files/jshistory/continue-break-lambda.pdf)
* [javascript needs blocks](http://yehudakatz.com/2012/01/10/javascript-needs-blocks/) by @wycats

## SmallTalk

## Ruby

```ruby
def iffy(condition) 
  if (condition) then
    yield()
  end
end 

iffy (true) {
  puts "This gets executed!"
}
iffy (false) {
  puts "This does not"
}
for i in 0..1 
  puts "Running: #{i}"
  iffy (i == 0) {
    # This does not break from the outer loop!
    # Prints
    #
    # Running: 0 
    # Running: 1
    break
  }
end


for i in 0..1 
  iffy (i == 0) {
    # This does not continue from the outer loop!
    # Prints
    #
    # Running: 0 
    # Running: 1
    next
  }
  puts "Running: #{i}"
end

def foo() 
  iffy (false) {
    return "never executed"
  }
  iffy (true) {
    return "executed!"
  }
  return "blargh, never got here!"
end

# Prints "executed!"
foo()
```

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

## [Java](http://www.javac.info/closures-v05.html)

```java
 for eachEntry(String name, Integer value : map) {
  if ("end".equals(name)) break;
  if (name.startsWith("com.sun.")) continue;
  System.out.println(name + ":" + value);
 }
```

## Related Work

* [user defined loops](http://gafter.blogspot.com/2006/10/iterative-control-abstraction-user.html)
* [non-local transfers](http://tronicek.blogspot.com/2008/08/nonlocal-transfer.html)