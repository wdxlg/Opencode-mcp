// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/workspace/common/virtualWorkspace.ts
import { Schemas } from "./module-0031.mjs";


// src/vs/platform/workspace/common/virtualWorkspace.ts
function isVirtualResource(resource) {
  return resource.scheme !== Schemas.file && resource.scheme !== Schemas.vscodeRemote;
}

function getVirtualWorkspaceLocation(workspace) {
  if (workspace.folders.length) {
    return workspace.folders.every((f) => isVirtualResource(f.uri)) ? workspace.folders[0].uri : void 0;
  } else if (workspace.configuration && isVirtualResource(workspace.configuration)) {
    return workspace.configuration;
  }
  return void 0;
}

function getVirtualWorkspaceScheme(workspace) {
  return getVirtualWorkspaceLocation(workspace)?.scheme;
}
export { isVirtualResource, getVirtualWorkspaceLocation, getVirtualWorkspaceScheme };
