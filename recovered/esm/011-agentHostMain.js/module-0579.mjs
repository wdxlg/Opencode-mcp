// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostServices.ts
import { AgentHostFileMonitorService, IAgentHostFileMonitorService } from "./module-0450.mjs";
import { SyncDescriptor } from "./module-0299.mjs";
import { INetworkDiagnosticsService, NetworkDiagnosticsService } from "./module-0484.mjs";
import { IDiffComputeService } from "./module-0259.mjs";
import { NodeWorkerDiffComputeService } from "./module-0559.mjs";
import { IAgentEditAttributionService } from "./module-0260.mjs";
import { AgentEditAttributionService } from "./module-0577.mjs";
import { EditSurvivalReporterFactory, IEditSurvivalReporterFactory } from "./module-0264.mjs";
import { EditArcReporterService, IEditArcReporterService } from "./module-0275.mjs";
import { AgentHostStorageService, IAgentHostStorageService } from "./module-0164.mjs";
import { AgentHostManagedSettingsService, IAgentHostManagedSettingsService } from "./module-0159.mjs";
import { AgentHostOctoKitService, IAgentHostOctoKitService } from "./module-0524.mjs";
import { GitHubService, IGitHubService } from "./module-0472.mjs";
import { CopilotApiService, ICopilotApiService } from "./module-0168.mjs";
import { AgentHostCustomizationEnablementService, IAgentHostCustomizationEnablementService } from "./module-0175.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";
import { AgentHostGitStateService } from "./module-0574.mjs";
import { IAgentHostCheckpointService } from "./module-0131.mjs";
import { AgentHostCheckpointService } from "./module-0573.mjs";
import { AgentHostPromptCache, IAgentHostPromptCache } from "./module-0285.mjs";
import { AgentHostSessionTitleSignal, IAgentHostSessionTitleSignal } from "./module-0177.mjs";
import { AgentHostSessionOpenTelemetry, IAgentHostSessionOpenTelemetry } from "./module-0203.mjs";
import { IAgentHostChangesetSubscriptionService } from "./module-0453.mjs";
import { AgentHostChangesetSubscriptionService } from "./module-0571.mjs";
import { AgentHostPullRequestStatusService, IAgentHostPullRequestStatusService } from "./module-0526.mjs";
import { IAgentHostSubscriptionService } from "./module-0480.mjs";
import { AgentHostSubscriptionService } from "./module-0576.mjs";
import { IAgentHostChangesetOperationService } from "./module-0443.mjs";
import { AgentHostChangesetOperationService } from "./module-0566.mjs";
import { IAgentHostReviewService } from "./module-0132.mjs";
import { AgentHostReviewService } from "./module-0575.mjs";
import { IAgentHostChangesetService } from "./module-0444.mjs";
import { AgentHostChangesetService } from "./module-0570.mjs";
import { AgentHostCompletions, IAgentHostCompletions } from "./module-0118.mjs";
import { AgentHostTerminalManager, IAgentHostTerminalManager } from "./module-0191.mjs";
import { IAgentHostChatContributions } from "./module-0487.mjs";
import { AgentHostChatContributions } from "./module-0572.mjs";
import { AgentHostTelemetryReporter, IAgentHostTelemetryReporter } from "./module-0253.mjs";
import { AgentHostTurnTracker, IAgentHostTurnTracker } from "./module-0493.mjs";
import { AgentHostToolCallTracker, IAgentHostToolCallTracker } from "./module-0494.mjs";
import { AgentHostProviderService, IAgentHostProviderService } from "./module-0202.mjs";
import { AgentBranchNameGenerator, IAgentBranchNameGenerator } from "./module-0174.mjs";
import { IAgentHostWorktreeIsolation, WorktreeIsolation } from "./module-0165.mjs";
import { IWindowsMxcTerminalSandboxRuntime, WindowsMxcTerminalSandboxRuntime } from "./module-0216.mjs";
import { ISandboxHelperService } from "./module-0212.mjs";
import { SandboxHelperService } from "./module-0555.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { AgentHostGitService } from "./module-0557.mjs";
import { IAgentPluginManager } from "./module-0135.mjs";
import { AgentPluginManager } from "./module-0558.mjs";
import { AgentSdkDownloader, IAgentSdkDownloader } from "./module-0312.mjs";
import { ClaudeAgentSdkService, IClaudeAgentSdkService } from "./module-0321.mjs";
import { ClaudeProxyService, IClaudeProxyService } from "./module-0364.mjs";
import { CodexProxyService, ICodexProxyService } from "./module-0377.mjs";
import { IAgentHostOTelService } from "./module-0137.mjs";
import { AgentHostOTelService } from "./module-0560.mjs";
import { ByokLmProxyService, IByokLmProxyService, NullByokLmProxyService } from "./module-0207.mjs";


// src/vs/platform/agentHost/node/agentHostServices.ts
function registerAgentHostCoreServices(services, inputs) {
  services.set(IAgentHostFileMonitorService, new SyncDescriptor(AgentHostFileMonitorService));
  services.set(INetworkDiagnosticsService, new SyncDescriptor(NetworkDiagnosticsService));
  services.set(IDiffComputeService, new SyncDescriptor(NodeWorkerDiffComputeService));
  services.set(IAgentEditAttributionService, new SyncDescriptor(AgentEditAttributionService, [void 0, void 0]));
  services.set(IEditSurvivalReporterFactory, new SyncDescriptor(EditSurvivalReporterFactory));
  services.set(IEditArcReporterService, new SyncDescriptor(EditArcReporterService, [void 0]));
  services.set(IAgentHostStorageService, new SyncDescriptor(AgentHostStorageService, [inputs.storageResource]));
  services.set(IAgentHostManagedSettingsService, new SyncDescriptor(AgentHostManagedSettingsService));
  services.set(IAgentHostOctoKitService, new SyncDescriptor(AgentHostOctoKitService, [inputs.fetchFn]));
  services.set(IGitHubService, new SyncDescriptor(GitHubService, [inputs.gitHubServiceOptions]));
  services.set(ICopilotApiService, inputs.copilotApiService ?? new SyncDescriptor(CopilotApiService, [inputs.fetchFn]));
  services.set(IAgentHostCustomizationEnablementService, new SyncDescriptor(AgentHostCustomizationEnablementService));
  services.set(IAgentHostGitStateService, new SyncDescriptor(AgentHostGitStateService));
  services.set(IAgentHostCheckpointService, new SyncDescriptor(AgentHostCheckpointService));
  services.set(IAgentHostPromptCache, new SyncDescriptor(AgentHostPromptCache));
  services.set(IAgentHostSessionTitleSignal, new SyncDescriptor(AgentHostSessionTitleSignal));
  services.set(IAgentHostSessionOpenTelemetry, new SyncDescriptor(AgentHostSessionOpenTelemetry));
  services.set(IAgentHostChangesetSubscriptionService, new SyncDescriptor(AgentHostChangesetSubscriptionService));
  services.set(IAgentHostPullRequestStatusService, new SyncDescriptor(AgentHostPullRequestStatusService));
  services.set(IAgentHostSubscriptionService, new SyncDescriptor(AgentHostSubscriptionService));
  services.set(IAgentHostChangesetOperationService, new SyncDescriptor(AgentHostChangesetOperationService));
  services.set(IAgentHostReviewService, new SyncDescriptor(AgentHostReviewService));
  services.set(IAgentHostChangesetService, new SyncDescriptor(AgentHostChangesetService));
  services.set(IAgentHostCompletions, new SyncDescriptor(AgentHostCompletions));
  services.set(IAgentHostTerminalManager, new SyncDescriptor(AgentHostTerminalManager));
  services.set(IAgentHostChatContributions, new SyncDescriptor(AgentHostChatContributions));
  services.set(IAgentHostTelemetryReporter, new SyncDescriptor(AgentHostTelemetryReporter));
  services.set(IAgentHostTurnTracker, new SyncDescriptor(AgentHostTurnTracker));
  services.set(IAgentHostToolCallTracker, new SyncDescriptor(AgentHostToolCallTracker));
  services.set(IAgentHostProviderService, new SyncDescriptor(AgentHostProviderService));
  services.set(IAgentBranchNameGenerator, new SyncDescriptor(AgentBranchNameGenerator));
  services.set(IAgentHostWorktreeIsolation, new SyncDescriptor(WorktreeIsolation));
}

function registerAgentHostHostServices(services, inputs) {
  services.set(IWindowsMxcTerminalSandboxRuntime, new SyncDescriptor(WindowsMxcTerminalSandboxRuntime));
  services.set(ISandboxHelperService, new SyncDescriptor(SandboxHelperService));
  services.set(IAgentHostGitService, new SyncDescriptor(AgentHostGitService));
  services.set(IAgentPluginManager, new SyncDescriptor(AgentPluginManager, [inputs.userDataPath]));
  services.set(IAgentSdkDownloader, new SyncDescriptor(AgentSdkDownloader));
  services.set(IClaudeAgentSdkService, new SyncDescriptor(ClaudeAgentSdkService));
  services.set(IClaudeProxyService, new SyncDescriptor(ClaudeProxyService));
  services.set(ICodexProxyService, new SyncDescriptor(CodexProxyService));
  services.set(IAgentHostOTelService, new SyncDescriptor(AgentHostOTelService, [inputs.fetchFn]));
  services.set(
    IByokLmProxyService,
    inputs.byok.kind === "renderer" ? new SyncDescriptor(ByokLmProxyService) : new NullByokLmProxyService()
  );
}
export { registerAgentHostCoreServices, registerAgentHostHostServices };
