// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/services/editorWorkerService.ts
import { Disposable } from "./module-0012.mjs";
import { WebWorkerDescriptor } from "./module-0160.mjs";
import { FileAccess } from "./module-0033.mjs";
import { MovedText } from "./module-0173.mjs";
import { DetailedLineRangeMapping, LineRangeMapping, RangeMapping } from "./module-0179.mjs";
import { LineRange } from "./module-0174.mjs";
import { Range2 } from "./module-0106.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { StopWatch } from "./module-0016.mjs";
import { timeout } from "./module-0036.mjs";
import { canceled, onUnexpectedError } from "./module-0004.mjs";
import { StringEdit } from "./module-0193.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IWebWorkerService } from "./module-0161.mjs";
import { isCompletionsEnabledWithTextResourceConfig } from "./module-0207.mjs";
import { WindowIntervalTimer } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { EditorWorkerHost } from "./module-0206.mjs";
import { logOnceWebWorkerWarning } from "./module-0159.mjs";
import { EditorWorker } from "./module-0203.mjs";
import { WorkerTextModelSyncClient } from "./module-0202.mjs";


// src/vs/editor/browser/services/editorWorkerService.ts
var STOP_WORKER_DELTA_TIME_MS = 5 * 60 * 1e3;

function canSyncModel(modelService, resource) {
  const model = modelService.getModel(resource);
  if (!model) {
    return false;
  }
  if (model.isTooLargeForSyncing()) {
    return false;
  }
  return true;
}

var EditorWorkerService = class extends Disposable {
  constructor(modelService, configurationService, logService, _languageConfigurationService, languageFeaturesService, _webWorkerService) {
    super();
    this._languageConfigurationService = _languageConfigurationService;
    this._webWorkerService = _webWorkerService;
    this._modelService = modelService;
    this._workerManager = this._register(new WorkerManager(EditorWorkerService.workerDescriptor, this._modelService, this._webWorkerService));
    this._logService = logService;
    this._register(languageFeaturesService.linkProvider.register({ language: "*", hasAccessToAllModels: true }, {
      provideLinks: async (model, token) => {
        if (!canSyncModel(this._modelService, model.uri)) {
          return Promise.resolve({ links: [] });
        }
        const worker = await this._workerWithResources([model.uri]);
        const links = await worker.$computeLinks(model.uri.toString());
        return links && { links };
      }
    }));
    this._register(languageFeaturesService.completionProvider.register("*", new WordBasedCompletionItemProvider(this._workerManager, configurationService, this._modelService, this._languageConfigurationService, this._logService, languageFeaturesService)));
  }
  static {
    this.workerDescriptor = new WebWorkerDescriptor({
      esmModuleLocation: () => FileAccess.asBrowserUri("vs/editor/common/services/editorWebWorkerMain.js"),
      esmModuleLocationBundler: () => new URL("../../common/services/editorWebWorkerMain.ts?esm", import.meta.url),
      label: "editorWorkerService"
    });
  }
  canComputeUnicodeHighlights(uri4) {
    return canSyncModel(this._modelService, uri4);
  }
  async computedUnicodeHighlights(uri4, options3, range2) {
    const worker = await this._workerWithResources([uri4]);
    return worker.$computeUnicodeHighlights(uri4.toString(), options3, range2);
  }
  async computeDiff(original, modified, options3, algorithm) {
    const worker = await this._workerWithResources(
      [original, modified],
      /* forceLargeModels */
      true
    );
    const result = await worker.$computeDiff(original.toString(), modified.toString(), options3, algorithm);
    if (!result) {
      return null;
    }
    const diff4 = {
      identical: result.identical,
      quitEarly: result.quitEarly,
      changes: toLineRangeMappings(result.changes),
      moves: result.moves.map((m) => new MovedText(
        new LineRangeMapping(new LineRange(m[0], m[1]), new LineRange(m[2], m[3])),
        toLineRangeMappings(m[4])
      ))
    };
    return diff4;
    function toLineRangeMappings(changes) {
      return changes.map(
        (c) => new DetailedLineRangeMapping(
          new LineRange(c[0], c[1]),
          new LineRange(c[2], c[3]),
          c[4]?.map(
            (c2) => new RangeMapping(
              new Range2(c2[0], c2[1], c2[2], c2[3]),
              new Range2(c2[4], c2[5], c2[6], c2[7])
            )
          )
        )
      );
    }
  }
  canComputeDirtyDiff(original, modified) {
    return canSyncModel(this._modelService, original) && canSyncModel(this._modelService, modified);
  }
  async computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
    const worker = await this._workerWithResources([original, modified]);
    return worker.$computeDirtyDiff(original.toString(), modified.toString(), ignoreTrimWhitespace);
  }
  async computeMoreMinimalEdits(resource, edits, pretty2 = false) {
    if (isNonEmptyArray(edits)) {
      if (!canSyncModel(this._modelService, resource)) {
        return Promise.resolve(edits);
      }
      const sw = StopWatch.create();
      const result = this._workerWithResources([resource]).then((worker) => worker.$computeMoreMinimalEdits(resource.toString(), edits, pretty2));
      result.finally(() => this._logService.trace("FORMAT#computeMoreMinimalEdits", resource.toString(true), sw.elapsed()));
      return Promise.race([result, timeout(1e3).then(() => edits)]);
    } else {
      return Promise.resolve(void 0);
    }
  }
  computeHumanReadableDiff(resource, edits) {
    if (isNonEmptyArray(edits)) {
      if (!canSyncModel(this._modelService, resource)) {
        return Promise.resolve(edits);
      }
      const sw = StopWatch.create();
      const opts = { ignoreTrimWhitespace: false, maxComputationTimeMs: 1e3, computeMoves: false };
      const result = this._workerWithResources([resource]).then((worker) => worker.$computeHumanReadableDiff(resource.toString(), edits, opts)).catch((err) => {
        onUnexpectedError(err);
        return this.computeMoreMinimalEdits(resource, edits, true);
      });
      result.finally(() => this._logService.trace("FORMAT#computeHumanReadableDiff", resource.toString(true), sw.elapsed()));
      return result;
    } else {
      return Promise.resolve(void 0);
    }
  }
  async computeStringEditFromDiff(original, modified, options3, algorithm) {
    try {
      const worker = await this._workerWithResources([]);
      const edit3 = await worker.$computeStringDiff(original, modified, options3, algorithm);
      return StringEdit.fromJson(edit3);
    } catch (e4) {
      onUnexpectedError(e4);
      return StringEdit.replace(OffsetRange.ofLength(original.length), modified);
    }
  }
  canNavigateValueSet(resource) {
    return canSyncModel(this._modelService, resource);
  }
  async navigateValueSet(resource, range2, up) {
    const model = this._modelService.getModel(resource);
    if (!model) {
      return null;
    }
    const wordDefRegExp = this._languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
    const wordDef = wordDefRegExp.source;
    const wordDefFlags = wordDefRegExp.flags;
    const worker = await this._workerWithResources([resource]);
    return worker.$navigateValueSet(resource.toString(), range2, up, wordDef, wordDefFlags);
  }
  canComputeWordRanges(resource) {
    return canSyncModel(this._modelService, resource);
  }
  async computeWordRanges(resource, range2) {
    const model = this._modelService.getModel(resource);
    if (!model) {
      return Promise.resolve(null);
    }
    const wordDefRegExp = this._languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
    const wordDef = wordDefRegExp.source;
    const wordDefFlags = wordDefRegExp.flags;
    const worker = await this._workerWithResources([resource]);
    return worker.$computeWordRanges(resource.toString(), range2, wordDef, wordDefFlags);
  }
  async findSectionHeaders(uri4, options3) {
    const worker = await this._workerWithResources([uri4]);
    return worker.$findSectionHeaders(uri4.toString(), options3);
  }
  async computeDefaultDocumentColors(uri4) {
    const worker = await this._workerWithResources([uri4]);
    return worker.$computeDefaultDocumentColors(uri4.toString());
  }
  async _workerWithResources(resources, forceLargeModels = false) {
    const worker = await this._workerManager.withWorker();
    return await worker.workerWithSyncedResources(resources, forceLargeModels);
  }
};

EditorWorkerService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ITextResourceConfigurationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ILanguageConfigurationService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IWebWorkerService)
], EditorWorkerService);

var WordBasedCompletionItemProvider = class {
  constructor(workerManager, configurationService, modelService, languageConfigurationService, logService, languageFeaturesService) {
    this.languageConfigurationService = languageConfigurationService;
    this.logService = logService;
    this.languageFeaturesService = languageFeaturesService;
    this._debugDisplayName = "wordbasedCompletions";
    this._workerManager = workerManager;
    this._configurationService = configurationService;
    this._modelService = modelService;
  }
  async provideCompletionItems(model, position2) {
    const config = this._configurationService.getValue(model.uri, position2, "editor");
    if (config.wordBasedSuggestions === "off") {
      return void 0;
    }
    if (config.wordBasedSuggestions === "offWithInlineSuggestions" && this.languageFeaturesService.inlineCompletionsProvider.has(model) && isCompletionsEnabledWithTextResourceConfig(this._configurationService, model.uri, model.getLanguageId())) {
      return void 0;
    }
    const models = [];
    if (config.wordBasedSuggestions === "currentDocument") {
      if (canSyncModel(this._modelService, model.uri)) {
        models.push(model.uri);
      }
    } else {
      for (const candidate of this._modelService.getModels()) {
        if (!canSyncModel(this._modelService, candidate.uri)) {
          continue;
        }
        if (candidate === model) {
          models.unshift(candidate.uri);
        } else if (config.wordBasedSuggestions === "allDocuments" || candidate.getLanguageId() === model.getLanguageId()) {
          models.push(candidate.uri);
        }
      }
    }
    if (models.length === 0) {
      return void 0;
    }
    const wordDefRegExp = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
    const word = model.getWordAtPosition(position2);
    const replace = !word ? Range2.fromPositions(position2) : new Range2(position2.lineNumber, word.startColumn, position2.lineNumber, word.endColumn);
    const insert2 = replace.setEndPosition(position2.lineNumber, position2.column);
    this.logService.trace("[WordBasedCompletionItemProvider]", `word: "${word?.word || ""}", wordDef: "${wordDefRegExp}", replace: [${replace.toString()}], insert: [${insert2.toString()}]`);
    const client = await this._workerManager.withWorker();
    const data = await client.textualSuggest(models, word?.word, wordDefRegExp);
    if (!data) {
      return void 0;
    }
    return {
      duration: data.duration,
      suggestions: data.words.map((word2) => {
        return {
          kind: 18 /* Text */,
          label: word2,
          insertText: word2,
          range: { insert: insert2, replace }
        };
      })
    };
  }
};

var WorkerManager = class extends Disposable {
  constructor(_workerDescriptor, modelService, webWorkerService) {
    super();
    this._workerDescriptor = _workerDescriptor;
    this._modelService = modelService;
    this._webWorkerService = webWorkerService;
    this._editorWorkerClient = null;
    this._lastWorkerUsedTime = (/* @__PURE__ */ new Date()).getTime();
    const stopWorkerInterval = this._register(new WindowIntervalTimer());
    stopWorkerInterval.cancelAndSet(() => this._checkStopIdleWorker(), Math.round(STOP_WORKER_DELTA_TIME_MS / 2), mainWindow);
    this._register(this._modelService.onModelRemoved((_) => this._checkStopEmptyWorker()));
  }
  dispose() {
    if (this._editorWorkerClient) {
      this._editorWorkerClient.dispose();
      this._editorWorkerClient = null;
    }
    super.dispose();
  }
  /**
   * Check if the model service has no more models and stop the worker if that is the case.
   */
  _checkStopEmptyWorker() {
    if (!this._editorWorkerClient) {
      return;
    }
    const models = this._modelService.getModels();
    if (models.length === 0) {
      this._editorWorkerClient.dispose();
      this._editorWorkerClient = null;
    }
  }
  /**
   * Check if the worker has been idle for a while and then stop it.
   */
  _checkStopIdleWorker() {
    if (!this._editorWorkerClient) {
      return;
    }
    const timeSinceLastWorkerUsedTime = (/* @__PURE__ */ new Date()).getTime() - this._lastWorkerUsedTime;
    if (timeSinceLastWorkerUsedTime > STOP_WORKER_DELTA_TIME_MS) {
      this._editorWorkerClient.dispose();
      this._editorWorkerClient = null;
    }
  }
  withWorker() {
    this._lastWorkerUsedTime = (/* @__PURE__ */ new Date()).getTime();
    if (!this._editorWorkerClient) {
      this._editorWorkerClient = new EditorWorkerClient(this._workerDescriptor, false, this._modelService, this._webWorkerService);
    }
    return Promise.resolve(this._editorWorkerClient);
  }
};

WorkerManager = __decorateClass([
  __decorateParam(1, IModelService),
  __decorateParam(2, IWebWorkerService)
], WorkerManager);

var SynchronousWorkerClient = class {
  constructor(instance2) {
    this._instance = instance2;
    this.proxy = this._instance;
  }
  dispose() {
    this._instance.dispose();
  }
  setChannel(channel, handler) {
    throw new Error(`Not supported`);
  }
  getChannel(channel) {
    throw new Error(`Not supported`);
  }
};

var EditorWorkerClient = class extends Disposable {
  constructor(_workerDescriptorOrWorker, keepIdleModels, modelService, webWorkerService) {
    super();
    this._workerDescriptorOrWorker = _workerDescriptorOrWorker;
    this._disposed = false;
    this._modelService = modelService;
    this._webWorkerService = webWorkerService;
    this._keepIdleModels = keepIdleModels;
    this._worker = null;
    this._modelManager = null;
  }
  // foreign host request
  fhr(method, args2) {
    throw new Error(`Not implemented!`);
  }
  _getOrCreateWorker() {
    if (!this._worker) {
      try {
        this._worker = this._register(this._webWorkerService.createWorkerClient(this._workerDescriptorOrWorker));
        EditorWorkerHost.setChannel(this._worker, this._createEditorWorkerHost());
      } catch (err) {
        logOnceWebWorkerWarning(err);
        this._worker = this._createFallbackLocalWorker();
      }
    }
    return this._worker;
  }
  async _getProxy() {
    try {
      const proxy = this._getOrCreateWorker().proxy;
      await proxy.$ping();
      return proxy;
    } catch (err) {
      logOnceWebWorkerWarning(err);
      this._worker = this._createFallbackLocalWorker();
      return this._worker.proxy;
    }
  }
  _createFallbackLocalWorker() {
    return new SynchronousWorkerClient(new EditorWorker(null));
  }
  _createEditorWorkerHost() {
    return {
      $fhr: (method, args2) => this.fhr(method, args2)
    };
  }
  _getOrCreateModelManager(proxy) {
    if (!this._modelManager) {
      this._modelManager = this._register(new WorkerTextModelSyncClient(proxy, this._modelService, this._keepIdleModels));
    }
    return this._modelManager;
  }
  async workerWithSyncedResources(resources, forceLargeModels = false) {
    if (this._disposed) {
      return Promise.reject(canceled());
    }
    const proxy = await this._getProxy();
    this._getOrCreateModelManager(proxy).ensureSyncedResources(resources, forceLargeModels);
    return proxy;
  }
  async textualSuggest(resources, leadingWord, wordDefRegExp) {
    const proxy = await this.workerWithSyncedResources(resources);
    const wordDef = wordDefRegExp.source;
    const wordDefFlags = wordDefRegExp.flags;
    return proxy.$textualSuggest(resources.map((r2) => r2.toString()), leadingWord, wordDef, wordDefFlags);
  }
  dispose() {
    super.dispose();
    this._disposed = true;
  }
};

EditorWorkerClient = __decorateClass([
  __decorateParam(2, IModelService),
  __decorateParam(3, IWebWorkerService)
], EditorWorkerClient);
export { canSyncModel, STOP_WORKER_DELTA_TIME_MS, EditorWorkerService, WordBasedCompletionItemProvider, WorkerManager, SynchronousWorkerClient, EditorWorkerClient };
