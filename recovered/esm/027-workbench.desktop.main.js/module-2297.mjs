// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatOutputPartStateCache.ts
import { createDecorator } from "./module-0077.mjs";
import { LRUCache } from "./module-0008.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatOutputPartStateCache.ts
var IChatOutputPartStateCache = createDecorator("IChatOutputPartStateCache");

var CACHE_STORAGE_KEY = "chat/outputPartStateCache";

var LEGACY_CACHE_STORAGE_KEY = "chat/toolOutputStateCache";

var CACHE_LIMIT = 100;

var ChatOutputPartStateCache = class {
  constructor(storageService) {
    this._cache = new LRUCache(CACHE_LIMIT, 0.75);
    const raw = storageService.get(CACHE_STORAGE_KEY, 1 /* WORKSPACE */, storageService.get(LEGACY_CACHE_STORAGE_KEY, 1 /* WORKSPACE */, "{}"));
    this._deserialize(raw);
    const onWillSaveStateBecauseOfShutdown = Event2.filter(storageService.onWillSaveState, (e) => e.reason === 1 /* SHUTDOWN */);
    Event2.once(onWillSaveStateBecauseOfShutdown)(() => {
      storageService.store(CACHE_STORAGE_KEY, this._serialize(), 1 /* WORKSPACE */, 1 /* MACHINE */);
    });
  }
  get(key3) {
    return this._cache.get(key3);
  }
  set(key3, state) {
    this._cache.set(key3, state);
  }
  _serialize() {
    const data = /* @__PURE__ */ Object.create(null);
    for (const [key3, value2] of this._cache) {
      data[key3] = value2;
    }
    return JSON.stringify(data);
  }
  _deserialize(raw) {
    try {
      const data = JSON.parse(raw);
      for (const key3 in data) {
        const state = data[key3];
        if (typeof state.height === "number") {
          this._cache.set(key3, { height: state.height, webviewState: typeof state.webviewState === "string" ? state.webviewState : void 0 });
        }
      }
    } catch {
    }
  }
};

ChatOutputPartStateCache = __decorateClass([
  __decorateParam(0, IStorageService)
], ChatOutputPartStateCache);

registerSingleton(IChatOutputPartStateCache, ChatOutputPartStateCache, 1 /* Delayed */);
export { IChatOutputPartStateCache, CACHE_STORAGE_KEY, LEGACY_CACHE_STORAGE_KEY, CACHE_LIMIT, ChatOutputPartStateCache };
