// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/policy/common/copilotManagedSettings.ts
import { init_types, isObject, isString } from "./module-0016.mjs";
import { extraKnownMarketplacesToConfigDict, init_managedSettings } from "./module-0249.mjs";
import { __esm } from "./module-0000.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/policy/common/copilotManagedSettings.ts
function managedSettingValue(key) {
  let callback = managedSettingValueCallbacks.get(key);
  if (!callback) {
    callback = (policyData) => policyData.managedSettings?.[key];
    managedSettingValueCallbacks.set(key, callback);
  }
  return callback;
}

function thirdPartyAgentEnabledValue(policyData) {
  return policyData.chat_preview_features_enabled === false || policyData.managedSettingsActive === true ? false : void 0;
}

function flattenManagedSettings(object) {
  const result = {};
  flattenManagedSettingsValue(object, void 0, result);
  return result;
}

function flattenManagedSettingsValue(value, prefix, result) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    if (prefix !== void 0) {
      result[prefix] = value;
    }
    return;
  }
  if (!isManagedSettingsObject(value)) {
    return;
  }
  for (const key in value) {
    flattenManagedSettingsValue(value[key], prefix ? `${prefix}.${key}` : key, result);
  }
}

function isManagedSettingsObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectManagedSettingsDefinitions(policyDefinitions) {
  const definitions = {};
  for (const policyName in policyDefinitions) {
    const policyManagedSettings = policyDefinitions[policyName].managedSettings;
    if (policyManagedSettings) {
      for (const key in policyManagedSettings) {
        definitions[key] = policyManagedSettings[key];
      }
    }
  }
  return definitions;
}

function encodeStringMap(value) {
  if (!isObject(value)) {
    return void 0;
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === "__proto__" || k === "constructor" || k === "prototype") {
      continue;
    }
    if (isString(v)) {
      out[k] = v;
    } else if (typeof v === "number" || typeof v === "boolean") {
      out[k] = String(v);
    }
  }
  return out;
}

function encodeObject(value) {
  return isObject(value) ? value : void 0;
}

function encodeArray(value) {
  return Array.isArray(value) ? value : void 0;
}

function encodeExtraMarketplaces(value, onWarn) {
  return extraKnownMarketplacesToConfigDict(normalizeExtraKnownMarketplaces(value, onWarn));
}

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
    const clone = { ...obj };
    delete clone[dottedKey];
    return clone;
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

function normalizeExtraKnownMarketplaces(value, onWarn) {
  if (!isObject(value)) {
    return void 0;
  }
  const seen = /* @__PURE__ */ new Set();
  const entries = [];
  for (const [name, entry] of Object.entries(value)) {
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
      entries.push(normalized);
    }
  }
  return entries;
}

var GITHUB_COPILOT_WIN32_REGISTRY_PATH, GITHUB_COPILOT_WIN32_POLICY_NAME, GITHUB_COPILOT_MACOS_BUNDLE_ID, COPILOT_ENABLED_PLUGINS_KEY, COPILOT_EXTRA_MARKETPLACES_KEY, COPILOT_STRICT_MARKETPLACES_KEY, COPILOT_ALLOWED_MCP_SERVERS_KEY, COPILOT_DENIED_MCP_SERVERS_KEY, COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY, COPILOT_SANDBOX_ENABLED_KEY, MANAGED_SETTINGS_CONTROL_DEFINITIONS, COPILOT_OTEL_ENABLED_KEY, COPILOT_OTEL_ENDPOINT_KEY, COPILOT_OTEL_PROTOCOL_KEY, COPILOT_OTEL_CAPTURE_CONTENT_KEY, COPILOT_OTEL_LOCK_CAPTURE_CONTENT_KEY, COPILOT_OTEL_SERVICE_NAME_KEY, COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY, COPILOT_OTEL_HEADERS_KEY, managedSettingValueCallbacks, IManagedSettingsService, INativeManagedSettingsService, NullNativeManagedSettingsService, MANAGED_SETTINGS_MACOS_FILE_PATH, MANAGED_SETTINGS_LINUX_FILE_PATH, MANAGED_SETTINGS_WINDOWS_DIR, MANAGED_SETTINGS_FILE_NAME, STRUCTURED_MANAGED_SETTINGS, IFileManagedSettingsService, NullFileManagedSettingsService;

var init_copilotManagedSettings = __esm({
  "src/vs/platform/policy/common/copilotManagedSettings.ts"() {
    init_event();
    init_managedSettings();
    init_types();
    init_instantiation();
    GITHUB_COPILOT_WIN32_REGISTRY_PATH = "SOFTWARE\\Policies\\GitHubCopilot";
    GITHUB_COPILOT_WIN32_POLICY_NAME = "GitHubCopilot";
    GITHUB_COPILOT_MACOS_BUNDLE_ID = "com.github.copilot";
    COPILOT_ENABLED_PLUGINS_KEY = "enabledPlugins";
    COPILOT_EXTRA_MARKETPLACES_KEY = "extraKnownMarketplaces";
    COPILOT_STRICT_MARKETPLACES_KEY = "strictKnownMarketplaces";
    COPILOT_ALLOWED_MCP_SERVERS_KEY = "allowedMcpServers";
    COPILOT_DENIED_MCP_SERVERS_KEY = "deniedMcpServers";
    COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY = "forceRemoteSettingsRefresh";
    COPILOT_SANDBOX_ENABLED_KEY = "sandbox.enabled";
    MANAGED_SETTINGS_CONTROL_DEFINITIONS = {
      [COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY]: { type: "boolean" },
      [COPILOT_SANDBOX_ENABLED_KEY]: { type: "boolean" }
    };
    COPILOT_OTEL_ENABLED_KEY = "telemetry.enabled";
    COPILOT_OTEL_ENDPOINT_KEY = "telemetry.endpoint";
    COPILOT_OTEL_PROTOCOL_KEY = "telemetry.protocol";
    COPILOT_OTEL_CAPTURE_CONTENT_KEY = "telemetry.captureContent";
    COPILOT_OTEL_LOCK_CAPTURE_CONTENT_KEY = "telemetry.lockCaptureContent";
    COPILOT_OTEL_SERVICE_NAME_KEY = "telemetry.serviceName";
    COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY = "telemetry.resourceAttributes";
    COPILOT_OTEL_HEADERS_KEY = "telemetry.headers";
    managedSettingValueCallbacks = /* @__PURE__ */ new Map();
    IManagedSettingsService = createDecorator("managedSettingsService");
    INativeManagedSettingsService = createDecorator("nativeManagedSettingsService");
    NullNativeManagedSettingsService = class {
      constructor() {
        this.managedSettings = {};
        this.onDidChangeManagedSettings = Event.None;
      }
      async initialize() {
        return this.managedSettings;
      }
      async updatePolicyDefinitions() {
        return this.managedSettings;
      }
    };
    MANAGED_SETTINGS_MACOS_FILE_PATH = "/Library/Application Support/GitHubCopilot/managed-settings.json";
    MANAGED_SETTINGS_LINUX_FILE_PATH = "/etc/github-copilot/managed-settings.json";
    MANAGED_SETTINGS_WINDOWS_DIR = "GitHubCopilot";
    MANAGED_SETTINGS_FILE_NAME = "managed-settings.json";
    STRUCTURED_MANAGED_SETTINGS = [
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
    IFileManagedSettingsService = createDecorator("fileManagedSettingsService");
    NullFileManagedSettingsService = class {
      constructor() {
        this.rawManagedSettings = {};
        this.managedSettings = {};
        this.onDidChangeRawManagedSettings = Event.None;
        this.onDidChangeManagedSettings = Event.None;
      }
      async initialize() {
        return this.managedSettings;
      }
    };
  }
});
export { managedSettingValue, thirdPartyAgentEnabledValue, flattenManagedSettings, flattenManagedSettingsValue, isManagedSettingsObject, collectManagedSettingsDefinitions, encodeStringMap, encodeObject, encodeArray, encodeExtraMarketplaces, readNestedManagedKey, withNestedManagedKeyDeleted, normalizeManagedSettings, normalizeExtraKnownMarketplaces, GITHUB_COPILOT_WIN32_REGISTRY_PATH, GITHUB_COPILOT_WIN32_POLICY_NAME, GITHUB_COPILOT_MACOS_BUNDLE_ID, COPILOT_ENABLED_PLUGINS_KEY, COPILOT_EXTRA_MARKETPLACES_KEY, COPILOT_STRICT_MARKETPLACES_KEY, COPILOT_ALLOWED_MCP_SERVERS_KEY, COPILOT_DENIED_MCP_SERVERS_KEY, COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY, COPILOT_SANDBOX_ENABLED_KEY, MANAGED_SETTINGS_CONTROL_DEFINITIONS, COPILOT_OTEL_ENABLED_KEY, COPILOT_OTEL_ENDPOINT_KEY, COPILOT_OTEL_PROTOCOL_KEY, COPILOT_OTEL_CAPTURE_CONTENT_KEY, COPILOT_OTEL_LOCK_CAPTURE_CONTENT_KEY, COPILOT_OTEL_SERVICE_NAME_KEY, COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY, COPILOT_OTEL_HEADERS_KEY, managedSettingValueCallbacks, IManagedSettingsService, INativeManagedSettingsService, NullNativeManagedSettingsService, MANAGED_SETTINGS_MACOS_FILE_PATH, MANAGED_SETTINGS_LINUX_FILE_PATH, MANAGED_SETTINGS_WINDOWS_DIR, MANAGED_SETTINGS_FILE_NAME, STRUCTURED_MANAGED_SETTINGS, IFileManagedSettingsService, NullFileManagedSettingsService, init_copilotManagedSettings };
