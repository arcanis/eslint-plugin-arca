/**
 * @fileoverview Require an empty newline after an import section
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

var constants = require("../constants");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {

    meta: {

        fixable: "whitespace",

        schema: [{

            type: "array",
            items: [{ type: "string" }]

        }]

    },

    create: function(context) {

        var sourceCode = context.getSourceCode();

        var sectionsPatterns = (context.options[0] || constants.DEFAULT_SECTIONS_PATTERNS);
        var sectionsRegexps = sectionsPatterns.map(function (pattern) { return new RegExp(pattern); });

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        function reportExpectedBlankLineAfterImportSection(node) {

            return context.report({

                node: node,

                message: "Expected blank line after import section.",

                fix: function(fixer) {
                    return fixer.insertTextAfter(node, "\n");
                }

            });

        }

        function reportExtraneousBlankLineWithinImportSection(node) {

            return context.report({

                node: node,

                message: "Expected no blank lines between imports of a same section.",

                fix: function(fixer) {

                    var afterNewLine = sourceCode.getIndexFromLoc({ line: sourceCode.getLastToken(node).loc.end.line + 1, column: 0 });
                    var beforeNewLine = afterNewLine - 1;

                    return fixer.removeRange([beforeNewLine, afterNewLine]);

                }

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

                var line = node.loc.end.line;
                var nextLine = sourceCode.getTokenAfter(node, {includeComments: true}).loc.start.line;

                if (nextNode.type === "ImportDeclaration") {
                    var level = getModuleLevel(node.source.value);
                    var levelNext = getModuleLevel(nextNode.source.value);

                    if (level === levelNext) {
                        if (nextLine - line > 1) {
                            reportExtraneousBlankLineWithinImportSection(node);
                        } else {
                            return ;
                        }
                    }
                }


                if (nextLine - line < 2) {
                    reportExpectedBlankLineAfterImportSection(node);
                }

            }

        };

    }

};
