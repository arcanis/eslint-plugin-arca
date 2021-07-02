/**
 * @fileoverview Disallow default exports
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import {RuleTester} from 'eslint';

import rule         from '../../../lib/rules/no-default-export';

const parserOptions = {sourceType: `module`, ecmaVersion: 2015} as const;
const ruleTester = new RuleTester();

ruleTester.run(`no-default-export`, rule, {
  valid: [{
    code: `export function foo() {\n}\n`,
    parserOptions,
  }],
  invalid: [{
    code: `export default function () {\n}\n`,
    parserOptions,
    errors: [{message: `Unexpected default export.`}],
  }],
});
