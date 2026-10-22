// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/providerAutomationService.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Sequencer, disposableTimeout } from "./module-0036.mjs";
import { AutomationService } from "./module-3683.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { derived } from "./module-0054.mjs";
import { isAutomationActiveRunError, serializeAutomationEditableState } from "./module-2218.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/automations/browser/providerAutomationService.ts
var MAX_AUTOMATION_TRANSFER_ATTEMPTS = 3;

var AUTOMATION_MIGRATION_RETRY_DELAY_MS = 3e4;

var ProviderAutomationService = class extends Disposable {
  constructor(sessionsProvidersService, instantiationService, logService) {
    super();
    this.sessionsProvidersService = sessionsProvidersService;
    this.logService = logService;
    this.migrationSequencer = new Sequencer();
    this.migrationRetry = this._register(new MutableDisposable());
    this.migrationPromise = Promise.resolve();
    this.runsForCache = /* @__PURE__ */ new Map();
    this.staleRunRecoveryGeneration = 0;
    this.recoveredStores = /* @__PURE__ */ new Set();
    this.legacyStore = this._register(instantiationService.createInstance(AutomationService));
    this.providersChanged = observableSignalFromEvent(this, sessionsProvidersService.onDidChangeProviders);
    this.automations = derived(this, (reader) => {
      this.providersChanged.read(reader);
      return distinctById2(
        this.getStores().flatMap((entry) => [...entry.store.automations.read(reader)])
      ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
    this.runs = derived(this, (reader) => {
      this.providersChanged.read(reader);
      return distinctById2(
        this.getStores().flatMap((entry) => [...entry.store.runs.read(reader)])
      ).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    });
    this._register(sessionsProvidersService.onDidChangeProviders((event) => {
      for (const provider of event.removed) {
        if (provider.automations) {
          this.recoveredStores.delete(provider.automations);
        }
      }
      if (event.added.some((provider) => provider.automations)) {
        this.queueMigration();
      }
    }));
    this.queueMigration();
  }
  getAutomation(id2) {
    return this.findAutomationStore(id2)?.store.getAutomation(id2);
  }
  runsFor(automationId2) {
    let result = this.runsForCache.get(automationId2);
    if (!result) {
      result = derived(this, (reader) => this.runs.read(reader).filter((run) => run.automationId === automationId2));
      this.runsForCache.set(automationId2, result);
    }
    return result;
  }
  createAutomation(options3, mutationGuard) {
    return this.getCreationStore(options3).createAutomation(options3, mutationGuard);
  }
  async updateAutomation(id2, patch2) {
    const source = this.requireAutomationStore(id2);
    let previous = source.getAutomation(id2);
    while (previous) {
      const targetChanged = this.hasTargetChanged(previous, patch2.target);
      this.assertCanTransferStorage(source, id2, patch2.target, targetChanged);
      const result = await source.updateAutomationIfUnchanged(id2, patch2, previous);
      if (result.kind === "conflict") {
        previous = result.current;
        continue;
      }
      await this.retargetAutomationStorageIfNeeded(source, result.automation, previous, targetChanged);
      return result.automation;
    }
    throw new Error(`Automation '${id2}' does not exist.`);
  }
  async updateAutomationIfUnchanged(id2, patch2, expected, mutationGuard) {
    const source = this.requireAutomationStore(id2);
    const previous = source.getAutomation(id2);
    if (!previous) {
      return { kind: "conflict", current: void 0 };
    }
    if (serializeAutomationEditableState(previous) !== serializeAutomationEditableState(expected)) {
      return { kind: "conflict", current: previous };
    }
    const targetChanged = this.hasTargetChanged(previous, patch2.target);
    this.assertCanTransferStorage(source, id2, patch2.target, targetChanged);
    const result = await source.updateAutomationIfUnchanged(id2, patch2, expected, mutationGuard);
    if (result.kind === "updated") {
      await this.retargetAutomationStorageIfNeeded(source, result.automation, previous, targetChanged);
    }
    return result;
  }
  async deleteAutomation(id2, mutationGuard) {
    await this.requireAutomationStore(id2).deleteAutomation(id2, mutationGuard);
    this.runsForCache.delete(id2);
  }
  recordRunStart(automationId2, trigger, leaderWindowId) {
    return this.requireAutomationStore(automationId2).recordRunStart(automationId2, trigger, leaderWindowId);
  }
  updateRun(runId, patch2) {
    const store = this.findRunStore(runId);
    return store ? store.updateRun(runId, patch2) : Promise.resolve(void 0);
  }
  deleteRun(runId) {
    const store = this.findRunStore(runId);
    return store ? store.deleteRun(runId) : Promise.resolve();
  }
  getActiveRunFor(automationId2) {
    return this.findAutomationStore(automationId2)?.store.getActiveRunFor(automationId2);
  }
  isSchedulingOwnedByHost(automationId2) {
    return this.findAutomationStore(automationId2)?.store.isSchedulingOwnedByHost?.(automationId2) === true;
  }
  canRunAutomation(automationId2) {
    const entry = this.findAutomationStore(automationId2);
    return entry?.store.canRunAutomation?.(automationId2) ?? entry !== void 0;
  }
  canUpdateAutomation(automationId2) {
    const entry = this.findAutomationStore(automationId2);
    return entry?.store.canUpdateAutomation?.(automationId2) ?? entry !== void 0;
  }
  canDeleteAutomation(automationId2) {
    const entry = this.findAutomationStore(automationId2);
    return entry?.store.canDeleteAutomation?.(automationId2) ?? entry !== void 0;
  }
  async markStaleRunsFailed(reason) {
    await this.migrationPromise;
    const stores = this.getStores();
    const results = await Promise.allSettled(stores.map((entry) => entry.store.markStaleRunsFailed(reason)));
    for (let index2 = 0; index2 < results.length; index2++) {
      const result = results[index2];
      if (result.status === "rejected") {
        const providerId = stores[index2].providerId ?? "legacy";
        this.logService.error(`[ProviderAutomationService] Failed to recover stale Automation runs for '${providerId}'.`, result.reason);
      }
    }
  }
  async startStaleRunRecovery(reason) {
    const generation = ++this.staleRunRecoveryGeneration;
    this.staleRunRecoveryReason = reason;
    this.recoveredStores.clear();
    const stores = this.getStores();
    this.migrationPromise = this.migrationSequencer.queue(() => this.recoverStores(stores, reason, generation)).catch((error) => {
      this.logService.error("[ProviderAutomationService] Failed to start stale Automation run recovery.", error);
    });
    await this.migrationPromise;
  }
  stopStaleRunRecovery() {
    this.staleRunRecoveryGeneration++;
    this.staleRunRecoveryReason = void 0;
    this.recoveredStores.clear();
  }
  waitForMigrationForTesting() {
    return this.migrationPromise;
  }
  getStores() {
    const providerStores = this.sessionsProvidersService.getProviders().filter((provider) => provider.automations).map((provider) => ({ providerId: provider.id, store: provider.automations }));
    return [...providerStores, { providerId: void 0, store: this.legacyStore }];
  }
  getCreationStore(options3) {
    return this.getTargetStore(options3.target.providerId);
  }
  getTargetStore(providerId) {
    if (providerId) {
      const providerStore = this.sessionsProvidersService.getProvider(providerId)?.automations;
      if (providerStore) {
        return providerStore;
      }
    }
    return this.legacyStore;
  }
  hasTargetChanged(current, target) {
    return !!target && serializeAutomationEditableState(current) !== serializeAutomationEditableState({ ...current, target });
  }
  assertCanTransferStorage(source, automationId2, target, targetChanged) {
    if (!targetChanged || !target || source === this.getTargetStore(target.providerId) || !source.getActiveRunFor(automationId2)) {
      return;
    }
    throw this.createActiveRunTransferError();
  }
  createActiveRunTransferError() {
    return new Error(localize(4247, null));
  }
  async retargetAutomationStorageIfNeeded(sourceStore, initialAutomation, previousAutomation, targetChanged) {
    let snapshot = {
      automation: initialAutomation,
      runs: sourceStore.runsFor(initialAutomation.id).get()
    };
    for (let attempt = 0; attempt < MAX_AUTOMATION_TRANSFER_ATTEMPTS; attempt++) {
      const destinationStore = this.getTargetStore(snapshot.automation.target.providerId);
      if (sourceStore === destinationStore) {
        return;
      }
      if (sourceStore.getActiveRunFor(snapshot.automation.id)) {
        if (!targetChanged) {
          return;
        }
        await this.restoreSourceAfterBlockedTransfer(sourceStore, initialAutomation, previousAutomation);
        throw this.createActiveRunTransferError();
      }
      try {
        await destinationStore.upsertAutomationSnapshot(snapshot);
      } catch (error) {
        if (!isAutomationActiveRunError(error)) {
          throw error;
        }
        if (!targetChanged) {
          return;
        }
        await this.restoreSourceAfterBlockedTransfer(sourceStore, initialAutomation, previousAutomation);
        throw this.createActiveRunTransferError();
      }
      if (destinationStore.preservesImportedRunHistory === false) {
        return;
      }
      const sourceRemoval = await sourceStore.removeAutomationSnapshotIfUnchanged(snapshot);
      switch (sourceRemoval.kind) {
        case "removed":
          await destinationStore.acknowledgeAutomationSnapshotImported?.(snapshot);
          return;
        case "missing":
          await this.rollbackAutomationSnapshotIfUnchanged(destinationStore, snapshot);
          return;
        case "conflict":
          if (!await this.rollbackAutomationSnapshotIfUnchanged(destinationStore, snapshot)) {
            return;
          }
          snapshot = sourceRemoval.current;
          break;
      }
    }
    this.logService.warn(`[ProviderAutomationService] Automation '${snapshot.automation.id}' kept changing while transferring storage ownership; leaving the source copy in place.`);
  }
  async restoreSourceAfterBlockedTransfer(sourceStore, expected, previous) {
    try {
      const result = await sourceStore.updateAutomationIfUnchanged(expected.id, {
        name: previous.name,
        prompt: previous.prompt,
        schedule: previous.schedule,
        target: previous.target,
        modelId: previous.modelId ?? null,
        mode: previous.mode ?? null,
        permissionLevel: previous.permissionLevel ?? null,
        enabled: previous.enabled
      }, expected);
      if (result.kind === "conflict") {
        this.logService.warn(`[ProviderAutomationService] Automation '${expected.id}' changed while its active run blocked storage transfer; the latest source state was preserved.`);
      }
    } catch (error) {
      this.logService.error(`[ProviderAutomationService] Failed to restore the source state after an active run blocked storage transfer for '${expected.id}'.`, error);
    }
  }
  findAutomationStore(id2) {
    return this.getStores().find((entry) => !!entry.store.getAutomation(id2));
  }
  requireAutomationStore(id2) {
    const entry = this.findAutomationStore(id2);
    if (!entry) {
      throw new Error(`Automation '${id2}' does not exist.`);
    }
    return entry.store;
  }
  findRunStore(runId) {
    return this.getStores().find((entry) => entry.store.runs.get().some((run) => run.id === runId))?.store;
  }
  queueMigration() {
    this.migrationRetry.clear();
    const migration = this.migrationSequencer.queue(async () => {
      const initialRecoveryReason = this.staleRunRecoveryReason;
      if (initialRecoveryReason) {
        await this.recoverStores(this.getStores(), initialRecoveryReason, this.staleRunRecoveryGeneration);
      }
      await this.migrateLegacyAutomations();
      await this.completeProviderMigrations();
      const finalRecoveryReason = this.staleRunRecoveryReason;
      if (finalRecoveryReason) {
        await this.recoverStores(this.getStores(), finalRecoveryReason, this.staleRunRecoveryGeneration);
      }
    });
    this.migrationPromise = migration;
    void migration.then(
      () => this.migrationRetry.clear(),
      (error) => {
        if (this._store.isDisposed || isCancellationError(error)) {
          return;
        }
        if (isAutomationActiveRunError(error)) {
          this.logService.info(`[ProviderAutomationService] Automation migration deferred while a run is active; retrying in ${AUTOMATION_MIGRATION_RETRY_DELAY_MS}ms.`);
        } else {
          this.logService.error(`[ProviderAutomationService] Failed to migrate legacy Automations; retrying in ${AUTOMATION_MIGRATION_RETRY_DELAY_MS}ms.`, error);
        }
        this.migrationRetry.value = disposableTimeout(() => this.queueMigration(), AUTOMATION_MIGRATION_RETRY_DELAY_MS);
      }
    );
  }
  async recoverStores(entries2, reason, generation) {
    for (const entry of entries2) {
      if (generation !== this.staleRunRecoveryGeneration || this.staleRunRecoveryReason !== reason) {
        return;
      }
      if (this.recoveredStores.has(entry.store)) {
        continue;
      }
      try {
        await entry.store.markStaleRunsFailed(reason);
        if (generation === this.staleRunRecoveryGeneration && this.staleRunRecoveryReason === reason) {
          this.recoveredStores.add(entry.store);
        }
      } catch (error) {
        const providerId = entry.providerId ?? "legacy";
        this.logService.error(`[ProviderAutomationService] Failed to recover stale Automation runs for '${providerId}'.`, error);
      }
    }
  }
  async migrateLegacyAutomations() {
    if (this.legacyStore.canCompleteMigration() === false) {
      throw new Error("Legacy Automation storage cannot be migrated safely by this version.");
    }
    const failures = [];
    for (const automation of [...this.legacyStore.automations.get()]) {
      try {
        await this.migrateLegacyAutomation(automation);
      } catch (error) {
        if (isCancellationError(error) || this._store.isDisposed) {
          throw new CancellationError();
        }
        if (isAutomationActiveRunError(error)) {
          this.logService.info(`[ProviderAutomationService] Deferred migration for Automation '${automation.id}' while a run is active.`);
        } else {
          this.logService.error(`[ProviderAutomationService] Failed to migrate Automation '${automation.id}'.`, error);
        }
        failures.push(error instanceof Error ? error : new Error(String(error)));
      }
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, `Failed to migrate ${failures.length} Automation snapshot(s).`);
    }
  }
  async migrateLegacyAutomation(initialAutomation) {
    let snapshot = {
      automation: initialAutomation,
      runs: this.legacyStore.runsFor(initialAutomation.id).get()
    };
    for (let attempt = 0; attempt < MAX_AUTOMATION_TRANSFER_ATTEMPTS; attempt++) {
      const providerId = snapshot.automation.target.providerId;
      if (!providerId) {
        return;
      }
      const providerStore = this.sessionsProvidersService.getProvider(providerId)?.automations;
      if (!providerStore) {
        return;
      }
      const importResult = await providerStore.importAutomationSnapshot(snapshot);
      if (importResult.kind === "conflict") {
        this.logService.warn(`[ProviderAutomationService] Automation '${snapshot.automation.id}' conflicts with the destination provider store; leaving the legacy copy in place.`);
        return;
      }
      this.recoveredStores.delete(providerStore);
      if (providerStore.preservesImportedRunHistory === false) {
        return;
      }
      const sourceRemoval = await this.legacyStore.removeAutomationSnapshotIfUnchanged(snapshot);
      switch (sourceRemoval.kind) {
        case "removed":
          await providerStore.acknowledgeAutomationSnapshotImported?.(snapshot);
          return;
        case "missing":
          if (importResult.kind === "inserted") {
            await this.rollbackAutomationSnapshotIfUnchanged(providerStore, snapshot);
          }
          return;
        case "conflict":
          if (importResult.kind === "inserted" && !await this.rollbackAutomationSnapshotIfUnchanged(providerStore, snapshot)) {
            return;
          }
          snapshot = sourceRemoval.current;
          break;
      }
    }
    this.logService.warn(`[ProviderAutomationService] Automation '${snapshot.automation.id}' kept changing during legacy migration; leaving it in legacy storage.`);
  }
  async completeProviderMigrations() {
    const stores = [...new Set(this.getStores().map((entry) => entry.store))];
    for (const store of stores) {
      await store.completeMigration?.();
    }
  }
  async rollbackAutomationSnapshotIfUnchanged(store, snapshot) {
    const result = await store.removeAutomationSnapshotIfUnchanged(snapshot);
    switch (result.kind) {
      case "removed":
        return true;
      case "conflict":
        this.logService.warn(`[ProviderAutomationService] Automation '${snapshot.automation.id}' changed in the destination store during rollback; leaving both copies in place.`);
        return false;
      case "missing":
        this.logService.warn(`[ProviderAutomationService] Automation '${snapshot.automation.id}' was deleted from the destination store during rollback; leaving the source copy in place.`);
        return false;
    }
  }
};

ProviderAutomationService = __decorateClass([
  __decorateParam(0, ISessionsProvidersService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService)
], ProviderAutomationService);

function distinctById2(items) {
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}
export { distinctById2, MAX_AUTOMATION_TRANSFER_ATTEMPTS, AUTOMATION_MIGRATION_RETRY_DELAY_MS, ProviderAutomationService };
