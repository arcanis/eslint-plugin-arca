/**
 * @fileoverview Require from keywords to be aligned
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    function getFromKeyword(node) {

        if (node.type !== "ImportDeclaration")
            return null;

        if (node.specifiers.length < 1)
            return null;

        var sourceCode = context.getSourceCode();
        var token = sourceCode.getTokenAfter(node.specifiers[node.specifiers.length - 1]);

        while (token.type !== "Identifier" || token.value !== "from")
            token = sourceCode.getTokenAfter(token);

        return token;

    }

    function reportUnalignedImportStatement(node) {

        context.report({

            node: node,
            loc: getFromKeyword(node).loc.start,

            message: "Unaligned import statement"

        });

    }

    function isSingleLine(node) {

        var sourceCode = context.getSourceCode();

        var first = sourceCode.getFirstToken(node);
        var last = sourceCode.getLastToken(node);

        return first.loc.start.line === last.loc.end.line;

    }

    function isSuitableImport(node) {

        return node.type === "ImportDeclaration" && node.specifiers.length >= 1 && isSingleLine(node);

    }

    function findSurroundingImports(node) {

        var surroundingImports = [node];

        var parentBody = node.parent.body;
        var nodeLocation = parentBody.indexOf(node);

        for (var t = nodeLocation - 1; t >= 0 && isSuitableImport(parentBody[t]); --t)
            surroundingImports.unshift(parentBody[t]);

        for (var t = nodeLocation + 1; t < parentBody.length && isSuitableImport(parentBody[t]); ++t)
            surroundingImports.push(parentBody[t]);

        return surroundingImports;

    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        "ImportDeclaration": function (node) {

            if (!isSuitableImport(node))
                return ;

            var surroundingImports = findSurroundingImports(node);

            var fromKeywords = surroundingImports.map(function (node) { return getFromKeyword(node); });
            var fromColumns = fromKeywords.map(function (token) { return token.loc.start.column; });

            var getMaxColumn = fromColumns.reduce(function (max, column) { return Math.max(max, column); }, 0);

            var nodeFromKeyword = getFromKeyword(node);
            var nodeFromColumn = nodeFromKeyword.loc.start.column;

            if (nodeFromColumn < getMaxColumn) {
                reportUnalignedImportStatement(node);
            }

        }

    };

};

module.exports.schema = [

];
