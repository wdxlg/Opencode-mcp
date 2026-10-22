// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsFilter.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderName } from "./module-0982.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsFilter.ts
var AgentSessionsSorting = /* @__PURE__ */ ((AgentSessionsSorting2) => {
  AgentSessionsSorting2["Created"] = "created";
  AgentSessionsSorting2["Updated"] = "updated";
  return AgentSessionsSorting2;
})(AgentSessionsSorting || {});

var DEFAULT_EXCLUDES = Object.freeze({
  providers: [],
  states: [],
  archived: true,
  read: false,
  repositoryGroupCapped: true
});

var AgentSessionsFilter = class extends Disposable {
  constructor(options3, chatSessionsService, storageService) {
    super();
    this.options = options3;
    this.chatSessionsService = chatSessionsService;
    this.storageService = storageService;
    this.STORAGE_KEY = `agentSessions.filterExcludes.agentsessionsviewerfiltersubmenu`;
    this.SORTING_STORAGE_KEY = `agentSessions.sorting`;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.limitResults = () => this.options.limitResults?.();
    this.groupResults = () => this.options.groupResults?.();
    this.sortResults = () => this.options.sortResults?.() ?? this.currentSorting;
    this.excludes = DEFAULT_EXCLUDES;
    this.isStoringExcludes = false;
    this.currentSorting = "created" /* Created */;
    this.actionDisposables = this._register(new DisposableStore());
    this.restoreSorting();
    this.updateExcludes(false);
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.chatSessionsService.onDidChangeItemsProviders(() => this.updateFilterActions()));
    this._register(this.chatSessionsService.onDidChangeAvailability(() => this.updateFilterActions()));
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, this.STORAGE_KEY, this._store)(() => this.updateExcludes(true)));
  }
  updateExcludes(fromEvent) {
    if (!this.isStoringExcludes) {
      const excludedTypesRaw = this.storageService.get(this.STORAGE_KEY, 0 /* PROFILE */);
      if (excludedTypesRaw) {
        try {
          this.excludes = JSON.parse(excludedTypesRaw);
        } catch {
          this.excludes = { ...DEFAULT_EXCLUDES };
        }
      } else {
        this.excludes = { ...DEFAULT_EXCLUDES };
      }
    }
    this.updateFilterActions();
    if (fromEvent) {
      this._onDidChange.fire();
    }
  }
  storeExcludes(excludes) {
    this.excludes = excludes;
    this.isStoringExcludes = true;
    try {
      if (equals4(this.excludes, DEFAULT_EXCLUDES)) {
        this.storageService.remove(this.STORAGE_KEY, 0 /* PROFILE */);
      } else {
        this.storageService.store(this.STORAGE_KEY, JSON.stringify(this.excludes), 0 /* PROFILE */, 0 /* USER */);
      }
    } finally {
      this.isStoringExcludes = false;
    }
  }
  restoreSorting() {
    const storedSorting = this.storageService.get(this.SORTING_STORAGE_KEY, 0 /* PROFILE */);
    if (storedSorting && Object.values(AgentSessionsSorting).includes(storedSorting)) {
      this.currentSorting = storedSorting;
    }
  }
  setSorting(sorting) {
    if (this.currentSorting === sorting) {
      return;
    }
    this.currentSorting = sorting;
    this.storageService.store(this.SORTING_STORAGE_KEY, sorting, 0 /* PROFILE */, 0 /* USER */);
    this.updateFilterActions();
    this._onDidChange.fire();
  }
  updateFilterActions() {
    this.actionDisposables.clear();
    const menuId = this.options.filterMenuId;
    if (!menuId) {
      return;
    }
    this.registerSortActions(this.actionDisposables, menuId);
    this.registerProviderActions(this.actionDisposables, menuId);
    this.registerStateActions(this.actionDisposables, menuId);
    this.registerArchivedActions(this.actionDisposables, menuId);
    this.registerReadActions(this.actionDisposables, menuId);
    this.registerResetAction(this.actionDisposables, menuId);
  }
  registerSortActions(disposables, menuId) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.sortByCreated.${menuId.id.toLowerCase()}`,
          title: localize(9141, null),
          menu: {
            id: menuId,
            group: "0_sort",
            order: 0
          },
          toggled: that.currentSorting === "created" /* Created */ ? ContextKeyExpr.true() : ContextKeyExpr.false()
        });
      }
      run() {
        that.setSorting("created" /* Created */);
      }
    }));
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.sortByUpdated.${menuId.id.toLowerCase()}`,
          title: localize(9142, null),
          menu: {
            id: menuId,
            group: "0_sort",
            order: 1
          },
          toggled: that.currentSorting === "updated" /* Updated */ ? ContextKeyExpr.true() : ContextKeyExpr.false()
        });
      }
      run() {
        that.setSorting("updated" /* Updated */);
      }
    }));
  }
  registerProviderActions(disposables, menuId) {
    const labelOverrides = this.options.providerLabelOverrides;
    const resolveLabel = (id2) => {
      if (labelOverrides?.has(id2)) {
        return labelOverrides.get(id2);
      }
      const knownProvider = getAgentSessionProvider(id2);
      return knownProvider ? getAgentSessionProviderName(knownProvider) : id2;
    };
    let providers2;
    if (this.options.allowedProviders) {
      providers2 = this.options.allowedProviders.map((id2) => ({ id: id2, label: resolveLabel(id2) }));
    } else {
      providers2 = [{ id: AgentSessionProviders.Local, label: resolveLabel(AgentSessionProviders.Local) }];
      for (const contribution of this.chatSessionsService.getAllChatSessionContributions()) {
        if (providers2.find((p) => p.id === contribution.type)) {
          continue;
        }
        providers2.push({
          id: contribution.type,
          label: resolveLabel(contribution.type)
        });
      }
    }
    const that = this;
    let counter = 0;
    for (const provider of providers2) {
      disposables.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `agentSessions.filter.toggleExclude:${provider.id}.${menuId.id.toLowerCase()}`,
            title: provider.label,
            menu: {
              id: menuId,
              group: "1_providers",
              order: counter++
            },
            toggled: that.excludes.providers.includes(provider.id) ? ContextKeyExpr.false() : ContextKeyExpr.true()
          });
        }
        run() {
          const providerExcludes = new Set(that.excludes.providers);
          if (!providerExcludes.delete(provider.id)) {
            providerExcludes.add(provider.id);
          }
          that.storeExcludes({ ...that.excludes, providers: Array.from(providerExcludes) });
        }
      }));
    }
  }
  registerStateActions(disposables, menuId) {
    const states = [
      { id: 1 /* Completed */, label: localize(9143, null) },
      { id: 2 /* InProgress */, label: localize(9145, null) },
      { id: 3 /* NeedsInput */, label: localize(9146, null) },
      { id: 0 /* Failed */, label: localize(9144, null) }
    ];
    const that = this;
    let counter = 0;
    for (const state of states) {
      disposables.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `agentSessions.filter.toggleExcludeState:${state.id}.${menuId.id.toLowerCase()}`,
            title: state.label,
            menu: {
              id: menuId,
              group: "2_states",
              order: counter++
            },
            toggled: that.excludes.states.includes(state.id) ? ContextKeyExpr.false() : ContextKeyExpr.true()
          });
        }
        run() {
          const stateExcludes = new Set(that.excludes.states);
          if (!stateExcludes.delete(state.id)) {
            stateExcludes.add(state.id);
          }
          that.storeExcludes({ ...that.excludes, states: Array.from(stateExcludes) });
        }
      }));
    }
  }
  registerArchivedActions(disposables, menuId) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.toggleExcludeArchived.${menuId.id.toLowerCase()}`,
          title: localize(9138, null),
          menu: {
            id: menuId,
            group: "3_props",
            order: 1e3
          },
          toggled: that.excludes.archived ? ContextKeyExpr.false() : ContextKeyExpr.true()
        });
      }
      run() {
        that.storeExcludes({ ...that.excludes, archived: !that.excludes.archived });
      }
    }));
  }
  registerReadActions(disposables, menuId) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.toggleExcludeRead.${menuId.id.toLowerCase()}`,
          title: localize(9139, null),
          menu: {
            id: menuId,
            group: "3_props",
            order: 0
          },
          toggled: that.excludes.read ? ContextKeyExpr.false() : ContextKeyExpr.true()
        });
      }
      run() {
        that.storeExcludes({ ...that.excludes, read: !that.excludes.read });
      }
    }));
  }
  /**
   * Programmatically toggle the repository group capping state.
   */
  setRepositoryGroupCapped(capped) {
    if (this.excludes.repositoryGroupCapped !== capped) {
      this.storeExcludes({ ...this.excludes, repositoryGroupCapped: capped });
    }
  }
  registerResetAction(disposables, menuId) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.resetExcludes.${menuId.id.toLowerCase()}`,
          title: localize(9140, null),
          menu: {
            id: menuId,
            group: "4_reset",
            order: 0
          }
        });
      }
      run() {
        that.reset();
      }
    }));
  }
  isDefault() {
    return equals4(this.excludes, DEFAULT_EXCLUDES) && this.currentSorting === "created" /* Created */;
  }
  getExcludes() {
    return this.excludes;
  }
  exclude(session) {
    const overrideExclude = this.options?.overrideExclude?.(session);
    if (typeof overrideExclude === "boolean") {
      return overrideExclude;
    }
    if (this.options.allowedProviders && !this.options.allowedProviders.includes(session.providerType)) {
      return true;
    }
    if (this.excludes.read && session.isRead()) {
      return true;
    }
    if (this.excludes.providers.includes(session.providerType)) {
      return true;
    }
    if (this.excludes.states.includes(session.status)) {
      return true;
    }
    if (this.excludes.archived && this.groupResults?.() === "capped" /* Capped */ && session.isArchived()) {
      return true;
    }
    return false;
  }
  notifyResults(count2) {
    this.options.notifyResults?.(count2);
  }
  reset() {
    this.storeExcludes({ ...DEFAULT_EXCLUDES });
    if (this.currentSorting !== "created" /* Created */) {
      this.setSorting("created" /* Created */);
    }
  }
};

AgentSessionsFilter = __decorateClass([
  __decorateParam(1, IChatSessionsService),
  __decorateParam(2, IStorageService)
], AgentSessionsFilter);
export { AgentSessionsSorting, DEFAULT_EXCLUDES, AgentSessionsFilter };
