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
        "arca/melted-constructs": 2
    }
}
```

## Supported Rules

* [`arca/curly`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/curly.md) - Ensures that the curly braces keep the flow easy to read
* [`arca/melted-constructs`](https://github.com/arcanis/eslint-plugin-arca/blob/master/docs/rules/melted-constructs.md) - Enforces the use of melted constructs when possible

## License

> **Copyright © 2016 Maël Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
