# require from keywords to be aligned (import-align)

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

## When Not To Use It

You may want to disable this rule if you don't work with Maël.

## Further Reading

If there are other links that describe the issue this rule addresses, please include them here in a bulleted list.
