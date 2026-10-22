// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostAutomationStore.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { URI } from "./module-0032.mjs";
import { AUTOMATION_CATALOG_URI, ROOT_STATE_URI } from "./module-1008.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { isAgentHostAutomationCatalogMigrated, isAgentHostLegacyAutomationImport, isAgentHostLegacyAutomationImportPending } from "./module-3678.mjs";
import { derived } from "./module-0054.mjs";
import { generateUuid } from "./module-0190.mjs";
import { AutomationActiveRunError, isAutomationActiveRunError, serializeAutomationEditableState } from "./module-2218.mjs";
import { publishAutomationMigration } from "./module-3679.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY, AGENT_HOST_LEGACY_AUTOMATION_IMPORT_META_KEY, AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY } from "./module-3677.mjs";
import { localize } from "./module-0001.mjs";
import { hasKey } from "./module-0010.mjs";
import { disposableTimeout, timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IAutomationStorageService } from "./module-3680.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostAutomationStore.ts
var MUTATION_TIMEOUT_MS = 3e4;

var MIGRATION_POLL_INTERVAL_MS = 50;

var LEGACY_RUN_ARCHIVE_VERSION = 1;

var LEGACY_RUN_ARCHIVE_WRITE_ATTEMPTS = 10;

var AgentHostAutomationStore = class extends Disposable {
  constructor(_providerId, _connection, _legacySource, _boundaryMapper, _logService, _storageService, _telemetryService, _automationStorageService) {
    super();
    this._providerId = _providerId;
    this._connection = _connection;
    this._legacySource = _legacySource;
    this._boundaryMapper = _boundaryMapper;
    this._logService = _logService;
    this._storageService = _storageService;
    this._telemetryService = _telemetryService;
    this._automationStorageService = _automationStorageService;
    this.preservesImportedRunHistory = true;
    this._ready = observableValue(this, false);
    this._runsForCache = /* @__PURE__ */ new Map();
    this._pendingWaits = this._register(new DisposableMap());
    this._pendingWaitIds = 0;
    this._archiveKey = `agentHostAutomation.legacyRunArchive.${_providerId}`;
    const archive = this._loadArchivedRuns();
    this._archivedRuns = observableValue(this, archive.runs);
    this._persistRepairedArchivedRuns(archive);
    this._register(this._storageService.onDidChangeValue(-1 /* APPLICATION */, this._archiveKey, this._store)(() => {
      const archive2 = this._loadArchivedRuns();
      this._archivedRuns.set(archive2.runs, void 0);
      this._persistRepairedArchivedRuns(archive2);
    }));
    this._catalogReference = this._register(_connection.getSubscription(
      6 /* AutomationCatalog */,
      URI.parse(AUTOMATION_CATALOG_URI),
      "AgentHostAutomationStore"
    ));
    this._catalog = this._catalogReference.object;
    this._catalogChanged = observableSignalFromEvent(this, this._catalog.onDidChange);
    if (this._catalog.onDidError) {
      this._register(this._catalog.onDidError((error) => this._logService.error(`[AgentHostAutomationStore] Catalogue subscription failed: ${error.message}`)));
    }
    this._register(autorun((reader) => {
      this._catalogChanged.read(reader);
      const catalog = this._catalog.value;
      if (catalog && !(catalog instanceof Error) && (isAgentHostAutomationCatalogMigrated(catalog) || catalog.automations.some((automation) => automation.operations.includes("run" /* Run */))) && !catalog.automations.some((automation) => isAgentHostLegacyAutomationImportPending(automation.definition)) && (!this._legacySource || this._legacySource.automations.read(reader).length === 0) && !this._migrationPromise && !this._ready.read(reader)) {
        this._ready.set(true, void 0);
      }
    }));
    this.automations = derived(this, (reader) => {
      this._catalogChanged.read(reader);
      if (!this._ready.read(reader)) {
        return distinctById([
          ...this._legacySource?.automations.read(reader) ?? [],
          ...this._projectAutomations()
        ]);
      }
      return this._projectAutomations();
    });
    this.runs = derived(this, (reader) => {
      this._catalogChanged.read(reader);
      if (!this._ready.read(reader)) {
        return distinctById([
          ...this._legacySource?.runs.read(reader) ?? [],
          ...this._archivedRuns.read(reader)
        ]).sort((first2, second) => second.startedAt.localeCompare(first2.startedAt));
      }
      return distinctById([...this._projectRuns(), ...this._archivedRuns.read(reader)]).sort((first2, second) => second.startedAt.localeCompare(first2.startedAt));
    });
  }
  getAutomation(id2) {
    return this._ready.get() ? this._projectAutomation(this._findAutomationState(id2)) : this._legacySource?.getAutomation(id2) ?? this._projectAutomation(this._findAutomationState(id2));
  }
  isSchedulingOwnedByHost(automationId2) {
    if (!this._ready.get()) {
      return false;
    }
    const state = this._findAutomationState(automationId2);
    return state !== void 0 && !isAgentHostLegacyAutomationImportPending(state.definition) && state.operations.includes("run" /* Run */);
  }
  canRunAutomation(automationId2) {
    return this._operationAvailable(automationId2, "run" /* Run */);
  }
  canUpdateAutomation(automationId2) {
    return this._operationAvailable(automationId2, "update" /* Update */);
  }
  canDeleteAutomation(automationId2) {
    return this._operationAvailable(automationId2, "remove" /* Remove */);
  }
  runsFor(automationId2) {
    let result = this._runsForCache.get(automationId2);
    if (!result) {
      result = derived(this, (reader) => this.runs.read(reader).filter((run) => run.automationId === automationId2));
      this._runsForCache.set(automationId2, result);
    }
    return result;
  }
  async createAutomation(options3, mutationGuard) {
    await this._waitForMigrationBeforeMutation();
    if (!this._ready.get() && this._legacySource) {
      return this._legacySource.createAutomation(options3, mutationGuard);
    }
    mutationGuard?.();
    const now = /* @__PURE__ */ new Date();
    const descriptor = {
      id: generateUuid(),
      name: options3.name,
      prompt: options3.prompt,
      schedule: options3.schedule,
      target: options3.target,
      modelId: options3.modelId,
      mode: options3.mode,
      permissionLevel: options3.permissionLevel,
      enabled: options3.enabled ?? true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    const state = await this._createDescriptor(descriptor);
    return this._requireProjectedAutomation(state);
  }
  async updateAutomation(id2, patch2) {
    await this._waitForMigrationBeforeMutation();
    if (!this._ready.get() && this._legacySource?.getAutomation(id2)) {
      return this._legacySource.updateAutomation(id2, patch2);
    }
    this._requireOperation(id2, "update" /* Update */);
    const current = this._requireAutomation(id2);
    const updated = this._applyPatch(current, patch2);
    const state = await this._replaceDescriptor(updated);
    return this._requireProjectedAutomation(state);
  }
  async updateAutomationIfUnchanged(id2, patch2, expected, mutationGuard) {
    await this._waitForMigrationBeforeMutation();
    if (!this._ready.get() && this._legacySource?.getAutomation(id2)) {
      return this._legacySource.updateAutomationIfUnchanged(id2, patch2, expected, mutationGuard);
    }
    mutationGuard?.();
    const current = this.getAutomation(id2);
    if (!current || serializeAutomationEditableState(current) !== serializeAutomationEditableState(expected)) {
      return { kind: "conflict", current };
    }
    return { kind: "updated", automation: await this.updateAutomation(id2, patch2) };
  }
  async deleteAutomation(id2, mutationGuard) {
    await this._waitForMigrationBeforeMutation();
    if (!this._ready.get() && this._legacySource?.getAutomation(id2)) {
      return this._legacySource.deleteAutomation(id2, mutationGuard);
    }
    this._requireOperation(id2, "remove" /* Remove */);
    mutationGuard?.();
    const resource = automationResource(id2);
    if (!this._findAutomationState(id2)) {
      return;
    }
    await this._dispatchAndWait(
      { type: "automation/removed" /* AutomationRemoved */, resource },
      (catalog) => !catalog.automations.some((automation) => automation.resource === resource)
    );
    this._runsForCache.delete(id2);
  }
  async importAutomationSnapshot(snapshot) {
    return this._importAutomationSnapshot(snapshot, true);
  }
  async _importAutomationSnapshot(snapshot, importPending) {
    assertTerminalRunHistory(snapshot.runs);
    const existing = this._findAutomationState(snapshot.automation.id);
    if (existing) {
      const current = this._requireProjectedAutomation(existing);
      const expected = this._canonicalDescriptor(snapshot.automation, existing);
      if (serializeAutomationEditableState(current) !== serializeAutomationEditableState(expected)) {
        if (isAgentHostLegacyAutomationImport(existing.definition)) {
          await this._replaceDescriptor(snapshot.automation, true, importPending);
          await this._archiveRuns(snapshot.runs);
          return { kind: "alreadyPresent" };
        }
        return { kind: "conflict", current: { automation: current, runs: this._projectRunsFor(existing.resource) } };
      }
      if (importPending && !isAgentHostLegacyAutomationImportPending(existing.definition)) {
        await this._replaceDescriptor(snapshot.automation, true, importPending);
      }
      await this._archiveRuns(snapshot.runs);
      return { kind: "alreadyPresent" };
    }
    await this._createDescriptor(snapshot.automation, true, importPending);
    await this._archiveRuns(snapshot.runs);
    this._logService.info(`[AgentHostAutomationStore] Migrated Automation definition: resource=${automationResource(snapshot.automation.id)}, legacyRunsRetained=${snapshot.runs.length}.`);
    return { kind: "inserted" };
  }
  async upsertAutomationSnapshot(snapshot) {
    assertTerminalRunHistory(snapshot.runs);
    if (this._findAutomationState(snapshot.automation.id)) {
      await this._replaceDescriptor(snapshot.automation, true, true);
    } else {
      await this._createDescriptor(snapshot.automation, true, true);
    }
    await this._archiveRuns(snapshot.runs);
  }
  async removeAutomationSnapshotIfUnchanged(expected) {
    const current = this._findAutomationState(expected.automation.id);
    if (!current) {
      return { kind: "missing" };
    }
    const projected = this._requireProjectedAutomation(current);
    const canonicalExpected = this._canonicalDescriptor(expected.automation, current);
    if (serializeAutomationEditableState(projected) !== serializeAutomationEditableState(canonicalExpected)) {
      return { kind: "conflict", current: { automation: projected, runs: this._projectRunsFor(current.resource) } };
    }
    await this.deleteAutomation(expected.automation.id);
    return { kind: "removed" };
  }
  async acknowledgeAutomationSnapshotImported(snapshot) {
    const current = this._findAutomationState(snapshot.automation.id);
    if (!current || !isAgentHostLegacyAutomationImportPending(current.definition)) {
      return;
    }
    await this._clearImportPending(snapshot.automation.id);
  }
  async recordRunStart(automationId2, trigger, _leaderWindowId) {
    if (!this._ready.get() && this._legacySource?.getAutomation(automationId2)) {
      return this._legacySource.recordRunStart(automationId2, trigger, _leaderWindowId);
    }
    if (trigger !== "manual") {
      throw new Error("Scheduled Automation execution is owned by the Agent Host.");
    }
    this._requireOperation(automationId2, "run" /* Run */);
    const activeRun = this.getActiveRunFor(automationId2);
    if (activeRun) {
      return { claimed: false, run: activeRun };
    }
    const result = await this._connection.runAutomation({
      channel: AUTOMATION_CATALOG_URI,
      automation: automationResource(automationId2),
      requestId: generateUuid()
    });
    const catalog = await this._waitForCatalog((state) => state.automations.some((automation) => automation.runs.some(
      (run2) => run2.resource === result.resource && (run2.primarySession !== void 0 || isTerminalRun(run2))
    )));
    const run = catalog.automations.flatMap((automation) => automation.runs).find((candidate) => candidate.resource === result.resource);
    if (!run) {
      throw new Error(`Automation run did not appear in the authoritative catalogue: ${result.resource}`);
    }
    const projectedRun = this._projectRun(run);
    return {
      claimed: false,
      run: projectedRun,
      externalDispatch: {
        sessionResource: projectedRun.sessionResource,
        whenCompleted: this._waitForCatalog((state) => state.automations.some((automation) => automation.runs.some(
          (candidate) => candidate.resource === result.resource && isTerminalRun(candidate)
        )), void 0, null).then(() => void 0),
        ...this._connection.initializeResult.get()?.automations?.runCancellation ? {
          cancel: () => this._connection.dispatch(result.resource, { type: "automationRun/cancelRequested" /* AutomationRunCancelRequested */ })
        } : {}
      }
    };
  }
  // Projects an Agent Host session resource into the editor-facing provider scheme.
  _projectSessionResource(resource) {
    const session = URI.parse(resource);
    const provider = this._boundaryMapper?.providerForSessionScheme?.(session.scheme) ?? session.scheme;
    const resourceScheme = this._boundaryMapper?.resourceSchemeForProvider(provider);
    return resourceScheme ? session.with({ scheme: resourceScheme }) : session;
  }
  async updateRun(runId, _patch) {
    if (!this._ready.get() && this._legacySource?.runs.get().some((run) => run.id === runId)) {
      return this._legacySource.updateRun(runId, _patch);
    }
    return this.runs.get().find((run) => run.id === runId);
  }
  async deleteRun(runId) {
    if (!this._ready.get() && this._legacySource?.runs.get().some((run) => run.id === runId)) {
      return this._legacySource.deleteRun(runId);
    }
    throw new Error("Automation run history is owned by the Agent Host.");
  }
  getActiveRunFor(automationId2) {
    if (!this._ready.get() && this._legacySource?.getAutomation(automationId2)) {
      return this._legacySource.getActiveRunFor(automationId2);
    }
    return this.runs.get().find((run) => run.automationId === automationId2 && (run.status === "pending" || run.status === "running"));
  }
  async markStaleRunsFailed(reason) {
    if (!this._ready.get() && this._legacySource) {
      return this._legacySource.markStaleRunsFailed(reason);
    }
  }
  async completeMigration() {
    if (this._ready.get()) {
      return;
    }
    if (this._migrationPromise) {
      return this._migrationPromise;
    }
    const migration = this._completeMigration();
    this._migrationPromise = migration;
    try {
      await migration;
    } finally {
      if (this._migrationPromise === migration) {
        this._migrationPromise = void 0;
      }
    }
  }
  async _completeMigration() {
    const startedAt = Date.now();
    const source = this._legacySource;
    const discovered = source ? [...source.automations.get()] : [];
    const activeRuns = source ? discovered.flatMap((automation) => source.runsFor(automation.id).get().filter(isNonTerminalRun)) : [];
    if (activeRuns.length > 0) {
      const deferralKey = activeRuns.map((run) => run.id).sort().join(",");
      if (this._lastPreflightDeferralKey !== deferralKey) {
        this._lastPreflightDeferralKey = deferralKey;
        publishAutomationMigration(this._telemetryService, {
          outcome: "deferred",
          discoveredCount: discovered.length,
          migratedCount: 0,
          failedCount: 0,
          durationMs: Date.now() - startedAt
        });
      }
      this._logService.info(`[AgentHostAutomationStore] Automation migration deferred: activeRuns=${activeRuns.length}.`);
      throw new AutomationActiveRunError(activeRuns[0].automationId, activeRuns[0].id);
    }
    this._lastPreflightDeferralKey = void 0;
    this._logService.info(`[AgentHostAutomationStore] Automation migration started: discovered=${discovered.length}.`);
    publishAutomationMigration(this._telemetryService, {
      outcome: "started",
      discoveredCount: discovered.length,
      migratedCount: 0,
      failedCount: 0,
      durationMs: 0
    });
    let migratedCount = 0;
    let failedCount = 0;
    try {
      if (source?.canCompleteMigration?.() === false) {
        throw new Error("Legacy Automation storage cannot be migrated safely by this version.");
      }
      const failures = [];
      for (const automation of discovered) {
        try {
          await this._migrateLegacySourceAutomation(automation);
          migratedCount++;
        } catch (error) {
          if (isCancellationError(error) || this._store.isDisposed) {
            throw new CancellationError();
          }
          const failure2 = error instanceof Error ? error : new Error(String(error));
          failures.push(failure2);
          failedCount++;
          if (isAutomationActiveRunError(error)) {
            this._logService.info(`[AgentHostAutomationStore] Automation migration item deferred while a run is active: resource=${automationResource(automation.id)}.`);
          } else {
            this._logService.error(`[AgentHostAutomationStore] Automation migration item failed: resource=${automationResource(automation.id)}, error=${failure2.message}`);
          }
        }
      }
      if (failures.length > 0) {
        throw new AggregateError(failures, `Failed to migrate ${failures.length} Agent Host Automation definition(s).`);
      }
      this._requireLegacySourceDrained();
      await this._waitForCatalog(() => true);
      const resources = discovered.map((automation) => automationResource(automation.id));
      this._connection.dispatch(ROOT_STATE_URI, {
        type: "root/configChanged" /* RootConfigChanged */,
        config: {
          [AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY]: {
            version: 1,
            status: "complete",
            resources
          }
        }
      });
      await this._waitForMigrationCompletion();
      this._requireLegacySourceDrained();
      await this._drainPendingImports();
      this._ready.set(true, void 0);
      const durationMs = Date.now() - startedAt;
      this._logService.info(`[AgentHostAutomationStore] Automation migration completed: discovered=${discovered.length}, migrated=${resources.length}, failed=0, durationMs=${durationMs}.`);
      publishAutomationMigration(this._telemetryService, {
        outcome: "completed",
        discoveredCount: discovered.length,
        migratedCount: resources.length,
        failedCount: 0,
        durationMs
      });
    } catch (error) {
      if (isCancellationError(error)) {
        throw error;
      }
      const durationMs = Date.now() - startedAt;
      if (isAutomationActiveRunError(error)) {
        this._logService.info(`[AgentHostAutomationStore] Automation migration deferred after ${migratedCount} item(s) while a run became active.`);
        publishAutomationMigration(this._telemetryService, {
          outcome: "deferred",
          discoveredCount: discovered.length,
          migratedCount,
          failedCount: 0,
          durationMs
        });
        throw error;
      }
      if (error instanceof AggregateError) {
        failedCount = Math.max(failedCount, error.errors.length);
      }
      this._logService.error(`[AgentHostAutomationStore] Automation migration failed: discovered=${discovered.length}, migrated=${migratedCount}, failed=${failedCount}, durationMs=${durationMs}, error=${error instanceof Error ? error.message : String(error)}.`);
      publishAutomationMigration(this._telemetryService, {
        outcome: "failed",
        discoveredCount: discovered.length,
        migratedCount,
        failedCount,
        durationMs
      });
      throw error;
    }
  }
  async _waitForMigrationBeforeMutation() {
    const migration = this._migrationPromise;
    if (migration) {
      await migration;
    }
  }
  _requireLegacySourceDrained() {
    const remaining = this._legacySource?.automations.get().length ?? 0;
    if (remaining > 0) {
      throw new Error(`Automation migration source changed during migration; ${remaining} definition(s) remain.`);
    }
  }
  async _migrateLegacySourceAutomation(initialAutomation) {
    const source = this._legacySource;
    if (!source) {
      return;
    }
    let snapshot = { automation: initialAutomation, runs: source.runsFor(initialAutomation.id).get() };
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await this._importAutomationSnapshot(snapshot, true);
      if (result.kind === "conflict") {
        throw new Error(`Automation conflicts with the Agent Host catalogue: ${automationResource(initialAutomation.id)}`);
      }
      const removal = await source.removeAutomationSnapshotIfUnchanged(snapshot);
      if (removal.kind === "removed" || removal.kind === "missing") {
        await this._clearImportPending(initialAutomation.id);
        return;
      }
      snapshot = removal.current;
    }
    throw new Error(`Automation kept changing while migrating: ${automationResource(initialAutomation.id)}`);
  }
  async _clearImportPending(automationId2) {
    const current = this._findAutomationState(automationId2);
    if (!current || !isAgentHostLegacyAutomationImportPending(current.definition)) {
      return;
    }
    const projected = this._projectAutomation(current);
    if (!projected) {
      return;
    }
    await this._replaceDescriptor(projected, isAgentHostLegacyAutomationImport(current.definition), false);
  }
  async _drainPendingImports() {
    const catalog = this._catalog.value;
    if (!catalog || catalog instanceof Error) {
      return;
    }
    const failures = [];
    const pending = catalog.automations.filter((automation) => isAgentHostLegacyAutomationImportPending(automation.definition));
    for (const automation of pending) {
      if (this._store.isDisposed) {
        throw new CancellationError();
      }
      const id2 = automationId(automation.resource);
      const legacyEntry = this._legacySource?.getAutomation(id2);
      try {
        if (legacyEntry) {
          await this._migrateLegacySourceAutomation(legacyEntry);
        } else {
          await this._clearImportPending(id2);
        }
      } catch (error) {
        if (isCancellationError(error) || this._store.isDisposed) {
          throw new CancellationError();
        }
        const failure2 = error instanceof Error ? error : new Error(String(error));
        failures.push(failure2);
        this._logService.error(`[AgentHostAutomationStore] Failed to drain pending Automation import: id=${id2}, error=${failure2.message}`);
      }
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, `Failed to drain ${failures.length} pending Agent Host Automation import(s).`);
    }
  }
  // Projects the Agent Host catalogue into editor-facing Automation descriptors.
  _projectAutomations() {
    const catalog = this._catalog.value;
    if (!catalog || catalog instanceof Error) {
      return [];
    }
    return catalog.automations.map((automation) => this._projectAutomation(automation)).filter((automation) => automation !== void 0).sort((first2, second) => second.createdAt.localeCompare(first2.createdAt));
  }
  // Projects Agent Host run summaries into editor-facing Automation runs.
  _projectRuns() {
    const catalog = this._catalog.value;
    if (!catalog || catalog instanceof Error) {
      return [];
    }
    return catalog.automations.flatMap((automation) => automation.runs).map((run) => this._projectRun(run)).sort((first2, second) => second.startedAt.localeCompare(first2.startedAt));
  }
  // Projects one Agent Host Automation's run summaries into editor-facing runs.
  _projectRunsFor(resource) {
    return this._findAutomationStateByResource(resource)?.runs.map((run) => this._projectRun(run)) ?? [];
  }
  // Projects Agent Host Automation state into the editor-facing Automation model.
  _projectAutomation(state) {
    if (!state) {
      return void 0;
    }
    const target = this._projectTarget(state.definition);
    if (!target) {
      this._logService.warn(`[AgentHostAutomationStore] Cannot project Automation with no provider: resource=${state.resource}.`);
      return void 0;
    }
    const config = state.definition.session.config;
    const newestRun = state.runs[0];
    return {
      id: automationId(state.resource),
      name: state.definition.title,
      prompt: state.definition.message.text,
      schedule: projectSchedule(state.definition.triggers),
      target,
      modelId: this._projectModelId(state.definition.session.model?.id, state.definition.session.provider),
      mode: readString(config?.["mode" /* Mode */]),
      permissionLevel: readString(config?.["autoApprove" /* AutoApprove */]),
      enabled: state.definition.enabled,
      createdAt: state.createdAt,
      updatedAt: state.modifiedAt,
      lastRunAt: newestRun?.lifecycle.createdAt,
      nextRunAt: state.nextRunAt
    };
  }
  // Projects an Agent Host session template into an editor-facing Automation target.
  _projectTarget(definition) {
    const provider = definition.session.provider;
    const directory = definition.session.workingDirectories?.[0];
    if (!directory) {
      return provider ? { kind: "quickChat", providerId: this._providerId, sessionTypeId: provider } : void 0;
    }
    const config = definition.session.config;
    const isolation = config?.["isolation" /* Isolation */];
    return {
      kind: "workspace",
      folderUri: this._boundaryMapper?.fromHost(URI.parse(directory)) ?? URI.parse(directory),
      providerId: this._providerId,
      sessionTypeId: provider,
      isolation: isolation === "worktree" ? { kind: "worktree", branch: readString(config?.["branch" /* Branch */]) ?? "" } : isolation === "folder" ? { kind: "folder" } : { kind: "default" }
    };
  }
  // Projects an Agent Host run summary into the editor-facing Automation run model.
  _projectRun(run) {
    const lifecycle = run.lifecycle;
    const primarySession = run.primarySession ? this._projectSessionResource(run.primarySession) : void 0;
    return {
      id: automationRunId(run.resource),
      automationId: automationId(run.automation),
      status: lifecycle.status === "cancelled" /* Cancelled */ ? "failed" : lifecycle.status,
      trigger: run.origin.kind === "manual" /* Manual */ ? "manual" : run.origin.catchUp ? "catch_up" : "schedule",
      sessionResource: primarySession,
      startedAt: lifecycle.status === "pending" /* Pending */ ? lifecycle.createdAt : lifecycle.startedAt ?? lifecycle.createdAt,
      completedAt: lifecycle.status === "completed" /* Completed */ || lifecycle.status === "failed" /* Failed */ || lifecycle.status === "cancelled" /* Cancelled */ ? lifecycle.completedAt : void 0,
      errorMessage: lifecycle.status === "failed" /* Failed */ ? lifecycle.error.message : lifecycle.status === "cancelled" /* Cancelled */ ? localize(4910, null) : void 0,
      leaderWindowId: 0
    };
  }
  _findAutomationState(id2) {
    return this._findAutomationStateByResource(automationResource(id2));
  }
  _findAutomationStateByResource(resource) {
    const catalog = this._catalog.value;
    return catalog && !(catalog instanceof Error) ? catalog.automations.find((automation) => automation.resource === resource) : void 0;
  }
  _requireAutomation(id2) {
    const automation = this.getAutomation(id2);
    if (!automation) {
      throw new Error(`Automation does not exist: ${id2}`);
    }
    return automation;
  }
  _operationAvailable(id2, operation) {
    if (!this._ready.get() && this._legacySource?.getAutomation(id2)) {
      return true;
    }
    return this._findAutomationState(id2)?.operations.includes(operation) === true;
  }
  _requireOperation(id2, operation) {
    if (!this._operationAvailable(id2, operation)) {
      throw new Error(`Automation operation '${operation}' is not available: ${id2}`);
    }
  }
  _requireProjectedAutomation(state) {
    const automation = this._projectAutomation(state);
    if (!automation) {
      throw new Error(`Automation cannot be represented by the compatibility view: ${state.resource}`);
    }
    return automation;
  }
  async _createDescriptor(descriptor, imported = false, importPending) {
    const resource = automationResource(descriptor.id);
    const definition = this._definitionFromDescriptor(descriptor, void 0, imported, importPending);
    const state = await this._dispatchAndWait(
      { type: "automation/createRequested" /* AutomationCreateRequested */, resource, definition },
      (catalog) => catalog.automations.some((automation) => automation.resource === resource)
    );
    if (!state) {
      throw new Error(`Automation create completed without authoritative state: ${resource}`);
    }
    return state;
  }
  async _replaceDescriptor(descriptor, imported = false, importPending) {
    const resource = automationResource(descriptor.id);
    const current = this._findAutomationState(descriptor.id);
    if (!current) {
      throw new Error(`Automation does not exist: ${descriptor.id}`);
    }
    const definition = this._definitionFromDescriptor(descriptor, current.definition, imported, importPending);
    const expected = this._requireProjectedAutomation({ ...current, definition });
    const state = await this._dispatchAndWait(
      {
        type: "automation/updateRequested" /* AutomationUpdateRequested */,
        resource,
        changes: {
          title: definition.title,
          message: definition.message,
          session: definition.session,
          enabled: definition.enabled,
          triggers: definition.triggers,
          _meta: definition._meta
        }
      },
      (catalog) => {
        const state2 = catalog.automations.find((automation) => automation.resource === resource);
        const projected = this._projectAutomation(state2);
        if (projected === void 0 || serializeAutomationEditableState(projected) !== serializeAutomationEditableState(expected)) {
          return false;
        }
        if (importPending === true) {
          return isAgentHostLegacyAutomationImportPending(state2.definition);
        }
        if (importPending === false) {
          return !isAgentHostLegacyAutomationImportPending(state2.definition);
        }
        return true;
      }
    );
    if (!state) {
      throw new Error(`Automation update completed without authoritative state: ${resource}`);
    }
    return state;
  }
  _definitionFromDescriptor(descriptor, existing, imported = false, importPending) {
    const config = { ...existing?.session.config };
    const provider = descriptor.target.sessionTypeId ?? this._providerFromModelId(descriptor.modelId);
    setOptional(config, "mode" /* Mode */, descriptor.mode);
    setOptional(config, "autoApprove" /* AutoApprove */, descriptor.permissionLevel);
    if (descriptor.target.kind === "workspace") {
      setOptional(config, "isolation" /* Isolation */, descriptor.target.isolation.kind === "default" ? void 0 : descriptor.target.isolation.kind);
      setOptional(config, "branch" /* Branch */, descriptor.target.isolation.kind === "worktree" ? descriptor.target.isolation.branch : void 0);
    } else {
      setOptional(config, "isolation" /* Isolation */, void 0);
      setOptional(config, "branch" /* Branch */, void 0);
    }
    const meta = {
      ...existing?._meta,
      ...imported || isAgentHostLegacyAutomationImport(existing) ? { [AGENT_HOST_LEGACY_AUTOMATION_IMPORT_META_KEY]: true } : {}
    };
    if (importPending === true) {
      meta[AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY] = true;
    } else if (importPending === false) {
      delete meta[AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY];
    }
    return {
      title: descriptor.name,
      message: { text: descriptor.prompt, origin: { kind: "automation" /* Automation */ } },
      session: {
        provider,
        model: descriptor.modelId ? { id: this._toHostModelId(descriptor.modelId, provider) } : void 0,
        workingDirectories: descriptor.target.kind === "workspace" ? [(this._boundaryMapper?.toHost(descriptor.target.folderUri) ?? descriptor.target.folderUri).toString()] : void 0,
        config: Object.keys(config).length > 0 ? config : void 0
      },
      enabled: descriptor.enabled,
      triggers: scheduleTrigger(descriptor.schedule),
      _meta: Object.keys(meta).length > 0 ? meta : void 0
    };
  }
  _toHostModelId(modelId, provider) {
    const resourceScheme = provider ? this._boundaryMapper?.resourceSchemeForProvider(provider) : void 0;
    const prefix = resourceScheme ? `${resourceScheme}:` : void 0;
    if (prefix && modelId.startsWith(prefix)) {
      return modelId.slice(prefix.length);
    }
    return modelId;
  }
  _providerFromModelId(modelId) {
    if (!modelId) {
      return void 0;
    }
    const separator2 = modelId.indexOf(":");
    return separator2 > 0 ? this._boundaryMapper?.providerForResourceScheme?.(modelId.slice(0, separator2)) : void 0;
  }
  // Projects an Agent Host model identifier into the editor-facing provider namespace.
  _projectModelId(modelId, provider) {
    if (!modelId) {
      return void 0;
    }
    const resourceScheme = provider ? this._boundaryMapper?.resourceSchemeForProvider(provider) : void 0;
    const prefix = resourceScheme ? `${resourceScheme}:` : void 0;
    return prefix && !modelId.startsWith(prefix) ? `${prefix}${modelId}` : modelId;
  }
  _canonicalDescriptor(descriptor, state) {
    const definition = this._definitionFromDescriptor(descriptor, state.definition);
    return this._requireProjectedAutomation({ ...state, definition });
  }
  _applyPatch(current, patch2) {
    const now = /* @__PURE__ */ new Date();
    const schedule = patch2.schedule ?? current.schedule;
    const enabled = patch2.enabled ?? current.enabled;
    const target = patch2.target ?? current.target;
    const targetAuthorityChanged = patch2.target !== void 0 && (patch2.target.providerId !== current.target.providerId || patch2.target.sessionTypeId !== current.target.sessionTypeId);
    return {
      ...current,
      ...patch2.name !== void 0 ? { name: patch2.name } : {},
      ...patch2.prompt !== void 0 ? { prompt: patch2.prompt } : {},
      schedule,
      target,
      modelId: patch2.modelId === null ? void 0 : patch2.modelId ?? (targetAuthorityChanged ? void 0 : current.modelId),
      mode: patch2.mode === null ? void 0 : patch2.mode ?? current.mode,
      permissionLevel: patch2.permissionLevel === null ? void 0 : patch2.permissionLevel ?? current.permissionLevel,
      enabled,
      updatedAt: now.toISOString()
    };
  }
  async _dispatchAndWait(action, predicate) {
    await this._waitForCatalog(() => true);
    const result = this._waitForCatalog(predicate, action);
    this._connection.dispatch(AUTOMATION_CATALOG_URI, action);
    const catalog = await result;
    const state = catalog.automations.find((automation) => automation.resource === action.resource);
    return state;
  }
  _waitForCatalog(predicate, action, timeoutMs = MUTATION_TIMEOUT_MS) {
    if (this._store.isDisposed) {
      return Promise.reject(new CancellationError());
    }
    const current = this._catalog.value;
    if (current instanceof Error) {
      return Promise.reject(current);
    }
    if (current && predicate(current)) {
      return Promise.resolve(current);
    }
    return new Promise((resolve3, reject) => {
      const store = new DisposableStore();
      const waitId = ++this._pendingWaitIds;
      let settled = false;
      this._pendingWaits.set(waitId, store);
      store.add(toDisposable(() => {
        if (!settled) {
          settled = true;
          reject(new CancellationError());
        }
      }));
      const finish = (result) => {
        if (settled) {
          return;
        }
        settled = true;
        this._pendingWaits.deleteAndDispose(waitId);
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve3(result);
        }
      };
      const check = () => {
        const catalog = this._catalog.value;
        if (catalog instanceof Error) {
          finish(catalog);
        } else if (catalog && predicate(catalog)) {
          finish(catalog);
        }
      };
      store.add(this._catalog.onDidChange(check));
      if (this._catalog.onDidError) {
        store.add(this._catalog.onDidError((error) => finish(error)));
      }
      if (action) {
        store.add(this._connection.onDidAction((envelope) => {
          if (envelope.channel === AUTOMATION_CATALOG_URI && envelope.rejectionReason && envelope.action.type === action.type && hasKey(envelope.action, { resource: true }) && envelope.action.resource === action.resource) {
            finish(new Error(envelope.rejectionReason));
          }
        }));
      }
      if (timeoutMs !== null) {
        store.add(disposableTimeout(() => finish(new Error(`Timed out waiting for authoritative Automation state after ${timeoutMs}ms.`)), timeoutMs));
      }
      check();
    });
  }
  async _waitForMigrationCompletion() {
    const deadline = Date.now() + MUTATION_TIMEOUT_MS;
    let lastError;
    while (Date.now() < deadline) {
      if (this._store.isDisposed) {
        throw new CancellationError();
      }
      try {
        await this._connection.listAutomationTriggerDefinitions({ channel: ROOT_STATE_URI });
        return;
      } catch (error) {
        if (isCancellationError(error) || this._store.isDisposed) {
          throw new CancellationError();
        }
        lastError = error instanceof Error ? error : new Error(String(error));
        await timeout(MIGRATION_POLL_INTERVAL_MS);
      }
    }
    if (this._store.isDisposed) {
      throw new CancellationError();
    }
    throw lastError ?? new Error("Timed out waiting for Agent Host Automation migration completion.");
  }
  _loadArchivedRuns() {
    const raw = this._storageService.get(this._archiveKey, -1 /* APPLICATION */);
    if (!raw) {
      return { runs: [], repairedRuns: 0 };
    }
    const parsed = parseArchivedRuns(raw);
    if (parsed.kind === "unsupported") {
      this._logService.error(`[AgentHostAutomationStore] Ignoring legacy run archive with unsupported version: key=${this._archiveKey}, version=${parsed.version}.`);
      return { runs: [], repairedRuns: 0 };
    }
    if (parsed.kind === "invalid") {
      this._logService.error(`[AgentHostAutomationStore] Ignoring invalid legacy run archive: key=${this._archiveKey}, error=${parsed.error}.`);
      return { runs: [], repairedRuns: 0 };
    }
    if (parsed.droppedRuns > 0) {
      this._logService.warn(`[AgentHostAutomationStore] Dropped ${parsed.droppedRuns} malformed run(s) from legacy run archive: key=${this._archiveKey}.`);
    }
    let repairedRuns = 0;
    const runs = parsed.runs.map((run) => {
      const terminalRun = terminalizeArchivedRun(run);
      if (terminalRun !== run) {
        repairedRuns++;
      }
      return terminalRun;
    });
    return { runs, repairedRuns };
  }
  _persistRepairedArchivedRuns(archive) {
    if (archive.repairedRuns === 0) {
      return;
    }
    this._logService.warn(`[AgentHostAutomationStore] Repairing ${archive.repairedRuns} non-terminal legacy Automation run(s): key=${this._archiveKey}.`);
    void this._repairArchivedRuns().catch((error) => {
      this._logService.error(`[AgentHostAutomationStore] Failed to persist repaired legacy Automation runs: key=${this._archiveKey}, error=${error instanceof Error ? error.message : String(error)}.`);
    });
  }
  async _repairArchivedRuns() {
    let raw = await this._automationStorageService.read(this._archiveKey);
    for (let attempt = 0; attempt < LEGACY_RUN_ARCHIVE_WRITE_ATTEMPTS; attempt++) {
      if (raw === void 0) {
        return;
      }
      const parsed = parseArchivedRuns(raw);
      if (parsed.kind === "unsupported") {
        throw new Error(`Cannot repair legacy Automation run archive with unsupported version: key=${this._archiveKey}, version=${parsed.version}.`);
      }
      if (parsed.kind === "invalid") {
        throw new Error(`Cannot repair invalid legacy Automation run archive: key=${this._archiveKey}, error=${parsed.error}.`);
      }
      const runs = parsed.runs.map(terminalizeArchivedRun);
      if (runs.every((run, index2) => run === parsed.runs[index2])) {
        this._archivedRuns.set(runs, void 0);
        return;
      }
      const archive = {
        version: LEGACY_RUN_ARCHIVE_VERSION,
        runs: runs.map((run) => ({
          ...run,
          sessionResource: run.sessionResource?.toString()
        }))
      };
      const result = await this._automationStorageService.compareAndSwap(this._archiveKey, raw, JSON.stringify(archive));
      if (result.swapped) {
        this._archivedRuns.set(runs, void 0);
        return;
      }
      raw = result.currentValue;
    }
    throw new Error(`Legacy Automation run archive kept changing while it was being repaired: ${this._archiveKey}`);
  }
  async _archiveRuns(runs) {
    if (runs.length === 0) {
      return;
    }
    let raw = await this._automationStorageService.read(this._archiveKey);
    for (let attempt = 0; attempt < LEGACY_RUN_ARCHIVE_WRITE_ATTEMPTS; attempt++) {
      let current = [];
      if (raw !== void 0) {
        const parsed = parseArchivedRuns(raw);
        if (parsed.kind === "unsupported") {
          throw new Error(`Cannot update legacy Automation run archive with unsupported version: key=${this._archiveKey}, version=${parsed.version}.`);
        }
        if (parsed.kind === "invalid") {
          this._logService.error(`[AgentHostAutomationStore] Replacing invalid legacy run archive: key=${this._archiveKey}, error=${parsed.error}.`);
        } else {
          current = parsed.runs;
          if (parsed.droppedRuns > 0) {
            this._logService.warn(`[AgentHostAutomationStore] Dropping ${parsed.droppedRuns} malformed run(s) while repairing legacy run archive: key=${this._archiveKey}.`);
          }
        }
      }
      const merged = distinctById([...runs, ...current]).map(terminalizeArchivedRun);
      const archive = {
        version: LEGACY_RUN_ARCHIVE_VERSION,
        runs: merged.map((run) => ({
          ...run,
          sessionResource: run.sessionResource?.toString()
        }))
      };
      const next = JSON.stringify(archive);
      const result = await this._automationStorageService.compareAndSwap(this._archiveKey, raw, next);
      if (result.swapped) {
        this._archivedRuns.set(merged, void 0);
        return;
      }
      raw = result.currentValue;
    }
    throw new Error(`Legacy Automation run archive kept changing while it was being updated: ${this._archiveKey}`);
  }
};

AgentHostAutomationStore = __decorateClass([
  __decorateParam(4, ILogService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IAutomationStorageService)
], AgentHostAutomationStore);

function automationResource(id2) {
  return URI.from({ scheme: "ahp-automation", path: `/${id2}` }).toString();
}

function automationId(resource) {
  return URI.parse(resource).path.split("/").filter(Boolean).at(-1) ?? resource;
}

function automationRunId(resource) {
  return URI.parse(resource).path.split("/").filter(Boolean).at(-1) ?? resource;
}

function isTerminalRun(run) {
  return run.lifecycle.status === "completed" /* Completed */ || run.lifecycle.status === "failed" /* Failed */ || run.lifecycle.status === "cancelled" /* Cancelled */;
}

function projectSchedule(triggers) {
  const trigger = triggers.find((trigger2) => trigger2.kind === "schedule" /* Schedule */);
  if (!trigger) {
    return { interval: "manual", scheduleHour: 0, scheduleMinute: 0, scheduleDay: 0 };
  }
  const [minuteValue, hourValue, dayOfMonth, month2, dayValue, ...remaining] = trigger.schedule.expression.trim().split(/\s+/);
  if (remaining.length > 0 || dayOfMonth !== "*" || month2 !== "*") {
    return { interval: "manual", scheduleHour: 0, scheduleMinute: 0, scheduleDay: 0 };
  }
  const scheduleMinute = parseCronValue(minuteValue, 0, 59);
  if (scheduleMinute === void 0) {
    return { interval: "manual", scheduleHour: 0, scheduleMinute: 0, scheduleDay: 0 };
  }
  if (hourValue === "*" && dayValue === "*") {
    return { interval: "hourly", scheduleHour: 0, scheduleMinute, scheduleDay: 0 };
  }
  const scheduleHour = parseCronValue(hourValue, 0, 23);
  if (scheduleHour === void 0) {
    return { interval: "manual", scheduleHour: 0, scheduleMinute: 0, scheduleDay: 0 };
  }
  if (dayValue === "*") {
    return { interval: "daily", scheduleHour, scheduleMinute, scheduleDay: 0 };
  }
  const scheduleDay = parseCronValue(dayValue, 0, 6);
  return scheduleDay === void 0 ? { interval: "manual", scheduleHour: 0, scheduleMinute: 0, scheduleDay: 0 } : { interval: "weekly", scheduleHour, scheduleMinute, scheduleDay };
}

function parseCronValue(value2, minimum, maximum) {
  if (!value2 || !/^\d+$/.test(value2)) {
    return void 0;
  }
  const parsed = Number(value2);
  return parsed >= minimum && parsed <= maximum ? parsed : void 0;
}

function scheduleTrigger(schedule) {
  if (schedule.interval === "manual") {
    return [];
  }
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let expression;
  switch (schedule.interval) {
    case "hourly":
      expression = `${schedule.scheduleMinute} * * * *`;
      break;
    case "daily":
      expression = `${schedule.scheduleMinute} ${schedule.scheduleHour} * * *`;
      break;
    case "weekly":
      expression = `${schedule.scheduleMinute} ${schedule.scheduleHour} * * ${schedule.scheduleDay}`;
      break;
  }
  return [{
    id: "schedule",
    kind: "schedule" /* Schedule */,
    schedule: { expression, timeZone },
    misfirePolicy: "runOnce" /* RunOnce */
  }];
}

function readString(value2) {
  return typeof value2 === "string" ? value2 : void 0;
}

function setOptional(target, key3, value2) {
  if (value2 === void 0) {
    delete target[key3];
  } else {
    target[key3] = value2;
  }
}

function distinctById(items) {
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

function assertTerminalRunHistory(runs) {
  const activeRun = runs.find(isNonTerminalRun);
  if (activeRun) {
    throw new AutomationActiveRunError(activeRun.automationId, activeRun.id);
  }
}

function isNonTerminalRun(run) {
  return run.status === "pending" || run.status === "running";
}

function terminalizeArchivedRun(run) {
  if (!isNonTerminalRun(run)) {
    return run;
  }
  return Object.freeze({
    ...run,
    status: "failed",
    completedAt: run.completedAt ?? run.startedAt,
    errorMessage: run.errorMessage ?? localize(4911, null)
  });
}

function isSerializedArchivedRun(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return false;
  }
  const run = value2;
  return typeof run["id"] === "string" && typeof run["automationId"] === "string" && (run["status"] === "pending" || run["status"] === "running" || run["status"] === "completed" || run["status"] === "failed") && (run["trigger"] === "schedule" || run["trigger"] === "catch_up" || run["trigger"] === "manual") && typeof run["startedAt"] === "string" && typeof run["leaderWindowId"] === "number" && (run["sessionResource"] === void 0 || typeof run["sessionResource"] === "string") && (run["completedAt"] === void 0 || typeof run["completedAt"] === "string") && (run["errorMessage"] === void 0 || typeof run["errorMessage"] === "string");
}

function parseArchivedRuns(raw) {
  let value2;
  try {
    value2 = JSON.parse(raw);
  } catch (error) {
    return { kind: "invalid", error: error instanceof Error ? error.message : String(error) };
  }
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return { kind: "invalid", error: "archive is not an object" };
  }
  const archive = value2;
  if (typeof archive["version"] === "number" && archive["version"] > LEGACY_RUN_ARCHIVE_VERSION) {
    return { kind: "unsupported", version: archive["version"] };
  }
  if (archive["version"] !== LEGACY_RUN_ARCHIVE_VERSION || !Array.isArray(archive["runs"])) {
    return { kind: "invalid", error: "archive has an invalid version or runs collection" };
  }
  const runs = [];
  for (const run of archive["runs"]) {
    if (!isSerializedArchivedRun(run)) {
      continue;
    }
    try {
      runs.push({
        ...run,
        sessionResource: run.sessionResource ? URI.parse(run.sessionResource) : void 0
      });
    } catch {
      continue;
    }
  }
  return { kind: "archive", runs, droppedRuns: archive["runs"].length - runs.length };
}
export { automationResource, automationId, automationRunId, isTerminalRun, projectSchedule, parseCronValue, scheduleTrigger, readString, setOptional, distinctById, assertTerminalRunHistory, isNonTerminalRun, terminalizeArchivedRun, isSerializedArchivedRun, parseArchivedRuns, MUTATION_TIMEOUT_MS, MIGRATION_POLL_INTERVAL_MS, LEGACY_RUN_ARCHIVE_VERSION, LEGACY_RUN_ARCHIVE_WRITE_ATTEMPTS, AgentHostAutomationStore };
