// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/automations/automationService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/automations/automationService.ts
var IAutomationService = createDecorator("automationService");

var ConfigureAutomationToolReferenceName = "configureAutomation";

var AutomationActiveRunError = class extends Error {
  constructor(automationId2, runId) {
    super(`Automation '${automationId2}' has active run '${runId}'.`);
    this.automationId = automationId2;
    this.runId = runId;
  }
};

function isAutomationActiveRunError(error) {
  return error instanceof AutomationActiveRunError || error instanceof AggregateError && error.errors.length > 0 && error.errors.every(isAutomationActiveRunError);
}

function serializeAutomationEditableState(automation) {
  const target = automation.target.kind === "quickChat" ? {
    kind: automation.target.kind,
    providerId: automation.target.providerId,
    sessionTypeId: automation.target.sessionTypeId
  } : {
    kind: automation.target.kind,
    folderUri: automation.target.folderUri.toString(),
    providerId: automation.target.providerId,
    sessionTypeId: automation.target.sessionTypeId,
    isolation: automation.target.isolation.kind === "worktree" ? { kind: automation.target.isolation.kind, branch: automation.target.isolation.branch } : { kind: automation.target.isolation.kind }
  };
  return JSON.stringify({
    name: automation.name,
    prompt: automation.prompt,
    schedule: {
      interval: automation.schedule.interval,
      scheduleHour: automation.schedule.scheduleHour,
      scheduleMinute: automation.schedule.scheduleMinute,
      scheduleDay: automation.schedule.scheduleDay
    },
    target,
    modelId: automation.modelId,
    mode: automation.mode,
    permissionLevel: automation.permissionLevel ?? "default" /* Default */,
    enabled: automation.enabled
  });
}
export { isAutomationActiveRunError, serializeAutomationEditableState, IAutomationService, ConfigureAutomationToolReferenceName, AutomationActiveRunError };
