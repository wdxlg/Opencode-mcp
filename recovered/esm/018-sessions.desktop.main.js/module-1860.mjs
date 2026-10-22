// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/model/notebookCellTextModel.ts
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { NotebookCellOutputTextModel } from "./module-1859.mjs";
import { createTextBuffer } from "./module-0423.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { StringSHA1, hash } from "./module-0039.mjs";
import { Range2 } from "./module-0106.mjs";
import { splitLines } from "./module-0030.mjs";
import { PieceTreeTextBuffer } from "./module-0397.mjs";
import { generateUuid } from "./module-0190.mjs";
import { toFormattedString } from "./module-1376.mjs";


// src/vs/workbench/contrib/notebook/common/model/notebookCellTextModel.ts
var NotebookCellTextModel = class _NotebookCellTextModel extends Disposable {
  constructor(uri4, handle2, cell, transientOptions, _languageService, _defaultEOL, defaultCollapseConfig, _languageDetectionService = void 0, _notebookLoggingService) {
    super();
    this.uri = uri4;
    this.handle = handle2;
    this.transientOptions = transientOptions;
    this._languageService = _languageService;
    this._defaultEOL = _defaultEOL;
    this._languageDetectionService = _languageDetectionService;
    this._notebookLoggingService = _notebookLoggingService;
    this._onDidChangeTextModel = this._register(new Emitter());
    this.onDidChangeTextModel = this._onDidChangeTextModel.event;
    this._onDidChangeOutputs = this._register(new Emitter());
    this.onDidChangeOutputs = this._onDidChangeOutputs.event;
    this._onDidChangeOutputItems = this._register(new Emitter());
    this.onDidChangeOutputItems = this._onDidChangeOutputItems.event;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidChangeMetadata = this._register(new Emitter());
    this.onDidChangeMetadata = this._onDidChangeMetadata.event;
    this._onDidChangeInternalMetadata = this._register(new Emitter());
    this.onDidChangeInternalMetadata = this._onDidChangeInternalMetadata.event;
    this._onDidChangeLanguage = this._register(new Emitter());
    this.onDidChangeLanguage = this._onDidChangeLanguage.event;
    this._textBufferHash = null;
    this._hash = null;
    this._versionId = 1;
    this._alternativeId = 1;
    this._textModelDisposables = this._register(new DisposableStore());
    this._textModel = void 0;
    this.autoDetectLanguageThrottler = this._register(new ThrottledDelayer(_NotebookCellTextModel.AUTO_DETECT_LANGUAGE_THROTTLE_DELAY));
    this._autoLanguageDetectionEnabled = false;
    this._hasLanguageSetExplicitly = false;
    this._source = cell.source;
    this._language = cell.language;
    this._mime = cell.mime;
    this.cellKind = cell.cellKind;
    const defaultConfig2 = cell.cellKind === 2 /* Code */ ? defaultCollapseConfig?.codeCell : defaultCollapseConfig?.markupCell;
    this.collapseState = cell.collapseState ?? (defaultConfig2 ?? void 0);
    this._outputs = cell.outputs.map((op) => new NotebookCellOutputTextModel(op));
    this._metadata = cell.metadata ?? {};
    this._internalMetadata = cell.internalMetadata ?? {};
  }
  get outputs() {
    return this._outputs;
  }
  get metadata() {
    return this._metadata;
  }
  set metadata(newMetadata) {
    this._metadata = newMetadata;
    this._hash = null;
    this._onDidChangeMetadata.fire();
  }
  get internalMetadata() {
    return this._internalMetadata;
  }
  set internalMetadata(newInternalMetadata) {
    const lastRunSuccessChanged = this._internalMetadata.lastRunSuccess !== newInternalMetadata.lastRunSuccess;
    newInternalMetadata = {
      ...newInternalMetadata,
      ...{ runStartTimeAdjustment: computeRunStartTimeAdjustment(this._internalMetadata, newInternalMetadata) }
    };
    this._internalMetadata = newInternalMetadata;
    this._hash = null;
    this._onDidChangeInternalMetadata.fire({ lastRunSuccessChanged });
  }
  get language() {
    return this._language;
  }
  set language(newLanguage) {
    if (this._textModel && this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(newLanguage) && this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(this.language)) {
      return;
    }
    this._hasLanguageSetExplicitly = true;
    this._setLanguageInternal(newLanguage);
  }
  get mime() {
    return this._mime;
  }
  set mime(newMime) {
    if (this._mime === newMime) {
      return;
    }
    this._mime = newMime;
    this._hash = null;
    this._onDidChangeContent.fire("mime");
  }
  get textBuffer() {
    if (this._textBuffer) {
      return this._textBuffer;
    }
    this._textBuffer = this._register(createTextBuffer(this._source, this._defaultEOL).textBuffer);
    this._register(this._textBuffer.onDidChangeContent(() => {
      this._hash = null;
      if (!this._textModel) {
        this._onDidChangeContent.fire("content");
      }
      this.autoDetectLanguage();
    }));
    return this._textBuffer;
  }
  get alternativeId() {
    return this._alternativeId;
  }
  get textModel() {
    return this._textModel;
  }
  set textModel(m) {
    if (this._textModel === m) {
      return;
    }
    this._textModelDisposables.clear();
    this._textModel = m;
    if (this._textModel) {
      this.setRegisteredLanguage(this._languageService, this._textModel.getLanguageId(), this.language);
      this._textModelDisposables.add(this._textModel.onDidChangeLanguage((e4) => this.setRegisteredLanguage(this._languageService, e4.newLanguage, this.language)));
      this._textModelDisposables.add(this._textModel.onWillDispose(() => this.textModel = void 0));
      this._textModelDisposables.add(this._textModel.onDidChangeContent((e4) => {
        if (this._textModel) {
          this._versionId = this._textModel.getVersionId();
          this._alternativeId = this._textModel.getAlternativeVersionId();
        }
        this._textBufferHash = null;
        this._onDidChangeContent.fire("content");
        this._onDidChangeContent.fire({ type: "model", event: e4 });
      }));
      this._textModel._overwriteVersionId(this._versionId);
      this._textModel._overwriteAlternativeVersionId(this._versionId);
      this._onDidChangeTextModel.fire();
    }
  }
  setRegisteredLanguage(languageService, newLanguage, currentLanguage) {
    const isFallBackLanguage = newLanguage === PLAINTEXT_LANGUAGE_ID || newLanguage === "jupyter";
    if (!languageService.isRegisteredLanguageId(currentLanguage) && isFallBackLanguage) {
      this._onDidChangeLanguage.fire(currentLanguage);
    } else {
      this.language = newLanguage;
    }
  }
  static {
    this.AUTO_DETECT_LANGUAGE_THROTTLE_DELAY = 600;
  }
  get hasLanguageSetExplicitly() {
    return this._hasLanguageSetExplicitly;
  }
  enableAutoLanguageDetection() {
    this._autoLanguageDetectionEnabled = true;
    this.autoDetectLanguage();
  }
  async autoDetectLanguage() {
    if (this._autoLanguageDetectionEnabled) {
      this.autoDetectLanguageThrottler.trigger(() => this._doAutoDetectLanguage());
    }
  }
  async _doAutoDetectLanguage() {
    if (this.hasLanguageSetExplicitly) {
      return;
    }
    const newLanguage = await this._languageDetectionService?.detectLanguage(this.uri);
    if (!newLanguage) {
      return;
    }
    if (this._textModel && this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(newLanguage) && this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(this.language)) {
      return;
    }
    this._setLanguageInternal(newLanguage);
  }
  _setLanguageInternal(newLanguage) {
    const newLanguageId = this._languageService.getLanguageIdByLanguageName(newLanguage);
    if (newLanguageId === null) {
      return;
    }
    if (this._textModel) {
      const languageId = this._languageService.createById(newLanguageId);
      this._textModel.setLanguage(languageId.languageId);
    }
    if (this._language === newLanguage) {
      return;
    }
    this._language = newLanguage;
    this._hash = null;
    this._onDidChangeLanguage.fire(newLanguage);
    this._onDidChangeContent.fire("language");
  }
  resetTextBuffer(textBuffer) {
    this._textBuffer = textBuffer;
  }
  getValue() {
    const fullRange = this.getFullModelRange();
    const eol = this.textBuffer.getEOL();
    if (eol === "\n") {
      return this.textBuffer.getValueInRange(fullRange, 1 /* LF */);
    } else {
      return this.textBuffer.getValueInRange(fullRange, 2 /* CRLF */);
    }
  }
  getTextBufferHash() {
    if (this._textBufferHash !== null) {
      return this._textBufferHash;
    }
    const shaComputer = new StringSHA1();
    const snapshot = this.textBuffer.createSnapshot(false);
    let text2;
    while (text2 = snapshot.read()) {
      shaComputer.update(text2);
    }
    this._textBufferHash = shaComputer.digest();
    return this._textBufferHash;
  }
  getHashValue() {
    if (this._hash !== null) {
      return this._hash;
    }
    this._hash = hash([hash(this.language), this.getTextBufferHash(), this._getPersisentMetadata(), this.transientOptions.transientOutputs ? [] : this._outputs.map((op) => ({
      outputs: op.outputs.map((output) => ({
        mime: output.mime,
        data: Array.from(output.data.buffer)
      })),
      metadata: op.metadata
    }))]);
    return this._hash;
  }
  _getPersisentMetadata() {
    return getFormattedMetadataJSON(this.transientOptions.transientCellMetadata, this.metadata, this.language);
  }
  getTextLength() {
    return this.textBuffer.getLength();
  }
  getFullModelRange() {
    const lineCount = this.textBuffer.getLineCount();
    return new Range2(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
  }
  spliceNotebookCellOutputs(splice3) {
    this._notebookLoggingService.trace("textModelEdits", `splicing outputs at ${splice3.start} length: ${splice3.deleteCount} with ${splice3.newOutputs.length} new outputs`);
    if (splice3.deleteCount > 0 && splice3.newOutputs.length > 0) {
      const commonLen = Math.min(splice3.deleteCount, splice3.newOutputs.length);
      for (let i2 = 0; i2 < commonLen; i2++) {
        const currentOutput = this.outputs[splice3.start + i2];
        const newOutput = splice3.newOutputs[i2];
        this.replaceOutput(currentOutput.outputId, newOutput);
      }
      const removed = this.outputs.splice(splice3.start + commonLen, splice3.deleteCount - commonLen, ...splice3.newOutputs.slice(commonLen));
      removed.forEach((output) => output.dispose());
      this._onDidChangeOutputs.fire({ start: splice3.start + commonLen, deleteCount: splice3.deleteCount - commonLen, newOutputs: splice3.newOutputs.slice(commonLen) });
    } else {
      const removed = this.outputs.splice(splice3.start, splice3.deleteCount, ...splice3.newOutputs);
      removed.forEach((output) => output.dispose());
      this._onDidChangeOutputs.fire(splice3);
    }
  }
  replaceOutput(outputId, newOutputItem) {
    const outputIndex = this.outputs.findIndex((output2) => output2.outputId === outputId);
    if (outputIndex < 0) {
      return false;
    }
    this._notebookLoggingService.trace("textModelEdits", `replacing an output item at index ${outputIndex}`);
    const output = this.outputs[outputIndex];
    output.replaceData({
      outputs: newOutputItem.outputs,
      outputId: newOutputItem.outputId,
      metadata: newOutputItem.metadata
    });
    newOutputItem.dispose();
    this._onDidChangeOutputItems.fire();
    return true;
  }
  changeOutputItems(outputId, append4, items) {
    const outputIndex = this.outputs.findIndex((output2) => output2.outputId === outputId);
    if (outputIndex < 0) {
      return false;
    }
    const output = this.outputs[outputIndex];
    this._notebookLoggingService.trace("textModelEdits", `${append4 ? "appending" : "replacing"} ${items.length} output items to for output index ${outputIndex}`);
    if (append4) {
      output.appendData(items);
    } else {
      output.replaceData({ outputId, outputs: items, metadata: output.metadata });
    }
    this._onDidChangeOutputItems.fire();
    return true;
  }
  _outputNotEqualFastCheck(left, right) {
    if (left.length !== right.length) {
      return false;
    }
    for (let i2 = 0; i2 < this.outputs.length; i2++) {
      const l = left[i2];
      const r2 = right[i2];
      if (l.outputs.length !== r2.outputs.length) {
        return false;
      }
      for (let k = 0; k < l.outputs.length; k++) {
        if (l.outputs[k].mime !== r2.outputs[k].mime) {
          return false;
        }
        if (l.outputs[k].data.byteLength !== r2.outputs[k].data.byteLength) {
          return false;
        }
      }
    }
    return true;
  }
  equal(b) {
    if (this.language !== b.language) {
      return false;
    }
    if (this.outputs.length !== b.outputs.length) {
      return false;
    }
    if (this.getTextLength() !== b.getTextLength()) {
      return false;
    }
    if (!this.transientOptions.transientOutputs) {
      if (!this._outputNotEqualFastCheck(this.outputs, b.outputs)) {
        return false;
      }
    }
    return this.getHashValue() === b.getHashValue();
  }
  /**
   * Only compares
   * - language
   * - mime
   * - cellKind
   * - internal metadata (conditionally)
   * - source
   */
  fastEqual(b, ignoreMetadata) {
    if (this.language !== b.language) {
      return false;
    }
    if (this.mime !== b.mime) {
      return false;
    }
    if (this.cellKind !== b.cellKind) {
      return false;
    }
    if (!ignoreMetadata) {
      if (this.internalMetadata?.executionOrder !== b.internalMetadata?.executionOrder || this.internalMetadata?.lastRunSuccess !== b.internalMetadata?.lastRunSuccess || this.internalMetadata?.runStartTime !== b.internalMetadata?.runStartTime || this.internalMetadata?.runStartTimeAdjustment !== b.internalMetadata?.runStartTimeAdjustment || this.internalMetadata?.runEndTime !== b.internalMetadata?.runEndTime) {
        return false;
      }
    }
    if (this._textBuffer) {
      if (!_NotebookCellTextModel.linesAreEqual(this.textBuffer.getLinesContent(), b.source)) {
        return false;
      }
    } else if (this._source !== b.source) {
      return false;
    }
    return true;
  }
  static linesAreEqual(aLines, b) {
    const bLines = splitLines(b);
    if (aLines.length !== bLines.length) {
      return false;
    }
    for (let i2 = 0; i2 < aLines.length; i2++) {
      if (aLines[i2] !== bLines[i2]) {
        return false;
      }
    }
    return true;
  }
  dispose() {
    dispose(this._outputs);
    const emptyDisposedTextBuffer = new PieceTreeTextBuffer([], "", "\n", false, false, true, true);
    emptyDisposedTextBuffer.dispose();
    this._textBuffer = emptyDisposedTextBuffer;
    super.dispose();
  }
};

function cloneNotebookCellTextModel(cell) {
  return {
    source: cell.getValue(),
    language: cell.language,
    mime: cell.mime,
    cellKind: cell.cellKind,
    outputs: cell.outputs.map((output) => ({
      outputs: output.outputs,
      /* paste should generate new outputId */
      outputId: generateUuid()
    })),
    metadata: {}
  };
}

function computeRunStartTimeAdjustment(oldMetadata, newMetadata) {
  if (oldMetadata.runStartTime !== newMetadata.runStartTime && typeof newMetadata.runStartTime === "number") {
    const offset = Date.now() - newMetadata.runStartTime;
    return offset < 0 ? Math.abs(offset) : 0;
  } else {
    return newMetadata.runStartTimeAdjustment;
  }
}

function getFormattedMetadataJSON(transientCellMetadata, metadata, language2, sortKeys) {
  let filteredMetadata = {};
  if (transientCellMetadata) {
    const keys = /* @__PURE__ */ new Set([...Object.keys(metadata)]);
    for (const key3 of keys) {
      if (!transientCellMetadata[key3]) {
        filteredMetadata[key3] = metadata[key3];
      }
    }
  } else {
    filteredMetadata = metadata;
  }
  const obj = {
    language: language2,
    ...filteredMetadata
  };
  if (language2) {
    obj.language = language2;
  }
  const metadataSource = toFormattedString(sortKeys ? sortObjectPropertiesRecursively(obj) : obj, {});
  return metadataSource;
}

function sortObjectPropertiesRecursively(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectPropertiesRecursively);
  }
  if (obj !== void 0 && obj !== null && typeof obj === "object" && Object.keys(obj).length > 0) {
    return Object.keys(obj).sort().reduce((sortedObj, prop) => {
      sortedObj[prop] = sortObjectPropertiesRecursively(obj[prop]);
      return sortedObj;
    }, {});
  }
  return obj;
}
export { cloneNotebookCellTextModel, computeRunStartTimeAdjustment, getFormattedMetadataJSON, sortObjectPropertiesRecursively, NotebookCellTextModel };
