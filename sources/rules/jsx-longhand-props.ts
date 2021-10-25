/**
 * @fileoverview Ensure that all JSX props use the longhand style
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {Rule}      from 'eslint';
import {JSXAttribute}   from 'estree-jsx';
import type * as ESTree from 'estree';

const rule: Rule.RuleModule = {
  meta: {
    fixable: `code`,
  },

  create(context) {
    function reportJsxPropsEnforceLonghand(node: ESTree.Literal) {
      context.report({
        node: node as any,
        loc: node.loc!.start,
        message: `JSX props must use the longhand style.`,

        fix(fixer) {
          const fromRange = node.range![0];
          const toRange = node.range![1];

          const sourceCode = context.getSourceCode();
          const text = sourceCode.getText(node);

          return fixer.replaceTextRange([fromRange, toRange], `{${text}}`);
        },
      });
    }

    return {
      JSXAttribute(node: ESTree.Node) {
        const nodeTs = node as any as JSXAttribute;

        if (nodeTs.value?.type === `Literal`) {
          reportJsxPropsEnforceLonghand(nodeTs.value);
        }
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
