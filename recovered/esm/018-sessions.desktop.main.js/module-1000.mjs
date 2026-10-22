// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/search/common/search.ts
import { createDecorator } from "./module-0077.mjs";
import { getNLines } from "./module-0030.mjs";
import { mapArrayOrNot } from "./module-0007.mjs";
import { deepClone, mixin } from "./module-0098.mjs";
import { match } from "./module-0857.mjs";
import { isEqualOrParent } from "./module-0031.mjs";
import { relative } from "./module-0026.mjs";
import { isCancellationError } from "./module-0004.mjs";


// src/vs/workbench/services/search/common/search.ts
var VIEW_ID = "workbench.view.search";

var SEARCH_RESULT_LANGUAGE_ID = "search-result";

var SEARCH_EXCLUDE_CONFIG = "search.exclude";

var DEFAULT_MAX_SEARCH_RESULTS = 2e4;

var SEARCH_ELIDED_PREFIX = "\u27EA ";

var SEARCH_ELIDED_SUFFIX = " characters skipped \u27EB";

var SEARCH_ELIDED_MIN_LEN = (SEARCH_ELIDED_PREFIX.length + SEARCH_ELIDED_SUFFIX.length + 5) * 2;

var ISearchService = createDecorator("searchService");

function resultIsMatch(result) {
  return !!result.rangeLocations && !!result.previewText;
}

function isFileMatch(p) {
  return !!p.resource;
}

function isAIKeyword(p) {
  return !!p.keyword;
}

function isProgressMessage(p) {
  return !!p.message;
}

var FileMatch = class {
  constructor(resource) {
    this.resource = resource;
    this.results = [];
  }
};

var TextSearchMatch = class {
  constructor(text2, ranges, previewOptions, webviewIndex) {
    this.rangeLocations = [];
    this.webviewIndex = webviewIndex;
    const rangesArr = Array.isArray(ranges) ? ranges : [ranges];
    if (previewOptions && previewOptions.matchLines === 1 && isSingleLineRangeList(rangesArr)) {
      text2 = getNLines(text2, previewOptions.matchLines);
      let result = "";
      let shift2 = 0;
      let lastEnd = 0;
      const leadingChars = Math.floor(previewOptions.charsPerLine / 5);
      for (const range2 of rangesArr) {
        const previewStart = Math.max(range2.startColumn - leadingChars, 0);
        const previewEnd = range2.startColumn + previewOptions.charsPerLine;
        if (previewStart > lastEnd + leadingChars + SEARCH_ELIDED_MIN_LEN) {
          const elision = SEARCH_ELIDED_PREFIX + (previewStart - lastEnd) + SEARCH_ELIDED_SUFFIX;
          result += elision + text2.slice(previewStart, previewEnd);
          shift2 += previewStart - (lastEnd + elision.length);
        } else {
          result += text2.slice(lastEnd, previewEnd);
        }
        lastEnd = previewEnd;
        this.rangeLocations.push({
          source: range2,
          preview: new OneLineRange(0, range2.startColumn - shift2, range2.endColumn - shift2)
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
      this.previewText = text2;
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

function getExcludes(configuration2, includeSearchExcludes = true) {
  const fileExcludes = configuration2 && configuration2.files && configuration2.files.exclude;
  const searchExcludes = includeSearchExcludes && configuration2 && configuration2.search && configuration2.search.exclude;
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

function deserializeSearchError(error) {
  const errorMsg = error.message;
  if (isCancellationError(error)) {
    return new SearchError(errorMsg, 7 /* canceled */);
  }
  try {
    const details = JSON.parse(errorMsg);
    return new SearchError(details.message, details.code);
  } catch (e4) {
    return new SearchError(errorMsg, 6 /* other */);
  }
}
export { resultIsMatch, isFileMatch, isAIKeyword, isProgressMessage, isSingleLineRangeList, getExcludes, pathIncludedInQuery, deserializeSearchError, VIEW_ID, SEARCH_RESULT_LANGUAGE_ID, SEARCH_EXCLUDE_CONFIG, DEFAULT_MAX_SEARCH_RESULTS, SEARCH_ELIDED_PREFIX, SEARCH_ELIDED_SUFFIX, SEARCH_ELIDED_MIN_LEN, ISearchService, FileMatch, TextSearchMatch, SearchRange, OneLineRange, SearchError };
