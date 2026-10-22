// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automationScheduler.ts
import { localize } from "./module-0001.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { IntervalTimer, raceTimeout } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { CHAT_AUTOMATIONS_ENABLED_SETTING, CHAT_AUTOMATIONS_RUN_TIMEOUT_MINUTES_SETTING, DEFAULT_AUTOMATIONS_RUN_TIMEOUT_MINUTES } from "./module-2638.mjs";
import { AutomationLeaderElection } from "./module-3785.mjs";
import { autorun } from "./module-0052.mjs";
import { stringHash } from "./module-0039.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAutomationService } from "./module-2218.mjs";
import { IAutomationRunner } from "./module-2636.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";


// src/vs/sessions/contrib/automations/browser/automationScheduler.ts
var DEFAULT_SCHEDULER_TICK_MS = 6e4;

var CRASH_RECOVERY_REASON = localize(4205, null);

var AutomationSchedulerCore = class extends Disposable {
  constructor(automationService, runner, storageService, logService, options3 = {}) {
    super();
    this.automationService = automationService;
    this.runner = runner;
    this.logService = logService;
    this._timer = this._register(new IntervalTimer());
    this._runCts = this._register(new CancellationTokenSource());
    // Reset on leadership loss so a future take-over re-runs crash recovery.
    this._didStartupForCurrentLeadership = false;
    this._pendingRuns = Promise.resolve();
    this._tickIntervalMs = options3.tickIntervalMs ?? DEFAULT_SCHEDULER_TICK_MS;
    this._now = options3.now ?? (() => /* @__PURE__ */ new Date());
    this._isFeatureEnabled = options3.isFeatureEnabled ?? (() => true);
    this._getRunTimeoutMs = options3.getRunTimeoutMs ?? (() => DEFAULT_AUTOMATIONS_RUN_TIMEOUT_MINUTES * 6e4);
    this._leader = options3.leaderElection ?? this._register(new AutomationLeaderElection(storageService, logService));
    this._register(autorun((reader) => {
      const isLeader = this._leader.isLeader.read(reader);
      if (!isLeader) {
        this._didStartupForCurrentLeadership = false;
        this.automationService.stopStaleRunRecovery();
        return;
      }
      this.kickoffPendingRuns(() => this.tickOnce(true));
    }));
    if (!options3.disableAutoTick) {
      this._timer.cancelAndSet(() => {
        this.kickoffPendingRuns(() => this.tickOnce(false));
      }, this._tickIntervalMs);
    }
    if (options3.onDidChangeTargetAvailability) {
      this._register(options3.onDidChangeTargetAvailability(() => {
        this.kickoffPendingRuns(() => this.tickOnce(false));
      }));
    }
  }
  /** Test-only: run a single tick and await it. */
  async tickForTesting() {
    this.kickoffPendingRuns(() => this.tickOnce(false));
    await this._pendingRuns;
  }
  /** Test-only: await in-flight runs. */
  async waitForPendingRuns() {
    await this._pendingRuns;
  }
  kickoffPendingRuns(task) {
    if (this._store.isDisposed) {
      return;
    }
    this._pendingRuns = this._pendingRuns.then(task).catch((err) => {
      this.logService.error("[AutomationScheduler] tick failed", err);
    });
  }
  async tickOnce(isLeadershipTransition) {
    if (!this._leader.isLeader.get()) {
      return;
    }
    if (!this._isFeatureEnabled()) {
      return;
    }
    if (!this._didStartupForCurrentLeadership) {
      this._didStartupForCurrentLeadership = true;
      await this.automationService.startStaleRunRecovery(CRASH_RECOVERY_REASON);
      await this.dispatchDue("catch_up");
      if (isLeadershipTransition) {
        return;
      }
    }
    await this.dispatchDue("schedule");
  }
  async dispatchDue(trigger) {
    const now = this._now();
    const due = this.automationService.automations.get().filter(
      (automation) => this.automationService.isSchedulingOwnedByHost?.(automation.id) !== true && isDue(automation, now)
    );
    if (due.length === 0) {
      return;
    }
    const leaderWindowId = stringHash(this._leader.instanceId, 0);
    for (const automation of due) {
      try {
        await this.runOneWithTimeout(automation, trigger, leaderWindowId);
      } catch (err) {
        this.logService.error("[AutomationScheduler] dispatch failed for automation", automation.id, err);
      }
    }
  }
  async runOneWithTimeout(automation, trigger, leaderWindowId) {
    const timeoutMs = this._getRunTimeoutMs();
    const perRunCts = new CancellationTokenSource(this._runCts.token);
    try {
      if (timeoutMs <= 0) {
        await this.runner.runOnce(automation, trigger, leaderWindowId, perRunCts.token).whenCompleted;
        return;
      }
      let timedOut = false;
      await raceTimeout(
        this.runner.runOnce(automation, trigger, leaderWindowId, perRunCts.token).whenCompleted,
        timeoutMs,
        () => {
          timedOut = true;
        }
      );
      if (!timedOut) {
        return;
      }
      try {
        const active = this.automationService.getActiveRunFor(automation.id);
        if (active) {
          const updated = await this.automationService.updateRun(active.id, {
            status: "failed",
            errorMessage: localize(4204, null, Math.round(timeoutMs / 6e4)),
            completedAt: this._now().toISOString()
          });
          if (updated) {
            this.logService.warn(`[AutomationScheduler] automation ${automation.id} timed out after ${timeoutMs}ms; marked run ${active.id} failed (previousStatus=${active.status}, session=${updated.sessionResource?.toString() ?? "(none)"}).`);
          } else {
            this.logService.warn(`[AutomationScheduler] automation ${automation.id} timed out after ${timeoutMs}ms, but active run ${active.id} disappeared before it could be marked failed (previousStatus=${active.status}, session=${active.sessionResource?.toString() ?? "(none)"}).`);
          }
        } else {
          this.logService.warn(`[AutomationScheduler] automation ${automation.id} timed out after ${timeoutMs}ms with no active run recorded.`);
        }
      } catch (err) {
        this.logService.warn(`[AutomationScheduler] automation ${automation.id} timed out after ${timeoutMs}ms and failed to mark its active run as failed.`, err);
      }
      perRunCts.cancel();
    } finally {
      perRunCts.dispose();
    }
  }
  dispose() {
    this.automationService.stopStaleRunRecovery();
    this._runCts.cancel();
    super.dispose();
  }
};

var AutomationScheduler = class extends Disposable {
  constructor(_automationService, _runner, _storageService, _logService, _configurationService, _sessionsManagementService) {
    super();
    this._automationService = _automationService;
    this._runner = _runner;
    this._storageService = _storageService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._sessionsManagementService = _sessionsManagementService;
    this._core = this._register(new MutableDisposable());
    if (this._isEnabled()) {
      this._createCore();
    }
    this._register(_configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(CHAT_AUTOMATIONS_ENABLED_SETTING)) {
        if (this._isEnabled()) {
          this._createCore();
        } else {
          this._core.clear();
        }
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.automationScheduler";
  }
  _isEnabled() {
    return this._configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
  }
  _createCore() {
    if (this._core.value) {
      return;
    }
    this._core.value = new AutomationSchedulerCore(this._automationService, this._runner, this._storageService, this._logService, {
      isFeatureEnabled: () => this._isEnabled(),
      getRunTimeoutMs: () => {
        const minutes = this._configurationService.getValue(CHAT_AUTOMATIONS_RUN_TIMEOUT_MINUTES_SETTING);
        const sane = typeof minutes === "number" && Number.isFinite(minutes) && minutes >= 1 ? minutes : DEFAULT_AUTOMATIONS_RUN_TIMEOUT_MINUTES;
        return sane * 6e4;
      },
      onDidChangeTargetAvailability: this._sessionsManagementService.onDidChangeSessionTypes
    });
  }
};

AutomationScheduler = __decorateClass([
  __decorateParam(0, IAutomationService),
  __decorateParam(1, IAutomationRunner),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ISessionsManagementService)
], AutomationScheduler);

function isDue(automation, now) {
  if (!automation.enabled || !automation.nextRunAt) {
    return false;
  }
  const next = Date.parse(automation.nextRunAt);
  if (Number.isNaN(next)) {
    return false;
  }
  return next <= now.getTime();
}
export { isDue, DEFAULT_SCHEDULER_TICK_MS, CRASH_RECOVERY_REASON, AutomationSchedulerCore, AutomationScheduler };
