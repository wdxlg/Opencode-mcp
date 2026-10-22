// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotSessionLauncher.ts
import { reasoningEffortLevels } from "./module-0106.mjs";
import { CLIENT_TOOL_SEARCH_REFERENCE_NAME, RUNTIME_TOOL_SEARCH_TOOL_NAME } from "./module-0190.mjs";
import { copilotCliConfigSchema, normalizeModelFamilyAlias, normalizeToolSearchDeferThreshold, resolveModelCapabilityOverrideField } from "./module-0107.mjs";
import { isObject, isStringArray } from "./module-0008.mjs";
import { getByokLmSelectionModelId, resolveByokLmEnablement } from "./module-0156.mjs";
import { AgentSession } from "./module-0048.mjs";
import { StopWatch } from "./module-0015.mjs";
import { isGpt56Model } from "./module-0225.mjs";
import { CopilotSessionWrapper } from "./module-0211.mjs";
import { buildSandboxConfigForSdk } from "./module-0243.mjs";
import { sandboxConfigSchema } from "./module-0117.mjs";
import { AgentHostByokModelsEnabledConfigKey, AgentHostSessionSyncEnabledConfigKey, platformRootSchema } from "./module-0057.mjs";
import { createShellTools } from "./module-0224.mjs";
import { Schemas } from "./module-0024.mjs";
import { toSdkHooks, toSdkInstructionDirectories, toSdkMcpServers, toSdkMcpServersFromConfigMap, toSdkSessionCustomAgents, toSdkSkillDirectories } from "./module-0208.mjs";
import { EPHEMERAL_DISABLED_COPILOT_TOOLS } from "./module-0237.mjs";
import { SEMANTIC_SEARCH_TOOL_NAME } from "./module-0185.mjs";
import { agentHostModelSupportsToolSearch } from "./module-0244.mjs";
import { agentHostPromptRegistry } from "./module-0241.mjs";
import { describeSystemMessageConfig } from "./module-0238.mjs";
import { coalesce } from "./module-0005.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostManagedSettingsService } from "./module-0159.mjs";
import { IAgentHostTerminalManager } from "./module-0191.mjs";
import { ILogService } from "./module-0084.mjs";
import { IFileService } from "./module-0128.mjs";
import { IByokLmProxyService } from "./module-0207.mjs";
import { IByokLmBridgeRegistry } from "./module-0178.mjs";
import { IAgentHostOTelService } from "./module-0137.mjs";
import { IAgentHostSessionOpenTelemetry } from "./module-0203.mjs";


// src/vs/platform/agentHost/node/copilot/copilotSessionLauncher.ts
var ThinkingLevelConfigKey = "thinkingLevel";

var ContextSizeConfigKey = "contextSize";

var ContextTierConfigKey = "contextTier";

var ReasoningEfforts = reasoningEffortLevels;

function disabledMcpServersSessionOption(plugins, disabledRootMcpServers, additionalDisabledMcpServers) {
  const disabledMcpServers = [.../* @__PURE__ */ new Set([
    ...plugins.flatMap((plugin) => plugin.disabledMcpServers ?? []),
    ...disabledRootMcpServers ?? [],
    ...additionalDisabledMcpServers ?? []
  ])];
  return disabledMcpServers.length > 0 ? { disabledMcpServers } : {};
}

function isMcpServerExplicitlyProjected(server) {
  return server.sdkRegistration === "sessionConfig";
}

function toSdkReasoningEffort(effort) {
  return effort;
}

var ContextTiers = ["default", "long_context"];

var AGENT_HOST_COPILOT_CLIENT_NAME = "vscode-agent-host";

function clientToolNamesFromSnapshot(snapshot) {
  return new Set(snapshot.tools.map((tool) => tool.name));
}

function filterClientToolNames(names, availableTools, excludedTools) {
  if (!availableTools && !excludedTools) {
    return names;
  }
  const matches = (patterns, name) => {
    const sdkName = toSdkClientToolName(name);
    return patterns.some(
      (pattern) => pattern === name || pattern === sdkName || pattern === `custom:${name}` || pattern === `custom:${sdkName}` || pattern === "custom:*"
    );
  };
  const result = /* @__PURE__ */ new Set();
  for (const name of names) {
    const allowed = !availableTools || matches(availableTools, name);
    if (allowed && !(excludedTools && matches(excludedTools, name))) {
      result.add(name);
    }
  }
  return result;
}

function toSdkClientToolName(name) {
  return name === CLIENT_TOOL_SEARCH_REFERENCE_NAME ? RUNTIME_TOOL_SEARCH_TOOL_NAME : name;
}

function toSdkToolFilterPatterns(patterns) {
  if (!patterns) {
    return void 0;
  }
  return [...new Set(patterns.map((pattern) => {
    if (pattern === CLIENT_TOOL_SEARCH_REFERENCE_NAME) {
      return toSdkClientToolName(pattern);
    }
    if (pattern === `custom:${CLIENT_TOOL_SEARCH_REFERENCE_NAME}`) {
      return `custom:${toSdkClientToolName(CLIENT_TOOL_SEARCH_REFERENCE_NAME)}`;
    }
    return pattern;
  }))];
}

function isCopilotReasoningEffort(value) {
  return ReasoningEfforts.some((reasoningEffort) => reasoningEffort === value);
}

function isContextTier(value) {
  return ContextTiers.some((contextTier) => contextTier === value);
}

function getCopilotSdkErrorCode(err) {
  if (typeof err !== "object" || err === null) {
    return void 0;
  }
  const code = Object.getOwnPropertyDescriptor(err, "code")?.value;
  return typeof code === "number" ? code : void 0;
}

function getErrorMessage2(err) {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "object" && err !== null) {
    const message = Object.getOwnPropertyDescriptor(err, "message")?.value;
    if (typeof message === "string") {
      return message;
    }
  }
  return String(err);
}

var RESUMABLE_HISTORY_ABSENT_PATTERNS = [
  /\bSession not found\b/i,
  /\bno events\b/i,
  /\bempty session\b/i
];

function shouldCreateEmptySessionAfterResumeError(err) {
  if (getCopilotSdkErrorCode(err) !== -32603) {
    return false;
  }
  const message = getErrorMessage2(err);
  return RESUMABLE_HISTORY_ABSENT_PATTERNS.some((pattern) => pattern.test(message));
}

function isCustomAgentNotFoundError(err) {
  return getCopilotSdkErrorCode(err) === -32603 && /\bCustom agent '.+' not found\b/i.test(getErrorMessage2(err));
}

function getCopilotReasoningEffort(model, effortOverride) {
  if (isCopilotReasoningEffort(effortOverride)) {
    return toSdkReasoningEffort(effortOverride);
  }
  const thinkingLevel = model?.config?.[ThinkingLevelConfigKey];
  return isCopilotReasoningEffort(thinkingLevel) ? toSdkReasoningEffort(thinkingLevel) : void 0;
}

function describeModelId(model) {
  return model?.id ?? "(no model)";
}

function resolveConfiguredReasoningEffortOverride(model, configurationService, logService, sessionId) {
  const overrides = configurationService.getRootValue(copilotCliConfigSchema, "modelCapabilityOverrides" /* ModelCapabilityOverrides */);
  const effort = resolveModelCapabilityOverrideField(overrides, model?.id, "reasoningEffort", isCopilotReasoningEffort, (value) => {
    logService.warn(`[Copilot:${sessionId}] Ignoring invalid reasoning-effort override '${value}' for '${describeModelId(model)}'; expected one of [${ReasoningEfforts.join(", ")}]`);
  });
  if (effort !== void 0) {
    logService.info(`[Copilot:${sessionId}] Applying reasoning-effort override '${effort}' for '${describeModelId(model)}'`);
    return toSdkReasoningEffort(effort);
  }
  return void 0;
}

function resolveCopilotReasoningEffort(model, configurationService, logService, sessionId) {
  return resolveConfiguredReasoningEffortOverride(model, configurationService, logService, sessionId) ?? getCopilotReasoningEffort(model);
}

function getModelCapabilitiesOverride(value, modelId, logService, sessionId) {
  if (value === void 0) {
    return void 0;
  }
  logService.info(`[Copilot:${sessionId}] Applying 'modelCapabilities' capability override for '${modelId}'`);
  return value;
}

var TOOL_FILTER_SOURCE_WILDCARDS = ["builtin:*", "mcp:*", "custom:*"];

function normalizeToolFilterPatterns(value) {
  const list = typeof value === "string" ? [value] : value;
  if (!isStringArray(list)) {
    return void 0;
  }
  return [...new Set(list.flatMap((pattern) => pattern === "*" ? TOOL_FILTER_SOURCE_WILDCARDS : [pattern]))];
}

function getToolFilterOverride(value, field, modelId, logService, sessionId) {
  const patterns = value !== void 0 ? normalizeToolFilterPatterns(value) : void 0;
  if (patterns !== void 0) {
    logService.info(`[Copilot:${sessionId}] Applying '${field}' capability override for '${modelId}': ${patterns.join(", ")}`);
  }
  return patterns;
}

function getCopilotContextTier(model, longContextWindow, freeLongContext) {
  const legacyTier = model?.config?.[ContextTierConfigKey];
  if (isContextTier(legacyTier)) {
    return legacyTier;
  }
  const contextSize = model?.config?.[ContextSizeConfigKey];
  if (contextSize === void 0) {
    return freeLongContext ? "long_context" : void 0;
  }
  const selectedWindow = Number(contextSize);
  if (!Number.isFinite(selectedWindow) || typeof longContextWindow !== "number") {
    return void 0;
  }
  return selectedWindow >= longContextWindow ? "long_context" : "default";
}

async function resolveByokSessionConfig(sessionId, bridgeRegistry, startProxy, logService) {
  let byokModels;
  try {
    byokModels = [...bridgeRegistry.getModels()];
  } catch (err) {
    logService.warn(`[Copilot:${sessionId}] Failed to enumerate BYOK models from renderer bridges`, err);
    return {};
  }
  if (byokModels.length === 0) {
    return {};
  }
  const seenSelectionIds = /* @__PURE__ */ new Set();
  byokModels = byokModels.filter((m) => {
    const selectionId = `${m.vendor}/${getByokLmSelectionModelId(m)}`;
    if (seenSelectionIds.has(selectionId)) {
      return false;
    }
    seenSelectionIds.add(selectionId);
    return true;
  });
  let handle;
  try {
    handle = await startProxy();
  } catch (err) {
    logService.warn(`[Copilot:${sessionId}] Failed to start BYOK loopback proxy`, err);
    return {};
  }
  const providers = [...new Set(byokModels.map((m) => m.vendor))].map((vendor) => ({
    name: vendor,
    type: "openai",
    wireApi: "responses",
    baseUrl: handle.providerBaseUrl(vendor),
    bearerToken: `${handle.nonce}.${sessionId}`
  }));
  const models = byokModels.map((m) => ({
    id: getByokLmSelectionModelId(m),
    provider: m.vendor,
    ...m.name !== void 0 ? { name: m.name } : {},
    ...m.maxContextWindowTokens !== void 0 ? { maxContextWindowTokens: m.maxContextWindowTokens } : {}
  }));
  logService.info(`[Copilot:${sessionId}] Wired ${models.length} BYOK model(s) across ${providers.length} provider(s) via loopback proxy ${handle.baseUrl}`);
  return { providers, models };
}

var CopilotSessionLauncher = class {
  constructor(_configurationService, _managedSettingsService, _terminalManager, _logService, _fileService, _byokLmProxyService, _byokLmBridgeRegistry, _otelService, _sessionOpenTelemetry) {
    this._configurationService = _configurationService;
    this._managedSettingsService = _managedSettingsService;
    this._terminalManager = _terminalManager;
    this._logService = _logService;
    this._fileService = _fileService;
    this._byokLmProxyService = _byokLmProxyService;
    this._byokLmBridgeRegistry = _byokLmBridgeRegistry;
    this._otelService = _otelService;
    this._sessionOpenTelemetry = _sessionOpenTelemetry;
  }
  async launch(plan, runtime) {
    const config = await this._buildSessionConfig(plan, runtime);
    const sandboxConfig = this._computeSandboxConfig();
    if (plan.kind === "create") {
      return this._createSession(plan, config, sandboxConfig);
    }
    let fallbackPlan = plan;
    let fallbackConfig = config;
    const session = AgentSession.uri("copilotcli", plan.sessionId);
    try {
      const stopWatch = new StopWatch();
      this._logService.trace(`[Copilot:${plan.sessionId}] Calling SDK resumeSession...`);
      const raw = await this._resumeSession(session, plan, config);
      this._logService.trace(`[Copilot:${plan.sessionId}] SDK resumeSession succeeded after ${stopWatch.elapsed()}ms`);
      return this._finalizeSession(raw, sandboxConfig, plan.sessionId, plan.fallback.model?.id);
    } catch (err) {
      let resumeError = err;
      const errCode = getCopilotSdkErrorCode(resumeError);
      const errMsg = getErrorMessage2(resumeError);
      this._logService.warn(`[Copilot:${plan.sessionId}] SDK resumeSession failed: code=${errCode}, message=${errMsg}`);
      if (plan.resolvedAgentName && isCustomAgentNotFoundError(resumeError)) {
        fallbackPlan = { ...plan, resolvedAgentName: void 0 };
        fallbackConfig = { ...config, agent: void 0 };
        this._logService.warn(`[Copilot:${plan.sessionId}] Stored custom agent '${plan.resolvedAgentName}' was not found; retrying resume without a custom agent`);
        try {
          const raw = await this._resumeSession(session, fallbackPlan, fallbackConfig);
          return this._finalizeSession(raw, sandboxConfig, plan.sessionId, fallbackPlan.fallback.model?.id);
        } catch (retryErr) {
          resumeError = retryErr;
          this._logService.warn(`[Copilot:${plan.sessionId}] SDK resumeSession without custom agent failed: code=${getCopilotSdkErrorCode(retryErr)}, message=${getErrorMessage2(retryErr)}`);
        }
      }
      if (!shouldCreateEmptySessionAfterResumeError(resumeError)) {
        this._logService.warn(`[Copilot:${plan.sessionId}] Resume failure does not indicate an empty session; surfacing it instead of replacing the session with an empty one`);
        throw resumeError;
      }
      this._logService.warn(`[Copilot:${plan.sessionId}] Resume reported no session history; falling back to createSession with same ID`);
      const wrapper = await this._createSession({
        ...fallbackPlan,
        kind: "create",
        model: fallbackPlan.fallback.model,
        longContextWindow: fallbackPlan.fallback.longContextWindow,
        freeLongContext: fallbackPlan.fallback.freeLongContext
      }, fallbackConfig, sandboxConfig);
      this._sessionOpenTelemetry.sdkResumeFallbackCreated(session);
      this._logService.info(`[Copilot:${plan.sessionId}] Fallback createSession succeeded`);
      return wrapper;
    }
  }
  _resumeSession(session, plan, config) {
    return this._sessionOpenTelemetry.withSdkResume(
      session,
      () => this._withTraceContext(plan.sessionId, () => plan.client.resumeSession(plan.sessionId, config))
    );
  }
  _withTraceContext(sessionId, fn) {
    const sessionUri = AgentSession.uri("copilotcli", sessionId).toString();
    return this._otelService.withTraceContext(this._otelService.getSessionTraceContext(sessionId, sessionUri), fn);
  }
  async _createSession(plan, config, sandboxConfig) {
    const raw = await this._withTraceContext(plan.sessionId, () => plan.client.createSession({
      ...config,
      sessionId: plan.sessionId,
      streaming: true,
      model: plan.model?.id,
      reasoningEffort: resolveCopilotReasoningEffort(plan.model, this._configurationService, this._logService, plan.sessionId),
      contextTier: getCopilotContextTier(plan.model, plan.longContextWindow, plan.freeLongContext),
      ...plan.resolvedAgentName ? { agent: plan.resolvedAgentName } : {},
      workingDirectory: plan.workingDirectory?.fsPath
    }));
    return this._finalizeSession(raw, sandboxConfig, plan.sessionId, plan.model?.id);
  }
  async _finalizeSession(raw, sandboxConfig, sessionId, modelId) {
    await this._applySandboxConfig(raw, sandboxConfig, sessionId);
    if (isGpt56Model(modelId)) {
      await this._applyGpt56Customizations(raw, sessionId);
    }
    return new CopilotSessionWrapper(raw);
  }
  /** Applies the post-launch session options used by GPT-5.6 models. */
  async _applyGpt56Customizations(session, sessionId) {
    await this._applyVerbosity(session, "medium", sessionId);
    const reasoningSummaryEnabled = this._configurationService.getRootValue(copilotCliConfigSchema, "reasoningSummary" /* ReasoningSummary */) === true;
    if (reasoningSummaryEnabled) {
      await this._applyReasoningSummary(session, "concise", sessionId);
    }
  }
  /** Sets output verbosity after session creation. */
  async _applyVerbosity(session, verbosity, sessionId) {
    try {
      await session.rpc.options.update({ verbosity });
      this._logService.info(`[Copilot:${sessionId}] Applied '${verbosity}' verbosity`);
    } catch (err) {
      this._logService.warn(`[Copilot:${sessionId}] Failed to apply '${verbosity}' verbosity`, err);
    }
  }
  /** Sets reasoning summary detail after session creation. */
  async _applyReasoningSummary(session, reasoningSummary, sessionId) {
    try {
      await session.rpc.options.update({ reasoningSummary });
      this._logService.info(`[Copilot:${sessionId}] Applied '${reasoningSummary}' reasoning summary`);
    } catch (err) {
      this._logService.warn(`[Copilot:${sessionId}] Failed to apply '${reasoningSummary}' reasoning summary`, err);
    }
  }
  /**
   * Compute the SDK-shaped sandbox policy to push to the runtime for the
   * SDK's built-in shell tool.
   *
   * Returns `undefined` when {@link CopilotCliConfigKey.EnableCustomTerminalTool}
   * is ON — in that case the AgentHost provides its own shell tools, which
   * wrap commands via the host terminal sandbox engine, so no SDK-side
   * sandbox policy is needed. Otherwise the policy is derived from the
   * host's `sandbox` config bag (forwarded from the workbench's
   * `chat.agent.sandbox.*` settings), mirroring what
   * `buildSandboxConfigForCLI` does for the Copilot extension's CLI path.
   */
  _computeSandboxConfig() {
    const enableCustomTerminalTool = this._configurationService.getRootValue(copilotCliConfigSchema, "enableCustomTerminalTool" /* EnableCustomTerminalTool */) === true;
    if (enableCustomTerminalTool) {
      return void 0;
    }
    return buildSandboxConfigForSdk(process.platform, this._configurationService.getRootValue(sandboxConfigSchema, "sandbox" /* Sandbox */));
  }
  /**
   * Forward the SDK-shaped sandbox policy to the runtime via
   * `session.options.update`, immediately after the session is created or
   * resumed.
   *
   * No-op when {@link _computeSandboxConfig} returned `undefined` (custom
   * terminal tool enabled, or the host sandbox config evaluates to disabled).
   */
  async _applySandboxConfig(session, sandboxConfig, sessionId) {
    if (!sandboxConfig) {
      return;
    }
    try {
      await session.rpc.options.update({ sandboxConfig });
      this._logService.info(`[Copilot:${sessionId}] Applied SDK sandboxConfig via session.options.update`);
    } catch (err) {
      this._logService.warn(`[Copilot:${sessionId}] Failed to apply SDK sandboxConfig`, err);
    }
  }
  /**
   * Launcher-bound wrapper over {@link resolveByokSessionConfig}: supplies the
   * active bridge registry and a `startProxy` thunk that memoizes the single
   * shared proxy handle for this launcher (started lazily on first use).
   */
  _resolveByokSessionConfig(sessionId) {
    const rootConfigValue = this._configurationService.getRootValue(platformRootSchema, AgentHostByokModelsEnabledConfigKey);
    const { enabled, trace } = resolveByokLmEnablement(rootConfigValue);
    this._logService.trace(`[Copilot:${sessionId}] BYOK session configuration ${trace}`);
    if (!enabled) {
      return Promise.resolve({});
    }
    return resolveByokSessionConfig(sessionId, this._byokLmBridgeRegistry, () => {
      if (!this._byokProxyHandle) {
        this._byokProxyHandle = this._byokLmProxyService.start();
      }
      return this._byokProxyHandle;
    }, this._logService);
  }
  /**
   * Release the memoized BYOK loopback proxy handle (if any) and clear it so
   * the next session launch mints a fresh nonce. Idempotent.
   *
   * **Ownership invariant.** The caller MUST stop the Copilot client/runtime
   * subprocess before invoking this: disposing the handle drops the proxy's
   * refcount and may rebind it on a different port/nonce, so a still-running
   * subprocess would silently lose its endpoint — see {@link IByokLmProxyHandle}.
   * Invoked from `CopilotAgent._stopClient` / `CopilotAgent.shutdown` after the
   * client has stopped.
   */
  async disposeByokProxyHandle() {
    const handle = this._byokProxyHandle;
    this._byokProxyHandle = void 0;
    if (!handle) {
      return;
    }
    try {
      (await handle).dispose();
    } catch {
    }
  }
  async _buildSessionConfig(plan, runtime) {
    const plugins = plan.snapshot.plugins;
    const byok = await this._resolveByokSessionConfig(plan.sessionId);
    const enableCustomTerminalTool = this._configurationService.getRootValue(copilotCliConfigSchema, "enableCustomTerminalTool" /* EnableCustomTerminalTool */) === true;
    let shellTools = [];
    if (enableCustomTerminalTool) {
      if (!plan.shellManager) {
        throw new Error(`ShellManager is required to launch Copilot session '${plan.sessionId}'`);
      }
      shellTools = await createShellTools(plan.shellManager, runtime.chatUri, this._terminalManager, this._logService, (request) => runtime.requestUnsandboxedCommandConfirmation(request));
    }
    const pluginsWithoutDirs = plugins.filter((p) => !p.pluginDir || p.pluginDir.scheme !== Schemas.file);
    const explicitMcpServers = plan.isEphemeral ? [] : plugins.flatMap((plugin) => plugin.mcpServers.filter(
      (server) => !plugin.disabledMcpServers?.includes(server.name) && isMcpServerExplicitlyProjected(server)
    ));
    const customAgents = plan.isEphemeral ? [] : await toSdkSessionCustomAgents(plugins, plan.resolvedAgentName, this._fileService);
    const skillDirectories = toSdkSkillDirectories(pluginsWithoutDirs.flatMap((p) => p.skills));
    const instructionDirectories = toSdkInstructionDirectories(plugins.flatMap((p) => p.instructions));
    const model = plan.kind === "create" ? plan.model : plan.fallback.model;
    const capabilityOverrides = this._configurationService.getRootValue(copilotCliConfigSchema, "modelCapabilityOverrides" /* ModelCapabilityOverrides */);
    const modelId = describeModelId(model);
    const modelFamily = resolveModelCapabilityOverrideField(capabilityOverrides, model?.id, "family", (value) => normalizeModelFamilyAlias(value) !== void 0, (value) => {
      const description = typeof value === "string" ? JSON.stringify(value.slice(0, 40)) : typeof value;
      this._logService.warn(`[Copilot:${plan.sessionId}] Ignoring invalid 'family' capability override ${description} for '${modelId}'; expected a model id of at most 128 characters`);
    });
    const availableToolsOverride = resolveModelCapabilityOverrideField(capabilityOverrides, model?.id, "availableTools", (value) => normalizeToolFilterPatterns(value) !== void 0, () => {
      this._logService.warn(`[Copilot:${plan.sessionId}] Ignoring unusable 'availableTools' capability override for '${modelId}'; expected an array of tool patterns`);
    });
    const excludedToolsOverride = resolveModelCapabilityOverrideField(capabilityOverrides, model?.id, "excludedTools", (value) => normalizeToolFilterPatterns(value) !== void 0, () => {
      this._logService.warn(`[Copilot:${plan.sessionId}] Ignoring unusable 'excludedTools' capability override for '${modelId}'; expected an array of tool patterns`);
    });
    const availableTools = getToolFilterOverride(availableToolsOverride, "availableTools", modelId, this._logService, plan.sessionId);
    const excludedTools = getToolFilterOverride(excludedToolsOverride, "excludedTools", modelId, this._logService, plan.sessionId);
    const sdkAvailableTools = toSdkToolFilterPatterns(availableTools);
    const configuredSdkExcludedTools = plan.isEphemeral ? [...toSdkToolFilterPatterns(excludedTools) ?? [], ...EPHEMERAL_DISABLED_COPILOT_TOOLS] : toSdkToolFilterPatterns(excludedTools);
    const clientToolNames = filterClientToolNames(clientToolNamesFromSnapshot(plan.snapshot), availableTools, excludedTools);
    const sdkExcludedTools = clientToolNames.has(SEMANTIC_SEARCH_TOOL_NAME) ? configuredSdkExcludedTools : [.../* @__PURE__ */ new Set([...configuredSdkExcludedTools ?? [], `builtin:${SEMANTIC_SEARCH_TOOL_NAME}`])];
    const modelCapabilitiesOverride = resolveModelCapabilityOverrideField(capabilityOverrides, model?.id, "modelCapabilities", (value) => isObject(value), () => {
      this._logService.warn(`[Copilot:${plan.sessionId}] Ignoring invalid 'modelCapabilities' capability override for '${modelId}'; expected an object`);
    });
    const modelCapabilities = getModelCapabilitiesOverride(modelCapabilitiesOverride, modelId, this._logService, plan.sessionId);
    const effectiveModel = modelFamily ? { ...model, id: modelFamily } : model;
    if (modelFamily) {
      this._logService.info(`[Copilot:${plan.sessionId}] Model capability override: routing prompt for '${describeModelId(model)}' as family '${modelFamily}'`);
    }
    const toolSearchActive = this._configurationService.getRootValue(copilotCliConfigSchema, "toolSearchEnabled" /* ToolSearchEnabled */) === true && agentHostModelSupportsToolSearch(effectiveModel?.id) && clientToolNames.has(CLIENT_TOOL_SEARCH_REFERENCE_NAME);
    const toolSearchDeferThreshold = normalizeToolSearchDeferThreshold(this._configurationService.getRootValue(copilotCliConfigSchema, "toolSearchDeferThreshold" /* ToolSearchDeferThreshold */));
    const managedSettingsPermissions = this._managedSettingsService.permissions;
    const promptContext = {
      getSetting: (key) => this._configurationService.getRootValue(copilotCliConfigSchema, key),
      hasClientTool: (name) => clientToolNames.has(name),
      workspaceless: plan.workspaceless === true,
      toolSearchActive
    };
    const additionalDirectories = plan.additionalDirectories?.map((d) => d.fsPath);
    const systemMessage = agentHostPromptRegistry.resolveSystemMessageConfig(effectiveModel, promptContext);
    this._logService.info(`[Copilot:${plan.sessionId}] Resolved system message: ${describeSystemMessageConfig(systemMessage)}`);
    const additionalDisabledMcpServers = plan.isEphemeral ? [
      ...plugins.flatMap((plugin) => plugin.mcpServers.map((server) => server.name)),
      ...Object.keys(plan.snapshot.mcpServers)
    ] : void 0;
    const disabledMcpServers = disabledMcpServersSessionOption(plugins, plan.disabledRootMcpServers, additionalDisabledMcpServers);
    const mcpServers = plan.isEphemeral ? {} : { ...toSdkMcpServersFromConfigMap(plan.snapshot.mcpServers), ...toSdkMcpServers(explicitMcpServers) };
    if (this._logService.getLevel() <= 1 /* Trace */) {
      this._logService.trace(`[Copilot:${plan.sessionId}] System message config: ${JSON.stringify(systemMessage, (_key, value) => typeof value === "function" ? "[transform fn]" : value)}`);
      const sortedUnique = (names) => [...new Set(names)].sort();
      this._logService.trace(`[Copilot:${plan.sessionId}] MCP launch projection: ${JSON.stringify({
        ephemeral: plan.isEphemeral === true,
        pluginDiscovery: sortedUnique(plugins.flatMap((plugin) => plugin.mcpServers.filter((server) => server.sdkRegistration === "pluginDiscovery").map((server) => server.name))),
        sessionConfig: sortedUnique(plugins.flatMap((plugin) => plugin.mcpServers.filter((server) => server.sdkRegistration === "sessionConfig").map((server) => server.name))),
        rootConfig: Object.keys(plan.snapshot.mcpServers).sort(),
        disabled: [...disabledMcpServers.disabledMcpServers ?? []].sort(),
        finalSessionConfig: Object.keys(mcpServers).sort()
      })}`);
    }
    return {
      ...byok,
      ...disabledMcpServers,
      clientName: AGENT_HOST_COPILOT_CLIENT_NAME,
      // Resume only: `_createSession` re-resolves the full effort for a create,
      // while a resumed session keeps the effort the runtime journaled unless
      // an override is configured.
      ...plan.kind === "resume" ? { reasoningEffort: resolveConfiguredReasoningEffortOverride(model, this._configurationService, this._logService, plan.sessionId) } : {},
      modelCapabilities,
      enableMcpApps: true,
      githubMcpToolConfig: { disableFormDeferral: true },
      enableFileHooks: true,
      enableConfigDiscovery: true,
      requestExtensions: false,
      // force-disable copilot extension management tools (otherwise enabled in experimental mode)
      onPermissionRequest: (request) => runtime.handlePermissionRequest(request),
      onUserInputRequest: (request, invocation) => runtime.handleUserInputRequest(request, invocation),
      onElicitationRequest: (context) => runtime.handleElicitationRequest(context),
      onMcpAuthRequest: (request, context) => runtime.handleMcpAuthRequest(request, context),
      hooks: toSdkHooks(pluginsWithoutDirs.flatMap((p) => p.hooks), {
        onPreToolUse: (input) => runtime.handlePreToolUse(input),
        onPostToolUse: (input) => runtime.handlePostToolUse(input),
        onUserPromptSubmitted: () => runtime.handleUserPromptSubmitted()
      }),
      mcpServers,
      onExitPlanModeRequest: (request, invocation) => runtime.handleExitPlanModeRequest(request, invocation),
      workingDirectory: plan.workingDirectory?.fsPath,
      customAgents,
      agent: plan.resolvedAgentName,
      skillDirectories,
      instructionDirectories,
      additionalDirectories,
      systemMessage,
      toolSearch: toolSearchActive ? { enabled: true, deferThreshold: toolSearchDeferThreshold } : { enabled: false },
      largeOutput: {
        maxSizeBytes: 8 * 1024
      },
      managedSettings: {
        permissions: managedSettingsPermissions
      },
      availableTools: sdkAvailableTools,
      excludedTools: sdkExcludedTools,
      pluginDirectories: coalesce(plugins.map((p) => p.pluginDir)).filter((d) => d.scheme === Schemas.file).map((d) => d.fsPath),
      tools: [...shellTools, ...runtime.createClientSdkTools(toolSearchActive), ...runtime.createServerSdkTools()],
      // Pass the GitHub token at the session level. The SDK's
      // client-level `gitHubToken` authenticates the CLI process,
      // but each session also needs its own token resolved into a
      // GitHub identity (login, Copilot plan, endpoints) to drive
      // model routing and quota — without this the session
      // errors with "Session was not created with authentication
      // info or custom provider" on first send. See #318693.
      gitHubToken: plan.githubToken,
      // Enable infinite sessions so the SDK provisions a workspace
      // directory (containing `plan.md`, `checkpoints/`, `files/`).
      // The workspace is required for plan mode to work — without
      // it, `rpc.plan.read()` returns `path: null` and the SDK
      // never emits `exit_plan_mode.requested`.
      infiniteSessions: { enabled: true },
      // Per-session remote export: the client-level `--remote` flag
      // (enableRemoteSessions) enables the CLI capability, but each
      // session must opt in via `remoteSession` to actually export
      // events. Without this, sessions default to "off".
      remoteSession: this._configurationService.getRootValue(platformRootSchema, AgentHostSessionSyncEnabledConfigKey) === true ? "export" : void 0,
      enableManagedSettings: true
    };
  }
};

CopilotSessionLauncher = __decorateClass([
  __decorateParam(0, IAgentConfigurationService),
  __decorateParam(1, IAgentHostManagedSettingsService),
  __decorateParam(2, IAgentHostTerminalManager),
  __decorateParam(3, ILogService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IByokLmProxyService),
  __decorateParam(6, IByokLmBridgeRegistry),
  __decorateParam(7, IAgentHostOTelService),
  __decorateParam(8, IAgentHostSessionOpenTelemetry)
], CopilotSessionLauncher);
export { disabledMcpServersSessionOption, isMcpServerExplicitlyProjected, toSdkReasoningEffort, clientToolNamesFromSnapshot, filterClientToolNames, toSdkClientToolName, toSdkToolFilterPatterns, isCopilotReasoningEffort, isContextTier, getCopilotSdkErrorCode, getErrorMessage2, shouldCreateEmptySessionAfterResumeError, isCustomAgentNotFoundError, getCopilotReasoningEffort, describeModelId, resolveConfiguredReasoningEffortOverride, resolveCopilotReasoningEffort, getModelCapabilitiesOverride, normalizeToolFilterPatterns, getToolFilterOverride, getCopilotContextTier, resolveByokSessionConfig, ThinkingLevelConfigKey, ContextSizeConfigKey, ContextTierConfigKey, ReasoningEfforts, ContextTiers, AGENT_HOST_COPILOT_CLIENT_NAME, RESUMABLE_HISTORY_ABSENT_PATTERNS, TOOL_FILTER_SOURCE_WILDCARDS, CopilotSessionLauncher };
