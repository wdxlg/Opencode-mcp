// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/common/workspaceIdentityService.ts
import { createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";
import { isEqualOrParent2, joinPath, relativePath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IEditSessionIdentityService } from "./module-1256.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/workspaces/common/workspaceIdentityService.ts
var IWorkspaceIdentityService = createDecorator("IWorkspaceIdentityService");

var WorkspaceIdentityService = class {
  constructor(workspaceContextService, editSessionIdentityService) {
    this.workspaceContextService = workspaceContextService;
    this.editSessionIdentityService = editSessionIdentityService;
  }
  async getWorkspaceStateFolders(cancellationToken) {
    const workspaceStateFolders = [];
    for (const workspaceFolder of this.workspaceContextService.getWorkspace().folders) {
      const workspaceFolderIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
      if (!workspaceFolderIdentity) {
        continue;
      }
      workspaceStateFolders.push({ resourceUri: workspaceFolder.uri.toString(), workspaceFolderIdentity });
    }
    return workspaceStateFolders;
  }
  async matches(incomingWorkspaceFolders, cancellationToken) {
    const incomingToCurrentWorkspaceFolderUris = {};
    const incomingIdentitiesToIncomingWorkspaceFolders = {};
    for (const workspaceFolder of incomingWorkspaceFolders) {
      incomingIdentitiesToIncomingWorkspaceFolders[workspaceFolder.workspaceFolderIdentity] = workspaceFolder.resourceUri;
    }
    const currentWorkspaceFoldersToIdentities = /* @__PURE__ */ new Map();
    for (const workspaceFolder of this.workspaceContextService.getWorkspace().folders) {
      const workspaceFolderIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
      if (!workspaceFolderIdentity) {
        continue;
      }
      currentWorkspaceFoldersToIdentities.set(workspaceFolder, workspaceFolderIdentity);
    }
    for (const [currentWorkspaceFolder, currentWorkspaceFolderIdentity] of currentWorkspaceFoldersToIdentities.entries()) {
      const incomingWorkspaceFolder = incomingIdentitiesToIncomingWorkspaceFolders[currentWorkspaceFolderIdentity];
      if (incomingWorkspaceFolder) {
        incomingToCurrentWorkspaceFolderUris[incomingWorkspaceFolder] = currentWorkspaceFolder.uri.toString();
        continue;
      }
      let hasCompleteMatch = false;
      for (const [incomingIdentity, incomingFolder] of Object.entries(incomingIdentitiesToIncomingWorkspaceFolders)) {
        if (await this.editSessionIdentityService.provideEditSessionIdentityMatch(currentWorkspaceFolder, currentWorkspaceFolderIdentity, incomingIdentity, cancellationToken) === 100 /* Complete */) {
          incomingToCurrentWorkspaceFolderUris[incomingFolder] = currentWorkspaceFolder.uri.toString();
          hasCompleteMatch = true;
          break;
        }
      }
      if (hasCompleteMatch) {
        continue;
      }
      return false;
    }
    const convertUri = (uriToConvert) => {
      for (const incomingFolderUriKey of Object.keys(incomingToCurrentWorkspaceFolderUris)) {
        const incomingFolderUri = URI.parse(incomingFolderUriKey);
        if (isEqualOrParent2(incomingFolderUri, uriToConvert)) {
          const currentWorkspaceFolderUri = incomingToCurrentWorkspaceFolderUris[incomingFolderUriKey];
          const relativeFilePath = relativePath(incomingFolderUri, uriToConvert);
          if (relativeFilePath) {
            return joinPath(URI.parse(currentWorkspaceFolderUri), relativeFilePath);
          }
        }
      }
      return uriToConvert;
    };
    const uriReplacer2 = (obj, depth = 0) => {
      if (!obj || depth > 200) {
        return obj;
      }
      if (obj instanceof VSBuffer || obj instanceof Uint8Array) {
        return obj;
      }
      if (URI.isUri(obj)) {
        return convertUri(obj);
      }
      if (Array.isArray(obj)) {
        for (let i2 = 0; i2 < obj.length; ++i2) {
          obj[i2] = uriReplacer2(obj[i2], depth + 1);
        }
      } else {
        for (const key3 in obj) {
          if (Object.hasOwnProperty.call(obj, key3)) {
            obj[key3] = uriReplacer2(obj[key3], depth + 1);
          }
        }
      }
      return obj;
    };
    return uriReplacer2;
  }
};

WorkspaceIdentityService = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IEditSessionIdentityService)
], WorkspaceIdentityService);

registerSingleton(IWorkspaceIdentityService, WorkspaceIdentityService, 1 /* Delayed */);
export { IWorkspaceIdentityService, WorkspaceIdentityService };
