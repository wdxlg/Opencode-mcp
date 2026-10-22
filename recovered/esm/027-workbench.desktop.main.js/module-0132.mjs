// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/configuration/common/configuration.ts
import { createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";
import { assertNever } from "./module-0009.mjs";


// src/vs/platform/configuration/common/configuration.ts
var IConfigurationService = createDecorator("configurationService");

function isConfigurationOverrides(obj) {
  const thing = obj;
  return thing && typeof thing === "object" && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === "string") && (!thing.resource || thing.resource instanceof URI);
}

function isConfigurationUpdateOverrides(obj) {
  const thing = obj;
  return thing && typeof thing === "object" && (!thing.overrideIdentifiers || Array.isArray(thing.overrideIdentifiers)) && !thing.overrideIdentifier && (!thing.resource || thing.resource instanceof URI);
}

function ConfigurationTargetToString(configurationTarget) {
  switch (configurationTarget) {
    case 1 /* APPLICATION */:
      return "APPLICATION";
    case 2 /* USER */:
      return "USER";
    case 3 /* USER_LOCAL */:
      return "USER_LOCAL";
    case 4 /* USER_REMOTE */:
      return "USER_REMOTE";
    case 5 /* WORKSPACE */:
      return "WORKSPACE";
    case 6 /* WORKSPACE_FOLDER */:
      return "WORKSPACE_FOLDER";
    case 7 /* DEFAULT */:
      return "DEFAULT";
    case 8 /* MEMORY */:
      return "MEMORY";
  }
}

function getConfigValueInTarget(configValue, scope) {
  switch (scope) {
    case 1 /* APPLICATION */:
      return configValue.applicationValue;
    case 2 /* USER */:
      return configValue.userValue;
    case 3 /* USER_LOCAL */:
      return configValue.userLocalValue;
    case 4 /* USER_REMOTE */:
      return configValue.userRemoteValue;
    case 5 /* WORKSPACE */:
      return configValue.workspaceValue;
    case 6 /* WORKSPACE_FOLDER */:
      return configValue.workspaceFolderValue;
    case 7 /* DEFAULT */:
      return configValue.defaultValue;
    case 8 /* MEMORY */:
      return configValue.memoryValue;
    default:
      assertNever(scope);
  }
}

function isConfigured(configValue) {
  return configValue.applicationValue !== void 0 || configValue.userValue !== void 0 || configValue.userLocalValue !== void 0 || configValue.userRemoteValue !== void 0 || configValue.workspaceValue !== void 0 || configValue.workspaceFolderValue !== void 0;
}

function toValuesTree(properties, conflictReporter) {
  const root = /* @__PURE__ */ Object.create(null);
  for (const key3 in properties) {
    addToValueTree(root, key3, properties[key3], conflictReporter);
  }
  return root;
}

function addToValueTree(settingsTreeRoot, key3, value2, conflictReporter) {
  const segments = key3.split(".");
  const last = segments.pop();
  let curr = settingsTreeRoot;
  for (let i2 = 0; i2 < segments.length; i2++) {
    const s = segments[i2];
    let obj = curr[s];
    switch (typeof obj) {
      case "undefined":
        obj = curr[s] = /* @__PURE__ */ Object.create(null);
        break;
      case "object":
        if (obj === null) {
          conflictReporter(`Ignoring ${key3} as ${segments.slice(0, i2 + 1).join(".")} is null`);
          return;
        }
        break;
      default:
        conflictReporter(`Ignoring ${key3} as ${segments.slice(0, i2 + 1).join(".")} is ${JSON.stringify(obj)}`);
        return;
    }
    curr = obj;
  }
  if (typeof curr === "object" && curr !== null) {
    try {
      curr[last] = value2;
    } catch (e) {
      conflictReporter(`Ignoring ${key3} as ${segments.join(".")} is ${JSON.stringify(curr)}`);
    }
  } else {
    conflictReporter(`Ignoring ${key3} as ${segments.join(".")} is ${JSON.stringify(curr)}`);
  }
}

function removeFromValueTree(valueTree, key3) {
  const segments = key3.split(".");
  doRemoveFromValueTree(valueTree, segments);
}

function doRemoveFromValueTree(valueTree, segments) {
  if (!valueTree) {
    return;
  }
  const valueTreeRecord = valueTree;
  const first2 = segments.shift();
  if (segments.length === 0) {
    delete valueTreeRecord[first2];
    return;
  }
  if (Object.keys(valueTreeRecord).indexOf(first2) !== -1) {
    const value2 = valueTreeRecord[first2];
    if (typeof value2 === "object" && value2 !== null && !Array.isArray(value2)) {
      doRemoveFromValueTree(value2, segments);
      if (Object.keys(value2).length === 0) {
        delete valueTreeRecord[first2];
      }
    }
  }
}

function getConfigurationValue(config, settingPath, defaultValue) {
  function accessSetting(config2, path2) {
    let current = config2;
    for (const component of path2) {
      if (typeof current !== "object" || current === null) {
        return void 0;
      }
      current = current[component];
    }
    return current;
  }
  const path = settingPath.split(".");
  const result = accessSetting(config, path);
  return typeof result === "undefined" ? defaultValue : result;
}

function getLanguageTagSettingPlainKey(settingKey) {
  return settingKey.replace(/^\[/, "").replace(/]$/g, "").replace(/\]\[/g, ", ");
}
export { isConfigurationOverrides, isConfigurationUpdateOverrides, ConfigurationTargetToString, getConfigValueInTarget, isConfigured, toValuesTree, addToValueTree, removeFromValueTree, doRemoveFromValueTree, getConfigurationValue, getLanguageTagSettingPlainKey, IConfigurationService };
