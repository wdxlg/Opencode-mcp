// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotAgent.ts
import { DeferredPromise, Delayer, Limiter, Sequencer, SequencerByKey, createCancelablePromise, disposableTimeout, raceTimeout, timeout } from "./module-0027.mjs";
import { CopilotClientStartupConfigChangedError, classifyCopilotClientOperationFailure, createCopilotFailureCorrelation, isRecognizedCopilotClientStartupFailure, reportCopilotClientOperationFailure, reportCopilotClientRecovery, reportCopilotClientRecoveryTurn, reportCopilotClientStartup } from "./module-0288.mjs";
import { URI } from "./module-0023.mjs";
import { hasClientPluginMcpDefaultCwd, readClientPluginMcpDefaultCwd } from "./module-0311.mjs";
import { FileAccess, Schemas } from "./module-0024.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0010.mjs";
import { basename2, isEqual2, isEqualOrParent2, joinPath, relativePath } from "./module-0025.mjs";
import { autorun } from "./module-0068.mjs";
import { Emitter } from "./module-0016.mjs";
import { observableValueOpts } from "./module-0066.mjs";
import { structuralEquals } from "./module-0050.mjs";
import { observableValue } from "./module-0064.mjs";
import { MODEL_REFRESH_BASE_DELAY_MS, MODEL_REFRESH_MAX_ATTEMPTS, MODEL_REFRESH_MAX_DELAY_MS, modelRefreshBackoff } from "./module-0154.mjs";
import { ResourceMap } from "./module-0006.mjs";
import { AgentSession, SubagentChatSignal, resolveAgentChatContext, resolveAgentHostCustomizations, resolveAgentHostInstructions, resolveSubagentChatParent } from "./module-0048.mjs";
import { ContextSizeConfigKey, CopilotSessionLauncher, ThinkingLevelConfigKey, getCopilotContextTier, isCopilotReasoningEffort, resolveCopilotReasoningEffort } from "./module-0245.mjs";
import { CopilotCliVSCodeAssignmentContextKey, DEFAULT_COPILOT_RUBBER_DUCK_ENABLED, copilotCliConfigSchema } from "./module-0107.mjs";
import { CopilotGitHubTelemetryForwarder } from "./module-0292.mjs";
import { CopilotSecondaryAssignmentContext } from "./module-0294.mjs";
import { CopilotSlashCommandProvider } from "./module-0286.mjs";
import { isAgentHostTelemetryService } from "./module-0266.mjs";
import { AgentHostGitHubTelemetryRouter } from "./module-0296.mjs";
import { CopilotSlashCommandCompletionProvider } from "./module-0305.mjs";
import { AH_META_EHCLI_ADOPTED_DB_KEY, AH_META_IS_ARCHIVED_DB_KEY, AH_META_IS_READ_DB_KEY, AH_META_WORKSPACELESS_DB_KEY, buildChatUri, buildDefaultChatUri, customizationId, isDefaultChatUri, withSessionEhcliAdoptable } from "./module-0047.mjs";
import { decodeProviderData, encodeProviderData } from "./module-0136.mjs";
import { AgentHostAutoApprovePolicyRestrictedConfigKey, AgentHostByokModelsEnabledConfigKey, AgentHostCopilotMultiRootEnabledConfigKey, AgentHostGitHubMcpServerEnabledConfigKey, AgentHostMcpServersConfigKey, AgentHostMigrateLegacyCopilotCliEnabledConfigKey, AgentHostProxyConfigKey, AgentHostSessionSyncEnabledConfigKey, AgentHostSystemProxyEnabledConfigKey, agentHostProxyConfigSchema, migrateLegacyAutopilotConfig, platformRootSchema, platformSessionSchema } from "./module-0057.mjs";
import { CopilotAgentStartupConfig } from "./module-0295.mjs";
import { generateUuid } from "./module-0042.mjs";
import { StopWatch } from "./module-0015.mjs";
import { localize } from "./module-0012.mjs";
import { DEFAULT_SESSION_CUSTOMIZATION_DISCOVERY_MODE, agentHostCustomizationConfigSchema, toContainerCustomization } from "./module-0105.mjs";
import { getAppNodeModulesPath } from "./module-0222.mjs";
import { delimiter, dirname, join } from "./module-0018.mjs";
import { applyMcpServerEnablement, buildMcpTopLevelCustomizationId } from "./module-0163.mjs";
import { CancellationToken } from "./module-0017.mjs";
import { computeFolderPickerDecisionForRoots } from "./module-0309.mjs";
import { SessionCustomizationDiscovery, areDiscoveredDirectoriesEqual, workspaceDirectoryHasHooks } from "./module-0307.mjs";
import { CancellationError, getErrorMessage } from "./module-0002.mjs";
import { getByokLmAgentModelId, resolveByokLmEnablement } from "./module-0156.mjs";
import { createAgentModelByokMeta } from "./module-0134.mjs";
import { createCopilotCliEnvironment } from "./module-0290.mjs";
import { COPILOT_INTEGRATION_ID } from "./module-0172.mjs";
import { rgDiskPath } from "./module-0121.mjs";
import { getReasoningEffortDescription, getReasoningEffortLabel, resolveDefaultReasoningEffort } from "./module-0106.mjs";
import { createPricingMetaFromBilling, hasLongContextSurcharge, normalizeCAPIBilling } from "./module-0133.mjs";
import { formatTokenCount } from "./module-0120.mjs";
import { getCopilotHomePath } from "./module-0138.mjs";
import { workspacelessScratchDir } from "./module-0130.mjs";
import { projectFromCopilotContext } from "./module-0291.mjs";
import { buildSessionEventLogFromTurns } from "./module-0179.mjs";
import { ShellManager } from "./module-0224.mjs";
import { areAdditionalWorkingDirectoriesEqual } from "./module-0155.mjs";
import { equals2 } from "./module-0035.mjs";
import { IAgentHostWorktreeIsolation, SessionWorkingDirectoryMissingError } from "./module-0165.mjs";
import { ISessionDataService, SESSION_DB_FILENAME } from "./module-0139.mjs";
import { CopilotAgentSession } from "./module-0180.mjs";
import { GITHUB_MCP_SERVER_NAME } from "./module-0306.mjs";
import { getSdkMcpServerEnablement, isCustomizationSdkEligible, resolveCustomizationEnablement } from "./module-0176.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostSessionTitleSignal } from "./module-0177.mjs";
import { IAgentHostManagedSettingsService } from "./module-0159.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";
import { IAgentHostOTelService } from "./module-0137.mjs";
import { IAgentHostCompletions } from "./module-0118.mjs";
import { IAgentHostCheckpointService } from "./module-0131.mjs";
import { IAgentHostReviewService } from "./module-0132.mjs";
import { IAgentHostCustomizationEnablementService } from "./module-0175.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";
import { IByokLmBridgeRegistry } from "./module-0178.mjs";
import { ITelemetryService } from "./module-0053.mjs";
import { ICopilotApiService } from "./module-0168.mjs";
import { IAgentHostProxyResolver } from "./module-0140.mjs";
import { IFileService } from "./module-0128.mjs";
import { parseAgentFile, parsePlugin, parseRuleFile, parseSkillFile } from "./module-0126.mjs";
import { parsedPluginsEqual, toChildCustomizations } from "./module-0208.mjs";
import { IAgentPluginManager } from "./module-0135.mjs";
import { isCustomizationEnabled } from "./module-0157.mjs";
import { SessionMcpDiscovery } from "./module-0310.mjs";
import { ActiveClientToolSet, structuralToolsEqual } from "./module-0158.mjs";


// src/vs/platform/agentHost/node/copilot/copilotAgent.ts
import * as fs6 from "fs/promises";

import * as os4 from "os";

import { pathToFileURL } from "url";


// src/vs/platform/agentHost/node/copilot/copilotAgent.ts
var COPILOT_MANAGED_SETTINGS_QUERY_TIMEOUT_MS = 3500;

var COPILOT_MANAGED_SETTINGS_DIAGNOSTICS_TIMEOUT_MS = 4500;

var COPILOT_ENABLE_BUILTIN_GITHUB_MCP_ENV_VAR = "COPILOT_ENABLE_BUILTIN_GITHUB_MCP";

function setCopilotBuiltinGitHubMcpEnvironment(env2, enabled) {
  for (const key of Object.keys(env2)) {
    if (key.toUpperCase() === COPILOT_ENABLE_BUILTIN_GITHUB_MCP_ENV_VAR) {
      delete env2[key];
    }
  }
  if (enabled) {
    env2[COPILOT_ENABLE_BUILTIN_GITHUB_MCP_ENV_VAR] = "true";
  }
}

function isCopilotRuntimeManagedSettingsSdk(value) {
  return typeof value === "object" && value !== null && "getManagedSettings" in value && typeof value.getManagedSettings === "function";
}

async function getCopilotManagedSettingsDiagnostics(runtimeSdk, token, host, signal, timeoutMs = COPILOT_MANAGED_SETTINGS_QUERY_TIMEOUT_MS, proxy = void 0) {
  const request = invokeWithProxyEnvironment(proxy, () => runtimeSdk.getManagedSettings({
    ...token ? { authInfo: { type: "token", host, token }, token } : {},
    signal
  }));
  const result = await raceTimeout(request, timeoutMs);
  if (!result) {
    throw new Error(`Copilot runtime managed-settings query exceeded ${timeoutMs / 1e3} seconds while waiting for native MDM or GitHub policy resolution.`);
  }
  return result;
}

function invokeWithProxyEnvironment(proxy, invoke) {
  if (!proxy) {
    return invoke();
  }
  const previousValues = COPILOT_PROXY_SET_ENV_KEYS.map((key) => process.env[key]);
  for (const key of COPILOT_PROXY_SET_ENV_KEYS) {
    process.env[key] = proxy;
  }
  try {
    return invoke();
  } finally {
    for (let index = 0; index < COPILOT_PROXY_SET_ENV_KEYS.length; index++) {
      const key = COPILOT_PROXY_SET_ENV_KEYS[index];
      const value = previousValues[index];
      if (value === void 0) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

var RUNTIME_SLASH_COMMAND_COMPLETION_WAIT_MS = 300;

var COPILOT_CAPI_URL = "https://api.githubcopilot.com";

function isCopilotConnectionClosedError(error) {
  return classifyCopilotClientOperationFailure(error) === "connectionClosed";
}

var COPILOT_PROXY_ENV_KEYS = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy"];

var COPILOT_PROXY_SET_ENV_KEYS = ["HTTP_PROXY", "HTTPS_PROXY"];

async function fileExists2(filePath) {
  try {
    await fs6.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isLinuxMuslRuntime() {
  if (process.platform !== "linux") {
    return false;
  }
  const report = process.report?.getReport();
  return !report?.header?.glibcVersionRuntime;
}

function getCopilotPlatformPackageCandidates() {
  const platformArch = `${process.platform}-${process.arch}`;
  if (process.platform !== "linux") {
    return [platformArch];
  }
  const linuxCandidates = [`linux-${process.arch}`, `linuxmusl-${process.arch}`];
  return isLinuxMuslRuntime() ? linuxCandidates.reverse() : linuxCandidates;
}

async function resolveCopilotCliPath(nodeModulesUri) {
  const tried = [];
  for (const platformPackage of getCopilotPlatformPackageCandidates()) {
    const cliPath = URI.joinPath(nodeModulesUri, "@github", `copilot-${platformPackage}`, "index.js").fsPath;
    tried.push(cliPath);
    if (await fileExists2(cliPath)) {
      return cliPath;
    }
  }
  const oldTopLevelPath = URI.joinPath(nodeModulesUri, "@github", "copilot", "index.js").fsPath;
  tried.push(oldTopLevelPath);
  if (await fileExists2(oldTopLevelPath)) {
    return oldTopLevelPath;
  }
  throw new Error(`Unable to resolve @github/copilot CLI path. Tried: ${tried.join(", ")}`);
}

function resolveCopilotMcpServerInfo(definition, pluginDir, input, primaryCwd) {
  const clientDefaultCwd = input ? readClientPluginMcpDefaultCwd(input, definition.name, primaryCwd) : void 0;
  return {
    ...definition,
    defaultCwd: clientDefaultCwd ?? definition.defaultCwd,
    sdkRegistration: input && hasClientPluginMcpDefaultCwd(input, definition.name) ? "sessionConfig" : pluginDir?.scheme === Schemas.file ? "pluginDiscovery" : "sessionConfig"
  };
}

var NO_HOST_CUSTOMIZATIONS = Object.freeze([]);

var CopilotSessionLifetime = class {
  constructor() {
    this._activeLeases = 0;
    this._pendingReleases = 0;
    this._exclusiveTail = Promise.resolve();
    this._isDisposing = false;
    this._isPermanentlyClosed = false;
    this._peerResumes = /* @__PURE__ */ new Map();
    this._sessionSequencer = new Sequencer();
    this._chatSequencer = new SequencerByKey();
    this._queuedWork = /* @__PURE__ */ new Set();
  }
  get isPermanentlyClosed() {
    return this._isPermanentlyClosed;
  }
  queueSession(task) {
    return this._track(this._sessionSequencer.queue(task));
  }
  queueChat(chatKey, task) {
    return this._track(this._chatSequencer.queue(chatKey, task));
  }
  resumeDefault(factory) {
    const existing = this._defaultResume;
    if (existing) {
      return existing;
    }
    const resume = factory();
    this._defaultResume = resume;
    const cleanup = () => {
      if (this._defaultResume === resume) {
        this._defaultResume = void 0;
      }
    };
    resume.then(cleanup, cleanup);
    return resume;
  }
  resumePeer(chatKey, factory) {
    const existing = this._peerResumes.get(chatKey);
    if (existing) {
      return existing;
    }
    const resume = factory();
    this._peerResumes.set(chatKey, resume);
    const cleanup = () => {
      if (this._peerResumes.get(chatKey) === resume) {
        this._peerResumes.delete(chatKey);
      }
    };
    resume.then(cleanup, cleanup);
    return resume;
  }
  async acquire() {
    while (!this._isDisposing && !this._isPermanentlyClosed) {
      const reopened = this._reopened;
      if (reopened) {
        await reopened.p;
        continue;
      }
      this._activeLeases++;
      let disposed = false;
      return toDisposable(() => {
        if (disposed) {
          return;
        }
        disposed = true;
        this._activeLeases--;
        if (this._activeLeases === 0) {
          this._drained?.complete();
        }
      });
    }
    return void 0;
  }
  release(task) {
    if (this._isDisposing || this._isPermanentlyClosed) {
      return Promise.resolve();
    }
    this._pendingReleases++;
    this._reopened ??= new DeferredPromise();
    const previous = this._exclusiveTail;
    const release3 = (async () => {
      await previous;
      await this._waitForLeases();
      await task();
    })();
    const completed = release3.finally(() => {
      this._pendingReleases--;
      if (this._pendingReleases === 0 && !this._isDisposing && !this._isPermanentlyClosed) {
        this._reopened?.complete();
        this._reopened = void 0;
      }
    });
    this._exclusiveTail = completed.catch(() => void 0);
    return completed;
  }
  async dispose(task) {
    if (this._disposePromise) {
      return this._disposePromise;
    }
    if (this._isPermanentlyClosed) {
      return;
    }
    this._isDisposing = true;
    this._reopened?.complete();
    this._reopened = void 0;
    const previous = this._exclusiveTail;
    const dispose2 = (async () => {
      try {
        await previous;
        await this._waitForLeases();
        await task();
        this._isPermanentlyClosed = true;
      } catch (error) {
        if (!this._isPermanentlyClosed) {
          this._isDisposing = false;
          this._reopened?.complete();
          this._reopened = void 0;
        }
        throw error;
      }
    })();
    this._disposePromise = dispose2;
    this._exclusiveTail = dispose2.catch(() => void 0);
    try {
      await dispose2;
    } finally {
      if (!this._isPermanentlyClosed && this._disposePromise === dispose2) {
        this._disposePromise = void 0;
      }
    }
  }
  async close() {
    this._isPermanentlyClosed = true;
    this._reopened?.complete();
    this._reopened = void 0;
    await this._waitForQueuedWork();
    await this._exclusiveTail;
    await this._waitForLeases();
  }
  _track(work) {
    const completion = work.then(() => void 0, () => void 0);
    this._queuedWork.add(completion);
    completion.then(() => this._queuedWork.delete(completion));
    return work;
  }
  async _waitForQueuedWork() {
    while (this._queuedWork.size > 0) {
      await Promise.all(this._queuedWork);
    }
  }
  async _waitForLeases() {
    if (this._activeLeases === 0) {
      return;
    }
    const drained = this._drained ??= new DeferredPromise();
    await drained.p;
    if (this._drained === drained) {
      this._drained = void 0;
    }
  }
};

function toRestrictedTelemetryEndpoint(endpoint) {
  return endpoint ? `${endpoint.replace(/\/+$/, "")}/telemetry` : void 0;
}

function rebaseUnder(uri, fromDir, toDir) {
  if (!isEqualOrParent2(uri, fromDir)) {
    return void 0;
  }
  const rel = relativePath(fromDir, uri);
  if (rel === void 0) {
    return void 0;
  }
  return rel.length === 0 ? toDir : joinPath(toDir, rel);
}

var CopilotChatEntry = class extends Disposable {
  constructor(chatSession, activeClient, onMcpNotification, onDidRequireAuth) {
    super();
    this.chatSession = chatSession;
    this._register(chatSession);
    this._register(chatSession.onMcpNotification((notification) => onMcpNotification.fire(notification)));
    this._register(chatSession.onDidRequireAuth(onDidRequireAuth));
    this._register(autorun((reader) => activeClient.pluginController.mcpServerStates.set(chatSession.mcpServerStates.read(reader), void 0)));
  }
};

function resolveCopilotOtlpMetricsEndpoint(endpoint, protocol) {
  if (protocol === "grpc") {
    return endpoint;
  }
  try {
    const url2 = new URL(endpoint);
    if (url2.pathname === "" || url2.pathname === "/") {
      url2.pathname = "/v1/metrics";
    } else if (url2.pathname.endsWith("/v1/traces")) {
      url2.pathname = `${url2.pathname.slice(0, -"/v1/traces".length)}/v1/metrics`;
    }
    return url2.toString().replace(/\/$/, "");
  } catch {
    return endpoint;
  }
}

var COPILOT_EXTERNAL_SESSION_CLIENT_NAMES = /* @__PURE__ */ new Set(["github/cli", "github/autopilot"]);

var COPILOT_EXTERNAL_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1e3;

var COPILOT_DISCOVERY_BATCH_SIZE = 250;

var CHAT_DISCOVERY_RETRY_DELAYS_MS = [250, 1e3, 5e3];

var MAX_STARTUP_CONFIG_RETRIES = 1;

var EXTENSION_HOST_CLI_MARKER_ORIGIN = "vscode";

var EXTENSION_HOST_CLI_MARKER_FILE = "vscode.metadata.json";

function parseExtensionHostCliMarker(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : void 0;
  } catch {
    return void 0;
  }
}

function isExtensionHostCliMarker(marker) {
  if (!marker || Object.keys(marker).length === 0) {
    return false;
  }
  if (marker.origin !== void 0) {
    return marker.origin === EXTENSION_HOST_CLI_MARKER_ORIGIN;
  }
  return marker.repositoryProperties !== void 0 || marker.worktreeProperties !== void 0 || marker.workspaceFolder !== void 0;
}

function extensionHostCliWorkingDirectoryPaths(marker) {
  return [
    marker?.worktreeProperties?.worktreePath,
    marker?.workspaceFolder?.folderPath,
    marker?.repositoryProperties?.repositoryPath,
    marker?.worktreeProperties?.repositoryPath
  ].filter((path) => typeof path === "string" && path.length > 0);
}

function extensionHostCliRepositoryPath(marker) {
  const path = marker?.worktreeProperties?.repositoryPath ?? marker?.repositoryProperties?.repositoryPath;
  return typeof path === "string" && path.length > 0 ? path : void 0;
}

var NANO_AIU_PER_CREDIT = 1e9;

var CopilotAgent = class extends Disposable {
  constructor(_logService, _instantiationService, _sessionDataService, _gitService, _configurationService, sessionTitleSignal, _managedSettingsService, _gitHubEndpointService, _otelService, completions, _checkpointService, _reviewService, _customizationEnablementService, _environmentService, _byokBridgeRegistry, _telemetryService, _copilotApiService, _proxyResolver, _fileService, worktree) {
    super();
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._sessionDataService = _sessionDataService;
    this._gitService = _gitService;
    this._configurationService = _configurationService;
    this._managedSettingsService = _managedSettingsService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._otelService = _otelService;
    this._checkpointService = _checkpointService;
    this._reviewService = _reviewService;
    this._customizationEnablementService = _customizationEnablementService;
    this._environmentService = _environmentService;
    this._byokBridgeRegistry = _byokBridgeRegistry;
    this._telemetryService = _telemetryService;
    this._copilotApiService = _copilotApiService;
    this._proxyResolver = _proxyResolver;
    this._fileService = _fileService;
    this.id = "copilotcli";
    this._now = Date.now;
    this._onDidChatProgress = this._register(new Emitter());
    this.onDidChatProgress = this._onDidChatProgress.event;
    this._authenticationRequired = observableValueOpts(
      { owner: this, equalsFn: structuralEquals },
      void 0
    );
    this.authenticationRequired = this._authenticationRequired;
    /**
     * Membership channel for chats the agent spawns itself — sub-agents
     * delegated by a tool call (the same fan-out the `subagent_started` /
     * `subagent_completed` signals drive). The orchestrator routes these into
     * the chat catalog so harness-spawned and user-driven chats share one path.
     */
    this._onDidSpawnChat = this._register(new Emitter());
    this.onDidSpawnChat = this._onDidSpawnChat.event;
    this._onDidMaterializeChat = this._register(new Emitter());
    this.onDidMaterializeChat = this._onDidMaterializeChat.event;
    /**
     * Fires when the native chat catalog may have changed. The {@link AgentService}
     * responds with an additive discovery pass.
     */
    this._onDidDiscoverChats = this._register(new Emitter());
    this.onDidDiscoverChats = this._onDidDiscoverChats.event;
    /**
     * Per-session MCP notifications, fanned in from every active
     * {@link CopilotAgentSession}. Each session contributes a single
     * subscription, disposed alongside the session.
     */
    this._onMcpNotification = this._register(new Emitter());
    this.onMcpNotification = this._onMcpNotification.event;
    this._models = observableValue(this, []);
    this.models = this._models;
    /**
     * The two sources merged into {@link _models}: CAPI models from the CLI's
     * `models.list` and BYOK models from the renderer bridge registry's serving
     * window. Tracked separately so each can refresh independently without
     * clobbering the other; {@link _publishModels} concatenates them for the
     * picker.
     */
    this._capiModels = [];
    this._byokModels = [];
    /** Model IDs whose long-context tier costs the same as the default tier (free long context). */
    this._freeLongContextModels = /* @__PURE__ */ new Set();
    /**
     * Bounded exponential-backoff retry for {@link _refreshModels}. The SDK's
     * `models.list` RPC can fail transiently (e.g. a `429 "too many requests"`
     * right after startup). Without a retry the model picker would stay empty
     * until the next external refresh trigger (a GitHub token change, a CLI
     * client restart, or the host's periodic scheduler), so we retry a few
     * times before giving up. Overridable in tests to avoid real delays.
     */
    this._modelRefreshMaxAttempts = MODEL_REFRESH_MAX_ATTEMPTS;
    this._modelRefreshBaseDelayMs = MODEL_REFRESH_BASE_DELAY_MS;
    this._modelRefreshMaxDelayMs = MODEL_REFRESH_MAX_DELAY_MS;
    /** Pending model-refresh retry timer; cleared on a fresh refresh, shutdown, or dispose. */
    this._modelRefreshRetry = this._register(new MutableDisposable());
    /**
     * Invalidates model requests bound to a superseded token/client/catalog
     * source. Token identity alone is insufficient: restarting the client for
     * a `COPILOT_GH_HOST` change keeps the same token while changing the CAPI
     * endpoint whose catalog is authoritative.
     */
    this._modelCatalogGeneration = 0;
    this._modelRefreshSchedule = this._register(new MutableDisposable());
    this._clientStartupAttemptCount = 0;
    this._proxyResolutionGeneration = 0;
    /**
     * Reasons for a client restart that is parked until every chat is idle. See
     * {@link _requestClientRestart}; drained by {@link _applyPendingClientRestart}.
     */
    this._pendingClientRestartReasons = /* @__PURE__ */ new Set();
    this._authenticationSequencer = new Sequencer();
    this._updatingGitHubCredentials = false;
    /** Reflects the restricted-telemetry entitlement from `/copilot_internal/user`. */
    this._restrictedTelemetryEnabled = false;
    this._onDidChangeRestrictedTelemetry = this._register(new Emitter());
    this.onDidChangeRestrictedTelemetry = this._onDidChangeRestrictedTelemetry.event;
    this._chatEntriesBySdkId = this._register(new DisposableMap());
    /** Exact host chat URI -> persisted provider backing; live SDK sessions are tracked separately. */
    this._chatBackings = /* @__PURE__ */ new Map();
    /** Exact chat -> recorded configuration scope, used for fork/restore paths that only know the chat URI. */
    this._chatScopes = /* @__PURE__ */ new Map();
    /** Exact chat -> host-selected persistence scope. */
    this._chatStorageScopes = /* @__PURE__ */ new Map();
    /** Fires when persisted chat backing data changes after creation. */
    this._onDidChangeChatData = this._register(new Emitter());
    this.onDidChangeChatData = this._onDidChangeChatData.event;
    this._sessionLifetimes = /* @__PURE__ */ new Map();
    /** Provisional chats that defer SDK/session creation until the first send. */
    this._provisionalSessions = /* @__PURE__ */ new Map();
    this._isShuttingDown = false;
    /** Per-session active client state for tools + plugin snapshot tracking. */
    this._activeClients = new ResourceMap();
    /**
     * Last host-published customization snapshot per configuration scope (AGENTS.md section 8b).
     * Updated only from host call boundaries; absence is distinct from an empty list.
     */
    this._hostCustomizations = new ResourceMap();
    this._copilotChatDiscoverySequencer = new Sequencer();
    this._discoveredChats = /* @__PURE__ */ new Map();
    /**
     * Chat-addressed surface for the chats within a session.
     */
    this.chats = {
      createChat: (chat, context, options) => {
        this._noteHostCustomizations(context);
        return this._createChat(chat, resolveAgentChatContext(context, chat), options);
      },
      disposeChat: (chatUri, context) => this._disposeChat(chatUri, context),
      canReleaseChat: (chatUri, context) => this._canReleaseChat(chatUri, context),
      releaseChat: (chatUri, context) => this._releaseChat(chatUri, context),
      sendMessage: (chatUri, prompt, workingDirectoriesOrDirectory, attachments, turnId, senderClientId, clientTypeOrContext, context) => {
        const workingDirectories = Array.isArray(workingDirectoriesOrDirectory) ? workingDirectoriesOrDirectory : workingDirectoriesOrDirectory ? [workingDirectoriesOrDirectory] : void 0;
        const clientType = typeof clientTypeOrContext === "string" ? clientTypeOrContext : "unknown" /* Unknown */;
        const operationContext = context ?? (typeof clientTypeOrContext === "string" ? void 0 : clientTypeOrContext);
        const clientTelemetryContext = URI.isUri(operationContext) ? void 0 : operationContext?.clientTelemetryContext;
        return this._sendMessage(chatUri, prompt, attachments, turnId, senderClientId, clientType, workingDirectories, operationContext, clientTelemetryContext);
      },
      abort: (chatUri, context) => {
        return this._abortSession(chatUri, context);
      },
      getModel: (chatUri) => this._chatBackings.get(chatUri.toString())?.model,
      changeModel: (chatUri, model, context) => {
        return this._changeModel(chatUri, model, context);
      },
      resumeTurn: (chatUri, turnId, context, senderClientId, clientType) => {
        return this._resumeTurn(chatUri, turnId, context, senderClientId, clientType);
      },
      changeAgent: (chatUri, agent, context) => {
        return this._changeAgent(chatUri, agent, context);
      },
      getMessages: (chat, context) => this._getChatMessages(chat, context)
    };
    /** Memoizes the (stable) marker read so repeated `listSessions` calls don't re-read the disk. */
    this._extensionHostCliMarkerCache = /* @__PURE__ */ new Map();
    this._worktree = worktree;
    this._lastStartupConfig = this._readClientStartupConfig();
    this._plugins = this._register(this._instantiationService.createInstance(PluginController, () => this._ensureClient()));
    this._sessionLauncher = this._instantiationService.createInstance(CopilotSessionLauncher);
    this._configurationService.publishRootTransientValues?.({ [CopilotCliVSCodeAssignmentContextKey]: void 0 });
    this._gitHubTelemetryForwarder = this._instantiationService.createInstance(CopilotGitHubTelemetryForwarder, () => this._restrictedTelemetryEnabled);
    this._secondaryAssignmentContext = this._instantiationService.createInstance(CopilotSecondaryAssignmentContext);
    this._register(this._configurationService.onDidRootConfigChange(() => this._updateVSCodeAssignmentContext()));
    this._updateVSCodeAssignmentContext();
    this._slashCommandProvider = new CopilotSlashCommandProvider(() => this._ensureClient().then((c) => c.rpc.commands.list().then((c2) => c2.commands)), this._logService);
    this._githubTelemetryRouter = isAgentHostTelemetryService(this._telemetryService) ? new AgentHostGitHubTelemetryRouter(this._telemetryService) : void 0;
    this._register(this._proxyResolver.onDidRegisterConnection(() => this._refreshProxy()));
    this._register(this._proxyResolver.onDidChangeConfiguration(() => this._refreshProxy()));
    this.onDidCustomizationsChange = this._plugins.onDidChange;
    this._register(sessionTitleSignal.onDidChangeSessionTitle(({ provider, session, title }) => {
      if (provider === this.id) {
        this._otelService.emitSessionTitleChanged(this._sdkConversationId(session), session.toString(), title);
      }
    }));
    this._register(this._onDidChatProgress.event((signal) => this._emitSpawnedChatForSubagentSignal(signal)));
    this._register(completions.registerProvider(new CopilotSlashCommandCompletionProvider(
      this.id,
      {
        isRubberDuckEnabled: () => this._isRubberDuckEnabled(),
        getRuntimeSlashCommands: (sessionId, options) => this._getRuntimeSlashCommands(sessionId, options),
        getSessionCustomizations: (sessionId) => {
          const session = AgentSession.uri(this.id, sessionId);
          const chat = URI.parse(buildDefaultChatUri(session));
          return this.getChatCustomizations(chat, { configurationResource: session, resource: chat });
        },
        getSessionConfigState: (sessionId) => this._getSessionConfigState(sessionId)
      },
      RUNTIME_SLASH_COMMAND_COMPLETION_WAIT_MS
    )));
    this._register(this._configurationService.onDidRootConfigChange(() => {
      this._restartClientIfStartupConfigChanged().catch(
        (err) => this._logService.error("[Copilot] Failed to apply root config change", err)
      );
    }));
    this._register(this._managedSettingsService.onDidChange(() => {
      this._restartClientIfStartupConfigChanged().catch(
        (err) => this._logService.error("[Copilot] Failed to apply managed settings change", err)
      );
    }));
    this._register(this._configurationService.onDidRootConfigChange(() => {
      this._refreshByokModels();
    }));
    this._register(this._byokBridgeRegistry.onDidChangeModels(() => {
      this._logService.info("[Copilot] BYOK bridge changed; refreshing models");
      this._refreshByokModels();
    }));
    this._register(this._gitHubEndpointService.onDidChange(() => {
      this._restartClientIfStartupConfigChanged().catch(
        (err) => this._logService.error("[Copilot] Failed to restart client after endpoint change", err)
      );
    }));
  }
  setServerToolHost(host) {
    this._serverToolHost = host;
  }
  get restrictedTelemetryEnabled() {
    return this._restrictedTelemetryEnabled;
  }
  _rememberChatScope(chat, scope, storageScope) {
    this._chatScopes.set(chat.toString(), scope);
    this._chatStorageScopes.set(chat.toString(), storageScope);
  }
  /** Returns the recorded configuration scope for a created or materialized chat. */
  _resolveChatScope(chat) {
    const scope = this._chatScopes.get(chat.toString());
    if (!scope) {
      throw new Error(`[Copilot] No recorded scope for chat ${chat.toString()}; it must be created or materialized before it can be forked from`);
    }
    return scope;
  }
  _resolveChatStorageScope(chat) {
    return this._chatStorageScopes.get(chat.toString()) ?? this._resolveChatScope(chat);
  }
  /** Ref count for chats that still share `scope`, used to decide when scope cleanup can run. */
  _remainingChatsForScope(scope) {
    let count = 0;
    for (const recorded of this._chatScopes.values()) {
      if (isEqual2(recorded, scope)) {
        count++;
      }
    }
    return count;
  }
  /** Formats a chat backing for host persistence; only separately enumerable SDK sessions report `backingSession`. */
  _chatBackingResult(sessionId, backing) {
    return {
      providerData: encodeProviderData(backing),
      ...backing.sdkSessionId !== sessionId ? { backingSession: AgentSession.uri(this.id, backing.sdkSessionId) } : {}
    };
  }
  /**
   * Translates the sub-agent fan-out signals into the first-class spawned-
   * chat channel: `subagent_started` -> {@link onDidSpawnChat}
   * (carrying the spawning tool call as the chat's parent edge). A completed
   * subagent chat stays live and subscribable (it is removed only on session
   * teardown), so there is no corresponding end event. The signals themselves
   * are left untouched so the existing sub-agent behavior is preserved.
   */
  _emitSpawnedChatForSubagentSignal(signal) {
    const spawn6 = SubagentChatSignal.toSpawnEvent(signal);
    if (spawn6) {
      this._onDidSpawnChat.fire(spawn6);
    }
  }
  _isSessionSyncEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostSessionSyncEnabledConfigKey) === true;
  }
  _isRubberDuckEnabled() {
    return this._configurationService.getRootValue(copilotCliConfigSchema, "rubberDuck" /* RubberDuck */) ?? DEFAULT_COPILOT_RUBBER_DUCK_ENABLED;
  }
  _isMultiTurnContextRoutingEnabled() {
    return this._configurationService.getRootValue(copilotCliConfigSchema, "multiTurnContextRouting" /* MultiTurnContextRouting */) === true;
  }
  _getCopilotSdkLogLevelSetting() {
    return this._configurationService.getRootValue(copilotCliConfigSchema, "copilotSdkLogLevel" /* CopilotSdkLogLevel */) ?? "info";
  }
  _resolveCopilotSdkLogLevel(configured) {
    return configured === "trace" || this._logService.getLevel() === 1 /* Trace */ ? "all" : "info";
  }
  _getEnterpriseHost() {
    return this._gitHubEndpointService.getEnterpriseHost();
  }
  _isSystemProxyEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostSystemProxyEnabledConfigKey) !== false;
  }
  _isGitHubMcpServerEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostGitHubMcpServerEnabledConfigKey) !== false;
  }
  _isMigrateLegacyCopilotCliEnabled() {
    return this._migrateLegacyEnabledSnapshot ??= this._configurationService.getRootValue(platformRootSchema, AgentHostMigrateLegacyCopilotCliEnabledConfigKey) === true;
  }
  _readClientStartupConfig() {
    return new CopilotAgentStartupConfig(
      this._isSessionSyncEnabled(),
      this._isRubberDuckEnabled(),
      this._isMultiTurnContextRoutingEnabled(),
      this._getCopilotSdkLogLevelSetting(),
      this._getEnterpriseHost(),
      this._isSystemProxyEnabled(),
      this._isGitHubMcpServerEnabled(),
      this._managedSettingsService.permissions
    );
  }
  _updateVSCodeAssignmentContext() {
    const value = this._configurationService.getRootConfigValues?.()[CopilotCliVSCodeAssignmentContextKey];
    if (typeof value === "string") {
      this._telemetryService.setExperimentProperty("abexp.assignmentcontext", value);
    }
  }
  /**
   * Restart the CLI client when a startup-baked value changes, but defer past any
   * in-flight turn — see {@link _requestClientRestart} — so the new values are
   * picked up at the next quiet point rather than by killing live work.
   * An in-flight start aborts if any startup value changes.
   */
  async _restartClientIfStartupConfigChanged() {
    const previous = this._lastStartupConfig;
    const current = this._readClientStartupConfig();
    if (current.equals(previous)) {
      return;
    }
    const changed = current.describeChangesFrom(previous);
    this._lastStartupConfig = current;
    if (current.proxyTargetChangedFrom(previous)) {
      this._refreshProxy();
    }
    if (this._client) {
      this._logService.info(`[Copilot] Startup config changed (${changed}), restarting CopilotClient`);
    }
    await this._requestClientRestart(`startup config changed: ${changed}`);
  }
  /**
   * Requests a CLI client restart, running it immediately when every chat is
   * idle and otherwise parking it until the last in-flight turn ends.
   *
   * Restarting tears the SDK sessions down, and a torn-down session stops
   * producing the events that finalize its protocol turn — the client would be
   * left with a turn that never completes, cancels, or errors, i.e. a session
   * that spins forever. Startup-only values (session sync, the SDK log level,
   * the enterprise host, the system proxy) can also change without any user
   * action, from an experiment or policy refresh, so this must never be paid
   * for with a running turn. {@link _ensureClient} reads them fresh on the next
   * start, so applying the restart late is always correct.
   */
  async _requestClientRestart(reason) {
    if (this._shutdownPromise || !this._client && !this._clientStarting) {
      return;
    }
    this._pendingClientRestartReasons.add(reason);
    if (this._clientStarting) {
      try {
        await this._clientStarting;
      } catch {
        this._pendingClientRestartReasons.delete(reason);
        return;
      }
    }
    if (!this._client) {
      return;
    }
    if (this._updatingGitHubCredentials) {
      this._logService.info(`[Copilot] Deferring CopilotClient restart (${reason}) until GitHub credential updates finish`);
      return;
    }
    const busyChats = this._chatsWithActiveTurn();
    if (busyChats > 0) {
      this._logService.info(`[Copilot] Deferring CopilotClient restart (${reason}) until ${busyChats} in-flight turn(s) finish`);
      return;
    }
    await this._applyPendingClientRestart();
  }
  /**
   * Runs a restart parked by {@link _requestClientRestart} once no chat has
   * an in-flight turn. No-op while any turn is still running; the next chat
   * to go idle drives this again.
   */
  async _applyPendingClientRestart() {
    if (this._pendingClientRestartReasons.size === 0 || this._shutdownPromise || !this._client || this._updatingGitHubCredentials || this._chatsWithActiveTurn() > 0) {
      return;
    }
    const reason = [...this._pendingClientRestartReasons].join("; ");
    this._logService.info(`[Copilot] Restarting CopilotClient (${reason})`);
    this._chatEntriesBySdkId.clearAndDisposeAll();
    await this._stopClient();
    this._capiModels = [];
    this._publishModels();
    void this._scheduleModelRefresh();
  }
  /**
   * Called by a {@link CopilotAgentSession} when its turn ends. Scheduled off
   * the current stack because the callback fires from inside that session's
   * SDK event handling and the restart disposes the session making the call.
   */
  _onChatTurnEnded() {
    if (this._pendingClientRestartReasons.size === 0) {
      return;
    }
    queueMicrotask(() => {
      this._applyPendingClientRestart().catch(
        (err) => this._logService.error("[Copilot] Failed to apply deferred client restart", err)
      );
    });
  }
  async _handleClientOperationFailure(error, operation, correlation) {
    const failureKind = classifyCopilotClientOperationFailure(error);
    if (!failureKind) {
      return void 0;
    }
    const clientFailureId = this._closedConnectionRecovery?.clientFailureId ?? generateUuid();
    const recoveryStarted = failureKind === "connectionClosed" && !this._shutdownPromise && this._closedConnectionRecovery === void 0;
    reportCopilotClientOperationFailure(this._telemetryService, clientFailureId, failureKind, operation, this._chatsWithActiveTurn(), recoveryStarted, error, correlation);
    if (failureKind !== "connectionClosed" || this._shutdownPromise) {
      return void 0;
    }
    if (!this._closedConnectionRecovery) {
      const recovery = this._runClosedConnectionRecovery(clientFailureId, failureKind);
      this._closedConnectionRecovery = { clientFailureId, promise: recovery };
      const cleanup = () => {
        if (this._closedConnectionRecovery?.promise === recovery) {
          this._closedConnectionRecovery = void 0;
        }
      };
      recovery.then(cleanup, cleanup);
    }
    return this._closedConnectionRecovery.promise;
  }
  async _runClosedConnectionRecovery(clientFailureId, failureKind) {
    const stopWatch = StopWatch.create();
    const result = await this._doRecoverFromClosedConnection(clientFailureId);
    reportCopilotClientRecovery(this._telemetryService, {
      clientFailureId,
      failureKind,
      durationMs: stopWatch.elapsed(),
      failedTurnCount: result.failedTurnIds.size,
      stopSucceeded: result.stopSucceeded
    });
    return result;
  }
  async _doRecoverFromClosedConnection(clientFailureId) {
    this._logService.error("[Copilot] Recovering from closed SDK connection");
    const failedTurnIds = /* @__PURE__ */ new Set();
    const error = {
      errorType: "providerConnectionClosed",
      message: localize(2482, null)
    };
    for (const chat of this._allLiveSessions()) {
      const clientContext = chat.currentTurnClientContext;
      const failedTurnId = chat.failActiveTurn(error);
      if (failedTurnId) {
        failedTurnIds.add(failedTurnId);
        reportCopilotClientRecoveryTurn(
          this._telemetryService,
          clientFailureId,
          createCopilotFailureCorrelation(chat.sessionUri, chat.chatUri, failedTurnId, chat.sessionId, clientContext)
        );
      }
    }
    this._chatEntriesBySdkId.clearAndDisposeAll();
    let stopSucceeded = true;
    try {
      await this._stopClient();
    } catch (error2) {
      stopSucceeded = false;
      this._logService.error(error2, "[Copilot] Failed to stop closed SDK client");
    }
    this._capiModels = [];
    this._publishModels();
    return { failedTurnIds, stopSucceeded };
  }
  async _retryAfterClosedConnection(operation, task, correlation) {
    const client = await this._ensureClient();
    try {
      return await task(client);
    } catch (error) {
      if (!await this._handleClientOperationFailure(error, operation, correlation)) {
        throw error;
      }
      return task(await this._ensureClient());
    }
  }
  _clientFailureCorrelation(chat, turnId, operationContext) {
    const context = this._resolveSendChatContext(chat, operationContext);
    const clientTelemetryContext = URI.isUri(operationContext) ? void 0 : operationContext?.clientTelemetryContext;
    return createCopilotFailureCorrelation(context.configurationResource, chat, turnId, context.target?.sessionId ?? context.configurationId, clientTelemetryContext);
  }
  /** Number of live chats (default or peer, across all sessions) with an in-flight turn. */
  _chatsWithActiveTurn() {
    return this._allLiveSessions().filter((session) => session.hasActiveTurn).length;
  }
  _createCopilotClient(options) {
    if (!this._copilotSdk) {
      throw new Error("Copilot SDK has not been loaded");
    }
    return new this._copilotSdk.CopilotClient(options);
  }
  // ---- auth ---------------------------------------------------------------
  getDescriptor() {
    return {
      provider: "copilotcli",
      displayName: "Copilot",
      description: localize(2483, null),
      capabilities: {
        multipleChats: { fork: true, sideChat: true },
        ...this._isMultiRootEnabled() ? { multipleWorkingDirectories: { immutablePrimary: true } } : {}
      }
    };
  }
  _isMultiRootEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostCopilotMultiRootEnabledConfigKey) === true;
  }
  getProtectedResources() {
    const allowSignedOutWhenUsable = this._configurationService.getRootValue(agentHostCustomizationConfigSchema, "allowSignedOutWhenUsable" /* AllowSignedOutWhenUsable */) === true;
    const copilotResource = this._gitHubEndpointService.getCopilotResource();
    return [
      allowSignedOutWhenUsable && this._byokModels.length > 0 ? { ...copilotResource, required: false } : copilotResource,
      this._gitHubEndpointService.getRepoResource()
    ];
  }
  async getNetworkDiagnosticsEndpoints() {
    let capiUrl = process.env["VSCODE_AGENT_HOST_CAPI_URL_OVERRIDE"] || COPILOT_CAPI_URL;
    if (this._githubToken) {
      try {
        capiUrl = await this._copilotApiService.resolveApiEndpoint(this._githubToken) || capiUrl;
      } catch (error) {
        this._logService.debug(`[Copilot] CAPI endpoint discovery for network diagnostics failed; using ${capiUrl}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    const capiPingUrl = new URL(capiUrl);
    capiPingUrl.pathname = `${capiPingUrl.pathname.replace(/\/$/, "")}/_ping`;
    return [
      { name: "GitHub API", url: this._gitHubEndpointService.getApiBaseUri() },
      { name: "Copilot API (CAPI)", url: capiPingUrl.toString() }
    ];
  }
  async getNetworkDiagnosticsAccount() {
    return this._githubToken ? this._copilotApiService.resolveUserLogin?.(this._githubToken) : void 0;
  }
  async getManagedSettingsDiagnostics() {
    this._logService.debug("[Copilot] Collecting runtime managed-settings diagnostics");
    let stage = "resolving the Copilot CLI path";
    const diagnostics = (async () => {
      const nodeModulesUri = FileAccess.asFileUri(getAppNodeModulesPath());
      const cliPath = await resolveCopilotCliPath(nodeModulesUri);
      const runtimeSdkPath = join(dirname(cliPath), "sdk", "index.js");
      stage = "checking the Copilot runtime SDK";
      if (!await fileExists2(runtimeSdkPath)) {
        throw new Error(`Copilot runtime SDK not found at ${runtimeSdkPath}`);
      }
      stage = "loading the Copilot runtime SDK";
      const runtimeSdk = await import(pathToFileURL(runtimeSdkPath).href);
      if (!isCopilotRuntimeManagedSettingsSdk(runtimeSdk)) {
        throw new Error("Copilot runtime SDK does not expose getManagedSettings()");
      }
      stage = "resolving the proxy";
      const proxy = await this._resolveProxyForSdk();
      stage = "querying native MDM and GitHub managed settings";
      return getCopilotManagedSettingsDiagnostics(
        runtimeSdk,
        this._githubToken,
        this._gitHubEndpointService.getEnterpriseUri() ?? "https://github.com",
        AbortSignal.timeout(COPILOT_MANAGED_SETTINGS_DIAGNOSTICS_TIMEOUT_MS),
        COPILOT_MANAGED_SETTINGS_QUERY_TIMEOUT_MS,
        proxy
      );
    })();
    const result = await raceTimeout(diagnostics, COPILOT_MANAGED_SETTINGS_DIAGNOSTICS_TIMEOUT_MS);
    if (!result) {
      this._logService.warn(`[Copilot] Runtime managed-settings diagnostics timed out while ${stage}`);
      throw new Error(`Copilot runtime diagnostics exceeded 4.5 seconds while ${stage}.`);
    }
    this._logService.debug("[Copilot] Runtime managed-settings diagnostics collected");
    return {
      ...result.resolved,
      ...result.account ? { account: result.account } : {}
    };
  }
  getCustomizations() {
    return this._plugins.getConfiguredHostCustomizations();
  }
  /** Records the latest host snapshot for `session`; `undefined` means "not published yet", not "empty". */
  _rememberHostCustomizations(session, customizations) {
    if (customizations) {
      this._hostCustomizations.set(session, customizations);
    }
  }
  /** Refreshes the retained host snapshot from a chat-addressed operation context. */
  _noteHostCustomizations(context) {
    if (!context || URI.isUri(context)) {
      return;
    }
    this._rememberHostCustomizations(context.configurationResource, resolveAgentHostCustomizations(context));
  }
  /** Returns the retained host snapshot for `session`, or a stable empty singleton if none was published. */
  _retainedHostCustomizations(session) {
    return this._hostCustomizations.get(session) ?? NO_HOST_CUSTOMIZATIONS;
  }
  /** `hostCustomizations` refreshes the retained host snapshot before plugin/MCP resolution. */
  async getChatCustomizations(chat, context, hostCustomizations) {
    const session = resolveAgentChatContext(context, chat).configurationResource;
    this._rememberHostCustomizations(session, hostCustomizations);
    const anchors = await this._getSessionCustomizationAnchors(session);
    const activeClient = this._getOrCreateActiveClient(session, anchors.directory);
    if (anchors.applyAdditional) {
      activeClient.pluginController.setAdditionalDirectories(anchors.additionalDirectories);
    }
    const fromPlugins = await activeClient.pluginController.getCustomizationsSettled();
    const sessionChat = this._findSessionChat(session);
    const topLevelMcp = activeClient.pluginController.resolveTopLevelMcpCustomizations(
      sessionChat?.topLevelMcpCustomizations() ?? [],
      sessionChat?.mcpServerOwners?.()
    );
    const customizations = [...fromPlugins, ...topLevelMcp];
    return applyMcpServerEnablement(customizations, this._retainedHostCustomizations(session));
  }
  /**
   * Copilot applies hooks from the primary working directory only (see
   * `_hookWorkingDirectories` in sessionCustomizationDiscovery), so in a
   * multi-root workspace the folder carrying hooks must be the primary. Since
   * only the primary's hooks run, the picker is only needed to resolve
   * ambiguity between folders that carry hooks:
   * - several working directories have hooks under `.github/hooks/` → show the
   *   Folder picker so the user chooses which folder's hooks lead;
   * - exactly one does → pin it as the primary and hide the picker;
   * - none do → hide the picker and leave the current selection as-is (any
   *   folder is a valid primary when there are no hooks to run).
   *
   * The scan is intentionally scoped to `.github/hooks/*.json` only — it does
   * NOT cover the `settings.json`-based hook sources discovery also recognizes
   * (`.github/copilot/settings.json`, `.claude/settings.json`) — and never
   * exposes what it finds as customizations, so what a session exposes is
   * unchanged.
   */
  async computeFolderPickerDecision(workingDirectories, token = CancellationToken.None) {
    if (!this._isMultiRootEnabled()) {
      return void 0;
    }
    return computeFolderPickerDecisionForRoots(workingDirectories, (directory, t) => workspaceDirectoryHasHooks(this._fileService, directory, t), token);
  }
  async handleMcpRequest(chat, serverName, method, params) {
    const entry = this._findChatByUri(chat);
    if (!entry || !isEqual2(entry.chatChannelUri, chat)) {
      throw new Error(`Method not found: no active chat ${chat.toString()}`);
    }
    return entry.handleMcpRequest(serverName, method, params);
  }
  getMcpServerOwners(session) {
    return this._findSessionChat(session)?.mcpServerOwners();
  }
  async startMcpServer(session, id2) {
    await this._findSessionChat(session)?.startMcpServer(id2);
  }
  async stopMcpServer(session, id2) {
    await this._findSessionChat(session)?.stopMcpServer(id2);
  }
  /**
   * The gated additional (non-primary) roots for a session: the tail of the
   * ordered working-directory set when multi-root is enabled, else empty (so
   * single-root / flag-off is byte-identical). Used both to anchor
   * customization discovery and to populate the launch plan's
   * `additionalDirectories`, keeping the SDK's granted roots and discovery in
   * lockstep — so a session created while multi-root was enabled falls back to
   * a single root when resumed after the flag is turned off.
   */
  _additionalCustomizationDirectories(workingDirectories) {
    if (!this._isMultiRootEnabled() || !workingDirectories || workingDirectories.length <= 1) {
      return [];
    }
    return workingDirectories.slice(1);
  }
  /**
   * Resolves the customization anchor(s) for a session. `directory` is the
   * primary (index 0) anchor — the worktree for worktree-isolated sessions.
   * `additionalDirectories` are the non-primary roots to attach to discovery,
   * and are applied only when `applyAdditional` is true:
   * - **provisional** (pre-send) sessions carry the client-supplied set, whose
   *   non-primary folders are stable workspace folders that can be discovered
   *   immediately (the worktree, if any, only affects index 0 at send);
   * - **not-yet-live** sessions carry the persisted set from metadata;
   * - **live** (active) sessions manage their own tail via materialize/resume,
   *   so `applyAdditional` is false to avoid clobbering it.
   */
  async _getSessionCustomizationAnchors(session) {
    const sessionId = AgentSession.id(session);
    const provisional = this._provisionalSessions.get(sessionId);
    if (provisional) {
      return {
        directory: provisional.workingDirectory,
        additionalDirectories: this._additionalCustomizationDirectories(provisional.workingDirectories),
        applyAdditional: true
      };
    }
    const entry = this._findSessionChat(session);
    if (entry) {
      return { directory: entry.customizationDirectory, additionalDirectories: [], applyAdditional: false };
    }
    const metadata = await this._readSessionMetadata(session);
    return {
      directory: metadata.workingDirectory ?? metadata.customizationDirectory,
      additionalDirectories: this._additionalCustomizationDirectories(metadata.workingDirectories),
      applyAdditional: true
    };
  }
  async authenticate(resource, token) {
    if (resource === this._gitHubEndpointService.getRepoResource().resource) {
      return true;
    }
    if (resource !== this._gitHubEndpointService.getCopilotResource().resource) {
      return false;
    }
    await this._authenticationSequencer.queue(async () => {
      this._authenticationRequired.set(void 0, void 0);
      await this._applyGitHubToken(token || void 0);
    });
    return true;
  }
  async _applyGitHubToken(token) {
    if (this._githubToken === token) {
      return;
    }
    this._logService.info(`[Copilot] Auth token ${token ? "updated" : "cleared"}`);
    this._githubToken = token;
    this._updateRestrictedTelemetry(token);
    this._refreshProxy();
    if (!token) {
      await this._requestClientRestart("GitHub authentication cleared");
      void this._scheduleModelRefresh();
      return;
    }
    const host = this._gitHubEndpointService.getEnterpriseUri() ?? "https://github.com";
    let restartRequired = false;
    this._updatingGitHubCredentials = true;
    try {
      for (const session of this._allLiveSessions()) {
        try {
          const result = await session.updateGitHubCredentials(host, token);
          if (!result.success) {
            restartRequired = true;
            this._logService.warn(`[Copilot:${session.sessionId}] GitHub credential update was rejected; scheduling a safe CopilotClient restart`);
          } else if (result.copilotUserResolved === false) {
            this._logService.warn(`[Copilot:${session.sessionId}] GitHub credentials were updated, but Copilot user metadata could not be resolved; plan, quota, and billing metadata may be degraded. Reauthenticate to restore it.`);
          }
        } catch (error) {
          restartRequired = true;
          this._logService.warn(`[Copilot:${session.sessionId}] Failed to update GitHub credentials; scheduling a safe CopilotClient restart: ${getErrorMessage(error)}`);
        }
      }
    } finally {
      this._updatingGitHubCredentials = false;
      await this._applyPendingClientRestart();
    }
    if (restartRequired) {
      await this._requestClientRestart("GitHub credential update failed");
    }
    await this._resolveCopilotSku(token);
    void this._scheduleModelRefresh();
  }
  _handleCopilotSessionAuthRequired() {
    this._authenticationRequired.set({
      resource: this._gitHubEndpointService.getCopilotResource(),
      reason: "expired" /* Expired */
    }, void 0);
  }
  async _resolveCopilotSku(githubToken) {
    try {
      const copilotSku = await this._copilotApiService.resolveCopilotSku?.(githubToken);
      if (copilotSku && this._githubToken === githubToken) {
        this._telemetryService.setCommonProperty("copilotSku", copilotSku);
      }
    } catch (err) {
      this._logService.debug(`[Copilot] SKU resolution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async handleAuthenticationToken(params) {
    let handled = false;
    for (const session of this._allLiveSessions()) {
      const didHandle = await session.resolveMcpAuthentication(params);
      handled ||= didHandle;
    }
    return handled;
  }
  _updateRestrictedTelemetry(githubToken) {
    this._applyRestrictedTelemetry(void 0);
    if (githubToken) {
      void this._resolveRestrictedTelemetry(githubToken);
    }
  }
  async _resolveRestrictedTelemetry(githubToken) {
    try {
      const ctx = await this._copilotApiService.resolveRestrictedTelemetryContext(githubToken);
      if (this._githubToken !== githubToken) {
        return;
      }
      this._applyRestrictedTelemetry({
        ...ctx,
        telemetryEndpoint: toRestrictedTelemetryEndpoint(ctx.telemetryEndpoint)
      });
    } catch (err) {
      this._logService.debug(`[Copilot] Restricted telemetry resolution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  _applyRestrictedTelemetry(context) {
    const rtEnabled = context?.restrictedTelemetryEnabled === true;
    if (rtEnabled !== this._restrictedTelemetryEnabled) {
      this._restrictedTelemetryEnabled = rtEnabled;
      this._logService.info(`[Copilot] Enhanced (restricted) telemetry ${rtEnabled ? "enabled for this account" : "disabled"}`);
      this._onDidChangeRestrictedTelemetry.fire();
    }
    if (isAgentHostTelemetryService(this._telemetryService)) {
      this._telemetryService.setRestrictedTelemetryEnabled(rtEnabled);
      this._telemetryService.setCopilotTrackingId(context?.trackingId);
      this._telemetryService.setRestrictedTelemetryEndpoint(context?.telemetryEndpoint);
      this._telemetryService.setInternalTelemetryContext(context && {
        isInternal: context.isInternal === true,
        trackingId: context.trackingId,
        userName: context.userName,
        isVscodeTeamMember: context.isVscodeTeamMember === true
      });
    }
  }
  async _routeGitHubTelemetry(notification) {
    this._secondaryAssignmentContext.update(notification);
    const additionalProperties = { initiatorClientType: this._clientTypeForTelemetry(notification.sessionId) };
    const router = this._githubTelemetryRouter;
    if (!router?.isTarget(notification)) {
      this._gitHubTelemetryForwarder.forward(notification, this._turnIdForTelemetry(notification.sessionId));
      return;
    }
    if (!notification.restricted) {
      await router.route(notification, void 0, additionalProperties);
      return;
    }
    const sessionId = notification.sessionId;
    const githubToken = this._githubToken;
    if (!githubToken) {
      await router.route(notification, void 0, additionalProperties);
      return;
    }
    try {
      const context = await this._copilotApiService.resolveRestrictedTelemetryContext(githubToken);
      if (this._githubToken !== githubToken) {
        return;
      }
      await router.route(notification, {
        restrictedTelemetryEnabled: context.restrictedTelemetryEnabled,
        trackingId: context.trackingId,
        telemetryEndpoint: toRestrictedTelemetryEndpoint(context.telemetryEndpoint),
        isInternal: context.isInternal === true,
        userName: context.userName,
        isVscodeTeamMember: context.isVscodeTeamMember === true
      }, additionalProperties);
    } catch (error) {
      this._logService.debug(`[Copilot:${sessionId}] Restricted telemetry context resolution failed; dropping ${notification.event.kind}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  _clientTypeForTelemetry(sdkSessionId) {
    return sdkSessionId ? this._findSessionBySdkId(sdkSessionId)?.currentTurnClientType ?? "unknown" /* Unknown */ : "unknown" /* Unknown */;
  }
  _turnIdForTelemetry(sdkSessionId) {
    return sdkSessionId ? this._findSessionBySdkId(sdkSessionId)?.currentTurnId : void 0;
  }
  /**
   * {@link IAgent.refreshModels}. Coalesces onto an in-flight refresh and
   * never rejects — {@link _refreshModels} already logs and retains the last
   * known-good list on failure.
   *
   * Only safe for callers with no new input to apply (the host's periodic
   * scheduler). Triggers that invalidate the in-flight request — a rotated
   * token, a restarted client — must call {@link _scheduleModelRefresh} so they
   * are not answered by a refresh bound to the superseded input.
   */
  refreshModels() {
    return this._scheduledModelRefresh?.deferred.p ?? this._modelRefreshInFlight ?? this._startModelRefresh(++this._modelCatalogGeneration);
  }
  /**
   * Invalidates an in-flight refresh immediately, then starts one refresh on
   * the next task. Repeated lifecycle triggers before that task
   * share the same deferred and enumerate only the final token/client source.
   */
  _scheduleModelRefresh() {
    const generation = ++this._modelCatalogGeneration;
    if (this._scheduledModelRefresh) {
      this._scheduledModelRefresh.generation = generation;
      return this._scheduledModelRefresh.deferred.p;
    }
    const scheduled = { deferred: new DeferredPromise(), generation };
    this._scheduledModelRefresh = scheduled;
    this._modelRefreshSchedule.value = disposableTimeout(() => {
      void (async () => {
        try {
          await this._clientStopping;
          if (this._scheduledModelRefresh !== scheduled) {
            return;
          }
          this._scheduledModelRefresh = void 0;
          this._modelRefreshSchedule.clear();
          await this._startModelRefresh(scheduled.generation);
        } catch (err) {
          this._logService.error(err, "[Copilot] Failed to schedule model refresh");
        } finally {
          if (this._scheduledModelRefresh === scheduled) {
            this._scheduledModelRefresh = void 0;
            this._modelRefreshSchedule.clear();
          }
          scheduled.deferred.complete();
        }
      })();
    }, 0);
    return scheduled.deferred.p;
  }
  _startModelRefresh(generation) {
    const refresh = this._refreshModels(0, generation).finally(() => {
      if (this._modelRefreshInFlight === refresh) {
        this._modelRefreshInFlight = void 0;
      }
    });
    this._modelRefreshInFlight = refresh;
    return refresh;
  }
  async _refreshModels(attempt = 0, generation = this._modelCatalogGeneration) {
    this._modelRefreshRetry.clear();
    if (this._shutdownPromise) {
      return;
    }
    const tokenAtRefreshStart = this._githubToken;
    if (!tokenAtRefreshStart) {
      this._capiModels = [];
      this._publishModels();
      return;
    }
    try {
      const models = await this._listModels(tokenAtRefreshStart);
      if (this._githubToken === tokenAtRefreshStart && this._modelCatalogGeneration === generation) {
        this._capiModels = models;
        this._publishModels();
      }
    } catch (err) {
      if (this._githubToken !== tokenAtRefreshStart || this._modelCatalogGeneration !== generation || this._shutdownPromise) {
        return;
      }
      if (/\b401\b/.test(getErrorMessage(err))) {
        this._handleCopilotSessionAuthRequired();
      }
      await this._handleClientOperationFailure(err, "modelRefresh");
      if (attempt + 1 < this._modelRefreshMaxAttempts) {
        const delay = this._modelRefreshBackoff(attempt);
        this._logService.warn(`[Copilot] Failed to refresh models (attempt ${attempt + 1}), retrying in ${delay}ms`, err);
        this._modelRefreshRetry.value = disposableTimeout(() => {
          void this._refreshModels(attempt + 1, generation);
        }, delay);
        return;
      }
      this._logService.error(err, "[Copilot] Failed to refresh models");
      this._publishModels();
    }
  }
  /**
   * Re-emit the merged CAPI + BYOK model list to the picker. A fresh array is
   * allocated each call so the observable always notifies its consumers.
   */
  _publishModels() {
    this._models.set([...this._capiModels, ...this._byokModels], void 0);
  }
  /**
   * (Re)publish the renderer BYOK models from the bridge registry's serving
   * window. Triggered when any renderer bridge connects, disconnects, or
   * reports a model change — the registry owns enumeration (with its own
   * connect-time retry) and caches the serving window's models, so this is a
   * cheap synchronous read of that cache.
   *
   * Each model is surfaced under the provider-qualified id `vendor/[group/]id` so a
   * selection round-trips to the per-session provider config synthesized by
   * `resolveByokSessionConfig`.
   */
  _refreshByokModels() {
    if (this._shutdownPromise) {
      return;
    }
    const rootConfigValue = this._configurationService.getRootValue(platformRootSchema, AgentHostByokModelsEnabledConfigKey);
    const { enabled, trace } = resolveByokLmEnablement(rootConfigValue);
    this._logService.trace(`[Copilot] BYOK model publication ${trace}`);
    if (!enabled) {
      this._byokModels = [];
      this._publishModels();
      return;
    }
    this._byokModels = this._byokBridgeRegistry.getModels().map((m) => {
      const byokMeta = createAgentModelByokMeta(m.modelIdentifier);
      const thinkingLevel = this._createThinkingLevelConfigSchemaProperty(m.supportedReasoningEfforts, m.defaultReasoningEffort, m.id);
      return {
        provider: this.id,
        id: getByokLmAgentModelId(m),
        name: m.name ?? m.id,
        maxContextWindow: m.maxContextWindowTokens,
        supportsVision: m.supportsVision ?? false,
        ...thinkingLevel ? { configSchema: { type: "object", properties: { [ThinkingLevelConfigKey]: thinkingLevel } } } : {},
        ...byokMeta && { _meta: byokMeta }
      };
    });
    this._logService.trace(`[Copilot] Found ${this._byokModels.length} BYOK models${this._byokModels.length ? ": " + this._byokModels.map((m) => m.name).join(", ") : ""}`);
    this._publishModels();
  }
  /**
   * Equal-jitter exponential backoff for model-refresh retries. Doubles the
   * base delay per attempt (capped at {@link _modelRefreshMaxDelayMs}) and
   * picks a random point in the upper half of that window, so the returned
   * delay lands in `[exp/2, exp]`. The jitter avoids synchronized retries
   * across windows/agents hitting a shared rate limit, while the `exp/2`
   * floor keeps a minimum spacing between attempts.
   */
  _modelRefreshBackoff(attempt) {
    return modelRefreshBackoff(attempt, this._modelRefreshBaseDelayMs, this._modelRefreshMaxDelayMs);
  }
  _stopClient() {
    this._pendingClientRestartReasons.clear();
    if (this._clientStopping) {
      return this._clientStopping;
    }
    const stopping = (async () => {
      const clientStarting = this._clientStarting;
      if (clientStarting) {
        try {
          await clientStarting;
        } catch {
        }
      }
      const client = this._client;
      this._client = void 0;
      this._clientStarting = void 0;
      await client?.stop();
      await this._sessionLauncher.disposeByokProxyHandle();
    })().finally(() => {
      if (this._clientStopping === stopping) {
        this._clientStopping = void 0;
      }
    });
    this._clientStopping = stopping;
    return stopping;
  }
  // ---- client lifecycle ---------------------------------------------------
  async _stopClientAfterStartupTermination(client, terminalError) {
    try {
      await client.stop();
    } catch (error) {
      this._logService.error(error, "[Copilot] Failed to stop client after startup termination");
    }
    throw terminalError;
  }
  /**
   * Acquires the SDK client, transparently self-healing a single cold-start
   * abort caused by a startup-config change (`CopilotClientStartupConfigChangedError`).
   * That abort is transient: the superseded client was built with now-stale
   * config and the next start uses the current config, so re-acquiring once
   * returns a healthy client and no caller ever sees the abort.
   *
   * The re-acquire is bounded by {@link MAX_STARTUP_CONFIG_RETRIES}. All
   * concurrent callers share one acquire-and-retry sequence via
   * `_ensureClientHealing`, so the retry budget is global rather than per
   * caller (a late caller cannot reset the budget and drive unbounded starts).
   * The per-attempt coalescing in `_ensureClientOnce` (via `_clientStarting`) is
   * unchanged.
   */
  _ensureClient() {
    if (this._ensureClientHealing) {
      return this._ensureClientHealing;
    }
    const healing = (async () => {
      try {
        for (let retries = 0; ; retries++) {
          try {
            return await this._ensureClientOnce();
          } catch (error) {
            if (retries < MAX_STARTUP_CONFIG_RETRIES && !this._shutdownPromise && error instanceof CopilotClientStartupConfigChangedError) {
              this._logService.info("[Copilot] Startup config changed while the client was starting; re-acquiring the client with the current config");
              continue;
            }
            throw error;
          }
        }
      } finally {
        this._ensureClientHealing = void 0;
      }
    })();
    this._ensureClientHealing = healing;
    return healing;
  }
  async _ensureClientOnce() {
    if (this._shutdownPromise) {
      throw new CancellationError();
    }
    while (this._clientStopping) {
      await this._clientStopping;
      if (this._shutdownPromise) {
        throw new CancellationError();
      }
    }
    if (this._client) {
      return this._client;
    }
    if (this._clientStarting) {
      return this._clientStarting;
    }
    if (!this._proxyRefresh) {
      this._refreshProxy();
    }
    const startupConfig = this._readClientStartupConfig();
    const attemptNumber = ++this._clientStartupAttemptCount;
    const startupStopWatch = StopWatch.create();
    const startClient = async () => {
      this._logService.info("[Copilot] Starting CopilotClient...");
      const copilotSdk = await import("@github/copilot-sdk");
      this._copilotSdk = copilotSdk;
      if (this._shutdownPromise) {
        throw new CancellationError();
      }
      const env2 = createCopilotCliEnvironment();
      delete env2["COPILOT_MODEL_FAMILY"];
      this._applyProxyEnv(env2);
      setCopilotBuiltinGitHubMcpEnvironment(env2, startupConfig.githubMcpServer);
      if (process.platform === "linux") {
        const enabledFlags = env2["COPILOT_CLI_ENABLED_FEATURE_FLAGS"];
        const flags = new Set((enabledFlags ?? "").split(",").map((f) => f.trim()).filter(Boolean));
        flags.add("SHELL_SPAWN_BACKEND");
        env2["COPILOT_CLI_ENABLED_FEATURE_FLAGS"] = [...flags].join(",");
      }
      env2["GITHUB_COPILOT_INTEGRATION_ID"] = COPILOT_INTEGRATION_ID;
      this._logService.info(`[Copilot] Set CLI env: GITHUB_COPILOT_INTEGRATION_ID=${COPILOT_INTEGRATION_ID}`);
      const enterpriseHost = startupConfig.enterpriseHost;
      if (enterpriseHost) {
        env2["COPILOT_GH_HOST"] = enterpriseHost;
        this._logService.info(`[Copilot] Set CLI env: COPILOT_GH_HOST=${enterpriseHost}`);
      }
      if (startupConfig.rubberDuck) {
        env2["RUBBER_DUCK_AGENT"] = "true";
      } else {
        delete env2["RUBBER_DUCK_AGENT"];
      }
      if (startupConfig.multiTurnContextRouting) {
        env2["MULTI_TURN_CONTEXT_ROUTING"] = "true";
      } else {
        delete env2["MULTI_TURN_CONTEXT_ROUTING"];
      }
      const nodeModulesUri = FileAccess.asFileUri(getAppNodeModulesPath());
      const cliPath = await resolveCopilotCliPath(nodeModulesUri);
      env2["MXC_BIN_DIR"] = URI.joinPath(nodeModulesUri, "@microsoft", "mxc-sdk", "bin").fsPath;
      const resolvedRgDiskPath = await rgDiskPath();
      const rgDir = dirname(resolvedRgDiskPath);
      const pathKey = Object.keys(env2).find((k) => k.toUpperCase() === "PATH") ?? "PATH";
      const currentPath = env2[pathKey];
      env2[pathKey] = currentPath ? `${currentPath}${delimiter}${rgDir}` : rgDir;
      this._logService.info(`[Copilot] Resolved CLI path: ${cliPath}`);
      const telemetry = await this._otelService.getSdkTelemetryConfig();
      const nativeTelemetry = await this._otelService.getNativeSdkTelemetryConfig();
      if (nativeTelemetry) {
        env2["OTEL_SERVICE_NAME"] = "github-copilot";
        env2["OTEL_RESOURCE_ATTRIBUTES"] = Object.entries(nativeTelemetry.resourceAttributes).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join(",");
      }
      if (nativeTelemetry?.traces) {
        env2["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"] = nativeTelemetry.traces.endpoint;
        env2["OTEL_EXPORTER_OTLP_TRACES_PROTOCOL"] = nativeTelemetry.traces.protocol;
      }
      if (nativeTelemetry?.external) {
        env2["OTEL_EXPORTER_OTLP_METRICS_ENDPOINT"] = resolveCopilotOtlpMetricsEndpoint(nativeTelemetry.external.endpoint, nativeTelemetry.external.protocol);
        env2["OTEL_EXPORTER_OTLP_METRICS_PROTOCOL"] = nativeTelemetry.external.protocol;
      } else if (nativeTelemetry) {
        env2["OTEL_METRICS_EXPORTER"] = "none";
      }
      const copilotSdkLogLevelAtStartup = this._resolveCopilotSdkLogLevel(startupConfig.copilotSdkLogLevel);
      const clientOptions = {
        useLoggedInUser: false,
        connection: copilotSdk.RuntimeConnection.forStdio({ path: cliPath }),
        env: env2,
        telemetry,
        logLevel: copilotSdkLogLevelAtStartup,
        enableRemoteSessions: startupConfig.sessionSync,
        onGetTraceContext: () => this._otelService.getCurrentTraceContext() ?? {},
        onGitHubTelemetry: (notification) => {
          void this._routeGitHubTelemetry(notification).catch((err) => this._logService.trace(`[Copilot] GitHub telemetry routing failed: ${err instanceof Error ? err.message : String(err)}`));
        }
      };
      const client = this._createCopilotClient(clientOptions);
      await client.start();
      if (this._shutdownPromise) {
        return this._stopClientAfterStartupTermination(client, new CancellationError());
      }
      if (!this._readClientStartupConfig().equals(startupConfig)) {
        return this._stopClientAfterStartupTermination(client, new CopilotClientStartupConfigChangedError());
      }
      this._logService.info("[Copilot] CopilotClient started successfully");
      this._client = client;
      this._clientStarting = void 0;
      return client;
    };
    const clientStarting = (async () => {
      let outcome = "failure";
      let startupError;
      try {
        const client = await startClient();
        outcome = "success";
        return client;
      } catch (error) {
        startupError = error;
        outcome = error instanceof CancellationError ? "cancelled" : "failure";
        throw error;
      } finally {
        reportCopilotClientStartup(this._telemetryService, {
          outcome,
          durationMs: startupStopWatch.elapsed(),
          attemptNumber
        }, startupError);
      }
    })();
    this._clientStarting = clientStarting;
    void clientStarting.catch(() => {
      this._clientStarting = void 0;
    });
    return clientStarting;
  }
  // ---- session management -------------------------------------------------
  _createThinkingLevelConfigSchemaProperty(reasoningEfforts, defaultReasoningEffort, modelId) {
    const supportedReasoningEfforts = reasoningEfforts?.filter(isCopilotReasoningEffort);
    if (!supportedReasoningEfforts?.length) {
      return void 0;
    }
    return {
      type: "string",
      title: localize(2481, null),
      description: localize(2480, null),
      default: resolveDefaultReasoningEffort(supportedReasoningEfforts, defaultReasoningEffort, modelId),
      enum: [...supportedReasoningEfforts],
      enumLabels: supportedReasoningEfforts.map(getReasoningEffortLabel),
      enumDescriptions: supportedReasoningEfforts.map((value) => getReasoningEffortDescription(value) ?? "")
    };
  }
  /**
   * Synthesize a `contextSize` config property when the model exposes a `long_context` pricing tier with a distinct
   * context-max. Picker surfaces this as the "Context Size" button. Mirrors `getContextSizeOptions` in
   * `extensions/copilot/src/extension/chat/vscode-node/languageModelAccess.ts`.
   *
   * The `enum` values are the two context-window sizes (in tokens), smallest first, so the numeric token counts
   * flow to the client. The chosen value comes back in the model's `config` bag and is mapped to the SDK's
   * two-valued `contextTier` at the SDK boundary by {@link getCopilotContextTier}, using the model's long-context
   * window from {@link _longContextWindowFor}.
   */
  _createContextSizeConfigSchemaProperty(billing) {
    const tokenPrices = billing?.tokenPrices;
    const defaultMax = tokenPrices?.contextMax;
    const longContextMax = tokenPrices?.longContext?.contextMax;
    if (!defaultMax || !longContextMax || defaultMax >= longContextMax) {
      return void 0;
    }
    return {
      type: "number",
      title: localize(2479, null),
      description: localize(2477, null),
      default: hasLongContextSurcharge(billing) ? defaultMax : longContextMax,
      enum: [defaultMax, longContextMax],
      enumLabels: [formatTokenCount(defaultMax), formatTokenCount(longContextMax)],
      enumDescriptions: [
        localize(2476, null),
        localize(2478, null)
      ]
    };
  }
  /**
   * The model's long-context window (in tokens): the largest size offered by its "Context Size" picker
   * (the max numeric value in the synthesized `contextSize` {@link ConfigPropertySchema.enum}). Used by
   * {@link getCopilotContextTier} to decide whether a numeric selection opts into `long_context`.
   * Returns `undefined` when the model exposes no such picker (or the model list isn't loaded yet),
   * leaving the SDK on its default tier.
   */
  _longContextWindowFor(modelId) {
    if (!modelId) {
      return void 0;
    }
    const windows = this._models.get().find((m) => m.id === modelId)?.configSchema?.properties?.[ContextSizeConfigKey]?.enum;
    const numericWindows = windows?.filter((w) => typeof w === "number");
    return numericWindows && numericWindows.length > 0 ? Math.max(...numericWindows) : void 0;
  }
  /**
   * Whether the model has a larger long-context window at no additional cost. When true, a session
   * with no explicit selection defaults to `long_context` while the picker still offers both sizes.
   */
  _isFreeLongContext(modelId) {
    return !!modelId && this._freeLongContextModels.has(modelId);
  }
  /**
   * Builds the open `_meta` model picker bag from the SDK's billing and picker metadata.
   */
  _createModelPickerMeta(modelInfo, billing) {
    return createPricingMetaFromBilling(billing, modelInfo.modelPickerPriceCategory, modelInfo.modelPickerCategory);
  }
  _createModelConfigSchema(m, billing) {
    const properties = {};
    const thinkingLevel = this._createThinkingLevelConfigSchemaProperty(m.supportedReasoningEfforts, void 0, m.id);
    if (thinkingLevel) {
      properties[ThinkingLevelConfigKey] = thinkingLevel;
    }
    const contextSize = this._createContextSizeConfigSchemaProperty(billing);
    if (contextSize) {
      properties[ContextSizeConfigKey] = contextSize;
    }
    if (Object.keys(properties).length === 0) {
      return void 0;
    }
    return { type: "object", properties };
  }
  _serializeModelSelection(model) {
    return JSON.stringify(model);
  }
  _parseModelSelection(raw) {
    if (!raw) {
      return void 0;
    }
    try {
      const value = JSON.parse(raw);
      if (value && typeof value === "object" && typeof value.id === "string") {
        const modelSelection = { id: value.id };
        if (value.config && typeof value.config === "object") {
          const config = {};
          for (const [key, configValue] of Object.entries(value.config)) {
            if (typeof configValue === "string") {
              config[key] = configValue;
            }
          }
          if (Object.keys(config).length > 0) {
            modelSelection.config = config;
          }
        }
        return modelSelection;
      }
    } catch {
    }
    return { id: raw };
  }
  _serializeAgentSelection(agent) {
    return JSON.stringify({ uri: agent.uri });
  }
  _parseAgentSelection(raw) {
    if (!raw) {
      return void 0;
    }
    try {
      const value = JSON.parse(raw);
      if (value && typeof value === "object" && typeof value.uri === "string") {
        return { uri: value.uri };
      }
    } catch {
    }
    return void 0;
  }
  /**
   * Resolves an {@link AgentSelection}'s SDK-facing name from the plugin
   * snapshot that is, or will be, applied to the SDK session.
   */
  _resolveAgentName(snapshot, agent) {
    for (const plugin of snapshot.plugins) {
      const found = plugin.agents.find((a) => a.uri.toString() === agent.uri);
      if (found) {
        return found.name;
      }
    }
    return void 0;
  }
  async listChatsToMigrate() {
    const sessions = await this._listSdkSessions("chats to migrate", (client) => client.listSessions());
    if (!sessions) {
      return void 0;
    }
    const projectLimiter = new Limiter(4);
    const metadataLimiter = new Limiter(4);
    const projectByContext = /* @__PURE__ */ new Map();
    const mapped = await Promise.all(sessions.map((s) => metadataLimiter.queue(async () => {
      const session = AgentSession.uri(this.id, s.sessionId);
      const chat = URI.parse(buildDefaultChatUri(session));
      const metadata = await this._readStoredSessionMetadata(session);
      if (!metadata || !(metadata.model !== void 0 || metadata.agent !== void 0 || metadata.workingDirectory !== void 0 || metadata.workingDirectories !== void 0 || metadata.customizationDirectory !== void 0 || metadata.project !== void 0 || metadata.resolved || metadata.workspaceless !== void 0)) {
        return void 0;
      }
      let { project, resolved } = metadata;
      if (!resolved) {
        project = await this._resolveSessionProject(s.context, projectLimiter, projectByContext);
        void this._storeSessionProjectResolution(session, project);
      }
      const workingDirectories = metadata.workingDirectories ?? (typeof s.context?.workingDirectory === "string" ? [URI.file(s.context.workingDirectory)] : void 0);
      const result2 = {
        chat,
        startTime: s.startTime.getTime(),
        modifiedTime: s.modifiedTime.getTime(),
        project,
        summary: s.summary,
        workingDirectories
      };
      return result2;
    })));
    const result = mapped.filter((s) => s !== void 0);
    this._logService.info(`[Copilot] Found ${result.length} legacy sessions`);
    return result;
  }
  async collectDebugLogs(session, outputDirectory, chat) {
    const sessionTarget = chat ? this._findChatByUri(chat) : session ? this._findSessionChat(session) : void 0;
    if (sessionTarget) {
      return sessionTarget.collectDebugLogs(outputDirectory, true);
    }
    const processLogsTarget = this._allLiveSessions()[0];
    if (!processLogsTarget) {
      return false;
    }
    return processLogsTarget.collectDebugLogs(outputDirectory, false);
  }
  async getSessionStateFile(session, chat) {
    const sdkConversationId = chat && !isDefaultChatUri(chat) ? this._findChatByUri(chat)?.sessionId ?? this._chatBackings.get(chat.toString())?.sdkSessionId : this._sdkConversationId(session);
    if (!sdkConversationId) {
      return void 0;
    }
    const resource = URI.file(join(getCopilotHomePath(this._environmentService.userHome.fsPath, process.env), "session-state", sdkConversationId, "events.jsonl"));
    return await this._fileService.exists(resource) ? resource : void 0;
  }
  setKnownSessionsFilter(filter) {
    this._knownSessionsFilter = filter;
  }
  startChatDiscovery() {
    return this._startCopilotChatDiscovery();
  }
  /**
   * One memoized initial discovery attempt, mirroring Claude and Codex. The
   * CLI client may still be starting when the first discovery listener
   * attaches, and {@link _listSdkSessions} reports that as "cannot enumerate
   * yet" rather than an authoritative empty catalog, so the attempt is
   * retried before giving up until the next explicit trigger.
   */
  _startCopilotChatDiscovery() {
    if (!this._copilotChatDiscovery) {
      this._copilotChatDiscovery = this._runCopilotChatDiscovery();
    }
    return this._copilotChatDiscovery;
  }
  _runCopilotChatDiscovery() {
    return this._copilotChatDiscoverySequencer.queue(async () => {
      for (let attempt = 0; ; attempt++) {
        if (this._shutdownPromise || this._store.isDisposed) {
          return;
        }
        if (await this._emitCopilotChats()) {
          return;
        }
        if (attempt >= CHAT_DISCOVERY_RETRY_DELAYS_MS.length) {
          this._logService.warn("[Copilot] Chat discovery failed: catalog never became available");
          return;
        }
        await timeout(CHAT_DISCOVERY_RETRY_DELAYS_MS[attempt]);
      }
    });
  }
  /**
   * Emits the chats found by one discovery pass. External chats are emitted
   * unconditionally; adoptable legacy extension-host chats are emitted only
   * while in-place migration is enabled, because they are surfaced so the
   * user can adopt them rather than as someone else's session.
   *
   * Returns whether the provider catalog could be enumerated at all, which is
   * what {@link _startCopilotChatDiscovery} retries on.
   */
  async _emitCopilotChats() {
    const migrateLegacyAtStart = this._isMigrateLegacyCopilotCliEnabled();
    try {
      const enumerated = await this._discoverCopilotChats((chats) => this._publishDiscoveredChats(chats, migrateLegacyAtStart));
      return enumerated;
    } catch (err) {
      this._logService.warn("[Copilot] Failed to emit discovered chats", err);
      return false;
    }
  }
  /**
   * Publishes one classified batch, filtering out chats that must not surface
   * and ones whose signature is unchanged since the last pass. Batches are
   * additive, so a large catalogue converges progressively instead of
   * withholding every row until the whole scan completes.
   */
  _publishDiscoveredChats(chats, migrateLegacyAtStart) {
    if (this._shutdownPromise || this._store.isDisposed) {
      return;
    }
    const migrateLegacy = migrateLegacyAtStart && this._isMigrateLegacyCopilotCliEnabled();
    const emitted = chats.filter((chat) => {
      if (!chat.external && !migrateLegacy) {
        return false;
      }
      const key = chat.chat.toString();
      const signature = JSON.stringify(chat);
      if (this._discoveredChats.get(key)?.signature === signature) {
        return false;
      }
      this._discoveredChats.set(key, { signature, external: chat.external });
      return true;
    });
    this._logService.info(`[Copilot] Chat discovery: emitting ${emitted.length} of ${chats.length} discovered chat(s) (adopt legacy extension-host chats: ${migrateLegacy})`);
    if (emitted.length > 0) {
      this._onDidDiscoverChats.fire(emitted);
    }
  }
  /**
   * Enumerates the SDK catalog under `~/.copilot` and classifies every chat
   * Agent Host does not already know about:
   *
   * - a legacy extension-host Copilot CLI chat is *internal* and adoptable in
   *   place (see {@link ensureChatAdopted}), so it keeps `external: false`;
   * - a non-adoptable chat is external only when its persisted `clientName`
   *   identifies the standalone CLI or GitHub Copilot app. This value records
   *   the runtime client that created or last resumed the chat, not immutable
   *   creator provenance. External chats must also have repository metadata
   *   and have been modified within the last seven days.
   *
   * Registered chats are filtered by the host, with stored metadata as a
   * fallback when no host filter is installed. A chat the SDK reports
   * without a working directory is skipped: {@link _doResumeSession} requires
   * one and a discovered chat has no other source for it (Agent Host writes
   * no metadata for it beyond the read marker), so it would surface as a row
   * that throws on open.
   *
   * Classification is per-chat fallible — an unreadable session database
   * would otherwise withhold the whole catalog and fail every retry — so a
   * failing chat is logged and skipped while its siblings still surface.
   *
   * `undefined` means the catalog could not be enumerated yet — not an
   * authoritative empty result.
   */
  async _discoverCopilotChats(publish) {
    const sessions = await this._listSdkSessions("discoverable chats", async (client) => (await client.rpc.sessions.list({})).sessions);
    if (!sessions) {
      return false;
    }
    const knownSessions = this._knownSessionsFilter ? await this._knownSessionsFilter(sessions.map((s) => AgentSession.uri(this.id, s.sessionId))) : void 0;
    const emitAdoptable = this._isMigrateLegacyCopilotCliEnabled();
    const projectLimiter = new Limiter(4);
    const metadataLimiter = new Limiter(4);
    const projectByContext = /* @__PURE__ */ new Map();
    const earliestExternalModifiedTime = this._now() - COPILOT_EXTERNAL_SESSION_MAX_AGE_MS;
    let known = 0;
    let withoutWorkingDirectory = 0;
    let unsupportedClientName = 0;
    let outsideImportWindow = 0;
    let withoutRepository = 0;
    let suppressedAdoptable = 0;
    let suppressedArchived = 0;
    let failed = 0;
    let discovered = 0;
    let external = 0;
    const classify = (s) => metadataLimiter.queue(async () => {
      const session = AgentSession.uri(this.id, s.sessionId);
      try {
        if (knownSessions ? knownSessions.has(session.toString()) : !!await this._readStoredSessionMetadata(session)) {
          known++;
          return void 0;
        }
        const adoptable = await this._isExtensionHostCliSession(s.sessionId);
        if (adoptable && !emitAdoptable) {
          suppressedAdoptable++;
          return void 0;
        }
        if (adoptable && await this._isExtensionHostCliSessionArchived(s.sessionId)) {
          suppressedArchived++;
          return void 0;
        }
        const workingDirectory = typeof s.context?.cwd === "string" ? URI.file(s.context.cwd) : adoptable ? await this._extensionHostCliWorkingDirectory(s.sessionId) : void 0;
        if (!workingDirectory) {
          withoutWorkingDirectory++;
          return void 0;
        }
        const modifiedTime = new Date(s.modifiedTime).getTime();
        if (!adoptable) {
          const clientName = s.isRemote ? void 0 : s.clientName;
          if (clientName === void 0 || !COPILOT_EXTERNAL_SESSION_CLIENT_NAMES.has(clientName)) {
            unsupportedClientName++;
            return void 0;
          }
          if (!Number.isFinite(modifiedTime) || modifiedTime < earliestExternalModifiedTime) {
            outsideImportWindow++;
            return void 0;
          }
          if (typeof s.context?.repository !== "string" || s.context.repository.trim().length === 0) {
            withoutRepository++;
            return void 0;
          }
        }
        return {
          chat: URI.parse(buildDefaultChatUri(session)),
          startTime: new Date(s.startTime).getTime(),
          modifiedTime,
          // Always key the project off the resolved working directory: a worktree
          // session's context repository/gitRoot would resolve to the repo root.
          project: await this._localProject(
            await this._resolveSessionProject({ ...s.context, cwd: workingDirectory.fsPath }, projectLimiter, projectByContext),
            adoptable ? s.sessionId : void 0
          ),
          summary: s.summary,
          workingDirectories: [workingDirectory],
          _meta: adoptable ? withSessionEhcliAdoptable(void 0) : void 0,
          external: !adoptable
        };
      } catch (err) {
        failed++;
        this._logService.warn(`[Copilot] Failed to classify discovered chat ${session.toString()}; skipping it`, err);
        return void 0;
      }
    });
    for (let i = 0; i < sessions.length; i += COPILOT_DISCOVERY_BATCH_SIZE) {
      if (this._shutdownPromise || this._store.isDisposed) {
        return true;
      }
      const mapped = await Promise.all(sessions.slice(i, i + COPILOT_DISCOVERY_BATCH_SIZE).map(classify));
      const chats = mapped.filter((chat) => chat !== void 0);
      if (chats.length > 0) {
        discovered += chats.length;
        external += chats.filter((chat) => chat.external).length;
        publish(chats);
      }
    }
    this._logService.info(`[Copilot] Chat discovery: ${sessions.length} SDK session(s) -> ${external} external, ${discovered - external} adoptable legacy extension-host, ${suppressedAdoptable} suppressed adoptable legacy extension-host, ${suppressedArchived} suppressed archived legacy extension-host, ${known} already known to Agent Host, ${withoutWorkingDirectory} without a working directory, ${unsupportedClientName} with unsupported or missing client name, ${outsideImportWindow} outside the import window, ${withoutRepository} without repository metadata, ${failed} failed to classify (adopt legacy extension-host chats: ${emitAdoptable})`);
    return true;
  }
  async _listSdkSessions(reason, listSessions) {
    this._logService.info(`[Copilot] Listing ${reason}...`);
    try {
      const sessions = await this._retryAfterClosedConnection("listSessions", listSessions);
      this._logService.info(`[Copilot] Listed ${sessions.length} SDK session(s) for ${reason}`);
      return sessions;
    } catch (err) {
      if (err instanceof CancellationError || isRecognizedCopilotClientStartupFailure(err) || classifyCopilotClientOperationFailure(err) !== void 0) {
        this._logService.info(`[Copilot] Client unavailable while listing ${reason}: ${err instanceof Error ? err.message : String(err)}`);
        return void 0;
      }
      throw err;
    }
  }
  async getChatMetadata(chat, context, providerData) {
    const session = resolveAgentChatContext(context, chat).configurationResource;
    const sessionId = providerData ? decodeProviderData(providerData)?.sdkSessionId : AgentSession.id(session);
    if (!sessionId) {
      return void 0;
    }
    const storedMetadata = await this._readStoredSessionMetadata(session);
    const sessionMetadata = await this._retryAfterClosedConnection("getSessionMetadata", (client) => client.getSessionMetadata(sessionId), createCopilotFailureCorrelation(session, chat, void 0, sessionId));
    if (!sessionMetadata) {
      return void 0;
    }
    let project = storedMetadata?.project;
    if (!storedMetadata?.resolved) {
      const projectLimiter = new Limiter(1);
      project = await this._resolveSessionProject(sessionMetadata?.context, projectLimiter, /* @__PURE__ */ new Map());
      if (storedMetadata) {
        void this._storeSessionProjectResolution(session, project);
      }
    }
    const workingDirectories = storedMetadata?.workingDirectories ?? (typeof sessionMetadata?.context?.workingDirectory === "string" ? [URI.file(sessionMetadata.context.workingDirectory)] : void 0);
    const adoptable = !storedMetadata && await this._isExtensionHostCliSession(sessionId);
    return {
      chat,
      startTime: sessionMetadata?.startTime.getTime() ?? Date.now(),
      modifiedTime: sessionMetadata?.modifiedTime.getTime() ?? Date.now(),
      project,
      summary: sessionMetadata?.summary,
      workingDirectories,
      _meta: adoptable ? withSessionEhcliAdoptable(void 0) : void 0
    };
  }
  async _listModels(gitHubToken) {
    this._logService.info("[Copilot] Listing models...");
    const client = await this._ensureClient();
    const { models } = await client.rpc.models.list({ gitHubToken });
    this._freeLongContextModels.clear();
    const result = models.map((m) => {
      const billing = normalizeCAPIBilling(m.billing);
      const configSchema = this._createModelConfigSchema(m, billing);
      const tokenPrices = billing?.tokenPrices;
      const hasLargerLongContext = !!tokenPrices?.contextMax && !!tokenPrices.longContext?.contextMax && tokenPrices.longContext.contextMax > tokenPrices.contextMax;
      if (hasLargerLongContext && !hasLongContextSurcharge(billing)) {
        this._freeLongContextModels.add(m.id);
      }
      return {
        provider: this.id,
        id: m.id,
        name: m.name,
        // Synthetic SDK entries like `auto` ship with `capabilities: {}` and
        // no fixed context window — surface them with maxContextWindow undefined.
        maxContextWindow: m.capabilities?.limits?.max_context_window_tokens,
        maxOutputTokens: m.capabilities?.limits?.max_output_tokens,
        maxPromptTokens: m.capabilities?.limits?.max_prompt_tokens,
        supportsVision: !!m.capabilities?.supports?.vision,
        configSchema,
        policyState: m.policy?.state,
        _meta: this._createModelPickerMeta(m, billing)
      };
    });
    this._logService.info(`[Copilot] Found ${result.length} models: ${result.map((m) => m.name).join(", ")}`);
    return result;
  }
  /**
   * Resolves the process root for a chat that carries its session's runtime:
   * the host-supplied primary folder, else a still-provisional session's
   * folder for an idempotent re-create, else — when the session is
   * workspace-less (no working directories supplied) — a stable per-session
   * scratch directory.
   */
  async _resolveCreateWorkingDirectory(options, sessionId, isWorkspaceless) {
    if (options.fork) {
      const sourceScope = this._resolveChatScope(options.fork.source);
      const sourceSessionId = AgentSession.id(sourceScope);
      const liveWorkingDirectory = this._findSessionBySdkId(sourceSessionId)?.workingDirectory;
      if (liveWorkingDirectory) {
        return liveWorkingDirectory;
      }
      const storedWorkingDirectory = (await this._readSessionMetadata(sourceScope)).workingDirectory;
      if (storedWorkingDirectory) {
        return storedWorkingDirectory;
      }
    }
    const existing = options.workingDirectories?.[0] ?? this._provisionalSessions.get(sessionId)?.workingDirectory;
    if (existing) {
      return existing;
    }
    if (isWorkspaceless) {
      const scratchDir = this._workspacelessScratchDir(sessionId);
      await fs6.mkdir(scratchDir.fsPath, { recursive: true });
      return scratchDir;
    }
    const tmpPath = await fs6.mkdtemp(join(os4.tmpdir(), "agent-host-session-"));
    const workingDirectory = URI.file(tmpPath);
    this._logService.trace(`[Copilot] No workingDirectory provided, defaulting to temp directory: ${workingDirectory.fsPath}`);
    return workingDirectory;
  }
  /**
   * Stable per-session scratch directory for a workspace-less chat:
   * `<userHome>/.copilot/chats/<sessionId>`. Deterministic, persistent, and
   * cleaned up on session delete (see {@link _cleanupWorkspacelessScratchDir}).
   */
  _workspacelessScratchDir(sessionId) {
    return workspacelessScratchDir(this._environmentService.userHome, sessionId);
  }
  /** Ensures a workspace-less chat's scratch dir exists (mkdir -p), recreating it if it was reaped. */
  async _ensureWorkspacelessScratchDir(scratchDir, sessionId) {
    try {
      await fs6.mkdir(scratchDir.fsPath, { recursive: true });
      this._logService.trace(`[Copilot:${sessionId}] Workspace-less scratch directory ready: ${scratchDir.fsPath}`);
    } catch (error) {
      this._logService.warn(`[Copilot:${sessionId}] Failed to ensure workspace-less scratch directory '${scratchDir.fsPath}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /** Removes a workspace-less chat's stable scratch dir on session delete/dispose. */
  async _cleanupWorkspacelessScratchDir(scratchDir, sessionId) {
    try {
      await fs6.rm(scratchDir.fsPath, { recursive: true, force: true });
      this._logService.trace(`[Copilot:${sessionId}] Removed workspace-less scratch directory: ${scratchDir.fsPath}`);
    } catch (error) {
      this._logService.warn(`[Copilot:${sessionId}] Failed to remove workspace-less scratch directory '${scratchDir.fsPath}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  // ---- Chat surface ------------------------------------------------------
  //
  // The chat-addressed operation surface (see
  // {@link IAgent.chats}). The orchestrator owns the feature-level
  // `(session, chat)` mapping and hands these methods a single, concrete chat
  // channel URI plus transient context when the operation needs the owning
  // session or storage scope. Routing reads only the exact chat backing map
  // and never recovers ownership by parsing the chat URI.
  /** Exact Copilot SDK session-id lookup; use chat-based helpers for routing. */
  _findSessionBySdkId(sdkSessionId) {
    return this._chatEntriesBySdkId.get(sdkSessionId)?.chatSession;
  }
  /** Returns the live chat whose persistence scope is the session itself. */
  _findSessionChat(session) {
    for (const entry of this._chatEntriesBySdkId.values()) {
      if (isEqual2(entry.chatSession.resourceUri, session)) {
        return entry.chatSession;
      }
    }
    return void 0;
  }
  _findChatByUri(chat) {
    const chatKey = typeof chat === "string" ? chat : chat.toString();
    const backing = this._chatBackings.get(chatKey);
    return backing ? this._findSessionBySdkId(backing.sdkSessionId) : void 0;
  }
  _findBoundSessionChatUri(sessionId) {
    for (const [chatKey, backing] of this._chatBackings) {
      if (backing.sdkSessionId === sessionId) {
        return URI.parse(chatKey);
      }
    }
    return void 0;
  }
  /** Resolves the Copilot SDK conversation id backing a session URI, falling back to the AH session id. */
  _sdkConversationId(session) {
    const sessionId = AgentSession.id(session);
    return this._findSessionChat(session)?.sessionId ?? this._provisionalSessions.get(sessionId)?.sdkSessionId ?? this._chatBackings.get(buildDefaultChatUri(session))?.sdkSessionId ?? sessionId;
  }
  /** Returns the chat URI bound to the session-backed chat, if any. */
  _findSessionChatUri(session) {
    return this._findBoundSessionChatUri(this._sdkConversationId(session));
  }
  /** Normalizes an addressed chat operation and refreshes any host snapshot carried in its context. */
  _resolveChatContext(chat, sessionOrContext) {
    const explicit = resolveAgentChatContext(sessionOrContext, chat);
    this._noteHostCustomizations(sessionOrContext);
    return this._resolveExplicitChatContext(chat, explicit);
  }
  _resolveSendChatContext(chat, operationContext) {
    if (operationContext) {
      return this._resolveChatContext(chat, operationContext);
    }
    const chatKey = chat.toString();
    const backing = this._chatBackings.get(chatKey);
    const target = backing ? this._findSessionBySdkId(backing.sdkSessionId) : void 0;
    if (!backing || !target) {
      throw new Error(`Cold Copilot chat operation requires explicit host context: ${chatKey}`);
    }
    const ownerSession = target.ownerSessionUri ?? target.sessionUri;
    return {
      configurationResource: ownerSession,
      configurationId: AgentSession.id(ownerSession),
      resource: target.resourceUri,
      chat,
      chatKey,
      sdkSessionId: backing.sdkSessionId,
      sequencerKey: backing.sdkSessionId,
      target
    };
  }
  /** Legacy truncation may still omit context for a live chat. */
  _resolveTruncateChatContext(chat, operationContext) {
    if (operationContext) {
      return this._resolveChatContext(chat, operationContext);
    }
    const chatKey = chat.toString();
    const backing = this._chatBackings.get(chatKey);
    const target = backing ? this._findSessionBySdkId(backing.sdkSessionId) : void 0;
    if (!backing || !target) {
      throw new Error(`Cold Copilot chat operation requires explicit host context: ${chatKey}`);
    }
    const ownerSession = target.ownerSessionUri ?? target.sessionUri;
    return {
      configurationResource: ownerSession,
      configurationId: AgentSession.id(ownerSession),
      resource: target.resourceUri,
      chat,
      chatKey,
      sdkSessionId: backing.sdkSessionId,
      sequencerKey: backing.sdkSessionId,
      target
    };
  }
  _resolveExplicitChatContext(chat, context) {
    const chatKey = chat.toString();
    const backing = this._chatBackings.get(chatKey);
    const boundTarget = backing ? this._findSessionBySdkId(backing.sdkSessionId) : void 0;
    const configurationId = AgentSession.id(context.configurationResource);
    const target = boundTarget;
    const sdkSessionId = backing?.sdkSessionId;
    return {
      configurationResource: context.configurationResource,
      configurationId,
      resource: context.resource,
      chat,
      chatKey,
      sdkSessionId,
      sequencerKey: sdkSessionId ?? chatKey,
      target
    };
  }
  _getRuntimeSlashCommands(sessionId, options) {
    const session = this._findSessionBySdkId(sessionId);
    if (session) {
      return session.getRuntimeSlashCommands(options) ?? [];
    }
    return this._slashCommandProvider.getSlashCommands(options);
  }
  getTurnDiagnosticSnapshot(chat, turnId) {
    const session = this._findChatByUri(chat);
    if (!session) {
      return { state: "missingChat" };
    }
    return session.getTurnDiagnosticSnapshot(turnId) ?? { state: "missingTurn" };
  }
  /** Creates one exact chat backing: fresh, deferred, imported, or forked. */
  async _createChat(chat, context, options = {}) {
    const scope = context.configurationResource;
    const chatKey = chat.toString();
    const preexisting = this._chatScopes.has(chatKey) || this._chatBackings.has(chatKey) || !!this._findChatByUri(chat);
    this._rememberChatScope(chat, scope, context.resource);
    try {
      if (options.deferBacking) {
        return await this._reserveChatBacking(chat, context, options);
      }
      if (options.importConversation) {
        return await this._importChatBacking(chat, context, options);
      }
      return await this._mintChatBacking(chat, context, options);
    } catch (error) {
      if (!preexisting) {
        await this._rollbackFailedChatCreate(chat, scope, options.workingDirectories === void 0);
      }
      throw error;
    }
  }
  /**
   * Undoes the bookkeeping {@link _createChat} recorded for `chat` before a
   * create attempt throws (client startup, import/resume, or fork/model/mint
   * failures), so a failed create never permanently pins the configuration
   * scope's shared runtime. Without this, the scope recorded by
   * {@link _rememberChatScope} before the failing operation stays in
   * {@link _chatScopes} forever, so {@link _remainingChatsForScope} never
   * reaches zero and the scope's ActiveClient/plugin/MCP state, session
   * lifetime, host customizations, scratch dir, and trace context leak for
   * the lifetime of the process.
   *
   * Only this chat's own membership/partial state is torn down here; the
   * scope's provider-owned resources are finalized — the same cleanup a
   * normal `disposeChat` runs once the last chat is gone — only when no
   * other chat still shares `scope`, so an earlier successful sibling create
   * keeps the resources it depends on.
   *
   * Callers must only invoke this for a chat that had no preexisting
   * binding when `_createChat` started; {@link _createChat} itself guards
   * that, so a duplicate/reconnect create attempt that fails never tears
   * down the live/provisional/restored binding it found already in place.
   */
  async _rollbackFailedChatCreate(chat, scope, workspacelessHint) {
    const chatKey = chat.toString();
    const scopeId = AgentSession.id(scope);
    this._chatScopes.delete(chatKey);
    this._chatStorageScopes.delete(chatKey);
    this._chatBackings.delete(chatKey);
    this._activeClients.get(scope)?.removeChat(chat);
    try {
      if (this._remainingChatsForScope(scope) === 0) {
        await this._finalizeConfigurationScope(scope, scopeId, workspacelessHint);
      }
    } catch (cleanupError) {
      this._logService.warn(`[Copilot] Failed to finalize configuration scope ${scope.toString()} after a failed chat creation: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
    }
  }
  /** Reserves an SDK id now and defers real session creation to the first send. */
  async _reserveChatBacking(chat, context, options) {
    const session = context.configurationResource;
    const sessionId = AgentSession.id(session);
    this._logService.info(`[Copilot] Creating chat ${chat.toString()} with a deferred backing... ${options.model ? `model=${options.model.id}` : ""}`);
    const sdkSessionId = generateUuid();
    const isWorkspaceless = options.workingDirectories === void 0;
    const workingDirectory = await this._resolveCreateWorkingDirectory(options, sessionId, isWorkspaceless);
    await this._ensureClient();
    const existing = this._findChatByUri(chat);
    if (existing) {
      this._logService.info(`[Copilot] createChat is a no-op: chat ${chat.toString()} is already backed by a live runtime`);
      const project2 = await projectFromCopilotContext({ cwd: workingDirectory.fsPath }, this._gitService);
      return {
        resolvedWorkingDirectory: workingDirectory,
        ...project2 ? { project: project2 } : {},
        ...this._chatBackingResult(sessionId, { sdkSessionId: existing.sessionId })
      };
    }
    const reserved = this._provisionalSessions.get(sessionId);
    if (options.activeClient) {
      const ac = this._getOrCreateActiveClient(session, workingDirectory);
      ac.pluginController.setAdditionalDirectories(this._additionalCustomizationDirectories(options.workingDirectories));
      const seeded = options.activeClient;
      ac.toolSet.set(seeded.clientId, seeded.tools);
      ac.getOrCreateHandle(seeded.clientId, seeded.displayName);
      this._adoptClientChat(ac, seeded.clientId, chat);
      if (seeded.customizations !== void 0) {
        await ac.pluginController.sync(seeded.clientId, seeded.customizations, { quiet: true });
      }
    }
    const project = await projectFromCopilotContext({ cwd: workingDirectory.fsPath }, this._gitService);
    if (!reserved) {
      this._resetSessionLifetime(sessionId);
      this._provisionalSessions.set(sessionId, {
        sessionId,
        sdkSessionId,
        sessionUri: session,
        chat,
        isEphemeral: options.isEphemeral === true,
        hasScopedEditSurface: options.hasScopedEditSurface === true,
        workingDirectory,
        workingDirectories: options.workingDirectories,
        model: options.model,
        agent: options.agent,
        project,
        workspaceless: isWorkspaceless
      });
      this._chatBackings.set(chat.toString(), { sdkSessionId, ...options.model ? { model: options.model } : {} });
    }
    this._logService.info(`[Copilot] Chat created; its backing stays deferred until the first send: ${session.toString()}`);
    return {
      resolvedWorkingDirectory: workingDirectory,
      provisional: true,
      ...project ? { project } : {},
      ...this._chatBackingResult(sessionId, { sdkSessionId: reserved?.sdkSessionId ?? sdkSessionId })
    };
  }
  async _resumeTurn(chat, turnId, operationContext, senderClientId, clientType = "unknown" /* Unknown */) {
    try {
      await this._resumeTurnOnce(chat, turnId, operationContext, senderClientId, clientType);
    } catch (error) {
      const recovery = await this._handleClientOperationFailure(error, "resumeTurn", this._clientFailureCorrelation(chat, turnId, operationContext));
      if (recovery?.failedTurnIds.has(turnId)) {
        return;
      }
      throw error;
    }
  }
  async _resumeTurnOnce(chat, turnId, operationContext, senderClientId, clientType = "unknown" /* Unknown */) {
    const context = this._resolveChatContext(chat, operationContext);
    const clientTelemetryContext = URI.isUri(operationContext) ? void 0 : operationContext.clientTelemetryContext;
    await this._queueChat(context.configurationId, context.sequencerKey, async () => {
      const current = this._resolveChatContext(chat, operationContext);
      let entry = current.target ?? await this._ensureResolvedChatSession(current);
      if (!entry) {
        throw new Error(`[Copilot] resumeTurn for unknown chat: ${chat.toString()}`);
      }
      const activeClient = this._activeClients.get(current.configurationResource);
      const currentSnapshot = activeClient ? await activeClient.snapshot(current.chatKey) : void 0;
      if (activeClient && currentSnapshot && await activeClient.requiresRestart(entry.appliedSnapshot, current.chatKey, currentSnapshot)) {
        await this._destroyLiveSession(entry, true);
        entry = entry.sessionId === current.configurationId ? await this._resumeSession(current.configurationId, current.chat) : await this._ensureResolvedChatSession(current);
      }
      if (!entry) {
        throw new Error(`[Copilot] resumeTurn for unavailable chat: ${chat.toString()}`);
      }
      await entry.resume(turnId, this._resolveSdkMode(current.configurationResource), senderClientId, clientType, clientTelemetryContext);
    });
  }
  /** Mints the chat's backing from an imported conversation supplied by Agent Host. */
  async _importChatBacking(chat, context, options) {
    const session = context.configurationResource;
    const sessionId = AgentSession.id(session);
    const workingDirectory = await this._resolveCreateWorkingDirectory(options, sessionId, options.workingDirectories === void 0);
    await this._ensureClient();
    if (!this._findSessionBySdkId(sessionId) && !this._provisionalSessions.has(sessionId)) {
      this._resetSessionLifetime(sessionId);
    }
    return this._importConversation(options, sessionId, workingDirectory, chat);
  }
  /** Seeds an imported conversation into the SDK store, then resumes it as a live editable chat. */
  async _importConversation(options, sessionId, workingDirectory, chat) {
    const importConfig = options.importConversation;
    const sessionUri = AgentSession.uri(this.id, sessionId);
    return this._queueSession(sessionId, async () => {
      this._logService.info(`[Copilot] Importing conversation into session ${sessionId} (${importConfig.turns.length} turns)`);
      const model = importConfig.model ?? options.model;
      const projectPromise = projectFromCopilotContext({ cwd: workingDirectory.fsPath }, this._gitService);
      const eventsPath = join(getCopilotHomePath(this._environmentService.userHome.fsPath, process.env), "session-state", sessionId, "events.jsonl");
      const jsonl = buildSessionEventLogFromTurns(importConfig.turns, {
        sessionId,
        workingDirectory: workingDirectory.fsPath,
        model: model?.id
      });
      await fs6.mkdir(dirname(eventsPath), { recursive: true });
      await fs6.writeFile(eventsPath, jsonl, "utf8");
      const project = await projectPromise;
      await this._storeSessionMetadata(sessionUri, model, workingDirectory, options.workingDirectories ?? [workingDirectory], workingDirectory, project);
      if (options.agent !== void 0) {
        await this._storeSessionAgentMetadata(sessionUri, options.agent);
      }
      const imported = await this._resumeSession(sessionId, chat);
      this._logService.info(`[Copilot] Imported session created: ${sessionUri.toString()}`);
      return {
        resolvedWorkingDirectory: workingDirectory,
        ...project ? { project } : {},
        ...this._chatBackingResult(sessionId, { sdkSessionId: imported.sessionId })
      };
    });
  }
  /** Absolute path of an extension-host Copilot CLI sidecar file for `sessionId`. */
  _extensionHostCliSidecarPath(sessionId, fileName) {
    return join(getCopilotHomePath(this._environmentService.userHome.fsPath, process.env), "session-state", sessionId, fileName);
  }
  /**
   * Reads and parses the `vscode.metadata.json` marker for `sessionId`, or
   * `undefined` when it is missing/unreadable/malformed.
   */
  _readExtensionHostCliMarker(sessionId) {
    let cached = this._extensionHostCliMarkerCache.get(sessionId);
    if (!cached) {
      cached = fs6.readFile(this._extensionHostCliSidecarPath(sessionId, EXTENSION_HOST_CLI_MARKER_FILE), "utf8").then((raw) => parseExtensionHostCliMarker(raw)).catch(() => void 0);
      this._extensionHostCliMarkerCache.set(sessionId, cached);
      const pending = cached;
      void pending.then((marker) => {
        if (marker === void 0 && this._extensionHostCliMarkerCache.get(sessionId) === pending) {
          this._extensionHostCliMarkerCache.delete(sessionId);
        }
      });
    }
    return cached;
  }
  async _isExtensionHostCliSession(sessionId) {
    return isExtensionHostCliMarker(await this._readExtensionHostCliMarker(sessionId));
  }
  /** Reads the marker from disk, bypassing the cache, for its mutable fields. */
  async _readExtensionHostCliMarkerUncached(sessionId) {
    try {
      const marker = parseExtensionHostCliMarker(await fs6.readFile(this._extensionHostCliSidecarPath(sessionId, EXTENSION_HOST_CLI_MARKER_FILE), "utf8"));
      if (marker) {
        this._extensionHostCliMarkerCache.set(sessionId, Promise.resolve(marker));
      }
      return marker;
    } catch {
      return void 0;
    }
  }
  /** Reads a legacy extension-host Copilot CLI custom title, if present. */
  async _readExtensionHostCliCustomTitle(sessionId) {
    const title = (await this._readExtensionHostCliMarker(sessionId))?.customTitle;
    return typeof title === "string" && title.trim() ? title : void 0;
  }
  /**
   * Whether the user archived this session in the extension host list, or
   * `undefined` when the current state cannot be established (unreadable or
   * malformed marker, or one that no longer identifies a VS Code legacy chat).
   * Callers that would commit to the state must not treat that as unarchived.
   */
  async _isExtensionHostCliSessionArchived(sessionId) {
    const marker = await this._readExtensionHostCliMarkerUncached(sessionId);
    if (!isExtensionHostCliMarker(marker)) {
      return void 0;
    }
    return marker?.archived === true;
  }
  /** Whether `path` is a directory that still exists on disk. */
  async _isExistingDirectory(path) {
    try {
      return (await fs6.stat(path)).isDirectory();
    } catch {
      return false;
    }
  }
  /**
   * Working directory recorded in the extension host's own marker, used when the
   * SDK reports no `workingDirectory` for a legacy chat. The extension host
   * resolves such chats from this same file, so without it they would be dropped
   * here and become unreachable once the extension is retired.
   */
  async _extensionHostCliWorkingDirectory(sessionId) {
    for (const candidate of extensionHostCliWorkingDirectoryPaths(await this._readExtensionHostCliMarker(sessionId))) {
      if (await this._isExistingDirectory(candidate)) {
        return URI.file(candidate);
      }
    }
    return void 0;
  }
  /**
   * Worktree identity the extension host recorded, when its checkout is gone but
   * the repository remains. Resume recreates the worktree from this, matching how
   * a natively worktree-isolated session recovers.
   */
  async _extensionHostCliAdoptedWorktree(sessionId) {
    const worktree = (await this._readExtensionHostCliMarker(sessionId))?.worktreeProperties;
    if (!worktree?.worktreePath || !worktree.repositoryPath || !worktree.branchName) {
      return void 0;
    }
    if (await this._isExistingDirectory(worktree.worktreePath) || !await this._isExistingDirectory(worktree.repositoryPath)) {
      return void 0;
    }
    return {
      branchName: worktree.branchName,
      baseBranch: worktree.baseBranchName,
      worktreePath: URI.file(worktree.worktreePath),
      repositoryRoot: URI.file(worktree.repositoryPath)
    };
  }
  /**
   * Records the durable adopted-legacy marker on a session adopted by a build
   * that predates it. Without this those sessions keep the extension-host marker
   * but no provenance, so a worktree one stays filtered out of the window opened
   * on its repository. Keyed off the marker, so it never claims a native session.
   */
  async _backfillAdoptedLegacyMarker(session, sessionId) {
    const ref = await this._sessionDataService.tryOpenDatabase(session);
    if (!ref) {
      return;
    }
    try {
      if (await ref.object.getMetadata(AH_META_EHCLI_ADOPTED_DB_KEY) !== void 0) {
        return;
      }
      if (!await this._isExtensionHostCliSession(sessionId)) {
        return;
      }
      await ref.object.setMetadata(AH_META_EHCLI_ADOPTED_DB_KEY, "true");
      this._logService.info(`[Copilot] Backfilled the adopted-legacy marker for ${sessionId}, migrated before it was recorded`);
    } catch (err) {
      this._logService.warn(`[Copilot] Failed to backfill the adopted-legacy marker for ${sessionId}`, err);
    } finally {
      ref.dispose();
    }
  }
  /** Adopts a legacy extension-host Copilot CLI session in place when it is eligible on disk. */
  async ensureChatAdopted(chat, context) {
    const session = resolveAgentChatContext(context, chat).configurationResource;
    const sessionId = AgentSession.id(session);
    return this._queueSession(sessionId, async () => {
      const existing = await this._readStoredSessionMetadata(session);
      if (existing?.workingDirectory) {
        await this._backfillAdoptedLegacyMarker(session, sessionId);
        this._logService.trace(`[Copilot] Adoption skipped for ${sessionId}: already has Agent Host metadata (cwd=${existing.workingDirectory.fsPath})`);
        return { adopted: false, eligible: false, native: true, reason: "alreadyNative" };
      }
      if (!await this._isExtensionHostCliSession(sessionId)) {
        this._logService.info(`[Copilot] Adoption declined for ${sessionId}: not a legacy extension-host Copilot CLI chat (no VS Code marker in its SDK session directory)`);
        return { adopted: false, eligible: false, reason: "notLegacyChat" };
      }
      const client = await this._ensureClient();
      const sdkMetadata = await client.getSessionMetadata(sessionId).catch(() => void 0);
      const sdkWorkingDirectory = typeof sdkMetadata?.context?.workingDirectory === "string" ? sdkMetadata.context.workingDirectory : void 0;
      const adoptedWorktree = await this._extensionHostCliAdoptedWorktree(sessionId);
      const workingDirectory = adoptedWorktree?.worktreePath ?? (sdkWorkingDirectory && await this._isExistingDirectory(sdkWorkingDirectory) ? URI.file(sdkWorkingDirectory) : void 0) ?? await this._extensionHostCliWorkingDirectory(sessionId);
      if (!workingDirectory) {
        this._logService.warn(`[Copilot] Adoption skipped for ${sessionId}: no usable working directory (sdk='${sdkWorkingDirectory ?? "(none)"}' exists=${sdkWorkingDirectory ? await this._isExistingDirectory(sdkWorkingDirectory) : false}, no recorded worktree, no marker fallback). The session stays on the legacy provider.`);
        return { adopted: false, eligible: true, reason: "workingDirectoryMissing" };
      }
      this._logService.info(`[Copilot] Adopting legacy session ${sessionId} in place (reusing on-disk events.jsonl): cwd=${workingDirectory.fsPath}${adoptedWorktree ? ` worktree=${adoptedWorktree.worktreePath.fsPath} branch=${adoptedWorktree.branchName} base=${adoptedWorktree.baseBranch ?? "(none)"} repo=${adoptedWorktree.repositoryRoot.fsPath} (checkout missing, will be recreated on resume)` : ""}`);
      const project = await this._localProject(
        await projectFromCopilotContext({ cwd: (adoptedWorktree?.repositoryRoot ?? workingDirectory).fsPath }, this._gitService),
        sessionId
      );
      const customTitle = await this._readExtensionHostCliCustomTitle(sessionId);
      const sdkName = sdkMetadata?.name;
      const cliName = typeof sdkName === "string" && sdkName.trim() ? sdkName.trim() : void 0;
      const cliSummary = typeof sdkMetadata?.summary === "string" && sdkMetadata.summary.trim() ? sdkMetadata.summary.trim() : void 0;
      const adoptedTitle = cliName ?? customTitle ?? cliSummary;
      const archived = await this._isExtensionHostCliSessionArchived(sessionId);
      if (archived === void 0) {
        this._logService.warn(`[Copilot] Adoption skipped for ${sessionId}: its extension-host marker could not be re-read, so the archived state is unknown`);
        return { adopted: false, eligible: true, reason: "markerUnavailable" };
      }
      await this._storeSessionMetadata(
        session,
        void 0,
        workingDirectory,
        [workingDirectory],
        workingDirectory,
        project,
        project !== void 0,
        { ["isolation" /* Isolation */]: "folder" },
        adoptedTitle,
        /* markRead */
        true,
        archived,
        /* ehcliAdopted */
        true
      );
      await this._adoptLegacyTurnUsage(session, sessionId);
      this._logService.info(`[Copilot] Adopted legacy session ${sessionId}: project=${project ? project.uri.fsPath : "(unresolved)"} archived=${archived} title=${adoptedTitle !== void 0 ? cliName ? "name" : customTitle ? "custom" : "summary" : "none"} worktreeBridged=${!!adoptedWorktree}`);
      return { adopted: true, eligible: true, reason: "adopted", ...adoptedWorktree ? { worktree: adoptedWorktree } : {} };
    });
  }
  /**
   * Carries the per-request credit totals the extension host persisted in
   * `vscode.requests.metadata.json` into the adopted session's `turn_usage`
   * rows, so restored turns keep their "credits used" gauge. Best-effort: a
   * missing/malformed sidecar or a write failure must never fail adoption.
   *
   * Only ever called from {@link ensureChatAdopted} once a legacy extension-host
   * Copilot CLI session has passed every eligibility gate and is actually being
   * migrated — no native or non-VS Code Copilot session's usage is read or written.
   */
  async _adoptLegacyTurnUsage(session, sessionId) {
    const raw = await fs6.readFile(this._extensionHostCliSidecarPath(sessionId, "vscode.requests.metadata.json"), "utf8").catch(() => void 0);
    if (raw === void 0) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      const rows = [];
      for (const entry of parsed) {
        const turnId = entry?.copilotRequestId;
        const credits = entry?.creditsUsed;
        if (typeof turnId !== "string" || !turnId || typeof credits !== "number" || !Number.isFinite(credits) || credits < 0) {
          continue;
        }
        rows.push({
          turnId,
          usage: {
            ...typeof entry.responseModelId === "string" && entry.responseModelId ? { model: entry.responseModelId } : {},
            _meta: { copilotUsage: { totalNanoAiu: Math.round(credits * NANO_AIU_PER_CREDIT) } }
          }
        });
      }
      if (rows.length === 0) {
        return;
      }
      const dbRef = this._sessionDataService.openDatabase(session);
      try {
        for (const row of rows) {
          await dbRef.object.setTurnUsage(row.turnId, JSON.stringify(row.usage));
        }
      } finally {
        dbRef.dispose();
      }
      this._logService.info(`[Copilot] Adopted ${rows.length} legacy turn usage records for session ${sessionId}`);
    } catch (err) {
      this._logService.warn(`[Copilot] Failed to adopt legacy turn usage for session ${sessionId}`, err);
    }
  }
  /** Materializes a provisional chat into a real SDK session immediately before first send. */
  async _materializeProvisional(sessionId, resolvedWorkingDirectories) {
    const provisional = this._provisionalSessions.get(sessionId);
    if (!provisional) {
      throw new Error(`Cannot materialize unknown provisional session: ${sessionId}`);
    }
    const client = await this._ensureClient();
    const sessionUri = provisional.sessionUri;
    const sdkSessionId = provisional.sdkSessionId;
    const workingDirectory = resolvedWorkingDirectories?.[0] ?? provisional.workingDirectory;
    const customizationDirectory = workingDirectory ?? provisional.workingDirectory;
    const activeClient = this._getOrCreateActiveClient(sessionUri, customizationDirectory);
    activeClient.pluginController.reanchor(customizationDirectory);
    activeClient.pluginController.setAdditionalDirectories(this._additionalCustomizationDirectories(resolvedWorkingDirectories));
    const snapshot = await activeClient.snapshot((this._findSessionChatUri(sessionUri) ?? sessionUri).toString());
    const shellManager = this._instantiationService.createInstance(ShellManager, sessionUri, workingDirectory);
    let agentSession;
    let agent;
    try {
      const resolvedAgent = provisional.isEphemeral ? void 0 : await this._resolveAgentWhenMaterializing(provisional, snapshot, workingDirectory);
      agent = resolvedAgent?.agent;
      const launchPlan = {
        kind: "create",
        client,
        sessionId: sdkSessionId,
        isEphemeral: provisional.isEphemeral,
        hasScopedEditSurface: provisional.hasScopedEditSurface,
        workingDirectory,
        additionalDirectories: this._additionalCustomizationDirectories(resolvedWorkingDirectories),
        resolvedAgentName: resolvedAgent?.name,
        snapshot,
        disabledRootMcpServers: await this._disabledRootMcpServers(sessionUri, sdkSessionId, snapshot),
        activeClientToolSet: activeClient.toolSet,
        shellManager,
        githubToken: this._githubToken,
        model: provisional.model,
        longContextWindow: this._longContextWindowFor(provisional.model?.id),
        freeLongContext: this._isFreeLongContext(provisional.model?.id),
        workspaceless: provisional.workspaceless
      };
      const chatChannelUri = this._findBoundSessionChatUri(sdkSessionId) ?? URI.parse(buildDefaultChatUri(sessionUri));
      agentSession = this._createAgentSession(launchPlan, customizationDirectory, activeClient, {
        sessionUri,
        chatChannelUri,
        resource: sessionUri
      });
      await agentSession.initializeSession();
      this._registerInitializedSession(sdkSessionId, agentSession, activeClient, launchPlan.client);
    } catch (error) {
      agentSession?.dispose();
      throw error;
    }
    const project = await projectFromCopilotContext({ cwd: workingDirectory?.fsPath }, this._gitService);
    const materializedWorkingDirectories = resolvedWorkingDirectories ?? [workingDirectory];
    this._provisionalSessions.delete(sessionId);
    await this._storeSessionMetadata(sessionUri, provisional.model, workingDirectory, materializedWorkingDirectories, customizationDirectory, project, true);
    if (agent !== void 0) {
      await this._storeSessionAgentMetadata(sessionUri, agent);
    }
    this._checkpointService.captureBaselineCheckpoint(sessionUri, materializedWorkingDirectories).catch((err) => {
      this._logService.warn(`[Copilot:${sessionId}] Baseline checkpoint capture failed: ${err instanceof Error ? err.message : String(err)}`);
    });
    this._logService.info(`[Copilot] Session materialized: ${sessionUri.toString()}`);
    this._onDidMaterializeChat.fire({ chat: provisional.chat, project, workingDirectories: materializedWorkingDirectories });
    return agentSession;
  }
  async _resolveAgentWhenMaterializing(provisional, snapshot, workingDirectory) {
    const agent = provisional.agent;
    if (!agent) {
      return void 0;
    }
    const alternativeAgent = this._getAlternativeAgentForWorktree(provisional, workingDirectory);
    const originalAgentName = this._resolveAgentName(snapshot, agent);
    const alternativeAgentName = alternativeAgent ? this._resolveAgentName(snapshot, alternativeAgent) : void 0;
    if (originalAgentName) {
      return { agent, name: originalAgentName };
    }
    if (alternativeAgentName && alternativeAgent) {
      this._logService.info(`[Copilot] Agent file ${agent.uri} is in the original repo; using worktree agent ${alternativeAgent?.uri}`);
      return { agent: alternativeAgent, name: alternativeAgentName };
    }
    return void 0;
  }
  _getAlternativeAgentForWorktree(provisional, workingDirectory) {
    const agent = provisional.agent;
    if (!agent) {
      return void 0;
    }
    if (!provisional.workingDirectory || !workingDirectory) {
      return void 0;
    }
    if (isEqual2(provisional.workingDirectory, workingDirectory)) {
      return void 0;
    }
    const agentUri = URI.parse(agent.uri);
    const alternativeAgentUri = rebaseUnder(agentUri, provisional.workingDirectory, workingDirectory);
    return alternativeAgentUri ? { uri: alternativeAgentUri.toString() } : void 0;
  }
  async resolveChatConfig(params) {
    const values = platformSessionSchema.validateOrDefault(migrateLegacyAutopilotConfig(params.config), {
      ["autoApprove" /* AutoApprove */]: "default",
      ["mode" /* Mode */]: "interactive"
      // Permissions intentionally omitted — leave unset so auto-approval
      // falls through to the host-level `permissions` default, and only
      // materializes on the session once the user hits "Allow in this
      // Session".
    });
    return {
      schema: platformSessionSchema.toProtocol(),
      values
    };
  }
  getInheritedChatConfig(config) {
    const inherited = {};
    for (const key of ["autoApprove" /* AutoApprove */, "permissions" /* Permissions */]) {
      if (config[key] !== void 0) {
        inherited[key] = config[key];
      }
    }
    return Object.keys(inherited).length > 0 ? inherited : void 0;
  }
  getAutonomousSessionConfig(_config) {
    return {
      ["mode" /* Mode */]: "autopilot",
      ...this._configurationService.getRootValue(platformRootSchema, AgentHostAutoApprovePolicyRestrictedConfigKey) !== true ? { ["autoApprove" /* AutoApprove */]: "assisted" } : {}
    };
  }
  async chatConfigCompletions(_params) {
    return { items: [] };
  }
  /** Records that `client` contributes to `chat` within the owning configuration scope. */
  getOrCreateActiveClient(chat, context, client, hostCustomizations) {
    const configurationResource = resolveAgentChatContext(context, chat).configurationResource;
    this._rememberHostCustomizations(configurationResource, hostCustomizations);
    const activeClient = this._getOrCreateActiveClient(configurationResource, void 0);
    this._adoptClientChat(activeClient, client.clientId, chat);
    if (!activeClient.pluginController.directory) {
      this._getSessionCustomizationAnchors(configurationResource).then(
        (anchors) => {
          activeClient.pluginController.setDirectory(anchors.directory);
          if (anchors.applyAdditional) {
            activeClient.pluginController.setAdditionalDirectories(anchors.additionalDirectories);
          }
        },
        () => {
        }
      );
    }
    return activeClient.getOrCreateHandle(client.clientId, client.displayName);
  }
  /** Adds `chat` to the host-published membership for `clientId`. */
  _adoptClientChat(activeClient, clientId, chat) {
    if (activeClient.addClientChat(clientId, chat)) {
      this._logService.info(`[Copilot] Active client ${clientId} now contributes to chat ${chat.toString()}`);
    }
  }
  /** Removes `clientId` from one exact chat, dropping the client only when no chats remain. */
  removeActiveClient(chat, context, clientId) {
    const configurationResource = resolveAgentChatContext(context, chat).configurationResource;
    const configurationId = AgentSession.id(configurationResource);
    const activeClient = this._activeClients.get(configurationResource);
    if (!activeClient) {
      this._logService.info(`[Copilot:${configurationId}] removeActiveClient: no active client state for clientId=${clientId}, chat=${chat.toString()}`);
      return;
    }
    const wasLastChat = activeClient.removeClientChat(clientId, chat);
    this._logService.info(`[Copilot:${configurationId}] removeActiveClient: clientId=${clientId}, chat=${chat.toString()}, fullyRemoved=${wasLastChat}`);
    if (wasLastChat) {
      activeClient.removeClient(clientId);
    }
  }
  /** Routes a completed client tool call to the runtime that owns it. */
  onClientToolCallComplete(chat, toolCallId, result, context) {
    const spawnedFrom = resolveSubagentChatParent(context);
    const target = this._findChatByUri(chat) ?? (spawnedFrom ? this._findChatByUri(spawnedFrom.chat) : void 0) ?? (context ? this._findSessionChat(context.configurationResource) : void 0);
    target?.handleClientToolCallComplete(toolCallId, result);
  }
  async _sendMessage(chat, prompt, attachments, turnId, senderClientId, clientType = "unknown" /* Unknown */, workingDirectories, operationContext, clientTelemetryContext) {
    try {
      await this._sendMessageOnce(chat, prompt, attachments, turnId, senderClientId, clientType, workingDirectories, operationContext, clientTelemetryContext);
    } catch (error) {
      const recovery = await this._handleClientOperationFailure(error, "sendMessage", this._clientFailureCorrelation(chat, turnId, operationContext));
      if (turnId && recovery?.failedTurnIds.has(turnId)) {
        return;
      }
      throw error;
    }
  }
  async _sendMessageOnce(chat, prompt, attachments, turnId, senderClientId, clientType = "unknown" /* Unknown */, workingDirectories, operationContext, clientTelemetryContext) {
    const context = this._resolveSendChatContext(chat, operationContext);
    await this._queueChat(context.configurationId, context.sequencerKey, async () => {
      const current = this._resolveSendChatContext(chat, operationContext);
      await this._activeClients.get(current.configurationResource)?.pluginController.retryFailedClientSyncIfNeeded();
      let entry = current.target;
      if (!entry) {
        entry = await this._ensureResolvedChatSession(current, workingDirectories);
      }
      const activeClient = this._activeClients.get(current.configurationResource);
      const hadCachedEntry = !!entry;
      this._logService.info(`[Copilot:${current.configurationId}] sendMessage: cachedEntry=${hadCachedEntry}, hasActiveClient=${!!activeClient}, activeClientId=${activeClient ? "(set)" : "(none)"}`);
      const rootsChanged = !!entry && workingDirectories !== void 0 && !areAdditionalWorkingDirectoriesEqual(entry.appliedAdditionalDirectories, this._additionalCustomizationDirectories(workingDirectories));
      const currentSnapshot = entry && activeClient ? await activeClient.snapshot(current.chatKey) : void 0;
      const structuralConfigChanged = !!entry && !!activeClient && !!currentSnapshot && await activeClient.requiresRestart(entry.appliedSnapshot, current.chatKey, currentSnapshot);
      const currentDisabledRootMcpServers = entry && currentSnapshot ? await this._disabledRootMcpServers(current.configurationResource, entry.sessionId, currentSnapshot) : void 0;
      const disabledRootMcpServersChanged = !!entry && !!currentDisabledRootMcpServers && !equals2(
        [...new Set(entry.appliedDisabledRootMcpServers)].sort(),
        [...new Set(currentDisabledRootMcpServers)].sort()
      );
      if (entry && (rootsChanged || structuralConfigChanged || disabledRootMcpServersChanged || entry.requiresMcpLaunchConfigurationRefresh)) {
        this._logService.info(`[Copilot:${current.configurationId}] Session configuration changed, refreshing session. clients=[${activeClient ? [...activeClient.toolSet.clientIds()].join(", ") || "(none)" : "(none)"}]`);
        await this._destroyLiveSession(entry, true);
        if (entry.sessionId === current.configurationId) {
          entry = await this._resumeSession(current.configurationId, current.chat, workingDirectories);
        } else {
          if (workingDirectories) {
            activeClient?.pluginController.setAdditionalDirectories(this._additionalCustomizationDirectories(workingDirectories));
          }
          entry = await this._ensureResolvedChatSession(current, workingDirectories);
        }
      }
      if (!entry) {
        this._logService.info(`[Copilot:${current.configurationId}] No cached entry${hadCachedEntry ? " (was evicted by requiresRestart)" : ""}, calling _resumeSession`);
      }
      entry ??= await this._ensureResolvedChatSession(current, workingDirectories);
      if (!entry) {
        throw new Error(`[Copilot] sendMessage for unknown chat: ${chat.toString()}`);
      }
      if (turnId) {
        entry.resetTurnState(turnId, senderClientId, clientType, clientTelemetryContext);
      }
      try {
        const sdkMode = this._resolveSdkMode(current.configurationResource);
        await entry.send(prompt, attachments, turnId, sdkMode, senderClientId, clientType, resolveAgentHostInstructions(operationContext), clientTelemetryContext);
      } catch (err) {
        const errCode = err?.code;
        const errMsg = err instanceof Error ? err.message : String(err);
        this._logService.error(`[Copilot:${current.configurationId}] entry.send() failed: code=${errCode}, message=${errMsg}, hadCachedEntry=${hadCachedEntry}, errorType=${err?.constructor?.name}`);
        throw err;
      }
    });
  }
  /**
   * Translates the AHP-side `mode` to the Copilot SDK's three-mode space
   * (`interactive` / `plan` / `autopilot`). With Autopilot living on the
   * `mode` axis the mapping is now direct:
   *
   *  - `mode='plan'` → SDK `plan`.
   *  - `mode='autopilot'` → SDK `autopilot` (autonomous, continue-until-done).
   *  - `mode='interactive'` → SDK `interactive`.
   *
   * Tool auto-approval is governed independently by the orthogonal
   * `autoApprove` axis (Default / Bypass), enforced by the agent
   * host's own permission handler — which the SDK still invokes even under
   * autopilot mode.
   *
   * Returns `undefined` when no mode is configured for the session, so
   * the SDK's current mode is left untouched.
   */
  _resolveSdkMode(session) {
    const sessionKey = session.toString();
    const mode = this._configurationService.getEffectiveValue(sessionKey, platformSessionSchema, "mode" /* Mode */);
    switch (mode) {
      case "plan":
        return "plan";
      case "autopilot":
        return "autopilot";
      case "interactive":
        return "interactive";
      default:
        return void 0;
    }
  }
  /**
   * Reads the session's current `mode` and `autoApprove` axis values so the
   * slash-command completion provider can hide config-action toggles that would
   * be a no-op (e.g. `/autopilot on` while already in autopilot).
   */
  _getSessionConfigState(sessionId) {
    const sessionKey = AgentSession.uri(this.id, sessionId).toString();
    return {
      mode: this._configurationService.getEffectiveValue(sessionKey, platformSessionSchema, "mode" /* Mode */),
      autoApprove: this._configurationService.getEffectiveValue(sessionKey, platformSessionSchema, "autoApprove" /* AutoApprove */)
    };
  }
  setPendingMessages(chat, steeringMessage, _queuedMessages) {
    const backing = this._chatBackings.get(chat.toString());
    const target = backing ? this._findSessionBySdkId(backing.sdkSessionId) : void 0;
    if (!target) {
      this._logService.warn(`[Copilot] setPendingMessages: chat not found for ${chat.toString()}`);
      return;
    }
    if (steeringMessage) {
      target.sendSteering(steeringMessage);
    }
  }
  async _getChatMessages(chat, sessionOrContext) {
    if (this._isShuttingDown) {
      return [];
    }
    if (resolveSubagentChatParent(sessionOrContext)) {
      return this._getSubagentChatMessages(chat, sessionOrContext);
    }
    const context = this._resolveChatContext(chat, sessionOrContext);
    if (this._provisionalSessions.get(context.configurationId)?.sdkSessionId === context.sdkSessionId) {
      return [];
    }
    const entry = await this._queueChat(context.configurationId, context.sequencerKey, async () => {
      return this._ensureResolvedChatSession(this._resolveChatContext(chat, sessionOrContext)).catch((err) => {
        if (err instanceof SessionWorkingDirectoryMissingError) {
          throw err;
        }
        if (context.sdkSessionId) {
          throw err;
        }
        this._logService.warn(`[Copilot:${context.configurationId}] Failed to resolve chat for message lookup`, err);
        return void 0;
      });
    });
    if (!entry) {
      return [];
    }
    return entry.getMessages();
  }
  /** Reconstructs a subagent transcript from the parent chat named by the host-supplied tool origin. */
  async _getSubagentChatMessages(chat, sessionOrContext) {
    const spawnedFrom = resolveSubagentChatParent(sessionOrContext);
    if (!spawnedFrom) {
      this._logService.warn(`[Copilot] Subagent chat ${chat.toString()} addressed without its host-supplied tool-call origin; no turns to reconstruct`);
      return [];
    }
    const owner = resolveAgentChatContext(sessionOrContext, chat).configurationResource;
    const parentContext = this._resolveChatContext(spawnedFrom.chat, { configurationResource: owner, resource: owner });
    const parentEntry = await this._ensureResolvedChatSession(parentContext).catch((err) => {
      this._logService.warn(`[Copilot:${parentContext.sdkSessionId ?? parentContext.configurationId}] Failed to resume exact source chat for subagent restore`, err);
      return void 0;
    });
    return parentEntry?.getSubagentMessages(spawnedFrom.toolCallId) ?? [];
  }
  /** Releases provider-owned resources once the last chat sharing `scope` is gone. */
  async _finalizeConfigurationScope(scope, scopeId, workspacelessHint) {
    const isWorkspaceless = workspacelessHint || (await this._readSessionMetadata(scope).catch(() => void 0))?.workspaceless === true;
    this._provisionalSessions.delete(scopeId);
    await this._sessionLifetimes.get(scopeId)?.dispose(async () => {
    });
    this._activeClients.get(scope)?.dispose();
    this._activeClients.delete(scope);
    this._hostCustomizations.delete(scope);
    if (isWorkspaceless) {
      await this._cleanupWorkspacelessScratchDir(this._workspacelessScratchDir(scopeId), scopeId);
    }
    this._otelService.releaseSessionTraceContext(scope.toString());
    await this._applyPendingClientRestart();
  }
  async _abortSession(chat, operationContext) {
    try {
      await this._abortSessionOnce(chat, operationContext);
    } catch (error) {
      const correlation = this._clientFailureCorrelation(chat, void 0, operationContext);
      if (!isCopilotConnectionClosedError(error)) {
        await this._handleClientOperationFailure(error, "abort", correlation);
        throw error;
      }
      this._resolveChatContext(chat, operationContext).target?.discardActiveTurn();
      if (!await this._handleClientOperationFailure(error, "abort", correlation)) {
        throw error;
      }
    }
  }
  async _abortSessionOnce(chat, operationContext) {
    const context = this._resolveChatContext(chat, operationContext);
    await this._queueChat(context.configurationId, context.sequencerKey, async () => {
      await this._resolveChatContext(chat, operationContext).target?.abort();
    });
  }
  /** Creates a concrete chat backing immediately, optionally by importing history from another chat. */
  async _mintChatBacking(chat, context, options) {
    const chatKey = chat.toString();
    const session = context.configurationResource;
    const sessionId = AgentSession.id(session);
    const fork2 = options.fork;
    const forkSourceScope = fork2 ? this._resolveChatScope(fork2.source) : void 0;
    const forkSourceSessionId = forkSourceScope ? AgentSession.id(forkSourceScope) : void 0;
    const inheritsFromOtherSession = !!fork2 && forkSourceSessionId !== sessionId;
    const existingBacking = this._chatBackings.get(chatKey);
    if (existingBacking) {
      return this._existingMintedChatResult(session, sessionId, existingBacking, inheritsFromOtherSession);
    }
    if (fork2 && isEqual2(fork2.source, chat)) {
      throw new Error(`Cannot fork Copilot chat ${chatKey} onto itself`);
    }
    let result;
    const queue = (task) => fork2?.independentQueue ? this._queueChat(sessionId, chatKey, task) : this._queueSession(forkSourceSessionId ?? sessionId, task);
    await queue(async () => {
      const existing = this._chatBackings.get(chatKey);
      if (existing) {
        result = await this._existingMintedChatResult(session, sessionId, existing, inheritsFromOtherSession);
        return;
      }
      const workingDirectory = inheritsFromOtherSession ? await this._resolveCreateWorkingDirectory(options, sessionId, false) : options.workingDirectories?.[0];
      if (!workingDirectory) {
        throw new Error(`[Copilot] createChat: missing resolved working directory for session ${session.toString()}`);
      }
      const sourceMetadata = inheritsFromOtherSession ? await this._readSessionMetadata(forkSourceScope) : void 0;
      const model = options.model ?? sourceMetadata?.model;
      const agent = options.agent ?? sourceMetadata?.agent;
      const client = await this._ensureClient();
      const chatSdkId = generateUuid();
      const activeClient = this._getOrCreateActiveClient(session, workingDirectory);
      const snapshot = await activeClient.snapshot(chatKey);
      const shellManager = this._instantiationService.createInstance(ShellManager, chat, workingDirectory);
      const storageScope = context.resource;
      let launchPlan;
      let sdkSessionId;
      let inheritedTurnId;
      let sourceEntry;
      if (fork2) {
        sourceEntry = await this._ensureResolvedChatSession(this._resolveChatContext(fork2.source, { configurationResource: forkSourceScope, resource: this._resolveChatStorageScope(fork2.source) }));
        if (!sourceEntry) {
          throw new Error(`[Copilot] createChat fork: source chat ${fork2.source.toString()} not found`);
        }
        const forked = await this._forkSdkChat(client, sourceEntry, fork2.turnId, this._sessionDataService.getSessionDataDir(storageScope));
        sdkSessionId = forked.sessionId;
        inheritedTurnId = forked.inheritedTurnId;
        launchPlan = {
          kind: "resume",
          client,
          sessionId: sdkSessionId,
          workingDirectory,
          resolvedAgentName: void 0,
          snapshot,
          disabledRootMcpServers: await this._disabledRootMcpServers(session, sdkSessionId, snapshot),
          activeClientToolSet: activeClient.toolSet,
          shellManager,
          githubToken: this._githubToken,
          fallback: { model, longContextWindow: this._longContextWindowFor(model?.id), freeLongContext: this._isFreeLongContext(model?.id) }
        };
      } else {
        sdkSessionId = chatSdkId;
        launchPlan = {
          kind: "create",
          client,
          sessionId: chatSdkId,
          workingDirectory,
          resolvedAgentName: void 0,
          snapshot,
          disabledRootMcpServers: await this._disabledRootMcpServers(session, chatSdkId, snapshot),
          activeClientToolSet: activeClient.toolSet,
          shellManager,
          githubToken: this._githubToken,
          model,
          longContextWindow: this._longContextWindowFor(model?.id),
          freeLongContext: this._isFreeLongContext(model?.id)
        };
      }
      let project;
      if (inheritsFromOtherSession) {
        project = await projectFromCopilotContext({ cwd: workingDirectory.fsPath }, this._gitService);
        const inheritedWorkingDirectories = sourceMetadata?.workingDirectories ?? (sourceEntry?.workingDirectory ? [sourceEntry.workingDirectory] : [workingDirectory]);
        await this._storeSessionMetadata(session, model, workingDirectory, inheritedWorkingDirectories, workingDirectory, project);
        if (agent !== void 0) {
          await this._storeSessionAgentMetadata(session, agent);
        }
      }
      let agentSession;
      try {
        agentSession = this._createAgentSession(launchPlan, workingDirectory, activeClient, { sessionUri: session, chatChannelUri: chat, resource: storageScope });
        await agentSession.initializeSession();
        if (fork2?.turnIdMapping) {
          await agentSession.remapTurnIds(fork2.turnIdMapping);
        }
        this._throwIfClientReplaced(client, agentSession);
        this._registerLiveChat(chat, agentSession, activeClient);
        const backing = {
          sdkSessionId,
          ...model ? { model } : {},
          ...agent ? { agent } : {}
        };
        this._chatBackings.set(chatKey, backing);
        result = {
          ...inheritsFromOtherSession ? { resolvedWorkingDirectory: workingDirectory, ...project ? { project } : {} } : {},
          ...inheritedTurnId !== void 0 ? { inheritedTurnId } : {},
          ...this._chatBackingResult(sessionId, backing)
        };
        this._logService.info(`[Copilot] Created chat backing ${chatKey} for context ${session.toString()}${fork2 ? " (forked)" : ""}`);
      } catch (error) {
        agentSession?.dispose();
        throw error;
      }
      if (inheritsFromOtherSession) {
        try {
          await this._reviewService.copyReviewedRef(forkSourceScope.toString(), session.toString(), workingDirectory);
        } catch (err) {
          this._logService.warn(`[Copilot] Failed to copy reviewed ref for fork: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    });
    if (!result) {
      throw new Error(`[Copilot] createChat: no backing was recorded for ${chatKey}`);
    }
    return result;
  }
  async _existingMintedChatResult(session, sessionId, backing, includeSessionMetadata) {
    const result = this._chatBackingResult(sessionId, backing);
    if (!includeSessionMetadata) {
      return result;
    }
    const metadata = await this._readStoredSessionMetadata(session);
    return {
      ...metadata?.workingDirectory ? { resolvedWorkingDirectory: metadata.workingDirectory } : {},
      ...metadata?.project ? { project: metadata.project } : {},
      ...result
    };
  }
  /** Resolves the live session for an addressed chat from exact recorded backings. */
  async _ensureResolvedChatSession(context, workingDirectories) {
    const provisional = this._provisionalSessions.get(context.configurationId);
    if (provisional && provisional.sdkSessionId === context.sdkSessionId) {
      return this._materializeProvisional(context.configurationId, workingDirectories);
    }
    if (context.sdkSessionId === context.configurationId) {
      return context.target ?? this._resumeSession(context.configurationId, context.chat, workingDirectories);
    }
    if (context.sdkSessionId) {
      const lifetime = this._getOrCreateSessionLifetime(context.sdkSessionId);
      const lease = await lifetime?.acquire();
      if (!lease) {
        return void 0;
      }
      try {
        const target = this._findChatByUri(context.chat);
        if (target) {
          return target;
        }
        return this._resolveOrResumeChatSession(context, workingDirectories);
      } finally {
        lease.dispose();
      }
    }
    return context.target;
  }
  /**
   * Forks {@link sourceEntry}'s SDK chat at {@link turnId} via the
   * SDK `sessions.fork` RPC and copies its database into {@link targetDbDir}
   * so the forked chat inherits turn event IDs and file-edit
   * snapshots. Returns the new SDK session id.
   */
  async _forkSdkChat(client, sourceEntry, turnId, targetDbDir) {
    const sourceTurns = await sourceEntry.getMessages();
    const sourceTurnIndex = sourceTurns.findIndex((turn) => turn.id === turnId);
    if (sourceTurnIndex === -1) {
      this._logService.warn(`[Copilot] fork: turn ${turnId} not found in source session ${sourceEntry.sessionId}; inheriting all ${sourceTurns.length} turns`);
    }
    const inheritedTurnIndex = sourceTurnIndex === -1 ? sourceTurns.length - 1 : sourceTurnIndex;
    const inheritedTurnId = sourceTurns[inheritedTurnIndex]?.id;
    let toEventId;
    try {
      toEventId = await sourceEntry.getForkBoundaryEventId(turnId);
    } catch (err) {
      throw new Error(`[Copilot] fork: failed to resolve fork boundary for turn ${turnId} in source session ${sourceEntry.sessionId} because ${getErrorMessage(err)}`);
    }
    const forkResult = await client.rpc.sessions.fork({
      sessionId: sourceEntry.sessionId,
      ...toEventId ? { toEventId } : {}
    });
    const newSessionId = forkResult.sessionId;
    const targetDbPath = URI.joinPath(targetDbDir, SESSION_DB_FILENAME);
    try {
      const sourceDbRef = await this._sessionDataService.tryOpenDatabase(sourceEntry.sessionUri);
      if (sourceDbRef) {
        try {
          await fs6.mkdir(targetDbDir.fsPath, { recursive: true });
          await fs6.rm(targetDbPath.fsPath, { force: true });
          await sourceDbRef.object.vacuumInto(targetDbPath.fsPath);
        } finally {
          sourceDbRef.dispose();
        }
      }
    } catch (err) {
      this._logService.warn(`[Copilot] Failed to copy session database for chat fork: ${err instanceof Error ? err.message : String(err)}`);
    }
    return { sessionId: newSessionId, inheritedTurnId };
  }
  async _disposeChat(chat, operationContext) {
    const initial = this._resolveChatContext(chat, operationContext);
    const lifetimeId = initial.sdkSessionId ?? initial.configurationId;
    const lifetime = this._getOrCreateSessionLifetime(lifetimeId);
    if (!lifetime) {
      return;
    }
    let finalize;
    await lifetime.release(async () => {
      finalize = await this._disposeChatCoordinated(chat, operationContext);
    });
    if (finalize) {
      await this._finalizeConfigurationScope(finalize.scope, finalize.scopeId, finalize.workspacelessHint);
    }
  }
  async _disposeChatCoordinated(chat, operationContext) {
    const chatKey = chat.toString();
    const initial = this._resolveChatContext(chat, operationContext);
    const configurationId = initial.configurationId;
    return this._queueChat(configurationId, initial.sequencerKey, async () => {
      const current = this._resolveChatContext(chat, operationContext);
      const target = current.target;
      const backing = this._chatBackings.get(chatKey);
      const provisional = this._provisionalSessions.get(configurationId);
      const isProvisional = provisional?.chat.toString() === chatKey;
      const sdkSessionId = target?.sessionId ?? backing?.sdkSessionId;
      const workspacelessHint = provisional?.workspaceless === true;
      if (sdkSessionId && !isProvisional) {
        await this._deleteSdkSession(sdkSessionId, chatKey);
      }
      if (isProvisional) {
        this._provisionalSessions.delete(configurationId);
      }
      this._chatBackings.delete(chatKey);
      this._chatScopes.delete(chatKey);
      this._chatStorageScopes.delete(chatKey);
      if (target) {
        await this._destroyLiveSession(target, true);
      }
      this._otelService.releaseSessionTraceContext(current.resource.toString());
      this._activeClients.get(current.configurationResource)?.removeChat(chat);
      if (this._remainingChatsForScope(current.configurationResource) === 0) {
        return { scope: current.configurationResource, scopeId: configurationId, workspacelessHint };
      }
      return void 0;
    });
  }
  /**
   * Deletes an SDK session, tolerating one that was already removed. The SDK's
   * `deleteSession` throws for both a genuine failure and a missing session, so
   * a real failure is propagated (preserving routing/state for a retry) while a
   * confirmed-gone session is swallowed to keep a partially-completed multi-chat
   * teardown retry-safe.
   */
  async _deleteSdkSession(sdkSessionId, chatKey) {
    const client = await this._ensureClient();
    try {
      await client.deleteSession(sdkSessionId);
    } catch (err) {
      if (await client.getSessionMetadata(sdkSessionId).then((metadata) => !!metadata, () => true)) {
        throw err;
      }
      this._logService.info(`[Copilot] SDK session ${sdkSessionId} already deleted; chat ${chatKey} disposal is idempotent`);
    }
  }
  async _canReleaseChat(chat, operationContext) {
    const target = this._resolveChatContext(chat, operationContext).target;
    if (!target) {
      return true;
    }
    if (target.hasActiveTurn) {
      return false;
    }
    if (await target.hasRunningDetachedShells()) {
      this._logService.info(`[Copilot:${target.sessionId}] Deferring idle release while a detached shell is running`);
      return false;
    }
    return true;
  }
  async _releaseChat(chat, operationContext) {
    const initial = this._resolveChatContext(chat, operationContext);
    const lifetime = this._getOrCreateSessionLifetime(initial.sdkSessionId ?? initial.configurationId);
    if (!lifetime) {
      return;
    }
    await lifetime.release(async () => {
      const target = this._resolveChatContext(chat, operationContext).target;
      if (!target || target.hasActiveTurn) {
        return;
      }
      await this._destroyLiveSession(target, true);
    });
  }
  /**
   * Re-attaches a concrete chat backing on session
   * restore, decoding the opaque `providerData` the orchestrator persisted
   * at creation (or the latest {@link onDidChangeChatData}). After this
   * resolves the chat's backing SDK session can be resumed lazily on its first
   * send. Best-effort — a corrupt/unknown blob is logged and dropped rather
   * than thrown.
   */
  async materializeChat(chat, context, providerData) {
    this._noteHostCustomizations(context);
    const resolved = resolveAgentChatContext(context, chat);
    this._rememberChatScope(chat, resolved.configurationResource, resolved.resource);
    const chatKey = chat.toString();
    if (providerData === void 0) {
      if (!isDefaultChatUri(chat)) {
        return;
      }
      const backing2 = { sdkSessionId: AgentSession.id(resolved.configurationResource) };
      this._chatBackings.set(chatKey, backing2);
      return { providerData: encodeProviderData(backing2) };
    }
    const backing = decodeProviderData(providerData);
    if (!backing) {
      this._logService.warn(`[Copilot] materializeChat: dropping corrupt providerData for ${chatKey}`);
      return;
    }
    this._chatBackings.set(chatKey, backing);
  }
  async recoverLegacyChat(chat, context) {
    const resolved = resolveAgentChatContext(context, chat);
    this._rememberChatScope(chat, resolved.configurationResource, resolved.resource);
    const backing = { sdkSessionId: AgentSession.id(resolved.configurationResource) };
    this._chatBackings.set(chat.toString(), backing);
    return { providerData: encodeProviderData(backing) };
  }
  /**
   * Migration-only enumeration of the session's legacy chat backings from
   * `copilot.chats`, mapping each entry to its channel URI and the same opaque
   * `providerData` blob {@link materializeChat} decodes. The orchestrator
   * calls this once to drain the legacy codec into its own catalog.
   */
  async listLegacyChatBackings(configurationResource) {
    const persisted = await this._readLegacyChatBackings(configurationResource);
    const result = [];
    for (const [chatId, info] of persisted) {
      result.push({ uri: URI.parse(buildChatUri(configurationResource, chatId)), providerData: encodeProviderData(info) });
    }
    return result;
  }
  _getOrCreateSessionLifetime(sessionId) {
    if (this._isShuttingDown) {
      return void 0;
    }
    let lifetime = this._sessionLifetimes.get(sessionId);
    if (!lifetime) {
      lifetime = new CopilotSessionLifetime();
      this._sessionLifetimes.set(sessionId, lifetime);
    }
    return lifetime;
  }
  _resetSessionLifetime(sessionId) {
    if (!this._isShuttingDown && this._sessionLifetimes.get(sessionId)?.isPermanentlyClosed) {
      this._sessionLifetimes.set(sessionId, new CopilotSessionLifetime());
    }
  }
  _queueSession(sessionId, task) {
    const lifetime = this._getOrCreateSessionLifetime(sessionId);
    return lifetime ? lifetime.queueSession(task) : Promise.reject(new CancellationError());
  }
  _queueChat(sessionId, chatKey, task) {
    const lifetime = this._getOrCreateSessionLifetime(sessionId);
    return lifetime ? lifetime.queueChat(chatKey, task) : Promise.reject(new CancellationError());
  }
  /** Returns the live session for an exact chat, resuming it if necessary. */
  async _resolveOrResumeChatSession(context, workingDirectories) {
    const { configurationResource, configurationId, chat, chatKey } = context;
    const existing = this._findChatByUri(chat);
    if (existing) {
      return existing;
    }
    const lifetime = this._getOrCreateSessionLifetime(context.sdkSessionId ?? configurationId);
    if (!lifetime) {
      return void 0;
    }
    return lifetime.resumePeer(chatKey, async () => {
      const lease = await lifetime.acquire();
      if (!lease) {
        return void 0;
      }
      let agentSession;
      try {
        const again = this._findChatByUri(chat);
        if (again) {
          return again;
        }
        const info = this._chatBackings.get(chatKey);
        if (!info) {
          return void 0;
        }
        const parentEntry = this._findSessionBySdkId(configurationId);
        const persistedWorkingDirectory = workingDirectories?.[0] ?? parentEntry?.workingDirectory ?? this._provisionalSessions.get(configurationId)?.workingDirectory ?? (await this._readSessionMetadata(configurationResource)).workingDirectory;
        if (!persistedWorkingDirectory) {
          this._logService.warn(`[Copilot] Cannot resume chat ${chatKey}: missing working directory`);
          return void 0;
        }
        const workingDirectory = await this._worktree.resolveWorkingDirectoryForResume(configurationResource, AgentSession.id(configurationResource), persistedWorkingDirectory);
        const launchWorkingDirectories = workingDirectories ? [workingDirectory, ...workingDirectories.slice(1)] : void 0;
        const client = await this._ensureClient();
        const activeClient = this._getOrCreateActiveClient(configurationResource, workingDirectory);
        activeClient.pluginController.reanchor(workingDirectory);
        const snapshot = await activeClient.snapshot(chatKey);
        const shellManager = this._instantiationService.createInstance(ShellManager, chat, workingDirectory);
        const launchPlan = {
          kind: "resume",
          client,
          sessionId: info.sdkSessionId,
          workingDirectory,
          additionalDirectories: launchWorkingDirectories?.slice(1),
          resolvedAgentName: info.agent ? this._resolveAgentName(snapshot, info.agent) : void 0,
          snapshot,
          disabledRootMcpServers: await this._disabledRootMcpServers(configurationResource, info.sdkSessionId, snapshot),
          activeClientToolSet: activeClient.toolSet,
          shellManager,
          githubToken: this._githubToken,
          fallback: { model: info.model, longContextWindow: this._longContextWindowFor(info.model?.id), freeLongContext: this._isFreeLongContext(info.model?.id) }
        };
        agentSession = this._createAgentSession(launchPlan, workingDirectory, activeClient, { sessionUri: configurationResource, chatChannelUri: chat, resource: context.resource });
        await agentSession.initializeSession();
        this._throwIfClientReplaced(client, agentSession);
        this._registerLiveChat(chat, agentSession, activeClient);
        if (launchWorkingDirectories) {
          await this._storeSessionMetadata(context.resource, info.model, workingDirectory, launchWorkingDirectories, void 0, void 0);
        }
        this._logService.info(`[Copilot] Resumed chat backing ${chatKey} for configuration ${configurationResource.toString()}`);
        return agentSession;
      } catch (error) {
        agentSession?.dispose();
        this._logService.warn(`[Copilot] Failed to resume chat backing ${chatKey}: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      } finally {
        lease.dispose();
      }
    });
  }
  async truncateChat(chat, turnId, context) {
    const resolved = this._resolveTruncateChatContext(chat, context);
    const sessionId = resolved.configurationId;
    if (this._provisionalSessions.get(sessionId)?.chat.toString() === chat.toString()) {
      return;
    }
    await this._queueChat(resolved.configurationId, resolved.sequencerKey, async () => {
      const current = this._resolveTruncateChatContext(chat, context);
      this._logService.info(`[Copilot:${sessionId}] Truncating chat ${chat.toString()}${turnId !== void 0 ? ` at turnId=${turnId}` : " (all turns)"}`);
      const entry = await this._ensureResolvedChatSession(current);
      if (!entry) {
        this._logService.info(`[Copilot:${sessionId}] No chat entry resolved for truncation; nothing to truncate`);
        return;
      }
      let eventId;
      if (turnId) {
        eventId = await entry.getNextTurnEventId(turnId);
      } else {
        eventId = await entry.getFirstTurnEventId();
      }
      if (eventId) {
        await entry.truncateAtEventId(eventId, turnId);
      } else {
        this._logService.info(`[Copilot:${sessionId}] No event ID found for truncation, nothing to truncate`);
      }
      this._logService.info(`[Copilot:${sessionId}] Session truncated`);
    });
  }
  async _changeModel(chat, model, operationContext) {
    try {
      await this._changeModelOnce(chat, model, operationContext);
    } catch (error) {
      if (!await this._handleClientOperationFailure(error, "changeModel", this._clientFailureCorrelation(chat, void 0, operationContext))) {
        throw error;
      }
      await this._changeModelOnce(chat, model, operationContext);
    }
  }
  async _changeModelOnce(chat, model, operationContext) {
    const context = this._resolveChatContext(chat, operationContext);
    await this._queueChat(context.configurationId, context.sequencerKey, async () => {
      const current = this._resolveChatContext(chat, operationContext);
      const longContextWindow = this._longContextWindowFor(model.id);
      const freeLongContext = this._isFreeLongContext(model.id);
      const provisional = this._provisionalSessions.get(current.configurationId);
      if (provisional) {
        provisional.model = model;
      } else {
        const entry = current.target ?? await this._ensureResolvedChatSession(current);
        await entry?.setModel(model.id, resolveCopilotReasoningEffort(model, this._configurationService, this._logService, current.configurationId), getCopilotContextTier(model, longContextWindow, freeLongContext));
        if (current.resource.toString() === current.configurationResource.toString()) {
          await this._storeSessionMetadata(current.resource, model, void 0, void 0, void 0, void 0);
        }
      }
      const backing = this._chatBackings.get(current.chatKey);
      if (backing) {
        const updated = { ...backing, model };
        this._chatBackings.set(current.chatKey, updated);
        this._onDidChangeChatData.fire({ chat, providerData: encodeProviderData(updated) });
      }
    });
  }
  async _changeAgent(chat, agent, operationContext) {
    try {
      await this._changeAgentOnce(chat, agent, operationContext);
    } catch (error) {
      if (!await this._handleClientOperationFailure(error, "changeAgent", this._clientFailureCorrelation(chat, void 0, operationContext))) {
        throw error;
      }
      await this._changeAgentOnce(chat, agent, operationContext);
    }
  }
  async _changeAgentOnce(chat, agent, operationContext) {
    const context = this._resolveChatContext(chat, operationContext);
    await this._queueChat(context.configurationId, context.sequencerKey, async () => {
      const current = this._resolveChatContext(chat, operationContext);
      const provisional = this._provisionalSessions.get(current.configurationId);
      if (provisional) {
        provisional.agent = agent;
      } else {
        const entry = current.target ?? await this._ensureResolvedChatSession(current);
        if (entry) {
          const resolvedAgentName = agent ? this._resolveAgentName(entry.appliedSnapshot, agent) : void 0;
          await entry.setAgent(resolvedAgentName);
        }
      }
      const backing = this._chatBackings.get(current.chatKey);
      if (backing) {
        const updated = { ...backing, ...agent ? { agent } : { agent: void 0 } };
        this._chatBackings.set(current.chatKey, updated);
        this._onDidChangeChatData.fire({ chat, providerData: encodeProviderData(updated) });
      }
    });
  }
  async shutdown() {
    if (!this._shutdownPromise) {
      this._isShuttingDown = true;
      for (const lifetime of this._sessionLifetimes.values()) {
        void lifetime.close();
      }
      this._shutdownPromise = (async () => {
        this._modelCatalogGeneration++;
        this._modelRefreshSchedule.clear();
        this._scheduledModelRefresh?.deferred.complete();
        this._scheduledModelRefresh = void 0;
        this._modelRefreshRetry.clear();
        this._logService.info("[Copilot] Shutting down...");
        await Promise.all([...this._sessionLifetimes.values()].map((lifetime) => lifetime.close()));
        for (const session of this._allLiveSessions()) {
          await this._destroyLiveSession(session);
        }
        await this._stopClient();
        this._sessionLifetimes.clear();
      })();
    }
    return this._shutdownPromise;
  }
  respondToPermissionRequest(requestId, approved) {
    for (const chat of this._allLiveSessions()) {
      if (chat.respondToPermissionRequest(requestId, approved)) {
        return;
      }
    }
  }
  respondToUserInputRequest(requestId, response, answers) {
    for (const chat of this._allLiveSessions()) {
      if (chat.respondToUserInputRequest(requestId, response, answers)) {
        return;
      }
    }
  }
  /**
   * Returns true if this provider owns the given session ID. Includes
   * provisional sessions that have not yet been materialized.
   */
  hasSession(session) {
    const sessionId = AgentSession.id(session);
    return this._chatEntriesBySdkId.has(sessionId) || this._provisionalSessions.has(sessionId);
  }
  // ---- helpers ------------------------------------------------------------
  /**
   * Returns the effective Kerberos proxy SPN, treating an empty setting as absent.
   */
  _readKerberosSpn(env2) {
    const spn = env2["COPILOT_PROXY_KERBEROS_SPN"] || this._configurationService.getRootValue(agentHostProxyConfigSchema, AgentHostProxyConfigKey.ProxyKerberosServicePrincipal);
    return spn || void 0;
  }
  _applyProxyEnv(env2) {
    const proxy = this._isSystemProxyEnabled() ? this._resolvedProxy : void 0;
    this._appliedProxy = proxy;
    if (proxy) {
      for (const key of COPILOT_PROXY_SET_ENV_KEYS) {
        env2[key] = proxy;
      }
      this._logService.info("[Copilot] Resolved CAPI proxy and forwarded HTTP_PROXY/HTTPS_PROXY to Copilot SDK");
    }
    const kerberosSpn = this._readKerberosSpn(env2);
    this._appliedProxyKerberosSpn = kerberosSpn;
    if (kerberosSpn && !env2["COPILOT_PROXY_KERBEROS_SPN"]) {
      env2["COPILOT_PROXY_KERBEROS_SPN"] = kerberosSpn;
    }
  }
  async _resolveProxyForSdk(env2 = process.env) {
    if (!this._isSystemProxyEnabled()) {
      return void 0;
    }
    if (COPILOT_PROXY_ENV_KEYS.some((key) => env2[key])) {
      this._logService.debug("[Copilot] Proxy env var already set; leaving Copilot SDK proxy configuration to the environment");
      return void 0;
    }
    let capiUrl = env2["VSCODE_AGENT_HOST_CAPI_URL_OVERRIDE"] || COPILOT_CAPI_URL;
    if (this._githubToken) {
      try {
        const discovered = await this._copilotApiService.resolveApiEndpoint(this._githubToken);
        if (discovered) {
          capiUrl = discovered;
        }
      } catch (error) {
        this._logService.debug(`[Copilot] CAPI endpoint discovery for proxy resolution failed; using ${capiUrl}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    try {
      return await this._proxyResolver.resolveProxy(capiUrl);
    } catch (error) {
      this._logService.warn(`[Copilot] Failed to resolve CAPI proxy for ${capiUrl}: ${error instanceof Error ? error.message : String(error)}`);
      return void 0;
    }
  }
  _refreshProxy() {
    const generation = ++this._proxyResolutionGeneration;
    const refresh = this._resolveProxyForSdk().then(async (proxy) => {
      if (generation !== this._proxyResolutionGeneration) {
        return;
      }
      this._resolvedProxy = proxy;
      const effectiveProxy = this._isSystemProxyEnabled() ? proxy : void 0;
      const effectiveKerberosSpn = this._readKerberosSpn(process.env);
      if (effectiveProxy === this._appliedProxy && effectiveKerberosSpn === this._appliedProxyKerberosSpn) {
        return;
      }
      if (this._clientStarting) {
        try {
          await this._clientStarting;
        } catch {
          return;
        }
        if (generation !== this._proxyResolutionGeneration || effectiveProxy === this._appliedProxy && effectiveKerberosSpn === this._appliedProxyKerberosSpn) {
          return;
        }
      }
      const changes = [];
      if (effectiveProxy !== this._appliedProxy) {
        changes.push(`proxy ${this._appliedProxy ?? "(none)"} -> ${effectiveProxy ?? "(none)"}`);
      }
      if (effectiveKerberosSpn !== this._appliedProxyKerberosSpn) {
        changes.push("Kerberos SPN changed");
      }
      await this._requestClientRestart(`CAPI proxy configuration changed (${changes.join(", ")})`);
    }).catch((error) => this._logService.error("[Copilot] Failed to refresh CAPI proxy", error));
    this._proxyRefresh = refresh;
    void refresh.finally(() => {
      if (this._proxyRefresh === refresh) {
        this._proxyRefresh = void 0;
      }
    });
  }
  _getOrCreateActiveClient(session, directory) {
    let client = this._activeClients.get(session);
    if (!client) {
      const pluginController = this._plugins.createSessionController(session, directory, () => this._retainedHostCustomizations(session));
      client = this._instantiationService.createInstance(ActiveClient, session, pluginController, this._onDidChatProgress);
      this._activeClients.set(session, client);
    } else if (directory) {
      client.pluginController.setDirectory(directory);
    }
    return client;
  }
  /** Instantiates a session; the caller must initialize and register it on success. */
  _createAgentSession(launchPlan, customizationDirectory, activeClient, identity2) {
    const sessionUri = identity2?.sessionUri ?? AgentSession.uri(this.id, launchPlan.sessionId);
    const chatChannelUri = identity2?.chatChannelUri ?? this._findBoundSessionChatUri(launchPlan.sessionId) ?? URI.parse(buildDefaultChatUri(sessionUri));
    const agentSession = this._instantiationService.createInstance(
      CopilotAgentSession,
      {
        sessionUri,
        chatChannelUri,
        ...identity2?.resource ? { resource: identity2.resource } : {},
        rawSessionId: launchPlan.sessionId,
        onDidSessionProgress: this._onDidChatProgress,
        sessionLauncher: this._sessionLauncher,
        launchPlan,
        shellManager: launchPlan.shellManager,
        workingDirectory: launchPlan.workingDirectory,
        customizationDirectory,
        clientSnapshot: launchPlan.snapshot,
        activeClientToolSet: launchPlan.activeClientToolSet,
        // Evaluate membership against the session's chat channel.
        clientReachesChat: (clientId, chat) => activeClient.contributesTo(clientId, chat.toString()),
        // MCP reconcile has no host call of its own, so read the retained host snapshot lazily.
        hostCustomizations: () => this._retainedHostCustomizations(sessionUri),
        serverToolHost: this._serverToolHost,
        isLaunchTokenCurrent: () => this._githubToken === launchPlan.githubToken,
        onTurnEnded: () => this._onChatTurnEnded()
      }
    );
    return agentSession;
  }
  /** Resolves root-configured MCP servers that must be disabled when the SDK session starts. */
  async _disabledRootMcpServers(session, sessionId, snapshot) {
    await this._customizationEnablementService.initializeSession(session.toString());
    const serverNames = new Set(Object.keys(snapshot.mcpServers));
    if (this._isGitHubMcpServerEnabled()) {
      serverNames.add(GITHUB_MCP_SERVER_NAME);
    }
    const rootServers = [...serverNames].map((name) => {
      const id2 = buildMcpTopLevelCustomizationId(this.id, sessionId, name);
      return {
        type: "mcpServer" /* McpServer */,
        id: id2,
        uri: id2,
        name,
        state: { kind: "stopped" /* Stopped */ }
      };
    });
    const enablement = getSdkMcpServerEnablement(resolveCustomizationEnablement(
      this._customizationEnablementService,
      session,
      rootServers
    ));
    return rootServers.filter((server) => enablement.get(server.id) !== true).map((server) => server.name);
  }
  _createChatEntry(session, activeClient) {
    return new CopilotChatEntry(session, activeClient, this._onMcpNotification, () => this._handleCopilotSessionAuthRequired());
  }
  _registerLiveChat(chat, session, activeClient) {
    const current = this._chatBackings.get(chat.toString());
    this._chatEntriesBySdkId.deleteAndDispose(session.sessionId);
    this._chatEntriesBySdkId.set(session.sessionId, this._createChatEntry(session, activeClient));
    this._chatBackings.set(chat.toString(), { ...current, sdkSessionId: session.sessionId });
  }
  _registerUnboundSession(session, activeClient) {
    this._chatEntriesBySdkId.deleteAndDispose(session.sessionId);
    this._chatEntriesBySdkId.set(session.sessionId, this._createChatEntry(session, activeClient));
  }
  /** Rejects a session initialized by a client that was stopped or replaced during launch. */
  _throwIfClientReplaced(client, agentSession) {
    if (this._shutdownPromise || this._client !== client) {
      agentSession.dispose();
      throw new CancellationError();
    }
  }
  _registerInitializedSession(sessionId, agentSession, activeClient, client) {
    this._throwIfClientReplaced(client, agentSession);
    const boundChat = this._findBoundSessionChatUri(sessionId);
    if (boundChat) {
      this._registerLiveChat(boundChat, agentSession, activeClient);
      return;
    }
    this._registerUnboundSession(agentSession, activeClient);
  }
  async _destroyLiveSession(chatSession, preserveRouting = false) {
    try {
      await chatSession.destroySession();
    } catch (error) {
      this._logService.warn(`[Copilot:${chatSession.sessionId}] Failed to destroy session before cleanup: ${error instanceof Error ? error.message : String(error)}`);
    }
    const chatChannelUri = chatSession.chatChannelUri;
    if (!preserveRouting && chatChannelUri && this._chatBackings.get(chatChannelUri.toString())?.sdkSessionId === chatSession.sessionId) {
      this._chatBackings.delete(chatChannelUri.toString());
    }
    this._chatEntriesBySdkId.deleteAndDispose(chatSession.sessionId);
  }
  _allLiveSessions() {
    return [...this._chatEntriesBySdkId.values()].map((entry) => entry.chatSession);
  }
  _resumeSession(sessionId, chatChannelUri, workingDirectories) {
    if (chatChannelUri) {
      this._chatBackings.set(chatChannelUri.toString(), { sdkSessionId: sessionId });
    }
    const lifetime = this._getOrCreateSessionLifetime(sessionId);
    if (!lifetime) {
      return Promise.reject(new CancellationError());
    }
    return lifetime.resumeDefault(async () => {
      const lease = await lifetime.acquire();
      if (!lease) {
        throw new CancellationError();
      }
      try {
        return await this._doResumeSession(sessionId, workingDirectories);
      } finally {
        lease.dispose();
      }
    });
  }
  async _doResumeSession(sessionId, workingDirectories) {
    this._logService.info(`[Copilot:${sessionId}] _resumeSession called \u2014 session not in memory, resuming...`);
    const client = await this._ensureClient();
    const sessionUri = AgentSession.uri(this.id, sessionId);
    const storedMetadata = await this._readSessionMetadata(sessionUri);
    const sessionMetadata = await client.getSessionMetadata(sessionId).catch((err) => {
      this._logService.warn(`[Copilot:${sessionId}] getSessionMetadata failed`, err);
      return void 0;
    });
    const workingDirectory = storedMetadata.workingDirectory ?? (typeof sessionMetadata?.context?.workingDirectory === "string" ? URI.file(sessionMetadata.context.workingDirectory) : void 0);
    if (!workingDirectory) {
      throw new Error(`workingDirectory is required to resume Copilot session '${sessionId}'`);
    }
    let resolvedWorkingDirectory = workingDirectory;
    if (storedMetadata.workspaceless) {
      await this._ensureWorkspacelessScratchDir(workingDirectory, sessionId);
    } else {
      resolvedWorkingDirectory = await this._worktree.resolveWorkingDirectoryForResume(sessionUri, AgentSession.id(sessionUri), workingDirectory);
    }
    const customizationDirectory = resolvedWorkingDirectory;
    const activeClient = this._getOrCreateActiveClient(sessionUri, customizationDirectory);
    activeClient.pluginController.reanchor(customizationDirectory);
    const launchWorkingDirectories = workingDirectories ?? storedMetadata.workingDirectories;
    activeClient.pluginController.setAdditionalDirectories(this._additionalCustomizationDirectories(launchWorkingDirectories));
    const snapshot = await activeClient.snapshot(this._findBoundSessionChatUri(sessionId)?.toString());
    const shellManager = this._instantiationService.createInstance(ShellManager, sessionUri, resolvedWorkingDirectory);
    const resolvedAgentName = storedMetadata.agent ? this._resolveAgentName(snapshot, storedMetadata.agent) : void 0;
    if (storedMetadata.agent && !resolvedAgentName) {
      this._logService.info(`[Copilot:${sessionId}] Stored custom agent is not available in the current plugin snapshot; resuming without a custom agent`);
    }
    const launchPlan = {
      kind: "resume",
      client,
      sessionId,
      workingDirectory: resolvedWorkingDirectory,
      additionalDirectories: this._additionalCustomizationDirectories(launchWorkingDirectories),
      resolvedAgentName,
      snapshot,
      disabledRootMcpServers: await this._disabledRootMcpServers(sessionUri, sessionId, snapshot),
      activeClientToolSet: activeClient.toolSet,
      shellManager,
      githubToken: this._githubToken,
      workspaceless: storedMetadata.workspaceless,
      fallback: {
        model: storedMetadata.model,
        longContextWindow: this._longContextWindowFor(storedMetadata.model?.id),
        freeLongContext: this._isFreeLongContext(storedMetadata.model?.id)
      }
    };
    const agentSession = this._createAgentSession(launchPlan, customizationDirectory, activeClient);
    try {
      await agentSession.initializeSession();
      await this._storeSessionMetadata(sessionUri, void 0, void 0, launchWorkingDirectories, void 0, void 0);
      this._registerInitializedSession(sessionId, agentSession, activeClient, launchPlan.client);
    } catch (err) {
      agentSession.dispose();
      throw err;
    }
    return agentSession;
  }
  static {
    // ---- session metadata persistence --------------------------------------
    this._META_MODEL = "copilot.model";
  }
  static {
    this._META_AGENT = "copilot.agent";
  }
  static {
    this._META_CWD = "copilot.workingDirectory";
  }
  static {
    /** Persisted ordered working-directory set (JSON array of URI strings; index 0 = primary). */
    this._META_CWDS = "copilot.workingDirectories";
  }
  static {
    this._META_CUSTOMIZATION_DIRECTORY = "copilot.customizationDirectory";
  }
  static {
    this._META_PROJECT_RESOLVED = "copilot.project.resolved";
  }
  static {
    this._META_PROJECT_URI = "copilot.project.uri";
  }
  static {
    this._META_PROJECT_DISPLAY_NAME = "copilot.project.displayName";
  }
  static {
    /** Legacy persisted catalog of concrete chat backings, keyed by chatId. */
    this._META_CHATS = "copilot.chats";
  }
  /** Reads the legacy `copilot.chats` migration codec retained for pre-providerData sessions. */
  async _readLegacyChatBackings(session) {
    const ref = await this._sessionDataService.tryOpenDatabase(session);
    if (!ref) {
      return /* @__PURE__ */ new Map();
    }
    try {
      const raw = await ref.object.getMetadata(CopilotAgent._META_CHATS);
      if (!raw) {
        return /* @__PURE__ */ new Map();
      }
      const parsed = JSON.parse(raw);
      const result = /* @__PURE__ */ new Map();
      for (const [chatId, value] of Object.entries(parsed)) {
        if (!value || typeof value !== "object") {
          continue;
        }
        const { sdkSessionId, model } = value;
        if (typeof sdkSessionId !== "string" || !sdkSessionId) {
          continue;
        }
        result.set(chatId, { sdkSessionId, ...model ? { model } : {} });
      }
      return result;
    } catch (err) {
      this._logService.warn(`[Copilot] Failed to read persisted chats for ${session.toString()}: ${err instanceof Error ? err.message : String(err)}`);
      return /* @__PURE__ */ new Map();
    } finally {
      ref.dispose();
    }
  }
  async _storeSessionMetadata(session, model, workingDirectory, workingDirectories, customizationDirectory, project, projectResolved = project !== void 0, configValues, customTitle, markRead, archived, ehcliAdopted) {
    const dbRef = this._sessionDataService.openDatabase(session);
    const db = dbRef.object;
    try {
      const work = [];
      if (model) {
        work.push(db.setMetadata(CopilotAgent._META_MODEL, this._serializeModelSelection(model)));
      }
      if (markRead) {
        work.push(db.setMetadata(AH_META_IS_READ_DB_KEY, "true"));
      }
      if (archived) {
        work.push(db.setMetadata(AH_META_IS_ARCHIVED_DB_KEY, "true"));
      }
      if (ehcliAdopted) {
        work.push(db.setMetadata(AH_META_EHCLI_ADOPTED_DB_KEY, "true"));
      }
      if (workingDirectory) {
        work.push(db.setMetadata(CopilotAgent._META_CWD, workingDirectory.toString()));
      }
      if (workingDirectories) {
        work.push(db.setMetadata(CopilotAgent._META_CWDS, JSON.stringify(workingDirectories.map((d) => d.toString()))));
      }
      if (customizationDirectory) {
        work.push(db.setMetadata(CopilotAgent._META_CUSTOMIZATION_DIRECTORY, customizationDirectory.toString()));
      }
      if (projectResolved) {
        work.push(db.setMetadata(CopilotAgent._META_PROJECT_RESOLVED, "true"));
      }
      if (project) {
        work.push(db.setMetadata(CopilotAgent._META_PROJECT_URI, project.uri.toString()));
        work.push(db.setMetadata(CopilotAgent._META_PROJECT_DISPLAY_NAME, project.displayName));
      }
      if (configValues) {
        work.push(db.setMetadata("configValues", JSON.stringify(configValues)));
      }
      if (customTitle) {
        work.push(db.setMetadata("customTitle", customTitle));
      }
      await Promise.all(work);
    } finally {
      dbRef.dispose();
    }
  }
  /**
   * Parses the persisted ordered working-directory set. Prefers the JSON
   * `_META_CWDS` array when present and valid, otherwise falls back to the
   * single legacy `_META_CWD` value. A malformed blob (the metadata store is
   * client-influenced and may be corrupt) is ignored in favour of the legacy
   * fallback so it can never reject the caller.
   */
  _parseWorkingDirectories(rawSet, fallback) {
    if (rawSet) {
      try {
        const parsed = JSON.parse(rawSet);
        if (Array.isArray(parsed)) {
          const dirs = parsed.filter((d) => typeof d === "string" && d.length > 0).map((d) => URI.parse(d));
          if (dirs.length > 0) {
            return dirs;
          }
        }
      } catch {
      }
    }
    return fallback ? [fallback] : void 0;
  }
  async _readSessionMetadata(session) {
    const ref = await this._sessionDataService.tryOpenDatabase(session);
    if (!ref) {
      return {};
    }
    try {
      const m = await ref.object.getMetadataObject({
        [CopilotAgent._META_MODEL]: true,
        [CopilotAgent._META_AGENT]: true,
        [CopilotAgent._META_CWD]: true,
        [CopilotAgent._META_CWDS]: true,
        [CopilotAgent._META_CUSTOMIZATION_DIRECTORY]: true,
        [AH_META_WORKSPACELESS_DB_KEY]: true
      });
      const cwd3 = m[CopilotAgent._META_CWD];
      const customizationDirectory = m[CopilotAgent._META_CUSTOMIZATION_DIRECTORY];
      const workingDirectory = cwd3 ? URI.parse(cwd3) : void 0;
      return {
        model: this._parseModelSelection(m[CopilotAgent._META_MODEL]),
        agent: this._parseAgentSelection(m[CopilotAgent._META_AGENT]),
        workingDirectory,
        workingDirectories: this._parseWorkingDirectories(m[CopilotAgent._META_CWDS], workingDirectory),
        customizationDirectory: customizationDirectory ? URI.parse(customizationDirectory) : void 0,
        workspaceless: m[AH_META_WORKSPACELESS_DB_KEY] === "true"
      };
    } finally {
      ref.dispose();
    }
  }
  async _readStoredSessionMetadata(session) {
    const ref = await this._sessionDataService.tryOpenDatabase(session);
    if (!ref) {
      return void 0;
    }
    try {
      const m = await ref.object.getMetadataObject({
        [CopilotAgent._META_MODEL]: true,
        [CopilotAgent._META_AGENT]: true,
        [CopilotAgent._META_CWD]: true,
        [CopilotAgent._META_CWDS]: true,
        [CopilotAgent._META_CUSTOMIZATION_DIRECTORY]: true,
        [CopilotAgent._META_PROJECT_RESOLVED]: true,
        [CopilotAgent._META_PROJECT_URI]: true,
        [CopilotAgent._META_PROJECT_DISPLAY_NAME]: true,
        [AH_META_WORKSPACELESS_DB_KEY]: true
      });
      const cwd3 = m[CopilotAgent._META_CWD];
      const customizationDirectory = m[CopilotAgent._META_CUSTOMIZATION_DIRECTORY];
      const resolved = m[CopilotAgent._META_PROJECT_RESOLVED];
      const uri = m[CopilotAgent._META_PROJECT_URI];
      const displayName = m[CopilotAgent._META_PROJECT_DISPLAY_NAME];
      const workspaceless = m[AH_META_WORKSPACELESS_DB_KEY];
      if ([m[CopilotAgent._META_MODEL], m[CopilotAgent._META_AGENT], cwd3, m[CopilotAgent._META_CWDS], customizationDirectory, resolved, uri, displayName, workspaceless].every((value) => value === void 0)) {
        return { resolved: false };
      }
      const workingDirectory = cwd3 ? URI.parse(cwd3) : void 0;
      const project = uri && displayName ? { uri: URI.parse(uri), displayName } : void 0;
      return {
        model: this._parseModelSelection(m[CopilotAgent._META_MODEL]),
        agent: this._parseAgentSelection(m[CopilotAgent._META_AGENT]),
        workingDirectory,
        workingDirectories: this._parseWorkingDirectories(m[CopilotAgent._META_CWDS], workingDirectory),
        customizationDirectory: customizationDirectory ? URI.parse(customizationDirectory) : void 0,
        project,
        resolved: resolved === "true" || project !== void 0,
        workspaceless: workspaceless === void 0 ? void 0 : workspaceless === "true"
      };
    } finally {
      ref.dispose();
    }
  }
  /**
   * Persists (or clears) the selected custom agent for a session. Writing
   * `undefined` clears the stored selection by writing an empty string,
   * which later cold reads treat as "no custom agent" because
   * `_parseAgentSelection` short-circuits on falsy metadata values.
   */
  async _storeSessionAgentMetadata(session, agent) {
    const dbRef = this._sessionDataService.openDatabase(session);
    try {
      await dbRef.object.setMetadata(CopilotAgent._META_AGENT, agent ? this._serializeAgentSelection(agent) : "");
    } finally {
      dbRef.dispose();
    }
  }
  async _storeSessionProjectResolution(session, project) {
    await this._storeSessionMetadata(session, void 0, void 0, void 0, void 0, project, true);
  }
  /**
   * Git resolution runs in the session's working directory, so a legacy session
   * whose worktree checkout was deleted falls back to the remote (e.g.
   * `https://github.com/owner/repo`). That is not a location on disk, so the
   * session could never be matched to the repository folder a window has open.
   * The extension host recorded the local repository root — prefer it.
   */
  async _localProject(project, adoptableSessionId) {
    if (project?.uri.scheme === Schemas.file || adoptableSessionId === void 0) {
      return project;
    }
    const repositoryPath = extensionHostCliRepositoryPath(await this._readExtensionHostCliMarker(adoptableSessionId));
    if (!repositoryPath) {
      return project;
    }
    const uri = URI.file(repositoryPath);
    return { uri, displayName: basename2(uri) || project?.displayName || uri.toString() };
  }
  _resolveSessionProject(context, limiter, projectByContext) {
    const key = this._projectContextKey(context);
    if (!key) {
      return Promise.resolve(void 0);
    }
    let project = projectByContext.get(key);
    if (!project) {
      project = limiter.queue(() => projectFromCopilotContext(context, this._gitService));
      projectByContext.set(key, project);
    }
    return project;
  }
  _projectContextKey(context) {
    if (context?.cwd) {
      return `cwd:${context.cwd}`;
    }
    if (context?.gitRoot) {
      return `gitRoot:${context.gitRoot}`;
    }
    if (context?.repository) {
      return `repository:${context.repository}`;
    }
    return void 0;
  }
  dispose() {
    for (const ac of this._activeClients.values()) {
      ac.dispose();
    }
    this._activeClients.clear();
    this.shutdown().catch((err) => {
      this._logService.warn("[Copilot] Shutdown failed during dispose", err);
    }).finally(() => super.dispose());
  }
};

CopilotAgent = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ISessionDataService),
  __decorateParam(3, IAgentHostGitService),
  __decorateParam(4, IAgentConfigurationService),
  __decorateParam(5, IAgentHostSessionTitleSignal),
  __decorateParam(6, IAgentHostManagedSettingsService),
  __decorateParam(7, IAgentHostGitHubEndpointService),
  __decorateParam(8, IAgentHostOTelService),
  __decorateParam(9, IAgentHostCompletions),
  __decorateParam(10, IAgentHostCheckpointService),
  __decorateParam(11, IAgentHostReviewService),
  __decorateParam(12, IAgentHostCustomizationEnablementService),
  __decorateParam(13, INativeEnvironmentService),
  __decorateParam(14, IByokLmBridgeRegistry),
  __decorateParam(15, ITelemetryService),
  __decorateParam(16, ICopilotApiService),
  __decorateParam(17, IAgentHostProxyResolver),
  __decorateParam(18, IFileService),
  __decorateParam(19, IAgentHostWorktreeIsolation)
], CopilotAgent);

var REFRESH_DEBOUNCE_MS = 100;

var SessionDiscoveredEntry = class extends Disposable {
  constructor(workingDirectories, userHome, _getClient, _onDidRefresh, _fileService, _configurationService, _logService, instantiationService) {
    super();
    this._getClient = _getClient;
    this._onDidRefresh = _onDidRefresh;
    this._fileService = _fileService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._refreshDelayer = this._register(new Delayer(REFRESH_DEBOUNCE_MS));
    this._refreshPromise = null;
    this._pendingRefreshNotify = false;
    this._customizations = [];
    this._discovery = this._register(instantiationService.createInstance(SessionCustomizationDiscovery, workingDirectories, userHome, URI.file));
    this._settled = this._queueRefresh(false, 0);
    this._register(this._discovery.onDidChange(() => {
      this._settled = this._queueRefresh(true);
    }));
    this._register(this._configurationService.onDidRootConfigChange(() => {
      this._settled = this._queueRefresh(true);
    }));
  }
  dispose() {
    this._refreshPromise?.cancel();
    this._refreshPromise = null;
    super.dispose();
  }
  whenSettled() {
    return this._settled;
  }
  currentCustomizations() {
    return this._customizations;
  }
  _queueRefresh(notify, delay = REFRESH_DEBOUNCE_MS) {
    this._refreshPromise?.cancel();
    this._refreshPromise = null;
    this._pendingRefreshNotify = this._pendingRefreshNotify || notify;
    return this._refreshDelayer.trigger(() => {
      const shouldNotify = this._pendingRefreshNotify;
      this._pendingRefreshNotify = false;
      const refreshPromise = this._refreshPromise = createCancelablePromise(async (token) => {
        const didRefresh = await this._refresh(token);
        if (didRefresh && shouldNotify) {
          this._onDidRefresh();
        }
      });
      return refreshPromise.then(() => {
        if (this._refreshPromise === refreshPromise) {
          this._refreshPromise = null;
        }
      }, (err) => {
        if (this._refreshPromise === refreshPromise) {
          this._refreshPromise = null;
        }
        if (err instanceof CancellationError) {
          return;
        }
        throw err;
      });
    }, delay).catch((err) => {
      if (err instanceof CancellationError) {
        return;
      }
      throw err;
    });
  }
  async _refresh(token) {
    try {
      const mode = this._configurationService.getRootValue(agentHostCustomizationConfigSchema, "sessionCustomizationDiscoveryMode" /* SessionCustomizationDiscoveryMode */) ?? DEFAULT_SESSION_CUSTOMIZATION_DISCOVERY_MODE;
      if (mode === "discover") {
        const customizations2 = await this._discovery.discover(await this._getClient(), token);
        if (token.isCancellationRequested) {
          return false;
        }
        if (equals2(this._customizations, customizations2)) {
          return false;
        }
        this._customizations = customizations2;
        this._directories = void 0;
        return true;
      }
      const directories = await this._discovery.scan(token);
      if (token.isCancellationRequested) {
        return false;
      }
      if (this._directories && areDiscoveredDirectoriesEqual(this._directories, directories)) {
        return false;
      }
      const customizations = await toDiscoveredDirectoryCustomizations(directories, this._fileService);
      if (token.isCancellationRequested) {
        return false;
      }
      this._customizations = customizations;
      this._directories = directories;
      return true;
    } catch (err) {
      if (token.isCancellationRequested) {
        return false;
      }
      this._logService.warn(`[Copilot:SessionDiscoveredEntry] Discovery/bundle failed: ${err instanceof Error ? err.message : String(err)}`);
      const hadState = this._customizations.length > 0 || this._directories !== void 0;
      this._customizations = [];
      this._directories = void 0;
      return hadState;
    }
  }
};

SessionDiscoveredEntry = __decorateClass([
  __decorateParam(4, IFileService),
  __decorateParam(5, IAgentConfigurationService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IInstantiationService)
], SessionDiscoveredEntry);

function toDiscoveredDirectoryCustomizations(directories, fileService) {
  return Promise.all(directories.map(async (directory) => {
    const protocolUri = directory.uri.toString();
    return {
      type: "directory" /* Directory */,
      id: customizationId(protocolUri),
      uri: protocolUri,
      name: directory.name,
      enabled: true,
      contents: toDirectoryContentsType(directory.type),
      writable: directory.writable,
      // whether the new customization can be created in this directory
      load: { kind: "loaded" /* Loaded */ },
      children: await Promise.all(directory.files.map((file) => toDiscoveredChildCustomization(file.uri, directory.type, fileService)))
    };
  }));
}

function toDirectoryContentsType(type) {
  switch (type) {
    case "agent" /* Agent */:
      return "agent" /* Agent */;
    case "skill" /* Skill */:
      return "skill" /* Skill */;
    case "instruction" /* Instruction */:
    case "agentInstruction" /* AgentInstruction */:
      return "rule" /* Rule */;
    case "hook" /* Hook */:
      return "hook" /* Hook */;
  }
}

async function toDiscoveredChildCustomization(file, type, fileService) {
  const uri = file.toString();
  const id2 = customizationId(uri);
  if (type === "agent" /* Agent */) {
    const agentInfo = await parseAgentFile(file, fileService);
    const agentCustomization = {
      type: "agent" /* Agent */,
      id: id2,
      uri,
      name: agentInfo.name,
      description: agentInfo.description
    };
    if (agentInfo.userInvocable !== void 0) {
      agentCustomization._meta = { userInvocable: agentInfo.userInvocable };
    }
    return agentCustomization;
  }
  if (type === "skill" /* Skill */) {
    const skillInfo = await parseSkillFile(file, fileService);
    const skillCustomization = {
      type: "skill" /* Skill */,
      id: id2,
      uri,
      name: skillInfo.name,
      description: skillInfo.description
    };
    return skillCustomization;
  }
  if (type === "instruction" /* Instruction */) {
    const ruleInfo = await parseRuleFile(file, fileService);
    const ruleCustomization = {
      type: "rule" /* Rule */,
      id: id2,
      uri,
      name: ruleInfo.name,
      description: ruleInfo.description,
      globs: ruleInfo.globs,
      alwaysApply: ruleInfo.alwaysApply
    };
    return ruleCustomization;
  }
  if (type === "hook" /* Hook */) {
    const hookCustomization = {
      type: "hook" /* Hook */,
      id: id2,
      uri,
      name: basename2(file)
    };
    return hookCustomization;
  }
  return {
    type: "rule" /* Rule */,
    alwaysApply: true,
    id: id2,
    uri,
    name: basename2(file)
  };
}

function mapToParsedPlugin(customizations) {
  if (customizations.length === 0) {
    return void 0;
  }
  const agents = [];
  const skills = [];
  const instructions = [];
  for (const directory of customizations) {
    for (const child of directory.children ?? []) {
      if (child.type === "agent" /* Agent */) {
        agents.push({
          uri: URI.parse(child.uri),
          name: child.name,
          description: child.description,
          customization: child
        });
        continue;
      }
      if (child.type === "skill" /* Skill */) {
        skills.push({
          uri: URI.parse(child.uri),
          name: child.name,
          description: child.description,
          customization: child
        });
        continue;
      }
      if (child.type === "rule" /* Rule */) {
        if (child.alwaysApply && child.name.match(/\.md$/i)) {
          continue;
        }
        instructions.push({
          uri: URI.parse(child.uri),
          name: child.name,
          description: child.description,
          customization: child
        });
      }
    }
  }
  if (agents.length === 0 && skills.length === 0 && instructions.length === 0) {
    return void 0;
  }
  return {
    format: 0 /* Copilot */,
    hooks: [],
    mcpServers: [],
    skills,
    agents,
    instructions
  };
}

var PluginController = class extends Disposable {
  constructor(_getClient, pluginManager, _logService, _fileService, _configurationService, _instantiationService, _environmentService) {
    super();
    this._getClient = _getClient;
    this.pluginManager = pluginManager;
    this._logService = _logService;
    this._fileService = _fileService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._environmentService = _environmentService;
    this._onDidChange = this._register(new Emitter());
    /** Fires when host customizations change. Session controllers forward this. */
    this.onDidChange = this._onDidChange.event;
    this._hostCustomizations = [];
    this._hostSync = Promise.resolve([]);
    this._hostRevision = 0;
    this._lastAppliedRefs = [];
    this._applyHostCustomizations();
    this._register(this._configurationService.onDidRootConfigChange(() => {
      this._applyHostCustomizations();
    }));
  }
  getConfiguredHostCustomizations() {
    return this._hostCustomizations.map((item) => item.customization);
  }
  get configurationService() {
    return this._configurationService;
  }
  /**
   * Snapshot the resolved host customizations (loading or loaded). Used by
   * {@link SessionPluginController} to compose its per-session view.
   */
  hostCustomizations() {
    return this._hostCustomizations;
  }
  /** In-flight host sync; awaited by `getCustomizationsSettled` consumers. */
  hostSync() {
    return this._hostSync;
  }
  getUserHome() {
    return this._environmentService.userHome;
  }
  async getClient() {
    return this._getClient();
  }
  /** Creates a per-session controller that reads host-customization state lazily. */
  createSessionController(session, directory, hostCustomizations) {
    return this._instantiationService.createInstance(SessionPluginController, this, session, directory, hostCustomizations);
  }
  /**
   * Reads the current host customizations from the root config and
   * resolves them. Skips the update when the configured refs have not
   * changed since the last application.
   */
  _applyHostCustomizations() {
    const entries = this._configurationService.getRootValue(agentHostCustomizationConfigSchema, "customizations" /* Customizations */) ?? [];
    const customizations = entries.map(toContainerCustomization);
    if (equals2(customizations, this._lastAppliedRefs)) {
      return;
    }
    this._lastAppliedRefs = customizations;
    const revision = ++this._hostRevision;
    this._hostCustomizations = customizations.map((customization) => ({
      customization: {
        ...customization,
        load: { kind: "loading" /* Loading */ }
      }
    }));
    this._onDidChange.fire();
    this._hostSync = Promise.all(customizations.map((customization) => this.resolveConfiguredCustomization(customization))).then((resolved) => {
      if (revision === this._hostRevision) {
        this._hostCustomizations = resolved;
      }
      return resolved;
    }).finally(() => {
      if (revision === this._hostRevision) {
        this._onDidChange.fire();
      }
    });
  }
  async resolveConfiguredCustomization(customization) {
    const pluginDir = URI.parse(customization.uri);
    const parsed = await this.tryParsePlugin(pluginDir);
    if (!parsed) {
      return {
        customization: {
          ...customization,
          load: { kind: "error" /* Error */, message: localize(2484, null) }
        }
      };
    }
    return {
      customization: {
        ...customization,
        load: { kind: "loaded" /* Loaded */ },
        children: toChildCustomizations([parsed])
      },
      pluginDir,
      plugin: parsed
    };
  }
  async resolveSyncedCustomization(item, clientId, input) {
    const baseCustomization = { ...item.customization, clientId };
    if (!item.pluginDir) {
      return { customization: baseCustomization, input };
    }
    const parsed = await this.tryParsePlugin(item.pluginDir);
    if (!parsed) {
      return {
        customization: {
          ...baseCustomization,
          load: { kind: "error" /* Error */, message: localize(2484, null) }
        },
        input
      };
    }
    return {
      customization: {
        ...baseCustomization,
        children: toChildCustomizations([parsed])
      },
      pluginDir: item.pluginDir,
      plugin: parsed,
      input
    };
  }
  async tryParsePlugin(pluginDir) {
    try {
      return await parsePlugin(pluginDir, this._fileService, void 0, this.getUserHome(), pluginDir);
    } catch (error) {
      this._logService.warn(`[Copilot:PluginController] Error parsing plugin '${pluginDir.toString()}': ${error instanceof Error ? error.message : String(error)}`);
      return void 0;
    }
  }
};

PluginController = __decorateClass([
  __decorateParam(1, IAgentPluginManager),
  __decorateParam(2, ILogService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IAgentConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, INativeEnvironmentService)
], PluginController);

var SessionPluginController = class extends Disposable {
  constructor(_parent, _session, _directory, _hostCustomizations, _logService, _instantiationService, _fileService, _customizationEnablementService) {
    super();
    this._parent = _parent;
    this._session = _session;
    this._directory = _directory;
    this._hostCustomizations = _hostCustomizations;
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._fileService = _fileService;
    this._customizationEnablementService = _customizationEnablementService;
    this._onDidPublish = this._register(new Emitter());
    /** Per-session action stream (reset + per-item updates). */
    this.onDidPublish = this._onDidPublish.event;
    this._isEnablementReady = false;
    this._previousDirectories = [];
    this._desiredCustomizationById = /* @__PURE__ */ new Map();
    /** Live MCP server runtime state overlaid onto published customizations across re-syncs. */
    this.mcpServerStates = observableValue(this, /* @__PURE__ */ new Map());
    /** Per-client customization state; published customizations are the stable first-wins union of these entries. */
    this._clients = /* @__PURE__ */ new Map();
    this._sessionDiscovered = this._register(new MutableDisposable());
    this._sessionMcpDiscovery = this._register(new MutableDisposable());
    /** Additional multi-root workspace folders (roots 1..N); the primary root is tracked separately. */
    this._additionalDirectories = [];
    this._enablementReady = this._customizationEnablementService.initializeSession(this._session.toString()).then(() => {
      this._isEnablementReady = true;
    });
  }
  get directory() {
    return this._directory;
  }
  /** The additional (non-primary) roots attached to customization discovery. */
  get additionalDirectories() {
    return this._additionalDirectories;
  }
  /**
   * Anchor (or re-anchor) the session's customization directory.
   * Only ever transitions from `undefined` → set; once a directory has
   * been bound the discovered entry is pinned to it for the remainder
   * of the session.
   */
  setDirectory(directory) {
    if (this._directory || !directory) {
      return;
    }
    this._directory = directory;
  }
  /**
   * Set the additional (non-primary) workspace roots. Recreates the discovered
   * entry when the set actually changes so discovery re-scans every root —
   * important when this is set after a primary-only entry was already created
   * (e.g. on resume). A no-op for the single-root case (empty tail).
   */
  setAdditionalDirectories(directories) {
    if (this._additionalDirectories.length === directories.length && this._additionalDirectories.every((d, i) => isEqual2(d, directories[i]))) {
      return;
    }
    this._additionalDirectories = directories;
    this._sessionDiscovered.clear();
    this._sessionMcpDiscovery.clear();
  }
  /**
   * Move the session's customization anchor to a new directory (e.g. from the
   * user-picked folder to the worktree at materialization). Recreates the
   * discovered entry so discovery/watchers re-scan the new directory.
   */
  reanchor(directory) {
    if (this._directory && isEqual2(this._directory, directory)) {
      return;
    }
    const previous = this._directory;
    this._directory = directory;
    this._sessionDiscovered.clear();
    this._sessionMcpDiscovery.clear();
    if (previous && !this._previousDirectories.some((candidate) => isEqual2(candidate, previous))) {
      this._previousDirectories.push(previous);
    }
  }
  getCustomizations() {
    return this._resolveCustomizationEnablement().customizations;
  }
  resolveTopLevelMcpCustomizations(customizations, mcpServerOwners) {
    return resolveCustomizationEnablement(this._customizationEnablementService, this._session, customizations, this._clientChildEnablement(), void 0, mcpServerOwners).customizations;
  }
  _resolveCustomizationEnablement() {
    const result = [
      ...this._parent.hostCustomizations().map((item) => this._projectForPublish(item.customization)),
      ...this._flattenClientCustomizations().map((item) => this._projectForPublish(item.customization))
    ];
    const entry = this._discoveredEntry();
    const discovered = entry?.currentCustomizations() ?? [];
    for (const customization of discovered) {
      result.push(this._projectForPublish(customization));
    }
    for (const definition of this._mcpDiscoveryEntry()?.definitions ?? []) {
      result.push(this._projectForPublish(definition.customization));
    }
    return resolveCustomizationEnablement(this._customizationEnablementService, this._session, result, this._clientChildEnablement(), this._clientPlugins());
  }
  /**
   * The union of every active client's resolved customizations,
   * deduplicated by URI with the first-inserted client winning. Order
   * follows client insertion order, then per-client order.
   */
  _flattenClientCustomizations() {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const client of this._clients.values()) {
      for (const item of client.customizations) {
        if (seen.has(item.customization.uri)) {
          continue;
        }
        seen.add(item.customization.uri);
        result.push(item);
      }
    }
    return result;
  }
  /**
   * Settled variant of {@link getCustomizations}: awaits the in-flight
   * host sync, every in-flight client sync, and the discovered entry's
   * initial scan + parse before snapshotting the list. Callers that
   * publish customizations into session state at session creation time
   * MUST use this — the synchronous variant can return an empty list
   * for a brand-new working directory because {@link SessionDiscoveredEntry}
   * kicks off its `_refresh()` without anyone awaiting it.
   */
  async getCustomizationsSettled() {
    await this._enablementReady;
    const entry = this._discoveredEntry();
    await Promise.all([
      this._parent.hostSync().catch((err) => this._logService.warn("[Copilot:SessionPluginController] Host customization update failed", err)),
      ...[...this._clients.values()].map((client) => client.sync.catch((err) => this._logService.warn("[Copilot:SessionPluginController] Client customization sync failed", err))),
      entry?.whenSettled(),
      this._mcpDiscoveryEntry()?.refresh()
    ]);
    return this.getCustomizations();
  }
  /** Returns the parsed plugins currently enabled for this session, awaiting any pending sync. */
  async getAppliedPlugins() {
    await this._customizationEnablementService.initializeSession(this._session.toString());
    const entry = this._discoveredEntry();
    const mcpDiscovery = this._mcpDiscoveryEntry();
    const [host] = await Promise.all([
      this._parent.hostSync().catch((err) => {
        this._logService.warn("[Copilot:SessionPluginController] Host customization update failed", err);
        return this._parent.hostCustomizations();
      }),
      ...[...this._clients.values()].map((client) => client.sync.catch((err) => {
        this._logService.warn("[Copilot:SessionPluginController] Client customization sync failed", err);
        return client.customizations;
      })),
      entry?.whenSettled(),
      mcpDiscovery?.refresh()
    ]);
    const resolved = this._resolveCustomizationEnablement();
    const desiredByUri = new Map(resolved.customizations.map((customization) => [customization.uri, customization]));
    const desiredById = new Map(resolved.customizations.map((customization) => [customization.id, customization]));
    const mcpEnablement = getSdkMcpServerEnablement(resolved);
    const isEnabledForSdk = (customization) => {
      const desired = desiredById.get(customization.id) ?? desiredByUri.get(customization.uri) ?? customization;
      return isCustomizationSdkEligible(resolved, desired) && (desired.type === "directory" /* Directory */ ? desired.enabled : isCustomizationEnabled(desired));
    };
    const disabledChildren = (customization) => {
      const desired = desiredByUri.get(customization.uri);
      const children = desired && desired.type !== "mcpServer" /* McpServer */ ? desired.children?.filter((child) => child.type === "mcpServer" /* McpServer */ && !mcpEnablement.get(child.id)).map((child) => child.name) : void 0;
      return children?.length ? children : void 0;
    };
    const discovered = entry?.currentCustomizations() ?? [];
    const sessionPlugin = discovered.some(isEnabledForSdk) ? mapToParsedPlugin(discovered) : void 0;
    const withSdkRegistration = (plugin, pluginDir) => ({
      ...plugin,
      pluginDir,
      mcpServers: plugin.mcpServers.map((definition) => resolveCopilotMcpServerInfo(definition, pluginDir))
    });
    const sessionPlugins = sessionPlugin ? [withSdkRegistration(sessionPlugin, void 0)] : [];
    const primaryCwd = this._directory;
    const withClientDefaults = (item) => {
      const plugin = item.plugin;
      return {
        ...plugin,
        pluginDir: item.pluginDir,
        mcpServers: plugin.mcpServers.map((definition) => resolveCopilotMcpServerInfo(definition, item.pluginDir, item.input, primaryCwd))
      };
    };
    const allWorkspaceDefinitions = mcpDiscovery?.definitions ?? [];
    const workspaceDefinitions = allWorkspaceDefinitions.filter((definition) => isEnabledForSdk(definition.customization));
    const workspaceMcp = allWorkspaceDefinitions.length ? [{
      format: 0 /* Copilot */,
      hooks: [],
      mcpServers: workspaceDefinitions.map((definition) => resolveCopilotMcpServerInfo(definition, void 0)),
      disabledMcpServers: allWorkspaceDefinitions.filter((definition) => !isEnabledForSdk(definition.customization)).map((definition) => definition.name),
      skills: [],
      agents: [],
      instructions: []
    }] : [];
    return [
      ...workspaceMcp,
      ...host.filter((item) => !!item.plugin && isEnabledForSdk(item.customization)).map((item) => ({ ...withSdkRegistration(item.plugin, item.pluginDir), sourceUri: URI.parse(item.customization.uri), ...disabledChildren(item.customization) ? { disabledMcpServers: disabledChildren(item.customization) } : {} })),
      ...this._flattenClientCustomizations().filter((item) => !!item.plugin && isEnabledForSdk(item.customization)).map((item) => ({ ...withClientDefaults(item), sourceUri: URI.parse(item.customization.uri), ...disabledChildren(item.customization) ? { disabledMcpServers: disabledChildren(item.customization) } : {} })),
      ...sessionPlugins
    ];
  }
  /**
   * Sync the published customizations for a single client of this session,
   * keyed by `clientId`. Replaces only that client's slice; other clients'
   * customizations are untouched. The published session-state list is the
   * union across all clients.
   *
   * @param quiet when `true`, suppress {@link onDidPublish} events for
   *   this sync. Used during eager-create paths where there is no
   *   session listener yet; the session-state snapshot picks up the
   *   final view directly when the session materializes.
   */
  async sync(clientId, customizations, options) {
    if (!this._isEnablementReady) {
      await this._enablementReady;
    }
    const quiet = options?.quiet === true;
    let client = this._clients.get(clientId);
    if (!client) {
      client = { revision: 0, customizations: [], sync: Promise.resolve([]), inputs: [] };
      this._clients.set(clientId, client);
    } else if (equals2(client.inputs, customizations)) {
      return client.sync.then((results) => results.map((item) => ({
        customization: this._resolveCustomizationForPublish(item.customization),
        ...item.pluginDir ? { pluginDir: item.pluginDir } : {}
      })));
    }
    const revision = ++client.revision;
    client.inputs = customizations;
    client.customizations = customizations.map((customization) => ({
      customization: {
        ...customization,
        clientId,
        load: { kind: "loading" /* Loading */ }
      },
      input: customization
    }));
    if (!quiet) {
      this._publish(() => ({
        type: "session/customizationsChanged" /* SessionCustomizationsChanged */,
        customizations: [...this.getCustomizations()]
      }));
    }
    const published = /* @__PURE__ */ new Map();
    for (const customization of client.customizations) {
      const enabled = this._resolveCustomizationForPublish(customization.customization);
      published.set(enabled.uri, enabled);
    }
    const publishUpdate = (item) => {
      const customization = this._resolveCustomizationForPublish(item.customization);
      if (equals2(published.get(customization.uri), customization)) {
        return;
      }
      published.set(customization.uri, customization);
      if (!quiet) {
        this._publish(() => ({
          type: "session/customizationUpdated" /* SessionCustomizationUpdated */,
          customization
        }));
      }
    };
    const prev = client.sync;
    const promise = client.sync = prev.catch((err) => {
      this._logService.warn("[Copilot:SessionPluginController] Previous customization sync failed", err);
    }).then(async () => {
      const inputByUri = new Map(customizations.map((c) => [c.uri, c]));
      const result = await this._parent.pluginManager.syncCustomizations(clientId, customizations, (status) => {
        if (revision !== client.revision) {
          return;
        }
        publishUpdate({
          customization: { ...status, clientId },
          input: inputByUri.get(status.uri)
        });
      });
      const resolved = await Promise.all(result.map((item) => this._parent.resolveSyncedCustomization(item, clientId, inputByUri.get(item.customization.uri))));
      if (revision === client.revision) {
        client.customizations = resolved;
        for (const item of resolved) {
          publishUpdate(item);
        }
      }
      return resolved;
    });
    return promise.then((results) => results.map((item) => ({
      customization: this._resolveCustomizationForPublish(item.customization),
      ...item.pluginDir ? { pluginDir: item.pluginDir } : {}
    })));
  }
  /**
   * Remove a client's customization contribution from this session,
   * publishing the updated (union) customization list so the removed
   * client's plugins disappear from session state.
   */
  removeClient(clientId) {
    const client = this._clients.get(clientId);
    if (!client) {
      return;
    }
    client.revision++;
    this._clients.delete(clientId);
    this._publish(() => ({
      type: "session/customizationsChanged" /* SessionCustomizationsChanged */,
      customizations: [...this.getCustomizations()]
    }));
  }
  /** The raw input customizations last synced for `clientId` (empty when absent). */
  clientInputs(clientId) {
    return this._clients.get(clientId)?.inputs ?? [];
  }
  /**
   * Re-issue each client's last sync if any of its previously-synced
   * customizations is currently in an error state. Used to recover from
   * transient sync failures (e.g. a `vscode-agent-host://` connection drop
   * during reconnection) at message boundaries. Re-syncs **only** the
   * errored items and always non-quiet so listeners observe recovery.
   */
  async retryFailedClientSyncIfNeeded() {
    await Promise.all([...this._clients.values()].map((client) => client.sync.catch(() => {
    })));
    for (const [clientId, client] of [...this._clients]) {
      const errored = client.customizations.filter(
        (item) => item.customization.load?.kind === "error" /* Error */ && item.input !== void 0
      );
      if (errored.length === 0) {
        continue;
      }
      const inputs = errored.map((item) => item.input);
      this._logService.info(`[Copilot:SessionPluginController] Retrying ${inputs.length} previously-failed client customization(s) for ${clientId}`);
      await this.sync(clientId, inputs).catch((err) => {
        this._logService.warn("[Copilot:SessionPluginController] Retried client customization sync failed", err);
      });
    }
  }
  _discoveredEntry() {
    if (!this._directory) {
      return void 0;
    }
    if (!this._sessionDiscovered.value) {
      this._sessionDiscovered.value = this._instantiationService.createInstance(
        SessionDiscoveredEntry,
        [this._directory, ...this._additionalDirectories],
        this._parent.getUserHome(),
        () => this._parent.getClient(),
        () => this._publish(() => ({
          type: "session/customizationsChanged" /* SessionCustomizationsChanged */,
          customizations: [...this.getCustomizations()]
        }))
      );
    }
    return this._sessionDiscovered.value;
  }
  _mcpDiscoveryEntry() {
    if (!this._directory) {
      return void 0;
    }
    if (!this._sessionMcpDiscovery.value) {
      const store = new DisposableStore();
      const discovery = store.add(new SessionMcpDiscovery([this._directory, ...this._additionalDirectories], this._fileService));
      store.add(discovery.onDidChange(() => this._publish(() => ({
        type: "session/customizationsChanged" /* SessionCustomizationsChanged */,
        customizations: [...this.getCustomizations()]
      }))));
      this._sessionMcpDiscovery.value = { discovery, dispose: () => store.dispose() };
    }
    return this._sessionMcpDiscovery.value.discovery;
  }
  _publish(action) {
    const publish = () => {
      if (!this._store.isDisposed) {
        this._onDidPublish.fire(action());
      }
    };
    if (this._isEnablementReady) {
      publish();
    } else {
      void this._enablementReady.then(publish).catch((error) => this._logService.error("[Copilot:SessionPluginController] Failed to initialize customization enablement", error));
    }
  }
  _clientChildEnablement() {
    const result = /* @__PURE__ */ new Map();
    for (const client of this._clients.values()) {
      for (const customization of client.inputs) {
        if (customization.childEnablement !== void 0) {
          result.set(customization.uri, customization.childEnablement);
        }
      }
    }
    return result;
  }
  _clientPlugins() {
    const result = /* @__PURE__ */ new Map();
    for (const client of this._clients.values()) {
      for (const customization of client.inputs) {
        result.set(customization.uri, customization);
      }
    }
    return result;
  }
  _isEnabled(customization) {
    return this._desiredEnabled(customization) ?? (customization.type === "directory" /* Directory */ ? customization.enabled : isCustomizationEnabled(customization));
  }
  _applyEnablement(customization) {
    if (customization.type === "mcpServer" /* McpServer */) {
      return this._applyExplicitEnablement(customization, this._getDesiredCustomization(customization.id));
    }
    if (customization.type === "plugin" /* Plugin */) {
      const plugin = customization;
      const next = this._applyExplicitEnablement(plugin, this._getDesiredCustomization(plugin.id));
      let changed2 = next !== customization;
      const children2 = next.children?.map((child) => {
        if (child.type === "mcpServer" /* McpServer */) {
          const updated = this._applyExplicitEnablement(child, this._getDesiredCustomization(child.id));
          changed2 ||= updated !== child;
          return updated;
        }
        const desiredEnabled = this._desiredEnabled(child);
        if (desiredEnabled === void 0 || desiredEnabled === child.enabled) {
          return child;
        }
        changed2 = true;
        return { ...child, enabled: desiredEnabled };
      });
      return changed2 ? { ...next, children: children2 } : next;
    }
    const enabled = this._isEnabled(customization);
    let changed = customization.enabled !== enabled;
    const children = customization.children?.map((child) => {
      if (child.type === "mcpServer" /* McpServer */) {
        const next = this._applyExplicitEnablement(child, this._getDesiredCustomization(child.id));
        changed ||= next !== child;
        return next;
      }
      const desiredEnabled = this._desiredEnabled(child);
      if (desiredEnabled === void 0 || desiredEnabled === child.enabled) {
        return child;
      }
      changed = true;
      return { ...child, enabled: desiredEnabled };
    });
    return changed ? { ...customization, enabled, children } : customization;
  }
  _resolveCustomizationForPublish(customization) {
    return resolveCustomizationEnablement(
      this._customizationEnablementService,
      this._session,
      [this._projectForPublish(customization)],
      this._clientChildEnablement(),
      this._clientPlugins()
    ).customizations[0];
  }
  _desiredEnabled(customization) {
    const exact = this._getDesiredCustomization(customization.id);
    if (exact) {
      return exact.type === "plugin" /* Plugin */ || exact.type === "mcpServer" /* McpServer */ ? isCustomizationEnabled(exact) : exact.enabled;
    }
    if (!this._directory) {
      return void 0;
    }
    for (const previousDirectory of this._previousDirectories) {
      const previousUri = rebaseUnder(URI.parse(customization.uri), this._directory, previousDirectory);
      if (!previousUri) {
        continue;
      }
      const previousId = customizationId(previousUri.toString(), customization.range);
      const previous = this._getDesiredCustomization(previousId);
      if (previous) {
        return previous.type === "plugin" /* Plugin */ || previous.type === "mcpServer" /* McpServer */ ? isCustomizationEnabled(previous) : previous.enabled;
      }
    }
    return void 0;
  }
  _applyExplicitEnablement(customization, desired) {
    if (!desired || desired.type !== "plugin" /* Plugin */ && desired.type !== "mcpServer" /* McpServer */) {
      return customization;
    }
    if (desired.enablement?.length) {
      const next2 = { ...customization, enablement: [...desired.enablement] };
      return next2;
    }
    const next = { ...customization };
    delete next.enablement;
    return next;
  }
  _getDesiredCustomization(id2) {
    const customizations = this._hostCustomizations();
    if (customizations !== this._indexedDesiredCustomizations) {
      this._indexedDesiredCustomizations = customizations;
      this._desiredCustomizationById.clear();
      for (const customization of customizations ?? []) {
        this._desiredCustomizationById.set(customization.id, customization);
        if (customization.type !== "mcpServer" /* McpServer */) {
          for (const child of customization.children ?? []) {
            this._desiredCustomizationById.set(child.id, child);
          }
        }
      }
    }
    return this._desiredCustomizationById.get(id2);
  }
  /**
   * Projects a raw customization into its published form: applies reducer-backed
   * per-session enablement, then overlays the latest
   * known MCP runtime `state`/`channel` (see {@link mcpServerStates}).
   * Every publish path runs customizations through this so enablement and
   * live MCP state stay consistent. Object identity is preserved when
   * neither step changes anything, keeping downstream equality checks
   * stable.
   */
  _projectForPublish(customization) {
    return this._overlayMcpState(this._applyEnablement(customization));
  }
  /**
   * Overlays the latest known MCP runtime `state`/`channel` (see
   * {@link mcpServerStates}) onto a customization and its children,
   * preserving object identity when nothing is overlaid so downstream
   * equality checks stay stable.
   */
  _overlayMcpState(customization) {
    const overlays = this.mcpServerStates.get();
    if (overlays.size === 0) {
      return customization;
    }
    if (customization.type === "mcpServer" /* McpServer */) {
      const overlay = overlays.get(customization.id);
      return overlay ? { ...customization, state: overlay.state, channel: overlay.channel } : customization;
    }
    const children = customization.children;
    if (!children || children.length === 0) {
      return customization;
    }
    let changed = false;
    const overlaidChildren = children.map((child) => {
      if (child.type !== "mcpServer" /* McpServer */) {
        return child;
      }
      const overlay = overlays.get(child.id);
      if (!overlay) {
        return child;
      }
      changed = true;
      return { ...child, state: overlay.state, channel: overlay.channel };
    });
    return changed ? { ...customization, children: overlaidChildren } : customization;
  }
};

SessionPluginController = __decorateClass([
  __decorateParam(4, ILogService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IAgentHostCustomizationEnablementService)
], SessionPluginController);

var CopilotActiveClientHandle = class {
  constructor(_owner, clientId, displayName) {
    this._owner = _owner;
    this.clientId = clientId;
    this.displayName = displayName;
  }
  get tools() {
    return this._owner.toolSet.get(this.clientId);
  }
  set tools(tools) {
    this._owner.toolSet.set(this.clientId, tools);
  }
  get customizations() {
    return this._owner.pluginController.clientInputs(this.clientId);
  }
  set customizations(customizations) {
    this._owner.pluginController.sync(this.clientId, [...customizations]).catch(() => {
    });
  }
};

var ActiveClient = class extends Disposable {
  constructor(_sessionUri, pluginController, onDidSessionProgress, _configurationService) {
    super();
    this._sessionUri = _sessionUri;
    this._configurationService = _configurationService;
    /**
     * Live, multi-client registry of contributed tools. Shared by reference
     * with the session's {@link CopilotAgentSession} so a window reload (new
     * `clientId`, identical tools) is reflected at tool-call stamp time without
     * restarting the SDK session, and so tool calls are attributed to the
     * contributing client.
     */
    this.toolSet = new ActiveClientToolSet();
    this._handles = /* @__PURE__ */ new Map();
    /** Host-published per-client chat membership, updated incrementally one exact chat at a time. */
    this._chatsByClient = /* @__PURE__ */ new Map();
    /** Chats with authoritative membership; unknown chats are treated separately from "no contributors". */
    this._knownChats = /* @__PURE__ */ new Set();
    this.pluginController = this._register(pluginController);
    this._register(this.pluginController.onDidPublish((action) => {
      onDidSessionProgress.fire({ kind: "action", resource: this._sessionUri, action });
    }));
  }
  /** Adds `chat` to `clientId`'s membership and reports whether membership grew. */
  addClientChat(clientId, chat) {
    const chatKey = chat.toString();
    const chats = this._chatsByClient.get(clientId);
    if (chats?.has(chatKey)) {
      return false;
    }
    if (chats) {
      chats.add(chatKey);
    } else {
      this._chatsByClient.set(clientId, /* @__PURE__ */ new Set([chatKey]));
    }
    this._knownChats.add(chatKey);
    return true;
  }
  /** Removes `chat` from `clientId` and reports whether that client now has no chats left. */
  removeClientChat(clientId, chat) {
    const chatKey = chat.toString();
    const chats = this._chatsByClient.get(clientId);
    if (!chats?.has(chatKey)) {
      return false;
    }
    chats.delete(chatKey);
    if (chats.size === 0) {
      this._chatsByClient.delete(clientId);
    }
    this._reindexKnownChats();
    return !this._chatsByClient.has(clientId);
  }
  /** Removes `chat` from every client, dropping clients left with no remaining chats. */
  removeChat(chat) {
    for (const clientId of [...this._chatsByClient.keys()]) {
      if (this.removeClientChat(clientId, chat)) {
        this.removeClient(clientId);
      }
    }
  }
  /** The exact chats `clientId` contributes to, as last published by the host. */
  clientChats(clientId) {
    return [...this._chatsByClient.get(clientId) ?? []];
  }
  /** Unknown chats are temporarily in scope for every client until the host publishes exact membership. */
  contributesTo(clientId, chatKey) {
    return !this._knownChats.has(chatKey) || this._chatsByClient.get(clientId)?.has(chatKey) === true;
  }
  /** Chat-scoped tool union; duplicate names keep the first contributor's definition. */
  toolsForChat(chatKey) {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const clientId of this.toolSet.clientIds()) {
      if (!this.contributesTo(clientId, chatKey)) {
        continue;
      }
      for (const tool of this.toolSet.get(clientId)) {
        if (!seen.has(tool.name)) {
          seen.add(tool.name);
          result.push(tool);
        }
      }
    }
    return result;
  }
  _reindexKnownChats() {
    this._knownChats.clear();
    for (const chats of this._chatsByClient.values()) {
      for (const chatKey of chats) {
        this._knownChats.add(chatKey);
      }
    }
  }
  /** Get (or lazily create) the stable handle for `clientId`. */
  getOrCreateHandle(clientId, displayName) {
    let handle = this._handles.get(clientId);
    if (!handle) {
      handle = new CopilotActiveClientHandle(this, clientId, displayName);
      this._handles.set(clientId, handle);
    }
    return handle;
  }
  /** Drop a client's tool, customization, and membership state from this session. */
  removeClient(clientId) {
    this._handles.delete(clientId);
    this.toolSet.delete(clientId);
    this._chatsByClient.delete(clientId);
    this._reindexKnownChats();
    this.pluginController.removeClient(clientId);
  }
  /** Builds the client/plugin/MCP snapshot a chat should advertise to its SDK session. */
  async snapshot(chatKey) {
    return {
      tools: chatKey === void 0 ? this.toolSet.merged() : this.toolsForChat(chatKey),
      plugins: await this.pluginController.getAppliedPlugins(),
      mcpServers: this._getMcpServers()
    };
  }
  _getMcpServers() {
    const servers = this._configurationService.getRootValue(platformRootSchema, AgentHostMcpServersConfigKey) ?? {};
    return structuredClone(servers);
  }
  /** Returns whether plugins or the chat-scoped structural tool set changed enough to require resume. */
  async requiresRestart(snap, chatKey, current) {
    current ??= await this.snapshot(chatKey);
    if (!parsedPluginsEqual(snap.plugins, current.plugins)) {
      return true;
    }
    if (!equals2(snap.mcpServers, current.mcpServers)) {
      return true;
    }
    return !structuralToolsEqual(current.tools, snap.tools);
  }
};

ActiveClient = __decorateClass([
  __decorateParam(3, IAgentConfigurationService)
], ActiveClient);
export { setCopilotBuiltinGitHubMcpEnvironment, isCopilotRuntimeManagedSettingsSdk, getCopilotManagedSettingsDiagnostics, invokeWithProxyEnvironment, isCopilotConnectionClosedError, fileExists2, isLinuxMuslRuntime, getCopilotPlatformPackageCandidates, resolveCopilotCliPath, resolveCopilotMcpServerInfo, toRestrictedTelemetryEndpoint, rebaseUnder, resolveCopilotOtlpMetricsEndpoint, parseExtensionHostCliMarker, isExtensionHostCliMarker, extensionHostCliWorkingDirectoryPaths, extensionHostCliRepositoryPath, toDiscoveredDirectoryCustomizations, toDirectoryContentsType, toDiscoveredChildCustomization, mapToParsedPlugin, fs6, os4, pathToFileURL, COPILOT_MANAGED_SETTINGS_QUERY_TIMEOUT_MS, COPILOT_MANAGED_SETTINGS_DIAGNOSTICS_TIMEOUT_MS, COPILOT_ENABLE_BUILTIN_GITHUB_MCP_ENV_VAR, RUNTIME_SLASH_COMMAND_COMPLETION_WAIT_MS, COPILOT_CAPI_URL, COPILOT_PROXY_ENV_KEYS, COPILOT_PROXY_SET_ENV_KEYS, NO_HOST_CUSTOMIZATIONS, CopilotSessionLifetime, CopilotChatEntry, COPILOT_EXTERNAL_SESSION_CLIENT_NAMES, COPILOT_EXTERNAL_SESSION_MAX_AGE_MS, COPILOT_DISCOVERY_BATCH_SIZE, CHAT_DISCOVERY_RETRY_DELAYS_MS, MAX_STARTUP_CONFIG_RETRIES, EXTENSION_HOST_CLI_MARKER_ORIGIN, EXTENSION_HOST_CLI_MARKER_FILE, NANO_AIU_PER_CREDIT, CopilotAgent, REFRESH_DEBOUNCE_MS, SessionDiscoveredEntry, PluginController, SessionPluginController, CopilotActiveClientHandle, ActiveClient };
