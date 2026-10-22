// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostContributions.ts
import { DisposableStore } from "./module-0010.mjs";
import { IAgentHostChangesetOperationService } from "./module-0443.mjs";
import { AgentHostCommitOperationContribution } from "./module-0515.mjs";
import { AgentHostPullRequestOperationContribution } from "./module-0528.mjs";
import { AgentHostMergeOperationContribution } from "./module-0523.mjs";
import { AgentHostSyncOperationContribution } from "./module-0530.mjs";
import { AgentHostDiscardChangesOperationContribution } from "./module-0517.mjs";
import { IAgentHostCompletions } from "./module-0118.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { ILogService } from "./module-0084.mjs";
import { AgentHostWorkspaceFiles } from "./module-0531.mjs";
import { AgentHostFileCompletionProvider } from "./module-0521.mjs";
import { AgentHostChatCompletionProvider } from "./module-0532.mjs";
import { AgentHostRenameCompletionProvider } from "./module-0497.mjs";
import { CodexCompactCompletionProvider } from "./module-0396.mjs";
import { registerBuiltInChatContributions } from "./module-0551.mjs";
import { IAgentHostChatContributions } from "./module-0487.mjs";


// src/vs/platform/agentHost/node/agentHostContributions.ts
function activateAgentHostContributions(accessor, instantiationService) {
  const store = new DisposableStore();
  try {
    const changesetOperationService = accessor.get(IAgentHostChangesetOperationService);
    store.add(changesetOperationService.registerContribution(instantiationService.createInstance(AgentHostCommitOperationContribution)));
    store.add(changesetOperationService.registerContribution(instantiationService.createInstance(AgentHostPullRequestOperationContribution)));
    store.add(changesetOperationService.registerContribution(instantiationService.createInstance(AgentHostMergeOperationContribution)));
    store.add(changesetOperationService.registerContribution(instantiationService.createInstance(AgentHostSyncOperationContribution)));
    store.add(changesetOperationService.registerContribution(instantiationService.createInstance(AgentHostDiscardChangesOperationContribution)));
    const completions = accessor.get(IAgentHostCompletions);
    const stateManager = accessor.get(IAgentHostStateManager);
    const logService = accessor.get(ILogService);
    const workspaceFiles = store.add(instantiationService.createInstance(AgentHostWorkspaceFiles));
    store.add(completions.registerProvider(new AgentHostFileCompletionProvider(stateManager, workspaceFiles, logService)));
    store.add(completions.registerProvider(new AgentHostChatCompletionProvider(stateManager)));
    store.add(completions.registerProvider(new AgentHostRenameCompletionProvider(
      (session) => (stateManager.getSessionState(session)?.turns.length ?? 0) > 0
    )));
    store.add(completions.registerProvider(new CodexCompactCompletionProvider(
      (session) => (stateManager.getSessionState(session)?.turns.length ?? 0) > 0
    )));
    store.add(registerBuiltInChatContributions(accessor.get(IAgentHostChatContributions)));
    return store;
  } catch (error) {
    store.dispose();
    throw error;
  }
}
export { activateAgentHostContributions };
