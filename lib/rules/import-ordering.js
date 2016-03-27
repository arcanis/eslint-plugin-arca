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

module.exports = function(context) {

    var sectionsPatterns = (context.options[0] || ["^common/", "^app/"]);
    var sectionsRegexps = sectionsPatterns.map(function (pattern) { return new RegExp(pattern); });

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    function reportExpectedModuleToBeImportedBeforeAnotherError(node, source, previousSource, reason) {

        return context.report({

            node: node,

            message: "Expected '{{source}}' to be imported before '{{previousSource}}' ({{reason}}).",

            data: {
                source: source,
                previousSource: previousSource,
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

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        "ImportDeclaration": function (node) {

            var parentBody = node.parent.body;

            var location = parentBody.indexOf(node);
            var previousImportLocation = location;

            do {
                previousImportLocation -= 1;
            } while (previousImportLocation >= 0 && parentBody[previousImportLocation].type !== "ImportDeclaration");

            if (previousImportLocation === -1)
                return ;

            var previousImport = parentBody[previousImportLocation];

            var source = node.source.value;
            var previousSource = previousImport.source.value;

            var level = getModuleLevel(source);
            var previousLevel = getModuleLevel(previousSource);

            if (previousLevel > level) {

                if (level === 0) {
                    reportExpectedModuleToBeImportedBeforeAnotherError(node, source, previousSource, "vendors go first");
                } else {
                    reportExpectedModuleToBeImportedBeforeAnotherError(node, source, previousSource, "'" + sectionsPatterns[level - 1] + "' goes before '" + sectionsPatterns[previousLevel - 1] + "'");
                }

            } else if (previousLevel === level) {

                if (previousSource.substr(0, source.length + 1) === source + "/") {
                    // all is good
                } else if (source.substr(0, previousSource.length + 1) === previousSource + "/") {
                    reportExpectedModuleToBeImportedBeforeAnotherError(node, source, previousSource, "subdirectories go before their indexes");
                } else if (source < previousSource) {
                    reportExpectedModuleToBeImportedBeforeAnotherError(node, source, previousSource, "lexicographic order");
                }

            }

        }

    };

};

module.exports.schema = [ {

    type: "array",
    items: [ { type: "string" } ]

} ];
