// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorInput.ts
import { EditorInput } from "./module-0928.mjs";
import { LazyStatefulPromise, raceTimeout } from "./module-0036.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { BugIndicatingError, CancellationError, onUnexpectedError } from "./module-0004.mjs";
import { MultiDiffEditorViewModel } from "./module-1145.mjs";
import { ObservableLazyPromise } from "./module-0055.mjs";
import { Event2, ValueWithChangeEvent } from "./module-0017.mjs";
import { ValueWithChangeEventFromObservable, observableFromValueWithChangeEvent } from "./module-0063.mjs";
import { constObservable } from "./module-0061.mjs";
import { derived } from "./module-0054.mjs";
import { mapObservableArrayCached, recomputeInitiallyAndOnChange } from "./module-0059.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from "./module-1147.mjs";
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0925.mjs";
import { MultiDiffEditorIcon } from "./module-1146.mjs";
import { RefCounted } from "./module-0478.mjs";
import { observableValue } from "./module-0048.mjs";
import { isDefined, isObject } from "./module-0010.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { deepClone } from "./module-0098.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { parse2 } from "./module-0265.mjs";


// src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorInput.ts
var MultiDiffEditorInput = class extends EditorInput {
  constructor(multiDiffSource, label3, initialResources, isTransient = false, _textModelService, _textResourceConfigurationService, _instantiationService, _multiDiffSourceResolverService, _textFileService) {
    super();
    this.multiDiffSource = multiDiffSource;
    this.label = label3;
    this.initialResources = initialResources;
    this.isTransient = isTransient;
    this._textModelService = _textModelService;
    this._textResourceConfigurationService = _textResourceConfigurationService;
    this._instantiationService = _instantiationService;
    this._multiDiffSourceResolverService = _multiDiffSourceResolverService;
    this._textFileService = _textFileService;
    this._name = "";
    this._viewModel = new LazyStatefulPromise(async () => {
      const store = new DisposableStore();
      try {
        const model = store.add(await this._createModel());
        if (this._store.isDisposed) {
          throw new CancellationError();
        }
        const vm = store.add(new MultiDiffEditorViewModel(model, this._instantiationService));
        await raceTimeout(vm.waitForDiffOr1s(), 1e3);
        if (this._store.isDisposed) {
          throw new CancellationError();
        }
        this._register(store);
        return vm;
      } catch (error) {
        store.dispose();
        throw error;
      }
    });
    this._resolvedSource = new ObservableLazyPromise(async () => {
      const source = this.initialResources ? { resources: ValueWithChangeEvent.const(this.initialResources) } : await this._multiDiffSourceResolverService.resolve(this.multiDiffSource);
      return {
        source,
        resources: source ? observableFromValueWithChangeEvent(this, source.resources) : constObservable([]),
        label: source?.label ? observableFromValueWithChangeEvent(this, source.label) : void 0
      };
    });
    this.resources = derived(this, (reader) => this._resolvedSource.cachedPromiseResult.read(reader)?.data?.resources.read(reader));
    this.textFileServiceOnDidChange = new FastEventDispatcher(
      this._textFileService.files.onDidChangeDirty,
      (item) => item.resource.toString(),
      (uri5) => uri5.toString()
    );
    this._isDirtyObservables = mapObservableArrayCached(this, this.resources.map((r2) => r2 ?? []), (res) => {
      const isModifiedDirty = res.modifiedUri ? isUriDirty(this.textFileServiceOnDidChange, this._textFileService, res.modifiedUri) : constObservable(false);
      const isOriginalDirty = res.originalUri ? isUriDirty(this.textFileServiceOnDidChange, this._textFileService, res.originalUri) : constObservable(false);
      return derived((reader) => (
        /** @description modifiedDirty||originalDirty */
        isModifiedDirty.read(reader) || isOriginalDirty.read(reader)
      ));
    }, (i2) => i2.getKey());
    this._isDirtyObservable = derived(this, (reader) => this._isDirtyObservables.read(reader).some((isDirty) => isDirty.read(reader))).keepObserved(this._store);
    this.onDidChangeDirty = Event2.fromObservableLight(this._isDirtyObservable);
    this.closeHandler = {
      // This is a workaround for not having a better way
      // to figure out if the editors this input wraps
      // around are opened or not
      async confirm() {
        return 1 /* DONT_SAVE */;
      },
      showConfirm() {
        return false;
      }
    };
    this._register(autorun((reader) => {
      const resources = this.resources.read(reader);
      const resolvedSource = this._resolvedSource.cachedPromiseResult.read(reader)?.data;
      const label4 = resolvedSource?.label?.read(reader) ?? this.label ?? localize(17378, null);
      if (resources && resources.length === 1) {
        this._name = localize(17380, null, label4);
      } else if (resources) {
        this._name = localize(17379, null, label4, resources.length);
      } else {
        this._name = label4;
      }
      this._onDidChangeLabel.fire();
    }));
  }
  static fromResourceMultiDiffEditorInput(input, instantiationService) {
    if (!input.multiDiffSource && !input.resources) {
      throw new BugIndicatingError("MultiDiffEditorInput requires either multiDiffSource or resources");
    }
    const multiDiffSource = input.multiDiffSource ?? URI.parse(`multi-diff-editor:${(/* @__PURE__ */ new Date()).getMilliseconds().toString() + Math.random().toString()}`);
    return instantiationService.createInstance(
      MultiDiffEditorInput,
      multiDiffSource,
      input.label,
      input.resources?.map((resource) => {
        return new MultiDiffEditorItem(
          resource.original.resource,
          resource.modified.resource,
          resource.goToFileResource
        );
      }),
      input.isTransient ?? false
    );
  }
  static fromSerialized(data, instantiationService) {
    return instantiationService.createInstance(
      MultiDiffEditorInput,
      URI.parse(data.multiDiffSourceUri),
      data.label,
      data.resources?.map((resource) => new MultiDiffEditorItem(
        resource.originalUri ? URI.parse(resource.originalUri) : void 0,
        resource.modifiedUri ? URI.parse(resource.modifiedUri) : void 0,
        resource.goToFileUri ? URI.parse(resource.goToFileUri) : void 0
      )),
      false
    );
  }
  static {
    this.ID = "workbench.input.multiDiffEditor";
  }
  get resource() {
    return this.multiDiffSource;
  }
  get capabilities() {
    return 2 /* Readonly */;
  }
  get typeId() {
    return MultiDiffEditorInput.ID;
  }
  getName() {
    return this._name;
  }
  get editorId() {
    return DEFAULT_EDITOR_ASSOCIATION.id;
  }
  getIcon() {
    return MultiDiffEditorIcon;
  }
  serialize() {
    return {
      label: this.label,
      multiDiffSourceUri: this.multiDiffSource.toString(),
      resources: this.initialResources?.map((resource) => ({
        originalUri: resource.originalUri?.toString(),
        modifiedUri: resource.modifiedUri?.toString(),
        goToFileUri: resource.goToFileUri?.toString()
      }))
    };
  }
  setLanguageId(languageId, source) {
    const activeDiffItem = this._viewModel.requireValue().activeDiffItem.get();
    const value2 = activeDiffItem?.documentDiffItem;
    if (!value2) {
      return;
    }
    const target = value2.modified ?? value2.original;
    if (!target) {
      return;
    }
    target.setLanguage(languageId, source);
  }
  async getViewModel() {
    return this._viewModel.getPromise();
  }
  async _createModel() {
    const source = await this._resolvedSource.getPromise();
    const textResourceConfigurationService = this._textResourceConfigurationService;
    const documentsWithPromises = mapObservableArrayCached(this, source.resources, async (r2, store) => {
      let original;
      let modified;
      const multiDiffItemStore = new DisposableStore();
      const createModelReference = async (resource) => resource ? this._textModelService.createModelReference(resource) : void 0;
      const [originalResult, modifiedResult] = await Promise.allSettled([
        createModelReference(r2.originalUri),
        createModelReference(r2.modifiedUri)
      ]);
      if (originalResult.status === "fulfilled") {
        original = originalResult.value;
        if (original) {
          multiDiffItemStore.add(original);
        }
      }
      if (modifiedResult.status === "fulfilled") {
        modified = modifiedResult.value;
        if (modified) {
          multiDiffItemStore.add(modified);
        }
      }
      if (store.isDisposed) {
        multiDiffItemStore.dispose();
        return void 0;
      }
      let errorResult3;
      if (originalResult.status === "rejected") {
        errorResult3 = originalResult;
      } else if (modifiedResult.status === "rejected") {
        errorResult3 = modifiedResult;
      }
      if (errorResult3) {
        multiDiffItemStore.dispose();
        console.error(errorResult3.reason);
        onUnexpectedError(errorResult3.reason);
        return void 0;
      }
      const uri5 = r2.modifiedUri ?? r2.originalUri;
      const result2 = {
        multiDiffEditorItem: r2,
        original: original?.object.textEditorModel,
        modified: modified?.object.textEditorModel,
        contextKeys: r2.contextKeys,
        get options() {
          return {
            ...getReadonlyConfiguration(modified?.object.isReadonly() ?? true),
            ...computeOptions(textResourceConfigurationService.getValue(uri5))
          };
        },
        onOptionsDidChange: (h3) => this._textResourceConfigurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(uri5, "editor") || e.affectsConfiguration(uri5, "diffEditor")) {
            h3();
          }
        })
      };
      return store.add(RefCounted.createOfNonDisposable(result2, multiDiffItemStore, this));
    }, (i2) => JSON.stringify([i2.modifiedUri?.toString(), i2.originalUri?.toString()]));
    const documents = observableValue("documents", "loading");
    const updateDocuments = derived(async (reader) => {
      const docsPromises = documentsWithPromises.read(reader);
      const docs = await Promise.all(docsPromises);
      const newDocuments = docs.filter(isDefined);
      documents.set(newDocuments, void 0);
    });
    const a = recomputeInitiallyAndOnChange(updateDocuments);
    await updateDocuments.get();
    const result = {
      dispose: () => a.dispose(),
      documents: new ValueWithChangeEventFromObservable(documents),
      contextKeys: source.source?.contextKeys
    };
    return result;
  }
  matches(otherInput) {
    if (super.matches(otherInput)) {
      return true;
    }
    if (otherInput instanceof MultiDiffEditorInput) {
      return this.multiDiffSource.toString() === otherInput.multiDiffSource.toString();
    }
    return false;
  }
  isDirty() {
    return this._isDirtyObservable.get();
  }
  async save(group2, options3) {
    await this.doSaveOrRevert("save", group2, options3);
    return this;
  }
  revert(group2, options3) {
    return this.doSaveOrRevert("revert", group2, options3);
  }
  async doSaveOrRevert(mode, group2, options3) {
    const items = this._viewModel.currentValue?.items.get();
    if (items) {
      await Promise.all(items.map(async (item) => {
        const model = item.diffEditorViewModel.model;
        const handleOriginal = model.original.uri.scheme !== Schemas.untitled && this._textFileService.isDirty(model.original.uri);
        await Promise.all([
          handleOriginal ? mode === "save" ? this._textFileService.save(model.original.uri, options3) : this._textFileService.revert(model.original.uri, options3) : Promise.resolve(),
          mode === "save" ? this._textFileService.save(model.modified.uri, options3) : this._textFileService.revert(model.modified.uri, options3)
        ]);
      }));
    }
    return void 0;
  }
};

MultiDiffEditorInput = __decorateClass([
  __decorateParam(4, ITextModelService),
  __decorateParam(5, ITextResourceConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IMultiDiffSourceResolverService),
  __decorateParam(8, ITextFileService)
], MultiDiffEditorInput);

var FastEventDispatcher = class {
  constructor(_event, _getEventArgsKey, _keyToString) {
    this._event = _event;
    this._getEventArgsKey = _getEventArgsKey;
    this._keyToString = _keyToString;
    this._count = 0;
    this._buckets = /* @__PURE__ */ new Map();
    this._handleEventChange = (e) => {
      const key3 = this._getEventArgsKey(e);
      const bucket = this._buckets.get(key3);
      if (bucket) {
        for (const listener of bucket) {
          listener(e);
        }
      }
    };
  }
  filteredEvent(filter2) {
    return (listener) => {
      const key3 = this._keyToString(filter2);
      let bucket = this._buckets.get(key3);
      if (!bucket) {
        bucket = /* @__PURE__ */ new Set();
        this._buckets.set(key3, bucket);
      }
      bucket.add(listener);
      this._count++;
      if (this._count === 1) {
        this._eventSubscription = this._event(this._handleEventChange);
      }
      return {
        dispose: () => {
          bucket.delete(listener);
          if (bucket.size === 0) {
            this._buckets.delete(key3);
          }
          this._count--;
          if (this._count === 0) {
            this._eventSubscription?.dispose();
            this._eventSubscription = void 0;
          }
        }
      };
    };
  }
};

function isUriDirty(onDidChangeDirty, textFileService, uri5) {
  return observableFromEvent(onDidChangeDirty.filteredEvent(uri5), () => textFileService.isDirty(uri5));
}

function getReadonlyConfiguration(isReadonly) {
  return {
    readOnly: !!isReadonly,
    readOnlyMessage: typeof isReadonly !== "boolean" ? isReadonly : void 0
  };
}

function computeOptions(configuration2) {
  const editorConfiguration4 = deepClone(configuration2.editor);
  if (isObject(configuration2.diffEditor)) {
    const diffEditorConfiguration = deepClone(configuration2.diffEditor);
    diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
    delete diffEditorConfiguration.codeLens;
    diffEditorConfiguration.diffWordWrap = diffEditorConfiguration.wordWrap;
    delete diffEditorConfiguration.wordWrap;
    Object.assign(editorConfiguration4, diffEditorConfiguration);
  }
  return editorConfiguration4;
}

var MultiDiffEditorResolverContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.multiDiffEditorResolver";
  }
  constructor(editorResolverService, instantiationService) {
    super();
    this._register(editorResolverService.registerEditor(
      `*`,
      {
        id: DEFAULT_EDITOR_ASSOCIATION.id,
        label: DEFAULT_EDITOR_ASSOCIATION.displayName,
        detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
        priority: "builtin" /* builtin */
      },
      {},
      {
        createMultiDiffEditorInput: (multiDiffEditor) => {
          return {
            editor: MultiDiffEditorInput.fromResourceMultiDiffEditorInput(multiDiffEditor, instantiationService)
          };
        }
      }
    ));
  }
};

MultiDiffEditorResolverContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService)
], MultiDiffEditorResolverContribution);

var MultiDiffEditorSerializer = class {
  canSerialize(editor) {
    return editor instanceof MultiDiffEditorInput && !editor.isTransient;
  }
  serialize(editor) {
    if (!this.canSerialize(editor)) {
      return void 0;
    }
    return JSON.stringify(editor.serialize());
  }
  deserialize(instantiationService, serializedEditor) {
    try {
      const data = parse2(serializedEditor);
      return MultiDiffEditorInput.fromSerialized(data, instantiationService);
    } catch (err) {
      onUnexpectedError(err);
      return void 0;
    }
  }
};
export { isUriDirty, getReadonlyConfiguration, computeOptions, MultiDiffEditorInput, FastEventDispatcher, MultiDiffEditorResolverContribution, MultiDiffEditorSerializer };
