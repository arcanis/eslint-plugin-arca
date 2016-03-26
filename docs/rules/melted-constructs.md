# Force 'else' branchs to be melted with compatible constructs (melted-constructs)

## Rule Details

The "compatible constructs" are `if`, `while`, `do`, `switch`, `try`, and `with`.

Not melting the `else` branch is allowed if the last statement of the `if` branch is also a compatible construct (in such a case, it is assumed that you may want your code to look similar).

The following patterns are considered warnings:

```js
if (!Array.isArray(result)) {
    // do something
} else {
    for (var item of results) {
        // do something else
    }
}
```

The following patterns are not warnings:

```js
if (!Array.isArray(results)) {
    // do something
} else for (var item of results) {
    // do something else
}

if (test) {
    if (anotherTest) {
        // do something
    }
} else {
    if (yetAnotherTest) {
        // do something else
    }
}

if (test) {
    if (anotherTest) {
        // do something
    }
} else if (yetAnotherTest) {
    // do something else
}
```

## When Not To Use It

You may want to disable this rule if you don't work with Maël.
