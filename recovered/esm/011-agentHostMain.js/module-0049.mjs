// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentService.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/agentService.ts
var AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES = 1e3;

var AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES = 1024 * 1024;

var AgentHostClaudeSdkRootEnvVar = "VSCODE_AGENT_HOST_CLAUDE_SDK_ROOT";

var AgentHostClaudeAgentEnabledEnvVar = "VSCODE_AGENT_HOST_CLAUDE_AGENT_ENABLED";

var AgentHostCodexAgentEnabledEnvVar = "VSCODE_AGENT_HOST_CODEX_AGENT_ENABLED";

var AgentHostSessionResidencyLimitEnvVar = "VSCODE_AGENT_HOST_SESSION_RESIDENCY_LIMIT";

var AgentHostSessionReleaseRetryMsEnvVar = "VSCODE_AGENT_HOST_SESSION_RELEASE_RETRY_MS";

function isAgentEnabled(envValue, defaultEnabled) {
  if (envValue === void 0 || envValue === "") {
    return defaultEnabled;
  }
  const normalized = envValue.trim().toLowerCase();
  if (normalized === "false" || normalized === "0") {
    return false;
  }
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  return defaultEnabled;
}

var AgentHostCodexAgentSdkRootEnvVar = "VSCODE_AGENT_HOST_CODEX_SDK_ROOT";

var AgentHostCodexAgentCodexHomeEnvVar = "CODEX_HOME";

var AgentHostCodexAgentBinaryArgsEnvVar = "VSCODE_AGENT_HOST_CODEX_APP_SERVER_ARGS";

var AgentHostOTelSpansDbSubPath = "agent-host/otel/agent-host-traces.db";

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

var IAgentService = createDecorator("agentService");

var IAgentHostService = createDecorator("agentHostService");
export { isAgentEnabled, AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES, AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES, AgentHostClaudeSdkRootEnvVar, AgentHostClaudeAgentEnabledEnvVar, AgentHostCodexAgentEnabledEnvVar, AgentHostSessionResidencyLimitEnvVar, AgentHostSessionReleaseRetryMsEnvVar, AgentHostCodexAgentSdkRootEnvVar, AgentHostCodexAgentCodexHomeEnvVar, AgentHostCodexAgentBinaryArgsEnvVar, AgentHostOTelSpansDbSubPath, AgentHostOTelEnvVars, IAgentService, IAgentHostService };
