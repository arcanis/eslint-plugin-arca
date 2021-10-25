/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import rule         from 'eslint-plugin-arca/sources/rules/jsx-longhand-props';
import {RuleTester} from 'eslint';

const parserOptions = {sourceType: `module`, ecmaVersion: 2015, ecmaFeatures: {jsx: true}} as const;
const ruleTester = new RuleTester();

ruleTester.run(`jsx-longhand-props`, rule, {
  valid: [{
    code: `<foo val={"hello"}/>\n`,
    parserOptions,
  }],
  invalid: [{
    code: `<foo val="hello"/>\n`,
    output: `<foo val={"hello"}/>\n`,
    parserOptions,
    errors: [{message: `JSX props must use the longhand style.`}],
  }],
});
