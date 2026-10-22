// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/common/search.ts
import { createDecorator2 } from "./module-0048.mjs";
import { fuzzyContains, getNLines } from "./module-0023.mjs";
import { mapArrayOrNot } from "./module-0006.mjs";
import { deepClone, mixin } from "./module-0042.mjs";
import { match, parse3 } from "./module-0185.mjs";
import { isEqualOrParent } from "./module-0024.mjs";
import { relative } from "./module-0019.mjs";
import { isThenable } from "./module-0029.mjs";


// src/vs/workbench/services/search/common/search.ts
var DEFAULT_MAX_SEARCH_RESULTS = 2e4;

var SEARCH_ELIDED_PREFIX = "\u27EA ";

var SEARCH_ELIDED_SUFFIX = " characters skipped \u27EB";

var SEARCH_ELIDED_MIN_LEN = (SEARCH_ELIDED_PREFIX.length + SEARCH_ELIDED_SUFFIX.length + 5) * 2;

var ISearchService = createDecorator2("searchService");

function resultIsMatch(result) {
  return !!result.rangeLocations && !!result.previewText;
}

var TextSearchMatch = class {
  constructor(text, ranges, previewOptions, webviewIndex) {
    this.rangeLocations = [];
    this.webviewIndex = webviewIndex;
    const rangesArr = Array.isArray(ranges) ? ranges : [ranges];
    if (previewOptions && previewOptions.matchLines === 1 && isSingleLineRangeList(rangesArr)) {
      text = getNLines(text, previewOptions.matchLines);
      let result = "";
      let shift = 0;
      let lastEnd = 0;
      const leadingChars = Math.floor(previewOptions.charsPerLine / 5);
      for (const range of rangesArr) {
        const previewStart = Math.max(range.startColumn - leadingChars, 0);
        const previewEnd = range.startColumn + previewOptions.charsPerLine;
        if (previewStart > lastEnd + leadingChars + SEARCH_ELIDED_MIN_LEN) {
          const elision = SEARCH_ELIDED_PREFIX + (previewStart - lastEnd) + SEARCH_ELIDED_SUFFIX;
          result += elision + text.slice(previewStart, previewEnd);
          shift += previewStart - (lastEnd + elision.length);
        } else {
          result += text.slice(lastEnd, previewEnd);
        }
        lastEnd = previewEnd;
        this.rangeLocations.push({
          source: range,
          preview: new OneLineRange(0, range.startColumn - shift, range.endColumn - shift)
        });
      }
      this.previewText = result;
    } else {
      const firstMatchLine = Array.isArray(ranges) ? ranges[0].startLineNumber : ranges.startLineNumber;
      const rangeLocs = mapArrayOrNot(ranges, (r2) => ({
        preview: new SearchRange(r2.startLineNumber - firstMatchLine, r2.startColumn, r2.endLineNumber - firstMatchLine, r2.endColumn),
        source: r2
      }));
      this.rangeLocations = Array.isArray(rangeLocs) ? rangeLocs : [rangeLocs];
      this.previewText = text;
    }
  }
};

function isSingleLineRangeList(ranges) {
  const line = ranges[0].startLineNumber;
  for (const r2 of ranges) {
    if (r2.startLineNumber !== line || r2.endLineNumber !== line) {
      return false;
    }
  }
  return true;
}

var SearchRange = class {
  constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
    this.startLineNumber = startLineNumber;
    this.startColumn = startColumn;
    this.endLineNumber = endLineNumber;
    this.endColumn = endColumn;
  }
};

var OneLineRange = class extends SearchRange {
  constructor(lineNumber, startColumn, endColumn) {
    super(lineNumber, startColumn, lineNumber, endColumn);
  }
};

function getExcludes(configuration, includeSearchExcludes = true) {
  const fileExcludes = configuration && configuration.files && configuration.files.exclude;
  const searchExcludes = includeSearchExcludes && configuration && configuration.search && configuration.search.exclude;
  if (!fileExcludes && !searchExcludes) {
    return void 0;
  }
  if (!fileExcludes || !searchExcludes) {
    return fileExcludes || searchExcludes || void 0;
  }
  let allExcludes = /* @__PURE__ */ Object.create(null);
  allExcludes = mixin(allExcludes, deepClone(fileExcludes));
  allExcludes = mixin(allExcludes, deepClone(searchExcludes), true);
  return allExcludes;
}

function pathIncludedInQuery(queryProps, fsPath) {
  const globOptions = queryProps.ignoreGlobCase ? { ignoreCase: true } : void 0;
  if (queryProps.excludePattern && match(queryProps.excludePattern, fsPath, globOptions)) {
    return false;
  }
  if (queryProps.includePattern || queryProps.usingSearchPaths) {
    if (queryProps.includePattern && match(queryProps.includePattern, fsPath, globOptions)) {
      return true;
    }
    if (queryProps.usingSearchPaths) {
      return !!queryProps.folderQueries && queryProps.folderQueries.some((fq) => {
        const searchPath = fq.folder.fsPath;
        if (isEqualOrParent(fsPath, searchPath, queryProps.ignoreGlobCase)) {
          const relPath = relative(searchPath, fsPath);
          return !fq.includePattern || !!match(fq.includePattern, relPath, globOptions);
        } else {
          return false;
        }
      });
    }
    return false;
  }
  return true;
}

var SearchError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
};

function serializeSearchError(searchError) {
  const details = { message: searchError.message, code: searchError.code };
  return new Error(JSON.stringify(details));
}

function isSerializedFileMatch(arg) {
  return !!arg.path;
}

var filePatternIgnoreCaseOptions = { ignoreCase: true };

function isFilePatternMatch(candidate, filePatternToUse, fuzzy = true, ignoreCase) {
  const pathToMatch = candidate.searchPath ? candidate.searchPath : candidate.relativePath;
  return fuzzy ? fuzzyContains(pathToMatch, filePatternToUse) : match(filePatternToUse, pathToMatch, ignoreCase ? filePatternIgnoreCaseOptions : void 0);
}

function resolvePatternsForProvider(globalPattern, folderPattern) {
  const merged = {
    ...globalPattern || {},
    ...folderPattern || {}
  };
  return Object.keys(merged).filter((key) => {
    const value = merged[key];
    return typeof value === "boolean" && value;
  });
}

var QueryGlobTester = class {
  constructor(config, folderQuery) {
    this._parsedIncludeExpression = null;
    const globOptions = config.ignoreGlobCase || folderQuery.ignoreGlobCase ? { ignoreCase: true } : void 0;
    this._excludeExpression = folderQuery.excludePattern?.map((excludePattern) => {
      return {
        ...config.excludePattern || {},
        ...excludePattern.pattern || {}
      };
    }) ?? [];
    if (this._excludeExpression.length === 0) {
      this._excludeExpression = [config.excludePattern || {}];
    }
    this._parsedExcludeExpression = this._excludeExpression.map((e) => parse3(e, globOptions));
    let includeExpression = config.includePattern;
    if (folderQuery.includePattern) {
      if (includeExpression) {
        includeExpression = {
          ...includeExpression,
          ...folderQuery.includePattern
        };
      } else {
        includeExpression = folderQuery.includePattern;
      }
    }
    if (includeExpression) {
      this._parsedIncludeExpression = parse3(includeExpression, globOptions);
    }
  }
  _evalParsedExcludeExpression(testPath, basename3, hasSibling) {
    let result = null;
    for (const folderExclude of this._parsedExcludeExpression) {
      const evaluation = folderExclude(testPath, basename3, hasSibling);
      if (typeof evaluation === "string") {
        result = evaluation;
        break;
      }
    }
    return result;
  }
  matchesExcludesSync(testPath, basename3, hasSibling) {
    if (this._parsedExcludeExpression && this._evalParsedExcludeExpression(testPath, basename3, hasSibling)) {
      return true;
    }
    return false;
  }
  /**
   * Guaranteed sync - siblingsFn should not return a promise.
   */
  includedInQuerySync(testPath, basename3, hasSibling) {
    if (this._parsedExcludeExpression && this._evalParsedExcludeExpression(testPath, basename3, hasSibling)) {
      return false;
    }
    if (this._parsedIncludeExpression && !this._parsedIncludeExpression(testPath, basename3, hasSibling)) {
      return false;
    }
    return true;
  }
  /**
   * Evaluating the exclude expression is only async if it includes sibling clauses. As an optimization, avoid doing anything with Promises
   * unless the expression is async.
   */
  includedInQuery(testPath, basename3, hasSibling) {
    const isIncluded = () => {
      return this._parsedIncludeExpression ? !!this._parsedIncludeExpression(testPath, basename3, hasSibling) : true;
    };
    return Promise.all(this._parsedExcludeExpression.map((e) => {
      const excluded = e(testPath, basename3, hasSibling);
      if (isThenable(excluded)) {
        return excluded.then((excluded2) => {
          if (excluded2) {
            return false;
          }
          return isIncluded();
        });
      }
      return isIncluded();
    })).then((e) => e.some((e2) => !!e2));
  }
  hasSiblingExcludeClauses() {
    return this._excludeExpression.reduce((prev, curr) => hasSiblingClauses(curr) || prev, false);
  }
};

function hasSiblingClauses(pattern) {
  for (const key in pattern) {
    if (typeof pattern[key] !== "boolean") {
      return true;
    }
  }
  return false;
}

function hasSiblingPromiseFn(siblingsFn) {
  if (!siblingsFn) {
    return void 0;
  }
  let siblings;
  return (name) => {
    if (!siblings) {
      siblings = (siblingsFn() || Promise.resolve([])).then((list2) => list2 ? listToMap(list2) : {});
    }
    return siblings.then((map) => !!map[name]);
  };
}

function hasSiblingFn(siblingsFn) {
  if (!siblingsFn) {
    return void 0;
  }
  let siblings;
  return (name) => {
    if (!siblings) {
      const list2 = siblingsFn();
      siblings = list2 ? listToMap(list2) : {};
    }
    return !!siblings[name];
  };
}

function listToMap(list2) {
  const map = {};
  for (const key of list2) {
    map[key] = true;
  }
  return map;
}

function excludeToGlobPattern(excludesForFolder) {
  return excludesForFolder.flatMap((exclude) => exclude.patterns.map((pattern) => {
    return exclude.baseUri ? {
      baseUri: exclude.baseUri,
      pattern
    } : pattern;
  }));
}

var DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS = {
  matchLines: 100,
  charsPerLine: 1e4
};
export { resultIsMatch, isSingleLineRangeList, getExcludes, pathIncludedInQuery, serializeSearchError, isSerializedFileMatch, isFilePatternMatch, resolvePatternsForProvider, hasSiblingClauses, hasSiblingPromiseFn, hasSiblingFn, listToMap, excludeToGlobPattern, DEFAULT_MAX_SEARCH_RESULTS, SEARCH_ELIDED_PREFIX, SEARCH_ELIDED_SUFFIX, SEARCH_ELIDED_MIN_LEN, ISearchService, TextSearchMatch, SearchRange, OneLineRange, SearchError, filePatternIgnoreCaseOptions, QueryGlobTester, DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS };
