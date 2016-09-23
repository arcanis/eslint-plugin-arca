/**
 * @fileoverview Require an empty newline after an import section
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

        schema: [{

            type: "array",
            items: [{ type: "string" }]

        }]

    },

    create: function(context) {

        var sectionsPatterns = (context.options[0] || ["^common/", "^app/"]);
        var sectionsRegexps = sectionsPatterns.map(function (pattern) { return new RegExp(pattern); });

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        function reportExpectedBlankLineAfterImportSection(node) {

            return context.report({

                node: node,

                message: "Expected blank line after import section."

            });

        }

        function getModuleLevel(path) {

            for (var t = 0, T = sectionsRegexps.length; t < T; ++ t)
                if (sectionsRegexps[t].test(path))
                    return 1 + t;

            return 0;

        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            "ImportDeclaration": function (node) {

                var parentBody = node.parent.body;

                var location = parentBody.indexOf(node);
                var nextNodeLocation = location + 1;

                if (nextNodeLocation === parentBody.length)
                    return ;

                var nextNode = parentBody[nextNodeLocation];

                if (nextNode.type === "ImportDeclaration")
                    if (getModuleLevel(nextNode.source.value) === getModuleLevel(node.source.value))
                        return ;

                var line = node.loc.end.line;
                var nextLine = nextNode.loc.start.line;

                if (nextLine - line < 2) {
                    reportExpectedBlankLineAfterImportSection(node);
                }

            }

        };

    }

};
