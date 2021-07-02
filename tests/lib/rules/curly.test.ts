/**
 * @fileoverview Ensure that curly braces keep the code flow easy to read
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import {RuleTester} from 'eslint';

import rule         from '../../../lib/rules/curly';

const ruleTester = new RuleTester();

ruleTester.run(`curly`, rule, {
  valid: [{
    code: `if (test)\n    test();\n`,
  }, {
    code: `for (var test in test)\n    test();\n`,
  }, {
    code: `if (test) {\n    test = {\n        test: test\n    };\n}\n`,
  }, {
    code: `if (test)\n    if(test)\n        test();\n`,
  }, {
    code: `function test() {\n    if (test) {\n        test();\n    }\n};\n`,
  }, {
    code: `function test() {\n    if (test) {\n        test();\n    } else {\n        test();\n    }\n};\n`,
  }, {
    code: `function test() {\n    if (test)\n        test();\n    else\n        test();\n    if (test) {\n        test();\n    }\n};\n`,
  }, {
    code: `function test() {\n    if (test) {\n        test();\n    } else if (test) {\n        test();\n    }\n};\n`,
    parserOptions: {ecmaVersion: 6},
  }, {
    code: `function test() {\n    if (test) {\n        test();\n    } else if (test) {\n        test();\n    } else if (test) {\n        test();\n    }\n};\n`,
    parserOptions: {ecmaVersion: 6},
  }, {
    code: `if (test)\n    test();\nelse for (;test;)\n    test();\n`,
  }, {
    code: `if (test)\n    test();\nelse for (var test in test)\n    test();\n`,
  }, {
    code: `if (test)\n    test();\nelse for (var test of test)\n    test();\n`,
    parserOptions: {ecmaVersion: 6},
  }],

  invalid: [{
    code: `for (var test in test) {\n    test();\n}\n`,
    errors: [{message: `Unnecessary { after 'for-in'.`}],
    output: `for (var test in test) \n    test();\n\n`,
  }, {
    code: `if (test)\n    test = {\n        test: test\n    };\n`,
    errors: [{message: `Expected { after 'if' condition.`}],
  }, {
    code: `if (test) {\n    doSomething();\n}\n`,
    errors: [{message: `Unnecessary { after 'if' condition.`}],
    output: `if (test) \n    doSomething();\n\n`,
  }, {
    code: `if (test)\n    if (test) {\n        test();\n    }\n`,
    errors: [{message: `Expected { after 'if' condition.`}, {message: `Unnecessary { after 'if' condition.`}],
    output: `if (test)\n    if (test) \n        test();\n    \n`,
  }, {
    code: `function test() {\n    if (test)\n        test();\n}\n`,
    errors: [{message: `Expected { after 'if' condition.`}],
  }, {
    code: `function test() {\n    if (test)\n        test();\n    else\n        test();\n}\n`,
    errors: [{message: `Expected { after 'if' condition.`}, {message: `Expected { after 'else'.`}],
  }, {
    code: `if (test) {\n    test();\n} else\n    for (var test in test)\n        test();\n`,
    errors: [{message: `Unnecessary { after 'if' condition.`}],
    output: `if (test) \n    test();\n else\n    for (var test in test)\n        test();\n`,
  }],
});
