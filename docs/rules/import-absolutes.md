# Mandate that imports are absolute to their package (import-absolutes)

## Rule Details

Yarn 2 supports self-reference, making it possible for your local package to reference itself by using its own name in its imports, like it would for any other dependency. This rule leverages that to always use absolute imports rather than relative. It also properly supports workspaces.

The following patterns are considered warnings:

```js
import foo from "./test";
```

The following patterns are not warnings:

```js
import foo from 'pkg/test';
```

## When Not To Use It

You may want to disable this rule if you don't work with Maël.
