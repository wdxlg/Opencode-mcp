// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/base/common/filters.ts
import { startsWithIgnoreCase } from "./module-0022.mjs";
import { LRUCache } from "./module-0010.mjs";


// src/vs/base/common/filters.ts
function or(...filter) {
  return function(word, wordToMatchAgainst) {
    for (let i = 0, len = filter.length; i < len; i++) {
      const match = filter[i](word, wordToMatchAgainst);
      if (match) {
        return match;
      }
    }
    return null;
  };
}

var matchesStrictPrefix = _matchesPrefix.bind(void 0, false);

var matchesPrefix = _matchesPrefix.bind(void 0, true);

function _matchesPrefix(ignoreCase, word, wordToMatchAgainst) {
  if (!wordToMatchAgainst || wordToMatchAgainst.length < word.length) {
    return null;
  }
  let matches;
  if (ignoreCase) {
    matches = startsWithIgnoreCase(wordToMatchAgainst, word);
  } else {
    matches = wordToMatchAgainst.indexOf(word) === 0;
  }
  if (!matches) {
    return null;
  }
  return word.length > 0 ? [{ start: 0, end: word.length }] : [];
}

function matchesContiguousSubString(word, wordToMatchAgainst) {
  if (word.length > wordToMatchAgainst.length) {
    return null;
  }
  const index = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
  if (index === -1) {
    return null;
  }
  return [{ start: index, end: index + word.length }];
}

function matchesSubString(word, wordToMatchAgainst) {
  if (word.length > wordToMatchAgainst.length) {
    return null;
  }
  return _matchesSubString(word.toLowerCase(), wordToMatchAgainst.toLowerCase(), 0, 0);
}

function _matchesSubString(word, wordToMatchAgainst, i, j) {
  if (i === word.length) {
    return [];
  } else if (j === wordToMatchAgainst.length) {
    return null;
  } else {
    if (word[i] === wordToMatchAgainst[j]) {
      let result = null;
      if (result = _matchesSubString(word, wordToMatchAgainst, i + 1, j + 1)) {
        return join2({ start: j, end: j + 1 }, result);
      }
      return null;
    }
    return _matchesSubString(word, wordToMatchAgainst, i, j + 1);
  }
}

function isLower(code) {
  return 97 /* a */ <= code && code <= 122 /* z */;
}

function isUpper(code) {
  return 65 /* A */ <= code && code <= 90 /* Z */;
}

function isNumber2(code) {
  return 48 /* Digit0 */ <= code && code <= 57 /* Digit9 */;
}

function isWhitespace2(code) {
  return code === 32 /* Space */ || code === 9 /* Tab */ || code === 10 /* LineFeed */ || code === 13 /* CarriageReturn */;
}

var wordSeparators = /* @__PURE__ */ new Set();

"()[]{}<>`'\"-/;:,.?!".split("").forEach((s) => wordSeparators.add(s.charCodeAt(0)));

function isAlphanumeric(code) {
  return isLower(code) || isUpper(code) || isNumber2(code);
}

function join2(head, tail) {
  if (tail.length === 0) {
    tail = [head];
  } else if (head.end === tail[0].start) {
    tail[0].start = head.start;
  } else {
    tail.unshift(head);
  }
  return tail;
}

function nextAnchor(camelCaseWord, start) {
  for (let i = start; i < camelCaseWord.length; i++) {
    const c = camelCaseWord.charCodeAt(i);
    if (isUpper(c) || isNumber2(c) || i > 0 && !isAlphanumeric(camelCaseWord.charCodeAt(i - 1))) {
      return i;
    }
  }
  return camelCaseWord.length;
}

function _matchesCamelCase(word, camelCaseWord, i, j) {
  if (i === word.length) {
    return [];
  } else if (j === camelCaseWord.length) {
    return null;
  } else if (word[i] !== camelCaseWord[j].toLowerCase()) {
    return null;
  } else {
    let result = null;
    let nextUpperIndex = j + 1;
    result = _matchesCamelCase(word, camelCaseWord, i + 1, j + 1);
    while (!result && (nextUpperIndex = nextAnchor(camelCaseWord, nextUpperIndex)) < camelCaseWord.length) {
      result = _matchesCamelCase(word, camelCaseWord, i + 1, nextUpperIndex);
      nextUpperIndex++;
    }
    return result === null ? null : join2({ start: j, end: j + 1 }, result);
  }
}

function analyzeCamelCaseWord(word) {
  let upper = 0, lower = 0, alpha = 0, numeric = 0, code = 0;
  for (let i = 0; i < word.length; i++) {
    code = word.charCodeAt(i);
    if (isUpper(code)) {
      upper++;
    }
    if (isLower(code)) {
      lower++;
    }
    if (isAlphanumeric(code)) {
      alpha++;
    }
    if (isNumber2(code)) {
      numeric++;
    }
  }
  const upperPercent = upper / word.length;
  const lowerPercent = lower / word.length;
  const alphaPercent = alpha / word.length;
  const numericPercent = numeric / word.length;
  return { upperPercent, lowerPercent, alphaPercent, numericPercent };
}

function isUpperCaseWord(analysis) {
  const { upperPercent, lowerPercent } = analysis;
  return lowerPercent === 0 && upperPercent > 0.6;
}

function isCamelCaseWord(analysis) {
  const { upperPercent, lowerPercent, alphaPercent, numericPercent } = analysis;
  return lowerPercent > 0.2 && upperPercent < 0.8 && alphaPercent > 0.6 && numericPercent < 0.2;
}

function isCamelCasePattern(word) {
  let upper = 0, lower = 0, code = 0, whitespace = 0;
  for (let i = 0; i < word.length; i++) {
    code = word.charCodeAt(i);
    if (isUpper(code)) {
      upper++;
    }
    if (isLower(code)) {
      lower++;
    }
    if (isWhitespace2(code)) {
      whitespace++;
    }
  }
  if ((upper === 0 || lower === 0) && whitespace === 0) {
    return word.length <= 30;
  } else {
    return upper <= 5;
  }
}

function matchesCamelCase(word, camelCaseWord) {
  if (!camelCaseWord) {
    return null;
  }
  camelCaseWord = camelCaseWord.trim();
  if (camelCaseWord.length === 0) {
    return null;
  }
  if (!isCamelCasePattern(word)) {
    return null;
  }
  if (camelCaseWord.length > 60) {
    camelCaseWord = camelCaseWord.substring(0, 60);
  }
  const analysis = analyzeCamelCaseWord(camelCaseWord);
  if (!isCamelCaseWord(analysis)) {
    if (!isUpperCaseWord(analysis)) {
      return null;
    }
    camelCaseWord = camelCaseWord.toLowerCase();
  }
  let result = null;
  let i = 0;
  word = word.toLowerCase();
  while (i < camelCaseWord.length && (result = _matchesCamelCase(word, camelCaseWord, 0, i)) === null) {
    i = nextAnchor(camelCaseWord, i + 1);
  }
  return result;
}

var fuzzyContiguousFilter = or(matchesPrefix, matchesCamelCase, matchesContiguousSubString);

var fuzzySeparateFilter = or(matchesPrefix, matchesCamelCase, matchesSubString);

var fuzzyRegExpCache = new LRUCache(1e4);

var _maxLen = 128;

function initTable() {
  const table = [];
  const row = [];
  for (let i = 0; i <= _maxLen; i++) {
    row[i] = 0;
  }
  for (let i = 0; i <= _maxLen; i++) {
    table.push(row.slice(0));
  }
  return table;
}

function initArr(maxLen) {
  const row = [];
  for (let i = 0; i <= maxLen; i++) {
    row[i] = 0;
  }
  return row;
}

var _minWordMatchPos = initArr(2 * _maxLen);

var _maxWordMatchPos = initArr(2 * _maxLen);

var _diag = initTable();

var _table = initTable();

var _arrows = initTable();

var FuzzyScore;

((FuzzyScore2) => {
  FuzzyScore2.Default = [-100, 0];
  function isDefault(score) {
    return !score || score.length === 2 && score[0] === -100 && score[1] === 0;
  }
  FuzzyScore2.isDefault = isDefault;
})(FuzzyScore || (FuzzyScore = {}));

var FuzzyScoreOptions = class {
  constructor(firstMatchCanBeWeak, boostFullMatch) {
    this.firstMatchCanBeWeak = firstMatchCanBeWeak;
    this.boostFullMatch = boostFullMatch;
  }
  static {
    this.default = { boostFullMatch: true, firstMatchCanBeWeak: false };
  }
};
export { or, _matchesPrefix, matchesContiguousSubString, matchesSubString, _matchesSubString, isLower, isUpper, isNumber2, isWhitespace2, isAlphanumeric, join2, nextAnchor, _matchesCamelCase, analyzeCamelCaseWord, isUpperCaseWord, isCamelCaseWord, isCamelCasePattern, matchesCamelCase, initTable, initArr, matchesStrictPrefix, matchesPrefix, wordSeparators, fuzzyContiguousFilter, fuzzySeparateFilter, fuzzyRegExpCache, _maxLen, _minWordMatchPos, _maxWordMatchPos, _diag, _table, _arrows, FuzzyScore, FuzzyScoreOptions };
