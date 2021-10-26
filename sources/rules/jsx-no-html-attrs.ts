/**
 * @fileoverview Ensure that all JSX props use the longhand style
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {Rule}                   from 'eslint';
import {JSXAttribute, JSXIdentifier} from 'estree-jsx';
import type * as ESTree              from 'estree';

import {camelize}                    from '../utils';

const rule: Rule.RuleModule = {
  meta: {
    fixable: `code`,
  },

  create(context) {
    function reportJsxHtmlAttr(node: JSXIdentifier, replacement: string) {
      context.report({
        node: node as any,
        loc: node.loc!.start,
        message: `This HTML attribute isn't formatted for use in React code.`,

        fix(fixer) {
          const fromRange = node.range![0];
          const toRange = node.range![1];

          return fixer.replaceTextRange([fromRange, toRange], replacement);
        },
      });
    }

    return {
      JSXAttribute(node: ESTree.Node) {
        const nodeTs = node as any as JSXAttribute;
        if (nodeTs.name.type !== `JSXIdentifier`)
          return;

        const name = nodeTs.name.name;

        if (name === `class`) {
          reportJsxHtmlAttr(nodeTs.name, `className`);
          return;
        }

        const match = name.match(/^(data-)?(.*)$/);
        if (!match)
          return;

        const fixedName = `${match[1] ?? ``}${camelize(match[2])}`;
        if (name !== fixedName) {
          reportJsxHtmlAttr(nodeTs.name, fixedName);
          return;
        }
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
