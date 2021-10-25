# Mandate that imports are absolute to their package (import-absolutes)

## Rule Details

Yarn 2 supports self-reference, making it possible for your local package to reference itself by using its own name in its imports, like it would for any other dependency. The default behaviour of this rule leverages that to always use absolute imports rather than relative. It also properly supports workspaces.

The following patterns are considered warnings:

```js
import foo from "./test";
```

The following patterns are not warnings:

```js
import foo from 'pkg/test';
```


## Options

### `preferRelative`

A regex pattern specifying which import paths should be kept or made relative.

The following patterns are not considered warning when `preferRelative` is set to `^\\.\\/[^\\/]*$`:

```js
import foo from './foo';
import hello from './hello';
```

If an absolute import comes from the current package and the relative path to its target matches `preferRelative`, this rule will produce a warning.

Inside a package named `pkg`, and when `preferRelative` is set to `^\\.\\/[^\\/]*$`, the following patterns are considered errors:

```js
// importing from a file located in 'pkg/bar'
import foo from 'pkg/bar/foo';
```

### `replaceAbsolutePathStart`

An array of objects specifying alternatives for absolute paths starts. When
specified, and the rule finds that an absolute import should be used, each
element of the array is used until a matching one is found (if any).

Each element of the array must be an object with two properties:

- `from` is what the absolute import should start with for it to match,
- `to` is what to replace `from` with in the absolute import.

The behaviour is undefined unless `from` and `to` are absolute import paths.

The following patterns are considered warnings when `replaceAbsolutePathStart` is set to `[{ from: 'foo/bar', to: 'fff' }]`:

```js
import baz from 'foo/bar/baz';
```
