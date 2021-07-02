/**
 * @fileoverview Require an empty newline after an import section
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {Rule}                 from 'eslint';
import type * as ESTree            from 'estree';

import {DEFAULT_SECTIONS_PATTERNS} from '../constants';

const rule: Rule.RuleModule = {
  meta: {
    fixable: `whitespace`,

    schema: [{
      type: `object`,

      properties: {
        sections: {
          type: `array`,
          items: [{type: `string`}],
        },
        enableOnelinerSections: {
          type: `boolean`,
        },
      },
    }],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    const options = context.options[0] || {};

    const sectionsPatterns = (options.sections || DEFAULT_SECTIONS_PATTERNS) as Array<string>;
    const sectionsRegexps = sectionsPatterns.map(pattern => new RegExp(pattern));

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    function reportExpectedBlankLineAfterImportSection(node: Rule.Node) {
      return context.report({
        node,
        message: `Expected blank line after import section.`,

        fix(fixer) {
          return fixer.insertTextAfter(node, `\n`);
        },
      });
    }

    function reportExtraneousBlankLineWithinImportSection(node: Rule.Node) {
      return context.report({
        node,
        message: `Expected no blank lines between imports of a same section.`,

        fix(fixer) {
          const afterNewLine = sourceCode.getIndexFromLoc({line: sourceCode.getLastToken(node)!.loc.end.line + 1, column: 0});
          const beforeNewLine = afterNewLine - 1;

          return fixer.removeRange([beforeNewLine, afterNewLine]);
        },
      });
    }

    function getModuleLevel(path: string) {
      for (let t = 0, T = sectionsRegexps.length; t < T; ++ t)
        if (sectionsRegexps[t].test(path))
          return 1 + t;

      return 0;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

      ImportDeclaration(node) {
        if (typeof node.source.value !== `string`)
          return;

        const parentBody = (node.parent as ESTree.Program).body;

        const location = parentBody.indexOf(node);
        const nextNodeLocation = location + 1;
        if (nextNodeLocation === parentBody.length)
          return;

        const nextNode = parentBody[nextNodeLocation];

        const line = node.loc!.end.line;
        const nextLine = sourceCode.getTokenAfter(node, {includeComments: true})!.loc!.start.line;

        if (nextNode.type === `ImportDeclaration` && typeof nextNode.source.value === `string`) {
          let level = getModuleLevel(node.source.value);
          let levelNext = getModuleLevel(nextNode.source.value);

          if (options.enableOnelinerSections) {
            if (node.loc!.start.line !== node.loc!.end.line)
              level |= 0x10000000;
            if (nextNode.loc!.start.line !== nextNode.loc!.end.line) {
              levelNext |= 0x10000000;
            }
          }

          if (level === levelNext) {
            if (nextLine - line > 1) {
              reportExtraneousBlankLineWithinImportSection(node);
            } else {
              return;
            }
          }
        }

        if (nextLine - line < 2) {
          reportExpectedBlankLineAfterImportSection(node);
        }
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
