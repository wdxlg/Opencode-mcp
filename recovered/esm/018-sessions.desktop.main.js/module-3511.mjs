// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/workspaceFolderLabel/browser/workspaceFolderLabelService.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILabelService } from "./module-0641.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IWorkspaceFolderLabelService } from "./module-2010.mjs";


// src/vs/sessions/services/workspaceFolderLabel/browser/workspaceFolderLabelService.ts
var SessionsWorkspaceFolderLabelService = class {
  constructor(sessionsService, sessionsManagementService, uriIdentityService, labelService) {
    this.sessionsService = sessionsService;
    this.sessionsManagementService = sessionsManagementService;
    this.uriIdentityService = uriIdentityService;
    this.labelService = labelService;
  }
  getWorkspaceFolderLabel(workspaceFolder, verbose) {
    const workspace = this.sessionsService.activeSession.get()?.workspace.get();
    const folder = workspace?.folders.find((folder2) => this.isWorkspaceFolder(folder2, workspaceFolder)) ?? this.sessionsManagementService.getSessions().flatMap((session) => session.workspace.get()?.folders ?? []).find((folder2) => this.isWorkspaceFolder(folder2, workspaceFolder));
    if (folder) {
      const repositoryName = folder.name;
      if (verbose && !this.uriIdentityService.extUri.isEqual(folder.root, folder.workingDirectory)) {
        const branchName = folder.gitRepository?.branchName ?? this.labelService.getUriBasenameLabel(folder.workingDirectory);
        return `${repositoryName} (${branchName})`;
      }
      return repositoryName;
    }
    return this.labelService.getUriBasenameLabel(workspaceFolder.uri);
  }
  isWorkspaceFolder(folder, workspaceFolder) {
    return this.uriIdentityService.extUri.isEqual(folder.workingDirectory, workspaceFolder.uri);
  }
};

SessionsWorkspaceFolderLabelService = __decorateClass([
  __decorateParam(0, ISessionsService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILabelService)
], SessionsWorkspaceFolderLabelService);

registerSingleton(IWorkspaceFolderLabelService, SessionsWorkspaceFolderLabelService, 1 /* Delayed */);
export { SessionsWorkspaceFolderLabelService };
