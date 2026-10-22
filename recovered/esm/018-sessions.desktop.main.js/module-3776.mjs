// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/workspace/browser/workspaceFolderManagement.ts
import { Disposable } from "./module-0012.mjs";
import { Queue } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { ensureSessionWorktreesTrusted } from "./module-1769.mjs";
import { IWorkspaceContextService, WorkspaceFolder } from "./module-0509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceEditingService } from "./module-1313.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IWorkspaceFolderLabelService } from "./module-2010.mjs";


// src/vs/sessions/contrib/workspace/browser/workspaceFolderManagement.ts
var WorkspaceFolderManagementContribution = class extends Disposable {
  constructor(sessionsService, uriIdentityService, workspaceContextService, workspaceEditingService, workspaceTrustManagementService, workspaceFolderLabelService) {
    super();
    this.sessionsService = sessionsService;
    this.uriIdentityService = uriIdentityService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceEditingService = workspaceEditingService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.workspaceFolderLabelService = workspaceFolderLabelService;
    this.queue = this._register(new Queue());
    this._register(autorun((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      activeSession?.workspace.read(reader);
      this.queue.queue(() => this.updateWorkspaceFoldersForSession(activeSession));
    }));
  }
  static {
    this.ID = "workbench.contrib.workspaceFolderManagement";
  }
  async updateWorkspaceFoldersForSession(session) {
    await ensureSessionWorktreesTrusted(session?.workspace.get(), this.workspaceTrustManagementService);
    const activeSessionFolderData = this.getActiveSessionFolderData(session);
    const currentRepo = this.workspaceContextService.getWorkspace().folders[0]?.uri;
    if (activeSessionFolderData && !await this.isFolderMountable(session, activeSessionFolderData.uri)) {
      if (currentRepo) {
        await this.workspaceEditingService.removeFolders([currentRepo], true);
      }
      return;
    }
    if (!activeSessionFolderData) {
      if (currentRepo) {
        await this.workspaceEditingService.removeFolders([currentRepo], true);
      }
      return;
    }
    if (!currentRepo) {
      await this.workspaceEditingService.addFolders([activeSessionFolderData], true);
      return;
    }
    if (this.uriIdentityService.extUri.isEqual(currentRepo, activeSessionFolderData.uri)) {
      return;
    }
    await this.workspaceEditingService.updateFolders(0, 1, [activeSessionFolderData], true);
  }
  getActiveSessionFolderData(session) {
    if (!session) {
      return void 0;
    }
    const workspace = session.workspace.get();
    const folder = workspace?.folders[0];
    if (!folder) {
      return void 0;
    }
    return {
      uri: folder.workingDirectory,
      name: this.workspaceFolderLabelService.getWorkspaceFolderLabel(
        new WorkspaceFolder({ uri: folder.workingDirectory, name: workspace.label, index: 0 }),
        true
      ) ?? workspace.label
    };
  }
  /**
   * Whether `uri` may be mounted as the workspace folder. A session that
   * requires workspace trust may only mount a trusted folder; anything else is
   * left unmounted so the window never enters Restricted Mode behind the user's
   * back. Sessions that don't require trust (e.g. virtual/cloud) always mount.
   */
  async isFolderMountable(session, uri4) {
    const workspace = session?.workspace.get();
    if (!workspace?.requiresWorkspaceTrust) {
      return true;
    }
    return (await this.workspaceTrustManagementService.getUriTrustInfo(uri4)).trusted;
  }
};

WorkspaceFolderManagementContribution = __decorateClass([
  __decorateParam(0, ISessionsService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IWorkspaceEditingService),
  __decorateParam(4, IWorkspaceTrustManagementService),
  __decorateParam(5, IWorkspaceFolderLabelService)
], WorkspaceFolderManagementContribution);
export { WorkspaceFolderManagementContribution };
