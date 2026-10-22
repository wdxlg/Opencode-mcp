// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindModel.ts
import { isRequestVM, isResponseVM } from "./module-0979.mjs";
import { getChatRequestText } from "./module-2183.mjs";
import { annotateSpecialMarkdownContentWithSource } from "./module-2185.mjs";
import { moveResponseOutcomeToolsAfterFinalResponse } from "./module-2347.mjs";
import { getChatFindTextParts } from "./module-2354.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { createRegExp } from "./module-0030.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindModel.ts
var MAX_FIND_MATCHES = 9999;

function buildSegments(items) {
  const segments = [];
  for (const item of items) {
    if (isRequestVM(item)) {
      const text2 = getChatRequestText(item);
      if (text2 && text2.trim().length > 0) {
        segments.push({ itemId: item.id, itemKind: "request", partIndex: -1, text: text2 });
      }
    } else if (isResponseVM(item)) {
      const isFiltered = !!item.errorDetails?.responseIsFiltered;
      const annotated = isFiltered ? [] : annotateSpecialMarkdownContentWithSource(item.response.value);
      const renderedContent = item.isComplete ? moveResponseOutcomeToolsAfterFinalResponse(annotated.map((entry) => entry.content)) : annotated.map((entry) => entry.content);
      const trailingPartIndex = isFiltered ? 0 : renderedContent.length + 1 + (item.codeCitations?.length ? 1 : 0);
      const parts = getChatFindTextParts(item);
      const textByRenderedPart = /* @__PURE__ */ new Map();
      for (const part of parts) {
        if (part.text.trim().length > 0) {
          const annotatedPart = annotated.find((entry) => entry.sourceIndexes.includes(part.partIndex))?.content;
          const renderedPartIndex = annotatedPart ? renderedContent.indexOf(annotatedPart) : -1;
          const partIndex = renderedPartIndex >= 0 ? renderedPartIndex + 1 : -1;
          textByRenderedPart.set(partIndex, (textByRenderedPart.get(partIndex) ?? "") + part.text);
        }
      }
      for (const [partIndex, text2] of [...textByRenderedPart].sort(([first2], [second]) => {
        if (first2 === -1) {
          return 1;
        }
        if (second === -1) {
          return -1;
        }
        return first2 - second;
      })) {
        segments.push({
          itemId: item.id,
          itemKind: "response",
          partIndex,
          scopeStartPartIndex: partIndex === -1 ? trailingPartIndex : void 0,
          text: text2
        });
      }
    }
  }
  return segments;
}

var MAX_SEGMENT_SCAN = 1e5;

function findMatchesInSegment(segment, regex, limit) {
  if (limit <= 0) {
    return [];
  }
  const matches2 = [];
  regex.lastIndex = 0;
  let occurrenceIndex = 0;
  let match2;
  while (match2 = regex.exec(segment.text)) {
    matches2.push({
      itemId: segment.itemId,
      itemKind: segment.itemKind,
      partIndex: segment.partIndex,
      scopeStartPartIndex: segment.scopeStartPartIndex,
      occurrenceIndex,
      start: match2.index,
      end: match2.index + match2[0].length,
      text: match2[0]
    });
    occurrenceIndex++;
    if (match2[0].length === 0) {
      regex.lastIndex++;
    }
    if (matches2.length >= limit * 2) {
      matches2.splice(0, matches2.length - limit);
    }
    if (occurrenceIndex >= MAX_SEGMENT_SCAN) {
      break;
    }
  }
  return matches2.length > limit ? matches2.slice(-limit) : matches2;
}

var ChatFindModel = class extends Disposable {
  constructor(getItems, getViewportAnchorItemId = () => void 0) {
    super();
    this.getItems = getItems;
    this.getViewportAnchorItemId = getViewportAnchorItemId;
    this._onDidChangeMatches = this._register(new Emitter());
    this.onDidChangeMatches = this._onDidChangeMatches.event;
    this._query = "";
    this._options = { isRegex: false, matchCase: false, wholeWord: false };
    this._matches = [];
    this._activeIndex = -1;
    this._invalidRegex = false;
  }
  get query() {
    return this._query;
  }
  get options() {
    return this._options;
  }
  /** True when the current query is an invalid regular expression. */
  get isInvalidRegex() {
    return this._invalidRegex;
  }
  get matches() {
    return this._matches;
  }
  get activeIndex() {
    return this._activeIndex;
  }
  get activeMatch() {
    return this._activeIndex >= 0 ? this._matches[this._activeIndex] : void 0;
  }
  setQuery(query, options3) {
    const changed = query !== this._query || options3.isRegex !== this._options.isRegex || options3.matchCase !== this._options.matchCase || options3.wholeWord !== this._options.wholeWord;
    this._query = query;
    this._options = options3;
    if (changed) {
      this._activeAnchor = void 0;
      this._activeIndex = -1;
    }
    this.recompute();
  }
  /** Rebuilds matches from the current transcript, preserving the active match's anchor when it still exists. */
  recompute() {
    const previousAnchor = this._activeAnchor;
    if (!this._query) {
      this._matches = [];
      this._activeIndex = -1;
      this._activeAnchor = void 0;
      this._invalidRegex = false;
      this._onDidChangeMatches.fire();
      return;
    }
    let regex;
    try {
      regex = createRegExp(this._query, this._options.isRegex, {
        matchCase: this._options.matchCase,
        wholeWord: this._options.wholeWord,
        global: true,
        unicode: true
      });
      this._invalidRegex = false;
    } catch {
      this._invalidRegex = true;
      this._matches = [];
      this._activeIndex = -1;
      this._onDidChangeMatches.fire();
      return;
    }
    const items = this.getItems();
    const segments = buildSegments(items);
    const matches2 = [];
    for (let index2 = segments.length - 1; index2 >= 0 && matches2.length < MAX_FIND_MATCHES; index2--) {
      const segmentMatches = findMatchesInSegment(segments[index2], regex, MAX_FIND_MATCHES - matches2.length);
      for (let occurrence = segmentMatches.length - 1; occurrence >= 0; occurrence--) {
        matches2.push(segmentMatches[occurrence]);
      }
    }
    this._matches = matches2;
    if (previousAnchor) {
      this._activeIndex = matches2.findIndex((m) => m.itemId === previousAnchor.itemId && m.partIndex === previousAnchor.partIndex && m.occurrenceIndex === previousAnchor.occurrenceIndex);
    }
    if (this._activeIndex < 0) {
      this._activeIndex = this._seedActiveIndex(matches2, items);
    }
    this._updateAnchor();
    this._onDidChangeMatches.fire();
  }
  /** Moves to the next match in navigation order, which is the next one *back* in the transcript. */
  next() {
    if (this._matches.length === 0) {
      return void 0;
    }
    this._activeIndex = this._activeIndex < 0 ? 0 : (this._activeIndex + 1) % this._matches.length;
    this._updateAnchor();
    this._onDidChangeMatches.fire();
    return this.activeMatch;
  }
  /** Moves to the previous match in navigation order, which is the next one *forward* in the transcript. */
  previous() {
    if (this._matches.length === 0) {
      return void 0;
    }
    this._activeIndex = this._activeIndex <= 0 ? this._matches.length - 1 : this._activeIndex - 1;
    this._updateAnchor();
    this._onDidChangeMatches.fire();
    return this.activeMatch;
  }
  clear() {
    this._query = "";
    this._matches = [];
    this._activeIndex = -1;
    this._activeAnchor = void 0;
    this._invalidRegex = false;
  }
  _updateAnchor() {
    const active = this.activeMatch;
    this._activeAnchor = active ? { itemId: active.itemId, partIndex: active.partIndex, occurrenceIndex: active.occurrenceIndex } : void 0;
  }
  /**
   * Picks where to start when no previous active match survived: the newest match that is not
   * below the viewport, so Find begins at what the user is looking at rather than at the end of
   * the transcript. Falls back to the newest match overall when everything on screen is older
   * than every match.
   */
  _seedActiveIndex(matches2, items) {
    if (matches2.length === 0) {
      return -1;
    }
    const anchorItemId = this.getViewportAnchorItemId();
    if (anchorItemId === void 0) {
      return 0;
    }
    const positions = /* @__PURE__ */ new Map();
    items.forEach((item, position2) => positions.set(item.id, position2));
    const anchorPosition = positions.get(anchorItemId);
    if (anchorPosition === void 0) {
      return 0;
    }
    const seeded = matches2.findIndex((match2) => {
      const position2 = positions.get(match2.itemId);
      return position2 !== void 0 && position2 <= anchorPosition;
    });
    return seeded >= 0 ? seeded : 0;
  }
};
export { buildSegments, findMatchesInSegment, MAX_FIND_MATCHES, MAX_SEGMENT_SCAN, ChatFindModel };
