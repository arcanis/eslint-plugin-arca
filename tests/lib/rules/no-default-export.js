/**
 * @fileoverview Disallow default exports
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-default-export"),

    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();

ruleTester.run("no-default-export", rule, {

    valid: [

        { code: "export function foo() {\n}\n", parserOptions: { sourceType: "module" } }

    ],

    invalid: [

        { code: "export default function () {\n}\n", parserOptions: { sourceType: "module" },
          errors: [{ message: "Unexpected default export." }] }

    ]

});
