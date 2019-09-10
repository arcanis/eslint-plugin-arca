/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
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

                    enableImportSections: {
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

        function reportExpectedModuleToBeImportedBeforeAnotherError(node, firstErroneousImport, reason) {

            return context.report({

                node: node,

                message: "Expected '{{source}}' to be imported before '{{otherSource}}' ({{reason}}).",

                data: {
                    source: node.source.value,
                    otherSource: firstErroneousImport.source.value,
                    reason: reason
                },

                fix: function (fixer) {

                    var importDeclarations = node.parent.body.filter(function (node) {
                        return node.type === "ImportDeclaration";
                    });

                    return importFixer.generateFix(sourceCode, fixer, importDeclarations, {
                        sections: sections,
                        enableImportOrdering: true,
                        importSourceTransformer: utils.resolve(options.importSourceTransformer, context.getFilename()),
                    });

                }

            });

        }

        function findFirstErroneousImport(node) {

            var parentBody = node.parent.body;
            var nodeLocation = parentBody.indexOf(node);

            var iteratorLocation = nodeLocation;
            var iteratorNode = parentBody[iteratorLocation];

            var firstErroneousNode = null;
            var firstErrorReason = null;

            function iterate() {
                do {
                    iteratorNode = parentBody[--iteratorLocation];
                } while (iteratorNode && iteratorNode.type !== "ImportDeclaration");
            }

            iterate();

            for (var errorReason; iteratorNode && (errorReason = utils.compareModules(iteratorNode, node, sections)) !== null; iterate()) {
                firstErroneousNode = iteratorNode;
                firstErrorReason = errorReason;
            }

            if (firstErroneousNode) {
                return { node: firstErroneousNode, reason: firstErrorReason };
            } else {
                return null;
            }

        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            "ImportDeclaration": function (node) {

                var firstErroneousImport = findFirstErroneousImport(node);

                if (!firstErroneousImport)
                    return ;

                reportExpectedModuleToBeImportedBeforeAnotherError(node, firstErroneousImport.node, firstErroneousImport.reason);

            }

        };

    }

};
