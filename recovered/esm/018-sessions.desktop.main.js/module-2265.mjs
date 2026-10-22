// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/buffers/wordBuffer.ts
import { getNWords } from "./module-0978.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/buffers/wordBuffer.ts
var MIN_RATE = 40;

var MAX_RATE = 2e3;

var MIN_RATE_AFTER_COMPLETE = 80;

var DEFAULT_RATE = 8;

var WordBuffer = class {
  constructor() {
    this.handlesFlush = true;
    /** The full markdown received so far. */
    this._fullMarkdown = "";
    /** Number of words currently revealed to the DOM. */
    this._revealedWordCount = 0;
    /** The markdown string last committed to the DOM. */
    this._lastCommittedMarkdown = "";
    /** Whether there are still unrevealed words to show. */
    this._needsNextFrame = false;
    /** Timestamp of the last successful commit. */
    this._lastCommitTime = 0;
    /** Estimated word production rate (words/sec). */
    this._rate = DEFAULT_RATE;
  }
  get needsNextFrame() {
    return this._needsNextFrame;
  }
  /**
   * Set the estimated word production rate from the model's
   * `impliedWordLoadRate`. Called by the orchestrator.
   */
  setRate(rate, isComplete) {
    if (isComplete) {
      this._rate = typeof rate === "number" ? Math.max(rate, MIN_RATE_AFTER_COMPLETE) : MIN_RATE_AFTER_COMPLETE;
    } else {
      this._rate = typeof rate === "number" ? Math.min(Math.max(rate, MIN_RATE), MAX_RATE) : DEFAULT_RATE;
    }
  }
  getRenderable(fullMarkdown, _lastRendered) {
    this._fullMarkdown = fullMarkdown;
    return fullMarkdown;
  }
  filterFlush(markdown) {
    this._fullMarkdown = markdown;
    const now = Date.now();
    if (this._lastCommitTime === 0) {
      this._lastCommitTime = now;
      this._revealedWordCount = 1;
    } else {
      const elapsed = now - this._lastCommitTime;
      const newWords = Math.floor(elapsed / 1e3 * this._rate);
      if (newWords > 0) {
        this._revealedWordCount += newWords;
        this._lastCommitTime = now;
      }
    }
    const result = getNWords(this._fullMarkdown, this._revealedWordCount);
    if (result.isFullString) {
      this._needsNextFrame = false;
      this._revealedWordCount = result.returnedWordCount;
      this._lastCommittedMarkdown = this._fullMarkdown;
      return this._fullMarkdown;
    }
    this._needsNextFrame = true;
    if (result.value.length <= this._lastCommittedMarkdown.length) {
      return void 0;
    }
    this._lastCommittedMarkdown = result.value;
    return result.value;
  }
};
export { MIN_RATE, MAX_RATE, MIN_RATE_AFTER_COMPLETE, DEFAULT_RATE, WordBuffer };
