/**
 * @fileoverview Disallow default exports
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {

    meta: {

        schema: [
        ]

    },

    create: function(context) {

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            "ExportDefaultDeclaration": function (node) {

                context.report({

                    node: node,

                    message: "Unexpected default export."

                });

            }

        };

    }

};
