// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/windows/electron-main/windowsFinder.ts
import { init_workspace, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "./module-0076.mjs";
import { extUriBiasedIgnorePathCase, init_resources } from "./module-0032.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/windows/electron-main/windowsFinder.ts
async function findWindowOnFile(windows, fileUri, localWorkspaceResolver) {
  for (const window2 of windows) {
    const workspace = window2.openedWorkspace;
    if (isWorkspaceIdentifier(workspace)) {
      const resolvedWorkspace = await localWorkspaceResolver(workspace);
      if (resolvedWorkspace) {
        if (resolvedWorkspace.folders.some((folder) => extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, folder.uri))) {
          return window2;
        }
      } else {
        if (extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, workspace.configPath)) {
          return window2;
        }
      }
    }
  }
  const singleFolderWindowsOnFilePath = windows.filter((window2) => isSingleFolderWorkspaceIdentifier(window2.openedWorkspace) && extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, window2.openedWorkspace.uri));
  if (singleFolderWindowsOnFilePath.length) {
    return singleFolderWindowsOnFilePath.sort((windowA, windowB) => -(windowA.openedWorkspace.uri.path.length - windowB.openedWorkspace.uri.path.length))[0];
  }
  return void 0;
}

function findWindowOnWorkspaceOrFolder(windows, folderOrWorkspaceConfigUri) {
  for (const window2 of windows) {
    if (isWorkspaceIdentifier(window2.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window2.openedWorkspace.configPath, folderOrWorkspaceConfigUri)) {
      return window2;
    }
    if (isSingleFolderWorkspaceIdentifier(window2.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window2.openedWorkspace.uri, folderOrWorkspaceConfigUri)) {
      return window2;
    }
  }
  return void 0;
}

function findWindowOnExtensionDevelopmentPath(windows, extensionDevelopmentPaths) {
  const matches = (uriString) => {
    return extensionDevelopmentPaths.some((path4) => extUriBiasedIgnorePathCase.isEqual(URI.file(path4), URI.file(uriString)));
  };
  for (const window2 of windows) {
    if (window2.config?.extensionDevelopmentPath?.some((path4) => matches(path4))) {
      return window2;
    }
  }
  return void 0;
}

var init_windowsFinder = __esm({
  "src/vs/platform/windows/electron-main/windowsFinder.ts"() {
    init_resources();
    init_uri();
    init_workspace();
  }
});
export { findWindowOnFile, findWindowOnWorkspaceOrFolder, findWindowOnExtensionDevelopmentPath, init_windowsFinder };
