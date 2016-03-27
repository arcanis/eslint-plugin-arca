/**
 * @fileoverview Ensure that every import is sorted according to a strict ordering
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/import-ordering"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();

ruleTester.run("import-ordering", rule, {

    valid: [

        { code: "import bar from 'bar/bar';\nimport bar from 'bar';\nimport foo from 'foo/foo';\nimport foo from 'foo';\n\nimport bar from 'common/bar';\nimport foo from 'common/foo';\n\nimport bar from 'app/bar/bar';\nimport foo from 'app/bar/foo';\nimport bar from 'app/foo/bar';\nimport foo from 'app/foo/foo';\n", parserOptions: { sourceType: "module" } }

    ],

    invalid: [

        { code: "import foo from 'common/foo';\n\nimport bar from 'bar';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'bar' to be imported before 'common/foo' (vendors go first)." }] },
        { code: "import foo from 'app/foo';\n\nimport bar from 'common/bar';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'common/bar' to be imported before 'app/foo' ('^common/' goes before '^app/')." }] },

        { code: "import foo from 'foo';\nimport foo from 'foo/foo';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'foo/foo' to be imported before 'foo' (subdirectories go before their indexes)." }] },
        { code: "import foo from 'common/foo';\nimport foo from 'common/foo/foo';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'common/foo/foo' to be imported before 'common/foo' (subdirectories go before their indexes)." }] },
        { code: "import foo from 'app/foo';\nimport foo from 'app/foo/foo';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'app/foo/foo' to be imported before 'app/foo' (subdirectories go before their indexes)." }] },

        { code: "import foo from 'foo';\nimport bar from 'bar';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'bar' to be imported before 'foo' (lexicographic order)." }] },
        { code: "import foo from 'common/foo';\nimport bar from 'common/bar';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'common/bar' to be imported before 'common/foo' (lexicographic order)." }] },
        { code: "import foo from 'app/foo';\nimport bar from 'app/bar';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'app/bar' to be imported before 'app/foo' (lexicographic order)." }] },

        { code: "import bar from 'bar';\nimport bar from 'common/bar';\nimport foo from 'common/foo';\nimport bar from 'app/bar';\nimport foo from 'app/foo';\nimport foo from 'foo';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'foo' to be imported before 'common/bar' (vendors go first)." }] },
        { code: "import bar from 'common/bar';\nimport foo from 'common/foo';\nimport bar from 'app/bar';\nimport foo from 'app/foo';\nimport foo from 'foo';\nimport bar from 'bar';\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Expected 'foo' to be imported before 'common/bar' (vendors go first)."}, { message: "Expected 'bar' to be imported before 'common/bar' (vendors go first)." }] }

    ]

});
