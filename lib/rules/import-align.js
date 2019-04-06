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

module.exports = {

    meta: {

        fixable: "whitespace",

        schema: [

            {

                type: "object",

                properties: {

                    collapseExtraSpace: {
                        type: "boolean",
                    },

                    minColumnWidth: {
                        type: "number",
                    }

                },

                additionalProperties: false

            }

        ]

    },

    create: function(context) {

        //--------------------------------------------------------------------------
        // Read options, merge with defaults
        //--------------------------------------------------------------------------

        var defaultOptions = {
            collapseExtraSpace: false,
            minColumnWidth: 0
        };

        var options = Object.assign({}, defaultOptions, context.options[0]);

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

        function reportUnalignedImportStatement(node, diff) {

            var sourceCode = context.getSourceCode();

            var fromKeyword = getFromKeyword(node);
            var previousToken = sourceCode.getTokenBefore(fromKeyword);

            context.report({

                node: node,
                loc: fromKeyword.loc.start,

                message: "Unaligned import statement",

                fix: function(fixer) {

                    if (diff < 0) {
                        return fixer.removeRange([ previousToken.end, previousToken.end + Math.abs(diff) ]);
                    } else {
                        return fixer.insertTextAfter(previousToken, " ".repeat(diff));
                    }

                }

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

        function getLineInfo(node) {

            var sourceCode = context.getSourceCode();

            var fromToken = getFromKeyword(node);
            var fromTokenStart = fromToken.loc.start.column;

            var prevToken = sourceCode.getTokenBefore(fromToken);
            var prevTokenEnd = prevToken.loc.end.column;

            return {
                prevTokenEnd: prevTokenEnd,
                fromTokenStart: fromTokenStart
            };

        }

        function getAlignmentColumn(lines) {

            var alignmentColumn;

            if (options.collapseExtraSpace) {

                // use greatest endpoint of previous tokens as alignment column
                alignmentColumn = lines.reduce(function (max, line) { return Math.max(max, line.prevTokenEnd); }, 0)

                // add 1 for the space
                alignmentColumn += 1;

            } else {

                // use greatest start of from tokens as alignment column
                alignmentColumn = lines.reduce(function (max, line) { return Math.max(max, line.fromTokenStart); }, 0)

            }

            // check if alignment column is lower than minColumnWidth, if defined
            if (options.minColumnWidth)
                alignmentColumn = Math.max(alignmentColumn, options.minColumnWidth);

            return alignmentColumn;

        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            "ImportDeclaration": function (node) {

                if (!isSuitableImport(node))
                    return ;

                var surroundingImports = findSurroundingImports(node);

                // get the prevTokenEnd and fromTokenStart of all lines
                var lines = surroundingImports.map(getLineInfo);

                var alignmentColumn = getAlignmentColumn(lines);

                // get current line info
                var line = getLineInfo(node)

                // check alignment of current line
                if (line.fromTokenStart !== alignmentColumn) {
                    reportUnalignedImportStatement(node, alignmentColumn - line.fromTokenStart);
                }

            }

        };

    }

}
