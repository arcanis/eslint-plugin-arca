# Ensure that each import in the file is correctly ordered relative to the others (import-ordering)

## Rule Details

* First, the side-effects imports go before any other import
* Then the modules have to be sorted by section (vendors, common, application)
* Then they have to be sorted by path (a subdirectory goes before its index)
* Then they have to be sorted by lexicographic order

The following patterns are considered warnings:

```js
import foo from 'foo/foo';
import bar from 'foo/bar';
```

```js
import foo from 'common/foo';
import foo from 'foo';
```

```js
import foo from 'app/foo';
import foo from 'common/foo';
```

```js
import foo from 'common/foo';
import 'foo.less';
```

The following patterns are not warnings:

```js
import 'foo.less';

import bar from 'bar/bar';
import bar from 'bar';
import foo from 'foo';

import bar from 'common/bar/bar';
import bar from 'common/bar';
import foo from 'common/foo/foo';
import foo from 'common/foo';

import bar from 'app/bar/bar';
import bar from 'app/bar';
import foo from 'app/foo/foo';
import foo from 'app/foo';
```

### Option

An array of the sections patterns. Defaults to `["^common/", "^app/"]`.

Any module that doesn't match one of these regexps will be regarded as a vendor.

## When Not To Use It

You may want to disable this rule if you don't work with Maël.

## Further Reading

* [`arca/newline-after-import-section`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/newline-after-var.md) - require an empty newline after an import section
