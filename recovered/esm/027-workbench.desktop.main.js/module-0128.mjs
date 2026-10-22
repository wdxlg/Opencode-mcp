// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/supports/richEditBrackets.ts
import { createRegExp, escapeRegExpCharacters } from "./module-0030.mjs";
import { getPlatformTextDecoder } from "./module-0127.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/languages/supports/richEditBrackets.ts
var RichEditBracket = class _RichEditBracket {
  constructor(languageId, index2, open2, close2, forwardRegex, reversedRegex) {
    this._richEditBracketBrand = void 0;
    this.languageId = languageId;
    this.index = index2;
    this.open = open2;
    this.close = close2;
    this.forwardRegex = forwardRegex;
    this.reversedRegex = reversedRegex;
    this._openSet = _RichEditBracket._toSet(this.open);
    this._closeSet = _RichEditBracket._toSet(this.close);
  }
  /**
   * Check if the provided `text` is an open bracket in this group.
   */
  isOpen(text2) {
    return this._openSet.has(text2);
  }
  /**
   * Check if the provided `text` is a close bracket in this group.
   */
  isClose(text2) {
    return this._closeSet.has(text2);
  }
  static _toSet(arr) {
    const result = /* @__PURE__ */ new Set();
    for (const element of arr) {
      result.add(element);
    }
    return result;
  }
};

function groupFuzzyBrackets(brackets) {
  const N = brackets.length;
  brackets = brackets.map((b) => [b[0].toLowerCase(), b[1].toLowerCase()]);
  const group2 = [];
  for (let i2 = 0; i2 < N; i2++) {
    group2[i2] = i2;
  }
  const areOverlapping = (a, b) => {
    const [aOpen, aClose] = a;
    const [bOpen, bClose] = b;
    return aOpen === bOpen || aOpen === bClose || aClose === bOpen || aClose === bClose;
  };
  const mergeGroups = (g1, g2) => {
    const newG = Math.min(g1, g2);
    const oldG = Math.max(g1, g2);
    for (let i2 = 0; i2 < N; i2++) {
      if (group2[i2] === oldG) {
        group2[i2] = newG;
      }
    }
  };
  for (let i2 = 0; i2 < N; i2++) {
    const a = brackets[i2];
    for (let j = i2 + 1; j < N; j++) {
      const b = brackets[j];
      if (areOverlapping(a, b)) {
        mergeGroups(group2[i2], group2[j]);
      }
    }
  }
  const result = [];
  for (let g = 0; g < N; g++) {
    const currentOpen = [];
    const currentClose = [];
    for (let i2 = 0; i2 < N; i2++) {
      if (group2[i2] === g) {
        const [open2, close2] = brackets[i2];
        currentOpen.push(open2);
        currentClose.push(close2);
      }
    }
    if (currentOpen.length > 0) {
      result.push({
        open: currentOpen,
        close: currentClose
      });
    }
  }
  return result;
}

var RichEditBrackets = class {
  constructor(languageId, _brackets) {
    this._richEditBracketsBrand = void 0;
    const brackets = groupFuzzyBrackets(_brackets);
    this.brackets = brackets.map((b, index2) => {
      return new RichEditBracket(
        languageId,
        index2,
        b.open,
        b.close,
        getRegexForBracketPair(b.open, b.close, brackets, index2),
        getReversedRegexForBracketPair(b.open, b.close, brackets, index2)
      );
    });
    this.forwardRegex = getRegexForBrackets(this.brackets);
    this.reversedRegex = getReversedRegexForBrackets(this.brackets);
    this.textIsBracket = {};
    this.textIsOpenBracket = {};
    this.maxBracketLength = 0;
    for (const bracket of this.brackets) {
      for (const open2 of bracket.open) {
        this.textIsBracket[open2] = bracket;
        this.textIsOpenBracket[open2] = true;
        this.maxBracketLength = Math.max(this.maxBracketLength, open2.length);
      }
      for (const close2 of bracket.close) {
        this.textIsBracket[close2] = bracket;
        this.textIsOpenBracket[close2] = false;
        this.maxBracketLength = Math.max(this.maxBracketLength, close2.length);
      }
    }
  }
};

function collectSuperstrings(str, brackets, currentIndex, dest) {
  for (let i2 = 0, len = brackets.length; i2 < len; i2++) {
    if (i2 === currentIndex) {
      continue;
    }
    const bracket = brackets[i2];
    for (const open2 of bracket.open) {
      if (open2.indexOf(str) >= 0) {
        dest.push(open2);
      }
    }
    for (const close2 of bracket.close) {
      if (close2.indexOf(str) >= 0) {
        dest.push(close2);
      }
    }
  }
}

function lengthcmp(a, b) {
  return a.length - b.length;
}

function unique(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const element of arr) {
    if (seen.has(element)) {
      continue;
    }
    result.push(element);
    seen.add(element);
  }
  return result;
}

function getRegexForBracketPair(open2, close2, brackets, currentIndex) {
  let pieces = [];
  pieces = pieces.concat(open2);
  pieces = pieces.concat(close2);
  for (let i2 = 0, len = pieces.length; i2 < len; i2++) {
    collectSuperstrings(pieces[i2], brackets, currentIndex, pieces);
  }
  pieces = unique(pieces);
  pieces.sort(lengthcmp);
  pieces.reverse();
  return createBracketOrRegExp(pieces);
}

function getReversedRegexForBracketPair(open2, close2, brackets, currentIndex) {
  let pieces = [];
  pieces = pieces.concat(open2);
  pieces = pieces.concat(close2);
  for (let i2 = 0, len = pieces.length; i2 < len; i2++) {
    collectSuperstrings(pieces[i2], brackets, currentIndex, pieces);
  }
  pieces = unique(pieces);
  pieces.sort(lengthcmp);
  pieces.reverse();
  return createBracketOrRegExp(pieces.map(toReversedString));
}

function getRegexForBrackets(brackets) {
  let pieces = [];
  for (const bracket of brackets) {
    for (const open2 of bracket.open) {
      pieces.push(open2);
    }
    for (const close2 of bracket.close) {
      pieces.push(close2);
    }
  }
  pieces = unique(pieces);
  return createBracketOrRegExp(pieces);
}

function getReversedRegexForBrackets(brackets) {
  let pieces = [];
  for (const bracket of brackets) {
    for (const open2 of bracket.open) {
      pieces.push(open2);
    }
    for (const close2 of bracket.close) {
      pieces.push(close2);
    }
  }
  pieces = unique(pieces);
  return createBracketOrRegExp(pieces.map(toReversedString));
}

function prepareBracketForRegExp(str) {
  const insertWordBoundaries = /^[\w ]+$/.test(str);
  str = escapeRegExpCharacters(str);
  return insertWordBoundaries ? `\\b${str}\\b` : str;
}

function createBracketOrRegExp(pieces, options3) {
  const regexStr = `(${pieces.map(prepareBracketForRegExp).join(")|(")})`;
  return createRegExp(regexStr, true, options3);
}

var toReversedString = /* @__PURE__ */ (function() {
  function reverse(str) {
    const arr = new Uint16Array(str.length);
    let offset = 0;
    for (let i2 = str.length - 1; i2 >= 0; i2--) {
      arr[offset++] = str.charCodeAt(i2);
    }
    return getPlatformTextDecoder().decode(arr);
  }
  let lastInput = null;
  let lastOutput = null;
  return function toReversedString2(str) {
    if (lastInput !== str) {
      lastInput = str;
      lastOutput = reverse(lastInput);
    }
    return lastOutput;
  };
})();

var BracketsUtils = class {
  static _findPrevBracketInText(reversedBracketRegex, lineNumber, reversedText, offset) {
    const m = reversedText.match(reversedBracketRegex);
    if (!m) {
      return null;
    }
    const matchOffset = reversedText.length - (m.index || 0);
    const matchLength = m[0].length;
    const absoluteMatchOffset = offset + matchOffset;
    return new Range2(lineNumber, absoluteMatchOffset - matchLength + 1, lineNumber, absoluteMatchOffset + 1);
  }
  static findPrevBracketInRange(reversedBracketRegex, lineNumber, lineText, startOffset, endOffset) {
    const reversedLineText = toReversedString(lineText);
    const reversedSubstr = reversedLineText.substring(lineText.length - endOffset, lineText.length - startOffset);
    return this._findPrevBracketInText(reversedBracketRegex, lineNumber, reversedSubstr, startOffset);
  }
  static findNextBracketInText(bracketRegex, lineNumber, text2, offset) {
    const m = text2.match(bracketRegex);
    if (!m) {
      return null;
    }
    const matchOffset = m.index || 0;
    const matchLength = m[0].length;
    if (matchLength === 0) {
      return null;
    }
    const absoluteMatchOffset = offset + matchOffset;
    return new Range2(lineNumber, absoluteMatchOffset + 1, lineNumber, absoluteMatchOffset + 1 + matchLength);
  }
  static findNextBracketInRange(bracketRegex, lineNumber, lineText, startOffset, endOffset) {
    const substr = lineText.substring(startOffset, endOffset);
    return this.findNextBracketInText(bracketRegex, lineNumber, substr, startOffset);
  }
};
export { groupFuzzyBrackets, collectSuperstrings, lengthcmp, unique, getRegexForBracketPair, getReversedRegexForBracketPair, getRegexForBrackets, getReversedRegexForBrackets, prepareBracketForRegExp, createBracketOrRegExp, RichEditBracket, RichEditBrackets, toReversedString, BracketsUtils };
