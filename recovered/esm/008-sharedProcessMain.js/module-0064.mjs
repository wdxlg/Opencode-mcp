// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/workspaces/common/workspaceIdentifier.ts
import { hash } from "./module-0040.mjs";


// src/vs/platform/workspaces/common/workspaceIdentifier.ts
function getWorkspaceIdentifier(workspaceUri) {
  return {
    id: getWorkspaceId(workspaceUri),
    configPath: workspaceUri
  };
}

function getWorkspaceId(uri) {
  return hash(uri.toString()).toString(16);
}
export { getWorkspaceIdentifier, getWorkspaceId };
