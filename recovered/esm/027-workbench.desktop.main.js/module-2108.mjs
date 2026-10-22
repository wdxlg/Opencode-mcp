// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostNewSessionFolderService.ts
import { createDecorator } from "./module-0077.mjs";
import { extUriBiasedIgnorePathCase, isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostNewSessionFolderService.ts
var IAgentHostNewSessionFolderService = createDecorator("agentHostNewSessionFolderService");

function computeWorkingDirectories(primary, workspaceFolders, rootState, provider) {
  if (!primary) {
    return void 0;
  }
  const supportsMultiple = supportsMultipleWorkingDirectories(rootState, provider);
  if (!supportsMultiple || !workspaceFolders.some((folder) => extUriBiasedIgnorePathCase.isEqual(folder, primary))) {
    return [primary];
  }
  return computeDesiredWorkingDirectories(primary, [primary], workspaceFolders);
}

function supportsMultipleWorkingDirectories(rootState, provider) {
  const agent = rootState && !(rootState instanceof Error) ? rootState.agents.find((a) => a.provider === provider) : void 0;
  return !!agent?.capabilities?.multipleWorkingDirectories;
}

function hasImmutablePrimaryWorkingDirectory(rootState, provider) {
  const agent = rootState && !(rootState instanceof Error) ? rootState.agents.find((a) => a.provider === provider) : void 0;
  return agent?.capabilities?.multipleWorkingDirectories?.immutablePrimary === true;
}

function resolveFolderPickerDecisionUpdate(sessionResource, agentHostProviderId, decision, previousTrackedSessionResource, isSessionsWindow, sessionIsEmpty, currentSelectedFolder, folderExtUri) {
  if (!sessionResource || !agentHostProviderId) {
    return { kind: "apply", visible: false, trackedSessionResource: void 0, selectPrimary: void 0 };
  }
  const sameSession = isEqual2(previousTrackedSessionResource, sessionResource);
  if (!decision) {
    return sameSession ? { kind: "noop" } : { kind: "apply", visible: false, trackedSessionResource: sessionResource, selectPrimary: void 0 };
  }
  let selectPrimary;
  if (decision.primary && !isSessionsWindow && sessionIsEmpty) {
    const primary = URI.parse(decision.primary);
    if (!folderExtUri.isEqual(currentSelectedFolder, primary)) {
      selectPrimary = primary;
    }
  }
  return { kind: "apply", visible: !decision.hidden, trackedSessionResource: sessionResource, selectPrimary };
}

function computeDesiredWorkingDirectories(primary, currentWorkingDirectories, workspaceFolders, extUri2 = extUriBiasedIgnorePathCase) {
  const desired = [primary];
  const addIfWorkspaceSecondary = (candidate) => {
    const alreadyIncluded = desired.some((existing) => extUri2.isEqual(existing, candidate));
    if (alreadyIncluded || !workspaceFolders.some((folder) => extUri2.isEqual(folder, candidate))) {
      return;
    }
    desired.push(candidate);
  };
  for (const currentSecondary of currentWorkingDirectories.slice(1)) {
    addIfWorkspaceSecondary(currentSecondary);
  }
  for (const folder of workspaceFolders) {
    addIfWorkspaceSecondary(folder);
  }
  return desired;
}

var AgentHostNewSessionFolderService = class extends Disposable {
  constructor(chatService, _workspaceContextService, _uriIdentityService) {
    super();
    this._workspaceContextService = _workspaceContextService;
    this._uriIdentityService = _uriIdentityService;
    this._folders = new ResourceMap();
    this._onDidChangeFolder = this._register(new Emitter());
    this.onDidChangeFolder = this._onDidChangeFolder.event;
    this._register(chatService.onDidDisposeSession((e) => {
      for (const sessionResource of e.sessionResources) {
        this.clear(sessionResource);
      }
    }));
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders((e) => {
      if (e.removed.length === 0) {
        return;
      }
      const extUri2 = this._uriIdentityService.extUri;
      const currentFolders = this._workspaceContextService.getWorkspace().folders;
      const staleSessions = [];
      for (const [sessionResource, folder] of this._folders) {
        const wasRemoved = e.removed.some((removed) => extUri2.isEqual(removed.uri, folder));
        const stillPresent = currentFolders.some((current) => extUri2.isEqual(current.uri, folder));
        if (wasRemoved && !stillPresent) {
          staleSessions.push(sessionResource);
        }
      }
      for (const sessionResource of staleSessions) {
        this.clear(sessionResource);
      }
    }));
  }
  getFolder(sessionResource) {
    return this._folders.get(sessionResource);
  }
  setFolder(sessionResource, folder) {
    this._defaultFolder = folder;
    const existing = this._folders.get(sessionResource);
    if (existing?.toString() === folder.toString()) {
      return;
    }
    this._folders.set(sessionResource, folder);
    this._onDidChangeFolder.fire(sessionResource);
  }
  clear(sessionResource) {
    if (this._folders.delete(sessionResource)) {
      this._onDidChangeFolder.fire(sessionResource);
    }
  }
  getDefaultFolder() {
    const stored = this._defaultFolder;
    if (stored && this._workspaceContextService.getWorkspace().folders.some((folder) => this._uriIdentityService.extUri.isEqual(folder.uri, stored))) {
      return stored;
    }
    return void 0;
  }
  resolveNewSessionPrimary(sessionResource) {
    const folders = this._workspaceContextService.getWorkspace().folders;
    const explicit = this._folders.get(sessionResource);
    if (explicit && folders.some((folder) => this._uriIdentityService.extUri.isEqual(folder.uri, explicit))) {
      return explicit;
    }
    return this.getDefaultFolder() ?? folders[0]?.uri;
  }
};

AgentHostNewSessionFolderService = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IUriIdentityService)
], AgentHostNewSessionFolderService);

registerSingleton(IAgentHostNewSessionFolderService, AgentHostNewSessionFolderService, 1 /* Delayed */);
export { computeWorkingDirectories, supportsMultipleWorkingDirectories, hasImmutablePrimaryWorkingDirectory, resolveFolderPickerDecisionUpdate, computeDesiredWorkingDirectories, IAgentHostNewSessionFolderService, AgentHostNewSessionFolderService };
