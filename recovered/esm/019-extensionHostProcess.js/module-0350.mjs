// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/node/ripgrepTextSearchEngine.ts
import { rgDiskPath } from "./module-0349.mjs";
import { DEFAULT_MAX_SEARCH_RESULTS, SearchError, TextSearchMatch, serializeSearchError } from "./module-0247.mjs";
import { newToOldPreviewOptions } from "./module-0315.mjs";
import { URI } from "./module-0025.mjs";
import { coalesce, mapArrayOrNot } from "./module-0006.mjs";
import { Range4, TextSearchContext2, TextSearchMatch2 } from "./module-0246.mjs";
import { anchorGlob, rangeToSearchRange, searchRangeToRange } from "./module-0348.mjs";
import { groupBy } from "./module-0002.mjs";
import { createRegExp, escapeRegExpCharacters } from "./module-0023.mjs";
import { splitGlobAware } from "./module-0185.mjs";


// src/vs/workbench/services/search/node/ripgrepTextSearchEngine.ts
import * as cp6 from "child_process";

import { EventEmitter } from "events";

import { StringDecoder as StringDecoder2 } from "string_decoder";

import { RegExpParser, RegExpVisitor } from "vscode-regexpp";

var RipgrepTextSearchEngine = class {
  constructor(outputChannel, _numThreads) {
    this.outputChannel = outputChannel;
    this._numThreads = _numThreads;
  }
  provideTextSearchResults(query, options2, progress, token) {
    return Promise.all(options2.folderOptions.map((folderOption) => {
      const extendedOptions = {
        folderOptions: folderOption,
        numThreads: this._numThreads,
        maxResults: options2.maxResults,
        previewOptions: options2.previewOptions,
        maxFileSize: options2.maxFileSize,
        surroundingContext: options2.surroundingContext
      };
      return this.provideTextSearchResultsWithRgOptions(query, extendedOptions, progress, token);
    })).then(((e) => {
      const complete = {
        // todo: get this to actually check
        limitHit: e.some((complete2) => !!complete2 && complete2.limitHit)
      };
      return complete;
    }));
  }
  async provideTextSearchResultsWithRgOptions(query, options2, progress, token) {
    this.outputChannel.appendLine(`provideTextSearchResults ${query.pattern}, ${JSON.stringify({
      ...options2,
      ...{
        folder: options2.folderOptions.folder.toString()
      }
    })}`);
    if (!query.pattern) {
      return { limitHit: false };
    }
    const resolvedRgDiskPath = await rgDiskPath();
    return new Promise((resolve2, reject) => {
      token.onCancellationRequested(() => cancel());
      const extendedOptions = {
        ...options2,
        numThreads: this._numThreads
      };
      const rgArgs = getRgArgs2(query, extendedOptions);
      const cwd2 = options2.folderOptions.folder.fsPath;
      const escapedArgs = rgArgs.map((arg) => arg.match(/^-/) ? arg : `'${arg}'`).join(" ");
      this.outputChannel.appendLine(`${resolvedRgDiskPath} ${escapedArgs}
 - cwd: ${cwd2}`);
      let rgProc = cp6.spawn(resolvedRgDiskPath, rgArgs, { cwd: cwd2 });
      rgProc.on("error", (e) => {
        console.error(e);
        this.outputChannel.appendLine("Error: " + (e && e.message));
        reject(serializeSearchError(new SearchError(e && e.message, 5 /* rgProcessError */)));
      });
      let gotResult = false;
      const ripgrepParser = new RipgrepParser(options2.maxResults ?? DEFAULT_MAX_SEARCH_RESULTS, options2.folderOptions.folder, newToOldPreviewOptions(options2.previewOptions));
      ripgrepParser.on("result", (match2) => {
        gotResult = true;
        dataWithoutResult = "";
        progress.report(match2);
      });
      let isDone = false;
      const cancel = () => {
        isDone = true;
        rgProc?.kill();
        ripgrepParser?.cancel();
      };
      let limitHit = false;
      ripgrepParser.on("hitLimit", () => {
        limitHit = true;
        cancel();
      });
      let dataWithoutResult = "";
      rgProc.stdout.on("data", (data) => {
        ripgrepParser.handleData(data);
        if (!gotResult) {
          dataWithoutResult += data;
        }
      });
      let gotData = false;
      rgProc.stdout.once("data", () => gotData = true);
      let stderr = "";
      rgProc.stderr.on("data", (data) => {
        const message = data.toString();
        this.outputChannel.appendLine(message);
        if (stderr.length + message.length < 1e6) {
          stderr += message;
        }
      });
      rgProc.on("close", () => {
        this.outputChannel.appendLine(gotData ? "Got data from stdout" : "No data from stdout");
        this.outputChannel.appendLine(gotResult ? "Got result from parser" : "No result from parser");
        if (dataWithoutResult) {
          this.outputChannel.appendLine(`Got data without result: ${dataWithoutResult}`);
        }
        this.outputChannel.appendLine("");
        if (isDone) {
          resolve2({ limitHit });
        } else {
          ripgrepParser.flush();
          rgProc = null;
          let searchError;
          if (stderr && !gotData && (searchError = rgErrorMsgForDisplay2(stderr))) {
            reject(serializeSearchError(new SearchError(searchError.message, searchError.code)));
          } else {
            resolve2({ limitHit });
          }
        }
      });
    });
  }
};

function rgErrorMsgForDisplay2(msg) {
  const lines = msg.split("\n");
  const firstLine = lines[0].trim();
  if (lines.some((l) => l.startsWith("regex parse error"))) {
    return new SearchError(buildRegexParseError(lines), 2 /* regexParseError */);
  }
  const match2 = firstLine.match(/grep config error: unknown encoding: (.*)/);
  if (match2) {
    return new SearchError(`Unknown encoding: ${match2[1]}`, 1 /* unknownEncoding */);
  }
  if (firstLine.startsWith("error parsing glob")) {
    return new SearchError(firstLine.charAt(0).toUpperCase() + firstLine.substr(1), 3 /* globParseError */);
  }
  if (firstLine.startsWith("the literal")) {
    return new SearchError(firstLine.charAt(0).toUpperCase() + firstLine.substr(1), 4 /* invalidLiteral */);
  }
  if (firstLine.startsWith("PCRE2: error compiling pattern")) {
    return new SearchError(firstLine, 2 /* regexParseError */);
  }
  return void 0;
}

function buildRegexParseError(lines) {
  const errorMessage = ["Regex parse error"];
  const pcre2ErrorLine = lines.filter((l) => l.startsWith("PCRE2:"));
  if (pcre2ErrorLine.length >= 1) {
    const pcre2ErrorMessage = pcre2ErrorLine[0].replace("PCRE2:", "");
    if (pcre2ErrorMessage.indexOf(":") !== -1 && pcre2ErrorMessage.split(":").length >= 2) {
      const pcre2ActualErrorMessage = pcre2ErrorMessage.split(":")[1];
      errorMessage.push(":" + pcre2ActualErrorMessage);
    }
  }
  return errorMessage.join("");
}

var RipgrepParser = class extends EventEmitter {
  constructor(maxResults, root, previewOptions) {
    super();
    this.maxResults = maxResults;
    this.root = root;
    this.previewOptions = previewOptions;
    this.remainder = "";
    this.isDone = false;
    this.hitLimit = false;
    this.numResults = 0;
    this.stringDecoder = new StringDecoder2();
  }
  cancel() {
    this.isDone = true;
  }
  flush() {
    this.handleDecodedData(this.stringDecoder.end());
  }
  on(event, listener) {
    super.on(event, listener);
    return this;
  }
  handleData(data) {
    if (this.isDone) {
      return;
    }
    const dataStr = typeof data === "string" ? data : this.stringDecoder.write(data);
    this.handleDecodedData(dataStr);
  }
  handleDecodedData(decodedData) {
    let newlineIdx = decodedData.indexOf("\n");
    const dataStr = this.remainder + decodedData;
    if (newlineIdx >= 0) {
      newlineIdx += this.remainder.length;
    } else {
      this.remainder = dataStr;
      return;
    }
    let prevIdx = 0;
    while (newlineIdx >= 0) {
      this.handleLine(dataStr.substring(prevIdx, newlineIdx).trim());
      prevIdx = newlineIdx + 1;
      newlineIdx = dataStr.indexOf("\n", prevIdx);
    }
    this.remainder = dataStr.substring(prevIdx);
  }
  handleLine(outputLine) {
    if (this.isDone || !outputLine) {
      return;
    }
    let parsedLine;
    try {
      parsedLine = JSON.parse(outputLine);
    } catch (e) {
      throw new Error(`malformed line from rg: ${outputLine}`);
    }
    if (parsedLine.type === "match") {
      const matchPath = bytesOrTextToString(parsedLine.data.path);
      const uri2 = URI.joinPath(this.root, matchPath);
      const result = this.createTextSearchMatch(parsedLine.data, uri2);
      this.onResult(result);
      if (this.hitLimit) {
        this.cancel();
        this.emit("hitLimit");
      }
    } else if (parsedLine.type === "context") {
      const contextPath = bytesOrTextToString(parsedLine.data.path);
      const uri2 = URI.joinPath(this.root, contextPath);
      const result = this.createTextSearchContexts(parsedLine.data, uri2);
      result.forEach((r2) => this.onResult(r2));
    }
  }
  createTextSearchMatch(data, uri2) {
    const lineNumber = data.line_number - 1;
    const fullText = bytesOrTextToString(data.lines);
    const fullTextBytes = Buffer.from(fullText);
    let prevMatchEnd = 0;
    let prevMatchEndCol = 0;
    let prevMatchEndLine = lineNumber;
    if (data.submatches.length === 0) {
      data.submatches.push(
        fullText.length ? { start: 0, end: 1, match: { text: fullText[0] } } : { start: 0, end: 0, match: { text: "" } }
      );
    }
    const ranges = coalesce(data.submatches.map((match2, i) => {
      if (this.hitLimit) {
        return null;
      }
      this.numResults++;
      if (this.numResults >= this.maxResults) {
        this.hitLimit = true;
      }
      const matchText = bytesOrTextToString(match2.match);
      const inBetweenText = fullTextBytes.slice(prevMatchEnd, match2.start).toString();
      const inBetweenStats = getNumLinesAndLastNewlineLength(inBetweenText);
      const startCol = inBetweenStats.numLines > 0 ? inBetweenStats.lastLineLength : inBetweenStats.lastLineLength + prevMatchEndCol;
      const stats = getNumLinesAndLastNewlineLength(matchText);
      const startLineNumber = inBetweenStats.numLines + prevMatchEndLine;
      const endLineNumber = stats.numLines + startLineNumber;
      const endCol = stats.numLines > 0 ? stats.lastLineLength : stats.lastLineLength + startCol;
      prevMatchEnd = match2.end;
      prevMatchEndCol = endCol;
      prevMatchEndLine = endLineNumber;
      return new Range4(startLineNumber, startCol, endLineNumber, endCol);
    }));
    const searchRange = mapArrayOrNot(ranges, rangeToSearchRange);
    const internalResult = new TextSearchMatch(fullText, searchRange, this.previewOptions);
    return new TextSearchMatch2(
      uri2,
      internalResult.rangeLocations.map((e) => ({
        sourceRange: searchRangeToRange(e.source),
        previewRange: searchRangeToRange(e.preview)
      })),
      internalResult.previewText
    );
  }
  createTextSearchContexts(data, uri2) {
    const text = bytesOrTextToString(data.lines);
    const startLine = data.line_number;
    return text.replace(/\r?\n$/, "").split("\n").map((line, i) => new TextSearchContext2(uri2, line, startLine + i));
  }
  onResult(match2) {
    this.emit("result", match2);
  }
};

function bytesOrTextToString(obj) {
  return obj.bytes ? Buffer.from(obj.bytes, "base64").toString() : obj.text;
}

function getNumLinesAndLastNewlineLength(text) {
  const re = /\n/g;
  let numLines = 0;
  let lastNewlineIdx = -1;
  let match2;
  while (match2 = re.exec(text)) {
    numLines++;
    lastNewlineIdx = match2.index;
  }
  const lastLineLength = lastNewlineIdx >= 0 ? text.length - lastNewlineIdx - 1 : text.length;
  return { numLines, lastLineLength };
}

function getRgArgs2(query, options2) {
  const args2 = ["--hidden", "--no-require-git"];
  args2.push(query.isCaseSensitive ? "--case-sensitive" : "--ignore-case");
  if (options2.folderOptions.ignoreGlobCase) {
    args2.push("--glob-case-insensitive");
    args2.push("--ignore-file-case-insensitive");
  }
  const { doubleStarIncludes, otherIncludes } = groupBy(
    options2.folderOptions.includes,
    (include) => include.startsWith("**") ? "doubleStarIncludes" : "otherIncludes"
  );
  if (otherIncludes && otherIncludes.length) {
    const uniqueOthers = /* @__PURE__ */ new Set();
    otherIncludes.forEach((other) => {
      uniqueOthers.add(other);
    });
    args2.push("-g", "!*");
    uniqueOthers.forEach((otherIncude) => {
      spreadGlobComponents(otherIncude).map(anchorGlob).forEach((globArg) => {
        args2.push("-g", globArg);
      });
    });
  }
  if (doubleStarIncludes && doubleStarIncludes.length) {
    doubleStarIncludes.forEach((globArg) => {
      args2.push("-g", globArg);
    });
  }
  options2.folderOptions.excludes.map((e) => typeof e === "string" ? e : e.pattern).map(anchorGlob).forEach((rgGlob) => args2.push("-g", `!${rgGlob}`));
  if (options2.maxFileSize) {
    args2.push("--max-filesize", options2.maxFileSize + "");
  }
  if (options2.folderOptions.useIgnoreFiles.local) {
    if (!options2.folderOptions.useIgnoreFiles.parent) {
      args2.push("--no-ignore-parent");
    }
  } else {
    args2.push("--no-ignore");
  }
  if (options2.folderOptions.followSymlinks) {
    args2.push("--follow");
  }
  if (options2.folderOptions.encoding && options2.folderOptions.encoding !== "utf8") {
    args2.push("--encoding", options2.folderOptions.encoding);
  }
  if (options2.numThreads) {
    args2.push("--threads", `${options2.numThreads}`);
  }
  if (query.pattern === "--") {
    query.isRegExp = true;
    query.pattern = "\\-\\-";
  }
  if (query.isMultiline && !query.isRegExp) {
    query.pattern = escapeRegExpCharacters(query.pattern);
    query.isRegExp = true;
  }
  args2.push("--crlf");
  if (query.isRegExp) {
    query.pattern = unicodeEscapesToPCRE2(query.pattern);
    args2.push("--engine", "auto");
  }
  let searchPatternAfterDoubleDashes;
  if (query.isWordMatch) {
    const regexp = createRegExp(query.pattern, !!query.isRegExp, { wholeWord: query.isWordMatch });
    const regexpStr = regexp.source.replace(/\\\//g, "/");
    args2.push("--regexp", regexpStr);
  } else if (query.isRegExp) {
    let fixedRegexpQuery = fixRegexNewline(query.pattern);
    fixedRegexpQuery = fixNewline(fixedRegexpQuery);
    args2.push("--regexp", fixedRegexpQuery);
  } else {
    searchPatternAfterDoubleDashes = query.pattern;
    args2.push("--fixed-strings");
  }
  args2.push("--no-config");
  if (!options2.folderOptions.useIgnoreFiles.global) {
    args2.push("--no-ignore-global");
  }
  args2.push("--json");
  if (query.isMultiline) {
    args2.push("--multiline");
  }
  if (options2.surroundingContext) {
    args2.push("--before-context", options2.surroundingContext + "");
    args2.push("--after-context", options2.surroundingContext + "");
  }
  args2.push("--");
  if (searchPatternAfterDoubleDashes) {
    args2.push(searchPatternAfterDoubleDashes);
  }
  args2.push(".");
  return args2;
}

function spreadGlobComponents(globComponent) {
  const globComponentWithBraceExpansion = performBraceExpansionForRipgrep(globComponent);
  return globComponentWithBraceExpansion.flatMap((globArg) => {
    const components = splitGlobAware(globArg, "/");
    return components.map((_, i) => components.slice(0, i + 1).join("/"));
  });
}

function unicodeEscapesToPCRE2(pattern) {
  const unicodePattern = /((?:[^\\]|^)(?:\\\\)*)\\u([a-z0-9]{4})/gi;
  while (pattern.match(unicodePattern)) {
    pattern = pattern.replace(unicodePattern, `$1\\x{$2}`);
  }
  const unicodePatternWithBraces = /((?:[^\\]|^)(?:\\\\)*)\\u\{([a-z0-9]{4})\}/gi;
  while (pattern.match(unicodePatternWithBraces)) {
    pattern = pattern.replace(unicodePatternWithBraces, `$1\\x{$2}`);
  }
  return pattern;
}

var isLookBehind = (node) => node.type === "Assertion" && node.kind === "lookbehind";

function fixRegexNewline(pattern) {
  let re;
  try {
    re = new RegExpParser().parsePattern(pattern);
  } catch {
    return pattern;
  }
  let output = "";
  let lastEmittedIndex = 0;
  const replace = (start, end, text) => {
    output += pattern.slice(lastEmittedIndex, start) + text;
    lastEmittedIndex = end;
  };
  const context = [];
  const visitor = new RegExpVisitor({
    onCharacterEnter(char) {
      if (char.raw !== "\\n") {
        return;
      }
      const parent = context[0];
      if (!parent) {
        replace(char.start, char.end, "\\r?\\n");
      } else if (context.some(isLookBehind)) {
      } else if (parent.type === "CharacterClass") {
        if (parent.negate) {
          const otherContent = pattern.slice(parent.start + 2, char.start) + pattern.slice(char.end, parent.end - 1);
          if (parent.parent?.type === "Quantifier") {
            replace(parent.start, parent.end, otherContent ? `[^${otherContent}]` : ".");
          } else {
            replace(parent.start, parent.end, "(?!\\r?\\n" + (otherContent ? `|[${otherContent}]` : "") + ")");
          }
        } else {
          const otherContent = pattern.slice(parent.start + 1, char.start) + pattern.slice(char.end, parent.end - 1);
          replace(parent.start, parent.end, otherContent === "" ? "\\r?\\n" : `(?:[${otherContent}]|\\r?\\n)`);
        }
      } else if (parent.type === "Quantifier") {
        replace(char.start, char.end, "(?:\\r?\\n)");
      }
    },
    onQuantifierEnter(node) {
      context.unshift(node);
    },
    onQuantifierLeave() {
      context.shift();
    },
    onCharacterClassRangeEnter(node) {
      context.unshift(node);
    },
    onCharacterClassRangeLeave() {
      context.shift();
    },
    onCharacterClassEnter(node) {
      context.unshift(node);
    },
    onCharacterClassLeave() {
      context.shift();
    },
    onAssertionEnter(node) {
      if (isLookBehind(node)) {
        context.push(node);
      }
    },
    onAssertionLeave(node) {
      if (context[0] === node) {
        context.shift();
      }
    }
  });
  visitor.visit(re);
  output += pattern.slice(lastEmittedIndex);
  return output;
}

function fixNewline(pattern) {
  return pattern.replace(/\n/g, "\\r?\\n");
}

function getEscapeAwareSplitStringForRipgrep(pattern) {
  let inBraces = false;
  let escaped = false;
  let fixedStart = "";
  let strInBraces = "";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    switch (char) {
      case "\\":
        if (escaped) {
          if (inBraces) {
            strInBraces += "\\" + char;
          } else {
            fixedStart += "\\" + char;
          }
          escaped = false;
        } else {
          escaped = true;
        }
        break;
      case "{":
        if (escaped) {
          if (inBraces) {
            strInBraces += char;
          } else {
            fixedStart += char;
          }
          escaped = false;
        } else {
          if (inBraces) {
            return { strInBraces: fixedStart + "{" + strInBraces + "{" + pattern.substring(i + 1) };
          } else {
            inBraces = true;
          }
        }
        break;
      case "}":
        if (escaped) {
          if (inBraces) {
            strInBraces += char;
          } else {
            fixedStart += char;
          }
          escaped = false;
        } else if (inBraces) {
          return { fixedStart, strInBraces, fixedEnd: pattern.substring(i + 1) };
        } else {
          fixedStart += char;
        }
        break;
      default:
        if (inBraces) {
          strInBraces += (escaped ? "\\" : "") + char;
        } else {
          fixedStart += (escaped ? "\\" : "") + char;
        }
        escaped = false;
        break;
    }
  }
  return { strInBraces: fixedStart + (inBraces ? "{" + strInBraces : "") };
}

function performBraceExpansionForRipgrep(pattern) {
  const { fixedStart, strInBraces, fixedEnd } = getEscapeAwareSplitStringForRipgrep(pattern);
  if (fixedStart === void 0 || fixedEnd === void 0) {
    return [strInBraces];
  }
  let arr = splitGlobAware(strInBraces, ",");
  if (!arr.length) {
    arr = [""];
  }
  const ends = performBraceExpansionForRipgrep(fixedEnd);
  return arr.flatMap((elem) => {
    const start = fixedStart + elem;
    return ends.map((end) => {
      return start + end;
    });
  });
}
export { rgErrorMsgForDisplay2, buildRegexParseError, bytesOrTextToString, getNumLinesAndLastNewlineLength, getRgArgs2, spreadGlobComponents, unicodeEscapesToPCRE2, fixRegexNewline, fixNewline, getEscapeAwareSplitStringForRipgrep, performBraceExpansionForRipgrep, cp6, EventEmitter, StringDecoder2, RegExpParser, RegExpVisitor, RipgrepTextSearchEngine, RipgrepParser, isLookBehind };
