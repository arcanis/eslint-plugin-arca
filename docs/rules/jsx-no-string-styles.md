# Prevent the use of string styles inside JSX components (jsx-no-string-styles)

## Rule Details

Copy-pasting HTML code inside a React application typically require to migrate the `style` properties from literal strings into valid React objects. This can be a frustrating task, so this rule does it for you (note that it prints those objects quite crudely using `JSON.stringify`; you may want to use additional rules to remove unnecessary key quotes, add spaces, etc).

The following patterns are considered warnings:

```js
<div style="font-family: Consolas; font-size: 12px"/>;
```

The following patterns are not warnings:

```js
<div style={{fontFamily: "Consolas", fontSize: 12}}/>;
```
