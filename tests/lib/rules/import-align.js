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

        {
            code: "import foo from 'foo';\nimport bar from 'bar';\n",
            parserOptions: { sourceType: "module" }
        },
        {
            code: "import foo                                from 'foo';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';\n",
            parserOptions: { sourceType: "module" }
        },
        {
            code: "import foo                                from 'foo';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';\nimport {\n    A,\n    B\n} from 'foo';\n",
            parserOptions: { sourceType: "module" }
        },
        {
            code: "import foo          from 'foo';\nimport bar          from 'bar';\n",
            parserOptions: { sourceType: "module" },
            settings: { minColumnWidth: 20 }
        },
        {
            code: "import supercalifragilisticexpialidocious from 'foo';\nimport bar                                from 'bar';\n",
            parserOptions: { sourceType: "module" },
            settings: { minColumnWidth: 20 }
        },
        {
            code: "import foo    from 'foo';\nimport bar    from 'bar';\n",
            parserOptions: { sourceType: "module" },
            settings: { collapseExtraSpace: false }
        }

    ],

    invalid: [

        {
            code: "import foo from 'foo';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';",
            parserOptions: { sourceType: "module" },
            output: "import foo                                from 'foo';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';",
            errors: [{ message: "Unaligned import statement" }]
        },

        {
            code: "import foo from 'foo';\n\nimport bar                                from 'bar';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';",
            parserOptions: { sourceType: "module" },
            output: "import foo                                from 'foo';\n\nimport bar                                from 'bar';\nimport supercalifragilisticexpialidocious from 'supercalifragilisticexpialidocious';",
            errors: [{ message: "Unaligned import statement" }]
        },

        {
            code: "import foo   from 'foo';\nimport bar   from 'bar';\n",
            parserOptions: { sourceType: "module" },
            output: "import foo from 'foo';\nimport bar from 'bar';\n",
            settings: { collapseExtraSpace: true },
            errors: [{ message: "Unaligned import statement" }, { message: "Unaligned import statement" }]
        },

        {
            code: "import foo    from 'foo';\nimport bar   from 'bar';\n",
            parserOptions: { sourceType: "module" },
            output: "import foo from 'foo';\nimport bar from 'bar';\n",
            settings: { collapseExtraSpace: true },
            errors: [{ message: "Unaligned import statement" }, { message: "Unaligned import statement" }]
        },

        {
            code: "import foo    from 'foo';\nimport bar from 'bar';\n",
            parserOptions: { sourceType: "module" },
            output: "import foo from 'foo';\nimport bar from 'bar';\n",
            settings: { collapseExtraSpace: true },
            errors: [{ message: "Unaligned import statement" }]
        },

        {
            code: "import { foo }    from 'foo';\nimport bar       from 'bar';\n",
            parserOptions: { sourceType: "module" },
            output: "import { foo } from 'foo';\nimport bar     from 'bar';\n",
            settings: { collapseExtraSpace: true },
            errors: [{ message: "Unaligned import statement" }, { message: "Unaligned import statement" }]
        },

        {
            code: "import { foo }    from 'foo';\nimport bar     from 'bar';\n",
            parserOptions: { sourceType: "module" },
            output: "import { foo } from 'foo';\nimport bar     from 'bar';\n",
            settings: { collapseExtraSpace: true },
            errors: [{ message: "Unaligned import statement" }]
        },

        {
            code: "import foo       from 'foo';\nimport bar       from 'bar';\n",
            output: "import foo          from 'foo';\nimport bar          from 'bar';\n",
            parserOptions: { sourceType: "module" },
            settings: { minColumnWidth: 20 },
            errors: [{ message: "Unaligned import statement" }, { message: "Unaligned import statement" }]
        },

        {
            code: "import foo              from 'foo';\nimport bar              from 'bar';\n",
            output: "import foo          from 'foo';\nimport bar          from 'bar';\n",
            parserOptions: { sourceType: "module" },
            settings: { minColumnWidth: 20, collapseExtraSpace: true },
            errors: [{ message: "Unaligned import statement" }, { message: "Unaligned import statement" }]
        }

    ]

});
