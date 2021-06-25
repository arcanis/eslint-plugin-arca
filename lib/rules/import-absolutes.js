/**
 * @fileoverview Ensure that each import in the file is correctly ordered relative to the others
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

const fs = require("fs");
const path = require("path");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {

    meta: {

      fixable: "code"

    },

    create: function(context) {

        const sourcePath = context.getFilename();


        let sourcePrefix = path.dirname(sourcePath);
        if (!sourcePrefix.endsWith(path.sep))
            sourcePrefix += path.sep;

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        function reportExpectedAbsoluteImportError(node) {

            const targetPath = path.resolve(path.dirname(sourcePath), node.source.value);
            const absoluteImport = getAbsoluteImport(targetPath);

            if (!absoluteImport)
                return;

            return context.report({

                node: node,

                message: "Expected import to be package-absolute (rather than '{{source}}').",

                data: {
                    source: node.source.value
                },

                fix: function (fixer) {

                    const fromRange = node.source.range[0];
                    const toRange = node.source.range[1];

                    return fixer.replaceTextRange([fromRange, toRange], `'${absoluteImport}'`);

                }

            });

        }

        function getAbsoluteImport(fileName) {

            let packagePath;

            let currentPath;
            let nextPath = path.dirname(fileName);
            do {
                currentPath = nextPath;
                nextPath = path.dirname(currentPath);
    
                if (fs.existsSync(path.join(currentPath, "package.json"))) {
                    packagePath = currentPath;
                    break;
                }
            } while (nextPath !== currentPath);
    
            if (!packagePath)
                return null;

            const packageInfo = require(path.join(packagePath, "package.json"));
            if (!packageInfo.name)
                return null;

            const subPath = path.relative(packagePath, fileName);
            if (!subPath)
                return packageInfo.name;

            return `${packageInfo.name}/${subPath}`;

        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            "ImportDeclaration": function (node) {

                if (node.source.value.match(/^\.{0,2}\//)) {
                    reportExpectedAbsoluteImportError(node);
                }

            }

        };

    }

};
