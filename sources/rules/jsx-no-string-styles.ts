/**
 * @fileoverview Ensure that all JSX props use the longhand style
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {Rule}                            from 'eslint';
import {JSXAttribute, JSXExpressionContainer} from 'estree-jsx';
import type * as ESTree                       from 'estree';

import {camelize}                             from '../utils';

const rule: Rule.RuleModule = {
  meta: {
    fixable: `code`,
  },

  create(context) {
    function reportJsxStyleString(node: ESTree.Literal | JSXExpressionContainer, replacement: string | null) {
      context.report({
        node: node as any,
        loc: node.loc!.start,
        message: `Style props must be passed as objects.`,

        fix: replacement !== null ? fixer => {
          const fromRange = node.range![0];
          const toRange = node.range![1];

          return fixer.replaceTextRange([fromRange, toRange], `{${replacement}}`);
        } : undefined,
      });
    }

    function generateStyleObject(styleString: string) {
      const style: Record<string, string | number> = {};

      let key = ``;

      let buffer = ``;
      let parenCount = 0;

      for (let t = 0, T = styleString.length; t <= T; ++t) {
        if (t !== T) {
          if (styleString[t] === `(`) {
            buffer += `(`;
            parenCount += 1;
            continue;
          }

          if (parenCount > 0) {
            if (styleString[t] === `)`)
              parenCount -= 1;

            buffer += styleString[t];
            continue;
          }

          if (styleString[t] === `:`) {
            if (!key) {
              key = buffer;
              buffer = ``;
              continue;
            } else {
              return null;
            }
          }
        }

        if (t === T || styleString[t] === `;`) {
          const styleKey = key.trim();
          const styleValue = buffer.trim();

          if (!styleKey || !styleValue)
            return null;

          const numMatch = styleValue.match(/^([0-9.]+)(px)?$/);
          style[camelize(styleKey)] = numMatch ? parseInt(numMatch[1], 10) : styleValue;

          key = ``;
          buffer = ``;
          continue;
        }

        buffer += styleString[t];
      }

      return JSON.stringify(style);
    }

    return {
      JSXAttribute(node: ESTree.Node) {
        const nodeTs = node as any as JSXAttribute;
        if (nodeTs.name.name !== `style`)
          return;

        if (nodeTs.value?.type === `Literal` && typeof nodeTs.value?.value === `string`)
          reportJsxStyleString(nodeTs.value, generateStyleObject(nodeTs.value.value));

        if (nodeTs.value?.type === `JSXExpressionContainer`) {
          if (nodeTs.value.expression.type === `ObjectExpression`)
            return;

          if (nodeTs.value.expression.type === `Literal` && typeof nodeTs.value.expression.value === `string`) {
            reportJsxStyleString(nodeTs.value, generateStyleObject(nodeTs.value.expression.value));
            return;
          }

          if (nodeTs.value.expression.type === `TemplateLiteral` && nodeTs.value.expression.quasis.length === 1) {
            reportJsxStyleString(nodeTs.value, generateStyleObject(nodeTs.value.expression.quasis[0]!.value.cooked!));
            return;
          }

          reportJsxStyleString(nodeTs.value, null);
        }
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
