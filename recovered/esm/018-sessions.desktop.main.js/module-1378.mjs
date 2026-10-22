// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/workspaces/common/workspaces.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/workspaces/common/workspaces.ts
var IWorkspacesService = createDecorator("workspacesService");

function isRecentWorkspace(curr) {
  return curr.hasOwnProperty("workspace");
}

function isRecentFolder(curr) {
  return curr.hasOwnProperty("folderUri");
}
export { isRecentWorkspace, isRecentFolder, IWorkspacesService };
