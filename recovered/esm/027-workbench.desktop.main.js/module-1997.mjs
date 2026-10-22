// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl.ts
import { LRUCache, ResourceMap } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Schemas } from "./module-0033.mjs";
import { getActiveWindow, runWhenWindowIdle } from "./module-0075.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl.ts
var KernelInfo = class _KernelInfo {
  constructor(kernel) {
    this.notebookPriorities = new ResourceMap();
    this.kernel = kernel;
    this.score = -1;
    this.time = _KernelInfo._logicClock++;
  }
  static {
    this._logicClock = 0;
  }
};

var NotebookTextModelLikeId = class {
  static str(k) {
    return `${k.notebookType}/${k.uri.toString()}`;
  }
  static obj(s) {
    const idx = s.indexOf("/");
    return {
      notebookType: s.substring(0, idx),
      uri: URI.parse(s.substring(idx + 1))
    };
  }
};

var SourceAction2 = class extends Disposable {
  constructor(action, model, isPrimary) {
    super();
    this.action = action;
    this.model = model;
    this.isPrimary = isPrimary;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
  }
  async runAction() {
    if (this.execution) {
      return this.execution;
    }
    this.execution = this._runAction();
    this._onDidChangeState.fire();
    await this.execution;
    this.execution = void 0;
    this._onDidChangeState.fire();
  }
  async _runAction() {
    try {
      await this.action.run({
        uri: this.model.uri,
        $mid: 14 /* NotebookActionContext */
      });
    } catch (error) {
      console.warn(`Kernel source command failed: ${error}`);
    }
  }
};

var NotebookKernelService = class extends Disposable {
  constructor(_notebookService, _storageService, _menuService, _contextKeyService) {
    super();
    this._notebookService = _notebookService;
    this._storageService = _storageService;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._kernels = /* @__PURE__ */ new Map();
    this._notebookBindings = new LRUCache(1e3, 0.7);
    this._onDidChangeNotebookKernelBinding = this._register(new Emitter());
    this._onDidAddKernel = this._register(new Emitter());
    this._onDidRemoveKernel = this._register(new Emitter());
    this._onDidChangeNotebookAffinity = this._register(new Emitter());
    this._onDidChangeSourceActions = this._register(new Emitter());
    this._onDidNotebookVariablesChange = this._register(new Emitter());
    this._kernelSources = /* @__PURE__ */ new Map();
    this._kernelSourceActionsUpdates = /* @__PURE__ */ new Map();
    this._kernelDetectionTasks = /* @__PURE__ */ new Map();
    this._onDidChangeKernelDetectionTasks = this._register(new Emitter());
    this._kernelSourceActionProviders = /* @__PURE__ */ new Map();
    this.onDidChangeSelectedNotebooks = this._onDidChangeNotebookKernelBinding.event;
    this.onDidAddKernel = this._onDidAddKernel.event;
    this.onDidRemoveKernel = this._onDidRemoveKernel.event;
    this.onDidChangeNotebookAffinity = this._onDidChangeNotebookAffinity.event;
    this.onDidChangeSourceActions = this._onDidChangeSourceActions.event;
    this.onDidChangeKernelDetectionTasks = this._onDidChangeKernelDetectionTasks.event;
    this.onDidNotebookVariablesUpdate = this._onDidNotebookVariablesChange.event;
    this._register(_notebookService.onDidAddNotebookDocument(this._tryAutoBindNotebook, this));
    this._register(_notebookService.onWillRemoveNotebookDocument((notebook) => {
      const id2 = NotebookTextModelLikeId.str(notebook);
      const kernelId = this._notebookBindings.get(id2);
      if (kernelId && notebook.uri.scheme === Schemas.untitled) {
        this.selectKernelForNotebook(void 0, notebook);
      }
      this._kernelSourceActionsUpdates.get(id2)?.dispose();
      this._kernelSourceActionsUpdates.delete(id2);
    }));
    try {
      const data = JSON.parse(this._storageService.get(NotebookKernelService._storageNotebookBinding, 1 /* WORKSPACE */, "[]"));
      this._notebookBindings.fromJSON(data);
    } catch {
    }
  }
  static {
    this._storageNotebookBinding = "notebook.controller2NotebookBindings";
  }
  dispose() {
    this._kernels.clear();
    this._kernelSources.forEach((v2) => {
      v2.menu.dispose();
      v2.actions.forEach((a) => a[1].dispose());
    });
    this._kernelSourceActionsUpdates.forEach((v2) => {
      v2.dispose();
    });
    this._kernelSourceActionsUpdates.clear();
    super.dispose();
  }
  _persistMementos() {
    this._persistSoonHandle?.dispose();
    this._persistSoonHandle = runWhenWindowIdle(getActiveWindow(), () => {
      this._storageService.store(NotebookKernelService._storageNotebookBinding, JSON.stringify(this._notebookBindings), 1 /* WORKSPACE */, 1 /* MACHINE */);
    }, 100);
  }
  static _score(kernel, notebook) {
    if (kernel.viewType === "*") {
      return 5;
    } else if (kernel.viewType === notebook.notebookType) {
      return 10;
    } else {
      return 0;
    }
  }
  _tryAutoBindNotebook(notebook, onlyThisKernel) {
    const id2 = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
    if (!id2) {
      return;
    }
    const existingKernel = this._kernels.get(id2);
    if (!existingKernel || !NotebookKernelService._score(existingKernel.kernel, notebook)) {
      return;
    }
    if (!onlyThisKernel || existingKernel.kernel === onlyThisKernel) {
      this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel: void 0, newKernel: existingKernel.kernel.id });
    }
  }
  notifyVariablesChange(notebookUri) {
    this._onDidNotebookVariablesChange.fire(notebookUri);
  }
  registerKernel(kernel) {
    if (this._kernels.has(kernel.id)) {
      throw new Error(`NOTEBOOK CONTROLLER with id '${kernel.id}' already exists`);
    }
    this._kernels.set(kernel.id, new KernelInfo(kernel));
    this._onDidAddKernel.fire(kernel);
    for (const notebook of this._notebookService.getNotebookTextModels()) {
      this._tryAutoBindNotebook(notebook, kernel);
    }
    return toDisposable(() => {
      if (this._kernels.delete(kernel.id)) {
        this._onDidRemoveKernel.fire(kernel);
      }
      for (const [key3, candidate] of Array.from(this._notebookBindings)) {
        if (candidate === kernel.id) {
          this._onDidChangeNotebookKernelBinding.fire({ notebook: NotebookTextModelLikeId.obj(key3).uri, oldKernel: kernel.id, newKernel: void 0 });
        }
      }
    });
  }
  getMatchingKernel(notebook) {
    const kernels = [];
    for (const info of this._kernels.values()) {
      const score3 = NotebookKernelService._score(info.kernel, notebook);
      if (score3) {
        kernels.push({
          score: score3,
          kernel: info.kernel,
          instanceAffinity: info.notebookPriorities.get(notebook.uri) ?? 1
        });
      }
    }
    kernels.sort((a, b) => b.instanceAffinity - a.instanceAffinity || a.score - b.score || a.kernel.label.localeCompare(b.kernel.label));
    const all = kernels.map((obj) => obj.kernel);
    const selectedId = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
    const selected = selectedId ? this._kernels.get(selectedId)?.kernel : void 0;
    const suggestions = kernels.filter((item) => item.instanceAffinity > 1).map((item) => item.kernel);
    const hidden = kernels.filter((item) => item.instanceAffinity < 0).map((item) => item.kernel);
    return { all, selected, suggestions, hidden };
  }
  getSelectedOrSuggestedKernel(notebook) {
    const info = this.getMatchingKernel(notebook);
    if (info.selected) {
      return info.selected;
    }
    const preferred = info.all.filter(
      (kernel) => this._kernels.get(kernel.id)?.notebookPriorities.get(notebook.uri) === 2
      /* vscode.NotebookControllerPriority.Preferred */
    );
    if (preferred.length === 1) {
      return preferred[0];
    }
    return info.all.length === 1 ? info.all[0] : void 0;
  }
  // a notebook has one kernel, a kernel has N notebooks
  // notebook <-1----N-> kernel
  selectKernelForNotebook(kernel, notebook) {
    const key3 = NotebookTextModelLikeId.str(notebook);
    const oldKernel = this._notebookBindings.get(key3);
    if (oldKernel !== kernel?.id) {
      if (kernel) {
        this._notebookBindings.set(key3, kernel.id);
      } else {
        this._notebookBindings.delete(key3);
      }
      this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel, newKernel: kernel?.id });
      this._persistMementos();
    }
  }
  preselectKernelForNotebook(kernel, notebook) {
    const key3 = NotebookTextModelLikeId.str(notebook);
    const oldKernel = this._notebookBindings.get(key3);
    if (oldKernel !== kernel?.id) {
      this._notebookBindings.set(key3, kernel.id);
      this._persistMementos();
    }
  }
  updateKernelNotebookAffinity(kernel, notebook, preference) {
    const info = this._kernels.get(kernel.id);
    if (!info) {
      throw new Error(`UNKNOWN kernel '${kernel.id}'`);
    }
    if (preference === void 0) {
      info.notebookPriorities.delete(notebook);
    } else {
      info.notebookPriorities.set(notebook, preference);
    }
    this._onDidChangeNotebookAffinity.fire();
  }
  getRunningSourceActions(notebook) {
    const id2 = NotebookTextModelLikeId.str(notebook);
    const existingInfo = this._kernelSources.get(id2);
    if (existingInfo) {
      return existingInfo.actions.filter((action) => action[0].execution).map((action) => action[0]);
    }
    return [];
  }
  getSourceActions(notebook, contextKeyService) {
    contextKeyService = contextKeyService ?? this._contextKeyService;
    const id2 = NotebookTextModelLikeId.str(notebook);
    const existingInfo = this._kernelSources.get(id2);
    if (existingInfo) {
      return existingInfo.actions.map((a) => a[0]);
    }
    const sourceMenu = this._register(this._menuService.createMenu(MenuId.NotebookKernelSource, contextKeyService));
    const info = { menu: sourceMenu, actions: [] };
    const loadActionsFromMenu = (menu, document2) => {
      const groups = menu.getActions({ shouldForwardArgs: true });
      const sourceActions = [];
      groups.forEach((group2) => {
        const isPrimary = /^primary/.test(group2[0]);
        group2[1].forEach((action) => {
          const sourceAction = new SourceAction2(action, document2, isPrimary);
          const stateChangeListener = sourceAction.onDidChangeState(() => {
            this._onDidChangeSourceActions.fire({
              notebook: document2.uri,
              viewType: document2.notebookType
            });
          });
          sourceActions.push([sourceAction, stateChangeListener]);
        });
      });
      info.actions = sourceActions;
      this._kernelSources.set(id2, info);
      this._onDidChangeSourceActions.fire({ notebook: document2.uri, viewType: document2.notebookType });
    };
    this._kernelSourceActionsUpdates.get(id2)?.dispose();
    this._kernelSourceActionsUpdates.set(id2, sourceMenu.onDidChange(() => {
      loadActionsFromMenu(sourceMenu, notebook);
    }));
    loadActionsFromMenu(sourceMenu, notebook);
    return info.actions.map((a) => a[0]);
  }
  registerNotebookKernelDetectionTask(task) {
    const notebookType = task.notebookType;
    const all = this._kernelDetectionTasks.get(notebookType) ?? [];
    all.push(task);
    this._kernelDetectionTasks.set(notebookType, all);
    this._onDidChangeKernelDetectionTasks.fire(notebookType);
    return toDisposable(() => {
      const all2 = this._kernelDetectionTasks.get(notebookType) ?? [];
      const idx = all2.indexOf(task);
      if (idx >= 0) {
        all2.splice(idx, 1);
        this._kernelDetectionTasks.set(notebookType, all2);
        this._onDidChangeKernelDetectionTasks.fire(notebookType);
      }
    });
  }
  getKernelDetectionTasks(notebook) {
    return this._kernelDetectionTasks.get(notebook.notebookType) ?? [];
  }
  registerKernelSourceActionProvider(viewType, provider) {
    const providers2 = this._kernelSourceActionProviders.get(viewType) ?? [];
    providers2.push(provider);
    this._kernelSourceActionProviders.set(viewType, providers2);
    this._onDidChangeSourceActions.fire({ viewType });
    const eventEmitterDisposable = provider.onDidChangeSourceActions?.(() => {
      this._onDidChangeSourceActions.fire({ viewType });
    });
    return toDisposable(() => {
      const providers3 = this._kernelSourceActionProviders.get(viewType) ?? [];
      const idx = providers3.indexOf(provider);
      if (idx >= 0) {
        providers3.splice(idx, 1);
        this._kernelSourceActionProviders.set(viewType, providers3);
      }
      eventEmitterDisposable?.dispose();
    });
  }
  /**
   * Get kernel source actions from providers
   */
  getKernelSourceActions2(notebook) {
    const viewType = notebook.notebookType;
    const providers2 = this._kernelSourceActionProviders.get(viewType) ?? [];
    const promises = providers2.map((provider) => provider.provideKernelSourceActions());
    return Promise.all(promises).then((actions) => {
      return actions.reduce((a, b) => a.concat(b), []);
    });
  }
};

NotebookKernelService = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService)
], NotebookKernelService);
export { KernelInfo, NotebookTextModelLikeId, SourceAction2, NotebookKernelService };
