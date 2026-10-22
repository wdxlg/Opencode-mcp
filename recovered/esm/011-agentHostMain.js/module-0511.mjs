// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentSideEffects.ts
import { Disposable, DisposableStore } from "./module-0010.mjs";
import { NKeyMap } from "./module-0006.mjs";
import { AgentHostInputRequestTracker } from "./module-0490.mjs";
import { SessionPermissionManager } from "./module-0503.mjs";
import { getConfiguredSessionMode, getModelTelemetryContext, getTurnTelemetryContext } from "./module-0495.mjs";
import { autorun } from "./module-0068.mjs";
import { URI } from "./module-0023.mjs";
import { ROOT_STATE_URI, buildDefaultChatUri, buildSubagentChatUri, createErrorResponsePart, getErrorResponsePart, getInlineToolInput, getToolFileEdits, isAhpChatChannel, isSubagentChatUri, mergeLogicalTurnUsage, parseRequiredSessionUriFromChatUri, readUsageInfoMeta } from "./module-0047.mjs";
import { isChatAction } from "./module-0086.mjs";
import { createAgentChatContext, getSessionChatsForFanOut } from "./module-0479.mjs";
import { equals2 } from "./module-0035.mjs";
import { hasKey } from "./module-0008.mjs";
import { readToolCallMeta, toToolCallMeta } from "./module-0046.mjs";
import { generateUuid } from "./module-0042.mjs";
import { StopWatch } from "./module-0015.mjs";
import { createUnknownAgentHostClientTelemetryContext } from "./module-0054.mjs";
import { startTurn } from "./module-0496.mjs";
import { updateAgentHostTelemetryLevelFromConfig } from "./module-0266.mjs";
import { AgentSession } from "./module-0048.mjs";
import { targetForMcpServer, targetForPlugin } from "./module-0176.mjs";
import { SESSION_CUSTOM_TITLE_SOURCE_KEY, customChatTitleMetadataKey, customChatTitleSourceMetadataKey } from "./module-0482.mjs";
import { buildOpenSessionLinkForChatResource } from "./module-0230.mjs";
import { resolveChatAttachment } from "./module-0489.mjs";
import { resolveChatStateForUri } from "./module-0103.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { ILogService } from "./module-0084.mjs";
import { IAgentHostChangesetService } from "./module-0444.mjs";
import { ITelemetryService } from "./module-0053.mjs";
import { IAgentHostCheckpointService } from "./module-0131.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostChatContributions } from "./module-0487.mjs";
import { IAgentHostSessionTitleController } from "./module-0491.mjs";
import { IAgentHostTelemetryReporter } from "./module-0253.mjs";
import { IAgentHostTurnTracker } from "./module-0493.mjs";
import { IAgentHostToolCallTracker } from "./module-0494.mjs";
import { IAgentHostWorktreeIsolation } from "./module-0165.mjs";
import { getErrorCode } from "./module-0002.mjs";
import { stripProxyErrorMarker, toChatErrorMeta, tryParseForwardedChatError } from "./module-0278.mjs";


// src/vs/platform/agentHost/node/agentSideEffects.ts
var MAX_SUPERSEDED_CUSTOMIZATION_PUBLISH_RETRIES = 3;

function getCustomizationEnablementCandidates(customizations, mcpServerOwners) {
  const candidates = [];
  for (const customization of customizations ?? []) {
    if (customization.type === "plugin" /* Plugin */) {
      candidates.push({ customization });
      for (const child of customization.children ?? []) {
        if (child.type === "mcpServer" /* McpServer */) {
          candidates.push({ customization: child, owningPluginUri: customization.uri });
        }
      }
    } else if (customization.type === "mcpServer" /* McpServer */) {
      candidates.push({ customization, owningPluginUri: mcpServerOwners?.get(customization.name) });
    } else if (customization.type === "directory" /* Directory */) {
      for (const child of customization.children ?? []) {
        if (child.type === "mcpServer" /* McpServer */) {
          candidates.push({ customization: child });
        }
      }
    }
  }
  return candidates;
}

var AgentSideEffects = class extends Disposable {
  constructor(_stateManager, _customizationEnablementService, _options, _instantiationService, _logService, _changesets, _telemetryService, _checkpointService, _agentConfigService, _chatContributions, _titleController, _telemetryReporter, _turnTracker, _toolCallTracker, _worktree) {
    super();
    this._stateManager = _stateManager;
    this._customizationEnablementService = _customizationEnablementService;
    this._options = _options;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._changesets = _changesets;
    this._telemetryService = _telemetryService;
    this._checkpointService = _checkpointService;
    this._agentConfigService = _agentConfigService;
    this._chatContributions = _chatContributions;
    this._titleController = _titleController;
    this._telemetryReporter = _telemetryReporter;
    this._turnTracker = _turnTracker;
    this._toolCallTracker = _toolCallTracker;
    this._worktree = _worktree;
    /** Maps tool call IDs to the agent that owns them, for routing confirmations. */
    this._toolCallAgents = /* @__PURE__ */ new Map();
    /** Managed confirmations are human-only and must never seed host-side session permissions. */
    this._managedApprovalToolCalls = /* @__PURE__ */ new Set();
    this._resumedTurnExecutions = /* @__PURE__ */ new Map();
    this._lastAgentInfos = [];
    this._subagentChats = new NKeyMap();
    this._cancelledTurnIds = /* @__PURE__ */ new Map();
    /** Serializes refreshes per session so state-based deduplication observes the preceding dispatch. */
    this._pendingSessionCustomizationPublishes = /* @__PURE__ */ new Map();
    this._pendingCustomizationEnablementRefreshes = /* @__PURE__ */ new Set();
    /**
     * Buffers signals whose `parentToolCallId` references a subagent
     * whose `subagent_started` signal has not yet been processed. The SDK is
     * not strict about ordering: an inner `tool_start` can arrive before the
     * `subagent_started` that creates the child session. Without buffering,
     * those signals would be dispatched against the parent session and the
     * UI would render the inner tool calls flat at the top level rather than
     * grouping them under the subagent. Drained by `_handleSubagentStarted`.
     *
     */
    this._pendingSubagentSignals = new NKeyMap();
    this.onDidStartTurn = this._turnTracker.onDidStartTurn;
    this._inputRequestTracker = new AgentHostInputRequestTracker(this._telemetryReporter, void 0, (session, turnId) => this._turnTracker.getClientTelemetryContext(session, turnId));
    this._permissionManager = this._register(this._instantiationService.createInstance(SessionPermissionManager, this._stateManager, {}));
    this._register(this._stateManager.onDidSnapshotDefaultChatTitle((event) => this._persistDefaultChatTitleSnapshot(event.session, event.chat, event.title)));
    this._register(this._chatContributions.registerHost({
      hostLaunchKind: this._options.hostLaunchKind ?? "unknown" /* Unknown */,
      sendTurnMessage: (options) => void this._sendTurnMessage(options)
    }));
    this._register(this._stateManager.onDidChangeSessionConfig((e) => {
      const previousMode = getConfiguredSessionMode(e.previous);
      const currentMode = getConfiguredSessionMode(e.current);
      if (!previousMode || !currentMode || previousMode === currentMode) {
        return;
      }
      const agent = this._options.getAgent(e.session);
      const sessionState = this._stateManager.getSessionState(e.session);
      if (!agent || !sessionState) {
        return;
      }
      this._telemetryReporter.executionModeChanged(agent.id, e.session, previousMode, currentMode, sessionState.turns.length, e.clientContext);
    }));
    this._register(this._customizationEnablementService.onDidChange((event) => {
      for (const session of event.sessions) {
        const agent = this._options.getAgent(session);
        if (agent === void 0) {
          this._pendingCustomizationEnablementRefreshes.add(session);
        } else if (this._stateManager.getSessionState(session)?.customizations !== void 0) {
          this._publishSessionCustomizationsSoon(agent, session);
        }
      }
    }));
    this._register(autorun((reader) => {
      const agents = this._options.agents.read(reader);
      this._publishAgentInfos(agents, reader);
      this._publishPendingCustomizationEnablementRefreshes();
    }));
    this._register(this._stateManager.onDidEmitEnvelope((envelope) => {
      const action = envelope.action;
      if (action.type === "session/customizationToggled" /* SessionCustomizationToggled */) {
        const sessionState = this._stateManager.getSessionState(envelope.channel);
        const mcpServerOwners = this._options.getAgent(envelope.channel)?.getMcpServerOwners?.(URI.parse(envelope.channel));
        const customization = getCustomizationEnablementCandidates(sessionState?.customizations, mcpServerOwners).find((candidate) => candidate.customization.id === action.id);
        if (customization === void 0) {
          this._logService.warn(`[AgentSideEffects] Ignoring customization toggle for missing ${action.id} in ${envelope.channel}`);
        } else {
          this._recordCustomizationEnablement(envelope.channel, customization, action.enablement);
        }
      }
      if (isAhpChatChannel(envelope.channel) && isChatAction(envelope.action)) {
        const chatState = this._stateManager.getChatState(envelope.channel);
        const action2 = envelope.action;
        switch (action2.type) {
          case "chat/turnStarted" /* ChatTurnStarted */: {
            if (envelope.rejectionReason) {
              break;
            }
            const sessionChannel = parseRequiredSessionUriFromChatUri(envelope.channel);
            const previousTurn = chatState?.turns.at(-1);
            if (!this._stateManager.isEphemeralSession(sessionChannel) && previousTurn && previousTurn.id !== action2.turnId && getErrorResponsePart(previousTurn)?.resumable === true) {
              void this._checkpointService.discardTurnStartCheckpoint(URI.parse(sessionChannel), URI.parse(envelope.channel), previousTurn.id).catch((error) => {
                this._logService.warn(`[AgentSideEffects] Failed to discard checkpoint for superseded resumable turn ${previousTurn.id}`, error);
              });
            }
            break;
          }
          case "chat/inputRequested" /* ChatInputRequested */: {
            const turnId = chatState?.activeTurn?.id;
            const provider = this._options.getAgent(parseRequiredSessionUriFromChatUri(envelope.channel))?.id;
            if (turnId && provider) {
              this._inputRequestTracker.inputRequested(provider, envelope.channel, turnId, action2.request);
            }
            break;
          }
          case "chat/inputCompleted" /* ChatInputCompleted */:
            this._inputRequestTracker.inputCompleted(envelope.channel, action2, chatState);
            break;
          case "chat/turnComplete" /* ChatTurnComplete */:
          case "chat/turnCancelled" /* ChatTurnCancelled */:
          case "chat/error" /* ChatError */:
            this._inputRequestTracker.clearTurn(envelope.channel, action2.turnId);
            break;
          case "chat/truncated" /* ChatTruncated */:
            this._inputRequestTracker.clearChat(envelope.channel);
            break;
        }
        if (envelope.action.type === "chat/turnCancelled" /* ChatTurnCancelled */) {
          let turnIds = this._cancelledTurnIds.get(envelope.channel);
          if (!turnIds) {
            turnIds = /* @__PURE__ */ new Set();
            this._cancelledTurnIds.set(envelope.channel, turnIds);
          }
          turnIds.add(envelope.action.turnId);
          const sessionChannel = parseRequiredSessionUriFromChatUri(envelope.channel);
          void this._checkpointService.discardTurnStartCheckpoint(URI.parse(sessionChannel), URI.parse(envelope.channel), envelope.action.turnId).catch(() => void 0);
        }
      }
      if (!envelope.origin && envelope.action.type === "chat/toolCallComplete" /* ChatToolCallComplete */) {
        const action2 = envelope.action;
        if (isAhpChatChannel(envelope.channel)) {
          const sessionChannel = parseRequiredSessionUriFromChatUri(envelope.channel);
          this._notifyClientToolCallComplete(sessionChannel, envelope.channel, action2.toolCallId, action2.result, "server-envelope");
        }
      }
      if (envelope.action.type === "session/chatAdded" /* SessionChatAdded */) {
        for (const activeClient of this._stateManager.getSessionState(envelope.channel)?.activeClients ?? []) {
          this._fanOutActiveClient(envelope.channel, activeClient);
        }
      }
      this._chatContributions.didDispatchAction({
        channel: envelope.channel,
        session: isAhpChatChannel(envelope.channel) ? parseRequiredSessionUriFromChatUri(envelope.channel) : envelope.channel,
        action: envelope.action,
        ...envelope.rejectionReason !== void 0 ? { rejectionReason: envelope.rejectionReason } : {}
      });
    }));
  }
  _chatContext(session, chat) {
    return createAgentChatContext(this._stateManager, session, chat);
  }
  /**
   * The owning session's last host-published customization snapshot,
   * including user enablement toggles. `undefined` means the host has not
   * published a snapshot yet — distinct from an empty list, since the
   * provider must reconcile against its own state rather than treat "no
   * snapshot" as "no customizations".
   */
  _hostCustomizations(session) {
    return this._stateManager.getSessionState(session)?.customizations;
  }
  /** Hands a client's contribution to each exact chat Agent Host owns. */
  _fanOutActiveClient(session, activeClient) {
    const agent = this._options.getAgent(session);
    if (!agent) {
      return;
    }
    const chats = getSessionChatsForFanOut(this._stateManager, session);
    if (!chats) {
      this._logService.warn(`[AgentSideEffects] Skipping active-client fan-out for session without host state: session=${session}, clientId=${activeClient.clientId}`);
      return;
    }
    const hostCustomizations = this._hostCustomizations(session);
    for (const chat of chats) {
      const handle = agent.getOrCreateActiveClient(chat, this._chatContext(session, chat.toString()), {
        clientId: activeClient.clientId,
        displayName: activeClient.displayName
      }, hostCustomizations);
      handle.tools = activeClient.tools;
      handle.customizations = activeClient.customizations ?? [];
    }
  }
  /**
   * Publishes agent descriptors using the last known model lists.
   */
  _publishAgentInfos(agents, reader) {
    const infos = agents.map((a) => {
      const d = a.getDescriptor();
      const protectedResources = a.getProtectedResources();
      const models = reader ? a.models.read(reader) : a.models.get();
      const customizations = a.getCustomizations?.();
      return {
        provider: d.provider,
        displayName: d.displayName,
        description: d.description,
        models: models.map((m) => ({
          id: m.id,
          provider: m.provider,
          name: m.name,
          maxContextWindow: m.maxContextWindow,
          maxOutputTokens: m.maxOutputTokens,
          maxPromptTokens: m.maxPromptTokens,
          supportsVision: m.supportsVision,
          policyState: m.policyState,
          configSchema: m.configSchema,
          _meta: m._meta
        })),
        customizations: customizations?.length ? [...customizations] : void 0,
        protectedResources: protectedResources.length > 0 ? protectedResources : void 0,
        capabilities: d.capabilities ? { ...d.capabilities } : void 0
      };
    });
    if (equals2(this._lastAgentInfos, infos)) {
      return;
    }
    this._lastAgentInfos = infos;
    this._stateManager.dispatchServerAction(ROOT_STATE_URI, { type: "root/agentsChanged" /* RootAgentsChanged */, agents: infos });
  }
  async _publishSessionCustomizations(agent, session, supersededRetries) {
    const currentBeforeFetch = this._stateManager.getSessionState(session)?.customizations;
    const chat = URI.parse(this._stateManager.getSessionState(session)?.defaultChat ?? buildDefaultChatUri(session));
    const customizations = await agent.getChatCustomizations(chat, this._chatContext(session, chat.toString()), currentBeforeFetch);
    const current = this._stateManager.getSessionState(session)?.customizations;
    if (current !== currentBeforeFetch) {
      if (supersededRetries < MAX_SUPERSEDED_CUSTOMIZATION_PUBLISH_RETRIES) {
        this._publishSessionCustomizationsSoon(agent, session, supersededRetries + 1);
      }
      return;
    }
    if (current && equals2(current, customizations)) {
      return;
    }
    this._stateManager.dispatchServerAction(session, {
      type: "session/customizationsChanged" /* SessionCustomizationsChanged */,
      customizations: [...customizations]
    });
  }
  _publishSessionCustomizationsSoon(agent, session, supersededRetries = 0) {
    const previous = this._pendingSessionCustomizationPublishes.get(session) ?? Promise.resolve();
    const publish = previous.then(() => this._publishSessionCustomizations(agent, session, supersededRetries)).catch((err) => {
      this._logService.error("[AgentSideEffects] getChatCustomizations failed", err);
    });
    this._pendingSessionCustomizationPublishes.set(session, publish);
    void publish.finally(() => {
      if (this._pendingSessionCustomizationPublishes.get(session) === publish) {
        this._pendingSessionCustomizationPublishes.delete(session);
      }
    });
  }
  _publishPendingCustomizationEnablementRefreshes() {
    for (const session of this._pendingCustomizationEnablementRefreshes) {
      const agent = this._options.getAgent(session);
      if (agent === void 0) {
        continue;
      }
      this._pendingCustomizationEnablementRefreshes.delete(session);
      this._publishSessionCustomizationsSoon(agent, session);
    }
  }
  _publishSessionCustomizationsForAgent(agent) {
    for (const session of this._stateManager.getSessionUris()) {
      if (this._options.getAgent(session) === agent) {
        this._publishSessionCustomizationsSoon(agent, session);
      }
    }
  }
  _publishAllSessionCustomizations() {
    for (const session of this._stateManager.getSessionUris()) {
      const agent = this._options.getAgent(session);
      if (agent) {
        this._publishSessionCustomizationsSoon(agent, session);
      }
    }
  }
  // ---- Initialization ----------------------------------------------------
  /**
   * Initializes async resources (tree-sitter WASM) used for command
   * auto-approval. Await this before any session events can arrive to
   * guarantee that auto-approval checks are fully synchronous.
   */
  initialize() {
    return this._permissionManager.initialize();
  }
  // ---- Agent registration -------------------------------------------------
  /**
   * Registers a progress-signal listener on the given agent so that
   * {@link AgentSignal}s are routed/dispatched through the state manager.
   * Returns a disposable that removes the listener.
   */
  registerProgressListener(agent) {
    const disposables = new DisposableStore();
    disposables.add(agent.onDidChatProgress((signal) => {
      this._handleAgentSignal(agent, signal);
    }));
    if (agent.onDidCustomizationsChange) {
      disposables.add(agent.onDidCustomizationsChange(() => {
        this._publishAgentInfos(this._options.agents.get());
        this._publishSessionCustomizationsForAgent(agent);
      }));
    }
    if (agent.authenticationRequired) {
      disposables.add(autorun((reader) => {
        const requirement = agent.authenticationRequired?.read(reader);
        if (requirement) {
          this._stateManager.emitAuthRequired(requirement);
        }
      }));
    }
    return disposables;
  }
  /**
   * Routes a single signal from `agent` to the correct session.
   *
   * Action signals with a `parentToolCallId` are routed to the matching
   * subagent session. If the subagent session does not exist yet (the SDK
   * can emit an inner `tool_start` before its `subagent_started`), the
   * signal is buffered in {@link _pendingSubagentSignals} and replayed
   * once the `subagent_started` arrives.
   */
  _handleAgentSignal(agent, signal) {
    if (signal.kind === "subagent_started") {
      this._handleSubagentStarted(signal.chat.toString(), signal.toolCallId, signal.agentName, signal.agentDisplayName, signal.agentDescription, signal.taskPrompt, signal.parentToolCallId);
      this._drainPendingSubagentSignals(signal.chat.toString(), signal.toolCallId);
      return;
    }
    if (signal.kind === "subagent_resumed") {
      this._resumeSubagentSession(signal.chat.toString(), signal.toolCallId, signal.message);
      return;
    }
    if (signal.kind === "subagent_completed") {
      this.completeSubagentSession(signal.chat.toString(), signal.toolCallId);
      return;
    }
    if (signal.kind === "steering_consumed") {
      this._stateManager.dispatchServerAction(signal.chat.toString(), {
        type: "chat/pendingMessageRemoved" /* ChatPendingMessageRemoved */,
        kind: "steering" /* Steering */,
        id: signal.id
      });
      return;
    }
    const signalResource = signal.kind === "action" || signal.kind === "model_call_completed" ? signal.resource.toString() : signal.chat.toString();
    if (signal.kind === "action" && !isChatAction(signal.action) && isAhpChatChannel(signalResource)) {
      throw new Error(`Session action ${signal.action.type} must not be dispatched on chat channel ${signalResource}`);
    }
    const sessionKey = signalResource;
    const parentToolCallId = signal.parentToolCallId;
    if (parentToolCallId) {
      const subagentSession = this._subagentChats.get(sessionKey, parentToolCallId);
      if (subagentSession) {
        const subTurnId = this._stateManager.getActiveTurnId(subagentSession.chatUri);
        if (subTurnId) {
          if (signal.kind === "model_call_completed") {
            this._recordModelCallCompleted(signal, subagentSession.chatUri, subTurnId, "remap");
          } else {
            this._dispatchActionForSession(signal, subagentSession.chatUri, subTurnId, "remap", agent);
          }
        } else {
          this._logService.error(`[AgentSideEffects] Dropping ${this._describeSignal(signal)} for inactive subagent ${sessionKey}/${parentToolCallId}`);
          if (signal.kind === "pending_confirmation") {
            agent.respondToPermissionRequest(signal.state.toolCallId, false);
          }
        }
        return;
      }
      const pendingSignals = this._pendingSubagentSignals.get(sessionKey, parentToolCallId);
      if (signal.kind === "pending_confirmation" && !pendingSignals) {
        this._logService.error(`[AgentSideEffects] Denying permission for unroutable subagent ${sessionKey}/${parentToolCallId}: toolCallId=${signal.state.toolCallId}`);
        agent.respondToPermissionRequest(signal.state.toolCallId, false);
        return;
      }
      this._logService.trace(`[AgentSideEffects] Buffering ${this._describeSignal(signal)} for pending subagent ${sessionKey}/${parentToolCallId}`);
      let buffer = pendingSignals;
      if (!buffer) {
        buffer = [];
        this._pendingSubagentSignals.set(buffer, sessionKey, parentToolCallId);
      }
      buffer.push({ signal, agent });
      return;
    }
    if (signal.kind === "pending_confirmation") {
      const subagentChatUri = this._findSubagentChatForToolCall(sessionKey, signal.state.toolCallId);
      if (subagentChatUri) {
        const subTurnId = this._stateManager.getActiveTurnId(subagentChatUri) ?? "";
        void this._handleToolReady(signal, subagentChatUri, subTurnId, agent).catch((err) => {
          this._logService.error("[AgentSideEffects] _handleToolReady failed", err);
        });
        return;
      }
    }
    const turnId = this._stateManager.getActiveTurnId(sessionKey);
    if (turnId) {
      if (signal.kind === "model_call_completed") {
        this._recordModelCallCompleted(signal, sessionKey, turnId, "preserve");
      } else {
        this._dispatchActionForSession(signal, sessionKey, turnId, "preserve", agent);
      }
      return;
    }
    if (signal.kind === "pending_confirmation") {
      void this._handleToolReady(signal, sessionKey, "", agent).catch((err) => {
        this._logService.error("[AgentSideEffects] _handleToolReady failed", err);
      });
      return;
    }
    if (signal.kind === "action") {
      const action = signal.action;
      if (action.type === "chat/turnComplete" /* ChatTurnComplete */ && this._cancelledTurnIds.get(sessionKey)?.has(action.turnId)) {
        this._logService.trace(`[AgentSideEffects] Dropping completion for cancelled turn ${action.turnId} on ${sessionKey}`);
        return;
      }
      this._stateManager.dispatchServerAction(sessionKey, action);
      if (action.type === "chat/turnComplete" /* ChatTurnComplete */) {
        this._runTurnCompleteSideEffects(sessionKey, void 0);
      }
    }
  }
  /**
   * Dispatches a signal to a resolved chat, preserving top-level turn identity or remapping cross-channel subagent actions.
   */
  _dispatchActionForSession(signal, sessionKey, turnId, turnIdRouting, agent) {
    if (signal.kind === "pending_confirmation") {
      if (agent) {
        void this._handleToolReady(signal, sessionKey, turnId, agent).catch((err) => {
          this._logService.error("[AgentSideEffects] _handleToolReady failed", err);
        });
      }
      return;
    }
    if (signal.kind !== "action") {
      return;
    }
    let action = signal.action;
    if (action.type !== "chat/truncated" /* ChatTruncated */ && hasKey(action, { turnId: true }) && action.turnId !== turnId) {
      if (turnIdRouting === "remap") {
        action = { ...action, turnId };
      } else {
        this._logService.trace(`[AgentSideEffects] Dropping stale ${action.type} for ${sessionKey}: producerTurnId=${action.turnId}, activeTurnId=${turnId}`);
        return;
      }
    }
    const attemptUsage = action.type === "chat/usage" /* ChatUsage */ ? action.usage : void 0;
    const resumedExecution = this._resumedTurnExecutions.get(this._resumedTurnExecutionKey(sessionKey, turnId));
    if (resumedExecution) {
      if (action.type === "chat/usage" /* ChatUsage */) {
        action = { ...action, usage: mergeLogicalTurnUsage(resumedExecution.usage, action.usage) ?? action.usage };
      } else if (action.type === "chat/turnComplete" /* ChatTurnComplete */ || action.type === "chat/turnCancelled" /* ChatTurnCancelled */ || action.type === "chat/error" /* ChatError */) {
        action = { ...action, duration: resumedExecution.duration + action.duration };
      }
    }
    if (action.type === "chat/toolCallStart" /* ChatToolCallStart */ && agent) {
      this._toolCallAgents.set(`${sessionKey}:${action.toolCallId}`, agent.id);
      const modelContext = this._turnTracker.getModelTelemetryContext(sessionKey, action.turnId);
      this._toolCallTracker.toolCallStarted(agent.id, sessionKey, action.turnId, action.toolCallId, action.toolName, action.contributor, modelContext?.model, modelContext?.modelTelemetryKind);
    } else if (action.type === "chat/toolCallReady" /* ChatToolCallReady */) {
      this._toolCallTracker.toolCallMetadataUpdated(sessionKey, action.toolCallId, action.contributor);
      if (action.confirmed) {
        this._toolCallTracker.toolCallExecutionStarted(sessionKey, action.toolCallId);
      }
    }
    if (action.type === "chat/usage" /* ChatUsage */) {
      const usageMeta = readUsageInfoMeta(attemptUsage ?? action.usage);
      this._turnTracker.updateDirectUsage(
        sessionKey,
        action.turnId,
        usageMeta.directTurnTokenTotals,
        usageMeta.directCopilotUsage?.totalNanoAiu
      );
      if (!isSubagentChatUri(sessionKey)) {
        this._turnTracker.updateBilledNanoAiu(sessionKey, action.turnId, usageMeta.copilotUsage?.totalNanoAiu);
      }
      if (action.usage.model && agent) {
        const modelContext = getModelTelemetryContext(agent, action.usage.model);
        this._turnTracker.updateModel(sessionKey, action.turnId, modelContext.model, modelContext.modelTelemetryKind);
        this._toolCallTracker.updateTurnModel(sessionKey, action.turnId, modelContext.model, modelContext.modelTelemetryKind);
      }
    }
    const sessionUri = isAhpChatChannel(sessionKey) ? parseRequiredSessionUriFromChatUri(sessionKey) : sessionKey;
    if ((action.type === "chat/toolCallStart" /* ChatToolCallStart */ || action.type === "chat/toolCallDelta" /* ChatToolCallDelta */ || action.type === "chat/toolCallReady" /* ChatToolCallReady */) && readToolCallMeta(action).toolKind === "subagent" && readToolCallMeta(action).subagentChatUri === void 0) {
      action = { ...action, _meta: { ...action._meta, subagentChatUri: buildSubagentChatUri(sessionUri, action.toolCallId) } };
    }
    if (action.type === "chat/toolCallComplete" /* ChatToolCallComplete */) {
      const subagent = this._subagentChats.get(sessionKey, action.toolCallId);
      if (subagent) {
        const parentState = this._stateManager.getSessionState(sessionKey);
        const runningContent = this._getRunningToolCallContent(parentState, turnId, action.toolCallId);
        const subagentEntry = runningContent.find((c) => hasKey(c, { type: true }) && c.type === "subagent" /* Subagent */);
        if (subagentEntry) {
          const mergedContent = [...action.result.content ?? [], subagentEntry];
          const merged = { ...action, result: { ...action.result, content: mergedContent } };
          action = merged;
        }
      }
    }
    this._stateManager.dispatchServerAction(sessionKey, action);
    if (hasKey(action, { turnId: true })) {
      this._turnTracker.markActivity(sessionKey, turnId, action.type);
    }
    if (action.type === "chat/delta" /* ChatDelta */ || action.type === "chat/responsePart" /* ChatResponsePart */ || action.type === "chat/toolCallStart" /* ChatToolCallStart */ || action.type === "chat/reasoning" /* ChatReasoning */) {
      this._turnTracker.markFirstProgress(sessionKey, turnId);
    }
    if (action.type === "chat/toolCallStart" /* ChatToolCallStart */) {
      this._turnTracker.toolCallStarted(sessionKey, turnId, action.toolCallId, action.toolName, action.contributor);
    } else if (action.type === "chat/toolCallReady" /* ChatToolCallReady */) {
      this._turnTracker.toolCallMetadataUpdated(sessionKey, turnId, action.toolCallId, action.contributor);
    }
    if (action.type === "chat/toolCallConfirmed" /* ChatToolCallConfirmed */ && !action.approved) {
      this._turnTracker.toolCallEnded(sessionKey, turnId, action.toolCallId);
    }
    if (action.type === "chat/toolCallComplete" /* ChatToolCallComplete */) {
      this._turnTracker.toolCallEnded(sessionKey, turnId, action.toolCallId);
      this._toolCallTracker.toolCallCompleted(sessionKey, action.toolCallId, action.result);
      this._pendingSubagentSignals.delete(sessionKey, action.toolCallId);
      if (getToolFileEdits(action.result).length > 0) {
        this._changesets.onToolCallEditsApplied(sessionUri, turnId, this._turnTracker.getClientTelemetryContext(sessionKey, turnId));
      }
    }
    if (action.type === "chat/turnComplete" /* ChatTurnComplete */) {
      const clientContext = this._turnTracker.getClientTelemetryContext(sessionKey, turnId);
      this._completeTurn(sessionKey, turnId, "success");
      this._toolCallTracker.clearSession(sessionKey);
      this._runTurnCompleteSideEffects(sessionKey, turnId, clientContext);
    }
    if (action.type === "chat/turnCancelled" /* ChatTurnCancelled */) {
      const clientContext = this._turnTracker.getClientTelemetryContext(sessionKey, turnId);
      this._completeTurn(sessionKey, turnId, "cancelled");
      this._toolCallTracker.clearSession(sessionKey);
      this._chatContributions.turnEnd({ session: sessionUri, channel: sessionKey, turnId, reason: { kind: "cancelled" }, clientContext });
    }
    if (action.type === "chat/error" /* ChatError */) {
      const clientContext = this._turnTracker.getClientTelemetryContext(sessionKey, turnId);
      this._completeTurn(sessionKey, turnId, "error", { stage: "provider", error: action.part.error });
      this._toolCallTracker.clearSession(sessionKey);
      this._chatContributions.turnEnd({
        session: sessionUri,
        channel: sessionKey,
        turnId,
        reason: { kind: "error", error: action.part.error, resumable: action.part.resumable === true },
        clientContext
      });
    }
    if (action.type === "chat/turnComplete" /* ChatTurnComplete */ || action.type === "chat/turnCancelled" /* ChatTurnCancelled */ || action.type === "chat/error" /* ChatError */) {
      this._resumedTurnExecutions.delete(this._resumedTurnExecutionKey(sessionKey, turnId));
    }
  }
  _resumedTurnExecutionKey(chat, turnId) {
    return `${chat}\0${turnId}`;
  }
  _recordModelCallCompleted(signal, sessionKey, turnId, turnIdRouting) {
    if (signal.turnId !== turnId && turnIdRouting === "preserve") {
      this._logService.trace(`[AgentSideEffects] Dropping stale model_call_completed for ${sessionKey}: producerTurnId=${signal.turnId}, activeTurnId=${turnId}`);
      return;
    }
    this._turnTracker.modelCallCompleted(sessionKey, turnId, signal.modelCallId);
  }
  /**
   * Records the turn's completion with the tracker. Returns whether a tracked turn
   * actually ended, so callers can skip end-of-turn side effects for a stale or
   * duplicate terminal action that ended nothing.
   */
  _completeTurn(channel, turnId, result, failure) {
    const sessionUri = isAhpChatChannel(channel) ? parseRequiredSessionUriFromChatUri(channel) : channel;
    const folderCount = this._agentConfigService.getEffectiveWorkingDirectories(sessionUri)?.length ?? 0;
    return this._turnTracker.turnCompleted(channel, turnId, result, failure, { isMultiRoot: folderCount > 1, folderCount });
  }
  _runTurnCompleteSideEffects(sessionKey, turnId, clientContext) {
    const sessionUri = isAhpChatChannel(sessionKey) ? parseRequiredSessionUriFromChatUri(sessionKey) : sessionKey;
    this._chatContributions.turnEnd({ session: sessionUri, channel: sessionKey, turnId, reason: { kind: "success" }, clientContext });
  }
  _describeSignal(signal) {
    return signal.kind === "action" ? `action(${signal.action.type})` : signal.kind;
  }
  /**
   * Replays any signals that were buffered while waiting for
   * `subagent_started` to create the subagent session. Called immediately
   * after `_handleSubagentStarted`.
   */
  _drainPendingSubagentSignals(parentChatURI, parentToolCallId) {
    const buffer = this._pendingSubagentSignals.get(parentChatURI, parentToolCallId);
    if (!buffer) {
      return;
    }
    this._pendingSubagentSignals.delete(parentChatURI, parentToolCallId);
    this._logService.trace(`[AgentSideEffects] Draining ${buffer.length} buffered signal(s) for subagent ${parentChatURI}/${parentToolCallId}`);
    for (const { signal, agent } of buffer) {
      this._handleAgentSignal(agent, signal);
    }
  }
  // ---- Subagent session management ----------------------------------------
  /**
   * Starts the subagent turn in response to a `subagent_started` event and
   * wires the parent tool call to the subagent chat. The subagent chat's
   * catalog membership is owned by the spawn channel
   * ({@link AgentService._onChatSpawned}), which the orchestrator applies
   * before this runs, so this only drives the turn/tracking/parent content
   * — it does not add the chat.
   *
   * `chatURI` is always the agent's top-level chat: the subagent is
   * registered (and inner events routed) under it because inner-tool
   * signals carry the top-level chat as their resource. `spawningToolParentId`,
   * when set, is the tool call one level up from the spawning `toolCallId`
   * — the tool call in whose (subagent) chat the spawning tool lives — and
   * is used to route the discovery content block to that immediate parent
   * chat. Since subagent chats are flat (keyed off the root session), this
   * one-hop reference resolves the parent chat at any nesting depth.
   */
  _handleSubagentStarted(chatURI, toolCallId, agentName, agentDisplayName, agentDescription, taskPrompt, spawningToolParentId) {
    const parentSessionUri = parseRequiredSessionUriFromChatUri(chatURI);
    const subagentChatUri = buildSubagentChatUri(parentSessionUri, toolCallId);
    const immediateParentChatUri = spawningToolParentId ? this._subagentChats.get(chatURI, spawningToolParentId)?.chatUri : chatURI;
    const contentChatUri = immediateParentChatUri ?? chatURI;
    const existing = this._subagentChats.get(chatURI, toolCallId);
    if (existing) {
      this._resumeSubagentSession(chatURI, toolCallId, taskPrompt ? { text: taskPrompt, origin: { kind: "user" /* User */ } } : void 0, immediateParentChatUri);
      return;
    }
    this._logService.info(`[AgentSideEffects] Starting subagent turn: ${subagentChatUri} (parent=${chatURI}, toolCallId=${toolCallId})`);
    const turnId = generateUuid();
    const parentTurnId = this._stateManager.getActiveTurnId(contentChatUri);
    const { parentClientContext, correlatedParentTurnId, initiatorClientId } = this._getSubagentParentTurnTelemetryContext(immediateParentChatUri, contentChatUri);
    this._stateManager.dispatchServerAction(subagentChatUri, {
      type: "chat/turnStarted" /* ChatTurnStarted */,
      turnId,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      message: { text: taskPrompt ?? "", origin: { kind: "user" /* User */ } }
    });
    const agent = this._options.getAgent(parentSessionUri);
    if (agent) {
      this._turnTracker.turnStarted(agent, subagentChatUri, turnId, void 0, void 0, "default", void 0, void 0, parentClientContext, initiatorClientId, correlatedParentTurnId, toolCallId, "tool" /* Tool */);
      this._turnTracker.setCurrentStage(subagentChatUri, turnId, "provider");
    }
    this._subagentChats.set({ parentChatUri: chatURI, immediateParentChatUri, toolCallId, sessionUri: parentSessionUri, chatUri: subagentChatUri, turnStopWatch: StopWatch.create(false) }, chatURI, toolCallId);
    if (parentTurnId) {
      const parentState = this._stateManager.getSessionState(contentChatUri);
      const existingContent = this._getRunningToolCallContent(parentState, parentTurnId, toolCallId);
      this._stateManager.dispatchServerAction(contentChatUri, {
        type: "chat/toolCallContentChanged" /* ChatToolCallContentChanged */,
        turnId: parentTurnId,
        toolCallId,
        content: [
          ...existingContent,
          {
            type: "subagent" /* Subagent */,
            resource: subagentChatUri,
            title: agentDisplayName,
            agentName,
            description: agentDescription
          }
        ]
      });
    }
  }
  /**
   * Gets the current content array from a running tool call, if any.
   */
  _getRunningToolCallContent(state, turnId, toolCallId) {
    if (!state?.activeTurn || state.activeTurn.id !== turnId) {
      return [];
    }
    for (const rp of state.activeTurn.responseParts) {
      if (rp.kind === "toolCall" /* ToolCall */ && rp.toolCall.toolCallId === toolCallId && rp.toolCall.status === "running" /* Running */) {
        return rp.toolCall.content ? [...rp.toolCall.content] : [];
      }
    }
    return [];
  }
  _turnDuration(stopWatch) {
    const elapsed = stopWatch?.elapsed();
    return typeof elapsed === "number" && Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  }
  _resumeSubagentSession(parentChatURI, toolCallId, message, immediateParentChatURI) {
    const subagent = this._subagentChats.get(parentChatURI, toolCallId);
    if (!subagent) {
      this._logService.error(`[AgentSideEffects] Cannot resume unknown subagent ${parentChatURI}/${toolCallId}`);
      return;
    }
    if (this._stateManager.getActiveTurnId(subagent.chatUri)) {
      return;
    }
    const turnId = generateUuid();
    const correlatedParentChatUri = immediateParentChatURI ?? subagent.immediateParentChatUri;
    const parentChatUri = correlatedParentChatUri ?? parentChatURI;
    const { parentClientContext, correlatedParentTurnId, initiatorClientId } = this._getSubagentParentTurnTelemetryContext(correlatedParentChatUri, parentChatUri);
    this._logService.info(`[AgentSideEffects] Resuming subagent turn: ${subagent.chatUri} (parent=${parentChatURI}, toolCallId=${toolCallId})`);
    this._stateManager.dispatchServerAction(subagent.chatUri, {
      type: "chat/turnStarted" /* ChatTurnStarted */,
      turnId,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      message: message ?? { text: "", origin: { kind: "user" /* User */ } }
    });
    const agent = this._options.getAgent(subagent.sessionUri);
    if (agent) {
      this._turnTracker.turnStarted(agent, subagent.chatUri, turnId, void 0, void 0, "default", void 0, void 0, parentClientContext, initiatorClientId, correlatedParentTurnId, toolCallId, "tool" /* Tool */);
      this._turnTracker.setCurrentStage(subagent.chatUri, turnId, "provider");
    }
    this._subagentChats.set({ ...subagent, immediateParentChatUri: correlatedParentChatUri, turnStopWatch: StopWatch.create(false) }, parentChatURI, toolCallId);
  }
  _getSubagentParentTurnTelemetryContext(immediateParentChatUri, fallbackParentChatUri) {
    const parentChatUri = immediateParentChatUri ?? fallbackParentChatUri;
    const parentTurnId = this._stateManager.getActiveTurnId(parentChatUri);
    return {
      parentTurnId,
      parentClientContext: parentTurnId ? this._turnTracker.getClientTelemetryContext(parentChatUri, parentTurnId) : void 0,
      correlatedParentTurnId: immediateParentChatUri ? parentTurnId : void 0,
      initiatorClientId: parentTurnId ? this._turnTracker.getInitiatorClientId(parentChatUri, parentTurnId) : void 0
    };
  }
  /**
   * Cancels all active subagent sessions for a given parent session.
   */
  cancelSubagentSessions(parentChatURI) {
    for (const subagent of this._subagentChats.getAll(parentChatURI)) {
      const turnId = this._stateManager.getActiveTurnId(subagent.chatUri);
      if (turnId) {
        this._stateManager.dispatchServerAction(subagent.chatUri, {
          type: "chat/turnCancelled" /* ChatTurnCancelled */,
          turnId,
          duration: this._turnDuration(subagent.turnStopWatch)
        });
        this._completeTurn(subagent.chatUri, turnId, "cancelled");
      }
      this._toolCallTracker.clearSession(subagent.chatUri);
      this._turnTracker.clearSession(subagent.chatUri);
    }
    this._subagentChats.deleteAll(parentChatURI);
    this._pendingSubagentSignals.deleteAll(parentChatURI);
  }
  /**
   * Completes the active turn for the subagent associated with a parent tool
   * call. The chat remains registered so a later steered turn can resume it.
   */
  completeSubagentSession(parentChatURI, toolCallId) {
    this._pendingSubagentSignals.delete(parentChatURI, toolCallId);
    const subagent = this._subagentChats.get(parentChatURI, toolCallId);
    if (!subagent) {
      return;
    }
    const turnId = this._stateManager.getActiveTurnId(subagent.chatUri);
    if (turnId) {
      this._stateManager.dispatchServerAction(subagent.chatUri, {
        type: "chat/turnComplete" /* ChatTurnComplete */,
        turnId,
        duration: this._turnDuration(subagent.turnStopWatch)
      });
      this._completeTurn(subagent.chatUri, turnId, "success");
      this._toolCallTracker.clearSession(subagent.chatUri);
    }
  }
  /**
   * Removes all subagent chats for a given parent session from the state manager.
   */
  removeSubagentSessions(parentSession) {
    for (const chatUri of this._cancelledTurnIds.keys()) {
      if (parseRequiredSessionUriFromChatUri(chatUri) === parentSession) {
        this._cancelledTurnIds.delete(chatUri);
      }
    }
    const parentChatURIs = /* @__PURE__ */ new Set();
    for (const subagent of this._subagentChats.values()) {
      if (subagent.sessionUri === parentSession) {
        this._stateManager.removeChat(subagent.sessionUri, subagent.chatUri);
        this._toolCallTracker.clearSession(subagent.chatUri);
        this._turnTracker.clearSession(subagent.chatUri);
        parentChatURIs.add(subagent.parentChatUri);
      }
    }
    for (const parentChatURI of parentChatURIs) {
      this._subagentChats.deleteAll(parentChatURI);
      this._pendingSubagentSignals.deleteAll(parentChatURI);
    }
  }
  /**
   * Drops per-channel telemetry tracking on teardown. In-flight tool calls
   * and never-completed turns are discarded without reporting, so neither
   * their tracking maps nor the turn hang watchdog timers outlive the
   * channel they describe.
   */
  clearChannelTelemetry(channel) {
    this._toolCallTracker.clearSession(channel);
    this._turnTracker.clearSession(channel);
    const prefix = `${channel}\0`;
    for (const key of this._resumedTurnExecutions.keys()) {
      if (key.startsWith(prefix)) {
        this._resumedTurnExecutions.delete(key);
      }
    }
  }
  clearInputRequestsForSession(session) {
    this._inputRequestTracker.clearAgentSession(session);
  }
  getResumedTurnDuration(channel, turnId) {
    const execution = this._resumedTurnExecutions.get(this._resumedTurnExecutionKey(channel, turnId));
    return execution ? execution.duration + execution.stopWatch.elapsed() : void 0;
  }
  /**
   * Finds the subagent session that owns a given tool call by checking
   * whether the tool call was previously registered under a subagent
   * session key in `_toolCallAgents`. Scoped to subagent sessions owned
   * by the given parent to avoid cross-session collisions.
   */
  _findSubagentChatForToolCall(parentChatURI, toolCallId) {
    for (const subagent of this._subagentChats.getAll(parentChatURI)) {
      if (this._toolCallAgents.has(`${subagent.chatUri}:${toolCallId}`)) {
        return subagent.chatUri;
      }
    }
    return void 0;
  }
  _toolCallCompletionChat(chatChannel) {
    if (!isSubagentChatUri(chatChannel)) {
      return chatChannel;
    }
    for (const subagent of this._subagentChats.values()) {
      if (subagent.chatUri === chatChannel) {
        return this._toolCallCompletionChat(subagent.parentChatUri);
      }
    }
    this._logService.warn(`[AgentSideEffects] Missing parent chat for subagent tool completion: chat=${chatChannel}`);
    return chatChannel;
  }
  /**
   * Forwards a completed client tool call to the provider.
   *
   * `chat` is the host-resolved *routing* target: for a subagent chat, the
   * ancestor chat whose provider runtime owns the tool call (see
   * {@link _toolCallCompletionChat}). The context carries the chat the tool
   * call was actually addressed to, so a provider can recover the spawn edge
   * via `resolveSubagentChatParent(context)` instead of walking host state.
   * The two differ only when the addressed chat is a subagent.
   */
  _notifyClientToolCallComplete(sessionChannel, chatChannel, toolCallId, result, source) {
    const completionChat = this._toolCallCompletionChat(chatChannel);
    const agent = this._options.getAgent(sessionChannel);
    if (!agent) {
      this._logService.warn(`[AgentSideEffects] No agent for client tool completion: source=${source}, session=${sessionChannel}, chat=${chatChannel}, completionChat=${completionChat}, toolCallId=${toolCallId}`);
      return;
    }
    this._logService.info(`[AgentSideEffects] Forwarding client tool completion: source=${source}, session=${sessionChannel}, chat=${chatChannel}, completionChat=${completionChat}, toolCallId=${toolCallId}, success=${result.success}`);
    agent.onClientToolCallComplete(URI.parse(completionChat), toolCallId, result, this._chatContext(sessionChannel, chatChannel));
  }
  // ---- Side-effect handlers --------------------------------------------------
  /**
   * Handles a `pending_confirmation` signal end-to-end: checks for
   * auto-approval via the permission manager, and if not auto-approved,
   * dispatches the `ChatToolCallReady` action with confirmation options
   * for the client.
   */
  async _handleToolReady(e, sessionKey, turnId, agent) {
    const approvalEvent = {
      toolCallId: e.state.toolCallId,
      session: e.chat,
      permissionKind: e.permissionKind,
      permissionPath: e.permissionPath,
      toolInput: getInlineToolInput(e.state.toolInput),
      requestSandboxBypass: e.requestSandboxBypass,
      shellLanguage: e.shellLanguage
    };
    const forbiddenSnapshotWrite = this._permissionManager.isForbiddenSnapshotWrite(approvalEvent, sessionKey);
    const autoApproval = e.managedApprovalRequired || forbiddenSnapshotWrite ? void 0 : await this._permissionManager.getAutoApproval(approvalEvent, sessionKey);
    const part = this._stateManager.getSessionState(sessionKey)?.activeTurn?.responseParts.find((part2) => part2.kind === "toolCall" /* ToolCall */ && part2.toolCall.toolCallId === e.state.toolCallId);
    const toolCall = part?.kind === "toolCall" /* ToolCall */ ? part.toolCall : void 0;
    if (toolCall && toolCall.status !== "streaming" /* Streaming */ && toolCall.status !== "running" /* Running */ && toolCall.status !== "pending-confirmation" /* PendingConfirmation */) {
      const toolCallKey2 = `${sessionKey}:${e.state.toolCallId}`;
      this._toolCallAgents.delete(toolCallKey2);
      this._managedApprovalToolCalls.delete(toolCallKey2);
      this._logService.trace(`[AgentSideEffects] Dropping stale tool ready for ${e.state.toolCallId}: status=${toolCall.status}`);
      return;
    }
    const contributor = e.state.contributor ?? toolCall?.contributor;
    let effective = e;
    const toolCallKey = `${sessionKey}:${e.state.toolCallId}`;
    if (forbiddenSnapshotWrite) {
      this._logService.warn(`[AgentSideEffects] Denying write to read-only attachment snapshot: toolCallId=${e.state.toolCallId}`);
      this._toolCallAgents.delete(toolCallKey);
      this._managedApprovalToolCalls.delete(toolCallKey);
      agent.respondToPermissionRequest(e.state.toolCallId, false);
      return;
    }
    if (e.managedApprovalRequired) {
      this._managedApprovalToolCalls.add(toolCallKey);
    } else {
      this._managedApprovalToolCalls.delete(toolCallKey);
    }
    const clientShouldAutoApprove = autoApproval !== void 0 && contributor?.kind === "client" /* Client */ && !!e.state.confirmationTitle;
    if (clientShouldAutoApprove) {
      this._toolCallAgents.set(toolCallKey, agent.id);
      effective = { ...e, state: { ...e.state, _meta: { ...toolCall?._meta, ...e.state._meta, ...toToolCallMeta({ autoApproveBySetting: true }) } } };
    } else if (autoApproval !== void 0) {
      this._toolCallAgents.delete(toolCallKey);
      agent.respondToPermissionRequest(e.state.toolCallId, true);
      effective = { ...e, state: { ...e.state, confirmationTitle: void 0 } };
    } else if (effective.state.confirmationTitle) {
      this._toolCallAgents.set(toolCallKey, agent.id);
    }
    if (autoApproval === void 0 && !e.managedApprovalRequired && this._permissionManager.isAutoApproveRuleResolvable(approvalEvent, sessionKey)) {
      effective = { ...effective, state: { ...effective.state, _meta: { ...toolCall?._meta, ...effective.state._meta, ...toToolCallMeta({ autoApproveRuleResolvable: true }) } } };
    }
    const readyAction = this._permissionManager.createToolReadyAction(effective, sessionKey, turnId);
    this._toolCallTracker.toolCallMetadataUpdated(sessionKey, readyAction.toolCallId, readyAction.contributor);
    this._turnTracker.toolCallMetadataUpdated(sessionKey, turnId, readyAction.toolCallId, readyAction.contributor);
    if (readyAction.confirmed) {
      this._toolCallTracker.toolCallExecutionStarted(sessionKey, readyAction.toolCallId);
    }
    this._stateManager.dispatchServerAction(sessionKey, readyAction);
    this._turnTracker.markActivity(sessionKey, turnId, readyAction.type);
  }
  handleAction(channel, action, clientId, clientContextOrType = "unknown" /* Unknown */, resumedTurn) {
    let clientContext = typeof clientContextOrType === "string" ? createUnknownAgentHostClientTelemetryContext(clientContextOrType) : clientContextOrType;
    if (this._options.hostLaunchKind !== void 0) {
      clientContext = { ...clientContext, hostLaunchKind: this._options.hostLaunchKind };
    }
    const chatChannel = isAhpChatChannel(channel) ? channel : void 0;
    const sessionChannel = chatChannel ? parseRequiredSessionUriFromChatUri(chatChannel) : channel;
    switch (action.type) {
      case "chat/turnStarted" /* ChatTurnStarted */: {
        if (!chatChannel) {
          throw new Error(`ChatTurnStarted must be handled on an AHP chat channel: ${channel}`);
        }
        const turnStopWatch = StopWatch.create(false);
        const started = this._instantiationService.invokeFunction(startTurn, {
          session: sessionChannel,
          chat: channel,
          turnChannel: channel,
          turnId: action.turnId,
          message: action.message,
          source: "direct",
          clientId,
          clientContext,
          turnStopWatch
        });
        if (!started) {
          break;
        }
        void this._sendTurnMessage({
          agent: started.agent,
          sessionChannel,
          turnChannel: channel,
          chat: channel,
          message: action.message,
          turnId: action.turnId,
          senderClientId: clientId,
          clientContext,
          turnStopWatch
        });
        break;
      }
      case "chat/turnResume" /* ChatTurnResume */: {
        if (!chatChannel || !resumedTurn) {
          throw new Error(`ChatTurnResume must be accepted with its previous turn on an AHP chat channel: ${channel}`);
        }
        const agent = this._options.getAgent(sessionChannel);
        if (!agent?.chats.resumeTurn) {
          throw new Error(`ChatTurnResume reached side effects without provider support: ${sessionChannel}`);
        }
        const state = this._stateManager.getSessionState(channel);
        const { model, modelTelemetryKind, modelSelectionKind, permissionLevel, interactionMode } = getTurnTelemetryContext(agent, channel, this._chatContext(sessionChannel, channel), state, resumedTurn.message.model?.id);
        this._turnTracker.turnStarted(agent, channel, action.turnId, model, modelTelemetryKind, modelSelectionKind, permissionLevel, interactionMode, clientContext, clientId);
        this._turnTracker.setCurrentStage(channel, action.turnId, "provider");
        const key = this._resumedTurnExecutionKey(channel, action.turnId);
        const execution = {
          duration: resumedTurn.duration ?? 0,
          usage: resumedTurn.usage,
          stopWatch: StopWatch.create(false)
        };
        this._resumedTurnExecutions.set(key, execution);
        void agent.chats.resumeTurn(
          URI.parse(channel),
          action.turnId,
          { ...this._chatContext(sessionChannel, channel), clientTelemetryContext: clientContext },
          clientId,
          clientContext.clientType
        ).catch((error) => {
          if (this._resumedTurnExecutions.get(key) !== execution) {
            return;
          }
          const failure = buildTurnFailure("sendMessage", error);
          this._stateManager.dispatchServerAction(channel, {
            type: "chat/error" /* ChatError */,
            turnId: action.turnId,
            duration: execution.duration + execution.stopWatch.elapsed(),
            part: createErrorResponsePart(failure.error, true)
          });
          const endedTurn = this._completeTurn(channel, action.turnId, "error", failure);
          this._toolCallTracker.clearSession(channel);
          if (endedTurn) {
            this._chatContributions.turnEnd({
              session: sessionChannel,
              channel,
              turnId: action.turnId,
              reason: { kind: "error", error: failure.error, resumable: false },
              clientContext
            });
          }
          this._resumedTurnExecutions.delete(key);
        });
        break;
      }
      case "chat/toolCallConfirmed" /* ChatToolCallConfirmed */: {
        if (!chatChannel) {
          throw new Error(`ChatToolCallConfirmed must be handled on an AHP chat channel: ${channel}`);
        }
        const toolCallKey = `${channel}:${action.toolCallId}`;
        if (action.approved) {
          this._toolCallTracker.toolCallExecutionStarted(channel, action.toolCallId);
        } else {
          this._turnTracker.toolCallEnded(channel, action.turnId, action.toolCallId);
        }
        const managedApprovalRequired = this._managedApprovalToolCalls.delete(toolCallKey);
        const agentId = this._toolCallAgents.get(toolCallKey);
        if (agentId) {
          this._toolCallAgents.delete(toolCallKey);
          const agent = this._options.agents.get().find((a) => a.id === agentId);
          agent?.respondToPermissionRequest(action.toolCallId, action.approved);
        } else {
          this._logService.warn(`[AgentSideEffects] No agent for tool call confirmation: ${action.toolCallId}`);
        }
        if (action.approved && !managedApprovalRequired) {
          this._permissionManager.handleToolCallConfirmed(channel, action.toolCallId, action.selectedOptionId);
        }
        break;
      }
      case "chat/inputCompleted" /* ChatInputCompleted */: {
        if (!chatChannel) {
          throw new Error(`ChatInputCompleted must be handled on an AHP chat channel: ${channel}`);
        }
        const agent = this._options.getAgent(sessionChannel);
        agent?.respondToUserInputRequest(action.requestId, action.response, action.answers);
        break;
      }
      case "chat/turnCancelled" /* ChatTurnCancelled */: {
        if (!chatChannel) {
          throw new Error(`ChatTurnCancelled must be handled on an AHP chat channel: ${channel}`);
        }
        const endedTurn = this._completeTurn(channel, action.turnId, "cancelled");
        this._resumedTurnExecutions.delete(this._resumedTurnExecutionKey(channel, action.turnId));
        this._toolCallTracker.clearSession(channel);
        if (endedTurn) {
          this._chatContributions.turnEnd({
            session: sessionChannel,
            channel,
            turnId: action.turnId,
            reason: { kind: "cancelled" },
            clientContext
          });
        }
        void this._checkpointService.discardTurnStartCheckpoint(URI.parse(sessionChannel), URI.parse(channel), action.turnId).catch(() => void 0);
        this.cancelSubagentSessions(channel);
        const agent = this._options.getAgent(sessionChannel);
        if (agent) {
          const chat = URI.parse(channel);
          const session = parseRequiredSessionUriFromChatUri(channel);
          agent.chats.abort(chat, { ...this._chatContext(session, channel), clientTelemetryContext: clientContext }).catch((err) => {
            this._logService.error("[AgentSideEffects] abort failed", err);
          });
        }
        break;
      }
      case "session/titleChanged" /* SessionTitleChanged */: {
        break;
      }
      case "chat/pendingMessageSet" /* ChatPendingMessageSet */:
      case "chat/pendingMessageRemoved" /* ChatPendingMessageRemoved */:
      case "chat/queuedMessagesReordered" /* ChatQueuedMessagesReordered */: {
        if (!chatChannel) {
          throw new Error(`${action.type} must be handled on an AHP chat channel: ${channel}`);
        }
        break;
      }
      case "chat/truncated" /* ChatTruncated */: {
        if (!chatChannel) {
          throw new Error(`ChatTruncated must be handled on an AHP chat channel: ${channel}`);
        }
        void this._checkpointService.discardChatTurnStartCheckpoints(URI.parse(sessionChannel), URI.parse(chatChannel)).catch(() => void 0);
        const agent = this._options.getAgent(sessionChannel);
        const sdkTurnId = action.turnId !== void 0 ? this._options.localTurns.resolveConcreteTurnId(chatChannel, action.turnId) : action.turnId;
        agent?.truncateChat?.(URI.parse(chatChannel), sdkTurnId, this._chatContext(sessionChannel, chatChannel)).catch((err) => {
          this._logService.error("[AgentSideEffects] truncateChat failed", err);
        });
        const survivingIds = new Set((this._stateManager.getChatState(chatChannel)?.turns ?? []).map((t) => t.id));
        const removed = this._options.localTurns.getLocalTurnIds(chatChannel).filter((id2) => !survivingIds.has(id2));
        this._options.localTurns.deleteLocals(sessionChannel, removed);
        const trackedTurnIds = new Set(survivingIds);
        const activeTurnId = this._stateManager.getActiveTurnId(chatChannel);
        if (activeTurnId) {
          trackedTurnIds.add(activeTurnId);
        }
        this._turnTracker.clearTurnsExcept(chatChannel, trackedTurnIds);
        this._changesets.onSessionTruncated(sessionChannel);
        break;
      }
      case "session/activeClientSet" /* SessionActiveClientSet */: {
        this._fanOutActiveClient(channel, action.activeClient);
        break;
      }
      case "session/activeClientRemoved" /* SessionActiveClientRemoved */: {
        const agent = this._options.getAgent(channel);
        for (const chat of getSessionChatsForFanOut(this._stateManager, channel) ?? []) {
          agent?.removeActiveClient(chat, this._chatContext(channel, chat.toString()), action.clientId);
        }
        break;
      }
      case "root/configChanged" /* RootConfigChanged */: {
        updateAgentHostTelemetryLevelFromConfig(this._telemetryService, action.config);
        this._publishAgentInfos(this._options.agents.get());
        this._publishAllSessionCustomizations();
        break;
      }
      case "session/mcpServerStartRequested" /* SessionMcpServerStartRequested */: {
        const agent = this._options.getAgent(sessionChannel);
        agent?.startMcpServer?.(URI.parse(sessionChannel), action.id).catch((err) => {
          this._logService.warn(`[AgentSideEffects] startMcpServer failed for ${sessionChannel}`, err);
        });
        break;
      }
      case "session/mcpServerStopRequested" /* SessionMcpServerStopRequested */: {
        const agent = this._options.getAgent(sessionChannel);
        agent?.stopMcpServer?.(URI.parse(sessionChannel), action.id).catch((err) => {
          this._logService.warn(`[AgentSideEffects] stopMcpServer failed for ${sessionChannel}`, err);
        });
        break;
      }
      case "session/isArchivedChanged" /* SessionIsArchivedChanged */: {
        const sessionUri = URI.parse(channel);
        const sessionId = AgentSession.id(channel);
        const worktreeOp = action.isArchived ? this._worktree.cleanupWorktreeOnArchive(sessionUri, sessionId) : this._worktree.recreateWorktreeOnUnarchive(sessionUri, sessionId);
        worktreeOp.catch((err) => this._logService.warn(`[AgentSideEffects] worktree ${action.isArchived ? "cleanup" : "recreate"} failed for ${channel}`, err));
        const agent = this._options.getAgent(channel);
        agent?.onArchivedChanged?.(URI.parse(channel), action.isArchived).catch((err) => {
          this._logService.warn(`[AgentSideEffects] onArchivedChanged failed for ${channel}`, err);
        });
        break;
      }
      case "session/configChanged" /* SessionConfigChanged */: {
        const sessionState = this._stateManager.getSessionState(channel);
        const values = sessionState?.config?.values;
        if (sessionState?.lifecycle === "creating" /* Creating */) {
          const sessionId = AgentSession.id(channel);
          const isolation = values?.["isolation" /* Isolation */];
          if (isolation === "worktree") {
            this._worktree.notePending(sessionId);
          } else if (isolation === "folder") {
            this._worktree.clearPending(sessionId);
          }
        }
        break;
      }
      case "chat/toolCallComplete" /* ChatToolCallComplete */: {
        if (!chatChannel) {
          break;
        }
        this._notifyClientToolCallComplete(sessionChannel, chatChannel, action.toolCallId, action.result, "client-dispatch");
        break;
      }
    }
    this._chatContributions.didApplyClientAction({ channel, session: sessionChannel, action, clientId, clientContext });
  }
  _recordCustomizationEnablement(session, candidate, enablement) {
    const target = candidate.customization.type === "plugin" /* Plugin */ ? targetForPlugin(candidate.customization) : targetForMcpServer(candidate.customization, candidate.owningPluginUri, false);
    this._customizationEnablementService.replaceEnablement(session, target, enablement);
  }
  cancelSessionTitleGeneration(session) {
    this._titleController.cancelTitleGeneration(session);
  }
  clearSessionTitleState(session, chats) {
    this._titleController.clearSession(session, chats);
  }
  /**
   * Generates a content-derived title for a freshly forked session
   * (`chatChannel` undefined) or peer chat from its inherited chat
   * turns, replacing the placeholder `Forked: …` title once ready.
   */
  generateForkedTitle(channel, chatChannel, turns, fallbackTitle, sourceTitle) {
    this._titleController.generateForkedTitle(channel, chatChannel, turns, fallbackTitle, sourceTitle);
  }
  markTitleAuto(channel, chatChannel, title) {
    this._titleController.markTitleAuto(channel, chatChannel, title);
  }
  /** Generates a title for an external session the provider surfaced without one. */
  generateExternalSessionTitle(session, userPrompt) {
    return this._titleController.generateExternalSessionTitle(session, userPrompt);
  }
  markTitleRenamed(channel, chatChannel) {
    this._titleController.markTitleRenamed(channel, chatChannel);
  }
  _persistDefaultChatTitleSnapshot(session, chat, title) {
    const ref = (() => {
      try {
        return this._options.sessionDataService.openDatabase(URI.parse(session));
      } catch (error) {
        this._logService.warn("[AgentSideEffects] Failed to open session database for default chat title snapshot", error);
        return void 0;
      }
    })();
    if (!ref) {
      return;
    }
    const persist = async () => {
      if (this._stateManager.getChatState(chat)?.title !== title) {
        return;
      }
      const titleKey = customChatTitleMetadataKey(chat);
      await ref.object.setMetadataValuesIfAbsent(
        titleKey,
        { [titleKey]: title },
        { [customChatTitleSourceMetadataKey(chat)]: SESSION_CUSTOM_TITLE_SOURCE_KEY }
      );
    };
    void persist().catch((error) => {
      this._logService.warn("[AgentSideEffects] Failed to persist default chat title snapshot", error);
    }).finally(() => ref.dispose());
  }
  /**
   * Applies a turn message's model/agent selection (see
   * {@link _applyMessageSelection}) and forwards it to the agent's
   * `sendMessage`. A rejected send is wired to fail the turn: it logs,
   * dispatches {@link ActionType.ChatError} on the turn channel, and marks the
   * turn errored.
   */
  async _sendTurnMessage(options) {
    const { agent, sessionChannel, turnChannel, chat, message, turnId, senderClientId, clientContext, turnStopWatch } = options;
    const chatUri = URI.parse(chat);
    let failureStage = "workingDirectory";
    try {
      this._turnTracker.setCurrentStage(turnChannel, turnId, failureStage);
      const resolvedWorkingDirectories = await this._options.resolveWorkingDirectoryBeforeSend?.({ session: options.sessionChannel, chat, turnId, prompt: message.text });
      const chatContext = this._chatContext(options.sessionChannel, chat);
      const clientOperationContext = { ...chatContext, clientTelemetryContext: clientContext };
      const selectionUpdates = [];
      this._turnTracker.setCurrentStage(turnChannel, turnId, "modelSelection");
      if (message.model) {
        failureStage = "modelSelection";
        selectionUpdates.push(agent.chats.changeModel(chatUri, message.model, clientOperationContext));
      }
      selectionUpdates.push(agent.chats.changeAgent(chatUri, message.agent, clientOperationContext).catch((err) => {
        this._logService.error("[AgentSideEffects] changeAgent failed", err);
      }));
      await Promise.all(selectionUpdates);
      failureStage = "sendMessage";
      this._turnTracker.setCurrentStage(turnChannel, turnId, failureStage);
      const resolvedAttachments = await this._resolveChatAttachments(message.attachments);
      const contribution = await this._chatContributions.outgoingTurn({ session: sessionChannel, chat, message, turnId });
      const sendContext = { ...clientOperationContext, ...contribution.instructions?.length ? { hostInstructions: contribution.instructions } : {} };
      if (this._cancelledTurnIds.get(turnChannel)?.has(turnId)) {
        return;
      }
      if (!this._stateManager.isEphemeralSession(sessionChannel)) {
        await this._checkpointService.captureTurnStartCheckpoint(URI.parse(sessionChannel), chatUri, turnId, resolvedWorkingDirectories);
      }
      if (this._cancelledTurnIds.get(turnChannel)?.has(turnId)) {
        await this._checkpointService.discardTurnStartCheckpoint(URI.parse(sessionChannel), chatUri, turnId);
        return;
      }
      this._turnTracker.setCurrentStage(turnChannel, turnId, "provider");
      await agent.chats.sendMessage(chatUri, contribution.message.text, resolvedWorkingDirectories, resolvedAttachments, turnId, senderClientId, clientContext.clientType, sendContext);
    } catch (err) {
      const failure = buildTurnFailure(failureStage, err);
      const error = failure.error;
      this._logService.error(`[AgentSideEffects] ${failureStage} failed for session=${turnChannel}: code=${failure.errorCode}, message=${error.message}, type=${failure.errorName}`, err);
      this._stateManager.dispatchServerAction(turnChannel, {
        type: "chat/error" /* ChatError */,
        turnId,
        duration: this._turnDuration(turnStopWatch),
        part: createErrorResponsePart(error)
      });
      const endedTurn = this._completeTurn(turnChannel, turnId, "error", failure);
      this._toolCallTracker.clearSession(turnChannel);
      if (endedTurn) {
        this._chatContributions.turnEnd({
          session: sessionChannel,
          channel: turnChannel,
          turnId,
          reason: { kind: "error", error, resumable: false },
          clientContext
        });
      }
      this._failSessionCreationIfStillCreating(sessionChannel, error);
    }
  }
  async _resolveChatAttachments(attachments) {
    if (!attachments?.some((attachment) => attachment.type === "chat" /* Chat */)) {
      return attachments;
    }
    return Promise.all(attachments.map(async (attachment) => {
      if (attachment.type !== "chat" /* Chat */) {
        return attachment;
      }
      const openLink = buildOpenSessionLinkForChatResource(attachment.resource);
      const sourceTurns = await this._resolveChatAttachmentSourceTurns(attachment.resource);
      if (sourceTurns === void 0) {
        return resolveChatAttachment({ ...attachment, endTurn: void 0 }, [], openLink);
      }
      const sourceState = resolveChatStateForUri(this._stateManager, attachment.resource);
      if (attachment.endTurn !== void 0 && sourceState?.activeTurn?.id === attachment.endTurn) {
        throw new Error(`Chat attachment endTurn must reference a completed turn: ${attachment.resource}#${attachment.endTurn}`);
      }
      return resolveChatAttachment(attachment, sourceTurns, openLink);
    }));
  }
  /**
   * Resolves the referenced chat's turns, returning `undefined` when the source
   * is unresolvable — e.g. a cross-session reference to a chat this host never
   * subscribed to and cannot restore (the resolver throws
   * `ProtocolError(AHP_SESSION_NOT_FOUND)` when no provider owns it or the
   * backend no longer has it). Such failures are logged rather than rethrown so
   * a stale reference degrades gracefully instead of failing the user's turn.
   */
  async _resolveChatAttachmentSourceTurns(resource) {
    try {
      if (this._options.resolveChatAttachmentTurns) {
        return await this._options.resolveChatAttachmentTurns(resource);
      }
      return resolveChatStateForUri(this._stateManager, resource)?.turns ?? [];
    } catch (err) {
      this._logService.warn(`[AgentSideEffects] Unable to resolve chat attachment source ${resource}; degrading to a pointer without an excerpt`, err);
      return void 0;
    }
  }
  /**
   * Surfaces a failed first turn on a not-yet-materialized session as a
   * terminal creation failure.
   *
   * Provisional sessions defer both their root-catalog `SessionAdded`
   * notification and their `Creating -> Ready` lifecycle transition until the
   * agent materializes them (worktree setup, SDK session init, …) on the
   * first `sendMessage`. When that first send rejects — e.g. worktree/branch
   * creation throws — the session never entered the catalog and its lifecycle
   * is stuck at `Creating`, so clients that optimistically rendered it as
   * in-progress keep spinning forever.
   *
   * When the failing session is still `Creating`, dispatch
   * {@link ActionType.SessionCreationFailed} to move it to a terminal
   * `CreationFailed` lifecycle, then announce its catalog entry via
   * {@link AgentHostStateManager.markSessionPersisted}. The summary's status
   * was already aggregated to `Error` by the preceding `ChatError` dispatch,
   * so subscribers render the session as failed immediately rather than
   * waiting on a client-side timeout. The provisional session survives on the
   * agent, so resending re-attempts materialization.
   */
  _failSessionCreationIfStillCreating(sessionChannel, error) {
    const state = this._stateManager.getSessionState(sessionChannel);
    if (state?.lifecycle !== "creating" /* Creating */) {
      return;
    }
    this._stateManager.dispatchServerAction(sessionChannel, {
      type: "session/creationFailed" /* SessionCreationFailed */,
      error
    });
    const summary = this._stateManager.getSessionSummary(sessionChannel);
    if (summary) {
      this._stateManager.markSessionPersisted(sessionChannel, summary);
    }
  }
  dispose() {
    this._toolCallAgents.clear();
    this._managedApprovalToolCalls.clear();
    this._toolCallTracker.clear();
    this._inputRequestTracker.clear();
    super.dispose();
  }
};

AgentSideEffects = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IAgentHostChangesetService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IAgentHostCheckpointService),
  __decorateParam(8, IAgentConfigurationService),
  __decorateParam(9, IAgentHostChatContributions),
  __decorateParam(10, IAgentHostSessionTitleController),
  __decorateParam(11, IAgentHostTelemetryReporter),
  __decorateParam(12, IAgentHostTurnTracker),
  __decorateParam(13, IAgentHostToolCallTracker),
  __decorateParam(14, IAgentHostWorktreeIsolation)
], AgentSideEffects);

function buildTurnFailure(stage, err) {
  const error = buildTurnFailureError(stage, err);
  return {
    stage,
    error,
    errorName: err instanceof Error ? err.name : typeof err,
    errorCode: getErrorCode(err),
    errorStack: err instanceof Error ? err.stack : void 0
  };
}

function buildTurnFailureError(stage, err) {
  const message = String(err);
  const forwarded = tryParseForwardedChatError(err instanceof Error ? err.message : message);
  const errorType = stage === "modelSelection" ? "modelSelectionFailed" : stage === "workingDirectory" ? "workingDirectoryFailed" : "sendFailed";
  if (forwarded) {
    return { errorType, message: stripProxyErrorMarker(message), _meta: toChatErrorMeta(forwarded) };
  }
  return { errorType, message };
}
export { getCustomizationEnablementCandidates, buildTurnFailure, buildTurnFailureError, MAX_SUPERSEDED_CUSTOMIZATION_PUBLISH_RETRIES, AgentSideEffects };
