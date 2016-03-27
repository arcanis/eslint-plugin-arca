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

module.exports = function(context) {

    var FOLLOWUP_TABLE = {

        "IfStatement": "if",
        "ForStatement": "for",
        "ForInStatement": "for-in",
        "ForOfStatement": "for-of",
        "WhileStatement": "while",
        "DoWhileStatement": "do",
        "SwitchStatement": "switch",
        "TryStatement": "try",
        "WithStatement": "with"

    };

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    function getElseKeyword(node) {

        if (node.type !== "IfStatement")
            return null;

        var sourceCode = context.getSourceCode();
        var token = sourceCode.getTokenAfter(node.consequent);

        while (token.type !== "Keyword" || token.value !== "else")
            token = sourceCode.getTokenAfter(token);

        return token;

    }

    function reportExpectedBraceError(node, name, suffix) {

        context.report({

            node: node,
            loc: (name !== "else" ? node : getElseKeyword(node)).loc.end,

            message: "Expected { after '{{name}}'{{suffix}}.",

            data: {
                name: name,
                suffix: (suffix ? " " + suffix : "")
            }

        });

    }

    function reportUnnecessaryBraceError(node, name, suffix) {

        context.report({

            node: node,
            loc: (name !== "else" ? node : getElseKeyword(node)).loc.end,

            message: "Unnecessary { after '{{name}}'{{suffix}}.",

            data: {
                name: name,
                suffix: (suffix ? " " + suffix : "")
            }

        });

    }

    function checkCurly(expectation, sourceNode, checkNode, name, suffix) {

        var hasBlock = (checkNode.type === "BlockStatement");

        if (name === 'else' && !hasBlock && FOLLOWUP_TABLE[checkNode.type])
            return ;

        if (expectation !== hasBlock) {

            if (expectation) {
                reportExpectedBraceError(sourceNode, name, suffix);
            } else {
                reportUnnecessaryBraceError(sourceNode, name, suffix);

            }
        }

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

    function getIfExpectations(node, strong) {

        if (node.parent.alternate === node)
            return getElseExpectations(node.parent, true);

        var consequent = node.type === "IfStatement"
            ? node.consequent
            : node.body;

        var hasBlock = (consequent.type === "BlockStatement");

        if (hasBlock && consequent.length > 1)
            return true;

        if (isLastBlockStatement(node))
            return true;

        if (node.alternate) {

            if (strong) {
                return getElseExpectations(node, false);
            }

        } else {

            if (containsDedent(consequent)) {
                return true;
            }

        }

        return false;

    }

    function getElseExpectations(node, strong) {

        var alternate = node.alternate;

        var hasBlock = (alternate.type === "BlockStatement");

        if (hasBlock && alternate.length > 1)
            return true;

        if (isLastBlockStatement(node))
            return true;

        if (containsDedent(alternate))
            return true;

        return getIfExpectations(node, false);

    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        "IfStatement": function (node) {
            node.consequent && checkCurly(getIfExpectations(node, true), node, node.consequent, "if", "condition");
            node.alternate && checkCurly(getElseExpectations(node, true), node, node.alternate, "else");
        },

        "WhileStatement": function (node) {
            checkCurly(getIfExpectations(node, true), node, node.body, "while", "condition");
        },

        "DoWhileStatement": function (node) {
            checkCurly(true, node, node.body, "do");
        },

        "ForStatement": function (node) {
            checkCurly(getIfExpectations(node, true), node, node.body, "for", "condition");
        },

        "ForInStatement": function (node) {
            checkCurly(getIfExpectations(node, true), node, node.body, "for-in");
        },

        "ForOfStatement": function (node) {
            checkCurly(getIfExpectations(node, true), node, node.body, "for-of");
        }

    };

};

module.exports.schema = [

];
