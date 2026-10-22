// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/agentService.ts
import { __esm } from "./module-0000.mjs";
import { init_platform } from "./module-0006.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { init_settings } from "./module-0319.mjs";
import { init_agent } from "./module-0316.mjs";


// src/vs/platform/agentHost/common/agentService.ts
function sanitizeAgentHostOTelPolicySettings(raw) {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const record = raw;
  const asString = (value) => typeof value === "string" ? value : void 0;
  const asBoolean = (value) => typeof value === "boolean" ? value : void 0;
  const asStringRecord = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return void 0;
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "__proto__" || k === "constructor" || k === "prototype") {
        continue;
      }
      if (typeof v === "string") {
        out[k] = v;
      }
    }
    return out;
  };
  return {
    enabled: asBoolean(record.enabled),
    exporterType: asString(record.exporterType),
    otlpProtocol: asString(record.otlpProtocol),
    otlpEndpoint: asString(record.otlpEndpoint),
    captureContent: asBoolean(record.captureContent),
    outfile: asString(record.outfile),
    serviceName: asString(record.serviceName),
    resourceAttributes: asStringRecord(record.resourceAttributes)
  };
}

function serializeResourceAttributes(attributes) {
  if (!attributes) {
    return void 0;
  }
  const parts = Object.entries(attributes).filter(([key, value]) => key !== "" && typeof value === "string").map(([key, value]) => `${key}=${value}`);
  return parts.length > 0 ? parts.join(",") : void 0;
}

function buildAgentHostOTelEnv(settings, inheritedEnv, policySettings = {}) {
  const out = {};
  const setIfMissing = (key, value) => {
    if (value === void 0 || value === "" || inheritedEnv[key] !== void 0) {
      return;
    }
    out[key] = value;
  };
  const setPolicy = (key, value) => {
    if (value !== void 0) {
      out[key] = value;
    }
  };
  if (settings.enabled) {
    setIfMissing(AgentHostOTelEnvVars.Enabled, "true");
  }
  setIfMissing(AgentHostOTelEnvVars.ExporterType, settings.exporterType);
  setIfMissing(AgentHostOTelEnvVars.OtlpEndpoint, settings.otlpEndpoint);
  setIfMissing(AgentHostOTelEnvVars.ServiceName, settings.serviceName);
  setIfMissing(AgentHostOTelEnvVars.ResourceAttributes, serializeResourceAttributes(settings.resourceAttributes));
  setIfMissing(AgentHostOTelEnvVars.FilePath, settings.outfile);
  if (settings.captureContent !== void 0) {
    setIfMissing(AgentHostOTelEnvVars.CaptureContent, settings.captureContent ? "true" : "false");
  }
  if (settings.dbSpanExporterEnabled) {
    setIfMissing(AgentHostOTelEnvVars.DbSpanExporterEnabled, "true");
  }
  if (policySettings.enabled !== void 0) {
    setPolicy(AgentHostOTelEnvVars.Enabled, policySettings.enabled ? "true" : "false");
    if (!policySettings.enabled) {
      setPolicy(AgentHostOTelEnvVars.OtlpEndpoint, "");
      setPolicy(AgentHostOTelEnvVars.OtlpEndpointAlt, "");
      setPolicy(AgentHostOTelEnvVars.FilePath, "");
    }
  }
  if (policySettings.exporterType !== void 0) {
    setPolicy(AgentHostOTelEnvVars.ExporterType, policySettings.exporterType);
    setPolicy(AgentHostOTelEnvVars.FilePath, "");
  }
  if (policySettings.otlpProtocol !== void 0 && policySettings.otlpProtocol !== "") {
    setPolicy(AgentHostOTelEnvVars.OtlpProtocol, policySettings.otlpProtocol);
    setPolicy(AgentHostOTelEnvVars.OtlpTracesProtocol, policySettings.otlpProtocol);
    setPolicy(AgentHostOTelEnvVars.OtlpMetricsProtocol, policySettings.otlpProtocol);
  }
  if (policySettings.otlpEndpoint !== void 0) {
    setPolicy(AgentHostOTelEnvVars.OtlpEndpoint, policySettings.otlpEndpoint);
    setPolicy(AgentHostOTelEnvVars.FilePath, "");
  }
  if (policySettings.outfile !== void 0) {
    setPolicy(AgentHostOTelEnvVars.FilePath, policySettings.outfile);
  }
  if (policySettings.captureContent !== void 0) {
    setPolicy(AgentHostOTelEnvVars.CaptureContent, policySettings.captureContent ? "true" : "false");
  }
  if (policySettings.serviceName !== void 0 && policySettings.serviceName !== "") {
    setPolicy(AgentHostOTelEnvVars.ServiceName, policySettings.serviceName);
  }
  const policyResourceAttributes = serializeResourceAttributes(policySettings.resourceAttributes);
  if (policyResourceAttributes !== void 0) {
    setPolicy(AgentHostOTelEnvVars.ResourceAttributes, policyResourceAttributes);
  }
  return out;
}

function buildAgentSdkEnv(settings, inheritedEnv) {
  const out = {};
  const setIfMissing = (key, value) => {
    if (value === void 0 || value === "" || inheritedEnv[key] !== void 0) {
      return;
    }
    out[key] = value;
  };
  setIfMissing(AgentHostCodexAgentSdkRootEnvVar, settings.codexSdkRoot);
  setIfMissing(AgentHostCodexAgentCodexHomeEnvVar, settings.codexHome);
  if (Array.isArray(settings.codexBinaryArgs) && settings.codexBinaryArgs.length > 0) {
    setIfMissing(AgentHostCodexAgentBinaryArgsEnvVar, JSON.stringify(settings.codexBinaryArgs));
  }
  if (settings.claudeAgentEnabled !== void 0) {
    setIfMissing(AgentHostClaudeAgentEnabledEnvVar, settings.claudeAgentEnabled ? "true" : "false");
  }
  if (settings.codexAgentEnabled !== void 0) {
    setIfMissing(AgentHostCodexAgentEnabledEnvVar, settings.codexAgentEnabled ? "true" : "false");
  }
  return out;
}

var AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES, AgentHostSystemProxyEnabledSettingId, AgentHostGitHubMcpServerEnabledSettingId, AgentHostActiveAgentTitleGenerationSettingId, AgentHostMarkdownPlanRichLinksEnabledSettingId, ArtifactToolsSettingId, AgentHostCopilotMultiRootEnabledSettingId, AgentHostClaudeMultiRootEnabledSettingId, AgentHostCodexMultiRootEnabledSettingId, AgentHostClaudeAgentEnabledSettingId, AgentHostCodexAgentEnabledSettingId, AgentHostByokModelsEnabledSettingId, AgentHostClaudeAgentEnabledEnvVar, AgentHostCodexAgentEnabledEnvVar, AgentHostCodexAgentSdkRootSettingId, AgentHostCodexAgentCodexHomeSettingId, AgentHostCodexAgentBinaryArgsSettingId, AgentHostCodexAgentSdkRootEnvVar, AgentHostCodexAgentCodexHomeEnvVar, AgentHostCodexAgentBinaryArgsEnvVar, AgentHostOTelEnabledSettingId, AgentHostOTelExporterTypeSettingId, AgentHostOTelOtlpProtocolSettingId, AgentHostOTelOtlpEndpointSettingId, AgentHostOTelCaptureContentSettingId, AgentHostOTelOutfileSettingId, AgentHostOTelServiceNameSettingId, AgentHostOTelResourceAttributesSettingId, AgentHostOTelDbSpanExporterEnabledSettingId, AgentHostOTelEnvVars, AgentHostOTelPolicyIpcChannel, AgentHostRestartIpcChannel, AgentHostWillRestartIpcChannel, IAgentService, IAgentHostService;

var init_agentService = __esm({
  "src/vs/platform/agentHost/common/agentService.ts"() {
    init_platform();
    init_instantiation();
    init_settings();
    init_agent();
    init_agent();
    AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES = 1024 * 1024;
    AgentHostSystemProxyEnabledSettingId = "chat.agentHost.systemProxy.enabled";
    AgentHostGitHubMcpServerEnabledSettingId = "chat.agentHost.githubMcpServer.enabled";
    AgentHostActiveAgentTitleGenerationSettingId = "chat.agentHost.experimental.activeAgentTitleGeneration";
    AgentHostMarkdownPlanRichLinksEnabledSettingId = "chat.agentHost.experimental.markdownPlanRichLinks";
    ArtifactToolsSettingId = "chat.artifactTools.enabled";
    AgentHostCopilotMultiRootEnabledSettingId = "chat.agentHost.copilotAgent.multiRootEnabled";
    AgentHostClaudeMultiRootEnabledSettingId = "chat.agentHost.claudeAgent.multiRootEnabled";
    AgentHostCodexMultiRootEnabledSettingId = "chat.agentHost.codexAgent.multiRootEnabled";
    AgentHostClaudeAgentEnabledSettingId = "chat.agentHost.claudeAgent.enabled";
    AgentHostCodexAgentEnabledSettingId = "chat.agentHost.codexAgent.enabled";
    AgentHostByokModelsEnabledSettingId = "chat.agentHost.byokModels.enabled";
    AgentHostClaudeAgentEnabledEnvVar = "VSCODE_AGENT_HOST_CLAUDE_AGENT_ENABLED";
    AgentHostCodexAgentEnabledEnvVar = "VSCODE_AGENT_HOST_CODEX_AGENT_ENABLED";
    AgentHostCodexAgentSdkRootSettingId = "chat.agentHost.codexAgent.sdkRoot";
    AgentHostCodexAgentCodexHomeSettingId = "chat.agentHost.codexAgent.codexHome";
    AgentHostCodexAgentBinaryArgsSettingId = "chat.agentHost.codexAgent.binaryArgs";
    AgentHostCodexAgentSdkRootEnvVar = "VSCODE_AGENT_HOST_CODEX_SDK_ROOT";
    AgentHostCodexAgentCodexHomeEnvVar = "CODEX_HOME";
    AgentHostCodexAgentBinaryArgsEnvVar = "VSCODE_AGENT_HOST_CODEX_APP_SERVER_ARGS";
    AgentHostOTelEnabledSettingId = "chat.agentHost.otel.enabled";
    AgentHostOTelExporterTypeSettingId = "chat.agentHost.otel.exporterType";
    AgentHostOTelOtlpProtocolSettingId = "chat.agentHost.otel.otlpProtocol";
    AgentHostOTelOtlpEndpointSettingId = "chat.agentHost.otel.otlpEndpoint";
    AgentHostOTelCaptureContentSettingId = "chat.agentHost.otel.captureContent";
    AgentHostOTelOutfileSettingId = "chat.agentHost.otel.outfile";
    AgentHostOTelServiceNameSettingId = "chat.agentHost.otel.serviceName";
    AgentHostOTelResourceAttributesSettingId = "chat.agentHost.otel.resourceAttributes";
    AgentHostOTelDbSpanExporterEnabledSettingId = "chat.agentHost.otel.dbSpanExporter.enabled";
    AgentHostOTelEnvVars = Object.freeze({
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
    AgentHostOTelPolicyIpcChannel = "vscode:agentHostOTelPolicy";
    AgentHostRestartIpcChannel = "vscode:restartAgentHost";
    AgentHostWillRestartIpcChannel = "vscode:agentHostWillRestart";
    IAgentService = createDecorator("agentService");
    IAgentHostService = createDecorator("agentHostService");
  }
});
export { sanitizeAgentHostOTelPolicySettings, serializeResourceAttributes, buildAgentHostOTelEnv, buildAgentSdkEnv, AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES, AgentHostSystemProxyEnabledSettingId, AgentHostGitHubMcpServerEnabledSettingId, AgentHostActiveAgentTitleGenerationSettingId, AgentHostMarkdownPlanRichLinksEnabledSettingId, ArtifactToolsSettingId, AgentHostCopilotMultiRootEnabledSettingId, AgentHostClaudeMultiRootEnabledSettingId, AgentHostCodexMultiRootEnabledSettingId, AgentHostClaudeAgentEnabledSettingId, AgentHostCodexAgentEnabledSettingId, AgentHostByokModelsEnabledSettingId, AgentHostClaudeAgentEnabledEnvVar, AgentHostCodexAgentEnabledEnvVar, AgentHostCodexAgentSdkRootSettingId, AgentHostCodexAgentCodexHomeSettingId, AgentHostCodexAgentBinaryArgsSettingId, AgentHostCodexAgentSdkRootEnvVar, AgentHostCodexAgentCodexHomeEnvVar, AgentHostCodexAgentBinaryArgsEnvVar, AgentHostOTelEnabledSettingId, AgentHostOTelExporterTypeSettingId, AgentHostOTelOtlpProtocolSettingId, AgentHostOTelOtlpEndpointSettingId, AgentHostOTelCaptureContentSettingId, AgentHostOTelOutfileSettingId, AgentHostOTelServiceNameSettingId, AgentHostOTelResourceAttributesSettingId, AgentHostOTelDbSpanExporterEnabledSettingId, AgentHostOTelEnvVars, AgentHostOTelPolicyIpcChannel, AgentHostRestartIpcChannel, AgentHostWillRestartIpcChannel, IAgentService, IAgentHostService, init_agentService };
