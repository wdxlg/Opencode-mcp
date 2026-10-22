// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/backup/node/backup.ts
import { URI, init_uri } from "./module-0030.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/backup/node/backup.ts
function isEmptyWindowBackupInfo(obj) {
  const candidate = obj;
  return typeof candidate?.backupFolder === "string";
}

function deserializeWorkspaceInfos(serializedBackupWorkspaces) {
  let workspaceBackupInfos = [];
  try {
    if (Array.isArray(serializedBackupWorkspaces.workspaces)) {
      workspaceBackupInfos = serializedBackupWorkspaces.workspaces.map((workspace) => ({
        workspace: {
          id: workspace.id,
          configPath: URI.parse(workspace.configURIPath)
        },
        remoteAuthority: workspace.remoteAuthority
      }));
    }
  } catch {
  }
  return workspaceBackupInfos;
}

function deserializeFolderInfos(serializedBackupWorkspaces) {
  let folderBackupInfos = [];
  try {
    if (Array.isArray(serializedBackupWorkspaces.folders)) {
      folderBackupInfos = serializedBackupWorkspaces.folders.map((folder) => ({
        folderUri: URI.parse(folder.folderUri),
        remoteAuthority: folder.remoteAuthority
      }));
    }
  } catch {
  }
  return folderBackupInfos;
}

var init_backup2 = __esm({
  "src/vs/platform/backup/node/backup.ts"() {
    init_uri();
  }
});
export { isEmptyWindowBackupInfo, deserializeWorkspaceInfos, deserializeFolderInfos, init_backup2 };
