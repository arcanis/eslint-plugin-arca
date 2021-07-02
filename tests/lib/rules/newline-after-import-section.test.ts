/**
 * @fileoverview Require an empty newline after an import section
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import {RuleTester} from 'eslint';

import rule         from '../../../lib/rules/newline-after-import-section';

const parserOptions = {sourceType: `module`, ecmaVersion: 2015} as const;
const ruleTester = new RuleTester();

ruleTester.run(`newline-after-import-section`, rule, {
  valid: [{
    code: `import bar1 from 'bar';\nimport foo1 from 'foo';\n\nimport bar2 from 'common/bar';\nimport foo2 from 'common/foo';\n\nimport bar3 from 'app/bar';\nimport foo3 from 'app/foo';\n\nexport var foo;\n`,
    parserOptions,
  }, {
    code: `import bar from 'app/bar';\n// hello-world\nimport foo from 'app/foo';\n`,
    parserOptions,
  }],
  invalid: [{
    code: `import foo1 from 'foo';\nimport foo2 from 'common/foo';\n`,
    output: `import foo1 from 'foo';\n\nimport foo2 from 'common/foo';\n`,
    parserOptions,
    errors: [{message: `Expected blank line after import section.`}],
  }, {
    code: `import foo1 from 'common/foo';\nimport foo2 from 'app/foo';\n`,
    output: `import foo1 from 'common/foo';\n\nimport foo2 from 'app/foo';\n`,
    parserOptions,
    errors: [{message: `Expected blank line after import section.`}],
  }, {
    code: `import foo1 from 'app/foo';\nexport var foo;\n`,
    output: `import foo1 from 'app/foo';\n\nexport var foo;\n`,
    parserOptions,
    errors: [{message: `Expected blank line after import section.`}],
  }, {
    code: `import foo from 'common/foo';\n\nimport bar from 'common/bar';\n`,
    output: `import foo from 'common/foo';\nimport bar from 'common/bar';\n`,
    parserOptions,
    errors: [{message: `Expected no blank lines between imports of a same section.`}],
  }, {
    code: `import foo from 'foo';\nimport {\n  bar1,\n  bar2,\n} from 'bar';\n`,
    output: `import foo from 'foo';\n\nimport {\n  bar1,\n  bar2,\n} from 'bar';\n`,
    parserOptions,
    errors: [{message: `Expected blank line after import section.`}],
    options: [{enableOnelinerSections: true}],
  }],
});
