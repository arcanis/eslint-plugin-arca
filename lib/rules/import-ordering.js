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

        type: "object",

        properties: {

            sections: {
                type: "array",
                items: [{ type: "string" }]
            },

            hoistOneliners: {
                type: "boolean"
            }

        }

      }]

    },

    create: function(context) {

        var options = context.options[0] || {};

        var sectionsPatterns = (options.sections || constants.DEFAULT_SECTIONS_PATTERNS);
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

        function findNonImportStatements(from, to) {

            var nonImportStatements = [];

            var parentBody = from.parent.body;

            var fromIndex = parentBody.indexOf(from);
            var toIndex = parentBody.indexOf(to);

            for (var t = fromIndex; t < toIndex; ++t)
                if (parentBody[t].type !== "ImportDeclaration")
                    nonImportStatements.push(parentBody[t]);

            return nonImportStatements;

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

            var firstImportDeclaration = importDeclarations[0];
            var lastImportDeclaration = importDeclarations[importDeclarations.length - 1];

            var fromRange = getReplaceStart(firstImportDeclaration).range[0];
            var toRange = getReplaceEnd(lastImportDeclaration).range[1];

            var nonImportStatements = findNonImportStatements(
                firstImportDeclaration,
                lastImportDeclaration
            );

            var fixedImports = importDeclarations.slice().sort(function (a, b) {

                var compared = compareModules(a, b);
                if (compared[0] === null)
                    return 0

                return compared[0];

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

            }, "");

            var fixedNonImport = nonImportStatements.map(function (node) {
                return '\n' + sourceCode.getText(node);
            }).join('');

            return fixer.replaceTextRange([fromRange, toRange], [
                fixedImports,
                fixedNonImport
            ].join(""));

        }

        function getModuleLevel(path) {

            for (var t = 0, T = sectionsRegexps.length; t < T; ++ t)
                if (sectionsRegexps[t].test(path))
                    return 1 + t;

            return 0;

        }

        function compareModules(a, b) {

            if (a.type !== "ImportDeclaration" || b.type !== "ImportDeclaration")
                return [null];

            if (a.specifiers.length && !b.specifiers.length)
                return [1, "side-effects go first"];

            if (!a.specifiers.length && b.specifiers.length)
                return [-1, "side-effects go first"]

            var aMultiline = a.loc.start.line !== a.loc.end.line;
            var bMultiline = b.loc.start.line !== b.loc.end.line;

            if (options.hoistOneliners) {
                if (aMultiline && !bMultiline)
                    return [1, "multiline imports are last"];

                if (!aMultiline && bMultiline) {
                    return [-1, "multiline imports are last"];
                }
            }

            var aSource = a.source.value;
            var bSource = b.source.value;

            if (aSource === bSource)
                return [null];

            var aLevel = getModuleLevel(aSource);
            var bLevel = getModuleLevel(bSource);

            if (aLevel < bLevel) {

                if (aLevel === 0) {
                    return [-1, "vendors go first"];
                } else {
                    return [-1, "'" + sectionsPatterns[aLevel - 1] + "' goes before '" + sectionsPatterns[bLevel - 1] + "'"];
                }

            } else if (aLevel > bLevel) {

                if (bLevel === 0) {
                    return [1, "vendors go first"];
                } else {
                    return [1, "'" + sectionsPatterns[bLevel - 1] + "' goes before '" + sectionsPatterns[aLevel - 1] + "'"];
                }

            } else {

                if (bSource.substr(0, aSource.length + 1) === aSource + "/")
                    return [1, "subdirectories go before their indexes"];

                if (aSource.substr(0, bSource.length + 1) === bSource + "/")
                    return [-1, "subdirectories go before their indexes"];

                if (bSource.substr(0, aSource.length) === aSource)
                    return [1,"lexicographic order"];

                if (aSource.substr(0, bSource.length) === bSource)
                    return [-1,"lexicographic order"];

                if (aSource > bSource) {
                    return [1, "lexicographic order"];
                } else {
                    return [-1, "lexicographic order"];
                }

            }

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

            for (var errorReason; iteratorNode && (errorReason = compareModules(iteratorNode, node))[0] === 1; iterate()) {
                firstErroneousNode = iteratorNode;
                firstErrorReason = errorReason[1];
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
