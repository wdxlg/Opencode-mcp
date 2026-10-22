// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/common/cacheState.ts
import { defaultGenerator } from "./module-0463.mjs";
import { equals4 } from "./module-0098.mjs";


// src/vs/workbench/contrib/search/common/cacheState.ts
var FileQueryCacheState = class {
  constructor(cacheQuery, loadFn, disposeFn, previousCacheState) {
    this.cacheQuery = cacheQuery;
    this.loadFn = loadFn;
    this.disposeFn = disposeFn;
    this.previousCacheState = previousCacheState;
    this._cacheKey = defaultGenerator.nextId();
    this.query = this.cacheQuery(this._cacheKey);
    this.loadingPhase = 1 /* Created */;
    if (this.previousCacheState) {
      const current = Object.assign({}, this.query, { cacheKey: null });
      const previous = Object.assign({}, this.previousCacheState.query, { cacheKey: null });
      if (!equals4(current, previous)) {
        this.previousCacheState.dispose();
        this.previousCacheState = void 0;
      }
    }
  }
  get cacheKey() {
    if (this.loadingPhase === 3 /* Loaded */ || !this.previousCacheState) {
      return this._cacheKey;
    }
    return this.previousCacheState.cacheKey;
  }
  get isLoaded() {
    const isLoaded = this.loadingPhase === 3 /* Loaded */;
    return isLoaded || !this.previousCacheState ? isLoaded : this.previousCacheState.isLoaded;
  }
  get isUpdating() {
    const isUpdating = this.loadingPhase === 2 /* Loading */;
    return isUpdating || !this.previousCacheState ? isUpdating : this.previousCacheState.isUpdating;
  }
  load() {
    if (this.isUpdating) {
      return this;
    }
    this.loadingPhase = 2 /* Loading */;
    this.loadPromise = (async () => {
      try {
        await this.loadFn(this.query);
        this.loadingPhase = 3 /* Loaded */;
        if (this.previousCacheState) {
          this.previousCacheState.dispose();
          this.previousCacheState = void 0;
        }
      } catch (error) {
        this.loadingPhase = 4 /* Errored */;
        throw error;
      }
    })();
    return this;
  }
  dispose() {
    if (this.loadPromise) {
      (async () => {
        try {
          await this.loadPromise;
        } catch (error) {
        }
        this.loadingPhase = 5 /* Disposed */;
        this.disposeFn(this._cacheKey);
      })();
    } else {
      this.loadingPhase = 5 /* Disposed */;
    }
    if (this.previousCacheState) {
      this.previousCacheState.dispose();
      this.previousCacheState = void 0;
    }
  }
};
export { FileQueryCacheState };
