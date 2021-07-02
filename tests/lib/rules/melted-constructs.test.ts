/**
 * @fileoverview Enforce the use of melted constructs when possible
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

import {RuleTester} from 'eslint';

import rule         from '../../../lib/rules/melted-constructs';

const parserOptions = {ecmaVersion: 2015} as const;
const ruleTester = new RuleTester();

ruleTester.run(`melted-constructs`, rule, {
  valid: [{
    code: `if (test)\n    test();\nelse if (test)\n    test();\n`,
  }, {
    code: `if (test)\n    test();\nelse for (;test;)\n    test();\n`,
  }, {
    code: `if (test)\n    test();\nelse for (var test in test)\n    test();\n`,
  }, {
    code: `if (test)\n    test();\nelse for (var test of test)\n    test();\n`,
    parserOptions,
  }, {
    code: `if (test)\n    test();\nelse while (test)\n    test();`,
  }, {
    code: `if (test)\n    test();\n else do {\n    test();\n} while (test);\n`,
  }, {
    code: `if (test)\n    test();\n else switch (test) {\n    // nothing\n}\n`,
  }, {
    code: `if (test)\n    test();\n else try {\n    test();\n} catch (e) {\n    test();\n}\n`,
  }, {
    code: `if (test)\n    test();\n else with (test) {\n    test();\n}\n`,
  }, {
    code: `if (test)\n    test();\nelse if (test)\n    test();\nelse for (var test in test)\n    test();\n`,
  }, {
    code: `if (test) {\n    if (test) {\n        test();\n    }\n} else {\n    if (test) {\n        test();\n    }\n}\n`,
  }],
  invalid: [{
    code: `if (test)\n    test();\nelse\n    if (test)\n        test();\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'if' followup.`}],
  }, {
    code: `if (test)\n    test();\nelse\n    for (;test;) {\n        test();\n    }\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'for' followup.`}],
  }, {
    code: `if (test)\n    test();\nelse\n    for (var test in test)\n        test();\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'for-in' followup.`}],
  }, {
    code: `if (test)\n    test();\nelse\n    for (var test of test)\n        test();\n`,
    parserOptions: {ecmaVersion: 6},
    errors: [{message: `Expected 'else' construct to be melted with its 'for-of' followup.`}],
  }, {
    code: `if (test)\n    test();\nelse\n    switch (test) {\n        // nothing\n    }\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'switch' followup.`}],
  }, {
    code: `if (test)\n    test();\nelse\n    try {\n        test();\n    } catch (e) {\n        test();\n    }\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'try' followup.`}],
  }, {
    code: `if (test)\n    test();\nelse\n    while (test)\n        test();\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'while' followup.`}],
  }, {
    code: `if (test)\n    test();\nelse\n    do {\n        test();\n    } while (test);\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'do' followup.`}],
  }, {
    code: `if (test)\n    test();\nelse\n    with (test) {\n        test();\n    }\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'with' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    if (test)\n        test();\n}\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'if' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    for (;test;) {\n        test();\n    }\n}\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'for' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    for (var test in test)\n        test();\n}\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'for-in' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    for (var test of test)\n        test();\n}\n`,
    parserOptions,
    errors: [{message: `Expected 'else' construct to be melted with its 'for-of' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    switch (test) {\n        // nothing\n    }\n}\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'switch' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    try {\n        test();\n    } catch (e) {\n        test();\n    }\n}\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'try' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    while (test)\n        test();\n}\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'while' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    do {\n        test();\n    } while (test);\n}\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'do' followup.`}],
  }, {
    code: `if (test) {\n    test();\n} else {\n    with (test) {\n        test();\n    }\n}\n`,
    errors: [{message: `Expected 'else' construct to be melted with its 'with' followup.`}],
  }],
});
