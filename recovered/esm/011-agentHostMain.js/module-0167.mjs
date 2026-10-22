// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/worktreePaths.ts
import { URI } from "./module-0023.mjs";
import { basename } from "./module-0018.mjs";


// src/vs/platform/agentHost/common/worktreePaths.ts
function getWorktreesRoot(repositoryRoot) {
  return URI.joinPath(repositoryRoot, "..", `${basename(repositoryRoot.fsPath)}.worktrees`);
}
export { getWorktreesRoot };
