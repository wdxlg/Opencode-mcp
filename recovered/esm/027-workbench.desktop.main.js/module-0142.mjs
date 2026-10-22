// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/supports/languageBracketsConfiguration.ts
import { CachedFunction } from "./module-0027.mjs";
import { createBracketOrRegExp } from "./module-0128.mjs";


// src/vs/editor/common/languages/supports/languageBracketsConfiguration.ts
var LanguageBracketsConfiguration = class {
  constructor(languageId, config) {
    this.languageId = languageId;
    const bracketPairs = config.brackets ? filterValidBrackets(config.brackets) : [];
    const openingBracketInfos = new CachedFunction((bracket) => {
      const closing = /* @__PURE__ */ new Set();
      return {
        info: new OpeningBracketKind(this, bracket, closing),
        closing
      };
    });
    const closingBracketInfos = new CachedFunction((bracket) => {
      const opening = /* @__PURE__ */ new Set();
      const openingColorized = /* @__PURE__ */ new Set();
      return {
        info: new ClosingBracketKind(this, bracket, opening, openingColorized),
        opening,
        openingColorized
      };
    });
    for (const [open2, close2] of bracketPairs) {
      const opening = openingBracketInfos.get(open2);
      const closing = closingBracketInfos.get(close2);
      opening.closing.add(closing.info);
      closing.opening.add(opening.info);
    }
    const colorizedBracketPairs = config.colorizedBracketPairs ? filterValidBrackets(config.colorizedBracketPairs) : bracketPairs.filter((p) => !(p[0] === "<" && p[1] === ">"));
    for (const [open2, close2] of colorizedBracketPairs) {
      const opening = openingBracketInfos.get(open2);
      const closing = closingBracketInfos.get(close2);
      opening.closing.add(closing.info);
      closing.openingColorized.add(opening.info);
      closing.opening.add(opening.info);
    }
    this._openingBrackets = new Map([...openingBracketInfos.cachedValues].map(([k, v2]) => [k, v2.info]));
    this._closingBrackets = new Map([...closingBracketInfos.cachedValues].map(([k, v2]) => [k, v2.info]));
  }
  /**
   * No two brackets have the same bracket text.
  */
  get openingBrackets() {
    return [...this._openingBrackets.values()];
  }
  /**
   * No two brackets have the same bracket text.
  */
  get closingBrackets() {
    return [...this._closingBrackets.values()];
  }
  getOpeningBracketInfo(bracketText) {
    return this._openingBrackets.get(bracketText);
  }
  getClosingBracketInfo(bracketText) {
    return this._closingBrackets.get(bracketText);
  }
  getBracketInfo(bracketText) {
    return this.getOpeningBracketInfo(bracketText) || this.getClosingBracketInfo(bracketText);
  }
  getBracketRegExp(options3) {
    const brackets = Array.from([...this._openingBrackets.keys(), ...this._closingBrackets.keys()]);
    return createBracketOrRegExp(brackets, options3);
  }
};

function filterValidBrackets(bracketPairs) {
  return bracketPairs.filter(([open2, close2]) => open2 !== "" && close2 !== "");
}

var BracketKindBase = class {
  constructor(config, bracketText) {
    this.config = config;
    this.bracketText = bracketText;
  }
  get languageId() {
    return this.config.languageId;
  }
};

var OpeningBracketKind = class extends BracketKindBase {
  constructor(config, bracketText, openedBrackets) {
    super(config, bracketText);
    this.openedBrackets = openedBrackets;
    this.isOpeningBracket = true;
  }
};

var ClosingBracketKind = class extends BracketKindBase {
  constructor(config, bracketText, openingBrackets, openingColorizedBrackets) {
    super(config, bracketText);
    this.openingBrackets = openingBrackets;
    this.openingColorizedBrackets = openingColorizedBrackets;
    this.isOpeningBracket = false;
  }
  /**
   * Checks if this bracket closes the given other bracket.
   * If the bracket infos come from different configurations, this method will return false.
  */
  closes(other) {
    if (other["config"] !== this.config) {
      return false;
    }
    return this.openingBrackets.has(other);
  }
  closesColorized(other) {
    if (other["config"] !== this.config) {
      return false;
    }
    return this.openingColorizedBrackets.has(other);
  }
  getOpeningBrackets() {
    return [...this.openingBrackets];
  }
};
export { filterValidBrackets, LanguageBracketsConfiguration, BracketKindBase, OpeningBracketKind, ClosingBracketKind };
