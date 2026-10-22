// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/suggest/browser/simpleCompletionModel.ts
import { FuzzyScore, FuzzyScoreOptions, fuzzyScore, fuzzyScoreGracefulAggressive } from "./module-0453.mjs";
import { quickSelect } from "./module-0007.mjs";


// src/vs/workbench/services/suggest/browser/simpleCompletionModel.ts
var LineContext3 = class {
  constructor(leadingLineContent, characterCountDelta) {
    this.leadingLineContent = leadingLineContent;
    this.characterCountDelta = characterCountDelta;
  }
};

var SimpleCompletionModel = class {
  constructor(_items2, _lineContext, _rawCompareFn) {
    this._items = _items2;
    this._lineContext = _lineContext;
    this._rawCompareFn = _rawCompareFn;
    this._refilterKind = 1 /* All */;
    this._fuzzyScoreOptions = {
      ...FuzzyScoreOptions.default,
      firstMatchCanBeWeak: true
    };
    // TODO: Pass in options
    this._options = {};
  }
  get items() {
    this._ensureCachedState();
    return this._filteredItems;
  }
  get stats() {
    this._ensureCachedState();
    return this._stats;
  }
  get lineContext() {
    return this._lineContext;
  }
  set lineContext(value2) {
    if (this._lineContext.leadingLineContent !== value2.leadingLineContent || this._lineContext.characterCountDelta !== value2.characterCountDelta) {
      this._refilterKind = this._lineContext.characterCountDelta < value2.characterCountDelta && this._filteredItems ? 2 /* Incr */ : 1 /* All */;
      this._lineContext = value2;
    }
  }
  forceRefilterAll() {
    this._refilterKind = 1 /* All */;
  }
  _ensureCachedState() {
    if (this._refilterKind !== 0 /* Nothing */) {
      this._createCachedState();
    }
  }
  _createCachedState() {
    const labelLengths = [];
    const { leadingLineContent, characterCountDelta } = this._lineContext;
    let word = "";
    let wordLow = "";
    const source = this._refilterKind === 1 /* All */ ? this._items : this._filteredItems;
    const target = [];
    const scoreFn = !this._options.filterGraceful || source.length > 2e3 ? fuzzyScore : fuzzyScoreGracefulAggressive;
    for (let i2 = 0; i2 < source.length; i2++) {
      const item = source[i2];
      if (item.isInvalid) {
        continue;
      }
      const overwriteBefore = item.completion.replacementRange ? item.completion.replacementRange[1] - item.completion.replacementRange[0] : 0;
      const wordLen = overwriteBefore + characterCountDelta;
      if (word.length !== wordLen) {
        word = wordLen === 0 ? "" : leadingLineContent.slice(-wordLen);
        wordLow = word.toLowerCase();
      }
      item.word = word;
      if (wordLen === 0) {
        item.score = FuzzyScore.Default;
      } else {
        let wordPos = 0;
        while (wordPos < overwriteBefore) {
          const ch = word.charCodeAt(wordPos);
          if (ch === 32 /* Space */ || ch === 9 /* Tab */) {
            wordPos += 1;
          } else {
            break;
          }
        }
        if (wordPos >= wordLen) {
          item.score = FuzzyScore.Default;
        } else {
          const match2 = scoreFn(word, wordLow, wordPos, item.textLabel, item.labelLow, 0, this._fuzzyScoreOptions);
          if (!match2 && word !== "") {
            continue;
          }
          item.score = match2 || FuzzyScore.Default;
        }
      }
      item.idx = i2;
      target.push(item);
      labelLengths.push(item.textLabel.length);
    }
    this._filteredItems = target.sort(this._rawCompareFn?.bind(void 0, leadingLineContent));
    this._refilterKind = 0 /* Nothing */;
    this._stats = {
      pLabelLen: labelLengths.length ? quickSelect(labelLengths.length - 0.85, labelLengths, (a, b) => a - b) : 0
    };
  }
};
export { LineContext3, SimpleCompletionModel };
