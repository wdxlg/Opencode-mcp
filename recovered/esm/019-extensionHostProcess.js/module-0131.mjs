// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/configuration/common/configuration.ts
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/platform/configuration/common/configuration.ts
var IConfigurationService = createDecorator2("configurationService");

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

function toValuesTree(properties, conflictReporter) {
  const root = /* @__PURE__ */ Object.create(null);
  for (const key in properties) {
    addToValueTree(root, key, properties[key], conflictReporter);
  }
  return root;
}

function addToValueTree(settingsTreeRoot, key, value, conflictReporter) {
  const segments = key.split(".");
  const last = segments.pop();
  let curr = settingsTreeRoot;
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    let obj = curr[s];
    switch (typeof obj) {
      case "undefined":
        obj = curr[s] = /* @__PURE__ */ Object.create(null);
        break;
      case "object":
        if (obj === null) {
          conflictReporter(`Ignoring ${key} as ${segments.slice(0, i + 1).join(".")} is null`);
          return;
        }
        break;
      default:
        conflictReporter(`Ignoring ${key} as ${segments.slice(0, i + 1).join(".")} is ${JSON.stringify(obj)}`);
        return;
    }
    curr = obj;
  }
  if (typeof curr === "object" && curr !== null) {
    try {
      curr[last] = value;
    } catch (e) {
      conflictReporter(`Ignoring ${key} as ${segments.join(".")} is ${JSON.stringify(curr)}`);
    }
  } else {
    conflictReporter(`Ignoring ${key} as ${segments.join(".")} is ${JSON.stringify(curr)}`);
  }
}

function removeFromValueTree(valueTree, key) {
  const segments = key.split(".");
  doRemoveFromValueTree(valueTree, segments);
}

function doRemoveFromValueTree(valueTree, segments) {
  if (!valueTree) {
    return;
  }
  const valueTreeRecord = valueTree;
  const first = segments.shift();
  if (segments.length === 0) {
    delete valueTreeRecord[first];
    return;
  }
  if (Object.keys(valueTreeRecord).indexOf(first) !== -1) {
    const value = valueTreeRecord[first];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      doRemoveFromValueTree(value, segments);
      if (Object.keys(value).length === 0) {
        delete valueTreeRecord[first];
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
export { ConfigurationTargetToString, toValuesTree, addToValueTree, removeFromValueTree, doRemoveFromValueTree, getConfigurationValue, getLanguageTagSettingPlainKey, IConfigurationService };
