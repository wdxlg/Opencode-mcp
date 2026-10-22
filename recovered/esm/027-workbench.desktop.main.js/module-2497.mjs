// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatModelStore.ts
import { Disposable, ReferenceCollection } from "./module-0012.mjs";
import { ObservableMap } from "./module-0067.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/common/model/chatModelStore.ts
var ChatModelStore = class extends Disposable {
  constructor(delegate, logService) {
    super();
    this.delegate = delegate;
    this.logService = logService;
    this._models = new ObservableMap();
    this._modelsToDispose = /* @__PURE__ */ new Set();
    this._pendingDisposals = /* @__PURE__ */ new Set();
    this._modelCreateOwners = /* @__PURE__ */ new Map();
    this._referenceOwners = /* @__PURE__ */ new Map();
    this._referenceOwnerIds = 0;
    this._onDidDisposeModel = this._register(new Emitter());
    this.onDidDisposeModel = this._onDidDisposeModel.event;
    this._onDidCreateModel = this._register(new Emitter());
    this.onDidCreateModel = this._onDidCreateModel.event;
    const self2 = this;
    this._refCollection = new class extends ReferenceCollection {
      createReferencedObject(key3, props, debugOwner) {
        return self2.createReferencedObject(key3, props, debugOwner);
      }
      destroyReferencedObject(key3, object2) {
        return self2.destroyReferencedObject(key3, object2);
      }
    }();
  }
  get observable() {
    return this._models.observable;
  }
  values() {
    return this._models.values();
  }
  /**
   * Get a ChatModel directly without acquiring a reference.
   */
  get(uri5) {
    return this._models.get(this.toKey(uri5));
  }
  has(uri5) {
    return this._models.has(this.toKey(uri5));
  }
  acquireExisting(uri5, debugOwner) {
    const key3 = this.toKey(uri5);
    if (!this._models.has(key3)) {
      return void 0;
    }
    return this.wrapReference(key3, this._refCollection.acquire(key3, void 0, debugOwner), debugOwner);
  }
  acquireOrCreate(props, debugOwner) {
    const key3 = this.toKey(props.sessionResource);
    return this.wrapReference(key3, this._refCollection.acquire(key3, props, debugOwner), debugOwner);
  }
  getReferenceDebugSnapshot() {
    const models = Array.from(this._models.values()).map((model) => {
      const key3 = this.toKey(model.sessionResource);
      const owners = this._referenceOwners.get(key3) ?? /* @__PURE__ */ new Map();
      const countsByOwner = /* @__PURE__ */ new Map();
      for (const owner of owners.values()) {
        countsByOwner.set(owner, (countsByOwner.get(owner) ?? 0) + 1);
      }
      const holders = Array.from(countsByOwner.entries()).map(([holder, count2]) => ({ holder, count: count2 })).sort((a, b) => b.count - a.count || a.holder.localeCompare(b.holder));
      return {
        sessionResource: model.sessionResource,
        title: model.title,
        createdBy: this._modelCreateOwners.get(key3) ?? "unknown",
        initialLocation: model.initialLocation,
        isImported: !!model.isImported,
        willKeepAlive: model.willKeepAlive,
        hasPendingEdits: !!model.editingSession?.entries.get().some((entry) => entry.state.get() === 0 /* Modified */),
        pendingDisposal: this._modelsToDispose.has(key3),
        referenceCount: owners.size,
        holders
      };
    }).sort((a, b) => b.referenceCount - a.referenceCount || Number(b.hasPendingEdits) - Number(a.hasPendingEdits) || a.sessionResource.toString().localeCompare(b.sessionResource.toString()));
    return {
      totalModels: models.length,
      totalReferences: models.reduce((total, model) => total + model.referenceCount, 0),
      models
    };
  }
  createReferencedObject(key3, props, debugOwner) {
    this._modelsToDispose.delete(key3);
    const existingModel = this._models.get(key3);
    if (existingModel) {
      return existingModel;
    }
    if (!props) {
      throw new Error(`No start session props provided for chat session ${key3}`);
    }
    this.logService.trace(`Creating chat session ${key3}`);
    const model = this.delegate.createModel(props);
    this._modelCreateOwners.set(key3, debugOwner ?? "unspecified");
    if (model.sessionResource.toString() !== key3) {
      throw new Error(`Chat session key mismatch for ${key3}`);
    }
    this._models.set(key3, model);
    this._onDidCreateModel.fire(model);
    return model;
  }
  destroyReferencedObject(key3, object2) {
    this._modelsToDispose.add(key3);
    const promise = this.doDestroyReferencedObject(key3, object2);
    this._pendingDisposals.add(promise);
    promise.finally(() => {
      this._pendingDisposals.delete(promise);
    });
  }
  async doDestroyReferencedObject(key3, object2) {
    try {
      await this.delegate.willDisposeModel(object2);
    } catch (error) {
      this.logService.error(error);
    } finally {
      if (this._modelsToDispose.has(key3)) {
        this.logService.trace(`Disposing chat session ${key3}`);
        this._models.delete(key3);
        this._modelCreateOwners.delete(key3);
        this._referenceOwners.delete(key3);
        this._onDidDisposeModel.fire(object2);
        object2.dispose();
      }
      this._modelsToDispose.delete(key3);
    }
  }
  wrapReference(key3, reference, debugOwner) {
    const ownerId2 = ++this._referenceOwnerIds;
    let ownerEntries = this._referenceOwners.get(key3);
    if (!ownerEntries) {
      ownerEntries = /* @__PURE__ */ new Map();
      this._referenceOwners.set(key3, ownerEntries);
    }
    ownerEntries.set(ownerId2, debugOwner ?? "unspecified");
    let isDisposed = false;
    const wrapped = {
      object: reference.object,
      dispose: () => {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        const owners = this._referenceOwners.get(key3);
        owners?.delete(ownerId2);
        if (owners?.size === 0) {
          this._referenceOwners.delete(key3);
        }
        reference.dispose();
        wrapped.object = null;
      }
    };
    return wrapped;
  }
  /**
   * For test use only
   */
  async waitForModelDisposals() {
    await Promise.all(this._pendingDisposals);
  }
  toKey(uri5) {
    return uri5.toString();
  }
  dispose() {
    super.dispose();
    this._models.forEach((model) => model.dispose());
  }
};

ChatModelStore = __decorateClass([
  __decorateParam(1, ILogService)
], ChatModelStore);
export { ChatModelStore };
