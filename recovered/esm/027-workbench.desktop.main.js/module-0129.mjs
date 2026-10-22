// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/supports/electricCharacter.ts
import { distinct } from "./module-0007.mjs";
import { ignoreBracketsInToken } from "./module-0109.mjs";
import { BracketsUtils } from "./module-0128.mjs";


// src/vs/editor/common/languages/supports/electricCharacter.ts
var BracketElectricCharacterSupport = class {
  constructor(richEditBrackets) {
    this._richEditBrackets = richEditBrackets;
  }
  getElectricCharacters() {
    const result = [];
    if (this._richEditBrackets) {
      for (const bracket of this._richEditBrackets.brackets) {
        for (const close2 of bracket.close) {
          const lastChar = close2.charAt(close2.length - 1);
          result.push(lastChar);
        }
      }
    }
    return distinct(result);
  }
  onElectricCharacter(character, context2, column) {
    if (!this._richEditBrackets || this._richEditBrackets.brackets.length === 0) {
      return null;
    }
    const tokenIndex = context2.findTokenIndexAtOffset(column - 1);
    if (ignoreBracketsInToken(context2.getStandardTokenType(tokenIndex))) {
      return null;
    }
    const reversedBracketRegex = this._richEditBrackets.reversedRegex;
    const text2 = context2.getLineContent().substring(0, column - 1) + character;
    const r2 = BracketsUtils.findPrevBracketInRange(reversedBracketRegex, 1, text2, 0, text2.length);
    if (!r2) {
      return null;
    }
    const bracketText = text2.substring(r2.startColumn - 1, r2.endColumn - 1).toLowerCase();
    const isOpen = this._richEditBrackets.textIsOpenBracket[bracketText];
    if (isOpen) {
      return null;
    }
    const textBeforeBracket = context2.getActualLineContentBefore(r2.startColumn - 1);
    if (!/^\s*$/.test(textBeforeBracket)) {
      return null;
    }
    return {
      matchOpenBracket: bracketText
    };
  }
};
export { BracketElectricCharacterSupport };
