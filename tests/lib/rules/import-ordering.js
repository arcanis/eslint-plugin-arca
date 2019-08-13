/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
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

var parserOptions = { sourceType: "module", ecmaVersion: 2015 };

var ruleTester = new RuleTester();

ruleTester.run("import-ordering", rule, {

    valid: [

        {
            code: "import 'foo';\nimport bar1 from 'bar/bar';\nimport bar2 from 'bar';\nimport foo1 from 'foo/foo';\nimport foo2 from 'foo';\n\nimport bar3 from 'common/bar';\nimport foo3 from 'common/foo';\n\nimport bar4 from 'app/bar/bar';\nimport foo4 from 'app/bar/foo';\nimport bar5 from 'app/foo/bar';\nimport foo5 from 'app/foo/foo';\n",
            parserOptions: parserOptions
        }

    ],

    invalid: [

        {
            code: "import { bar } from 'bar';\nimport 'foo';\n",
            output: "import 'foo';\nimport { bar } from 'bar';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'foo' to be imported before 'bar' (side-effects go first)." }]
        },
        {
            code: "import foo from 'common/foo';\n\nimport bar from 'bar';\n",
            output: "import bar from 'bar';\n\nimport foo from 'common/foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'bar' to be imported before 'common/foo' (vendors go first)." }]
        },
        {
            code: "import foo from 'app/foo';\n\nimport bar from 'common/bar';\n",
            output: "import bar from 'common/bar';\n\nimport foo from 'app/foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'common/bar' to be imported before 'app/foo' ('^common/' goes before '^app/')." }]
        },
        {
            code: "import foo1 from 'foo';\nimport foo2 from 'foo/foo';\n",
            output: "import foo2 from 'foo/foo';\nimport foo1 from 'foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'foo/foo' to be imported before 'foo' (subdirectories go before their indexes)." }]
        },
        {
            code: "import foo1 from 'common/foo';\nimport foo2 from 'common/foo/foo';\n",
            output: "import foo2 from 'common/foo/foo';\nimport foo1 from 'common/foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'common/foo/foo' to be imported before 'common/foo' (subdirectories go before their indexes)." }]
        },
        {
            code: "import foo1 from 'app/foo';\nimport foo2 from 'app/foo/foo';\n",
            output: "import foo2 from 'app/foo/foo';\nimport foo1 from 'app/foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'app/foo/foo' to be imported before 'app/foo' (subdirectories go before their indexes)." }]
        },
        {
            code: "import foo from 'foo';\nimport bar from 'bar';\n",
            output: "import bar from 'bar';\nimport foo from 'foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'bar' to be imported before 'foo' (lexicographic order)." }]
        },
        {
            code: "import foo from 'common/foo';\nimport bar from 'common/bar';\n",
            output: "import bar from 'common/bar';\nimport foo from 'common/foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'common/bar' to be imported before 'common/foo' (lexicographic order)." }]
        },
        {
            code: "import foo from 'app/foo';\nimport bar from 'app/bar';\n",
            output: "import bar from 'app/bar';\nimport foo from 'app/foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'app/bar' to be imported before 'app/foo' (lexicographic order)." }]
        },
        {
            code: "import bar1 from 'bar';\nimport bar2 from 'common/bar';\nimport foo1 from 'common/foo';\nimport bar3 from 'app/bar';\nimport foo2 from 'app/foo';\nimport foo3 from 'foo';\n",
            output: "import bar1 from 'bar';\nimport foo3 from 'foo';\nimport bar2 from 'common/bar';\nimport foo1 from 'common/foo';\nimport bar3 from 'app/bar';\nimport foo2 from 'app/foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'foo' to be imported before 'common/bar' (vendors go first)." }]
        },
        {
            code: "import bar1 from 'common/bar';\nimport foo1 from 'common/foo';\nimport bar2 from 'app/bar';\nimport foo2 from 'app/foo';\nimport foo3 from 'foo';\nimport bar3 from 'bar';\n",
            output: "import bar3 from 'bar';\nimport foo3 from 'foo';\nimport bar1 from 'common/bar';\nimport foo1 from 'common/foo';\nimport bar2 from 'app/bar';\nimport foo2 from 'app/foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected 'foo' to be imported before 'common/bar' (vendors go first)."}, { message: "Expected 'bar' to be imported before 'common/bar' (vendors go first)." }]
        },
        {
          code: "import bar from 'common/foo';\n// This cant be automatically fixed\nimport bar2 from 'common/bar';",
          output: null,
          parserOptions: parserOptions,
          errors: [{ message: "Expected 'common/bar' to be imported before 'common/foo' (lexicographic order)."}]
        }

    ]

});
