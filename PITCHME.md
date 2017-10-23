# Block Params

---

### Example

#### The basics

+++

```javascript
// Blocks of code can be declared outside of parenthesis of
// function calls when the last parameter is a lambda.
//
// For example, this ...
a(1) {
  // ...
}

// ... is equivalent to ...
a(1, function() {
  // ...
});
```

@[1-7] (This is what you write ...)
@[9-12] (... and this is what you get.)

+++

```javascript
// Parenthesis can also be skipped.
//
// For example, this ...
a {
  // ...
}

// ... is equivalent to ...
a(function() {
  // ...
});
```

@[1-6] (This is what you write ...)
@[7-11] (... and this is what you get.)

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

@[1-12] (This is what you write ...)
@[13-28] (... and this is what you get.)


---

### Challenges

+++

###

```python
from time import localtime

activities = {8: 'Sleeping', 9: 'Commuting', 17: 'Working',
              18: 'Commuting', 20: 'Eating', 22: 'Resting' }

time_now = localtime()
hour = time_now.tm_hour

for activity_time in sorted(activities.keys()):
    if hour < activity_time:
        print activities[activity_time]
        break
else:
    print 'Unknown, AFK or sleeping!'
```

@[1](Python from..import statement)
@[3-4](Python dictionary initialization block)
@[6-7](Python working with time)
@[9-14](Python for..else statement)

---

### Naturally
### Code-Presenting
### works in exactly the same way on [Code-Delimiter Slides](https://github.com/gitpitch/gitpitch/wiki/Code-Delimiter-Slides) as it does on [Code-Blocks](https://github.com/gitpitch/gitpitch/wiki/Code-Slides).

---

### Code-Delimiter Slides

```
                  ---?code=path/to/source.file
```

#### The Basics

![Press Down Key](assets/down-arrow.png)

+++?code=src/python/time.py&lang=python

###### Code delimiters let you present any <p> **code file** with auto-syntax highlighting

---

### Code-Delimiter Slides
##### Using
#### **Code-Presenting**

![Press Down Key](assets/down-arrow.png)

+++?code=src/javascript/config.js&lang=javascript

@[1-3]
@[5-8]
@[10-16]
@[18-24]

###### Use code-presenting to **step-thru** code <p> from directly within your presentation 

---

### Code-Delimiter Slides
##### Using
#### Code-Presenting
#### **With Annotations**

![Press Down Key](assets/down-arrow.png)

+++?code=src/elixir/monitor.ex&lang=elixir

@[11-14](Elixir module-attributes as constants)
@[22-28](Elixir with-statement for conciseness)
@[171-177](Elixir case-statement pattern matching)
@[179-185](Elixir pipe-mechanism for composing functions)

---

### Learn By Example
#### View The [Presentation Markdown](https://github.com/gitpitch/code-presenting/blob/master/PITCHME.md)