var module = require("module");

var constants = require("./constants");

exports.resolve = function resolve(what, from) {

    if (what == null)
        return what;

    if (module.createRequire) {
        return module.createRequire(from)(what);
    } else if (module.createRequireFromPath) {
        return module.createRequireFromPath(from)(what);
    } else {
        throw new Error("Need a more modern Node");
    }

};

exports.getSections = function getSections(userPatterns) {

    var sectionPatterns = (userPatterns || constants.DEFAULT_SECTIONS_PATTERNS);

    return sectionPatterns.map(function (pattern) {
        return {pattern: pattern, regexp: new RegExp(pattern)};
    });

};

exports.getModuleLevel = function getModuleLevel(moduleName, sections, transformer) {

    for (var t = 0; t < sections.length; ++t)
        if ((transformer ? transformer(moduleName) : moduleName).match(sections[t].regexp))
            return t + 1;

    return 0;

};

exports.compareModules = function compareModules(a, b, sections, transformer) {

    if (a.type !== "ImportDeclaration" || b.type !== "ImportDeclaration")
        return null;

    if (a.specifiers.length && !b.specifiers.length)
        return "side-effects go first";

    if (!a.specifiers.length && b.specifiers.length)
        return null;

    var aSource = a.source.value;
    var bSource = b.source.value;

    if (aSource === bSource)
        return null;

    var aLevel = exports.getModuleLevel(aSource, sections, transformer);
    var bLevel = exports.getModuleLevel(bSource, sections, transformer);

    if (aLevel < bLevel) {

        return null;

    } else if (aLevel > bLevel) {

        if (bLevel === 0) {
            return "vendors go first";
        } else {
            return "'" + sections[bLevel - 1].pattern + "' goes before '" + sections[aLevel - 1].pattern + "'";
        }

    } else {

        if (bSource.substr(0, aSource.length + 1) === aSource + "/")
            return "subdirectories go before their indexes";

        if (bSource.substr(0, aSource.length) === aSource)
            return "lexicographic order";

        if (aSource.substr(0, bSource.length) === bSource)
            return null;

        if (aSource > bSource) {
            return "lexicographic order";
        } else {
            return null;
        }

    }

};
