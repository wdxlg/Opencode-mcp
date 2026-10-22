// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/workspaces/common/workspaces.ts
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { Schemas, init_network } from "./module-0031.mjs";
import { init_labels, normalizeDriveLetter } from "./module-0048.mjs";
import { init_extpath, isUNC, toSlashes } from "./module-0028.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { init_path, posix } from "./module-0008.mjs";
import { WorkspaceFolder, init_workspace } from "./module-0076.mjs";
import { __esm } from "./module-0000.mjs";
import { init_json } from "./module-0120.mjs";
import { init_jsonEdit } from "./module-0126.mjs";
import { init_resources } from "./module-0032.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { init_remoteHosts } from "./module-0127.mjs";


// src/vs/platform/workspaces/common/workspaces.ts
function isRecentWorkspace(curr) {
  return curr.hasOwnProperty("workspace");
}

function isRecentFolder(curr) {
  return curr.hasOwnProperty("folderUri");
}

function isRecentFile(curr) {
  return curr.hasOwnProperty("fileUri");
}

function isStoredWorkspaceFolder(obj) {
  return isRawFileWorkspaceFolder(obj) || isRawUriWorkspaceFolder(obj);
}

function isRawFileWorkspaceFolder(obj) {
  const candidate = obj;
  return typeof candidate?.path === "string" && (!candidate.name || typeof candidate.name === "string");
}

function isRawUriWorkspaceFolder(obj) {
  const candidate = obj;
  return typeof candidate?.uri === "string" && (!candidate.name || typeof candidate.name === "string");
}

function getStoredWorkspaceFolder(folderURI, forceAbsolute, folderName, targetConfigFolderURI, extUri2) {
  if (folderURI.scheme !== targetConfigFolderURI.scheme) {
    return { name: folderName, uri: folderURI.toString(true) };
  }
  let folderPath = !forceAbsolute ? extUri2.relativePath(targetConfigFolderURI, folderURI) : void 0;
  if (folderPath !== void 0) {
    if (folderPath.length === 0) {
      folderPath = ".";
    } else {
      if (isWindows2) {
        folderPath = massagePathForWindows(folderPath);
      }
    }
  } else {
    if (folderURI.scheme === Schemas.file) {
      folderPath = folderURI.fsPath;
      if (isWindows2) {
        folderPath = massagePathForWindows(folderPath);
      }
    } else if (!extUri2.isEqualAuthority(folderURI.authority, targetConfigFolderURI.authority)) {
      return { name: folderName, uri: folderURI.toString(true) };
    } else {
      folderPath = folderURI.path;
    }
  }
  return { name: folderName, path: folderPath };
}

function massagePathForWindows(folderPath) {
  folderPath = normalizeDriveLetter(folderPath);
  if (!isUNC(folderPath)) {
    folderPath = toSlashes(folderPath);
  }
  return folderPath;
}

function toWorkspaceFolders(configuredFolders, workspaceConfigFile, extUri2) {
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  const relativeTo = extUri2.dirname(workspaceConfigFile);
  for (const configuredFolder of configuredFolders) {
    let uri = void 0;
    if (isRawFileWorkspaceFolder(configuredFolder)) {
      if (configuredFolder.path) {
        uri = extUri2.resolvePath(relativeTo, configuredFolder.path);
      }
    } else if (isRawUriWorkspaceFolder(configuredFolder)) {
      try {
        uri = URI.parse(configuredFolder.uri);
        if (uri.path[0] !== posix.sep) {
          uri = uri.with({ path: posix.sep + uri.path });
        }
      } catch (e) {
        console.warn(e);
      }
    }
    if (uri) {
      const comparisonKey = extUri2.getComparisonKey(uri);
      if (!seen.has(comparisonKey)) {
        seen.add(comparisonKey);
        const name = configuredFolder.name || extUri2.basenameOrAuthority(uri);
        result.push(new WorkspaceFolder({ uri, name, index: result.length }, configuredFolder));
      }
    }
  }
  return result;
}

function isSerializedRecentWorkspace(data) {
  const candidate = data;
  return typeof candidate?.workspace === "object" && typeof candidate.workspace.id === "string" && typeof candidate.workspace.configPath === "string";
}

function isSerializedRecentFolder(data) {
  const candidate = data;
  return typeof candidate?.folderUri === "string";
}

function isSerializedRecentFile(data) {
  const candidate = data;
  return typeof candidate?.fileUri === "string";
}

function restoreRecentlyOpened(data, logService) {
  const result = { workspaces: [], files: [] };
  if (data) {
    const restoreGracefully = function(entries, onEntry) {
      for (let i = 0; i < entries.length; i++) {
        try {
          onEntry(entries[i], i);
        } catch (e) {
          logService.warn(`Error restoring recent entry ${JSON.stringify(entries[i])}: ${e.toString()}. Skip entry.`);
        }
      }
    };
    const storedRecents = data;
    if (Array.isArray(storedRecents.entries)) {
      restoreGracefully(storedRecents.entries, (entry) => {
        const label = entry.label;
        const remoteAuthority = entry.remoteAuthority;
        if (isSerializedRecentWorkspace(entry)) {
          result.workspaces.push({ label, remoteAuthority, workspace: { id: entry.workspace.id, configPath: URI.parse(entry.workspace.configPath) } });
        } else if (isSerializedRecentFolder(entry)) {
          result.workspaces.push({ label, remoteAuthority, folderUri: URI.parse(entry.folderUri) });
        } else if (isSerializedRecentFile(entry)) {
          result.files.push({ label, remoteAuthority, fileUri: URI.parse(entry.fileUri) });
        }
      });
    }
  }
  return result;
}

function toStoreData(recents) {
  const serialized = { entries: [] };
  const storeLabel = (label, uri) => {
    return label && label !== uri.fsPath && label !== uri.path;
  };
  for (const recent of recents.workspaces) {
    if (isRecentFolder(recent)) {
      serialized.entries.push({
        folderUri: recent.folderUri.toString(),
        label: storeLabel(recent.label, recent.folderUri) ? recent.label : void 0,
        remoteAuthority: recent.remoteAuthority
      });
    } else {
      serialized.entries.push({
        workspace: {
          id: recent.workspace.id,
          configPath: recent.workspace.configPath.toString()
        },
        label: storeLabel(recent.label, recent.workspace.configPath) ? recent.label : void 0,
        remoteAuthority: recent.remoteAuthority
      });
    }
  }
  for (const recent of recents.files) {
    serialized.entries.push({
      fileUri: recent.fileUri.toString(),
      label: storeLabel(recent.label, recent.fileUri) ? recent.label : void 0,
      remoteAuthority: recent.remoteAuthority
    });
  }
  return serialized;
}

var IWorkspacesService;

var init_workspaces2 = __esm({
  "src/vs/platform/workspaces/common/workspaces.ts"() {
    init_extpath();
    init_json();
    init_jsonEdit();
    init_labels();
    init_network();
    init_path();
    init_platform();
    init_resources();
    init_uri();
    init_instantiation();
    init_remoteHosts();
    init_workspace();
    IWorkspacesService = createDecorator("workspacesService");
  }
});
export { isRecentWorkspace, isRecentFolder, isRecentFile, isStoredWorkspaceFolder, isRawFileWorkspaceFolder, isRawUriWorkspaceFolder, getStoredWorkspaceFolder, massagePathForWindows, toWorkspaceFolders, isSerializedRecentWorkspace, isSerializedRecentFolder, isSerializedRecentFile, restoreRecentlyOpened, toStoreData, IWorkspacesService, init_workspaces2 };
