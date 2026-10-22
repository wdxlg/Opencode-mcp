// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentService.ts
import { isWindows } from "./module-0014.mjs";
import { CLAUDE_AGENT_PROVIDER_ID, CODEX_AGENT_PROVIDER_ID } from "./module-1107.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/agentService.ts
var AgentHostAhpJsonlLoggingSettingId = "chat.agentHost.ahpJsonlLoggingEnabled";

var AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES = 1e3;

var AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES = 1024 * 1024;

var AgentHostSystemProxyEnabledSettingId = "chat.agentHost.systemProxy.enabled";

var AgentHostGitHubMcpServerEnabledSettingId = "chat.agentHost.githubMcpServer.enabled";

var AgentHostActiveAgentTitleGenerationSettingId = "chat.agentHost.experimental.activeAgentTitleGeneration";

var AgentHostMarkdownPlanRichLinksEnabledSettingId = "chat.agentHost.experimental.markdownPlanRichLinks";

var ArtifactToolsSettingId = "chat.artifactTools.enabled";

var AgentHostCopilotMultiRootEnabledSettingId = "chat.agentHost.copilotAgent.multiRootEnabled";

var AgentHostClaudeMultiRootEnabledSettingId = "chat.agentHost.claudeAgent.multiRootEnabled";

var AgentHostCodexMultiRootEnabledSettingId = "chat.agentHost.codexAgent.multiRootEnabled";

var AgentHostAllowSignedOutWhenUsableSettingId = "chat.agentHost.allowSignedOutWhenUsable";

var AgentHostClaudeAgentEnabledSettingId = "chat.agentHost.claudeAgent.enabled";

var AgentHostCodexAgentEnabledSettingId = "chat.agentHost.codexAgent.enabled";

var AgentHostByokModelsEnabledSettingId = "chat.agentHost.byokModels.enabled";

var AgentHostSdkSandboxEnabledSettingId = "chat.agentHost.sdkSandbox.enabled";

var AgentHostSdkSandboxWindowsEnabledSettingId = "chat.agentHost.sdkSandbox.enabledWindows";

function getAgentHostCopilotSandboxSettingId(customTerminalToolEnabled, windows = isWindows) {
  if (customTerminalToolEnabled) {
    return windows ? "chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */ : "chat.agent.sandbox.enabled" /* AgentSandboxEnabled */;
  }
  return windows ? AgentHostSdkSandboxWindowsEnabledSettingId : AgentHostSdkSandboxEnabledSettingId;
}

var CodexPreferAgentHostEditorSettingId = "chat.editor.codex.preferAgentHost";

function affectsAgentHostProviderPreference(event, isSessionsWindow) {
  return event.affectsConfiguration(AgentHostClaudeAgentEnabledSettingId) || event.affectsConfiguration(isSessionsWindow ? AgentHostCodexAgentEnabledSettingId : CodexPreferAgentHostEditorSettingId);
}

function shouldSurfaceLocalAgentHostProvider(provider, configurationService, isSessionsWindow) {
  switch (provider) {
    case CLAUDE_AGENT_PROVIDER_ID:
      return configurationService.getValue(AgentHostClaudeAgentEnabledSettingId) !== false;
    case CODEX_AGENT_PROVIDER_ID:
      return configurationService.getValue(isSessionsWindow ? AgentHostCodexAgentEnabledSettingId : CodexPreferAgentHostEditorSettingId) === true;
    default:
      return true;
  }
}

var AgentHostCodexAgentSdkRootSettingId = "chat.agentHost.codexAgent.sdkRoot";

var AgentHostCodexAgentCodexHomeSettingId = "chat.agentHost.codexAgent.codexHome";

var AgentHostCodexAgentBinaryArgsSettingId = "chat.agentHost.codexAgent.binaryArgs";

var AgentHostOTelEnabledSettingId = "chat.agentHost.otel.enabled";

var AgentHostOTelExporterTypeSettingId = "chat.agentHost.otel.exporterType";

var AgentHostOTelOtlpProtocolSettingId = "chat.agentHost.otel.otlpProtocol";

var AgentHostOTelOtlpEndpointSettingId = "chat.agentHost.otel.otlpEndpoint";

var AgentHostOTelCaptureContentSettingId = "chat.agentHost.otel.captureContent";

var AgentHostOTelOutfileSettingId = "chat.agentHost.otel.outfile";

var AgentHostOTelServiceNameSettingId = "chat.agentHost.otel.serviceName";

var AgentHostOTelResourceAttributesSettingId = "chat.agentHost.otel.resourceAttributes";

var AgentHostOTelDbSpanExporterEnabledSettingId = "chat.agentHost.otel.dbSpanExporter.enabled";

var AgentHostOTelEnvVars = Object.freeze({
  Enabled: "COPILOT_OTEL_ENABLED",
  ExporterType: "COPILOT_OTEL_EXPORTER_TYPE",
  OtlpEndpoint: "OTEL_EXPORTER_OTLP_ENDPOINT",
  OtlpEndpointAlt: "COPILOT_OTEL_ENDPOINT",
  OtlpProtocol: "OTEL_EXPORTER_OTLP_PROTOCOL",
  OtlpTracesProtocol: "OTEL_EXPORTER_OTLP_TRACES_PROTOCOL",
  OtlpMetricsProtocol: "OTEL_EXPORTER_OTLP_METRICS_PROTOCOL",
  OtlpHeaders: "OTEL_EXPORTER_OTLP_HEADERS",
  CaptureContent: "OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT",
  FilePath: "COPILOT_OTEL_FILE_EXPORTER_PATH",
  SourceName: "COPILOT_OTEL_SOURCE_NAME",
  ServiceName: "OTEL_SERVICE_NAME",
  ResourceAttributes: "OTEL_RESOURCE_ATTRIBUTES",
  DbSpanExporterEnabled: "COPILOT_OTEL_DB_SPAN_EXPORTER_ENABLED"
});

var AgentHostOTelPolicyIpcChannel = "vscode:agentHostOTelPolicy";

var AgentHostRestartIpcChannel = "vscode:restartAgentHost";

var AgentHostWillRestartIpcChannel = "vscode:agentHostWillRestart";

function readAgentHostOTelPolicySettings(configurationService) {
  const policyValue = (key3) => configurationService.inspect(key3).policyValue;
  return {
    enabled: policyValue(AgentHostOTelEnabledSettingId),
    exporterType: policyValue(AgentHostOTelExporterTypeSettingId),
    otlpProtocol: policyValue(AgentHostOTelOtlpProtocolSettingId),
    otlpEndpoint: policyValue(AgentHostOTelOtlpEndpointSettingId),
    captureContent: policyValue(AgentHostOTelCaptureContentSettingId),
    outfile: policyValue(AgentHostOTelOutfileSettingId),
    serviceName: policyValue(AgentHostOTelServiceNameSettingId),
    resourceAttributes: policyValue(AgentHostOTelResourceAttributesSettingId)
  };
}

var IAgentService = createDecorator("agentService");

var IAgentHostService = createDecorator("agentHostService");
export { getAgentHostCopilotSandboxSettingId, affectsAgentHostProviderPreference, shouldSurfaceLocalAgentHostProvider, readAgentHostOTelPolicySettings, AgentHostAhpJsonlLoggingSettingId, AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES, AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES, AgentHostSystemProxyEnabledSettingId, AgentHostGitHubMcpServerEnabledSettingId, AgentHostActiveAgentTitleGenerationSettingId, AgentHostMarkdownPlanRichLinksEnabledSettingId, ArtifactToolsSettingId, AgentHostCopilotMultiRootEnabledSettingId, AgentHostClaudeMultiRootEnabledSettingId, AgentHostCodexMultiRootEnabledSettingId, AgentHostAllowSignedOutWhenUsableSettingId, AgentHostClaudeAgentEnabledSettingId, AgentHostCodexAgentEnabledSettingId, AgentHostByokModelsEnabledSettingId, AgentHostSdkSandboxEnabledSettingId, AgentHostSdkSandboxWindowsEnabledSettingId, CodexPreferAgentHostEditorSettingId, AgentHostCodexAgentSdkRootSettingId, AgentHostCodexAgentCodexHomeSettingId, AgentHostCodexAgentBinaryArgsSettingId, AgentHostOTelEnabledSettingId, AgentHostOTelExporterTypeSettingId, AgentHostOTelOtlpProtocolSettingId, AgentHostOTelOtlpEndpointSettingId, AgentHostOTelCaptureContentSettingId, AgentHostOTelOutfileSettingId, AgentHostOTelServiceNameSettingId, AgentHostOTelResourceAttributesSettingId, AgentHostOTelDbSpanExporterEnabledSettingId, AgentHostOTelEnvVars, AgentHostOTelPolicyIpcChannel, AgentHostRestartIpcChannel, AgentHostWillRestartIpcChannel, IAgentService, IAgentHostService };
