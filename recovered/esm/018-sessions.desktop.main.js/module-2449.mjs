// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl.ts
import { Disposable } from "./module-0012.mjs";
import { LinkedMap } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INotebookKernelHistoryService, INotebookKernelService } from "./module-1387.mjs";
import { INotebookLoggingService } from "./module-1394.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";


// src/vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl.ts
var MAX_KERNELS_IN_HISTORY = 5;

var NotebookKernelHistoryService = class extends Disposable {
  constructor(_storageService, _notebookKernelService, _notebookLoggingService) {
    super();
    this._storageService = _storageService;
    this._notebookKernelService = _notebookKernelService;
    this._notebookLoggingService = _notebookLoggingService;
    this._mostRecentKernelsMap = {};
    this._loadState();
    this._register(this._storageService.onWillSaveState(() => this._saveState()));
    this._register(this._storageService.onDidChangeValue(1 /* WORKSPACE */, NotebookKernelHistoryService.STORAGE_KEY, this._store)(() => {
      this._loadState();
    }));
  }
  static {
    this.STORAGE_KEY = "notebook.kernelHistory";
  }
  getKernels(notebook) {
    const allAvailableKernels = this._notebookKernelService.getMatchingKernel(notebook);
    const allKernels = allAvailableKernels.all;
    const selectedKernel = allAvailableKernels.selected;
    const suggested = allAvailableKernels.all.length === 1 ? allAvailableKernels.all[0] : void 0;
    this._notebookLoggingService.debug("History", `getMatchingKernels: ${allAvailableKernels.all.length} kernels available for ${notebook.uri.path}. Selected: ${allAvailableKernels.selected?.label}. Suggested: ${suggested?.label}`);
    const mostRecentKernelIds = this._mostRecentKernelsMap[notebook.notebookType] ? [...this._mostRecentKernelsMap[notebook.notebookType].values()] : [];
    const all = mostRecentKernelIds.map((kernelId) => allKernels.find((kernel) => kernel.id === kernelId)).filter((kernel) => !!kernel);
    this._notebookLoggingService.debug("History", `mru: ${mostRecentKernelIds.length} kernels in history, ${all.length} registered already.`);
    return {
      selected: selectedKernel ?? suggested,
      all
    };
  }
  addMostRecentKernel(kernel) {
    const key3 = kernel.id;
    const viewType = kernel.viewType;
    const recentKeynels = this._mostRecentKernelsMap[viewType] ?? new LinkedMap();
    recentKeynels.set(key3, key3, 1 /* AsOld */);
    if (recentKeynels.size > MAX_KERNELS_IN_HISTORY) {
      const reserved = [...recentKeynels.entries()].slice(0, MAX_KERNELS_IN_HISTORY);
      recentKeynels.fromJSON(reserved);
    }
    this._mostRecentKernelsMap[viewType] = recentKeynels;
  }
  _saveState() {
    let notEmpty = false;
    for (const [_, kernels] of Object.entries(this._mostRecentKernelsMap)) {
      notEmpty = notEmpty || kernels.size > 0;
    }
    if (notEmpty) {
      const serialized = this._serialize();
      this._storageService.store(NotebookKernelHistoryService.STORAGE_KEY, JSON.stringify(serialized), 1 /* WORKSPACE */, 0 /* USER */);
    } else {
      this._storageService.remove(NotebookKernelHistoryService.STORAGE_KEY, 1 /* WORKSPACE */);
    }
  }
  _loadState() {
    const serialized = this._storageService.get(NotebookKernelHistoryService.STORAGE_KEY, 1 /* WORKSPACE */);
    if (serialized) {
      try {
        this._deserialize(JSON.parse(serialized));
      } catch (e4) {
        this._mostRecentKernelsMap = {};
      }
    } else {
      this._mostRecentKernelsMap = {};
    }
  }
  _serialize() {
    const result = /* @__PURE__ */ Object.create(null);
    for (const [viewType, kernels] of Object.entries(this._mostRecentKernelsMap)) {
      result[viewType] = {
        entries: [...kernels.values()]
      };
    }
    return result;
  }
  _deserialize(serialized) {
    this._mostRecentKernelsMap = {};
    for (const [viewType, kernels] of Object.entries(serialized)) {
      const linkedMap = new LinkedMap();
      const mapValues2 = [];
      for (const entry of kernels.entries) {
        mapValues2.push([entry, entry]);
      }
      linkedMap.fromJSON(mapValues2);
      this._mostRecentKernelsMap[viewType] = linkedMap;
    }
  }
  _clear() {
    this._mostRecentKernelsMap = {};
    this._saveState();
  }
};

NotebookKernelHistoryService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, INotebookKernelService),
  __decorateParam(2, INotebookLoggingService)
], NotebookKernelHistoryService);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.clearNotebookKernelsMRUCache",
      title: localize2(17861, "Clear Notebook Kernels MRU Cache"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const historyService = accessor.get(INotebookKernelHistoryService);
    historyService._clear();
  }
});
export { MAX_KERNELS_IN_HISTORY, NotebookKernelHistoryService };
