# Require `from` keywords to be aligned (import-align)

## Rule Details

Note that this rule doesn't affect multiline imports.

The following patterns are considered warnings:

```js
import foo from 'foo';
import supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';
```

The following patterns are not warnings:

```js
import foo                                from 'foo';
import supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';

import {
    SOME_KEY,
    SOME_OTHER_KEY
} from 'config';
```

## Options

### `collapseExtraSpaces`

If true, the imports won't be allowed to have any amount of spaces between the symbol list and the `from` keyword except for the minimum required to make this rule pass.

The following patterns are considered warnings when `collapseExtraSpaces` is on:

```js
import foo       from 'foo';
import hello     from 'hello';
```

The following patterns are not warnings:

```js
import foo   from 'foo';
import hello from 'hello';
```

## When Not To Use It

You may want to disable this rule if you don't work with Maël.
