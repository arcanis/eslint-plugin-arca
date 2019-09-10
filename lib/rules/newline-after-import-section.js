/**
 * @fileoverview Require an empty newline after an import section
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

var importFixer = require("../import-fixer");
var utils = require("../utils");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {

    meta: {

        fixable: "code",

        schema: [

            {

                type: "object",

                properties: {

                    sections: {
                        type: "array",
                        items: [{ type: "string" }]
                    },

                    enableImportOrdering: {
                        type: "boolean"
                    },

                    importSourceTransformer: {
                        type: "string"
                    }

                },

                additionalProperties: false

            }

        ]

    },

    create: function(context) {

        var sourceCode = context.getSourceCode();

        var options = context.options[0] || {};
        var sections = utils.getSections(options.sections);

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        function reportExpectedBlankLineAfterImportSection(node) {

            return context.report({

                node: node,

                message: "Expected blank line after import section.",

                fix: function (fixer) {

                    var importDeclarations = node.parent.body.filter(function (node) {
                        return node.type === "ImportDeclaration";
                    });

                    return importFixer.generateFix(sourceCode, fixer, importDeclarations, Object.assign({}, options, {
                        sections: sections,
                        enableImportSections: true,
                        importSourceTransformer: utils.resolve(options.importSourceTransformer, context.getFilename()),
                    }));

                }

            });

        }

        function reportExtraneousBlankLineWithinImportSection(node) {

            return context.report({

                node: node,

                message: "Expected no blank lines between imports of a same section.",

                fix: function (fixer) {

                    var importDeclarations = node.parent.body.filter(function (node) {
                        return node.type === "ImportDeclaration";
                    });

                    return importFixer.generateFix(sourceCode, fixer, importDeclarations, Object.assign({}, options, {
                        sections: sections,
                        enableImportSections: true,
                    }));

                }

            });

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
                    var level = utils.getModuleLevel(node.source.value, sections);
                    var levelNext = utils.getModuleLevel(nextNode.source.value, sections);

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
