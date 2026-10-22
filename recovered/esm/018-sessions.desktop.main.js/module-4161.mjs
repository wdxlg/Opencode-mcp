// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/common/browserViewScope.ts



// src/vs/workbench/contrib/browserView/common/browserViewScope.ts
var GlobalScope = "global";

var WorkspaceScope = "workspace";

var EphemeralScope = "ephemeral";

function resolveBrowserViewStorageScope(explicit, configured, isWorkspaceUntrusted, isRemote) {
  if (isWorkspaceUntrusted) {
    return EphemeralScope;
  }
  if (explicit !== void 0) {
    return explicit;
  }
  if (configured !== "default") {
    return configured;
  }
  return isRemote ? WorkspaceScope : GlobalScope;
}
export { resolveBrowserViewStorageScope, GlobalScope, WorkspaceScope, EphemeralScope };
