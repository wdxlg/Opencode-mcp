// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/textModelTokens.ts
import { LineTokens } from "./module-0145.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { countEOL } from "./module-0375.mjs";
import { LineRange } from "./module-0174.mjs";
import { FixedArray } from "./module-0409.mjs";
import { nullTokenizeEncoded } from "./module-0408.mjs";
import { runWhenGlobalIdle } from "./module-0036.mjs";
import { setTimeout0 } from "./module-0014.mjs";
import { ContiguousMultilineTokensBuilder } from "./module-0412.mjs";
import { StopWatch } from "./module-0016.mjs";


// src/vs/editor/common/model/textModelTokens.ts
var TokenizerWithStateStore = class {
  constructor(lineCount, tokenizationSupport) {
    this.tokenizationSupport = tokenizationSupport;
    this.initialState = this.tokenizationSupport.getInitialState();
    this.store = new TrackingTokenizationStateStore(lineCount);
  }
  getStartState(lineNumber) {
    return this.store.getStartState(lineNumber, this.initialState);
  }
  getFirstInvalidLine() {
    return this.store.getFirstInvalidLine(this.initialState);
  }
};

var TokenizerWithStateStoreAndTextModel = class extends TokenizerWithStateStore {
  constructor(lineCount, tokenizationSupport, _textModel, _languageIdCodec) {
    super(lineCount, tokenizationSupport);
    this._textModel = _textModel;
    this._languageIdCodec = _languageIdCodec;
  }
  updateTokensUntilLine(builder, lineNumber) {
    const languageId = this._textModel.getLanguageId();
    while (true) {
      const lineToTokenize = this.getFirstInvalidLine();
      if (!lineToTokenize || lineToTokenize.lineNumber > lineNumber) {
        break;
      }
      const text2 = this._textModel.getLineContent(lineToTokenize.lineNumber);
      const r2 = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, text2, true, lineToTokenize.startState);
      builder.add(lineToTokenize.lineNumber, r2.tokens);
      this.store.setEndState(lineToTokenize.lineNumber, r2.endState);
    }
  }
  /** assumes state is up to date */
  getTokenTypeIfInsertingCharacter(position2, character) {
    const lineStartState = this.getStartState(position2.lineNumber);
    if (!lineStartState) {
      return 0 /* Other */;
    }
    const languageId = this._textModel.getLanguageId();
    const lineContent = this._textModel.getLineContent(position2.lineNumber);
    const text2 = lineContent.substring(0, position2.column - 1) + character + lineContent.substring(position2.column - 1);
    const r2 = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, text2, true, lineStartState);
    const lineTokens = new LineTokens(r2.tokens, text2, this._languageIdCodec);
    if (lineTokens.getCount() === 0) {
      return 0 /* Other */;
    }
    const tokenIndex = lineTokens.findTokenIndexAtOffset(position2.column - 1);
    return lineTokens.getStandardTokenType(tokenIndex);
  }
  /** assumes state is up to date */
  tokenizeLinesAt(lineNumber, lines) {
    const lineStartState = this.getStartState(lineNumber);
    if (!lineStartState) {
      return null;
    }
    const languageId = this._textModel.getLanguageId();
    const result = [];
    let state = lineStartState;
    for (const line of lines) {
      const r2 = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, line, true, state);
      result.push(new LineTokens(r2.tokens, line, this._languageIdCodec));
      state = r2.endState;
    }
    return result;
  }
  hasAccurateTokensForLine(lineNumber) {
    const firstInvalidLineNumber = this.store.getFirstInvalidEndStateLineNumberOrMax();
    return lineNumber < firstInvalidLineNumber;
  }
  isCheapToTokenize(lineNumber) {
    const firstInvalidLineNumber = this.store.getFirstInvalidEndStateLineNumberOrMax();
    if (lineNumber < firstInvalidLineNumber) {
      return true;
    }
    if (lineNumber === firstInvalidLineNumber && this._textModel.getLineLength(lineNumber) < 2048 /* CHEAP_TOKENIZATION_LENGTH_LIMIT */) {
      return true;
    }
    return false;
  }
  /**
   * The result is not cached.
   */
  tokenizeHeuristically(builder, startLineNumber, endLineNumber) {
    if (endLineNumber <= this.store.getFirstInvalidEndStateLineNumberOrMax()) {
      return { heuristicTokens: false };
    }
    if (startLineNumber <= this.store.getFirstInvalidEndStateLineNumberOrMax()) {
      this.updateTokensUntilLine(builder, endLineNumber);
      return { heuristicTokens: false };
    }
    let state = this.guessStartState(startLineNumber);
    const languageId = this._textModel.getLanguageId();
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      const text2 = this._textModel.getLineContent(lineNumber);
      const r2 = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, text2, true, state);
      builder.add(lineNumber, r2.tokens);
      state = r2.endState;
    }
    return { heuristicTokens: true };
  }
  guessStartState(lineNumber) {
    let { likelyRelevantLines, initialState } = findLikelyRelevantLines(this._textModel, lineNumber, this);
    if (!initialState) {
      initialState = this.tokenizationSupport.getInitialState();
    }
    const languageId = this._textModel.getLanguageId();
    let state = initialState;
    for (const line of likelyRelevantLines) {
      const r2 = safeTokenize(this._languageIdCodec, languageId, this.tokenizationSupport, line, false, state);
      state = r2.endState;
    }
    return state;
  }
};

function findLikelyRelevantLines(model, lineNumber, store) {
  let nonWhitespaceColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
  const likelyRelevantLines = [];
  let initialState = null;
  for (let i2 = lineNumber - 1; nonWhitespaceColumn > 1 && i2 >= 1; i2--) {
    const newNonWhitespaceIndex = model.getLineFirstNonWhitespaceColumn(i2);
    if (newNonWhitespaceIndex === 0) {
      continue;
    }
    if (newNonWhitespaceIndex < nonWhitespaceColumn) {
      likelyRelevantLines.push(model.getLineContent(i2));
      nonWhitespaceColumn = newNonWhitespaceIndex;
      initialState = store?.getStartState(i2);
      if (initialState) {
        break;
      }
    }
  }
  likelyRelevantLines.reverse();
  return { likelyRelevantLines, initialState: initialState ?? void 0 };
}

var TrackingTokenizationStateStore = class {
  constructor(lineCount) {
    this.lineCount = lineCount;
    this._tokenizationStateStore = new TokenizationStateStore();
    this._invalidEndStatesLineNumbers = new RangePriorityQueueImpl();
    this._invalidEndStatesLineNumbers.addRange(new OffsetRange(1, lineCount + 1));
  }
  getEndState(lineNumber) {
    return this._tokenizationStateStore.getEndState(lineNumber);
  }
  /**
   * @returns if the end state has changed.
   */
  setEndState(lineNumber, state) {
    if (!state) {
      throw new BugIndicatingError("Cannot set null/undefined state");
    }
    this._invalidEndStatesLineNumbers.delete(lineNumber);
    const r2 = this._tokenizationStateStore.setEndState(lineNumber, state);
    if (r2 && lineNumber < this.lineCount) {
      this._invalidEndStatesLineNumbers.addRange(new OffsetRange(lineNumber + 1, lineNumber + 2));
    }
    return r2;
  }
  acceptChange(range2, newLineCount) {
    this.lineCount += newLineCount - range2.length;
    this._tokenizationStateStore.acceptChange(range2, newLineCount);
    this._invalidEndStatesLineNumbers.addRangeAndResize(new OffsetRange(range2.startLineNumber, range2.endLineNumberExclusive), newLineCount);
  }
  acceptChanges(changes) {
    for (const c of changes) {
      const [eolCount] = countEOL(c.text);
      this.acceptChange(new LineRange(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
    }
  }
  invalidateEndStateRange(range2) {
    this._invalidEndStatesLineNumbers.addRange(new OffsetRange(range2.startLineNumber, range2.endLineNumberExclusive));
  }
  getFirstInvalidEndStateLineNumber() {
    return this._invalidEndStatesLineNumbers.min;
  }
  getFirstInvalidEndStateLineNumberOrMax() {
    return this.getFirstInvalidEndStateLineNumber() || Number.MAX_SAFE_INTEGER;
  }
  allStatesValid() {
    return this._invalidEndStatesLineNumbers.min === null;
  }
  getStartState(lineNumber, initialState) {
    if (lineNumber === 1) {
      return initialState;
    }
    return this.getEndState(lineNumber - 1);
  }
  getFirstInvalidLine(initialState) {
    const lineNumber = this.getFirstInvalidEndStateLineNumber();
    if (lineNumber === null) {
      return null;
    }
    const startState = this.getStartState(lineNumber, initialState);
    if (!startState) {
      throw new BugIndicatingError("Start state must be defined");
    }
    return { lineNumber, startState };
  }
};

var TokenizationStateStore = class {
  constructor() {
    this._lineEndStates = new FixedArray(null);
  }
  getEndState(lineNumber) {
    return this._lineEndStates.get(lineNumber);
  }
  setEndState(lineNumber, state) {
    const oldState = this._lineEndStates.get(lineNumber);
    if (oldState && oldState.equals(state)) {
      return false;
    }
    this._lineEndStates.set(lineNumber, state);
    return true;
  }
  acceptChange(range2, newLineCount) {
    let length = range2.length;
    if (newLineCount > 0 && length > 0) {
      length--;
      newLineCount--;
    }
    this._lineEndStates.replace(range2.startLineNumber, length, newLineCount);
  }
  acceptChanges(changes) {
    for (const c of changes) {
      const [eolCount] = countEOL(c.text);
      this.acceptChange(new LineRange(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
    }
  }
};

var RangePriorityQueueImpl = class {
  constructor() {
    this._ranges = [];
  }
  getRanges() {
    return this._ranges;
  }
  get min() {
    if (this._ranges.length === 0) {
      return null;
    }
    return this._ranges[0].start;
  }
  removeMin() {
    if (this._ranges.length === 0) {
      return null;
    }
    const range2 = this._ranges[0];
    if (range2.start + 1 === range2.endExclusive) {
      this._ranges.shift();
    } else {
      this._ranges[0] = new OffsetRange(range2.start + 1, range2.endExclusive);
    }
    return range2.start;
  }
  delete(value2) {
    const idx = this._ranges.findIndex((r2) => r2.contains(value2));
    if (idx !== -1) {
      const range2 = this._ranges[idx];
      if (range2.start === value2) {
        if (range2.endExclusive === value2 + 1) {
          this._ranges.splice(idx, 1);
        } else {
          this._ranges[idx] = new OffsetRange(value2 + 1, range2.endExclusive);
        }
      } else {
        if (range2.endExclusive === value2 + 1) {
          this._ranges[idx] = new OffsetRange(range2.start, value2);
        } else {
          this._ranges.splice(idx, 1, new OffsetRange(range2.start, value2), new OffsetRange(value2 + 1, range2.endExclusive));
        }
      }
    }
  }
  addRange(range2) {
    OffsetRange.addRange(range2, this._ranges);
  }
  addRangeAndResize(range2, newLength) {
    let idxFirstMightBeIntersecting = 0;
    while (!(idxFirstMightBeIntersecting >= this._ranges.length || range2.start <= this._ranges[idxFirstMightBeIntersecting].endExclusive)) {
      idxFirstMightBeIntersecting++;
    }
    let idxFirstIsAfter = idxFirstMightBeIntersecting;
    while (!(idxFirstIsAfter >= this._ranges.length || range2.endExclusive < this._ranges[idxFirstIsAfter].start)) {
      idxFirstIsAfter++;
    }
    const delta2 = newLength - range2.length;
    for (let i2 = idxFirstIsAfter; i2 < this._ranges.length; i2++) {
      this._ranges[i2] = this._ranges[i2].delta(delta2);
    }
    if (idxFirstMightBeIntersecting === idxFirstIsAfter) {
      const newRange = new OffsetRange(range2.start, range2.start + newLength);
      if (!newRange.isEmpty) {
        this._ranges.splice(idxFirstMightBeIntersecting, 0, newRange);
      }
    } else {
      const start = Math.min(range2.start, this._ranges[idxFirstMightBeIntersecting].start);
      const endEx = Math.max(range2.endExclusive, this._ranges[idxFirstIsAfter - 1].endExclusive);
      const newRange = new OffsetRange(start, endEx + delta2);
      if (!newRange.isEmpty) {
        this._ranges.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting, newRange);
      } else {
        this._ranges.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting);
      }
    }
  }
  toString() {
    return this._ranges.map((r2) => r2.toString()).join(" + ");
  }
};

function safeTokenize(languageIdCodec, languageId, tokenizationSupport, text2, hasEOL, state) {
  let r2 = null;
  if (tokenizationSupport) {
    try {
      r2 = tokenizationSupport.tokenizeEncoded(text2, hasEOL, state.clone());
    } catch (e4) {
      onUnexpectedError(e4);
    }
  }
  if (!r2) {
    r2 = nullTokenizeEncoded(languageIdCodec.encodeLanguageId(languageId), state);
  }
  LineTokens.convertToEndOffset(r2.tokens, text2.length);
  return r2;
}

var DefaultBackgroundTokenizer = class {
  constructor(_tokenizerWithStateStore, _backgroundTokenStore) {
    this._tokenizerWithStateStore = _tokenizerWithStateStore;
    this._backgroundTokenStore = _backgroundTokenStore;
    this._isDisposed = false;
    this._isScheduled = false;
  }
  dispose() {
    this._isDisposed = true;
  }
  handleChanges() {
    this._beginBackgroundTokenization();
  }
  _beginBackgroundTokenization() {
    if (this._isScheduled || !this._tokenizerWithStateStore._textModel.isAttachedToEditor() || !this._hasLinesToTokenize()) {
      return;
    }
    this._isScheduled = true;
    runWhenGlobalIdle((deadline) => {
      this._isScheduled = false;
      this._backgroundTokenizeWithDeadline(deadline);
    });
  }
  /**
   * Tokenize until the deadline occurs, but try to yield every 1-2ms.
   */
  _backgroundTokenizeWithDeadline(deadline) {
    const endTime = Date.now() + deadline.timeRemaining();
    const execute = () => {
      if (this._isDisposed || !this._tokenizerWithStateStore._textModel.isAttachedToEditor() || !this._hasLinesToTokenize()) {
        return;
      }
      this._backgroundTokenizeForAtLeast1ms();
      if (Date.now() < endTime) {
        setTimeout0(execute);
      } else {
        this._beginBackgroundTokenization();
      }
    };
    execute();
  }
  /**
   * Tokenize for at least 1ms.
   */
  _backgroundTokenizeForAtLeast1ms() {
    const lineCount = this._tokenizerWithStateStore._textModel.getLineCount();
    const builder = new ContiguousMultilineTokensBuilder();
    const sw = StopWatch.create(false);
    do {
      if (sw.elapsed() > 1) {
        break;
      }
      const tokenizedLineNumber = this._tokenizeOneInvalidLine(builder);
      if (tokenizedLineNumber >= lineCount) {
        break;
      }
    } while (this._hasLinesToTokenize());
    this._backgroundTokenStore.setTokens(builder.finalize());
    this.checkFinished();
  }
  _hasLinesToTokenize() {
    if (!this._tokenizerWithStateStore) {
      return false;
    }
    return !this._tokenizerWithStateStore.store.allStatesValid();
  }
  _tokenizeOneInvalidLine(builder) {
    const firstInvalidLine = this._tokenizerWithStateStore?.getFirstInvalidLine();
    if (!firstInvalidLine) {
      return this._tokenizerWithStateStore._textModel.getLineCount() + 1;
    }
    this._tokenizerWithStateStore.updateTokensUntilLine(builder, firstInvalidLine.lineNumber);
    return firstInvalidLine.lineNumber;
  }
  checkFinished() {
    if (this._isDisposed) {
      return;
    }
    if (this._tokenizerWithStateStore.store.allStatesValid()) {
      this._backgroundTokenStore.backgroundTokenizationFinished();
    }
  }
  requestTokens(startLineNumber, endLineNumberExclusive) {
    this._tokenizerWithStateStore.store.invalidateEndStateRange(new LineRange(startLineNumber, endLineNumberExclusive));
  }
};
export { findLikelyRelevantLines, safeTokenize, TokenizerWithStateStore, TokenizerWithStateStoreAndTextModel, TrackingTokenizationStateStore, TokenizationStateStore, RangePriorityQueueImpl, DefaultBackgroundTokenizer };
