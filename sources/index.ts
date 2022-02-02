/**
 * @fileoverview A plugin to make Maël happy
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import curlyRule                     from './rules/curly';
import importAbsolutesRule           from './rules/import-absolutes';
import importAlignRule               from './rules/import-align';
import importOrderingRule            from './rules/import-ordering';
import importQuotesRule              from './rules/import-quotes';
import jsxImportReact                from './rules/jsx-import-react';
import jsxLonghandPropsRule          from './rules/jsx-longhand-props';
import jsxNoHtmlAttrs                from './rules/jsx-no-html-attrs';
import jsxNoStringStyles             from './rules/jsx-no-string-styles';
import meltedConstructsRule          from './rules/melted-constructs';
import newlineAfterImportSectionRule from './rules/newline-after-import-section';
import noDefaultExportRule           from './rules/no-default-export';

export const rules = {
  [`curly`]: curlyRule,
  [`import-absolutes`]: importAbsolutesRule,
  [`import-align`]: importAlignRule,
  [`import-ordering`]: importOrderingRule,
  [`import-quotes`]: importQuotesRule,
  [`jsx-import-react`]: jsxImportReact,
  [`jsx-longhand-props`]: jsxLonghandPropsRule,
  [`jsx-no-html-attrs`]: jsxNoHtmlAttrs,
  [`jsx-no-string-styles`]: jsxNoStringStyles,
  [`melted-constructs`]: meltedConstructsRule,
  [`newline-after-import-section`]: newlineAfterImportSectionRule,
  [`no-default-export`]: noDefaultExportRule,
};
