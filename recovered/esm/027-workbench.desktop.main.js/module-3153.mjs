// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/common/scmService.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { HistoryNavigator2 } from "./module-0599.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Iterable } from "./module-0011.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { runOnChange } from "./module-0064.mjs";
import { Schemas } from "./module-0033.mjs";
import { ILogService } from "./module-0095.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/scm/common/scmService.ts
var SCMInput = class extends Disposable {
  constructor(repository, history) {
    super();
    this.repository = repository;
    this.history = history;
    this._value = "";
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._placeholder = "";
    this._onDidChangePlaceholder = this._register(new Emitter());
    this.onDidChangePlaceholder = this._onDidChangePlaceholder.event;
    this._enabled = true;
    this._onDidChangeEnablement = this._register(new Emitter());
    this.onDidChangeEnablement = this._onDidChangeEnablement.event;
    this._visible = true;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._onDidChangeFocus = this._register(new Emitter());
    this.onDidChangeFocus = this._onDidChangeFocus.event;
    this._onDidChangeValidationMessage = this._register(new Emitter());
    this.onDidChangeValidationMessage = this._onDidChangeValidationMessage.event;
    this._onDidClearValidation = this._register(new Emitter());
    this.onDidClearValidation = this._onDidClearValidation.event;
    this._validateInput = () => Promise.resolve(void 0);
    this._onDidChangeValidateInput = this._register(new Emitter());
    this.onDidChangeValidateInput = this._onDidChangeValidateInput.event;
    this.didChangeHistory = false;
    if (this.repository.provider.rootUri) {
      this.historyNavigator = history.getHistory(this.repository.provider.label, this.repository.provider.rootUri);
      this._register(this.history.onWillSaveHistory((event) => {
        if (this.historyNavigator.isAtEnd()) {
          this.saveValue();
        }
        if (this.didChangeHistory) {
          event.historyDidIndeedChange();
        }
        this.didChangeHistory = false;
      }));
    } else {
      this.historyNavigator = new HistoryNavigator2([""], 100);
    }
    this._value = this.historyNavigator.current();
  }
  get value() {
    return this._value;
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder;
    this._onDidChangePlaceholder.fire(placeholder);
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(enabled) {
    this._enabled = enabled;
    this._onDidChangeEnablement.fire(enabled);
  }
  get visible() {
    return this._visible;
  }
  set visible(visible) {
    this._visible = visible;
    this._onDidChangeVisibility.fire(visible);
  }
  setFocus() {
    this._onDidChangeFocus.fire();
  }
  showValidationMessage(message, type) {
    this._onDidChangeValidationMessage.fire({ message, type });
  }
  clearValidation() {
    this._onDidClearValidation.fire();
  }
  get validateInput() {
    return this._validateInput;
  }
  set validateInput(validateInput) {
    this._validateInput = validateInput;
    this._onDidChangeValidateInput.fire();
  }
  setValue(value2, transient, reason) {
    if (value2 === this._value) {
      return;
    }
    if (!transient) {
      this.historyNavigator.replaceLast(this._value);
      this.historyNavigator.add(value2);
      this.didChangeHistory = true;
    }
    this._value = value2;
    this._onDidChange.fire({ value: value2, reason });
  }
  showNextHistoryValue() {
    if (this.historyNavigator.isAtEnd()) {
      return;
    } else if (!this.historyNavigator.has(this.value)) {
      this.saveValue();
      this.historyNavigator.resetCursor();
    }
    const value2 = this.historyNavigator.next();
    this.setValue(value2, true, 1 /* HistoryNext */);
  }
  showPreviousHistoryValue() {
    if (this.historyNavigator.isAtEnd()) {
      this.saveValue();
    } else if (!this.historyNavigator.has(this._value)) {
      this.saveValue();
      this.historyNavigator.resetCursor();
    }
    const value2 = this.historyNavigator.previous();
    this.setValue(value2, true, 0 /* HistoryPrevious */);
  }
  saveValue() {
    const oldValue = this.historyNavigator.replaceLast(this._value);
    this.didChangeHistory = this.didChangeHistory || oldValue !== this._value;
  }
};

var SCMRepository = class {
  constructor(id2, provider, disposables, inputHistory) {
    this.id = id2;
    this.provider = provider;
    this.disposables = disposables;
    this._selected = false;
    this._onDidChangeSelection = new Emitter();
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this.input = new SCMInput(this, inputHistory);
  }
  get selected() {
    return this._selected;
  }
  setSelected(selected) {
    if (this._selected === selected) {
      return;
    }
    this._selected = selected;
    this._onDidChangeSelection.fire(selected);
  }
  dispose() {
    this.disposables.dispose();
    this._onDidChangeSelection.dispose();
    this.input.dispose();
    this.provider.dispose();
  }
};

var WillSaveHistoryEvent = class {
  constructor() {
    this._didChangeHistory = false;
  }
  get didChangeHistory() {
    return this._didChangeHistory;
  }
  historyDidIndeedChange() {
    this._didChangeHistory = true;
  }
};

var SCMInputHistory = class {
  constructor(storageService, workspaceContextService) {
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.disposables = new DisposableStore();
    this.histories = /* @__PURE__ */ new Map();
    this._onWillSaveHistory = this.disposables.add(new Emitter());
    this.onWillSaveHistory = this._onWillSaveHistory.event;
    this.histories = /* @__PURE__ */ new Map();
    const entries2 = this.storageService.getObject("scm.history", 1 /* WORKSPACE */, []);
    for (const [providerLabel, rootUri, history] of entries2) {
      let providerHistories = this.histories.get(providerLabel);
      if (!providerHistories) {
        providerHistories = new ResourceMap();
        this.histories.set(providerLabel, providerHistories);
      }
      providerHistories.set(rootUri, new HistoryNavigator2(history, 100));
    }
    if (this.migrateStorage()) {
      this.saveToStorage();
    }
    this.disposables.add(this.storageService.onDidChangeValue(1 /* WORKSPACE */, "scm.history", this.disposables)((e) => {
      if (e.external && e.key === "scm.history") {
        const raw = this.storageService.getObject("scm.history", 1 /* WORKSPACE */, []);
        for (const [providerLabel, uri5, rawHistory] of raw) {
          const history = this.getHistory(providerLabel, uri5);
          for (const value2 of Iterable.reverse(rawHistory)) {
            history.prepend(value2);
          }
        }
      }
    }));
    this.disposables.add(this.storageService.onWillSaveState((_) => {
      const event = new WillSaveHistoryEvent();
      this._onWillSaveHistory.fire(event);
      if (event.didChangeHistory) {
        this.saveToStorage();
      }
    }));
  }
  saveToStorage() {
    const raw = [];
    for (const [providerLabel, providerHistories] of this.histories) {
      for (const [rootUri, history] of providerHistories) {
        if (!(history.size === 1 && history.current() === "")) {
          raw.push([providerLabel, rootUri, [...history]]);
        }
      }
    }
    this.storageService.store("scm.history", raw, 1 /* WORKSPACE */, 0 /* USER */);
  }
  getHistory(providerLabel, rootUri) {
    let providerHistories = this.histories.get(providerLabel);
    if (!providerHistories) {
      providerHistories = new ResourceMap();
      this.histories.set(providerLabel, providerHistories);
    }
    let history = providerHistories.get(rootUri);
    if (!history) {
      history = new HistoryNavigator2([""], 100);
      providerHistories.set(rootUri, history);
    }
    return history;
  }
  // Migrates from Application scope storage to Workspace scope.
  // TODO@joaomoreno: Change from January 2024 onwards such that the only code is to remove all `scm/input:` storage keys
  migrateStorage() {
    let didSomethingChange = false;
    const machineKeys = Iterable.filter(this.storageService.keys(-1 /* APPLICATION */, 1 /* MACHINE */), (key3) => key3.startsWith("scm/input:"));
    for (const key3 of machineKeys) {
      try {
        const legacyHistory = JSON.parse(this.storageService.get(key3, -1 /* APPLICATION */, ""));
        const match2 = /^scm\/input:([^:]+):(.+)$/.exec(key3);
        if (!match2 || !Array.isArray(legacyHistory?.history) || !Number.isInteger(legacyHistory?.timestamp)) {
          this.storageService.remove(key3, -1 /* APPLICATION */);
          continue;
        }
        const [, providerLabel, rootPath] = match2;
        const rootUri = URI.file(rootPath);
        if (this.workspaceContextService.getWorkspaceFolder(rootUri)) {
          const history = this.getHistory(providerLabel, rootUri);
          for (const entry of Iterable.reverse(legacyHistory.history)) {
            history.prepend(entry);
          }
          didSomethingChange = true;
          this.storageService.remove(key3, -1 /* APPLICATION */);
        }
      } catch {
        this.storageService.remove(key3, -1 /* APPLICATION */);
      }
    }
    return didSomethingChange;
  }
  dispose() {
    this.disposables.dispose();
  }
};

SCMInputHistory = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IWorkspaceContextService)
], SCMInputHistory);

var SCMService = class {
  constructor(logService, workspaceContextService, contextKeyService, storageService, uriIdentityService) {
    this.logService = logService;
    this.uriIdentityService = uriIdentityService;
    this._repositories = /* @__PURE__ */ new Map();
    this._onDidAddProvider = new Emitter();
    this.onDidAddRepository = this._onDidAddProvider.event;
    this._onDidRemoveProvider = new Emitter();
    this.onDidRemoveRepository = this._onDidRemoveProvider.event;
    this.inputHistory = new SCMInputHistory(storageService, workspaceContextService);
    this.providerCount = contextKeyService.createKey("scm.providerCount", 0);
    this.historyProviderCount = contextKeyService.createKey("scm.historyProviderCount", 0);
  }
  // used in tests
  get repositories() {
    return this._repositories.values();
  }
  get repositoryCount() {
    return this._repositories.size;
  }
  registerSCMProvider(provider) {
    this.logService.trace("SCMService#registerSCMProvider");
    if (this._repositories.has(provider.id)) {
      throw new Error(`SCM Provider ${provider.id} already exists.`);
    }
    const disposables = new DisposableStore();
    const historyProviderCount = () => {
      return Array.from(this._repositories.values()).filter((r2) => !!r2.provider.historyProvider.get()).length;
    };
    disposables.add(toDisposable(() => {
      this._repositories.delete(provider.id);
      this._onDidRemoveProvider.fire(repository);
      this.providerCount.set(this._repositories.size);
      this.historyProviderCount.set(historyProviderCount());
    }));
    const repository = new SCMRepository(provider.id, provider, disposables, this.inputHistory);
    this._repositories.set(provider.id, repository);
    disposables.add(runOnChange(provider.historyProvider, () => {
      this.historyProviderCount.set(historyProviderCount());
    }));
    this.providerCount.set(this._repositories.size);
    this.historyProviderCount.set(historyProviderCount());
    this._onDidAddProvider.fire(repository);
    return repository;
  }
  getRepository(idOrResource) {
    if (typeof idOrResource === "string") {
      return this._repositories.get(idOrResource);
    }
    if (idOrResource.scheme !== Schemas.file && idOrResource.scheme !== Schemas.vscodeRemote) {
      return void 0;
    }
    let bestRepository = void 0;
    let bestMatchLength = Number.POSITIVE_INFINITY;
    for (const repository of this.repositories) {
      if (repository.provider.isHidden === true) {
        continue;
      }
      const root = repository.provider.rootUri;
      if (!root) {
        continue;
      }
      const path = this.uriIdentityService.extUri.relativePath(root, idOrResource);
      if (path && !/^\.\./.test(path) && path.length < bestMatchLength) {
        bestRepository = repository;
        bestMatchLength = path.length;
      }
    }
    return bestRepository;
  }
};

SCMService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IUriIdentityService)
], SCMService);
export { SCMInput, SCMRepository, WillSaveHistoryEvent, SCMInputHistory, SCMService };
