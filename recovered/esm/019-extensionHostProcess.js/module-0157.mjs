// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/policy/common/copilotManagedSettings.ts
import { createDecorator2 } from "./module-0048.mjs";
import { isEmptyObject } from "./module-0009.mjs";


// src/vs/platform/policy/common/copilotManagedSettings.ts
var COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY = "forceRemoteSettingsRefresh";

var COPILOT_SANDBOX_ENABLED_KEY = "sandbox.enabled";

var MANAGED_SETTINGS_CONTROL_DEFINITIONS = {
  [COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY]: { type: "boolean" },
  [COPILOT_SANDBOX_ENABLED_KEY]: { type: "boolean" }
};

var IManagedSettingsService = createDecorator2("managedSettingsService");

var INativeManagedSettingsService = createDecorator2("nativeManagedSettingsService");

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

function hasManagedSettingsDefinitions(policyDefinitions) {
  for (const policyName in policyDefinitions) {
    const policyManagedSettings = policyDefinitions[policyName].managedSettings;
    if (policyManagedSettings && !isEmptyObject(policyManagedSettings)) {
      return true;
    }
  }
  return false;
}

function projectManagedSettings(values, definitions, onWarn) {
  const projected = {};
  for (const key in definitions) {
    const value = values[key];
    if (value === void 0) {
      continue;
    }
    if (typeof value === definitions[key].type) {
      projected[key] = value;
    } else {
      onWarn?.(`Ignoring managed setting "${key}": expected ${definitions[key].type}, got ${typeof value}`);
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
    for (const key of Object.keys(bag)) {
      const value = bag[key];
      if (value === void 0) {
        continue;
      }
      const existing = resolutions.get(key);
      if (existing) {
        existing.contributions.push({ channel, value });
      } else {
        resolutions.set(key, { value, source: channel, contributions: [{ channel, value }] });
      }
    }
  }
  const activeSources = /* @__PURE__ */ new Set();
  const entries = [];
  for (const [key, resolution] of resolutions) {
    entries.push([key, resolution.value]);
    activeSources.add(resolution.source);
  }
  return {
    // Build via Object.fromEntries (define-property semantics) rather than bracket assignment so
    // an untrusted `__proto__` key can't corrupt the merged bag's prototype chain.
    values: Object.fromEntries(entries),
    resolutions,
    // Preserve precedence order for a stable, readable report.
    activeSources: MANAGED_SETTINGS_CHANNELS.filter((channel) => activeSources.has(channel))
  };
}

var IFileManagedSettingsService = createDecorator2("fileManagedSettingsService");
export { collectManagedSettingsDefinitions, hasManagedSettingsDefinitions, projectManagedSettings, pickManagedSettings, COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY, COPILOT_SANDBOX_ENABLED_KEY, MANAGED_SETTINGS_CONTROL_DEFINITIONS, IManagedSettingsService, INativeManagedSettingsService, MANAGED_SETTINGS_CHANNELS, IFileManagedSettingsService };
