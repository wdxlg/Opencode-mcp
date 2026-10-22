// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexLaunchConfig.ts
import { AiAgentEnvValue, AiAgentEnvVar } from "./module-0192.mjs";


// src/vs/platform/agentHost/node/codex/codexLaunchConfig.ts
function buildCodexResumeParams(modelProvider, threadId, mcpServers, workingDirectories, configOverrides = {}, developerInstructions, imageGenerationEnabled = false) {
  const config = {
    ...configOverrides,
    "features.image_generation": imageGenerationEnabled,
    ...Object.keys(mcpServers).length > 0 ? { mcp_servers: mcpServers } : {}
  };
  return {
    threadId,
    modelProvider,
    ...workingDirectories?.length ? {
      cwd: workingDirectories[0],
      runtimeWorkspaceRoots: [...workingDirectories]
    } : {},
    ...Object.keys(config).length > 0 ? { config } : {},
    ...developerInstructions ? { developerInstructions } : {}
  };
}

function buildCodexLaunchConfig(inheritedEnv, proxy, extraArgs, telemetry) {
  const env2 = { ...inheritedEnv, [AiAgentEnvVar]: AiAgentEnvValue };
  if (telemetry) {
    delete env2.OTEL_SERVICE_NAME;
    env2.OTEL_RESOURCE_ATTRIBUTES = serializeResourceAttributes2(telemetry.resourceAttributes);
  }
  env2.OPENAI_API_KEY = proxy.nonce;
  const overrides = [
    `model_providers.vscode-proxy.name="VS Code Proxy"`,
    `model_providers.vscode-proxy.base_url="${proxy.baseUrl}/v1"`,
    `model_providers.vscode-proxy.wire_api="responses"`,
    `model_providers.vscode-proxy.env_key="OPENAI_API_KEY"`,
    `model_providers.vscode-proxy.requires_openai_auth=false`,
    `model_providers.vscode-proxy.supports_websockets=false`,
    // Codex filters its shell tool's env through `shell_environment_policy`,
    // so pin the marker there too — a user policy (e.g. `inherit = "core"`)
    // would otherwise drop it.
    `shell_environment_policy.set.${AiAgentEnvVar}="${AiAgentEnvValue}"`,
    `features.tool_call_mcp_elicitation=false`,
    // Keep image generation disabled for the Copilot/CAPI proxy by default.
    // ChatGPT subscription threads opt in with a per-thread override.
    `features.image_generation=false`
  ];
  const telemetryOverrides = codexTelemetryOverrides(telemetry);
  return {
    env: env2,
    args: ["app-server", ...overrides.flatMap((value) => ["-c", value]), ...extraArgs, ...telemetryOverrides.flatMap((value) => ["-c", value])]
  };
}

function codexTelemetryOverrides(config) {
  return [
    // Codex analytics are independent from its OTel exporters and post to an
    // OpenAI-owned endpoint. Keep them disabled even when the user configures
    // Agent Host OTel, whose destinations are supplied explicitly below. Codex
    // currently uses this same flag to gate its metrics exporter, so preventing
    // product analytics also suppresses its otherwise user-directed metrics.
    "analytics.enabled=false",
    // Agent Host does not expose Codex's feedback flow. Disable its Sentry
    // upload path rather than leaving an unused outbound channel available.
    "feedback.enabled=false",
    `otel.log_user_prompt=${config?.captureContent ?? false}`,
    config?.traces ? `otel.trace_exporter=${codexExporter(config.traces)}` : 'otel.trace_exporter="none"',
    config?.external ? `otel.exporter=${codexExporter({ ...config.external, endpoint: resolveSignalEndpoint2(config.external.endpoint, "logs", config.external.protocol) })}` : 'otel.exporter="none"',
    config?.external ? `otel.metrics_exporter=${codexExporter({ ...config.external, endpoint: resolveSignalEndpoint2(config.external.endpoint, "metrics", config.external.protocol) })}` : 'otel.metrics_exporter="none"'
  ];
}

function codexExporter(config) {
  const headers = config.headers && Object.keys(config.headers).length > 0 ? `, headers = { ${Object.entries(config.headers).map(([key, value]) => `${JSON.stringify(key)} = ${JSON.stringify(value)}`).join(", ")} }` : "";
  if (config.protocol === "grpc") {
    return `{ otlp-grpc = { endpoint = ${JSON.stringify(config.endpoint)}${headers} } }`;
  }
  const protocol = config.protocol === "http/json" ? "json" : "binary";
  return `{ otlp-http = { endpoint = ${JSON.stringify(config.endpoint)}, protocol = ${JSON.stringify(protocol)}${headers} } }`;
}

function serializeResourceAttributes2(attributes) {
  return Object.entries(attributes).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join(",");
}

function resolveSignalEndpoint2(endpoint, signal, protocol) {
  if (protocol === "grpc") {
    return endpoint;
  }
  try {
    const url2 = new URL(endpoint);
    if (url2.pathname === "" || url2.pathname === "/") {
      url2.pathname = `/v1/${signal}`;
    } else if (url2.pathname.endsWith("/v1/traces")) {
      url2.pathname = `${url2.pathname.slice(0, -"/v1/traces".length)}/v1/${signal}`;
    }
    return url2.toString().replace(/\/$/, "");
  } catch {
    return endpoint;
  }
}
export { buildCodexResumeParams, buildCodexLaunchConfig, codexTelemetryOverrides, codexExporter, serializeResourceAttributes2, resolveSignalEndpoint2 };
