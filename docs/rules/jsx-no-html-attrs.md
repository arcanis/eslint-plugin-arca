# Prevent the use of HTML attributes inside JSX components (jsx-no-html-attrs)

## Rule Details

Copy-pasting HTML code inside a React application typically require to update all attributes to match the React uppercased names (plus turn `class` into `className`), which can be difficult as they are not always statically analyzable (for instance, `srcset` must be specified as `srcSet`, which a simple camelcase function wouldn't detect). This rule updates them for you.

The following patterns are considered warnings:

```js
<img class="foo" srcset="bar"/>;
```

The following patterns are not warnings:

```js
<img className="foo" srcSet="bar"/>;
```
