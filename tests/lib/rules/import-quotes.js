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

var rule = require("../../../lib/rules/import-quotes"),

    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var parserOptions = { sourceType: "module", ecmaVersion: 2015 };

var ruleTester = new RuleTester();

ruleTester.run("import-quotes", rule, {

    valid: [

        {
            code: "import 'foo';\n",
            parserOptions: parserOptions
        }

    ],

    invalid: [

        {
            code: "import \"foo\";\n",
            output: "import 'foo';\n",
            parserOptions: parserOptions,
            errors: [{ message: "Expected import to use single quotes." }]
        }

    ]

});
