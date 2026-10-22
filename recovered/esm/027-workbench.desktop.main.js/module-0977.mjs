// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatWordCounter.ts
import { mathInlineRegExp } from "./module-0976.mjs";


// src/vs/workbench/contrib/chat/common/model/chatWordCounter.ts
var r = String.raw;

var linkPattern = r`(?<!\\)` + // Must not start with escape
// text
r`(!?\[` + // open prefix match -->
/**/
r`(?:` + /*****/
r`[^\[\]\\]|` + // Non-bracket chars, or...
/*****/
r`\\.|` + // Escaped char, or...
/*****/
r`\[[^\[\]]*\]` + // Matched bracket pair
/**/
r`)*` + r`\])` + // <-- close prefix match
// Destination
r`(\(\s*)` + // Pre href
/**/
r`(` + /*****/
r`[^\s\(\)<](?:[^\s\(\)]|\([^\s\(\)]*?\))*|` + // Link without whitespace, or...
/*****/
r`<(?:\\[<>]|[^<>])+>` + // In angle brackets
/**/
r`)` + // Title
/**/
r`\s*(?:"[^"]*"|'[^']*'|\([^\(\)]*\))?\s*` + r`\)`;

function getNWords(str, numWordsToCount) {
  const backtick = "`";
  const wordRegExp = new RegExp("(?:" + linkPattern + ")|(?:" + mathInlineRegExp.source + r`)|\p{sc=Han}|=+|\++|-+|[^\s\|\p{sc=Han}|=|\+|\-|${backtick}]+`, "gu");
  const allWordMatches = Array.from(str.matchAll(wordRegExp));
  const targetWords = allWordMatches.slice(0, numWordsToCount);
  const endIndex = numWordsToCount >= allWordMatches.length ? str.length : targetWords.length ? targetWords.at(-1).index + targetWords.at(-1)[0].length : 0;
  const value2 = str.substring(0, endIndex);
  return {
    value: value2,
    returnedWordCount: targetWords.length === 0 ? value2.length ? 1 : 0 : targetWords.length,
    isFullString: endIndex >= str.length,
    totalWordCount: allWordMatches.length
  };
}

function countWords(str) {
  const result = getNWords(str, Number.MAX_SAFE_INTEGER);
  return result.returnedWordCount;
}
export { getNWords, countWords, r, linkPattern };
