// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tags/common/workspaceTags.ts
import { createDecorator } from "./module-0077.mjs";
import { getRemotes } from "./module-3618.mjs";


// src/vs/workbench/contrib/tags/common/workspaceTags.ts
var IWorkspaceTagsService = createDecorator("workspaceTagsService");

async function getHashedRemotesFromConfig(text2, stripEndingDotGit = false, sha1Hex) {
  return Promise.all(getRemotes(text2, stripEndingDotGit).map((remote) => sha1Hex(remote)));
}
export { getHashedRemotesFromConfig, IWorkspaceTagsService };
