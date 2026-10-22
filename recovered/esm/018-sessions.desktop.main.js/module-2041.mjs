// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/agentHostConfigPolicy.ts



// src/vs/workbench/contrib/chat/common/agentHostConfigPolicy.ts
function isAutoApprovePolicyRestricted(configurationService) {
  return configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */).policyValue === false;
}

function isAssistedPermissionsEnabled(configurationService) {
  return configurationService.getValue("chat.assistedPermissions.enabled" /* AssistedPermissionsEnabled */) === true;
}

function isPermissionLevelVisible(value2, assistedPermissionsEnabled) {
  return value2 !== "assisted" /* Assisted */ || assistedPermissionsEnabled;
}

function isAutoApproveValuePolicyRestricted(value2, policyRestricted) {
  return policyRestricted && value2 !== "default" /* Default */;
}

function normalizeSessionConfigValue(property, value2, policyRestricted) {
  if (property === "autoApprove" /* AutoApprove */ && isAutoApproveValuePolicyRestricted(value2, policyRestricted)) {
    return "default" /* Default */;
  }
  return value2;
}
export { isAutoApprovePolicyRestricted, isAssistedPermissionsEnabled, isPermissionLevelVisible, isAutoApproveValuePolicyRestricted, normalizeSessionConfigValue };
