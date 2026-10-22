// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeAgentSession.ts
import { readClaudePermissionMode } from "./module-0337.mjs";
import { isEqual2 } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0010.mjs";
import { Sequencer } from "./module-0027.mjs";
import { SubagentRegistry } from "./module-0333.mjs";
import { PendingRequestRegistry } from "./module-0255.mjs";
import { SessionClientCustomizationsDiff } from "./module-0339.mjs";
import { Emitter } from "./module-0016.mjs";
import { parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { SessionClientToolsDiff } from "./module-0338.mjs";
import { applyMcpServerEnablement, findMcpChildId, findMcpServerName } from "./module-0163.mjs";
import { ClaudeCustomizationWatcher, buildDiscoveredCustomizations, createClaudeInternalMcpServerCustomization, resolveClaudeAgentName } from "./module-0348.mjs";
import { SessionMcpDiscovery } from "./module-0310.mjs";
import { areAdditionalWorkingDirectoriesEqual, areSessionWorkingDirectoriesEqual } from "./module-0155.mjs";
import { buildClientMcpServers, buildOptions, toClaudeMcpServers } from "./module-0322.mjs";
import { CancellationError } from "./module-0002.mjs";
import { ClaudeSdkPipeline } from "./module-0358.mjs";
import { claudeTransportForProvider, parseClaudeModelSelection, toClaudeSdkModelId } from "./module-0328.mjs";
import { resolveClaudeEffort, toRuntimeEffortLevel } from "./module-0318.mjs";
import { CLAUDE_SERVER_TOOL_MCP_SERVER_NAME, buildServerToolMcpServer, serverToolAllowList } from "./module-0335.mjs";
import { AgentHostGitHubMcpServerEnabledConfigKey, platformRootSchema } from "./module-0057.mjs";
import { GITHUB_MCP_SERVER_NAME, resolveGitHubMcpServerConfiguration } from "./module-0306.mjs";
import { getSdkMcpServerEnablement, isCustomizationSdkEligible, resolveCustomizationEnablement } from "./module-0176.mjs";
import { hasClientPluginMcpDefaultCwds, readClientPluginMcpDefaultCwd } from "./module-0311.mjs";
import { parsePlugin } from "./module-0126.mjs";
import { resolvePromptToContentBlocks } from "./module-0350.mjs";
import { convertToolCallResult } from "./module-0336.mjs";
import { discoverClaudeMultiRootCustomizations } from "./module-0347.mjs";
import { scanClaudeRules } from "./module-0342.mjs";
import { scanClaudeMcpServers } from "./module-0341.mjs";
import { scanClaudeHooks } from "./module-0349.mjs";
import { isCustomizationEnabled } from "./module-0157.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostOTelService } from "./module-0137.mjs";
import { IClaudeAgentSdkService } from "./module-0321.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { ILogService } from "./module-0084.mjs";
import { IFileService } from "./module-0128.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";
import { IAgentHostCustomizationEnablementService } from "./module-0175.mjs";
import { ICopilotApiService } from "./module-0168.mjs";
import { IAgentHostAuthenticationService } from "./module-0201.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";


// src/vs/platform/agentHost/node/claude/claudeAgentSession.ts
function resolveCurrentPermissionMode(configurationService, resource, inheritedPermissionMode, permissionModeFallback) {
  return readClaudePermissionMode(configurationService, resource) ?? inheritedPermissionMode ?? permissionModeFallback;
}

function isGitHubMcpServerDefinition(definition, gitHubMcpServerConfiguration) {
  return definition.configuration.type === "http" /* REMOTE */ && gitHubMcpServerConfiguration.type === "http" /* REMOTE */ && isEqual2(URI.parse(definition.configuration.url), URI.parse(gitHubMcpServerConfiguration.url));
}

function toClaudeDeniedMcpServer(definition) {
  return { serverName: definition.name };
}

var ClaudeAgentSession = class extends Disposable {
  constructor(sessionId, chatChannelUri, workspace, project, model, agent, config, abortController, _pendingClientToolCalls, toolDiff, _permissionModeFallback, additionalDirectories, _instantiationService, _configurationService, _otelService, _sdkService, _sessionDataService, _logService, _fileService, _environmentService, _customizationEnablementService, _copilotApiService, _authenticationService, _gitHubEndpointService) {
    super();
    this.sessionId = sessionId;
    this.workspace = workspace;
    this._pendingClientToolCalls = _pendingClientToolCalls;
    this._permissionModeFallback = _permissionModeFallback;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._otelService = _otelService;
    this._sdkService = _sdkService;
    this._sessionDataService = _sessionDataService;
    this._logService = _logService;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._customizationEnablementService = _customizationEnablementService;
    this._copilotApiService = _copilotApiService;
    this._authenticationService = _authenticationService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._mcpEnablementSequencer = new Sequencer();
    this._hostCustomizations = [];
    this._customizationWatcher = this._register(new MutableDisposable());
    this._mcpLaunchEnablementRevision = 0;
    this._appliedMcpLaunchEnablementRevision = 0;
    /**
     * Phase 12 — per-session registry of Task tool calls that spawn
     * subagents (`SubagentSpawn` records keyed by `tool_use_id`, plus a
     * reverse index from inner `tool_use_id` to its parent Task). Owned
     * here so the registry dies with the session; consumers in the live
     * mapper (`ClaudeSdkMessageRouter` / `claudeMapSessionEvents` /
     * `claudeSubagentSignals`) and the `canUseTool` bridge read from
     * the same instance via the session.
     */
    this.subagents = this._register(new SubagentRegistry());
    /**
     * Phase 7 / S3.2. Tool-permission deferreds parked inside
     * {@link Options.canUseTool}. Keyed by SDK `tool_use_id`.
     */
    this._pendingPermissions = new PendingRequestRegistry();
    /**
     * Phase 7 / S3.2. User-input deferreds parked for interactive tools
     * (`AskUserQuestion`, `ExitPlanMode`). Keyed by `ChatInputRequest.id`.
     */
    this._pendingUserInputs = new PendingRequestRegistry();
    /**
     * Phase 11 — per-session **client-pushed** synced customization
     * snapshot + enablement map. Owns the workbench-supplied
     * {@link ISyncedCustomization} list, the per-URI enablement bits,
     * and the dirty flag drained at the next {@link send} pre-flight.
     * Exists from `createProvisional` onward so client-side reads /
     * toggles work uniformly before and after materialize.
     *
     * Server-side (SDK-discovered) customizations are NOT stored here
     * — they're fetched on demand from the live `Query` in
     * {@link getSessionCustomizations}.
     *
     * See {@link SessionClientCustomizationsDiff}.
     */
    this.clientCustomizationsDiff = this._register(new SessionClientCustomizationsDiff());
    this._onDidSessionProgress = this._register(new Emitter());
    this.onDidSessionProgress = this._onDidSessionProgress.event;
    /**
     * Real Copilot credits (in nano-AIU) billed by CAPI for the current
     * turn, summed across every `/v1/messages` request the SDK made
     * (including subagents). Fed by {@link recordTurnCredits} from the
     * proxy's `onDidReportCredits`, reset at the start of each {@link send},
     * and attached to the turn's `ChatUsage` signal by
     * {@link _enrichSignalWithCredits}. Unlike the SDK's `total_cost_usd`
     * (an Anthropic-list-price estimate), this is what CAPI actually bills.
     */
    this._currentTurnNanoAiu = 0;
    /**
     * Transport the session materialized under (Phase 19). Defaults to `proxy`
     * until {@link materialize} resolves it from {@link IMaterializeContext}.
     * Gates {@link _enrichSignalWithCredits} so native turns never carry a
     * Copilot credits overlay (the proxy is the only credit source).
     */
    this._transportKind = "proxy";
    /**
     * Set by {@link setModel} when a model change crosses transports (Copilot ↔
     * native) on an already-materialized session. Rather than hot-swapping the
     * live subprocess (which stays on the old transport), the switch is deferred:
     * the flag makes the next {@link send} pre-flight rebind. The agent resolves
     * the new transport at send time and hands it in via `switchTransport` (kept
     * in {@link _pendingSwitchTransport}); the rematerializer rebuilds onto it and
     * clears both on success. A failed rebuild leaves them set so the following
     * send retries. Exposed via {@link hasPendingTransportSwitch} so the agent
     * resolves a transport only when one is actually pending.
     */
    this._pendingTransportSwitch = false;
    // #endregion
    // #region Phase 11 — customizations / plugins
    /**
     * Merged fire-and-forget signal that this session's customization
     * surface changed. Fires from three sources:
     *
     * 1. Client-side writes (`adoptClientCustomizations`) — via the
     *    {@link SessionClientCustomizationsDiff} observable wired up in the
     *    constructor.
     * 2. Materialize completes — surfaces the server-side
     *    (SDK-discovered) tier to the workbench for the first time.
     * 3. The send() pre-flight rebind completes — the rebuilt SDK's
     *    resolved set may have changed.
     *
     * Drives a workbench refetch of {@link getSessionCustomizations}.
     * Does NOT itself trigger any SDK action — the dirty bit on
     * {@link SessionClientCustomizationsDiff} drives plugin rebinds,
     * and only flips on client-side writes.
     */
    this._onDidCustomizationsChange = this._register(new Emitter());
    this.onDidCustomizationsChange = this._onDidCustomizationsChange.event;
    /** Snapshot of the last {@link getSessionCustomizations} result, read by {@link _enrichSignalWithMcpContributor}. */
    this._lastCustomizations = [];
    this._clientChildEnablement = /* @__PURE__ */ new Map();
    this._clientPluginEnablement = /* @__PURE__ */ new Map();
    this._clientCustomizationEnablement = /* @__PURE__ */ new Map();
    this._chatChannelUri = chatChannelUri;
    this.project = project;
    this._register(this._configurationService.onDidRootConfigChange(() => this.markMcpConfigurationDirty()));
    this._register(this._authenticationService.onDidChangeAuthToken((event) => {
      if (event.resource === this._gitHubEndpointService.getCopilotResource().resource) {
        this.markMcpConfigurationDirty();
      }
    }));
    this._provisionalModel = model;
    this._provisionalAgent = agent;
    this.provisionalConfig = config;
    this.abortController = abortController;
    this._desiredAdditionalDirectories = additionalDirectories;
    this._appliedAdditionalDirectories = additionalDirectories;
    this._hostCustomizations = [];
    this.toolDiff = this._register(toolDiff);
    this._register(this.clientCustomizationsDiff.onDidChange(() => this._onDidCustomizationsChange.fire()));
    this._register(this._customizationEnablementService.onDidChange((event) => {
      if (!event.sessions.includes(this._configurationResource.toString())) {
        return;
      }
      this._mcpLaunchEnablementRevision++;
      this._onDidCustomizationsChange.fire();
      if (this._pipeline) {
        this._reconcileMcpServerEnablement(true).catch((error) => this._logService.error(error, `[Claude:${this.sessionId}] Failed to reconcile MCP enablement after customizations changed`));
      }
    }));
    this._watchCustomizations(this.workingDirectories);
  }
  get chatChannelUri() {
    return this._chatChannelUri;
  }
  get _configurationResource() {
    return URI.parse(parseRequiredSessionUriFromChatUri(this._chatChannelUri.toString()));
  }
  bindChatChannel(chatChannelUri) {
    if (this.isPipelineReady && this._chatChannelUri.toString() !== chatChannelUri.toString()) {
      throw new Error(`Cannot rebind materialized Claude session ${this.sessionId}`);
    }
    this._chatChannelUri = chatChannelUri;
  }
  /**
   * The actual directory work is done in. Defaults to {@link workspace} until
   * the host hands the session a resolved working directory (e.g. an isolated
   * worktree) at {@link materialize} time. `undefined` only when the session is
   * workspace-less and has no resolved directory yet.
   */
  get workingDirectory() {
    return this._workingDirectory ?? this.workspace;
  }
  /**
   * The full ordered working-directory set (index 0 = primary, 1..N =
   * desired additional roots). `undefined` only when the session has no
   * resolved primary yet (workspace-less, pre-materialize).
   */
  get workingDirectories() {
    const primary = this.workingDirectory;
    return primary ? [primary, ...this._desiredAdditionalDirectories] : void 0;
  }
  /** Exposed for the materializer's MCP-server build closure. */
  get pendingClientToolCalls() {
    return this._pendingClientToolCalls;
  }
  /** Snapshot of permission-mode fallback used when live read is undefined. */
  get permissionModeFallback() {
    return this._permissionModeFallback;
  }
  static createProvisional(sessionId, chatChannelUri, workspace, project, model, agent, config, pendingClientToolCalls, permissionModeFallback, instantiationService, additionalDirectories = []) {
    return instantiationService.createInstance(
      ClaudeAgentSession,
      sessionId,
      chatChannelUri,
      workspace,
      project,
      model,
      agent,
      config,
      new AbortController(),
      pendingClientToolCalls,
      new SessionClientToolsDiff(),
      permissionModeFallback,
      additionalDirectories
    );
  }
  /**
   * Accumulate proxy-reported billed credits for the in-flight turn.
   * Called from {@link ClaudeAgent} for every proxy `onDidReportCredits`
   * routed to this session. Ignores non-positive / non-finite values.
   */
  recordTurnCredits(totalNanoAiu) {
    if (Number.isFinite(totalNanoAiu) && totalNanoAiu > 0) {
      this._currentTurnNanoAiu += totalNanoAiu;
    }
  }
  /**
   * Inject the turn's accumulated Copilot credits into its `ChatUsage`
   * signal as `_meta.copilotUsage.totalNanoAiu` — the well-known key the
   * workbench prefers over `_meta.cost` when rendering per-turn credits.
   * All other signals pass through untouched.
   */
  _enrichSignalWithCredits(signal) {
    if (this._transportKind !== "proxy" || signal.kind !== "action" || signal.action.type !== "chat/usage" /* ChatUsage */ || this._currentTurnNanoAiu <= 0) {
      return signal;
    }
    const usage = signal.action.usage;
    return {
      ...signal,
      action: {
        ...signal.action,
        usage: {
          ...usage,
          _meta: {
            ...usage._meta,
            copilotUsage: { totalNanoAiu: this._currentTurnNanoAiu }
          }
        }
      }
    };
  }
  /**
   * Stamps the MCP {@link ToolCallContributor} onto a `ChatToolCallStart` for
   * an external `mcp__<server>__<tool>` call, resolved from this session's
   * cached customization snapshot. Owned here because the session owns the
   * customization data; the stream mapper stays free of it. (The in-process
   * `mcp__client__` server already carries a Client contributor from the mapper.)
   */
  _enrichSignalWithMcpContributor(signal) {
    if (signal.kind !== "action" || signal.action.type !== "chat/toolCallStart" /* ChatToolCallStart */ || signal.action.contributor !== void 0) {
      return signal;
    }
    const toolName = signal.action.toolName;
    if (!toolName.startsWith("mcp__")) {
      return signal;
    }
    const serverName = toolName.split("__")[1];
    const customizationId2 = serverName ? findMcpChildId(this._lastCustomizations, serverName) : void 0;
    if (customizationId2 === void 0) {
      return signal;
    }
    return { ...signal, action: { ...signal.action, contributor: { kind: "mcp" /* MCP */, customizationId: customizationId2 } } };
  }
  setHostCustomizations(customizations) {
    this._hostCustomizations = customizations;
  }
  markMcpConfigurationDirty() {
    if (this._pipeline) {
      this.clientCustomizationsDiff.markDirty();
    }
  }
  _watchCustomizations(directories) {
    const store = new DisposableStore();
    const watcher = store.add(new ClaudeCustomizationWatcher(
      directories,
      this._environmentService.userHome,
      this._fileService,
      this._logService
    ));
    store.add(watcher.onDidChange(() => this._onDidCustomizationsChange.fire()));
    this._mcpDiscovery = directories?.length ? store.add(new SessionMcpDiscovery(directories, this._fileService)) : void 0;
    if (this._mcpDiscovery) {
      store.add(this._mcpDiscovery.onDidChange(() => {
        this.clientCustomizationsDiff.markDirty();
        this._onDidCustomizationsChange.fire();
      }));
    }
    this._customizationWatcher.value = store;
  }
  /**
   * In-place truncation to `turnId` ("Restore Checkpoint"): prune the
   * per-turn DB rows (file edits, checkpoint refs) past the boundary AND
   * stage the SDK resume anchor that the next rebuild applies via
   * `Options.resumeSessionAt`. These two halves are one invariant — pruning
   * without staging the anchor would drop DB rows while the SDK still
   * replays the truncated turns; staging without pruning would leave stale
   * rows — so they live behind a single call rather than two the caller
   * could half-invoke. The prune runs first because it is the fallible half:
   * a DB failure then rejects without leaving an anchor staged for the next
   * turn. `turnId` is the protocol turn id (DB key); `resumeAnchorUuid` is
   * the SDK assistant-message uuid the agent resolved for it.
   */
  async truncateToTurn(turnId, resumeAnchorUuid, resource) {
    await this._withDatabase(resource, (db) => db.deleteTurnsAfter(turnId));
    this._pendingResumeSessionAt = resumeAnchorUuid;
  }
  /** Prunes all per-turn DB rows (remove-all truncation). */
  async pruneAllTurns(resource) {
    await this._withDatabase(resource, (db) => db.deleteAllTurns());
  }
  /**
   * Runs `fn` against a short-lived, ref-counted session DB handle so the
   * write is safe regardless of the pipeline's own dbRef lifecycle (the
   * ref-count keeps the shared DB alive; disposing only decrements).
   */
  async _withDatabase(resource, fn) {
    const ref = this._sessionDataService.openDatabase(resource);
    try {
      await fn(ref.object);
    } finally {
      ref.dispose();
    }
  }
  /**
   * Bring the session up: build SDK `Options`, start the SDK, open the
   * session-scoped DB ref, construct the pipeline, and attach the
   * rematerializer used for yield-restart (e.g. after a client-tool
   * snapshot change). Idempotent on re-call: extra calls throw rather
   * than silently re-materialize.
   *
   * If the supplied {@link IMaterializeContext.proxyHandle}'s underlying
   * `abortController` fires while `sdk.startup()` is in flight, the SDK
   * unwinds via the controller; if `startup` resolves anyway, the
   * `WarmQuery` is asyncDisposed and a {@link CancellationError} is
   * thrown (Q8 belt-and-suspenders).
   */
  async materialize(ctx) {
    if (this._pipeline) {
      throw new Error("ClaudeAgentSession is already materialized");
    }
    await this._customizationEnablementService.initializeSession(this._configurationResource.toString());
    if (ctx.customizations) {
      this._hostCustomizations = ctx.customizations;
    }
    const previousWorkingDirectories = this.workingDirectories;
    const resolvedPrimary = ctx.workingDirectories?.[0] ?? ctx.workingDirectory;
    if (resolvedPrimary && !isEqual2(resolvedPrimary, this.workingDirectory)) {
      this._workingDirectory = resolvedPrimary;
    }
    if (ctx.workingDirectories && ctx.workingDirectories.length > 0) {
      this._desiredAdditionalDirectories = ctx.workingDirectories.slice(1);
      this._appliedAdditionalDirectories = this._desiredAdditionalDirectories;
    }
    const currentWorkingDirectories = this.workingDirectories;
    if (!areSessionWorkingDirectoriesEqual(previousWorkingDirectories, currentWorkingDirectories, true)) {
      this._watchCustomizations(currentWorkingDirectories);
    }
    if (!this.workingDirectory) {
      throw new Error(`Cannot materialize Claude session ${this.sessionId}: workingDirectory is required`);
    }
    this._transportKind = ctx.transport.kind;
    this._materializedTransport = ctx.transport;
    const permissionMode = resolveCurrentPermissionMode(this._configurationService, ctx.configResource, this._inheritedPermissionMode, this._permissionModeFallback);
    const plugins = this._desiredClientPluginConfigs();
    this.clientCustomizationsDiff.consume(plugins.map((plugin) => plugin.uri));
    const mcpLaunchEnablementRevision = this._mcpLaunchEnablementRevision;
    const { mcpServers, deniedMcpServers, allowedTools } = await this._buildStartupToolWiring(ctx.resource, ctx.serverToolHost);
    const agentName = await resolveClaudeAgentName(this._provisionalAgent, this._fileService, this._logService, this.sessionId);
    const telemetry = await this._otelService.getNativeSdkTelemetryConfig();
    const traceContext = this._otelService.getSessionTraceContext(this.sessionId, ctx.resource.toString());
    const options = await buildOptions(
      {
        sessionId: this.sessionId,
        workingDirectory: this.workingDirectory,
        additionalDirectories: this._appliedAdditionalDirectories,
        model: this._provisionalModel,
        abortController: this.abortController,
        permissionMode,
        canUseTool: ctx.canUseTool,
        onElicitation: ctx.onElicitation,
        isResume: ctx.isResume,
        resumeSessionAt: this._pendingResumeSessionAt,
        mcpServers,
        deniedMcpServers,
        allowedTools,
        plugins,
        agent: agentName,
        telemetry,
        traceContext,
        getUserPromptAdditionalContext: () => this._hostInstructions?.join("\n\n")
      },
      ctx.transport,
      (data) => this._logService.error(`[Claude SDK stderr] ${data}`)
    );
    this._logService.info(`[Claude] session ${this.sessionId}: enableFileCheckpointing=${options.enableFileCheckpointing} isResume=${ctx.isResume}`);
    const warm = await this._sdkService.startup({ options });
    if (this.abortController.signal.aborted) {
      await warm[Symbol.asyncDispose]();
      throw new CancellationError();
    }
    const dbRef = this._sessionDataService.openDatabase(ctx.resource);
    let pipeline;
    try {
      pipeline = this._register(this._instantiationService.createInstance(
        ClaudeSdkPipeline,
        this.sessionId,
        this._chatChannelUri,
        ctx.resource,
        warm,
        this.abortController,
        dbRef,
        this.subagents,
        (toolName) => this.toolDiff.model.ownerOf(toolName)
      ));
    } catch (err) {
      dbRef.dispose();
      await warm[Symbol.asyncDispose]();
      throw err;
    }
    this._register(pipeline.onDidProduceSignal((s) => this._onDidSessionProgress.fire(this._enrichSignalWithMcpContributor(this._enrichSignalWithCredits(s)))));
    this._pipeline = pipeline;
    this._register(this._configurationService.onDidSessionConfigChange((event) => {
      if (!event.origin || event.session !== ctx.configResource.toString()) {
        return;
      }
      const inheritedMode = readClaudePermissionMode(this._configurationService, ctx.configResource);
      const mode = inheritedMode ?? this.permissionModeFallback;
      this.setInheritedPermissionMode(inheritedMode).catch((err) => {
        this._logService.warn(`[Claude:${this.sessionId}] mid-turn setPermissionMode(${mode}) failed`, err);
      });
    }));
    this._pendingResumeSessionAt = void 0;
    this._appliedMcpLaunchEnablementRevision = mcpLaunchEnablementRevision;
    pipeline.seedCurrentConfig(
      toClaudeSdkModelId(this._provisionalModel),
      toRuntimeEffortLevel(resolveClaudeEffort(this._provisionalModel)),
      permissionMode
    );
    if (this.abortController.signal.aborted) {
      throw new CancellationError();
    }
    pipeline.attachRematerializer(async (_reason) => {
      const liveMode = resolveCurrentPermissionMode(this._configurationService, ctx.configResource, this._inheritedPermissionMode, this._permissionModeFallback);
      const rebuildAbort = new AbortController();
      let rebuildWarm;
      try {
        const rebuildTransport = this._pendingSwitchTransport ?? this._materializedTransport;
        if (!rebuildTransport) {
          throw new Error(`Cannot rebuild Claude session ${this.sessionId}: no transport resolved`);
        }
        this._watchCustomizations(this.workingDirectories);
        const rebuildPlugins = this._desiredClientPluginConfigs();
        this.clientCustomizationsDiff.consume(rebuildPlugins.map((plugin) => plugin.uri));
        const rebuildMcpLaunchEnablementRevision = this._mcpLaunchEnablementRevision;
        const { mcpServers: rebuildMcp, deniedMcpServers: rebuildDeniedMcpServers, allowedTools: rebuildAllowedTools } = await this._buildStartupToolWiring(ctx.resource, ctx.serverToolHost);
        const rebuildAgentName = await resolveClaudeAgentName(this._provisionalAgent, this._fileService, this._logService, this.sessionId);
        const rebuildOptions = await buildOptions(
          {
            sessionId: this.sessionId,
            workingDirectory: this.workingDirectory,
            additionalDirectories: this._desiredAdditionalDirectories,
            model: this._provisionalModel,
            abortController: rebuildAbort,
            permissionMode: liveMode,
            canUseTool: ctx.canUseTool,
            onElicitation: ctx.onElicitation,
            isResume: true,
            resumeSessionAt: this._pendingResumeSessionAt,
            mcpServers: rebuildMcp,
            deniedMcpServers: rebuildDeniedMcpServers,
            allowedTools: rebuildAllowedTools,
            plugins: rebuildPlugins,
            agent: rebuildAgentName,
            telemetry,
            traceContext,
            getUserPromptAdditionalContext: () => this._hostInstructions?.join("\n\n")
          },
          rebuildTransport,
          (data) => this._logService.error(`[Claude SDK stderr] ${data}`)
        );
        this._logService.info(`[Claude] session ${this.sessionId}: resume rebuild agent=${rebuildOptions.agent ?? "(none)"}`);
        rebuildWarm = await this._sdkService.startup({ options: rebuildOptions });
        this._pendingResumeSessionAt = void 0;
        this._appliedMcpLaunchEnablementRevision = rebuildMcpLaunchEnablementRevision;
        this._appliedAdditionalDirectories = this._desiredAdditionalDirectories;
        this._transportKind = rebuildTransport.kind;
        this._materializedTransport = rebuildTransport;
        if (this._pendingSwitchTransport) {
          this._pendingTransportSwitch = false;
          this._pendingSwitchTransport = void 0;
        }
        return { warm: rebuildWarm, abortController: rebuildAbort };
      } catch (err) {
        rebuildAbort.abort();
        await rebuildWarm?.[Symbol.asyncDispose]();
        this.toolDiff.markDirty();
        this.clientCustomizationsDiff.markDirty();
        throw err;
      }
    });
    await this._reconcileMcpServerEnablement();
    ctx.serverToolHost?.advertise(ctx.resource.toString());
    this._onDidCustomizationsChange.fire();
  }
  /**
   * Build the SDK tool wiring shared by the initial materialize and every
   * yield-restart rematerialize: the in-process MCP servers plus the
   * auto-approve allow-list.
   *
   * The MCP servers are the workbench client tools (which round-trip to the
   * workbench) plus, when a server-tool host is wired, the agent host's own
   * server tools (executed in-process). `mcpServers` is `undefined` when
   * neither is present so `Options.mcpServers` is omitted entirely and the
   * SDK keeps its default; `allowedTools` carries the SDK-prefixed server tool
   * names (so they auto-approve without prompting) and is `undefined` when no
   * server-tool host is wired.
   *
   * Keeping both in one place ensures the two startup paths can never drift,
   * and that a newly registered server tool is wired everywhere at once.
   */
  async _buildStartupToolWiring(resource, serverToolHost) {
    const externalServers = await this._buildExternalMcpServers(await this._getGitHubMcpServerConfiguration());
    const clientServers = await buildClientMcpServers(this.toolDiff, this._pendingClientToolCalls, this._sdkService);
    const serverToolDefinitions = serverToolHost?.getDefinitionsForSession(resource.toString());
    const serverToolServer = serverToolHost && serverToolDefinitions?.length ? await buildServerToolMcpServer(serverToolHost, this._chatChannelUri.toString(), this._sdkService, serverToolDefinitions) : void 0;
    const mcpServers = Object.keys(externalServers.servers).length === 0 && !clientServers && !serverToolServer ? void 0 : {
      ...externalServers.servers,
      ...clientServers ?? {},
      ...serverToolServer ? { [CLAUDE_SERVER_TOOL_MCP_SERVER_NAME]: serverToolServer } : {}
    };
    const autoApproveToolNames = serverToolHost && serverToolDefinitions ? serverToolDefinitions.filter((definition) => !serverToolHost.canRequireConfirmation(definition.name)).map((definition) => definition.name) : void 0;
    return {
      mcpServers,
      deniedMcpServers: externalServers.deniedServers,
      allowedTools: autoApproveToolNames ? serverToolAllowList(autoApproveToolNames) : void 0
    };
  }
  async _getGitHubMcpServerConfiguration() {
    const resource = this._gitHubEndpointService.getCopilotResource();
    const token = this._authenticationService.getAuthToken({
      resource: resource.resource,
      scopes: resource.scopes_supported
    });
    if (!token || this._configurationService.getRootValue(platformRootSchema, AgentHostGitHubMcpServerEnabledConfigKey) === false) {
      return void 0;
    }
    try {
      return await resolveGitHubMcpServerConfiguration(this._copilotApiService, token);
    } catch (error) {
      this._logService.warn(`[Claude:${this.sessionId}] Failed to resolve the GitHub MCP server endpoint: ${error instanceof Error ? error.message : String(error)}`);
      return void 0;
    }
  }
  async _buildExternalMcpServers(gitHubMcpServerConfiguration) {
    const primaryCwd = this.workingDirectory;
    if (!primaryCwd) {
      return { servers: {}, deniedServers: [] };
    }
    const definitions2 = /* @__PURE__ */ new Map();
    const discoveredDefinitions = await this._mcpDiscovery?.refresh() ?? [];
    let hasGitHubMcpServer = gitHubMcpServerConfiguration ? discoveredDefinitions.some((definition) => isGitHubMcpServerDefinition(definition, gitHubMcpServerConfiguration)) : false;
    const discoveredCandidates = discoveredDefinitions.map((definition) => definition.customization);
    const discoveredResolution = resolveCustomizationEnablement(this._customizationEnablementService, this._configurationResource, discoveredCandidates);
    const discoveredEnablement = getSdkMcpServerEnablement(discoveredResolution);
    const deniedServers = [];
    for (const definition of discoveredDefinitions) {
      if (discoveredEnablement.get(definition.customization.id) !== true) {
        if (definition.defaultCwd && isEqual2(definition.defaultCwd, primaryCwd)) {
          deniedServers.push(toClaudeDeniedMcpServer(definition));
        }
        continue;
      }
      if (definition.defaultCwd && isEqual2(definition.defaultCwd, primaryCwd)) {
        continue;
      }
      definitions2.set(definition.name, definition);
    }
    for (const synced of this._desiredClientPlugins()) {
      if (!synced.pluginDir || !hasClientPluginMcpDefaultCwds(synced.customization)) {
        continue;
      }
      try {
        const parsed = await parsePlugin(synced.pluginDir, this._fileService, primaryCwd, this._environmentService.userHome, synced.pluginDir);
        if (gitHubMcpServerConfiguration && parsed.mcpServers.some((definition) => isGitHubMcpServerDefinition(definition, gitHubMcpServerConfiguration))) {
          hasGitHubMcpServer = true;
        }
        const candidate = { ...synced.customization, children: parsed.mcpServers.map((definition) => definition.customization) };
        const resolved = resolveCustomizationEnablement(this._customizationEnablementService, this._configurationResource, [candidate], this._clientChildEnablement, this._clientPluginEnablement);
        if (!isCustomizationSdkEligible(resolved, candidate)) {
          continue;
        }
        const enabledById = getSdkMcpServerEnablement(resolved);
        const internalCandidates = parsed.mcpServers.map((definition) => createClaudeInternalMcpServerCustomization(definition.name));
        const internalResolution = resolveCustomizationEnablement(this._customizationEnablementService, this._configurationResource, internalCandidates);
        const internalEnablement = getSdkMcpServerEnablement(internalResolution);
        for (let index = 0; index < parsed.mcpServers.length; index++) {
          const definition = parsed.mcpServers[index];
          if (enabledById.get(definition.customization.id) !== true || internalEnablement.get(internalCandidates[index].id) !== true) {
            deniedServers.push(toClaudeDeniedMcpServer(definition));
            continue;
          }
          definitions2.set(definition.name, {
            ...definition,
            defaultCwd: readClientPluginMcpDefaultCwd(synced.customization, definition.name, primaryCwd) ?? definition.defaultCwd
          });
        }
      } catch (error) {
        this._logService.warn(`[Claude:${this.sessionId}] Failed to parse MCP servers from '${synced.customization.uri}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (gitHubMcpServerConfiguration && !hasGitHubMcpServer) {
      const customization = createClaudeInternalMcpServerCustomization(GITHUB_MCP_SERVER_NAME);
      const definition = {
        name: GITHUB_MCP_SERVER_NAME,
        configuration: gitHubMcpServerConfiguration,
        uri: URI.parse(customization.uri),
        customization
      };
      const resolution = resolveCustomizationEnablement(this._customizationEnablementService, this._configurationResource, [customization]);
      if (getSdkMcpServerEnablement(resolution).get(customization.id) === true) {
        definitions2.set(GITHUB_MCP_SERVER_NAME, definition);
      } else {
        deniedServers.push(toClaudeDeniedMcpServer(definition));
      }
    }
    const converted = toClaudeMcpServers([...definitions2.values()], primaryCwd);
    for (const name of converted.skipped) {
      this._logService.warn(`[Claude:${this.sessionId}] Skipping MCP server '${name}' because its stdio working directory cannot be represented by the Claude SDK`);
    }
    return { servers: converted.servers, deniedServers };
  }
  /** True once {@link materialize} has installed the SDK pipeline. */
  get isPipelineReady() {
    return this._pipeline !== void 0;
  }
  /**
   * Whether this chat currently has a turn in flight or queued. False when
   * provisional (no pipeline) or idle between turns. Used by non-destructive
   * idle release to avoid disconnecting mid-turn.
   */
  get hasActiveTurn() {
    return this._pipeline?.hasActiveTurn ?? false;
  }
  /** Pre-materialize model selection accessor (read by materializer to build Options). */
  get provisionalModel() {
    return this._provisionalModel;
  }
  /**
   * Whether a per-session provider switch is staged and awaiting the next
   * {@link send}. The agent reads this to decide whether to resolve a fresh
   * transport (it owns the live proxy handle) and push it in via `switchTransport`
   * — resolving one only when a switch is actually pending, so ordinary sends
   * never trip the signed-out proxy throw.
   */
  get hasPendingTransportSwitch() {
    return this._pendingTransportSwitch;
  }
  _requirePipeline() {
    if (!this._pipeline) {
      throw new Error("ClaudeAgentSession is not materialized");
    }
    return this._pipeline;
  }
  get isResumed() {
    return this._requirePipeline().isResumed;
  }
  /**
   * Abort the live SDK subprocess and await its full teardown so the
   * session id is released. No-op when the session was never materialized
   * (no subprocess to stop). Used by remove-all truncation before it
   * recreates a fresh session under the same id — the CLI keeps the id
   * locked until the old subprocess exits.
   */
  async shutdownLiveQuery() {
    await this._pipeline?.shutdownAndWait();
  }
  /**
   * Seed the pipeline's current + applied config cache from
   * materialize-time `Options`. The SDK already starts with these
   * values, so the cache prevents a redundant first `setModel` /
   * `applyFlagSettings` call.
   */
  seedBijectiveState(state) {
    this._requirePipeline().seedCurrentConfig(state.model, state.effort, state.permissionMode);
  }
  attachRematerializer(rematerializer) {
    this._requirePipeline().attachRematerializer(rematerializer);
  }
  /**
   * Send a user prompt. Performs the per-turn pre-flight before
   * yielding to the pipeline:
   *
   * - If {@link toolDiff} or {@link clientCustomizationsDiff} reports the
   *   live `Query` is out of sync with the workbench's view, yield-restart
   *   so the SDK picks up the new `Options.mcpServers` / `Options.plugins`.
   *   `Query.reloadPlugins()` cannot help here — the SDK's plugin URI set
   *   is captured at startup, so any add / remove / nonce-bump must go
   *   through a full rebuild. The rebind itself re-applies the live
   *   `permissionMode` via the rematerializer.
   * - Otherwise forward the live `permissionMode` to the bound `Query` so
   *   a `SessionConfigChanged` action that arrived between turns wins.
   *   The pipeline's bijective cache dedupes a no-op `setPermissionMode`,
   *   so this is free when nothing changed.
   *
   * When {@link hasPendingTransportSwitch} is set, the agent resolves the new
   * transport (it owns the live proxy handle) and passes it as `switchTransport`.
   * It is staged for the pre-flight rebuild below, which rebinds the subprocess
   * onto it. The agent resolves one only when a switch is pending, so ordinary
   * sends never carry a transport and the session never calls back to re-resolve.
   *
   * Model / effort are not threaded through here — the pipeline's current
   * model / effort (set eagerly via {@link setModel}) is whatever
   * the SDK has been told.
   */
  async send(prompt, turnId, resource, workingDirectories, switchTransport, hostInstructions, clientContext) {
    const pipeline = this._requirePipeline();
    if (workingDirectories) {
      this._replaceDesiredWorkingDirectories(workingDirectories);
    }
    if (switchTransport) {
      this._pendingSwitchTransport = switchTransport;
    }
    this._currentTurnNanoAiu = 0;
    if (this.toolDiff.hasDifference || this.clientCustomizationsDiff.hasDifferenceFrom(this._desiredClientPluginPaths()) || this._appliedMcpLaunchEnablementRevision !== this._mcpLaunchEnablementRevision || this._pendingResumeSessionAt !== void 0 || !areAdditionalWorkingDirectoriesEqual(this._appliedAdditionalDirectories, this._desiredAdditionalDirectories) || this._pendingTransportSwitch) {
      await this._rebindForSyncedState();
    } else {
      await pipeline.setPermissionMode(resolveCurrentPermissionMode(this._configurationService, resource, this._inheritedPermissionMode, this._permissionModeFallback));
    }
    await this._reconcileMcpServerEnablement();
    this._hostInstructions = hostInstructions;
    try {
      await pipeline.send(prompt, turnId, clientContext);
    } finally {
      this._hostInstructions = void 0;
    }
  }
  _replaceDesiredWorkingDirectories(workingDirectories) {
    const primary = this.workingDirectory;
    if (!primary || !isEqual2(primary, workingDirectories[0])) {
      throw new Error(`Cannot change Claude session primary working directory: ${this.sessionId}`);
    }
    const desiredAdditionalDirectories = workingDirectories.slice(1);
    if (areAdditionalWorkingDirectoriesEqual(this._desiredAdditionalDirectories, desiredAdditionalDirectories)) {
      return;
    }
    this._desiredAdditionalDirectories = desiredAdditionalDirectories;
  }
  /**
   * Single yield-restart that covers both client-tool and
   * customization divergence in one trip. Drains the parked
   * client-tool MCP handlers (same as the original tool-only
   * rebind), then triggers the pipeline rebind — the rematerializer
   * reads `toolDiff` and reducer-backed client plugin paths while
   * building the new `Options`, so the bit on each diff clears in
   * lockstep with the SDK actually receiving the new values. Fires
   * `_onDidCustomizationsChange` afterwards so the workbench
   * refetches `getSessionCustomizations` and picks up any newly
   * resolved server-side entries from the rebuilt `Query`.
   */
  async _rebindForSyncedState() {
    this._pendingClientToolCalls.rejectAll(new CancellationError());
    await this._requirePipeline().rebindForRestart();
    this._onDidCustomizationsChange.fire();
  }
  /**
   * Cancel the in-flight SDK turn. Mirrors the production reference;
   * see {@link ClaudeSdkPipeline.abort}. Also denies any parked
   * permission / user-input requests so the SDK's `canUseTool`
   * callback (and any interactive tool waiting on user input) unwinds
   * with a deny / cancel result instead of leaving stale UI behind.
   */
  abort() {
    this._pendingPermissions.denyAll(false);
    this._pendingUserInputs.denyAll({ response: "cancel" /* Cancel */ });
    this._requirePipeline().abort();
  }
  /**
   * Eagerly apply a model change and persist the new selection. Safe to
   * call before or after materialize:
   *
   * - Pre-materialize: stash the model on the session so the first SDK
   *   startup picks it up via `Options.model` / `Options.effort`.
   * - Post-materialize: queue the change on the pipeline; the SDK
   *   applies it on the NEXT user request via
   *   `Query.setModel` / `Query.applyFlagSettings`. `'max'` flows through
   *   unchanged — see {@link toRuntimeEffortLevel}.
   *
   * Persistence is host-owned; callers update the overlay separately.
   *
   * A change that crosses transports (Copilot ↔ native) on a live session
   * defers to a rebuild on the next {@link send} rather than hot-swapping.
   */
  async setModel(model) {
    this._provisionalModel = model;
    const parsed = parseClaudeModelSelection(model);
    const crossesTransport = this.isPipelineReady && parsed.explicitProvider && claudeTransportForProvider(parsed.provider) !== this._transportKind;
    if (crossesTransport) {
      this._pendingTransportSwitch = true;
      this._pipeline?.bufferConfigForRebind(toClaudeSdkModelId(model), toRuntimeEffortLevel(resolveClaudeEffort(model)));
    } else if (this._pipeline) {
      this._pendingTransportSwitch = false;
      this._pendingSwitchTransport = void 0;
      await this._pipeline.setModel(toClaudeSdkModelId(model));
      await this._pipeline.setEffort(toRuntimeEffortLevel(resolveClaudeEffort(model)));
    }
  }
  /**
   * Pre-materialize custom-agent selection accessor.
   */
  get provisionalAgent() {
    return this._provisionalAgent;
  }
  /**
   * Change (or clear with `undefined`) the selected custom agent for this
   * session. The SDK captures `Options.agent` at startup with no
   * working runtime control (`applyFlagSettings({ agent })` exists on
   * the SDK surface but doesn't actually swap the live agent), so
   * post-materialize calls flip {@link clientCustomizationsDiff}
   * dirty and the next `send()` pre-flight rebinds with the new agent
   * baked into the rebuilt `Query`. Persistence is host-owned; callers update
   * the overlay separately.
   */
  async setAgent(agent) {
    if (this._provisionalAgent === agent) {
      return;
    }
    this._provisionalAgent = agent;
    if (this._pipeline) {
      this.clientCustomizationsDiff.markDirty();
    }
  }
  /**
   * Inject a steering message. Builds the `priority: 'now'`
   * {@link SDKUserMessage} and hands it to the pipeline; the pipeline
   * inherits the parent's turnId (CONTEXT.md M10) and fires
   * `steering_consumed` when the SDK accepts it. No-op if the pipeline
   * is aborted.
   */
  injectSteering(steeringMessage) {
    const pipeline = this._requirePipeline();
    if (pipeline.isAborted) {
      return;
    }
    const contentBlocks = resolvePromptToContentBlocks(
      steeringMessage.message.text,
      steeringMessage.message.attachments
    );
    const sdkMessage = {
      type: "user",
      message: { role: "user", content: contentBlocks },
      session_id: this.sessionId,
      parent_tool_use_id: null,
      priority: "now",
      // Reuse the protocol PendingMessage.id as the SDK uuid — same
      // pattern as `ClaudeAgent.sendMessage` reusing turnId. The SDK's
      // `uuid` field is typed as a branded UUID, but the cast at the
      // boundary is the convention for both code paths.
      uuid: steeringMessage.id
    };
    pipeline.injectSteering(sdkMessage, steeringMessage.id);
  }
  /** Live permission-mode change. Forwards to the pipeline; the pipeline remembers it for re-application after a rebind. */
  setPermissionMode(mode) {
    return this._requirePipeline().setPermissionMode(mode);
  }
  setInheritedPermissionMode(mode) {
    this._inheritedPermissionMode = mode;
    if (!this._pipeline) {
      return Promise.resolve();
    }
    return this._pipeline.setPermissionMode(mode ?? this._permissionModeFallback);
  }
  // #region Phase 7 / S3.2 — pending state
  /**
   * Atomically register a pending-permission deferred and fire the
   * `pending_confirmation` signal. The SDK is blocked on the returned
   * promise inside its `canUseTool` callback until
   * {@link respondToPermissionRequest} resolves it. Resolves with
   * `false` if the pipeline is aborted.
   */
  requestPermission(args) {
    if (!this._pipeline || this._pipeline.isAborted) {
      return Promise.resolve(false);
    }
    return this._pendingPermissions.registerAndFire(args.toolUseID, () => {
      this._onDidSessionProgress.fire({
        kind: "pending_confirmation",
        chat: this._chatChannelUri,
        state: args.state,
        permissionKind: args.permissionKind,
        ...args.permissionPath !== void 0 ? { permissionPath: args.permissionPath } : {},
        ...args.parentToolCallId !== void 0 ? { parentToolCallId: args.parentToolCallId } : {}
      });
    });
  }
  respondToPermissionRequest(requestId, approved) {
    return this._pendingPermissions.respond(requestId, approved);
  }
  /**
   * Fire a {@link ActionType.ChatInputRequested} action and park on
   * a deferred until {@link respondToUserInputRequest} resolves it.
   * Resolves with `{ response: Cancel }` if the pipeline is aborted.
   */
  requestUserInput(request, parentToolCallId) {
    if (!this._pipeline || this._pipeline.isAborted || !this._pipeline.hasActiveTurn) {
      return Promise.resolve({ response: "cancel" /* Cancel */ });
    }
    return this._pendingUserInputs.registerAndFire(request.id, () => {
      this._onDidSessionProgress.fire({
        kind: "action",
        resource: this._chatChannelUri,
        action: {
          type: "chat/inputRequested" /* ChatInputRequested */,
          request
        },
        ...parentToolCallId !== void 0 ? { parentToolCallId } : {}
      });
    });
  }
  respondToUserInputRequest(requestId, response, answers) {
    return this._pendingUserInputs.respond(requestId, { response, answers });
  }
  // #endregion
  // #region Phase 10 — client tools
  /** Replace a client's registered tools (full replacement). */
  setClientTools(clientId, tools) {
    this.toolDiff.model.setTools(clientId, tools);
  }
  /** This client's registered tools (empty when absent). */
  getClientTools(clientId) {
    return this.toolDiff.model.getTools(clientId);
  }
  /** Remove a client's tool contribution from this session. */
  removeClientTools(clientId) {
    this.toolDiff.model.removeClient(clientId);
  }
  /** Remove a client's customization contribution from this session. */
  removeClientCustomizations(clientId) {
    this.clientCustomizationsDiff.model.removeClient(clientId);
    if (this._clientCustomizationEnablement.delete(clientId)) {
      this._rebuildClientCustomizationEnablement();
    }
  }
  /**
   * Resolve a parked client-tool MCP handler with the workbench-supplied
   * result. Returns `true` if a matching deferred was found and settled.
   * Unknown ids are a benign no-op — `agentSideEffects.ts` forwards every
   * `ChatToolCallComplete` envelope, so SDK-owned tool completions land
   * here too and must NOT throw.
   */
  completeClientToolCall(toolCallId, result) {
    const converted = convertToolCallResult(result, toolCallId);
    return this._pendingClientToolCalls.respond(toolCallId, converted);
  }
  /**
   * Drive a yield-restart so the SDK picks up the new client-tool set
   * on its next user request. Public entry point for callers that need
   * to force a tool-only rebind; internal pre-flight goes through
   * {@link _rebindForSyncedState}.
   */
  async rebindForClientTools() {
    await this._rebindForSyncedState();
  }
  /**
   * Adopt the result of a global {@link IAgentPluginManager.syncCustomizations}
   * pass (**client-pushed** path). The agent owns the manager (it's
   * a process-wide singleton with a shared on-disk cache) and pushes
   * the resulting snapshot down here. Flips the client-side dirty bit
   * so the next {@link send} pre-flight reloads SDK plugins.
   */
  adoptClientCustomizations(clientId, synced, customizations) {
    this.clientCustomizationsDiff.model.setSyncedCustomizations(clientId, synced);
    const pluginEnablement = /* @__PURE__ */ new Map();
    const childEnablement = /* @__PURE__ */ new Map();
    for (const customization of customizations) {
      pluginEnablement.set(customization.uri.toString(), customization);
      if (customization.childEnablement !== void 0) {
        childEnablement.set(customization.uri.toString(), customization.childEnablement);
      }
    }
    this._clientCustomizationEnablement.delete(clientId);
    this._clientCustomizationEnablement.set(clientId, { pluginEnablement, childEnablement });
    this._rebuildClientCustomizationEnablement();
  }
  /**
   * Snapshot of the **client-pushed** customizations on this session.
   * Does NOT include server-side (SDK-discovered) entries — use
   * {@link getSessionCustomizations} for the merged view.
   */
  getClientCustomizations() {
    return this.clientCustomizationsDiff.model.state.get().synced;
  }
  _rebuildClientCustomizationEnablement() {
    this._clientChildEnablement.clear();
    this._clientPluginEnablement.clear();
    for (const enablement of this._clientCustomizationEnablement.values()) {
      for (const [uri, plugin] of enablement.pluginEnablement) {
        this._clientPluginEnablement.set(uri, plugin);
      }
      for (const [uri, children] of enablement.childEnablement) {
        this._clientChildEnablement.set(uri, children);
      }
    }
  }
  /**
   * Project the union of (a) **client-pushed** customizations and
   * (b) the **server-side** (SDK-discovered) view (commands / agents
   * / MCP servers, including those the SDK discovered on its own
   * from `~/.claude/**`) onto the protocol's
   * {@link Customization} surface, with reducer-backed enablement
   * applied to client-pushed entries.
   *
   * Pre-materialize sessions return only the client-pushed projection
   * — the SDK side has no Query to query yet. A failure to read the
   * SDK snapshot is warn-logged and the client-pushed projection is
   * still returned, so a transient SDK hiccup doesn't blank the UI.
   */
  async getSessionCustomizations() {
    const { synced } = this.clientCustomizationsDiff.model.state.get();
    const userHome = this._environmentService.userHome;
    const [multiRoot, rules, mcpServers, hooks] = await Promise.all([
      discoverClaudeMultiRootCustomizations(this.workingDirectories, userHome, this._fileService, this._logService),
      scanClaudeRules(this.workingDirectory, userHome, this._fileService),
      scanClaudeMcpServers(this.workingDirectory, userHome, this._fileService),
      scanClaudeHooks(this.workingDirectory, userHome, this._fileService)
    ]);
    let sdk;
    if (this._pipeline) {
      try {
        sdk = await this._pipeline.snapshotResolvedCustomizations();
      } catch (err) {
        this._logService.warn(`[Claude:${this.sessionId}] snapshotResolvedCustomizations failed`, err);
      }
    }
    const discoveredCustomizations = buildDiscoveredCustomizations([...multiRoot.discovered, ...rules], mcpServers, hooks, multiRoot.nativePlugins, multiRoot.workingDirectories, userHome, sdk);
    const state = this._hostCustomizations;
    const result = synced.map((item) => {
      const desired = state.find((customization) => customization.id === item.customization.id);
      if (desired?.type !== "plugin" /* Plugin */) {
        return item.customization;
      }
      if (desired.enablement?.length) {
        return { ...item.customization, enablement: [...desired.enablement] };
      }
      const { enablement: _enablement, ...withoutEnablement } = item.customization;
      return withoutEnablement;
    });
    result.push(...discoveredCustomizations);
    const projected = applyMcpServerEnablement(result, state);
    const enabled = resolveCustomizationEnablement(this._customizationEnablementService, this._configurationResource, projected, this._clientChildEnablement, this._clientPluginEnablement);
    this._lastCustomizations = enabled.customizations;
    return enabled.customizations;
  }
  _reconcileMcpServerEnablement(fromCustomizationChange = false) {
    const desired = this._getDesiredMcpServerEnablement();
    if (desired.size === 0) {
      this._lastReconciledMcpEnablement = desired;
      return Promise.resolve();
    }
    if (fromCustomizationChange && this._isMcpEnablementUnchanged(desired)) {
      return Promise.resolve();
    }
    return this._mcpEnablementSequencer.queue(() => this._doReconcileMcpServerEnablement());
  }
  async _doReconcileMcpServerEnablement() {
    const pipeline = this._requirePipeline();
    const desired = this._getDesiredMcpServerEnablement();
    if (desired.size === 0) {
      this._lastReconciledMcpEnablement = desired;
      return;
    }
    if (!await pipeline.reconcileMcpServerEnablement(desired)) {
      throw new Error(`Claude SDK cannot reconcile MCP server enablement`);
    }
    this._lastReconciledMcpEnablement = desired;
  }
  _getDesiredMcpServerEnablement() {
    const resolved = resolveCustomizationEnablement(
      this._customizationEnablementService,
      this._configurationResource,
      this._hostCustomizations,
      this._clientChildEnablement,
      this._clientPluginEnablement
    );
    const enabledById = getSdkMcpServerEnablement(resolved);
    return new Map(resolved.customizations.flatMap((customization) => {
      if (customization.type === "mcpServer" /* McpServer */) {
        return [[customization.name, enabledById.get(customization.id) ?? false]];
      }
      return (customization.children ?? []).flatMap((child) => child.type === "mcpServer" /* McpServer */ ? [[child.name, enabledById.get(child.id) ?? false]] : []);
    }));
  }
  _isMcpEnablementUnchanged(desired) {
    if (!this._lastReconciledMcpEnablement || desired.size !== this._lastReconciledMcpEnablement.size) {
      return false;
    }
    return [...desired].every(([name, enabled]) => this._lastReconciledMcpEnablement.get(name) === enabled);
  }
  _desiredClientPluginPaths() {
    return this._desiredClientPlugins().flatMap((synced) => synced.pluginDir ? [synced.pluginDir] : []);
  }
  _desiredClientPluginConfigs() {
    return this._desiredClientPlugins().flatMap((synced) => synced.pluginDir ? [{
      uri: synced.pluginDir,
      skipMcpDiscovery: hasClientPluginMcpDefaultCwds(synced.customization)
    }] : []);
  }
  _desiredClientPlugins() {
    const resolved = resolveCustomizationEnablement(this._customizationEnablementService, this._configurationResource, this.clientCustomizationsDiff.model.state.get().synced.map((item) => item.customization), this._clientChildEnablement, this._clientPluginEnablement);
    const desiredById = new Map(resolved.customizations.filter((customization) => isCustomizationSdkEligible(resolved, customization)).map((customization) => [customization.id, customization.type === "directory" /* Directory */ ? customization.enabled : isCustomizationEnabled(customization)]));
    return this.clientCustomizationsDiff.model.state.get().synced.filter(
      (synced) => (desiredById.get(synced.customization.id) ?? isCustomizationEnabled(synced.customization)) !== false
    );
  }
  async startMcpServer(id2) {
    const serverName = await this._resolveMcpServerName(id2);
    if (!serverName) {
      this._logService.warn(`[Claude:${this.sessionId}] Cannot start unknown MCP server customization ${id2}`);
      return;
    }
    const handled = await this._requirePipeline().startMcpServer(serverName);
    if (!handled) {
      await this._rebindForSyncedState();
    }
    this._onDidCustomizationsChange.fire();
  }
  async stopMcpServer(id2) {
    const serverName = await this._resolveMcpServerName(id2);
    if (!serverName) {
      this._logService.warn(`[Claude:${this.sessionId}] Cannot stop unknown MCP server customization ${id2}`);
      return;
    }
    const handled = await this._requirePipeline().stopMcpServer(serverName);
    if (!handled) {
      this._logService.warn(`[Claude:${this.sessionId}] MCP server stop is not supported by the current SDK`);
      return;
    }
    this._onDidCustomizationsChange.fire();
  }
  async _resolveMcpServerName(id2) {
    return findMcpServerName(this._lastCustomizations, id2) ?? findMcpServerName(await this.getSessionCustomizations(), id2);
  }
  // #endregion
  dispose() {
    this._pendingPermissions.denyAll(false);
    this._pendingUserInputs.denyAll({ response: "cancel" /* Cancel */ });
    this._pendingClientToolCalls.rejectAll(new CancellationError());
    super.dispose();
  }
};

ClaudeAgentSession = __decorateClass([
  __decorateParam(12, IInstantiationService),
  __decorateParam(13, IAgentConfigurationService),
  __decorateParam(14, IAgentHostOTelService),
  __decorateParam(15, IClaudeAgentSdkService),
  __decorateParam(16, ISessionDataService),
  __decorateParam(17, ILogService),
  __decorateParam(18, IFileService),
  __decorateParam(19, INativeEnvironmentService),
  __decorateParam(20, IAgentHostCustomizationEnablementService),
  __decorateParam(21, ICopilotApiService),
  __decorateParam(22, IAgentHostAuthenticationService),
  __decorateParam(23, IAgentHostGitHubEndpointService)
], ClaudeAgentSession);
export { resolveCurrentPermissionMode, isGitHubMcpServerDefinition, toClaudeDeniedMcpServer, ClaudeAgentSession };
