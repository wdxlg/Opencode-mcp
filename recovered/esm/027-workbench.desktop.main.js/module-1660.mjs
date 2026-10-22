// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/aiSettingsSearch/common/aiSettingsSearchService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DeferredPromise, raceCancellation } from "./module-0036.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAiSettingsSearchService } from "./module-1209.mjs";


// src/vs/workbench/services/aiSettingsSearch/common/aiSettingsSearchService.ts
var AiSettingsSearchService = class _AiSettingsSearchService extends Disposable {
  constructor() {
    super(...arguments);
    this._providers = [];
    this._llmRankedResultsPromises = /* @__PURE__ */ new Map();
    this._embeddingsResultsPromises = /* @__PURE__ */ new Map();
    this._onProviderRegistered = this._register(new Emitter());
    this.onProviderRegistered = this._onProviderRegistered.event;
  }
  static {
    this.MAX_PICKS = 5;
  }
  isEnabled() {
    return this._providers.length > 0;
  }
  registerSettingsSearchProvider(provider) {
    this._providers.push(provider);
    this._onProviderRegistered.fire();
    return {
      dispose: () => {
        const index2 = this._providers.indexOf(provider);
        if (index2 !== -1) {
          this._providers.splice(index2, 1);
        }
      }
    };
  }
  startSearch(query, token) {
    if (!this.isEnabled()) {
      throw new Error("No settings search providers registered");
    }
    this._embeddingsResultsPromises.delete(query);
    this._llmRankedResultsPromises.delete(query);
    this._providers.forEach((provider) => provider.searchSettings(query, { limit: _AiSettingsSearchService.MAX_PICKS, embeddingsOnly: false }, token));
  }
  async getEmbeddingsResults(query, token) {
    if (!this.isEnabled()) {
      throw new Error("No settings search providers registered");
    }
    const existingPromise = this._embeddingsResultsPromises.get(query);
    if (existingPromise) {
      const result2 = await existingPromise.p;
      return result2 ?? null;
    }
    const promise = new DeferredPromise();
    this._embeddingsResultsPromises.set(query, promise);
    const result = await raceCancellation(promise.p, token);
    return result ?? null;
  }
  async getLLMRankedResults(query, token) {
    if (!this.isEnabled()) {
      throw new Error("No settings search providers registered");
    }
    const existingPromise = this._llmRankedResultsPromises.get(query);
    if (existingPromise) {
      const result2 = await existingPromise.p;
      return result2 ?? null;
    }
    const promise = new DeferredPromise();
    this._llmRankedResultsPromises.set(query, promise);
    const result = await raceCancellation(promise.p, token);
    return result ?? null;
  }
  handleSearchResult(result) {
    if (!this.isEnabled()) {
      return;
    }
    if (result.kind === 1 /* EMBEDDED */) {
      const promise = this._embeddingsResultsPromises.get(result.query);
      if (promise) {
        promise.complete(result.settings);
      } else {
        const parkedPromise = new DeferredPromise();
        parkedPromise.complete(result.settings);
        this._embeddingsResultsPromises.set(result.query, parkedPromise);
      }
    } else if (result.kind === 2 /* LLM_RANKED */) {
      const promise = this._llmRankedResultsPromises.get(result.query);
      if (promise) {
        promise.complete(result.settings);
      } else {
        const parkedPromise = new DeferredPromise();
        parkedPromise.complete(result.settings);
        this._llmRankedResultsPromises.set(result.query, parkedPromise);
      }
    }
  }
};

registerSingleton(IAiSettingsSearchService, AiSettingsSearchService, 1 /* Delayed */);
export { AiSettingsSearchService };
