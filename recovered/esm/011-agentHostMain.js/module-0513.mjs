// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentServiceComposition.ts
import { DisposableStore, MutableDisposable } from "./module-0010.mjs";
import { dirname2, joinPath } from "./module-0025.mjs";
import { AgentHostDatabase } from "./module-0457.mjs";
import { AgentHostDebugLogsCollector } from "./module-0455.mjs";
import { IAgentHostProviderService } from "./module-0202.mjs";
import { AgentSessionRegistry } from "./module-0488.mjs";
import { IAgentHostCustomizationEnablementService } from "./module-0175.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";
import { AgentMergeController } from "./module-0474.mjs";
import { IAgentHostCheckpointService } from "./module-0131.mjs";
import { IAgentHostChangesetOperationService } from "./module-0443.mjs";
import { IAgentHostReviewService } from "./module-0132.mjs";
import { IAgentHostChangesetService } from "./module-0444.mjs";
import { AgentHostChangesetCoordinator } from "./module-0454.mjs";
import { IAgentHostCompletions } from "./module-0118.mjs";
import { IAgentHostTerminalManager } from "./module-0191.mjs";
import { AgentSideEffects } from "./module-0511.mjs";
import { AgentMergeTools } from "./module-0475.mjs";
import { AgentServerToolHost } from "./module-0512.mjs";
import { buildServerToolGroups } from "./module-0236.mjs";
import { AgentHostAutomationService } from "./module-0449.mjs";
import { AgentService } from "./module-0476.mjs";


// src/vs/platform/agentHost/node/agentServiceComposition.ts
function createAgentServiceComposition(options, accessor, instantiationService, logService, sessionDataService, foundation, localTurns, additionalDisposables = []) {
  const owned = new DisposableStore();
  const contributions = owned.add(new MutableDisposable());
  let agentService;
  try {
    const databasePath = options.rootConfigResource ? joinPath(dirname2(options.rootConfigResource), "agent-host.db").fsPath : ":memory:";
    const orchestratorDatabase = owned.add(options.orchestratorDatabase ?? new AgentHostDatabase(databasePath));
    const debugLogsCollector = options.debugLogsEnvironment ? owned.add(new AgentHostDebugLogsCollector(options.debugLogsEnvironment, logService)) : void 0;
    const { callbackAdapter, stateManager, configurationService, authenticationService, gitHubEndpointService } = foundation;
    const providerService = accessor.get(IAgentHostProviderService);
    const sessionRegistry = owned.add(new AgentSessionRegistry(orchestratorDatabase));
    const core = {
      disposables: owned,
      authenticationService,
      orchestratorDatabase,
      debugLogsCollector,
      sessionRegistry,
      stateManager,
      configurationService,
      callbackBinder: callbackAdapter
    };
    const customizationEnablementService = accessor.get(IAgentHostCustomizationEnablementService);
    const gitStateService = accessor.get(IAgentHostGitStateService);
    const agentMergeController = owned.add(instantiationService.createInstance(AgentMergeController, {
      startTurn: (session, turnId, prompt) => callbackAdapter.value.startAgentMergeTurn(session, turnId, prompt),
      cancelTurn: (session, turnId) => callbackAdapter.value.cancelAgentMergeTurn(session, turnId),
      postNotice: (session, kind, content) => callbackAdapter.value.postAgentMergeNotice(session, kind, content),
      getAutonomousSessionConfig: (session, config) => callbackAdapter.value.getAutonomousSessionConfig(session, config)
    }));
    const checkpointService = accessor.get(IAgentHostCheckpointService);
    const changesetOperationService = accessor.get(IAgentHostChangesetOperationService);
    const reviewService = accessor.get(IAgentHostReviewService);
    const changesets = accessor.get(IAgentHostChangesetService);
    const changesetCoordinator = owned.add(instantiationService.createInstance(AgentHostChangesetCoordinator));
    owned.add(stateManager.onDidChangeSessionActiveTurn((event) => changesetCoordinator.onSessionTurnActiveChanged(event.session, event.active)));
    const completions = accessor.get(IAgentHostCompletions);
    const terminalManager = accessor.get(IAgentHostTerminalManager);
    const sideEffects = owned.add(instantiationService.createInstance(
      AgentSideEffects,
      stateManager,
      customizationEnablementService,
      {
        getAgent: (session) => providerService.getProviderForSession(session),
        sessionDataService,
        localTurns,
        agents: providerService.agents,
        hostLaunchKind: options.hostLaunchKind ?? "unknown" /* Unknown */,
        resolveWorkingDirectoryBeforeSend: (params) => callbackAdapter.value.resolveWorkingDirectoryBeforeSend(params),
        resolveChatAttachmentTurns: (resource) => callbackAdapter.value.resolveChatAttachmentTurns(resource)
      }
    ));
    const agentMergeTools = instantiationService.createInstance(
      AgentMergeTools,
      () => agentMergeController.isEnabled(),
      (session) => agentMergeController.getTurnContext(session)
    );
    const serverToolHost = new AgentServerToolHost(
      stateManager,
      buildServerToolGroups(callbackAdapter.sessionServerToolAccessor, agentMergeTools, callbackAdapter.artifactServerToolAccessor)
    );
    const automationService = owned.add(instantiationService.createInstance(AgentHostAutomationService, callbackAdapter.automationExecution));
    const collaborators = {
      gitHubEndpointService,
      gitStateService,
      agentMergeController,
      checkpointService,
      changesetOperationService,
      reviewService,
      changesets,
      changesetCoordinator,
      completions,
      terminalManager,
      localTurns,
      sideEffects,
      serverToolHost,
      automationService
    };
    agentService = instantiationService.createInstance(AgentService, core, collaborators, options);
    for (const disposable of additionalDisposables) {
      owned.add(disposable);
    }
    return {
      agentService,
      authenticationService: core.authenticationService,
      configurationService,
      stateManager,
      customizationEnablementService,
      checkpointService,
      completions,
      providerService,
      agents: providerService.agents,
      onDidStartTurn: sideEffects.onDidStartTurn,
      setContributions: (value) => {
        if (contributions.value) {
          throw new Error("Agent Host contributions have already been set");
        }
        contributions.value = value;
      }
    };
  } catch (error) {
    if (agentService) {
      agentService.dispose();
    } else {
      owned.dispose();
      for (const disposable of additionalDisposables) {
        disposable.dispose();
      }
    }
    throw error;
  }
}
export { createAgentServiceComposition };
