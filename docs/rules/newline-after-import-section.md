# Require an empty newline after an import section (newline-after-import-section)

## Rule Details

Complement of [`arca/import-ordering`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/import-ordering.md), this rule also makes sections more readable by adding extra lines between each.

The following patterns are considered warnings:

```js
import bar from 'bar';
import foo from 'foo';
import bar from 'common/bar';
import foo from 'common/foo';
import bar from 'app/bar';
import foo from 'app/foo';
```

The following patterns are not warnings:

```js
import bar from 'bar';
import foo from 'foo';

import bar from 'common/bar';
import foo from 'common/foo';

import bar from 'app/bar';
import foo from 'app/foo';
```

### Options

An array of the sections patterns. Defaults to `["^common/", "^app/"]`.

Any module that doesn't match one of these regexps will be regarded as a vendor.

## Further Reading

* [`arca/import-ordering`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/import-ordering.md) - ensure that each import in the file is correctly ordered relative to the others
