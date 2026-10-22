// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { derivedObservableWithWritableCache, mapObservableArrayCached } from "./module-0059.mjs";
import { observableFromValueWithChangeEvent } from "./module-0063.mjs";
import { RefCounted } from "./module-0478.mjs";
import { ObservablePromise, ObservableResolvedPromise } from "./module-0055.mjs";
import { waitForState } from "./module-0056.mjs";
import { transaction } from "./module-0045.mjs";
import { observableValue } from "./module-0048.mjs";
import { constObservable } from "./module-0061.mjs";
import { DiffEditorOptions } from "./module-0500.mjs";
import { DiffEditorViewModel } from "./module-0483.mjs";
import { rejectIfNotCanceled, timeout } from "./module-0036.mjs";
import { cancelOnDispose } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.ts
var MultiDiffEditorViewModel = class extends Disposable {
  constructor(model, _instantiationService) {
    super();
    this.model = model;
    this._instantiationService = _instantiationService;
    this._documentsArr = derived(this, (reader) => {
      const result = this._documents.read(reader);
      if (result === "loading") {
        return [];
      }
      return result;
    });
    this.focusedDiffItem = derived(this, (reader) => this.items.read(reader).find((i2) => i2.isFocused.read(reader)));
    this.activeDiffItem = derivedObservableWithWritableCache(
      this,
      (reader, lastValue) => this.focusedDiffItem.read(reader) ?? (lastValue && this.items.read(reader).indexOf(lastValue) !== -1) ? lastValue : void 0
    );
    this._documents = observableFromValueWithChangeEvent(this.model, this.model.documents);
    const allItems = mapObservableArrayCached(
      this,
      this._documentsArr,
      (d, store) => store.add(RefCounted.create(this._instantiationService.createInstance(DocumentDiffItemViewModel, d, this)))
    ).recomputeInitiallyAndOnChange(this._store);
    this._waitForNewDiffs = derived(this, (reader) => {
      const next = allItems.read(reader);
      const unresolved = next.filter((i2) => !i2.object.waitForInitialDiffOr1s.promiseResult.read(void 0));
      if (unresolved.length === 0) {
        return ObservablePromise.resolved(next);
      }
      return new ObservablePromise(
        Promise.all(unresolved.map((i2) => i2.object.waitForInitialDiffOr1s.promise)).then(() => next)
      );
    });
    const resolved = new ObservableResolvedPromise(this._waitForNewDiffs, [], this._store);
    this.items = derived(this, (reader) => {
      const resolvedItems = resolved.lastResolved.read(reader);
      return resolvedItems.map((i2) => {
        const ref = reader.store.add(i2.createNewRef(i2));
        return ref.object;
      });
    });
    this.isLoading = derived(
      this,
      (reader) => this._documents.read(reader) === "loading" || resolved.isResolving.read(reader)
    );
  }
  async waitForDiffOr1s() {
    if (this._documents.get() === "loading") {
      await waitForState(this._documents, (documents) => documents !== "loading");
    }
    await this._waitForNewDiffs.get().promise;
  }
  collapseAll() {
    transaction((tx) => {
      for (const d of this.items.get()) {
        d.collapsed.set(true, tx);
      }
    });
  }
  expandAll() {
    transaction((tx) => {
      for (const d of this.items.get()) {
        d.collapsed.set(false, tx);
      }
    });
  }
  collapse(item) {
    transaction((tx) => {
      item.collapsed.set(true, tx);
    });
  }
  expand(item) {
    transaction((tx) => {
      item.collapsed.set(false, tx);
    });
  }
  get contextKeys() {
    return this.model.contextKeys;
  }
};

var DocumentDiffItemViewModel = class extends Disposable {
  constructor(documentDiffItem, _editorViewModel, _instantiationService, _modelService) {
    super();
    this._editorViewModel = _editorViewModel;
    this._instantiationService = _instantiationService;
    this._modelService = _modelService;
    this.collapsed = observableValue(this, false);
    this.lastTemplateData = observableValue(
      this,
      { expandedContentHeight: 500, selections: void 0 }
    );
    this.isActive = derived(this, (reader) => this._editorViewModel.activeDiffItem.read(reader) === this);
    this._isFocusedSource = observableValue(this, constObservable(false));
    this.isFocused = derived(this, (reader) => this._isFocusedSource.read(reader).read(reader));
    this.isAlive = observableValue(this, true);
    this._register(toDisposable(() => {
      this.isAlive.set(false, void 0);
    }));
    this._documentDiffItemRef = this._register(documentDiffItem.createNewRef(this));
    function updateOptions(options4) {
      return {
        ...options4,
        hideUnchangedRegions: {
          enabled: true
        }
      };
    }
    const options3 = this._instantiationService.createInstance(DiffEditorOptions, updateOptions(this.documentDiffItem.options || {}));
    if (this.documentDiffItem.onOptionsDidChange) {
      this._register(this.documentDiffItem.onOptionsDidChange(() => {
        options3.updateOptions(updateOptions(this.documentDiffItem.options || {}));
      }));
    }
    const diffEditorViewModelStore = new DisposableStore();
    const originalTextModel = this.documentDiffItem.original ?? diffEditorViewModelStore.add(this._modelService.createModel("", null));
    const modifiedTextModel = this.documentDiffItem.modified ?? diffEditorViewModelStore.add(this._modelService.createModel("", null));
    diffEditorViewModelStore.add(this._documentDiffItemRef.createNewRef(this));
    this.diffEditorViewModelRef = this._register(RefCounted.createWithDisposable(
      this._instantiationService.createInstance(DiffEditorViewModel, {
        original: originalTextModel,
        modified: modifiedTextModel
      }, options3),
      diffEditorViewModelStore,
      this
    ));
    this.waitForInitialDiffOr1s = new ObservablePromise(
      Promise.race([
        this.diffEditorViewModel.waitForDiff().catch(rejectIfNotCanceled),
        timeout(1e3, cancelOnDispose(this._store)).catch(rejectIfNotCanceled)
      ])
    );
  }
  get diffEditorViewModel() {
    return this.diffEditorViewModelRef.object;
  }
  get originalUri() {
    return this.documentDiffItem.original?.uri;
  }
  get modifiedUri() {
    return this.documentDiffItem.modified?.uri;
  }
  setIsFocused(source, tx) {
    this._isFocusedSource.set(source, tx);
  }
  get documentDiffItem() {
    return this._documentDiffItemRef.object;
  }
  getKey() {
    return JSON.stringify([
      this.originalUri?.toString(),
      this.modifiedUri?.toString()
    ]);
  }
};

DocumentDiffItemViewModel = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IModelService)
], DocumentDiffItemViewModel);
export { MultiDiffEditorViewModel, DocumentDiffItemViewModel };
