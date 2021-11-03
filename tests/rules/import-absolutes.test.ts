/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import rule         from 'eslint-plugin-arca/sources/rules/import-absolutes';
import {RuleTester} from 'eslint';

const parserOptions = {sourceType: `module`, ecmaVersion: 2015} as const;
const ruleTester = new RuleTester();

ruleTester.run(`import-absolutes`, rule, {
  valid: [{
    code: `import 'foo';\nimport bar1 from 'bar/bar';\nimport bar2 from 'bar';\nimport foo1 from 'foo/foo';\nimport foo2 from 'foo';\n\nimport bar3 from 'common/bar';\nimport foo3 from 'common/foo';\n\nimport bar4 from 'app/bar/bar';\nimport foo4 from 'app/bar/foo';\nimport bar5 from 'app/foo/bar';\nimport foo5 from 'app/foo/foo';\n`,
    parserOptions,
  }, {
    // When the path is the same, keep user's order
    code: `import {bar1} from 'bar';\nimport {bar2} from 'bar';\nimport baz from 'baz';\nimport {foo2} from 'foo';\nimport {foo1} from 'foo';`,
    parserOptions,
  }, {
    code: `import './foo';\n`,
    parserOptions,
    options: [{preferRelative: `^\\.\\/[^\\/]*$`}],
  }, {
    code: `import './';\n`,
    parserOptions,
    options: [{preferRelative: `^\\.\\/[^\\/]*$`}],
  }, {
    code: `import 'eslint-plugin-arca-actually-another-package/foo';`,
    parserOptions,
  }, {
    code: `import 'eslint-plugin-arca';`,
    parserOptions,
  }],
  invalid: [{
    code: `import './';\n`,
    output: `import 'eslint-plugin-arca/tests/rules';\n`,
    filename: __filename,
    parserOptions,
    errors: [{message: `Expected relative import to be package-absolute (rather than './').`}],
  }, {
    code: `import './foo';\n`,
    output: `import 'eslint-plugin-arca/tests/rules/foo';\n`,
    filename: __filename,
    parserOptions,
    errors: [{message: `Expected relative import to be package-absolute (rather than './foo').`}],
  }, {
    code: `import '../foo';\n`,
    output: `import 'eslint-plugin-arca/tests/foo';\n`,
    filename: __filename,
    parserOptions,
    errors: [{message: `Expected relative import to be package-absolute (rather than '../foo').`}],
    options: [{preferRelative: `^\\.\\/[^\\/]*$`}],
  }, {
    code: `import './/foo';\n`,
    output: `import './foo';\n`,
    filename: __filename,
    parserOptions,
    errors: [{message: `Expected relative import to be normalized (rather than './/foo').`}],
    options: [{preferRelative: `^\\.\\/[^\\/]*$`}],
  }, {
    code: `import '../foo';\n`,
    output: `import 'fff/foo';\n`,
    filename: __filename,
    parserOptions,
    errors: [{message: `Expected relative import to be package-absolute (rather than '../foo').`}],
    options: [{replaceAbsolutePathStart: [{from: `eslint-plugin-arca/tests`, to: `fff`}]}]},
  {
    code: `import 'eslint-plugin-arca/tests/rules/bar';\n`,
    output: `import 'fff/rules/bar';\n`,
    filename: __filename,
    parserOptions,
    errors: [{message: `Expected absolute import to start with 'fff/' prefix (rather than 'eslint-plugin-arca/tests/').`}],
    options: [{replaceAbsolutePathStart: [{from: `eslint-plugin-arca/tests`, to: `fff`}]}],
  }, {
    code: `import 'eslint-plugin-arca/tests/rules/baz';\nimport 'eslint-plugin-arca/tests/rules/jeej/baz';\n`,
    output: `import './baz';\nimport 'eslint-plugin-arca/tests/rules/jeej/baz';\n`,
    filename: __filename,
    parserOptions,
    errors: [{message: `Expected absolute import to be relative (rather than 'eslint-plugin-arca/tests/rules/baz').`}],
    options: [{preferRelative: `^\\.\\/[^\\/]*$`}]}],
});
