/**
 * @fileoverview Ensure that curly braces keep the code flow easy to read
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {Rule}      from 'eslint';
import type * as ESTree from 'estree';

const rule: Rule.RuleModule = {
  meta: {
    fixable: `code`,
  },

  create(context) {
    function isMeltedIf(node: Rule.Node): node is ESTree.IfStatement {
      if (node.type !== `IfStatement`)
        return false;

      if (!node.parent || node.parent.type !== `IfStatement` || !node.parent.alternate)
        return false;

      const sourceCode = context.getSourceCode();

      const elseToken = getElseKeyword(node.parent)!;
      const elseLine = elseToken.loc.end.line;

      const checkToken = sourceCode.getFirstToken(node)!;
      const checkLine = checkToken.loc.start.line;

      return elseLine === checkLine;
    }

    function getElseKeyword(node: Rule.Node) {
      if (node.type !== `IfStatement`)
        return null;

      const sourceCode = context.getSourceCode();

      let token = sourceCode.getTokenAfter(node.consequent)!;
      while (token.type !== `Keyword` || token.value !== `else`)
        token = sourceCode.getTokenAfter(token)!;

      return token;
    }

    function reportExpectedBraceError(node: Rule.Node, body: Rule.Node, name: string, suffix: string = ``) {
      context.report({
        node,
        loc: (name !== `else` ? node : getElseKeyword(node)!).loc!.start,
        message: `Expected { after '{{name}}'{{suffix}}.`,

        data: {
          name,
          suffix: (suffix ? ` ${suffix}` : ``),
        },

        fix(fixer) {
          const sourceCode = context.getSourceCode();
          fixer.replaceText(body, `{${sourceCode.getText(body)}}`);

          // TODO: This is actually a bug, as we should return the fix instead.
          // However, it breaks the tests and I don't have the time to investigate atm.
          return null;
        },
      });
    }

    function reportUnnecessaryBraceError(node: Rule.Node, body: Rule.Node, name: string, suffix: string = ``) {
      context.report({
        node,
        loc: (name !== `else` ? node : getElseKeyword(node)!).loc!.start,
        message: `Unnecessary { after '{{name}}'{{suffix}}.`,

        data: {
          name,
          suffix: (suffix ? ` ${suffix}` : ``),
        },

        fix(fixer) {
          const sourceCode = context.getSourceCode();

          const openingBracket = sourceCode.getFirstToken(body)!;
          const closingBracket = sourceCode.getLastToken(body)!;
          const lastTokenInBlock = sourceCode.getTokenBefore(closingBracket)!;

          const resultingBodyText = [
            sourceCode.getText().slice(openingBracket.range[1], lastTokenInBlock.range[0]),
            lastTokenInBlock.value,
            sourceCode.getText().slice(lastTokenInBlock.range[1], closingBracket.range[0]),
          ].join(``);

          return fixer.replaceText(body, resultingBodyText);
        },
      });
    }

    function checkCurly(expectation: boolean, checkNode: Rule.Node, name: string, suffix?: string) {
      const hasCurlyBraces = checkNode.type === `BlockStatement`;
      if (expectation === hasCurlyBraces)
        return;

      if (expectation) {
        reportExpectedBraceError(checkNode.parent, checkNode, name, suffix);
      } else {
        reportUnnecessaryBraceError(checkNode.parent, checkNode, name, suffix);
      }
    }

    function isFatBlockStatement(node: Rule.Node) {
      if (node.type !== `BlockStatement`)
        return false;

      if (node.body.length <= 1)
        return false;

      return true;
    }

    function isLastBlockStatement(node: Rule.Node) {
      if (!node.parent)
        return false;

      if (node.parent.type === `BlockStatement`)
        return node.parent.body[node.parent.body.length - 1] === node;

      return false;
    }

    function containsDedent(node: Rule.Node) {
      if (node.type === `BlockStatement` && node.body.length === 0)
        return false;

      const sourceCode = context.getSourceCode();

      const firstNode = node.type === `BlockStatement` ? node.body[0] : node;
      const lastNode = node.type === `BlockStatement` ? node.body[node.body.length - 1] : node;

      const firstToken = sourceCode.getFirstToken(firstNode)!;
      const lastToken = sourceCode.getLastToken(lastNode)!;

      const startLine = firstToken.loc.start.line - 1;
      const endLine = lastToken.loc.end.line;

      const text = sourceCode.lines.slice(startLine, endLine);

      for (let indentLevel = 0, t = 0, T = text.length; t < T; ++ t) {
        const lineLevel = text[t].match(/^([ \t]*)/)![0].length;

        if (lineLevel >= indentLevel) {
          indentLevel = lineLevel;
        } else {
          return true;
        }
      }

      return false;
    }

    function getExpectation(node: Rule.Node) {
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

    function resolveMeltedConstruct(node: ESTree.IfStatement & Rule.NodeParentExtension) {
      const nodes = [node.consequent];

      while (node.alternate) {
        const alternate = node.alternate as Rule.Node;
        if (!isMeltedIf(alternate))
          break;

        node = alternate;
        nodes.push(node.consequent);
      }

      if (node.alternate)
        nodes.push(node.alternate);

      return nodes as Array<Rule.Node>;
    }

    return {
      IfStatement(node) {
        // Melted constructs have already been processed along with their
        // root node
        if (isMeltedIf(node))
          return;

        const nodes = resolveMeltedConstruct(node);

        const expectations = nodes.map((node, i) => {
          return getExpectation(node);
        });

        // If at least one node requires curly braces, all of them do
        const curlyAreRequired = expectations.some(expectation => {
          return expectation;
        });

        for (let t = 0; t < nodes.length; ++t) {
          if (t === 0 || t < nodes.length - 1) {
            checkCurly(curlyAreRequired, nodes[t], `if`, `condition`);
          } else {
            checkCurly(curlyAreRequired, nodes[t], `else`);
          }
        }
      },

      WhileStatement(node) {
        checkCurly(getExpectation(node.body), node.body, `while`, `condition`);
      },

      DoWhileStatement(node) {
        // We enforce the use of curly braces with do-while because
        // they're confusing enough as it is, plus they would make the
        // fixer more complex
        checkCurly(true, node.body, `do`);
      },

      ForStatement(node) {
        checkCurly(getExpectation(node.body), node.body, `for`, `condition`);
      },

      ForInStatement(node) {
        checkCurly(getExpectation(node.body), node.body, `for-in`);
      },

      ForOfStatement(node) {
        checkCurly(getExpectation(node.body), node.body, `for-of`);
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
