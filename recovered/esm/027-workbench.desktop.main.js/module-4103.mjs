// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/debugAgentHostAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0963.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/debugAgentHostAction.ts
var DebugAgentHostInDevToolsAction = class _DebugAgentHostInDevToolsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.debugAgentHostInDevTools";
  }
  constructor() {
    super({
      id: _DebugAgentHostInDevToolsAction.ID,
      title: localize2(13512, "Debug Local Agent Host Process In Dev Tools"),
      category: Categories.Developer,
      f1: true,
      icon: Codicon.debugStart,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        AGENT_HOST_ENABLED_CONTEXT_KEY
      )
    });
  }
  async run(accessor) {
    const agentHostService = accessor.get(IAgentHostService);
    const nativeHostService = accessor.get(INativeHostService);
    const notificationService = accessor.get(INotificationService);
    const info = await agentHostService.getInspectInfo(true);
    if (!info) {
      notificationService.warn(localize(13511, null));
      return;
    }
    nativeHostService.openDevToolsWindow(info.devtoolsUrl);
  }
};
export { DebugAgentHostInDevToolsAction };
