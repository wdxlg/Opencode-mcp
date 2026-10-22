// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/workspaces/common/workspaces.ts
import { createDecorator } from "./module-0077.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { Schemas } from "./module-0033.mjs";
import { normalizeDriveLetter } from "./module-0711.mjs";
import { isUNC, toSlashes } from "./module-0031.mjs";
import { URI } from "./module-0032.mjs";
import { isAbsolute, posix } from "./module-0026.mjs";
import { WorkspaceFolder } from "./module-0509.mjs";
import { applyEdits, removeProperty, setProperty } from "./module-1378.mjs";
import { isEqualAuthority } from "./module-0034.mjs";
import { getRemoteAuthority } from "./module-0687.mjs";
import { parse5 } from "./module-0883.mjs";


// src/vs/platform/workspaces/common/workspaces.ts
var IWorkspacesService = createDecorator("workspacesService");

function isRecentWorkspace(curr) {
  return curr.hasOwnProperty("workspace");
}

function isRecentFolder(curr) {
  return curr.hasOwnProperty("folderUri");
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
      if (isWindows) {
        folderPath = massagePathForWindows(folderPath);
      }
    }
  } else {
    if (folderURI.scheme === Schemas.file) {
      folderPath = folderURI.fsPath;
      if (isWindows) {
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
    let uri5 = void 0;
    if (isRawFileWorkspaceFolder(configuredFolder)) {
      if (configuredFolder.path) {
        uri5 = extUri2.resolvePath(relativeTo, configuredFolder.path);
      }
    } else if (isRawUriWorkspaceFolder(configuredFolder)) {
      try {
        uri5 = URI.parse(configuredFolder.uri);
        if (uri5.path[0] !== posix.sep) {
          uri5 = uri5.with({ path: posix.sep + uri5.path });
        }
      } catch (e) {
        console.warn(e);
      }
    }
    if (uri5) {
      const comparisonKey = extUri2.getComparisonKey(uri5);
      if (!seen.has(comparisonKey)) {
        seen.add(comparisonKey);
        const name = configuredFolder.name || extUri2.basenameOrAuthority(uri5);
        result.push(new WorkspaceFolder({ uri: uri5, name, index: result.length }, configuredFolder));
      }
    }
  }
  return result;
}

function rewriteWorkspaceFileForNewLocation(rawWorkspaceContents, configPathURI, isFromUntitledWorkspace, targetConfigPathURI, extUri2) {
  const storedWorkspace = doParseStoredWorkspace(configPathURI, rawWorkspaceContents);
  const sourceConfigFolder = extUri2.dirname(configPathURI);
  const targetConfigFolder = extUri2.dirname(targetConfigPathURI);
  const rewrittenFolders = [];
  for (const folder of storedWorkspace.folders) {
    const folderURI = isRawFileWorkspaceFolder(folder) ? extUri2.resolvePath(sourceConfigFolder, folder.path) : URI.parse(folder.uri);
    let absolute;
    if (isFromUntitledWorkspace) {
      absolute = false;
    } else {
      absolute = !isRawFileWorkspaceFolder(folder) || isAbsolute(folder.path);
    }
    rewrittenFolders.push(getStoredWorkspaceFolder(folderURI, absolute, folder.name, targetConfigFolder, extUri2));
  }
  const formattingOptions = { insertSpaces: false, tabSize: 4, eol: isLinux || isMacintosh ? "\n" : "\r\n" };
  const edits = setProperty(rawWorkspaceContents, ["folders"], rewrittenFolders, formattingOptions);
  let newContent = applyEdits(rawWorkspaceContents, edits);
  if (isEqualAuthority(storedWorkspace.remoteAuthority, getRemoteAuthority(targetConfigPathURI))) {
    newContent = applyEdits(newContent, removeProperty(newContent, ["remoteAuthority"], formattingOptions));
  }
  return newContent;
}

function doParseStoredWorkspace(path, contents) {
  const storedWorkspace = parse5(contents);
  if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
    storedWorkspace.folders = storedWorkspace.folders.filter((folder) => isStoredWorkspaceFolder(folder));
  } else {
    throw new Error(`${path} looks like an invalid workspace file.`);
  }
  return storedWorkspace;
}
export { isRecentWorkspace, isRecentFolder, isStoredWorkspaceFolder, isRawFileWorkspaceFolder, isRawUriWorkspaceFolder, getStoredWorkspaceFolder, massagePathForWindows, toWorkspaceFolders, rewriteWorkspaceFileForNewLocation, doParseStoredWorkspace, IWorkspacesService };
