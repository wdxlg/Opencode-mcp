// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostConfigurationSync.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { LOCAL_AGENT_HOST_RESOURCE_IDENTITY } from "./module-1803.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/platform/agentHost/common/agentHostConfigurationSync.ts
function getRegistry() {
  return Registry.as(Extensions4.Configuration);
}

function getPropertySchema(settingId) {
  const registry4 = getRegistry();
  return registry4.getConfigurationProperties()[settingId] ?? registry4.getExcludedConfigurationProperties()[settingId];
}

function matchesSchemaType(value2, type) {
  if (type === void 0) {
    return true;
  }
  if (Array.isArray(type)) {
    return type.some((candidate) => matchesSchemaType(value2, candidate));
  }
  switch (type) {
    case "boolean":
      return typeof value2 === "boolean";
    case "string":
      return typeof value2 === "string";
    case "number":
      return typeof value2 === "number";
    case "integer":
      return typeof value2 === "number" && Number.isInteger(value2);
    case "array":
      return Array.isArray(value2);
    case "object":
      return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
    case "null":
      return value2 === null;
    default:
      return true;
  }
}

function getGlobalConfigurationValue(configurationService, settingId) {
  const inspected = configurationService.inspect(settingId);
  const property = getPropertySchema(settingId);
  for (const value2 of [inspected.policyValue, inspected.userValue, inspected.applicationValue]) {
    if (value2 !== void 0 && matchesSchemaType(value2, property?.type)) {
      return value2;
    }
  }
  return inspected.defaultValue ?? property?.default;
}

function inspectValue(configurationService, settingId) {
  const inspected = configurationService.inspect(settingId);
  const property = getPropertySchema(settingId);
  const values = [
    ["policyValue", inspected.policyValue],
    ["userValue", inspected.userValue],
    ["applicationValue", inspected.applicationValue]
  ];
  for (const [source, value2] of values) {
    if (value2 !== void 0 && matchesSchemaType(value2, property?.type)) {
      return [value2, source];
    }
  }
  return void 0;
}

function getAgentHostConfigurationSyncTarget(identity2) {
  if (identity2 === LOCAL_AGENT_HOST_RESOURCE_IDENTITY) {
    return 0 /* Local */;
  }
  return URI.parse(identity2).scheme === Schemas.vscodeRemote ? 1 /* RemoteExtensionHost */ : 2 /* Remote */;
}

function includesTarget(scope, target) {
  switch (scope ?? "all" /* All */) {
    case "all" /* All */:
      return true;
    case "local" /* Local */:
      return target === 0 /* Local */;
    case "ambient" /* Ambient */:
      return target === 0 /* Local */ || target === 1 /* RemoteExtensionHost */;
  }
}

function getAgentHostConfigurationSyncEntries(target) {
  const entries2 = [];
  for (const [settingId, sync] of getRegistry().getAgentHostSyncConfigurations()) {
    if (!includesTarget(sync.scope, target)) {
      continue;
    }
    entries2.push({ settingId, sync });
  }
  return entries2;
}

function resolveAgentHostConfigurationSyncValue(configurationService, entry) {
  const value2 = getGlobalConfigurationValue(configurationService, entry.settingId);
  return entry.sync.transform ? entry.sync.transform(value2) : value2;
}

function formatAgentHostConfigurationSyncValueForLog(settingId, value2) {
  if (typeof value2 === "boolean" || typeof value2 === "number") {
    return String(value2);
  }
  const property = getPropertySchema(settingId);
  if (typeof value2 === "string" && property?.enum?.includes(value2)) {
    return value2;
  }
  return `<${Array.isArray(value2) ? "array" : typeof value2}>`;
}

function resolveAgentHostConfigurationSyncPatch(configurationService, target) {
  const patch2 = {};
  for (const entry of getAgentHostConfigurationSyncEntries(target)) {
    const value2 = resolveAgentHostConfigurationSyncValue(configurationService, entry);
    if (value2 !== void 0) {
      patch2[entry.sync.key] = value2;
    }
  }
  return patch2;
}
export { getRegistry, getPropertySchema, matchesSchemaType, getGlobalConfigurationValue, inspectValue, getAgentHostConfigurationSyncTarget, includesTarget, getAgentHostConfigurationSyncEntries, resolveAgentHostConfigurationSyncValue, formatAgentHostConfigurationSyncValueForLog, resolveAgentHostConfigurationSyncPatch };
