/**
 * @fileoverview Require from keywords to be aligned
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {Rule}      from 'eslint';
import type * as ESTree from 'estree';

const rule: Rule.RuleModule = {
  meta: {
    fixable: `whitespace`,

    schema: [{
      type: `object`,

      properties: {
        collapseExtraSpaces: {
          type: `boolean`,
        },

        minColumnWidth: {
          type: `number`,
        },
      },

      additionalProperties: false,
    }],
  },

  create(context) {
    const defaultOptions = {
      collapseExtraSpaces: false,
      minColumnWidth: 0,
    };

    const options = Object.assign({}, defaultOptions, context.options[0]);

    function getFromKeyword(node: Rule.Node) {
      if (node.type !== `ImportDeclaration`)
        return null;

      if (node.specifiers.length < 1)
        return null;

      const sourceCode = context.getSourceCode();

      let token = sourceCode.getTokenAfter(node.specifiers[node.specifiers.length - 1])!;
      while (token.type !== `Identifier` || token.value !== `from`)
        token = sourceCode.getTokenAfter(token)!;

      return token;
    }

    function reportUnalignedImportStatement(node: Rule.Node, diff: number) {
      const sourceCode = context.getSourceCode();

      const fromKeyword = getFromKeyword(node)!;
      const previousToken = sourceCode.getTokenBefore(fromKeyword)!;

      context.report({
        node,
        loc: fromKeyword.loc.start,
        message: `Unaligned import statement`,

        fix(fixer) {
          if (diff < 0) {
            const index = sourceCode.getIndexFromLoc(previousToken.loc.end);
            return fixer.removeRange([index, index + Math.abs(diff)]);
          } else {
            return fixer.insertTextAfter(previousToken, ` `.repeat(diff));
          }
        },
      });
    }

    function isSingleLine(node: Rule.Node) {
      const sourceCode = context.getSourceCode();

      const first = sourceCode.getFirstToken(node)!;
      const last = sourceCode.getLastToken(node)!;

      return first.loc.start.line === last.loc.end.line;
    }

    function isSuitableImport(node: Rule.Node): node is ESTree.ImportDeclaration {
      return node.type === `ImportDeclaration` && node.specifiers.length >= 1 && isSingleLine(node);
    }

    function findSurroundingImports(node: ESTree.ImportDeclaration) {
      const surroundingImports = [node];

      const parentBody = (node.parent as ESTree.Program).body;
      const nodeLocation = parentBody.indexOf(node);

      for (let t = nodeLocation - 1; t >= 0; --t) {
        const neighbour = parentBody[t];
        if (!isSuitableImport(neighbour))
          break;

        surroundingImports.unshift(neighbour);
      }

      for (let t = nodeLocation + 1; t < parentBody.length; ++t) {
        const neighbour = parentBody[t];
        if (!isSuitableImport(neighbour))
          break;

        surroundingImports.push(neighbour);
      }

      return surroundingImports;
    }

    function getLineInfo(node: Rule.Node) {
      const sourceCode = context.getSourceCode();

      const fromToken = getFromKeyword(node)!;
      const fromTokenStart = fromToken.loc.start.column;

      const prevToken = sourceCode.getTokenBefore(fromToken)!;
      const prevTokenEnd = prevToken.loc.end.column;

      return {
        prevTokenEnd,
        fromTokenStart,
      };
    }

    function getAlignmentColumn(lines: Array<{prevTokenEnd: number, fromTokenStart: number}>) {
      let alignmentColumn;

      if (options.collapseExtraSpaces) {
        // use greatest endpoint of previous tokens as alignment column
        alignmentColumn = lines.reduce((max, line) => {
          return Math.max(max, line.prevTokenEnd);
        }, 0);

        // add 1 for the space
        alignmentColumn += 1;
      } else {
        // use greatest start of from tokens as alignment column
        alignmentColumn = lines.reduce((max, line) => {
          return Math.max(max, line.fromTokenStart);
        }, 0);
      }

      // check if alignment column is lower than minColumnWidth, if defined
      if (options.minColumnWidth)
        alignmentColumn = Math.max(alignmentColumn, options.minColumnWidth);

      return alignmentColumn;
    }

    return {
      ImportDeclaration (node) {
        if (!isSuitableImport(node))
          return;

        const surroundingImports = findSurroundingImports(node);

        // get the prevTokenEnd and fromTokenStart of all lines
        const lines = surroundingImports.map(getLineInfo);

        const alignmentColumn = getAlignmentColumn(lines);

        // get current line info
        const line = getLineInfo(node);

        // check alignment of current line
        if (line.fromTokenStart !== alignmentColumn) {
          reportUnalignedImportStatement(node, alignmentColumn - line.fromTokenStart);
        }
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
