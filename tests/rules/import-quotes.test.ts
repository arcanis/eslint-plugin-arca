/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import rule         from 'eslint-plugin-arca/sources/rules/import-quotes';
import {RuleTester} from 'eslint';

const parserOptions = {sourceType: `module`, ecmaVersion: 2015} as const;
const ruleTester = new RuleTester();

ruleTester.run(`import-quotes`, rule, {
  valid: [{
    code: `import 'foo';\n`,
    parserOptions,
  }],
  invalid: [{
    code: `import "foo";\n`,
    output: `import 'foo';\n`,
    parserOptions,
    errors: [{message: `Expected import to use single quotes.`}],
  }],
});
