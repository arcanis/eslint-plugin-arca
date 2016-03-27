/**
 * @fileoverview Require from keywords to be aligned
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/import-align"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();

ruleTester.run("import-align", rule, {

    valid: [

        { code: "import foo from 'foo';\nimport bar from 'bar';\n", parserOptions: { sourceType: "module" } },
        { code: "import foo                                from 'foo';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';\n", parserOptions: { sourceType: "module" } },
        { code: "import foo                                from 'foo';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';\nimport {\n    A,\n    B\n} from 'foo';\n", parserOptions: { sourceType: "module" } }

    ],

    invalid: [

        { code: "import foo from 'foo';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';", parserOptions: { sourceType: "module" },
          errors: [{ message: "Unaligned import statement" }] },

        { code: "import foo from 'foo';\n\nimport bar                                from 'bar';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';", parserOptions: { sourceType: "module" },
          errors: [{ message: "Unaligned import statement" }] }

    ]

});
