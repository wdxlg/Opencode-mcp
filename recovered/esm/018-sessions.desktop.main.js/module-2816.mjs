// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/searchEditor/browser/searchEditorSerialization.ts
import { Range2 } from "./module-0106.mjs";
import { searchMatchComparer } from "./module-2810.mjs";
import { isNotebookFileMatch } from "./module-2809.mjs";
import { coalesce } from "./module-0007.mjs";
import { localize } from "./module-0001.mjs";
import { ITextFileService } from "./module-1064.mjs";


// src/vs/workbench/contrib/searchEditor/browser/searchEditorSerialization.ts
var lineDelimiter = "\n";

var translateRangeLines = (n2) => (range2) => new Range2(range2.startLineNumber + n2, range2.startColumn, range2.endLineNumber + n2, range2.endColumn);

var matchToSearchResultFormat = (match2, longestLineNumber) => {
  const getLinePrefix = (i2) => `${match2.range().startLineNumber + i2}`;
  const fullMatchLines = match2.fullPreviewLines();
  const results = [];
  fullMatchLines.forEach((sourceLine, i2) => {
    const lineNumber = getLinePrefix(i2);
    const paddingStr = " ".repeat(longestLineNumber - lineNumber.length);
    const prefix = `  ${paddingStr}${lineNumber}: `;
    const prefixOffset = prefix.length;
    const line = prefix + (sourceLine.split(/\r?\n?$/, 1)[0] || "");
    const rangeOnThisLine = ({ start, end }) => new Range2(1, (start ?? 1) + prefixOffset, 1, (end ?? sourceLine.length + 1) + prefixOffset);
    const matchRange = match2.rangeInPreview();
    const matchIsSingleLine = matchRange.startLineNumber === matchRange.endLineNumber;
    let lineRange;
    if (matchIsSingleLine) {
      lineRange = rangeOnThisLine({ start: matchRange.startColumn, end: matchRange.endColumn });
    } else if (i2 === 0) {
      lineRange = rangeOnThisLine({ start: matchRange.startColumn });
    } else if (i2 === fullMatchLines.length - 1) {
      lineRange = rangeOnThisLine({ end: matchRange.endColumn });
    } else {
      lineRange = rangeOnThisLine({});
    }
    results.push({ lineNumber, line, ranges: [lineRange] });
  });
  return results;
};

function fileMatchToSearchResultFormat(fileMatch, labelFormatter) {
  const textSerializations = fileMatch.textMatches().length > 0 ? matchesToSearchResultFormat(fileMatch.resource, fileMatch.textMatches().sort(searchMatchComparer), fileMatch.context, labelFormatter) : void 0;
  const cellSerializations = isNotebookFileMatch(fileMatch) ? fileMatch.cellMatches().sort((a, b) => a.cellIndex - b.cellIndex).sort().filter((cellMatch) => cellMatch.contentMatches.length > 0).map((cellMatch, index2) => cellMatchToSearchResultFormat(cellMatch, labelFormatter, index2 === 0)) : [];
  return [textSerializations, ...cellSerializations].filter((x) => !!x);
}

function matchesToSearchResultFormat(resource, sortedMatches, matchContext, labelFormatter, shouldUseHeader = true) {
  const longestLineNumber = sortedMatches[sortedMatches.length - 1].range().endLineNumber.toString().length;
  const text2 = shouldUseHeader ? [`${labelFormatter(resource)}:`] : [];
  const matchRanges = [];
  const targetLineNumberToOffset = {};
  const context2 = [];
  matchContext.forEach((line, lineNumber) => context2.push({ line, lineNumber }));
  context2.sort((a, b) => a.lineNumber - b.lineNumber);
  let lastLine = void 0;
  const seenLines = /* @__PURE__ */ new Set();
  sortedMatches.forEach((match2) => {
    matchToSearchResultFormat(match2, longestLineNumber).forEach((match3) => {
      if (!seenLines.has(match3.lineNumber)) {
        while (context2.length && context2[0].lineNumber < +match3.lineNumber) {
          const { line, lineNumber } = context2.shift();
          if (lastLine !== void 0 && lineNumber !== lastLine + 1) {
            text2.push("");
          }
          text2.push(`  ${" ".repeat(longestLineNumber - `${lineNumber}`.length)}${lineNumber}  ${line}`);
          lastLine = lineNumber;
        }
        targetLineNumberToOffset[match3.lineNumber] = text2.length;
        seenLines.add(match3.lineNumber);
        text2.push(match3.line);
        lastLine = +match3.lineNumber;
      }
      matchRanges.push(...match3.ranges.map(translateRangeLines(targetLineNumberToOffset[match3.lineNumber])));
    });
  });
  while (context2.length) {
    const { line, lineNumber } = context2.shift();
    text2.push(`  ${lineNumber}  ${line}`);
  }
  return { text: text2, matchRanges };
}

function cellMatchToSearchResultFormat(cellMatch, labelFormatter, shouldUseHeader) {
  return matchesToSearchResultFormat(cellMatch.cell?.uri ?? cellMatch.parent.resource, cellMatch.contentMatches.sort(searchMatchComparer), cellMatch.context, labelFormatter, shouldUseHeader);
}

var contentPatternToSearchConfiguration = (pattern, includes2, excludes, contextLines) => {
  return {
    query: pattern.contentPattern.pattern,
    isRegexp: !!pattern.contentPattern.isRegExp,
    isCaseSensitive: !!pattern.contentPattern.isCaseSensitive,
    matchWholeWord: !!pattern.contentPattern.isWordMatch,
    filesToExclude: excludes,
    filesToInclude: includes2,
    showIncludesExcludes: !!(includes2 || excludes || pattern?.userDisabledExcludesAndIgnoreFiles),
    useExcludeSettingsAndIgnoreFiles: pattern?.userDisabledExcludesAndIgnoreFiles === void 0 ? true : !pattern.userDisabledExcludesAndIgnoreFiles,
    contextLines,
    onlyOpenEditors: !!pattern.onlyOpenEditors,
    notebookSearchConfig: {
      includeMarkupInput: !!pattern.contentPattern.notebookInfo?.isInNotebookMarkdownInput,
      includeMarkupPreview: !!pattern.contentPattern.notebookInfo?.isInNotebookMarkdownPreview,
      includeCodeInput: !!pattern.contentPattern.notebookInfo?.isInNotebookCellInput,
      includeOutput: !!pattern.contentPattern.notebookInfo?.isInNotebookCellOutput
    }
  };
};

var serializeSearchConfiguration = (config) => {
  const removeNullFalseAndUndefined = (a) => a.filter((a2) => a2 !== false && a2 !== null && a2 !== void 0);
  const escapeNewlines = (str) => str.replace(/\\/g, "\\\\").replace(/\n/g, "\\n");
  return removeNullFalseAndUndefined([
    `# Query: ${escapeNewlines(config.query ?? "")}`,
    (config.isCaseSensitive || config.matchWholeWord || config.isRegexp || config.useExcludeSettingsAndIgnoreFiles === false) && `# Flags: ${coalesce([
      config.isCaseSensitive && "CaseSensitive",
      config.matchWholeWord && "WordMatch",
      config.isRegexp && "RegExp",
      config.onlyOpenEditors && "OpenEditors",
      config.useExcludeSettingsAndIgnoreFiles === false && "IgnoreExcludeSettings"
    ]).join(" ")}`,
    config.filesToInclude ? `# Including: ${config.filesToInclude}` : void 0,
    config.filesToExclude ? `# Excluding: ${config.filesToExclude}` : void 0,
    config.contextLines ? `# ContextLines: ${config.contextLines}` : void 0,
    ""
  ]).join(lineDelimiter);
};

var defaultSearchConfig = () => ({
  query: "",
  filesToInclude: "",
  filesToExclude: "",
  isRegexp: false,
  isCaseSensitive: false,
  useExcludeSettingsAndIgnoreFiles: true,
  matchWholeWord: false,
  contextLines: 0,
  showIncludesExcludes: false,
  onlyOpenEditors: false,
  notebookSearchConfig: {
    includeMarkupInput: true,
    includeMarkupPreview: false,
    includeCodeInput: true,
    includeOutput: true
  }
});

var extractSearchQueryFromLines = (lines) => {
  const query = defaultSearchConfig();
  const unescapeNewlines = (str) => {
    let out = "";
    for (let i2 = 0; i2 < str.length; i2++) {
      if (str[i2] === "\\") {
        i2++;
        const escaped = str[i2];
        if (escaped === "n") {
          out += "\n";
        } else if (escaped === "\\") {
          out += "\\";
        } else {
          throw Error(localize(19302, null));
        }
      } else {
        out += str[i2];
      }
    }
    return out;
  };
  const parseYML = /^# ([^:]*): (.*)$/;
  for (const line of lines) {
    const parsed = parseYML.exec(line);
    if (!parsed) {
      continue;
    }
    const [, key3, value2] = parsed;
    switch (key3) {
      case "Query":
        query.query = unescapeNewlines(value2);
        break;
      case "Including":
        query.filesToInclude = value2;
        break;
      case "Excluding":
        query.filesToExclude = value2;
        break;
      case "ContextLines":
        query.contextLines = +value2;
        break;
      case "Flags": {
        query.isRegexp = value2.indexOf("RegExp") !== -1;
        query.isCaseSensitive = value2.indexOf("CaseSensitive") !== -1;
        query.useExcludeSettingsAndIgnoreFiles = value2.indexOf("IgnoreExcludeSettings") === -1;
        query.matchWholeWord = value2.indexOf("WordMatch") !== -1;
        query.onlyOpenEditors = value2.indexOf("OpenEditors") !== -1;
      }
    }
  }
  query.showIncludesExcludes = !!(query.filesToInclude || query.filesToExclude || !query.useExcludeSettingsAndIgnoreFiles);
  return query;
};

var serializeSearchResultForEditor = (searchResult, rawIncludePattern, rawExcludePattern, contextLines, labelFormatter, sortOrder, limitHit) => {
  if (!searchResult.query) {
    throw Error("Internal Error: Expected query, got null");
  }
  const config = contentPatternToSearchConfiguration(searchResult.query, rawIncludePattern, rawExcludePattern, contextLines);
  const filecount = searchResult.fileCount() > 1 ? localize(19304, null, searchResult.fileCount()) : localize(19306, null);
  const resultcount = searchResult.count() > 1 ? localize(19305, null, searchResult.count()) : localize(19307, null);
  const info = [
    searchResult.count() ? `${resultcount} - ${filecount}` : localize(19303, null)
  ];
  if (limitHit) {
    info.push(localize(19308, null));
  }
  info.push("");
  const matchComparer = (a, b) => searchMatchComparer(a, b, sortOrder);
  const allResults = flattenSearchResultSerializations(
    searchResult.folderMatches().sort(matchComparer).map((folderMatch) => folderMatch.allDownstreamFileMatches().sort(matchComparer).flatMap((fileMatch) => fileMatchToSearchResultFormat(fileMatch, labelFormatter))).flat()
  );
  return {
    matchRanges: allResults.matchRanges.map(translateRangeLines(info.length)),
    text: info.concat(allResults.text).join(lineDelimiter),
    config
  };
};

var flattenSearchResultSerializations = (serializations) => {
  const text2 = [];
  const matchRanges = [];
  serializations.forEach((serialized) => {
    serialized.matchRanges.map(translateRangeLines(text2.length)).forEach((range2) => matchRanges.push(range2));
    serialized.text.forEach((line) => text2.push(line));
    text2.push("");
  });
  return { text: text2, matchRanges };
};

var parseSavedSearchEditor = async (accessor, resource) => {
  const textFileService = accessor.get(ITextFileService);
  const text2 = (await textFileService.read(resource)).value;
  return parseSerializedSearchEditor(text2);
};

var parseSerializedSearchEditor = (text2) => {
  const headerlines = [];
  const bodylines = [];
  let inHeader = true;
  for (const line of text2.split(/\r?\n/g)) {
    if (inHeader) {
      headerlines.push(line);
      if (line === "") {
        inHeader = false;
      }
    } else {
      bodylines.push(line);
    }
  }
  return { config: extractSearchQueryFromLines(headerlines), text: bodylines.join("\n") };
};
export { fileMatchToSearchResultFormat, matchesToSearchResultFormat, cellMatchToSearchResultFormat, lineDelimiter, translateRangeLines, matchToSearchResultFormat, contentPatternToSearchConfiguration, serializeSearchConfiguration, defaultSearchConfig, extractSearchQueryFromLines, serializeSearchResultForEditor, flattenSearchResultSerializations, parseSavedSearchEditor, parseSerializedSearchEditor };
