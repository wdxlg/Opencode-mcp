// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/languageConfiguration.ts



// src/vs/editor/common/languages/languageConfiguration.ts
var StandardAutoClosingPairConditional = class {
  constructor(source) {
    this._neutralCharacter = null;
    this._neutralCharacterSearched = false;
    this.open = source.open;
    this.close = source.close;
    this._inString = true;
    this._inComment = true;
    this._inRegEx = true;
    if (Array.isArray(source.notIn)) {
      for (let i2 = 0, len = source.notIn.length; i2 < len; i2++) {
        const notIn = source.notIn[i2];
        switch (notIn) {
          case "string":
            this._inString = false;
            break;
          case "comment":
            this._inComment = false;
            break;
          case "regex":
            this._inRegEx = false;
            break;
        }
      }
    }
  }
  isOK(standardToken) {
    switch (standardToken) {
      case 0 /* Other */:
        return true;
      case 1 /* Comment */:
        return this._inComment;
      case 2 /* String */:
        return this._inString;
      case 3 /* RegEx */:
        return this._inRegEx;
    }
  }
  shouldAutoClose(context2, column) {
    if (context2.getTokenCount() === 0) {
      return true;
    }
    const tokenIndex = context2.findTokenIndexAtOffset(column - 2);
    const standardTokenType = context2.getStandardTokenType(tokenIndex);
    return this.isOK(standardTokenType);
  }
  _findNeutralCharacterInRange(fromCharCode, toCharCode) {
    for (let charCode = fromCharCode; charCode <= toCharCode; charCode++) {
      const character = String.fromCharCode(charCode);
      if (!this.open.includes(character) && !this.close.includes(character)) {
        return character;
      }
    }
    return null;
  }
  /**
   * Find a character in the range [0-9a-zA-Z] that does not appear in the open or close
   */
  findNeutralCharacter() {
    if (!this._neutralCharacterSearched) {
      this._neutralCharacterSearched = true;
      if (!this._neutralCharacter) {
        this._neutralCharacter = this._findNeutralCharacterInRange(48 /* Digit0 */, 57 /* Digit9 */);
      }
      if (!this._neutralCharacter) {
        this._neutralCharacter = this._findNeutralCharacterInRange(97 /* a */, 122 /* z */);
      }
      if (!this._neutralCharacter) {
        this._neutralCharacter = this._findNeutralCharacterInRange(65 /* A */, 90 /* Z */);
      }
    }
    return this._neutralCharacter;
  }
};

var AutoClosingPairs = class {
  constructor(autoClosingPairs) {
    this.autoClosingPairsOpenByStart = /* @__PURE__ */ new Map();
    this.autoClosingPairsOpenByEnd = /* @__PURE__ */ new Map();
    this.autoClosingPairsCloseByStart = /* @__PURE__ */ new Map();
    this.autoClosingPairsCloseByEnd = /* @__PURE__ */ new Map();
    this.autoClosingPairsCloseSingleChar = /* @__PURE__ */ new Map();
    for (const pair of autoClosingPairs) {
      appendEntry(this.autoClosingPairsOpenByStart, pair.open.charAt(0), pair);
      appendEntry(this.autoClosingPairsOpenByEnd, pair.open.charAt(pair.open.length - 1), pair);
      appendEntry(this.autoClosingPairsCloseByStart, pair.close.charAt(0), pair);
      appendEntry(this.autoClosingPairsCloseByEnd, pair.close.charAt(pair.close.length - 1), pair);
      if (pair.close.length === 1 && pair.open.length === 1) {
        appendEntry(this.autoClosingPairsCloseSingleChar, pair.close, pair);
      }
    }
  }
};

function appendEntry(target, key3, value2) {
  if (target.has(key3)) {
    target.get(key3).push(value2);
  } else {
    target.set(key3, [value2]);
  }
}
export { appendEntry, StandardAutoClosingPairConditional, AutoClosingPairs };
