// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/backup/common/backup.ts



// src/vs/platform/backup/common/backup.ts
function isFolderBackupInfo(curr) {
  return curr?.hasOwnProperty("folderUri");
}

function isWorkspaceBackupInfo(curr) {
  return curr?.hasOwnProperty("workspace");
}
export { isFolderBackupInfo, isWorkspaceBackupInfo };
