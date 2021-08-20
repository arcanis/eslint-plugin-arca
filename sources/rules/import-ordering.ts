/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {Rule}                 from 'eslint';
import type * as ESTree            from 'estree';

import {DEFAULT_SECTIONS_PATTERNS} from '../constants';

const rule: Rule.RuleModule = {
  meta: {
    fixable: `code`,

    schema: [{
      type: `object`,

      properties: {
        sections: {
          type: `array`,
          items: [{type: `string`}],
        },
        hoistOneliners: {
          type: `boolean`,
        },
      },
    }],
  },

  create(context) {
    const options = context.options[0] || {};

    const sectionsPatterns = (options.sections || DEFAULT_SECTIONS_PATTERNS) as Array<string>;
    const sectionsRegexps = sectionsPatterns.map(pattern => new RegExp(pattern));

    const sourceCode = context.getSourceCode();

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    function reportExpectedModuleToBeImportedBeforeAnotherError(node: ESTree.ImportDeclaration, firstErroneousImport: ESTree.ImportDeclaration, reason: string) {
      const importDeclarations = (node.parent as ESTree.Program).body.filter(node => {
        return node.type === `ImportDeclaration`;
      }) as Array<ESTree.ImportDeclaration>;

      return context.report({
        node,
        message: `Expected '{{source}}' to be imported before '{{otherSource}}' ({{reason}}).`,

        data: {
          source: `${node.source.value}`,
          otherSource: `${firstErroneousImport.source.value}`,
          reason,
        },

        fix(fixer) {
          return sortAndFixAllNodes(fixer, importDeclarations);
        },
      });
    }

    function findNonImportStatements(from: ESTree.ImportDeclaration, to: ESTree.ImportDeclaration) {
      const nonImportStatements: Array<Rule.Node> = [];

      const parentBody = (from.parent as ESTree.Program).body;

      const fromIndex = parentBody.indexOf(from);
      const toIndex = parentBody.indexOf(to);

      for (let t = fromIndex; t < toIndex; ++t)
        if (parentBody[t].type !== `ImportDeclaration`)
          nonImportStatements.push(parentBody[t]);

      return nonImportStatements;
    }

    function getReplaceStart(node: ESTree.Node) {
      let replaceStart: ESTree.BaseNodeWithoutComments = node;

      const comments = sourceCode.getCommentsBefore(node);
      for (let t = comments.length - 1; t >= 0; --t) {
        if (comments[t].type === `Line`) {
          replaceStart = comments[t] as ESTree.BaseNodeWithoutComments;
        } else {
          break;
        }
      }

      return replaceStart;
    }

    function getReplaceEnd(node: ESTree.BaseNodeWithoutComments) {
      return node;
    }

    function sortAndFixAllNodes(fixer: Rule.RuleFixer, importDeclarations: Array<ESTree.ImportDeclaration>) {
      const firstImportDeclaration = importDeclarations[0];
      const lastImportDeclaration = importDeclarations[importDeclarations.length - 1];

      const fromRange = getReplaceStart(firstImportDeclaration).range![0];
      const toRange = getReplaceEnd(lastImportDeclaration).range![1];

      const nonImportStatements = findNonImportStatements(
        firstImportDeclaration,
        lastImportDeclaration,
      );

      const fixedImports = importDeclarations.slice().sort((a, b) => {
        const compared = compareModules(a, b);
        if (compared[0] === null)
          return 0;

        return compared[0];
      }).reduce((sourceText, declaration, index) => {
        let comments = sourceCode.getCommentsBefore(declaration);

        if (declaration === importDeclarations[0]) {
          let preservedCommentCount = 0;
          while (preservedCommentCount < comments.length && comments[comments.length - preservedCommentCount - 1].type === `Line`)
            preservedCommentCount += 1;

          if (preservedCommentCount > 0) {
            comments = comments.slice(-preservedCommentCount);
          } else {
            comments = [];
          }
        }

        const textComments = comments.map(comment => {
          return `${sourceCode.getText(comment as any)}\n`;
        }).join(``);

        const textAfterSpecifier = index === importDeclarations.length - 1
          ? `` : sourceCode.getText().slice(importDeclarations[index].range![1], sourceCode.getTokenAfter(importDeclarations[index], {includeComments: true})!.range![0]);

        return sourceText + textComments + sourceCode.getText(declaration) + textAfterSpecifier;
      }, ``);

      const fixedNonImport = nonImportStatements.map(node => {
        return `\n${sourceCode.getText(node)}`;
      }).join(``);

      return fixer.replaceTextRange([fromRange, toRange], [
        fixedImports,
        fixedNonImport,
      ].join(``));
    }

    function getModuleLevel(path: string) {
      for (let t = 0, T = sectionsRegexps.length; t < T; ++ t)
        if (sectionsRegexps[t].test(path))
          return 1 + t;

      return 0;
    }

    function compareModules(a: Rule.Node, b: Rule.Node): [number | null, string?] {
      if (a.type !== `ImportDeclaration` || b.type !== `ImportDeclaration`)
        return [null];

      const aSource = a.source.value;
      const bSource = b.source.value;

      if (typeof aSource !== `string` || typeof bSource !== `string`)
        return [null];

      const aHasSideEffects = !a.specifiers.length;
      const bHasSideEffects = !b.specifiers.length;
      const aIsLocal = aSource.startsWith('.');
      const bIsLocal = bSource.startsWith('.');

      if (!aHasSideEffects && bHasSideEffects) {
        if (bIsLocal)
          return [-1, `local side-effects go last`];
        return [1, `side-effects go first`];
      }

      if (aHasSideEffects && !bHasSideEffects) {
        if (aIsLocal)
          return [1, `local side-effects go last`];
        return [-1, `side-effects go first`];
      }

      if (aHasSideEffects && bHasSideEffects) {
        if (aIsLocal && !bIsLocal)
          return [1, `local side-effects go last`];
        if (!aIsLocal && bIsLocal)
          return [-1, `local side-effects go last`];
      }

      const aMultiline = a.loc!.start.line !== a.loc!.end.line;
      const bMultiline = b.loc!.start.line !== b.loc!.end.line;

      if (options.hoistOneliners) {
        if (aMultiline && !bMultiline)
          return [1, `multiline imports are last`];

        if (!aMultiline && bMultiline) {
          return [-1, `multiline imports are last`];
        }
      }

      if (aSource === bSource)
        return [null];

      const aLevel = getModuleLevel(aSource);
      const bLevel = getModuleLevel(bSource);

      if (aLevel < bLevel) {
        if (aLevel === 0) {
          return [-1, `vendors go first`];
        } else {
          return [-1, `'${sectionsPatterns[aLevel - 1]}' goes before '${sectionsPatterns[bLevel - 1]}'`];
        }
      } else if (aLevel > bLevel) {
        if (bLevel === 0) {
          return [1, `vendors go first`];
        } else {
          return [1, `'${sectionsPatterns[bLevel - 1]}' goes before '${sectionsPatterns[aLevel - 1]}'`];
        }
      } else {
        if (bSource.substr(0, aSource.length + 1) === `${aSource}/`)
          return [1, `subdirectories go before their indexes`];

        if (aSource.substr(0, bSource.length + 1) === `${bSource}/`)
          return [-1, `subdirectories go before their indexes`];

        if (bSource.substr(0, aSource.length) === aSource)
          return [1, `lexicographic order`];

        if (aSource.substr(0, bSource.length) === bSource)
          return [-1, `lexicographic order`];

        if (aSource > bSource) {
          return [1, `lexicographic order`];
        } else {
          return [-1, `lexicographic order`];
        }
      }
    }

    function findFirstErroneousImport(node: ESTree.ImportDeclaration) {
      const parentBody = (node.parent as ESTree.Program).body;
      const nodeLocation = parentBody.indexOf(node);

      let iteratorLocation = nodeLocation;
      let iteratorNode = parentBody[iteratorLocation];

      let firstErroneousNode = null;
      let firstErrorReason = null;

      function iterate() {
        do {
          iteratorNode = parentBody[--iteratorLocation];
        } while (iteratorNode && iteratorNode.type !== `ImportDeclaration`);
      }

      iterate();

      for (let errorReason; iteratorNode && (errorReason = compareModules(iteratorNode, node))[0] === 1; iterate()) {
        firstErroneousNode = iteratorNode;
        firstErrorReason = errorReason[1]!;
      }

      if (firstErroneousNode && firstErrorReason) {
        return {node: firstErroneousNode as ESTree.ImportDeclaration, reason: firstErrorReason};
      } else {
        return null;
      }
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
      ImportDeclaration (node) {
        const firstErroneousImport = findFirstErroneousImport(node);
        if (!firstErroneousImport)
          return ;

        reportExpectedModuleToBeImportedBeforeAnotherError(node, firstErroneousImport.node, firstErroneousImport.reason);
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
