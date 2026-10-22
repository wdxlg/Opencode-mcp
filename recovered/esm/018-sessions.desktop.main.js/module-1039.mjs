// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadEmbeddings.ts
import { createDecorator } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";


// src/vs/workbench/api/browser/mainThreadEmbeddings.ts
var IEmbeddingsService = createDecorator("embeddingsService");

var EmbeddingsService = class {
  constructor() {
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this.providers = /* @__PURE__ */ new Map();
  }
  get allProviders() {
    return this.providers.keys();
  }
  registerProvider(id2, provider) {
    this.providers.set(id2, provider);
    this._onDidChange.fire();
    return {
      dispose: () => {
        this.providers.delete(id2);
        this._onDidChange.fire();
      }
    };
  }
  computeEmbeddings(id2, input, token) {
    const provider = this.providers.get(id2);
    if (provider) {
      return provider.provideEmbeddings(input, token);
    } else {
      return Promise.reject(new Error(`No embeddings provider registered with id: ${id2}`));
    }
  }
};

registerSingleton(IEmbeddingsService, EmbeddingsService, 1 /* Delayed */);

var MainThreadEmbeddings = class {
  constructor(context2, embeddingsService) {
    this.embeddingsService = embeddingsService;
    this._store = new DisposableStore();
    this._providers = this._store.add(new DisposableMap());
    this._proxy = context2.getProxy(ExtHostContext.ExtHostEmbeddings);
    this._store.add(embeddingsService.onDidChange((() => {
      this._proxy.$acceptEmbeddingModels(Array.from(embeddingsService.allProviders));
    })));
  }
  dispose() {
    this._store.dispose();
  }
  $registerEmbeddingProvider(handle2, identifier2) {
    const registration = this.embeddingsService.registerProvider(identifier2, {
      provideEmbeddings: (input, token) => {
        return this._proxy.$provideEmbeddings(handle2, input, token);
      }
    });
    this._providers.set(handle2, registration);
  }
  $unregisterEmbeddingProvider(handle2) {
    this._providers.deleteAndDispose(handle2);
  }
  $computeEmbeddings(embeddingsModel, input, token) {
    return this.embeddingsService.computeEmbeddings(embeddingsModel, input, token);
  }
};

MainThreadEmbeddings = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadEmbeddings),
  __decorateParam(1, IEmbeddingsService)
], MainThreadEmbeddings);
export { IEmbeddingsService, EmbeddingsService, MainThreadEmbeddings };
