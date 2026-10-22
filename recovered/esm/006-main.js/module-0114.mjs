// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/workspaces/node/workspaces.ts
import { Schemas, init_network } from "./module-0031.mjs";
import { init_resources, originalFSPath } from "./module-0032.mjs";
import { init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/workspaces/node/workspaces.ts
import { createHash as createHash4 } from "crypto";

function getWorkspaceIdentifier(configPath) {
  function getWorkspaceId2() {
    let configPathStr = configPath.scheme === Schemas.file ? originalFSPath(configPath) : configPath.toString();
    if (!isLinux) {
      configPathStr = configPathStr.toLowerCase();
    }
    return createHash4("md5").update(configPathStr).digest("hex");
  }
  return {
    id: getWorkspaceId2(),
    configPath
  };
}

function getSingleFolderWorkspaceIdentifier(folderUri, folderStat) {
  function getFolderId() {
    if (folderUri.scheme !== Schemas.file) {
      return createHash4("md5").update(folderUri.toString()).digest("hex");
    }
    if (!folderStat) {
      return void 0;
    }
    let ctime;
    if (isLinux) {
      ctime = folderStat.ino;
    } else if (isMacintosh) {
      ctime = folderStat.birthtime.getTime();
    } else if (isWindows2) {
      if (typeof folderStat.birthtimeMs === "number") {
        ctime = Math.floor(folderStat.birthtimeMs);
      } else {
        ctime = folderStat.birthtime.getTime();
      }
    }
    return createHash4("md5").update(folderUri.fsPath).update(ctime ? String(ctime) : "").digest("hex");
  }
  const folderId = getFolderId();
  if (typeof folderId === "string") {
    return {
      id: folderId,
      uri: folderUri
    };
  }
  return void 0;
}

function createEmptyWorkspaceIdentifier() {
  return {
    id: (Date.now() + Math.round(Math.random() * 1e3)).toString()
  };
}

var NON_EMPTY_WORKSPACE_ID_LENGTH;

var init_workspaces = __esm({
  "src/vs/platform/workspaces/node/workspaces.ts"() {
    init_network();
    init_platform();
    init_resources();
    NON_EMPTY_WORKSPACE_ID_LENGTH = 128 / 4;
  }
});
export { getWorkspaceIdentifier, getSingleFolderWorkspaceIdentifier, createEmptyWorkspaceIdentifier, createHash4, NON_EMPTY_WORKSPACE_ID_LENGTH, init_workspaces };
