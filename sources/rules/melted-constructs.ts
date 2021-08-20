/**
 * @fileoverview Enforce the use of melted constructs when possible
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {AST, Rule} from 'eslint';
import type * as ESTree from 'estree';

const rule: Rule.RuleModule = {
  meta: {
    fixable: `code`,
  },

  create(context) {
    const FOLLOWUP_TABLE = new Map([
      [`IfStatement`, `if`],
      [`ForStatement`, `for`],
      [`ForInStatement`, `for-in`],
      [`ForOfStatement`, `for-of`],
      [`WhileStatement`, `while`],
      [`DoWhileStatement`, `do`],
      [`SwitchStatement`, `switch`],
      [`TryStatement`, `try`],
      [`WithStatement`, `with`],
    ]);

    function getElseKeyword(node: Rule.Node) {
      if (node.type !== `IfStatement`)
        return null;

      const sourceCode = context.getSourceCode();

      let token = sourceCode.getTokenAfter(node.consequent)!;
      while (token.type !== `Keyword` || token.value !== `else`)
        token = sourceCode.getTokenAfter(token)!;

      return token;
    }

    function reportExpectedConstructToBeMeltedWithItsFollowupError(node: Rule.Node, token: AST.Token, name: string, followup: string) {
      context.report({
        node,
        loc: token.loc.end,
        message: `Expected '{{name}}' construct to be melted with its '{{followup}}' followup.`,

        data: {
          name,
          followup,
        },
      });
    }

    function consequentLooksSimilar(node: ESTree.IfStatement) {
      const consequent = node.consequent;
      if (!consequent)
        return false;

      if (consequent.type === `BlockStatement` && consequent.body.length < 1)
        return false;

      const lastNode = consequent.type === `BlockStatement`
        ? consequent.body[consequent.body.length - 1]
        : consequent;

      if (FOLLOWUP_TABLE.has(lastNode.type))
        return true;

      return false;
    }

    function checkMeltedConstruct(node: ESTree.IfStatement, name: string) {
      if (consequentLooksSimilar(node))
        return ;

      if (!node.alternate)
        return ;

      const sourceCode = context.getSourceCode();

      let checkNode = node.alternate;
      while (checkNode.type === `BlockStatement` && checkNode.body.length === 1)
        checkNode = checkNode.body[0];

      const followup = FOLLOWUP_TABLE.get(checkNode.type);
      if (!followup)
        return;

      const elseToken = getElseKeyword(node)!;
      const elseLine = elseToken.loc.end.line;

      const checkToken = sourceCode.getFirstToken(checkNode)!;
      const checkLine = checkToken.loc.start.line;

      if (checkNode.type === `BlockStatement` || elseLine !== checkLine) {
        reportExpectedConstructToBeMeltedWithItsFollowupError(node, elseToken, name, followup);
      }
    }

    return {
      IfStatement(node) {
        checkMeltedConstruct(node, `else`);
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
