// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/common/workspaceUtils.ts



// src/vs/workbench/services/workspaces/common/workspaceUtils.ts
async function areWorkspaceFoldersEmpty(workspace, fileService) {
  for (const folder of workspace.folders) {
    const folderStat = await fileService.resolve(folder.uri);
    if (folderStat.children && folderStat.children.length > 0) {
      return false;
    }
  }
  return true;
}
export { areWorkspaceFoldersEmpty };
