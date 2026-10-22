// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/find/browser/replaceWidgetHistory.ts
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/editor/contrib/find/browser/replaceWidgetHistory.ts
var ReplaceWidgetHistory = class {
  constructor(storageService) {
    this.storageService = storageService;
    this.inMemoryValues = /* @__PURE__ */ new Set();
    this._onDidChangeEmitter = new Emitter();
    this.onDidChange = this._onDidChangeEmitter.event;
    this.load();
  }
  static {
    this.FIND_HISTORY_KEY = "workbench.replace.history";
  }
  static {
    this._instance = null;
  }
  static getOrCreate(storageService) {
    if (!ReplaceWidgetHistory._instance) {
      ReplaceWidgetHistory._instance = new ReplaceWidgetHistory(storageService);
    }
    return ReplaceWidgetHistory._instance;
  }
  delete(t2) {
    const result = this.inMemoryValues.delete(t2);
    this.save();
    return result;
  }
  add(t2) {
    this.inMemoryValues.add(t2);
    this.save();
    return this;
  }
  has(t2) {
    return this.inMemoryValues.has(t2);
  }
  clear() {
    this.inMemoryValues.clear();
    this.save();
  }
  forEach(callbackfn, thisArg) {
    this.load();
    return this.inMemoryValues.forEach(callbackfn);
  }
  replace(t2) {
    this.inMemoryValues = new Set(t2);
    this.save();
  }
  load() {
    let result;
    const raw = this.storageService.get(
      ReplaceWidgetHistory.FIND_HISTORY_KEY,
      1 /* WORKSPACE */
    );
    if (raw) {
      try {
        result = JSON.parse(raw);
      } catch (e4) {
      }
    }
    this.inMemoryValues = new Set(result || []);
  }
  // Run saves async
  save() {
    const elements = [];
    this.inMemoryValues.forEach((e4) => elements.push(e4));
    return new Promise((resolve3) => {
      this.storageService.store(
        ReplaceWidgetHistory.FIND_HISTORY_KEY,
        JSON.stringify(elements),
        1 /* WORKSPACE */,
        0 /* USER */
      );
      this._onDidChangeEmitter.fire(elements);
      resolve3();
    });
  }
};

ReplaceWidgetHistory = __decorateClass([
  __decorateParam(0, IStorageService)
], ReplaceWidgetHistory);
export { ReplaceWidgetHistory };
