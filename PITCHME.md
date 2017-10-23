# Block Params

---

### Overview
### Use Cases
### Extensions
### Challenges

---

### Overview

+++

### Syntactic Sugar for function calls.

```javascript
// ... this is what you write ...
a {
  // ...
}

// ... this is what you get ...
a(function() {
  // ...
});
```

@[1-4] (This is what you write ...)
@[6-9] (... and this is what you get.)


+++

### Other parameters allowed ...

```javascript
// ... this is what you write ...
a(1, "hello") {
  // ...
}

// ... this is what you get ...
a(1, "hello", function() {
  // ...
});
```

@[1-4] (This is what you write ...)
@[6-9] (... and this is what you get.)

+++

### Inner block params get "this".

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
  this.b(function () {
    // ...
  })
});
```

@[1-8] (This is what you write ...)
@[10-15] (... and this is what you get.)

---

### Use Cases

+++

### unless

```javascript
// ... this is what you write ...
unless (expr) {
  // ... statements ...
}

// ... this is what you get ...
unless (expr, function() {
  // ... statements ...
})
```

@[1-4] (This is what you write ...)
@[6-9] (... and this is what you get.)

+++

### Userland defined structures ...

```javascript
function unless(expr, block) {
  if (!expr) {
    block();
  }
}

unless (expr, function() {
  // ... statements ...
})
```

+++

### lock

```javascript
// ... this is what you write ...
lock (buffer) {
  buffer.write();
}

// ... this is what you get ...
lock (buffer, function() {
  buffer.write();
})
```

+++

### assert

```javascript
// ... this is what you write ...
assert (document.cookie) {
  alert("Blargh, you are not signed in!");
}

// ... this is what you get ...
assert (document.cookie, function() {
  assert("Blargh, you are not signed in!");
})
```

+++

### defer

```javascript
defer (100) {
  // internally, calls setTimeout()
  stuff.cleanUp();
}
```

+++

### foreach

```javascript
foreach (array) {
  console.log(this.item);
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
@[16-22]

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
// ... this is what you write ...
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

+++

### bindings

```javascript
foreach ([1, 2, 3]) {
  // passing parameters to the block param is awkward ...
  // ... right now, using 'this'.
  console.log(this.item);
}
```

+++

```javascript
foreach ({key, value} in map) {
  // ...
}

// ... gets desugared to ...
foreach (map, function({key, value}) {
})
```

@[1-3](Syntax TBD)
@[5-7](Gets passed as a parameter)

---

### Challenges

+++

### forward compatibility

#### Do we corner ourselves?

```javascript
function match () {
}

match (cond) {
  // ...
}
```

@[4-6](Should we reserve match? Should userland shadow built-ins?)

+++

### return

```javascript
function even(number) {
  unless (number % 2 == 1) {
    // non local return?
    return true;
  }
  return false;
}
```

@[2-5](non local return?)

+++

### break and continues ...

```javascript
for (let i = 0; i < 10; i++) {
  unless (i == 5) {
    // You'd expect the continue to apply to the
    // lexical for, not to the unless
    continue;
  }
}
```

@[2-6](You'd expect continue to continue the for-loop)

+++

### ... but not always ...

```javascript
for (let i = 0; i < 10; i++) {
  foreach (array) {
    if (this.item == 5) {
      // You'd expect the continue here to apply to
      // the foreach, not the lexical for.
      continue;
    }
  }
}
```

@[2-8](Whereas inside foreaches you'd expect continue to continue the foreaech)

---

### Stage 1?