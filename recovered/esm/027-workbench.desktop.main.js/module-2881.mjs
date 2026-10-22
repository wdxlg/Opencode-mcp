// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/worktreePaths.ts
import { URI } from "./module-0032.mjs";
import { basename } from "./module-0026.mjs";
import { isEqual2, isEqualOrParent2, normalizePath } from "./module-0034.mjs";


// src/vs/platform/agentHost/common/worktreePaths.ts
function getWorktreesRoot(repositoryRoot) {
  return URI.joinPath(repositoryRoot, "..", `${basename(repositoryRoot.fsPath)}.worktrees`);
}

function isWorktreeUnderRepository(candidate, repositoryRoot) {
  const worktreesRoot = normalizePath(getWorktreesRoot(repositoryRoot));
  const normalizedCandidate = normalizePath(candidate);
  return isEqualOrParent2(normalizedCandidate, worktreesRoot) && !isEqual2(normalizedCandidate, worktreesRoot);
}
export { getWorktreesRoot, isWorktreeUnderRepository };
