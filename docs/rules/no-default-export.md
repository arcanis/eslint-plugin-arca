# Disallow default exports (no-default-export)


## Rule Details

The following patterns are considered warnings:

```js
export default function () {
}
```

The following patterns are not warnings:

```js
export function foo() {
}
```

## When Not To Use It

You may want to disable this rule if you don't work with Maël.
