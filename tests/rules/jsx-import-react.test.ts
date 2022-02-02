/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import rule         from 'eslint-plugin-arca/sources/rules/jsx-import-react';
import {RuleTester} from 'eslint';

const parserOptions = {sourceType: `module`, ecmaVersion: 2015, ecmaFeatures: {jsx: true}} as const;
const ruleTester = new RuleTester();

ruleTester.run(`jsx-import-react`, rule, {
  valid: [{
    code: `import * as React from 'react';\nconst node = <div/>;\n`,
    parserOptions,
  }],
  invalid: [{
    code: `const node = <div/>;\n`,
    output: `const node = <div/>;\nimport * as React from 'react';\n`,
    parserOptions,
    errors: [{message: `Missing React import.`}],
  }],
});
