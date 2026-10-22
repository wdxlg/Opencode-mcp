// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/quickDiffModel.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableMap, DisposableStore, ReferenceCollection } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextFileService, isTextFileEditorModel } from "./module-1064.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { Iterable } from "./module-0011.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { equals, sortedDiff } from "./module-0007.mjs";
import { IQuickDiffService, compareChanges, getModifiedEndLineNumber } from "./module-1080.mjs";
import { toLineChanges } from "./module-0527.mjs";
import { DiffState } from "./module-0483.mjs";
import { shouldSynchronizeModel } from "./module-0117.mjs";
import { ISCMService } from "./module-1081.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IChatEditingService } from "./module-1082.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";


// src/vs/workbench/contrib/scm/browser/quickDiffModel.ts
var IQuickDiffModelService = createDecorator("IQuickDiffModelService");

var decoratorQuickDiffModelOptions = {
  algorithm: "advanced",
  maxComputationTimeMs: 1e3
};

var QuickDiffModelReferenceCollection = class extends ReferenceCollection {
  constructor(_instantiationService) {
    super();
    this._instantiationService = _instantiationService;
  }
  createReferencedObject(_key, textFileModel, options3) {
    return this._instantiationService.createInstance(QuickDiffModel, textFileModel, options3);
  }
  destroyReferencedObject(_key, object2) {
    object2.dispose();
  }
};

QuickDiffModelReferenceCollection = __decorateClass([
  __decorateParam(0, IInstantiationService)
], QuickDiffModelReferenceCollection);

var QuickDiffModelService = class {
  constructor(instantiationService, textFileService, uriIdentityService) {
    this.instantiationService = instantiationService;
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this._references = this.instantiationService.createInstance(QuickDiffModelReferenceCollection);
  }
  createQuickDiffModelReference(resource, options3 = decoratorQuickDiffModelOptions) {
    const textFileModel = this.textFileService.files.get(resource);
    if (!textFileModel?.isResolved()) {
      return void 0;
    }
    resource = this.uriIdentityService.asCanonicalUri(resource).with({ query: JSON.stringify(options3) });
    return this._references.acquire(resource.toString(), textFileModel, options3);
  }
};

QuickDiffModelService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IUriIdentityService)
], QuickDiffModelService);

var QuickDiffModel = class extends Disposable {
  constructor(textFileModel, options3, scmService, quickDiffService, editorWorkerService, configurationService, textModelResolverService, _chatEditingService, progressService, environmentService) {
    super();
    this.options = options3;
    this.scmService = scmService;
    this.quickDiffService = quickDiffService;
    this.editorWorkerService = editorWorkerService;
    this.configurationService = configurationService;
    this.textModelResolverService = textModelResolverService;
    this._chatEditingService = _chatEditingService;
    this.progressService = progressService;
    this.environmentService = environmentService;
    this._originalEditorModels = new ResourceMap();
    this._originalEditorModelsDisposables = this._register(new DisposableStore());
    this._disposed = false;
    this._quickDiffs = [];
    this._diffDelayer = this._register(new ThrottledDelayer(200));
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._allChanges = [];
    this._changes = [];
    this._changesVersionId = 0;
    /**
     * Map of quick diff name to the index of the change in `this.changes`
     */
    this._quickDiffChanges = /* @__PURE__ */ new Map();
    this._repositoryDisposables = new DisposableMap();
    this._model = textFileModel;
    this._changesVersionId = textFileModel.textEditorModel.getVersionId();
    this._register(textFileModel.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
    this._register(
      Event2.filter(
        configurationService.onDidChangeConfiguration,
        (e4) => e4.affectsConfiguration("scm.diffDecorationsIgnoreTrimWhitespace") || e4.affectsConfiguration("diffEditor.ignoreTrimWhitespace")
      )(this.triggerDiff, this)
    );
    this._register(scmService.onDidAddRepository(this.onDidAddRepository, this));
    for (const r2 of scmService.repositories) {
      this.onDidAddRepository(r2);
    }
    this._register(this._model.onDidChangeEncoding(() => {
      this._diffDelayer.cancel();
      this._quickDiffs = [];
      this._originalEditorModels.clear();
      this._quickDiffsPromise = void 0;
      this.setChanges([], [], /* @__PURE__ */ new Map(), this._model.textEditorModel.getVersionId());
      this.triggerDiff();
    }));
    this._register(this.quickDiffService.onDidChangeQuickDiffProviders(() => this.triggerDiff()));
    this._register(autorun((reader) => {
      for (const session of this._chatEditingService.editingSessionsObs.read(reader)) {
        reader.store.add(autorun((r2) => {
          for (const entry of session.entries.read(r2)) {
            entry.state.read(r2);
          }
          this.triggerDiff();
        }));
      }
    }));
    this.triggerDiff();
  }
  get originalTextModels() {
    return Iterable.map(this._originalEditorModels.values(), (editorModel) => editorModel.textEditorModel);
  }
  get allChanges() {
    return this._allChanges;
  }
  get changes() {
    return this._changes;
  }
  /**
   * The version id of the modified text model that {@link changes} were
   * computed against. Matches {@link ITextModel.getVersionId}.
   */
  get changesVersionId() {
    return this._changesVersionId;
  }
  get quickDiffChanges() {
    return this._quickDiffChanges;
  }
  get quickDiffs() {
    return this._quickDiffs;
  }
  getQuickDiffResults() {
    return this._quickDiffs.map((quickDiff) => {
      const changes = this.allChanges.filter((change) => change.providerId === quickDiff.id);
      return {
        providerId: quickDiff.id,
        providerKind: quickDiff.kind,
        original: quickDiff.originalResource,
        modified: this._model.resource,
        changes: changes.map((change) => change.change),
        changes2: changes.map((change) => change.change2)
      };
    });
  }
  getDiffEditorModel(originalUri) {
    const editorModel = this._originalEditorModels.get(originalUri);
    return editorModel ? {
      modified: this._model.textEditorModel,
      original: editorModel.textEditorModel
    } : void 0;
  }
  onDidAddRepository(repository) {
    const disposables = new DisposableStore();
    disposables.add(repository.provider.onDidChangeResources(this.triggerDiff, this));
    const onDidRemoveRepository = Event2.filter(this.scmService.onDidRemoveRepository, (r2) => r2 === repository);
    disposables.add(onDidRemoveRepository(() => this._repositoryDisposables.deleteAndDispose(repository)));
    this._repositoryDisposables.set(repository, disposables);
    this.triggerDiff();
  }
  triggerDiff() {
    if (!this._diffDelayer) {
      return;
    }
    this._diffDelayer.trigger(async () => {
      const result = await this.diff();
      const editorModels = Array.from(this._originalEditorModels.values());
      if (!result || this._disposed || this._model.isDisposed() || editorModels.some((editorModel) => editorModel.isDisposed())) {
        return;
      }
      this.setChanges(result.allChanges, result.changes, result.mapChanges, result.versionId);
    }).catch((err) => onUnexpectedError(err));
  }
  setChanges(allChanges, changes, mapChanges, versionId) {
    const diff4 = sortedDiff(this.changes, changes, (a, b) => compareChanges(a.change, b.change));
    this._allChanges = allChanges;
    this._changes = changes;
    this._quickDiffChanges = mapChanges;
    this._changesVersionId = versionId;
    this._onDidChange.fire({ changes, diff: diff4 });
  }
  diff() {
    const location2 = this.environmentService.isSessionsWindow ? 10 /* Window */ : 3 /* Scm */;
    return this.progressService.withProgress({ location: location2, delay: 250 }, async () => {
      if (this._disposed || this._model.isDisposed()) {
        return null;
      }
      const versionId = this._model.textEditorModel.getVersionId();
      const originalURIs = await this.getQuickDiffsPromise();
      if (this._disposed || this._model.isDisposed() || originalURIs.length === 0) {
        return Promise.resolve({ allChanges: [], changes: [], mapChanges: /* @__PURE__ */ new Map(), versionId });
      }
      const quickDiffs = originalURIs.filter((quickDiff) => this.editorWorkerService.canComputeDirtyDiff(quickDiff.originalResource, this._model.resource));
      if (quickDiffs.length === 0) {
        return Promise.resolve({ allChanges: [], changes: [], mapChanges: /* @__PURE__ */ new Map(), versionId });
      }
      const quickDiffPrimary = quickDiffs.find((quickDiff) => quickDiff.kind === "primary");
      const ignoreTrimWhitespaceSetting = this.configurationService.getValue("scm.diffDecorationsIgnoreTrimWhitespace");
      const ignoreTrimWhitespace = ignoreTrimWhitespaceSetting === "inherit" ? this.configurationService.getValue("diffEditor.ignoreTrimWhitespace") : ignoreTrimWhitespaceSetting !== "false";
      const diffs = [];
      const secondaryDiffs = [];
      for (const quickDiff of quickDiffs) {
        const diff4 = await this._diff(quickDiff.originalResource, this._model.resource, ignoreTrimWhitespace);
        if (diff4.changes && diff4.changes2 && diff4.changes.length === diff4.changes2.length) {
          for (let index2 = 0; index2 < diff4.changes.length; index2++) {
            const change2 = diff4.changes2[index2];
            if (quickDiffPrimary && quickDiff.kind === "secondary") {
              const primaryQuickDiffChange = diffs.find((d) => d.change2.modified.equals(change2.modified) && d.change2.original.length === change2.original.length);
              if (primaryQuickDiffChange) {
                const primaryModel = this._originalEditorModels.get(quickDiffPrimary.originalResource)?.textEditorModel;
                const primaryContent = primaryModel?.getValueInRange(primaryQuickDiffChange.change2.toRangeMapping().originalRange);
                const secondaryModel = this._originalEditorModels.get(quickDiff.originalResource)?.textEditorModel;
                const secondaryContent = secondaryModel?.getValueInRange(change2.toRangeMapping().originalRange);
                if (primaryContent === secondaryContent) {
                  secondaryDiffs.push({
                    providerId: quickDiff.id,
                    original: quickDiff.originalResource,
                    modified: this._model.resource,
                    change: diff4.changes[index2],
                    change2: diff4.changes2[index2]
                  });
                  continue;
                }
              }
            }
            diffs.push({
              providerId: quickDiff.id,
              original: quickDiff.originalResource,
              modified: this._model.resource,
              change: diff4.changes[index2],
              change2: diff4.changes2[index2]
            });
          }
        }
      }
      const diffsSorted = diffs.sort((a, b) => compareChanges(a.change, b.change));
      const allDiffsSorted = [...diffs, ...secondaryDiffs].sort((a, b) => compareChanges(a.change, b.change));
      const map = /* @__PURE__ */ new Map();
      for (let i2 = 0; i2 < diffsSorted.length; i2++) {
        const providerId = diffsSorted[i2].providerId;
        if (!map.has(providerId)) {
          map.set(providerId, []);
        }
        map.get(providerId).push(i2);
      }
      return { allChanges: allDiffsSorted, changes: diffsSorted, mapChanges: map, versionId };
    });
  }
  async _diff(original, modified, ignoreTrimWhitespace) {
    const maxComputationTimeMs = this.options.maxComputationTimeMs ?? Number.MAX_SAFE_INTEGER;
    const result = await this.editorWorkerService.computeDiff(original, modified, {
      computeMoves: false,
      ignoreTrimWhitespace,
      maxComputationTimeMs
    }, this.options.algorithm);
    return { changes: result ? toLineChanges(DiffState.fromDiffResult(result)) : null, changes2: result?.changes ?? null };
  }
  getQuickDiffsPromise() {
    if (this._quickDiffsPromise) {
      return this._quickDiffsPromise;
    }
    this._quickDiffsPromise = this.getOriginalResource().then(async (quickDiffs) => {
      if (this._disposed) {
        return [];
      }
      if (quickDiffs.length === 0) {
        this._quickDiffs = [];
        this._originalEditorModels.clear();
        return [];
      }
      if (equals(this._quickDiffs, quickDiffs, (a, b) => a.id === b.id && a.originalResource.toString() === b.originalResource.toString() && this.quickDiffService.isQuickDiffProviderVisible(a.id) === this.quickDiffService.isQuickDiffProviderVisible(b.id))) {
        return quickDiffs;
      }
      this._quickDiffs = quickDiffs;
      this._originalEditorModels.clear();
      this._originalEditorModelsDisposables.clear();
      return (await Promise.all(quickDiffs.map(async (quickDiff) => {
        try {
          const ref = await this.textModelResolverService.createModelReference(quickDiff.originalResource);
          if (this._disposed) {
            ref.dispose();
            return [];
          }
          this._originalEditorModels.set(quickDiff.originalResource, ref.object);
          if (isTextFileEditorModel(ref.object) && !ref.object.isDirty()) {
            const encoding = this._model.getEncoding();
            if (encoding) {
              ref.object.setEncoding(encoding, 1 /* Decode */);
            }
          }
          this._originalEditorModelsDisposables.add(ref);
          this._originalEditorModelsDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
          return quickDiff;
        } catch (error) {
          return [];
        }
      }))).flat();
    });
    return this._quickDiffsPromise.finally(() => {
      this._quickDiffsPromise = void 0;
    });
  }
  async getOriginalResource() {
    if (this._disposed) {
      return Promise.resolve([]);
    }
    const uri4 = this._model.resource;
    const isBeingModifiedByChatEdits = this._chatEditingService.editingSessionsObs.get().some((session) => session.getEntry(uri4)?.state.get() === 0 /* Modified */);
    if (isBeingModifiedByChatEdits) {
      return Promise.resolve([]);
    }
    const isSynchronized = this._model.textEditorModel ? shouldSynchronizeModel(this._model.textEditorModel) : void 0;
    return this.quickDiffService.getQuickDiffs(uri4, this._model.getLanguageId(), isSynchronized);
  }
  findNextClosestChange(lineNumber, inclusive = true, providerId) {
    const visibleQuickDiffIds = new Set(this.quickDiffs.filter((quickDiff) => this.quickDiffService.isQuickDiffProviderVisible(quickDiff.id)).map((quickDiff) => quickDiff.id));
    for (let i2 = 0; i2 < this.changes.length; i2++) {
      if (providerId && this.changes[i2].providerId !== providerId) {
        continue;
      }
      if (!visibleQuickDiffIds.has(this.changes[i2].providerId)) {
        continue;
      }
      const change = this.changes[i2].change;
      if (inclusive) {
        if (getModifiedEndLineNumber(change) >= lineNumber) {
          return i2;
        }
      } else {
        if (change.modifiedStartLineNumber > lineNumber) {
          return i2;
        }
      }
    }
    return 0;
  }
  findPreviousClosestChange(lineNumber, inclusive = true, providerId) {
    const visibleQuickDiffIds = new Set(this.quickDiffs.filter((quickDiff) => this.quickDiffService.isQuickDiffProviderVisible(quickDiff.id)).map((quickDiff) => quickDiff.id));
    for (let i2 = this.changes.length - 1; i2 >= 0; i2--) {
      if (providerId && this.changes[i2].providerId !== providerId) {
        continue;
      }
      if (!visibleQuickDiffIds.has(this.changes[i2].providerId)) {
        continue;
      }
      const change = this.changes[i2].change;
      if (inclusive) {
        if (change.modifiedStartLineNumber <= lineNumber) {
          return i2;
        }
      } else {
        if (getModifiedEndLineNumber(change) < lineNumber) {
          return i2;
        }
      }
    }
    return this.changes.length - 1;
  }
  dispose() {
    this._disposed = true;
    this._quickDiffs = [];
    this._diffDelayer.cancel();
    this._originalEditorModels.clear();
    this._repositoryDisposables.dispose();
    super.dispose();
  }
};

QuickDiffModel = __decorateClass([
  __decorateParam(2, ISCMService),
  __decorateParam(3, IQuickDiffService),
  __decorateParam(4, IEditorWorkerService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IChatEditingService),
  __decorateParam(8, IProgressService),
  __decorateParam(9, IWorkbenchEnvironmentService)
], QuickDiffModel);
export { IQuickDiffModelService, decoratorQuickDiffModelOptions, QuickDiffModelReferenceCollection, QuickDiffModelService, QuickDiffModel };
