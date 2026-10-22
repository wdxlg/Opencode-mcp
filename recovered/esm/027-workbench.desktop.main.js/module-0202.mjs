// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/textModelSync/textModelSync.impl.ts
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { IntervalTimer } from "./module-0036.mjs";
import { URI } from "./module-0032.mjs";
import { MirrorTextModel } from "./module-0201.mjs";
import { Position } from "./module-0079.mjs";
import { ensureValidWordDefinition, getWordAtText } from "./module-0103.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/services/textModelSync/textModelSync.impl.ts
var STOP_SYNC_MODEL_DELTA_TIME_MS = 60 * 1e3;

var WORKER_TEXT_MODEL_SYNC_CHANNEL = "workerTextModelSync";

var WorkerTextModelSyncClient = class _WorkerTextModelSyncClient extends Disposable {
  constructor(proxy, modelService, keepIdleModels = false) {
    super();
    this._syncedModels = /* @__PURE__ */ Object.create(null);
    this._syncedModelsLastUsedTime = /* @__PURE__ */ Object.create(null);
    this._proxy = proxy;
    this._modelService = modelService;
    if (!keepIdleModels) {
      const timer = new IntervalTimer();
      timer.cancelAndSet(() => this._checkStopModelSync(), Math.round(STOP_SYNC_MODEL_DELTA_TIME_MS / 2));
      this._register(timer);
    }
  }
  static create(workerClient, modelService) {
    return new _WorkerTextModelSyncClient(
      workerClient.getChannel(WORKER_TEXT_MODEL_SYNC_CHANNEL),
      modelService
    );
  }
  dispose() {
    for (const modelUrl in this._syncedModels) {
      dispose(this._syncedModels[modelUrl]);
    }
    this._syncedModels = /* @__PURE__ */ Object.create(null);
    this._syncedModelsLastUsedTime = /* @__PURE__ */ Object.create(null);
    super.dispose();
  }
  ensureSyncedResources(resources, forceLargeModels = false) {
    for (const resource of resources) {
      const resourceStr = resource.toString();
      if (!this._syncedModels[resourceStr]) {
        this._beginModelSync(resource, forceLargeModels);
      }
      if (this._syncedModels[resourceStr]) {
        this._syncedModelsLastUsedTime[resourceStr] = (/* @__PURE__ */ new Date()).getTime();
      }
    }
  }
  _checkStopModelSync() {
    const currentTime = (/* @__PURE__ */ new Date()).getTime();
    const toRemove = [];
    for (const modelUrl in this._syncedModelsLastUsedTime) {
      const elapsedTime = currentTime - this._syncedModelsLastUsedTime[modelUrl];
      if (elapsedTime > STOP_SYNC_MODEL_DELTA_TIME_MS) {
        toRemove.push(modelUrl);
      }
    }
    for (const e of toRemove) {
      this._stopModelSync(e);
    }
  }
  _beginModelSync(resource, forceLargeModels) {
    const model = this._modelService.getModel(resource);
    if (!model) {
      return;
    }
    if (!forceLargeModels && model.isTooLargeForSyncing()) {
      return;
    }
    const modelUrl = resource.toString();
    this._proxy.$acceptNewModel({
      url: model.uri.toString(),
      lines: model.getLinesContent(),
      EOL: model.getEOL(),
      versionId: model.getVersionId()
    });
    const toDispose = new DisposableStore();
    toDispose.add(model.onDidChangeContent((e) => {
      this._proxy.$acceptModelChanged(modelUrl.toString(), e);
    }));
    toDispose.add(model.onWillDispose(() => {
      this._stopModelSync(modelUrl);
    }));
    toDispose.add(toDisposable(() => {
      this._proxy.$acceptRemovedModel(modelUrl);
    }));
    this._syncedModels[modelUrl] = toDispose;
  }
  _stopModelSync(modelUrl) {
    const toDispose = this._syncedModels[modelUrl];
    delete this._syncedModels[modelUrl];
    delete this._syncedModelsLastUsedTime[modelUrl];
    dispose(toDispose);
  }
};

var WorkerTextModelSyncServer = class {
  constructor() {
    this._models = /* @__PURE__ */ Object.create(null);
  }
  bindToServer(workerServer) {
    workerServer.setChannel(WORKER_TEXT_MODEL_SYNC_CHANNEL, this);
  }
  getModel(uri5) {
    return this._models[uri5];
  }
  getModels() {
    const all = [];
    Object.keys(this._models).forEach((key3) => all.push(this._models[key3]));
    return all;
  }
  $acceptNewModel(data) {
    this._models[data.url] = new MirrorModel(URI.parse(data.url), data.lines, data.EOL, data.versionId);
  }
  $acceptModelChanged(uri5, e) {
    if (!this._models[uri5]) {
      return;
    }
    const model = this._models[uri5];
    model.onEvents(e);
  }
  $acceptRemovedModel(uri5) {
    if (!this._models[uri5]) {
      return;
    }
    delete this._models[uri5];
  }
};

var MirrorModel = class extends MirrorTextModel {
  get uri() {
    return this._uri;
  }
  get eol() {
    return this._eol;
  }
  getValue() {
    return this.getText();
  }
  findMatches(regex) {
    const matches2 = [];
    for (let i2 = 0; i2 < this._lines.length; i2++) {
      const line = this._lines[i2];
      const offsetToAdd = this.offsetAt(new Position(i2 + 1, 1));
      const iteratorOverMatches = line.matchAll(regex);
      for (const match2 of iteratorOverMatches) {
        if (match2.index || match2.index === 0) {
          match2.index = match2.index + offsetToAdd;
        }
        matches2.push(match2);
      }
    }
    return matches2;
  }
  getLinesContent() {
    return this._lines.slice(0);
  }
  getLineCount() {
    return this._lines.length;
  }
  getLineContent(lineNumber) {
    return this._lines[lineNumber - 1];
  }
  getWordAtPosition(position2, wordDefinition) {
    const wordAtText = getWordAtText(
      position2.column,
      ensureValidWordDefinition(wordDefinition),
      this._lines[position2.lineNumber - 1],
      0
    );
    if (wordAtText) {
      return new Range2(position2.lineNumber, wordAtText.startColumn, position2.lineNumber, wordAtText.endColumn);
    }
    return null;
  }
  getWordUntilPosition(position2, wordDefinition) {
    const wordAtPosition = this.getWordAtPosition(position2, wordDefinition);
    if (!wordAtPosition) {
      return {
        word: "",
        startColumn: position2.column,
        endColumn: position2.column
      };
    }
    return {
      word: this._lines[position2.lineNumber - 1].substring(wordAtPosition.startColumn - 1, position2.column - 1),
      startColumn: wordAtPosition.startColumn,
      endColumn: position2.column
    };
  }
  words(wordDefinition) {
    const lines = this._lines;
    const wordenize = this._wordenize.bind(this);
    let lineNumber = 0;
    let lineText = "";
    let wordRangesIdx = 0;
    let wordRanges = [];
    return {
      *[Symbol.iterator]() {
        while (true) {
          if (wordRangesIdx < wordRanges.length) {
            const value2 = lineText.substring(wordRanges[wordRangesIdx].start, wordRanges[wordRangesIdx].end);
            wordRangesIdx += 1;
            yield value2;
          } else {
            if (lineNumber < lines.length) {
              lineText = lines[lineNumber];
              wordRanges = wordenize(lineText, wordDefinition);
              wordRangesIdx = 0;
              lineNumber += 1;
            } else {
              break;
            }
          }
        }
      }
    };
  }
  getLineWords(lineNumber, wordDefinition) {
    const content2 = this._lines[lineNumber - 1];
    const ranges = this._wordenize(content2, wordDefinition);
    const words = [];
    for (const range2 of ranges) {
      words.push({
        word: content2.substring(range2.start, range2.end),
        startColumn: range2.start + 1,
        endColumn: range2.end + 1
      });
    }
    return words;
  }
  _wordenize(content2, wordDefinition) {
    const result = [];
    let match2;
    wordDefinition.lastIndex = 0;
    while (match2 = wordDefinition.exec(content2)) {
      if (match2[0].length === 0) {
        break;
      }
      result.push({ start: match2.index, end: match2.index + match2[0].length });
    }
    return result;
  }
  getValueInRange(range2) {
    range2 = this._validateRange(range2);
    if (range2.startLineNumber === range2.endLineNumber) {
      return this._lines[range2.startLineNumber - 1].substring(range2.startColumn - 1, range2.endColumn - 1);
    }
    const lineEnding = this._eol;
    const startLineIndex = range2.startLineNumber - 1;
    const endLineIndex = range2.endLineNumber - 1;
    const resultLines = [];
    resultLines.push(this._lines[startLineIndex].substring(range2.startColumn - 1));
    for (let i2 = startLineIndex + 1; i2 < endLineIndex; i2++) {
      resultLines.push(this._lines[i2]);
    }
    resultLines.push(this._lines[endLineIndex].substring(0, range2.endColumn - 1));
    return resultLines.join(lineEnding);
  }
  offsetAt(position2) {
    position2 = this._validatePosition(position2);
    this._ensureLineStarts();
    return this._lineStarts.getPrefixSum(position2.lineNumber - 2) + (position2.column - 1);
  }
  positionAt(offset) {
    offset = Math.floor(offset);
    offset = Math.max(0, offset);
    this._ensureLineStarts();
    const out = this._lineStarts.getIndexOf(offset);
    const lineLength = this._lines[out.index].length;
    return {
      lineNumber: 1 + out.index,
      column: 1 + Math.min(out.remainder, lineLength)
    };
  }
  _validateRange(range2) {
    const start = this._validatePosition({ lineNumber: range2.startLineNumber, column: range2.startColumn });
    const end = this._validatePosition({ lineNumber: range2.endLineNumber, column: range2.endColumn });
    if (start.lineNumber !== range2.startLineNumber || start.column !== range2.startColumn || end.lineNumber !== range2.endLineNumber || end.column !== range2.endColumn) {
      return {
        startLineNumber: start.lineNumber,
        startColumn: start.column,
        endLineNumber: end.lineNumber,
        endColumn: end.column
      };
    }
    return range2;
  }
  _validatePosition(position2) {
    if (!Position.isIPosition(position2)) {
      throw new Error("bad position");
    }
    let { lineNumber, column } = position2;
    let hasChanged = false;
    if (lineNumber < 1) {
      lineNumber = 1;
      column = 1;
      hasChanged = true;
    } else if (lineNumber > this._lines.length) {
      lineNumber = this._lines.length;
      column = this._lines[lineNumber - 1].length + 1;
      hasChanged = true;
    } else {
      const maxCharacter = this._lines[lineNumber - 1].length + 1;
      if (column < 1) {
        column = 1;
        hasChanged = true;
      } else if (column > maxCharacter) {
        column = maxCharacter;
        hasChanged = true;
      }
    }
    if (!hasChanged) {
      return position2;
    } else {
      return { lineNumber, column };
    }
  }
};
export { STOP_SYNC_MODEL_DELTA_TIME_MS, WORKER_TEXT_MODEL_SYNC_CHANNEL, WorkerTextModelSyncClient, WorkerTextModelSyncServer, MirrorModel };
