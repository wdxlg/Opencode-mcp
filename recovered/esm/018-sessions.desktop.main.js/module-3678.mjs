// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/automationMeta.ts
import { AGENT_HOST_AUTOMATION_CATALOG_MIGRATED_META_KEY, AGENT_HOST_LEGACY_AUTOMATION_IMPORT_META_KEY, AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY } from "./module-3677.mjs";


// src/vs/platform/agentHost/common/meta/automationMeta.ts
function isAgentHostAutomationCatalogMigrated(source) {
  return readAutomationMetaSlot(source, AGENT_HOST_AUTOMATION_CATALOG_MIGRATED_META_KEY) === true;
}

function isAgentHostLegacyAutomationImport(source) {
  return source !== void 0 && readAutomationMetaSlot(source, AGENT_HOST_LEGACY_AUTOMATION_IMPORT_META_KEY) === true;
}

function isAgentHostLegacyAutomationImportPending(source) {
  return source !== void 0 && readAutomationMetaSlot(source, AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY) === true;
}

function readAutomationMetaSlot(source, key3) {
  return source._meta?.[key3];
}
export { isAgentHostAutomationCatalogMigrated, isAgentHostLegacyAutomationImport, isAgentHostLegacyAutomationImportPending, readAutomationMetaSlot };
