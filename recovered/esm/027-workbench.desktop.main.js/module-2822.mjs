// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/applyAgentHostSessionConfig.ts
import { toAgentHostBackendSessionUri } from "./module-2074.mjs";
import { isUntitledChatSession } from "./module-0961.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/applyAgentHostSessionConfig.ts
async function applyAgentHostSessionConfigChange(sessionResource, config, services) {
  const backendSession = toAgentHostBackendSessionUri(sessionResource);
  if (!backendSession) {
    return false;
  }
  const { agentHostService, provisionalService, workingDirectoryResolver, workspaceContextService } = services;
  const partial = { ...config };
  const workingDirectory = workingDirectoryResolver.resolve(sessionResource) ?? workspaceContextService.getWorkspace().folders[0]?.uri;
  if (isUntitledChatSession(sessionResource)) {
    await provisionalService.applyConfigChange(sessionResource, backendSession.scheme, workingDirectory, partial);
    return true;
  }
  agentHostService.dispatch(backendSession.toString(), {
    type: "session/configChanged" /* SessionConfigChanged */,
    config: partial
  });
  const state = agentHostService.getSubscriptionUnmanaged(1 /* Session */, backendSession)?.value;
  const currentValues = state && !(state instanceof Error) ? state.config?.values : void 0;
  const nextConfig = { ...currentValues ?? {}, ...partial };
  void provisionalService.refreshResolvedConfig(sessionResource, backendSession.scheme, workingDirectory, nextConfig);
  return true;
}
export { applyAgentHostSessionConfigChange };
