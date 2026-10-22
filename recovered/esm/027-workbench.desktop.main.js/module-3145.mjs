// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/workingSet.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { autorun } from "./module-0052.mjs";
import { derived } from "./module-0054.mjs";
import { getProviderKey } from "./module-2028.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ISCMService } from "./module-1080.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";


// src/vs/workbench/contrib/scm/browser/workingSet.ts
var SCMWorkingSetController = class extends Disposable {
  constructor(configurationService, editorGroupsService, scmService, storageService, layoutService) {
    super();
    this.configurationService = configurationService;
    this.editorGroupsService = editorGroupsService;
    this.scmService = scmService;
    this.storageService = storageService;
    this.layoutService = layoutService;
    this._repositoryDisposables = new DisposableMap();
    this._enabledConfig = observableConfigValue("scm.workingSets.enabled", false, this.configurationService);
    this._store.add(autorun((reader) => {
      if (!this._enabledConfig.read(reader)) {
        this.storageService.remove("scm.workingSets", 1 /* WORKSPACE */);
        this._repositoryDisposables.clearAndDisposeAll();
        return;
      }
      this._workingSets = this._loadWorkingSets();
      this.scmService.onDidAddRepository(this._onDidAddRepository, this, reader.store);
      this.scmService.onDidRemoveRepository(this._onDidRemoveRepository, this, reader.store);
      for (const repository of this.scmService.repositories) {
        this._onDidAddRepository(repository);
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.scmWorkingSets";
  }
  _onDidAddRepository(repository) {
    const disposables = new DisposableStore();
    const historyItemRefId = derived((reader) => {
      const historyProvider = repository.provider.historyProvider.read(reader);
      const historyItemRef = historyProvider?.historyItemRef.read(reader);
      return historyItemRef?.id;
    });
    disposables.add(autorun(async (reader) => {
      const historyItemRefIdValue = historyItemRefId.read(reader);
      if (!historyItemRefIdValue) {
        return;
      }
      const providerKey = getProviderKey(repository.provider);
      const repositoryWorkingSets = this._workingSets.get(providerKey);
      if (!repositoryWorkingSets) {
        this._workingSets.set(providerKey, { currentHistoryItemGroupId: historyItemRefIdValue, editorWorkingSets: /* @__PURE__ */ new Map() });
        return;
      }
      if (repositoryWorkingSets.currentHistoryItemGroupId === historyItemRefIdValue) {
        return;
      }
      this._saveWorkingSet(providerKey, historyItemRefIdValue, repositoryWorkingSets);
      await this._restoreWorkingSet(providerKey, historyItemRefIdValue);
    }));
    this._repositoryDisposables.set(repository, disposables);
  }
  _onDidRemoveRepository(repository) {
    this._repositoryDisposables.deleteAndDispose(repository);
  }
  _loadWorkingSets() {
    const workingSets = /* @__PURE__ */ new Map();
    const workingSetsRaw = this.storageService.get("scm.workingSets", 1 /* WORKSPACE */);
    if (!workingSetsRaw) {
      return workingSets;
    }
    for (const serializedWorkingSet of JSON.parse(workingSetsRaw)) {
      workingSets.set(serializedWorkingSet.providerKey, {
        currentHistoryItemGroupId: serializedWorkingSet.currentHistoryItemGroupId,
        editorWorkingSets: new Map(serializedWorkingSet.editorWorkingSets)
      });
    }
    return workingSets;
  }
  _saveWorkingSet(providerKey, currentHistoryItemGroupId, repositoryWorkingSets) {
    const previousHistoryItemGroupId = repositoryWorkingSets.currentHistoryItemGroupId;
    const editorWorkingSets = repositoryWorkingSets.editorWorkingSets;
    const editorWorkingSet = this.editorGroupsService.saveWorkingSet(previousHistoryItemGroupId);
    this._workingSets.set(providerKey, { currentHistoryItemGroupId, editorWorkingSets: editorWorkingSets.set(previousHistoryItemGroupId, editorWorkingSet) });
    const workingSets = [];
    for (const [providerKey2, { currentHistoryItemGroupId: currentHistoryItemGroupId2, editorWorkingSets: editorWorkingSets2 }] of this._workingSets) {
      workingSets.push({ providerKey: providerKey2, currentHistoryItemGroupId: currentHistoryItemGroupId2, editorWorkingSets: [...editorWorkingSets2] });
    }
    this.storageService.store("scm.workingSets", JSON.stringify(workingSets), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  async _restoreWorkingSet(providerKey, currentHistoryItemGroupId) {
    const workingSets = this._workingSets.get(providerKey);
    if (!workingSets) {
      return;
    }
    let editorWorkingSetId = workingSets.editorWorkingSets.get(currentHistoryItemGroupId);
    if (!editorWorkingSetId && this.configurationService.getValue("scm.workingSets.default") === "empty") {
      editorWorkingSetId = "empty";
    }
    if (editorWorkingSetId) {
      const preserveFocus = this.layoutService.hasFocus("workbench.parts.panel" /* PANEL_PART */);
      await this.editorGroupsService.applyWorkingSet(editorWorkingSetId, { preserveFocus });
    }
  }
  dispose() {
    this._repositoryDisposables.dispose();
    super.dispose();
  }
};

SCMWorkingSetController = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, ISCMService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IWorkbenchLayoutService)
], SCMWorkingSetController);
export { SCMWorkingSetController };
