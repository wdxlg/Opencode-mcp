// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/chatDeveloperActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { DebugAgentHostInDevToolsAction } from "./module-4103.mjs";
import { RestartLocalAgentHostAction } from "./module-4107.mjs";
import { ProfileAgentHostAction, StopAgentHostProfileAction } from "./module-4105.mjs";
import { registerNetworkDiagnosticsAction } from "./module-4106.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Categories } from "./module-0847.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IChatService } from "./module-0972.mjs";
import { INativeHostService } from "./module-2591.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/chatDeveloperActions.ts
function registerChatDeveloperActions2() {
  registerAction2(OpenChatStorageFolderAction);
  registerAction2(DebugAgentHostInDevToolsAction);
  registerAction2(RestartLocalAgentHostAction);
  registerAction2(ProfileAgentHostAction);
  registerAction2(StopAgentHostProfileAction);
  registerNetworkDiagnosticsAction();
}

var OpenChatStorageFolderAction = class _OpenChatStorageFolderAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openStorageFolder";
  }
  constructor() {
    super({
      id: _OpenChatStorageFolderAction.ID,
      title: localize2(13507, "Open Chat Storage Folder"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args2) {
    const chatService = accessor.get(IChatService);
    const nativeHostService = accessor.get(INativeHostService);
    const storagePath = chatService.getChatStorageFolder();
    nativeHostService.showItemInFolder(storagePath.fsPath);
  }
};
export { registerChatDeveloperActions2, OpenChatStorageFolderAction };
