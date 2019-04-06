/**
 * @fileoverview Ensure that curly braces keep the code flow easy to read
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

        fixable: "code",

        schema: [

        ]

    },

    create: function(context) {

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        function isMeltedIf(node) {

            if (node.type !== "IfStatement")
                return false;

            if (!node.parent || node.parent.type !== "IfStatement" || !node.parent.alternate)
                return false;

            var sourceCode = context.getSourceCode();

            var elseToken = getElseKeyword(node.parent);
            var elseLine = elseToken.loc.end.line;

            var checkToken = sourceCode.getFirstToken(node);
            var checkLine = checkToken.loc.start.line;

            return elseLine === checkLine;

        }

        function getElseKeyword(node) {

            if (node.type !== "IfStatement")
                return null;

            var sourceCode = context.getSourceCode();
            var token = sourceCode.getTokenAfter(node.consequent);

            while (token.type !== "Keyword" || token.value !== "else")
                token = sourceCode.getTokenAfter(token);

            return token;

        }

        function reportExpectedBraceError(node, body, name, suffix) {

            context.report({

                node: node,
                loc: (name !== "else" ? node : getElseKeyword(node)).loc.start,

                message: "Expected { after '{{name}}'{{suffix}}.",

                data: {
                    name: name,
                    suffix: (suffix ? " " + suffix : "")
                },

                fix: function (fixer) {

                    var sourceCode = context.getSourceCode();

                    fixer.replaceText(body, "{" + sourceCode.getText(body) + "}");

                }

            });

        }

        function reportUnnecessaryBraceError(node, body, name, suffix) {

            context.report({

                node: node,
                loc: (name !== "else" ? node : getElseKeyword(node)).loc.start,

                message: "Unnecessary { after '{{name}}'{{suffix}}.",

                data: {
                    name: name,
                    suffix: (suffix ? " " + suffix : "")
                },

                fix: function (fixer) {

                    var sourceCode = context.getSourceCode();

                    var openingBracket = sourceCode.getFirstToken(body);
                    var closingBracket = sourceCode.getLastToken(body);
                    var lastTokenInBlock = sourceCode.getTokenBefore(closingBracket);

                    var resultingBodyText = [
                        sourceCode.getText().slice(openingBracket.range[1], lastTokenInBlock.range[0]),
                        sourceCode.getText(lastTokenInBlock),
                        sourceCode.getText().slice(lastTokenInBlock.range[1], closingBracket.range[0])
                    ].join("");

                    return fixer.replaceText(body, resultingBodyText);

                }

            });

        }

        function checkCurly(expectation, checkNode, name, suffix) {

            var hasCurlyBraces = checkNode.type === "BlockStatement";

            if (expectation === hasCurlyBraces)
                return;

            if (expectation) {
                reportExpectedBraceError(checkNode.parent, checkNode, name, suffix);
            } else {
                reportUnnecessaryBraceError(checkNode.parent, checkNode, name, suffix);
            }

        }

        function isFatBlockStatement(node) {

            if (node.type !== "BlockStatement")
                return false;

            if (node.body.length <= 1)
                return false;

            return true;

        }

        function isLastBlockStatement(node) {

            if (!node.parent)
                return false;

            if (node.parent.type === "BlockStatement")
                return node.parent.body[node.parent.body.length - 1] === node;

            return false;

        }

        function containsDedent(node) {

            if (node.type === "BlockStatement" && node.body.length === 0)
                return false;

            var sourceCode = context.getSourceCode();

            var firstNode = node.type === "BlockStatement" ? node.body[0] : node;
            var lastNode = node.type === "BlockStatement" ? node.body[node.body.length - 1] : node;

            var firstToken = sourceCode.getFirstToken(firstNode);
            var lastToken = sourceCode.getLastToken(lastNode);

            var startLine = firstToken.loc.start.line - 1;
            var endLine = lastToken.loc.end.line;

            var text = sourceCode.lines.slice(startLine, endLine);

            for (var indentLevel = 0, t = 0, T = text.length; t < T; ++ t) {

                var lineLevel = text[t].match(/^([ \t]*)/)[0].length;

                if (lineLevel >= indentLevel) {
                    indentLevel = lineLevel;
                } else {
                    return true;
                }

            }

            return false;

        }

        function getExpectation(node) {

            // If the node contains multiple statements in a single node
            // (because then we just *have* to use a block)
            if (isFatBlockStatement(node))
                return true;

            // If the "if" that contains the node is the last one of its
            // parent block (because otherwise it would put multiple
            // dedents between a line and the closing '}', which I find
            // perturbing)
            if (isLastBlockStatement(node.parent))
                return true;

            // If the node contains dedents (because otherwise it would make
            // it harder to see that the node isn't a block, especially if it
            // spans multiple lines like with a function definition)
            if (containsDedent(node))
                return true;

            return false;

        }

        function resolveMeltedConstruct(node) {

            var nodes = [node.consequent];

            while (node.alternate && isMeltedIf(node.alternate)) {
                node = node.alternate;
                nodes.push(node.consequent);
            }

            if (node.alternate)
                nodes.push(node.alternate);

            return nodes;

        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            "IfStatement": function (node) {

                // Melted constructs have already been processed along with their
                // root node
                if (isMeltedIf(node))
                    return;

                var nodes = resolveMeltedConstruct(node);

                var expectations = nodes.map(function (node, i) {
                    return getExpectation(node);
                });

                // If at least one node requires curly braces, all of them do
                var curlyAreRequired = expectations.some(function (expectation) {
                    return expectation;
                });

                for (var t = 0; t < nodes.length; ++t) {
                    if (t === 0 || t < nodes.length - 1) {
                        checkCurly(curlyAreRequired, nodes[t], "if", "condition");
                    } else {
                        checkCurly(curlyAreRequired, nodes[t], "else");
                    }
                }

            },

            "WhileStatement": function (node) {
                checkCurly(getExpectation(node.body), node.body, "while", "condition");
            },

            "DoWhileStatement": function (node) {
                // We enforce the use of curly braces with do-while because
                // they're confusing enough as it is, plus they would make the
                // fixer more complex
                checkCurly(true, node.body, "do");
            },

            "ForStatement": function (node) {
                checkCurly(getExpectation(node.body), node.body, "for", "condition");
            },

            "ForInStatement": function (node) {
                checkCurly(getExpectation(node.body), node.body, "for-in");
            },

            "ForOfStatement": function (node) {
                checkCurly(getExpectation(node.body), node.body, "for-of");
            }

        };

    }

};
