/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
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

        function reportExpectedModuleToBeImportedBeforeAnotherError(node, source, otherSource, reason) {

            return context.report({

                node: node,

                message: "Expected '{{source}}' to be imported before '{{otherSource}}' ({{reason}}).",

                data: {
                    source: source,
                    otherSource: otherSource,
                    reason: reason
                }

            });

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

                reportExpectedModuleToBeImportedBeforeAnotherError(node, node.source.value, firstErroneousImport.node.source.value, firstErroneousImport.reason);

            }

        };

    }

};
