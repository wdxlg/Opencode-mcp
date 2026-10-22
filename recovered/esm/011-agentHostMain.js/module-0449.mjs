// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostAutomationService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable, DisposableMap, MutableDisposable } from "./module-0010.mjs";
import { AGENT_HOST_AUTOMATIONS_ENABLED_CONFIG_KEY, AGENT_HOST_AUTOMATION_CATALOG_MIGRATED_META_KEY, AGENT_HOST_AUTOMATION_RUN_TIMEOUT_MINUTES_CONFIG_KEY } from "./module-0447.mjs";
import { AUTOMATION_CATALOG_URI, isDefaultChatUri, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { isAgentHostLegacyAutomationImportPending } from "./module-0448.mjs";
import { equals2 } from "./module-0035.mjs";
import { automationReducer } from "./module-0095.mjs";
import { URI } from "./module-0023.mjs";
import { nextAutomationCronOccurrence, validateAutomationCron } from "./module-0446.mjs";
import { disposableTimeout } from "./module-0027.mjs";
import { toErrorMessage } from "./module-0080.mjs";
import { generateUuid } from "./module-0042.mjs";
import { localize } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostStorageService } from "./module-0164.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostAutomationService.ts
var STORAGE_KEY2 = "automations";

var SCHEDULE_CURSORS_META_KEY = "vscode.scheduleCursors";

var SCHEDULE_RETRY_DELAY_MS = 6e4;

var RUN_HISTORY_PAGE_SIZE = 50;

var DEFAULT_RUN_TIMEOUT_MINUTES = 30;

var IAgentHostAutomationService = createDecorator("agentHostAutomationService");

var AgentHostAutomationService = class extends Disposable {
  constructor(_execution, _stateManager, _storageService, _logService) {
    super();
    this._execution = _execution;
    this._stateManager = _stateManager;
    this._storageService = _storageService;
    this._logService = _logService;
    this._runs = /* @__PURE__ */ new Map();
    this._manualRunRequests = /* @__PURE__ */ new Map();
    this._mutationTail = Promise.resolve();
    this._scheduleTimer = this._register(new MutableDisposable());
    this._runTimeouts = this._register(new DisposableMap());
    this._didRecoverRuns = false;
    this._log = (message) => this._logService.warn(`[AgentHostAutomationService] ${message}`);
    const stored = this._load();
    this._migrationCompletedAt = stored?.migration?.completedAt;
    this._runs = new Map(stored?.runs?.map((run2) => [run2.resource, run2]));
    this._catalog = stored?.catalog ? {
      ...stored.catalog,
      automations: stored.catalog.automations.map((automation) => withRunWindow(automation, this._runs, RUN_HISTORY_PAGE_SIZE)),
      ...this._migrationCompletedAt ? { _meta: { ...stored.catalog._meta, [AGENT_HOST_AUTOMATION_CATALOG_MIGRATED_META_KEY]: true } } : {}
    } : void 0;
    this._manualRunRequests = new Map(stored?.manualRunRequests?.map((request) => [request.requestId, request]));
    if (this._catalog) {
      this._stateManager.setAutomationCatalogState(this._catalog);
    }
    for (const run2 of this._runs.values()) {
      this._stateManager.setAutomationRunState(run2);
    }
    this._register(this._stateManager.onDidEmitEnvelope((envelope) => this._handleEnvelope(envelope)));
    if (this._migrationCompletedAt && this._isAutomationsEnabled()) {
      void Promise.resolve().then(() => {
        this._recoverRuns();
        this._scheduleNext();
      });
    }
  }
  get isAvailable() {
    return this._catalog !== void 0;
  }
  get capabilities() {
    return this.isAvailable ? {
      create: {},
      schedules: {},
      runCancellation: {},
      runHistoryLimit: RUN_HISTORY_PAGE_SIZE
    } : void 0;
  }
  async completeMigration(expectedResources) {
    return this._enqueueMutation(async () => {
      const catalog = this._requireCatalog();
      if (!this._isAutomationsEnabled()) {
        throw new Error("Automations must be enabled before migration can complete.");
      }
      if (this._migrationCompletedAt !== void 0) {
        return;
      }
      const missing = (expectedResources ?? catalog.automations.map((automation) => automation.resource)).filter((resource) => !catalog.automations.some((automation) => automation.resource === resource));
      if (missing.length > 0) {
        throw new Error(`Automation migration is incomplete; ${missing.length} expected automation resources are missing.`);
      }
      const completedAt = (/* @__PURE__ */ new Date()).toISOString();
      const priorCompletedAt = this._migrationCompletedAt;
      this._migrationCompletedAt = completedAt;
      let migratedCatalog;
      try {
        migratedCatalog = {
          ...catalog,
          _meta: { ...catalog._meta, [AGENT_HOST_AUTOMATION_CATALOG_MIGRATED_META_KEY]: true },
          automations: catalog.automations.map((automation) => ({
            ...automation,
            operations: this._migrationOperationsForItem(automation)
          }))
        };
        await this._persist(migratedCatalog, this._runs, this._manualRunRequests, completedAt);
      } catch (error) {
        this._migrationCompletedAt = priorCompletedAt;
        throw error;
      }
      this._catalog = migratedCatalog;
      this._stateManager.setAutomationCatalogState(migratedCatalog);
      for (const automation of migratedCatalog.automations) {
        this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, { type: "automation/set" /* AutomationSet */, automation });
      }
      this._logService.info(`[AgentHostAutomationService] Automation migration completed: discovered=${expectedResources?.length ?? migratedCatalog.automations.length}, automations=${migratedCatalog.automations.length}, runs=${this._runs.size}.`);
      this._recoverRuns();
      this._scheduleNext();
    });
  }
  _migrationOperationsForItem(automation) {
    if (!this._canGrantRun(automation.definition)) {
      return automation.operations.filter((op) => op !== "run" /* Run */ && op !== "remove" /* Remove */);
    }
    return automation.runs.some((run2) => !isTerminalLifecycle(run2.lifecycle)) ? withOperation(automation.operations, "run" /* Run */).filter((operation) => operation !== "remove" /* Remove */) : withOperation(withOperation(automation.operations, "run" /* Run */), "remove" /* Remove */);
  }
  _canGrantRun(definition) {
    return this._migrationCompletedAt !== void 0 && this._isAutomationsEnabled() && !isAgentHostLegacyAutomationImportPending(definition);
  }
  async handleConfigurationChanged() {
    return this._enqueueMutation(async () => {
      const catalog = this._requireCatalog();
      const nextCatalog = {
        ...catalog,
        automations: catalog.automations.map((automation) => ({
          ...automation,
          operations: this._canGrantRun(automation.definition) ? withOperation(automation.operations, "run" /* Run */) : automation.operations.filter((operation) => operation !== "run" /* Run */ && (!isAgentHostLegacyAutomationImportPending(automation.definition) || operation !== "remove" /* Remove */))
        }))
      };
      if (!equals2(nextCatalog, catalog)) {
        await this._persist(nextCatalog, this._runs, this._manualRunRequests);
        this._catalog = nextCatalog;
        for (const automation of nextCatalog.automations) {
          this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, { type: "automation/set" /* AutomationSet */, automation });
        }
      }
      if (this._migrationCompletedAt !== void 0 && this._isAutomationsEnabled()) {
        this._recoverRuns();
        this._scheduleNext();
      } else {
        this._scheduleTimer.clear();
      }
    });
  }
  handleAgentsChanged() {
    if (!this._migrationCompletedAt || !this._isAutomationsEnabled()) {
      return;
    }
    this._startPendingRuns();
    this._scheduleNext();
  }
  async handleCreate(action) {
    return this._enqueueMutation(() => this._handleCreate(action));
  }
  async _handleCreate(action) {
    const catalog = this._requireCatalog();
    this._validateAutomationResource(action.resource);
    const definition = action.definition;
    this._validateDefinition(definition);
    const existing = catalog.automations.find((automation2) => automation2.resource === action.resource);
    if (existing && equals2(existing.definition, definition)) {
      this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, { type: "automation/set" /* AutomationSet */, automation: existing });
      return;
    }
    if (existing) {
      throw new Error(`Automation already exists: ${action.resource}`);
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const pending = isAgentHostLegacyAutomationImportPending(definition);
    const automation = this._withInitialScheduleState({
      resource: action.resource,
      definition,
      runs: [],
      operations: [
        "update" /* Update */,
        ...pending ? [] : ["remove" /* Remove */],
        ...this._canGrantRun(definition) ? ["run" /* Run */] : []
      ],
      createdAt: timestamp,
      modifiedAt: timestamp
    }, new Date(timestamp));
    const next = automationReducer(catalog, { type: "automation/set" /* AutomationSet */, automation }, this._log);
    await this._persist(next, this._runs, this._manualRunRequests);
    this._catalog = next;
    this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, { type: "automation/set" /* AutomationSet */, automation });
    this._scheduleNext();
  }
  async handleUpdate(action) {
    return this._enqueueMutation(() => this._handleUpdate(action));
  }
  async _handleUpdate(action) {
    const catalog = this._requireCatalog();
    const existing = catalog.automations.find((automation2) => automation2.resource === action.resource);
    if (!existing) {
      throw new Error(`Automation not found: ${action.resource}`);
    }
    this._requireOperation(existing, "update" /* Update */);
    let automation = {
      ...existing,
      definition: {
        ...existing.definition,
        ...action.changes
      },
      modifiedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this._validateDefinition(automation.definition);
    if (action.changes.triggers !== void 0 || action.changes.enabled !== void 0) {
      automation = this._withInitialScheduleState(automation, /* @__PURE__ */ new Date());
    }
    let operations = automation.operations;
    if (isAgentHostLegacyAutomationImportPending(existing.definition) && !isAgentHostLegacyAutomationImportPending(automation.definition) && !operations.includes("remove" /* Remove */)) {
      operations = withOperation(operations, "remove" /* Remove */);
    }
    if (isAgentHostLegacyAutomationImportPending(automation.definition)) {
      operations = operations.filter((operation) => operation !== "run" /* Run */ && operation !== "remove" /* Remove */);
    } else if (this._canGrantRun(automation.definition)) {
      operations = withOperation(operations, "run" /* Run */);
    } else if (operations.includes("run" /* Run */)) {
      operations = operations.filter((op) => op !== "run" /* Run */);
    }
    if (operations !== automation.operations) {
      automation = { ...automation, operations };
    }
    const next = automationReducer(catalog, { type: "automation/set" /* AutomationSet */, automation }, this._log);
    await this._persist(next, this._runs, this._manualRunRequests);
    this._catalog = next;
    this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, { type: "automation/set" /* AutomationSet */, automation });
    this._scheduleNext();
  }
  async handleRemove(action) {
    return this._enqueueMutation(() => this._handleRemove(action));
  }
  async _handleRemove(action) {
    const catalog = this._requireCatalog();
    const existing = catalog.automations.find((automation) => automation.resource === action.resource);
    if (!existing) {
      return;
    }
    this._requireOperation(existing, "remove" /* Remove */);
    if (existing.runs.some((run2) => !isTerminalLifecycle(run2.lifecycle))) {
      throw new Error(`Automation has an active run and cannot be removed: ${action.resource}`);
    }
    const next = automationReducer(catalog, action, this._log);
    await this._persist(next, this._runs, this._manualRunRequests);
    this._catalog = next;
    this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, action);
    this._scheduleNext();
  }
  async listTriggerDefinitions(_params) {
    this._requireAvailableCatalog();
    return { items: [] };
  }
  async runAutomation(params) {
    const created = await this._enqueueMutation(() => this._createManualRun(params));
    if (created.definition) {
      void this._startRun(created.run, created.definition);
    }
    return { resource: created.run.resource };
  }
  async fetchAutomationRuns(params) {
    return this._enqueueMutation(() => this._fetchAutomationRuns(params));
  }
  async _fetchAutomationRuns(params) {
    const catalog = this._requireAvailableCatalog();
    const automation = catalog.automations.find((candidate) => candidate.resource === params.automation);
    if (!automation) {
      throw new Error(`Automation not found: ${params.automation}`);
    }
    if (!automation.runsNextCursor) {
      return {};
    }
    if (params.cursor !== void 0 && params.cursor !== automation.runsNextCursor) {
      throw new Error(`Automation run-history cursor is no longer available: ${params.cursor}`);
    }
    const terminalLimit = Number(automation.runsNextCursor) + RUN_HISTORY_PAGE_SIZE;
    const updated = withRunWindow(automation, this._runs, terminalLimit);
    const next = automationReducer(catalog, { type: "automation/set" /* AutomationSet */, automation: updated }, this._log);
    await this._persist(next, this._runs, this._manualRunRequests);
    this._catalog = next;
    this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, { type: "automation/set" /* AutomationSet */, automation: updated });
    return {};
  }
  async handleCancel(resource, _action) {
    const sessions = await this._enqueueMutation(() => this._prepareCancellation(resource));
    if (sessions.length === 0) {
      return;
    }
    const results = await Promise.allSettled(sessions.map((session) => this._execution.cancelSession(URI.parse(session))));
    let accepted = false;
    for (const result of results) {
      if (result.status === "rejected") {
        throw result.reason;
      }
      accepted ||= result.value;
    }
    if (!accepted) {
      const terminal = await this._enqueueMutation(async () => {
        const run2 = this._runs.get(resource);
        return run2 === void 0 || isTerminalLifecycle(run2.lifecycle);
      });
      if (!terminal) {
        throw new Error(`Automation run cancellation was not accepted: ${resource}`);
      }
    }
  }
  _load() {
    if (this._storageService.loadError) {
      this._logService.error("[AgentHostAutomationService] Agent Host storage failed to load; automation state and execution remain unavailable.");
      return void 0;
    }
    const stored = this._storageService.get(STORAGE_KEY2);
    if (stored === void 0) {
      return { catalog: { automations: [] } };
    }
    if (!isStoredAutomations(stored)) {
      this._logService.error("[AgentHostAutomationService] Automation storage is invalid; automation execution remains unavailable until it is recovered.");
      return void 0;
    }
    return stored;
  }
  async _persist(catalog, runs, manualRunRequests, migrationCompletedAt = this._migrationCompletedAt) {
    await this._storageService.setAndFlush(STORAGE_KEY2, {
      version: 1,
      catalog,
      runs: [...runs.values()],
      manualRunRequests: [...manualRunRequests.values()],
      ...migrationCompletedAt ? { migration: { status: "complete", completedAt: migrationCompletedAt } } : {}
    });
  }
  _requireCatalog() {
    if (!this._catalog) {
      throw new Error("Automation storage is unavailable and must be recovered before automations can run.");
    }
    return this._catalog;
  }
  _requireAvailableCatalog() {
    const catalog = this._requireCatalog();
    if (this._migrationCompletedAt === void 0) {
      throw new Error("Automation migration must complete before automations can be accessed or run.");
    }
    if (!this._isAutomationsEnabled()) {
      throw new Error("Automations are disabled.");
    }
    return catalog;
  }
  _isAutomationsEnabled() {
    return this._stateManager.rootState.config?.values[AGENT_HOST_AUTOMATIONS_ENABLED_CONFIG_KEY] === true;
  }
  _withInitialScheduleState(automation, now) {
    const cursors = {};
    if (automation.definition.enabled) {
      for (const trigger of automation.definition.triggers) {
        if (trigger.kind === "schedule" /* Schedule */) {
          cursors[trigger.id] = nextAutomationCronOccurrence(trigger.schedule.expression, trigger.schedule.timeZone, now).toISOString();
        }
      }
    }
    return {
      ...automation,
      nextRunAt: earliestCursor(cursors),
      _meta: withScheduleCursors(automation._meta, cursors)
    };
  }
  _scheduleNext() {
    this._scheduleTimer.clear();
    if (!this._migrationCompletedAt || !this._catalog || !this._isAutomationsEnabled()) {
      return;
    }
    const timestamps = this._catalog.automations.filter((automation) => automation.definition.enabled && automation.operations.includes("run" /* Run */) && automation.nextRunAt && !this._activeRunFor(automation.resource) && this._execution.isSessionTemplateAvailable(automation.definition.session)).map((automation) => Date.parse(automation.nextRunAt)).filter((timestamp) => Number.isFinite(timestamp));
    if (timestamps.length === 0) {
      return;
    }
    const delay = Math.min(Math.max(0, Math.min(...timestamps) - Date.now()), 2147483647);
    this._scheduleTimer.value = disposableTimeout(() => {
      void this._enqueueMutation(() => this._claimDueRuns()).then((claimed) => {
        this._scheduleNext();
        for (const { run: run2, definition } of claimed) {
          void this._startRun(run2, definition);
        }
      }, (error) => {
        this._logService.error(`[AgentHostAutomationService] Failed to claim due Automation schedules: ${toErrorMessage(error)}`);
        this._scheduleTimer.value = disposableTimeout(() => this._scheduleNext(), SCHEDULE_RETRY_DELAY_MS);
      });
    }, delay);
  }
  async _claimDueRuns() {
    const catalog = this._requireAvailableCatalog();
    const now = /* @__PURE__ */ new Date();
    const nowTimestamp = now.getTime();
    const createdAt = now.toISOString();
    let nextCatalog = catalog;
    const nextRuns = new Map(this._runs);
    const changed = /* @__PURE__ */ new Map();
    const claimed = [];
    for (const current of catalog.automations) {
      if (!current.definition.enabled) {
        continue;
      }
      if (!current.operations.includes("run" /* Run */)) {
        continue;
      }
      if (this._activeRunFor(current.resource)) {
        continue;
      }
      if (!this._execution.isSessionTemplateAvailable(current.definition.session)) {
        continue;
      }
      const cursors = { ...readScheduleCursors(current._meta) };
      let automation = current;
      let claimedForAutomation = false;
      for (const trigger of current.definition.triggers) {
        if (trigger.kind !== "schedule" /* Schedule */) {
          continue;
        }
        let scheduledFor = cursors[trigger.id] ? new Date(cursors[trigger.id]) : void 0;
        if (!scheduledFor || !Number.isFinite(scheduledFor.getTime())) {
          scheduledFor = nextAutomationCronOccurrence(trigger.schedule.expression, trigger.schedule.timeZone, now);
        } else if (scheduledFor.getTime() <= nowTimestamp) {
          const catchUp = nowTimestamp - scheduledFor.getTime() >= 6e4;
          if (!catchUp || trigger.misfirePolicy !== "skip" /* Skip */) {
            if (!claimedForAutomation) {
              const run2 = this._createRunState(automation.resource, {
                kind: "trigger" /* Trigger */,
                triggerId: trigger.id,
                scheduledFor: scheduledFor.toISOString(),
                ...catchUp ? { catchUp: true } : {}
              }, createdAt);
              nextRuns.set(run2.resource, run2);
              automation = withRunSummary(automation, nextRuns);
              claimed.push({ run: run2, definition: automation.definition });
              claimedForAutomation = true;
            }
          }
          scheduledFor = nextAutomationCronOccurrence(trigger.schedule.expression, trigger.schedule.timeZone, now);
        }
        cursors[trigger.id] = scheduledFor.toISOString();
      }
      const nextAutomation = {
        ...automation,
        nextRunAt: earliestCursor(cursors),
        _meta: withScheduleCursors(automation._meta, cursors)
      };
      if (!equals2(nextAutomation, current)) {
        nextCatalog = automationReducer(nextCatalog, { type: "automation/set" /* AutomationSet */, automation: nextAutomation }, this._log);
        changed.set(nextAutomation.resource, nextAutomation);
      }
    }
    if (changed.size === 0) {
      return [];
    }
    await this._persist(nextCatalog, nextRuns, this._manualRunRequests);
    this._catalog = nextCatalog;
    this._runs = nextRuns;
    for (const run2 of claimed.map((entry) => entry.run)) {
      this._stateManager.setAutomationRunState(run2);
    }
    for (const automation of changed.values()) {
      this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, { type: "automation/set" /* AutomationSet */, automation });
    }
    this._logService.info(`[AgentHostAutomationService] Claimed due Automation schedules: runs=${claimed.length}, automations=${changed.size}.`);
    return claimed;
  }
  _recoverRuns() {
    if (this._didRecoverRuns) {
      return;
    }
    this._didRecoverRuns = true;
    for (const run2 of this._runs.values()) {
      if (run2.lifecycle.status === "running" /* Running */) {
        void this._enqueueMutation(() => this._failRun(run2.resource, new Error("Automation execution was interrupted by an Agent Host restart."))).catch((error) => {
          this._logService.error(`[AgentHostAutomationService] Failed to recover interrupted Automation run: run=${run2.resource}, error=${toErrorMessage(error)}`);
        });
      }
    }
    this._startPendingRuns();
  }
  _startPendingRuns() {
    for (const run2 of this._runs.values()) {
      if (run2.lifecycle.status !== "pending" /* Pending */) {
        continue;
      }
      const automation = this._catalog?.automations.find((candidate) => candidate.resource === run2.automation);
      if (automation && automation.operations.includes("run" /* Run */) && this._execution.isSessionTemplateAvailable(automation.definition.session)) {
        void this._startRun(run2, automation.definition);
      }
    }
  }
  async _createManualRun(params) {
    const catalog = this._requireAvailableCatalog();
    if (params.requestId.trim().length === 0) {
      throw new Error("Automation run requestId must not be empty.");
    }
    const previousRequest = this._manualRunRequests.get(params.requestId);
    if (previousRequest) {
      if (previousRequest.automation !== params.automation) {
        throw new Error(`Automation run requestId is already used for another automation: ${params.requestId}`);
      }
      const previousRun = this._runs.get(previousRequest.run);
      if (!previousRun) {
        throw new Error(`Automation run requestId refers to a missing run: ${params.requestId}`);
      }
      return { run: previousRun };
    }
    const automation = catalog.automations.find((candidate) => candidate.resource === params.automation);
    if (!automation) {
      throw new Error(`Automation not found: ${params.automation}`);
    }
    this._requireOperation(automation, "run" /* Run */);
    const activeRun = this._activeRunFor(automation.resource);
    if (activeRun) {
      return { run: activeRun };
    }
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const run2 = this._createRunState(automation.resource, { kind: "manual" /* Manual */ }, createdAt);
    const nextCatalog = this._catalogWithRun(catalog, run2);
    const nextRuns = new Map(this._runs);
    nextRuns.set(run2.resource, run2);
    const nextRequests = new Map(this._manualRunRequests);
    nextRequests.set(params.requestId, { requestId: params.requestId, automation: params.automation, run: run2.resource });
    await this._persist(nextCatalog, nextRuns, nextRequests);
    this._catalog = nextCatalog;
    this._runs = nextRuns;
    this._manualRunRequests = nextRequests;
    this._stateManager.setAutomationRunState(run2);
    this._publishAutomation(nextCatalog, automation.resource);
    this._logService.info(`[AgentHostAutomationService] Created durable manual automation run: automation=${automation.resource}, run=${run2.resource}.`);
    return { run: run2, definition: automation.definition };
  }
  _createRunState(automation, origin, createdAt) {
    return {
      resource: URI.from({ scheme: "ahp-automation-run", path: `/${generateUuid()}` }).toString(),
      automation,
      origin,
      lifecycle: { status: "pending" /* Pending */, createdAt },
      sessions: []
    };
  }
  async _startRun(initialRun, definition) {
    try {
      if (!this._execution.isSessionTemplateAvailable(definition.session)) {
        this._logService.info(`[AgentHostAutomationService] Deferring Automation run until its provider is available: run=${initialRun.resource}.`);
        return;
      }
      const running = await this._enqueueMutation(() => this._markRunRunning(initialRun.resource));
      if (!running) {
        return;
      }
      this._armRunTimeout(running.resource);
      const session = await this._execution.createSession(definition.session, running);
      const shouldStart = await this._enqueueMutation(() => this._linkRunSession(running.resource, session.toString()));
      if (!shouldStart) {
        await this._execution.cancelSession(session);
        return;
      }
      await this._execution.startSession(session, definition.message);
    } catch (error) {
      try {
        await this._enqueueMutation(() => this._failRun(initialRun.resource, error));
      } catch (persistError) {
        this._logService.error(`[AgentHostAutomationService] Failed to persist automation run failure: run=${initialRun.resource}, error=${toErrorMessage(persistError)}`);
      }
    }
  }
  async _markRunRunning(resource) {
    const run2 = this._runs.get(resource);
    if (!run2 || run2.lifecycle.status !== "pending" /* Pending */) {
      return void 0;
    }
    const lifecycle = {
      status: "running" /* Running */,
      createdAt: run2.lifecycle.createdAt,
      startedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const next = { ...run2, lifecycle };
    await this._commitRun(next, [{ type: "automationRun/lifecycleChanged" /* AutomationRunLifecycleChanged */, lifecycle }]);
    return next;
  }
  async _linkRunSession(resource, session) {
    const run2 = this._runs.get(resource);
    if (!run2) {
      throw new Error(`Automation run not found while linking session: ${resource}`);
    }
    const sessions = run2.sessions.includes(session) ? run2.sessions : [...run2.sessions, session];
    const next = { ...run2, sessions, primarySession: session };
    const actions = [];
    if (!run2.sessions.includes(session)) {
      actions.push({ type: "automationRun/sessionSet" /* AutomationRunSessionSet */, session });
    }
    if (run2.primarySession !== session) {
      actions.push({ type: "automationRun/primarySessionChanged" /* AutomationRunPrimarySessionChanged */, primarySession: session });
    }
    await this._commitRun(next, actions);
    this._logService.info(`[AgentHostAutomationService] Linked automation run to session: run=${resource}, session=${session}.`);
    return !isTerminalLifecycle(next.lifecycle);
  }
  async _prepareCancellation(resource) {
    this._requireAvailableCatalog();
    const run2 = this._runs.get(resource);
    if (!run2) {
      throw new Error(`Automation run not found: ${resource}`);
    }
    if (isTerminalLifecycle(run2.lifecycle)) {
      throw new Error(`Automation run is already terminal: ${resource}`);
    }
    if (run2.sessions.length > 0) {
      return run2.sessions;
    }
    const lifecycle = {
      status: "cancelled" /* Cancelled */,
      createdAt: run2.lifecycle.createdAt,
      ...run2.lifecycle.status === "running" /* Running */ ? { startedAt: run2.lifecycle.startedAt } : {},
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this._commitRun({ ...run2, lifecycle }, [{ type: "automationRun/lifecycleChanged" /* AutomationRunLifecycleChanged */, lifecycle }]);
    return [];
  }
  async _failRun(resource, error) {
    const run2 = this._runs.get(resource);
    if (!run2 || isTerminalLifecycle(run2.lifecycle)) {
      return;
    }
    const lifecycle = {
      status: "failed" /* Failed */,
      createdAt: run2.lifecycle.createdAt,
      ...run2.lifecycle.status === "running" /* Running */ ? { startedAt: run2.lifecycle.startedAt } : {},
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
      error: {
        errorType: "automationExecution",
        message: toErrorMessage(error)
      }
    };
    await this._commitRun({ ...run2, lifecycle }, [{ type: "automationRun/lifecycleChanged" /* AutomationRunLifecycleChanged */, lifecycle }]);
    this._logService.error(`[AgentHostAutomationService] Automation run failed: run=${resource}, error=${toErrorMessage(error)}`);
  }
  _handleEnvelope(envelope) {
    if (envelope.rejectionReason) {
      return;
    }
    if (!isDefaultChatUri(envelope.channel)) {
      return;
    }
    const action = envelope.action;
    if (action.type !== "chat/turnComplete" /* ChatTurnComplete */ && action.type !== "chat/turnCancelled" /* ChatTurnCancelled */ && action.type !== "chat/error" /* ChatError */) {
      return;
    }
    const session = parseRequiredSessionUriFromChatUri(envelope.channel);
    const run2 = [...this._runs.values()].find((candidate) => candidate.sessions.includes(session) && !isTerminalLifecycle(candidate.lifecycle));
    if (!run2) {
      return;
    }
    void this._enqueueMutation(async () => {
      const current = this._runs.get(run2.resource);
      if (!current || isTerminalLifecycle(current.lifecycle)) {
        return;
      }
      const completedAt = (/* @__PURE__ */ new Date()).toISOString();
      let lifecycle;
      switch (action.type) {
        case "chat/turnComplete" /* ChatTurnComplete */:
          lifecycle = {
            status: "completed" /* Completed */,
            createdAt: current.lifecycle.createdAt,
            startedAt: current.lifecycle.status === "running" /* Running */ ? current.lifecycle.startedAt : completedAt,
            completedAt
          };
          break;
        case "chat/turnCancelled" /* ChatTurnCancelled */:
          lifecycle = {
            status: "cancelled" /* Cancelled */,
            createdAt: current.lifecycle.createdAt,
            ...current.lifecycle.status === "running" /* Running */ ? { startedAt: current.lifecycle.startedAt } : {},
            completedAt
          };
          break;
        case "chat/error" /* ChatError */:
          lifecycle = {
            status: "failed" /* Failed */,
            createdAt: current.lifecycle.createdAt,
            ...current.lifecycle.status === "running" /* Running */ ? { startedAt: current.lifecycle.startedAt } : {},
            completedAt,
            error: action.part.error
          };
          break;
      }
      await this._commitRun({ ...current, lifecycle }, [{ type: "automationRun/lifecycleChanged" /* AutomationRunLifecycleChanged */, lifecycle }]);
    }).catch((error) => this._logService.error(`[AgentHostAutomationService] Failed to persist terminal automation lifecycle: run=${run2.resource}, error=${toErrorMessage(error)}`));
  }
  async _commitRun(run2, actions) {
    const catalog = this._requireCatalog();
    const nextCatalog = this._catalogWithRun(catalog, run2);
    const nextRuns = new Map(this._runs);
    nextRuns.set(run2.resource, run2);
    await this._persist(nextCatalog, nextRuns, this._manualRunRequests);
    this._catalog = nextCatalog;
    this._runs = nextRuns;
    for (const action of actions) {
      this._stateManager.dispatchServerAction(run2.resource, action);
    }
    this._publishAutomation(nextCatalog, run2.automation);
    if (isTerminalLifecycle(run2.lifecycle)) {
      this._runTimeouts.deleteAndDispose(run2.resource);
      this._scheduleNext();
    }
  }
  _catalogWithRun(catalog, run2) {
    const existing = catalog.automations.find((automation2) => automation2.resource === run2.automation);
    if (!existing) {
      throw new Error(`Automation not found for run: ${run2.automation}`);
    }
    const nextRuns = new Map(this._runs);
    nextRuns.set(run2.resource, run2);
    const automation = withRunSummary(existing, nextRuns);
    return automationReducer(catalog, { type: "automation/set" /* AutomationSet */, automation }, this._log);
  }
  _publishAutomation(catalog, resource) {
    const automation = catalog.automations.find((candidate) => candidate.resource === resource);
    if (automation) {
      this._stateManager.dispatchServerAction(AUTOMATION_CATALOG_URI, { type: "automation/set" /* AutomationSet */, automation });
    }
  }
  _validateAutomationResource(resource) {
    if (URI.parse(resource).scheme !== "ahp-automation") {
      throw new Error(`Automation resource must use the ahp-automation scheme: ${resource}`);
    }
  }
  _validateDefinition(definition) {
    if (definition.title.trim().length === 0) {
      throw new Error("Automation title must not be empty.");
    }
    if (definition.message.origin.kind !== "automation" /* Automation */) {
      throw new Error("Automation message must have an automation origin.");
    }
    const triggerIds = /* @__PURE__ */ new Set();
    for (const trigger of definition.triggers) {
      if (trigger.id.trim().length === 0 || triggerIds.has(trigger.id)) {
        throw new Error(`Automation trigger ids must be non-empty and unique: ${trigger.id}`);
      }
      triggerIds.add(trigger.id);
      if (trigger.kind === "event" /* Event */) {
        throw new Error(`Automation event trigger type is not available: ${trigger.type}`);
      }
      validateAutomationCron(trigger.schedule.expression, trigger.schedule.timeZone);
    }
  }
  _requireOperation(automation, operation) {
    if (!automation.operations.includes(operation)) {
      throw new Error(`Automation operation '${operation}' is not available: ${automation.resource}`);
    }
  }
  _activeRunFor(automation) {
    return [...this._runs.values()].find((run2) => run2.automation === automation && !isTerminalLifecycle(run2.lifecycle));
  }
  _armRunTimeout(resource) {
    const run2 = this._runs.get(resource);
    if (!run2 || isTerminalLifecycle(run2.lifecycle)) {
      return;
    }
    const configured = this._stateManager.rootState.config?.values[AGENT_HOST_AUTOMATION_RUN_TIMEOUT_MINUTES_CONFIG_KEY];
    const minutes = typeof configured === "number" && Number.isFinite(configured) && configured >= 1 ? configured : DEFAULT_RUN_TIMEOUT_MINUTES;
    this._runTimeouts.set(resource, disposableTimeout(() => {
      void this.handleCancel(resource, { type: "automationRun/cancelRequested" /* AutomationRunCancelRequested */ }).catch((error) => {
        void this._enqueueMutation(() => this._failRun(
          resource,
          new Error(localize(2211, null), { cause: error })
        )).catch((persistError) => {
          this._logService.error(`[AgentHostAutomationService] Failed to persist timed-out Automation run: run=${resource}, error=${toErrorMessage(persistError)}`);
        });
      });
    }, minutes * 6e4));
  }
  _enqueueMutation(mutation) {
    const next = this._mutationTail.then(mutation);
    this._mutationTail = next.then(() => void 0, () => void 0);
    return next;
  }
};

AgentHostAutomationService = __decorateClass([
  __decorateParam(1, IAgentHostStateManager),
  __decorateParam(2, IAgentHostStorageService),
  __decorateParam(3, ILogService)
], AgentHostAutomationService);

function isAutomationCatalogState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const automations = value["automations"];
  return Array.isArray(automations) && automations.every(isAutomationState);
}

function isStoredAutomations(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const stored = value;
  return (stored["version"] === void 0 || stored["version"] === 1) && isAutomationCatalogState(stored["catalog"]) && (stored["runs"] === void 0 || Array.isArray(stored["runs"]) && stored["runs"].every(isAutomationRunState)) && (stored["manualRunRequests"] === void 0 || Array.isArray(stored["manualRunRequests"]) && stored["manualRunRequests"].every(isStoredManualRunRequest)) && (stored["migration"] === void 0 || isCompletedMigration(stored["migration"]));
}

function isAutomationState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value;
  return typeof record["resource"] === "string" && typeof record["definition"] === "object" && record["definition"] !== null && !Array.isArray(record["definition"]) && Array.isArray(record["runs"]) && Array.isArray(record["operations"]) && typeof record["createdAt"] === "string" && typeof record["modifiedAt"] === "string";
}

function isAutomationRunState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const run2 = value;
  return typeof run2["resource"] === "string" && typeof run2["automation"] === "string" && typeof run2["origin"] === "object" && run2["origin"] !== null && typeof run2["lifecycle"] === "object" && run2["lifecycle"] !== null && Array.isArray(run2["sessions"]) && run2["sessions"].every((session) => typeof session === "string") && (run2["primarySession"] === void 0 || typeof run2["primarySession"] === "string");
}

function isStoredManualRunRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const request = value;
  return typeof request["requestId"] === "string" && typeof request["automation"] === "string" && typeof request["run"] === "string";
}

function isCompletedMigration(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const migration = value;
  return migration["status"] === "complete" && typeof migration["completedAt"] === "string";
}

function toRunSummary(run2) {
  return {
    resource: run2.resource,
    automation: run2.automation,
    origin: run2.origin,
    lifecycle: run2.lifecycle,
    primarySession: run2.primarySession,
    sessionCount: run2.sessions.length,
    _meta: run2._meta
  };
}

function withRunSummary(automation, allRuns) {
  const terminalLimit = Math.max(RUN_HISTORY_PAGE_SIZE, automation.runs.filter((candidate) => isTerminalLifecycle(candidate.lifecycle)).length);
  const window2 = withRunWindow(automation, allRuns, terminalLimit);
  const runs = window2.runs;
  const hasActiveRun = runs.some((candidate) => !isTerminalLifecycle(candidate.lifecycle));
  return {
    ...window2,
    operations: hasActiveRun ? automation.operations.filter((operation) => operation !== "remove" /* Remove */) : withOperation(automation.operations, "remove" /* Remove */)
  };
}

function withRunWindow(automation, allRuns, terminalLimit) {
  const summaries = [...allRuns.values()].filter((run2) => run2.automation === automation.resource).map(toRunSummary).sort((first, second) => Date.parse(second.lifecycle.createdAt) - Date.parse(first.lifecycle.createdAt));
  const active = summaries.filter((summary) => !isTerminalLifecycle(summary.lifecycle));
  const terminal = summaries.filter((summary) => isTerminalLifecycle(summary.lifecycle));
  const runs = [...active, ...terminal.slice(0, terminalLimit)].sort((first, second) => Date.parse(second.lifecycle.createdAt) - Date.parse(first.lifecycle.createdAt));
  return {
    ...automation,
    runs,
    runsNextCursor: terminal.length > terminalLimit ? String(terminalLimit) : void 0
  };
}

function isTerminalLifecycle(lifecycle) {
  return lifecycle.status === "completed" /* Completed */ || lifecycle.status === "failed" /* Failed */ || lifecycle.status === "cancelled" /* Cancelled */;
}

function withOperation(operations, operation) {
  return operations.includes(operation) ? [...operations] : [...operations, operation];
}

function readScheduleCursors(meta) {
  const value = meta?.[SCHEDULE_CURSORS_META_KEY];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const cursors = {};
  for (const [triggerId, cursor] of Object.entries(value)) {
    if (typeof cursor === "string") {
      cursors[triggerId] = cursor;
    }
  }
  return cursors;
}

function withScheduleCursors(meta, cursors) {
  const result = { ...meta };
  if (Object.keys(cursors).length === 0) {
    delete result[SCHEDULE_CURSORS_META_KEY];
  } else {
    result[SCHEDULE_CURSORS_META_KEY] = cursors;
  }
  return Object.keys(result).length > 0 ? result : void 0;
}

function earliestCursor(cursors) {
  return Object.values(cursors).filter((cursor) => Number.isFinite(Date.parse(cursor))).sort((first, second) => Date.parse(first) - Date.parse(second))[0];
}
export { isAutomationCatalogState, isStoredAutomations, isAutomationState, isAutomationRunState, isStoredManualRunRequest, isCompletedMigration, toRunSummary, withRunSummary, withRunWindow, isTerminalLifecycle, withOperation, readScheduleCursors, withScheduleCursors, earliestCursor, STORAGE_KEY2, SCHEDULE_CURSORS_META_KEY, SCHEDULE_RETRY_DELAY_MS, RUN_HISTORY_PAGE_SIZE, DEFAULT_RUN_TIMEOUT_MINUTES, IAgentHostAutomationService, AgentHostAutomationService };
