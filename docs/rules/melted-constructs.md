# Force 'else' branchs to be melted with compatible constructps (melted-constructs)

## Rule Details

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
```

The same is true for `if`, `while`, `do`, `switch`, `try`, and `with`.

## When Not To Use It

You may want to disable this rule if you don't work with Maël.
