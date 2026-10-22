// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/automations/automationTelemetry.ts



// src/vs/workbench/contrib/chat/common/automations/automationTelemetry.ts
function publishAutomationCreated(telemetryService, automation) {
  telemetryService.publicLog2("automation.create", {
    intervalKind: automation.schedule.interval,
    permissionLevel: automation.permissionLevel ?? "",
    isolationMode: getAutomationIsolationMode(automation),
    enabled: automation.enabled
  });
}

function publishAutomationUpdated(telemetryService, before, after2) {
  telemetryService.publicLog2("automation.update", {
    intervalKind: after2.schedule.interval,
    scheduleChanged: before.schedule.interval !== after2.schedule.interval || before.schedule.scheduleHour !== after2.schedule.scheduleHour || before.schedule.scheduleMinute !== after2.schedule.scheduleMinute || before.schedule.scheduleDay !== after2.schedule.scheduleDay,
    enabledChanged: before.enabled !== after2.enabled,
    enabled: after2.enabled
  });
}

function publishAutomationDeleted(telemetryService, automation) {
  telemetryService.publicLog2("automation.delete", {
    intervalKind: automation.schedule.interval
  });
}

function publishAutomationRun(telemetryService, args2) {
  telemetryService.publicLog2("automation.run", {
    trigger: args2.trigger,
    intervalKind: args2.automation.schedule.interval,
    success: args2.success,
    durationMs: Math.max(0, Math.round(args2.durationMs)),
    permissionLevel: args2.automation.permissionLevel ?? "",
    isolationMode: getAutomationIsolationMode(args2.automation)
  });
}

function getAutomationIsolationMode(automation) {
  if (automation.target.kind !== "workspace") {
    return "";
  }
  return automation.target.isolation.kind === "folder" ? "workspace" : automation.target.isolation.kind === "worktree" ? "worktree" : "";
}

function publishAutomationRunError(telemetryService, args2) {
  telemetryService.publicLogError2("automation.runError", {
    trigger: args2.trigger,
    intervalKind: args2.automation.schedule.interval
  });
}

function publishAutomationMigration(telemetryService, event) {
  telemetryService.publicLog2("automation.migration", event);
}
export { publishAutomationCreated, publishAutomationUpdated, publishAutomationDeleted, publishAutomationRun, getAutomationIsolationMode, publishAutomationRunError, publishAutomationMigration };
