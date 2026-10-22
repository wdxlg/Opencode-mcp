// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/workspaces/common/workspaceIdentifier.ts
import { hash } from "./module-0039.mjs";


// src/vs/platform/workspaces/common/workspaceIdentifier.ts
function getWorkspaceIdentifier(workspaceUri) {
  return {
    id: getWorkspaceId(workspaceUri),
    configPath: workspaceUri
  };
}

function getWorkspaceId(uri4) {
  return hash(uri4.toString()).toString(16);
}
export { getWorkspaceIdentifier, getWorkspaceId };
