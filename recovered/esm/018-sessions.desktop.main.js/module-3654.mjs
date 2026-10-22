// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/exportDebugLogsAction.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0964.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { DEFAULT_CHAT_ID } from "./module-1008.mjs";
import { exportAgentHostDebugLogs } from "./module-3653.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/exportDebugLogsAction.ts
var ExportAgentHostDebugLogsAction2 = class _ExportAgentHostDebugLogsAction extends Action2 {
  static {
    this.ID = "agentHost.exportDebugLogs";
  }
  constructor() {
    super({
      id: _ExportAgentHostDebugLogsAction.ID,
      title: localize2(5022, "Export Agent Host Debug Logs..."),
      f1: true,
      category: Categories.Developer,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.or(IsSessionsWindowContext, AGENT_HOST_ENABLED_CONTEXT_KEY)
      )
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsProvidersService = accessor.get(ISessionsProvidersService);
    const activeSession = sessionsService.activeSession.get();
    const provider = activeSession ? sessionsProvidersService.getProvider(activeSession.providerId) : void 0;
    const activeProvider = provider && isAgentHostProvider(provider) ? provider : void 0;
    const activeChat = activeSession?.activeChat.get();
    const activeSessionContext = activeSession && activeProvider ? {
      resource: activeSession.resource,
      sessionTitle: activeSession.title.get(),
      chatTitle: activeChat?.title.get(),
      isLocal: activeSession.resource.scheme.startsWith("agent-host-"),
      chatId: activeChat?.resource.fragment || DEFAULT_CHAT_ID,
      backendChatResource: activeChat ? activeProvider.getBackendChatResource(activeChat.resource) : void 0
    } : void 0;
    await exportAgentHostDebugLogs(accessor, activeSessionContext);
  }
};

registerAction2(ExportAgentHostDebugLogsAction2);
export { ExportAgentHostDebugLogsAction2 };
