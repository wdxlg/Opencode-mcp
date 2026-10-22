// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/modelService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { OS, isLinux, isMacintosh } from "./module-0014.mjs";
import { Emitter } from "./module-0017.mjs";
import { EDITOR_MODEL_DEFAULTS } from "./module-0102.mjs";
import { clampedInt } from "./module-0105.mjs";
import { equals4 } from "./module-0098.mjs";
import { TextModel, createTextBuffer } from "./module-0423.mjs";
import { isEditStackElement } from "./module-0393.mjs";
import { EditSources } from "./module-0377.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextResourcePropertiesService } from "./module-0204.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { StringSHA1 } from "./module-0039.mjs";


// src/vs/editor/common/services/modelService.ts
function MODEL_ID2(resource) {
  return resource.toString();
}

var ModelData2 = class {
  constructor(model, onWillDispose, onDidChangeLanguage) {
    this.model = model;
    this._modelEventListeners = new DisposableStore();
    this.model = model;
    this._modelEventListeners.add(model.onWillDispose(() => onWillDispose(model)));
    this._modelEventListeners.add(model.onDidChangeLanguage((e4) => onDidChangeLanguage(model, e4)));
  }
  dispose() {
    this._modelEventListeners.dispose();
  }
};

var DEFAULT_EOL = isLinux || isMacintosh ? 1 /* LF */ : 2 /* CRLF */;

var DisposedModelInfo = class {
  constructor(uri4, initialUndoRedoSnapshot, time, sharesUndoRedoStack, heapSize, sha1, versionId, alternativeVersionId) {
    this.uri = uri4;
    this.initialUndoRedoSnapshot = initialUndoRedoSnapshot;
    this.time = time;
    this.sharesUndoRedoStack = sharesUndoRedoStack;
    this.heapSize = heapSize;
    this.sha1 = sha1;
    this.versionId = versionId;
    this.alternativeVersionId = alternativeVersionId;
  }
};

var ModelService = class extends Disposable {
  constructor(_configurationService, _resourcePropertiesService, _undoRedoService, _instantiationService) {
    super();
    this._configurationService = _configurationService;
    this._resourcePropertiesService = _resourcePropertiesService;
    this._undoRedoService = _undoRedoService;
    this._instantiationService = _instantiationService;
    this._onModelAdded = this._register(new Emitter());
    this.onModelAdded = this._onModelAdded.event;
    this._onModelRemoved = this._register(new Emitter());
    this.onModelRemoved = this._onModelRemoved.event;
    this._onModelModeChanged = this._register(new Emitter());
    this.onModelLanguageChanged = this._onModelModeChanged.event;
    this._modelCreationOptionsByLanguageAndResource = /* @__PURE__ */ Object.create(null);
    this._models = {};
    this._disposedModels = /* @__PURE__ */ new Map();
    this._disposedModelsHeapSize = 0;
    this._register(this._configurationService.onDidChangeConfiguration((e4) => this._updateModelOptions(e4)));
    this._updateModelOptions(void 0);
  }
  static {
    this.MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK = 20 * 1024 * 1024;
  }
  static _readModelOptions(config, isForSimpleWidget) {
    let tabSize = EDITOR_MODEL_DEFAULTS.tabSize;
    if (config.editor && typeof config.editor.tabSize !== "undefined") {
      tabSize = clampedInt(config.editor.tabSize, EDITOR_MODEL_DEFAULTS.tabSize, 1, 100);
    }
    let indentSize = "tabSize";
    if (config.editor && typeof config.editor.indentSize !== "undefined" && config.editor.indentSize !== "tabSize") {
      indentSize = clampedInt(config.editor.indentSize, "tabSize", 1, 100);
    }
    let insertSpaces = EDITOR_MODEL_DEFAULTS.insertSpaces;
    if (config.editor && typeof config.editor.insertSpaces !== "undefined") {
      insertSpaces = config.editor.insertSpaces === "false" ? false : Boolean(config.editor.insertSpaces);
    }
    let newDefaultEOL = DEFAULT_EOL;
    const eol = config.eol;
    if (eol === "\r\n") {
      newDefaultEOL = 2 /* CRLF */;
    } else if (eol === "\n") {
      newDefaultEOL = 1 /* LF */;
    }
    let trimAutoWhitespace = EDITOR_MODEL_DEFAULTS.trimAutoWhitespace;
    if (config.editor && typeof config.editor.trimAutoWhitespace !== "undefined") {
      trimAutoWhitespace = config.editor.trimAutoWhitespace === "false" ? false : Boolean(config.editor.trimAutoWhitespace);
    }
    let detectIndentation = EDITOR_MODEL_DEFAULTS.detectIndentation;
    if (config.editor && typeof config.editor.detectIndentation !== "undefined") {
      detectIndentation = config.editor.detectIndentation === "false" ? false : Boolean(config.editor.detectIndentation);
    }
    let largeFileOptimizations = EDITOR_MODEL_DEFAULTS.largeFileOptimizations;
    if (config.editor && typeof config.editor.largeFileOptimizations !== "undefined") {
      largeFileOptimizations = config.editor.largeFileOptimizations === "false" ? false : Boolean(config.editor.largeFileOptimizations);
    }
    let bracketPairColorizationOptions = EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions;
    if (config.editor?.bracketPairColorization && typeof config.editor.bracketPairColorization === "object") {
      const bpConfig = config.editor.bracketPairColorization;
      bracketPairColorizationOptions = {
        enabled: !!bpConfig.enabled,
        independentColorPoolPerBracketType: !!bpConfig.independentColorPoolPerBracketType
      };
    }
    return {
      isForSimpleWidget,
      tabSize,
      indentSize,
      insertSpaces,
      detectIndentation,
      defaultEOL: newDefaultEOL,
      trimAutoWhitespace,
      largeFileOptimizations,
      bracketPairColorizationOptions
    };
  }
  _getEOL(resource, language2) {
    if (resource) {
      return this._resourcePropertiesService.getEOL(resource, language2);
    }
    const eol = this._configurationService.getValue("files.eol", { overrideIdentifier: language2 });
    if (eol && typeof eol === "string" && eol !== "auto") {
      return eol;
    }
    return OS === 3 /* Linux */ || OS === 2 /* Macintosh */ ? "\n" : "\r\n";
  }
  _shouldRestoreUndoStack() {
    const result = this._configurationService.getValue("files.restoreUndoStack");
    if (typeof result === "boolean") {
      return result;
    }
    return true;
  }
  getCreationOptions(languageIdOrSelection, resource, isForSimpleWidget) {
    const language2 = typeof languageIdOrSelection === "string" ? languageIdOrSelection : languageIdOrSelection.languageId;
    let creationOptions = this._modelCreationOptionsByLanguageAndResource[language2 + resource];
    if (!creationOptions) {
      const editor = this._configurationService.getValue("editor", { overrideIdentifier: language2, resource });
      const eol = this._getEOL(resource, language2);
      creationOptions = ModelService._readModelOptions({ editor, eol }, isForSimpleWidget);
      this._modelCreationOptionsByLanguageAndResource[language2 + resource] = creationOptions;
    }
    return creationOptions;
  }
  _updateModelOptions(e4) {
    const oldOptionsByLanguageAndResource = this._modelCreationOptionsByLanguageAndResource;
    this._modelCreationOptionsByLanguageAndResource = /* @__PURE__ */ Object.create(null);
    const keys = Object.keys(this._models);
    for (let i2 = 0, len = keys.length; i2 < len; i2++) {
      const modelId = keys[i2];
      const modelData = this._models[modelId];
      const language2 = modelData.model.getLanguageId();
      const uri4 = modelData.model.uri;
      if (e4 && !e4.affectsConfiguration("editor", { overrideIdentifier: language2, resource: uri4 }) && !e4.affectsConfiguration("files.eol", { overrideIdentifier: language2, resource: uri4 })) {
        continue;
      }
      const oldOptions = oldOptionsByLanguageAndResource[language2 + uri4];
      const newOptions = this.getCreationOptions(language2, uri4, modelData.model.isForSimpleWidget);
      ModelService._setModelOptionsForModel(modelData.model, newOptions, oldOptions);
    }
  }
  static _setModelOptionsForModel(model, newOptions, currentOptions) {
    if (currentOptions && currentOptions.defaultEOL !== newOptions.defaultEOL && model.getLineCount() === 1) {
      model.setEOL(newOptions.defaultEOL === 1 /* LF */ ? 0 /* LF */ : 1 /* CRLF */);
    }
    if (currentOptions && currentOptions.detectIndentation === newOptions.detectIndentation && currentOptions.insertSpaces === newOptions.insertSpaces && currentOptions.tabSize === newOptions.tabSize && currentOptions.indentSize === newOptions.indentSize && currentOptions.trimAutoWhitespace === newOptions.trimAutoWhitespace && equals4(currentOptions.bracketPairColorizationOptions, newOptions.bracketPairColorizationOptions)) {
      return;
    }
    if (newOptions.detectIndentation) {
      model.detectIndentation(newOptions.insertSpaces, newOptions.tabSize);
      model.updateOptions({
        trimAutoWhitespace: newOptions.trimAutoWhitespace,
        bracketColorizationOptions: newOptions.bracketPairColorizationOptions
      });
    } else {
      model.updateOptions({
        insertSpaces: newOptions.insertSpaces,
        tabSize: newOptions.tabSize,
        indentSize: newOptions.indentSize,
        trimAutoWhitespace: newOptions.trimAutoWhitespace,
        bracketColorizationOptions: newOptions.bracketPairColorizationOptions
      });
    }
  }
  // --- begin IModelService
  _insertDisposedModel(disposedModelData) {
    this._disposedModels.set(MODEL_ID2(disposedModelData.uri), disposedModelData);
    this._disposedModelsHeapSize += disposedModelData.heapSize;
  }
  _removeDisposedModel(resource) {
    const disposedModelData = this._disposedModels.get(MODEL_ID2(resource));
    if (disposedModelData) {
      this._disposedModelsHeapSize -= disposedModelData.heapSize;
    }
    this._disposedModels.delete(MODEL_ID2(resource));
    return disposedModelData;
  }
  _ensureDisposedModelsHeapSize(maxModelsHeapSize) {
    if (this._disposedModelsHeapSize > maxModelsHeapSize) {
      const disposedModels = [];
      this._disposedModels.forEach((entry) => {
        if (!entry.sharesUndoRedoStack) {
          disposedModels.push(entry);
        }
      });
      disposedModels.sort((a, b) => a.time - b.time);
      while (disposedModels.length > 0 && this._disposedModelsHeapSize > maxModelsHeapSize) {
        const disposedModel = disposedModels.shift();
        this._removeDisposedModel(disposedModel.uri);
        if (disposedModel.initialUndoRedoSnapshot !== null) {
          this._undoRedoService.restoreSnapshot(disposedModel.initialUndoRedoSnapshot);
        }
      }
    }
  }
  _createModelData(value2, languageIdOrSelection, resource, isForSimpleWidget) {
    const options3 = this.getCreationOptions(languageIdOrSelection, resource, isForSimpleWidget);
    const model = this._instantiationService.createInstance(
      TextModel,
      value2,
      languageIdOrSelection,
      options3,
      resource
    );
    if (resource && this._disposedModels.has(MODEL_ID2(resource))) {
      const disposedModelData = this._removeDisposedModel(resource);
      const elements = this._undoRedoService.getElements(resource);
      const sha1Computer = this._getSHA1Computer();
      const sha1IsEqual = sha1Computer.canComputeSHA1(model) ? sha1Computer.computeSHA1(model) === disposedModelData.sha1 : false;
      if (sha1IsEqual || disposedModelData.sharesUndoRedoStack) {
        for (const element of elements.past) {
          if (isEditStackElement(element) && element.matchesResource(resource)) {
            element.setModel(model);
          }
        }
        for (const element of elements.future) {
          if (isEditStackElement(element) && element.matchesResource(resource)) {
            element.setModel(model);
          }
        }
        this._undoRedoService.setElementsValidFlag(resource, true, (element) => isEditStackElement(element) && element.matchesResource(resource));
        if (sha1IsEqual) {
          model._overwriteVersionId(disposedModelData.versionId);
          model._overwriteAlternativeVersionId(disposedModelData.alternativeVersionId);
          model._overwriteInitialUndoRedoSnapshot(disposedModelData.initialUndoRedoSnapshot);
        }
      } else {
        if (disposedModelData.initialUndoRedoSnapshot !== null) {
          this._undoRedoService.restoreSnapshot(disposedModelData.initialUndoRedoSnapshot);
        }
      }
    }
    const modelId = MODEL_ID2(model.uri);
    if (this._models[modelId]) {
      throw new Error("ModelService: Cannot add model because it already exists!");
    }
    const modelData = new ModelData2(
      model,
      (model2) => this._onWillDispose(model2),
      (model2, e4) => this._onDidChangeLanguage(model2, e4)
    );
    this._models[modelId] = modelData;
    return modelData;
  }
  updateModel(model, value2, reason = EditSources.unknown({ name: "updateModel" })) {
    const options3 = this.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
    const { textBuffer, disposable } = createTextBuffer(value2, options3.defaultEOL);
    if (model.equalsTextBuffer(textBuffer)) {
      disposable.dispose();
      return;
    }
    model.pushStackElement();
    model.pushEOL(textBuffer.getEOL() === "\r\n" ? 1 /* CRLF */ : 0 /* LF */);
    model.pushEditOperations(
      [],
      ModelService._computeEdits(model, textBuffer),
      () => [],
      void 0,
      reason
    );
    model.pushStackElement();
    disposable.dispose();
  }
  static _commonPrefix(a, aLen, aDelta, b, bLen, bDelta) {
    const maxResult = Math.min(aLen, bLen);
    let result = 0;
    for (let i2 = 0; i2 < maxResult && a.getLineContent(aDelta + i2) === b.getLineContent(bDelta + i2); i2++) {
      result++;
    }
    return result;
  }
  static _commonSuffix(a, aLen, aDelta, b, bLen, bDelta) {
    const maxResult = Math.min(aLen, bLen);
    let result = 0;
    for (let i2 = 0; i2 < maxResult && a.getLineContent(aDelta + aLen - i2) === b.getLineContent(bDelta + bLen - i2); i2++) {
      result++;
    }
    return result;
  }
  /**
   * Compute edits to bring `model` to the state of `textSource`.
   */
  static _computeEdits(model, textBuffer) {
    const modelLineCount = model.getLineCount();
    const textBufferLineCount = textBuffer.getLineCount();
    const commonPrefix = this._commonPrefix(model, modelLineCount, 1, textBuffer, textBufferLineCount, 1);
    if (modelLineCount === textBufferLineCount && commonPrefix === modelLineCount) {
      return [];
    }
    const commonSuffix = this._commonSuffix(model, modelLineCount - commonPrefix, commonPrefix, textBuffer, textBufferLineCount - commonPrefix, commonPrefix);
    let oldRange;
    let newRange;
    if (commonSuffix > 0) {
      oldRange = new Range2(commonPrefix + 1, 1, modelLineCount - commonSuffix + 1, 1);
      newRange = new Range2(commonPrefix + 1, 1, textBufferLineCount - commonSuffix + 1, 1);
    } else if (commonPrefix > 0) {
      oldRange = new Range2(commonPrefix, model.getLineMaxColumn(commonPrefix), modelLineCount, model.getLineMaxColumn(modelLineCount));
      newRange = new Range2(commonPrefix, 1 + textBuffer.getLineLength(commonPrefix), textBufferLineCount, 1 + textBuffer.getLineLength(textBufferLineCount));
    } else {
      oldRange = new Range2(1, 1, modelLineCount, model.getLineMaxColumn(modelLineCount));
      newRange = new Range2(1, 1, textBufferLineCount, 1 + textBuffer.getLineLength(textBufferLineCount));
    }
    return [EditOperation.replaceMove(oldRange, textBuffer.getValueInRange(newRange, 0 /* TextDefined */))];
  }
  createModel(value2, languageSelection, resource, isForSimpleWidget = false) {
    let modelData;
    if (languageSelection) {
      modelData = this._createModelData(value2, languageSelection, resource, isForSimpleWidget);
    } else {
      modelData = this._createModelData(value2, PLAINTEXT_LANGUAGE_ID, resource, isForSimpleWidget);
    }
    this._onModelAdded.fire(modelData.model);
    return modelData.model;
  }
  destroyModel(resource) {
    const modelData = this._models[MODEL_ID2(resource)];
    if (!modelData) {
      return;
    }
    modelData.model.dispose();
  }
  getModels() {
    const ret = [];
    const keys = Object.keys(this._models);
    for (let i2 = 0, len = keys.length; i2 < len; i2++) {
      const modelId = keys[i2];
      ret.push(this._models[modelId].model);
    }
    return ret;
  }
  getModel(resource) {
    const modelId = MODEL_ID2(resource);
    const modelData = this._models[modelId];
    if (!modelData) {
      return null;
    }
    return modelData.model;
  }
  // --- end IModelService
  _schemaShouldMaintainUndoRedoElements(resource) {
    return resource.scheme === Schemas.file || resource.scheme === Schemas.vscodeRemote || resource.scheme === Schemas.vscodeUserData || resource.scheme === Schemas.vscodeNotebookCell || resource.scheme === "fake-fs";
  }
  _onWillDispose(model) {
    const modelId = MODEL_ID2(model.uri);
    const modelData = this._models[modelId];
    const sharesUndoRedoStack = this._undoRedoService.getUriComparisonKey(model.uri) !== model.uri.toString();
    let maintainUndoRedoStack = false;
    let heapSize = 0;
    if (sharesUndoRedoStack || this._shouldRestoreUndoStack() && this._schemaShouldMaintainUndoRedoElements(model.uri)) {
      const elements = this._undoRedoService.getElements(model.uri);
      if (elements.past.length > 0 || elements.future.length > 0) {
        for (const element of elements.past) {
          if (isEditStackElement(element) && element.matchesResource(model.uri)) {
            maintainUndoRedoStack = true;
            heapSize += element.heapSize(model.uri);
            element.setModel(model.uri);
          }
        }
        for (const element of elements.future) {
          if (isEditStackElement(element) && element.matchesResource(model.uri)) {
            maintainUndoRedoStack = true;
            heapSize += element.heapSize(model.uri);
            element.setModel(model.uri);
          }
        }
      }
    }
    const maxMemory = ModelService.MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK;
    const sha1Computer = this._getSHA1Computer();
    if (!maintainUndoRedoStack) {
      if (!sharesUndoRedoStack) {
        const initialUndoRedoSnapshot = modelData.model.getInitialUndoRedoSnapshot();
        if (initialUndoRedoSnapshot !== null) {
          this._undoRedoService.restoreSnapshot(initialUndoRedoSnapshot);
        }
      }
    } else if (!sharesUndoRedoStack && (heapSize > maxMemory || !sha1Computer.canComputeSHA1(model))) {
      const initialUndoRedoSnapshot = modelData.model.getInitialUndoRedoSnapshot();
      if (initialUndoRedoSnapshot !== null) {
        this._undoRedoService.restoreSnapshot(initialUndoRedoSnapshot);
      }
    } else {
      this._ensureDisposedModelsHeapSize(maxMemory - heapSize);
      this._undoRedoService.setElementsValidFlag(model.uri, false, (element) => isEditStackElement(element) && element.matchesResource(model.uri));
      this._insertDisposedModel(new DisposedModelInfo(model.uri, modelData.model.getInitialUndoRedoSnapshot(), Date.now(), sharesUndoRedoStack, heapSize, sha1Computer.computeSHA1(model), model.getVersionId(), model.getAlternativeVersionId()));
    }
    delete this._models[modelId];
    modelData.dispose();
    delete this._modelCreationOptionsByLanguageAndResource[model.getLanguageId() + model.uri];
    this._onModelRemoved.fire(model);
  }
  _onDidChangeLanguage(model, e4) {
    const oldLanguageId = e4.oldLanguage;
    const newLanguageId = model.getLanguageId();
    const oldOptions = this.getCreationOptions(oldLanguageId, model.uri, model.isForSimpleWidget);
    const newOptions = this.getCreationOptions(newLanguageId, model.uri, model.isForSimpleWidget);
    ModelService._setModelOptionsForModel(model, newOptions, oldOptions);
    this._onModelModeChanged.fire({ model, oldLanguageId });
  }
  _getSHA1Computer() {
    return new DefaultModelSHA1Computer();
  }
};

ModelService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITextResourcePropertiesService),
  __decorateParam(2, IUndoRedoService),
  __decorateParam(3, IInstantiationService)
], ModelService);

var DefaultModelSHA1Computer = class _DefaultModelSHA1Computer {
  static {
    this.MAX_MODEL_SIZE = 10 * 1024 * 1024;
  }
  // takes 200ms to compute a sha1 on a 10MB model on a new machine
  canComputeSHA1(model) {
    return model.getValueLength() <= _DefaultModelSHA1Computer.MAX_MODEL_SIZE;
  }
  computeSHA1(model) {
    const shaComputer = new StringSHA1();
    const snapshot = model.createSnapshot();
    let text2;
    while (text2 = snapshot.read()) {
      shaComputer.update(text2);
    }
    return shaComputer.digest();
  }
};
export { MODEL_ID2, ModelData2, DEFAULT_EOL, DisposedModelInfo, ModelService, DefaultModelSHA1Computer };
