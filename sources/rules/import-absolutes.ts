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

type ImportInfo = {
  normalizedRelativePath: string ;
  normalizedAbsolutePath: string | null;
};

const isAbsolute = (path: string): boolean => !path.match(/^\.{0,2}\//);
const isRelative = (path: string): boolean => !isAbsolute(path);

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

    let sourceDirName = path.dirname(context.getFilename());
    if (!sourceDirName.endsWith(path.sep))
      sourceDirName += path.sep;

    const packagePath = getPackagePath(sourceDirName);
    const packageInfo = packagePath && require(path.join(packagePath, `package.json`)) || {};

    function isPackageImport(importPath: string): boolean {
      if (isRelative(importPath))
        return true;

      const bareSpecifier = path.normalize(importPath).split(path.sep)[0];
      return bareSpecifier === packageInfo.name;
    }

    function getAbsoluteImport(fileName: string): string | null {
      if (!packagePath)
        return null;

      if (!packageInfo.name)
        return null;

      const subPath = path.relative(packagePath, fileName);
      if (!subPath)
        return packageInfo.name;

      return `${packageInfo.name}/${subPath}`;
    }

    function getImportInfo(importPath: string): ImportInfo | null {
      if (!isPackageImport(importPath))
        return null;

      const targetPath = path.resolve(sourceDirName, importPath);

      return {
        normalizedAbsolutePath: getAbsoluteImport(targetPath),
        normalizedRelativePath: `./${path.relative(sourceDirName, targetPath)}` || `.`,
      };
    }


    return {
      ImportDeclaration (node) {
        if (!packagePath)
          return;

        const importPath = node.source.value;
        if (typeof importPath !== `string` || !isPackageImport(importPath))
          return;

        const importInfo = getImportInfo(importPath);
        if (!importInfo)
          return;

        const {normalizedRelativePath, normalizedAbsolutePath} = importInfo;

        const preferRelativeImport = preferRelative(importInfo.normalizedRelativePath);

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

        if (isAbsolute(importPath)) {
          if (preferRelativeImport) {
            report(
              `Expected absolute import to be relative (rather than '{{source}}').`,
              normalizedRelativePath
            );
          } else if (normalizedAbsolutePath && importPath !== normalizedAbsolutePath) {
            report(
              `Expected absolute import to be normalized (rather than '{{source}}').`,
              normalizedAbsolutePath
            );
          }
        } else {
          if (!preferRelativeImport && normalizedAbsolutePath !== null) {
            report(
              `Expected relative import to be package-absolute (rather than '{{source}}').`,
              normalizedAbsolutePath
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

function getPackagePath(startPath: string): string | undefined {
  let currentPath = path.resolve(startPath);
  let previousPath;

  while (currentPath !== previousPath) {
    if (fs.existsSync(path.join(currentPath, `package.json`)))
      return currentPath;

    previousPath = currentPath;
    currentPath = path.dirname(currentPath);
  }

  return undefined;
}

// eslint-disable-next-line arca/no-default-export
export default rule;
