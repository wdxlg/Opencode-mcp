// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/filters.ts
import { isEmojiImprecise, startsWithIgnoreCase } from "./module-0021.mjs";
import { LRUCache } from "./module-0006.mjs";


// src/vs/base/common/filters.ts
function or(...filter) {
  return function(word, wordToMatchAgainst) {
    for (let i = 0, len = filter.length; i < len; i++) {
      const match2 = filter[i](word, wordToMatchAgainst);
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

function isWhitespace(code) {
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

function matchesFuzzy2(pattern, word) {
  const score = fuzzyScore(pattern, pattern.toLowerCase(), 0, word, word.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
  return score ? createMatches(score) : null;
}

function createMatches(score) {
  if (typeof score === "undefined") {
    return [];
  }
  const res = [];
  const wordPos = score[1];
  for (let i = score.length - 1; i > 1; i--) {
    const pos = score[i] + wordPos;
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

var _debug = false;

function printTable(table, pattern, patternLen, word, wordLen) {
  function pad(s, n, pad2 = " ") {
    while (s.length < n) {
      s = pad2 + s;
    }
    return s;
  }
  let ret = ` |   |${word.split("").map((c) => pad(c, 3)).join("|")}
`;
  for (let i = 0; i <= patternLen; i++) {
    if (i === 0) {
      ret += " |";
    } else {
      ret += `${pattern[i - 1]}|`;
    }
    ret += table[i].slice(0, wordLen + 1).map((n) => pad(n.toString(), 3)).join("|") + "\n";
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

function isSeparatorAtPos(value, index) {
  if (index < 0 || index >= value.length) {
    return false;
  }
  const code = value.codePointAt(index);
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

function isWhitespaceAtPos(value, index) {
  if (index < 0 || index >= value.length) {
    return false;
  }
  const code = value.charCodeAt(index);
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

function fuzzyScore(pattern, patternLow, patternStart, word, wordLow, wordStart, options = FuzzyScoreOptions.default) {
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
      let score = Number.MIN_SAFE_INTEGER;
      let canComeDiag = false;
      if (wordPos <= maxWordMatchPos) {
        score = _doScore(
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
      if (score !== Number.MIN_SAFE_INTEGER) {
        canComeDiag = true;
        diagScore = score + _table[row - 1][column - 1];
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
  if (!hasStrongFirstMatch[0] && !options.firstMatchCanBeWeak) {
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
  if (wordLen - wordStart === patternLen && options.boostFullMatch) {
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
  let score = 1;
  let isGapLocation = false;
  if (wordPos === patternPos - patternStart) {
    score = pattern[patternPos] === word[wordPos] ? 7 : 5;
  } else if (isUpperCaseAtPos(wordPos, word, wordLow) && (wordPos === 0 || !isUpperCaseAtPos(wordPos - 1, word, wordLow))) {
    score = pattern[patternPos] === word[wordPos] ? 7 : 5;
    isGapLocation = true;
  } else if (isSeparatorAtPos(wordLow, wordPos) && (wordPos === 0 || !isSeparatorAtPos(wordLow, wordPos - 1))) {
    score = 5;
  } else if (isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1)) {
    score = 5;
    isGapLocation = true;
  }
  if (score > 1 && patternPos === patternStart) {
    outFirstMatchStrong[0] = true;
  }
  if (!isGapLocation) {
    isGapLocation = isUpperCaseAtPos(wordPos, word, wordLow) || isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1);
  }
  if (patternPos === patternStart) {
    if (wordPos > wordStart) {
      score -= isGapLocation ? 3 : 5;
    }
  } else {
    if (newMatchStart) {
      score += isGapLocation ? 2 : 0;
    } else {
      score += isGapLocation ? 0 : 1;
    }
  }
  if (wordPos + 1 === wordLen) {
    score -= isGapLocation ? 3 : 5;
  }
  return score;
}
export { or, _matchesPrefix, matchesContiguousSubString, matchesSubString, _matchesSubString, isLower, isUpper, isNumber2, isWhitespace, isAlphanumeric, join2, nextAnchor, _matchesCamelCase, analyzeCamelCaseWord, isUpperCaseWord, isCamelCaseWord, isCamelCasePattern, matchesCamelCase, matchesFuzzy2, createMatches, initTable, initArr, printTable, printTables, isSeparatorAtPos, isWhitespaceAtPos, isUpperCaseAtPos, isPatternInWord, fuzzyScore, _fillInMaxWordMatchPos, _doScore, matchesStrictPrefix, matchesPrefix, wordSeparators, fuzzyContiguousFilter, fuzzySeparateFilter, fuzzyRegExpCache, _maxLen, _minWordMatchPos, _maxWordMatchPos, _diag, _table, _arrows, _debug, FuzzyScore, FuzzyScoreOptions };
