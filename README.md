# eslint-plugin-arca

> *The @arcanis personal collection of ESLint rules.*

[![](https://img.shields.io/npm/v/eslint-plugin-arca.svg)]() [![](https://img.shields.io/npm/l/eslint-plugin-arca.svg)]() [![](https://img.shields.io/badge/developed%20with-Yarn%202-blue)](https://github.com/yarnpkg/berry)

I tend to have strong personal preferences about what readable code should look like, and they don't always match how the Prettier rules would work. This repo contains some ESLint rules that help enforce my style at no cost for other contributors, as they are all intended to be autofixable.

Most of these rules are available as a preset via [`@yarnpkg/eslint-config`](https://github.com/yarnpkg/berry/tree/master/packages/eslint-config).

## Installation

Assuming you have [ESLint](http://eslint.org) installed, just install `eslint-plugin-arca`:

```
yarn add -D eslint-plugin-arca
```

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
    "arca/import-absolutes": 2,
    "arca/import-align": 2,
    "arca/import-ordering": 2,
    "arca/jsx-longhand-props": 2,
    "arca/melted-constructs": 2,
    "arca/newline-after-import-section": 2,
    "arca/no-default-export": 2
  }
}
```

## Supported Rules

Note: all these rules are autofixed. This is why some may look duplicate with others that aren't (for instance `arca/jsx-import-react` is autofixable, but `react/react-in-jsx-scope` [isn't](https://github.com/yannickcr/eslint-plugin-react/issues/2093)).

* [`arca/curly`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/curly.md) - ensure that curly braces keep the code flow easy to read
* [`arca/import-absolutes`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/import-absolutes.md) - ensure that imports are always package-absolute
* [`arca/import-align`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/import-align.md) - require `from` keywords to be aligned
* [`arca/import-ordering`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/import-ordering.md) - ensure that each import in the file is correctly ordered relative to the others
* [`arca/jsx-import-react`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/jsx-import-react.md) - require JSX files to import `React`
* [`arca/jsx-longhand-props`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/jsx-longhand-props.md) - require JSX props to be passed using the longhand syntax
* [`arca/jsx-no-html-attrs`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/jsx-no-html-attrs.md) - autofix HTML attribute names into their React props
* [`arca/jsx-no-string-styles`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/jsx-no-string-styles.md) - autofix string `styles` props into objects
* [`arca/melted-constructs`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/melted-constructs.md) - enforce the use of melted constructs when possible
* [`arca/newline-after-import-section`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/newline-after-var.md) - require an empty newline after an import section
* [`arca/no-default-export`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/no-default-export.md) - disallow default exports

## License

> **Copyright © 2016 Maël Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
