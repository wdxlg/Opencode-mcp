// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkParsing.ts
import { Lazy } from "./module-0028.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkParsing.ts
var linkSuffixRegexEol = new Lazy(() => generateLinkSuffixRegex(true));

var linkSuffixRegex = new Lazy(() => generateLinkSuffixRegex(false));

function generateLinkSuffixRegex(eolOnly) {
  let ri = 0;
  let ci = 0;
  let rei = 0;
  let cei = 0;
  function r2() {
    return `(?<row${ri++}>\\d+)`;
  }
  function c() {
    return `(?<col${ci++}>\\d+)`;
  }
  function re() {
    return `(?<rowEnd${rei++}>\\d+)`;
  }
  function ce() {
    return `(?<colEnd${cei++}>\\d+)`;
  }
  const eolSuffix = eolOnly ? "$" : "";
  const lineAndColumnRegexClauses = [
    // foo:339
    // foo:339:12
    // foo:339:12-789
    // foo:339:12-341.789
    // foo:339.12
    // foo 339
    // foo 339:12                              [#140780]
    // foo 339.12
    // foo#339
    // foo#339:12                              [#190288]
    // foo#339.12
    // foo, 339                                [#217927]
    // "foo",339
    // "foo",339:12
    // "foo",339.12
    // "foo",339.12-789
    // "foo",339.12-341.789
    `(?::|#| |['"],|, )${r2()}([:.]${c()}(?:-(?:${re()}\\.)?${ce()})?)?` + eolSuffix,
    // The quotes below are optional           [#171652]
    // "foo", line 339                         [#40468]
    // "foo", line 339, col 12
    // "foo", line 339, column 12
    // "foo":line 339
    // "foo":line 339, col 12
    // "foo":line 339, column 12
    // "foo": line 339
    // "foo": line 339, col 12
    // "foo": line 339, column 12
    // "foo" on line 339
    // "foo" on line 339, col 12
    // "foo" on line 339, column 12
    // "foo" line 339 column 12
    // "foo", line 339, character 12           [#171880]
    // "foo", line 339, characters 12-789      [#171880]
    // "foo", lines 339-341                    [#171880]
    // "foo", lines 339-341, characters 12-789 [#178287]
    `['"]?(?:,? |: ?| on )lines? ${r2()}(?:-${re()})?(?:,? (?:col(?:umn)?|characters?) ${c()}(?:-${ce()})?)?` + eolSuffix,
    // () and [] are interchangeable
    // foo(339)
    // foo(339,12)
    // foo(339, 12)
    // foo (339)
    // foo (339,12)
    // foo (339, 12)
    // foo: (339)
    // foo: (339,12)
    // foo: (339, 12)
    // foo(339:12)                             [#229842]
    // foo (339:12)                            [#229842]
    `:? ?[\\[\\(]${r2()}(?:(?:, ?|:)${c()})?[\\]\\)]` + eolSuffix
  ];
  const suffixClause = lineAndColumnRegexClauses.join("|").replace(/ /g, `[${"\xA0"} ]`);
  return new RegExp(`(${suffixClause})`, eolOnly ? void 0 : "g");
}

function removeLinkSuffix(link2) {
  const suffix = getLinkSuffix(link2)?.suffix;
  if (!suffix) {
    return link2;
  }
  return link2.substring(0, suffix.index);
}

function removeLinkQueryString(link2) {
  const start = link2.startsWith("\\\\?\\") ? 4 : 0;
  const index2 = link2.indexOf("?", start);
  if (index2 === -1) {
    return link2;
  }
  return link2.substring(0, index2);
}

function detectLinkSuffixes(line) {
  let match2;
  const results = [];
  linkSuffixRegex.value.lastIndex = 0;
  while ((match2 = linkSuffixRegex.value.exec(line)) !== null) {
    const suffix = toLinkSuffix(match2);
    if (suffix === null) {
      break;
    }
    results.push(suffix);
  }
  return results;
}

function getLinkSuffix(link2) {
  return toLinkSuffix(linkSuffixRegexEol.value.exec(link2));
}

function toLinkSuffix(match2) {
  const groups = match2?.groups;
  if (!groups || match2.length < 1) {
    return null;
  }
  return {
    row: parseIntOptional(groups.row0 || groups.row1 || groups.row2),
    col: parseIntOptional(groups.col0 || groups.col1 || groups.col2),
    rowEnd: parseIntOptional(groups.rowEnd0 || groups.rowEnd1 || groups.rowEnd2),
    colEnd: parseIntOptional(groups.colEnd0 || groups.colEnd1 || groups.colEnd2),
    suffix: { index: match2.index, text: match2[0] }
  };
}

function parseIntOptional(value2) {
  if (value2 === void 0) {
    return value2;
  }
  return parseInt(value2);
}

var linkWithSuffixPathCharacters = /(?<path>(?:file:\/\/\/)?[^\s\|<>\[\({][^\s\|<>]*)$/;

function detectLinks(line, os) {
  const results = detectLinksViaSuffix(line);
  const noSuffixPaths = detectPathsNoSuffix(line, os);
  binaryInsertList(results, noSuffixPaths);
  return results;
}

function binaryInsertList(list2, newItems) {
  if (list2.length === 0) {
    list2.push(...newItems);
  }
  for (const item of newItems) {
    binaryInsert(list2, item, 0, list2.length);
  }
}

function binaryInsert(list2, newItem, low, high) {
  if (list2.length === 0) {
    list2.push(newItem);
    return;
  }
  if (low > high) {
    return;
  }
  const mid = Math.floor((low + high) / 2);
  if (mid >= list2.length || newItem.path.index < list2[mid].path.index && (mid === 0 || newItem.path.index > list2[mid - 1].path.index)) {
    if (mid >= list2.length || newItem.path.index + newItem.path.text.length < list2[mid].path.index && (mid === 0 || newItem.path.index > list2[mid - 1].path.index + list2[mid - 1].path.text.length)) {
      list2.splice(mid, 0, newItem);
    }
    return;
  }
  if (newItem.path.index > list2[mid].path.index) {
    binaryInsert(list2, newItem, mid + 1, high);
  } else {
    binaryInsert(list2, newItem, low, mid - 1);
  }
}

function detectLinksViaSuffix(line) {
  const results = [];
  const suffixes = detectLinkSuffixes(line);
  for (const suffix of suffixes) {
    const suffixEndIndex = suffix.suffix.index + suffix.suffix.text.length;
    if (line[suffixEndIndex] === "/") {
      continue;
    }
    const beforeSuffix = line.substring(0, suffix.suffix.index);
    const possiblePathMatch = beforeSuffix.match(linkWithSuffixPathCharacters);
    if (possiblePathMatch && possiblePathMatch.index !== void 0 && possiblePathMatch.groups?.path) {
      let linkStartIndex = possiblePathMatch.index;
      let path = possiblePathMatch.groups.path;
      let prefix = void 0;
      const prefixMatch = path.match(/^(?<prefix>['"]+)/);
      if (prefixMatch?.groups?.prefix) {
        prefix = {
          index: linkStartIndex,
          text: prefixMatch.groups.prefix
        };
        path = path.substring(prefix.text.length);
        if (path.trim().length === 0) {
          continue;
        }
        if (prefixMatch.groups.prefix.length > 1) {
          if (suffix.suffix.text[0].match(/['"]/) && prefixMatch.groups.prefix[prefixMatch.groups.prefix.length - 1] === suffix.suffix.text[0]) {
            const trimPrefixAmount = prefixMatch.groups.prefix.length - 1;
            prefix.index += trimPrefixAmount;
            prefix.text = prefixMatch.groups.prefix[prefixMatch.groups.prefix.length - 1];
            linkStartIndex += trimPrefixAmount;
          }
        }
      }
      results.push({
        path: {
          index: linkStartIndex + (prefix?.text.length || 0),
          text: path
        },
        prefix,
        suffix
      });
      const openingBracketMatch = path.matchAll(/(?<bracket>[\[\(])(?![\]\)])/g);
      for (const match2 of openingBracketMatch) {
        const bracket = match2.groups?.bracket;
        if (bracket) {
          results.push({
            path: {
              index: linkStartIndex + (prefix?.text.length || 0) + match2.index + 1,
              text: path.substring(match2.index + bracket.length)
            },
            prefix,
            suffix
          });
        }
      }
    }
  }
  return results;
}

var unixLocalLinkClause = "(?:(?:(?:\\.\\.?|\\~|file://)|(?:[^\\0<>\\?\\s!`&*()\\[\\]'\":;\\\\][^\\0<>\\?\\s!`&*()'\":;\\\\]*))?(?:\\/(?:[^\\0<>\\?\\s!`&*()'\":;\\\\])+)+)";

var winDrivePrefix = "(?:\\\\\\\\\\?\\\\|file:\\/\\/\\/)?[a-zA-Z]:";

var winLocalLinkClause = `(?:(?:(?:${winDrivePrefix}|${"\\.\\.?|\\~" /* WinOtherPathPrefix */})|(?:[^\\0<>\\?\\|\\/\\s!\`&*()\\[\\]'":;][^\\0<>\\?\\|\\/\\s!\`&*()'":;]*))?(?:(?:\\\\|\\/)(?:[^\\0<>\\?\\|\\/\\s!\`&*()'":;])+)+)`;

var diffFilePrefix = "[abciow12]\\/";

var gitDiffLineRegex = new Lazy(() => new RegExp(`^[-+]{3} ${diffFilePrefix}`));

var gitDiffTextRegex = new Lazy(() => new RegExp(`^${diffFilePrefix}`));

function detectPathsNoSuffix(line, os) {
  const results = [];
  const regex = new RegExp(os === 1 /* Windows */ ? winLocalLinkClause : unixLocalLinkClause, "g");
  let match2;
  while ((match2 = regex.exec(line)) !== null) {
    let text2 = match2[0];
    let index2 = match2.index;
    if (!text2) {
      break;
    }
    if (
      // --- a/foo/bar
      // +++ b/foo/bar
      gitDiffLineRegex.value.test(line) && index2 === 4 || // diff --git a/foo/bar b/foo/bar
      line.startsWith("diff --git") && gitDiffTextRegex.value.test(text2)
    ) {
      text2 = text2.substring(2);
      index2 += 2;
    }
    results.push({
      path: {
        index: index2,
        text: text2
      },
      prefix: void 0,
      suffix: void 0
    });
  }
  return results;
}
export { generateLinkSuffixRegex, removeLinkSuffix, removeLinkQueryString, detectLinkSuffixes, getLinkSuffix, toLinkSuffix, parseIntOptional, detectLinks, binaryInsertList, binaryInsert, detectLinksViaSuffix, detectPathsNoSuffix, linkSuffixRegexEol, linkSuffixRegex, linkWithSuffixPathCharacters, unixLocalLinkClause, winDrivePrefix, winLocalLinkClause, diffFilePrefix, gitDiffLineRegex, gitDiffTextRegex };
