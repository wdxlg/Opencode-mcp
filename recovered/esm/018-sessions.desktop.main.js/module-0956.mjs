// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/policy/common/copilotManagedSettings.ts
import { createDecorator } from "./module-0077.mjs";
import { isEmptyObject, isObject, isString } from "./module-0010.mjs";
import { extraKnownMarketplacesToConfigDict } from "./module-0955.mjs";


// src/vs/platform/policy/common/copilotManagedSettings.ts
var COPILOT_DISABLE_BYPASS_PERMISSIONS_MODE_KEY = "permissions.disableBypassPermissionsMode";

var COPILOT_ENABLED_PLUGINS_KEY = "enabledPlugins";

var COPILOT_EXTRA_MARKETPLACES_KEY = "extraKnownMarketplaces";

var COPILOT_STRICT_MARKETPLACES_KEY = "strictKnownMarketplaces";

var COPILOT_ALLOWED_MCP_SERVERS_KEY = "allowedMcpServers";

var COPILOT_DENIED_MCP_SERVERS_KEY = "deniedMcpServers";

var COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_KEY = "strictPluginOnlyCustomization";

var COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_KEY = "allowManagedMcpServersOnly";

var COPILOT_ALLOW_MANAGED_HOOKS_ONLY_KEY = "allowManagedHooksOnly";

var COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY = "forceRemoteSettingsRefresh";

var COPILOT_SANDBOX_ENABLED_KEY = "sandbox.enabled";

var MANAGED_SETTINGS_CONTROL_DEFINITIONS = {
  [COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY]: { type: "boolean" },
  [COPILOT_SANDBOX_ENABLED_KEY]: { type: "boolean" }
};

var COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG = "chat.customizations.strictPluginOnlyCustomization";

var COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG = "chat.mcp.allowManagedServersOnly";

var COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG = "chat.hooks.allowManagedOnly";

var COPILOT_MODEL_KEY = "permissions.model";

var COPILOT_TOP_LEVEL_MODEL_KEY = "model";

var COPILOT_OTEL_ENABLED_KEY = "telemetry.enabled";

var COPILOT_OTEL_ENDPOINT_KEY = "telemetry.endpoint";

var COPILOT_OTEL_PROTOCOL_KEY = "telemetry.protocol";

var COPILOT_OTEL_CAPTURE_CONTENT_KEY = "telemetry.captureContent";

var COPILOT_OTEL_LOCK_CAPTURE_CONTENT_KEY = "telemetry.lockCaptureContent";

var COPILOT_OTEL_SERVICE_NAME_KEY = "telemetry.serviceName";

var COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY = "telemetry.resourceAttributes";

var COPILOT_OTEL_HEADERS_KEY = "telemetry.headers";

var managedSettingValueCallbacks = /* @__PURE__ */ new Map();

function managedSettingValue(key3) {
  let callback = managedSettingValueCallbacks.get(key3);
  if (!callback) {
    callback = (policyData) => policyData.managedSettings?.[key3];
    managedSettingValueCallbacks.set(key3, callback);
  }
  return callback;
}

function resolveForceRemoteSettingsRefresh(nativeMdm, server, file) {
  const resolution = pickManagedSettings(nativeMdm, server, file).resolutions.get(COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY);
  const contribution = resolution?.contributions.find((candidate) => typeof candidate.value === "boolean");
  if (!contribution) {
    return { effective: false };
  }
  return contribution.value === true ? { effective: true, source: contribution.channel } : { effective: false };
}

var IManagedSettingsService = createDecorator("managedSettingsService");

var managedModelValueCallback;

function normalizeModelValue(value2) {
  const trimmed = typeof value2 === "string" ? value2.trim() : void 0;
  return trimmed ? trimmed : void 0;
}

function managedModelValue() {
  if (!managedModelValueCallback) {
    managedModelValueCallback = (policyData) => {
      const topLevel = normalizeModelValue(policyData.managedSettings?.[COPILOT_TOP_LEVEL_MODEL_KEY]);
      return topLevel ?? normalizeModelValue(policyData.managedSettings?.[COPILOT_MODEL_KEY]);
    };
  }
  return managedModelValueCallback;
}

function thirdPartyAgentEnabledValue(policyData) {
  return policyData.chat_preview_features_enabled === false || policyData.managedSettingsActive === true ? false : void 0;
}

var INativeManagedSettingsService = createDecorator("nativeManagedSettingsService");

function flattenManagedSettings(object2) {
  const result = {};
  flattenManagedSettingsValue(object2, void 0, result);
  return result;
}

function flattenManagedSettingsValue(value2, prefix, result) {
  if (typeof value2 === "string" || typeof value2 === "number" || typeof value2 === "boolean") {
    if (prefix !== void 0) {
      result[prefix] = value2;
    }
    return;
  }
  if (!isManagedSettingsObject(value2)) {
    return;
  }
  for (const key3 in value2) {
    flattenManagedSettingsValue(value2[key3], prefix ? `${prefix}.${key3}` : key3, result);
  }
}

function isManagedSettingsObject(value2) {
  return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
}

function collectManagedSettingsDefinitions(policyDefinitions) {
  const definitions3 = {};
  for (const policyName in policyDefinitions) {
    const policyManagedSettings = policyDefinitions[policyName].managedSettings;
    if (policyManagedSettings) {
      for (const key3 in policyManagedSettings) {
        definitions3[key3] = policyManagedSettings[key3];
      }
    }
  }
  return definitions3;
}

function hasManagedSettingsDefinitions(policyDefinitions) {
  for (const policyName in policyDefinitions) {
    const policyManagedSettings = policyDefinitions[policyName].managedSettings;
    if (policyManagedSettings && !isEmptyObject(policyManagedSettings)) {
      return true;
    }
  }
  return false;
}

function projectManagedSettings(values, definitions3, onWarn) {
  const projected = {};
  for (const key3 in definitions3) {
    const value2 = values[key3];
    if (value2 === void 0) {
      continue;
    }
    if (typeof value2 === definitions3[key3].type) {
      projected[key3] = value2;
    } else {
      onWarn?.(`Ignoring managed setting "${key3}": expected ${definitions3[key3].type}, got ${typeof value2}`);
    }
  }
  return projected;
}

var MANAGED_SETTINGS_CHANNELS = ["nativeMdm", "server", "file"];

function pickManagedSettings(nativeMdm, server, file) {
  const bags = { nativeMdm, server, file };
  const resolutions = /* @__PURE__ */ new Map();
  for (const channel of MANAGED_SETTINGS_CHANNELS) {
    const bag = bags[channel];
    if (!bag) {
      continue;
    }
    for (const key3 of Object.keys(bag)) {
      const value2 = bag[key3];
      if (value2 === void 0) {
        continue;
      }
      const existing = resolutions.get(key3);
      if (existing) {
        existing.contributions.push({ channel, value: value2 });
      } else {
        resolutions.set(key3, { value: value2, source: channel, contributions: [{ channel, value: value2 }] });
      }
    }
  }
  const activeSources = /* @__PURE__ */ new Set();
  const entries2 = [];
  for (const [key3, resolution] of resolutions) {
    entries2.push([key3, resolution.value]);
    activeSources.add(resolution.source);
  }
  return {
    // Build via Object.fromEntries (define-property semantics) rather than bracket assignment so
    // an untrusted `__proto__` key can't corrupt the merged bag's prototype chain.
    values: Object.fromEntries(entries2),
    resolutions,
    // Preserve precedence order for a stable, readable report.
    activeSources: MANAGED_SETTINGS_CHANNELS.filter((channel) => activeSources.has(channel))
  };
}

function encodeStringMap(value2) {
  if (!isObject(value2)) {
    return void 0;
  }
  const out = {};
  for (const [k, v2] of Object.entries(value2)) {
    if (k === "__proto__" || k === "constructor" || k === "prototype") {
      continue;
    }
    if (isString(v2)) {
      out[k] = v2;
    } else if (typeof v2 === "number" || typeof v2 === "boolean") {
      out[k] = String(v2);
    }
  }
  return out;
}

function encodeObject(value2) {
  return isObject(value2) ? value2 : void 0;
}

function encodeArray(value2) {
  return Array.isArray(value2) ? value2 : void 0;
}

function encodeExtraMarketplaces(value2, onWarn) {
  return extraKnownMarketplacesToConfigDict(normalizeExtraKnownMarketplaces(value2, onWarn));
}

var STRUCTURED_MANAGED_SETTINGS = [
  {
    key: COPILOT_ENABLED_PLUGINS_KEY,
    encode: encodeObject
  },
  {
    key: COPILOT_STRICT_MARKETPLACES_KEY,
    encode: encodeArray
  },
  {
    key: COPILOT_ALLOWED_MCP_SERVERS_KEY,
    encode: encodeArray
  },
  {
    key: COPILOT_DENIED_MCP_SERVERS_KEY,
    encode: encodeArray
  },
  {
    key: COPILOT_EXTRA_MARKETPLACES_KEY,
    encode: encodeExtraMarketplaces
  },
  {
    // Nested under `telemetry`; carried as a JSON-encoded `{ [k]: string }` map. Non-string
    // primitive values are coerced to strings; non-primitive values are dropped.
    key: COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY,
    encode: encodeStringMap
  },
  {
    // Nested under `telemetry`; carried as a JSON-encoded `{ [k]: string }` map of OTLP headers.
    key: COPILOT_OTEL_HEADERS_KEY,
    encode: encodeStringMap
  }
];

function readNestedManagedKey(obj, dottedKey) {
  let current = obj;
  for (const segment of dottedKey.split(".")) {
    if (!isObject(current)) {
      return void 0;
    }
    current = current[segment];
  }
  return current;
}

function withNestedManagedKeyDeleted(obj, dottedKey) {
  const dot = dottedKey.indexOf(".");
  if (dot === -1) {
    const clone2 = { ...obj };
    delete clone2[dottedKey];
    return clone2;
  }
  const head = dottedKey.slice(0, dot);
  const child = obj[head];
  if (!isObject(child)) {
    return obj;
  }
  return { ...obj, [head]: withNestedManagedKeyDeleted(child, dottedKey.slice(dot + 1)) };
}

function normalizeManagedSettings(parsed, onWarn) {
  let scalarRest = { ...parsed };
  for (const setting of STRUCTURED_MANAGED_SETTINGS) {
    scalarRest = withNestedManagedKeyDeleted(scalarRest, setting.key);
  }
  const result = { ...flattenManagedSettings(scalarRest) };
  for (const setting of STRUCTURED_MANAGED_SETTINGS) {
    const encoded = setting.encode(readNestedManagedKey(parsed, setting.key), onWarn);
    if (encoded !== void 0) {
      result[setting.key] = JSON.stringify(encoded);
    }
  }
  return result;
}

function normalizeExtraKnownMarketplaces(value2, onWarn) {
  if (!isObject(value2)) {
    return void 0;
  }
  const seen = /* @__PURE__ */ new Set();
  const entries2 = [];
  for (const [name, entry] of Object.entries(value2)) {
    if (!isObject(entry) || !isObject(entry.source)) {
      onWarn?.(`Skipping malformed extraKnownMarketplaces entry "${name}": expected { source: { source, repo|url } }`);
      continue;
    }
    const rawEntry = entry;
    const src = rawEntry.source;
    const autoUpdate = typeof rawEntry.autoUpdate === "boolean" ? rawEntry.autoUpdate : void 0;
    if (rawEntry.autoUpdate !== void 0 && autoUpdate === void 0) {
      onWarn?.(`Ignoring invalid autoUpdate for extraKnownMarketplaces entry "${name}": expected boolean`);
    }
    let normalized;
    if (src.source === "github" && isString(src.repo)) {
      normalized = { name, ...autoUpdate === void 0 ? {} : { autoUpdate }, source: { source: "github", repo: src.repo, ...src.ref ? { ref: src.ref } : {} } };
    } else if (src.source === "git" && isString(src.url)) {
      normalized = { name, ...autoUpdate === void 0 ? {} : { autoUpdate }, source: { source: "git", url: src.url, ...src.ref ? { ref: src.ref } : {} } };
    } else if (src.source === "github" || src.source === "git") {
      onWarn?.(`Skipping extraKnownMarketplaces entry "${name}": source "${src.source}" requires ${src.source === "github" ? '"repo"' : '"url"'}`);
    } else {
      onWarn?.(`Skipping extraKnownMarketplaces entry "${name}": unknown source type "${src.source}"`);
    }
    if (normalized && !seen.has(name)) {
      seen.add(name);
      entries2.push(normalized);
    }
  }
  return entries2;
}

var IFileManagedSettingsService = createDecorator("fileManagedSettingsService");
export { managedSettingValue, resolveForceRemoteSettingsRefresh, normalizeModelValue, managedModelValue, thirdPartyAgentEnabledValue, flattenManagedSettings, flattenManagedSettingsValue, isManagedSettingsObject, collectManagedSettingsDefinitions, hasManagedSettingsDefinitions, projectManagedSettings, pickManagedSettings, encodeStringMap, encodeObject, encodeArray, encodeExtraMarketplaces, readNestedManagedKey, withNestedManagedKeyDeleted, normalizeManagedSettings, normalizeExtraKnownMarketplaces, COPILOT_DISABLE_BYPASS_PERMISSIONS_MODE_KEY, COPILOT_ENABLED_PLUGINS_KEY, COPILOT_EXTRA_MARKETPLACES_KEY, COPILOT_STRICT_MARKETPLACES_KEY, COPILOT_ALLOWED_MCP_SERVERS_KEY, COPILOT_DENIED_MCP_SERVERS_KEY, COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_KEY, COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_KEY, COPILOT_ALLOW_MANAGED_HOOKS_ONLY_KEY, COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY, COPILOT_SANDBOX_ENABLED_KEY, MANAGED_SETTINGS_CONTROL_DEFINITIONS, COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG, COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG, COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG, COPILOT_MODEL_KEY, COPILOT_TOP_LEVEL_MODEL_KEY, COPILOT_OTEL_ENABLED_KEY, COPILOT_OTEL_ENDPOINT_KEY, COPILOT_OTEL_PROTOCOL_KEY, COPILOT_OTEL_CAPTURE_CONTENT_KEY, COPILOT_OTEL_LOCK_CAPTURE_CONTENT_KEY, COPILOT_OTEL_SERVICE_NAME_KEY, COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY, COPILOT_OTEL_HEADERS_KEY, managedSettingValueCallbacks, IManagedSettingsService, managedModelValueCallback, INativeManagedSettingsService, MANAGED_SETTINGS_CHANNELS, STRUCTURED_MANAGED_SETTINGS, IFileManagedSettingsService };
