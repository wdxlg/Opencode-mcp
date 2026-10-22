// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostLegacyMigration.ts
import { COPILOT_CLI_AGENT_PROVIDER, getCopilotCliSessionRawId, migratedCopilotCliResource } from "./module-1109.mjs";
import { AgentSession } from "./module-1106.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { raceTimeout } from "./module-0036.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostLegacyMigration.ts
var _legacyMigrationEnabledAtStartup;

function primeLegacyMigrationStartupSnapshot(configurationService) {
  _legacyMigrationEnabledAtStartup = configurationService.getValue("chat.agentSessions.migrateLegacyCopilotCli" /* MigrateLegacyCopilotCliSessions */) === true;
}

function isLegacyMigrationEnabledAtStartup(configurationService) {
  return _legacyMigrationEnabledAtStartup ?? configurationService.getValue("chat.agentSessions.migrateLegacyCopilotCli" /* MigrateLegacyCopilotCliSessions */) === true;
}

var LEGACY_MIGRATION_TIMEOUT_MS = 3e4;

var LEGACY_MIGRATION_RESTORE_TIMEOUT_MS = 6e4;

var LEGACY_MIGRATION_OPEN_TIMEOUT_MS = 6e4;

async function adoptLegacyCopilotCliResource(connection, resource, logService, configurationService, telemetryService, source, timeoutMs = LEGACY_MIGRATION_TIMEOUT_MS) {
  const twin = migratedCopilotCliResource(resource);
  if (!twin) {
    return void 0;
  }
  const startedAt = Date.now();
  const report = (outcome) => {
    telemetryService.publicLog2("agentHost.legacyCopilotCliMigrationProbe", {
      source,
      outcome,
      durationMs: Date.now() - startedAt,
      timeoutMs
    });
  };
  if (!connection) {
    report("noConnection");
    return void 0;
  }
  if (!isLegacyMigrationEnabledAtStartup(configurationService)) {
    report("settingDisabled");
    return void 0;
  }
  const rawId = getCopilotCliSessionRawId(twin);
  if (!rawId) {
    return void 0;
  }
  const backendSession = AgentSession.uri(COPILOT_CLI_AGENT_PROVIDER, rawId);
  const store = new DisposableStore();
  try {
    const ref = store.add(connection.getSubscription(1 /* Session */, backendSession, "AgentHostLegacyMigration"));
    const settled = await raceTimeout(whenSubscriptionSettles(ref.object, store), timeoutMs);
    if (settled === true) {
      report("adopted");
      logService.info(`[AgentHost] adopted legacy session ${resource.toString()} in ${Date.now() - startedAt}ms`);
      return twin;
    }
    report(settled === false ? "declined" : "timedOut");
    logService.info(`[AgentHost] legacy session ${resource.toString()} not adopted (${settled === false ? "declined by host" : `no answer within ${timeoutMs}ms`}); opening it unmigrated`);
    return void 0;
  } catch (err) {
    report("failed");
    logService.warn(`[AgentHost] legacy migration probe failed for ${resource.toString()}`, err);
    return void 0;
  } finally {
    store.dispose();
  }
}

function reportLegacyMigrationOpen(telemetryService, source, surfaced) {
  telemetryService.publicLog2("agentHost.legacyCopilotCliMigrationOpen", { source, surfaced });
}

function whenSubscriptionSettles(subscription, store) {
  const current = subscription.value;
  if (current !== void 0) {
    return Promise.resolve(!(current instanceof Error));
  }
  const onDidError = subscription.onDidError;
  if (!onDidError) {
    return Promise.resolve(false);
  }
  return new Promise((resolve3) => {
    store.add(subscription.onDidChange(() => {
      const settled = subscription.value;
      resolve3(settled !== void 0 && !(settled instanceof Error));
    }));
    store.add(onDidError(() => resolve3(false)));
  });
}
export { primeLegacyMigrationStartupSnapshot, isLegacyMigrationEnabledAtStartup, adoptLegacyCopilotCliResource, reportLegacyMigrationOpen, whenSubscriptionSettles, _legacyMigrationEnabledAtStartup, LEGACY_MIGRATION_TIMEOUT_MS, LEGACY_MIGRATION_RESTORE_TIMEOUT_MS, LEGACY_MIGRATION_OPEN_TIMEOUT_MS };
