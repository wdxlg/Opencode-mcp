// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeSdkOptions.ts
import { rgDiskPath } from "./module-0121.mjs";
import { AiAgentEnvValue, AiAgentEnvVar } from "./module-0192.mjs";
import { delimiter, dirname, normalize } from "./module-0018.mjs";
import { toClaudeSdkModelId } from "./module-0328.mjs";
import { resolveClaudeEffort } from "./module-0318.mjs";
import { buildClientToolMcpServer } from "./module-0324.mjs";
import { resolveMcpServerWorkingDirectory } from "./module-0209.mjs";
import { isEqual2 } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/node/claude/claudeSdkOptions.ts
import { tmpdir as tmpdir4 } from "os";


// src/vs/platform/agentHost/node/claude/claudeSdkOptions.ts
async function buildOptions(input, transport, logStderr) {
  const isProxy = transport.kind === "proxy";
  const subprocessEnv = buildSubprocessEnv(isProxy);
  const telemetryEnv = buildClaudeTelemetryEnv(input.telemetry, input.traceContext);
  Object.assign(subprocessEnv, telemetryEnv);
  const resolvedRgDiskPath = await rgDiskPath();
  const settingsEnv = {
    ...telemetryEnv,
    // Proxied (Copilot-routed) mode points the SDK at the local proxy on a
    // per-session bearer. Native (BYO-Anthropic) mode omits both so the SDK
    // uses its own credential resolution from the subprocess env
    // (`ANTHROPIC_API_KEY`, or `CLAUDE_CODE_OAUTH_TOKEN` from `claude
    // setup-token` — both forwarded by `buildSubprocessEnv`).
    ...transport.kind === "proxy" ? {
      ANTHROPIC_BASE_URL: transport.handle.baseUrl,
      ANTHROPIC_AUTH_TOKEN: `${transport.handle.nonce}.${input.sessionId}`
    } : {},
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    USE_BUILTIN_RIPGREP: "0",
    // Attribute the CLI's tool subprocesses (`gh`, …) to VS Code.
    // `settings.env` is what the CLI layers onto the commands it runs, so it
    // needs the marker in addition to the spawn env below. Note the CLI
    // re-stamps `AI_AGENT` as `claude-code_<version>_agent` for its own Bash
    // tool, so commands from that tool are not attributed to VS Code.
    [AiAgentEnvVar]: AiAgentEnvValue,
    PATH: `${dirname(resolvedRgDiskPath)}${delimiter}${process.env.PATH ?? ""}`
  };
  return {
    cwd: input.workingDirectory.fsPath,
    ...input.additionalDirectories && input.additionalDirectories.length > 0 ? { additionalDirectories: input.additionalDirectories.map((d) => d.fsPath) } : {},
    executable: process.execPath,
    env: subprocessEnv,
    abortController: input.abortController,
    allowDangerouslySkipPermissions: true,
    canUseTool: input.canUseTool,
    onElicitation: input.onElicitation,
    disallowedTools: ["WebSearch"],
    includePartialMessages: true,
    forwardSubagentText: true,
    enableFileCheckpointing: true,
    model: toClaudeSdkModelId(input.model),
    effort: resolveClaudeEffort(input.model),
    permissionMode: input.permissionMode,
    ...input.isResume ? { resume: input.sessionId, ...input.resumeSessionAt ? { resumeSessionAt: input.resumeSessionAt } : {} } : { sessionId: input.sessionId },
    ...input.mcpServers ? { mcpServers: input.mcpServers } : {},
    ...input.allowedTools && input.allowedTools.length > 0 ? { allowedTools: [...input.allowedTools] } : {},
    ...input.plugins && input.plugins.length > 0 ? { plugins: input.plugins.map((plugin) => ({ type: "local", path: plugin.uri.fsPath, skipMcpDiscovery: plugin.skipMcpDiscovery })) } : {},
    ...input.agent ? { agent: input.agent } : {},
    settingSources: ["user", "project", "local"],
    settings: {
      env: settingsEnv,
      ...input.deniedMcpServers?.length ? { deniedMcpServers: [...input.deniedMcpServers] } : {}
    },
    systemPrompt: { type: "preset", preset: "claude_code" },
    ...input.getUserPromptAdditionalContext ? {
      hooks: {
        UserPromptSubmit: [{
          hooks: [async () => ({
            hookSpecificOutput: {
              hookEventName: "UserPromptSubmit",
              additionalContext: input.getUserPromptAdditionalContext?.()
            }
          })]
        }]
      }
    } : {},
    stderr: logStderr
  };
}

async function buildClientMcpServers(toolDiff, registry, sdkService) {
  const tools = toolDiff.consume();
  if (tools.length === 0) {
    return void 0;
  }
  const server = await buildClientToolMcpServer(tools, (id2) => registry.register(id2), sdkService);
  return { client: server };
}

function toClaudeMcpServers(definitions2, primaryCwd) {
  const servers = {};
  const skipped = [];
  for (const definition of definitions2) {
    const config = definition.configuration;
    if (config.type === "http" /* REMOTE */) {
      servers[definition.name] = {
        type: config.transport === "sse" ? "sse" : "http",
        url: config.url,
        ...config.headers ? { headers: { ...config.headers } } : {}
      };
      continue;
    }
    const effectiveCwd = resolveMcpServerWorkingDirectory(config.cwd, definition.defaultCwd ?? primaryCwd);
    const hasRepresentableCwd = effectiveCwd !== void 0 && isEqual2(URI.file(normalize(effectiveCwd)), URI.file(normalize(primaryCwd.fsPath)));
    if (!hasRepresentableCwd) {
      skipped.push(definition.name);
      continue;
    }
    servers[definition.name] = {
      type: "stdio",
      command: config.command,
      ...config.args ? { args: [...config.args] } : {},
      ...config.env ? {
        env: Object.fromEntries(Object.entries(config.env).filter((entry) => entry[1] !== null).map(([key, value]) => [key, String(value)]))
      } : {}
    };
  }
  return { servers, skipped };
}

function buildModelEnumerationOptions() {
  return {
    cwd: tmpdir4(),
    executable: process.execPath,
    env: buildSubprocessEnv(false),
    abortController: new AbortController(),
    systemPrompt: { type: "preset", preset: "claude_code" },
    settings: {
      env: {
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"
      }
    }
  };
}

function buildClaudeTelemetryEnv(config, traceContext) {
  if (!config) {
    return {};
  }
  const env2 = {
    CLAUDE_CODE_ENABLE_TELEMETRY: "1",
    OTEL_SERVICE_NAME: "claude-code",
    OTEL_RESOURCE_ATTRIBUTES: serializeResourceAttributes(config.resourceAttributes),
    CLAUDE_CODE_ENHANCED_TELEMETRY_BETA: config.traces ? "1" : "0",
    OTEL_TRACES_EXPORTER: config.traces ? "otlp" : "none",
    OTEL_LOGS_EXPORTER: config.external ? "otlp" : "none",
    OTEL_METRICS_EXPORTER: config.external ? "otlp" : "none",
    OTEL_LOG_USER_PROMPTS: config.captureContent ? "1" : "0",
    OTEL_LOG_ASSISTANT_RESPONSES: config.captureContent ? "1" : "0",
    OTEL_LOG_TOOL_DETAILS: config.captureContent ? "1" : "0",
    OTEL_LOG_TOOL_CONTENT: config.captureContent ? "1" : "0"
  };
  if (config.traces) {
    env2.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = config.traces.endpoint;
    env2.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = config.traces.protocol;
  }
  if (config.external) {
    env2.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = resolveSignalEndpoint(config.external.endpoint, "logs", config.external.protocol);
    env2.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = config.external.protocol;
    env2.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = resolveSignalEndpoint(config.external.endpoint, "metrics", config.external.protocol);
    env2.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = config.external.protocol;
    if (config.external.headers && Object.keys(config.external.headers).length > 0) {
      env2.OTEL_EXPORTER_OTLP_HEADERS = Object.entries(config.external.headers).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join(",");
    }
  }
  if (traceContext) {
    env2.TRACEPARENT = traceContext.traceparent;
    if (traceContext.tracestate) {
      env2.TRACESTATE = traceContext.tracestate;
    }
  }
  return env2;
}

function serializeResourceAttributes(attributes) {
  return Object.entries(attributes).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join(",");
}

function resolveSignalEndpoint(endpoint, signal, protocol) {
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

function buildSubprocessEnv(proxied = true) {
  const env2 = proxied ? {
    ELECTRON_RUN_AS_NODE: "1",
    NODE_OPTIONS: void 0,
    ANTHROPIC_API_KEY: void 0,
    HOME: process.env["HOME"],
    USERPROFILE: process.env["USERPROFILE"],
    // Load rules from additional directories https://code.claude.com/docs/en/memory#load-from-additional-directories
    CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD: "1"
  } : { ...process.env, ELECTRON_RUN_AS_NODE: "1", NODE_OPTIONS: void 0 };
  env2[AiAgentEnvVar] = AiAgentEnvValue;
  for (const key of Object.keys(process.env)) {
    if (key === "ELECTRON_RUN_AS_NODE") {
      continue;
    }
    if (key.startsWith("VSCODE_") || key.startsWith("ELECTRON_")) {
      env2[key] = void 0;
    }
  }
  return env2;
}
export { buildOptions, buildClientMcpServers, toClaudeMcpServers, buildModelEnumerationOptions, buildClaudeTelemetryEnv, serializeResourceAttributes, resolveSignalEndpoint, buildSubprocessEnv, tmpdir4 };
