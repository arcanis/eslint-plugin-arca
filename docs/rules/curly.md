# Define when should curly braces be used (curly)

## Rule Details

The rule of thumb is that curly braces should only be used in three cases:

  - To pack multiple statements together
  - To avoid jumping multiple indentation levels at once
  - To keep consistency (if an `if` needs braces, its `else` counterpart needs it too, and vice versa)

Note that this rule doesn't implement the regular options from the core `eslint` package. Use it or not, there is no middle ground.

The following patterns are considered warnings:

```js
for (let test of test) {
    test();
}

if (test)
    test = {
        test: test
    };

if (test)
    if (test) {
        test();
    }

if (test) {
    test();
}

if (test) {
    test();
} else for (var test in test) {
    test();
}

var test = function () {

    if (test)
        test();

};

var test = function () {

    if (test)
        test();
    else if (test)
        test();

};

var test = function () {

    if (test)
        test();
    else (test)
        test();

    if (test) {
        test();
    }

};

if (test) {
    test();
} else
    for (let test of tests)
        test();
```

The following patterns are not warnings:

```js
for (let test of tests)
    test();

if (test) {
    test = {
        test: test
    };
}

if (test)
    if (test)
        test();

if (test)
    test();

if (test)
    test();
else for (var test in test)
    test();

var test = function () {

    if (test) {
        test();
    }

};

let test = function () {

    if (test) {
        test();
    } else if (test) {
        test();
    }

};

let test = function () {

    if (test)
        test();
    else
        test();

    if (test) {
        test();
    }

};
```

## When Not To Use It

You may want to disable this rule if you don't work with Maël.
