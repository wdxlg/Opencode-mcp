// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.ts
import { toLength } from "./module-0379.mjs";
import { SmallImmutableSet, identityKeyProvider } from "./module-0380.mjs";
import { Token3 } from "./module-0383.mjs";
import { BracketAstNode } from "./module-0381.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.ts
var BracketTokens = class _BracketTokens {
  constructor(map) {
    this.map = map;
    this.hasRegExp = false;
    this._regExpGlobal = null;
  }
  static createFromLanguage(configuration2, denseKeyProvider) {
    function getId(bracketInfo) {
      return denseKeyProvider.getKey(`${bracketInfo.languageId}:::${bracketInfo.bracketText}`);
    }
    const map = /* @__PURE__ */ new Map();
    for (const openingBracket of configuration2.bracketsNew.openingBrackets) {
      const length = toLength(0, openingBracket.bracketText.length);
      const openingTextId = getId(openingBracket);
      const bracketIds = SmallImmutableSet.getEmpty().add(openingTextId, identityKeyProvider);
      map.set(openingBracket.bracketText, new Token3(
        length,
        1 /* OpeningBracket */,
        openingTextId,
        bracketIds,
        BracketAstNode.create(length, openingBracket, bracketIds)
      ));
    }
    for (const closingBracket of configuration2.bracketsNew.closingBrackets) {
      const length = toLength(0, closingBracket.bracketText.length);
      let bracketIds = SmallImmutableSet.getEmpty();
      const closingBrackets = closingBracket.getOpeningBrackets();
      for (const bracket of closingBrackets) {
        bracketIds = bracketIds.add(getId(bracket), identityKeyProvider);
      }
      map.set(closingBracket.bracketText, new Token3(
        length,
        2 /* ClosingBracket */,
        getId(closingBrackets[0]),
        bracketIds,
        BracketAstNode.create(length, closingBracket, bracketIds)
      ));
    }
    return new _BracketTokens(map);
  }
  getRegExpStr() {
    if (this.isEmpty) {
      return null;
    } else {
      const keys = [...this.map.keys()];
      keys.sort();
      keys.reverse();
      return keys.map((k) => prepareBracketForRegExp2(k)).join("|");
    }
  }
  /**
   * Returns null if there is no such regexp (because there are no brackets).
  */
  get regExpGlobal() {
    if (!this.hasRegExp) {
      const regExpStr = this.getRegExpStr();
      this._regExpGlobal = regExpStr ? new RegExp(regExpStr, "gi") : null;
      this.hasRegExp = true;
    }
    return this._regExpGlobal;
  }
  getToken(value2) {
    return this.map.get(value2.toLowerCase());
  }
  findClosingTokenText(openingBracketIds) {
    for (const [closingText, info] of this.map) {
      if (info.kind === 2 /* ClosingBracket */ && info.bracketIds.intersects(openingBracketIds)) {
        return closingText;
      }
    }
    return void 0;
  }
  get isEmpty() {
    return this.map.size === 0;
  }
};

function prepareBracketForRegExp2(str) {
  let escaped = escapeRegExpCharacters(str);
  if (/^[\w ]+/.test(str)) {
    escaped = `\\b${escaped}`;
  }
  if (/[\w ]+$/.test(str)) {
    escaped = `${escaped}\\b`;
  }
  return escaped;
}

var LanguageAgnosticBracketTokens = class {
  constructor(denseKeyProvider, getLanguageConfiguration) {
    this.denseKeyProvider = denseKeyProvider;
    this.getLanguageConfiguration = getLanguageConfiguration;
    this.languageIdToBracketTokens = /* @__PURE__ */ new Map();
  }
  didLanguageChange(languageId) {
    return this.languageIdToBracketTokens.has(languageId);
  }
  getSingleLanguageBracketTokens(languageId) {
    let singleLanguageBracketTokens = this.languageIdToBracketTokens.get(languageId);
    if (!singleLanguageBracketTokens) {
      singleLanguageBracketTokens = BracketTokens.createFromLanguage(this.getLanguageConfiguration(languageId), this.denseKeyProvider);
      this.languageIdToBracketTokens.set(languageId, singleLanguageBracketTokens);
    }
    return singleLanguageBracketTokens;
  }
  getToken(value2, languageId) {
    const singleLanguageBracketTokens = this.getSingleLanguageBracketTokens(languageId);
    return singleLanguageBracketTokens.getToken(value2);
  }
};
export { prepareBracketForRegExp2, BracketTokens, LanguageAgnosticBracketTokens };
