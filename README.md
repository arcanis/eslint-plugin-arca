# eslint-plugin-arca

> *A plugin to make Maël happy.*

I usually have strong preferences about what a pretty code should look like. This repo contains some ESLint rules that help enforce this style.

Note that some people might say that I might be a bit too strict on some things, and they might be right.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-arca`:

```
$ npm install eslint-plugin-arca --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-arca` globally.

## Usage

Add `arca` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "arca"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "arca/curly": 2,
        "arca/import-align": 2,
        "arca/import-ordering": 2,
        "arca/melted-constructs": 2,
        "arca/newline-after-import-section": 2,
        "arca/no-default-export": 2
    }
}
```

## Supported Rules

* [`arca/curly`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/curly.md) - ensure that curly braces keep the code flow easy to read
* [`arca/import-align`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/import-align.md) - require `from` keywords to be aligned
* [`arca/import-ordering`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/import-ordering.md) - ensure that each import in the file is correctly ordered relative to the others
* [`arca/melted-constructs`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/melted-constructs.md) - enforce the use of melted constructs when possible
* [`arca/newline-after-import-section`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/newline-after-var.md) - require an empty newline after an import section
* [`arca/no-default-export`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/no-default-export.md) - disallow default exports

## Options for import-align rule

The import-align rule has support for some additional options:

- `collapseExtraSpace` (Boolean, default: false) - If true, removes any unneeded extra space, collapsing lines to the minimum needed. Useful for correcting alignment after removing a long import.
- `minColumnWidth` (Number, default: 0) - Ensures that the right half of each import doesn't start before the desired minimum column width. If the longest import exceeds this value, the minimum column width will be ignored and the longer value will be used for alignment.

To use these options:

```json
{
    "rules": {
        "arca/import-align": [2, {
            collapseExtraSpace: true,
            minColumnWidth: 20
        }]
    }
}
```

## License

> **Copyright © 2016 Maël Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
