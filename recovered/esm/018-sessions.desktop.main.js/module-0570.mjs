// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/codelens/browser/codeLensCache.ts
import { createDecorator } from "./module-0077.mjs";
import { LRUCache } from "./module-0008.mjs";
import { runWhenWindowIdle } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { Event2 } from "./module-0017.mjs";
import { CodeLensModel } from "./module-0569.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/editor/contrib/codelens/browser/codeLensCache.ts
var ICodeLensCache = createDecorator("ICodeLensCache");

var CacheItem = class {
  constructor(lineCount, data) {
    this.lineCount = lineCount;
    this.data = data;
  }
};

var CodeLensCache = class {
  constructor(storageService) {
    this._fakeProvider = new class {
      provideCodeLenses() {
        throw new Error("not supported");
      }
    }();
    this._cache = new LRUCache(20, 0.75);
    const oldkey = "codelens/cache";
    runWhenWindowIdle(mainWindow, () => storageService.remove(oldkey, 1 /* WORKSPACE */));
    const key3 = "codelens/cache2";
    const raw = storageService.get(key3, 1 /* WORKSPACE */, "{}");
    this._deserialize(raw);
    const onWillSaveStateBecauseOfShutdown = Event2.filter(storageService.onWillSaveState, (e4) => e4.reason === 1 /* SHUTDOWN */);
    Event2.once(onWillSaveStateBecauseOfShutdown)((e4) => {
      storageService.store(key3, this._serialize(), 1 /* WORKSPACE */, 1 /* MACHINE */);
    });
  }
  put(model, data) {
    const copyItems = data.lenses.map((item2) => {
      return {
        range: item2.symbol.range,
        command: item2.symbol.command && { id: "", title: item2.symbol.command?.title }
      };
    });
    const copyModel = new CodeLensModel();
    copyModel.add({ lenses: copyItems }, this._fakeProvider);
    const item = new CacheItem(model.getLineCount(), copyModel);
    this._cache.set(model.uri.toString(), item);
  }
  get(model) {
    const item = this._cache.get(model.uri.toString());
    return item && item.lineCount === model.getLineCount() ? item.data : void 0;
  }
  delete(model) {
    this._cache.delete(model.uri.toString());
  }
  // --- persistence
  _serialize() {
    const data = /* @__PURE__ */ Object.create(null);
    for (const [key3, value2] of this._cache) {
      const lines = /* @__PURE__ */ new Set();
      for (const d of value2.data.lenses) {
        lines.add(d.symbol.range.startLineNumber);
      }
      data[key3] = {
        lineCount: value2.lineCount,
        lines: [...lines.values()]
      };
    }
    return JSON.stringify(data);
  }
  _deserialize(raw) {
    try {
      const data = JSON.parse(raw);
      for (const key3 in data) {
        const element = data[key3];
        const lenses = [];
        for (const line of element.lines) {
          lenses.push({ range: new Range2(line, 1, line, 11) });
        }
        const model = new CodeLensModel();
        model.add({ lenses }, this._fakeProvider);
        this._cache.set(key3, new CacheItem(element.lineCount, model));
      }
    } catch {
    }
  }
};

CodeLensCache = __decorateClass([
  __decorateParam(0, IStorageService)
], CodeLensCache);

registerSingleton(ICodeLensCache, CodeLensCache, 1 /* Delayed */);
export { ICodeLensCache, CacheItem, CodeLensCache };
