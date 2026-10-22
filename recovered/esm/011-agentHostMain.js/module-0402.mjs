// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostManagedSettings.ts
import { getGlobalConfigurationValue, inspectValue } from "./module-0401.mjs";
import { buildManagedFamilyRule, buildManagedRule } from "./module-0399.mjs";
import { extractDomainPattern, normalizeDomain } from "./module-0215.mjs";
import { ELIGIBLE_FOR_AUTO_APPROVAL_SETTING_ID, GLOBAL_AUTO_APPROVE_SETTING_ID, TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID, TERMINAL_AUTO_APPROVE_SETTING_ID } from "./module-0057.mjs";


// src/vs/platform/agentHost/common/agentHostManagedSettings.ts
var AgentHostMapLegacySettingsToManagedSettingsSettingId = "chat.agentHost.copilot.mapLegacySettingsToManagedSettings";

function managedPermissionsSetting(settingId, sources, transform2) {
  return {
    settingId,
    contribute: (configurationService) => {
      const configuration = inspectValue(configurationService, settingId);
      if (configuration === void 0) {
        return void 0;
      }
      const [value, source] = configuration;
      if (sources === "policyOnly" && source !== "policyValue") {
        return void 0;
      }
      return transform2(value);
    }
  };
}

function managedPermissionsCompositeSetting(settingId, additionalSettingIds, contribute) {
  return { settingId, additionalSettingIds, contribute };
}

function contributeNetworkDomainRules(configurationService) {
  if (getGlobalConfigurationValue(configurationService, "chat.agent.networkFilter" /* NetworkFilter */) !== true) {
    return void 0;
  }
  const allowed = getGlobalConfigurationValue(configurationService, "chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */) ?? [];
  const denied = getGlobalConfigurationValue(configurationService, "chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */) ?? [];
  if (allowed.length === 0 && denied.length === 0) {
    return { deny: [buildManagedFamilyRule("Domain" /* Domain */)] };
  }
  const deny = [];
  for (const pattern of denied) {
    if (typeof pattern !== "string") {
      continue;
    }
    const domain = normalizeDomain(extractDomainPattern(pattern), true);
    if (!domain) {
      continue;
    }
    const rule = domain === "*" ? buildManagedFamilyRule("Domain" /* Domain */) : buildManagedRule("Domain" /* Domain */, domain);
    if (rule) {
      deny.push(rule);
    }
  }
  return deny.length > 0 ? { deny } : void 0;
}

function contributeTerminalDenialRules(rules) {
  if (!rules || typeof rules !== "object") {
    return void 0;
  }
  const ask = [];
  for (const [command, value] of Object.entries(rules)) {
    if (!isSubCommandDenial(value) || !isLiteralCommandKey(command)) {
      continue;
    }
    const rule = buildManagedRule("Shell" /* Shell */, command);
    if (rule) {
      ask.push(rule);
    }
  }
  return ask.length > 0 ? { ask } : void 0;
}

function isSubCommandDenial(value) {
  if (value === false) {
    return true;
  }
  return typeof value === "object" && value !== null && value.approve === false && value.matchCommandLine !== true;
}

var AUTO_APPROVE_REGEX_KEY = /^\/.+\/[dgimsuvy]*$/;

function isLiteralCommandKey(command) {
  return !AUTO_APPROVE_REGEX_KEY.test(command) && !command.includes("*");
}

function contributeEligibleForAutoApprovalRestriction(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  if (Object.values(value).every((eligible) => eligible === true)) {
    return void 0;
  }
  return { disableBypassPermissionsMode: "disable" };
}

var managedPermissionsSettings = [
  // Disabling the SDK's bypass mode takes "Allow All" away from the user for
  // good, so only an administrator may drive it.
  managedPermissionsSetting(GLOBAL_AUTO_APPROVE_SETTING_ID, "policyOnly", (value) => value === false ? { disableBypassPermissionsMode: "disable" } : void 0),
  // No SDK tool-name family exists, so a policy that marks any tool ineligible
  // falls back to the bypass lock (see the transform).
  managedPermissionsSetting(ELIGIBLE_FOR_AUTO_APPROVAL_SETTING_ID, "policyOnly", contributeEligibleForAutoApprovalRestriction),
  // Matches VS Code, where a user or application value already suppresses
  // terminal auto-approval outright.
  managedPermissionsSetting(TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID, "anyGlobal", (value) => value === false ? { ask: [buildManagedFamilyRule("Shell" /* Shell */)] } : void 0),
  // The filter and its lists are evaluated together, and VS Code honors a user
  // or application value for all three.
  managedPermissionsCompositeSetting(
    "chat.agent.networkFilter" /* NetworkFilter */,
    ["chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */, "chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */],
    contributeNetworkDomainRules
  ),
  // Mirrors the setting's own semantics, where a user or application value
  // already forces approval for the matching command.
  managedPermissionsSetting(TERMINAL_AUTO_APPROVE_SETTING_ID, "anyGlobal", contributeTerminalDenialRules)
];

var managedPermissionsConfigurationIds = [
  AgentHostMapLegacySettingsToManagedSettingsSettingId,
  ...managedPermissionsSettings.flatMap((mapping) => [mapping.settingId, ...mapping.additionalSettingIds ?? []])
];

function isManagedSettingsPermissions(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const permissions = value;
  if (Object.keys(permissions).some((key) => key !== "disableBypassPermissionsMode" && key !== "deny" && key !== "ask")) {
    return false;
  }
  return (permissions.disableBypassPermissionsMode === void 0 || permissions.disableBypassPermissionsMode === "disable") && isStringArrayOrUndefined(permissions.deny) && isStringArrayOrUndefined(permissions.ask);
}

function isStringArrayOrUndefined(value) {
  return value === void 0 || Array.isArray(value) && value.every((item) => typeof item === "string");
}
export { managedPermissionsSetting, managedPermissionsCompositeSetting, contributeNetworkDomainRules, contributeTerminalDenialRules, isSubCommandDenial, isLiteralCommandKey, contributeEligibleForAutoApprovalRestriction, isManagedSettingsPermissions, isStringArrayOrUndefined, AgentHostMapLegacySettingsToManagedSettingsSettingId, AUTO_APPROVE_REGEX_KEY, managedPermissionsSettings, managedPermissionsConfigurationIds };
