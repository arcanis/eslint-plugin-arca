/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
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

      fixable: "code",

      schema: [{

          type: "array",
          items: [{ type: "string" }]

      }]

    },

    create: function(context) {

        var sectionsPatterns = (context.options[0] || constants.DEFAULT_SECTIONS_PATTERNS);
        var sectionsRegexps = sectionsPatterns.map(function (pattern) { return new RegExp(pattern); });
        var sourceCode = context.getSourceCode();

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        function reportExpectedModuleToBeImportedBeforeAnotherError(node, firstErroneousImport, reason) {

            var importDeclarations = node.parent.body.filter(function (node) {
                return node.type === "ImportDeclaration";
            });

            return context.report({

                node: node,

                message: "Expected '{{source}}' to be imported before '{{otherSource}}' ({{reason}}).",

                data: {
                    source: node.source.value,
                    otherSource: firstErroneousImport.source.value,
                    reason: reason
                },

                fix: function (fixer) {
                    return sortAndFixAllNodes(fixer, importDeclarations);
                }

            });

        }

        function getReplaceStart(node) {

            var replaceStart = node;
            var comments = sourceCode.getCommentsBefore(node);

            for (var t = comments.length - 1; t >= 0; --t) {
                if (comments[t].type === "Line") {
                    replaceStart = comments[t];
                } else {
                    break;
                }
            }

            return replaceStart;

        }

        function getReplaceEnd(node) {

            return node;

        }

        function sortAndFixAllNodes(fixer, importDeclarations) {

            var fromRange = getReplaceStart(importDeclarations[0]).range[0];
            var toRange = getReplaceEnd(importDeclarations[importDeclarations.length - 1]).range[1];

            return fixer.replaceTextRange([fromRange, toRange], importDeclarations.slice().sort(function (a, b) {

                return compareModules(a, b) === null ? -1 : 1

            }).reduce(function (sourceText, declaration, index) {

                var comments = sourceCode.getCommentsBefore(declaration);

                if (declaration === importDeclarations[0]) {

                    var preservedCommentCount = 0;

                    while (preservedCommentCount < comments.length && comments[comments.length - preservedCommentCount - 1].type === "Line")
                        preservedCommentCount += 1;

                    if (preservedCommentCount > 0) {
                        comments = comments.slice(-preservedCommentCount);
                    } else {
                        comments = [];
                    }

                }

                var textComments = comments.map(function (comment) {
                    return sourceCode.getText(comment) + "\n";
                }).join("");

                var textAfterSpecifier = index === importDeclarations.length - 1
                    ? "" : sourceCode.getText().slice(importDeclarations[index].range[1], sourceCode.getTokenAfter(importDeclarations[index], {includeComments: true}).range[0]);

                return sourceText + textComments + sourceCode.getText(declaration) + textAfterSpecifier;

            }, ""));

        }

        function getModuleLevel(path) {

            for (var t = 0, T = sectionsRegexps.length; t < T; ++ t)
                if (sectionsRegexps[t].test(path))
                    return 1 + t;

            return 0;

        }

        function compareModules(a, b) {

            if (a.type !== "ImportDeclaration" || b.type !== "ImportDeclaration")
                return null;

            if (a.specifiers.length && !b.specifiers.length)
                return "side-effects go first";

            if (!a.specifiers.length && b.specifiers.length)
                return null;

            var aSource = a.source.value;
            var bSource = b.source.value;

            if (aSource === bSource)
                return null;

            var aLevel = getModuleLevel(aSource);
            var bLevel = getModuleLevel(bSource);

            if (aLevel < bLevel) {

                return null;

            } else if (aLevel > bLevel) {

                if (bLevel === 0) {
                    return "vendors go first";
                } else {
                    return "'" + sectionsPatterns[bLevel - 1] + "' goes before '" + sectionsPatterns[aLevel - 1] + "'";
                }

            } else {

                if (bSource.substr(0, aSource.length + 1) === aSource + "/")
                    return "subdirectories go before their indexes";

                if (bSource.substr(0, aSource.length) === aSource)
                    return "lexicographic order";

                if (aSource.substr(0, bSource.length) === bSource)
                    return null;

                if (aSource > bSource) {
                    return "lexicographic order";
                } else {
                    return null;
                }

            }

        }

        function findFirstErroneousImport(node) {

            var parentBody = node.parent.body;
            var nodeLocation = parentBody.indexOf(node);

            var iteratorLocation = nodeLocation - 1;
            var iteratorNode = parentBody[iteratorLocation];

            var firstErroneousNode = null;
            var firstErrorReason = null;

            function iterate() {
                iteratorNode = parentBody[--iteratorLocation];
            }

            for (var errorReason; iteratorNode && (errorReason = compareModules(iteratorNode, node)) !== null; iterate()) {
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
