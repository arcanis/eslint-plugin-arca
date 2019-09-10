var utils = require("./utils");

exports.generateFix = function generateFix(sourceCode, fixer, importDeclarations, opts) {

    var sections = opts.sections || [];

    var enableImportOrdering = opts.enableImportOrdering;
    var enableImportSections = opts.enableImportSections;

    var importSourceTransformer = opts.importSourceTransformer;

    function findNonImportStatements(from, to) {

        var nonImportStatements = [];

        var parentBody = from.parent.body;

        var fromIndex = parentBody.indexOf(from);
        var toIndex = parentBody.indexOf(to);

        for (var t = fromIndex; t < toIndex; ++t)
            if (parentBody[t].type !== "ImportDeclaration")
                nonImportStatements.push(parentBody[t]);

        return nonImportStatements;

    }

    function getReplaceStart(node) {

        var replaceStart = node;
        var comments = sourceCode.getCommentsBefore(node);

        for (var t = comments.length - 1; t >= 0; --t) {
            if (comments[t].type === "Line") {
                replaceStart = comments[t];
            } else {
                break;
            }
        }

        return replaceStart;

    }

    function getReplaceEnd(node) {

        return node;

    }

    function getNewline(upperNode, lowerNode) {

        var referenceUpperSource = importSourceTransformer ? importSourceTransformer(upperNode.source.value) : upperNode.source.value;
        var referenceLowerSource = importSourceTransformer ? importSourceTransformer(lowerNode.source.value) : lowerNode.source.value;

        var upperLevel = utils.getModuleLevel(referenceUpperSource, sections);
        var lowerLevel = utils.getModuleLevel(referenceLowerSource, sections);

        if (enableImportSections && upperLevel !== lowerLevel) {
            return `\n\n`;
        } else {
            return `\n`;
        }

    }

    function applyImportSourceTransformer(node) {

        var replacement = importSourceTransformer(node.source.value);

        if (replacement === node.source.value)
            return sourceCode.getText(node);

        var firstIndex = sourceCode.getFirstToken(node).range[0];
        var firstSourceIndex = sourceCode.getFirstToken(node.source).range[0];
        var lastSourceIndex = sourceCode.getLastToken(node.source).range[1];
        var lastIndex = sourceCode.getLastToken(node).range[1];

        var code = sourceCode.getText();

        var before = code.slice(firstIndex, firstSourceIndex);
        var after = code.slice(lastSourceIndex, lastIndex);

        return `${before}'${replacement}'${after}`;

    }

    var firstImportDeclaration = importDeclarations[0];
    var lastImportDeclaration = importDeclarations[importDeclarations.length - 1];

    var fromRange = getReplaceStart(firstImportDeclaration).range[0];
    var toRange = getReplaceEnd(lastImportDeclaration).range[1];

    var nonImportStatements = findNonImportStatements(
        firstImportDeclaration,
        lastImportDeclaration
    );

    var sortedDeclarations = importDeclarations.slice();

    if (enableImportOrdering) {

        sortedDeclarations.sort(function (upperNode, lowerNode) {
            return utils.compareModules(upperNode, lowerNode, sections, importSourceTransformer) === null ? -1 : 1
        });

    }

    var fixedImports = sortedDeclarations.reduce(function (sourceText, declaration, index) {

        var comments = sourceCode.getCommentsBefore(declaration);

        if (declaration === importDeclarations[0]) {

            var preservedCommentCount = 0;

            while (preservedCommentCount < comments.length && comments[comments.length - preservedCommentCount - 1].type === "Line")
                preservedCommentCount += 1;

            if (preservedCommentCount > 0) {
                comments = comments.slice(-preservedCommentCount);
            } else {
                comments = [];
            }

        }

        var textComments = comments.map(function (comment) {
            return sourceCode.getText(comment) + "\n";
        }).join("");

        var textAfterSpecifier = index === importDeclarations.length - 1
            ? sourceCode.getTokenAfter(importDeclarations[index]) ? sourceCode.getText().slice(importDeclarations[index].range[1], sourceCode.getTokenAfter(importDeclarations[index], {includeComments: true}).range[0]) : ""
            : getNewline(sortedDeclarations[index], sortedDeclarations[index + 1]);

        var fixedDeclaration = importSourceTransformer
            ? applyImportSourceTransformer(declaration)
            : sourceCode.getText(declaration);

        return sourceText + textComments + fixedDeclaration + textAfterSpecifier;

    }, "");

    var fixedNonImport = nonImportStatements.map(function (node) {
        return '\n' + sourceCode.getText(node);
    }).join('');

    return fixer.replaceTextRange([fromRange, toRange], [
        fixedImports,
        fixedNonImport
    ].join(""));

}
