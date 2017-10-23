# Block Params

---

### Example

#### The basics

+++

```javascript
// This ...
a(1) {
  // ...
}

// ... is equivalent to ...
a(1, function() {
  // ...
});
```

@[1-4] (You write this ...)
@[5-8] (... and it is equivalent to this.)

###### Blocks of code can be declared outside of parenthesis of function calls when the last parameter is a lambda.

+++

```javascript
// This ...
a {
  // ...
}

// ... is equivalent to ...
a(function() {
  // ...
});
```

@[1-4] (You write this ...)
@[5-8] (... and it is equivalent to this.)

###### Parenthesis can also be skipped.

---

### Code-Blocks
##### Using
#### **Code-Presenting**

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

@[1]
@[3-4]
@[6-7]
@[9-14]

###### Use code-presenting to **step-thru** code <p> from directly within your presentation 


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