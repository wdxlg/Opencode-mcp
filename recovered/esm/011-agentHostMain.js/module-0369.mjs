// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexAgent.ts
import { extUriBiasedIgnorePathCase, isEqual2 } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";
import { AgentHostAutoApprovePolicyRestrictedConfigKey, AgentHostCodexMultiRootEnabledConfigKey, AgentHostGitHubMcpServerEnabledConfigKey, AgentHostMcpServersConfigKey, createSchema, platformRootSchema, platformSessionSchema, schemaProperty } from "./module-0057.mjs";
import { localize } from "./module-0012.mjs";
import { CODEX_DEFAULT_PERMISSIONS_PRESET, CODEX_PERMISSIONS_PRESETS, getCodexAutonomousSessionConfig } from "./module-0393.mjs";
import { getReasoningEffortDescription, getReasoningEffortLabel, resolveDefaultReasoningEffort } from "./module-0106.mjs";
import { basename, dirname, isAbsolute, join, normalize, resolve, sep } from "./module-0018.mjs";
import { AgentHostCodexAgentBinaryArgsEnvVar, AgentHostCodexAgentCodexHomeEnvVar, AgentHostCodexAgentSdkRootEnvVar } from "./module-0049.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0010.mjs";
import { AgentChatMigrationDeferred, AgentSession, CODEX_AGENT_PROVIDER_ID, resolveAgentChatContext, resolveAgentHostInstructions } from "./module-0048.mjs";
import { Emitter, Event } from "./module-0016.mjs";
import { observableValue } from "./module-0064.mjs";
import { DeferredPromise, Limiter, Sequencer, SequencerByKey, disposableTimeout, raceCancellationError, raceTimeout, retry } from "./module-0027.mjs";
import { CodexMcpInventory, buildCodexMcpReadResult, codexMcpListToInventory, codexMcpServersFromConfig, codexMcpToolsChanged, codexStartupErrorNeedsAuth, injectCodexMcpAuthTokens, inventoryToSdkServers, normalizeCodexMcpResourceUrl, toCodexMcpServerJson, translateCodexMcpStartupState } from "./module-0371.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0017.mjs";
import { MODEL_REFRESH_BASE_DELAY_MS, MODEL_REFRESH_MAX_ATTEMPTS, MODEL_REFRESH_MAX_DELAY_MS, modelRefreshBackoff } from "./module-0154.mjs";
import { CodexSessionMetadataStore } from "./module-0387.mjs";
import { CODEX_ACCOUNT_META_KEY, CODEX_ACCOUNT_SIGN_IN_REQUEST_KEY, CODEX_ACCOUNT_SIGN_OUT_REQUEST_KEY } from "./module-0370.mjs";
import { AgentSdkSetupChannel } from "./module-0316.mjs";
import { GITHUB_MCP_SERVER_NAME, resolveGitHubMcpServerConfiguration } from "./module-0306.mjs";
import { AHP_AUTH_REQUIRED, ProtocolError } from "./module-0056.mjs";
import { collaborationModeKind, migrateCodexPermissionValues, narrowAdditionalDirectories, narrowBoolean, narrowPersonality, narrowReasoningEffort, narrowReasoningSummary, narrowWebSearchMode, resolveCodexPermissions } from "./module-0394.mjs";
import { codexHooksToContainers, codexSelectedCapabilityRootCandidates, codexSkillsToContainers, discoverCodexWorkspaceAgents, discoverCodexWorkspaceInstructions } from "./module-0372.mjs";
import { IFileService, toFileOperationResult } from "./module-0128.mjs";
import { CodexClientCustomizationStore, codexAgentRoleToml, codexCustomizationConfig, codexMcpServersFromDefinitions, codexMcpServersFromPlugins, codexPluginMcpServerSources, codexSkillCapabilityRoots, codexSkillRootsFromPlugins, parsedPluginChildren } from "./module-0373.mjs";
import { isCustomizationSdkEligible, resolveCustomizationEnablement, targetForMcpServer } from "./module-0176.mjs";
import { agentHostCustomizationConfigSchema } from "./module-0105.mjs";
import { createPricingMetaFromBilling, normalizeCAPIBilling } from "./module-0133.mjs";
import { CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID, createAgentModelGroupMeta, createAgentModelSourceMeta } from "./module-0325.mjs";
import { CancellationError } from "./module-0002.mjs";
import { buildCodexLaunchConfig, buildCodexResumeParams } from "./module-0388.mjs";
import { CodexAppServerClient, JsonRpcError, transportFromChildProcess } from "./module-0376.mjs";
import { createCodexSessionMapState, extractUserInputText, finalizeCodexTurnMapState, mapAgentMessageDelta, mapCommandExecutionOutputDelta, mapFileChangeOutputDelta, mapFileChangePatchUpdated, mapItemCompleted, mapItemStarted, mapMcpToolCallProgress, mapReasoningSummaryPartAdded, mapReasoningSummaryTextDelta, mapReasoningTextDelta, mapTokenUsageModelCallCompleted, mapTokenUsageUpdated, mapTurnCompleted, mapTurnStarted } from "./module-0381.mjs";
import { SessionMcpDiscovery } from "./module-0310.mjs";
import { IAgentHostCustomizationEnablementService, targetForUnownedMcpServer } from "./module-0175.mjs";
import { getServerToolDisplay } from "./module-0236.mjs";
import { buildUserInputRequest, emptyUserInputResponse, userInputResponseFromAnswers } from "./module-0384.mjs";
import { generateUuid } from "./module-0042.mjs";
import { buildElicitationRequest2, cancelledElicitationResponse, declinedElicitationResponse, elicitationResponseFromAnswers } from "./module-0374.mjs";
import { buildDefaultChatUri, chatStorageUri, createErrorResponsePart, isDefaultChatUri, parseRequiredSessionUriFromChatUri, withSessionWorkspaceless } from "./module-0047.mjs";
import { codexAccountRateLimitFromResponse, codexAccountStateFromResponse } from "./module-0391.mjs";
import { CodexProfileImageStore, fetchCodexProfileImage } from "./module-0392.mjs";
import { ActiveClientToolSet } from "./module-0158.mjs";
import { PendingRequestRegistry } from "./module-0255.mjs";
import { unwrapShellInvocation } from "./module-0380.mjs";
import { formatGuardianDenialNotification, summarizeGuardianReviewAction, toGuardianAssessmentEventJson } from "./module-0395.mjs";
import { computeFolderPickerDecisionForRoots } from "./module-0309.mjs";
import { codexDirectoryHasHooks } from "./module-0375.mjs";
import { planForkedTurnIdMap, resolveForkBoundary } from "./module-0382.mjs";
import { StopWatch } from "./module-0015.mjs";
import { parseLeadingSlashCommand } from "./module-0257.mjs";
import { CODEX_COMPACT_SLASH_COMMAND } from "./module-0396.mjs";
import { resolveCodexInput } from "./module-0383.mjs";
import { extractForwardedErrorInfo } from "./module-0278.mjs";
import { replayThreadToTurns } from "./module-0386.mjs";
import { THREAD_LIST_MAX_PAGES, collectThreadListPages } from "./module-0389.mjs";
import { codexDelegationDisplayText } from "./module-0379.mjs";
import { readCodexRolloutMetadata } from "./module-0390.mjs";
import { parsePlugin } from "./module-0126.mjs";
import { McpCustomizationController } from "./module-0163.mjs";
import { isCustomizationEnabled } from "./module-0157.mjs";
import { fetchResourceMetadata } from "./module-0181.mjs";
import { isChatAction } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { ICopilotApiService } from "./module-0168.mjs";
import { ICodexProxyService } from "./module-0377.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";
import { IAgentHostCheckpointService } from "./module-0131.mjs";
import { IAgentSdkDownloader } from "./module-0312.mjs";
import { IProductService } from "./module-0173.mjs";
import { IAgentPluginManager } from "./module-0135.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";
import { IAgentHostProxyResolver } from "./module-0140.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { IAgentHostOTelService } from "./module-0137.mjs";
import { IAgentHostSessionTitleSignal } from "./module-0177.mjs";
import { IAgentHostWorktreeIsolation } from "./module-0165.mjs";
import { ISessionDataService } from "./module-0139.mjs";


// src/vs/platform/agentHost/node/codex/codexAgent.ts
import { spawn as spawn4 } from "child_process";

import * as fs11 from "fs";

import * as os6 from "os";


// src/vs/platform/agentHost/node/codex/codexAgent.ts
var CLIENT_INFO = {
  name: "vscode_agent_host",
  title: "VS Code Agent Host",
  // The codex `clientInfo.version` is informational. Hardcoded to a
  // non-empty placeholder; bumping it isn't required when our code
  // changes.
  version: "0.1.0"
};

var CODEX_DESKTOP_ROLLOUT_PREFIX_LENGTH = 16 * 1024;

var CODEX_DESKTOP_ROLLOUT_PREFIX_CONCURRENCY = 8;

var CODEX_COLD_SESSION_READ_CONCURRENCY = 8;

var CODEX_STARTUP_ACCOUNT_PROBE_TIMEOUT_MS = 3e4;

var CODEX_DESKTOP_WORKSPACE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

var CODEX_DESKTOP_SESSION_META_PATTERN = /"type"\s*:\s*"session_meta".*"payload"\s*:\s*\{[^}]*"originator"\s*:\s*"Codex Desktop"/s;

function isCodexDesktopGeneratedWorkspace(cwd3, userHome) {
  const relativePath2 = extUriBiasedIgnorePathCase.relativePath(userHome, URI.file(cwd3));
  const segments = relativePath2?.split("/");
  return segments?.length === 4 && segments[0].toLowerCase() === "documents" && segments[1].toLowerCase() === "codex" && CODEX_DESKTOP_WORKSPACE_DATE_PATTERN.test(segments[2]) && segments[3].length > 0;
}

var CODEX_THINKING_LEVEL_KEY = "thinkingLevel";

var USER_AGENT_PREFIX4 = "vscode_codex";

var CODEX_SETUP_DOCS_URL = "https://learn.chatgpt.com/codex/auth";

var CODEX_SIGN_IN_PROVIDER_NAME = "ChatGPT";

var CODEX_REASONING_EFFORTS = ["minimal", "low", "medium", "high"];

var CODEX_MCP_APP_CAPABILITIES = {
  serverTools: { listChanged: true },
  serverResources: {}
};

var MCP_TOOL_APPROVAL_QUESTION_ID_PREFIX = "mcp_tool_call_approval_";

var MCP_TOOL_APPROVAL_ANSWER_ALLOW = "Allow";

var MCP_TOOL_APPROVAL_ANSWER_DECLINE = "__codex_mcp_decline__";

var CODEX_RESPONSES_ENDPOINT = "/responses";

var CODEX_COPILOT_MODEL_PROVIDER = "vscode-proxy";

var CODEX_COPILOT_MODEL_GROUP = "copilot";

var CODEX_OPENAI_MODEL_PROVIDER = "openai";

var CODEX_MODEL_SELECTION_PREFIX = "@provider=";

function toCodexModelSelectionId(modelProvider, modelId) {
  return `${CODEX_MODEL_SELECTION_PREFIX}${encodeURIComponent(modelProvider)}:${encodeURIComponent(modelId)}`;
}

function parseCodexModelSelection(selection) {
  if (!selection.id.startsWith(CODEX_MODEL_SELECTION_PREFIX)) {
    return { modelProvider: CODEX_COPILOT_MODEL_PROVIDER, modelId: selection.id };
  }
  const separator = selection.id.indexOf(":", CODEX_MODEL_SELECTION_PREFIX.length);
  if (separator < CODEX_MODEL_SELECTION_PREFIX.length) {
    return { modelProvider: CODEX_COPILOT_MODEL_PROVIDER, modelId: selection.id };
  }
  try {
    return {
      modelProvider: decodeURIComponent(selection.id.slice(CODEX_MODEL_SELECTION_PREFIX.length, separator)),
      modelId: decodeURIComponent(selection.id.slice(separator + 1))
    };
  } catch {
    return { modelProvider: CODEX_COPILOT_MODEL_PROVIDER, modelId: selection.id };
  }
}

function createCodexModeSchema() {
  const base = platformSessionSchema.definition["mode" /* Mode */].protocol;
  const kept = (base.enum ?? []).flatMap((value, index) => value === "autopilot" ? [] : [index]);
  return schemaProperty({
    ...base,
    enum: kept.map((index) => base.enum[index]),
    enumLabels: base.enumLabels && kept.map((index) => base.enumLabels[index]),
    enumDescriptions: base.enumDescriptions && kept.map((index) => base.enumDescriptions[index])
  });
}

var codexSessionConfigSchema = createSchema({
  ["codex.permissionsPreset" /* PermissionsPreset */]: schemaProperty({
    type: "string",
    title: localize(2412, null),
    description: localize(2419, null),
    enum: [...CODEX_PERMISSIONS_PRESETS],
    enumLabels: [
      localize(2415, null),
      localize(2413, null),
      localize(2417, null)
    ],
    enumDescriptions: [
      localize(2416, null),
      localize(2414, null),
      localize(2418, null)
    ],
    default: CODEX_DEFAULT_PERMISSIONS_PRESET,
    sessionMutable: true
  }),
  ["codex.approvalPolicy" /* ApprovalPolicy */]: schemaProperty({
    type: "string",
    title: localize(2400, null),
    description: localize(2407, null),
    enum: ["never", "on-request", "untrusted"],
    enumLabels: [
      localize(2401, null),
      localize(2403, null),
      localize(2405, null)
    ],
    enumDescriptions: [
      localize(2402, null),
      localize(2404, null),
      localize(2406, null)
    ],
    default: "on-request",
    sessionMutable: true
  }),
  ["codex.sandboxMode" /* SandboxMode */]: schemaProperty({
    type: "string",
    title: localize(2434, null),
    description: localize(2441, null),
    enum: ["read-only", "workspace-write", "danger-full-access"],
    enumLabels: [
      localize(2437, null),
      localize(2439, null),
      localize(2435, null)
    ],
    enumDescriptions: [
      localize(2438, null),
      localize(2440, null),
      localize(2436, null)
    ],
    default: "workspace-write",
    sessionMutable: true
  }),
  ["codex.webSearchMode" /* WebSearchMode */]: schemaProperty({
    type: "string",
    title: localize(2442, null),
    description: localize(2446, null),
    enum: ["disabled", "cached", "live"],
    enumLabels: [
      localize(2444, null),
      localize(2443, null),
      localize(2445, null)
    ],
    default: "disabled",
    sessionMutable: false
  }),
  ["codex.modelReasoningEffort" /* ModelReasoningEffort */]: schemaProperty({
    type: "string",
    title: localize(2408, null),
    description: localize(2409, null),
    enum: [...CODEX_REASONING_EFFORTS],
    enumLabels: CODEX_REASONING_EFFORTS.map(getReasoningEffortLabel),
    enumDescriptions: CODEX_REASONING_EFFORTS.map((effort) => getReasoningEffortDescription(effort) ?? ""),
    default: "medium",
    sessionMutable: true
  }),
  ["mode" /* Mode */]: createCodexModeSchema(),
  ["codex.personality" /* Personality */]: schemaProperty({
    type: "string",
    title: localize(2420, null),
    description: localize(2427, null),
    enum: ["none", "friendly", "pragmatic"],
    enumLabels: [
      localize(2423, null),
      localize(2421, null),
      localize(2425, null)
    ],
    enumDescriptions: [
      localize(2424, null),
      localize(2422, null),
      localize(2426, null)
    ],
    default: "none",
    sessionMutable: true
  }),
  ["codex.reasoningSummary" /* ReasoningSummary */]: schemaProperty({
    type: "string",
    title: localize(2428, null),
    description: localize(2433, null),
    enum: ["auto", "concise", "detailed", "none"],
    enumLabels: [
      localize(2429, null),
      localize(2430, null),
      localize(2431, null),
      localize(2432, null)
    ],
    default: "auto",
    sessionMutable: true
  }),
  ["codex.additionalDirectories" /* AdditionalDirectories */]: schemaProperty({
    type: "array",
    title: localize(2397, null),
    description: localize(2399, null),
    items: { type: "string", title: localize(2398, null) },
    enumDynamic: true,
    default: [],
    sessionMutable: true
  }),
  ["codex.networkAccessEnabled" /* NetworkAccessEnabled */]: schemaProperty({
    type: "boolean",
    title: localize(2410, null),
    description: localize(2411, null),
    default: false,
    sessionMutable: true
  }),
  ["permissions" /* Permissions */]: platformSessionSchema.definition["permissions" /* Permissions */]
});

var codexVisibleSessionConfigSchema = createSchema({
  ["mode" /* Mode */]: codexSessionConfigSchema.definition["mode" /* Mode */],
  ["codex.permissionsPreset" /* PermissionsPreset */]: codexSessionConfigSchema.definition["codex.permissionsPreset" /* PermissionsPreset */],
  ["permissions" /* Permissions */]: platformSessionSchema.definition["permissions" /* Permissions */]
});

var codexSessionConfigDefaults = {
  ["codex.permissionsPreset" /* PermissionsPreset */]: CODEX_DEFAULT_PERMISSIONS_PRESET,
  ["codex.approvalPolicy" /* ApprovalPolicy */]: "on-request",
  ["codex.sandboxMode" /* SandboxMode */]: "workspace-write",
  ["codex.webSearchMode" /* WebSearchMode */]: "disabled",
  ["codex.modelReasoningEffort" /* ModelReasoningEffort */]: "medium",
  ["codex.additionalDirectories" /* AdditionalDirectories */]: [],
  ["codex.networkAccessEnabled" /* NetworkAccessEnabled */]: false,
  ["mode" /* Mode */]: "interactive",
  ["codex.personality" /* Personality */]: "none",
  ["codex.reasoningSummary" /* ReasoningSummary */]: "auto"
};

function distinctAbsolutePaths(paths) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const path of paths) {
    const normalized = normalize(path);
    const key = filesystemPathComparisonKey(normalized);
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }
  return result;
}

function distinctWorkingDirectories(directories) {
  if (!directories) {
    return void 0;
  }
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const directory of directories) {
    const path = normalize(directory.fsPath);
    const key = filesystemPathComparisonKey(path);
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(directory);
    }
  }
  return result.length > 0 ? result : void 0;
}

function filesystemPathComparisonKey(path) {
  if (!isAbsolute(path)) {
    return void 0;
  }
  const resource = extUriBiasedIgnorePathCase.removeTrailingPathSeparator(URI.file(path));
  return extUriBiasedIgnorePathCase.getComparisonKey(resource);
}

var CodexPrewarmTtlMs = 6e4;

function toRolloutModelSelection(model) {
  return model ? { id: toCodexModelSelectionId(model.modelProvider, model.modelId) } : void 0;
}

function toRolloutTurnModels(metadata) {
  if (!metadata || metadata.modelsByTurnId.size === 0) {
    return void 0;
  }
  return new Map([...metadata.modelsByTurnId].map(([turnId, model]) => [turnId, { id: toCodexModelSelectionId(model.modelProvider, model.modelId) }]));
}

var CodexConnectionReplacedError = class extends Error {
  constructor(message = "Codex app-server was replaced during a thread operation") {
    super(message);
  }
};

var CodexSdkPackage = {
  id: "codex",
  displayName: "Codex",
  devOverrideEnvVar: AgentHostCodexAgentSdkRootEnvVar,
  hasSeparateMuslLinuxPackage: false
};

function dynamicToolResponseFromResult(result) {
  const contentItems = [];
  for (const c of result.content ?? []) {
    if (c.type === "text" /* Text */) {
      contentItems.push({ type: "inputText", text: c.text });
    }
  }
  if (contentItems.length === 0) {
    const summary = typeof result.pastTenseMessage === "string" && result.pastTenseMessage.length > 0 ? result.pastTenseMessage : result.success ? "Tool completed with no output." : "Tool failed with no output.";
    contentItems.push({ type: "inputText", text: summary });
  }
  return { contentItems, success: result.success };
}

function toolsSignature(tools) {
  if (!tools || tools.length === 0) {
    return "";
  }
  return tools.map((t) => `${t.name}\0${t.description ?? ""}\0${JSON.stringify(t.inputSchema ?? null)}`).sort().join("");
}

function mcpServersSignature(servers) {
  const names = Object.keys(servers).sort();
  return names.map((name) => `${name}\0${JSON.stringify(servers[name])}`).join("");
}

function encodeCodexChat(chat) {
  return JSON.stringify(chat);
}

function decodeCodexChat(data) {
  if (data === void 0) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed.sessionId === "string") {
      return parsed;
    }
  } catch {
  }
  return void 0;
}

var CodexActiveClientHandle = class {
  constructor(_resolveSession, clientId, displayName, _onToolsSet, _syncCustomizations, _removeCustomizations) {
    this._resolveSession = _resolveSession;
    this.clientId = clientId;
    this.displayName = displayName;
    this._onToolsSet = _onToolsSet;
    this._syncCustomizations = _syncCustomizations;
    this._removeCustomizations = _removeCustomizations;
    this._tools = [];
    this._customizations = [];
    this._customizationsRevision = 0;
  }
  get tools() {
    return this._tools;
  }
  set tools(tools) {
    this._tools = tools;
    this._resolveSession()?.clientToolSet.set(this.clientId, tools);
    this._onToolsSet(tools);
  }
  get customizations() {
    return this._customizations;
  }
  set customizations(customizations) {
    this._customizations = customizations;
    const revision = ++this._customizationsRevision;
    const session = this._resolveSession();
    if (session) {
      this._syncCustomizations(session, customizations, () => revision === this._customizationsRevision);
    }
  }
  /** Cache customizations whose initial async sync was awaited by the creator. */
  commitCustomizations(customizations) {
    this._customizations = customizations;
    this._customizationsRevision++;
  }
  remove() {
    this._customizationsRevision++;
    const session = this._resolveSession();
    if (session) {
      session.clientToolSet.delete(this.clientId);
      this._removeCustomizations(session, this._customizations);
    }
  }
};

function narrowFileChangeDecision(decision) {
  switch (decision) {
    case "accept":
    case "acceptForSession":
    case "decline":
    case "cancel":
      return decision;
    default:
      return "decline";
  }
}

var CodexAgent = class extends Disposable {
  constructor(_logService, _copilotApiService, _codexProxyService, _configurationService, _gitHubEndpointService, _checkpointService, _agentSdkDownloader, _productService, _pluginManager, _fileService, _environmentService, _proxyResolver, _instantiationService, _otelService, _customizationEnablementService, sessionTitleSignal, worktree, _sessionDataService) {
    super();
    this._logService = _logService;
    this._copilotApiService = _copilotApiService;
    this._codexProxyService = _codexProxyService;
    this._configurationService = _configurationService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._checkpointService = _checkpointService;
    this._agentSdkDownloader = _agentSdkDownloader;
    this._productService = _productService;
    this._pluginManager = _pluginManager;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._proxyResolver = _proxyResolver;
    this._instantiationService = _instantiationService;
    this._otelService = _otelService;
    this._customizationEnablementService = _customizationEnablementService;
    this._sessionDataService = _sessionDataService;
    this.id = CODEX_AGENT_PROVIDER_ID;
    this._onDidChatProgress = this._register(new Emitter());
    this.onDidChatProgress = this._onDidChatProgress.event;
    this._onDidMaterializeChat = this._register(new Emitter());
    this.onDidMaterializeChat = this._onDidMaterializeChat.event;
    /** Codex's peer-chat backing blob never changes after creation, so this never fires. */
    this.onDidChangeChatData = Event.None;
    /**
     * Codex subagent spawns are detected from the `subagent_started` signal on
     * {@link onDidChatProgress} (see {@link SubagentChatSignal}), so the agent
     * never fires this membership channel itself.
     */
    this.onDidSpawnChat = Event.None;
    this._onMcpNotification = this._register(new Emitter());
    this.onMcpNotification = this._onMcpNotification.event;
    this._models = observableValue(this, []);
    this.models = this._models;
    this._desktopThreadIds = /* @__PURE__ */ new Set();
    this._desktopRolloutPrefixLimiter = this._register(new Limiter(CODEX_DESKTOP_ROLLOUT_PREFIX_CONCURRENCY));
    this._coldSessionReadLimiter = this._register(new Limiter(CODEX_COLD_SESSION_READ_CONCURRENCY));
    this._openAIAccountState = { usageSource: "openai", status: "unknown" };
    this._accountRefreshSequencer = new Sequencer();
    this._openAIAccountRateLimitRequest = 0;
    this._openAIAccountProfileImageRequest = 0;
    this._providerConfigurationValues = {};
    this._providerConfigurationWrite = Promise.resolve();
    this._providerConfigurationReady = false;
    /** Keyed by caller-facing sessionId (the URI host). */
    this._sessions = /* @__PURE__ */ new Map();
    /** Keyed by `${chat.toString()}\u0000${clientId}` — exact-chat, exact-client membership; no session- or sibling-level entries. */
    this._activeClientHandles = /* @__PURE__ */ new Map();
    /** Host-supplied chat URI to Codex session id routing. */
    this._sessionIdByChatUri = /* @__PURE__ */ new Map();
    /** Inverse map: codex threadId → caller-facing sessionId, for routing codex notifications back to sessions. */
    this._sessionIdByThreadId = /* @__PURE__ */ new Map();
    /** Managed directories retained by non-destructively released sessions. */
    this._releasedManagedWorkingDirectories = /* @__PURE__ */ new Map();
    /**
     * Chats currently registered under each host session's configuration
     * scope ({@link IAgentChatContext.configurationResource}), keyed by the
     * scope's URI string. Used purely to detect when the last chat for a
     * scope has been disposed so the scope's managed working directory (if
     * any) can be reclaimed — Agent Host owns chat roles, so Codex never
     * infers "this is the default chat" here, only bare membership.
     */
    this._configScopeChats = /* @__PURE__ */ new Map();
    /**
     * Inverse of {@link _configScopeChats}: the exact scope key a chat was
     * registered under, keyed by chat URI string. Recorded at track time so
     * untracking always agrees with the original registration even when a
     * chat's runtime binding (its backing thread id) differs from the scope
     * it was created under — e.g. a peer chat backed by its own thread.
     */
    this._configScopeByChat = /* @__PURE__ */ new Map();
    /**
     * Live subagent (collab-agent) child threads, keyed by the child codex
     * thread id. Populated when a parent session's `spawnAgent` collab tool
     * call completes (carrying the child `receiverThreadIds`); the child's
     * subsequent `turn/*` and `item/*` notifications route here instead of
     * {@link _sessionIdByThreadId}. Removed on the child's `turn/completed`.
     */
    this._subagentsByThreadId = /* @__PURE__ */ new Map();
    this._mcpInventory = new CodexMcpInventory();
    this._mcpPublisherSessionIdByConfiguration = /* @__PURE__ */ new Map();
    this._publishedMcpTopLevelIdsByConfiguration = /* @__PURE__ */ new Map();
    this._customizationReconcileSequencers = /* @__PURE__ */ new WeakMap();
    this._directoryCustomizationSequencers = /* @__PURE__ */ new WeakMap();
    this._skillExtraRootsSequencer = new Sequencer();
    this._sessionMcpDiscoveries = /* @__PURE__ */ new Map();
    this._pendingMcpStartupStatuses = /* @__PURE__ */ new Map();
    /**
     * OAuth bearer tokens acquired for auth-gated http MCP servers, keyed by
     * the server's {@link normalizeCodexMcpResourceUrl | normalized URL}.
     * Populated by {@link handleAuthenticationToken} after the workbench
     * completes the sign-in, then injected into the per-thread `http_headers`
     * by {@link _buildSessionMcpServers}. Process-global: a token for a given
     * server URL applies to every session/thread that uses it (codex runs one
     * shared app-server).
     */
    this._mcpAuthTokens = /* @__PURE__ */ new Map();
    /**
     * Association from a normalized OAuth `resource` (what the workbench
     * authenticates) to the normalized MCP server URL(s) it unlocks. RFC 9728
     * discovery can return a `resource` that differs from the configured server
     * URL (e.g. root `https://host/` for a `https://host/mcp` endpoint), so the
     * token the workbench pushes back is keyed by the resource, not the server
     * URL. Recorded in {@link _surfaceMcpAuthRequired} at discovery time and
     * read by {@link handleAuthenticationToken} to route the token to the right
     * server(s).
     */
    this._mcpAuthServerUrlsByResource = /* @__PURE__ */ new Map();
    this._githubAuthenticationGeneration = 0;
    this._githubMcpServerEnabled = true;
    /**
     * Whether the user has explicitly entered a Codex flow in this host process.
     * Provider registration, authentication replay, and ambient session listing
     * must not start the app-server: doing so can use a shared ChatGPT login and
     * contact OpenAI before the user selects Codex.
     */
    this._activated = false;
    this._isShuttingDown = false;
    this._connection = { kind: "idle" };
    this._connectionGeneration = 0;
    /** Makes cleanup idempotent across shutdown and connection-loss races. */
    this._disposedConnections = /* @__PURE__ */ new WeakSet();
    /** Serializes persistent startup behind the one-off account probe. */
    this._startupAccountProbe = new DeferredPromise();
    /** Cancels startup before a partially initialized one-off process can outlive this agent. */
    this._startupAccountProbeCancellation = this._register(new CancellationTokenSource());
    /** One-off account/catalogue actions share one process at a time. */
    this._onDemandConnectionSequencer = new Sequencer();
    /** Orders create/release/dispose so one exact chat cannot race its own backing lifecycle. */
    this._chatLifecycleSequencer = new SequencerByKey();
    this._onDidDiscoverChats = this._register(new Emitter());
    this.onDidDiscoverChats = this._onDidDiscoverChats.event;
    this._chatDiscoveryRequested = false;
    this._modelRefreshSequencer = new Sequencer();
    /**
     * Bounded retry for transient Copilot catalog failures. Without this, a
     * failed request triggered by sign-in leaves the picker stale until another
     * external refresh trigger or a full restart.
     */
    this._modelRefreshMaxAttempts = MODEL_REFRESH_MAX_ATTEMPTS;
    this._modelRefreshBaseDelayMs = MODEL_REFRESH_BASE_DELAY_MS;
    this._modelRefreshMaxDelayMs = MODEL_REFRESH_MAX_DELAY_MS;
    this._startupAccountProbeTimeoutMs = CODEX_STARTUP_ACCOUNT_PROBE_TIMEOUT_MS;
    this._modelRefreshRetry = this._register(new MutableDisposable());
    this._skillHookCustomizationRefresh = this._register(new MutableDisposable());
    /** Invalidates retries that belong to an older Copilot token or endpoint. */
    this._modelCatalogGeneration = 0;
    this._copilotModels = [];
    this._codexModels = [];
    // ---- Chat surface ------------------------------------------------------
    //
    // Codex supports multiple chats per session, and every one of them — the
    // chat a session is provisioned with as much as any later one, fresh or
    // forked — is created through the one `createChat` seam and backed by its
    // own top-level Codex thread bound to the concrete chat URI AH supplies.
    // While the owning session has no backing yet, the chat's runtime adopts the
    // session's own identity so every session-addressed call keeps resolving;
    // any further chat is identified by the thread it mints and reports it as a
    // `backingSession` so the orchestrator suppresses it from the top-level
    // session list. Addressed operations resolve only through an explicit
    // binding or transient host context.
    /**
     * The chat-addressed operation surface for the conversations within a
     * session. Creation is one method running one algorithm
     * ({@link _createChat}) for every form — fresh or forked
     * ({@link IAgentCreateChatOptions.fork}), a session's first chat or an
     * additional one — so there is no caller-visible chat classification and no
     * second creation entry point. The remaining methods operate on the concrete
     * chat URI AH has already bound to a runtime.
     */
    this.chats = {
      createChat: (chat, context, options) => {
        return this._chatLifecycleSequencer.queue(chat.toString(), () => this._createChat(chat, resolveAgentChatContext(context, chat), options));
      },
      disposeChat: (chat, context) => this._chatLifecycleSequencer.queue(chat.toString(), () => this._disposeChat(chat, context)),
      releaseChat: (chat, context) => this._chatLifecycleSequencer.queue(chat.toString(), () => this._releaseChat(chat, context)),
      sendMessage: (chat, prompt, workingDirectoriesOrDirectory, attachments, turnId, _senderClientId, clientTypeOrContext, context) => {
        const workingDirectories = Array.isArray(workingDirectoriesOrDirectory) ? workingDirectoriesOrDirectory : workingDirectoriesOrDirectory ? [workingDirectoriesOrDirectory] : void 0;
        const operationContext = context ?? (typeof clientTypeOrContext === "string" ? void 0 : clientTypeOrContext);
        return this._sendMessage(chat, prompt, attachments, turnId, workingDirectories, operationContext);
      },
      abort: (chat, context) => {
        return this._abort(chat, context);
      },
      getModel: (chat, context) => {
        const session = this._resolveConversationSession(chat, context);
        return session ? this._sessions.get(AgentSession.id(session))?.model : void 0;
      },
      changeModel: (chat, model, context) => {
        return this._changeModel(chat, model, context);
      },
      changeAgent: (chat, agent, context) => this._changeAgent(chat, agent, context),
      getMessages: (chat, context) => {
        return this._getChatMessages(chat, context);
      }
    };
    this._worktree = worktree;
    this._metadataStore = this._instantiationService.createInstance(CodexSessionMetadataStore);
    this._githubMcpServerEnabled = this._isGitHubMcpServerEnabled();
    this._publishAccountInfo({ status: "unknown" });
    this._register(sessionTitleSignal.onDidChangeSessionTitle(({ provider, session, conversationId, title }) => {
      if (provider === this.id) {
        this._otelService.emitSessionTitleChanged(conversationId, session.toString(), title);
      }
    }));
    this._register(this._gitHubEndpointService.onDidChange(() => this._handleGitHubEndpointChange()));
    this._register(this._customizationEnablementService.onDidChange((event) => {
      const affectedConfigurations = /* @__PURE__ */ new Map();
      for (const session of this._sessions.values()) {
        if (!event.sessions.includes(session.configurationResource.toString())) {
          continue;
        }
        affectedConfigurations.set(session.configurationResource.toString(), session.configurationResource);
        const controller = session.mcpController;
        if (controller) {
          controller.applyAll(inventoryToSdkServers(this._mcpInventory.forThread(session.threadId)));
        }
        session.materializedMcpSig = void 0;
        if (session.firstTurnSent) {
          this._markSessionForReload(session);
        }
      }
      for (const configurationResource of affectedConfigurations.values()) {
        this._publishClientCustomizationsForConfiguration(configurationResource);
      }
      void this._refreshSkillExtraRoots();
    }));
    this._register(this._configurationService.onDidRootConfigChange(() => {
      const githubMcpServerEnabled = this._isGitHubMcpServerEnabled();
      if (this._githubMcpServerEnabled !== githubMcpServerEnabled) {
        this._githubMcpServerEnabled = githubMcpServerEnabled;
        for (const session of this._sessions.values()) {
          void this._reconcileMaterializedCustomizations(session);
        }
      }
      const signInRequest = this._configurationService.getRootConfigValues?.()[CODEX_ACCOUNT_SIGN_IN_REQUEST_KEY];
      if (typeof signInRequest === "string" && signInRequest !== this._lastSignInRequest) {
        this._lastSignInRequest = signInRequest;
        this._configurationService.updateRootConfig({ [CODEX_ACCOUNT_SIGN_IN_REQUEST_KEY]: void 0 });
        void this._signInToChatGPT(signInRequest);
      }
      const signOutRequest = this._configurationService.getRootConfigValues?.()[CODEX_ACCOUNT_SIGN_OUT_REQUEST_KEY];
      if (typeof signOutRequest === "string" && signOutRequest !== this._lastSignOutRequest) {
        this._lastSignOutRequest = signOutRequest;
        this._configurationService.updateRootConfig({ [CODEX_ACCOUNT_SIGN_OUT_REQUEST_KEY]: void 0 });
        void this._signOutOfChatGPT();
      }
      this._startModelRefreshWhenSdkIsLocal();
      this._queueProviderConfigurationWrite();
    }));
    this._sdkSetupChannel = this._register(new AgentSdkSetupChannel({
      id: this.id,
      sdkPackage: CodexSdkPackage,
      setupInfo: {
        setupDocsUrl: CODEX_SETUP_DOCS_URL,
        // ChatGPT sign-in is a control request the app server answers, so the
        // banner can start it in-window. An API key still has to be established
        // outside — hence the docs link alongside it.
        signInProviderName: CODEX_SIGN_IN_PROVIDER_NAME
      },
      isSdkLocal: () => this._isSdkResolvableWithoutDownload(),
      downloadSdk: async () => {
        await this._resolveSdkRoot();
      },
      restartChatDiscovery: () => this._restartChatDiscovery(),
      refreshModels: () => this.refreshModels()
    }, this._configurationService, this._agentSdkDownloader, this._logService));
    queueMicrotask(async () => {
      try {
        await this._probeAccountAtStartup();
      } finally {
        await this._startupAccountProbe.complete(void 0);
      }
    });
  }
  _setOpenAIAccountState(state, _publish = true) {
    const previousState = this._openAIAccountState;
    this._openAIAccountState = state;
    const sameChatGPTAccount = previousState.status === "signedIn" && previousState.authType === "chatgpt" && state.status === "signedIn" && state.authType === "chatgpt" && previousState.email === state.email;
    if (!sameChatGPTAccount) {
      this._openAIAccountRateLimit = void 0;
      this._openAIAccountRateLimitRequest++;
      this._openAIAccountProfileImage = void 0;
      void this._profileImageStore?.clear();
      this._openAIAccountProfileImageRequest++;
    }
    if (_publish) {
      this._publishAccountInfo(this._toAccountInfo(state));
    }
  }
  _publishAccountInfo(account) {
    this._configurationService.publishRootTransientValues?.({ [CODEX_ACCOUNT_META_KEY]: account });
  }
  async _signInToChatGPT(request) {
    const progressInterest = this._agentSdkDownloader.acquireDownloadProgressInterest(CodexSdkPackage);
    try {
      if (!await this._isSdkResolvableWithoutDownload()) {
        this._publishAccountInfo({ status: "downloading" });
      }
      await this._withOnDemandConnection(async (client, transient) => {
        const account = await this._refreshAccount(client, true, transient);
        if (account.status === "signedIn" && account.authType === "chatgpt") {
          return;
        }
        const loginCompleted = new DeferredPromise();
        let loginId;
        let earlyLoginCompletions = [];
        const completionListener = transient ? client.onNotification("account/login/completed", (params) => {
          if (loginId === void 0) {
            earlyLoginCompletions.push(params);
            return;
          }
          if (params.loginId !== loginId) {
            return;
          }
          void loginCompleted.complete(params);
        }) : void 0;
        try {
          const response = await client.request("account/login/start", { type: "chatgpt" });
          if (response.type !== "chatgpt") {
            return;
          }
          loginId = response.loginId;
          const earlyCompletion = earlyLoginCompletions.find((completion) => completion.loginId === loginId);
          earlyLoginCompletions = [];
          if (earlyCompletion) {
            await loginCompleted.complete(earlyCompletion);
          }
          if (this._openAIAccountState.status === "signedIn" && this._openAIAccountState.authType === "chatgpt") {
            this._publishAccountInfo(this._toAccountInfo(this._openAIAccountState));
            return;
          }
          this._publishAccountInfo({ ...this._toAccountInfo(this._openAIAccountState), authUrl: response.authUrl, authUrlNonce: request });
          if (transient) {
            const result = await Promise.race([
              loginCompleted.p,
              Event.toPromise(client.onExit).then((event) => {
                throw new Error(`Codex app-server exited during ChatGPT sign-in (code=${event.code}, signal=${event.signal})`);
              })
            ]);
            if (!result.success) {
              throw new Error(result.error ?? "ChatGPT sign-in failed");
            }
            await this._refreshAccount(client, true, true);
          }
        } finally {
          completionListener?.dispose();
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this._setOpenAIAccountState({ usageSource: "openai", status: "error", error: message });
    } finally {
      progressInterest.dispose();
    }
  }
  async _signOutOfChatGPT() {
    try {
      await this._withOnDemandConnection(async (client, transient) => {
        await client.request("account/logout", void 0);
        await this._refreshAccount(client, true, transient);
        if (!transient) {
          this._queueModelRefresh();
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this._setOpenAIAccountState({ usageSource: "openai", status: "error", error: message });
    }
  }
  _toAccountInfo(state) {
    return {
      status: state.status,
      email: state.authType === "chatgpt" ? state.email : void 0,
      planType: state.authType === "chatgpt" ? state.planType : void 0,
      profileImage: state.authType === "chatgpt" ? this._openAIAccountProfileImage : void 0,
      requiresOpenaiAuth: state.requiresOpenaiAuth,
      rateLimit: state.authType === "chatgpt" ? this._openAIAccountRateLimit : void 0
    };
  }
  async _resetSessionForModelProviderChange(session, modelProvider) {
    if (session.threadId === void 0) {
      return;
    }
    const oldThreadId = session.threadId;
    this._logService.info(`[Codex:${session.sessionId}] replacing thread ${oldThreadId} with a fresh ${modelProvider} thread`);
    this._removeThreadRouteIfOwned(oldThreadId, session.sessionId);
    this._mcpInventory.deleteThread(oldThreadId);
    session.threadId = void 0;
    this._applyMcpInventoryToSession(session);
    session.materializePromise = void 0;
    session.materializedToolsSig = void 0;
    session.materializedMcpSig = void 0;
    session.materializedCustomizationsSig = void 0;
    session.materializedModelProvider = void 0;
    session.needsResume = false;
    session.hostTurnIdByAppTurnId.clear();
    session.codexTurnIdByHostTurnId.clear();
    const connection = this._connection;
    if (connection.kind === "ready") {
      try {
        await connection.client.request("thread/unsubscribe", { threadId: oldThreadId });
      } catch (error) {
        this._logService.info(`[Codex:${oldThreadId}] thread/unsubscribe during model-provider change failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  // #region Auth
  getProtectedResources() {
    const copilotResource = this._gitHubEndpointService.getCopilotResource();
    return [
      { ...copilotResource, required: false },
      this._gitHubEndpointService.getRepoResource()
    ];
  }
  async authenticate(resource, token) {
    if (resource === this._gitHubEndpointService.getRepoResource().resource) {
      return true;
    }
    if (resource !== this._gitHubEndpointService.getCopilotResource().resource) {
      return false;
    }
    const normalizedToken = token || void 0;
    const generation = ++this._githubAuthenticationGeneration;
    const changed = this._githubToken !== normalizedToken;
    const gitHubMcpServerConfiguration = changed ? await this._resolveGitHubMcpServerConfiguration(normalizedToken) : this._gitHubMcpServerConfiguration;
    if (generation !== this._githubAuthenticationGeneration) {
      return true;
    }
    this._githubToken = normalizedToken;
    this._gitHubMcpServerConfiguration = gitHubMcpServerConfiguration;
    if (changed) {
      this._modelCatalogGeneration++;
    }
    if (changed && this._connection.kind === "ready" && this._connection.proxyHandle) {
      this._connection.proxyHandle.setToken(normalizedToken ?? "");
      this._queueModelRefresh();
    } else if (changed) {
      this._queueModelRefresh();
    }
    if (changed) {
      for (const session of this._sessions.values()) {
        await this._reconcileMaterializedCustomizations(session);
      }
    }
    this._logService.info(normalizedToken ? "[Codex] Auth token updated" : "[Codex] Auth token cleared");
    void this._refreshProviderConfiguration();
    return true;
  }
  _isGitHubMcpServerEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostGitHubMcpServerEnabledConfigKey) !== false;
  }
  async _resolveGitHubMcpServerConfiguration(token) {
    try {
      return await resolveGitHubMcpServerConfiguration(this._copilotApiService, token);
    } catch (error) {
      this._logService.warn(`[Codex] Failed to resolve the GitHub MCP server endpoint: ${error instanceof Error ? error.message : String(error)}`);
      return void 0;
    }
  }
  _handleGitHubEndpointChange() {
    this._githubAuthenticationGeneration++;
    this._modelCatalogGeneration++;
    this._githubToken = void 0;
    this._gitHubMcpServerConfiguration = void 0;
    if (this._connection.kind === "ready" && this._connection.proxyHandle) {
      this._connection.proxyHandle.setToken("");
    }
    this._queueModelRefresh();
    for (const session of this._sessions.values()) {
      void this._reconcileMaterializedCustomizations(session);
    }
  }
  /**
   * Receives a bearer token the workbench acquired for a protected resource
   * (the `authenticate` command is fanned out to every agent). If the
   * resource maps to one or more configured auth-gated http MCP servers
   * (via the association recorded at discovery time, or a direct URL match),
   * store the token per server URL (so {@link _buildSessionMcpServers} injects
   * it) and reconnect the affected threads so codex picks it up. This is the
   * codex end of the *same* OAuth mechanism the Copilot agent uses: the
   * workbench does the sign-in, the agent injects the resulting bearer.
   * Returns whether the token was consumed by an MCP server (the GitHub agent
   * token flows through {@link authenticate} instead).
   */
  async handleAuthenticationToken(params) {
    const normalizedResource = normalizeCodexMcpResourceUrl(params.resource);
    if (normalizedResource === void 0) {
      return false;
    }
    const serverUrls = new Set(this._mcpAuthServerUrlsByResource.get(normalizedResource) ?? []);
    if (this._isConfiguredHttpServerUrl(normalizedResource)) {
      serverUrls.add(normalizedResource);
    }
    if (serverUrls.size === 0) {
      return false;
    }
    let changed = false;
    for (const serverUrl of serverUrls) {
      if (this._mcpAuthTokens.get(serverUrl) !== params.token) {
        this._mcpAuthTokens.set(serverUrl, params.token);
        changed = true;
      }
    }
    if (!changed) {
      return true;
    }
    this._logService.info(`[Codex] stored MCP auth token for ${params.resource}; reconnecting affected sessions`);
    await this._reconnectSessionsForMcpAuth(serverUrls);
    return true;
  }
  /** Whether `normalizedUrl` is a currently-configured http MCP server (root config or any session's client plugins). */
  _isConfiguredHttpServerUrl(normalizedUrl) {
    if (Object.values(codexMcpServersFromConfig(this._configurationService.getRootValue(platformRootSchema, AgentHostMcpServersConfigKey))).some((server) => server.url !== void 0 && normalizeCodexMcpResourceUrl(server.url) === normalizedUrl)) {
      return true;
    }
    return [...this._sessions.values()].some(
      (session) => [...this._httpMcpServerUrls(session).values()].includes(normalizedUrl)
    );
  }
  /**
   * Reconnects every materialized session whose merged MCP servers include one
   * of `normalizedUrls` so codex re-reads `config.mcp_servers` with the
   * injected `Authorization` header. A thread that has not yet committed a
   * turn is restarted (`thread/start`, lossless); one with history is resumed
   * (`thread/resume` carries the same `config` field, loading history from the
   * rollout) on its next turn via {@link ICodexSession.needsResume}.
   */
  async _reconnectSessionsForMcpAuth(normalizedUrls) {
    for (const session of this._sessions.values()) {
      if (session.disposed || session.threadId === void 0) {
        continue;
      }
      if (![...this._httpMcpServerUrls(session).values()].some((url2) => normalizedUrls.has(url2))) {
        continue;
      }
      if (!session.firstTurnSent) {
        try {
          await this._restartThreadWithCurrentTools(session);
        } catch (err) {
          this._logService.warn(`[Codex:${session.sessionId}] reconnect after MCP auth failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else {
        this._markSessionForReload(session);
      }
    }
  }
  /**
   * {@link IAgent.refreshModels}. Coalesces onto an in-flight refresh — from
   * an account change or an earlier tick — rather than issuing a
   * second enumeration, and never rejects: {@link _refreshModels} logs and
   * applies its own stale-write guards on failure.
   */
  refreshModels() {
    if (this._isShuttingDown || this._store.isDisposed) {
      return Promise.resolve();
    }
    return this._modelsRefreshPromise ?? this._queueModelRefresh();
  }
  _queueModelRefresh(attempt = 0, generation = this._modelCatalogGeneration) {
    if (this._isShuttingDown || this._store.isDisposed) {
      return Promise.resolve();
    }
    const refreshPromise = this._modelRefreshSequencer.queue(() => this._refreshModels(attempt, generation)).finally(() => {
      if (this._modelsRefreshPromise === refreshPromise) {
        this._modelsRefreshPromise = void 0;
      }
    });
    this._modelsRefreshPromise = refreshPromise;
    return refreshPromise;
  }
  _ensureModelProviderAuthenticated(model) {
    const modelProvider = model ? parseCodexModelSelection(model).modelProvider : CODEX_COPILOT_MODEL_PROVIDER;
    if (modelProvider !== CODEX_COPILOT_MODEL_PROVIDER) {
      return;
    }
    const token = this._githubToken;
    if (!token) {
      throw new ProtocolError(
        AHP_AUTH_REQUIRED,
        "Authentication is required to use Codex",
        this.getProtectedResources()
      );
    }
  }
  _imageGenerationEnabledForModelProvider(modelProvider) {
    return modelProvider === CODEX_OPENAI_MODEL_PROVIDER && this._openAIAccountState.status === "signedIn" && this._openAIAccountState.authType === "chatgpt";
  }
  _defaultModel() {
    const models = this._models.get();
    const chosen = models[0];
    return chosen ? { id: chosen.id } : void 0;
  }
  _supportedModelOrUndefined(model) {
    if (model && this._models.get().some((m) => m.id === model.id)) {
      return model;
    }
    if (model) {
      this._logService.warn(`[Codex] Unknown model '${model.id}'`);
      return void 0;
    }
    return this._defaultModel();
  }
  async _resolveModel(session) {
    if (this._models.get().length === 0 && this._modelsRefreshPromise) {
      await this._modelsRefreshPromise;
    }
    const selected = this._supportedModelOrUndefined(session.model);
    if (selected) {
      session.model = selected;
      return selected;
    }
    throw new Error("Codex has no available models.");
  }
  _createReasoningEffortConfigSchema(supportedEfforts, declaredDefault, modelId) {
    if (!supportedEfforts?.length) {
      return void 0;
    }
    const efforts = supportedEfforts.map((option) => option.reasoningEffort);
    return {
      type: "object",
      properties: {
        [CODEX_THINKING_LEVEL_KEY]: {
          type: "string",
          title: localize(2395, null),
          description: localize(2394, null),
          default: resolveDefaultReasoningEffort(efforts, declaredDefault, modelId),
          enum: efforts,
          enumLabels: efforts.map(getReasoningEffortLabel),
          enumDescriptions: supportedEfforts.map((option) => option.description || getReasoningEffortDescription(option.reasoningEffort) || "")
        }
      }
    };
  }
  _getReasoningEffort(session, configResource) {
    const modelConfigEffort = narrowReasoningEffort(session.model?.config?.[CODEX_THINKING_LEVEL_KEY]);
    if (modelConfigEffort) {
      return modelConfigEffort;
    }
    const config = this._configurationService.getSessionConfigValues(configResource.toString());
    return narrowReasoningEffort(config?.["codex.modelReasoningEffort" /* ModelReasoningEffort */]) ?? codexSessionConfigDefaults["codex.modelReasoningEffort" /* ModelReasoningEffort */];
  }
  _readSessionConfig(configResource) {
    return codexSessionConfigSchema.validateOrDefault(
      this._configurationService.getSessionConfigValues(configResource.toString()),
      codexSessionConfigDefaults
    );
  }
  /**
   * Resolve the Codex security axes (approval policy, sandbox, reviewer) for a
   * live or restored session from its RAW persisted config values.
   *
   * The raw values are normalized through {@link migrateCodexPermissionValues}
   * (the same migration the restore path applies) before resolving, so the
   * axes we send to the app-server always match the preset the "Approvals" chip
   * displays. This matters for two legacy shapes:
   * - a session that persisted only `sandboxMode = 'read-only'` is preserved
   *   verbatim, so it is NOT silently escalated back to `workspace-write` on
   *   resume (the chip over-promises, but the session stays more locked down);
   * - a session that persisted `approvalPolicy = 'never'` + `workspace-write`
   *   (which the chip renders as "Default Permissions") is snapped onto the
   *   `default` preset's `on-request` policy so it actually prompts, instead of
   *   running commands unprompted while the chip claims it would ask.
   */
  _resolveSessionPermissions(configResource) {
    const rawValues = this._configurationService.getSessionConfigValues(configResource.toString());
    const defaults = {
      approvalPolicy: codexSessionConfigDefaults["codex.approvalPolicy" /* ApprovalPolicy */],
      sandboxMode: codexSessionConfigDefaults["codex.sandboxMode" /* SandboxMode */]
    };
    return resolveCodexPermissions(migrateCodexPermissionValues(rawValues, defaults), defaults);
  }
  _sandboxPolicy(session, config, mode) {
    if (mode === "danger-full-access") {
      return { type: "dangerFullAccess" };
    }
    const networkAccess = narrowBoolean(config["codex.networkAccessEnabled" /* NetworkAccessEnabled */]) ?? codexSessionConfigDefaults["codex.networkAccessEnabled" /* NetworkAccessEnabled */];
    if (mode === "read-only") {
      return { type: "readOnly", networkAccess: false };
    }
    const additionalDirectories = narrowAdditionalDirectories(config["codex.additionalDirectories" /* AdditionalDirectories */]) ?? [];
    const writableRoots = this._isMultiRootActive(session) ? distinctAbsolutePaths([
      ...this._runtimeWorkspaceRoots(session),
      ...additionalDirectories
    ]) : [
      ...session.workingDirectory ? [session.workingDirectory.fsPath] : [],
      ...additionalDirectories
    ];
    return {
      type: "workspaceWrite",
      writableRoots,
      networkAccess,
      excludeTmpdirEnvVar: false,
      excludeSlashTmp: false
    };
  }
  _turnStartOptions(session, modelId, developerInstructions, configResource = session.sessionUri) {
    const config = this._readSessionConfig(configResource);
    const { approvalPolicy, sandboxMode, approvalsReviewer } = this._resolveSessionPermissions(configResource);
    const sandboxPolicy = this._sandboxPolicy(session, config, sandboxMode);
    const runtimeWorkspaceRoots = this._isMultiRootActive(session) ? this._runtimeWorkspaceRoots(session) : sandboxPolicy.type === "workspaceWrite" ? sandboxPolicy.writableRoots : void 0;
    const effort = this._getReasoningEffort(session, configResource);
    const personality = narrowPersonality(config["codex.personality" /* Personality */]) ?? codexSessionConfigDefaults["codex.personality" /* Personality */];
    const summary = narrowReasoningSummary(config["codex.reasoningSummary" /* ReasoningSummary */]) ?? codexSessionConfigDefaults["codex.reasoningSummary" /* ReasoningSummary */];
    const mode = collaborationModeKind(config["mode" /* Mode */]);
    const collaborationMode = {
      mode,
      settings: { model: modelId, reasoning_effort: effort ?? null, developer_instructions: developerInstructions ?? null }
    };
    return {
      approvalPolicy,
      sandboxPolicy,
      approvalsReviewer,
      effort,
      personality,
      summary,
      collaborationMode,
      ...runtimeWorkspaceRoots ? { runtimeWorkspaceRoots } : {}
    };
  }
  _workingDirectories(session) {
    return session.workingDirectories ?? (session.workingDirectory ? [session.workingDirectory] : []);
  }
  _runtimeWorkspaceRoots(session) {
    return distinctAbsolutePaths(this._workingDirectories(session).map((directory) => directory.fsPath));
  }
  _isMultiRootActive(session) {
    return session.multiRootEnabled && (session.workingDirectories?.length ?? 0) > 1;
  }
  async _selectedCapabilityRoots(session) {
    const candidates = codexSelectedCapabilityRootCandidates(session.workingDirectories ?? []);
    const resolved = await Promise.all(candidates.map(async (candidate) => {
      try {
        const stat3 = await this._fileService.stat(URI.file(candidate.location.path));
        return stat3.isDirectory ? candidate : void 0;
      } catch (error) {
        const result = toFileOperationResult(error);
        if (result !== 1 /* FILE_NOT_FOUND */) {
          this._logService.warn(`[Codex] selected capability root metadata lookup failed: id=${candidate.id}, result=${result}`);
        }
        return void 0;
      }
    }));
    return resolved.filter((candidate) => candidate !== void 0);
  }
  async _buildCustomizationLaunch(session) {
    const plugins = this._enabledClientPlugins(session);
    const workspaceAgents = await discoverCodexWorkspaceAgents(this._workingDirectories(session), this._fileService);
    const customization = await codexCustomizationConfig(workspaceAgents.agents, plugins, session.agent, this._fileService);
    const config = {};
    if (customization.agentRoles.length > 0) {
      const root = session.customizationDirectory?.fsPath ?? await fs11.promises.mkdtemp(join(os6.tmpdir(), "vscode-agent-codex-customizations-"));
      const agentsDirectory = join(root, "agents");
      await fs11.promises.mkdir(agentsDirectory, { recursive: true });
      const agents = {};
      for (const [index, role] of customization.agentRoles.entries()) {
        const rolePath = join(agentsDirectory, `${index}.toml`);
        await fs11.promises.writeFile(rolePath, codexAgentRoleToml(role), "utf8");
        agents[role.name] = { description: role.description, config_file: rolePath };
      }
      config.agents = agents;
      session.customizationDirectory ??= URI.file(root);
    }
    const selectedCapabilityRoots = codexSkillCapabilityRoots(plugins).map((uri, index) => ({
      id: `client-plugin-skills-${index}-${uri.fsPath}`,
      location: { type: "environment", environmentId: "local", path: uri.fsPath }
    }));
    const signature = JSON.stringify({
      agent: session.agent?.uri,
      agentRoles: customization.agentRoles,
      developerInstructions: customization.developerInstructions,
      selectedCapabilityRoots: selectedCapabilityRoots.map((root) => root.location.path)
    });
    return {
      config,
      ...customization.developerInstructions ? { developerInstructions: customization.developerInstructions } : {},
      selectedCapabilityRoots,
      signature
    };
  }
  _enabledClientPlugins(session) {
    const { plugins, candidates, resolution } = this._resolveClientCustomizationEnablement(session);
    const enabled = [];
    for (const [index, plugin] of plugins.entries()) {
      const customization = resolution.customizations[index];
      if (plugin.parsed !== void 0 && customization.type === "plugin" /* Plugin */ && isCustomizationSdkEligible(resolution, candidates[index])) {
        const resolved = { ...plugin, customization };
        if (session.clientCustomizations.isEnabled(resolved)) {
          enabled.push(resolved);
        }
      }
    }
    return enabled;
  }
  _resolveClientCustomizationEnablement(session) {
    const plugins = session.clientCustomizations.plugins();
    const candidates = plugins.map((plugin) => ({
      ...plugin.synced.customization,
      ...plugin.parsed ? { children: parsedPluginChildren(plugin.parsed) } : {}
    }));
    const clientPlugins = /* @__PURE__ */ new Map();
    const childEnablement = /* @__PURE__ */ new Map();
    for (const plugin of plugins) {
      if (plugin.input !== void 0) {
        clientPlugins.set(plugin.input.uri, plugin.input);
        if (plugin.input.childEnablement !== void 0) {
          childEnablement.set(plugin.input.uri, plugin.input.childEnablement);
        }
      }
    }
    const resolution = resolveCustomizationEnablement(
      this._customizationEnablementService,
      session.configurationResource,
      candidates,
      childEnablement,
      clientPlugins
    );
    return { plugins, candidates, resolution };
  }
  async _refreshModels(attempt = 0, generation = this._modelCatalogGeneration) {
    if (this._isShuttingDown || this._store.isDisposed) {
      return;
    }
    this._modelRefreshRetry.clear();
    const [copilotError, sdkReady] = await Promise.all([this._refreshCopilotModels(), this._refreshCodexModels()]);
    if (generation !== this._modelCatalogGeneration || this._isShuttingDown || this._store.isDisposed) {
      return;
    }
    this._models.set([...this._copilotModels, ...this._codexModels], void 0);
    this._sdkSetupChannel.publishWith(sdkReady);
    if (!copilotError) {
      return;
    }
    if (attempt + 1 < this._modelRefreshMaxAttempts) {
      const delay = modelRefreshBackoff(attempt, this._modelRefreshBaseDelayMs, this._modelRefreshMaxDelayMs);
      this._logService.warn(`[Codex] Failed to refresh models (attempt ${attempt + 1}), retrying in ${delay}ms: ${copilotError.message}`);
      this._modelRefreshRetry.value = disposableTimeout(() => {
        if (generation === this._modelCatalogGeneration && !this._isShuttingDown && !this._store.isDisposed) {
          void this._queueModelRefresh(attempt + 1, generation);
        }
      }, delay);
      return;
    }
    this._logService.warn(`[Codex] Failed to refresh models after ${attempt + 1} attempts: ${copilotError.message}`);
  }
  /**
   * Re-read the authoritative catalog after an activated Codex provider's root
   * configuration changes, but only when asking is free — i.e. the SDK is
   * already on disk.
   *
   * Replaces a `~/.codex/auth.json` sniff that was wrong in both directions: it
   * missed API-key setups established through the environment, and claimed a
   * setup from a stale token file. Only the app server can answer whether this
   * user can run Codex without GitHub. The activation guard is the consent
   * boundary: authentication replay and ambient configuration changes alone do
   * not start the app-server.
   */
  _startModelRefreshWhenSdkIsLocal() {
    const allowSignedOutWhenUsable = this._configurationService.getRootValue(agentHostCustomizationConfigSchema, "allowSignedOutWhenUsable" /* AllowSignedOutWhenUsable */) === true;
    if (this._isShuttingDown || this._store.isDisposed || !this._activated || !allowSignedOutWhenUsable || this._codexModels.length > 0) {
      return;
    }
    queueMicrotask(async () => {
      if (this._isShuttingDown || this._store.isDisposed || !await this._isSdkResolvableWithoutDownload() || this._isShuttingDown || this._store.isDisposed) {
        return;
      }
      await this.refreshModels();
    });
  }
  async _refreshCopilotModels() {
    const token = this._githubToken;
    if (!token) {
      this._copilotModels = [];
      return void 0;
    }
    try {
      const userAgent2 = `${USER_AGENT_PREFIX4}/${this._productService.version}`;
      const all2 = await this._copilotApiService.models(token, { headers: { "User-Agent": userAgent2 }, suppressIntegrationId: true });
      if (this._githubToken !== token) {
        return void 0;
      }
      const models = all2.filter((m) => m.supported_endpoints?.includes(CODEX_RESPONSES_ENDPOINT)).sort((a, b) => Number(b.is_chat_default) - Number(a.is_chat_default)).map((m) => ({
        provider: CODEX_AGENT_PROVIDER_ID,
        id: toCodexModelSelectionId(CODEX_COPILOT_MODEL_PROVIDER, m.id),
        name: m.name ?? m.id,
        maxContextWindow: m.capabilities?.limits?.max_context_window_tokens,
        maxOutputTokens: m.capabilities?.limits?.max_output_tokens,
        maxPromptTokens: m.capabilities?.limits?.max_prompt_tokens,
        supportsVision: !!m.capabilities?.supports?.vision,
        configSchema: this._createReasoningEffortConfigSchema(
          m.capabilities?.supports?.reasoning_effort?.map((reasoningEffort) => ({ reasoningEffort })),
          void 0,
          m.id
        ),
        policyState: m.policy?.state,
        _meta: {
          ...createPricingMetaFromBilling(
            normalizeCAPIBilling(m.billing),
            typeof m.model_picker_price_category === "string" ? m.model_picker_price_category : void 0
          ),
          ...createAgentModelGroupMeta(CODEX_COPILOT_MODEL_GROUP)
        }
      }));
      this._copilotModels = models;
      return void 0;
    } catch (err) {
      if (this._githubToken !== token) {
        return void 0;
      }
      return err instanceof Error ? err : new Error(String(err));
    }
  }
  async _refreshCodexModels() {
    let sdkReady = false;
    try {
      sdkReady = this._connection.kind !== "idle" || await this._isSdkResolvableWithoutDownload();
      if (!sdkReady) {
        this._codexModels = [];
        return sdkReady;
      }
      if (!this._activated && this._connection.kind === "idle") {
        this._codexModels = [];
        return sdkReady;
      }
      const connection = await this._ensureConnection();
      const account = await this._refreshAccount(connection.client, false);
      if (!this._isCurrentConnection(connection)) {
        return sdkReady;
      }
      if (account.status === "signedOut" || account.status === "error") {
        this._codexModels = [];
        return sdkReady;
      }
      const configResponse = await connection.client.request("config/read", { includeLayers: false });
      if (!this._isCurrentConnection(connection)) {
        return sdkReady;
      }
      const modelProvider = configResponse.config.model_provider ?? CODEX_OPENAI_MODEL_PROVIDER;
      const usesChatGPTSubscription = modelProvider === CODEX_OPENAI_MODEL_PROVIDER && account.status === "signedIn" && account.authType === "chatgpt";
      const pickerProvider = usesChatGPTSubscription ? "chatgpt" : modelProvider;
      const data = [];
      let cursor = null;
      do {
        const response = await connection.client.request("model/list", { cursor, limit: 100, includeHidden: false });
        if (!this._isCurrentConnection(connection)) {
          return sdkReady;
        }
        data.push(...response.data);
        cursor = response.nextCursor;
      } while (cursor !== null);
      const models = data.sort((left, right) => Number(right.isDefault) - Number(left.isDefault)).map((model) => ({
        provider: CODEX_AGENT_PROVIDER_ID,
        id: toCodexModelSelectionId(modelProvider, model.model),
        name: model.displayName,
        supportsVision: model.inputModalities.includes("image"),
        configSchema: this._createReasoningEffortConfigSchema(model.supportedReasoningEfforts, model.defaultReasoningEffort, model.model),
        _meta: {
          ...createAgentModelSourceMeta(usesChatGPTSubscription ? CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID : void 0),
          ...createAgentModelGroupMeta(pickerProvider)
        }
      }));
      if (this._isCurrentConnection(connection)) {
        this._codexModels = models;
      }
    } catch (err) {
      this._logService.warn(`[Codex] Failed to refresh OpenAI models: ${err instanceof Error ? err.message : String(err)}`);
    }
    return sdkReady;
  }
  // #endregion
  // #region Connection lifecycle
  _throwIfShuttingDown() {
    if (this._isShuttingDown || this._store.isDisposed) {
      throw new CancellationError();
    }
  }
  /**
   * Cross the one process-lifetime activation boundary for Codex. Only session
   * creation or restoration may retain a persistent app-server connection.
   */
  _activate() {
    this._throwIfShuttingDown();
    if (this._activated) {
      return;
    }
    this._activated = true;
    this._logService.info("[Codex] Activating app-server after explicit Codex use");
    void this._queueModelRefresh();
    void this._refreshProviderConfiguration();
    if (this._chatDiscoveryRequested) {
      void this._startCodexChatDiscovery();
    }
  }
  /**
   * Run a standalone Codex action on the session-owned connection when Codex is
   * active, or on a connection that is always torn down after the action.
   * Passive catalogue actions and account controls must not cross the
   * persistent activation boundary by themselves.
   */
  async _withOnDemandConnection(operation) {
    return this._onDemandConnectionSequencer.queue(async () => {
      this._throwIfShuttingDown();
      await this._startupAccountProbe.p;
      this._throwIfShuttingDown();
      if (this._activated || this._connection.kind !== "idle") {
        return operation((await this._ensureConnection()).client, false);
      }
      const settled = new DeferredPromise();
      this._transientConnectionOperation = settled.p;
      const cancellation = new CancellationTokenSource();
      this._transientConnectionCancellation = cancellation;
      let connection;
      try {
        connection = await this._startRawConnection(this._startupAccountProbeTimeoutMs, cancellation.token);
        this._transientAccountConnection = connection;
        return await operation(connection.client, true);
      } finally {
        if (connection && this._transientAccountConnection === connection) {
          this._transientAccountConnection = void 0;
          this._disposeConnectionResources(connection);
        }
        if (this._transientConnectionCancellation === cancellation) {
          this._transientConnectionCancellation = void 0;
        }
        cancellation.dispose();
        if (this._transientConnectionOperation === settled.p) {
          this._transientConnectionOperation = void 0;
        }
        await settled.complete(void 0);
      }
    });
  }
  /**
   * Resolve the account indicator once at startup without downloading the SDK
   * or retaining any app-server resources.
   */
  async _probeAccountAtStartup() {
    let connection;
    try {
      if (this._isShuttingDown || this._store.isDisposed || !await this._isSdkResolvableWithoutDownload() || this._isShuttingDown || this._store.isDisposed) {
        return;
      }
      this._logService.info("[Codex] starting one-off startup account probe");
      const probeConnection = connection = await this._startRawConnection(this._startupAccountProbeTimeoutMs, this._startupAccountProbeCancellation.token);
      this._transientAccountConnection = probeConnection;
      const account = await raceTimeout(
        (async () => {
          const state = await this._refreshAccountState(probeConnection.client, true);
          if (state.status === "signedIn" && state.authType === "chatgpt" && this._isCurrentChatGPTAccountClient(probeConnection.client, state.email)) {
            const profileImageRequest = ++this._openAIAccountProfileImageRequest;
            await Promise.all([
              this._refreshAccountRateLimits(probeConnection.client, state.email),
              this._readAccountProfileImageAuthentication(probeConnection.client, state.email, profileImageRequest).then((authentication) => {
                if (authentication) {
                  void this._refreshAccountProfileImageFromAuthentication(authentication, state.email, profileImageRequest);
                }
              })
            ]);
          }
          return state;
        })(),
        this._startupAccountProbeTimeoutMs,
        () => this._logService.warn(`[Codex] startup account probe timed out after ${this._startupAccountProbeTimeoutMs}ms`)
      );
      if (account === void 0) {
        return;
      }
    } catch (error) {
      if (!(error instanceof CancellationError)) {
        this._logService.warn(`[Codex] startup account probe failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      if (connection) {
        if (this._transientAccountConnection === connection) {
          this._transientAccountConnection = void 0;
          this._disposeConnectionResources(connection);
          this._logService.info("[Codex] stopped one-off startup account probe");
        }
      }
    }
  }
  /**
   * Lazily spawn the codex app-server, initialize the connection,
   * authenticate via apiKey, and return the ready connection. Idempotent
   * — concurrent callers share the same promise.
   */
  async _ensureConnection() {
    this._throwIfShuttingDown();
    if (this._connection.kind === "ready") {
      return Promise.resolve(this._connection);
    }
    if (this._connection.kind === "starting") {
      return this._connection.promise;
    }
    const generation = this._connectionGeneration;
    const cancellation = new CancellationTokenSource();
    const startPromise = (async () => {
      await this._startupAccountProbe.p;
      this._throwIfShuttingDown();
      if (cancellation.token.isCancellationRequested) {
        throw new CancellationError();
      }
      const transientOperation = this._transientConnectionOperation;
      if (transientOperation) {
        await transientOperation;
      }
      this._throwIfShuttingDown();
      return this._startConnection(generation, cancellation.token);
    })();
    const promise = startPromise.then(async (ready) => {
      if (generation !== this._connectionGeneration) {
        this._disposeConnectionResources(ready);
        throw new CodexConnectionReplacedError("Codex app-server was replaced while starting");
      }
      ready.proxyHandle.setToken(this._githubToken ?? "");
      await this._queueSkillExtraRootsForClient(ready.client);
      if (generation !== this._connectionGeneration) {
        this._disposeConnectionResources(ready);
        throw new CodexConnectionReplacedError("Codex app-server was replaced while starting");
      }
      this._connection = { kind: "ready", ...ready };
      void this._refreshAccount(ready.client);
      void this._refreshMcpInventory(ready.client, null);
      return ready;
    }).catch((err) => {
      if (generation === this._connectionGeneration) {
        this._connection = { kind: "idle" };
      }
      throw err;
    }).finally(() => cancellation.dispose());
    this._connection = { kind: "starting", promise, cancellation };
    return promise;
  }
  /**
   * Resolve the Codex SDK root — the directory whose
   * `node_modules/@openai/codex-<target>/…` holds the native binary.
   *
   * Mirrors the three-tier resolution in `ClaudeAgentSdkService._loadSdk`:
   *   1. dev override / product download, via the downloader, when the SDK
   *      `isAvailable` (env override || `product.agentSdks.codex`);
   *   2. dev fallback to this repo's `node_modules`, where `@openai/codex`
   *      and its per-host binary package are devDependencies — this is what
   *      lets running-from-source (and dev smoke tests) spawn Codex without
   *      an env-var override.
   *
   * `isAvailable` is already false in dev, so it discriminates the two
   * without injecting `INativeEnvironmentService`. When neither path
   * resolves we defer to the downloader so callers get its actionable
   * "not configured" diagnostic.
   */
  async _resolveSdkRoot(token = CancellationToken.None) {
    if (this._agentSdkDownloader.isAvailable(CodexSdkPackage)) {
      return this._agentSdkDownloader.loadSdkRoot(CodexSdkPackage, token);
    }
    const devRoot = await resolveCodexDevSdkRoot();
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    if (devRoot) {
      this._logService.info(`[Codex] resolving SDK from repo node_modules (dev fallback): ${devRoot}`);
      return devRoot;
    }
    return this._agentSdkDownloader.loadSdkRoot(CodexSdkPackage, token);
  }
  async _isSdkResolvableWithoutDownload() {
    if (this._agentSdkDownloader.isAvailable(CodexSdkPackage)) {
      return this._agentSdkDownloader.isSdkResolvableWithoutDownload(CodexSdkPackage);
    }
    return await resolveCodexDevSdkRoot() !== void 0;
  }
  /** Spawn and initialize an app-server without retaining it as the agent's connection. */
  async _startRawConnection(initializationTimeoutMs, token = CancellationToken.None) {
    const root = await this._resolveSdkRoot(token);
    const codexTarget = codexPackageSuffix(process.platform, process.arch);
    if (!codexTarget) {
      throw new Error(`Codex: unsupported platform ${process.platform}-${process.arch}`);
    }
    const triple = codexBinaryTriple(codexTarget);
    if (!triple) {
      throw new Error(`Codex: no binary triple known for sdkTarget '${codexTarget}'`);
    }
    const binaryName = process.platform === "win32" ? "codex.exe" : "codex";
    const binaryPath = join(root, "node_modules", `@openai/codex-${codexTarget}`, "vendor", triple, "bin", binaryName);
    try {
      fs11.accessSync(binaryPath, fs11.constants.X_OK);
    } catch (err) {
      throw new Error(`Codex binary not executable: ${binaryPath} (${err instanceof Error ? err.message : String(err)})`);
    }
    const proxyStart = this._codexProxyService.start(this._githubToken ?? "");
    let proxyHandle;
    try {
      proxyHandle = await raceCancellationError(proxyStart, token);
    } catch (error) {
      void proxyStart.then((handle) => handle.dispose(), () => {
      });
      throw error;
    }
    let child;
    let client;
    try {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const extraArgs = parseBinaryArgs(process.env[AgentHostCodexAgentBinaryArgsEnvVar]);
      const telemetry = await this._otelService.getNativeSdkTelemetryConfig();
      const launchConfig = buildCodexLaunchConfig(process.env, proxyHandle, extraArgs, telemetry);
      const env2 = launchConfig.env;
      const userCodexHome = process.env[AgentHostCodexAgentCodexHomeEnvVar];
      if (userCodexHome) {
        env2.CODEX_HOME = userCodexHome;
      }
      const args = [...launchConfig.args];
      this._logService.info(`[Codex] spawning app-server from ${binaryPath}`);
      child = spawn4(binaryPath, args, { env: env2, stdio: ["pipe", "pipe", "pipe"] });
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk) => this._logService.info(`[Codex stderr] ${String(chunk).trimEnd()}`));
      const transport = transportFromChildProcess(child);
      client = new CodexAppServerClient(transport, (level, msg) => {
        this._logService.info(`[CodexClient ${level}] ${msg}`);
      });
      const initialize = raceCancellationError(client.request("initialize", {
        clientInfo: CLIENT_INFO,
        capabilities: { experimentalApi: true, requestAttestation: false, optOutNotificationMethods: null }
      }), token);
      if (initializationTimeoutMs === void 0) {
        await initialize;
      } else if (await raceTimeout(initialize, initializationTimeoutMs) === void 0) {
        throw new Error(`Codex app-server initialization timed out after ${initializationTimeoutMs}ms`);
      }
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      client.notify("initialized", void 0);
      return { client, proxyHandle, child };
    } catch (err) {
      client?.dispose();
      proxyHandle.dispose();
      try {
        child?.kill("SIGKILL");
      } catch {
      }
      throw err;
    }
  }
  /** Start and retain the fully-wired connection used by Codex sessions. */
  async _startConnection(generation, token) {
    const raw = await this._startRawConnection(void 0, token);
    const subscriptions = new DisposableStore();
    const ready = { ...raw, subscriptions };
    const { client } = ready;
    subscriptions.add(client.onExit((e) => {
      this._logService.warn(`[Codex] app-server exited code=${e.code} signal=${e.signal}`);
      this._handleConnectionLost(ready, generation);
    }));
    subscriptions.add(client.onTransportError((err) => {
      this._logService.error(`[Codex] transport error: ${err.message}`);
      this._handleConnectionLost(ready, generation);
    }));
    const exitCode = raw.child.exitCode;
    const signalCode = raw.child.signalCode;
    if (exitCode !== null && exitCode !== void 0 || signalCode !== null && signalCode !== void 0) {
      this._disposeConnectionResources(ready);
      throw new Error(`Codex app-server exited before persistent startup completed (code=${exitCode ?? "null"}, signal=${signalCode ?? "null"})`);
    }
    this._registerIgnoredNotifications(client, subscriptions);
    subscriptions.add(client.onNotification("account/login/completed", () => {
      void this._refreshAccount(client).then(() => this._queueModelRefresh());
    }));
    subscriptions.add(client.onNotification("account/updated", () => {
      if (this._connection.kind === "ready" && this._connection.client === client) {
        void this._refreshAccount(client);
        this._queueModelRefresh();
      }
    }));
    subscriptions.add(client.onNotification("account/rateLimits/updated", () => {
      if (this._connection.kind === "ready" && this._connection.client === client && this._openAIAccountState.status === "signedIn" && this._openAIAccountState.authType === "chatgpt") {
        void this._refreshAccountRateLimits(client);
      }
    }));
    subscriptions.add(client.onNotification("skills/changed", () => this._queueSkillHookCustomizationRefresh(client)));
    subscriptions.add(client.onNotification("turn/started", (params) => this._dispatchByThread(params.threadId, (s) => this._handleTurnStartedNotification(s, params))));
    subscriptions.add(client.onNotification("item/started", (params) => this._dispatchByThread(params.threadId, (s) => this._handleItemStarted(s, params))));
    subscriptions.add(client.onNotification("item/agentMessage/delta", (params) => this._dispatchByThread(params.threadId, (s) => mapAgentMessageDelta(s.mapState, this._withHostTurnId(s, params)))));
    subscriptions.add(client.onNotification("item/commandExecution/outputDelta", (params) => this._dispatchByThread(params.threadId, (s) => mapCommandExecutionOutputDelta(s.mapState, this._withHostTurnId(s, params)))));
    subscriptions.add(client.onNotification("item/fileChange/patchUpdated", (params) => this._dispatchByThread(params.threadId, (s) => mapFileChangePatchUpdated(s.mapState, this._withHostTurnId(s, params)))));
    subscriptions.add(client.onNotification("item/fileChange/outputDelta", (params) => this._dispatchByThread(params.threadId, (s) => mapFileChangeOutputDelta(s.mapState, this._withHostTurnId(s, params)))));
    subscriptions.add(client.onNotification("item/mcpToolCall/progress", (params) => this._dispatchByThread(params.threadId, (s) => mapMcpToolCallProgress(s.mapState, this._withHostTurnId(s, params)))));
    subscriptions.add(client.onNotification("item/reasoning/summaryPartAdded", (params) => this._dispatchByThread(params.threadId, (s) => mapReasoningSummaryPartAdded(s.mapState, this._withHostTurnId(s, params)))));
    subscriptions.add(client.onNotification("item/reasoning/summaryTextDelta", (params) => this._dispatchByThread(params.threadId, (s) => mapReasoningSummaryTextDelta(s.mapState, this._withHostTurnId(s, params)))));
    subscriptions.add(client.onNotification("item/reasoning/textDelta", (params) => this._dispatchByThread(params.threadId, (s) => mapReasoningTextDelta(s.mapState, this._withHostTurnId(s, params)))));
    subscriptions.add(client.onNotification("thread/tokenUsage/updated", (params) => this._dispatchTokenUsageUpdated(params)));
    subscriptions.add(client.onNotification("item/completed", (params) => this._dispatchItemCompleted(params)));
    subscriptions.add(client.onNotification("turn/completed", (params) => this._dispatchTurnCompleted(params)));
    subscriptions.add(client.onNotification("guardianWarning", (params) => this._dispatchByThread(params.threadId, (s) => this._handleGuardianWarning(s, params))));
    subscriptions.add(client.onNotification("item/autoApprovalReview/completed", (params) => {
      void this._handleGuardianReviewCompleted(client, params);
    }));
    subscriptions.add(client.onNotification("mcpServer/startupStatus/updated", (params) => this._handleMcpStartupStatus(client, params.threadId, params.name, params.status, params.error)));
    subscriptions.add(client.onRequest(
      "item/commandExecution/requestApproval",
      (params) => this._handleCommandApprovalRequestRpc(params)
    ));
    subscriptions.add(client.onRequest(
      "item/fileChange/requestApproval",
      (params) => this._handleFileChangeApprovalRequestRpc(params)
    ));
    subscriptions.add(client.onRequest(
      "item/permissions/requestApproval",
      (params) => this._handlePermissionsApprovalRequestRpc(params)
    ));
    subscriptions.add(client.onRequest(
      "item/tool/call",
      (params) => this._handleDynamicToolCallRpc(params)
    ));
    subscriptions.add(client.onRequest(
      "item/tool/requestUserInput",
      (params) => this._handleUserInputRequestRpc(params)
    ));
    subscriptions.add(client.onRequest(
      "mcpServer/elicitation/request",
      (params) => this._handleElicitationRequestRpc(params)
    ));
    return ready;
  }
  /**
   * Builds the `mcp_servers` object for a session's `thread/start.config`:
   * the workbench's root `mcpServers` config merged with the session's
   * enabled client-plugin MCP servers. Passing them per-thread (rather than
   * as process-global `-c` spawn overrides) means each new session picks up
   * the current root config without restarting the shared app-server, and it
   * merges with (leaves intact) the user's global `~/.codex/config.toml`.
   * Client-plugin servers win a name collision with the root config. Any
   * OAuth bearer token acquired for an auth-gated http server (see
   * {@link handleAuthenticationToken}) is injected as an `Authorization`
   * header so codex connects authenticated.
   */
  _buildSessionMcpServers(session) {
    const configuredRoot = codexMcpServersFromConfig(this._configurationService.getRootValue(platformRootSchema, AgentHostMcpServersConfigKey));
    const root = Object.fromEntries(
      Object.entries(configuredRoot).filter(([name]) => this._isMcpServerEnabledForSdk(session, name))
    );
    const workspace = codexMcpServersFromDefinitions(this._sessionMcpDiscoveries.get(session.sessionId)?.discovery.definitions ?? []);
    const enabledWorkspace = Object.fromEntries(Object.entries(workspace).filter(([name]) => this._isMcpServerEnabledForSdk(session, name)));
    const clientPlugins = codexMcpServersFromPlugins(this._enabledClientPlugins(session), session.workingDirectory);
    const enabledConfiguredServers = { ...root, ...enabledWorkspace, ...clientPlugins };
    const builtInGitHub = this._builtInGitHubMcpServer(session, enabledConfiguredServers);
    return injectCodexMcpAuthTokens({ ...builtInGitHub, ...enabledConfiguredServers }, this._mcpAuthTokens);
  }
  _builtInGitHubMcpServer(session, configuredServers) {
    if (!this._githubMcpServerEnabled || !this._githubToken || !this._gitHubMcpServerConfiguration || !this._isMcpServerEnabledForSdk(session, GITHUB_MCP_SERVER_NAME) || this._hasConfiguredGitHubMcpServer(configuredServers)) {
      return {};
    }
    return { [GITHUB_MCP_SERVER_NAME]: toCodexMcpServerJson(this._gitHubMcpServerConfiguration) };
  }
  _hasConfiguredGitHubMcpServer(configuredServers) {
    const builtInUrl = this._gitHubMcpServerConfiguration?.type === "http" /* REMOTE */ ? normalizeCodexMcpResourceUrl(this._gitHubMcpServerConfiguration.url) : void 0;
    return Object.hasOwn(configuredServers, GITHUB_MCP_SERVER_NAME) || builtInUrl !== void 0 && Object.values(configuredServers).some((server) => server.url !== void 0 && normalizeCodexMcpResourceUrl(server.url) === builtInUrl);
  }
  async _refreshSessionMcpDiscovery(session) {
    const roots = session.workingDirectories?.length ? session.workingDirectories : session.workingDirectory ? [session.workingDirectory] : [];
    if (roots.length === 0) {
      return;
    }
    const rootsSignature = JSON.stringify(roots.map((root) => root.toString()));
    let entry = this._sessionMcpDiscoveries.get(session.sessionId);
    if (entry?.rootsSignature !== rootsSignature) {
      entry?.dispose();
      const store = new DisposableStore();
      const discovery = store.add(new SessionMcpDiscovery(roots, this._fileService));
      store.add(discovery.onDidChange(() => {
        session.materializedMcpSig = void 0;
        if (session.firstTurnSent) {
          this._markSessionForReload(session);
        }
      }));
      entry = { rootsSignature, discovery, dispose: () => store.dispose() };
      this._sessionMcpDiscoveries.set(session.sessionId, entry);
    }
    await entry.discovery.refresh();
  }
  _isMcpServerEnabledForSdk(session, name) {
    const resolution = this._customizationEnablementService.resolve(session.configurationResource.toString(), targetForUnownedMcpServer(name));
    return resolution.kind === "resolved" && resolution.enabled;
  }
  /**
   * The normalized URLs of every configured http MCP server (root config +
   * the session's client plugins), keyed by server name. Used to (a) surface
   * an auth-required server's resource for the workbench sign-in and (b)
   * match a workbench-acquired token back to the server(s) it unlocks.
   * Computed from a token-free build so the URLs are the bare server URLs.
   */
  _httpMcpServerUrls(session) {
    const root = Object.fromEntries(
      Object.entries(codexMcpServersFromConfig(this._configurationService.getRootValue(platformRootSchema, AgentHostMcpServersConfigKey))).filter(([name]) => this._isMcpServerEnabledForSdk(session, name))
    );
    const workspace = codexMcpServersFromDefinitions(this._sessionMcpDiscoveries.get(session.sessionId)?.discovery.definitions ?? []);
    const enabledWorkspace = Object.fromEntries(Object.entries(workspace).filter(([name]) => this._isMcpServerEnabledForSdk(session, name)));
    const clientPlugins = codexMcpServersFromPlugins(this._enabledClientPlugins(session), session.workingDirectory);
    const configuredServers = { ...root, ...enabledWorkspace, ...clientPlugins };
    const builtInGitHub = this._builtInGitHubMcpServer(session, configuredServers);
    const urls = /* @__PURE__ */ new Map();
    for (const [name, server] of Object.entries({ ...builtInGitHub, ...configuredServers })) {
      const normalized = server.url !== void 0 ? normalizeCodexMcpResourceUrl(server.url) : void 0;
      if (normalized !== void 0) {
        urls.set(name, normalized);
      }
    }
    return urls;
  }
  _mcpServerUrlForName(threadId, name) {
    const session = this._sessionForMcpThread(threadId);
    return session ? this._buildSessionMcpServers(session)[name]?.url : void 0;
  }
  _sessionForMcpThread(threadId) {
    const sessionId = this._sessionIdByThreadId.get(threadId);
    return sessionId === void 0 ? void 0 : this._sessions.get(sessionId);
  }
  /**
   * Map the session's tools into codex `dynamicTools` specs: the agent host's
   * server tools (executed in-process) plus the workbench client's tools
   * (round-tripped to the client). Both are registered with codex the same
   * way — at `thread/start` — and dispatched apart in
   * {@link _handleDynamicToolCallRpc} by name.
   */
  _buildDynamicTools(session) {
    const serverTools = this._serverToolHost?.getDefinitionsForSession(session.configurationResource.toString()) ?? [];
    const clientTools = session.clientToolSet.merged();
    const seen = /* @__PURE__ */ new Set();
    const all2 = [];
    for (const t of [...serverTools, ...clientTools]) {
      if (seen.has(t.name)) {
        continue;
      }
      seen.add(t.name);
      all2.push(t);
    }
    if (all2.length === 0) {
      return void 0;
    }
    return all2.map((t) => ({
      type: "function",
      name: t.name,
      description: t.description ?? "",
      inputSchema: t.inputSchema ?? { type: "object" }
    }));
  }
  async _handleDynamicToolCallRpc(params) {
    const sessionId = this._sessionIdByThreadId.get(params.threadId);
    const session = sessionId ? this._sessions.get(sessionId) : void 0;
    if (!session) {
      return { result: this._toolFailure(`Codex tool call for unknown thread ${params.threadId}`) };
    }
    const host = this._serverToolHost;
    if (host && params.namespace === null && host.toolNames.includes(params.tool)) {
      try {
        const chatChannel = session.chatChannel?.toString();
        if (!chatChannel) {
          return { result: this._toolFailure(`No chat channel for server tool ${params.tool}`) };
        }
        if (host.requiresConfirmation(chatChannel, params.tool)) {
          const entry = session.mapState.itemToToolCall.get(params.callId);
          if (!entry) {
            return { result: this._toolFailure(`No pending server tool call for ${params.tool} (callId ${params.callId})`) };
          }
          const invocationMessage = getServerToolDisplay(params.tool, params.arguments)?.invocationMessage ?? `Calling ${params.tool}`;
          const decision = await session.pendingCommandApprovals.registerAndFire(entry.toolCallId, () => {
            this._fire(session.sessionUri, {
              type: "chat/toolCallReady" /* ChatToolCallReady */,
              turnId: entry.turnId,
              toolCallId: entry.toolCallId,
              invocationMessage,
              confirmationTitle: localize(2396, null)
            });
          });
          if (decision !== "accept" && decision !== "acceptForSession") {
            return { result: this._toolFailure(`Server tool ${params.tool} was not approved`) };
          }
        }
        const text = host.executeTool(chatChannel, params.tool, params.arguments);
        return { result: { contentItems: [{ type: "inputText", text: await text }], success: true } };
      } catch (err) {
        return { result: this._toolFailure(`Server tool ${params.tool} failed: ${err instanceof Error ? err.message : String(err)}`) };
      }
    }
    const toolCallId = session.mapState.itemToToolCall.get(params.callId)?.toolCallId;
    if (toolCallId === void 0) {
      return { result: this._toolFailure(`No pending client tool call for ${params.tool} (callId ${params.callId})`) };
    }
    if (session.clientToolSet.size === 0) {
      return { result: this._toolFailure(`No client available to run ${params.tool}`) };
    }
    try {
      const result = await session.pendingClientToolCalls.register(toolCallId);
      return { result: dynamicToolResponseFromResult(result) };
    } catch (err) {
      if (err instanceof CancellationError) {
        return { result: this._toolFailure(`Client tool ${params.tool} was cancelled`) };
      }
      return { result: this._toolFailure(`Client tool ${params.tool} failed: ${err instanceof Error ? err.message : String(err)}`) };
    }
  }
  _toolFailure(message) {
    this._logService.warn(`[Codex] dynamic tool call failed: ${message}`);
    return { contentItems: [{ type: "inputText", text: message }], success: false };
  }
  async _handleUserInputRequestRpc(params) {
    const sessionId = this._sessionIdByThreadId.get(params.threadId);
    const session = sessionId ? this._sessions.get(sessionId) : void 0;
    if (!session) {
      return { result: emptyUserInputResponse(params.questions) };
    }
    if (!session.currentTurnId) {
      this._logService.warn(`[Codex] user input request without an active turn for threadId=${params.threadId}; returning empty answers`);
      return { result: emptyUserInputResponse(params.questions) };
    }
    const approvalQuestion = params.questions.length === 1 && params.questions[0].id.startsWith(MCP_TOOL_APPROVAL_QUESTION_ID_PREFIX) ? params.questions[0] : void 0;
    if (approvalQuestion) {
      const callId = approvalQuestion.id.slice(MCP_TOOL_APPROVAL_QUESTION_ID_PREFIX.length);
      const entry = session.mapState.itemToToolCall.get(callId);
      if (entry) {
        return this._handleMcpToolApprovalViaCard(session, approvalQuestion, entry);
      }
    }
    const requestId = generateUuid();
    const request = buildUserInputRequest(requestId, params.questions);
    try {
      const result = await session.pendingUserInputs.registerAndFire(requestId, () => {
        this._fire(session.sessionUri, { type: "chat/inputRequested" /* ChatInputRequested */, request });
      });
      return { result: userInputResponseFromAnswers(params.questions, result.response, result.answers) };
    } catch (err) {
      return { result: emptyUserInputResponse(params.questions) };
    }
  }
  /**
   * Renders an MCP tool-call approval on the normal tool-approval card
   * (a pending-confirmation `ChatToolCallReady` on the originating
   * `mcpToolCall` host tool call) rather than as a chat-input question.
   * The user's Allow/Deny decision is mapped back to the answer string
   * codex expects (`Allow` / `__codex_mcp_decline__`). Mirrors the shell
   * command approval flow ({@link CodexAgent._handleCommandApprovalRequest}).
   */
  async _handleMcpToolApprovalViaCard(session, question, entry) {
    const confirmationTitle = question.question || question.header || "Run MCP tool";
    let decision;
    try {
      decision = await session.pendingCommandApprovals.registerAndFire(entry.toolCallId, () => {
        this._fire(session.sessionUri, {
          type: "chat/toolCallReady" /* ChatToolCallReady */,
          turnId: entry.turnId,
          toolCallId: entry.toolCallId,
          invocationMessage: confirmationTitle,
          toolInput: confirmationTitle,
          confirmationTitle
        });
      });
    } catch (err) {
      decision = "decline";
    }
    const allow = decision === "accept" || decision === "acceptForSession";
    const answer = allow ? MCP_TOOL_APPROVAL_ANSWER_ALLOW : MCP_TOOL_APPROVAL_ANSWER_DECLINE;
    return { result: { answers: { [question.id]: { answers: [answer] } } } };
  }
  async _handleElicitationRequestRpc(params) {
    const sessionId = this._sessionIdByThreadId.get(params.threadId);
    const session = sessionId ? this._sessions.get(sessionId) : void 0;
    this._logService.info(`[Codex] elicitation request threadId=${params.threadId} mode=${params.mode} server=${params.serverName} session=${session ? session.sessionId : "NONE"}`);
    if (!session) {
      this._logService.warn(`[Codex] elicitation request for unknown threadId=${params.threadId}; declining`);
      return { result: declinedElicitationResponse() };
    }
    if (!session.currentTurnId) {
      this._logService.warn(`[Codex] elicitation request without an active turn for threadId=${params.threadId}; declining`);
      return { result: declinedElicitationResponse() };
    }
    const requestId = generateUuid();
    const request = buildElicitationRequest2(requestId, params);
    try {
      const result = await session.pendingUserInputs.registerAndFire(requestId, () => {
        this._fire(session.sessionUri, { type: "chat/inputRequested" /* ChatInputRequested */, request });
      });
      this._logService.info(`[Codex] elicitation resolved requestId=${requestId} response=${result.response}`);
      return { result: elicitationResponseFromAnswers(params, result.response, result.answers) };
    } catch (err) {
      this._logService.info(`[Codex] elicitation cancelled requestId=${requestId}: ${err instanceof Error ? err.message : String(err)}`);
      return { result: cancelledElicitationResponse() };
    }
  }
  _hostTurnId(session, appTurnId) {
    return session.hostTurnIdByAppTurnId.get(appTurnId) ?? appTurnId;
  }
  _withHostTurnId(session, params) {
    const turnId = this._hostTurnId(session, params.turnId);
    return turnId === params.turnId ? params : { ...params, turnId };
  }
  _withHostTurn(session, params) {
    const appTurnId = params.turn.id;
    const hostTurnId = session.currentTurnId ?? this._hostTurnId(session, appTurnId);
    session.hostTurnIdByAppTurnId.set(appTurnId, hostTurnId);
    session.currentAppTurnId = appTurnId;
    return hostTurnId === appTurnId ? params : { ...params, turn: { ...params.turn, id: hostTurnId } };
  }
  _handleTurnStartedNotification(session, params) {
    const appTurnId = params.turn.id;
    const mapped = this._withHostTurn(session, params);
    this._persistTurnEventId(session, mapped.turn.id, appTurnId);
    mapTurnStarted(session.mapState, mapped, session.lastPromptText);
    return [];
  }
  _persistTurnEventId(session, hostTurnId, appTurnId) {
    const storage = session.chatChannel ? chatStorageUri(session.chatChannel) : void 0;
    if (!storage) {
      return;
    }
    const ref = this._sessionDataService.openDatabase(storage);
    ref.object.setTurnEventId(hostTurnId, appTurnId).catch((error) => {
      this._logService.warn(`[Codex:${session.threadId}] Failed to persist turn id mapping ${hostTurnId} -> ${appTurnId}`, error);
    }).finally(() => ref.dispose());
  }
  _handleTurnCompletedNotification(session, params) {
    const appTurnId = params.turn.id;
    const hostTurnId = this._hostTurnId(session, appTurnId);
    const out = mapTurnCompleted(session.mapState, this._withHostTurn(session, params), this._clearTurnStopWatch(session));
    session.codexTurnIdByHostTurnId.set(hostTurnId, appTurnId);
    if (session.currentAppTurnId === appTurnId || session.currentTurnId === hostTurnId) {
      session.currentTurnId = void 0;
      session.currentAppTurnId = void 0;
    }
    session.hostTurnIdByAppTurnId.delete(appTurnId);
    this._drainPendingSteering(session);
    if (session.pendingGuardianReviewCards.size > 0) {
      for (const guardianToolCallId of [...session.pendingGuardianReviewCards]) {
        session.pendingCommandApprovals.respond(guardianToolCallId, "cancel");
      }
    }
    return out;
  }
  /**
   * Dispatch a codex `item/started` notification. `userMessage` items are
   * intercepted here (rather than in the pure mapper) because steering
   * promotion needs the agent's per-session turn-correlation state; all
   * other item kinds defer to {@link mapItemStarted}.
   */
  _handleItemStarted(session, params) {
    if (params.item.type === "userMessage") {
      return this._handleSteeredUserMessage(session, params.item.content);
    }
    return mapItemStarted(session.mapState, this._withHostTurnId(session, params));
  }
  /**
   * Codex echoes every user message — the turn opener (already shown by
   * the workbench before `sendMessage`) and any steered input — as a
   * `userMessage` item. Only steered input is buffered in
   * {@link ICodexSession.pendingSteeringFlips}; a buffered match is
   * promoted into its own visible turn and everything else is dropped.
   */
  _handleSteeredUserMessage(session, content) {
    const text = extractUserInputText(content);
    const steering = this._takeMatchingPendingSteering(session, text);
    if (!steering) {
      return [];
    }
    return this._beginSteeringTurn(session, steering);
  }
  /**
   * Pop the buffered steering message whose text matches the echoed
   * `userMessage` content. Matching by content (not FIFO) keeps the
   * mapping correct when several steering messages with different texts
   * are in flight.
   */
  _takeMatchingPendingSteering(session, text) {
    for (const [id2, msg] of session.pendingSteeringFlips) {
      if (msg.message.text === text) {
        session.pendingSteeringFlips.delete(id2);
        return msg;
      }
    }
    return void 0;
  }
  /**
   * Promote a steered message into its own protocol turn: complete the
   * in-flight turn (so its response parts settle into history) and open a
   * fresh turn whose user message is the steering content. The
   * `queuedMessageId` clears the corresponding pending steering bubble.
   * Subsequent codex items for the same app-server turn are re-mapped to
   * the new host turn id so the steering response lands there.
   */
  _beginSteeringTurn(session, steering) {
    const actions = [];
    const appTurnId = session.currentAppTurnId;
    const previousHostTurnId = session.currentTurnId ?? (appTurnId ? this._hostTurnId(session, appTurnId) : void 0);
    actions.push(...finalizeCodexTurnMapState(session.mapState, "Turn was superseded by a steering message before the tool reported completion"));
    if (previousHostTurnId) {
      actions.push({ type: "chat/turnComplete" /* ChatTurnComplete */, turnId: previousHostTurnId, duration: this._clearTurnStopWatch(session) });
    }
    const newHostTurnId = generateUuid();
    if (appTurnId) {
      session.hostTurnIdByAppTurnId.set(appTurnId, newHostTurnId);
    }
    session.currentTurnId = newHostTurnId;
    actions.push({
      type: "chat/turnStarted" /* ChatTurnStarted */,
      turnId: newHostTurnId,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      message: steering.message,
      queuedMessageId: steering.id
    });
    this._startTurnStopWatch(session);
    return actions;
  }
  /**
   * Clear any steering messages still buffered (never echoed by codex)
   * and fire `steering_consumed` for each so the chat UI removes the
   * lingering pending bubble. Called on turn completion, abort, dispose,
   * and connection loss.
   */
  _drainPendingSteering(session) {
    if (session.pendingSteeringFlips.size === 0) {
      return;
    }
    const ids = [...session.pendingSteeringFlips.keys()];
    session.pendingSteeringFlips.clear();
    for (const id2 of ids) {
      this._fireSteeringConsumed(session, id2);
    }
  }
  _fireSteeringConsumed(session, id2) {
    this._onDidChatProgress.fire({ kind: "steering_consumed", chat: session.chatChannel, id: id2 });
  }
  _registerIgnoredNotifications(client, subscriptions) {
    const ignored = [
      "thread/started",
      // thread/start response is authoritative for session materialization.
      "thread/status/changed",
      // Codex thread status is not surfaced in Agent Host state yet.
      "thread/settings/updated",
      // VS Code owns session config; Codex settings echoes are not consumed yet.
      "thread/goal/updated",
      // Goals are not surfaced in the Agent Host UI yet.
      "thread/goal/cleared",
      // Goals are not surfaced in the Agent Host UI yet.
      "thread/compacted",
      // Deprecated completion echo; the contextCompaction item owns UI progress.
      "remoteControl/status/changed",
      // Remote-control state is not part of the VS Code integration.
      "serverRequest/resolved",
      // We resolve requests through JSON-RPC responses, so this echo is informational.
      "item/autoApprovalReview/started"
      // Informational; the completed notification drives the denied-action card.
    ];
    for (const method of ignored) {
      subscriptions.add(client.onNotification(method, () => {
      }));
    }
  }
  async _refreshAccount(client, publish = true, awaitDetails = false) {
    const state = await this._refreshAccountState(client, publish);
    if (publish && state.status === "signedIn" && state.authType === "chatgpt" && this._isCurrentChatGPTAccountClient(client, state.email)) {
      const details = Promise.all([
        this._refreshAccountRateLimits(client, state.email),
        this._refreshAccountProfileImage(client, state.email)
      ]);
      if (awaitDetails) {
        await details;
      } else {
        void details;
      }
    }
    return state;
  }
  _refreshAccountState(client, publish) {
    return this._accountRefreshSequencer.queue(() => this._doRefreshAccount(client, publish));
  }
  async _doRefreshAccount(client, publish) {
    try {
      const response = await client.request("account/read", { refreshToken: false });
      const state = codexAccountStateFromResponse(response);
      if (!this._isActiveAccountClient(client)) {
        return state;
      }
      this._setOpenAIAccountState(state, publish);
      this._logService.info(`[Codex] account/read accountType=${response.account?.type ?? "none"} requiresOpenaiAuth=${response.requiresOpenaiAuth}${state.planType ? ` planType=${state.planType}` : ""}`);
      return state;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this._logService.warn(`[Codex] account/read failed: ${message}`);
      const state = { usageSource: "openai", status: "error", error: message };
      if (this._isActiveAccountClient(client)) {
        this._setOpenAIAccountState(state, publish);
      }
      return state;
    }
  }
  async _refreshAccountProfileImage(client, accountEmail = this._openAIAccountState.email) {
    const request = ++this._openAIAccountProfileImageRequest;
    const authentication = await this._readAccountProfileImageAuthentication(client, accountEmail, request);
    if (authentication) {
      await this._refreshAccountProfileImageFromAuthentication(authentication, accountEmail, request);
    }
  }
  async _readAccountProfileImageAuthentication(client, accountEmail, request) {
    try {
      const response = await client.request("getAuthStatus", { includeToken: true, refreshToken: false });
      if (request !== this._openAIAccountProfileImageRequest || !this._isCurrentChatGPTAccountClient(client, accountEmail)) {
        return void 0;
      }
      return { authToken: response.authToken };
    } catch (error) {
      this._logService.warn(`[Codex] ChatGPT profile image authentication refresh failed: ${error instanceof Error ? error.message : String(error)}`);
      return void 0;
    }
  }
  async _refreshAccountProfileImageFromAuthentication(authentication, accountEmail, request) {
    try {
      const profileImage = authentication.authToken ? await fetchCodexProfileImage(authentication.authToken, (input, init) => this._proxyResolver.fetch(input, init)) : void 0;
      if (request !== this._openAIAccountProfileImageRequest || !this._isCurrentChatGPTAccount(accountEmail)) {
        return;
      }
      const profileImageReference = profileImage ? await this._getProfileImageStore().update(profileImage) : void 0;
      if (!profileImage) {
        await this._profileImageStore?.clear();
      }
      if (request !== this._openAIAccountProfileImageRequest || !this._isCurrentChatGPTAccount(accountEmail)) {
        return;
      }
      if (profileImageReference?.nonce === this._openAIAccountProfileImage?.nonce) {
        return;
      }
      this._openAIAccountProfileImage = profileImageReference;
      this._publishAccountInfo(this._toAccountInfo(this._openAIAccountState));
    } catch (error) {
      this._logService.warn(`[Codex] ChatGPT profile image refresh failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  _getProfileImageStore() {
    return this._profileImageStore ??= this._register(new CodexProfileImageStore(this._fileService));
  }
  async _refreshAccountRateLimits(client, accountEmail = this._openAIAccountState.email) {
    const request = ++this._openAIAccountRateLimitRequest;
    try {
      const response = await client.request("account/rateLimits/read", void 0);
      if (request !== this._openAIAccountRateLimitRequest || !this._isCurrentChatGPTAccountClient(client, accountEmail)) {
        return;
      }
      this._openAIAccountRateLimit = codexAccountRateLimitFromResponse(response);
      this._publishAccountInfo(this._toAccountInfo(this._openAIAccountState));
    } catch (error) {
      this._logService.warn(`[Codex] account/rateLimits/read failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  _isCurrentChatGPTAccountClient(client, accountEmail) {
    return this._isActiveAccountClient(client) && this._isCurrentChatGPTAccount(accountEmail);
  }
  _isCurrentChatGPTAccount(accountEmail) {
    return !this._isShuttingDown && !this._store.isDisposed && this._openAIAccountState.status === "signedIn" && this._openAIAccountState.authType === "chatgpt" && this._openAIAccountState.email === accountEmail;
  }
  _isActiveAccountClient(client) {
    return this._connection.kind === "ready" && this._connection.client === client || this._transientAccountConnection?.client === client;
  }
  async _readProviderConfiguration() {
    const connection = await this._ensureConnection();
    const response = await connection.client.request("config/read", { includeLayers: true });
    const userLayer = response.layers?.find((layer) => layer.name.type === "user" && layer.name.profile === null) ?? response.layers?.find((layer) => layer.name.type === "user");
    const config = userLayer?.config && typeof userLayer.config === "object" && !Array.isArray(userLayer.config) ? userLayer.config : {};
    return {
      connection,
      values: {
        "codex.personality": this._readConfigurationValue(config, "personality") ?? "default",
        "codex.autoReviewPolicy": this._readConfigurationValue(config, "auto_review.policy") ?? ""
      }
    };
  }
  async _writeProviderConfiguration(key, value) {
    const connection = await this._ensureConnection();
    await connection.client.request("config/batchWrite", {
      edits: key === "codex.autoReviewPolicy" && value === "" ? [{ keyPath: "auto_review", value: null, mergeStrategy: "replace" }] : key === "codex.personality" && value === "default" ? [{ keyPath: "personality", value: null, mergeStrategy: "replace" }] : [{ keyPath: key === "codex.personality" ? "personality" : "auto_review.policy", value, mergeStrategy: "replace" }],
      expectedVersion: null,
      reloadUserConfig: true
    });
  }
  _refreshProviderConfiguration() {
    if (!this._activated) {
      return Promise.resolve();
    }
    return this._providerConfigurationRefresh ??= (async () => {
      try {
        if (this._connection.kind === "idle" && !await this._isSdkResolvableWithoutDownload()) {
          return;
        }
        const result = await this._readProviderConfiguration();
        if (!this._isCurrentConnection(result.connection)) {
          return;
        }
        this._providerConfigurationValues = result.values;
        this._providerConfigurationReady = true;
        this._configurationService.updateRootConfig(this._providerConfigurationValues);
      } catch (error) {
        this._logService.warn(`[Codex] Failed to read config.toml: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        this._providerConfigurationRefresh = void 0;
      }
    })();
  }
  _queueProviderConfigurationWrite() {
    if (!this._providerConfigurationReady) {
      return;
    }
    const values = this._configurationService.getRootConfigValues?.() ?? {};
    for (const key of ["codex.personality", "codex.autoReviewPolicy"]) {
      if (values[key] === this._providerConfigurationValues[key]) {
        continue;
      }
      const value = values[key];
      if (value === void 0) {
        continue;
      }
      this._providerConfigurationWrite = this._providerConfigurationWrite.then(async () => {
        if (this._providerConfigurationValues[key] === value) {
          return;
        }
        await this._writeProviderConfiguration(key, value);
        this._providerConfigurationValues[key] = value;
      }).catch((error) => this._logService.error(`[Codex] Failed to update config.toml: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
  _readConfigurationValue(config, keyPath) {
    let value = config;
    for (const segment of keyPath.split(".")) {
      if (!value || Array.isArray(value) || typeof value !== "object") {
        return void 0;
      }
      value = value[segment];
    }
    return value;
  }
  /**
   * Route a restored app-server thread to the session that should receive its
   * notifications. Ambient discovery can describe a thread after a registered
   * host chat has already restored and bound that same thread; an unbound
   * discovery entry must not steal the established chat route.
   */
  _routeRestoredThreadToSession(threadId, sessionId) {
    const currentSessionId = this._sessionIdByThreadId.get(threadId);
    const currentSession = currentSessionId ? this._sessions.get(currentSessionId) : void 0;
    const candidateSession = this._sessions.get(sessionId);
    if (currentSession?.chatChannel && !candidateSession?.chatChannel) {
      return;
    }
    this._sessionIdByThreadId.set(threadId, sessionId);
  }
  /** Remove a notification route only when it is still owned by this runtime. */
  _removeThreadRouteIfOwned(threadId, sessionId) {
    if (this._sessionIdByThreadId.get(threadId) === sessionId) {
      this._sessionIdByThreadId.delete(threadId);
    }
  }
  _dispatchByThread(threadId, mapFn) {
    const subagent = this._subagentsByThreadId.get(threadId);
    if (subagent) {
      const actions2 = mapFn(subagent.session);
      for (const action of actions2) {
        this._fireSubagent(subagent, action);
      }
      return;
    }
    const sessionId = this._sessionIdByThreadId.get(threadId);
    const session = sessionId ? this._sessions.get(sessionId) : void 0;
    if (!session) {
      this._logService.trace(`[Codex] Ignoring notification for untracked threadId=${threadId}; likely unclaimed prewarm`);
      return;
    }
    const actions = mapFn(session);
    for (const action of actions) {
      this._fire(session.sessionUri, action);
    }
  }
  _dispatchTokenUsageUpdated(params) {
    const subagent = this._subagentsByThreadId.get(params.threadId);
    if (subagent) {
      const mapped2 = this._withHostTurnId(subagent.session, params);
      for (const action of mapTokenUsageUpdated(mapped2, subagent.session.model?.id)) {
        this._fireSubagent(subagent, action);
      }
      const modelCall2 = mapTokenUsageModelCallCompleted(mapped2, subagent.session.chatChannel);
      if (subagent.session.lastModelCallUsageId !== modelCall2.modelCallId) {
        subagent.session.lastModelCallUsageId = modelCall2.modelCallId;
        this._onDidChatProgress.fire({ ...modelCall2, parentToolCallId: subagent.toolCallId });
      }
      return;
    }
    const sessionId = this._sessionIdByThreadId.get(params.threadId);
    const session = sessionId ? this._sessions.get(sessionId) : void 0;
    if (!session?.chatChannel) {
      this._logService.trace(`[Codex] Ignoring token usage for inactive threadId=${params.threadId}`);
      return;
    }
    const mapped = this._withHostTurnId(session, params);
    const modelCall = mapTokenUsageModelCallCompleted(mapped, session.chatChannel);
    const isNewModelCall = session.lastModelCallUsageId !== modelCall.modelCallId;
    session.lastModelCallUsageId = modelCall.modelCallId;
    if (!session.currentTurnId) {
      return;
    }
    for (const action of mapTokenUsageUpdated(mapped, session.model?.id)) {
      this._fire(session.sessionUri, action);
    }
    if (isNewModelCall) {
      this._onDidChatProgress.fire(modelCall);
    }
  }
  /**
   * `item/completed` dispatch. In addition to the normal per-thread mapping,
   * a parent session's completed `spawnAgent` collab tool call now carries
   * the child `receiverThreadIds`, so we register each spawned subagent and
   * emit a `subagent_started` signal (before mapping the completion, so the
   * shared orchestrator has attached the subagent-chat block to the parent
   * tool call by the time it completes).
   */
  _dispatchItemCompleted(params) {
    const subagent = this._subagentsByThreadId.get(params.threadId);
    if (subagent) {
      const actions2 = mapItemCompleted(subagent.session.mapState, this._withHostTurnId(subagent.session, params));
      for (const action of actions2) {
        this._fireSubagent(subagent, action);
      }
      return;
    }
    const sessionId = this._sessionIdByThreadId.get(params.threadId);
    const session = sessionId ? this._sessions.get(sessionId) : void 0;
    if (!session) {
      this._logService.trace(`[Codex] Ignoring item/completed for untracked threadId=${params.threadId}; likely unclaimed prewarm`);
      return;
    }
    this._maybeRegisterSubagents(session, params);
    const actions = mapItemCompleted(session.mapState, this._withHostTurnId(session, params));
    for (const action of actions) {
      this._fire(session.sessionUri, action);
    }
  }
  /**
   * `turn/completed` dispatch. For a subagent child thread, route the turn's
   * flush/orphan actions to the child conversation but suppress its
   * `ChatTurnComplete` — the child conversation's turn is closed cleanly
   * (without the parent's checkpoint/changeset/title side effects) by the
   * `subagent_completed` signal, which also tears down the child-thread
   * tracking.
   */
  _dispatchTurnCompleted(params) {
    const subagent = this._subagentsByThreadId.get(params.threadId);
    if (subagent) {
      const actions = this._handleTurnCompletedNotification(subagent.session, params);
      for (const action of actions) {
        if (action.type === "chat/turnComplete" /* ChatTurnComplete */) {
          continue;
        }
        this._fireSubagent(subagent, action);
      }
      this._subagentsByThreadId.delete(params.threadId);
      subagent.session.pendingCommandApprovals.denyAll("decline");
      this._onDidChatProgress.fire({
        kind: "subagent_completed",
        chat: subagent.session.chatChannel,
        toolCallId: subagent.toolCallId
      });
      return;
    }
    this._dispatchByThread(params.threadId, (s) => this._handleTurnCompletedNotification(s, params));
  }
  /**
   * When a parent session's `spawnAgent` collab tool call completes it
   * carries the child thread id(s) in `receiverThreadIds`. Register an
   * isolated subagent session for each new child thread and emit a
   * `subagent_started` signal so the shared orchestrator opens the read-only
   * child conversation and attaches its discovery block to the parent tool
   * call.
   */
  _maybeRegisterSubagents(session, params) {
    const item = params.item;
    if (item.type !== "collabAgentToolCall" || item.tool !== "spawnAgent") {
      return;
    }
    const entry = session.mapState.itemToToolCall.get(item.id);
    if (!entry) {
      return;
    }
    const parentChat = session.chatChannel;
    const model = item.model || void 0;
    const taskDescription = item.prompt || void 0;
    for (const childThreadId of item.receiverThreadIds) {
      if (this._subagentsByThreadId.has(childThreadId)) {
        continue;
      }
      const subSession = this._createSubagentSession(session, childThreadId);
      this._subagentsByThreadId.set(childThreadId, {
        parentSessionId: session.sessionId,
        toolCallId: entry.toolCallId,
        session: subSession
      });
      this._onDidChatProgress.fire({
        kind: "subagent_started",
        chat: parentChat,
        toolCallId: entry.toolCallId,
        agentName: model ?? "codex",
        agentDisplayName: model ?? "Subagent",
        taskDescription,
        // Codex surfaces the full delegated instruction as `item.prompt`.
        taskPrompt: typeof item.prompt === "string" && item.prompt.length > 0 ? item.prompt : void 0
      });
      this._logService.trace(`[Codex:${session.sessionId}] subagent spawned thread=${childThreadId} toolCall=${entry.toolCallId} model=${model ?? "(default)"}`);
    }
  }
  /**
   * Build an isolated {@link ICodexSession} used to run the shared event
   * mappers for a subagent child thread. It shares the parent's `sessionUri`
   * (so side effects target the parent's working tree and the fired actions
   * resolve to the parent chat channel) and `acceptedForSession` memo (so the
   * accept-for-session decision spans parent + subagents), but has its own
   * fresh map/turn state and approval registry so the child's events don't
   * collide with the parent's.
   */
  _createSubagentSession(parent, childThreadId) {
    const clientToolSet = new ActiveClientToolSet();
    return {
      sessionId: parent.sessionId,
      threadId: childThreadId,
      sessionUri: parent.sessionUri,
      startTime: parent.startTime,
      modifiedTime: parent.modifiedTime,
      summary: parent.summary,
      chatChannel: parent.chatChannel,
      configurationResource: parent.configurationResource,
      workingDirectory: parent.workingDirectory,
      workingDirectories: parent.workingDirectories,
      multiRootEnabled: parent.multiRootEnabled,
      managedWorkingDirectory: void 0,
      mapState: createCodexSessionMapState(new Set(this._serverToolHost?.toolNames ?? []), clientToolSet),
      pendingCommandApprovals: new PendingRequestRegistry(),
      acceptedForSession: parent.acceptedForSession,
      handledGuardianReviews: /* @__PURE__ */ new Set(),
      pendingGuardianReviewCards: /* @__PURE__ */ new Set(),
      pendingSteeringFlips: /* @__PURE__ */ new Map(),
      clientToolSet,
      pendingClientToolCalls: new PendingRequestRegistry(),
      pendingUserInputs: new PendingRequestRegistry(),
      materializedToolsSig: void 0,
      materializedMcpSig: void 0,
      materializedCustomizationsSig: void 0,
      materializedModelProvider: parent.materializedModelProvider,
      firstTurnSent: true,
      model: parent.model,
      agent: parent.agent,
      customizationDirectory: void 0,
      currentTurnId: void 0,
      turnStopWatch: void 0,
      currentAppTurnId: void 0,
      hostTurnIdByAppTurnId: /* @__PURE__ */ new Map(),
      codexTurnIdByHostTurnId: /* @__PURE__ */ new Map(),
      needsResume: false,
      unsubscribeBeforeResume: false,
      resumePromise: void 0,
      lastPromptText: "",
      disposed: false,
      materializePromise: void 0,
      materializedEventFired: true,
      prewarmTimer: void 0,
      prewarmClaimed: true,
      serverToolsAdvertisement: parent.serverToolsAdvertisement,
      publishedDirectoryCustomizationIds: /* @__PURE__ */ new Set(),
      mcpController: void 0,
      clientCustomizations: new CodexClientCustomizationStore()
    };
  }
  /**
   * Fire a subagent action tagged with the parent `spawnAgent` tool call.
   * The `resource` is the parent chat channel (the key the subagent
   * conversation is registered under in the orchestrator); `parentToolCallId`
   * routes the action into the child's read-only conversation.
   */
  _fireSubagent(subagent, action) {
    this._onDidChatProgress.fire({
      kind: "action",
      resource: subagent.session.chatChannel,
      action,
      parentToolCallId: subagent.toolCallId
    });
  }
  /**
   * Phase 4: handle `item/commandExecution/requestApproval` from
   * codex. Look up the host-side tool call for the item, emit a
   * `ChatToolCallReady` in PendingConfirmation, park on a deferred
   * keyed by toolCallId, and resolve when the user (or the
   * accept-for-session memo) decides. Unknown sessions / items
   * decline silently so codex stops blocking.
   */
  async _handleCommandApprovalRequestRpc(params) {
    const decision = await this._handleCommandApprovalRequest(params);
    return { result: { decision } };
  }
  async _handleCommandApprovalRequest(params) {
    const target = this._resolveApprovalTarget(params.threadId);
    if (!target) {
      this._logService.warn(`[Codex] commandExecution/requestApproval for unknown threadId=${params.threadId}; declining`);
      return "decline";
    }
    const session = target.session;
    const entry = session.mapState.itemToToolCall.get(params.itemId);
    if (!entry) {
      this._logService.warn(`[Codex:${session.sessionId}] commandExecution/requestApproval for unknown itemId=${params.itemId}; declining`);
      return "decline";
    }
    const command = params.command ?? "";
    const displayCommand = unwrapShellInvocation(command);
    if (command && session.acceptedForSession.has(command)) {
      return "acceptForSession";
    }
    const confirmationTitle = params.reason ?? "Run shell command";
    const decision = await session.pendingCommandApprovals.registerAndFire(entry.toolCallId, () => {
      this._fireApproval(target, {
        type: "chat/toolCallReady" /* ChatToolCallReady */,
        turnId: entry.turnId,
        toolCallId: entry.toolCallId,
        invocationMessage: displayCommand,
        toolInput: displayCommand,
        confirmationTitle
      });
    });
    if (decision === "acceptForSession" && command) {
      session.acceptedForSession.add(command);
    }
    return decision;
  }
  async _handleFileChangeApprovalRequestRpc(params) {
    const decision = await this._requestItemApproval(params.threadId, params.itemId, params.reason ?? "Apply file changes");
    return { result: { decision: narrowFileChangeDecision(decision) } };
  }
  async _handlePermissionsApprovalRequestRpc(params) {
    const decision = await this._requestItemApproval(params.threadId, params.itemId, params.reason ?? "Grant elevated permissions");
    const granted = decision === "accept" || decision === "acceptForSession";
    return {
      result: {
        // Grant exactly what was requested on accept; nothing on decline.
        permissions: granted ? { network: params.permissions.network ?? void 0, fileSystem: params.permissions.fileSystem ?? void 0 } : {},
        scope: decision === "acceptForSession" ? "session" : "turn"
      }
    };
  }
  /**
   * Shared approval flow for item-scoped `requestApproval` requests that
   * don't carry their own command string: look up the host tool call for
   * the item, fire a pending-confirmation `ChatToolCallReady`, and resolve
   * when the user (via {@link respondToPermissionRequest}) decides. Declines
   * if the session or item is unknown.
   */
  async _requestItemApproval(threadId, itemId, confirmationTitle) {
    const target = this._resolveApprovalTarget(threadId);
    if (!target) {
      this._logService.warn(`[Codex] approval request for unknown threadId=${threadId}; declining`);
      return "decline";
    }
    const session = target.session;
    const entry = session.mapState.itemToToolCall.get(itemId);
    if (!entry) {
      this._logService.warn(`[Codex:${session.sessionId}] approval request for unknown itemId=${itemId}; declining`);
      return "decline";
    }
    return session.pendingCommandApprovals.registerAndFire(entry.toolCallId, () => {
      this._fireApproval(target, {
        type: "chat/toolCallReady" /* ChatToolCallReady */,
        turnId: entry.turnId,
        toolCallId: entry.toolCallId,
        invocationMessage: confirmationTitle,
        toolInput: confirmationTitle,
        confirmationTitle
      });
    });
  }
  /**
   * Resolve the {@link ICodexSession} that owns a codex thread for an
   * approval request, plus the subagent wrapper when the thread is a
   * collab-agent child. A subagent tool call's pending-confirmation
   * `ChatToolCallReady` must be fired with the parent `spawnAgent` tool call
   * as its `parentToolCallId` (via {@link _fireApproval}) so it lands in the
   * child's read-only conversation — where the matching
   * `ChatToolCallStart` lives — instead of on the parent session.
   */
  _resolveApprovalTarget(threadId) {
    const subagent = this._subagentsByThreadId.get(threadId);
    if (subagent) {
      return { session: subagent.session, subagent };
    }
    const sessionId = this._sessionIdByThreadId.get(threadId);
    const session = sessionId ? this._sessions.get(sessionId) : void 0;
    return session ? { session } : void 0;
  }
  /** Fire an approval action to the parent session or the subagent conversation. */
  _fireApproval(target, action) {
    if (target.subagent) {
      this._fireSubagent(target.subagent, action);
    } else {
      this._fire(target.session.sessionUri, action);
    }
  }
  _handleGuardianWarning(session, params) {
    const turnId = session.currentTurnId;
    if (turnId === void 0) {
      this._logService.trace(`[Codex:${session.sessionId}] guardianWarning without active turn; ignoring`);
      return [];
    }
    return [{
      type: "chat/responsePart" /* ChatResponsePart */,
      turnId,
      part: {
        kind: "systemNotification" /* SystemNotification */,
        content: params.message
      }
    }];
  }
  async _handleGuardianReviewCompleted(client, params) {
    const sessionId = this._sessionIdByThreadId.get(params.threadId);
    const session = sessionId ? this._sessions.get(sessionId) : void 0;
    if (!session) {
      this._logService.trace(`[Codex] autoApprovalReview/completed for unknown threadId=${params.threadId}; ignoring`);
      return;
    }
    if (params.review.status !== "denied") {
      return;
    }
    if (session.handledGuardianReviews.has(params.reviewId)) {
      return;
    }
    const turnId = this._hostTurnId(session, params.turnId);
    if (session.currentTurnId !== turnId) {
      this._logService.trace(`[Codex:${sessionId}] autoApprovalReview/completed for non-current turn ${turnId} (current=${session.currentTurnId ?? "(none)"}); ignoring reviewId=${params.reviewId}`);
      return;
    }
    session.handledGuardianReviews.add(params.reviewId);
    const summary = summarizeGuardianReviewAction(params.action);
    this._fire(session.sessionUri, {
      type: "chat/responsePart" /* ChatResponsePart */,
      turnId,
      part: {
        kind: "markdown" /* Markdown */,
        id: generateUuid(),
        content: formatGuardianDenialNotification(summary, params.review.rationale)
      }
    });
    const toolCallId = generateUuid();
    const invocationMessage = summary.detail || summary.title;
    const confirmationTitle = "Approve anyway";
    session.pendingGuardianReviewCards.add(toolCallId);
    let decision;
    try {
      decision = await session.pendingCommandApprovals.registerAndFire(toolCallId, () => {
        this._fire(session.sessionUri, {
          type: "chat/toolCallStart" /* ChatToolCallStart */,
          turnId,
          toolCallId,
          toolName: "auto_review_denied",
          displayName: summary.title,
          intention: invocationMessage
        });
        this._fire(session.sessionUri, {
          type: "chat/toolCallReady" /* ChatToolCallReady */,
          turnId,
          toolCallId,
          invocationMessage,
          confirmationTitle
        });
      });
    } catch (err) {
      this._logService.trace(`[Codex:${sessionId}] guardian approval cancelled for reviewId=${params.reviewId}: ${err instanceof Error ? err.message : String(err)}`);
      return;
    } finally {
      session.pendingGuardianReviewCards.delete(toolCallId);
    }
    if (decision !== "accept" && decision !== "acceptForSession") {
      return;
    }
    if (session.currentTurnId !== turnId) {
      this._logService.trace(`[Codex:${sessionId}] turn ended before guardian approval could be applied for reviewId=${params.reviewId}`);
      return;
    }
    try {
      await client.request("thread/approveGuardianDeniedAction", {
        threadId: params.threadId,
        event: toGuardianAssessmentEventJson(params)
      });
      this._fire(session.sessionUri, {
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId,
        toolCallId,
        result: {
          success: true,
          pastTenseMessage: "Approved anyway"
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this._logService.warn(`[Codex:${sessionId}] approveGuardianDeniedAction failed for reviewId=${params.reviewId}: ${message}`);
      this._fire(session.sessionUri, {
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId,
        toolCallId,
        result: {
          success: false,
          pastTenseMessage: "Approval failed",
          error: { message }
        }
      });
    }
  }
  _handleConnectionLost(connection, generation) {
    if (generation !== this._connectionGeneration) {
      return;
    }
    const state = this._connection;
    if (state.kind === "idle" || state.kind === "ready" && state.client !== connection.client) {
      return;
    }
    this._connectionGeneration++;
    this._modelCatalogGeneration++;
    this._connection = { kind: "idle" };
    this._skillHookCustomizationRefresh.clear();
    this._pendingMcpStartupStatuses.clear();
    this._mcpInventory.clear();
    this._applyGlobalMcpInventoryToSessions();
    if (state.kind === "starting") {
      this._disposeConnectionResources(connection);
      return;
    }
    for (const session of this._sessions.values()) {
      if (session.threadId !== void 0) {
        session.needsResume = true;
        session.unsubscribeBeforeResume = false;
      }
      session.pendingCommandApprovals.denyAll("decline");
      session.pendingClientToolCalls.rejectAll(new CancellationError());
      session.pendingUserInputs.rejectAll(new CancellationError());
      this._drainPendingSteering(session);
      const turnId = session.currentTurnId;
      const appTurnId = session.currentAppTurnId;
      session.currentTurnId = void 0;
      session.currentAppTurnId = void 0;
      if (appTurnId) {
        session.hostTurnIdByAppTurnId.delete(appTurnId);
      }
      if (turnId) {
        const duration = this._clearTurnStopWatch(session);
        this._fire(session.sessionUri, {
          type: "chat/error" /* ChatError */,
          turnId,
          duration,
          part: createErrorResponsePart({ errorType: "CodexDisconnected", message: "Codex app-server disconnected; session must restart." })
        });
        this._fire(session.sessionUri, { type: "chat/turnComplete" /* ChatTurnComplete */, turnId, duration });
      }
    }
    for (const subagent of this._subagentsByThreadId.values()) {
      subagent.session.pendingCommandApprovals.denyAll("decline");
      subagent.session.pendingClientToolCalls.rejectAll(new CancellationError());
      subagent.session.pendingUserInputs.rejectAll(new CancellationError());
      subagent.session.currentTurnId = void 0;
      subagent.session.currentAppTurnId = void 0;
    }
    this._subagentsByThreadId.clear();
    this._disposeConnectionResources(connection);
  }
  _disposeConnection() {
    const connection = this._connection;
    this._connectionGeneration++;
    this._connection = { kind: "idle" };
    this._pendingMcpStartupStatuses.clear();
    if (connection.kind === "starting") {
      connection.cancellation.dispose(true);
      return;
    }
    if (connection.kind === "idle") {
      return;
    }
    this._disposeConnectionResources(connection);
  }
  _disposeTransientAccountConnection() {
    this._transientConnectionCancellation?.dispose(true);
    this._transientConnectionCancellation = void 0;
    const connection = this._transientAccountConnection;
    this._transientAccountConnection = void 0;
    if (connection) {
      this._disposeConnectionResources(connection);
    }
  }
  _disposeConnectionResources(connection) {
    if (this._disposedConnections.has(connection)) {
      return;
    }
    this._disposedConnections.add(connection);
    try {
      connection.subscriptions?.dispose();
    } catch {
    }
    try {
      connection.client.dispose();
    } catch {
    }
    try {
      connection.proxyHandle.dispose();
    } catch {
    }
    try {
      connection.child.kill("SIGKILL");
    } catch {
    }
  }
  // #endregion
  // #region IAgent methods
  getDescriptor() {
    return {
      provider: this.id,
      displayName: localize(2448, null),
      description: localize(2447, null),
      capabilities: {
        multipleChats: { fork: true, sideChat: true },
        ...this._isMultiRootEnabled() ? { multipleWorkingDirectories: { immutablePrimary: true } } : {}
      }
    };
  }
  _isMultiRootEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostCodexMultiRootEnabledConfigKey) === true;
  }
  /**
   * Hides the multi-root Folder picker unless several working directories carry
   * a Codex `.codex/hooks.json` hook manifest (see
   * {@link codexDirectoryHasHooks}). With one qualifying directory it pins that
   * folder; with several it shows the picker so the user chooses. This only
   * reads files to decide the picker — it never surfaces them as customizations.
   */
  async computeFolderPickerDecision(workingDirectories, token = CancellationToken.None) {
    if (!this._isMultiRootEnabled()) {
      return void 0;
    }
    return computeFolderPickerDecisionForRoots(workingDirectories, (directory, t) => codexDirectoryHasHooks(this._fileService, directory, t), token);
  }
  /**
   * Resolve a host-addressed Codex chat to the session of the runtime backing
   * it. The binding this agent recorded when the chat was provisioned or
   * restored is the only source of runtime identity. In particular,
   * `context.configurationResource` names the chat's configuration scope, not
   * its backing thread: using it as a fallback for an unbound peer can route a
   * dispose, model change, history read, or turn to the owning session's
   * different conversation. An unaddressable chat therefore surfaces as
   * `undefined` instead of silently routing to some other conversation.
   */
  _resolveConversationSession(address, _sessionOrContext) {
    const sessionId = this._sessionIdByChatUri.get(address.toString());
    if (sessionId) {
      return AgentSession.uri(this.id, sessionId);
    }
    return void 0;
  }
  /**
   * Resolve the configuration scope `chat` is (or was) registered under, for
   * ref-tracking only. Always prefers the scope this agent itself recorded
   * when the chat was tracked (see {@link _trackConfigScopeChat}) — a peer
   * chat's backing runtime can be keyed by its own thread id, which differs
   * from the session/config scope it was created under, so re-deriving the
   * scope from the runtime binding (as {@link _resolveConversationSession}
   * does) would disagree with the scope it was originally counted against.
   * Only for a chat this agent never tracked (e.g. a legacy-recovered or
   * subagent chat) does this fall back to the host-supplied context, and
   * finally to the chat's own address.
   */
  _configScope(chat, context) {
    const tracked = this._configScopeByChat.get(chat.toString());
    if (tracked) {
      return URI.parse(tracked);
    }
    if (context) {
      return resolveAgentChatContext(context, chat).configurationResource;
    }
    return this._resolveConversationSession(chat) ?? chat;
  }
  /**
   * Registers `chat` as live under `configurationResource`'s ref-tracked
   * scope. When an already-bound chat moves between scopes, remove its old
   * membership before publishing the new inverse entry. Returns the old
   * scope when that move emptied it so its resources can be reclaimed.
   */
  _trackConfigScopeChat(configurationResource, chat) {
    const key = configurationResource.toString();
    const chatKey = chat.toString();
    const previousKey = this._configScopeByChat.get(chatKey);
    if (previousKey === key) {
      return void 0;
    }
    let emptiedPreviousScope;
    if (previousKey !== void 0) {
      const previousChats = this._configScopeChats.get(previousKey);
      previousChats?.delete(chatKey);
      if (previousChats?.size === 0) {
        this._configScopeChats.delete(previousKey);
        emptiedPreviousScope = URI.parse(previousKey);
      }
    }
    let chats = this._configScopeChats.get(key);
    if (!chats) {
      chats = /* @__PURE__ */ new Set();
      this._configScopeChats.set(key, chats);
    }
    chats.add(chatKey);
    this._configScopeByChat.set(chatKey, key);
    return emptiedPreviousScope;
  }
  async _moveConfigScopeChat(configurationResource, chat) {
    const emptiedPreviousScope = this._trackConfigScopeChat(configurationResource, chat);
    if (emptiedPreviousScope) {
      await this._reclaimManagedWorkingDirectoryIfNotLive(emptiedPreviousScope);
    }
  }
  /**
   * Drops `chat` from its configuration scope's ref set. Returns `true` once
   * every chat ever registered under that scope has been disposed — the
   * signal that it is safe to reclaim scope-level resources — or `false`
   * while others remain.
   */
  _untrackConfigScopeChat(configurationResource, chat) {
    this._configScopeByChat.delete(chat.toString());
    const key = configurationResource.toString();
    const chats = this._configScopeChats.get(key);
    if (!chats) {
      return true;
    }
    chats.delete(chat.toString());
    if (chats.size > 0) {
      return false;
    }
    this._configScopeChats.delete(key);
    return true;
  }
  /**
   * Reclaims a configuration scope's managed working directory once its ref
   * count has dropped to zero and the scope's own runtime identity
   * (`AgentSession.id(configurationResource)`) is not currently live —
   * mirroring the reclaim a live runtime already performs on its own
   * destructive teardown ({@link _teardownSessionInMemory}), for the case
   * where that runtime was never (or no longer) resident in memory. Every
   * caller of this method (`_disposeChat`'s scope release, and
   * `_disposeRuntimeSession`'s destructive path for an already-gone
   * runtime) is on a destructive-only path, so this also releases the
   * scope's OTel trace context — `sessionUri` here round-trips to the exact
   * key `_traceContext` acquired it under whenever this scope was the
   * runtime's own adopted identity (see {@link ICodexSession.threadId}).
   */
  async _reclaimManagedWorkingDirectoryIfNotLive(sessionUri) {
    const sessionId = AgentSession.id(sessionUri);
    if (this._hasSessionBacking(sessionId)) {
      return;
    }
    this._otelService.releaseSessionTraceContext(sessionUri.toString());
    const overlay = await this._metadataStore.read(sessionUri);
    const managedWorkingDirectory = this._releasedManagedWorkingDirectories.get(sessionId) ?? overlay.managedWorkingDirectory;
    if (managedWorkingDirectory) {
      await this._removeManagedWorkingDirectory(managedWorkingDirectory);
    }
    this._releasedManagedWorkingDirectories.delete(sessionId);
  }
  /**
   * Untracks `chat` from its configuration scope's ref count and, once no
   * chat remains registered under that scope, reclaims the scope's managed
   * working directory. Driven entirely by the ref count reaching zero —
   * never by whether `chat` happens to be "the default chat" or by an
   * Agent-Host-guaranteed teardown order.
   */
  async _releaseConfigScopeIfDone(chat, context) {
    const configurationResource = this._configScope(chat, context);
    if (this._untrackConfigScopeChat(configurationResource, chat)) {
      await this._reclaimManagedWorkingDirectoryIfNotLive(configurationResource);
    }
  }
  /**
   * Record the concrete host chat URI that addresses this runtime.
   */
  _recordChatTarget(chat, sessionUri) {
    const sessionId = AgentSession.id(sessionUri);
    const session = this._sessions.get(sessionId);
    if (session) {
      session.chatChannel = chat;
    }
    this._sessionIdByChatUri.set(chat.toString(), sessionId);
  }
  async _changeAgent(chat, agent, context) {
    const operationContext = resolveAgentChatContext(context, chat);
    const sessionUri = this._resolveConversationSession(chat, operationContext);
    if (!sessionUri) {
      throw new Error(`Codex conversation is not bound: ${chat.toString()}`);
    }
    const session = this._sessions.get(AgentSession.id(sessionUri));
    if (!session) {
      await this._metadataStore.write(sessionUri, { agent: agent ?? null });
      return;
    }
    session.agent = agent;
    await this._metadataStore.write(sessionUri, { agent: agent ?? null });
    if (session.threadId === void 0) {
      return;
    }
    if (!session.firstTurnSent) {
      await this._restartThreadWithCurrentTools(session);
      this._persistMaterializedSession(session);
    } else {
      this._markSessionForReload(session);
    }
  }
  /**
   * Single creation path for every Codex chat (fresh or forked, first or
   * additional). Records the chat→backing binding as part of this call, not
   * as a follow-up assignment.
   *
   * Identity of the new backing: while the owning session has no backing
   * yet, the runtime adopts the session's own identity (kept provisional,
   * see {@link ICodexSession.threadId}); otherwise it is identified by the
   * thread it mints and started eagerly.
   *
   * A fresh create (not a rebind of an already-bound chat) is transactional:
   * a failure anywhere after the config-scope ref is registered — import
   * rejection, model resolution, fork/start-backing, the eager active-client
   * seed, or the server-tool advertise — rolls back every bit of state that
   * step (or an earlier one in this same call) may have committed: the
   * config-scope ref count and any managed working directory it alone was
   * keeping alive, plus, once a runtime was actually registered, that
   * runtime itself, its active-client handle, and its timers. A caller that
   * retries after a failed create must see a clean slate, never a
   * half-registered chat piling onto the next attempt.
   */
  async _createChat(chat, context, options) {
    this._activate();
    const target = { resource: chat, configurationResource: context.configurationResource };
    const owningSessionId = AgentSession.id(context.configurationResource);
    const boundSessionId = this._sessionIdByChatUri.get(chat.toString());
    if (boundSessionId !== void 0) {
      const result = await this._rebindChat(boundSessionId, context, target, options);
      await this._moveConfigScopeChat(context.configurationResource, chat);
      return result;
    }
    this._trackConfigScopeChat(context.configurationResource, chat);
    try {
      if (options?.importConversation) {
        throw new Error("Codex does not support importing an existing conversation into a new chat.");
      }
      if (this._models.get().length === 0) {
        await this.refreshModels();
      }
      this._throwIfShuttingDown();
      const adoptedSessionId = this._hasSessionBacking(owningSessionId) ? void 0 : owningSessionId;
      const session = options?.fork ? await this._forkChatBacking(options.fork, options, adoptedSessionId, target) : adoptedSessionId !== void 0 ? this._deferChatBacking(adoptedSessionId, options, target) : await this._startChatBacking(context, options, target);
      try {
        this._throwIfShuttingDown();
        await this._seedEagerActiveClient(session.sessionUri, chat, context, options?.activeClient);
        this._throwIfShuttingDown();
        if (session.threadId === void 0) {
          this._schedulePrewarm(session);
        }
        this._advertiseServerTools(session, context.configurationResource);
      } catch (err) {
        await this._rollbackRegisteredChatCreation(session, chat);
        throw err;
      }
      this._logService.info(`[Codex] created chat ${chat.toString()} backed by ${session.sessionUri.toString()} thread=${session.threadId ?? "(deferred)"} (session ${context.configurationResource.toString()})`);
      return this._createChatResult(context, session);
    } catch (err) {
      await this._releaseConfigScopeIfDone(chat, context);
      throw err;
    }
  }
  /**
   * Undo a runtime this same {@link _createChat} call just registered, once
   * a later step in that call (the eager active-client seed or the
   * server-tool advertise) fails. Mirrors the destructive
   * {@link _disposeChat} path exactly — same active-client handle removal,
   * same {@link _teardownSessionInMemory} teardown (pending registries,
   * MCP controller, timers, managed working directory, OTel trace context) —
   * but first archives a backing thread minted by the failed call. The host
   * never committed that chat, so leaving its rollout merely unsubscribed
   * would surface an orphan through native thread discovery later.
   */
  async _rollbackRegisteredChatCreation(session, chat) {
    this._removeActiveClientHandlesForChat(chat);
    if (session.threadId !== void 0) {
      await this._archiveThreadBestEffort(session.threadId, "chat creation failed");
    }
    await this._teardownSessionInMemory(session, session.sessionId, true);
    this._sessionIdByChatUri.delete(chat.toString());
  }
  /**
   * Hand back the backing already bound to a chat, refreshed with the
   * caller's resolved options. Creation is idempotent: a second create for an
   * already-bound chat must neither mint a second thread nor leave the
   * runtime unbound.
   */
  async _rebindChat(sessionId, context, target, options) {
    const existing = this._sessions.get(sessionId);
    if (!existing) {
      const backingSession = AgentSession.uri(this.id, sessionId);
      const managedWorkingDirectory = this._releasedManagedWorkingDirectories.get(sessionId);
      return {
        ...isEqual2(backingSession, context.configurationResource) ? {} : { backingSession },
        providerData: encodeCodexChat({
          sessionId,
          ...managedWorkingDirectory ? { ownsManagedWorkingDirectory: true } : {}
        })
      };
    }
    const model = options?.model ? this._resolveCreationModel(options.model) : existing.model;
    const previous = {
      model: existing.model,
      agent: existing.agent,
      configurationResource: existing.configurationResource,
      chatChannel: existing.chatChannel,
      serverToolsAdvertisement: existing.serverToolsAdvertisement
    };
    try {
      existing.model = model;
      if (options?.agent) {
        existing.agent = options.agent;
      }
      existing.configurationResource = context.configurationResource;
      this._recordChatTarget(target.resource, existing.sessionUri);
      await this._seedEagerActiveClient(existing.sessionUri, target.resource, context, options?.activeClient);
      this._throwIfShuttingDown();
      this._advertiseServerTools(existing, context.configurationResource);
    } catch (error) {
      existing.model = previous.model;
      existing.agent = previous.agent;
      existing.configurationResource = previous.configurationResource;
      existing.chatChannel = previous.chatChannel;
      existing.serverToolsAdvertisement = previous.serverToolsAdvertisement;
      throw error;
    }
    return this._createChatResult(context, existing);
  }
  /**
   * Whether a runtime already backs `sessionId` — live, or released but still
   * bound to a chat. A creation adopts the owning session's identity only
   * while it is free; every later chat mints a backing thread of its own.
   */
  _hasSessionBacking(sessionId) {
    if (this._sessions.has(sessionId)) {
      return true;
    }
    for (const boundSessionId of this._sessionIdByChatUri.values()) {
      if (boundSessionId === sessionId) {
        return true;
      }
    }
    return false;
  }
  /**
   * Resolve the model a creation runs with: the caller's explicit selection
   * when the catalog knows it, else the `fallback` a forked chat inherits
   * from its source, else Codex's default. An explicitly requested model the
   * catalog does not know is rejected rather than silently replaced, and the
   * resolved model's provider must be authenticated before any thread work.
   */
  _resolveCreationModel(requested, fallback) {
    const selection = requested ?? fallback;
    const model = this._supportedModelOrUndefined(selection);
    if (selection && !model) {
      throw new Error(`Codex model '${selection.id}' is not available.`);
    }
    this._ensureModelProviderAuthenticated(model);
    return model;
  }
  /**
   * Describe the exact backing this creation bound to the chat.
   *
   * `backingSession` names the app-server thread whenever that thread is a
   * record of its own, so the orchestrator can suppress it from the top-level
   * session list; the session's own record is never reported as an internal
   * chat backing, since that marker would hide the session itself. The
   * result never reports which identity the backing adopted — the
   * orchestrator already owns that session URI and never needs it echoed
   * back.
   */
  _createChatResult(context, session) {
    const backingSession = AgentSession.uri(this.id, session.threadId ?? session.sessionId);
    const managedWorkingDirectory = session.managedWorkingDirectory ?? this._releasedManagedWorkingDirectories.get(session.sessionId);
    return {
      ...session.workingDirectory ? { resolvedWorkingDirectory: session.workingDirectory } : {},
      ...session.threadId === void 0 ? { provisional: true } : {},
      ...isEqual2(backingSession, context.configurationResource) ? {} : { backingSession },
      providerData: encodeCodexChat({
        sessionId: session.sessionId,
        ...session.model ? { model: session.model } : {},
        ...managedWorkingDirectory ? { ownsManagedWorkingDirectory: true } : {}
      })
    };
  }
  /**
   * Register a backing whose codex thread is deferred (see
   * {@link ICodexSession.threadId} for why). `thread/start` happens on
   * prewarm, the first `sendMessage`, or `getChatMetadata` for restore — by
   * which point a managed temp folder can be created lazily if the client
   * gave no working directory, instead of rejecting the creation.
   */
  _deferChatBacking(sessionId, options, target) {
    const model = this._resolveCreationModel(options?.model);
    const multiRootEnabled = this._isMultiRootEnabled();
    const workingDirectories = multiRootEnabled && (options?.workingDirectories?.length ?? 0) > 1 ? distinctWorkingDirectories(options?.workingDirectories) : void 0;
    const clientToolSet = new ActiveClientToolSet();
    const now = Date.now();
    const session = {
      sessionId,
      threadId: void 0,
      sessionUri: AgentSession.uri(this.id, sessionId),
      startTime: now,
      modifiedTime: now,
      summary: void 0,
      chatChannel: target.resource,
      configurationResource: target.configurationResource,
      workingDirectory: options?.workingDirectories?.[0],
      workingDirectories,
      multiRootEnabled,
      managedWorkingDirectory: void 0,
      mapState: createCodexSessionMapState(new Set(this._serverToolHost?.toolNames ?? []), clientToolSet),
      pendingCommandApprovals: new PendingRequestRegistry(),
      acceptedForSession: /* @__PURE__ */ new Set(),
      handledGuardianReviews: /* @__PURE__ */ new Set(),
      pendingGuardianReviewCards: /* @__PURE__ */ new Set(),
      pendingSteeringFlips: /* @__PURE__ */ new Map(),
      clientToolSet,
      pendingClientToolCalls: new PendingRequestRegistry(),
      pendingUserInputs: new PendingRequestRegistry(),
      materializedToolsSig: void 0,
      materializedMcpSig: void 0,
      materializedCustomizationsSig: void 0,
      materializedModelProvider: void 0,
      firstTurnSent: false,
      model,
      agent: options?.agent,
      customizationDirectory: void 0,
      currentTurnId: void 0,
      turnStopWatch: void 0,
      currentAppTurnId: void 0,
      hostTurnIdByAppTurnId: /* @__PURE__ */ new Map(),
      codexTurnIdByHostTurnId: /* @__PURE__ */ new Map(),
      needsResume: false,
      unsubscribeBeforeResume: false,
      resumePromise: void 0,
      lastPromptText: "",
      disposed: false,
      materializePromise: void 0,
      materializedEventFired: false,
      prewarmTimer: void 0,
      prewarmClaimed: false,
      serverToolsAdvertisement: void 0,
      publishedDirectoryCustomizationIds: /* @__PURE__ */ new Set(),
      mcpController: void 0,
      clientCustomizations: new CodexClientCustomizationStore()
    };
    this._sessions.set(sessionId, session);
    this._sessionIdByChatUri.set(target.resource.toString(), sessionId);
    return session;
  }
  /**
   * Start a backing thread now and register the runtime it identifies. Used
   * when the owning session's identity is already taken: the new chat is a
   * top-level codex thread of its own (session id == thread id), so the
   * thread has to exist before the creation can name it as the chat's exact
   * backing. It runs in the host-resolved working directory, or in a managed
   * temp folder when the session has none, and inherits nothing from the
   * parent session beyond the resolved options and its live active clients.
   */
  async _startChatBacking(context, options, target) {
    const owningSessionId = AgentSession.id(context.configurationResource);
    const model = this._resolveCreationModel(options?.model);
    if (!model) {
      throw new Error("Codex has no available models.");
    }
    const hostWorkingDirectory = options?.workingDirectories?.[0];
    const managedWorkingDirectory = hostWorkingDirectory ? void 0 : await this._createManagedWorkingDirectory(`chat-${generateUuid()}`);
    const workingDirectory = hostWorkingDirectory ?? managedWorkingDirectory;
    if (!workingDirectory) {
      throw new Error(`[Codex] createChat: failed to resolve a working directory for session ${context.configurationResource.toString()}`);
    }
    try {
      const resolvedConfig = options?.config ?? {};
      const permissionDefaults = {
        approvalPolicy: codexSessionConfigDefaults["codex.approvalPolicy" /* ApprovalPolicy */],
        sandboxMode: codexSessionConfigDefaults["codex.sandboxMode" /* SandboxMode */]
      };
      const { approvalPolicy, sandboxMode, approvalsReviewer } = resolveCodexPermissions(
        migrateCodexPermissionValues(resolvedConfig, permissionDefaults),
        permissionDefaults
      );
      const scratch = this._createResumedSessionEntry(owningSessionId, "", workingDirectory, model, target);
      const mcpServers = this._buildSessionMcpServers(scratch);
      const dynamicTools = this._buildDynamicTools(scratch);
      const validatedConfig = codexSessionConfigSchema.validateOrDefault(resolvedConfig, codexSessionConfigDefaults);
      const threadConfig = {
        web_search: narrowWebSearchMode(validatedConfig["codex.webSearchMode" /* WebSearchMode */]) ?? codexSessionConfigDefaults["codex.webSearchMode" /* WebSearchMode */]
      };
      if (Object.keys(mcpServers).length > 0) {
        threadConfig.mcp_servers = mcpServers;
      }
      const conn = await this._ensureConnection();
      const resolvedModel = parseCodexModelSelection(model);
      const startResult = await conn.client.request("thread/start", {
        cwd: workingDirectory.fsPath,
        model: resolvedModel.modelId,
        modelProvider: resolvedModel.modelProvider,
        approvalPolicy,
        sandbox: sandboxMode,
        approvalsReviewer,
        config: threadConfig,
        dynamicTools
      });
      const threadId = startResult.thread.id;
      const startedOnCurrentConnection = this._isCurrentConnection(conn);
      const session = this._createResumedSessionEntry(threadId, threadId, workingDirectory, model, target, void 0, void 0, options?.agent);
      session.needsResume = !startedOnCurrentConnection;
      session.firstTurnSent = false;
      session.materializedEventFired = false;
      session.materializedMcpSig = mcpServersSignature(mcpServers);
      session.materializedToolsSig = toolsSignature(session.clientToolSet.merged());
      session.managedWorkingDirectory = managedWorkingDirectory;
      this._sessions.set(threadId, session);
      this._sessionIdByThreadId.set(threadId, threadId);
      this._sessionIdByChatUri.set(target.resource.toString(), threadId);
      this._flushPendingMcpStartupStatuses(threadId);
      this._applyMcpInventoryToSession(session);
      this._persistMaterializedSession(session);
      return session;
    } catch (err) {
      if (managedWorkingDirectory) {
        await this._removeManagedWorkingDirectory(managedWorkingDirectory);
      }
      throw err;
    }
  }
  /**
   * Re-attach a chat's backing thread on restore. The orchestrator
   * hands back the opaque `providerData` produced by
   * {@link _createChat}; we rebuild a resumable session entry keyed
   * by the backing thread id and bind it to the chat URI before its history is
   * read. Its first send issues a `thread/resume`.
   */
  materializeChat(chat, context, providerData) {
    return this._chatLifecycleSequencer.queue(chat.toString(), () => this._materializeChat(chat, context, providerData));
  }
  async _materializeChat(chat, context, providerData) {
    this._activate();
    const operationContext = resolveAgentChatContext(context, chat);
    const target = { resource: chat, configurationResource: operationContext.configurationResource };
    let decoded;
    if (providerData === void 0) {
      if (!isDefaultChatUri(chat)) {
        return;
      }
      decoded = { sessionId: AgentSession.id(operationContext.configurationResource) };
    } else {
      decoded = decodeCodexChat(providerData);
      if (!decoded) {
        this._logService.warn(`[Codex] materializeChat: dropping corrupt providerData for ${chat.toString()}`);
        return;
      }
    }
    const previousScope = this._configScopeByChat.get(chat.toString());
    const previousBinding = this._sessionIdByChatUri.get(chat.toString());
    const sessionId = decoded.sessionId;
    let existing;
    let previousExistingState;
    let session;
    try {
      await this._moveConfigScopeChat(operationContext.configurationResource, chat);
      this._throwIfShuttingDown();
      existing = this._sessions.get(sessionId);
      if (existing) {
        previousExistingState = {
          chatChannel: existing.chatChannel,
          configurationResource: existing.configurationResource,
          serverToolsAdvertisement: existing.serverToolsAdvertisement
        };
        existing.chatChannel = chat;
        existing.configurationResource = operationContext.configurationResource;
        this._sessionIdByChatUri.set(chat.toString(), existing.sessionId);
        if (existing.threadId) {
          this._routeRestoredThreadToSession(existing.threadId, existing.sessionId);
        }
        this._advertiseServerTools(existing, operationContext.configurationResource);
        return providerData === void 0 ? { providerData: encodeCodexChat(decoded) } : void 0;
      }
      const sessionUri = AgentSession.uri(this.id, sessionId);
      const overlay = await this._metadataStore.read(sessionUri);
      this._throwIfShuttingDown();
      const threadId = overlay.threadId ?? sessionId;
      const managedWorkingDirectory = this._releasedManagedWorkingDirectories.get(sessionId) ?? overlay.managedWorkingDirectory;
      const workingDirectory = overlay.cwd ?? managedWorkingDirectory;
      if (this._models.get().length === 0) {
        await this.refreshModels();
      }
      this._throwIfShuttingDown();
      const model = this._supportedModelOrUndefined(overlay.modelId ? { id: overlay.modelId } : decoded.model);
      session = this._createResumedSessionEntry(sessionId, threadId, workingDirectory, model, target, void 0, void 0, overlay.agent);
      if (managedWorkingDirectory) {
        session.managedWorkingDirectory = managedWorkingDirectory;
      }
      this._releasedManagedWorkingDirectories.delete(sessionId);
      this._sessions.set(sessionId, session);
      this._routeRestoredThreadToSession(threadId, sessionId);
      this._sessionIdByChatUri.set(chat.toString(), sessionId);
      this._advertiseServerTools(session, operationContext.configurationResource);
      if (providerData === void 0) {
        return { providerData: encodeCodexChat(decoded) };
      }
    } catch (error) {
      if (existing && previousExistingState) {
        existing.chatChannel = previousExistingState.chatChannel;
        existing.configurationResource = previousExistingState.configurationResource;
        existing.serverToolsAdvertisement = previousExistingState.serverToolsAdvertisement;
      }
      if (session && this._sessions.get(sessionId) === session) {
        if (session.managedWorkingDirectory) {
          this._releasedManagedWorkingDirectories.set(sessionId, session.managedWorkingDirectory);
        }
        await this._teardownSessionInMemory(session, sessionId, false);
      }
      if (previousBinding === void 0) {
        this._sessionIdByChatUri.delete(chat.toString());
      } else {
        this._sessionIdByChatUri.set(chat.toString(), previousBinding);
      }
      const currentScope = this._configScopeByChat.get(chat.toString());
      if (currentScope !== void 0) {
        this._untrackConfigScopeChat(URI.parse(currentScope), chat);
      }
      if (previousScope !== void 0) {
        this._trackConfigScopeChat(URI.parse(previousScope), chat);
      }
      throw error;
    }
  }
  async recoverLegacyChat(chat, context) {
    this._activate();
    const operationContext = resolveAgentChatContext(context, chat);
    const sessionId = AgentSession.id(operationContext.configurationResource);
    this._recordChatTarget(chat, AgentSession.uri(this.id, sessionId));
    return { providerData: encodeCodexChat({ sessionId }) };
  }
  /**
   * Seed the active client supplied with {@link IAgentChats.createChat} before the agent
   * host asks for the initial customization snapshot. The initial state is
   * assigned directly rather than dispatched as `session/activeClientSet`, so
   * without this step Codex would not receive the client's tools or
   * customizations until a later turn happened to re-register the client.
   *
   * `chat` is the one exact chat this seed applies to — the chat the
   * creating call is binding. The agent never invents a chat URI to stand in
   * for it, and never propagates the seed to any sibling chat.
   */
  async _seedEagerActiveClient(sessionUri, chat, context, activeClient) {
    if (!activeClient) {
      return;
    }
    const key = `${chat.toString()}\0${activeClient.clientId}`;
    const hadHandle = this._activeClientHandles.has(key);
    const handle = this.getOrCreateActiveClient(chat, context, { clientId: activeClient.clientId, displayName: activeClient.displayName });
    const previousTools = handle.tools;
    try {
      handle.tools = activeClient.tools;
      if (activeClient.customizations !== void 0) {
        await this._syncClientCustomizations(sessionUri, activeClient.clientId, activeClient.customizations, { quiet: true });
        handle.commitCustomizations(activeClient.customizations);
      }
    } catch (error) {
      handle.tools = previousTools;
      if (!hadHandle) {
        handle.remove();
        this._activeClientHandles.delete(key);
      }
      throw error;
    }
  }
  /**
   * Build an {@link ICodexSession} entry for a thread that already exists on
   * the app-server (a restored session or a freshly forked one). Such a
   * session skips materialization — its first {@link _sendMessage} issues a
   * `thread/resume` (`needsResume: true`) — so the prewarm/first-turn flags
   * are pre-set to their post-materialization values.
   *
   * `sessionUri` is *derived* from `sessionId` rather than supplied — see
   * {@link ICodexSession.sessionUri} for why that must always hold.
   */
  _createResumedSessionEntry(sessionId, threadId, workingDirectory, model, target, workingDirectories, multiRootEnabled, agent, materializedModelProvider) {
    const clientToolSet = new ActiveClientToolSet();
    const effectiveWorkingDirectories = distinctWorkingDirectories(workingDirectories);
    const now = Date.now();
    return {
      sessionId,
      threadId,
      sessionUri: AgentSession.uri(this.id, sessionId),
      startTime: now,
      modifiedTime: now,
      summary: void 0,
      chatChannel: target?.resource,
      configurationResource: target?.configurationResource ?? AgentSession.uri(this.id, sessionId),
      workingDirectory: effectiveWorkingDirectories?.[0] ?? workingDirectory,
      workingDirectories: effectiveWorkingDirectories,
      multiRootEnabled: multiRootEnabled ?? (effectiveWorkingDirectories?.length ?? 0) > 1,
      managedWorkingDirectory: void 0,
      mapState: createCodexSessionMapState(new Set(this._serverToolHost?.toolNames ?? []), clientToolSet),
      pendingCommandApprovals: new PendingRequestRegistry(),
      acceptedForSession: /* @__PURE__ */ new Set(),
      handledGuardianReviews: /* @__PURE__ */ new Set(),
      pendingGuardianReviewCards: /* @__PURE__ */ new Set(),
      pendingSteeringFlips: /* @__PURE__ */ new Map(),
      clientToolSet,
      pendingClientToolCalls: new PendingRequestRegistry(),
      pendingUserInputs: new PendingRequestRegistry(),
      materializedToolsSig: void 0,
      materializedMcpSig: void 0,
      materializedCustomizationsSig: void 0,
      materializedModelProvider,
      firstTurnSent: true,
      model,
      agent,
      customizationDirectory: void 0,
      currentTurnId: void 0,
      turnStopWatch: void 0,
      currentAppTurnId: void 0,
      hostTurnIdByAppTurnId: /* @__PURE__ */ new Map(),
      codexTurnIdByHostTurnId: /* @__PURE__ */ new Map(),
      needsResume: true,
      unsubscribeBeforeResume: false,
      resumePromise: void 0,
      lastPromptText: "",
      disposed: false,
      materializePromise: void 0,
      materializedEventFired: true,
      prewarmTimer: void 0,
      prewarmClaimed: true,
      serverToolsAdvertisement: void 0,
      publishedDirectoryCustomizationIds: /* @__PURE__ */ new Set(),
      mcpController: void 0,
      clientCustomizations: new CodexClientCustomizationStore()
    };
  }
  /**
   * Fork the exact source chat's backing thread into a new backing for the
   * chat being created.
   *
   * `fork.source` resolves solely through the exact-chat binding this agent
   * recorded when the source chat was created or materialized — never
   * through a host-supplied session hint or chat-URI shape. An unbound
   * source therefore fails fast rather than guessing its owning session.
   *
   * We `thread/fork` the source thread — which copies its full history — then
   * `thread/rollback` the trailing turns so the fork retains only the turns up
   * to and including `fork.turnId`. The forked thread already exists on the
   * app-server, so the runtime is registered as resumable (its first send
   * issues a `thread/resume`).
   *
   * `adoptedSessionId`, when set, is the owning session's identity this
   * backing adopts (the session's runtime is stood up by this fork); otherwise
   * the runtime is keyed by the forked thread id, preserving the Codex
   * convention that a chat-owned session id equals its thread id.
   */
  async _forkChatBacking(fork2, options, adoptedSessionId, target) {
    const sourceSessionUri = this._resolveConversationSession(fork2.source);
    if (!sourceSessionUri) {
      throw new Error(`Cannot fork codex chat ${fork2.source.toString()}: backing thread could not be resolved`);
    }
    const sourceSession = this._sessions.get(AgentSession.id(sourceSessionUri));
    if (sourceSession?.needsResume) {
      await this._resumeSession(sourceSession);
    }
    const sourceRead = await this._readSession(sourceSessionUri);
    if (!sourceRead) {
      throw new Error(`Cannot fork codex chat ${fork2.source.toString()}: source thread could not be read`);
    }
    const sourceThreadId = sourceRead.thread.id;
    const sourceTurns = sourceRead.thread.turns ?? [];
    const sourceOverlay = sourceSession ? void 0 : await this._metadataStore.read(sourceSessionUri);
    const sourceManagedWorkingDirectory = sourceSession?.managedWorkingDirectory ?? this._releasedManagedWorkingDirectories.get(AgentSession.id(sourceSessionUri)) ?? sourceOverlay?.managedWorkingDirectory;
    const sourcePrimary = sourceRead.thread.cwd ? URI.file(sourceRead.thread.cwd) : options?.workingDirectories?.[0];
    const sourceStoredWorkingDirectories = sourceSession?.workingDirectories ?? sourceRead.persistedWorkingDirectories;
    const inheritedWorkingDirectories = sourcePrimary ? distinctWorkingDirectories([sourcePrimary, ...sourceStoredWorkingDirectories?.slice(1) ?? []]) : void 0;
    const multiRootEnabled = sourceSession?.multiRootEnabled ?? (inheritedWorkingDirectories?.length ?? 0) > 1;
    const runtimeWorkspaceRoots = multiRootEnabled && inheritedWorkingDirectories && inheritedWorkingDirectories.length > 1 ? distinctAbsolutePaths(inheritedWorkingDirectories.map((directory) => directory.fsPath)) : void 0;
    const codexTurnId = sourceSession?.codexTurnIdByHostTurnId.get(fork2.turnId) ?? fork2.turnId;
    const fallbackTurnIndex = fork2.turnIndex ?? -1;
    const boundary = resolveForkBoundary(sourceTurns.map((t) => t.id), codexTurnId, fallbackTurnIndex);
    if (!boundary.resolved) {
      throw new Error(`Cannot fork codex session ${sourceThreadId}: unable to resolve fork boundary for turn ${fork2.turnId} (turnIndex=${fallbackTurnIndex}, turns=${sourceTurns.length})`);
    }
    const { keepThroughIndex, numTurnsToDrop } = boundary;
    const inheritedModel = sourceSession?.model ?? (sourceRead.persistedModelId ? { id: sourceRead.persistedModelId } : void 0) ?? this._models.get().find((candidate) => parseCodexModelSelection(candidate).modelProvider === sourceRead.thread.modelProvider);
    const model = this._resolveCreationModel(options?.model, inheritedModel);
    const resolvedModel = model ? parseCodexModelSelection(model) : void 0;
    const sourceConfigValues = this._configurationService.getSessionConfigValues(sourceSessionUri.toString());
    const forkDefaults = {
      approvalPolicy: codexSessionConfigDefaults["codex.approvalPolicy" /* ApprovalPolicy */],
      sandboxMode: codexSessionConfigDefaults["codex.sandboxMode" /* SandboxMode */]
    };
    const { approvalPolicy, sandboxMode, approvalsReviewer } = resolveCodexPermissions(
      migrateCodexPermissionValues({ ...sourceConfigValues, ...options?.config }, forkDefaults),
      forkDefaults
    );
    const forkManagedWorkingDirectory = sourceManagedWorkingDirectory ? await this._createManagedWorkingDirectory(`fork-${generateUuid()}`) : void 0;
    if (forkManagedWorkingDirectory && sourceManagedWorkingDirectory) {
      try {
        await fs11.promises.cp(sourceManagedWorkingDirectory.fsPath, forkManagedWorkingDirectory.fsPath, { recursive: true });
      } catch (err) {
        await this._removeManagedWorkingDirectory(forkManagedWorkingDirectory);
        throw err;
      }
    }
    let forkResult;
    let forkConnection;
    try {
      forkConnection = sourceSession ? (await this._ensureThreadConnection(sourceSession)).connection : await this._ensureConnection();
      forkResult = await forkConnection.client.request("thread/fork", {
        threadId: sourceThreadId,
        ...forkManagedWorkingDirectory ? {
          cwd: forkManagedWorkingDirectory.fsPath
        } : runtimeWorkspaceRoots?.length ? {
          cwd: runtimeWorkspaceRoots[0],
          runtimeWorkspaceRoots
        } : {},
        ...resolvedModel ? { model: resolvedModel.modelId, modelProvider: resolvedModel.modelProvider } : {},
        config: { "features.image_generation": this._imageGenerationEnabledForModelProvider(resolvedModel?.modelProvider ?? sourceRead.thread.modelProvider) },
        approvalPolicy,
        sandbox: sandboxMode,
        approvalsReviewer
      });
    } catch (err) {
      if (forkManagedWorkingDirectory) {
        await this._removeManagedWorkingDirectory(forkManagedWorkingDirectory);
      }
      throw err;
    }
    const newThreadId = forkResult.thread.id;
    if (numTurnsToDrop > 0) {
      try {
        await forkConnection.client.request("thread/rollback", { threadId: newThreadId, numTurns: numTurnsToDrop });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this._logService.warn(`[Codex:${newThreadId}] fork rollback failed (numTurns=${numTurnsToDrop}); discarding fork: ${message}`);
        await this._archiveThreadBestEffort(newThreadId, "fork rollback failed", forkConnection);
        if (forkManagedWorkingDirectory) {
          await this._removeManagedWorkingDirectory(forkManagedWorkingDirectory);
        }
        throw new Error(`Failed to fork codex session ${sourceThreadId}: could not roll back forked thread ${newThreadId} to the requested turn (${message})`);
      }
    }
    const sessionId = adoptedSessionId ?? newThreadId;
    const workingDirectory = forkManagedWorkingDirectory ?? (forkResult.cwd ? URI.file(forkResult.cwd) : sourceRead.thread.cwd ? URI.file(sourceRead.thread.cwd) : options?.workingDirectories?.[0]);
    const forkWorkingDirectories = multiRootEnabled ? distinctWorkingDirectories(
      forkResult.runtimeWorkspaceRoots?.length ? forkResult.runtimeWorkspaceRoots.map((path) => URI.file(path)) : inheritedWorkingDirectories
    ) : void 0;
    const session = this._createResumedSessionEntry(
      sessionId,
      newThreadId,
      workingDirectory,
      model,
      target,
      forkWorkingDirectories,
      multiRootEnabled,
      options?.agent ?? sourceSession?.agent,
      forkResult.thread.modelProvider ?? resolvedModel?.modelProvider ?? sourceRead.thread.modelProvider
    );
    session.managedWorkingDirectory = forkManagedWorkingDirectory;
    this._sessions.set(sessionId, session);
    this._sessionIdByThreadId.set(newThreadId, sessionId);
    this._sessionIdByChatUri.set(target.resource.toString(), sessionId);
    this._flushPendingMcpStartupStatuses(newThreadId);
    this._applyMcpInventoryToSession(session);
    void this._refreshMcpInventory(forkConnection.client, newThreadId);
    this._persistMaterializedSession(session);
    if (fork2.turnIdMapping && fork2.turnIdMapping.size > 0) {
      try {
        const forkedRead = await this._readSession(session.sessionUri);
        const forkedTurns = forkedRead?.thread.turns ?? [];
        const entries = planForkedTurnIdMap(
          sourceTurns.map((t) => t.id),
          forkedTurns.map((t) => t.id),
          keepThroughIndex,
          sourceSession?.hostTurnIdByAppTurnId,
          fork2.turnIdMapping
        );
        for (const [hostTurnId, forkedCodexTurnId] of entries) {
          session.codexTurnIdByHostTurnId.set(hostTurnId, forkedCodexTurnId);
        }
      } catch (err) {
        this._logService.warn(`[Codex:${newThreadId}] failed to seed forked turn-id map: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    this._logService.info(`[Codex] forked chat ${target.resource.toString()} from ${fork2.source.toString()}: thread ${sourceThreadId} \u2192 ${newThreadId} (kept ${sourceTurns.length - numTurnsToDrop}/${sourceTurns.length} turns)`);
    return session;
  }
  /**
   * Lazily start (or resume) a codex thread for `session`. Idempotent:
   * if `threadId` is already populated, just returns. Called from
   * `sendMessage` before the first `turn/start`.
   */
  async _materializeIfNeeded(session, configResource = session.configurationResource, fireMaterializedEvent = true) {
    if (session.disposed || !session.chatChannel) {
      return;
    }
    this._advertiseServerTools(session, configResource);
    if (session.threadId !== void 0) {
      if (fireMaterializedEvent) {
        this._fireMaterialized(session);
      }
      return;
    }
    if (session.materializePromise) {
      await session.materializePromise;
      if (fireMaterializedEvent) {
        this._fireMaterialized(session);
      }
      return;
    }
    session.materializePromise = this._materialize(session, configResource).finally(() => {
      session.materializePromise = void 0;
    });
    await session.materializePromise;
    if (fireMaterializedEvent) {
      this._fireMaterialized(session);
    }
  }
  _traceContext(session) {
    return this._otelService.getSessionTraceContext(session.sessionId, session.sessionUri.toString());
  }
  async _createManagedWorkingDirectory(ownerId2) {
    const directory = URI.file(join(os6.tmpdir(), "vscode-agent-codex", ownerId2));
    await fs11.promises.mkdir(directory.fsPath, { recursive: true });
    return directory;
  }
  async _removeManagedWorkingDirectory(directory) {
    try {
      await fs11.promises.rm(directory.fsPath, { recursive: true, force: true });
    } catch (err) {
      this._logService.info(`[Codex] failed to remove managed temp folder ${directory.fsPath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  /**
   * Abandon this session's own managed temp folder ahead of adopting a
   * different (host- or user-supplied) working directory. Clears the
   * in-memory field, removes the folder from disk via its known explicit
   * path, and persists the clear so a later reclaim — this process or a
   * future one restored from the same overlay — never has to infer a
   * managed path from `cwd` again. Must run before `session.workingDirectory`
   * is overwritten, so the folder being abandoned is never confused with the
   * folder being adopted.
   */
  async _abandonManagedWorkingDirectory(session) {
    const directory = session.managedWorkingDirectory;
    if (!directory) {
      return;
    }
    session.managedWorkingDirectory = void 0;
    await this._removeManagedWorkingDirectory(directory);
    await this._metadataStore.write(session.sessionUri, { managedWorkingDirectory: null, ownsManagedWorkingDirectory: false });
  }
  async _materialize(session, configResource) {
    if (session.disposed || !session.chatChannel) {
      return;
    }
    await this._customizationEnablementService.initializeSession(configResource.toString());
    if (session.disposed || !session.chatChannel) {
      return;
    }
    if (!session.workingDirectory) {
      const managedWorkingDirectory = await this._createManagedWorkingDirectory(session.sessionId);
      if (session.disposed || !session.chatChannel) {
        await this._removeManagedWorkingDirectory(managedWorkingDirectory);
        return;
      }
      session.workingDirectory = managedWorkingDirectory;
      session.managedWorkingDirectory = managedWorkingDirectory;
      this._logService.info(`[Codex] no working directory supplied for session=${session.sessionUri.toString()}; using managed temp folder ${session.workingDirectory.fsPath}`);
    }
    await this._refreshSessionMcpDiscovery(session);
    if (session.disposed || !session.chatChannel) {
      return;
    }
    const config = this._readSessionConfig(configResource);
    const model = await this._resolveModel(session);
    if (session.disposed || !session.chatChannel) {
      return;
    }
    const { approvalPolicy, sandboxMode, approvalsReviewer } = this._resolveSessionPermissions(configResource);
    const mcpServers = this._buildSessionMcpServers(session);
    const customizationLaunch = await this._buildCustomizationLaunch(session);
    if (session.disposed || !session.chatChannel) {
      return;
    }
    const resolvedModel = parseCodexModelSelection(model);
    const threadConfig = {
      web_search: narrowWebSearchMode(config["codex.webSearchMode" /* WebSearchMode */]) ?? codexSessionConfigDefaults["codex.webSearchMode" /* WebSearchMode */],
      ...customizationLaunch.config,
      "features.image_generation": this._imageGenerationEnabledForModelProvider(resolvedModel.modelProvider)
    };
    const mcpServerNames = Object.keys(mcpServers);
    if (mcpServerNames.length > 0) {
      threadConfig.mcp_servers = mcpServers;
      this._logService.info(`[Codex] thread/start for session=${session.sessionUri.toString()} with ${mcpServerNames.length} MCP server(s): ${mcpServerNames.join(", ")}`);
    }
    const multiRootActive = this._isMultiRootActive(session);
    const runtimeWorkspaceRoots = multiRootActive ? this._runtimeWorkspaceRoots(session) : void 0;
    const selectedCapabilityRoots = [
      ...multiRootActive ? await this._selectedCapabilityRoots(session) : [],
      ...customizationLaunch.selectedCapabilityRoots
    ];
    if (session.disposed || !session.chatChannel) {
      return;
    }
    const conn = await this._ensureConnection();
    const startResult = await conn.client.request("thread/start", {
      cwd: session.workingDirectory.fsPath,
      ...runtimeWorkspaceRoots?.length ? { runtimeWorkspaceRoots } : {},
      ...selectedCapabilityRoots.length ? { selectedCapabilityRoots } : {},
      model: resolvedModel.modelId,
      modelProvider: resolvedModel.modelProvider,
      approvalPolicy,
      sandbox: sandboxMode,
      approvalsReviewer,
      config: threadConfig,
      developerInstructions: customizationLaunch.developerInstructions,
      dynamicTools: this._buildDynamicTools(session)
    }, this._traceContext(session));
    const threadId = startResult.thread.id;
    const startedOnCurrentConnection = this._isCurrentConnection(conn);
    if (multiRootActive && !session.workingDirectories && startResult.runtimeWorkspaceRoots?.length) {
      session.workingDirectories = startResult.runtimeWorkspaceRoots.map((path) => URI.file(path));
      session.workingDirectory = session.workingDirectories[0];
    }
    if (session.disposed) {
      await this._archiveThreadBestEffort(threadId, "chat was disposed while thread/start was in flight", conn);
      return;
    }
    session.threadId = threadId;
    session.needsResume = !startedOnCurrentConnection;
    session.materializedMcpSig = mcpServersSignature(mcpServers);
    session.materializedCustomizationsSig = customizationLaunch.signature;
    session.materializedToolsSig = toolsSignature(session.clientToolSet.merged());
    session.materializedModelProvider = resolvedModel.modelProvider;
    this._sessionIdByThreadId.set(session.threadId, session.sessionId);
    this._flushPendingMcpStartupStatuses(session.threadId);
    this._applyMcpInventoryToSession(session);
    this._advertiseServerTools(session, configResource);
    void this._refreshSkillHookCustomizations(session);
    void this._refreshSkillExtraRoots();
  }
  /**
   * Restarts a pre-turn Codex thread so current `dynamicTools`, MCP servers, and customizations are applied at `thread/start`.
   * Only safe before history exists; the first send remains responsible for publishing materialization.
   */
  async _restartThreadWithCurrentTools(session, configResource = session.configurationResource) {
    const conn = this._connection;
    const oldThreadId = session.threadId;
    this._logService.info(`[Codex:${session.sessionId}] restarting thread ${oldThreadId} to apply client tools [${session.clientToolSet.merged().map((t) => t.name).join(", ") || "(none)"}]`);
    if (oldThreadId !== void 0) {
      this._removeThreadRouteIfOwned(oldThreadId, session.sessionId);
      this._mcpInventory.deleteThread(oldThreadId);
      if (conn.kind === "ready") {
        try {
          await conn.client.request("thread/unsubscribe", { threadId: oldThreadId });
        } catch (err) {
          this._logService.info(`[Codex:${oldThreadId}] thread/unsubscribe during tool restart failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
    session.threadId = void 0;
    this._applyMcpInventoryToSession(session);
    session.materializePromise = void 0;
    await this._materializeIfNeeded(session, configResource, false);
  }
  _fireMaterialized(session) {
    if (session.disposed || !session.chatChannel) {
      return;
    }
    if (session.materializedEventFired) {
      return;
    }
    session.materializedEventFired = true;
    const chat = session.chatChannel;
    this._onDidMaterializeChat.fire({
      chat,
      project: void 0,
      workingDirectories: session.workingDirectories ?? (session.workingDirectory ? [session.workingDirectory] : void 0),
      // providerData records the runtime's own durable id, not the
      // app-server thread id — see {@link ICodexPersistedChat}. The
      // thread id is still reported as `backingSession`.
      ...session.threadId ? {
        result: {
          providerData: encodeCodexChat({
            sessionId: session.sessionId,
            ...session.model ? { model: session.model } : {},
            ...session.managedWorkingDirectory ? { ownsManagedWorkingDirectory: true } : {}
          }),
          backingSession: AgentSession.uri(this.id, session.threadId)
        }
      } : {}
    });
  }
  _schedulePrewarm(session) {
    if (!session.workingDirectory) {
      return;
    }
    if (this._worktree.isWorkingDirectoryPending(AgentSession.id(session.sessionUri))) {
      return;
    }
    void (async () => {
      if (!await this._isSdkResolvableWithoutDownload()) {
        this._logService.info(`[Codex] SDK not downloaded yet; skipping prewarm for session=${session.sessionUri.toString()} until a message triggers the download`);
        return;
      }
      await this._materializeIfNeeded(session, session.configurationResource, false);
      if (session.prewarmClaimed || session.threadId === void 0) {
        return;
      }
      this._logService.info(`[Codex] prewarm ready session=${session.sessionUri.toString()} threadId=${session.threadId}`);
      const prewarmTimer = setTimeout(() => {
        void this._expirePrewarm(session);
      }, CodexPrewarmTtlMs);
      session.prewarmTimer = prewarmTimer;
    })().catch((err) => {
      this._logService.warn(`[Codex] prewarm failed session=${session.sessionUri.toString()}: ${err instanceof Error ? err.message : String(err)}`);
    });
  }
  async _expirePrewarm(session) {
    if (session.disposed || session.prewarmClaimed || session.threadId === void 0) {
      return;
    }
    const threadId = session.threadId;
    session.threadId = void 0;
    this._removeThreadRouteIfOwned(threadId, session.sessionId);
    this._mcpInventory.deleteThread(threadId);
    this._applyMcpInventoryToSession(session);
    try {
      const conn = await this._ensureConnection();
      await conn.client.request("thread/unsubscribe", { threadId });
      this._logService.info(`[Codex] prewarm TTL eviction session=${session.sessionUri.toString()} threadId=${threadId}`);
    } catch (err) {
      this._logService.warn(`[Codex] prewarm TTL eviction failed session=${session.sessionUri.toString()} threadId=${threadId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  _persistMaterializedSession(session) {
    if (session.disposed || !session.threadId || !session.prewarmClaimed) {
      return;
    }
    const multiRootActive = this._isMultiRootActive(session);
    const fields = {
      threadId: session.threadId,
      cwd: session.workingDirectory,
      modelId: session.model?.id,
      agent: session.agent,
      workingDirectories: multiRootActive ? session.workingDirectories : void 0,
      ownsManagedWorkingDirectory: session.managedWorkingDirectory !== void 0,
      managedWorkingDirectory: session.managedWorkingDirectory ?? null
    };
    void this._metadataStore.write(session.sessionUri, fields);
    if (multiRootActive) {
      const canonicalSessionUri = AgentSession.uri(this.id, session.threadId);
      if (!isEqual2(session.sessionUri, canonicalSessionUri)) {
        void this._metadataStore.write(canonicalSessionUri, fields);
      }
    }
  }
  async _persistSessionModel(session) {
    if (session.disposed || !session.model) {
      return;
    }
    const fields = { modelId: session.model.id };
    await this._metadataStore.write(session.sessionUri, fields);
    if (this._isMultiRootActive(session)) {
      const canonicalSessionUri = AgentSession.uri(this.id, session.threadId ?? session.sessionId);
      if (canonicalSessionUri.toString() !== session.sessionUri.toString()) {
        await this._metadataStore.write(canonicalSessionUri, fields);
      }
    }
  }
  _claimPrewarm(session) {
    session.prewarmClaimed = true;
    if (session.prewarmTimer) {
      clearTimeout(session.prewarmTimer);
      session.prewarmTimer = void 0;
    }
  }
  async _adoptWorkingDirectoryBeforeSend(session, workingDirectory) {
    if (!workingDirectory || isEqual2(session.workingDirectory, workingDirectory)) {
      return;
    }
    if (session.prewarmClaimed) {
      if (session.threadId === void 0 && !session.materializePromise) {
        await this._abandonManagedWorkingDirectory(session);
        session.workingDirectory = workingDirectory;
        if (this._isMultiRootActive(session)) {
          session.workingDirectories = distinctWorkingDirectories([
            workingDirectory,
            ...session.workingDirectories?.slice(1) ?? []
          ]);
        }
      }
      return;
    }
    this._claimPrewarm(session);
    const materializePromise = session.materializePromise;
    if (materializePromise) {
      try {
        await materializePromise;
      } catch (err) {
        this._logService.info(`[Codex] stale prewarm failed before working directory changed for session=${session.sessionUri.toString()}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    const threadId = session.threadId;
    if (threadId !== void 0) {
      session.threadId = void 0;
      this._removeThreadRouteIfOwned(threadId, session.sessionId);
      this._mcpInventory.deleteThread(threadId);
      const conn = this._connection;
      if (conn.kind === "ready") {
        try {
          await conn.client.request("thread/unsubscribe", { threadId });
        } catch (err) {
          this._logService.warn(`[Codex] stale prewarm unsubscribe failed session=${session.sessionUri.toString()} threadId=${threadId}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
    await this._abandonManagedWorkingDirectory(session);
    session.workingDirectory = workingDirectory;
  }
  _startTurnStopWatch(session) {
    const stopWatch = StopWatch.create(false);
    session.turnStopWatch = stopWatch;
    return stopWatch;
  }
  _clearTurnStopWatch(session) {
    const elapsed = session.turnStopWatch?.elapsed();
    session.turnStopWatch = void 0;
    return typeof elapsed === "number" && Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  }
  async _sendMessage(chat, prompt, attachments, turnId, workingDirectories, context) {
    const operationContext = context ? resolveAgentChatContext(context, chat) : void 0;
    const sessionUri = this._resolveConversationSession(chat, context);
    if (!sessionUri) {
      throw new Error(`Codex conversation is not bound: ${chat.toString()}`);
    }
    const sessionId = AgentSession.id(sessionUri);
    const session = this._sessions.get(sessionId);
    if (!session) {
      throw new Error(`Codex session not found: ${sessionUri.toString()} (chat=${chat.toString()}, binding=${this._sessionIdByChatUri.get(chat.toString()) ?? "none"}, sessions=${[...this._sessions.keys()].join(",") || "none"})`);
    }
    const configResource = operationContext?.configurationResource ?? sessionUri;
    this._ensureModelProviderAuthenticated(session.model);
    await this._adoptWorkingDirectoryBeforeSend(session, workingDirectories?.[0]);
    if (workingDirectories) {
      session.workingDirectories = session.multiRootEnabled && workingDirectories.length > 1 ? distinctWorkingDirectories([
        session.workingDirectory ?? workingDirectories[0],
        ...workingDirectories.slice(1)
      ]) : workingDirectories;
    }
    await this._refreshSessionMcpDiscovery(session);
    const effectiveTurnId = turnId ?? generateUuid();
    try {
      this._claimPrewarm(session);
      await this._materializeIfNeeded(session, configResource, true);
      this._persistMaterializedSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this._logService.error(`[Codex:${sessionId}] materialize failed: ${message}`);
      const duration = this._clearTurnStopWatch(session);
      this._fire(sessionUri, {
        type: "chat/error" /* ChatError */,
        turnId: effectiveTurnId,
        duration,
        part: createErrorResponsePart({ errorType: "CodexMaterializeFailed", message })
      });
      this._fire(sessionUri, { type: "chat/turnComplete" /* ChatTurnComplete */, turnId: effectiveTurnId, duration });
      return;
    }
    let conn = await this._ensureConnection();
    if (!session.firstTurnSent && !session.needsResume) {
      const baselineWorkingDirectories = session.workingDirectories ?? (session.workingDirectory ? [session.workingDirectory] : void 0);
      this._checkpointService.captureBaselineCheckpoint(configResource, baselineWorkingDirectories).catch((err) => {
        this._logService.warn(`[Codex:${sessionId}] Baseline checkpoint capture failed: ${err instanceof Error ? err.message : String(err)}`);
      });
    }
    const customizationLaunch = await this._buildCustomizationLaunch(session);
    const toolsChanged = toolsSignature(session.clientToolSet.merged()) !== session.materializedToolsSig;
    const mcpChanged = mcpServersSignature(this._buildSessionMcpServers(session)) !== session.materializedMcpSig;
    const customizationsChanged = customizationLaunch.signature !== session.materializedCustomizationsSig;
    if (session.firstTurnSent && mcpChanged) {
      this._markSessionForReload(session);
    }
    if (!session.firstTurnSent && !session.needsResume && (toolsChanged || mcpChanged || customizationsChanged)) {
      try {
        await this._restartThreadWithCurrentTools(session, configResource);
        this._persistMaterializedSession(session);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this._logService.error(`[Codex:${sessionId}] tool re-materialize failed: ${message}`);
        const duration = this._clearTurnStopWatch(session);
        this._fire(sessionUri, {
          type: "chat/error" /* ChatError */,
          turnId: effectiveTurnId,
          duration,
          part: createErrorResponsePart({ errorType: "CodexMaterializeFailed", message })
        });
        this._fire(sessionUri, { type: "chat/turnComplete" /* ChatTurnComplete */, turnId: effectiveTurnId, duration });
        return;
      }
    } else if (session.firstTurnSent && !session.needsResume && customizationsChanged) {
      this._markSessionForReload(session);
    }
    try {
      if (session.needsResume) {
        await this._resumeSession(session, conn);
      }
      conn = (await this._ensureThreadConnection(session, conn)).connection;
    } catch (err) {
      const duration = this._clearTurnStopWatch(session);
      this._fire(sessionUri, {
        type: "chat/error" /* ChatError */,
        turnId: effectiveTurnId,
        duration,
        part: createErrorResponsePart({
          errorType: "CodexResumeFailed",
          message: err instanceof Error ? err.message : String(err)
        })
      });
      this._fire(sessionUri, { type: "chat/turnComplete" /* ChatTurnComplete */, turnId: effectiveTurnId, duration });
      return;
    }
    let cleanupPaths = [];
    let turnRequestStarted = false;
    const isCompactCommand = parseLeadingSlashCommand(prompt)?.command === CODEX_COMPACT_SLASH_COMMAND;
    try {
      if (isCompactCommand) {
        await this._ensureCurrentLaunchBeforeTurn(session, configResource, conn);
        conn = (await this._ensureThreadConnection(session, conn)).connection;
        const threadId2 = session.threadId;
        session.lastPromptText = prompt;
        session.currentTurnId = effectiveTurnId;
        session.modifiedTime = Date.now();
        this._startTurnStopWatch(session);
        turnRequestStarted = true;
        await conn.client.request("thread/compact/start", { threadId: threadId2 }, this._traceContext(session));
        session.firstTurnSent = true;
        return;
      }
      const resolvedInput = resolveCodexInput(prompt, attachments);
      cleanupPaths = resolvedInput.cleanupPaths;
      const model = await this._resolveModel(session);
      const resolvedModel = parseCodexModelSelection(model);
      const currentCustomizationLaunch = await this._ensureCurrentLaunchBeforeTurn(session, configResource, conn);
      conn = (await this._ensureThreadConnection(session, conn)).connection;
      const threadId = session.threadId;
      const turnOptions = this._turnStartOptions(session, resolvedModel.modelId, currentCustomizationLaunch.developerInstructions, configResource);
      const hostInstructions = resolveAgentHostInstructions(operationContext);
      session.lastPromptText = prompt;
      session.currentTurnId = effectiveTurnId;
      session.modifiedTime = Date.now();
      this._startTurnStopWatch(session);
      turnRequestStarted = true;
      await conn.client.request("turn/start", {
        threadId,
        input: resolvedInput.input.slice(),
        model: resolvedModel.modelId,
        ...turnOptions,
        ...hostInstructions?.length ? {
          additionalContext: {
            "vscode.agentHost": { kind: "application", value: hostInstructions.join("\n\n") }
          }
        } : {}
      }, this._traceContext(session));
      session.firstTurnSent = true;
    } catch (err) {
      if (turnRequestStarted && session.currentTurnId !== effectiveTurnId) {
        return;
      }
      if (turnRequestStarted) {
        session.currentTurnId = void 0;
        session.currentAppTurnId = void 0;
      }
      if (err instanceof CancellationError) {
        this._fire(sessionUri, { type: "chat/turnCancelled" /* ChatTurnCancelled */, turnId: effectiveTurnId, duration: this._clearTurnStopWatch(session) });
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      const operation = isCompactCommand ? "thread/compact/start" : "turn/start";
      this._logService.error(`[Codex:${sessionId}] ${operation} error: ${message}`);
      const duration = this._clearTurnStopWatch(session);
      this._fire(sessionUri, {
        type: "chat/error" /* ChatError */,
        turnId: effectiveTurnId,
        duration,
        part: createErrorResponsePart({ errorType: isCompactCommand ? "CodexCompactionError" : "CodexTurnError", ...extractForwardedErrorInfo(message) })
      });
      this._fire(sessionUri, { type: "chat/turnComplete" /* ChatTurnComplete */, turnId: effectiveTurnId, duration });
    } finally {
      if (cleanupPaths.length > 0) {
        setTimeout(() => {
          for (const p of cleanupPaths) {
            try {
              fs11.unlinkSync(p);
            } catch {
            }
          }
        }, 3e4);
      }
    }
  }
  async _ensureCurrentLaunchBeforeTurn(session, configResource, conn) {
    let previousUnresolvedState;
    while (true) {
      if (session.disposed) {
        throw new CancellationError();
      }
      const customizationLaunch = await this._buildCustomizationLaunch(session);
      if (session.disposed) {
        throw new CancellationError();
      }
      const mcpSignature = mcpServersSignature(this._buildSessionMcpServers(session));
      const toolSignature = toolsSignature(session.clientToolSet.merged());
      if (mcpSignature === session.materializedMcpSig && (session.firstTurnSent || toolSignature === session.materializedToolsSig) && customizationLaunch.signature === session.materializedCustomizationsSig) {
        return customizationLaunch;
      }
      const unresolvedState = JSON.stringify({
        threadId: session.threadId,
        materializedMcp: session.materializedMcpSig,
        materializedTools: session.materializedToolsSig,
        materializedCustomizations: session.materializedCustomizationsSig,
        targetMcp: mcpSignature,
        targetTools: toolSignature,
        targetCustomizations: customizationLaunch.signature
      });
      if (unresolvedState === previousUnresolvedState) {
        throw new Error(`Codex launch configuration did not converge for session ${session.sessionId}`);
      }
      previousUnresolvedState = unresolvedState;
      if (session.firstTurnSent) {
        this._markSessionForReload(session);
        await this._resumeSession(session, conn);
      } else {
        await this._restartThreadWithCurrentTools(session, configResource);
        this._persistMaterializedSession(session);
      }
      if (session.disposed) {
        throw new CancellationError();
      }
    }
  }
  setPendingMessages(chat, steeringMessage, _queuedMessages) {
    if (!steeringMessage) {
      return;
    }
    const sessionUri = this._resolveConversationSession(chat);
    if (!sessionUri) {
      return;
    }
    const sessionId = AgentSession.id(sessionUri);
    const session = this._sessions.get(sessionId);
    if (!session) {
      return;
    }
    if (session.pendingSteeringFlips.has(steeringMessage.id)) {
      return;
    }
    const appTurnId = session.currentAppTurnId;
    const conn = this._connection;
    const text = steeringMessage.message.text;
    const hasContent = text.length > 0 || (steeringMessage.message.attachments?.length ?? 0) > 0;
    if (!appTurnId || conn.kind !== "ready" || session.threadId === void 0 || !hasContent) {
      this._fireSteeringConsumed(session, steeringMessage.id);
      return;
    }
    const { input } = resolveCodexInput(text, steeringMessage.message.attachments);
    const threadId = session.threadId;
    session.pendingSteeringFlips.set(steeringMessage.id, steeringMessage);
    void conn.client.request("turn/steer", {
      threadId,
      input: input.slice(),
      expectedTurnId: appTurnId
    }).catch((err) => {
      if (session.pendingSteeringFlips.delete(steeringMessage.id)) {
        this._fireSteeringConsumed(session, steeringMessage.id);
      }
      if (err instanceof JsonRpcError) {
        this._logService.info(`[Codex:${sessionId}] turn/steer skipped: ${err.message}`);
        return;
      }
      this._logService.warn(`[Codex:${sessionId}] turn/steer failed: ${err instanceof Error ? err.message : String(err)}`);
    });
  }
  async _abort(chat, context) {
    const operationContext = resolveAgentChatContext(context, chat);
    const sessionUri = this._resolveConversationSession(chat, operationContext);
    if (!sessionUri) {
      return;
    }
    const sessionId = AgentSession.id(sessionUri);
    const session = this._sessions.get(sessionId);
    if (!session) {
      return;
    }
    this._drainPendingSteering(session);
    if (!session.currentAppTurnId || session.threadId === void 0) {
      return;
    }
    const threadId = session.threadId;
    const conn = this._connection;
    if (conn.kind !== "ready") {
      return;
    }
    try {
      await conn.client.request("turn/interrupt", {
        threadId,
        turnId: session.currentAppTurnId
      });
    } catch (err) {
      this._logService.warn(`[Codex:${sessionId}] turn/interrupt failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  /**
   * Drop the active-client handles addressed to exactly this chat. Called
   * on disposal so a departing chat never leaks its handles in
   * {@link _activeClientHandles} — there is no sibling inference, so a
   * sibling chat's handles are left untouched.
   */
  _removeActiveClientHandlesForChat(chat) {
    const prefix = `${chat.toString()}\0`;
    for (const [key, handle] of this._activeClientHandles) {
      if (key.startsWith(prefix)) {
        handle.remove();
        this._activeClientHandles.delete(key);
      }
    }
  }
  async _disposeChat(chat, context) {
    const operationContext = resolveAgentChatContext(context, chat);
    const runtimeSession = this._resolveConversationSession(chat, operationContext);
    this._removeActiveClientHandlesForChat(chat);
    if (runtimeSession) {
      this._sessionIdByChatUri.delete(chat.toString());
    }
    await this._releaseConfigScopeIfDone(chat, operationContext);
    if (!runtimeSession) {
      return;
    }
    await this._disposeRuntimeSession(runtimeSession, true);
  }
  async _releaseChat(chat, context) {
    const operationContext = resolveAgentChatContext(context, chat);
    const runtimeSession = this._resolveConversationSession(chat, operationContext);
    if (!runtimeSession) {
      return;
    }
    await this._disposeRuntimeSession(runtimeSession, false);
  }
  /**
   * Tear down the runtime backing a chat, addressed by the runtime's own
   * session URI. `deleteManagedWorkingDirectory` distinguishes the
   * destructive {@link IAgentChats.disposeChat} path from the
   * non-destructive {@link IAgentChats.releaseChat} (idle-eviction) path.
   *
   * Only a release (`deleteManagedWorkingDirectory === false`) no-ops for
   * runtimes with nothing durable to resume from (provisional runtimes whose
   * codex thread was never started — evicting them from memory would lose
   * their only copy of state) and for runtimes with a turn in flight —
   * `thread/unsubscribe` mid-turn would drop live progress. A destructive
   * dispose has no durable state to preserve either way, so it always tears
   * a provisional runtime down; leaving one behind would leak its pending
   * registries, MCP controller, prewarm timer, and (once claimed) managed
   * working directory, and would let a still-running prewarm continuation
   * materialize a thread for a chat the host already considers gone.
   */
  async _disposeRuntimeSession(sessionUri, deleteManagedWorkingDirectory) {
    const sessionId = AgentSession.id(sessionUri);
    const session = this._sessions.get(sessionId);
    if (!session) {
      if (deleteManagedWorkingDirectory) {
        await this._reclaimManagedWorkingDirectoryIfNotLive(sessionUri);
      }
      return;
    }
    if (!deleteManagedWorkingDirectory) {
      if (session.threadId === void 0 || session.currentTurnId !== void 0) {
        return;
      }
    }
    if (session.threadId !== void 0) {
      this._logService.info(`[Codex:${session.threadId}] Releasing idle session from memory (durable state preserved)`);
    } else {
      this._logService.info(`[Codex] Disposing provisional session ${session.sessionUri.toString()} (codex thread never started)`);
    }
    if (!deleteManagedWorkingDirectory && session.managedWorkingDirectory) {
      this._releasedManagedWorkingDirectories.set(sessionId, session.managedWorkingDirectory);
    }
    await this._teardownSessionInMemory(session, sessionId, deleteManagedWorkingDirectory);
  }
  /**
   * Shared in-memory teardown for a codex session: drops the tracked entry,
   * disposes its MCP controller, unparks pending approvals / client tool calls
   * / user inputs, and unsubscribes the codex thread (`thread/unsubscribe`).
   * The codex thread's on-disk rollout is always preserved (there is no
   * app-server delete), so a released session can still be resumed later —
   * but a destructive `deleteManagedWorkingDirectory` also releases this
   * runtime's retained OTel trace context (see {@link _traceContext}), since
   * that context is scoped to this exact runtime's lifetime, not to its
   * durable rollout. Idle eviction must not release it: a released runtime
   * is expected to be re-addressed later and should keep the same trace
   * parent when it is. Shared by the destructive chat-dispose path (which
   * the orchestrator pairs with durable deletion) and the non-destructive
   * chat-release (idle eviction) path.
   */
  async _teardownSessionInMemory(session, sessionId, deleteManagedWorkingDirectory) {
    session.disposed = true;
    this._claimPrewarm(session);
    this._sessions.delete(sessionId);
    this._releaseMcpPublisher(session);
    session.mcpController?.dispose();
    this._sessionMcpDiscoveries.get(sessionId)?.dispose();
    this._sessionMcpDiscoveries.delete(sessionId);
    if (!session.clientCustomizations.isEmpty()) {
      void this._refreshSkillExtraRoots();
    }
    if (deleteManagedWorkingDirectory && session.managedWorkingDirectory) {
      await this._removeManagedWorkingDirectory(session.managedWorkingDirectory);
    }
    if (deleteManagedWorkingDirectory) {
      this._releasedManagedWorkingDirectories.delete(sessionId);
      this._otelService.releaseSessionTraceContext(session.sessionUri.toString());
    }
    if (session.customizationDirectory) {
      const dir = session.customizationDirectory.fsPath;
      fs11.promises.rm(dir, { recursive: true, force: true }).catch((err) => {
        this._logService.info(`[Codex] failed to remove customization folder ${dir}: ${err instanceof Error ? err.message : String(err)}`);
      });
    }
    if (session.threadId !== void 0) {
      this._removeThreadRouteIfOwned(session.threadId, sessionId);
      this._mcpInventory.deleteThread(session.threadId);
    }
    session.pendingCommandApprovals.denyAll("decline");
    session.pendingClientToolCalls.rejectAll(new CancellationError());
    session.pendingUserInputs.rejectAll(new CancellationError());
    this._drainPendingSteering(session);
    for (const [childThreadId, subagent] of this._subagentsByThreadId) {
      if (subagent.parentSessionId === sessionId) {
        subagent.session.pendingCommandApprovals.denyAll("decline");
        this._subagentsByThreadId.delete(childThreadId);
      }
    }
    const conn = this._connection;
    if (conn.kind === "ready" && session.threadId !== void 0) {
      const threadId = session.threadId;
      try {
        await conn.client.request("thread/unsubscribe", { threadId });
      } catch (err) {
        this._logService.info(`[Codex:${threadId}] thread/unsubscribe failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
  async _changeModel(chat, model, context) {
    const operationContext = resolveAgentChatContext(context, chat);
    const sessionUri = this._resolveConversationSession(chat, operationContext);
    if (!sessionUri) {
      return;
    }
    const supported = this._supportedModelOrUndefined(model);
    if (!supported) {
      throw new Error(`Codex model '${model.id}' is not available.`);
    }
    this._ensureModelProviderAuthenticated(supported);
    const session = this._sessions.get(AgentSession.id(sessionUri));
    if (!session) {
      await this._metadataStore.write(sessionUri, { modelId: supported.id });
      return;
    }
    const previousProvider = session.materializedModelProvider ?? (session.model ? parseCodexModelSelection(session.model).modelProvider : void 0);
    const nextProvider = parseCodexModelSelection(supported).modelProvider;
    session.model = supported;
    if (previousProvider !== void 0 && previousProvider !== nextProvider) {
      await this._resetSessionForModelProviderChange(session, nextProvider);
    }
    await this._persistSessionModel(session);
    this._persistMaterializedSession(session);
  }
  /**
   * Truncate the chat Agent Host addresses, not the session it belongs to.
   *
   * Codex backs every chat with its own thread, so the rollback target is the
   * runtime bound to `chat` — resolved through the recorded binding, never by
   * re-deriving membership from its configuration scope or URI shape.
   *
   * Codex rolls back by a count of trailing turns. Resolve how many turns
   * follow `turnId` (or all of them when omitted) from the persisted thread,
   * whose turn ids match the workbench's restored turn ids (see
   * {@link replayThreadToTurns}). Unknown ids no-op to avoid data loss.
   */
  async truncateChat(chat, turnId, context) {
    const targetUri = this._resolveConversationSession(chat, context);
    if (!targetUri) {
      return;
    }
    const targetSession = this._sessions.get(AgentSession.id(targetUri));
    if (targetSession?.needsResume) {
      await this._resumeSession(targetSession);
    }
    const read2 = await this._readSession(targetUri);
    if (!read2) {
      return;
    }
    const turns = read2.thread.turns ?? [];
    if (turns.length === 0) {
      return;
    }
    let numTurns;
    if (turnId === void 0) {
      numTurns = turns.length;
    } else {
      const codexTurnId = targetSession?.codexTurnIdByHostTurnId.get(turnId) ?? turnId;
      const index = turns.findIndex((t) => t.id === codexTurnId);
      if (index === -1) {
        this._logService.warn(`[Codex] truncateChat: turnId ${turnId} not found in thread ${read2.thread.id}; skipping`);
        return;
      }
      numTurns = turns.length - (index + 1);
    }
    if (numTurns <= 0) {
      return;
    }
    try {
      const conn = targetSession ? (await this._ensureThreadConnection(targetSession)).connection : await this._ensureConnection();
      await conn.client.request("thread/rollback", { threadId: read2.thread.id, numTurns });
    } catch (err) {
      this._logService.warn(`[Codex:${read2.thread.id}] thread/rollback failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async onArchivedChanged(sessionUri, isArchived) {
    const threadId = await this._resolveThreadId(sessionUri);
    if (threadId === void 0) {
      return;
    }
    try {
      await this._withOnDemandConnection(async (client) => {
        if (isArchived) {
          await client.request("thread/archive", { threadId });
        } else {
          await client.request("thread/unarchive", { threadId });
        }
      });
    } catch (err) {
      this._logService.warn(`[Codex:${threadId}] thread/${isArchived ? "archive" : "unarchive"} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  /** Resolve the codex thread id for a session: in-memory → persisted overlay → legacy URI identity. */
  async _resolveThreadId(sessionUri) {
    const existing = this._sessions.get(AgentSession.id(sessionUri));
    if (existing?.threadId !== void 0) {
      return existing.threadId;
    }
    const overlay = await this._metadataStore.read(sessionUri);
    return overlay.threadId ?? AgentSession.id(sessionUri);
  }
  respondToPermissionRequest(requestId, approved) {
    const sessions = [
      ...this._sessions.values(),
      ...[...this._subagentsByThreadId.values()].map((s) => s.session)
    ];
    for (const session of sessions) {
      if (session.pendingCommandApprovals.respond(requestId, approved ? "accept" : "decline")) {
        if (!approved) {
          session.mapState.declinedToolCalls.add(requestId);
        }
        return;
      }
    }
    this._logService.info(`[Codex] respondToPermissionRequest: unknown requestId=${requestId}`);
  }
  respondToUserInputRequest(requestId, response, answers) {
    for (const session of this._sessions.values()) {
      if (session.pendingUserInputs.respond(requestId, { response, answers })) {
        return;
      }
    }
    this._logService.info(`[Codex] respondToUserInputRequest: unknown requestId=${requestId}`);
  }
  /**
   * Reconstruct the turns of an addressed chat from its backing thread's
   * persisted rollout. Chat-addressed only: the owning session comes from the
   * recorded binding or the host-supplied context, never from the URI.
   */
  async _getChatMessages(chat, context) {
    const operationContext = resolveAgentChatContext(context, chat);
    const sessionUri = this._resolveConversationSession(chat, operationContext);
    if (!sessionUri) {
      return [];
    }
    const session = this._sessions.get(AgentSession.id(sessionUri));
    if (session?.needsResume) {
      try {
        await this._resumeSession(session);
      } catch (error) {
        if (!(error instanceof JsonRpcError) || !/no rollout found for thread id/i.test(error.message)) {
          throw error;
        }
        await this._replaceMissingRolloutBacking(session, operationContext.configurationResource);
      }
    }
    const read2 = await this._readSession(sessionUri);
    return read2 ? replayThreadToTurns(read2.thread, toRolloutTurnModels(read2.rolloutMetadata), read2.rolloutMetadata?.threadCoordinationByTurnId) : [];
  }
  /**
   * Replace a restored thread that app-server never persisted. `thread/start`
   * assigns an id before the first provider turn, but no rollout exists until
   * that turn begins. A host-only peer transcript can therefore outlive its
   * empty backing across a restart. Keep the stable host runtime identity and
   * mint a fresh thread; there is no provider history to discard.
   */
  async _replaceMissingRolloutBacking(session, configurationResource) {
    const missingThreadId = session.threadId;
    if (!missingThreadId) {
      return;
    }
    this._logService.info(`[Codex:${session.sessionId}] replacing unpersisted thread ${missingThreadId}`);
    this._removeThreadRouteIfOwned(missingThreadId, session.sessionId);
    this._mcpInventory.deleteThread(missingThreadId);
    session.threadId = void 0;
    session.needsResume = false;
    session.unsubscribeBeforeResume = false;
    session.firstTurnSent = false;
    session.materializePromise = void 0;
    session.materializedToolsSig = void 0;
    session.materializedMcpSig = void 0;
    session.materializedCustomizationsSig = void 0;
    session.materializedModelProvider = void 0;
    session.materializedEventFired = false;
    session.hostTurnIdByAppTurnId.clear();
    session.codexTurnIdByHostTurnId.clear();
    this._applyMcpInventoryToSession(session);
    await this._materializeIfNeeded(session, configurationResource, true);
    this._persistMaterializedSession(session);
  }
  async _resumeSession(session, connection) {
    while (session.needsResume || session.resumePromise) {
      if (session.resumePromise) {
        try {
          await session.resumePromise;
        } catch (error) {
          if (error instanceof CodexConnectionReplacedError) {
            connection = void 0;
            continue;
          }
          throw error;
        }
        continue;
      }
      const unsubscribeBeforeResume = session.unsubscribeBeforeResume;
      session.needsResume = false;
      session.unsubscribeBeforeResume = false;
      const preferredConnection = connection;
      connection = void 0;
      let resumeConnection;
      session.resumePromise = (async () => {
        const threadId = session.threadId;
        if (!threadId) {
          throw new Error(`Cannot resume Codex session ${session.sessionId}: no backing thread`);
        }
        if (session.disposed) {
          throw new CancellationError();
        }
        const conn = preferredConnection && this._isCurrentConnection(preferredConnection) ? preferredConnection : await this._ensureConnection();
        resumeConnection = conn;
        await this._refreshSessionMcpDiscovery(session);
        this._assertCurrentConnection(conn);
        if (unsubscribeBeforeResume) {
          await conn.client.request("thread/unsubscribe", { threadId });
        }
        const mcpServers = this._buildSessionMcpServers(session);
        const customizationLaunch = await this._buildCustomizationLaunch(session);
        const multiRootActive = this._isMultiRootActive(session);
        const runtimeWorkspaceRoots = multiRootActive ? this._runtimeWorkspaceRoots(session) : void 0;
        const resolvedModel = parseCodexModelSelection(await this._resolveModel(session));
        if (session.disposed) {
          throw new CancellationError();
        }
        this._assertCurrentConnection(conn);
        const resumeResult = await conn.client.request(
          "thread/resume",
          buildCodexResumeParams(
            resolvedModel.modelProvider,
            threadId,
            mcpServers,
            runtimeWorkspaceRoots,
            customizationLaunch.config,
            customizationLaunch.developerInstructions,
            this._imageGenerationEnabledForModelProvider(resolvedModel.modelProvider)
          ),
          this._traceContext(session)
        );
        this._assertCurrentConnection(conn);
        if (session.disposed) {
          try {
            await conn.client.request("thread/unsubscribe", { threadId });
          } catch (err) {
            this._logService.info(`[Codex:${threadId}] thread/unsubscribe after disposed resume failed: ${err instanceof Error ? err.message : String(err)}`);
          }
          throw new CancellationError();
        }
        if (multiRootActive && !session.workingDirectories && resumeResult.runtimeWorkspaceRoots?.length) {
          session.workingDirectories = resumeResult.runtimeWorkspaceRoots.map((path) => URI.file(path));
          session.workingDirectory = session.workingDirectories[0];
        }
        session.materializedMcpSig = mcpServersSignature(mcpServers);
        session.materializedCustomizationsSig = customizationLaunch.signature;
        void this._refreshMcpInventory(conn.client, threadId);
      })().catch((err) => {
        if (!session.disposed) {
          session.needsResume = true;
          session.unsubscribeBeforeResume ||= unsubscribeBeforeResume;
        }
        if (err instanceof CodexConnectionReplacedError || resumeConnection !== void 0 && !this._isCurrentConnection(resumeConnection)) {
          throw new CodexConnectionReplacedError();
        }
        throw err;
      }).finally(() => {
        session.resumePromise = void 0;
      });
      try {
        await session.resumePromise;
      } catch (error) {
        if (error instanceof CodexConnectionReplacedError) {
          continue;
        }
        throw error;
      }
    }
  }
  /**
   * Return a thread id together with the exact persistent connection on which
   * that thread is loaded. A reconnect between resume and the caller's request
   * restarts the loop instead of handing an unloaded replacement to the caller.
   */
  async _ensureThreadConnection(session, preferredConnection) {
    while (true) {
      if (session.disposed) {
        throw new CancellationError();
      }
      const threadId = session.threadId;
      if (!threadId) {
        throw new Error(`Cannot use Codex session ${session.sessionId}: no backing thread`);
      }
      const connection = preferredConnection && this._isCurrentConnection(preferredConnection) ? preferredConnection : await this._ensureConnection();
      preferredConnection = void 0;
      if (session.needsResume || session.resumePromise) {
        await this._resumeSession(session, connection);
      }
      if (this._isCurrentConnection(connection) && !session.needsResume && !session.resumePromise && session.threadId === threadId) {
        return { threadId, connection };
      }
    }
  }
  _isCurrentConnection(connection) {
    return this._connection.kind === "ready" && this._connection.client === connection.client;
  }
  _assertCurrentConnection(connection) {
    if (!this._isCurrentConnection(connection)) {
      throw new CodexConnectionReplacedError();
    }
  }
  /**
   * Archive a thread that the host never committed, retrying once on the
   * replacement app-server when the connection that created it has gone away.
   * Cleanup is best-effort so its failure never hides the original create,
   * fork, or disposal error.
   */
  async _archiveThreadBestEffort(threadId, reason, preferredConnection) {
    let lastError = "unknown error";
    for (let attempt = 0; attempt < 2; attempt++) {
      let connection;
      try {
        connection = attempt === 0 && preferredConnection && this._isCurrentConnection(preferredConnection) ? preferredConnection : await this._ensureConnection();
        await connection.client.request("thread/archive", { threadId });
        return;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        if (attempt === 0 && connection && !this._isCurrentConnection(connection) && !this._isShuttingDown && !this._store.isDisposed) {
          continue;
        }
        break;
      }
    }
    this._logService.warn(`[Codex:${threadId}] failed to archive backing after ${reason}: ${lastError}`);
  }
  _markSessionForReload(session) {
    session.unsubscribeBeforeResume = true;
    session.needsResume = true;
  }
  /**
   * Describe a host-addressed chat. `providerData` is the opaque backing
   * this agent minted for the chat, so it — not the addressed chat URI —
   * names the runtime to restore (they coincide for a session-backing
   * runtime and differ for anything re-keyed onto another conversation).
   *
   * The registered entry is deliberately keyed and addressed by that backing
   * id: `_createResumedSessionEntry` derives its `sessionUri`, so this can
   * never mint an entry whose key and URI disagree. The *addressed* chat
   * URI stays host-facing only — it labels the returned metadata, while the
   * context's `configurationResource` names the session the host's server
   * tools are advertised on.
   */
  async getChatMetadata(chat, context, providerData, options) {
    if (options?.activation === "restore") {
      this._activate();
    }
    const session = resolveAgentChatContext(context, chat).configurationResource;
    const backing = providerData ? decodeCodexChat(providerData) : void 0;
    const sessionId = backing?.sessionId ?? AgentSession.id(session);
    const live = this._sessions.get(sessionId);
    if (live) {
      this._advertiseServerTools(live, session);
      return {
        chat,
        startTime: live.startTime,
        modifiedTime: live.modifiedTime,
        summary: live.summary,
        workingDirectories: live.workingDirectories ?? (live.workingDirectory ? [live.workingDirectory] : void 0),
        ...live.model ? { model: live.model } : {}
      };
    }
    if (!this._activated) {
      return options?.registryFallback ? { chat, ...options.registryFallback } : void 0;
    }
    const backingUri = backing ? AgentSession.uri(this.id, backing.sessionId) : session;
    const read2 = await this._readSession(backingUri, false);
    if (!read2) {
      return void 0;
    }
    const metadata = this._withWorkingDirectories(
      await this._threadToMetadata(read2.thread, chat, read2.rolloutMetadata),
      read2.persistedWorkingDirectories
    );
    if (!this._sessions.has(sessionId)) {
      const workingDirectory = read2.thread.cwd ? URI.file(read2.thread.cwd) : void 0;
      const threadId = read2.thread.id;
      const overlay = await this._metadataStore.read(backingUri);
      const restoredModel = metadata.model ?? (read2.persistedModelId ? { id: read2.persistedModelId } : void 0);
      const materializedModelProvider = read2.rolloutMetadata?.selectedModel?.modelProvider ?? read2.rolloutMetadata?.originModelProvider ?? read2.thread.modelProvider;
      const restored = this._createResumedSessionEntry(sessionId, threadId, workingDirectory, restoredModel, void 0, metadata.workingDirectories, void 0, overlay.agent, materializedModelProvider);
      restored.startTime = metadata.startTime || restored.startTime;
      restored.modifiedTime = metadata.modifiedTime || restored.modifiedTime;
      restored.summary = metadata.summary;
      if (overlay.managedWorkingDirectory && workingDirectory && isEqual2(overlay.managedWorkingDirectory, workingDirectory)) {
        restored.managedWorkingDirectory = workingDirectory;
      }
      this._sessions.set(sessionId, restored);
      this._routeRestoredThreadToSession(threadId, sessionId);
      if (restoredModel && parseCodexModelSelection(restoredModel).modelProvider !== materializedModelProvider) {
        this._pendingMcpStartupStatuses.delete(threadId);
        await this._resetSessionForModelProviderChange(restored, parseCodexModelSelection(restoredModel).modelProvider);
      } else {
        this._flushPendingMcpStartupStatuses(threadId);
        this._applyMcpInventoryToSession(restored);
      }
      this._advertiseServerTools(restored, session);
    }
    return metadata;
  }
  _readSession(session, includeTurns = true) {
    const readFromCurrentConnection = async () => {
      while (!this._store.isDisposed) {
        try {
          return await this._doReadSession(session, includeTurns);
        } catch (error) {
          if (!(error instanceof CodexConnectionReplacedError)) {
            throw error;
          }
        }
      }
      return void 0;
    };
    return this._sessions.has(AgentSession.id(session)) ? readFromCurrentConnection() : this._coldSessionReadLimiter.queue(readFromCurrentConnection);
  }
  async _doReadSession(session, includeTurns) {
    const sessionId = AgentSession.id(session);
    const existing = this._sessions.get(sessionId);
    let threadId = existing?.threadId;
    let persistedWorkingDirectories = existing?.workingDirectories;
    let persistedModelId = existing?.model?.id;
    if (threadId === void 0) {
      const overlay = await this._metadataStore.read(session);
      threadId = overlay.threadId ?? sessionId;
      persistedWorkingDirectories = overlay.workingDirectories;
      persistedModelId = overlay.modelId;
    }
    const conn = existing?.threadId ? (await this._ensureThreadConnection(existing)).connection : await this._ensureConnection();
    const readThread = async (candidateThreadId) => {
      const response = await conn.client.request("thread/read", {
        threadId: candidateThreadId,
        includeTurns
      });
      this._assertCurrentConnection(conn);
      const rolloutMetadata = await this._readCodexRolloutMetadata(response.thread);
      this._assertCurrentConnection(conn);
      return { ...response, persistedWorkingDirectories, persistedModelId, rolloutMetadata };
    };
    try {
      if (!existing && threadId !== sessionId) {
        try {
          const original = await readThread(sessionId);
          if (original.rolloutMetadata?.isDesktop) {
            const originalModel = toRolloutModelSelection(original.rolloutMetadata.selectedModel);
            await this._metadataStore.write(session, {
              threadId: original.thread.id,
              cwd: original.thread.cwd ? URI.file(original.thread.cwd) : void 0,
              modelId: originalModel?.id
            });
            return {
              ...original,
              persistedWorkingDirectories: void 0,
              persistedModelId: originalModel?.id
            };
          }
        } catch (error) {
          if (error instanceof CodexConnectionReplacedError) {
            throw error;
          }
        }
      }
      const read2 = await readThread(threadId);
      if (read2.rolloutMetadata?.isDesktop) {
        const originalModel = toRolloutModelSelection(read2.rolloutMetadata.selectedModel);
        await this._metadataStore.write(session, {
          threadId: read2.thread.id,
          cwd: read2.thread.cwd ? URI.file(read2.thread.cwd) : void 0,
          modelId: originalModel?.id
        });
        return {
          ...read2,
          persistedWorkingDirectories: void 0,
          persistedModelId: originalModel?.id
        };
      }
      return read2;
    } catch (err) {
      if (err instanceof CodexConnectionReplacedError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      if (/thread not loaded/i.test(message)) {
        this._logService.info(`[Codex:${threadId}] thread/read: not loaded yet (will resume on first send)`);
      } else {
        this._logService.warn(`[Codex:${threadId}] thread/read failed: ${message}`);
      }
      return void 0;
    }
  }
  async _listCodexChats() {
    try {
      const conn = await this._ensureConnection();
      const threads = await collectThreadListPages(
        (request) => conn.client.request("thread/list", request),
        (collected) => this._logService.warn(`[Codex] thread/list hit the ${THREAD_LIST_MAX_PAGES}-page cap after ${collected} threads; some sessions may be missing`)
      );
      if (!this._isCurrentConnection(conn)) {
        return void 0;
      }
      const liveUriByThreadId = /* @__PURE__ */ new Map();
      for (const s of this._sessions.values()) {
        if (s.threadId !== void 0) {
          liveUriByThreadId.set(s.threadId, s.sessionUri);
        }
      }
      const metadata = await Promise.all(threads.map(async (thread) => {
        const sessionUri = liveUriByThreadId.get(thread.id) ?? AgentSession.uri(this.id, thread.id);
        const liveWorkingDirectories = this._sessions.get(AgentSession.id(sessionUri))?.workingDirectories;
        const isDesktop = thread.modelProvider === CODEX_OPENAI_MODEL_PROVIDER ? await this._desktopRolloutPrefixLimiter.queue(() => this._readCodexDesktopRolloutPrefix(thread)) !== null : this._desktopThreadIds.has(thread.id);
        const chat = URI.parse(buildDefaultChatUri(sessionUri));
        return this._withWorkingDirectories(await this._threadToMetadata(thread, chat, void 0, isDesktop), liveWorkingDirectories);
      }));
      return this._isCurrentConnection(conn) ? metadata : void 0;
    } catch (err) {
      this._logService.warn(`[Codex] thread/list failed: ${err instanceof Error ? err.message : String(err)}`);
      return void 0;
    }
  }
  async listChatsToMigrate() {
    if (!this._activated) {
      return [];
    }
    if (!await this._isSdkResolvableWithoutDownload()) {
      this._logService.info("[Codex] SDK not downloaded yet; deferring the migratable chat list");
      return AgentChatMigrationDeferred;
    }
    const chats = await this._listCodexChats();
    if (!chats) {
      return void 0;
    }
    const limiter = new Limiter(4);
    const known = await Promise.all(chats.map((chat) => limiter.queue(async () => {
      return await this._isKnownCodexChat(chat) ? chat : void 0;
    })));
    return known.filter((chat) => chat !== void 0);
  }
  startChatDiscovery() {
    this._chatDiscoveryRequested = true;
    return this._startCodexChatDiscovery();
  }
  _startCodexChatDiscovery() {
    if (this._isShuttingDown || this._store.isDisposed || !this._activated) {
      return Promise.resolve();
    }
    if (!this._codexChatDiscovery) {
      this._codexChatDiscovery = retry(async () => {
        if (this._isShuttingDown || this._store.isDisposed) {
          return;
        }
        if (!await this._isSdkResolvableWithoutDownload()) {
          this._logService.info("[Codex] SDK not downloaded yet; deferring chat discovery");
          return;
        }
        if (this._isShuttingDown || this._store.isDisposed) {
          return;
        }
        if (!await this._emitCodexChats()) {
          throw new Error("Codex chat catalog is not available");
        }
      }, 5e3, 3).catch((err) => this._logService.warn(`[Codex] Chat discovery failed: ${err instanceof Error ? err.message : String(err)}`));
    }
    return this._codexChatDiscovery;
  }
  /** Runs discovery again for whoever is still subscribed, after it deferred for want of an SDK. */
  _restartChatDiscovery() {
    if (this._isShuttingDown || this._store.isDisposed) {
      return;
    }
    if (this._codexChatDiscovery) {
      this._codexChatDiscovery = void 0;
      void this._startCodexChatDiscovery();
    }
  }
  async _emitCodexChats() {
    try {
      const chats = await this._listCodexChats();
      if (chats && !this._isShuttingDown && !this._store.isDisposed) {
        const limiter = new Limiter(4);
        const discovered = await Promise.all(chats.map((chat) => limiter.queue(async () => {
          return { ...chat, external: !await this._isKnownCodexChat(chat) };
        })));
        if (this._isShuttingDown || this._store.isDisposed) {
          return true;
        }
        this._onDidDiscoverChats.fire(discovered);
        return true;
      }
    } catch (err) {
      this._logService.warn(`[Codex] Failed to emit discovered chats: ${err instanceof Error ? err.message : String(err)}`);
    }
    return false;
  }
  async _isKnownCodexChat(chat) {
    try {
      const session = URI.parse(parseRequiredSessionUriFromChatUri(chat.chat));
      return await this._metadataStore.hasKnownSession(session);
    } catch (err) {
      this._logService.warn(`[Codex] Failed to inspect stored metadata for ${chat.chat.toString()}: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }
  async _threadToMetadata(thread, chat, rolloutMetadata, isDesktopHint) {
    const generatedWorkspace = isCodexDesktopGeneratedWorkspace(thread.cwd, this._environmentService.userHome);
    let isDesktop = rolloutMetadata?.isDesktop ?? isDesktopHint;
    if (generatedWorkspace && isDesktop === void 0) {
      isDesktop = await this._desktopRolloutPrefixLimiter.queue(() => this._readCodexDesktopRolloutPrefix(thread)) !== null;
    }
    const model = toRolloutModelSelection(rolloutMetadata?.selectedModel);
    return {
      chat,
      // Codex returns Unix seconds; the agent host expects ms.
      startTime: (thread.createdAt ?? 0) * 1e3,
      modifiedTime: (thread.updatedAt ?? thread.createdAt ?? 0) * 1e3,
      summary: codexDelegationDisplayText(thread.name) ?? codexDelegationDisplayText(thread.preview),
      workingDirectories: thread.cwd ? [URI.file(thread.cwd)] : void 0,
      ...model ? { model } : {},
      ...generatedWorkspace && isDesktop ? { _meta: withSessionWorkspaceless(void 0, true) } : {}
    };
  }
  async _readCodexRolloutMetadata(thread) {
    if (thread.source !== "vscode" || !thread.path) {
      return void 0;
    }
    try {
      const metadata = await readCodexRolloutMetadata(this._fileService, thread.path);
      if (metadata.isDesktop) {
        this._desktopThreadIds.add(thread.id);
      }
      return metadata;
    } catch (error) {
      this._logService.warn(`[Codex] Failed to read desktop rollout metadata for ${thread.id}: result=${toFileOperationResult(error)}`);
      return void 0;
    }
  }
  async _readCodexDesktopRolloutPrefix(thread) {
    if (thread.source !== "vscode" || !thread.path) {
      return null;
    }
    try {
      const prefix = await this._fileService.readFile(URI.file(thread.path), { length: CODEX_DESKTOP_ROLLOUT_PREFIX_LENGTH });
      const value = prefix.value.toString();
      if (!CODEX_DESKTOP_SESSION_META_PATTERN.test(value)) {
        return null;
      }
      this._desktopThreadIds.add(thread.id);
      return value;
    } catch (error) {
      this._logService.warn(`[Codex] Failed to inspect desktop session metadata for ${thread.id}: result=${toFileOperationResult(error)}`);
      return null;
    }
  }
  _withWorkingDirectories(metadata, storedWorkingDirectories) {
    const primary = metadata.workingDirectories?.[0];
    if (!primary || !storedWorkingDirectories || storedWorkingDirectories.length <= 1) {
      return metadata;
    }
    const workingDirectories = distinctWorkingDirectories([
      primary,
      ...storedWorkingDirectories.slice(1)
    ]);
    return workingDirectories && workingDirectories.length > 1 ? { ...metadata, workingDirectories } : metadata;
  }
  setServerToolHost(host) {
    this._serverToolHost = host;
  }
  _advertiseServerTools(session, configurationResource) {
    const resource = configurationResource.toString();
    if (!this._serverToolHost || session.serverToolsAdvertisement === resource) {
      return;
    }
    this._serverToolHost.advertise(resource);
    session.serverToolsAdvertisement = resource;
  }
  /**
   * `chat` is the one exact chat this handle contributes to — no fan-out to
   * chat-array membership or sibling inference; Agent Host calls this once
   * per addressed chat. `context` only resolves the chat's backing runtime
   * when it has no live binding yet, mirroring
   * {@link _resolveConversationSession}. `hostCustomizations` is unused:
   * Codex reconciles pushed plugin customizations via
   * {@link _syncClientCustomizations}.
   */
  getOrCreateActiveClient(chat, context, client, _hostCustomizations) {
    const key = `${chat.toString()}\0${client.clientId}`;
    const existing = this._activeClientHandles.get(key);
    if (existing) {
      return existing;
    }
    const resolveSession = () => {
      const runtimeUri = this._resolveConversationSession(chat, context);
      return runtimeUri ? this._sessions.get(AgentSession.id(runtimeUri)) : void 0;
    };
    const handle = new CodexActiveClientHandle(
      resolveSession,
      client.clientId,
      client.displayName,
      (tools) => this._logService.info(`[Codex] active client ${client.clientId} tools=[${tools.map((t) => t.name).join(", ") || "(none)"}] chat=${chat.toString()}`),
      (session, customizations, isCurrent) => {
        void this._syncClientCustomizations(session.sessionUri, client.clientId, [...customizations], { quiet: false, isCurrent }).catch((err) => this._logService.error(`[Codex] failed to sync customizations for client ${client.clientId}: ${err instanceof Error ? err.message : String(err)}`));
      },
      (session, customizations) => {
        void this._removeClientCustomizations(session, client.clientId, customizations).catch((err) => this._logService.error(`[Codex] failed to remove customizations for client ${client.clientId}: ${err instanceof Error ? err.message : String(err)}`));
      }
    );
    this._activeClientHandles.set(key, handle);
    return handle;
  }
  removeActiveClient(chat, _context, clientId) {
    const key = `${chat.toString()}\0${clientId}`;
    const handle = this._activeClientHandles.get(key);
    this._activeClientHandles.delete(key);
    if (!handle) {
      return;
    }
    handle.remove();
  }
  onClientToolCallComplete(chat, toolCallId, result, context) {
    const runtime = this._resolveConversationSession(chat, context);
    const sess = runtime ? this._sessions.get(AgentSession.id(runtime)) : void 0;
    sess?.pendingClientToolCalls.respondOrBuffer(toolCallId, result);
  }
  // ---- Client-pushed plugin customizations -------------------------------
  /**
   * Materialize + parse a client's pushed plugin customizations and store
   * them on the session. Mirrors the Claude client-plugin path: the shared
   * {@link IAgentPluginManager} copies each plugin to local disk (nonce
   * cached), we parse the resulting directory into its
   * {@link IParsedPlugin | components}, publish the customization surface,
   * and refresh the process-global skill roots. MCP servers are attached
   * per-thread at the next {@link _materialize}.
   */
  async _syncClientCustomizations(sessionUri, clientId, customizations, options) {
    const session = this._sessions.get(AgentSession.id(sessionUri));
    if (!session) {
      return;
    }
    await this._customizationEnablementService.initializeSession(session.configurationResource.toString());
    const synced = await this._pluginManager.syncCustomizations(
      clientId,
      [...customizations],
      (status) => {
        if (!options?.quiet && options?.isCurrent?.() !== false) {
          this._fire(session.configurationResource, { type: "session/customizationUpdated" /* SessionCustomizationUpdated */, customization: status });
        }
      }
    );
    if (session.disposed || options?.isCurrent?.() === false) {
      return;
    }
    const inputs = new Map(customizations.map((customization) => [customization.uri, customization]));
    const plugins = await Promise.all(synced.map((item) => this._parseClientPlugin(session, item, inputs.get(item.customization.uri))));
    if (session.disposed || options?.isCurrent?.() === false) {
      return;
    }
    const previousIds = session.clientCustomizations.toCustomizations().map((customization) => customization.id);
    session.clientCustomizations.setClient(clientId, plugins);
    if (!options?.quiet) {
      this._reconcilePublishedClientCustomizations(session.configurationResource, /* @__PURE__ */ new Set([
        ...previousIds,
        ...session.clientCustomizations.toCustomizations().map((customization) => customization.id)
      ]));
    }
    await this._refreshSkillExtraRoots();
    await this._reconcileMaterializedCustomizations(session);
  }
  async _removeClientCustomizations(session, clientId, inputs) {
    const storedIds = session.clientCustomizations.toCustomizations().map((customization) => customization.id);
    const removed = session.clientCustomizations.removeClient(clientId);
    const previousIds = /* @__PURE__ */ new Set([
      ...removed ? storedIds : [],
      ...inputs.map((customization) => customization.id)
    ]);
    this._reconcilePublishedClientCustomizations(session.configurationResource, previousIds);
    if (!removed) {
      return;
    }
    await this._refreshSkillExtraRoots();
    await this._reconcileMaterializedCustomizations(session);
  }
  _reconcileMaterializedCustomizations(session) {
    let sequencer = this._customizationReconcileSequencers.get(session);
    if (!sequencer) {
      sequencer = new Sequencer();
      this._customizationReconcileSequencers.set(session, sequencer);
    }
    return sequencer.queue(() => this._doReconcileMaterializedCustomizations(session));
  }
  _queueDirectoryCustomizationOperation(session, operation) {
    let sequencer = this._directoryCustomizationSequencers.get(session);
    if (!sequencer) {
      sequencer = new Sequencer();
      this._directoryCustomizationSequencers.set(session, sequencer);
    }
    return sequencer.queue(operation);
  }
  async _doReconcileMaterializedCustomizations(session) {
    if (session.disposed) {
      return;
    }
    if (session.threadId === void 0) {
      return;
    }
    const launch = await this._buildCustomizationLaunch(session);
    const mcpSignature = mcpServersSignature(this._buildSessionMcpServers(session));
    if (launch.signature === session.materializedCustomizationsSig && mcpSignature === session.materializedMcpSig) {
      return;
    }
    if (!session.firstTurnSent) {
      await this._restartThreadWithCurrentTools(session);
      this._persistMaterializedSession(session);
    } else {
      this._markSessionForReload(session);
    }
  }
  /** Parse one synced plugin directory into its components (best-effort). */
  async _parseClientPlugin(session, synced, input) {
    if (!synced.pluginDir) {
      return { synced, parsed: void 0, input };
    }
    try {
      const parsed = await parsePlugin(synced.pluginDir, this._fileService, session.workingDirectory, this._environmentService.userHome, synced.pluginDir);
      const candidate = { ...synced.customization, children: parsedPluginChildren(parsed) };
      const clientPlugins = input ? /* @__PURE__ */ new Map([[input.uri, input]]) : void 0;
      const resolution = resolveCustomizationEnablement(this._customizationEnablementService, session.configurationResource, [candidate], input?.childEnablement ? /* @__PURE__ */ new Map([[input.uri, input.childEnablement]]) : void 0, clientPlugins);
      const resolved = resolution.customizations[0];
      return {
        synced,
        parsed,
        input,
        customization: resolved.type === "plugin" /* Plugin */ ? resolved : candidate
      };
    } catch (err) {
      this._logService.warn(`[Codex] failed to parse client plugin ${synced.customization.uri}: ${err instanceof Error ? err.message : String(err)}`);
      return { synced, parsed: void 0, input };
    }
  }
  /** Publish the session's client-plugin customizations as upsert actions. */
  _publishClientCustomizationsForConfiguration(configurationResource) {
    for (const customization of this._resolvedClientCustomizationsForConfiguration(configurationResource)) {
      this._fire(configurationResource, { type: "session/customizationUpdated" /* SessionCustomizationUpdated */, customization });
    }
  }
  _reconcilePublishedClientCustomizations(configurationResource, affectedIds) {
    const survivingCustomizations = this._resolvedClientCustomizationsForConfiguration(configurationResource);
    const currentIds = new Set(survivingCustomizations.map((customization) => customization.id));
    for (const id2 of affectedIds) {
      if (!currentIds.has(id2)) {
        this._fire(configurationResource, { type: "session/customizationRemoved" /* SessionCustomizationRemoved */, id: id2 });
      }
    }
    for (const customization of survivingCustomizations) {
      if (affectedIds.has(customization.id)) {
        this._fire(configurationResource, { type: "session/customizationUpdated" /* SessionCustomizationUpdated */, customization });
      }
    }
  }
  _resolvedClientCustomizationsForConfiguration(configurationResource) {
    const sessions = [...this._sessions.values()].filter((session) => !session.disposed && isEqual2(session.configurationResource, configurationResource)).sort((a, b) => {
      const owningRuntimeOrder = Number(!isEqual2(a.sessionUri, configurationResource)) - Number(!isEqual2(b.sessionUri, configurationResource));
      return owningRuntimeOrder || a.sessionId.localeCompare(b.sessionId);
    });
    const byId = /* @__PURE__ */ new Map();
    for (const session of sessions) {
      for (const customization of this._resolveClientCustomizationEnablement(session).resolution.customizations) {
        if (customization.type === "plugin" /* Plugin */ && !byId.has(customization.id)) {
          byId.set(customization.id, customization);
        }
      }
    }
    return [...byId.values()];
  }
  _queueSkillHookCustomizationRefresh(client) {
    if (this._connection.kind !== "ready" || this._connection.client !== client) {
      return;
    }
    this._skillHookCustomizationRefresh.value = disposableTimeout(() => {
      if (this._connection.kind !== "ready" || this._connection.client !== client) {
        return;
      }
      for (const session of this._sessions.values()) {
        if (!session.disposed && session.threadId !== void 0 && !session.needsResume) {
          void this._refreshSkillHookCustomizations(session);
        }
      }
    }, 100);
  }
  /**
   * Recompute the process-global skill roots from every live session's
   * enabled client plugins and push them to codex via `skills/extraRoots/set`.
   * codex's extra skill roots are a single shared list (there is no per-thread
   * equivalent), so we send the union across all sessions — which matches the
   * global nature of client plugin choices. No-op when the connection is not
   * ready; the next {@link _materialize} re-applies.
   */
  async _refreshSkillExtraRoots() {
    return this._skillExtraRootsSequencer.queue(async () => {
      if (this._connection.kind !== "ready") {
        return;
      }
      await this._applySkillExtraRoots(this._connection.client);
    });
  }
  _queueSkillExtraRootsForClient(client) {
    return this._skillExtraRootsSequencer.queue(() => this._applySkillExtraRoots(client));
  }
  async _applySkillExtraRoots(client) {
    const plugins = [];
    for (const session of this._sessions.values()) {
      if (!session.disposed) {
        plugins.push(...this._enabledClientPlugins(session));
      }
    }
    const roots = codexSkillRootsFromPlugins(plugins);
    try {
      await client.request("skills/extraRoots/set", { extraRoots: roots });
      if (roots.length > 0) {
        this._logService.info(`[Codex] applied ${roots.length} client-plugin skill root(s)`);
      }
    } catch (err) {
      this._logService.warn(`[Codex] skills/extraRoots/set failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  // ---- MCP servers -------------------------------------------------------
  /**
   * Surfaces codex's MCP servers to AHP clients as per-session
   * customizations. Codex has no plugin/directory customization layer, so
   * every server is a bare top-level {@link McpServerCustomization}. The
   * returned snapshot reflects the current connection-global inventory;
   * subsequent lifecycle transitions arrive as customization actions
   * emitted by the session's {@link McpCustomizationController}.
   * `hostCustomizations` is unused: codex reconciles a client's pushed
   * plugin customizations directly (see {@link _syncClientCustomizations}),
   * so the host's copy carries nothing this method needs.
   */
  async getChatCustomizations(chat, context, _hostCustomizations) {
    const sessionUri = this._resolveConversationSession(chat, context);
    if (!sessionUri) {
      return [];
    }
    const session = this._sessions.get(AgentSession.id(sessionUri));
    if (!session) {
      return [];
    }
    return this._queueDirectoryCustomizationOperation(session, async () => {
      if (session.disposed) {
        return [];
      }
      const catalogConnection = this._connection.kind === "ready" ? this._connection : void 0;
      const controller = this._getOrCreateMcpController(session);
      if (controller) {
        controller.applyAll(inventoryToSdkServers(this._mcpInventory.forThread(session.threadId)));
        this._refreshMcpCustomizationIds(session, controller);
      }
      const [workspaceAgents, workspaceInstructions, skillHookContainers] = await Promise.all([
        discoverCodexWorkspaceAgents(this._workingDirectories(session), this._fileService),
        discoverCodexWorkspaceInstructions(this._workingDirectories(session), this._fileService),
        this._fetchSkillHookContainers(session)
      ]);
      if (session.disposed || catalogConnection !== void 0 && !this._isCurrentConnection(catalogConnection)) {
        return [];
      }
      const directoryCustomizations = [...workspaceAgents.containers, ...workspaceInstructions, ...skillHookContainers];
      session.publishedDirectoryCustomizationIds.clear();
      for (const customization of directoryCustomizations) {
        session.publishedDirectoryCustomizationIds.add(customization.id);
      }
      return [
        ...workspaceAgents.containers,
        ...workspaceInstructions,
        ...this._resolveClientCustomizationEnablement(session).resolution.customizations,
        ...controller?.topLevelCustomizations() ?? [],
        ...skillHookContainers
      ];
    });
  }
  /**
   * Fetches the skills and hooks codex has loaded for `session`'s working
   * directory (`skills/list` + `hooks/list`, both cwd-scoped) and projects
   * them into {@link DirectoryCustomization} containers. Best-effort: returns
   * an empty array when no connection is ready, no working directory is known,
   * or the app-server rejects the request.
   */
  async _fetchSkillHookContainers(session) {
    if (this._connection.kind !== "ready" || !session.workingDirectory) {
      return [];
    }
    const cwd3 = session.workingDirectory.fsPath;
    const client = this._connection.client;
    const [skills, hooks] = await Promise.all([
      client.request("skills/list", { cwds: [cwd3] }).catch((err) => {
        this._logService.warn(`[Codex] skills/list failed: ${err instanceof Error ? err.message : String(err)}`);
        return void 0;
      }),
      client.request("hooks/list", { cwds: [cwd3] }).catch((err) => {
        this._logService.warn(`[Codex] hooks/list failed: ${err instanceof Error ? err.message : String(err)}`);
        return void 0;
      })
    ]);
    return [...codexSkillsToContainers(skills), ...codexHooksToContainers(hooks)];
  }
  /**
   * Re-fetches this session's workspace agent, skill, and hook customizations and upserts each
   * container into session state via {@link ActionType.SessionCustomizationUpdated}.
   * Called after materialization (when the connection is ready and the cwd is
   * known) so the workbench Customizations surface reflects workspace agents
   * and what codex loaded from the working directory's `.agents`/`.codex`
   * folders. Upserts (keyed by customization id) leave MCP customizations
   * untouched.
   */
  async _refreshSkillHookCustomizations(session) {
    return this._queueDirectoryCustomizationOperation(session, () => this._doRefreshSkillHookCustomizations(session));
  }
  async _doRefreshSkillHookCustomizations(session) {
    if (session.disposed) {
      return;
    }
    const catalogConnection = this._connection.kind === "ready" ? this._connection : void 0;
    const [workspaceAgents, workspaceInstructions, skillHookContainers] = await Promise.all([
      discoverCodexWorkspaceAgents(this._workingDirectories(session), this._fileService),
      discoverCodexWorkspaceInstructions(this._workingDirectories(session), this._fileService),
      this._fetchSkillHookContainers(session)
    ]);
    if (session.disposed || catalogConnection !== void 0 && !this._isCurrentConnection(catalogConnection)) {
      return;
    }
    const containers = [...workspaceAgents.containers, ...workspaceInstructions, ...skillHookContainers];
    const nextIds = new Set(containers.map((container) => container.id));
    for (const id2 of session.publishedDirectoryCustomizationIds) {
      if (!nextIds.has(id2)) {
        this._fire(session.configurationResource, { type: "session/customizationRemoved" /* SessionCustomizationRemoved */, id: id2 });
      }
    }
    for (const container of containers) {
      this._fire(session.configurationResource, { type: "session/customizationUpdated" /* SessionCustomizationUpdated */, customization: container });
    }
    session.publishedDirectoryCustomizationIds.clear();
    for (const id2 of nextIds) {
      session.publishedDirectoryCustomizationIds.add(id2);
    }
  }
  /**
   * Routes an MCP request received on this session's `mcp://` side channel
   * to codex. Read-only methods (`tools/list`, `resources/list`,
   * `resources/templates/list`) are answered from the cached inventory;
   * `tools/call` and `resources/read` round-trip to the app-server with the
   * session's thread id. Unknown servers / methods reject with
   * `Method not found` so the protocol server maps them to JSON-RPC
   * `-32601`.
   */
  async handleMcpRequest(chat, serverName, method, params) {
    const sessionId = this._sessionIdByChatUri.get(chat.toString());
    if (!sessionId) {
      throw new Error(`Method not found: no active chat ${chat.toString()}`);
    }
    const session = this._sessions.get(sessionId);
    if (!session || !session.chatChannel || !isEqual2(session.chatChannel, chat)) {
      throw new Error(`Method not found: no active chat ${chat.toString()}`);
    }
    const entry = this._mcpInventory.forThread(session.threadId).get(serverName);
    if (!entry) {
      throw new Error(`Method not found: unknown MCP server '${serverName}'`);
    }
    const read2 = buildCodexMcpReadResult(method, entry);
    if (read2.handled) {
      return read2.result;
    }
    switch (method) {
      case "tools/call": {
        const tool = params && typeof params["name"] === "string" ? params["name"] : void 0;
        if (!tool) {
          throw new Error(`tools/call missing 'name' parameter`);
        }
        const { threadId, connection: conn } = await this._ensureMaterializedThreadConnection(session);
        return conn.client.request("mcpServer/tool/call", {
          threadId,
          server: serverName,
          tool,
          arguments: params ? params["arguments"] : void 0
        });
      }
      case "resources/read": {
        const uri = params && typeof params["uri"] === "string" ? params["uri"] : void 0;
        if (!uri) {
          throw new Error(`resources/read missing 'uri' parameter`);
        }
        const { threadId, connection: conn } = await this._ensureMaterializedThreadConnection(session);
        return conn.client.request("mcpServer/resource/read", {
          threadId,
          server: serverName,
          uri
        });
      }
      default:
        throw new Error(`Method not found: ${method}`);
    }
  }
  async startMcpServer(sessionUri, id2) {
    const session = this._sessionForMcpControl(sessionUri);
    const serverName = session ? this._resolveMcpServerName(session, id2) : void 0;
    if (!session || !serverName) {
      this._logService.warn(`[Codex] Cannot start unknown MCP server customization ${id2}`);
      return;
    }
    const { threadId, connection: conn } = await this._ensureMaterializedThreadConnection(session);
    await conn.client.request("config/mcpServer/reload", void 0);
    await this._refreshMcpInventory(conn.client, threadId);
  }
  async stopMcpServer(sessionUri, id2) {
    const session = this._sessionForMcpControl(sessionUri);
    const serverName = session ? this._resolveMcpServerName(session, id2) : void 0;
    if (!session || !serverName) {
      this._logService.warn(`[Codex] Cannot stop unknown MCP server customization ${id2}`);
      return;
    }
  }
  _sessionForMcpControl(resource) {
    const publisherSessionId = this._mcpPublisherSessionIdByConfiguration.get(resource.toString());
    return (publisherSessionId === void 0 ? void 0 : this._sessions.get(publisherSessionId)) ?? this._sessions.get(AgentSession.id(resource));
  }
  _resolveMcpServerName(session, id2) {
    const controller = this._getOrCreateMcpController(session);
    if (!controller) {
      return void 0;
    }
    controller.applyAll(inventoryToSdkServers(this._mcpInventory.forThread(session.threadId)));
    this._refreshMcpCustomizationIds(session, controller);
    return controller.serverNameForCustomizationId(id2);
  }
  _preferredMcpPublisher(configurationResource) {
    return [...this._sessions.values()].filter((session) => !session.disposed && session.mcpController !== void 0 && isEqual2(session.configurationResource, configurationResource)).sort((a, b) => {
      const owningRuntimeOrder = Number(!isEqual2(a.sessionUri, configurationResource)) - Number(!isEqual2(b.sessionUri, configurationResource));
      return owningRuntimeOrder || a.sessionId.localeCompare(b.sessionId);
    })[0];
  }
  _emitMcpCustomizationAction(session, action) {
    if (this._preferredMcpPublisher(session.configurationResource) !== session) {
      return;
    }
    this._switchMcpPublisher(session);
    const key = session.configurationResource.toString();
    const publishedIds = this._publishedMcpTopLevelIdsByConfiguration.get(key);
    if (action.type === "session/customizationUpdated" /* SessionCustomizationUpdated */ && action.customization.type === "mcpServer" /* McpServer */) {
      publishedIds.add(action.customization.id);
    } else if (action.type === "session/customizationRemoved" /* SessionCustomizationRemoved */) {
      publishedIds.delete(action.id);
    }
    this._fire(session.configurationResource, action);
  }
  _switchMcpPublisher(session) {
    const key = session.configurationResource.toString();
    const previousPublisher = this._mcpPublisherSessionIdByConfiguration.get(key);
    if (previousPublisher === session.sessionId) {
      return;
    }
    const previousRuntimeStates = previousPublisher === void 0 ? void 0 : this._sessions.get(previousPublisher)?.mcpController?.runtimeStates.get();
    const currentRuntimeStates = session.mcpController?.runtimeStates.get();
    for (const id2 of previousRuntimeStates?.keys() ?? []) {
      if (!currentRuntimeStates?.has(id2)) {
        this._fire(session.configurationResource, {
          type: "session/mcpServerStateChanged" /* SessionMcpServerStateChanged */,
          id: id2,
          state: { kind: "stopped" /* Stopped */ }
        });
      }
    }
    for (const id2 of this._publishedMcpTopLevelIdsByConfiguration.get(key) ?? []) {
      this._fire(session.configurationResource, { type: "session/customizationRemoved" /* SessionCustomizationRemoved */, id: id2 });
    }
    this._publishedMcpTopLevelIdsByConfiguration.set(key, /* @__PURE__ */ new Set());
    this._mcpPublisherSessionIdByConfiguration.set(key, session.sessionId);
  }
  _releaseMcpPublisher(session) {
    const key = session.configurationResource.toString();
    if (this._mcpPublisherSessionIdByConfiguration.get(key) !== session.sessionId) {
      return;
    }
    for (const id2 of this._publishedMcpTopLevelIdsByConfiguration.get(key) ?? []) {
      this._fire(session.configurationResource, { type: "session/customizationRemoved" /* SessionCustomizationRemoved */, id: id2 });
    }
    this._publishedMcpTopLevelIdsByConfiguration.delete(key);
    this._mcpPublisherSessionIdByConfiguration.delete(key);
    const preferred = this._preferredMcpPublisher(session.configurationResource);
    const preferredRuntimeStates = preferred?.mcpController?.runtimeStates.get();
    for (const id2 of session.mcpController?.runtimeStates.get().keys() ?? []) {
      if (!preferredRuntimeStates?.has(id2)) {
        this._fire(session.configurationResource, {
          type: "session/mcpServerStateChanged" /* SessionMcpServerStateChanged */,
          id: id2,
          state: { kind: "stopped" /* Stopped */ }
        });
      }
    }
    if (preferred?.mcpController) {
      preferred.mcpController.applyAll(inventoryToSdkServers(this._mcpInventory.forThread(preferred.threadId)));
    }
  }
  /**
   * Lazily create the per-session {@link McpCustomizationController}. Not
   * registered on the agent (sessions come and go) — disposed explicitly
   * when the session is removed.
   */
  _getOrCreateMcpController(session) {
    if (!session.chatChannel) {
      return void 0;
    }
    if (!session.mcpController) {
      session.mcpController = this._instantiationService.createInstance(McpCustomizationController, {
        chatUri: session.chatChannel,
        emit: (action) => this._emitMcpCustomizationAction(session, action),
        capabilities: CODEX_MCP_APP_CAPABILITIES,
        pluginMcpServerSources: () => codexPluginMcpServerSources(session.clientCustomizations.plugins()),
        resolveEnablement: (server, owningPluginUri) => {
          const resolution = this._customizationEnablementService.resolve(session.configurationResource.toString(), targetForMcpServer(server, owningPluginUri, false));
          return resolution.kind === "resolved" ? resolution.enablement : void 0;
        }
      });
      if (this._preferredMcpPublisher(session.configurationResource) === session) {
        this._switchMcpPublisher(session);
      }
    }
    return session.mcpController;
  }
  _applyMcpInventoryToSession(session) {
    if (session.disposed) {
      return;
    }
    const controller = this._getOrCreateMcpController(session);
    if (!controller) {
      return;
    }
    controller.applyAll(inventoryToSdkServers(this._mcpInventory.forThread(session.threadId)));
    this._refreshMcpCustomizationIds(session, controller);
  }
  _applyGlobalMcpInventoryToSessions() {
    for (const session of this._sessions.values()) {
      this._applyMcpInventoryToSession(session);
    }
  }
  /**
   * Refreshes the session's mapper snapshot of server name → customization id
   * (read when stamping the MCP contributor on tool calls). Plain data, owned
   * here — the mapper never reaches back into the controller. Must run on every
   * inventory change because MCP servers are discovered asynchronously, after a
   * session (and possibly its first tool call) already exists.
   */
  _refreshMcpCustomizationIds(session, controller) {
    const ids = session.mapState.mcpCustomizationIds;
    ids.clear();
    for (const serverName of this._mcpInventory.forThread(session.threadId).keys()) {
      const id2 = controller.customizationIdForServer(serverName);
      if (id2 !== void 0) {
        ids.set(serverName, id2);
      }
    }
  }
  async _refreshMcpInventory(client, threadId) {
    let data = [];
    try {
      let cursor = null;
      do {
        const response = await client.request("mcpServerStatus/list", { cursor, detail: "full", threadId });
        data = data.concat(response.data ?? []);
        cursor = response.nextCursor;
      } while (cursor);
    } catch (err) {
      this._logService.warn(`[Codex] Failed to list MCP servers for ${threadId ?? "global config"}: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    if (this._connection.kind !== "ready" || this._connection.client !== client) {
      return;
    }
    const session = threadId === null ? void 0 : this._sessionForMcpThread(threadId);
    if (threadId !== null && !session) {
      return;
    }
    const configuredNames = session ? new Set(Object.keys(this._buildSessionMcpServers(session))) : void 0;
    const next = codexMcpListToInventory(data);
    const previous = this._mcpInventory.forScope(threadId);
    const toolsChanged = [];
    for (const [name, entry] of next) {
      const prev = previous.get(name);
      if (prev && codexMcpToolsChanged(prev, entry)) {
        toolsChanged.push(name);
      }
    }
    for (const [name, entry] of previous) {
      if (!next.has(name) && entry.state.kind !== "ready" /* Ready */ && (!configuredNames || configuredNames.has(name))) {
        next.set(name, entry);
      }
    }
    this._mcpInventory.replace(threadId, next);
    this._logService.info(`[Codex] MCP inventory refreshed for ${threadId ?? "global config"}: ${next.size === 0 ? "(none)" : [...next].map(([name, entry]) => `${name} [${entry.state.kind}, ${entry.tools.length} tool(s)]`).join(", ")}`);
    if (threadId === null) {
      this._applyGlobalMcpInventoryToSessions();
    } else if (session) {
      this._applyMcpInventoryToSession(session);
    }
    for (const name of toolsChanged) {
      this._fireMcpToolsListChanged(threadId, name);
    }
  }
  /**
   * Handles a `mcpServer/startupStatus/updated` notification. `ready`
   * triggers a full inventory refresh (to pull the now-loaded tools);
   * other transitions update the cached state in place so the UI sees the
   * server settle into starting/error/stopped promptly.
   */
  _handleMcpStartupStatus(client, threadId, name, status, error) {
    if (this._connection.kind !== "ready" || this._connection.client !== client) {
      return;
    }
    if (threadId !== null && !this._sessionForMcpThread(threadId)) {
      const pending = this._pendingMcpStartupStatuses.get(threadId) ?? [];
      if (pending.length === 16) {
        pending.shift();
      }
      pending.push({ client, name, status, error });
      this._pendingMcpStartupStatuses.set(threadId, pending);
      if (this._pendingMcpStartupStatuses.size > 64) {
        const oldestThreadId = this._pendingMcpStartupStatuses.keys().next().value;
        if (oldestThreadId !== void 0) {
          this._pendingMcpStartupStatuses.delete(oldestThreadId);
        }
      }
      return;
    }
    this._logService.info(`[Codex] MCP server '${name}' startup status for ${threadId ?? "global config"}: ${status}${error ? ` (${error})` : ""}`);
    if (status === "ready") {
      void this._refreshMcpInventory(client, threadId);
      return;
    }
    if (threadId !== null && status === "failed" && codexStartupErrorNeedsAuth(error)) {
      const url2 = this._mcpServerUrlForName(threadId, name);
      const normalized = url2 !== void 0 ? normalizeCodexMcpResourceUrl(url2) : void 0;
      if (url2 !== void 0 && normalized !== void 0) {
        if (this._mcpAuthTokens.delete(normalized)) {
          this._logService.info(`[Codex] MCP server '${name}' rejected the stored token; clearing it to allow re-authentication`);
        }
        void this._surfaceMcpAuthRequired(client, threadId, name, url2, error);
        return;
      }
    }
    this._setMcpServerState(threadId, name, translateCodexMcpStartupState(status, error));
  }
  _flushPendingMcpStartupStatuses(threadId) {
    const pending = this._pendingMcpStartupStatuses.get(threadId);
    if (!pending) {
      return;
    }
    this._pendingMcpStartupStatuses.delete(threadId);
    for (const item of pending) {
      this._handleMcpStartupStatus(item.client, threadId, item.name, item.status, item.error);
    }
  }
  _setMcpServerState(threadId, name, state) {
    this._mcpInventory.setState(threadId, name, state);
    if (threadId === null) {
      this._applyGlobalMcpInventoryToSessions();
      return;
    }
    const session = this._sessionForMcpThread(threadId);
    if (session) {
      this._applyMcpInventoryToSession(session);
    }
  }
  /**
   * Surfaces an auth-gated http MCP server as {@link McpServerStatus.AuthRequired}
   * so the workbench runs the *same* OAuth sign-in it uses for the Copilot
   * agent. codex's `failed` notification carries no RFC 9728 metadata, and the
   * workbench's `resolveMcpServerAuthentication` needs the resource's
   * `authorization_servers` to know where to sign in — so we discover the
   * Protected Resource Metadata (`<url>/.well-known/oauth-protected-resource`)
   * here, mirroring the discovery the Copilot SDK does internally. On
   * discovery failure we still surface `AuthRequired` with bare metadata (the
   * server genuinely needs auth); the one-click sign-in just can't complete
   * without the authorization server, which is logged.
   */
  async _surfaceMcpAuthRequired(client, threadId, name, url2, error) {
    const session = this._sessionForMcpThread(threadId);
    if (!session) {
      return;
    }
    const configuredChildren = session.clientCustomizations.toCustomizations().flatMap((plugin) => plugin.children ?? []).filter((child) => child.type === "mcpServer" /* McpServer */ && child.name === name);
    if (configuredChildren.length > 0 && configuredChildren.every((child) => !isCustomizationEnabled(child)) || configuredChildren.length === 0 && !this._isMcpServerEnabledForSdk(session, name)) {
      this._logService.info(`[Codex] Suppressed authentication request from disabled MCP server '${name}'`);
      return;
    }
    let resource = { resource: url2, resource_name: name };
    let requiredScopes;
    try {
      const discovered = await raceTimeout(fetchResourceMetadata(url2, void 0), 15e3);
      if (discovered) {
        resource = discovered.metadata;
        requiredScopes = discovered.metadata.scopes_supported;
        this._logService.info(`[Codex] discovered OAuth metadata for MCP server '${name}': authorization_servers=[${(discovered.metadata.authorization_servers ?? []).join(", ")}]`);
      } else {
        this._logService.warn(`[Codex] timed out discovering OAuth metadata for MCP server '${name}' at ${url2}; the Authenticate action may not be able to complete`);
      }
    } catch (err) {
      this._logService.warn(`[Codex] failed to discover OAuth metadata for MCP server '${name}' at ${url2}; the Authenticate action may not be able to complete: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (this._connection.kind !== "ready" || this._connection.client !== client) {
      return;
    }
    if (this._mcpServerUrlForName(threadId, name) !== url2) {
      return;
    }
    const normalizedServer = normalizeCodexMcpResourceUrl(url2);
    const normalizedResource = normalizeCodexMcpResourceUrl(resource.resource) ?? normalizedServer;
    if (normalizedServer !== void 0 && normalizedResource !== void 0) {
      const servers = this._mcpAuthServerUrlsByResource.get(normalizedResource) ?? /* @__PURE__ */ new Set();
      servers.add(normalizedServer);
      this._mcpAuthServerUrlsByResource.set(normalizedResource, servers);
    }
    this._logService.info(`[Codex] MCP server '${name}' requires authentication for ${url2}`);
    this._setMcpServerState(threadId, name, {
      kind: "authRequired" /* AuthRequired */,
      reason: "required" /* Required */,
      resource,
      requiredScopes: requiredScopes && requiredScopes.length > 0 ? requiredScopes : void 0,
      description: error ?? void 0
    });
  }
  _fireMcpToolsListChanged(threadId, serverName) {
    const sessions = threadId === null ? this._sessions.values() : [this._sessionForMcpThread(threadId)].filter((session) => session !== void 0);
    for (const session of sessions) {
      if (threadId === null && session.threadId !== void 0 && this._mcpInventory.hasThreadEntry(session.threadId, serverName)) {
        continue;
      }
      const channel = session.mcpController?.channelForServer(serverName);
      if (channel) {
        this._onMcpNotification.fire({ channel, method: "notifications/tools/list_changed" });
      }
    }
  }
  /**
   * Ensures the session has a materialized codex thread and returns its id.
   * MCP tool calls (`mcpServer/tool/call`) are thread-scoped, so a call
   * arriving before the first turn lazily starts the thread.
   */
  async _ensureMaterializedThreadConnection(session) {
    await this._materializeIfNeeded(session, session.configurationResource, false);
    if (session.threadId === void 0) {
      throw new Error(`Cannot run MCP tool: codex session ${session.sessionId} is not materialized`);
    }
    return this._ensureThreadConnection(session);
  }
  _clearRuntimeState() {
    for (const s of this._sessions.values()) {
      s.disposed = true;
      if (s.prewarmTimer) {
        clearTimeout(s.prewarmTimer);
        s.prewarmTimer = void 0;
      }
      s.pendingCommandApprovals.denyAll("decline");
      s.pendingClientToolCalls.rejectAll(new CancellationError());
      s.pendingUserInputs.rejectAll(new CancellationError());
      s.mcpController?.dispose();
    }
    for (const subagent of this._subagentsByThreadId.values()) {
      subagent.session.disposed = true;
      if (subagent.session.prewarmTimer) {
        clearTimeout(subagent.session.prewarmTimer);
        subagent.session.prewarmTimer = void 0;
      }
      subagent.session.pendingCommandApprovals.denyAll("decline");
      subagent.session.pendingClientToolCalls.rejectAll(new CancellationError());
      subagent.session.pendingUserInputs.rejectAll(new CancellationError());
    }
    for (const entry of this._sessionMcpDiscoveries.values()) {
      entry.dispose();
    }
    this._desktopThreadIds.clear();
    this._sessions.clear();
    this._activeClientHandles.clear();
    this._sessionIdByChatUri.clear();
    this._sessionIdByThreadId.clear();
    this._releasedManagedWorkingDirectories.clear();
    this._configScopeChats.clear();
    this._configScopeByChat.clear();
    this._subagentsByThreadId.clear();
    this._sessionMcpDiscoveries.clear();
    this._pendingMcpStartupStatuses.clear();
    this._mcpInventory.clear();
    this._mcpPublisherSessionIdByConfiguration.clear();
    this._publishedMcpTopLevelIdsByConfiguration.clear();
    this._mcpAuthTokens.clear();
    this._mcpAuthServerUrlsByResource.clear();
  }
  _stopRuntime() {
    if (this._isShuttingDown) {
      return;
    }
    this._isShuttingDown = true;
    this._modelCatalogGeneration++;
    this._modelRefreshRetry.clear();
    this._skillHookCustomizationRefresh.clear();
    this._startupAccountProbeCancellation.dispose(true);
    this._disposeTransientAccountConnection();
    this._disposeConnection();
    this._clearRuntimeState();
  }
  async shutdown() {
    this._stopRuntime();
  }
  resolveChatConfig(params) {
    const values = codexSessionConfigSchema.validateOrDefault(params.config, codexSessionConfigDefaults);
    const schema = codexVisibleSessionConfigSchema.toProtocol();
    const resolvedValues = {
      ...params.config,
      ["mode" /* Mode */]: values["mode" /* Mode */]
    };
    delete resolvedValues["codex.permissionsPreset" /* PermissionsPreset */];
    delete resolvedValues["codex.approvalPolicy" /* ApprovalPolicy */];
    delete resolvedValues["codex.sandboxMode" /* SandboxMode */];
    Object.assign(resolvedValues, migrateCodexPermissionValues(params.config, {
      approvalPolicy: codexSessionConfigDefaults["codex.approvalPolicy" /* ApprovalPolicy */],
      sandboxMode: codexSessionConfigDefaults["codex.sandboxMode" /* SandboxMode */]
    }));
    return Promise.resolve({ values: resolvedValues, schema });
  }
  getInheritedChatConfig(config) {
    const inherited = migrateCodexPermissionValues(config, {
      approvalPolicy: codexSessionConfigDefaults["codex.approvalPolicy" /* ApprovalPolicy */],
      sandboxMode: codexSessionConfigDefaults["codex.sandboxMode" /* SandboxMode */]
    });
    if (config["permissions" /* Permissions */] !== void 0) {
      inherited["permissions" /* Permissions */] = config["permissions" /* Permissions */];
    }
    return Object.keys(inherited).length > 0 ? inherited : void 0;
  }
  getAutonomousSessionConfig(_config) {
    return getCodexAutonomousSessionConfig(this._configurationService.getRootValue(platformRootSchema, AgentHostAutoApprovePolicyRestrictedConfigKey) === true);
  }
  async chatConfigCompletions(params) {
    if (params.property !== "codex.additionalDirectories" /* AdditionalDirectories */) {
      return { items: [] };
    }
    const query = params.query?.trim();
    if (!query) {
      return { items: [] };
    }
    const workingDirectory = params.workingDirectory?.fsPath;
    const resolved = isAbsolute(query) ? query : resolve(workingDirectory ?? process.cwd(), query);
    const parent = query.endsWith(sep) ? resolved : dirname(resolved);
    const prefix = query.endsWith(sep) ? "" : basename(resolved).toLowerCase();
    try {
      const entries = await fs11.promises.readdir(parent, { withFileTypes: true });
      return {
        items: entries.filter((entry) => entry.isDirectory() && entry.name.toLowerCase().startsWith(prefix)).slice(0, 50).map((entry) => {
          const value = join(parent, entry.name);
          return { value, label: entry.name, description: value };
        })
      };
    } catch {
      return { items: [] };
    }
  }
  // #endregion
  _fire(sessionUri, action) {
    if (isChatAction(action)) {
      const chatChannel = this._sessions.get(AgentSession.id(sessionUri))?.chatChannel;
      if (!chatChannel) {
        throw new Error(`Codex session ${sessionUri.toString()} has no bound chat channel`);
      }
      this._onDidChatProgress.fire({ kind: "action", resource: chatChannel, action });
      return;
    }
    this._onDidChatProgress.fire({ kind: "action", resource: sessionUri, action });
  }
  dispose() {
    this._stopRuntime();
    super.dispose();
  }
};

CodexAgent = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ICopilotApiService),
  __decorateParam(2, ICodexProxyService),
  __decorateParam(3, IAgentConfigurationService),
  __decorateParam(4, IAgentHostGitHubEndpointService),
  __decorateParam(5, IAgentHostCheckpointService),
  __decorateParam(6, IAgentSdkDownloader),
  __decorateParam(7, IProductService),
  __decorateParam(8, IAgentPluginManager),
  __decorateParam(9, IFileService),
  __decorateParam(10, INativeEnvironmentService),
  __decorateParam(11, IAgentHostProxyResolver),
  __decorateParam(12, IInstantiationService),
  __decorateParam(13, IAgentHostOTelService),
  __decorateParam(14, IAgentHostCustomizationEnablementService),
  __decorateParam(15, IAgentHostSessionTitleSignal),
  __decorateParam(16, IAgentHostWorktreeIsolation),
  __decorateParam(17, ISessionDataService)
], CodexAgent);

function parseBinaryArgs(json) {
  if (!json) {
    return [];
  }
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function codexPackageSuffix(platform3, arch2) {
  if (platform3 !== "linux" && platform3 !== "darwin" && platform3 !== "win32" || arch2 !== "x64" && arch2 !== "arm64") {
    return void 0;
  }
  return `${platform3}-${arch2}`;
}

function codexBinaryTriple(sdkTarget) {
  switch (sdkTarget) {
    case "linux-x64":
      return "x86_64-unknown-linux-musl";
    case "linux-arm64":
      return "aarch64-unknown-linux-musl";
    case "darwin-x64":
      return "x86_64-apple-darwin";
    case "darwin-arm64":
      return "aarch64-apple-darwin";
    case "win32-x64":
      return "x86_64-pc-windows-msvc";
    case "win32-arm64":
      return "aarch64-pc-windows-msvc";
    default:
      return void 0;
  }
}

async function resolveCodexDevSdkRoot(resolvePackageJsonPath = defaultResolveCodexPackageJsonPath) {
  try {
    const pkgJson = await resolvePackageJsonPath();
    return dirname(dirname(dirname(dirname(pkgJson))));
  } catch {
    return void 0;
  }
}

async function defaultResolveCodexPackageJsonPath() {
  const { createRequire: createRequire2 } = await import("node:module");
  return createRequire2(import.meta.url).resolve("@openai/codex/package.json");
}
export { isCodexDesktopGeneratedWorkspace, toCodexModelSelectionId, parseCodexModelSelection, createCodexModeSchema, distinctAbsolutePaths, distinctWorkingDirectories, filesystemPathComparisonKey, toRolloutModelSelection, toRolloutTurnModels, dynamicToolResponseFromResult, toolsSignature, mcpServersSignature, encodeCodexChat, decodeCodexChat, narrowFileChangeDecision, parseBinaryArgs, codexPackageSuffix, codexBinaryTriple, resolveCodexDevSdkRoot, defaultResolveCodexPackageJsonPath, spawn4, fs11, os6, CLIENT_INFO, CODEX_DESKTOP_ROLLOUT_PREFIX_LENGTH, CODEX_DESKTOP_ROLLOUT_PREFIX_CONCURRENCY, CODEX_COLD_SESSION_READ_CONCURRENCY, CODEX_STARTUP_ACCOUNT_PROBE_TIMEOUT_MS, CODEX_DESKTOP_WORKSPACE_DATE_PATTERN, CODEX_DESKTOP_SESSION_META_PATTERN, CODEX_THINKING_LEVEL_KEY, USER_AGENT_PREFIX4, CODEX_SETUP_DOCS_URL, CODEX_SIGN_IN_PROVIDER_NAME, CODEX_REASONING_EFFORTS, CODEX_MCP_APP_CAPABILITIES, MCP_TOOL_APPROVAL_QUESTION_ID_PREFIX, MCP_TOOL_APPROVAL_ANSWER_ALLOW, MCP_TOOL_APPROVAL_ANSWER_DECLINE, CODEX_RESPONSES_ENDPOINT, CODEX_COPILOT_MODEL_PROVIDER, CODEX_COPILOT_MODEL_GROUP, CODEX_OPENAI_MODEL_PROVIDER, CODEX_MODEL_SELECTION_PREFIX, codexSessionConfigSchema, codexVisibleSessionConfigSchema, codexSessionConfigDefaults, CodexPrewarmTtlMs, CodexConnectionReplacedError, CodexSdkPackage, CodexActiveClientHandle, CodexAgent };
