// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/notebook/common/services/notebookWebWorkerMain.js
// Original module marker: src/vs/editor/common/core/wordCharacterClassifier.ts
import { CharacterClassifier } from "./module-0034.mjs";
import { safeIntl } from "./module-0033.mjs";
import { LRUCache } from "./module-0005.mjs";


// src/vs/editor/common/core/wordCharacterClassifier.ts
var WordCharacterClassifier = class extends CharacterClassifier {
  constructor(wordSeparators, intlSegmenterLocales) {
    super(0 /* Regular */);
    this._segmenter = null;
    this._cachedLine = null;
    this._cachedSegments = [];
    this.intlSegmenterLocales = intlSegmenterLocales;
    if (this.intlSegmenterLocales.length > 0) {
      this._segmenter = safeIntl.Segmenter(this.intlSegmenterLocales, { granularity: "word" });
    } else {
      this._segmenter = null;
    }
    for (let i = 0, len = wordSeparators.length; i < len; i++) {
      this.set(wordSeparators.charCodeAt(i), 2 /* WordSeparator */);
    }
    this.set(32 /* Space */, 1 /* Whitespace */);
    this.set(9 /* Tab */, 1 /* Whitespace */);
  }
  findPrevIntlWordBeforeOrAtOffset(line, offset) {
    let candidate = null;
    for (const segment of this._getIntlSegmenterWordsOnLine(line)) {
      if (segment.index > offset) {
        break;
      }
      candidate = segment;
    }
    return candidate;
  }
  findNextIntlWordAtOrAfterOffset(lineContent, offset) {
    for (const segment of this._getIntlSegmenterWordsOnLine(lineContent)) {
      if (segment.index < offset) {
        continue;
      }
      return segment;
    }
    return null;
  }
  _getIntlSegmenterWordsOnLine(line) {
    if (!this._segmenter) {
      return [];
    }
    if (this._cachedLine === line) {
      return this._cachedSegments;
    }
    this._cachedLine = line;
    this._cachedSegments = this._filterWordSegments(this._segmenter.value.segment(line));
    return this._cachedSegments;
  }
  _filterWordSegments(segments) {
    const result = [];
    for (const segment of segments) {
      if (this._isWordLike(segment)) {
        result.push(segment);
      }
    }
    return result;
  }
  _isWordLike(segment) {
    if (segment.isWordLike) {
      return true;
    }
    return false;
  }
};

var wordClassifierCache = new LRUCache(10);

function getMapForWordSeparators(wordSeparators, intlSegmenterLocales) {
  const key = `${wordSeparators}/${intlSegmenterLocales.join(",")}`;
  let result = wordClassifierCache.get(key);
  if (!result) {
    result = new WordCharacterClassifier(wordSeparators, intlSegmenterLocales);
    wordClassifierCache.set(key, result);
  }
  return result;
}
export { getMapForWordSeparators, WordCharacterClassifier, wordClassifierCache };
