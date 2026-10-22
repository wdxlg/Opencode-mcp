// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/restartAgentHostAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0963.mjs";
import { RemoteNameContext } from "./module-0949.mjs";
import { IAgentHostService } from "./module-1107.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/restartAgentHostAction.ts
var RestartLocalAgentHostAction = class _RestartLocalAgentHostAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.restartLocalAgentHost";
  }
  constructor() {
    super({
      id: _RestartLocalAgentHostAction.ID,
      title: localize2(13541, "Restart Local Agent Host"),
      category: Categories.Developer,
      f1: true,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        AGENT_HOST_ENABLED_CONTEXT_KEY,
        RemoteNameContext.isEqualTo("")
      )
    });
  }
  run(accessor) {
    return accessor.get(IAgentHostService).restartAgentHost();
  }
};
export { RestartLocalAgentHostAction };
