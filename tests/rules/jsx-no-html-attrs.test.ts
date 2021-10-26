/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import rule         from 'eslint-plugin-arca/sources/rules/jsx-no-html-attrs';
import {RuleTester} from 'eslint';

const parserOptions = {sourceType: `module`, ecmaVersion: 2015, ecmaFeatures: {jsx: true}} as const;
const ruleTester = new RuleTester();

ruleTester.run(`jsx-no-html-attrs`, rule, {
  valid: [{
    code: `<foo className="test"/>\n`,
    parserOptions,
  }, {
    code: `<foo data-foo="bar"/>\n`,
    parserOptions,
  }, {
    code: `<foo data-fooBar="qux"/>\n`,
    parserOptions,
  }, {
    code: `<foo srcSet="qux"/>\n`,
    parserOptions,
  }],
  invalid: [{
    code: `<foo class="test"/>\n`,
    output: `<foo className="test"/>\n`,
    parserOptions,
    errors: [{message: `This HTML attribute isn't formatted for use in React code.`}],
  }, {
    code: `<foo data-foo-bar="qux"/>\n`,
    output: `<foo data-fooBar="qux"/>\n`,
    parserOptions,
    errors: [{message: `This HTML attribute isn't formatted for use in React code.`}],
  }, {
    code: `<foo foo-bar="qux"/>\n`,
    output: `<foo fooBar="qux"/>\n`,
    parserOptions,
    errors: [{message: `This HTML attribute isn't formatted for use in React code.`}],
  }, {
    code: `<foo srcset="qux"/>\n`,
    output: `<foo srcSet="qux"/>\n`,
    parserOptions,
    errors: [{message: `This HTML attribute isn't formatted for use in React code.`}],
  }],
});
