// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatRepoInfo.ts
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { ISCMService } from "./module-1081.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/chatRepoInfo.ts
var MAX_DIFFS_SIZE_BYTES = 900 * 1024;

var MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;

function captureRepoMetadata(scmService) {
  const repositories = [...scmService.repositories];
  if (repositories.length === 0) {
    return void 0;
  }
  const repository = repositories[0];
  const rootUri = repository.provider.rootUri;
  if (!rootUri) {
    return void 0;
  }
  let localBranch;
  let localHeadCommit;
  let remoteTrackingBranch;
  let remoteHeadCommit;
  let remoteBaseBranch;
  const historyProvider = repository.provider.historyProvider?.get();
  if (historyProvider) {
    const historyItemRef = historyProvider.historyItemRef.get();
    localBranch = historyItemRef?.name;
    localHeadCommit = historyItemRef?.revision;
    const historyItemRemoteRef = historyProvider.historyItemRemoteRef.get();
    if (historyItemRemoteRef) {
      remoteTrackingBranch = historyItemRemoteRef.name;
      remoteHeadCommit = historyItemRemoteRef.revision;
    }
    const historyItemBaseRef = historyProvider.historyItemBaseRef.get();
    if (historyItemBaseRef) {
      remoteBaseBranch = historyItemBaseRef.name;
    }
  }
  let workspaceType;
  let syncStatus;
  if (remoteTrackingBranch || remoteHeadCommit || remoteBaseBranch) {
    workspaceType = "remote-git";
    if (!remoteTrackingBranch) {
      syncStatus = "unpublished";
    } else if (localHeadCommit && remoteHeadCommit && localHeadCommit === remoteHeadCommit) {
      syncStatus = "synced";
    } else {
      syncStatus = "unpushed";
    }
  } else {
    workspaceType = "local-git";
    syncStatus = "local-only";
  }
  return {
    workspaceType,
    syncStatus,
    localBranch,
    remoteTrackingBranch,
    remoteBaseBranch,
    localHeadCommit,
    remoteHeadCommit,
    diffsStatus: "notCaptured"
  };
}

var ChatRepoInfoContribution = class extends Disposable {
  constructor(chatService, chatEntitlementService, scmService, logService, configurationService) {
    super();
    this.chatService = chatService;
    this.chatEntitlementService = chatEntitlementService;
    this.scmService = scmService;
    this.logService = logService;
    this.configurationService = configurationService;
    this._configurationRegistered = false;
    this.registerConfigurationIfInternal();
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => {
      this.registerConfigurationIfInternal();
    }));
    this._register(this.chatService.onDidSubmitRequest(({ chatSessionResource }) => {
      const model = this.chatService.getSession(chatSessionResource);
      if (!model) {
        return;
      }
      this.captureAndSetRepoMetadata(model);
    }));
  }
  static {
    this.ID = "workbench.contrib.chatRepoInfo";
  }
  registerConfigurationIfInternal() {
    if (this._configurationRegistered) {
      return;
    }
    if (!this.chatEntitlementService.isInternal) {
      return;
    }
    const registry4 = Registry.as(Extensions4.Configuration);
    registry4.registerConfiguration({
      id: "chatRepoInfo",
      title: localize(11079, null),
      type: "object",
      properties: {
        ["chat.repoInfo.enabled" /* RepoInfoEnabled */]: {
          type: "boolean",
          description: localize(11078, null),
          default: false
        }
      }
    });
    this._configurationRegistered = true;
    this.logService.debug("[ChatRepoInfo] Configuration registered for internal user");
  }
  /**
   * Captures lightweight metadata (branch, commit, remote refs) on first message.
   * Synchronous, no file I/O. Reads only from SCM provider observables.
   */
  captureAndSetRepoMetadata(model) {
    if (!this.chatEntitlementService.isInternal) {
      return;
    }
    if (!this.configurationService.getValue("chat.repoInfo.enabled" /* RepoInfoEnabled */)) {
      return;
    }
    if (model.repoData) {
      return;
    }
    try {
      const metadata = captureRepoMetadata(this.scmService);
      if (metadata) {
        model.setRepoData(metadata);
        if (!metadata.localHeadCommit) {
          this.logService.warn("[ChatRepoInfo] Captured repo metadata without commit hash - git history may not be ready");
        }
      } else {
        this.logService.debug("[ChatRepoInfo] No SCM repository available for chat session");
      }
    } catch (error) {
      this.logService.warn("[ChatRepoInfo] Failed to capture repo metadata:", error);
    }
  }
};

ChatRepoInfoContribution = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IChatEntitlementService),
  __decorateParam(2, ISCMService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IConfigurationService)
], ChatRepoInfoContribution);
export { captureRepoMetadata, MAX_DIFFS_SIZE_BYTES, MAX_FILE_SIZE_BYTES, ChatRepoInfoContribution };
