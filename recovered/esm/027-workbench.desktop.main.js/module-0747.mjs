// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/completionModel.ts
import { FuzzyScore, FuzzyScoreOptions, anyScore, fuzzyScore, fuzzyScoreGracefulAggressive } from "./module-0453.mjs";
import { compareIgnoreCase } from "./module-0030.mjs";
import { quickSelect } from "./module-0007.mjs";


// src/vs/editor/contrib/suggest/browser/completionModel.ts
var LineContext = class {
  constructor(leadingLineContent, characterCountDelta) {
    this.leadingLineContent = leadingLineContent;
    this.characterCountDelta = characterCountDelta;
  }
};

var CompletionModel = class _CompletionModel {
  constructor(items, column, lineContext, wordDistance, options3, snippetSuggestions, fuzzyScoreOptions = FuzzyScoreOptions.default, clipboardText = void 0) {
    this.clipboardText = clipboardText;
    this._snippetCompareFn = _CompletionModel._compareCompletionItems;
    this._items = items;
    this._column = column;
    this._wordDistance = wordDistance;
    this._options = options3;
    this._refilterKind = 1 /* All */;
    this._lineContext = lineContext;
    this._fuzzyScoreOptions = fuzzyScoreOptions;
    if (snippetSuggestions === "top") {
      this._snippetCompareFn = _CompletionModel._compareCompletionItemsSnippetsUp;
    } else if (snippetSuggestions === "bottom") {
      this._snippetCompareFn = _CompletionModel._compareCompletionItemsSnippetsDown;
    }
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
  get items() {
    this._ensureCachedState();
    return this._filteredItems;
  }
  getItemsByProvider() {
    this._ensureCachedState();
    return this._itemsByProvider;
  }
  getIncompleteProvider() {
    this._ensureCachedState();
    const result = /* @__PURE__ */ new Set();
    for (const [provider, items] of this.getItemsByProvider()) {
      if (items.length > 0 && items[0].container.incomplete) {
        result.add(provider);
      }
    }
    return result;
  }
  get stats() {
    this._ensureCachedState();
    return this._stats;
  }
  _ensureCachedState() {
    if (this._refilterKind !== 0 /* Nothing */) {
      this._createCachedState();
    }
  }
  _createCachedState() {
    this._itemsByProvider = /* @__PURE__ */ new Map();
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
      const arr = this._itemsByProvider.get(item.provider);
      if (arr) {
        arr.push(item);
      } else {
        this._itemsByProvider.set(item.provider, [item]);
      }
      const overwriteBefore = item.position.column - item.editStart.column;
      const wordLen = overwriteBefore + characterCountDelta - (item.position.column - this._column);
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
        } else if (typeof item.completion.filterText === "string") {
          const match2 = scoreFn(word, wordLow, wordPos, item.completion.filterText, item.filterTextLow, 0, this._fuzzyScoreOptions);
          if (!match2) {
            continue;
          }
          if (compareIgnoreCase(item.completion.filterText, item.textLabel) === 0) {
            item.score = match2;
          } else {
            item.score = anyScore(word, wordLow, wordPos, item.textLabel, item.labelLow, 0);
            item.score[0] = match2[0];
          }
        } else {
          const match2 = scoreFn(word, wordLow, wordPos, item.textLabel, item.labelLow, 0, this._fuzzyScoreOptions);
          if (!match2) {
            continue;
          }
          item.score = match2;
        }
      }
      item.idx = i2;
      item.distance = this._wordDistance.distance(item.position, item.completion);
      target.push(item);
      labelLengths.push(item.textLabel.length);
    }
    this._filteredItems = target.sort(this._snippetCompareFn);
    this._refilterKind = 0 /* Nothing */;
    this._stats = {
      pLabelLen: labelLengths.length ? quickSelect(labelLengths.length - 0.85, labelLengths, (a, b) => a - b) : 0
    };
  }
  static _compareCompletionItems(a, b) {
    if (a.score[0] > b.score[0]) {
      return -1;
    } else if (a.score[0] < b.score[0]) {
      return 1;
    } else if (a.distance < b.distance) {
      return -1;
    } else if (a.distance > b.distance) {
      return 1;
    } else if (a.idx < b.idx) {
      return -1;
    } else if (a.idx > b.idx) {
      return 1;
    } else {
      return 0;
    }
  }
  static _compareCompletionItemsSnippetsDown(a, b) {
    if (a.completion.kind !== b.completion.kind) {
      if (a.completion.kind === 28 /* Snippet */) {
        return 1;
      } else if (b.completion.kind === 28 /* Snippet */) {
        return -1;
      }
    }
    return _CompletionModel._compareCompletionItems(a, b);
  }
  static _compareCompletionItemsSnippetsUp(a, b) {
    if (a.completion.kind !== b.completion.kind) {
      if (a.completion.kind === 28 /* Snippet */) {
        return -1;
      } else if (b.completion.kind === 28 /* Snippet */) {
        return 1;
      }
    }
    return _CompletionModel._compareCompletionItems(a, b);
  }
};
export { LineContext, CompletionModel };
