// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/browser/backgroundTokenization/textMateWorkerTokenizerController.ts
import { Disposable } from "./module-0012.mjs";
import { TokenizationStateStore } from "./module-0413.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { keepObserved } from "./module-0059.mjs";
import { autorun } from "./module-0052.mjs";
import { ContiguousMultilineTokensBuilder } from "./module-0412.mjs";
import { AnnotationsUpdate } from "./module-0402.mjs";
import { deserializeFontTokenOptions } from "./module-0369.mjs";
import { LineRange } from "./module-0174.mjs";
import { MonotonousIndexTransformer } from "./module-1768.mjs";
import { linesLengthEditFromModelContentChange } from "./module-0404.mjs";
import { importAMDNodeModule } from "./module-0191.mjs";
import { Range2 } from "./module-0106.mjs";
import { StringEdit } from "./module-0193.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/workbench/services/textMate/browser/backgroundTokenization/textMateWorkerTokenizerController.ts
var TextMateWorkerTokenizerController = class _TextMateWorkerTokenizerController extends Disposable {
  constructor(_model, _worker, _languageIdCodec, _backgroundTokenizationStore, _configurationService, _maxTokenizationLineLength) {
    super();
    this._model = _model;
    this._worker = _worker;
    this._languageIdCodec = _languageIdCodec;
    this._backgroundTokenizationStore = _backgroundTokenizationStore;
    this._configurationService = _configurationService;
    this._maxTokenizationLineLength = _maxTokenizationLineLength;
    this.controllerId = _TextMateWorkerTokenizerController._id++;
    this._pendingChanges = [];
    this._states = new TokenizationStateStore();
    this._loggingEnabled = observableConfigValue("editor.experimental.asyncTokenizationLogging", false, this._configurationService);
    this._register(keepObserved(this._loggingEnabled));
    this._register(this._model.onDidChangeContent((e) => {
      if (this._shouldLog) {
        console.log("model change", {
          fileName: this._model.uri.fsPath.split("\\").pop(),
          changes: changesToString(e.changes)
        });
      }
      this._worker.$acceptModelChanged(this.controllerId, e);
      this._pendingChanges.push(e);
    }));
    this._register(this._model.onDidChangeLanguage((e) => {
      const languageId2 = this._model.getLanguageId();
      const encodedLanguageId2 = this._languageIdCodec.encodeLanguageId(languageId2);
      this._worker.$acceptModelLanguageChanged(
        this.controllerId,
        languageId2,
        encodedLanguageId2
      );
    }));
    const languageId = this._model.getLanguageId();
    const encodedLanguageId = this._languageIdCodec.encodeLanguageId(languageId);
    this._worker.$acceptNewModel({
      uri: this._model.uri,
      versionId: this._model.getVersionId(),
      lines: this._model.getLinesContent(),
      EOL: this._model.getEOL(),
      languageId,
      encodedLanguageId,
      maxTokenizationLineLength: this._maxTokenizationLineLength.get(),
      controllerId: this.controllerId
    });
    this._register(autorun((reader) => {
      const maxTokenizationLineLength = this._maxTokenizationLineLength.read(reader);
      this._worker.$acceptMaxTokenizationLineLength(this.controllerId, maxTokenizationLineLength);
    }));
  }
  static {
    this._id = 0;
  }
  dispose() {
    super.dispose();
    this._worker.$acceptRemovedModel(this.controllerId);
  }
  requestTokens(startLineNumber, endLineNumberExclusive) {
    this._worker.$retokenize(this.controllerId, startLineNumber, endLineNumberExclusive);
  }
  /**
   * This method is called from the worker through the worker host.
   */
  async setTokensAndStates(controllerId, versionId, rawTokens, fontTokens, stateDeltas) {
    if (this.controllerId !== controllerId) {
      return;
    }
    let tokens = ContiguousMultilineTokensBuilder.deserialize(
      new Uint8Array(rawTokens)
    );
    const fontTokensUpdate = AnnotationsUpdate.deserialize(fontTokens, deserializeFontTokenOptions());
    if (this._shouldLog) {
      console.log("received background tokenization result", {
        fileName: this._model.uri.fsPath.split("\\").pop(),
        updatedTokenLines: tokens.map((t2) => t2.getLineRange()).join(" & "),
        updatedStateLines: stateDeltas.map((s) => new LineRange(s.startLineNumber, s.startLineNumber + s.stateDeltas.length).toString()).join(" & ")
      });
    }
    if (this._shouldLog) {
      const changes = this._pendingChanges.filter((c) => c.versionId <= versionId).map((c) => c.changes).map((c) => changesToString(c)).join(" then ");
      console.log("Applying changes to local states", changes);
    }
    while (this._pendingChanges.length > 0 && this._pendingChanges[0].versionId <= versionId) {
      const change = this._pendingChanges.shift();
      this._states.acceptChanges(change.changes);
    }
    if (this._pendingChanges.length > 0) {
      if (this._shouldLog) {
        const changes = this._pendingChanges.map((c) => c.changes).map((c) => changesToString(c)).join(" then ");
        console.log("Considering non-processed changes", changes);
      }
      const curToFutureTransformerTokens = MonotonousIndexTransformer.fromMany(
        this._pendingChanges.map((c) => linesLengthEditFromModelContentChange(c.changes))
      );
      const b = new ContiguousMultilineTokensBuilder();
      for (const t2 of tokens) {
        for (let i2 = t2.startLineNumber; i2 <= t2.endLineNumber; i2++) {
          const result = curToFutureTransformerTokens.transform(i2 - 1);
          if (result !== void 0) {
            b.add(i2, t2.getLineTokens(i2));
          }
        }
      }
      tokens = b.finalize();
      for (const change of this._pendingChanges) {
        for (const innerChanges of change.changes) {
          for (let j = 0; j < tokens.length; j++) {
            tokens[j].applyEdit(innerChanges.range, innerChanges.text);
          }
        }
      }
      fontTokensUpdate.rebase(this._stringEditFromChanges(this._model, this._pendingChanges));
    }
    const curToFutureTransformerStates = MonotonousIndexTransformer.fromMany(
      this._pendingChanges.map((c) => linesLengthEditFromModelContentChange(c.changes))
    );
    if (!this._applyStateStackDiffFn || !this._initialState) {
      const { applyStateStackDiff, INITIAL } = await importAMDNodeModule("vscode-textmate", "release/main.js");
      this._applyStateStackDiffFn = applyStateStackDiff;
      this._initialState = INITIAL;
    }
    for (const d of stateDeltas) {
      let prevState = d.startLineNumber <= 1 ? this._initialState : this._states.getEndState(d.startLineNumber - 1);
      for (let i2 = 0; i2 < d.stateDeltas.length; i2++) {
        const delta2 = d.stateDeltas[i2];
        let state;
        if (delta2) {
          state = this._applyStateStackDiffFn(prevState, delta2);
          this._states.setEndState(d.startLineNumber + i2, state);
        } else {
          state = this._states.getEndState(d.startLineNumber + i2);
        }
        const offset = curToFutureTransformerStates.transform(d.startLineNumber + i2 - 1);
        if (offset !== void 0) {
          this._backgroundTokenizationStore.setEndState(offset + 1, state);
        }
        if (d.startLineNumber + i2 >= this._model.getLineCount() - 1) {
          this._backgroundTokenizationStore.backgroundTokenizationFinished();
        }
        prevState = state;
      }
    }
    this._backgroundTokenizationStore.setTokens(tokens);
    this._backgroundTokenizationStore.setFontInfo(fontTokensUpdate);
  }
  _stringEditFromChanges(model, pendingChanges) {
    const edits = [];
    for (const change of pendingChanges) {
      for (const innerChanges of change.changes) {
        const range2 = Range2.lift(innerChanges.range);
        const text2 = innerChanges.text;
        const offsetEditStart = model.getOffsetAt(range2.getStartPosition());
        const offsetEditEnd = model.getOffsetAt(range2.getEndPosition());
        edits.push(StringEdit.replace(new OffsetRange(offsetEditStart, offsetEditEnd), text2));
      }
    }
    return StringEdit.compose(edits);
  }
  get _shouldLog() {
    return this._loggingEnabled.get();
  }
};

function changesToString(changes) {
  return changes.map((c) => Range2.lift(c.range).toString() + " => " + c.text).join(" & ");
}
export { changesToString, TextMateWorkerTokenizerController };
