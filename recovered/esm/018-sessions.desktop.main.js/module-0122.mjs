// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/wordCharacterClassifier.ts
import { CharacterClassifier } from "./module-0121.mjs";
import { safeIntl } from "./module-0120.mjs";
import { LRUCache } from "./module-0008.mjs";


// src/vs/editor/common/core/wordCharacterClassifier.ts
var WordCharacterClassifier = class extends CharacterClassifier {
  constructor(wordSeparators2, intlSegmenterLocales) {
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
    for (let i2 = 0, len = wordSeparators2.length; i2 < len; i2++) {
      this.set(wordSeparators2.charCodeAt(i2), 2 /* WordSeparator */);
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

function getMapForWordSeparators(wordSeparators2, intlSegmenterLocales) {
  const key3 = `${wordSeparators2}/${intlSegmenterLocales.join(",")}`;
  let result = wordClassifierCache.get(key3);
  if (!result) {
    result = new WordCharacterClassifier(wordSeparators2, intlSegmenterLocales);
    wordClassifierCache.set(key3, result);
  }
  return result;
}
export { getMapForWordSeparators, WordCharacterClassifier, wordClassifierCache };
