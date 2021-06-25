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

var rule = require("../../../lib/rules/import-absolutes"),

    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var parserOptions = { sourceType: "module", ecmaVersion: 2015 };

var ruleTester = new RuleTester();

ruleTester.run("import-absolutes", rule, {

    valid: [

        {
            code: "import 'foo';\nimport bar1 from 'bar/bar';\nimport bar2 from 'bar';\nimport foo1 from 'foo/foo';\nimport foo2 from 'foo';\n\nimport bar3 from 'common/bar';\nimport foo3 from 'common/foo';\n\nimport bar4 from 'app/bar/bar';\nimport foo4 from 'app/bar/foo';\nimport bar5 from 'app/foo/bar';\nimport foo5 from 'app/foo/foo';\n",
            parserOptions: parserOptions
        },
        {
            // When the path is the same, keep user's order
            code: "import {bar1} from 'bar';\nimport {bar2} from 'bar';\nimport baz from 'baz';\nimport {foo2} from 'foo';\nimport {foo1} from 'foo';",
            parserOptions: parserOptions
        }

    ],

    invalid: [

        {
            code: "import './foo';\n",
            output: "import 'eslint-plugin-arca/tests/lib/rules/foo';\n",
            filename: __filename,
            parserOptions: parserOptions,
            errors: [{ message: "Expected import to be package-absolute (rather than './foo')." }]
        }

    ]

});
