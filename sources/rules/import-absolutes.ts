/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import type {Rule}      from 'eslint';
import type * as ESTree from 'estree';
import fs               from 'fs';
import path             from 'path';

const isAbsolute = (path: string): boolean => (!path.match(/^\.{0,2}\//));

const rule: Rule.RuleModule = {
  meta: {
    fixable: `code`,

    schema: [{
      type: `object`,

      properties: {
        preferRelative: {
          type: `string`,
        },
      },

      additionalProperties: false,
    }],
  },

  create(context) {
    const preferRelativeRegex = context?.options[0]?.preferRelative ? new RegExp(context.options[0].preferRelative) : undefined;
    const preferRelative = preferRelativeRegex ? (path: string) => preferRelativeRegex.test(path) : () => false;

    const sourcePath = context.getFilename();

    let sourceDirName = path.dirname(sourcePath);
    if (!sourceDirName.endsWith(path.sep))
      sourceDirName += path.sep;

    function getAbsoluteImport(fileName: string): string | null {
      let packagePath;

      let currentPath;
      let nextPath = path.dirname(fileName);
      do {
        currentPath = nextPath;
        nextPath = path.dirname(currentPath);

        if (fs.existsSync(path.join(currentPath, `package.json`))) {
          packagePath = currentPath;
          break;
        }
      } while (nextPath !== currentPath);

      if (!packagePath)
        return null;

      const packageInfo = require(path.join(packagePath, `package.json`));
      if (!packageInfo.name)
        return null;

      const subPath = path.relative(packagePath, fileName);
      if (!subPath)
        return packageInfo.name;

      return `${packageInfo.name}/${subPath}`;
    }

    return {
      ImportDeclaration (node) {
        const importPath = node.source.value;

        if (typeof importPath !== `string`)
          return;

        const report = (message: string, replacement: string) => context.report({
          node,
          message,
          data: {
            source: importPath,
          },
          fix(fixer) {
            const fromRange = node.source.range![0];
            const toRange = node.source.range![1];

            return fixer.replaceTextRange([fromRange, toRange], `'${replacement}'`);
          },
        });

        const targetPath = path.resolve(sourceDirName, importPath);
        const absoluteImport = getAbsoluteImport(targetPath);
        const normalizedRelativePath = `./${path.relative(sourceDirName, targetPath)}` || `.`;
        const preferRelativeImport = preferRelative(normalizedRelativePath);

        if (isAbsolute(importPath)) {
          if (absoluteImport === null || !fs.existsSync(absoluteImport))
            return;

          if (preferRelativeImport) {
            report(
              `Expected absolute import to be relative (rather than '{{source}}').`,
              normalizedRelativePath
            );
          } else if (importPath !== absoluteImport) {
            report(
              `Expected absolute import to be normalized (rather than '{{source}}').`,
              absoluteImport
            );
          }
        } else {
          if (!preferRelativeImport && absoluteImport !== null) {
            report(
              `Expected relative import to be package-absolute (rather than '{{source}}').`,
              absoluteImport
            );
          } else if (preferRelativeImport && importPath !== normalizedRelativePath) {
            report(
              `Expected relative import to be normalized (rather than '{{source}}').`,
              normalizedRelativePath
            );
          }
        }
      },
    };
  },
};

// eslint-disable-next-line arca/no-default-export
export default rule;
