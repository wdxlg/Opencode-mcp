// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateWorkerTokenizer.ts
import { MirrorTextModel } from "./module-0056.mjs";
import { observableValue } from "./module-0038.mjs";
import { RunOnceScheduler } from "./module-0030.mjs";
import { LineRange } from "./module-0054.mjs";
import { TokenizationSupportWithLineLimit } from "./module-0073.mjs";
import { TextMateTokenizationSupport } from "./module-0072.mjs";
import { Disposable } from "./module-0014.mjs";
import { TokenizerWithStateStore } from "./module-0071.mjs";
import { importAMDNodeModule } from "./module-0029.mjs";
import { ContiguousMultilineTokensBuilder } from "./module-0070.mjs";
import { LineTokens } from "./module-0067.mjs";
import { AnnotationsUpdate } from "./module-0075.mjs";
import { serializeFontTokenOptions } from "./module-0074.mjs";
import { setTimeout0 } from "./module-0002.mjs";
import { OffsetRange } from "./module-0051.mjs";


// src/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateWorkerTokenizer.ts
var TextMateWorkerTokenizer = class extends MirrorTextModel {
  constructor(uri, lines, eol, versionId, _host, _languageId, _encodedLanguageId, maxTokenizationLineLength) {
    super(uri, lines, eol, versionId);
    this._host = _host;
    this._languageId = _languageId;
    this._encodedLanguageId = _encodedLanguageId;
    this._tokenizerWithStateStore = null;
    this._isDisposed = false;
    this._maxTokenizationLineLength = observableValue(this, -1);
    this._tokenizeDebouncer = new RunOnceScheduler(() => this._tokenize(), 10);
    this._maxTokenizationLineLength.set(maxTokenizationLineLength, void 0);
    this._resetTokenization();
  }
  dispose() {
    this._isDisposed = true;
    this._tokenizeDebouncer.dispose();
    super.dispose();
  }
  onLanguageId(languageId, encodedLanguageId) {
    this._languageId = languageId;
    this._encodedLanguageId = encodedLanguageId;
    this._resetTokenization();
  }
  onEvents(e) {
    super.onEvents(e);
    this._tokenizerWithStateStore?.store.acceptChanges(e.changes);
    this._tokenizeDebouncer.schedule();
  }
  acceptMaxTokenizationLineLength(maxTokenizationLineLength) {
    this._maxTokenizationLineLength.set(maxTokenizationLineLength, void 0);
  }
  retokenize(startLineNumber, endLineNumberExclusive) {
    if (this._tokenizerWithStateStore) {
      this._tokenizerWithStateStore.store.invalidateEndStateRange(new LineRange(startLineNumber, endLineNumberExclusive));
      this._tokenizeDebouncer.schedule();
    }
  }
  async _resetTokenization() {
    this._tokenizerWithStateStore = null;
    const languageId = this._languageId;
    const encodedLanguageId = this._encodedLanguageId;
    const r = await this._host.getOrCreateGrammar(languageId, encodedLanguageId);
    if (this._isDisposed || languageId !== this._languageId || encodedLanguageId !== this._encodedLanguageId || !r) {
      return;
    }
    if (r.grammar) {
      const tokenizationSupport = new TokenizationSupportWithLineLimit(
        this._encodedLanguageId,
        new TextMateTokenizationSupport(
          r.grammar,
          r.initialState,
          false,
          void 0,
          () => false,
          (timeMs, lineLength, isRandomSample) => {
            this._host.reportTokenizationTime(timeMs, languageId, r.sourceExtensionId, lineLength, isRandomSample);
          },
          false
        ),
        Disposable.None,
        this._maxTokenizationLineLength
      );
      this._tokenizerWithStateStore = new TokenizerWithStateStore(this._lines.length, tokenizationSupport);
    } else {
      this._tokenizerWithStateStore = null;
    }
    this._tokenize();
  }
  async _tokenize() {
    if (this._isDisposed || !this._tokenizerWithStateStore) {
      return;
    }
    if (!this._diffStateStacksRefEqFn) {
      const { diffStateStacksRefEq } = await importAMDNodeModule("vscode-textmate", "release/main.js");
      this._diffStateStacksRefEqFn = diffStateStacksRefEq;
    }
    const startTime = (/* @__PURE__ */ new Date()).getTime();
    while (true) {
      let tokenizedLines = 0;
      const tokenBuilder = new ContiguousMultilineTokensBuilder();
      const stateDeltaBuilder = new StateDeltaBuilder();
      const fontTokensUpdate = [];
      while (true) {
        const lineToTokenize = this._tokenizerWithStateStore.getFirstInvalidLine();
        if (lineToTokenize === null || tokenizedLines > 200) {
          break;
        }
        tokenizedLines++;
        const text = this._lines[lineToTokenize.lineNumber - 1];
        const r = this._tokenizerWithStateStore.tokenizationSupport.tokenizeEncoded(text, true, lineToTokenize.startState);
        if (this._tokenizerWithStateStore.store.setEndState(lineToTokenize.lineNumber, r.endState)) {
          const delta = this._diffStateStacksRefEqFn(lineToTokenize.startState, r.endState);
          stateDeltaBuilder.setState(lineToTokenize.lineNumber, delta);
        } else {
          stateDeltaBuilder.setState(lineToTokenize.lineNumber, null);
        }
        LineTokens.convertToEndOffset(r.tokens, text.length);
        tokenBuilder.add(lineToTokenize.lineNumber, r.tokens);
        fontTokensUpdate.push(...this._getFontTokensUpdate(lineToTokenize.lineNumber, r));
        const deltaMs2 = (/* @__PURE__ */ new Date()).getTime() - startTime;
        if (deltaMs2 > 20) {
          break;
        }
      }
      if (tokenizedLines === 0) {
        break;
      }
      const fontUpdate = AnnotationsUpdate.create(fontTokensUpdate);
      const serializedFontUpdate = fontUpdate.serialize(serializeFontTokenOptions());
      const stateDeltas = stateDeltaBuilder.getStateDeltas();
      this._host.setTokensAndStates(
        this._versionId,
        tokenBuilder.serialize(),
        serializedFontUpdate,
        stateDeltas
      );
      const deltaMs = (/* @__PURE__ */ new Date()).getTime() - startTime;
      if (deltaMs > 20) {
        setTimeout0(() => this._tokenize());
        return;
      }
    }
  }
  _getFontTokensUpdate(lineNumber, r) {
    const fontTokens = [];
    const offsetAtLineStart = this._getOffsetAtLineStart(lineNumber);
    const offsetAtNextLineStart = this._getOffsetAtLineStart(lineNumber + 1);
    const offsetAtLineEnd = offsetAtNextLineStart > 0 ? offsetAtNextLineStart - 1 : 0;
    fontTokens.push({
      range: new OffsetRange(offsetAtLineStart, offsetAtLineEnd),
      annotation: void 0
    });
    if (r.fontInfo.length) {
      for (const fontInfo of r.fontInfo) {
        const offsetAtLineStart2 = this._getOffsetAtLineStart(lineNumber);
        fontTokens.push({
          range: new OffsetRange(offsetAtLineStart2 + fontInfo.startIndex, offsetAtLineStart2 + fontInfo.endIndex),
          annotation: {
            fontFamily: fontInfo.fontFamily ?? void 0,
            fontSizeMultiplier: fontInfo.fontSizeMultiplier ?? void 0,
            lineHeightMultiplier: fontInfo.lineHeightMultiplier ?? void 0
          }
        });
      }
    }
    return fontTokens;
  }
  _getOffsetAtLineStart(lineNumber) {
    this._ensureLineStarts();
    return lineNumber - 1 > 0 ? this._lineStarts.getPrefixSum(lineNumber - 2) : 0;
  }
};

var StateDeltaBuilder = class {
  constructor() {
    this._lastStartLineNumber = -1;
    this._stateDeltas = [];
  }
  setState(lineNumber, stackDiff) {
    if (lineNumber === this._lastStartLineNumber + 1) {
      this._stateDeltas[this._stateDeltas.length - 1].stateDeltas.push(stackDiff);
    } else {
      this._stateDeltas.push({ startLineNumber: lineNumber, stateDeltas: [stackDiff] });
    }
    this._lastStartLineNumber = lineNumber;
  }
  getStateDeltas() {
    return this._stateDeltas;
  }
};
export { TextMateWorkerTokenizer, StateDeltaBuilder };
