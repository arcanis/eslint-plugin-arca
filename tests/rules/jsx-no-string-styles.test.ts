/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import rule         from 'eslint-plugin-arca/sources/rules/jsx-no-string-styles';
import {RuleTester} from 'eslint';

const parserOptions = {sourceType: `module`, ecmaVersion: 2015, ecmaFeatures: {jsx: true}} as const;
const ruleTester = new RuleTester();

ruleTester.run(`jsx-no-string-styles`, rule, {
  valid: [{
    code: `<foo style={{hello: "world"}}/>\n`,
    parserOptions,
  }, {
    code: `<foo style={{helloWorld: "foo"}}/>\n`,
    parserOptions,
  }],
  invalid: [{
    code: `<foo style="hello: world"/>\n`,
    output: `<foo style={{"hello":"world"}}/>\n`,
    parserOptions,
    errors: [{message: `Style props must be passed as objects.`}],
  }, {
    code: `<foo style={"hello: world"}/>\n`,
    output: `<foo style={{"hello":"world"}}/>\n`,
    parserOptions,
    errors: [{message: `Style props must be passed as objects.`}],
  }, {
    code: `<foo style={\`hello: world\`}/>\n`,
    output: `<foo style={{"hello":"world"}}/>\n`,
    parserOptions,
    errors: [{message: `Style props must be passed as objects.`}],
  }, {
    code: `<foo style="hello: world; foo: bar"/>\n`,
    output: `<foo style={{"hello":"world","foo":"bar"}}/>\n`,
    parserOptions,
    errors: [{message: `Style props must be passed as objects.`}],
  }, {
    code: `<foo style="hello-world: foo; foo-bar-baz: qux"/>\n`,
    output: `<foo style={{"helloWorld":"foo","fooBarBaz":"qux"}}/>\n`,
    parserOptions,
    errors: [{message: `Style props must be passed as objects.`}],
  }],
});
