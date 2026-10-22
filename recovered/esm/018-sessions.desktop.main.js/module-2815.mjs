// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/common/searchHistoryService.ts
import { createDecorator } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { isEmptyObject } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/search/common/searchHistoryService.ts
var ISearchHistoryService = createDecorator("searchHistoryService");

var SearchHistoryService = class {
  constructor(storageService) {
    this.storageService = storageService;
    this._onDidClearHistory = new Emitter();
    this.onDidClearHistory = this._onDidClearHistory.event;
  }
  static {
    this.SEARCH_HISTORY_KEY = "workbench.search.history";
  }
  clearHistory() {
    this.storageService.remove(SearchHistoryService.SEARCH_HISTORY_KEY, 1 /* WORKSPACE */);
    this._onDidClearHistory.fire();
  }
  load() {
    let result;
    const raw = this.storageService.get(SearchHistoryService.SEARCH_HISTORY_KEY, 1 /* WORKSPACE */);
    if (raw) {
      try {
        result = JSON.parse(raw);
      } catch (e4) {
      }
    }
    return result || {};
  }
  save(history) {
    if (isEmptyObject(history)) {
      this.storageService.remove(SearchHistoryService.SEARCH_HISTORY_KEY, 1 /* WORKSPACE */);
    } else {
      this.storageService.store(SearchHistoryService.SEARCH_HISTORY_KEY, JSON.stringify(history), 1 /* WORKSPACE */, 0 /* USER */);
    }
  }
};

SearchHistoryService = __decorateClass([
  __decorateParam(0, IStorageService)
], SearchHistoryService);
export { ISearchHistoryService, SearchHistoryService };
