// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/reconnectableAgentHostAutomationStore.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { disposableObservableValue, observableValue } from "./module-0048.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { derived } from "./module-0054.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { CHAT_AUTOMATIONS_ENABLED_SETTING } from "./module-2638.mjs";
import { AgentHostAutomationStore } from "./module-3681.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { waitForState } from "./module-0056.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { isAutomationActiveRunError } from "./module-2218.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/reconnectableAgentHostAutomationStore.ts
var MIGRATION_RETRY_DELAY_MS = 3e4;

var ReconnectableAgentHostAutomationStore = class extends Disposable {
  constructor(_providerId, _legacySource, _boundaryMapper, _instantiationService, _logService, _configurationService) {
    super();
    this._providerId = _providerId;
    this._legacySource = _legacySource;
    this._boundaryMapper = _boundaryMapper;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this.preservesImportedRunHistory = true;
    this._currentStore = this._register(disposableObservableValue(this, void 0));
    this._migrationRetry = this._register(new MutableDisposable());
    this._connectionBinding = this._register(new DisposableStore());
    this._runsForCache = /* @__PURE__ */ new Map();
    this._authorityState = observableValue(this, { kind: "disconnected" });
    this._disposeCancellation = new CancellationTokenSource();
    this.automations = derived(this, (reader) => this._currentStore.read(reader)?.automations.read(reader) ?? this._legacySource?.automations.read(reader) ?? []);
    this.runs = derived(this, (reader) => this._currentStore.read(reader)?.runs.read(reader) ?? this._legacySource?.runs.read(reader) ?? []);
    this._configurationChanged = observableSignalFromEvent(this, this._configurationService.onDidChangeConfiguration);
  }
  dispose() {
    this._connectionBinding.clear();
    this._migrationRetry.clear();
    this._setAuthorityState({ kind: "disconnected" });
    this._disposeCancellation.cancel();
    this._disposeCancellation.dispose();
    this._currentStore.set(void 0, void 0);
    super.dispose();
  }
  setConnection(connection) {
    this._connectionBinding.clear();
    this._migrationRetry.clear();
    this._currentStore.set(void 0, void 0);
    this._setAuthorityState({ kind: "initializing" });
    this._connectionBinding.add(autorun((reader) => {
      this._configurationChanged.read(reader);
      const initializeResult = connection.initializeResult.read(reader);
      const enabled = this._configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
      const current = this._currentStore.read(reader);
      if (!enabled) {
        if (current) {
          this._migrationRetry.clear();
          this._currentStore.set(void 0, void 0);
        }
        this._setAuthorityState({ kind: "disabled" });
        return;
      }
      if (!initializeResult) {
        this._setAuthorityState({ kind: "initializing" });
        return;
      }
      if (!initializeResult.automations) {
        if (current) {
          this._migrationRetry.clear();
          this._currentStore.set(void 0, void 0);
        }
        this._setAuthorityState({ kind: "unsupported" });
        return;
      }
      if (!current) {
        const store = this._instantiationService.createInstance(AgentHostAutomationStore, this._providerId, connection, this._legacySource, this._boundaryMapper);
        this._currentStore.set(store, void 0);
        this._setAuthorityState({ kind: "supported", store });
        this._completeMigration(store);
      } else {
        this._setAuthorityState({ kind: "supported", store: current });
      }
    }));
  }
  clearConnection() {
    this._connectionBinding.clear();
    this._migrationRetry.clear();
    this._currentStore.set(void 0, void 0);
    this._setAuthorityState({ kind: "disconnected" });
  }
  getAutomation(id2) {
    return this._currentStore.get()?.getAutomation(id2) ?? this._legacySource?.getAutomation(id2);
  }
  isSchedulingOwnedByHost(automationId2) {
    return this._currentStore.get()?.isSchedulingOwnedByHost(automationId2) === true;
  }
  canRunAutomation(automationId2) {
    return this._currentStore.get()?.canRunAutomation(automationId2) ?? this._legacySource?.getAutomation(automationId2) !== void 0;
  }
  canUpdateAutomation(automationId2) {
    return this._currentStore.get()?.canUpdateAutomation(automationId2) ?? this._legacySource?.getAutomation(automationId2) !== void 0;
  }
  canDeleteAutomation(automationId2) {
    return this._currentStore.get()?.canDeleteAutomation(automationId2) ?? this._legacySource?.getAutomation(automationId2) !== void 0;
  }
  runsFor(automationId2) {
    let result = this._runsForCache.get(automationId2);
    if (!result) {
      result = derived(this, (reader) => this.runs.read(reader).filter((run) => run.automationId === automationId2));
      this._runsForCache.set(automationId2, result);
    }
    return result;
  }
  createAutomation(options3, mutationGuard) {
    return this._requireOperationalStore().createAutomation(options3, mutationGuard);
  }
  updateAutomation(id2, patch2) {
    return this._requireOperationalStore().updateAutomation(id2, patch2);
  }
  updateAutomationIfUnchanged(id2, patch2, expected, mutationGuard) {
    return this._requireOperationalStore().updateAutomationIfUnchanged(id2, patch2, expected, mutationGuard);
  }
  deleteAutomation(id2, mutationGuard) {
    return this._requireOperationalStore().deleteAutomation(id2, mutationGuard);
  }
  importAutomationSnapshot(snapshot) {
    return this._requireAgentHostStore().importAutomationSnapshot(snapshot);
  }
  upsertAutomationSnapshot(snapshot) {
    return this._requireAgentHostStore().upsertAutomationSnapshot(snapshot);
  }
  removeAutomationSnapshotIfUnchanged(expected) {
    return this._requireAgentHostStore().removeAutomationSnapshotIfUnchanged(expected);
  }
  acknowledgeAutomationSnapshotImported(snapshot) {
    return this._requireAgentHostStore().acknowledgeAutomationSnapshotImported(snapshot);
  }
  recordRunStart(automationId2, trigger, leaderWindowId) {
    return this._requireOperationalStore().recordRunStart(automationId2, trigger, leaderWindowId);
  }
  updateRun(runId, patch2) {
    return this._requireOperationalStore().updateRun(runId, patch2);
  }
  deleteRun(runId) {
    return this._requireOperationalStore().deleteRun(runId);
  }
  getActiveRunFor(automationId2) {
    return this._currentStore.get()?.getActiveRunFor(automationId2) ?? this._legacySource?.getActiveRunFor(automationId2);
  }
  async markStaleRunsFailed(reason) {
    await (this._currentStore.get() ?? this._legacySource)?.markStaleRunsFailed(reason);
  }
  async completeMigration() {
    while (true) {
      let state = this._authorityState.get();
      if (state.kind === "initializing") {
        const waitCancellation = new CancellationTokenSource(this._disposeCancellation.token);
        const waitTimeout = disposableTimeout(() => waitCancellation.cancel(), MIGRATION_RETRY_DELAY_MS);
        try {
          state = await waitForState(this._authorityState, (candidate) => candidate.kind !== "initializing", void 0, waitCancellation.token);
        } catch (error) {
          if (isCancellationError(error)) {
            return;
          }
          throw error;
        } finally {
          waitTimeout.dispose();
          waitCancellation.cancel();
          waitCancellation.dispose();
        }
      }
      if (state.kind !== "supported") {
        return;
      }
      try {
        await state.store.completeMigration();
        return;
      } catch (error) {
        const current = this._authorityState.get();
        if (current.kind !== "supported" || current.store !== state.store) {
          continue;
        }
        throw error;
      }
    }
  }
  _setAuthorityState(state) {
    const current = this._authorityState.get();
    if (current.kind === state.kind && (current.kind !== "supported" || state.kind !== "supported" || current.store === state.store)) {
      return;
    }
    this._authorityState.set(state, void 0);
  }
  _completeMigration(store) {
    if (this._store.isDisposed || this._currentStore.get() !== store) {
      return;
    }
    void store.completeMigration().catch((error) => {
      if (this._store.isDisposed || isCancellationError(error) || this._currentStore.get() !== store) {
        return;
      }
      if (isAutomationActiveRunError(error)) {
        this._logService.info(`[ReconnectableAgentHostAutomationStore] Automation migration deferred while a legacy run is active; retrying in ${MIGRATION_RETRY_DELAY_MS}ms.`);
      } else {
        this._logService.error(`[ReconnectableAgentHostAutomationStore] Failed to initialize remote Automation authority; retrying in ${MIGRATION_RETRY_DELAY_MS}ms.`, error);
      }
      this._migrationRetry.value = disposableTimeout(() => this._completeMigration(store), MIGRATION_RETRY_DELAY_MS);
    });
  }
  _requireAgentHostStore() {
    const store = this._currentStore.get();
    if (!store) {
      throw new Error("The Agent Host does not currently advertise Automation support.");
    }
    return store;
  }
  _requireOperationalStore() {
    return this._currentStore.get() ?? this._legacySource ?? this._requireAgentHostStore();
  }
};

ReconnectableAgentHostAutomationStore = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IConfigurationService)
], ReconnectableAgentHostAutomationStore);
export { MIGRATION_RETRY_DELAY_MS, ReconnectableAgentHostAutomationStore };
