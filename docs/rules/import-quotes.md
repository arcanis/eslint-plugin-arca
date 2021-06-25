# Enforce the use of single quotes for import statements (import-quotes)

## Rule Details

The default [`quotes` rule](https://eslint.org/docs/rules/quotes) allows to enforce backticks everywhere but, since backticks aren't allowed in import statements, simply ignore those (making it possible to use either simple or double quotes). This rule fixes that by enforcing the use of single quotes.

The following patterns are considered warnings:

```js
import foo from "foo";
```

The following patterns are not warnings:

```js
import foo from 'foo';
```

## When Not To Use It

You may want to disable this rule if you don't work with Maël.
