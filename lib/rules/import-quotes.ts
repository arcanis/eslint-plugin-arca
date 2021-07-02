/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
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
    function reportExpectedSingleQuotesError(node: ESTree.ImportDeclaration) {
      return context.report({
        node,
        message: `Expected import to use single quotes.`,

        fix (fixer) {
          const fromRange = node.source.range![0];
          const toRange = node.source.range![1];

          return fixer.replaceTextRange([fromRange, toRange], `'${node.source.value}'`);
        },
      });
    }

    return {
      ImportDeclaration(node) {
        if (!node.source.raw!.startsWith(`'`)) {
          reportExpectedSingleQuotesError(node);
        }
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
