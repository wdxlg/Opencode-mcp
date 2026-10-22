// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/sessionWorkspace.ts
import { getSessionWorkspaceKind } from "./module-1767.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/sessions/browser/sessionWorkspace.ts
function getSessionWorkspaceDisplayInfo(session, reader) {
  const workspace = session?.workspace.read(reader);
  if (!workspace?.label) {
    return void 0;
  }
  const worktreePending = session?.worktreePending?.read(reader) ?? false;
  const kind = getSessionWorkspaceKind(workspace, worktreePending);
  const icon2 = workspace.typeIcon ?? (kind === "virtual" /* Virtual */ ? Codicon.cloudCompact : kind === "folder" /* Folder */ ? Codicon.folderCompact : Codicon.worktreeCompact);
  const folder = workspace.folders[0];
  const branch = worktreePending ? void 0 : folder?.gitRepository?.branchName?.trim() || void 0;
  const workingDirectoryPath = worktreePending ? void 0 : folder?.workingDirectory.fsPath;
  return { label: workspace.label, icon: icon2, workingDirectoryPath, branch, worktreePending };
}
export { getSessionWorkspaceDisplayInfo };
