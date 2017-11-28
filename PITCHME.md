# Block Params

---

### Overview
### Example
### Use Cases
### Extensions
### Areas of Investigation
##### (return, break, continue, scoping, completion)

---

### Overview

+++

### Syntactic simplification on calls.

```javascript
// ... this is what you write ...
a() {
  // ...
}

// ... this is what you get ...
a(function() {
  // ...
});

// ... this is how you use it ...
function a(b) {
  b();
}
```

@[1-4] (Allowing passing a function block as a parameter ...)
@[6-9] (... outside of parentheses.)
@[11-14] (userland responsible for defining a)

+++

### Parameters before the block allowed ...

```javascript
// this is what you write ...
a(1) {
  // ...
}

// ... this is what you get ...
a(1, function() {
  // ...
})
```

+++

### For example

```javascript
// ... this is what you write ...
unless (document.cookie) {
  alert("blargh!")
}

// ... this is what you get ...
unless (document.cookie, function() {
  alert("blargh!")
});

// ... this is what userland defines ...
function unless(expr, block) {
  if (!expr) {
    block();
  }
}
```

@[1-4] (This is what you write ...)
@[6-9] (... and this is what you get.)
@[11-16] (... userland control structure)

+++

### Binding arguments ...

```javascript
// The following ...
a(1) do (b) { // NOTE(goto): syntax TBD.
  // ...
}

// ... is equivalent to this ...
a(1, function(b) {
  // ...
})
```

+++

### For example ...

```javascript
// ... this is what you write ...
foreach ([1, 2, 3]) do (item) {
  console.log(item);
}

// ... this is what you get ...
foreach ([1, 2, 3], function(item) {
  console.log(item)
});

// ... this is what userland defines ...
function foreach(iterable, block) {
  for (let item of iterable) {
    block(item);
  }
}
```

@[1-4] (This is what you write ...)
@[6-9] (... and this is what you get.)
@[11-16]

+++

### Nesting block params ...

```javascript
// ... this is what you write ...
a {
  // ...
  b {
    // ...
  }
  // ...
}

// ... is equivalent to ...
a(function() {
  b.call(this, function () {
    // ...
  })
});
```

@[1-8] (If b wants to make it self connected to a ...)
@[10-15] (... it can set a contextual "this" to communicate.)

+++

### For example

```javascript
// This ...
select (expr) {
  when (cond1) {
  }
  when (cond2) {
  }
}

// ... is equivalent to ...
select (expr, function() {
  when.call (this, cond1, function() {
  })
  when.call (this, cond2, function() {
  })
})
```

+++

### Omitting parentheses altogether allowed ...

```javascript
// ... this is what you write ...
foo {
  // ...
}

// ... this is what you get ...
foo(function() {
  // ...
});
```

@[1-4] (This is what you write ...)
@[6-9] (... and this is what you get.)

+++

### For example

```javascript
let dom = html {
  head {
    title("welcome!")
  }
  body {
    div {
      span {
        a {
          span("hello world")
        }
      }
    }
  }
}

let dom = html(function() {
  head.call(this, function() {
    title("welcome!")
  })
  body.call(this, function() {
    div.call(this, function() {
      span.call(this, function() {
        a.call(function() {
          span("hello world")
        })
      })
    })
  })
})
```

@[1-14]
@[16-29]

---

### Use Cases

+++

### lock

```javascript
// ... this is what you write ...
import {lock} from "polyfill.js"

lock (resource) {
  console.log(resource[0]);
}
```

+++

### unless

```javascript
// ... this is what you write ...
unless (expr) {
  // ... statements ...
}
```

+++

### run

```javascript
run () {
  // internally, calls setTimeout()
  // or maybe tasklet's new Worker() ?
  expensiveWork();
}
```

+++

### foreach

```javascript
foreach (array) do (item) {
  console.log(item);
}
```

+++

### select

```javascript
select (expr) {
  when (foo) { 1 }
  when (bar) { 2 }
  when (hello) { 3 }
  when (world) { 3 }
}
```

+++

### using

```javascript
using (stream) {
  // .. closes stream automatically ...
}
```

+++

### maps

```javascript
let a = map {
  put("hello", "world") {}
  put("foo", "bar") {}
}
```

+++

### layout

```javascript
let dom = html {
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

+++

### node

```javascript
const express = require("express");
const app = express();

server (app) {
  get("/") {
     this.response.send(
       "hello world" + this.request.get("param1"));
  }

  listen(3000) {
    console.log("hello world");
  }
}
```

+++

### makefiles

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

+++

### regexes

```javascript
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

+++

### testing

```javascript
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

+++

### JSX

```javascript
// ... instead of this ...
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

// ... you could write this ...
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

@[1-11] (Instead of a ternary operator ...)
@[12-28] (... a select 'statement'.)

+++

### templates

```javascript
// ... instead of this ...
let html = `<div>`;
for (let product of ["apple", "oranges"]) {
  html += `<span>${product}</span>`;
}
html += `</div>`;

// ... or this ...
let html = `
  <div>
  ${["apple", "oranges"].forEach(
      product => `<span>${product}</span>`)}
  </div>
`;

// ... you could write this ...
let html = `
  <div>
  ${foreach (["apple", "orange"]) {
    `<span>${this.item}</span>`
  }}
  </div>
`;
```

@[1-6]
@[8-14]
@[16-23]

---

### Extensions

+++

### Chaining

```javascript
// ... this is what you write ...
if (arg1) {
  ...
} else if (arg2) {
  ...
} else {
  ...
}

// ... this is what you get ...
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

@[1-8]
@[10-19]

+++

### functization

```javascript
// What if we wanted to re-evaluate the arguments?
let i = 0;
until (i == 10) {
  ...
  i++
}

// ... this is what you get ...
let i = 0;
until (() => i == 10, function() {
  ...
  i++
})
```

@[1-6]
@[8-13]

---

### Areas of Investigation

+++

### forward compatibility

#### Do we corner ourselves?

```javascript
// Do we corner ourselves syntactically?
// If this lands, and someone defines this ...
function match () {
}

// ... does it prevent us from shipping this?
match (cond) {
  // ...
}
```

+++

### Completion values

```javascript
// What if we wanted to filter a list?
let evens = foreach ([1, 2, 3, 4]) do (number) {
  if (number % 2 == 0) {
    // NOTE(goto): gets returned to foreach as a
    // completion value?
    number
  }
  // returns undefined to foreach?

  // isomorphic problem in do-expressions?
}
```

+++

### Scoping and Nesting

```javascript
// Are there better ways to make when aware of select?
// Other than passing 'this' around? Maybe @@this?
select (foo) {
  // How does 'when' get resolved? can select insist on
  // a specific implementation of when?
  when (bar) {
  }
}
```

+++

### return

```javascript
function even(number) {
  unless (number % 2 == 1) {
    // Should this return to unless or to even?    
    return true;
  }
  return false;
}
```

@[2-5](non local return?)

+++

### return

```javascript
function dostuff() {
  run (100) {
    // What happens if this completes after the
    // function completed? 
    return "hello world";
  }
  return false;
}
```

@[2-6](escape continuations?)

+++

### break and continue ...

```javascript
for (let i = 0; i < 10; i++) {
  unless (i == 5) {
    // Should this continue the for? or be disallowed?
    continue;
  }
}
```

@[2-6](You'd expect continue to continue the for-loop?)

+++

### ... but not always ...

```javascript
for (let i = 0; i < 10; i++) {
  foreach (array) do (item) {
    if (item == 5) {
      // Should this continue the for? or the foreach?
      continue;
    }
  }
}
```

@[2-7](Whereas inside foreaches you'd expect continue to continue the foreach)

---

### Stage 1?