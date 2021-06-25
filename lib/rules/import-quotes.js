/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

const fs = require("fs");
const path = require("path");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {

    meta: {

      fixable: "code"

    },

    create: function(context) {

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        function reportExpectedSingleQuotesError(node) {

            return context.report({

                node: node,

                message: "Expected import to use single quotes.",

                fix: function (fixer) {

                    const fromRange = node.source.range[0];
                    const toRange = node.source.range[1];

                    return fixer.replaceTextRange([fromRange, toRange], `'${node.source.value}'`);

                }

            });

        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            "ImportDeclaration": function (node) {

                if (!node.source.raw.startsWith(`'`)) {
                    reportExpectedSingleQuotesError(node);
                }

            }

        };

    }

};
