// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/workspace/common/virtualWorkspace.ts
import { Schemas } from "./module-0033.mjs";


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

function getVirtualWorkspaceAuthority(workspace) {
  return getVirtualWorkspaceLocation(workspace)?.authority;
}

function isVirtualWorkspace(workspace) {
  return getVirtualWorkspaceLocation(workspace) !== void 0;
}
export { isVirtualResource, getVirtualWorkspaceLocation, getVirtualWorkspaceScheme, getVirtualWorkspaceAuthority, isVirtualWorkspace };
