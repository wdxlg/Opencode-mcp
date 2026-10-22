// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionManagementUtil.ts
import { compareIgnoreCase } from "./module-0023.mjs";
import { ExtensionIdentifier } from "./module-0059.mjs";


// src/vs/platform/extensionManagement/common/extensionManagementUtil.ts
function areSameExtensions(a, b) {
  if (a.uuid && b.uuid) {
    return a.uuid === b.uuid;
  }
  if (a.id === b.id) {
    return true;
  }
  return compareIgnoreCase(a.id, b.id) === 0;
}

var BetterMergeId = new ExtensionIdentifier("pprice.better-merge");
export { areSameExtensions, BetterMergeId };
