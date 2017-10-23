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
buffer (buffer, function() {
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

---

### Code-Blocks
##### Using
#### Code-Presenting
#### **With Annotations**

![Press Down Key](assets/down-arrow.png)

+++

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