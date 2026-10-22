// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostManagedSettings.ts
import { getGlobalConfigurationValue, inspectValue } from "./module-2464.mjs";
import { buildManagedFamilyRule, buildManagedRule } from "./module-2463.mjs";
import { extractDomainPattern, normalizeDomain } from "./module-1240.mjs";
import { ELIGIBLE_FOR_AUTO_APPROVAL_SETTING_ID, GLOBAL_AUTO_APPROVE_SETTING_ID, TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID, TERMINAL_AUTO_APPROVE_SETTING_ID } from "./module-1741.mjs";


// src/vs/platform/agentHost/common/agentHostManagedSettings.ts
var AgentHostMapLegacySettingsToManagedSettingsSettingId = "chat.agentHost.copilot.mapLegacySettingsToManagedSettings";

function managedPermissionsSetting(settingId, sources, transform2) {
  return {
    settingId,
    contribute: (configurationService) => {
      const configuration2 = inspectValue(configurationService, settingId);
      if (configuration2 === void 0) {
        return void 0;
      }
      const [value2, source] = configuration2;
      if (sources === "policyOnly" && source !== "policyValue") {
        return void 0;
      }
      return transform2(value2);
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
  for (const [command4, value2] of Object.entries(rules)) {
    if (!isSubCommandDenial(value2) || !isLiteralCommandKey(command4)) {
      continue;
    }
    const rule = buildManagedRule("Shell" /* Shell */, command4);
    if (rule) {
      ask.push(rule);
    }
  }
  return ask.length > 0 ? { ask } : void 0;
}

function isSubCommandDenial(value2) {
  if (value2 === false) {
    return true;
  }
  return typeof value2 === "object" && value2 !== null && value2.approve === false && value2.matchCommandLine !== true;
}

var AUTO_APPROVE_REGEX_KEY = /^\/.+\/[dgimsuvy]*$/;

function isLiteralCommandKey(command4) {
  return !AUTO_APPROVE_REGEX_KEY.test(command4) && !command4.includes("*");
}

function contributeEligibleForAutoApprovalRestriction(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  if (Object.values(value2).every((eligible) => eligible === true)) {
    return void 0;
  }
  return { disableBypassPermissionsMode: "disable" };
}

var managedPermissionsSettings = [
  // Disabling the SDK's bypass mode takes "Allow All" away from the user for
  // good, so only an administrator may drive it.
  managedPermissionsSetting(GLOBAL_AUTO_APPROVE_SETTING_ID, "policyOnly", (value2) => value2 === false ? { disableBypassPermissionsMode: "disable" } : void 0),
  // No SDK tool-name family exists, so a policy that marks any tool ineligible
  // falls back to the bypass lock (see the transform).
  managedPermissionsSetting(ELIGIBLE_FOR_AUTO_APPROVAL_SETTING_ID, "policyOnly", contributeEligibleForAutoApprovalRestriction),
  // Matches VS Code, where a user or application value already suppresses
  // terminal auto-approval outright.
  managedPermissionsSetting(TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID, "anyGlobal", (value2) => value2 === false ? { ask: [buildManagedFamilyRule("Shell" /* Shell */)] } : void 0),
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
  ...managedPermissionsSettings.flatMap((mapping2) => [mapping2.settingId, ...mapping2.additionalSettingIds ?? []])
];

function resolveManagedSettingsPermissions(configurationService) {
  if (getGlobalConfigurationValue(configurationService, AgentHostMapLegacySettingsToManagedSettingsSettingId) !== true) {
    return {};
  }
  const deny = /* @__PURE__ */ new Set();
  const ask = /* @__PURE__ */ new Set();
  let disableBypassPermissionsMode;
  for (const mapping2 of managedPermissionsSettings) {
    const contribution = mapping2.contribute(configurationService);
    if (!contribution) {
      continue;
    }
    if (contribution.disableBypassPermissionsMode) {
      disableBypassPermissionsMode = contribution.disableBypassPermissionsMode;
    }
    contribution.deny?.forEach((rule) => deny.add(rule));
    contribution.ask?.forEach((rule) => ask.add(rule));
  }
  const permissions = {};
  if (disableBypassPermissionsMode) {
    permissions.disableBypassPermissionsMode = disableBypassPermissionsMode;
  }
  if (deny.size > 0) {
    permissions.deny = [...deny];
  }
  if (ask.size > 0) {
    permissions.ask = [...ask];
  }
  return permissions;
}
export { managedPermissionsSetting, managedPermissionsCompositeSetting, contributeNetworkDomainRules, contributeTerminalDenialRules, isSubCommandDenial, isLiteralCommandKey, contributeEligibleForAutoApprovalRestriction, resolveManagedSettingsPermissions, AgentHostMapLegacySettingsToManagedSettingsSettingId, AUTO_APPROVE_REGEX_KEY, managedPermissionsSettings, managedPermissionsConfigurationIds };
