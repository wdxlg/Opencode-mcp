// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automationRunner.ts
import { CancellationToken } from "./module-0025.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { waitForState } from "./module-0056.mjs";
import { derived } from "./module-0054.mjs";
import { publishAutomationRun, publishAutomationRunError } from "./module-3679.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAutomationService } from "./module-2218.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/sessions/contrib/automations/browser/automationRunner.ts
var AutomationRunner = class {
  constructor(automationService, sessionsManagementService, logService, telemetryService, notificationService) {
    this.automationService = automationService;
    this.sessionsManagementService = sessionsManagementService;
    this.logService = logService;
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
  }
  runOnce(automation, trigger, leaderWindowId, token = CancellationToken.None) {
    const dispatched = new DeferredPromise();
    return {
      whenDispatched: dispatched.p,
      whenCompleted: this._runOnce(automation, trigger, leaderWindowId, token, dispatched)
    };
  }
  async _runOnce(automation, trigger, leaderWindowId, token, dispatched) {
    try {
      await this._runOnceInner(automation, trigger, leaderWindowId, token, dispatched);
    } catch (err) {
      this.logService.error(`[AutomationRunner] unexpected error in runOnce for ${automation.id}`, err);
    } finally {
      await dispatched.complete({ kind: "notStarted", reason: "error" });
    }
  }
  async _runOnceInner(automation, trigger, leaderWindowId, token, dispatched) {
    const startTimeMs = Date.now();
    let runId;
    try {
      if (!this.automationService.getAutomation(automation.id)) {
        this.logService.trace(`[AutomationRunner] skipping ${automation.id}: automation was deleted.`);
        await dispatched.complete({ kind: "notStarted", reason: "deleted" });
        return;
      }
      const target = automation.target;
      const isolationMode = target.kind === "workspace" ? target.isolation.kind === "folder" ? "workspace" : target.isolation.kind === "worktree" ? "worktree" : void 0 : void 0;
      const branch = target.kind === "workspace" && target.isolation.kind === "worktree" ? target.isolation.branch : void 0;
      const createOptions3 = target.providerId !== void 0 || target.sessionTypeId !== void 0 || automation.modelId !== void 0 || automation.mode !== void 0 || automation.permissionLevel !== void 0 || isolationMode !== void 0 || branch !== void 0 ? {
        providerId: target.providerId,
        sessionTypeId: target.sessionTypeId,
        modelId: automation.modelId,
        modeId: automation.mode,
        permissionLevel: automation.permissionLevel,
        isolationMode,
        branch
      } : void 0;
      const targetAvailable = target.kind === "quickChat" ? this.sessionsManagementService.isQuickChatTargetAvailable(createOptions3) : this.sessionsManagementService.isNewSessionTargetAvailable(target.folderUri, createOptions3);
      if (!targetAvailable) {
        this.logService.trace(`[AutomationRunner] deferring ${automation.id}: target is not yet advertised.`);
        if (trigger === "manual") {
          this.notificationService.info(localize(4201, null, automation.name));
        }
        await dispatched.complete({ kind: "notStarted", reason: "targetUnavailable" });
        return;
      }
      const claim = await this.automationService.recordRunStart(automation.id, trigger, leaderWindowId);
      if (!claim.claimed) {
        if (claim.externalDispatch) {
          let cancellationForwarded = false;
          const forwardCancellation = () => {
            if (!cancellationForwarded) {
              cancellationForwarded = true;
              try {
                claim.externalDispatch?.cancel?.();
              } catch (error) {
                this.logService.error(`[AutomationRunner] Failed to forward cancellation for ${automation.id}`, error);
              }
            }
          };
          const cancellationListener = claim.externalDispatch.cancel ? token.onCancellationRequested(forwardCancellation) : void 0;
          const sessionResource = claim.externalDispatch.sessionResource;
          try {
            if (sessionResource) {
              await dispatched.complete({ kind: "started", run: claim.run, sessionResource });
            } else {
              await dispatched.complete({ kind: "notStarted", reason: "error", run: claim.run });
            }
            if (token.isCancellationRequested) {
              forwardCancellation();
            }
            await claim.externalDispatch.whenCompleted;
          } finally {
            cancellationListener?.dispose();
          }
          return;
        }
        this.logService.trace(`[AutomationRunner] skipping ${automation.id}: active run already exists.`);
        await dispatched.complete({ kind: "alreadyRunning", activeRun: claim.run });
        return;
      }
      runId = claim.run.id;
      const run = await this.automationService.updateRun(runId, { status: "running" }) ?? claim.run;
      this.logService.info(`[AutomationRunner] claimed run ${runId} for automation ${automation.id}: trigger=${trigger}, leaderWindowId=${leaderWindowId}.`);
      if (token.isCancellationRequested) {
        await dispatched.complete({ kind: "notStarted", reason: "cancelled", run });
        await this._markCancelled(runId, trigger, automation, startTimeMs);
        return;
      }
      const options3 = {
        query: automation.prompt,
        background: true,
        title: automation.name?.substring(0, 100)
      };
      this.logService.trace(`[AutomationRunner] running ${automation.id}: target=${target.kind}, provider=${createOptions3?.providerId ?? "(default)"}, sessionType=${createOptions3?.sessionTypeId ?? "(default)"}, model=${createOptions3?.modelId ?? "(default)"}, mode=${createOptions3?.modeId ?? "(default)"}, permissionLevel=${createOptions3?.permissionLevel ?? "(default)"}`);
      this.logService.info(`[AutomationRunner] creating a session for run ${runId} (automation ${automation.id}).`);
      let session;
      if (target.kind === "quickChat") {
        session = await this.sessionsManagementService.createAndSendQuickChatRequest(options3, createOptions3, token);
      } else {
        session = await this.sessionsManagementService.createAndSendNewChatRequest(target.folderUri, options3, createOptions3, token);
      }
      if (session) {
        const sessionResource = session.resource;
        let updatedRun;
        try {
          updatedRun = await this.automationService.updateRun(runId, { sessionResource });
        } catch (err) {
          this.logService.warn(`[AutomationRunner] session ${sessionResource.toString()} was created for run ${runId} (automation ${automation.id}), but persisting the session link failed.`, err);
          throw err;
        }
        if (updatedRun) {
          this.logService.info(`[AutomationRunner] linked run ${runId} for automation ${automation.id} to session ${sessionResource.toString()}.`);
        } else {
          this.logService.warn(`[AutomationRunner] session ${sessionResource.toString()} was created for run ${runId} (automation ${automation.id}), but the run no longer exists and the session link was not persisted.`);
        }
        const dispatchedRun = updatedRun ?? run;
        await dispatched.complete({ kind: "started", run: dispatchedRun, sessionResource });
      } else {
        this.logService.warn(`[AutomationRunner] session creation returned no session for run ${runId} (automation ${automation.id}): cancelled=${token.isCancellationRequested}.`);
        await dispatched.complete({ kind: "notStarted", reason: token.isCancellationRequested ? "cancelled" : "error", run });
      }
      if (token.isCancellationRequested) {
        await this._markCancelled(runId, trigger, automation, startTimeMs);
        return;
      }
      const terminalStatus = session ? await waitForState(
        derived((reader) => session.mainChat.read(reader).status.read(reader)),
        (status2) => status2 === 3 /* Completed */ || status2 === 4 /* Error */,
        void 0,
        token
      ) : 3 /* Completed */;
      if (token.isCancellationRequested) {
        await this._markCancelled(runId, trigger, automation, startTimeMs);
        return;
      }
      if (terminalStatus === 4 /* Error */) {
        throw new Error(localize(4200, null));
      }
      await this.automationService.updateRun(runId, {
        status: "completed",
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      publishAutomationRun(this.telemetryService, { trigger, automation, success: true, durationMs: Date.now() - startTimeMs });
    } catch (err) {
      if (runId && token.isCancellationRequested) {
        await dispatched.complete({ kind: "notStarted", reason: "cancelled" });
        await this._markCancelled(runId, trigger, automation, startTimeMs);
        return;
      }
      this.logService.error(`[AutomationRunner] run for ${automation.id} failed`, err);
      try {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.notificationService.error(localize(4198, null, automation.name, errorMessage));
        let failedRun;
        if (runId) {
          failedRun = await this.automationService.updateRun(runId, {
            status: "failed",
            completedAt: (/* @__PURE__ */ new Date()).toISOString(),
            errorMessage
          });
        }
        await dispatched.complete({ kind: "notStarted", reason: "error", run: failedRun });
        publishAutomationRun(this.telemetryService, { trigger, automation, success: false, durationMs: Date.now() - startTimeMs });
        publishAutomationRunError(this.telemetryService, { trigger, automation });
      } catch (innerErr) {
        this.logService.error(`[AutomationRunner] error recording failure for ${automation.id}`, innerErr);
      }
    }
  }
  async _markCancelled(runId, trigger, automation, startTimeMs) {
    try {
      if (this.automationService.getActiveRunFor(automation.id)?.id === runId) {
        await this.automationService.updateRun(runId, {
          status: "failed",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          errorMessage: localize(4199, null)
        });
      }
      publishAutomationRun(this.telemetryService, { trigger, automation, success: false, durationMs: Date.now() - startTimeMs });
    } catch (err) {
      this.logService.error(`[AutomationRunner] error recording cancellation for ${automation.id}`, err);
    }
  }
};

AutomationRunner = __decorateClass([
  __decorateParam(0, IAutomationService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, INotificationService)
], AutomationRunner);
export { AutomationRunner };
