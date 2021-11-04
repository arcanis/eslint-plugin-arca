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
  relativePath: string ;
  absolutePath: string;
};

const isAbsolute = (path: string): boolean => !path.match(/^\.{0,2}(\/|$)/);
const isRelative = (path: string): boolean => !isAbsolute(path);

const withEndSep = (input: string) => input.endsWith(path.sep) ? input : `${input}${path.sep}`;

const getReplaceAbsolutePathStart = (
  replacementSpecs: Array<{from: string, to: string}>
): (path: string) => {adjustedPath: string, from: string, to: string} | null => {
  const validatedSpec = replacementSpecs.map(({from, to}) => {
    if (!isAbsolute(from) || !isAbsolute(to))
      throw new Error(`'from' specifier must be an absolute path instead of ${from}`);

    const f = withEndSep(from);
    return {
      from: f,
      fromRegex: new RegExp(`^${f}`),
      to: withEndSep(to),
    };
  });

  return path => {
    for (const {from, fromRegex, to} of validatedSpec) {
      const candidate = path.replace(fromRegex, to);
      if (candidate !== path) {
        return {adjustedPath: candidate, from, to};
      }
    }

    return null;
  };
};

const rule: Rule.RuleModule = {
  meta: {
    fixable: `code`,

    schema: [{
      type: `object`,

      properties: {
        preferRelative: {
          type: `string`,
        },
        replaceAbsolutePathStart: {
          type: `array`,

          items: [{
            type: `object`,

            properties: {
              from: {type: `string`},
              to: {type: `string`},
            },
          }],
        },
      },

      additionalProperties: false,
    }],
  },

  create(context) {
    const options = context.options[0] || {};

    const preferRelativeRegex = options.preferRelative ? new RegExp(options.preferRelative) : undefined;
    const preferRelative = preferRelativeRegex ? (path: string) => preferRelativeRegex.test(path) : () => false;

    const replaceAbsolutePathStart = getReplaceAbsolutePathStart(options.replaceAbsolutePathStart || []);

    const sourceDirName = withEndSep(path.dirname(context.getFilename()));

    const packageDir = getPackagePath(sourceDirName);
    const packageInfo = packageDir && require(path.join(packageDir, `package.json`)) || {};

    function isPackageImport(importPath: string): boolean {
      return isRelative(importPath) ||
        importPath.startsWith(`${packageInfo.name}/`);
    }

    function getImportInfo(importPath: string): ImportInfo | null {
      if (
        !isPackageImport(importPath) ||
        packageDir === undefined ||
        packageInfo.name === undefined
      )
        return null;

      const targetPath = isRelative(importPath) ?
        path.resolve(sourceDirName, importPath)
        : path.join(packageDir, importPath.slice(packageInfo.name.length));

      let relativePath = path.relative(sourceDirName, targetPath) || `.`;

      if (isAbsolute(relativePath))
        relativePath = `./${relativePath}`;
      if (relativePath.match(/(^|\/)\.{0,2}$/))
        relativePath = `${relativePath}/index`;

      return {
        absolutePath: `${packageInfo.name}/${path.relative(packageDir, targetPath)}`,
        relativePath,
      };
    }


    return {
      ImportDeclaration (node) {
        const importPath = node.source.value;
        if (typeof importPath !== `string` || !isPackageImport(importPath))
          return;

        const importInfo = getImportInfo(importPath);
        if (!importInfo)
          return;

        const {relativePath, absolutePath} = importInfo;

        const preferRelativeImport = preferRelative(importInfo.relativePath);
        const adjustedAbsolutePath = replaceAbsolutePathStart(absolutePath);

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
              relativePath
            );
          } else if (importPath !== absolutePath) {
            report(
              `Expected absolute import to be normalized (rather than '{{source}}').`,
              absolutePath
            );
          } else if (adjustedAbsolutePath !== null) {
            const {adjustedPath, from, to} = adjustedAbsolutePath;
            report(
              `Expected absolute import to start with '${to}' prefix (rather than '${from}').`,
              adjustedPath
            );
          }
        } else {
          if (!preferRelativeImport) {
            report(
              `Expected relative import to be package-absolute (rather than '{{source}}').`,
              adjustedAbsolutePath !== null ? adjustedAbsolutePath.adjustedPath : absolutePath
            );
          } else if (preferRelativeImport && importPath !== relativePath) {
            report(
              `Expected relative import to be normalized (rather than '{{source}}').`,
              relativePath
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
