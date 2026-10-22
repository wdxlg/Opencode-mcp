// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automationService.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { computeNextRunAt } from "./module-2639.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isChatPermissionLevel } from "./module-0965.mjs";
import { publishAutomationCreated, publishAutomationDeleted, publishAutomationUpdated } from "./module-3679.mjs";
import { serializeAutomationEditableState } from "./module-2218.mjs";
import { transaction } from "./module-0045.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { AUTOMATION_STORAGE_KEY, IAutomationStorageService } from "./module-3680.mjs";


// src/vs/sessions/contrib/automations/browser/automationService.ts
var LEGACY_SCHEMA_VERSIONS = /* @__PURE__ */ new Set([1, 2]);

var CURRENT_SCHEMA_VERSION = 3;

var MAX_RUNS_PER_AUTOMATION = 50;

var EMPTY_LEDGER = Object.freeze({ automations: [], runs: [] });

var AutomationStore = class extends Disposable {
  constructor(storageKey, storageService, logService, telemetryService, automationStorageService) {
    super();
    this.storageKey = storageKey;
    this.storageService = storageService;
    this.logService = logService;
    this.telemetryService = telemetryService;
    this.automationStorageService = automationStorageService;
    this._runsForCache = /* @__PURE__ */ new Map();
    this._lastSeenRevision = 0;
    this._canCompleteMigration = true;
    this._now = () => /* @__PURE__ */ new Date();
    const result = this.readLedger(this.storageService.get(this.storageKey, -1 /* APPLICATION */));
    const initial = result.kind === "unsupportedSchema" ? EMPTY_LEDGER : result.ledger;
    this._canCompleteMigration = result.kind === "ledger";
    if (result.kind !== "unsupportedSchema") {
      this._lastSeenRevision = result.revision;
    }
    this._automations = observableValue(this, initial.automations);
    this._runs = observableValue(this, initial.runs);
    this.automations = this._automations;
    this.runs = this._runs;
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, this.storageKey, this._store)(() => {
      this.refreshFromStorage();
    }));
  }
  /** Test-only: swap in a deterministic clock used by create/update. */
  setClockForTesting(now) {
    this._now = now;
  }
  getAutomation(id2) {
    return this._automations.get().find((a) => a.id === id2);
  }
  canCompleteMigration() {
    return this._canCompleteMigration;
  }
  runsFor(automationId2) {
    let cached = this._runsForCache.get(automationId2);
    if (!cached) {
      cached = derived(this, (reader) => this._runs.read(reader).filter((r2) => r2.automationId === automationId2));
      this._runsForCache.set(automationId2, cached);
    }
    return cached;
  }
  async createAutomation(options3, mutationGuard) {
    const now = this._now();
    const nowIso = now.toISOString();
    const nextRun = computeNextRunAt(options3.schedule, now);
    const automation = Object.freeze({
      id: generateUuid(),
      name: options3.name,
      prompt: options3.prompt,
      schedule: options3.schedule,
      target: normalizeAutomationTarget(options3.target),
      modelId: options3.modelId,
      mode: options3.mode,
      permissionLevel: isChatPermissionLevel(options3.permissionLevel) ? options3.permissionLevel : void 0,
      enabled: options3.enabled ?? true,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastRunAt: void 0,
      nextRunAt: nextRun?.toISOString()
    });
    await this.mutateLedger((ledger) => ({
      kind: "commit",
      ledger: { automations: [automation, ...ledger.automations], runs: ledger.runs },
      result: void 0
    }), mutationGuard);
    publishAutomationCreated(this.telemetryService, automation);
    return automation;
  }
  async updateAutomation(id2, patch2) {
    const now = this._now();
    const result = await this.mutateLedger((ledger) => {
      const current = ledger.automations.find((automation) => automation.id === id2);
      if (!current) {
        throw new Error(`Automation not found: ${id2}`);
      }
      const updated = updateAutomation(current, patch2, now);
      return {
        kind: "commit",
        ledger: {
          automations: ledger.automations.map((automation) => automation.id === id2 ? updated : automation),
          runs: ledger.runs
        },
        result: { current, updated }
      };
    });
    publishAutomationUpdated(this.telemetryService, result.current, result.updated);
    return result.updated;
  }
  async updateAutomationIfUnchanged(id2, patch2, expected, mutationGuard) {
    const now = this._now();
    let previous;
    const result = await this.mutateLedger((ledger) => {
      const current = ledger.automations.find((automation) => automation.id === id2);
      if (!current || serializeAutomationEditableState(current) !== serializeAutomationEditableState(expected)) {
        return {
          kind: "noChange",
          result: { kind: "conflict", current }
        };
      }
      const updated = updateAutomation(current, patch2, now);
      previous = current;
      return {
        kind: "commit",
        ledger: {
          automations: ledger.automations.map((automation) => automation.id === id2 ? updated : automation),
          runs: ledger.runs
        },
        result: { kind: "updated", automation: updated }
      };
    }, mutationGuard);
    if (result.kind === "conflict" || !previous) {
      return result;
    }
    publishAutomationUpdated(this.telemetryService, previous, result.automation);
    return result;
  }
  async deleteAutomation(id2, mutationGuard) {
    const existing = await this.mutateLedger((ledger) => {
      const automation = ledger.automations.find((automation2) => automation2.id === id2);
      if (!automation) {
        return { kind: "noChange", result: void 0 };
      }
      return {
        kind: "commit",
        ledger: {
          automations: ledger.automations.filter((automation2) => automation2.id !== id2),
          runs: ledger.runs.filter((run) => run.automationId !== id2)
        },
        result: automation
      };
    }, mutationGuard);
    if (!existing) {
      return;
    }
    this._runsForCache.delete(id2);
    publishAutomationDeleted(this.telemetryService, existing);
  }
  async importAutomationSnapshot(snapshot) {
    const { automation, runs } = snapshot;
    return this.mutateLedger((ledger) => {
      const existing = ledger.automations.find((candidate) => candidate.id === automation.id);
      if (existing) {
        const current = {
          automation: existing,
          runs: ledger.runs.filter((run) => run.automationId === automation.id)
        };
        return areAutomationSnapshotsEqual(current, snapshot) ? { kind: "noChange", result: { kind: "alreadyPresent" } } : { kind: "noChange", result: { kind: "conflict", current } };
      }
      return {
        kind: "commit",
        ledger: {
          automations: [automation, ...ledger.automations],
          runs: [...runs, ...ledger.runs]
        },
        result: { kind: "inserted" }
      };
    });
  }
  async upsertAutomationSnapshot(snapshot) {
    const { automation, runs } = snapshot;
    await this.mutateLedger((ledger) => {
      const existing = ledger.automations.find((candidate) => candidate.id === automation.id);
      const existingRunIds = new Set(ledger.runs.map((run) => run.id));
      const missingRuns = runs.filter((run) => !existingRunIds.has(run.id));
      if (existing && JSON.stringify(serializeAutomation(existing)) === JSON.stringify(serializeAutomation(automation)) && missingRuns.length === 0) {
        return { kind: "noChange", result: void 0 };
      }
      return {
        kind: "commit",
        ledger: {
          automations: existing ? ledger.automations.map((candidate) => candidate.id === automation.id ? automation : candidate) : [automation, ...ledger.automations],
          runs: [...missingRuns, ...ledger.runs]
        },
        result: void 0
      };
    });
  }
  async removeAutomationSnapshotIfUnchanged(expected) {
    const result = await this.mutateLedger((ledger) => {
      const current = ledger.automations.find((candidate) => candidate.id === expected.automation.id);
      if (!current) {
        return { kind: "noChange", result: { kind: "missing" } };
      }
      const currentRuns = ledger.runs.filter((run) => run.automationId === expected.automation.id);
      const currentSnapshot = { automation: current, runs: currentRuns };
      if (!areAutomationSnapshotsEqual(currentSnapshot, expected)) {
        return {
          kind: "noChange",
          result: { kind: "conflict", current: currentSnapshot }
        };
      }
      return {
        kind: "commit",
        ledger: {
          automations: ledger.automations.filter((candidate) => candidate.id !== expected.automation.id),
          runs: ledger.runs.filter((run) => run.automationId !== expected.automation.id)
        },
        result: { kind: "removed" }
      };
    });
    if (result.kind === "removed") {
      this._runsForCache.delete(expected.automation.id);
    }
    return result;
  }
  async recordRunStart(automationId2, trigger, leaderWindowId) {
    const now = this._now();
    const startedAt = now.toISOString();
    const run = Object.freeze({
      id: generateUuid(),
      automationId: automationId2,
      status: "pending",
      trigger,
      startedAt,
      leaderWindowId
    });
    return this.mutateLedger((ledger) => {
      const automation = ledger.automations.find((automation2) => automation2.id === automationId2);
      if (!automation) {
        throw new Error(`Automation not found: ${automationId2}`);
      }
      const activeRun = findActiveRun(ledger.runs, automationId2);
      if (activeRun) {
        return { kind: "noChange", result: { claimed: false, run: activeRun } };
      }
      let automations = ledger.automations;
      if (trigger !== "manual") {
        const updatedAutomation = Object.freeze({
          ...automation,
          lastRunAt: startedAt,
          nextRunAt: computeNextRunAt(automation.schedule, now)?.toISOString(),
          updatedAt: startedAt
        });
        automations = automations.map((automation2) => automation2.id === automationId2 ? updatedAutomation : automation2);
      }
      return {
        kind: "commit",
        ledger: { automations, runs: [run, ...ledger.runs] },
        result: { claimed: true, run }
      };
    });
  }
  async updateRun(runId, patch2) {
    return this.mutateLedger((ledger) => {
      const current = ledger.runs.find((run) => run.id === runId);
      if (!current) {
        return { kind: "noChange", result: void 0 };
      }
      const updated = Object.freeze({
        ...current,
        status: patch2.status ?? current.status,
        sessionResource: patch2.sessionResource ?? current.sessionResource,
        completedAt: patch2.completedAt ?? current.completedAt,
        errorMessage: patch2.errorMessage ?? current.errorMessage
      });
      return {
        kind: "commit",
        ledger: {
          automations: ledger.automations,
          runs: ledger.runs.map((run) => run.id === runId ? updated : run)
        },
        result: updated
      };
    });
  }
  async deleteRun(runId) {
    await this.mutateLedger((ledger) => {
      if (!ledger.runs.some((run) => run.id === runId)) {
        return { kind: "noChange", result: void 0 };
      }
      return {
        kind: "commit",
        ledger: {
          automations: ledger.automations,
          runs: ledger.runs.filter((run) => run.id !== runId)
        },
        result: void 0
      };
    });
  }
  getActiveRunFor(automationId2) {
    return findActiveRun(this._runs.get(), automationId2);
  }
  async markStaleRunsFailed(reason) {
    const completedAt = this._now().toISOString();
    await this.mutateLedger((ledger) => {
      let changed = false;
      const runs = ledger.runs.map((run) => {
        if (run.status === "pending" || run.status === "running") {
          changed = true;
          return Object.freeze({ ...run, status: "failed", completedAt, errorMessage: reason });
        }
        return run;
      });
      if (!changed) {
        return { kind: "noChange", result: void 0 };
      }
      return {
        kind: "commit",
        ledger: { automations: ledger.automations, runs },
        result: void 0
      };
    });
  }
  //#region Persistence
  async mutateLedger(mutate, mutationGuard) {
    let raw = await this.automationStorageService.read(this.storageKey);
    while (true) {
      const readResult = this.readLedger(raw);
      if (readResult.kind === "unsupportedSchema") {
        throw new Error("Cannot modify automations: storage was written by a newer version");
      }
      if (readResult.kind === "invalid") {
        throw new Error("Cannot modify automations: persisted storage contains data this version cannot safely interpret");
      }
      this.acceptLedger(readResult.ledger, readResult.revision);
      const mutation = mutate(readResult.ledger);
      if (mutation.kind === "noChange") {
        return mutation.result;
      }
      const ledger = {
        automations: mutation.ledger.automations,
        runs: trimRunsPerAutomation(mutation.ledger.runs, MAX_RUNS_PER_AUTOMATION)
      };
      const revision = readResult.revision + 1;
      const serialized = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        revision,
        automations: ledger.automations.map(serializeAutomation),
        runs: ledger.runs.map((run) => ({ ...run, sessionResource: run.sessionResource?.toString() }))
      };
      const newValue = JSON.stringify(serialized);
      mutationGuard?.();
      const writeResult = await this.automationStorageService.compareAndSwap(this.storageKey, raw, newValue);
      if (writeResult.swapped) {
        this.setLedger(ledger, revision);
        return mutation.result;
      }
      if (writeResult.currentValue === raw) {
        throw new Error("Automation storage rejected an unchanged compare-and-swap value.");
      }
      raw = writeResult.currentValue;
    }
  }
  acceptLedger(ledger, revision) {
    if (revision < this._lastSeenRevision) {
      return;
    }
    this.setLedger(ledger, revision);
  }
  setLedger(ledger, revision) {
    this._lastSeenRevision = revision;
    transaction((tx) => {
      this._automations.set(ledger.automations, tx);
      this._runs.set(ledger.runs, tx);
    });
  }
  refreshFromStorage() {
    const result = this.readLedger(this.storageService.get(this.storageKey, -1 /* APPLICATION */));
    if (result.kind === "unsupportedSchema") {
      this._canCompleteMigration = false;
      return;
    }
    this._canCompleteMigration = result.kind === "ledger";
    this.acceptLedger(result.ledger, result.revision);
  }
  readLedger(raw) {
    if (!raw) {
      return { kind: "ledger", ledger: EMPTY_LEDGER, revision: 0 };
    }
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.schemaVersion === "number" && parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
        this.logService.warn(`[AutomationService] Ledger has schema v${parsed.schemaVersion}; this build only supports v${CURRENT_SCHEMA_VERSION}. Entering read-only mode.`);
        return { kind: "unsupportedSchema" };
      }
      if (parsed?.schemaVersion !== CURRENT_SCHEMA_VERSION && !LEGACY_SCHEMA_VERSIONS.has(parsed?.schemaVersion)) {
        this.logService.warn(`[AutomationService] Unsupported ledger schema version ${parsed?.schemaVersion}; ignoring.`);
        return { kind: "invalid", ledger: EMPTY_LEDGER, revision: 0 };
      }
      const automations = [];
      const invalid = !Array.isArray(parsed.automations) || !Array.isArray(parsed.runs);
      if (parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
        const entries2 = Array.isArray(parsed.automations) ? parsed.automations : [];
        for (const entry of entries2) {
          try {
            const automation = deserializeAutomation(entry);
            if (automation) {
              automations.push(automation);
            } else {
              this.logService.warn(`[AutomationService] Dropping persisted automation ${entry?.id} with an invalid target.`);
            }
          } catch (err) {
            this.logService.warn(`[AutomationService] Dropping malformed persisted automation ${entry?.id}.`, err);
          }
        }
      } else {
        const entries2 = Array.isArray(parsed.automations) ? parsed.automations : [];
        for (const entry of entries2) {
          try {
            const automation = deserializeLegacyAutomation(entry);
            if (automation) {
              automations.push(automation);
            } else {
              this.logService.warn(`[AutomationService] Dropping persisted automation ${entry?.id} with an invalid legacy target.`);
            }
          } catch (err) {
            this.logService.warn(`[AutomationService] Dropping malformed persisted automation ${entry?.id}.`, err);
          }
        }
      }
      const validIds = new Set(automations.map((a) => a.id));
      const serializedRuns = Array.isArray(parsed.runs) ? parsed.runs : [];
      const runs = serializedRuns.filter((run) => isSerializedAutomationRun(run) && validIds.has(run.automationId)).map((r2) => Object.freeze({ ...r2, sessionResource: r2.sessionResource ? URI.parse(r2.sessionResource) : void 0 }));
      const revision = typeof parsed.revision === "number" ? parsed.revision : 0;
      return { kind: invalid ? "invalid" : "ledger", ledger: { automations, runs: trimRunsPerAutomation(runs, MAX_RUNS_PER_AUTOMATION) }, revision };
    } catch (err) {
      this.logService.error("[AutomationService] Failed to parse automations ledger; resetting.", err);
      return { kind: "invalid", ledger: EMPTY_LEDGER, revision: 0 };
    }
  }
  //#endregion
};

AutomationStore = __decorateClass([
  __decorateParam(1, IStorageService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IAutomationStorageService)
], AutomationStore);

var AutomationService = class extends AutomationStore {
  constructor(storageService, logService, telemetryService, automationStorageService) {
    super(AUTOMATION_STORAGE_KEY, storageService, logService, telemetryService, automationStorageService);
  }
  startStaleRunRecovery(reason) {
    return this.markStaleRunsFailed(reason);
  }
  stopStaleRunRecovery() {
  }
};

AutomationService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IAutomationStorageService)
], AutomationService);

function serializeAutomation(a) {
  return {
    id: a.id,
    name: a.name,
    prompt: a.prompt,
    schedule: a.schedule,
    target: serializeAutomationTarget(a.target),
    modelId: a.modelId,
    mode: a.mode,
    permissionLevel: a.permissionLevel,
    enabled: a.enabled,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    lastRunAt: a.lastRunAt,
    nextRunAt: a.nextRunAt
  };
}

function areAutomationSnapshotsEqual(first2, second) {
  const normalizeRuns = (runs) => runs.map((run) => ({ ...run, sessionResource: run.sessionResource?.toString() }));
  return JSON.stringify(serializeAutomation(first2.automation)) === JSON.stringify(serializeAutomation(second.automation)) && JSON.stringify(normalizeRuns(first2.runs)) === JSON.stringify(normalizeRuns(second.runs));
}

function isSerializedAutomationRun(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return false;
  }
  const run = value2;
  return typeof run["id"] === "string" && typeof run["automationId"] === "string" && (run["status"] === "pending" || run["status"] === "running" || run["status"] === "completed" || run["status"] === "failed") && (run["trigger"] === "schedule" || run["trigger"] === "catch_up" || run["trigger"] === "manual") && typeof run["startedAt"] === "string" && typeof run["leaderWindowId"] === "number" && (run["sessionResource"] === void 0 || typeof run["sessionResource"] === "string") && (run["completedAt"] === void 0 || typeof run["completedAt"] === "string") && (run["errorMessage"] === void 0 || typeof run["errorMessage"] === "string");
}

function deserializeAutomation(s) {
  const target = deserializeAutomationTarget(s.target);
  return target ? createAutomationFromSerialized(s, target) : void 0;
}

function deserializeLegacyAutomation(s) {
  let target;
  if (s.isQuickChat === true) {
    if (!s.providerId || !s.sessionTypeId) {
      return void 0;
    }
    target = createQuickChatAutomationTarget(s.providerId, s.sessionTypeId);
  } else {
    if (!s.folderUri) {
      return void 0;
    }
    target = createWorkspaceAutomationTarget(
      URI.revive(s.folderUri),
      s.providerId,
      s.sessionTypeId,
      deserializeLegacyIsolation(s.isolationMode, s.branch)
    );
  }
  return createAutomationFromSerialized(s, target);
}

function createAutomationFromSerialized(s, target) {
  const permissionLevel = isChatPermissionLevel(s.permissionLevel) ? s.permissionLevel : "default" /* Default */;
  return Object.freeze({
    id: s.id,
    name: s.name,
    prompt: s.prompt,
    schedule: s.schedule,
    target,
    modelId: s.modelId,
    mode: s.mode,
    permissionLevel,
    enabled: s.enabled,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    lastRunAt: s.lastRunAt,
    nextRunAt: s.nextRunAt
  });
}

function updateAutomation(current, patch2, now) {
  const merged = mergeAutomation(current, patch2);
  const scheduleChanged = patch2.schedule !== void 0;
  const enabledChanged = patch2.enabled !== void 0;
  return Object.freeze({
    ...merged,
    updatedAt: now.toISOString(),
    nextRunAt: scheduleChanged || enabledChanged && merged.enabled ? computeNextRunAt(merged.schedule, now)?.toISOString() : merged.nextRunAt
  });
}

function mergeAutomation(current, patch2) {
  return {
    ...current,
    name: patch2.name ?? current.name,
    prompt: patch2.prompt ?? current.prompt,
    schedule: patch2.schedule ?? current.schedule,
    target: patch2.target ? normalizeAutomationTarget(patch2.target) : current.target,
    modelId: patch2.modelId === null ? void 0 : patch2.modelId ?? current.modelId,
    mode: patch2.mode === null ? void 0 : patch2.mode ?? current.mode,
    permissionLevel: patch2.permissionLevel === null ? void 0 : patch2.permissionLevel && isChatPermissionLevel(patch2.permissionLevel) ? patch2.permissionLevel : current.permissionLevel,
    enabled: patch2.enabled ?? current.enabled
  };
}

function normalizeAutomationTarget(target) {
  if (target.kind === "quickChat") {
    if (!target.providerId || !target.sessionTypeId) {
      throw new Error("Workspace-less automation requires a providerId and sessionTypeId.");
    }
    return createQuickChatAutomationTarget(target.providerId, target.sessionTypeId);
  }
  if (!target.folderUri) {
    throw new Error("Workspace-backed automation requires a folderUri.");
  }
  return createWorkspaceAutomationTarget(
    target.folderUri,
    target.providerId,
    target.sessionTypeId,
    target.isolation
  );
}

function serializeAutomationTarget(target) {
  return target.kind === "quickChat" ? { kind: "quickChat", providerId: target.providerId, sessionTypeId: target.sessionTypeId } : {
    kind: "workspace",
    // Serialize explicit components rather than URI.toJSON(). toJSON() emits lazily
    // cached fsPath and formatted fields only after they have been accessed, so two URIs
    // for the same folder can serialize differently and break snapshot equality checks.
    folderUri: {
      scheme: target.folderUri.scheme,
      authority: target.folderUri.authority,
      path: target.folderUri.path,
      query: target.folderUri.query,
      fragment: target.folderUri.fragment
    },
    providerId: target.providerId,
    sessionTypeId: target.sessionTypeId,
    isolation: target.isolation
  };
}

function deserializeAutomationTarget(target) {
  if (target?.kind === "quickChat") {
    return target.providerId && target.sessionTypeId ? createQuickChatAutomationTarget(target.providerId, target.sessionTypeId) : void 0;
  }
  if (target?.kind !== "workspace" || !target.folderUri || !isAutomationWorkspaceIsolation(target.isolation)) {
    return void 0;
  }
  return createWorkspaceAutomationTarget(
    URI.revive(target.folderUri),
    target.providerId,
    target.sessionTypeId,
    target.isolation
  );
}

function deserializeLegacyIsolation(isolationMode, branch) {
  if (isolationMode === "worktree") {
    return branch ? { kind: "worktree", branch } : { kind: "default" };
  }
  return isolationMode === "workspace" ? { kind: "folder" } : { kind: "default" };
}

function normalizeAutomationWorkspaceIsolation(isolation) {
  if (isolation?.kind === "default") {
    return Object.freeze({ kind: "default" });
  }
  if (isolation?.kind === "folder") {
    return Object.freeze({ kind: "folder" });
  }
  if (isolation?.kind === "worktree" && isolation.branch) {
    return Object.freeze({ kind: "worktree", branch: isolation.branch });
  }
  if (isolation?.kind === "worktree") {
    throw new Error("Worktree automation requires a branch.");
  }
  throw new Error("Workspace-backed automation requires a valid isolation mode.");
}

function createQuickChatAutomationTarget(providerId, sessionTypeId) {
  return Object.freeze({ kind: "quickChat", providerId, sessionTypeId });
}

function createWorkspaceAutomationTarget(folderUri, providerId, sessionTypeId, isolation) {
  return Object.freeze({
    kind: "workspace",
    folderUri,
    ...providerId !== void 0 ? { providerId } : {},
    ...sessionTypeId !== void 0 ? { sessionTypeId } : {},
    isolation: normalizeAutomationWorkspaceIsolation(isolation)
  });
}

function isAutomationWorkspaceIsolation(value2) {
  return value2?.kind === "default" || value2?.kind === "folder" || value2?.kind === "worktree" && typeof value2.branch === "string" && value2.branch.length > 0;
}

function findActiveRun(runs, automationId2) {
  return runs.find((run) => run.automationId === automationId2 && (run.status === "pending" || run.status === "running"));
}

function trimRunsPerAutomation(runs, max) {
  const counts = /* @__PURE__ */ new Map();
  const out = [];
  for (const run of runs) {
    const count2 = counts.get(run.automationId) ?? 0;
    if (count2 >= max) {
      continue;
    }
    counts.set(run.automationId, count2 + 1);
    out.push(run);
  }
  return out.length === runs.length ? runs : out;
}
export { serializeAutomation, areAutomationSnapshotsEqual, isSerializedAutomationRun, deserializeAutomation, deserializeLegacyAutomation, createAutomationFromSerialized, updateAutomation, mergeAutomation, normalizeAutomationTarget, serializeAutomationTarget, deserializeAutomationTarget, deserializeLegacyIsolation, normalizeAutomationWorkspaceIsolation, createQuickChatAutomationTarget, createWorkspaceAutomationTarget, isAutomationWorkspaceIsolation, findActiveRun, trimRunsPerAutomation, LEGACY_SCHEMA_VERSIONS, CURRENT_SCHEMA_VERSION, MAX_RUNS_PER_AUTOMATION, EMPTY_LEDGER, AutomationStore, AutomationService };
