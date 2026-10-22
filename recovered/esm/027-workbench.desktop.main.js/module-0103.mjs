// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/wordHelper.ts
import { LinkedList } from "./module-0013.mjs";
import { Iterable } from "./module-0011.mjs";


// src/vs/editor/common/core/wordHelper.ts
var USUAL_WORD_SEPARATORS = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";

function createWordRegExp(allowInWords = "") {
  let source = "(-?\\d*\\.\\d\\w*)|([^";
  for (const sep2 of USUAL_WORD_SEPARATORS) {
    if (allowInWords.indexOf(sep2) >= 0) {
      continue;
    }
    source += "\\" + sep2;
  }
  source += "\\s]+)";
  return new RegExp(source, "g");
}

var DEFAULT_WORD_REGEXP = createWordRegExp();

function ensureValidWordDefinition(wordDefinition) {
  let result = DEFAULT_WORD_REGEXP;
  if (wordDefinition && wordDefinition instanceof RegExp) {
    if (!wordDefinition.global) {
      let flags = "g";
      if (wordDefinition.ignoreCase) {
        flags += "i";
      }
      if (wordDefinition.multiline) {
        flags += "m";
      }
      if (wordDefinition.unicode) {
        flags += "u";
      }
      result = new RegExp(wordDefinition.source, flags);
    } else {
      result = wordDefinition;
    }
  }
  result.lastIndex = 0;
  return result;
}

var _defaultConfig = new LinkedList();

_defaultConfig.unshift({
  maxLen: 1e3,
  windowSize: 15,
  timeBudget: 150
});

function getWordAtText(column, wordDefinition, text2, textOffset, config) {
  wordDefinition = ensureValidWordDefinition(wordDefinition);
  if (!config) {
    config = Iterable.first(_defaultConfig);
  }
  if (text2.length > config.maxLen) {
    let start = column - config.maxLen / 2;
    if (start < 0) {
      start = 0;
    } else {
      textOffset += start;
    }
    text2 = text2.substring(start, column + config.maxLen / 2);
    return getWordAtText(column, wordDefinition, text2, textOffset, config);
  }
  const t1 = Date.now();
  const pos = column - 1 - textOffset;
  let prevRegexIndex = -1;
  let match2 = null;
  for (let i2 = 1; ; i2++) {
    if (Date.now() - t1 >= config.timeBudget) {
      break;
    }
    const regexIndex = pos - config.windowSize * i2;
    wordDefinition.lastIndex = Math.max(0, regexIndex);
    const thisMatch = _findRegexMatchEnclosingPosition(wordDefinition, text2, pos, prevRegexIndex);
    if (!thisMatch && match2) {
      break;
    }
    match2 = thisMatch;
    if (regexIndex <= 0) {
      break;
    }
    prevRegexIndex = regexIndex;
  }
  if (match2) {
    const result = {
      word: match2[0],
      startColumn: textOffset + 1 + match2.index,
      endColumn: textOffset + 1 + match2.index + match2[0].length
    };
    wordDefinition.lastIndex = 0;
    return result;
  }
  return null;
}

function _findRegexMatchEnclosingPosition(wordDefinition, text2, pos, stopPos) {
  let match2;
  while (match2 = wordDefinition.exec(text2)) {
    const matchIndex = match2.index || 0;
    if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
      return match2;
    } else if (stopPos > 0 && matchIndex > stopPos) {
      return null;
    }
  }
  return null;
}
export { createWordRegExp, ensureValidWordDefinition, getWordAtText, _findRegexMatchEnclosingPosition, USUAL_WORD_SEPARATORS, DEFAULT_WORD_REGEXP, _defaultConfig };
