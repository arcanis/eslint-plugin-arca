# Require JSX syntax to import React (jsx-import-react)

## Rule Details

Old-style JSX transforms turned JSX into calls to `React.createElement` and, as a result, any file using JSX had to import `React` into the scope. While the new transform doesn't require this anymore (it automatically injects the right import into the scope), it can still be useful to follow this rule in some fringe cases (for example, Esbuild doesn't implement the new transform at this time).

The following patterns are considered warnings:

```js
const node = <div/>;
```

The following patterns are not warnings:

```js
import * as React from 'react';

const node = <div/>;
```
