// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/filters.ts
import { convertSimple2RegExpPattern, isEmojiImprecise, startsWithIgnoreCase } from "./module-0030.mjs";
import { tryNormalizeToBase } from "./module-0452.mjs";
import { getKoreanAltChars } from "./module-0451.mjs";
import { LRUCache } from "./module-0008.mjs";


// src/vs/base/common/filters.ts
function or(...filter2) {
  return function(word, wordToMatchAgainst) {
    for (let i2 = 0, len = filter2.length; i2 < len; i2++) {
      const match2 = filter2[i2](word, wordToMatchAgainst);
      if (match2) {
        return match2;
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
  let matches2;
  if (ignoreCase) {
    matches2 = startsWithIgnoreCase(wordToMatchAgainst, word);
  } else {
    matches2 = wordToMatchAgainst.indexOf(word) === 0;
  }
  if (!matches2) {
    return null;
  }
  return word.length > 0 ? [{ start: 0, end: word.length }] : [];
}

function matchesContiguousSubString(word, wordToMatchAgainst) {
  if (word.length > wordToMatchAgainst.length) {
    return null;
  }
  const index2 = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
  if (index2 === -1) {
    return null;
  }
  return [{ start: index2, end: index2 + word.length }];
}

function matchesBaseContiguousSubString(word, wordToMatchAgainst) {
  if (word.length > wordToMatchAgainst.length) {
    return null;
  }
  word = tryNormalizeToBase(word);
  wordToMatchAgainst = tryNormalizeToBase(wordToMatchAgainst);
  const index2 = wordToMatchAgainst.indexOf(word);
  if (index2 === -1) {
    return null;
  }
  return [{ start: index2, end: index2 + word.length }];
}

function matchesSubString(word, wordToMatchAgainst) {
  if (word.length > wordToMatchAgainst.length) {
    return null;
  }
  return _matchesSubString(word.toLowerCase(), wordToMatchAgainst.toLowerCase(), 0, 0);
}

function _matchesSubString(word, wordToMatchAgainst, i2, j) {
  if (i2 === word.length) {
    return [];
  } else if (j === wordToMatchAgainst.length) {
    return null;
  } else {
    if (word[i2] === wordToMatchAgainst[j]) {
      let result = null;
      if (result = _matchesSubString(word, wordToMatchAgainst, i2 + 1, j + 1)) {
        return join2({ start: j, end: j + 1 }, result);
      }
      return null;
    }
    return _matchesSubString(word, wordToMatchAgainst, i2, j + 1);
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

function isWhitespace(code) {
  return code === 32 /* Space */ || code === 9 /* Tab */ || code === 10 /* LineFeed */ || code === 13 /* CarriageReturn */;
}

var wordSeparators = /* @__PURE__ */ new Set();

"()[]{}<>`'\"-/;:,.?!".split("").forEach((s) => wordSeparators.add(s.charCodeAt(0)));

function isWordSeparator(code) {
  return isWhitespace(code) || wordSeparators.has(code);
}

function charactersMatch(codeA, codeB) {
  return codeA === codeB || isWordSeparator(codeA) && isWordSeparator(codeB);
}

var alternateCharsCache = /* @__PURE__ */ new Map();

function getAlternateCodes(code) {
  if (alternateCharsCache.has(code)) {
    return alternateCharsCache.get(code);
  }
  let result;
  const codes = getKoreanAltChars(code);
  if (codes) {
    result = codes;
  }
  alternateCharsCache.set(code, result);
  return result;
}

function isAlphanumeric(code) {
  return isLower(code) || isUpper(code) || isNumber2(code);
}

function join2(head, tail2) {
  if (tail2.length === 0) {
    tail2 = [head];
  } else if (head.end === tail2[0].start) {
    tail2[0].start = head.start;
  } else {
    tail2.unshift(head);
  }
  return tail2;
}

function nextAnchor(camelCaseWord, start) {
  for (let i2 = start; i2 < camelCaseWord.length; i2++) {
    const c = camelCaseWord.charCodeAt(i2);
    if (isUpper(c) || isNumber2(c) || i2 > 0 && !isAlphanumeric(camelCaseWord.charCodeAt(i2 - 1))) {
      return i2;
    }
  }
  return camelCaseWord.length;
}

function _matchesCamelCase(word, camelCaseWord, i2, j) {
  if (i2 === word.length) {
    return [];
  } else if (j === camelCaseWord.length) {
    return null;
  } else if (word[i2] !== camelCaseWord[j].toLowerCase()) {
    return null;
  } else {
    let result = null;
    let nextUpperIndex = j + 1;
    result = _matchesCamelCase(word, camelCaseWord, i2 + 1, j + 1);
    while (!result && (nextUpperIndex = nextAnchor(camelCaseWord, nextUpperIndex)) < camelCaseWord.length) {
      result = _matchesCamelCase(word, camelCaseWord, i2 + 1, nextUpperIndex);
      nextUpperIndex++;
    }
    return result === null ? null : join2({ start: j, end: j + 1 }, result);
  }
}

function analyzeCamelCaseWord(word) {
  let upper = 0, lower = 0, alpha = 0, numeric = 0, code = 0;
  for (let i2 = 0; i2 < word.length; i2++) {
    code = word.charCodeAt(i2);
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
  for (let i2 = 0; i2 < word.length; i2++) {
    code = word.charCodeAt(i2);
    if (isUpper(code)) {
      upper++;
    }
    if (isLower(code)) {
      lower++;
    }
    if (isWhitespace(code)) {
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
  let i2 = 0;
  word = word.toLowerCase();
  while (i2 < camelCaseWord.length && (result = _matchesCamelCase(word, camelCaseWord, 0, i2)) === null) {
    i2 = nextAnchor(camelCaseWord, i2 + 1);
  }
  return result;
}

function matchesWords(word, target, contiguous = false) {
  if (!target || target.length === 0) {
    return null;
  }
  let result = null;
  let targetIndex = 0;
  word = tryNormalizeToBase(word);
  target = tryNormalizeToBase(target);
  const memo = /* @__PURE__ */ new Map();
  while (targetIndex < target.length) {
    result = _matchesWords(word, target, 0, targetIndex, contiguous, memo);
    if (result !== null) {
      break;
    }
    targetIndex = nextWord(target, targetIndex + 1);
  }
  return result;
}

function cloneMatches(matches2) {
  if (matches2 === null) {
    return null;
  }
  const result = [];
  for (const m of matches2) {
    result.push({ start: m.start, end: m.end });
  }
  return result;
}

function _matchesWords(word, target, wordIndex, targetIndex, contiguous, memo) {
  if (wordIndex === word.length) {
    return [];
  } else if (targetIndex === target.length) {
    return null;
  }
  const memoKey = wordIndex * (target.length + 1) + targetIndex;
  const cached = memo.get(memoKey);
  if (cached !== void 0) {
    return cloneMatches(cached);
  }
  const computed = _matchesWordsCompute(word, target, wordIndex, targetIndex, contiguous, memo);
  memo.set(memoKey, cloneMatches(computed));
  return computed;
}

function _matchesWordsCompute(word, target, wordIndex, targetIndex, contiguous, memo) {
  let targetIndexOffset = 0;
  if (!charactersMatch(word.charCodeAt(wordIndex), target.charCodeAt(targetIndex))) {
    const altChars = getAlternateCodes(word.charCodeAt(wordIndex));
    if (!altChars) {
      return null;
    }
    for (let k = 0; k < altChars.length; k++) {
      if (!charactersMatch(altChars[k], target.charCodeAt(targetIndex + k))) {
        return null;
      }
    }
    targetIndexOffset += altChars.length - 1;
  }
  let result = null;
  let nextWordIndex = targetIndex + targetIndexOffset + 1;
  result = _matchesWords(word, target, wordIndex + 1, nextWordIndex, contiguous, memo);
  if (!contiguous) {
    while (!result && (nextWordIndex = nextWord(target, nextWordIndex)) < target.length) {
      result = _matchesWords(word, target, wordIndex + 1, nextWordIndex, contiguous, memo);
      nextWordIndex++;
    }
  }
  if (!result) {
    return null;
  }
  if (word.charCodeAt(wordIndex) !== target.charCodeAt(targetIndex)) {
    const altChars = getAlternateCodes(word.charCodeAt(wordIndex));
    if (!altChars) {
      return result;
    }
    for (let k = 0; k < altChars.length; k++) {
      if (altChars[k] !== target.charCodeAt(targetIndex + k)) {
        return result;
      }
    }
  }
  return join2({ start: targetIndex, end: targetIndex + targetIndexOffset + 1 }, result);
}

function nextWord(word, start) {
  for (let i2 = start; i2 < word.length; i2++) {
    if (isWordSeparator(word.charCodeAt(i2)) || i2 > 0 && isWordSeparator(word.charCodeAt(i2 - 1))) {
      return i2;
    }
  }
  return word.length;
}

var fuzzyContiguousFilter = or(matchesPrefix, matchesCamelCase, matchesContiguousSubString);

var fuzzySeparateFilter = or(matchesPrefix, matchesCamelCase, matchesSubString);

var fuzzyRegExpCache = new LRUCache(1e4);

function matchesFuzzy(word, wordToMatchAgainst, enableSeparateSubstringMatching = false) {
  if (typeof word !== "string" || typeof wordToMatchAgainst !== "string") {
    return null;
  }
  let regexp2 = fuzzyRegExpCache.get(word);
  if (!regexp2) {
    regexp2 = new RegExp(convertSimple2RegExpPattern(word), "i");
    fuzzyRegExpCache.set(word, regexp2);
  }
  const match2 = regexp2.exec(wordToMatchAgainst);
  if (match2) {
    return [{ start: match2.index, end: match2.index + match2[0].length }];
  }
  return enableSeparateSubstringMatching ? fuzzySeparateFilter(word, wordToMatchAgainst) : fuzzyContiguousFilter(word, wordToMatchAgainst);
}

function matchesFuzzy2(pattern, word) {
  const score3 = fuzzyScore(pattern, pattern.toLowerCase(), 0, word, word.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
  return score3 ? createMatches(score3) : null;
}

function anyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos) {
  const max = Math.min(13, pattern.length);
  for (; patternPos < max; patternPos++) {
    const result = fuzzyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos, { firstMatchCanBeWeak: true, boostFullMatch: true });
    if (result) {
      return result;
    }
  }
  return [0, wordPos];
}

function createMatches(score3) {
  if (typeof score3 === "undefined") {
    return [];
  }
  const res = [];
  const wordPos = score3[1];
  for (let i2 = score3.length - 1; i2 > 1; i2--) {
    const pos = score3[i2] + wordPos;
    const last = res[res.length - 1];
    if (last && last.end === pos) {
      last.end = pos + 1;
    } else {
      res.push({ start: pos, end: pos + 1 });
    }
  }
  return res;
}

var _maxLen = 128;

function initTable() {
  const table = [];
  const row = [];
  for (let i2 = 0; i2 <= _maxLen; i2++) {
    row[i2] = 0;
  }
  for (let i2 = 0; i2 <= _maxLen; i2++) {
    table.push(row.slice(0));
  }
  return table;
}

function initArr(maxLen) {
  const row = [];
  for (let i2 = 0; i2 <= maxLen; i2++) {
    row[i2] = 0;
  }
  return row;
}

var _minWordMatchPos = initArr(2 * _maxLen);

var _maxWordMatchPos = initArr(2 * _maxLen);

var _diag = initTable();

var _table = initTable();

var _arrows = initTable();

var _debug = false;

function printTable(table, pattern, patternLen, word, wordLen) {
  function pad(s, n2, pad2 = " ") {
    while (s.length < n2) {
      s = pad2 + s;
    }
    return s;
  }
  let ret = ` |   |${word.split("").map((c) => pad(c, 3)).join("|")}
`;
  for (let i2 = 0; i2 <= patternLen; i2++) {
    if (i2 === 0) {
      ret += " |";
    } else {
      ret += `${pattern[i2 - 1]}|`;
    }
    ret += table[i2].slice(0, wordLen + 1).map((n2) => pad(n2.toString(), 3)).join("|") + "\n";
  }
  return ret;
}

function printTables(pattern, patternStart, word, wordStart) {
  pattern = pattern.substr(patternStart);
  word = word.substr(wordStart);
  console.log(printTable(_table, pattern, pattern.length, word, word.length));
  console.log(printTable(_arrows, pattern, pattern.length, word, word.length));
  console.log(printTable(_diag, pattern, pattern.length, word, word.length));
}

function isSeparatorAtPos(value2, index2) {
  if (index2 < 0 || index2 >= value2.length) {
    return false;
  }
  const code = value2.codePointAt(index2);
  switch (code) {
    case 95 /* Underline */:
    case 45 /* Dash */:
    case 46 /* Period */:
    case 32 /* Space */:
    case 47 /* Slash */:
    case 92 /* Backslash */:
    case 39 /* SingleQuote */:
    case 34 /* DoubleQuote */:
    case 58 /* Colon */:
    case 36 /* DollarSign */:
    case 60 /* LessThan */:
    case 62 /* GreaterThan */:
    case 40 /* OpenParen */:
    case 41 /* CloseParen */:
    case 91 /* OpenSquareBracket */:
    case 93 /* CloseSquareBracket */:
    case 123 /* OpenCurlyBrace */:
    case 125 /* CloseCurlyBrace */:
      return true;
    case void 0:
      return false;
    default:
      if (isEmojiImprecise(code)) {
        return true;
      }
      return false;
  }
}

function isWhitespaceAtPos(value2, index2) {
  if (index2 < 0 || index2 >= value2.length) {
    return false;
  }
  const code = value2.charCodeAt(index2);
  switch (code) {
    case 32 /* Space */:
    case 9 /* Tab */:
      return true;
    default:
      return false;
  }
}

function isUpperCaseAtPos(pos, word, wordLow) {
  return word[pos] !== wordLow[pos];
}

function isPatternInWord(patternLow, patternPos, patternLen, wordLow, wordPos, wordLen, fillMinWordPosArr = false) {
  while (patternPos < patternLen && wordPos < wordLen) {
    if (patternLow[patternPos] === wordLow[wordPos]) {
      if (fillMinWordPosArr) {
        _minWordMatchPos[patternPos] = wordPos;
      }
      patternPos += 1;
    }
    wordPos += 1;
  }
  return patternPos === patternLen;
}

var FuzzyScore;

((FuzzyScore22) => {
  FuzzyScore22.Default = [-100, 0];
  function isDefault(score3) {
    return !score3 || score3.length === 2 && score3[0] === -100 && score3[1] === 0;
  }
  FuzzyScore22.isDefault = isDefault;
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

function fuzzyScore(pattern, patternLow, patternStart, word, wordLow, wordStart, options3 = FuzzyScoreOptions.default) {
  const patternLen = pattern.length > _maxLen ? _maxLen : pattern.length;
  const wordLen = word.length > _maxLen ? _maxLen : word.length;
  if (patternStart >= patternLen || wordStart >= wordLen || patternLen - patternStart > wordLen - wordStart) {
    return void 0;
  }
  if (!isPatternInWord(patternLow, patternStart, patternLen, wordLow, wordStart, wordLen, true)) {
    return void 0;
  }
  _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow);
  let row = 1;
  let column = 1;
  let patternPos = patternStart;
  let wordPos = wordStart;
  const hasStrongFirstMatch = [false];
  for (row = 1, patternPos = patternStart; patternPos < patternLen; row++, patternPos++) {
    const minWordMatchPos = _minWordMatchPos[patternPos];
    const maxWordMatchPos = _maxWordMatchPos[patternPos];
    const nextMaxWordMatchPos = patternPos + 1 < patternLen ? _maxWordMatchPos[patternPos + 1] : wordLen;
    for (column = minWordMatchPos - wordStart + 1, wordPos = minWordMatchPos; wordPos < nextMaxWordMatchPos; column++, wordPos++) {
      let score3 = Number.MIN_SAFE_INTEGER;
      let canComeDiag = false;
      if (wordPos <= maxWordMatchPos) {
        score3 = _doScore(
          pattern,
          patternLow,
          patternPos,
          patternStart,
          word,
          wordLow,
          wordPos,
          wordLen,
          wordStart,
          _diag[row - 1][column - 1] === 0,
          hasStrongFirstMatch
        );
      }
      let diagScore = 0;
      if (score3 !== Number.MIN_SAFE_INTEGER) {
        canComeDiag = true;
        diagScore = score3 + _table[row - 1][column - 1];
      }
      const canComeLeft = wordPos > minWordMatchPos;
      const leftScore = canComeLeft ? _table[row][column - 1] + (_diag[row][column - 1] > 0 ? -5 : 0) : 0;
      const canComeLeftLeft = wordPos > minWordMatchPos + 1 && _diag[row][column - 1] > 0;
      const leftLeftScore = canComeLeftLeft ? _table[row][column - 2] + (_diag[row][column - 2] > 0 ? -5 : 0) : 0;
      if (canComeLeftLeft && (!canComeLeft || leftLeftScore >= leftScore) && (!canComeDiag || leftLeftScore >= diagScore)) {
        _table[row][column] = leftLeftScore;
        _arrows[row][column] = 3 /* LeftLeft */;
        _diag[row][column] = 0;
      } else if (canComeLeft && (!canComeDiag || leftScore >= diagScore)) {
        _table[row][column] = leftScore;
        _arrows[row][column] = 2 /* Left */;
        _diag[row][column] = 0;
      } else if (canComeDiag) {
        _table[row][column] = diagScore;
        _arrows[row][column] = 1 /* Diag */;
        _diag[row][column] = _diag[row - 1][column - 1] + 1;
      } else {
        throw new Error(`not possible`);
      }
    }
  }
  if (_debug) {
    printTables(pattern, patternStart, word, wordStart);
  }
  if (!hasStrongFirstMatch[0] && !options3.firstMatchCanBeWeak) {
    return void 0;
  }
  row--;
  column--;
  const result = [_table[row][column], wordStart];
  let backwardsDiagLength = 0;
  let maxMatchColumn = 0;
  while (row >= 1) {
    let diagColumn = column;
    do {
      const arrow = _arrows[row][diagColumn];
      if (arrow === 3 /* LeftLeft */) {
        diagColumn = diagColumn - 2;
      } else if (arrow === 2 /* Left */) {
        diagColumn = diagColumn - 1;
      } else {
        break;
      }
    } while (diagColumn >= 1);
    if (backwardsDiagLength > 1 && patternLow[patternStart + row - 1] === wordLow[wordStart + column - 1] && !isUpperCaseAtPos(diagColumn + wordStart - 1, word, wordLow) && backwardsDiagLength + 1 > _diag[row][diagColumn]) {
      diagColumn = column;
    }
    if (diagColumn === column) {
      backwardsDiagLength++;
    } else {
      backwardsDiagLength = 1;
    }
    if (!maxMatchColumn) {
      maxMatchColumn = diagColumn;
    }
    row--;
    column = diagColumn - 1;
    result.push(column);
  }
  if (wordLen - wordStart === patternLen && options3.boostFullMatch) {
    result[0] += 2;
  }
  const skippedCharsCount = maxMatchColumn - patternLen;
  result[0] -= skippedCharsCount;
  return result;
}

function _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow) {
  let patternPos = patternLen - 1;
  let wordPos = wordLen - 1;
  while (patternPos >= patternStart && wordPos >= wordStart) {
    if (patternLow[patternPos] === wordLow[wordPos]) {
      _maxWordMatchPos[patternPos] = wordPos;
      patternPos--;
    }
    wordPos--;
  }
}

function _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos, wordLen, wordStart, newMatchStart, outFirstMatchStrong) {
  if (patternLow[patternPos] !== wordLow[wordPos]) {
    return Number.MIN_SAFE_INTEGER;
  }
  let score3 = 1;
  let isGapLocation = false;
  if (wordPos === patternPos - patternStart) {
    score3 = pattern[patternPos] === word[wordPos] ? 7 : 5;
  } else if (isUpperCaseAtPos(wordPos, word, wordLow) && (wordPos === 0 || !isUpperCaseAtPos(wordPos - 1, word, wordLow))) {
    score3 = pattern[patternPos] === word[wordPos] ? 7 : 5;
    isGapLocation = true;
  } else if (isSeparatorAtPos(wordLow, wordPos) && (wordPos === 0 || !isSeparatorAtPos(wordLow, wordPos - 1))) {
    score3 = 5;
  } else if (isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1)) {
    score3 = 5;
    isGapLocation = true;
  }
  if (score3 > 1 && patternPos === patternStart) {
    outFirstMatchStrong[0] = true;
  }
  if (!isGapLocation) {
    isGapLocation = isUpperCaseAtPos(wordPos, word, wordLow) || isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1);
  }
  if (patternPos === patternStart) {
    if (wordPos > wordStart) {
      score3 -= isGapLocation ? 3 : 5;
    }
  } else {
    if (newMatchStart) {
      score3 += isGapLocation ? 2 : 0;
    } else {
      score3 += isGapLocation ? 0 : 1;
    }
  }
  if (wordPos + 1 === wordLen) {
    score3 -= isGapLocation ? 3 : 5;
  }
  return score3;
}

function fuzzyScoreGracefulAggressive(pattern, lowPattern, patternPos, word, lowWord, wordPos, options3) {
  return fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, true, options3);
}

function fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, aggressive, options3) {
  let top2 = fuzzyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos, options3);
  if (top2 && !aggressive) {
    return top2;
  }
  if (pattern.length >= 3) {
    const tries = Math.min(7, pattern.length - 1);
    for (let movingPatternPos = patternPos + 1; movingPatternPos < tries; movingPatternPos++) {
      const newPattern = nextTypoPermutation(pattern, movingPatternPos);
      if (newPattern) {
        const candidate = fuzzyScore(newPattern, newPattern.toLowerCase(), patternPos, word, lowWord, wordPos, options3);
        if (candidate) {
          candidate[0] -= 3;
          if (!top2 || candidate[0] > top2[0]) {
            top2 = candidate;
          }
        }
      }
    }
  }
  return top2;
}

function nextTypoPermutation(pattern, patternPos) {
  if (patternPos + 1 >= pattern.length) {
    return void 0;
  }
  const swap1 = pattern[patternPos];
  const swap2 = pattern[patternPos + 1];
  if (swap1 === swap2) {
    return void 0;
  }
  return pattern.slice(0, patternPos) + swap2 + swap1 + pattern.slice(patternPos + 2);
}
export { or, _matchesPrefix, matchesContiguousSubString, matchesBaseContiguousSubString, matchesSubString, _matchesSubString, isLower, isUpper, isNumber2, isWhitespace, isWordSeparator, charactersMatch, getAlternateCodes, isAlphanumeric, join2, nextAnchor, _matchesCamelCase, analyzeCamelCaseWord, isUpperCaseWord, isCamelCaseWord, isCamelCasePattern, matchesCamelCase, matchesWords, cloneMatches, _matchesWords, _matchesWordsCompute, nextWord, matchesFuzzy, matchesFuzzy2, anyScore, createMatches, initTable, initArr, printTable, printTables, isSeparatorAtPos, isWhitespaceAtPos, isUpperCaseAtPos, isPatternInWord, fuzzyScore, _fillInMaxWordMatchPos, _doScore, fuzzyScoreGracefulAggressive, fuzzyScoreWithPermutations, nextTypoPermutation, matchesStrictPrefix, matchesPrefix, wordSeparators, alternateCharsCache, fuzzyContiguousFilter, fuzzySeparateFilter, fuzzyRegExpCache, _maxLen, _minWordMatchPos, _maxWordMatchPos, _diag, _table, _arrows, _debug, FuzzyScore, FuzzyScoreOptions };
