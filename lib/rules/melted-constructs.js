/**
 * @fileoverview Force 'else' branchs to be melted with compatible constructps (melted-constructs)
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

    function reportExpectedConstructToBeMeltedWithItsFollowupError(node, token, name, followup) {

        context.report({

            node: node,
            loc: token.loc.end,

            message: "Expected '{{name}}' construct to be melted with its '{{followup}}' followup.",

            data: {
                name: name,
                followup: followup
            }

        });

    }

    function checkMeltedConstruct(node, branch, name) {

        if (!branch)
            return ;

        var sourceCode = context.getSourceCode();

        var checkNode = branch;
        var hasBlock = (checkNode.type === "BlockStatement");

        while (checkNode.type === "BlockStatement" && checkNode.body.length === 1)
            checkNode = checkNode.body[0];

        var followup = FOLLOWUP_TABLE[checkNode.type];

        if (!followup)
            return ;

        var elseToken = getElseKeyword(node);
        var elseLine = elseToken.loc.end.line;

        var checkToken = sourceCode.getFirstToken(checkNode);
        var checkLine = checkToken.loc.start.line;

        if (hasBlock || elseLine !== checkLine) {
            reportExpectedConstructToBeMeltedWithItsFollowupError(node, elseToken, name, followup);
        }

    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        "IfStatement": function (node) {
            checkMeltedConstruct(node, node.alternate, 'else');
        }

    };

};

module.exports.schema = [
    // fill in your schema
];
