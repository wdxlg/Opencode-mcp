// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/automationMigration.ts



// src/vs/platform/agentHost/common/automationMigration.ts
var AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY = "vscode.automationMigration";

var AGENT_HOST_AUTOMATIONS_ENABLED_CONFIG_KEY = "automationsEnabled";

var AGENT_HOST_AUTOMATION_RUN_TIMEOUT_MINUTES_CONFIG_KEY = "automationRunTimeoutMinutes";

var AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY = "vscode.legacyAutomationImportPending";

var AGENT_HOST_AUTOMATION_CATALOG_MIGRATED_META_KEY = "vscode.migrationCompleted";

function isAgentHostAutomationMigrationCompletion(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const candidate = value;
  if (candidate["version"] !== 1 || candidate["status"] !== "complete" || !Array.isArray(candidate["resources"])) {
    return false;
  }
  const resources = candidate["resources"];
  return resources.every((resource) => typeof resource === "string") && new Set(resources).size === resources.length;
}
export { isAgentHostAutomationMigrationCompletion, AGENT_HOST_AUTOMATION_MIGRATION_CONFIG_KEY, AGENT_HOST_AUTOMATIONS_ENABLED_CONFIG_KEY, AGENT_HOST_AUTOMATION_RUN_TIMEOUT_MINUTES_CONFIG_KEY, AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY, AGENT_HOST_AUTOMATION_CATALOG_MIGRATED_META_KEY };
