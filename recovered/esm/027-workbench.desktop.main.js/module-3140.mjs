// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmViewService.ts
import { basename2 } from "./module-0034.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { getSCMRepositoryIcon } from "./module-2028.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ISCMService, ISCMViewService } from "./module-1080.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { SCMMenus } from "./module-3139.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { observableFromEventOpts } from "./module-0057.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { latestChangedValue } from "./module-0065.mjs";
import { runOnChange } from "./module-0064.mjs";
import { autorun } from "./module-0052.mjs";
import { Iterable } from "./module-0011.mjs";
import { compareFileNames, comparePaths } from "./module-1529.mjs";
import { binarySearch } from "./module-0007.mjs";
import { debounce } from "./module-0250.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/scm/browser/scmViewService.ts
function getProviderStorageKey(provider) {
  return `${provider.providerId}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
}

function getRepositoryName2(workspaceContextService, repository) {
  if (!repository.provider.rootUri) {
    return repository.provider.label;
  }
  const folder = workspaceContextService.getWorkspaceFolder(repository.provider.rootUri);
  return folder?.uri.toString() === repository.provider.rootUri.toString() ? folder.name : basename2(repository.provider.rootUri);
}

var RepositoryContextKeys = {
  RepositorySortKey: new RawContextKey("scmRepositorySortKey", "discoveryTime" /* DiscoveryTime */),
  RepositorySelectionMode: new RawContextKey("scmRepositorySelectionMode", "single" /* Single */)
};

var RepositoryPicker = class {
  constructor(_placeHolder, _autoQuickItemDescription, _quickInputService, _scmViewService) {
    this._placeHolder = _placeHolder;
    this._autoQuickItemDescription = _autoQuickItemDescription;
    this._quickInputService = _quickInputService;
    this._scmViewService = _scmViewService;
    this._autoQuickPickItem = {
      label: localize(18938, null),
      description: this._autoQuickItemDescription,
      repository: "auto"
    };
  }
  async pickRepository() {
    const picks = [
      this._autoQuickPickItem,
      { type: "separator" }
    ];
    const activeRepository = this._scmViewService.activeRepository.get();
    const repository = activeRepository?.repository;
    const pinned = activeRepository?.pinned === true;
    picks.push(...this._scmViewService.repositories.map((r2) => {
      const icon2 = getSCMRepositoryIcon(activeRepository, r2);
      return {
        label: r2.provider.name,
        description: r2.provider.rootUri?.fsPath,
        iconClass: ThemeIcon.asClassName(icon2),
        repository: r2
      };
    }));
    picks.push({ type: "separator", label: "外部/AI关联项目" });
    picks.push({
      label: "OpenCode 源码",
      description: "E:\\OpenCode-Source-Recovery-20261013 (AI修改)",
      iconClass: ThemeIcon.asClassName(Codicon?.repo || Codicon?.gitBranch),
      repository: { externalPath: "E:/OpenCode-Source-Recovery-20261013" }
    });
    const activeItem = pinned ? picks.find((p) => p.type !== "separator" && p.repository === repository) : this._autoQuickPickItem;
    return this._quickInputService.pick(picks, { placeHolder: this._placeHolder, activeItem });
  }
};

RepositoryPicker = __decorateClass([
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, ISCMViewService)
], RepositoryPicker);

var SCMViewService = class {
  constructor(scmService, contextKeyService, editorService, extensionService, instantiationService, configurationService, storageService, workspaceContextService) {
    this.scmService = scmService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.didSelectRepository = false;
    this.disposables = new DisposableStore();
    this._repositories = [];
    this.didFinishLoadingRepositories = observableValue(this, false);
    this._onDidChangeRepositories = new Emitter();
    this.onDidChangeRepositories = this._onDidChangeRepositories.event;
    this._onDidSetVisibleRepositories = new Emitter();
    this.onDidChangeVisibleRepositories = Event2.any(
      this._onDidSetVisibleRepositories.event,
      Event2.debounce(
        this._onDidChangeRepositories.event,
        (last, e) => {
          if (!last) {
            return e;
          }
          const added = new Set(last.added);
          const removed = new Set(last.removed);
          for (const repository of e.added) {
            if (!removed.delete(repository)) {
              added.add(repository);
            }
          }
          for (const repository of e.removed) {
            if (!added.delete(repository)) {
              removed.add(repository);
            }
          }
          return { added, removed };
        },
        0,
        void 0,
        void 0,
        void 0,
        this.disposables
      )
    );
    this._onDidFocusRepository = new Emitter();
    this.onDidFocusRepository = this._onDidFocusRepository.event;
    this.menus = instantiationService.createInstance(SCMMenus);
    const explorerEnabledConfig = observableConfigValue("scm.repositories.explorer", false, this.configurationService);
    this.graphShowIncomingChangesConfig = observableConfigValue("scm.graph.showIncomingChanges", true, this.configurationService);
    this.graphShowOutgoingChangesConfig = observableConfigValue("scm.graph.showOutgoingChanges", true, this.configurationService);
    this.selectionModeConfig = observableConfigValue("scm.repositories.selectionMode", "multiple" /* Multiple */, this.configurationService);
    this.explorerEnabledConfig = derived((reader) => {
      return explorerEnabledConfig.read(reader) === true && this.selectionModeConfig.read(reader) === "single" /* Single */;
    });
    try {
      this.previousState = JSON.parse(storageService.get("scm:view:visibleRepositories", 1 /* WORKSPACE */, ""));
      if (this.previousState && this.previousState.visible.length > 1 && this.selectionModeConfig.get() === "single" /* Single */) {
        this.previousState = {
          ...this.previousState,
          visible: [this.previousState.visible[0]]
        };
      }
    } catch {
    }
    this._focusedRepositoryObs = observableFromEventOpts(
      {
        owner: this,
        equalsFn: () => false
      },
      this.onDidFocusRepository,
      () => this.focusedRepository
    );
    this._activeEditorObs = observableFromEventOpts({
      owner: this,
      equalsFn: () => false
    }, this.editorService.onDidActiveEditorChange, () => this.editorService.activeEditor);
    this._activeEditorRepositoryObs = derivedObservableWithCache(
      this,
      (reader, lastValue) => {
        const activeEditor = this._activeEditorObs.read(reader);
        const activeResource = EditorResourceAccessor.getOriginalUri(activeEditor);
        if (!activeResource) {
          return lastValue;
        }
        const repository = this.scmService.getRepository(activeResource);
        if (!repository) {
          return lastValue;
        }
        return Object.create(repository);
      }
    );
    this._activeRepositoryPinnedObs = observableValue(this, void 0);
    this._activeRepositoryObs = latestChangedValue(this, [this._activeEditorRepositoryObs, this._focusedRepositoryObs]);
    this.activeRepository = derivedOpts({
      owner: this,
      equalsFn: (r1, r2) => r1?.repository.id === r2?.repository.id && r1?.pinned === r2?.pinned
    }, (reader) => {
      const activeRepository = this._activeRepositoryObs.read(reader);
      const activeRepositoryPinned = this._activeRepositoryPinnedObs.read(reader);
      const repository = activeRepositoryPinned ?? activeRepository;
      const pinned = !!activeRepositoryPinned;
      return repository ? { repository, pinned } : void 0;
    });
    this.disposables.add(runOnChange(this.selectionModeConfig, (selectionMode) => {
      if (selectionMode === "single" /* Single */ && this.visibleRepositories.length > 1) {
        const repository = this.visibleRepositories[0];
        this.visibleRepositories = [repository];
      } else if (selectionMode === "multiple" /* Multiple */ && this.repositories.length > 1) {
        this.visibleRepositories = this.repositories;
      }
    }));
    this._repositoriesSortKey = this.previousState?.sortKey ?? this.getViewSortOrder();
    this._sortKeyContextKey = RepositoryContextKeys.RepositorySortKey.bindTo(contextKeyService);
    this._sortKeyContextKey.set(this._repositoriesSortKey);
    this._selectionModelContextKey = RepositoryContextKeys.RepositorySelectionMode.bindTo(contextKeyService);
    this.disposables.add(autorun((reader) => {
      const selectionMode = this.selectionModeConfig.read(reader);
      this._selectionModelContextKey.set(selectionMode);
    }));
    scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
    scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
    for (const repository of scmService.repositories) {
      this.onDidAddRepository(repository);
    }
    storageService.onWillSaveState(this.onWillSaveState, this, this.disposables);
    extensionService.onWillStop(() => {
      this.onWillSaveState();
      this.didFinishLoadingRepositories.set(false, void 0);
    }, this, this.disposables);
    setTimeout(async () => {
      try {
        const cmdService = instantiationService.invokeFunction((accessor) => accessor.get(ICommandService));
        if (cmdService) {
          await cmdService.executeCommand("git.openRepository", "E:/OpenCode-Source-Recovery-20261013");
        }
      } catch {}
    }, 2000);
  }
  get repositories() {
    return this._repositories.filter((r2) => r2.repository.provider.isHidden !== true).map((r2) => r2.repository);
  }
  get visibleRepositories() {
    if (this._repositoriesSortKey === "discoveryTime" /* DiscoveryTime */) {
      return this._repositories.filter((r2) => r2.repository.provider.isHidden !== true && r2.selectionIndex !== -1).sort((r1, r2) => r1.selectionIndex - r2.selectionIndex).map((r2) => r2.repository);
    }
    return this._repositories.filter((r2) => r2.repository.provider.isHidden !== true && r2.selectionIndex !== -1).map((r2) => r2.repository);
  }
  set visibleRepositories(visibleRepositories) {
    const set = new Set(visibleRepositories);
    const added = /* @__PURE__ */ new Set();
    const removed = /* @__PURE__ */ new Set();
    for (const repositoryView of this._repositories) {
      if (!set.has(repositoryView.repository) && repositoryView.selectionIndex !== -1) {
        repositoryView.selectionIndex = -1;
        removed.add(repositoryView.repository);
      }
      if (set.has(repositoryView.repository)) {
        if (repositoryView.selectionIndex === -1) {
          added.add(repositoryView.repository);
        }
        repositoryView.selectionIndex = visibleRepositories.indexOf(repositoryView.repository);
      }
    }
    if (added.size === 0 && removed.size === 0) {
      return;
    }
    this._onDidSetVisibleRepositories.fire({ added, removed });
    if (this._repositories.find((r2) => r2.focused && r2.selectionIndex === -1)) {
      this.focus(this._repositories.find((r2) => r2.selectionIndex !== -1)?.repository);
    }
  }
  get focusedRepository() {
    return this._repositories.find((r2) => r2.focused)?.repository;
  }
  onDidAddRepository(repository) {
    if (!this.didFinishLoadingRepositories.get()) {
      this.eventuallyFinishLoading();
    }
    const repositoryView = {
      repository,
      discoveryTime: Date.now(),
      focused: false,
      selectionIndex: -1
    };
    let removed = Iterable.empty();
    if (this.previousState && !this.didFinishLoadingRepositories.get()) {
      const index2 = this.previousState.all.indexOf(getProviderStorageKey(repository.provider));
      if (index2 === -1) {
        const added = [];
        this.insertRepositoryView(this._repositories, repositoryView);
        if (this.selectionModeConfig.get() === "multiple" /* Multiple */ || !this._repositories.find((r2) => r2.selectionIndex !== -1)) {
          this._repositories.forEach((repositoryView2, index3) => {
            if (repositoryView2.selectionIndex === -1) {
              added.push(repositoryView2.repository);
            }
            repositoryView2.selectionIndex = index3;
          });
          this._onDidChangeRepositories.fire({ added, removed: Iterable.empty() });
        }
        this.didSelectRepository = false;
        return;
      }
      if (this.previousState.visible.indexOf(index2) === -1) {
        if (this.didSelectRepository) {
          this.insertRepositoryView(this._repositories, repositoryView);
          this._onDidChangeRepositories.fire({ added: Iterable.empty(), removed: Iterable.empty() });
          return;
        }
      } else {
        if (!this.didSelectRepository) {
          removed = [...this.visibleRepositories];
          this._repositories.forEach((r2) => {
            r2.focused = false;
            r2.selectionIndex = -1;
          });
          this.didSelectRepository = true;
        }
      }
    }
    if (this.selectionModeConfig.get() === "multiple" /* Multiple */ || !this._repositories.find((r2) => r2.selectionIndex !== -1)) {
      const maxSelectionIndex = this.getMaxSelectionIndex();
      this.insertRepositoryView(this._repositories, { ...repositoryView, selectionIndex: maxSelectionIndex + 1 });
      this._onDidChangeRepositories.fire({ added: [repositoryView.repository], removed });
    } else {
      this.insertRepositoryView(this._repositories, repositoryView);
      this._onDidChangeRepositories.fire({ added: Iterable.empty(), removed });
    }
    if (!this._repositories.find((r2) => r2.focused)) {
      this.focus(repository);
    }
  }
  onDidRemoveRepository(repository) {
    if (!this.didFinishLoadingRepositories.get()) {
      this.eventuallyFinishLoading();
    }
    const repositoriesIndex = this._repositories.findIndex((r2) => r2.repository === repository);
    if (repositoriesIndex === -1) {
      return;
    }
    let added = Iterable.empty();
    const removed = this._repositories.splice(repositoriesIndex, 1);
    if (this._repositories.length > 0 && this.visibleRepositories.length === 0) {
      this._repositories[0].selectionIndex = 0;
      added = [this._repositories[0].repository];
    }
    this._onDidChangeRepositories.fire({ added, removed: removed.map((r2) => r2.repository) });
    if (removed.length === 1 && removed[0].focused && this.visibleRepositories.length > 0) {
      this.focus(this.visibleRepositories[0]);
    }
    if (removed.length === 1 && this._repositories.length === 0) {
      this._onDidFocusRepository.fire(void 0);
    }
    if (removed.length === 1 && removed[0].repository === this._activeRepositoryPinnedObs.get()) {
      this._activeRepositoryPinnedObs.set(void 0, void 0);
    }
  }
  isVisible(repository) {
    return this._repositories.find((r2) => r2.repository === repository)?.selectionIndex !== -1;
  }
  toggleVisibility(repository, visible) {
    if (typeof visible === "undefined") {
      visible = !this.isVisible(repository);
    } else if (this.isVisible(repository) === visible) {
      return;
    }
    if (visible) {
      if (this.selectionModeConfig.get() === "single" /* Single */) {
        this.visibleRepositories = [repository];
      } else if (this.selectionModeConfig.get() === "multiple" /* Multiple */) {
        this.visibleRepositories = [...this.visibleRepositories, repository];
      }
    } else {
      const index2 = this.visibleRepositories.indexOf(repository);
      if (index2 > -1) {
        this.visibleRepositories = [
          ...this.visibleRepositories.slice(0, index2),
          ...this.visibleRepositories.slice(index2 + 1)
        ];
      }
    }
  }
  toggleSortKey(sortKey2) {
    this._repositoriesSortKey = sortKey2;
    this._sortKeyContextKey.set(this._repositoriesSortKey);
    this._repositories.sort(this.compareRepositories.bind(this));
    this._onDidChangeRepositories.fire({ added: Iterable.empty(), removed: Iterable.empty() });
  }
  toggleSelectionMode(selectionMode) {
    this.configurationService.updateValue("scm.repositories.selectionMode", selectionMode);
  }
  focus(repository) {
    if (repository && !this.isVisible(repository)) {
      return;
    }
    this._repositories.forEach((r2) => r2.focused = r2.repository === repository);
    if (this._repositories.find((r2) => r2.focused)) {
      this._onDidFocusRepository.fire(repository);
    }
  }
  pinActiveRepository(repository) {
    this._activeRepositoryPinnedObs.set(repository, void 0);
  }
  compareRepositories(op1, op2) {
    if (this._repositoriesSortKey === "discoveryTime" /* DiscoveryTime */) {
      return op1.discoveryTime - op2.discoveryTime;
    }
    if (this._repositoriesSortKey === "path" && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
      return comparePaths(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
    }
    const name1 = getRepositoryName2(this.workspaceContextService, op1.repository);
    const name2 = getRepositoryName2(this.workspaceContextService, op2.repository);
    const nameComparison = compareFileNames(name1, name2);
    if (nameComparison === 0 && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
      return comparePaths(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
    }
    return nameComparison;
  }
  getMaxSelectionIndex() {
    return this._repositories.length === 0 ? -1 : Math.max(...this._repositories.map((r2) => r2.selectionIndex));
  }
  getViewSortOrder() {
    const sortOder = this.configurationService.getValue("scm.repositories.sortOrder");
    switch (sortOder) {
      case "discovery time":
        return "discoveryTime" /* DiscoveryTime */;
      case "name":
        return "name" /* Name */;
      case "path":
        return "path" /* Path */;
      default:
        return "discoveryTime" /* DiscoveryTime */;
    }
  }
  insertRepositoryView(repositories, repositoryView) {
    const index2 = binarySearch(repositories, repositoryView, this.compareRepositories.bind(this));
    repositories.splice(index2 < 0 ? ~index2 : index2, 0, repositoryView);
  }
  onWillSaveState() {
    if (!this.didFinishLoadingRepositories.get()) {
      return;
    }
    const all = this.repositories.map((r2) => getProviderStorageKey(r2.provider));
    const visible = this.visibleRepositories.map((r2) => all.indexOf(getProviderStorageKey(r2.provider)));
    this.previousState = { all, visible, sortKey: this._repositoriesSortKey };
    this.storageService.store("scm:view:visibleRepositories", JSON.stringify(this.previousState), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  eventuallyFinishLoading() {
    this.finishLoading();
  }
  finishLoading() {
    if (this.didFinishLoadingRepositories.get()) {
      return;
    }
    this.didFinishLoadingRepositories.set(true, void 0);
  }
  dispose() {
    this.disposables.dispose();
    this._onDidFocusRepository.dispose();
    this._onDidChangeRepositories.dispose();
    this._onDidSetVisibleRepositories.dispose();
  }
};

__decorateClass([
  debounce(5e3)
], SCMViewService.prototype, "eventuallyFinishLoading", 1);

SCMViewService = __decorateClass([
  __decorateParam(0, ISCMService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWorkspaceContextService)
], SCMViewService);
export { getProviderStorageKey, getRepositoryName2, RepositoryContextKeys, RepositoryPicker, SCMViewService };
