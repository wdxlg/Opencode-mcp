// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/openAgentHostStateFileAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IsAgentHostSession } from "./module-3733.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { openAgentHostStateFile } from "./module-2531.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/openAgentHostStateFileAction.ts
var OpenAgentHostStateFileAction2 = class _OpenAgentHostStateFileAction extends Action2 {
  static {
    this.ID = "agentHost.openSessionEventsFile";
  }
  constructor() {
    super({
      id: _OpenAgentHostStateFileAction.ID,
      title: localize2(5029, "Open Agent Host State File"),
      f1: true,
      category: Categories.Developer,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, IsAgentHostSession)
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsProvidersService = accessor.get(ISessionsProvidersService);
    const activeSession = sessionsService.activeSession.get();
    const provider = activeSession ? sessionsProvidersService.getProvider(activeSession.providerId) : void 0;
    const activeChat = activeSession?.activeChat.get();
    const chatTarget = activeChat?.resource.fragment ? { backendResource: provider && isAgentHostProvider(provider) ? provider.getBackendChatResource(activeChat.resource) : void 0 } : void 0;
    await openAgentHostStateFile(accessor, activeSession?.resource, chatTarget);
  }
};
export { OpenAgentHostStateFileAction2 };
