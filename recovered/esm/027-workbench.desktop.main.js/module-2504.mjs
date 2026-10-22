// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatTransferService.ts
import { createDecorator } from "./module-0077.mjs";
import { areWorkspaceFoldersEmpty } from "./module-2503.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";


// src/vs/workbench/contrib/chat/common/model/chatTransferService.ts
var IChatTransferService = createDecorator("chatTransferService");

var transferredWorkspacesKey = "chat.transferedWorkspaces";

var ChatTransferService = class {
  constructor(workspaceService, storageService, fileService, workspaceTrustManagementService) {
    this.workspaceService = workspaceService;
    this.storageService = storageService;
    this.fileService = fileService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
  }
  deleteWorkspaceFromTransferredList(workspace) {
    const transferredWorkspaces = this.storageService.getObject(transferredWorkspacesKey, 0 /* PROFILE */, []);
    const updatedWorkspaces = transferredWorkspaces.filter((uri5) => uri5 !== workspace.toString());
    this.storageService.store(transferredWorkspacesKey, updatedWorkspaces, 0 /* PROFILE */, 1 /* MACHINE */);
  }
  addWorkspaceToTransferred(workspace) {
    const transferredWorkspaces = this.storageService.getObject(transferredWorkspacesKey, 0 /* PROFILE */, []);
    transferredWorkspaces.push(workspace.toString());
    this.storageService.store(transferredWorkspacesKey, transferredWorkspaces, 0 /* PROFILE */, 1 /* MACHINE */);
  }
  async checkAndSetTransferredWorkspaceTrust() {
    const workspace = this.workspaceService.getWorkspace();
    const currentWorkspaceUri = workspace.folders[0]?.uri;
    if (!currentWorkspaceUri) {
      return;
    }
    if (this.isChatTransferredWorkspace(currentWorkspaceUri, this.storageService) && await areWorkspaceFoldersEmpty(workspace, this.fileService)) {
      await this.workspaceTrustManagementService.setWorkspaceTrust(true);
      this.deleteWorkspaceFromTransferredList(currentWorkspaceUri);
    }
  }
  isChatTransferredWorkspace(workspace, storageService) {
    if (!workspace) {
      return false;
    }
    const chatWorkspaceTransfer = storageService.getObject(transferredWorkspacesKey, 0 /* PROFILE */, []);
    return chatWorkspaceTransfer.some((item) => item.toString() === workspace.toString());
  }
};

ChatTransferService = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IWorkspaceTrustManagementService)
], ChatTransferService);
export { IChatTransferService, transferredWorkspacesKey, ChatTransferService };
