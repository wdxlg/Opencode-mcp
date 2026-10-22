// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/searchEditor/browser/searchEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";
import { Emitter } from "./module-0017.mjs";
import { SearchEditorModel, searchEditorModelFactory } from "./module-2842.mjs";
import { SearchEditorFindMatchClass, SearchEditorInputTypeId, SearchEditorScheme, SearchEditorWorkingCopyTypeId } from "./module-2833.mjs";
import { Memento } from "./module-1041.mjs";
import { defaultSearchConfig, parseSavedSearchEditor, serializeSearchConfiguration } from "./module-2841.mjs";
import { extname2, isEqual2, joinPath } from "./module-0034.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { basename } from "./module-0026.mjs";
import { VSBuffer, bufferToReadable } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IPathService } from "./module-0938.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/searchEditor/browser/searchEditorInput.ts
var SEARCH_EDITOR_EXT = ".code-search";

var SearchEditorIcon = registerIcon("search-editor-label-icon", Codicon.search, localize(19299, null));

var SearchEditorInput = class extends EditorInput {
  constructor(modelUri, backingUri, modelService, textFileService, fileDialogService, instantiationService, workingCopyService, telemetryService, pathService, storageService) {
    super();
    this.modelUri = modelUri;
    this.backingUri = backingUri;
    this.modelService = modelService;
    this.textFileService = textFileService;
    this.fileDialogService = fileDialogService;
    this.instantiationService = instantiationService;
    this.workingCopyService = workingCopyService;
    this.telemetryService = telemetryService;
    this.pathService = pathService;
    this.dirty = false;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this.oldDecorationsIDs = [];
    this.model = instantiationService.createInstance(SearchEditorModel, modelUri);
    if (this.modelUri.scheme !== SearchEditorScheme) {
      throw Error("SearchEditorInput must be invoked with a SearchEditorScheme uri");
    }
    this.memento = new Memento(SearchEditorInput.ID, storageService);
    this._register(storageService.onWillSaveState(() => this.memento.saveMemento()));
    const input = this;
    const workingCopyAdapter = new class {
      constructor() {
        this.typeId = SearchEditorWorkingCopyTypeId;
        this.resource = input.modelUri;
        this.capabilities = input.hasCapability(4 /* Untitled */) ? 2 /* Untitled */ : 0 /* None */;
        this.onDidChangeDirty = input.onDidChangeDirty;
        this.onDidChangeContent = input.onDidChangeContent;
        this.onDidSave = input.onDidSave;
      }
      get name() {
        return input.getName();
      }
      isDirty() {
        return input.isDirty();
      }
      isModified() {
        return input.isDirty();
      }
      backup(token) {
        return input.backup(token);
      }
      save(options3) {
        return input.save(0, options3).then((editor) => !!editor);
      }
      revert(options3) {
        return input.revert(0, options3);
      }
    }();
    this._register(this.workingCopyService.registerWorkingCopy(workingCopyAdapter));
  }
  static {
    this.ID = SearchEditorInputTypeId;
  }
  get typeId() {
    return SearchEditorInput.ID;
  }
  get editorId() {
    return this.typeId;
  }
  getIcon() {
    return SearchEditorIcon;
  }
  get capabilities() {
    let capabilities = 0 /* None */;
    if (!this.backingUri) {
      capabilities |= 4 /* Untitled */;
    }
    return capabilities;
  }
  get resource() {
    return this.backingUri || this.modelUri;
  }
  async save(group2, options3) {
    if ((await this.resolveModels()).resultsModel.isDisposed()) {
      return;
    }
    if (this.backingUri) {
      await this.textFileService.write(this.backingUri, await this.serializeForDisk(), options3);
      this.setDirty(false);
      this._onDidSave.fire({ reason: options3?.reason, source: options3?.source });
      return this;
    } else {
      return this.saveAs(group2, options3);
    }
  }
  tryReadConfigSync() {
    return this._cachedConfigurationModel?.config;
  }
  async serializeForDisk() {
    const { configurationModel, resultsModel } = await this.resolveModels();
    return serializeSearchConfiguration(configurationModel.config) + "\n" + resultsModel.getValue();
  }
  registerConfigChangeListeners(model) {
    this.configChangeListenerDisposable?.dispose();
    if (!this.isDisposed()) {
      this.configChangeListenerDisposable = model.onConfigDidUpdate(() => {
        if (this.lastLabel !== this.getName()) {
          this._onDidChangeLabel.fire();
          this.lastLabel = this.getName();
        }
        this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */).searchConfig = model.config;
      });
      this._register(this.configChangeListenerDisposable);
    }
  }
  async resolveModels() {
    return this.model.resolve().then((data) => {
      this._cachedResultsModel = data.resultsModel;
      this._cachedConfigurationModel = data.configurationModel;
      if (this.lastLabel !== this.getName()) {
        this._onDidChangeLabel.fire();
        this.lastLabel = this.getName();
      }
      this.registerConfigChangeListeners(data.configurationModel);
      return data;
    });
  }
  async saveAs(group2, options3) {
    const path = await this.fileDialogService.pickFileToSave(await this.suggestFileName(), options3?.availableFileSystems);
    if (path) {
      this.telemetryService.publicLog2("searchEditor/saveSearchResults");
      const toWrite = await this.serializeForDisk();
      if (await this.textFileService.create([{ resource: path, value: toWrite, options: { overwrite: true } }])) {
        this.setDirty(false);
        if (!isEqual2(path, this.modelUri)) {
          const input = this.instantiationService.invokeFunction(getOrMakeSearchEditorInput, { fileUri: path, from: "existingFile" });
          input.setMatchRanges(this.getMatchRanges());
          return input;
        }
        return this;
      }
    }
    return void 0;
  }
  getName(maxLength = 12) {
    const trimToMax = (label3) => label3.length < maxLength ? label3 : `${label3.slice(0, maxLength - 3)}...`;
    if (this.backingUri) {
      const originalURI = EditorResourceAccessor.getOriginalUri(this);
      return localize(19301, null, basename((originalURI ?? this.backingUri).path, SEARCH_EDITOR_EXT));
    }
    const query = this._cachedConfigurationModel?.config?.query?.trim();
    if (query) {
      return localize(19301, null, trimToMax(query));
    }
    return localize(19300, null);
  }
  setDirty(dirty) {
    const wasDirty = this.dirty;
    this.dirty = dirty;
    if (wasDirty !== dirty) {
      this._onDidChangeDirty.fire();
    }
  }
  isDirty() {
    return this.dirty;
  }
  async rename(group2, target) {
    if (extname2(target) === SEARCH_EDITOR_EXT) {
      return {
        editor: this.instantiationService.invokeFunction(getOrMakeSearchEditorInput, { from: "existingFile", fileUri: target })
      };
    }
    return void 0;
  }
  dispose() {
    this.modelService.destroyModel(this.modelUri);
    super.dispose();
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    if (other instanceof SearchEditorInput) {
      return !!(other.modelUri.fragment && other.modelUri.fragment === this.modelUri.fragment) || !!(other.backingUri && isEqual2(other.backingUri, this.backingUri));
    }
    return false;
  }
  getMatchRanges() {
    return (this._cachedResultsModel?.getAllDecorations() ?? []).filter((decoration3) => decoration3.options.className === SearchEditorFindMatchClass).filter(({ range: range2 }) => !(range2.startColumn === 1 && range2.endColumn === 1)).map(({ range: range2 }) => range2);
  }
  async setMatchRanges(ranges) {
    this.oldDecorationsIDs = (await this.resolveModels()).resultsModel.deltaDecorations(this.oldDecorationsIDs, ranges.map((range2) => ({ range: range2, options: { description: "search-editor-find-match", className: SearchEditorFindMatchClass, stickiness: 1 /* NeverGrowsWhenTypingAtEdges */ } })));
  }
  async revert(group2, options3) {
    if (options3?.soft) {
      this.setDirty(false);
      return;
    }
    if (this.backingUri) {
      const { config, text: text2 } = await this.instantiationService.invokeFunction(parseSavedSearchEditor, this.backingUri);
      const { resultsModel, configurationModel } = await this.resolveModels();
      resultsModel.setValue(text2);
      configurationModel.updateConfig(config);
    } else {
      (await this.resolveModels()).resultsModel.setValue("");
    }
    super.revert(group2, options3);
    this.setDirty(false);
  }
  async backup(token) {
    const contents = await this.serializeForDisk();
    if (token.isCancellationRequested) {
      return {};
    }
    return {
      content: bufferToReadable(VSBuffer.fromString(contents))
    };
  }
  async suggestFileName() {
    const query = (await this.resolveModels()).configurationModel.config.query;
    const searchFileName = (query.replace(/[^\w \-_]+/g, "_") || "Search") + SEARCH_EDITOR_EXT;
    return joinPath(await this.fileDialogService.defaultFilePath(this.pathService.defaultUriScheme), searchFileName);
  }
  toUntyped() {
    if (this.hasCapability(4 /* Untitled */)) {
      return void 0;
    }
    return {
      resource: this.resource,
      options: {
        override: SearchEditorInput.ID
      }
    };
  }
  copy() {
    const newModelUri = URI.from({ scheme: SearchEditorScheme, fragment: `${Math.random()}` });
    const config = this._cachedConfigurationModel?.config ?? {};
    const results = this._cachedResultsModel?.getValue() ?? "";
    return this.instantiationService.invokeFunction(
      getOrMakeSearchEditorInput,
      // eslint-disable-next-line local/code-no-any-casts
      { from: "rawData", config, resultsContents: results, modelUri: newModelUri }
      // modelUri is not in the type, but we handle it below
    );
  }
};

SearchEditorInput = __decorateClass([
  __decorateParam(2, IModelService),
  __decorateParam(3, ITextFileService),
  __decorateParam(4, IFileDialogService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IWorkingCopyService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IPathService),
  __decorateParam(9, IStorageService)
], SearchEditorInput);

var getOrMakeSearchEditorInput = (accessor, existingData) => {
  const storageService = accessor.get(IStorageService);
  const configurationService = accessor.get(IConfigurationService);
  const instantiationService = accessor.get(IInstantiationService);
  let modelUri;
  if (existingData.from === "model") {
    modelUri = existingData.modelUri;
  } else if (existingData.from === "rawData" && existingData.modelUri) {
    modelUri = existingData.modelUri;
  } else {
    modelUri = URI.from({ scheme: SearchEditorScheme, fragment: `${Math.random()}` });
  }
  if (!searchEditorModelFactory.models.has(modelUri)) {
    if (existingData.from === "existingFile") {
      instantiationService.invokeFunction((accessor2) => searchEditorModelFactory.initializeModelFromExistingFile(accessor2, modelUri, existingData.fileUri));
    } else {
      const searchEditorSettings = configurationService.getValue("search").searchEditor;
      const reuseOldSettings = searchEditorSettings.reusePriorSearchConfiguration;
      const defaultNumberOfContextLines = searchEditorSettings.defaultNumberOfContextLines;
      const priorConfig = reuseOldSettings ? new Memento(SearchEditorInput.ID, storageService).getMemento(1 /* WORKSPACE */, 1 /* MACHINE */).searchConfig ?? {} : {};
      const defaultConfig2 = defaultSearchConfig();
      const config = { ...defaultConfig2, ...priorConfig, ...existingData.config };
      if (defaultNumberOfContextLines !== null && defaultNumberOfContextLines !== void 0) {
        config.contextLines = existingData?.config?.contextLines ?? defaultNumberOfContextLines;
      }
      if (existingData.from === "rawData") {
        if (existingData.resultsContents) {
          config.contextLines = 0;
        }
        instantiationService.invokeFunction((accessor2) => searchEditorModelFactory.initializeModelFromRawData(accessor2, modelUri, config, existingData.resultsContents));
      } else {
        instantiationService.invokeFunction((accessor2) => searchEditorModelFactory.initializeModelFromExistingModel(accessor2, modelUri, config));
      }
    }
  }
  return instantiationService.createInstance(
    SearchEditorInput,
    modelUri,
    existingData.from === "existingFile" ? existingData.fileUri : existingData.from === "model" ? existingData.backupOf : void 0
  );
};
export { SEARCH_EDITOR_EXT, SearchEditorIcon, SearchEditorInput, getOrMakeSearchEditorInput };
