# Disallow default exports (no-default-export)

## Rule Details

As the title hints, this rule prevents you from using default exports.

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
