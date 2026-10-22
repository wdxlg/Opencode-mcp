// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/browser/onboardingService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Memento } from "./module-1042.mjs";
import { ONBOARDING_ASSIGNMENT_CONTEXT_PREFIX } from "./module-3798.mjs";
import { onboardingScenarioRegistry } from "./module-3795.mjs";
import { ONBOARDING_DEVELOPER_MODE_CONFIG, ONBOARDING_ENABLED_CONFIG, isOnboardingDeveloperModeEnabled } from "./module-3797.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { onboardingPresentationRegistry } from "./module-3794.mjs";
import { mainWindow } from "./module-0002.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/onboarding/browser/onboardingService.ts
var OnboardingScenarioService = class extends Disposable {
  constructor(storageService, contextKeyService, configurationService, lifecycleService, assignmentService, telemetryService) {
    super();
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.lifecycleService = lifecycleService;
    this.assignmentService = assignmentService;
    this.telemetryService = telemetryService;
    /** Listeners for `observable` triggers, rebuilt whenever the registry changes. */
    this._triggerListeners = this._register(new DisposableStore());
    /** Scenario ids currently queued or running (prevents double-scheduling). */
    this._pending = /* @__PURE__ */ new Set();
    this._queue = [];
    /** Deferreds for scenarios that have been dequeued and are currently running, keyed by id. */
    this._inflight = /* @__PURE__ */ new Map();
    this._pumping = false;
    /** Resolved experiment treatment state, keyed by scenario id. */
    this._experimentStates = /* @__PURE__ */ new Map();
    this._onDidChangeOpenedIds = this._register(new Emitter());
    this._started = false;
    this._stopped = false;
    this._shownSinceStart = /* @__PURE__ */ new Set();
    this._memento = new Memento(OnboardingScenarioService.MEMENTO_ID, this.storageService);
    this._state = this._memento.getMemento(-1 /* APPLICATION */, 1 /* MACHINE */);
    this._openedAssignmentContextIds = this._loadOpenedIds();
    this.assignmentService.addTelemetryAssignmentFilter({
      id: "onboarding",
      exclude: (assignment) => {
        const variant = getAssignmentContextVariant(assignment);
        return variant.startsWith(ONBOARDING_ASSIGNMENT_CONTEXT_PREFIX) && !this._openedAssignmentContextIds.has(variant);
      },
      onDidChange: this._onDidChangeOpenedIds.event
    });
    this._register(this.lifecycleService.onWillShutdown(() => this._stop()));
  }
  static {
    this.MEMENTO_ID = "onboarding";
  }
  static {
    /**
     * Storage key for the set of assignment-context identifiers whose telemetry gate has been
     * opened (the user reached the onboarding moment). Persisted so the identifier keeps
     * flowing across reloads/relaunches until the experiment is stopped.
     */
    this.OPENED_IDS_STORAGE_KEY = "onboarding.openedAssignmentContextIds";
  }
  _stop() {
    this._stopped = true;
    this._activeAbort?.fire();
    let entry;
    while (entry = this._queue.shift()) {
      this._pending.delete(entry.scenario.id);
      entry.deferred.complete("aborted" /* Aborted */);
    }
  }
  start() {
    if (this._started) {
      return;
    }
    this._started = true;
    this._register(onboardingScenarioRegistry.onDidChange(() => {
      this._registerTriggerListeners();
      this._resolveExperiments();
      this._evaluate();
    }));
    this._register(this.contextKeyService.onDidChangeContext(() => this._evaluate()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(ONBOARDING_ENABLED_CONFIG) || e4.affectsConfiguration(ONBOARDING_DEVELOPER_MODE_CONFIG)) {
        this._evaluate();
      }
    }));
    this._registerTriggerListeners();
    this._resolveExperiments();
    this._evaluate();
  }
  getScenarios() {
    return onboardingScenarioRegistry.getScenarios();
  }
  async runScenario(id2) {
    const scenario = onboardingScenarioRegistry.getScenario(id2);
    if (!scenario) {
      throw new Error(`Unknown onboarding scenario '${id2}'.`);
    }
    return this._enqueue(scenario);
  }
  hasBeenShown(id2) {
    const scenario = onboardingScenarioRegistry.getScenario(id2);
    return this._hasBeenShownKey(scenario ? this._seenKey(scenario) : id2, id2);
  }
  reset(id2) {
    const scenario = onboardingScenarioRegistry.getScenario(id2);
    delete this._state[scenario ? this._seenKey(scenario) : id2];
    this._memento.saveMemento();
  }
  resetAll() {
    for (const key3 of Object.keys(this._state)) {
      delete this._state[key3];
    }
    this._memento.saveMemento();
  }
  //#region Eligibility & scheduling
  /**
   * The master switch for *automatic* onboarding. When `onboarding.enabled` is
   * explicitly `false`, no scenario ever runs automatically (developer mode does
   * NOT override this — see {@link _evaluate}). Any other value (including unset)
   * is treated as enabled. On-demand {@link runScenario} is intentionally exempt
   * from this switch.
   */
  get _enabled() {
    return this.configurationService.getValue(ONBOARDING_ENABLED_CONFIG) !== false;
  }
  _isDeveloperMode(scenarioId) {
    return isOnboardingDeveloperModeEnabled(this.configurationService, scenarioId);
  }
  /**
   * Re-evaluate every scenario and enqueue any that are eligible to run
   * automatically. Idempotent: already shown / queued scenarios are skipped.
   *
   * The automatic eligibility rules are:
   * 1. If `onboarding.enabled` is `false`, nothing runs automatically — this
   *    method returns immediately, and developer mode does NOT override it.
   * 2. If a scenario declares an `experiment`, it only runs when the experiment
   *    is active AND the user is in the treatment arm (see below) — OR when
   *    developer mode is enabled for that scenario, which bypasses the experiment
   *    gate so the tour can be previewed locally.
   * 3. If a scenario has no `experiment`, it runs for every user that meets its
   *    `when`/trigger criteria (the typical state once an experiment has graduated
   *    and the tour is rolled out to everyone).
   *
   * For an experiment-active scenario, reaching eligibility *is* the "would-show"
   * moment: the telemetry gate is opened for the experiment's assignment-context id
   * (in both arms), and then only the treatment arm is enqueued to actually show the
   * tour. Control opens the gate but renders nothing and is not marked as shown.
   *
   * Developer mode is the exception: it shows the tour unconditionally and never
   * opens the telemetry gate, so a local preview can never affect the experiment
   * scorecard regardless of which arm the developer happens to be assigned to.
   */
  _evaluate() {
    if (!this._enabled || this._stopped) {
      return;
    }
    const claimedSeenKeys = /* @__PURE__ */ new Set();
    for (const scenario of onboardingScenarioRegistry.getScenarios()) {
      if (!scenario.repeatable && this._pending.has(scenario.id)) {
        claimedSeenKeys.add(this._seenKey(scenario));
      }
    }
    const eligibleScenarios = onboardingScenarioRegistry.getScenarios().map((scenario, registrationIndex) => ({ scenario, registrationIndex })).filter(({ scenario }) => this._isAutoEligible(scenario)).sort((a, b) => (b.scenario.priority ?? 0) - (a.scenario.priority ?? 0) || a.registrationIndex - b.registrationIndex);
    for (const { scenario } of eligibleScenarios) {
      const seenKey = this._seenKey(scenario);
      if (!scenario.repeatable && claimedSeenKeys.has(seenKey)) {
        continue;
      }
      const experiment = scenario.experiment ? this._experimentStates.get(scenario.id) : void 0;
      if (experiment?.active && !this._isDeveloperMode(scenario.id)) {
        this._openGate(experiment.assignmentContextId);
        if (!experiment.behavior) {
          continue;
        }
      }
      this._enqueue(scenario);
      if (!scenario.repeatable) {
        claimedSeenKeys.add(seenKey);
      }
    }
  }
  _isAutoEligible(scenario) {
    if (scenario.trigger.kind === "command") {
      return false;
    }
    if (this._pending.has(scenario.id)) {
      return false;
    }
    if (!scenario.repeatable && this._hasBeenShownKey(this._seenKey(scenario), scenario.id)) {
      return false;
    }
    if (scenario.when && !this.contextKeyService.contextMatchesRules(scenario.when)) {
      return false;
    }
    if (scenario.experiment && this._experimentStates.get(scenario.id)?.active !== true && !this._isDeveloperMode(scenario.id)) {
      return false;
    }
    if (scenario.trigger.kind === "observable" && scenario.trigger.signal.get() !== true) {
      return false;
    }
    return true;
  }
  _enqueue(scenario) {
    if (this._stopped) {
      return Promise.resolve("aborted" /* Aborted */);
    }
    const queued = this._queue.find((entry) => entry.scenario.id === scenario.id);
    if (queued) {
      return queued.deferred.p;
    }
    const inflight = this._inflight.get(scenario.id);
    if (inflight) {
      return inflight.p;
    }
    const deferred = new DeferredPromise();
    this._pending.add(scenario.id);
    this._queue.push({ scenario, deferred });
    this._queue.sort((a, b) => (b.scenario.priority ?? 0) - (a.scenario.priority ?? 0));
    this._pump();
    return deferred.p;
  }
  _pump() {
    if (this._pumping) {
      return;
    }
    this._pumping = true;
    this._doPump();
  }
  async _doPump() {
    await Promise.resolve();
    try {
      let entry;
      while (!this._stopped && (entry = this._queue.shift())) {
        const { scenario, deferred } = entry;
        this._inflight.set(scenario.id, deferred);
        let outcome;
        try {
          outcome = await this._runPresentation(scenario);
        } catch (error) {
          onUnexpectedError(error);
          outcome = "aborted" /* Aborted */;
        } finally {
          this._inflight.delete(scenario.id);
          this._pending.delete(scenario.id);
        }
        deferred.complete(outcome);
      }
    } finally {
      this._pumping = false;
    }
  }
  async _runPresentation(scenario) {
    const presentation2 = onboardingPresentationRegistry.get(scenario.presentation.kind);
    if (!presentation2) {
      return "aborted" /* Aborted */;
    }
    this._markShown(this._seenKey(scenario));
    const abort = new Emitter();
    this._activeAbort = abort;
    const startTime = Date.now();
    let didReportShown = false;
    try {
      const result = await presentation2.run(scenario, {
        targetWindow: mainWindow,
        onAbort: abort.event,
        onDidShow: () => {
          if (!didReportShown) {
            didReportShown = true;
            this._reportShown(scenario);
          }
        }
      });
      this._recordOutcome(this._seenKey(scenario), result.outcome);
      if (result.shown) {
        this._reportOutcome(scenario, result, Date.now() - startTime);
      }
      return result.outcome;
    } finally {
      this._activeAbort = void 0;
      abort.dispose();
    }
  }
  /** Emit an impression when a presentation has rendered visible onboarding UI. */
  _reportShown(scenario) {
    const experimentState = scenario.experiment ? this._experimentStates.get(scenario.id) : void 0;
    this.telemetryService.publicLog2("onboarding.scenarioShown", {
      scenarioId: scenario.id,
      experimentActive: experimentState?.active === true,
      experimentAssignmentContextId: experimentState?.active ? experimentState.assignmentContextId : void 0
    });
  }
  /** Emit per-tour telemetry. Only called when a tour was actually shown. */
  _reportOutcome(scenario, result, durationMs) {
    const experimentActive = !!scenario.experiment && this._experimentStates.get(scenario.id)?.active === true;
    this.telemetryService.publicLog2("onboarding.scenarioOutcome", {
      scenarioId: scenario.id,
      outcome: result.outcome,
      dismissReason: result.dismissReason,
      lastStepIndex: result.lastStepIndex,
      stepCount: result.stepCount,
      durationMs,
      experimentActive
    });
  }
  //#endregion
  //#region Triggers & experiments
  _registerTriggerListeners() {
    this._triggerListeners.clear();
    for (const scenario of onboardingScenarioRegistry.getScenarios()) {
      if (scenario.trigger.kind === "observable") {
        const signal = scenario.trigger.signal;
        this._triggerListeners.add(autorun((reader) => {
          signal.read(reader);
          this._evaluate();
        }));
      }
    }
  }
  /**
   * Resolve the two experiment treatment flags for each scenario that declares an experiment.
   * The experiment is only active when both resolve: the boolean to a boolean and the id to a
   * non-empty string that starts with {@link ONBOARDING_ASSIGNMENT_CONTEXT_PREFIX}. Resolved
   * once per scenario; re-evaluation is triggered when an experiment becomes active.
   */
  _resolveExperiments() {
    for (const scenario of onboardingScenarioRegistry.getScenarios()) {
      const experiment = scenario.experiment;
      if (!experiment || this._experimentStates.has(scenario.id)) {
        continue;
      }
      this._experimentStates.set(scenario.id, { active: false, behavior: false, assignmentContextId: "" });
      Promise.all([
        this.assignmentService.getTreatment(experiment.behaviorFlag),
        this.assignmentService.getTreatment(experiment.assignmentContextIdFlag)
      ]).then(([behavior, assignmentContextId]) => {
        const hasBehavior = typeof behavior === "boolean";
        const hasId = typeof assignmentContextId === "string" && assignmentContextId.length > 0;
        const hasValidId = hasId && assignmentContextId.startsWith(ONBOARDING_ASSIGNMENT_CONTEXT_PREFIX);
        if (hasId && !hasValidId) {
          onUnexpectedError(new Error(`Onboarding experiment for scenario '${scenario.id}' resolved an assignment-context id '${assignmentContextId}' that does not start with the required '${ONBOARDING_ASSIGNMENT_CONTEXT_PREFIX}' prefix; treating the experiment as inactive.`));
        }
        const active = hasBehavior && hasValidId;
        this._experimentStates.set(scenario.id, {
          active,
          behavior: behavior === true,
          assignmentContextId: active ? assignmentContextId : ""
        });
        if (active) {
          this._evaluate();
        }
      }, (error) => onUnexpectedError(error));
    }
  }
  //#endregion
  //#region Telemetry gate
  _loadOpenedIds() {
    const raw = this.storageService.get(OnboardingScenarioService.OPENED_IDS_STORAGE_KEY, -1 /* APPLICATION */);
    if (!raw) {
      return /* @__PURE__ */ new Set();
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed.filter((id2) => typeof id2 === "string")) : /* @__PURE__ */ new Set();
    } catch (error) {
      onUnexpectedError(error);
      return /* @__PURE__ */ new Set();
    }
  }
  /**
   * Open the telemetry gate for an assignment-context id: from now on (and after reload) the
   * id is no longer filtered out, so every event carries it. Idempotent.
   */
  _openGate(assignmentContextId) {
    if (!assignmentContextId || this._openedAssignmentContextIds.has(assignmentContextId)) {
      return;
    }
    this._openedAssignmentContextIds.add(assignmentContextId);
    this.storageService.store(
      OnboardingScenarioService.OPENED_IDS_STORAGE_KEY,
      JSON.stringify(Array.from(this._openedAssignmentContextIds)),
      -1 /* APPLICATION */,
      1 /* MACHINE */
    );
    this._onDidChangeOpenedIds.fire();
  }
  //#endregion
  //#region Persistence
  /**
   * The key under which a scenario's once-per-user "shown" state is stored.
   * Scenarios may opt into a shared {@link IOnboardingScenario.seenKey} so that
   * variations of the same onboarding are gated together; otherwise the
   * scenario id is used.
   */
  _seenKey(scenario) {
    return scenario.seenKey ?? scenario.id;
  }
  _hasBeenShownKey(key3, scenarioId) {
    if (this._isDeveloperMode(scenarioId)) {
      return this._shownSinceStart.has(key3);
    }
    return !!this._state[key3]?.shownAt;
  }
  _markShown(id2) {
    this._shownSinceStart.add(id2);
    const previous = this._state[id2];
    const next = {
      shownAt: Date.now(),
      outcome: previous?.outcome,
      seenCount: (previous?.seenCount ?? 0) + 1
    };
    this._state[id2] = next;
    this._memento.saveMemento();
  }
  _recordOutcome(id2, outcome) {
    const state = this._state[id2];
    if (state) {
      state.outcome = outcome;
      this._memento.saveMemento();
    }
  }
  //#endregion
};

OnboardingScenarioService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, IWorkbenchAssignmentService),
  __decorateParam(5, ITelemetryService)
], OnboardingScenarioService);

function getAssignmentContextVariant(assignment) {
  const separatorIndex = assignment.lastIndexOf(":");
  return separatorIndex === -1 ? assignment : assignment.slice(0, separatorIndex);
}
export { getAssignmentContextVariant, OnboardingScenarioService };
