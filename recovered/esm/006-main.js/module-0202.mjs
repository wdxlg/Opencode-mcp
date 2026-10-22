// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/workspaces/common/workspaceIdentifier.ts
import { hash, init_hash } from "./module-0067.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/workspaces/common/workspaceIdentifier.ts
function getWorkspaceIdentifier2(workspaceUri) {
  return {
    id: getWorkspaceId(workspaceUri),
    configPath: workspaceUri
  };
}

function getWorkspaceId(uri) {
  return hash(uri.toString()).toString(16);
}

var init_workspaceIdentifier = __esm({
  "src/vs/platform/workspaces/common/workspaceIdentifier.ts"() {
    init_hash();
  }
});
export { getWorkspaceIdentifier2, getWorkspaceId, init_workspaceIdentifier };
