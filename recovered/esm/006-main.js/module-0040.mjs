// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/configuration/common/configuration.ts
import { URI, init_uri } from "./module-0030.mjs";
import { __esm } from "./module-0000.mjs";
import { init_assert } from "./module-0015.mjs";
import { init_types } from "./module-0016.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/configuration/common/configuration.ts
function isConfigurationOverrides(obj) {
  const thing = obj;
  return thing && typeof thing === "object" && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === "string") && (!thing.resource || thing.resource instanceof URI);
}

function isConfigurationUpdateOverrides(obj) {
  const thing = obj;
  return thing && typeof thing === "object" && (!thing.overrideIdentifiers || Array.isArray(thing.overrideIdentifiers)) && !thing.overrideIdentifier && (!thing.resource || thing.resource instanceof URI);
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
  const first2 = segments.shift();
  if (segments.length === 0) {
    delete valueTreeRecord[first2];
    return;
  }
  if (Object.keys(valueTreeRecord).indexOf(first2) !== -1) {
    const value = valueTreeRecord[first2];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      doRemoveFromValueTree(value, segments);
      if (Object.keys(value).length === 0) {
        delete valueTreeRecord[first2];
      }
    }
  }
}

function getConfigurationValue(config, settingPath, defaultValue) {
  function accessSetting(config2, path5) {
    let current = config2;
    for (const component of path5) {
      if (typeof current !== "object" || current === null) {
        return void 0;
      }
      current = current[component];
    }
    return current;
  }
  const path4 = settingPath.split(".");
  const result = accessSetting(config, path4);
  return typeof result === "undefined" ? defaultValue : result;
}

function getLanguageTagSettingPlainKey(settingKey) {
  return settingKey.replace(/^\[/, "").replace(/]$/g, "").replace(/\]\[/g, ", ");
}

var IConfigurationService;

var init_configuration = __esm({
  "src/vs/platform/configuration/common/configuration.ts"() {
    init_assert();
    init_types();
    init_uri();
    init_instantiation();
    IConfigurationService = createDecorator("configurationService");
  }
});
export { isConfigurationOverrides, isConfigurationUpdateOverrides, toValuesTree, addToValueTree, removeFromValueTree, doRemoveFromValueTree, getConfigurationValue, getLanguageTagSettingPlainKey, IConfigurationService, init_configuration };
