/**
 * @fileoverview Require an empty newline after an import section
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/newline-after-import-section"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();

ruleTester.run("newline-after-import-section", rule, {

    valid: [

        { code: "import bar from 'bar';\nimport foo from 'foo';\n\nimport bar from 'common/bar';\nimport foo from 'common/foo';\n\nimport bar from 'app/bar';\nimport foo from 'app/foo';\n\nexport var foo;\n", parserOptions: { sourceType: "module" } }

    ],

    invalid: [

        { code: "import foo from 'foo';\nimport foo from 'common/foo';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected blank line after import section." }] },
        { code: "import foo from 'common/foo';\nimport foo from 'app/foo';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected blank line after import section." }] },
        { code: "import foo from 'app/foo';\nexport var foo;\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected blank line after import section." }] },

    ]

});
