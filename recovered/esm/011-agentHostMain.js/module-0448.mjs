// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/automationMeta.ts
import { AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY } from "./module-0447.mjs";


// src/vs/platform/agentHost/common/meta/automationMeta.ts
function isAgentHostLegacyAutomationImportPending(source) {
  return source !== void 0 && readAutomationMetaSlot(source, AGENT_HOST_LEGACY_AUTOMATION_IMPORT_PENDING_META_KEY) === true;
}

function readAutomationMetaSlot(source, key) {
  return source._meta?.[key];
}
export { isAgentHostLegacyAutomationImportPending, readAutomationMetaSlot };
