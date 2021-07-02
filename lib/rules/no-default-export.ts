/**
 * @fileoverview Disallow default exports
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

import type {Rule} from 'eslint';

const rule: Rule.RuleModule = {
  create(context) {
    return {
      ExportDefaultDeclaration (node) {
        context.report({
          node,
          message: `Unexpected default export.`,
        });
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
