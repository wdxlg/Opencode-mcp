// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeAgent.ts
import { tryParseClaudeModelId } from "./module-0327.mjs";
import { createClaudeThinkingLevelSchema, isClaudeEffortLevel } from "./module-0318.mjs";
import { createPricingMetaFromBilling, normalizeCAPIBilling } from "./module-0133.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0010.mjs";
import { AgentChatMigrationDeferred, AgentSession, CLAUDE_AGENT_PROVIDER_ID, SubagentChatSignal, resolveAgentChatContext, resolveAgentHostCustomizations, resolveAgentHostInstructions, resolveSubagentChatParent } from "./module-0048.mjs";
import { Emitter } from "./module-0016.mjs";
import { observableValue } from "./module-0064.mjs";
import { Limiter, SequencerByKey, retry } from "./module-0027.mjs";
import { ClaudeSessionMetadataStore } from "./module-0367.mjs";
import { AgentSdkSetupChannel } from "./module-0316.mjs";
import { ClaudeSdkPackage, IClaudeAgentSdkService } from "./module-0321.mjs";
import { decodeProviderData, encodeProviderData } from "./module-0136.mjs";
import { agentHostCustomizationConfigSchema } from "./module-0105.mjs";
import { isClaudeAccountSetUp, resolveClaudeTransportMode } from "./module-0329.mjs";
import { localize } from "./module-0012.mjs";
import { AgentHostAutoApprovePolicyRestrictedConfigKey, AgentHostClaudeMultiRootEnabledConfigKey, createSchema, platformRootSchema, platformSessionSchema, schemaProperty } from "./module-0057.mjs";
import { mergeClaudeModelCatalogs, resolveClaudeSessionTransport } from "./module-0328.mjs";
import { AHP_AUTH_REQUIRED, ProtocolError } from "./module-0056.mjs";
import { buildModelEnumerationOptions } from "./module-0322.mjs";
import { mapSessionMessagesToTurns, resolveForkAnchorUuid } from "./module-0331.mjs";
import { URI } from "./module-0023.mjs";
import { handleCanUseTool } from "./module-0361.mjs";
import { handleElicitation } from "./module-0363.mjs";
import { CancellationError } from "./module-0002.mjs";
import { readClaudePermissionMode } from "./module-0337.mjs";
import { narrowClaudePermissionMode } from "./module-0317.mjs";
import { generateUuid } from "./module-0042.mjs";
import { ensureWorkspacelessScratchDir } from "./module-0319.mjs";
import { ClaudeAgentSession } from "./module-0359.mjs";
import { PendingRequestRegistry } from "./module-0255.mjs";
import { projectFromCopilotContext } from "./module-0291.mjs";
import { buildDefaultChatUri, isDefaultChatUri, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { SubagentRegistry } from "./module-0333.mjs";
import { getSubagentTranscript } from "./module-0334.mjs";
import { CancellationToken } from "./module-0017.mjs";
import { resolvePromptToContentBlocks } from "./module-0350.mjs";
import { computeFolderPickerDecisionForRoots } from "./module-0309.mjs";
import { claudeDirectoryQualifiesForPrimary } from "./module-0320.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { ICopilotApiService } from "./module-0168.mjs";
import { IClaudeProxyService } from "./module-0364.mjs";
import { IAgentSdkDownloader } from "./module-0312.mjs";
import { IAgentHostSessionTitleSignal } from "./module-0177.mjs";
import { IAgentHostOTelService } from "./module-0137.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { IAgentHostCheckpointService } from "./module-0131.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { IAgentPluginManager } from "./module-0135.mjs";
import { IProductService } from "./module-0173.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";
import { IFileService } from "./module-0128.mjs";


// src/vs/platform/agentHost/node/claude/claudeAgent.ts
var USER_AGENT_PREFIX2 = "vscode_claude_code";

var CLAUDE_SETUP_DOCS_URL = "https://code.claude.com/docs/en/third-party-integrations";

function isClaudeModel(m) {
  return m.vendor === "Anthropic" && !!m.supported_endpoints?.includes("/v1/messages") && !!m.model_picker_enabled && !!m.capabilities?.supports?.tool_calls && tryParseClaudeModelId(m.id) !== void 0;
}

function toAgentModelInfo(m, provider) {
  const supports = m.capabilities?.supports;
  const supportedEfforts = (supports?.reasoning_effort ?? []).filter(isClaudeEffortLevel);
  const configSchema = createClaudeThinkingLevelSchema(supportedEfforts);
  const policyState = m.policy?.state;
  const billing = normalizeCAPIBilling(m.billing);
  const priceCategory = typeof m.model_picker_price_category === "string" ? m.model_picker_price_category : void 0;
  return {
    provider,
    // CAPI/endpoint format, dotted version (e.g. `claude-haiku-4.5`) — the
    // canonical id through `ModelSelection.id`. Convert to SDK format at SDK
    // seams via `toSdkModelId`.
    id: m.id,
    name: m.name,
    maxContextWindow: m.capabilities?.limits?.max_context_window_tokens,
    maxOutputTokens: m.capabilities?.limits?.max_output_tokens,
    maxPromptTokens: m.capabilities?.limits?.max_prompt_tokens,
    supportsVision: !!supports?.vision,
    ...configSchema ? { configSchema } : {},
    ...policyState ? { policyState } : {},
    _meta: createPricingMetaFromBilling(billing, priceCategory)
  };
}

var SDK_DEFAULT_MODEL_VALUE = "default";

function isSdkDefaultModel(m) {
  return m.value === SDK_DEFAULT_MODEL_VALUE;
}

function fromSdkModelInfo(m, provider) {
  const supportedEfforts = (m.supportedEffortLevels ?? []).filter(isClaudeEffortLevel);
  const configSchema = createClaudeThinkingLevelSchema(supportedEfforts);
  return {
    provider,
    // SDK-canonical id (`m.value`, e.g. `claude-sonnet-4-5-20250929`). Native
    // ids are SDK format end to end; `toSdkModelId` is identity at this seam.
    id: m.value,
    name: m.displayName,
    supportsVision: false,
    ...configSchema ? { configSchema } : {}
  };
}

function _toPersistedChat(backing) {
  return {
    sdkSessionId: backing.sdkSessionId,
    ...backing.model ? { model: backing.model } : {}
  };
}

var ClaudeActiveClientHandle = class {
  constructor(clientId, displayName, chat, _setTools, _syncCustomizations) {
    this.clientId = clientId;
    this.displayName = displayName;
    this.chat = chat;
    this._setTools = _setTools;
    this._syncCustomizations = _syncCustomizations;
    this._tools = [];
    this._customizations = [];
    this._customizationsAssigned = false;
  }
  get tools() {
    return this._tools;
  }
  set tools(tools) {
    this._tools = tools;
    this._setTools(this.chat, tools);
  }
  get customizations() {
    return this._customizations;
  }
  set customizations(customizations) {
    this._customizations = customizations;
    this._customizationsAssigned = true;
    this._syncCustomizations(this.chat, customizations, this._hostCustomizations);
  }
  /** The last host snapshot, for syncs this client's own assignment triggers. */
  get hostCustomizations() {
    return this._hostCustomizations;
  }
  /** Records the host's latest published customization snapshot for this handle's owning scope, if supplied. */
  setHostCustomizations(hostCustomizations) {
    if (hostCustomizations !== void 0) {
      this._hostCustomizations = hostCustomizations;
    }
  }
  /**
   * Re-applies this handle's currently-assigned tools and (if ever assigned)
   * customizations to its chat. Used when the chat's live runtime just came
   * up, so contributions made before the runtime existed still reach it.
   */
  refresh() {
    this._setTools(this.chat, this._tools);
    if (this._customizationsAssigned) {
      this._syncCustomizations(this.chat, this._customizations, this._hostCustomizations);
    }
  }
};

var ClaudeAgent = class extends Disposable {
  constructor(_logService, _copilotApiService, _claudeProxyService, _sdkService, _agentSdkDownloader, _sessionTitleSignal, _otelService, _gitService, _checkpointService, _configurationService, _gitHubEndpointService, _instantiationService, _pluginManager, _productService, _environmentService, _fileService) {
    super();
    this._logService = _logService;
    this._copilotApiService = _copilotApiService;
    this._claudeProxyService = _claudeProxyService;
    this._sdkService = _sdkService;
    this._agentSdkDownloader = _agentSdkDownloader;
    this._sessionTitleSignal = _sessionTitleSignal;
    this._otelService = _otelService;
    this._gitService = _gitService;
    this._checkpointService = _checkpointService;
    this._configurationService = _configurationService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._instantiationService = _instantiationService;
    this._pluginManager = _pluginManager;
    this._productService = _productService;
    this._environmentService = _environmentService;
    this._fileService = _fileService;
    this.id = CLAUDE_AGENT_PROVIDER_ID;
    this._onDidChatProgress = this._register(new Emitter());
    this.onDidChatProgress = this._onDidChatProgress.event;
    this._onDidCustomizationsChange = this._register(new Emitter());
    this.onDidCustomizationsChange = this._onDidCustomizationsChange.event;
    this._models = observableValue(this, []);
    this.models = this._models;
    /**
     * Owns every live SDK conversation, keyed by SDK session id. This is the
     * single disposable owner of chat leaves and the reverse index used by
     * SDK-originated callbacks (credit reports, `canUseTool`, elicitation),
     * which only ever know the SDK's own id.
     */
    this._chatEntriesBySdkId = this._register(new DisposableMap());
    /**
     * Maps each host-supplied concrete chat URI to its {@link IClaudeChatBacking}.
     * This is the single, consolidated `chatUri → backing` mapping and the only
     * way a chat resolves: every chat — a session's primary chat, a fork, a
     * side chat, a restored legacy chat — has exactly one exact backing here.
     * It encodes no membership kind and no persistence scope, so nothing
     * about a chat is ever recovered from URI shape or from a
     * provider-private classification.
     */
    this._chatBackings = /* @__PURE__ */ new Map();
    /**
     * Maps each host-supplied concrete chat URI to the exact
     * {@link IChatScopeBinding} — both its configuration scope
     * (`IAgentChatContext.configurationResource`, shared session-wide) and its
     * own persistence resource (`IAgentChatContext.resource`, the exact key its
     * overlay is written under) — recorded whenever that chat is created or
     * (re-)materialized. This is the only state a fork/side-chat source's own
     * scope is ever resolved from — never the destination chat's scope, never
     * a sibling catalog grouped by session.
     */
    this._chatConfigScopes = /* @__PURE__ */ new Map();
    /**
     * Fires when a concrete chat backing's opaque `providerData` changes after creation
     * (e.g. a per-chat model switch) so the orchestrator can re-persist the
     * refreshed token. See {@link IAgent.onDidChangeChatData}.
     */
    this._onDidChangeChatData = this._register(new Emitter());
    this.onDidChangeChatData = this._onDidChangeChatData.event;
    /**
     * Membership channel for chats the agent spawns itself — today the
     * sub-agent chats delegated by a `Task`/`Agent` tool call (and, when the
     * harness gains them, Claude Teams teammates). Derived from the
     * `subagent_started` / `subagent_completed` signals that already flow on
     * {@link onDidChatProgress}, so the orchestrator records the spawn edge
     * on the unified chat catalog. See {@link IAgent.onDidSpawnChat}.
     */
    this._onDidSpawnChat = this._register(new Emitter());
    this.onDidSpawnChat = this._onDidSpawnChat.event;
    this._onDidDiscoverChats = this._register(new Emitter());
    this.onDidDiscoverChats = this._onDidDiscoverChats.event;
    /**
     * Stable active-client handles, keyed by `${chatKey}\0${clientId}` — one
     * handle per exact (chat, client) pair. There is no session- or
     * membership-level entry: a client contributing to several chats of the
     * same session gets one independent handle per chat, each obtained
     * through its own {@link getOrCreateActiveClient} call.
     */
    this._activeClientHandles = /* @__PURE__ */ new Map();
    /**
     * Fired once per session when {@link _materializeProvisional} promotes a
     * provisional record into a real {@link ClaudeAgentSession}. The
     * {@link IAgentService} subscribes via the platform contract to dispatch
     * the deferred `sessionAdded` notification — observers don't see the
     * session in their list until persistence has settled.
     */
    this._onDidMaterializeChat = this._register(new Emitter());
    this.onDidMaterializeChat = this._onDidMaterializeChat.event;
    /**
     * Per-SDK-session-id serializer for {@link shutdown}'s teardown pass, so
     * the drain of every live chat inherits per-session serialization for its
     * async teardown (`Query.interrupt()`, in-flight metadata writes).
     */
    this._disposeSequencer = new SequencerByKey();
    /**
     * Per-session-id serializer for {@link sendMessage}. Held across both
     * {@link _materializeProvisional} AND `entry.send()` so two concurrent
     * first-message calls on the same session collapse into one materialize
     * plus two ordered sends. Separate from {@link _disposeSequencer} so
     * teardown racing a first send still serializes without deadlocking
     * inside the send sequencer.
     */
    this._sessionSequencer = new SequencerByKey();
    /**
     * The SDK's last answer to {@link isClaudeAccountSetUp}, kept current by
     * {@link _refreshModels}. Starts `false`: unasked is not evidence of an account.
     */
    this._nativeAccountSetUp = false;
    // ---- Chat surface ------------------------------------------------------
    //
    // `chats` exposes the per-chat operations addressed by a single, concrete
    // chat channel URI. Every chat's SDK id comes from the host-bound
    // provider data ({@link _chatBackings}); AH supplies any transient
    // operation context required to materialize that SDK conversation.
    /**
     * The chat-addressed operation surface
     * ({@link IAgentChats}). Every method addresses a chat by a single,
     * already-resolved chat URI; `createChat` additionally receives transient
     * host context from AH (see {@link IAgentChats.createChat}) — this maps to
     * the `(session, chat)` pair the agent's internal SDK storage is keyed by
     * (via {@link _resolveChatContext}).
     *
     * `createChat` is the only creation seam. It neither knows nor asks whether
     * the chat it is creating is a session's first chat or an additional one,
     * and there is no separate fork entry point: a fork is just a creation
     * whose options name a source ({@link IAgentCreateChatOptions.fork}), so
     * every creation form (fresh, fork, import, side chat) runs the one
     * algorithm in {@link _createChat}.
     */
    this.chats = {
      createChat: (chat, context, options) => this._createChat(chat, resolveAgentChatContext(context, chat), options),
      disposeChat: (chat, context) => this._disposeChat(chat, context),
      releaseChat: (chat, context) => this._releaseChat(chat, context),
      sendMessage: (chatUri, prompt, workingDirectoriesOrDirectory, attachments, turnId, senderClientId, clientTypeOrContext, context) => {
        const workingDirectories = Array.isArray(workingDirectoriesOrDirectory) ? workingDirectoriesOrDirectory : workingDirectoriesOrDirectory ? [workingDirectoriesOrDirectory] : void 0;
        const operationContext = context ?? (typeof clientTypeOrContext === "string" ? void 0 : clientTypeOrContext);
        return this._sendMessage(chatUri, prompt, workingDirectories, attachments, turnId, senderClientId, operationContext);
      },
      abort: (chatUri, context) => {
        return this._abortSession(chatUri, context);
      },
      getModel: (chatUri) => this._chatBackings.get(chatUri.toString())?.model,
      changeModel: (chatUri, model, context) => {
        return this._changeModel(chatUri, model, context);
      },
      changeAgent: (chatUri, agent, context) => {
        return this._changeAgent(chatUri, agent, context);
      },
      getMessages: (chat, context) => this._getChatMessages(chat, context)
    };
    this._metadataStore = _instantiationService.createInstance(ClaudeSessionMetadataStore);
    this._register(this._claudeProxyService.onDidReportCredits((e) => {
      this._findSessionBySdkId(e.sessionId)?.recordTurnCredits(e.totalNanoAiu);
    }));
    this._register(this._sessionTitleSignal.onDidChangeSessionTitle(({ provider, session, conversationId, title }) => {
      if (provider === this.id) {
        this._otelService.emitSessionTitleChanged(conversationId, session.toString(), title);
      }
    }));
    queueMicrotask(() => {
      void this._startModelRefresh();
    });
    this._sdkSetupChannel = this._register(new AgentSdkSetupChannel({
      id: this.id,
      sdkPackage: ClaudeSdkPackage,
      // Every Claude credential — subscription or `ANTHROPIC_API_KEY` — is
      // established outside the app, and the SDK exposes no login control
      // request, so the docs link is the only route this agent can offer.
      setupInfo: { setupDocsUrl: CLAUDE_SETUP_DOCS_URL },
      isSdkLocal: () => this._sdkService.canLoadWithoutDownload(),
      downloadSdk: () => this._sdkService.ensureAvailable(),
      restartChatDiscovery: () => this._restartChatDiscovery(),
      refreshModels: () => this._startModelRefresh()
    }, this._configurationService, this._agentSdkDownloader, this._logService));
  }
  _findAnySession(sessionId) {
    return this._chatEntriesBySdkId.get(sessionId)?.chatSession;
  }
  /**
   * The opaque half of a creation result: the blob the orchestrator persists
   * verbatim, plus the separately-enumerable SDK conversation it must
   * suppress from the top-level session list.
   */
  _chatBackingResult(backing) {
    return {
      providerData: encodeProviderData(_toPersistedChat(backing)),
      backingSession: AgentSession.uri(this.id, backing.sdkSessionId)
    };
  }
  _findChatByUri(chat) {
    const sdkSessionId = this._chatBackings.get(typeof chat === "string" ? chat : chat.toString())?.sdkSessionId;
    return sdkSessionId ? this._findAnySession(sdkSessionId) : void 0;
  }
  /**
   * Resolves a host-addressed chat operation against the exact chat URI it
   * was addressed to.
   *
   * `context` is mandatory: Agent Host stamps the configuration/persistence
   * scope, the exact-chat persistence scope, the provisioning intent, the
   * catalog origin, and the session's customization snapshot on every
   * addressed chat operation, and this provider consumes all of them
   * verbatim. There is no implicit form — a chat is never resolved by
   * treating its URI as a session, by scanning live runtimes, or by parsing
   * URI shape. Resolution of the provider's own state is exactly one lookup:
   * the chat's exact backing.
   */
  _resolveChatContext(chat, context) {
    const resolved = resolveAgentChatContext(context, chat);
    const chatKey = chat.toString();
    const backing = this._chatBackings.get(chatKey);
    const sdkSessionId = backing?.sdkSessionId;
    return {
      configurationResource: resolved.configurationResource,
      sessionId: AgentSession.id(resolved.configurationResource),
      resource: resolved.resource,
      chat,
      chatKey,
      spawnedFrom: resolveSubagentChatParent(resolved),
      customizations: resolveAgentHostCustomizations(resolved),
      sdkSessionId,
      sequencerKey: sdkSessionId ?? chatKey,
      target: sdkSessionId ? this._findAnySession(sdkSessionId) : void 0
    };
  }
  /** Records `chat`'s exact scope binding, populated on create and materialize. */
  _recordChatScope(chat, configurationResource, resource) {
    this._chatConfigScopes.set(chat.toString(), { configurationResource, resource });
  }
  /** Resolves the scope binding recorded for an exact source chat. */
  _sourceChatScope(source) {
    return this._chatConfigScopes.get(source.toString());
  }
  /**
   * Validates that Agent Host supplied context on a boundary whose protocol
   * signature still types it as optional. It does on every one of them; a
   * missing context is a host bug we surface rather than paper over by
   * inventing the owning session from the chat URI.
   */
  _requireChatContext(chat, context, operation) {
    if (!context) {
      throw new Error(`[Claude] ${operation} requires host chat context for ${chat.toString()}`);
    }
    return context;
  }
  _findSessionBySdkId(sdkSessionId) {
    return this._findAnySession(sdkSessionId);
  }
  /** Wrap a { ClaudeAgentSession} in a chat-leaf entry and forward its events. */
  _wireEntry(session) {
    const entry = new ClaudeChatEntry(session);
    entry.addDisposable(session.onDidSessionProgress((signal) => {
      this._onDidChatProgress.fire(signal);
      this._emitSpawnedChatEvents(signal);
    }));
    entry.addDisposable(session.onDidCustomizationsChange(() => this._onDidCustomizationsChange.fire()));
    return entry;
  }
  _registerLiveChat(chat, session) {
    const current = this._chatBackings.get(chat.toString());
    this._deleteLiveChat(chat.toString());
    this._chatEntriesBySdkId.deleteAndDispose(session.sessionId);
    this._chatEntriesBySdkId.set(session.sessionId, this._wireEntry(session));
    this._chatBackings.set(chat.toString(), {
      sdkSessionId: session.sessionId,
      ...current?.model ? { model: current.model } : {}
    });
  }
  _deleteLiveChat(chatKey) {
    const backing = this._chatBackings.get(chatKey);
    if (backing?.sdkSessionId) {
      this._chatEntriesBySdkId.deleteAndDispose(backing.sdkSessionId);
    }
  }
  /**
   * Tear down a chat's live entry only. Every caller that means to also
   * forget the chat's backing (a true dispose, not a release/teardown that
   * must resume later) does so explicitly — e.g. {@link _disposeChat}.
   * Never touching `_chatBackings` here keeps release/cold-resume uniform
   * for every concrete chat backing, since this operation does not encode
   * provider-specific persistence classes.
   */
  _deleteSession(session) {
    this._chatEntriesBySdkId.deleteAndDispose(session.sessionId);
  }
  /**
   * Bridges the agent's `subagent_started` signal onto the
   * {@link onDidSpawnChat} membership channel. The signals are still forwarded
   * verbatim on {@link onDidChatProgress} (the orchestrator's
   * `AgentSideEffects` keeps driving the sub-agent turn + parent tool-call
   * content); this event only mirrors the spawn into the unified chat catalog.
   * A completed subagent chat stays live and subscribable (it is removed only
   * on session teardown), so there is no corresponding end event. The catalog
   * add is idempotent so the overlap with the orchestrator's own membership
   * sequencing is safe.
   */
  _emitSpawnedChatEvents(signal) {
    const spawn6 = SubagentChatSignal.toSpawnEvent(signal);
    if (spawn6) {
      this._onDidSpawnChat.fire(spawn6);
    }
  }
  /**
   * The fallback transport for a session whose model names no provider (model-less
   * or a bare/legacy id). Read on demand at materialize — never cached — from live
   * availability: a started {@link _proxyHandle} means Copilot is serveable now, a
   * local Claude setup means native is. The precedence (sign-in state, then local
   * setup) is delegated to the pure {@link resolveClaudeTransportMode}. A
   * provider-qualified model bypasses this and routes on its own provider.
   */
  _defaultTransportMode() {
    const allowSignedOutWhenUsable = this._configurationService.getRootValue(agentHostCustomizationConfigSchema, "allowSignedOutWhenUsable" /* AllowSignedOutWhenUsable */) === true;
    return resolveClaudeTransportMode({ allowSignedOutWhenUsable, hasGitHubToken: this._proxyHandle !== void 0, hasExistingSetup: this._nativeAccountSetUp });
  }
  // #region Descriptor + auth
  getDescriptor() {
    return {
      provider: this.id,
      displayName: localize(2305, null),
      description: localize(2304, null),
      capabilities: {
        multipleChats: { fork: true, sideChat: true },
        ...this._isMultiRootEnabled() ? { multipleWorkingDirectories: { immutablePrimary: true } } : {}
      }
    };
  }
  _isMultiRootEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostClaudeMultiRootEnabledConfigKey) === true;
  }
  getProtectedResources() {
    const copilotResource = this._gitHubEndpointService.getCopilotResource();
    return [
      { ...copilotResource, required: false },
      this._gitHubEndpointService.getRepoResource()
    ];
  }
  /**
   * Resolve the active {@link ClaudeTransport} for a session. The transport is
   * derived from `model` via {@link resolveClaudeSessionTransport}: a
   * native-Anthropic model routes native and a Copilot-routed model routes
   * proxy; a model-less or bare/legacy-id session follows the on-demand
   * {@link _defaultTransportMode}. In native mode the transport is always ready (the
   * SDK owns credentials); in proxied mode a started proxy handle is required,
   * otherwise {@link AHP_AUTH_REQUIRED} is thrown so the client can drive
   * Copilot sign-in.
   */
  _ensureAuthenticated(model) {
    const transport = resolveClaudeSessionTransport({
      model,
      defaultMode: this._defaultTransportMode()
    });
    if (transport !== "proxy") {
      return { kind: "native" };
    }
    const handle = this._proxyHandle;
    if (!handle) {
      throw new ProtocolError(
        AHP_AUTH_REQUIRED,
        "Authentication is required to use Claude",
        this.getProtectedResources()
      );
    }
    return { kind: "proxy", handle };
  }
  async authenticate(resource, token) {
    if (resource === this._gitHubEndpointService.getRepoResource().resource) {
      return true;
    }
    if (resource !== this._gitHubEndpointService.getCopilotResource().resource) {
      return false;
    }
    if (!token) {
      const oldHandle2 = this._proxyHandle;
      const changed = this._githubToken !== void 0 || oldHandle2 !== void 0;
      this._githubToken = void 0;
      this._proxyHandle = void 0;
      oldHandle2?.dispose();
      if (changed) {
        this._models.set([], void 0);
        void this._startModelRefresh();
      }
      this._logService.info(changed ? "[Claude] Auth token cleared" : "[Claude] Auth token unchanged");
      return true;
    }
    if (this._githubToken === token && this._proxyHandle) {
      this._logService.info("[Claude] Auth token unchanged");
      return true;
    }
    let newHandle;
    try {
      newHandle = await this._claudeProxyService.start(token);
    } catch (err) {
      if (this._proxyHandle) {
        const staleHandle = this._proxyHandle;
        this._proxyHandle = void 0;
        this._githubToken = void 0;
        staleHandle.dispose();
        this._models.set([], void 0);
      }
      this._logService.warn("[Claude] Copilot proxy start failed; Copilot-routed models unavailable until the next sign-in", err);
      void this._startModelRefresh();
      return true;
    }
    const oldHandle = this._proxyHandle;
    this._proxyHandle = newHandle;
    this._githubToken = token;
    this._logService.info("[Claude] Auth token updated");
    oldHandle?.dispose();
    if (oldHandle) {
      this._models.set([], void 0);
    }
    void this._startModelRefresh();
    return true;
  }
  /**
   * {@link IAgent.refreshModels}. Coalesces onto an in-flight refresh and
   * never rejects — {@link _refreshModels} already logs and handles failure.
   *
   * Only safe for callers with no new input to apply (the host's periodic
   * scheduler). Triggers that invalidate the in-flight request — a rotated
   * token, a transport flip — must call {@link _startModelRefresh} so they
   * are not answered by a refresh bound to the superseded input.
   */
  refreshModels() {
    return this._modelRefreshInFlight ?? this._startModelRefresh();
  }
  /**
   * Unconditionally begins a refresh, superseding any in-flight one as the
   * coalescing target. The superseded request stays harmless: its own
   * stale-write guard drops the result if the token or transport moved on.
   */
  _startModelRefresh() {
    const refresh = this._refreshModels().finally(() => {
      if (this._modelRefreshInFlight === refresh) {
        this._modelRefreshInFlight = void 0;
      }
    });
    this._modelRefreshInFlight = refresh;
    return refresh;
  }
  /**
   * Enumerate both providers' catalogs in parallel and publish them as one
   * provider-qualified list via {@link mergeClaudeModelCatalogs}. Each source is
   * optional — the proxy catalog needs a GitHub token, the native catalog needs the
   * SDK on disk — so a source we can't attempt contributes an empty list rather
   * than failing the whole refresh. {@link Promise.allSettled} tolerates one source
   * erroring; only when *every* source we attempted fails do we keep the last
   * known-good catalog instead of blanking, so a transient double failure never
   * wipes the picker.
   *
   * Gating the native half on the SDK's own account report is deliberate and
   * load-bearing, not just an optimization. `supportedModels()` returns a *static*
   * list of models the SDK understands — it is not an entitlement or credential
   * check, and it answers even with no `ANTHROPIC_API_KEY`, no
   * `CLAUDE_CODE_OAUTH_TOKEN` and an empty `HOME`. Publishing it unconditionally
   * would advertise models for an agent that cannot serve a single request, which
   * reads downstream as "usable without GitHub" and would hold the Agents window
   * open on an agent that fails on its first turn. An empty catalog is the honest
   * signal: it surfaces as "no models" (`SessionTypeAuthRequirement.Unusable`)
   * rather than a sign-in prompt that would not help. The empty list is also what
   * the window reads account state *from*, so it must never be a guess.
   *
   * The native attempt is skipped while the SDK is not on disk: asking it anything
   * costs a multi-hundred-megabyte download, and that download is the user's
   * explicit choice to make.
   */
  async _refreshModels() {
    const tokenAtStart = this._githubToken;
    const canAttemptNative = await this._sdkService.canLoadWithoutDownload();
    if (!canAttemptNative) {
      this._nativeAccountSetUp = false;
    }
    const [proxyOutcome, nativeOutcome] = await Promise.allSettled([
      tokenAtStart ? this._fetchProxyModels(tokenAtStart) : Promise.resolve([]),
      canAttemptNative ? this._fetchNativeModels() : Promise.resolve([])
    ]);
    if (this._githubToken !== tokenAtStart) {
      return;
    }
    const attempted = (tokenAtStart ? 1 : 0) + (canAttemptNative ? 1 : 0);
    const failed = (proxyOutcome.status === "rejected" ? 1 : 0) + (nativeOutcome.status === "rejected" ? 1 : 0);
    if (attempted > 0 && failed === attempted) {
      this._logService.error("[Claude] All attempted model sources failed (merged refresh); keeping last known-good catalog");
    } else {
      const settledCatalog = (outcome, label) => {
        if (outcome.status === "fulfilled") {
          return outcome.value;
        }
        this._logService.error(outcome.reason, `[Claude] Failed to fetch ${label} models (merged refresh); keeping the other provider`);
        return [];
      };
      const proxyModels = settledCatalog(proxyOutcome, "proxy");
      const nativeModels = settledCatalog(nativeOutcome, "native");
      const merged = mergeClaudeModelCatalogs(proxyModels, nativeModels);
      this._logService.info(`[Claude] Models refreshed (merged). Count: ${merged.length}, ${merged.map((m) => m.name).join(", ")}`);
      this._models.set(merged, void 0);
    }
    this._sdkSetupChannel.publishWith(canAttemptNative);
  }
  /**
   * Native (BYO-Anthropic) model source: enumerate the SDK's built-in /
   * subscription models by opening a throwaway {@link IClaudeAgentSdkService.query}
   * (workspace-free options that read the user's real `~/.claude` config) and
   * calling `Query.supportedModels()` on it, then `close()`. The prompt never
   * yields, so no turn runs and no session transcript is written (verified
   * Phase 19 E2E). Projected with no commercial metadata, minus the SDK's
   * {@link isSdkDefaultModel} alias row.
   *
   * `accountInfo()` rides the *same* query, so asking is effectively free — and it
   * is the only honest source for "does this user have a Claude setup": a
   * `claude login` credential lives in the login keychain, where nothing on the
   * filesystem can see it. When it says no, the catalog is published empty.
   */
  async _fetchNativeModels() {
    const neverYieldingPrompt = {
      [Symbol.asyncIterator]: () => ({ next: () => new Promise(() => {
      }) })
    };
    const options = buildModelEnumerationOptions();
    const query = await this._sdkService.query({ prompt: neverYieldingPrompt, options });
    try {
      const [account, models] = await Promise.all([query.accountInfo(), query.supportedModels()]);
      const setUp = isClaudeAccountSetUp(account);
      this._nativeAccountSetUp = setUp;
      this._logService.info(`[Claude] Native account check: setUp=${setUp}, provider=${account.apiProvider ?? "none"}, tokenSource=${account.tokenSource ?? "absent"}, apiKeySource=${account.apiKeySource ?? "absent"}`);
      if (!setUp) {
        return [];
      }
      return models.filter((m) => !isSdkDefaultModel(m)).map((m) => fromSdkModelInfo(m, this.id));
    } finally {
      query.close();
      options.abortController?.abort();
    }
  }
  /**
   * Proxied (Copilot-CAPI) model source: fetch via {@link ICopilotApiService},
   * keep the Claude family, and surface the CAPI-flagged chat-default first.
   * The picker treats `models[0]` as the de facto default (modelPicker.ts:144
   * — `_selectedModel ?? models[0]`) since `IAgentModelInfo` carries no
   * explicit `isDefault` bit; the stable comparator returns 0 for equal-
   * priority models so CAPI's ordering wins on ties.
   */
  async _fetchProxyModels(token) {
    const userAgent2 = `${USER_AGENT_PREFIX2}/${this._productService.version}`;
    const all2 = await this._copilotApiService.models(token, { headers: { "User-Agent": userAgent2 }, suppressIntegrationId: true });
    return all2.filter(isClaudeModel).sort((a, b) => Number(b.is_chat_default) - Number(a.is_chat_default)).map((m) => toAgentModelInfo(m, this.id));
  }
  // #endregion
  // #region Chat truncation, permission/elicitation bridges, chat surface
  /**
   * Seed the eagerly-claimed active client (tools + customizations) into the
   * SDK at chat creation, mirroring the Copilot agent. Runs for fresh AND
   * re-created chats: when the workbench session state already carries the
   * active client, no follow-up `session/activeClientSet` is dispatched to
   * trigger the customization sync, so the built-in skills bundle would never
   * reach Claude otherwise. Progress is suppressed (`quiet`) because the AH
   * service may not have created the session state yet — a
   * `SessionCustomizationUpdated` envelope would be orphaned; the completed
   * snapshot is provided via `getChatCustomizations` immediately after.
   *
   * The client's contribution is addressed to exactly the chat this call
   * provisioned. A sibling chat of the same session never inherits it —
   * Agent Host addresses that chat with its own `getOrCreateActiveClient`
   * call on the next `session/activeClientSet` / `session/chatAdded` fan-out.
   */
  async _seedEagerActiveClient(chat, context, activeClient) {
    if (!activeClient) {
      return;
    }
    const handle = this.getOrCreateActiveClient(chat, context, { clientId: activeClient.clientId, displayName: activeClient.displayName });
    handle.tools = activeClient.tools;
    if (activeClient.customizations !== void 0) {
      await this.syncClientCustomizations(chat, context, activeClient.clientId, activeClient.customizations, { quiet: true });
    }
  }
  /**
   * In-place "Restore Checkpoint" truncation. Keeps turns
   * `[0..turnId]` INCLUSIVE (or removes all turns when `turnId` is
   * omitted) on the **same** session id / URI — unlike fork, which mints a
   * new id. The `turnId` path resolves the protocol turn to its SDK
   * assistant-envelope uuid ({@link resolveForkAnchorUuid}) and stages it
   * as a one-shot `resumeSessionAt` anchor that the next turn's rebuild
   * applies (the truncation finalizes when the next turn writes the
   * branch). Serialized on {@link _sessionSequencer} (same key as
   * `sendMessage`) so the `ChatTruncated` → `ChatTurnStarted` dispatch pair
   * stays ordered. Provisional sessions short-circuit.
   *
   * The owning session comes from `context` like every other addressed chat
   * operation, so the session-shaped first parameter is unused.
   */
  async truncateChat(chat, turnId, context) {
    if (!context) {
      throw new Error(`[Claude] truncateChat requires host chat context for ${chat.toString()}`);
    }
    const initialContext = this._resolveChatContext(chat, context);
    await this._sessionSequencer.queue(initialContext.sequencerKey, async () => {
      const current = this._resolveChatContext(chat, context);
      const existing = current.target;
      const sdkSessionId = current.sdkSessionId;
      if (!sdkSessionId) {
        throw new Error(`Cannot truncate chat ${chat.toString()}: backing SDK session not found`);
      }
      if (existing && !existing.isPipelineReady) {
        this._logService.info(`[Claude:${sdkSessionId}] truncateChat on a provisional chat \u2014 nothing to truncate`);
        return;
      }
      if (turnId === void 0) {
        await this._removeAllTurns(current, sdkSessionId, existing);
        return;
      }
      const messages = await this._sdkService.getSessionMessages(sdkSessionId, { includeSystemMessages: true });
      const anchor = resolveForkAnchorUuid(messages, turnId);
      if (anchor === void 0) {
        throw new Error(`Cannot truncate session ${sdkSessionId}: turn ${turnId} not found in transcript`);
      }
      const live = existing ?? await this._ensureResolvedChatSession(current);
      await live.truncateToTurn(turnId, anchor, current.resource);
      this._logService.info(`[Claude:${sdkSessionId}] truncateChat kept [0..${turnId}] (anchor=${anchor})`);
    });
  }
  /**
   * Remove-all ("start over") branch of {@link truncateChat}: there is no
   * anchor to resume at, so tear down the live Query, delete the on-disk
   * transcript via the SDK, then recreate a fresh provisional bound to the
   * SAME chat and SDK id, so the next `sendMessage` materializes non-resume
   * `{ sessionId }` on a clean transcript. `deleteSession` is eagerly durable
   * (unlike the lazy `turnId` path), matching its "clear / start over"
   * semantic. `existing` is the live session, or `undefined` on the cold path
   * (unloaded chat).
   *
   * The SDK's own record is read BEFORE the delete so the cold path still
   * recovers the working directory the recreated conversation needs — after
   * `deleteSession` the transcript (and its `cwd`) may be gone. Caller
   * serializes on {@link _sessionSequencer}.
   */
  async _removeAllTurns(context, sdkSessionId, existing) {
    const info = existing ? void 0 : await this._sdkService.getSessionInfo(sdkSessionId);
    const workingDirectories = existing?.workingDirectories ?? (info?.cwd ? [URI.file(info.cwd)] : void 0);
    await existing?.shutdownLiveQuery();
    if (existing) {
      this._deleteSession(existing);
    }
    await this._sdkService.deleteSession(sdkSessionId);
    const fresh = await this._createProvisionalChatSession(context.configurationResource, context.chat, context.resource, workingDirectories);
    await fresh.pruneAllTurns(context.resource);
    this._logService.info(`[Claude:${sdkSessionId}] truncateChat removed all turns (deleteSession + fresh same-id)`);
  }
  /**
   * Builds the SDK `canUseTool` permission bridge for a session/chat. The
   * resolver searches every live SDK conversation by SDK id so one
   * chat's tool-permission requests reach its own pending-permission registry.
   *
   * `configurationResource` is the session-wide config scope, distinct from
   * the invoking chat's own `resource` — a peer/side chat has its own
   * `resource` but shares its owning session's `configurationResource`.
   * `ExitPlanMode`'s permission-mode write (the bridge's one config
   * mutation) must target that shared scope regardless of which chat
   * approved the plan.
   */
  _makeCanUseTool(sdkSessionId, configurationResource) {
    return (toolName, input, options) => handleCanUseTool(
      {
        getSession: (id2) => this._findSessionBySdkId(id2),
        configurationService: this._configurationService,
        configurationResource,
        serverToolHost: this._serverToolHost
      },
      sdkSessionId,
      toolName,
      input,
      options
    );
  }
  /**
   * Builds the SDK `onElicitation` bridge for a session/chat. Mirrors
   * {@link _makeCanUseTool}: resolves the session by SDK id (all live
   * chats) and delegates to the elicitation bridge, which parks on the
   * session's user-input channel.
   */
  _makeOnElicitation(sdkSessionId) {
    return (request, options) => handleElicitation(
      { getSession: (id2) => this._findSessionBySdkId(id2) },
      sdkSessionId,
      request,
      options
    );
  }
  /**
   * Promote a provisional {@link ClaudeAgentSession} into a live one.
   * Called from {@link sendMessage} inside the {@link _sessionSequencer.queue}
   * block, so concurrent first sends serialize naturally — exactly
   * one materialize per session.
   *
   * Failure modes:
   * - Missing session entry → programmer error, throws.
   * - Missing proxy handle → caller forgot {@link authenticate}, throws.
   * - Aborted before SDK init returns → {@link ClaudeAgentSession.materialize}
   *   disposes the `WarmQuery` and throws {@link CancellationError}.
   * - Customization-directory persistence failure → fatal: the session's
   *   `materialize` throws, the agent drops the entry, and the error
   *   propagates so the caller learns about it.
   * - Aborted post-metadata-write but pre-commit → second abort gate
   *   inside `materialize` throws so we never expose a live pipeline
   *   for a session the caller has already torn down.
   */
  async _materializeProvisional(sessionId, context, workingDirectories) {
    const session = this._findAnySession(sessionId);
    if (!session) {
      throw new Error(`Cannot materialize unknown provisional session: ${sessionId}`);
    }
    const resource = context.resource;
    const transport = this._ensureAuthenticated(session.provisionalModel);
    const canUseTool = this._makeCanUseTool(sessionId, context.configurationResource);
    const onElicitation = this._makeOnElicitation(sessionId);
    this._recordChatScope(context.chat, context.configurationResource, context.resource);
    try {
      await session.materialize({
        transport,
        canUseTool,
        onElicitation,
        isResume: false,
        resource,
        configResource: context.configurationResource,
        customizations: context.customizations,
        workingDirectories,
        serverToolHost: this._serverToolHost
      });
      await this._persistSessionOverlay(resource, context.configurationResource, session, transport.kind);
      if (session.abortController.signal.aborted) {
        throw new CancellationError();
      }
    } catch (err) {
      this._deleteSession(session);
      throw err;
    }
    const materializedWorkingDirectories = workingDirectories ?? session.workingDirectories;
    this._checkpointService.captureBaselineCheckpoint(context.configurationResource, materializedWorkingDirectories).catch((err) => {
      this._logService.warn(`[Claude:${sessionId}] Baseline checkpoint capture failed: ${err instanceof Error ? err.message : String(err)}`);
    });
    this._onDidMaterializeChat.fire({
      chat: context.chat,
      project: session.project,
      workingDirectories: materializedWorkingDirectories
    });
    return session;
  }
  async _persistSessionOverlay(resource, configResource, session, transportKind) {
    try {
      await this._metadataStore.write(resource, {
        customizationDirectory: session.workingDirectory,
        model: session.provisionalModel,
        permissionMode: readClaudePermissionMode(this._configurationService, configResource) ?? session.permissionModeFallback,
        transport: transportKind,
        workingDirectories: session.workingDirectories,
        ...session.provisionalAgent ? { agent: session.provisionalAgent } : {}
      });
    } catch (err) {
      this._logService.error(`[Claude] Failed to persist customization directory; aborting materialize`, err);
      throw err;
    }
  }
  /**
   * Pull `permissionMode` out of the post-validation `IAgentCreateChatOptions.config`
   * bag, narrowing the runtime `unknown` value to the SDK's `PermissionMode`
   * union (5/6 values, excluding `dontAsk`; sdk.d.ts:1560). Falls back to
   * `'default'` when the bag is absent or carries something the schema
   * validator shouldn't have accepted (defense-in-depth).
   */
  _resolvePermissionMode(config) {
    return narrowClaudePermissionMode(config?.["permissionMode" /* PermissionMode */]) ?? "default";
  }
  async _disposeLiveSession(session) {
    session.abortController.abort();
    if (!session.isPipelineReady) {
    } else {
      session.abort();
    }
    this._deleteSession(session);
  }
  // #region Chat creation — the one algorithm every chat is created by
  /**
   * The single chat-creation algorithm.
   *
   * Every chat Agent Host creates runs exactly this path — a session's first
   * chat, an additional chat, a fork, or an import. There is no
   * session-versus-additional branch and no provider-side chat role: this
   * consumes the fully-resolved options AH hands over (model, agent, working
   * directories, project, config, active client, plus the optional
   * import / fork sources), binds the addressed chat to exactly
   * one SDK conversation, records that conversation as the chat's exact
   * opaque backing, and hands the backing back.
   *
   * The result reports what this creation resolved for the chat itself — the
   * resolved `project` / `resolvedWorkingDirectory`, and the `provisional`
   * bit for a runtime that has not reached the SDK yet — next to the opaque
   * `providerData` blob and the separately-enumerable `backingSession` AH
   * suppresses from its session list. There is no `session` field: what any
   * of that means for the chat's role in the session is Agent Host's
   * decision, not this provider's.
   */
  async _createChat(chat, context, options) {
    const model = options?.importConversation?.model ?? options?.model;
    if (model || !options?.fork) {
      this._ensureAuthenticated(model);
    }
    const chatKey = chat.toString();
    this._recordChatScope(chat, context.configurationResource, context.resource);
    return this._sessionSequencer.queue(chatKey, async () => {
      const existing = this._chatBackings.get(chatKey);
      const created = existing ? this._recreatedChatResult(existing, options) : await this._bindChatConversation(chat, context, model, options);
      await this._seedEagerActiveClient(chat, context, options?.activeClient);
      return created;
    });
  }
  /**
   * Re-creation of a chat this provider already backs: hand the recorded
   * backing back verbatim so the orchestrator re-persists a consistent blob,
   * together with whatever its live runtime (if any) has resolved so far.
   */
  _recreatedChatResult(backing, options) {
    const live = this._findAnySession(backing.sdkSessionId);
    const resolvedWorkingDirectory = live?.workingDirectory ?? options?.workingDirectories?.[0];
    return {
      ...live?.project ? { project: live.project } : {},
      ...resolvedWorkingDirectory ? { resolvedWorkingDirectory } : {},
      ...live && !live.isPipelineReady ? { provisional: true } : {},
      ...this._chatBackingResult(backing)
    };
  }
  /**
   * Bind the addressed chat to exactly one SDK conversation: the one
   * inherited from a fork source when that source resolves, a
   * freshly minted one otherwise.
   */
  async _bindChatConversation(chat, context, model, options) {
    const inherited = await this._inheritSourceConversation(options);
    return inherited.sdkSessionId !== void 0 ? this._bindInheritedConversation(chat, context, { ...inherited, sdkSessionId: inherited.sdkSessionId }, model, options) : this._bindFreshConversation(chat, context, inherited, model, options);
  }
  /**
   * Resolve the SDK conversation a new chat inherits from its fork or
   * fork source.
   *
   * An unresolvable source — the source chat has no backing, or its turn is
   * absent from the SDK transcript, which is the normal case for a source
   * conversation that is still live and unflushed — is deliberately not
   * fatal: the chat is created fresh instead of inheriting the whole source
   * backend or failing outright. A fresh backing is a degraded branch rather
   * than a lost chat.
   */
  async _inheritSourceConversation(options) {
    if (!options?.fork) {
      return {};
    }
    const forked = await this._forkChat(options.fork);
    return {
      ...forked ? { sdkSessionId: forked.sessionId } : {},
      ...forked?.inheritedTurnId !== void 0 ? { inheritedTurnId: forked.inheritedTurnId } : {}
    };
  }
  /**
   * Bind a chat to an SDK conversation inherited from a fork
   * source. That conversation already owns a transcript on disk, so nothing
   * is materialized here: recording the backing alone routes the chat's first
   * send through {@link _createProvisionalChatSession}, which cold-resumes it
   * (`isResume: true`) exactly like any other restored chat — see CONTEXT M9.
   * Its resolved settings are persisted to the overlay right away precisely
   * because there is no in-memory runtime holding them in the meantime.
   *
   * Everything inherited comes from the source's own provider state (its SDK
   * `cwd`, its live runtime, its overlay); host-supplied options override it.
   */
  async _bindInheritedConversation(chat, context, inherited, model, options) {
    const { sdkSessionId } = inherited;
    const sourceChat = options?.fork?.source;
    const sourceBinding = sourceChat ? this._sourceChatScope(sourceChat) : void 0;
    const sourceResource = sourceBinding?.resource ?? sourceChat ?? context.resource;
    let sourceOverlay = {};
    try {
      sourceOverlay = await this._metadataStore.read(sourceResource);
    } catch (err) {
      this._logService.warn(`[Claude] createChat: source overlay read failed for ${sourceResource.toString()}; continuing with defaults`, err);
    }
    const sourceSdkId = sourceChat ? this._sourceChatSdkId(sourceChat) : void 0;
    const liveSource = sourceSdkId ? this._findAnySession(sourceSdkId) : void 0;
    const backingModel = sourceChat ? this._chatBackings.get(sourceChat.toString())?.model : void 0;
    const inheritedModel = model ?? liveSource?.provisionalModel ?? sourceOverlay.model ?? backingModel;
    const agent = options?.agent ?? liveSource?.provisionalAgent ?? sourceOverlay.agent;
    const permissionMode = narrowClaudePermissionMode(options?.config?.["permissionMode" /* PermissionMode */]) ?? liveSource?.permissionModeFallback ?? sourceOverlay.permissionMode;
    const sdkInfo = await this._sdkService.getSessionInfo(sdkSessionId);
    const inheritedDirectories = liveSource?.workingDirectories ?? sourceOverlay.workingDirectories ?? options?.workingDirectories;
    const workingDirectory = sdkInfo?.cwd ? URI.file(sdkInfo.cwd) : inheritedDirectories?.[0];
    if (!workingDirectory) {
      throw new Error(`Cannot create chat ${chat.toString()}: inherited conversation ${sdkSessionId} has no working directory (SDK cwd and source working directories missing)`);
    }
    const workingDirectories = [workingDirectory, ...inheritedDirectories?.slice(1) ?? []];
    await this._metadataStore.write(context.resource, {
      ...inheritedModel ? { model: inheritedModel } : {},
      ...permissionMode ? { permissionMode } : {},
      ...agent ? { agent } : {},
      workingDirectories
    });
    const project = await this._resolveProject(workingDirectory);
    const backing = this._recordChatBacking(chat, {
      sdkSessionId,
      ...inheritedModel ? { model: inheritedModel } : {}
    });
    this._logService.info(`[Claude] Bound chat ${chat.toString()} to inherited conversation ${sdkSessionId} for scope ${context.configurationResource.toString()}`);
    return {
      resolvedWorkingDirectory: workingDirectory,
      ...project ? { project } : {},
      ...inherited.inheritedTurnId !== void 0 ? { inheritedTurnId: inherited.inheritedTurnId } : {},
      ...this._chatBackingResult(backing)
    };
  }
  /**
   * Bind a chat to a freshly minted SDK conversation, whose id is independent
   * of the Agent Host session id. The conversation is provisional: nothing
   * reaches the SDK (and nothing is persisted) until the chat's first send
   * materializes it, so the in-memory {@link ClaudeAgentSession} carries the
   * resolved model / agent / config / permission mode until
   * {@link _persistSessionOverlay} writes them at materialize time.
   *
   * `importConversation` has no native transcript-seeding capability on
   * Claude (unlike Copilot's JSONL event-log import): there is no SDK API to
   * seed a conversation from arbitrary `Turn[]`. The imported turns' display
   * is the host-level catalog's responsibility until this chat's first real
   * `sendMessage` starts a genuine SDK transcript.
   */
  async _bindFreshConversation(chat, context, inherited, model, options) {
    const sdkSessionId = generateUuid();
    const requestedWorkingDirectory = options?.workingDirectories?.[0];
    const workingDirectory = requestedWorkingDirectory ?? await ensureWorkspacelessScratchDir(this._environmentService.userHome, AgentSession.id(context.configurationResource));
    const project = requestedWorkingDirectory ? await this._resolveProject(requestedWorkingDirectory) : void 0;
    const backing = this._recordChatBacking(chat, {
      sdkSessionId,
      ...model ? { model } : {}
    });
    const session = ClaudeAgentSession.createProvisional(
      sdkSessionId,
      chat,
      workingDirectory,
      project,
      model,
      options?.agent,
      options?.config,
      new PendingRequestRegistry(),
      this._resolvePermissionMode(options?.config),
      this._instantiationService,
      options?.workingDirectories?.slice(1) ?? []
    );
    this._registerLiveChat(chat, session);
    this._logService.info(`[Claude] Bound chat ${chat.toString()} to fresh conversation ${sdkSessionId} for scope ${context.configurationResource.toString()}`);
    return {
      resolvedWorkingDirectory: workingDirectory,
      provisional: true,
      ...project ? { project } : {},
      ...this._chatBackingResult(backing)
    };
  }
  /** Record a chat's exact backing, replacing any previous one. */
  _recordChatBacking(chat, backing) {
    this._chatBackings.set(chat.toString(), backing);
    return backing;
  }
  /** Best-effort git project metadata for a resolved working directory. */
  async _resolveProject(workingDirectory) {
    try {
      return await projectFromCopilotContext({ cwd: workingDirectory.fsPath }, this._gitService);
    } catch (err) {
      this._logService.warn(`[Claude] project resolution failed for ${workingDirectory.toString()}; continuing without project`, err);
      return void 0;
    }
  }
  /**
   * Dispose exactly one chat, tearing down its live SDK session (if any) and
   * dropping its backing.
   *
   * Routed through {@link _sessionSequencer} (keyed on the chat's SDK id) so
   * it waits for any in-flight {@link _resolveOrResumeChatSessionLocked} or
   * {@link sendMessage} to finish before tearing down — prevents
   * use-after-dispose if a send is concurrently in progress. The durable
   * chat catalog is owned by the orchestrator now, so this only drops the
   * live session and its provider backing data. There is no separate
   * session-level finalization hook: the trace context keyed on the chat's
   * own `resource` (the configuration scope, for a session's primary chat)
   * is released right here, once, when that exact chat is disposed.
   */
  async _disposeChat(chat, operationContext) {
    const chatKey = chat.toString();
    const initialContext = this._resolveChatContext(chat, operationContext);
    await this._sessionSequencer.queue(initialContext.sequencerKey, async () => {
      const target = this._findChatByUri(chatKey);
      if (target) {
        await this._disposeLiveSession(target);
      }
      this._chatBackings.delete(chatKey);
      this._chatConfigScopes.delete(chatKey);
      this._pruneActiveClientHandlesForChat(chat);
      this._otelService.releaseSessionTraceContext(initialContext.resource.toString());
    });
  }
  async _releaseChat(chat, operationContext) {
    const chatKey = chat.toString();
    const initialContext = this._resolveChatContext(chat, operationContext);
    await this._sessionSequencer.queue(initialContext.sequencerKey, async () => {
      const target = this._findChatByUri(chatKey);
      if (!target || !target.isPipelineReady || target.hasActiveTurn) {
        return;
      }
      this._logService.info(`[Claude:${target.sessionId}] Releasing idle chat from memory (durable state preserved)`);
      await this._disposeLiveSession(target);
    });
  }
  /**
   * Fork the source chat's SDK conversation at the requested turn and return
   * the new conversation's id plus the id of its final inherited turn. Returns
   * `undefined` — so the caller mints a fresh conversation instead — when the
   * source chat has no backing or the fork anchor is absent from the SDK
   * transcript.
   *
   * Deliberately NOT serialized against the source conversation: a side chat
   * branches from a turn that is typically still in flight, so waiting for
   * the source's sequencer would park the new chat behind the very turn it
   * branches from. The SDK's flushed transcript is read-only here.
   */
  async _forkChat(fork2) {
    const sourceSdkId = this._sourceChatSdkId(fork2.source);
    if (!sourceSdkId) {
      this._logService.warn(`[Claude] createChat fork: source ${fork2.source.toString()} has no SDK chat; creating fresh chat`);
      return void 0;
    }
    const messages = await this._sdkService.getSessionMessages(sourceSdkId, { includeSystemMessages: true });
    const upToMessageId = resolveForkAnchorUuid(messages, fork2.turnId);
    if (upToMessageId === void 0) {
      this._logService.warn(`[Claude] createChat fork: turn ${fork2.turnId} not found in source ${sourceSdkId}; creating fresh chat`);
      return void 0;
    }
    const { sessionId } = await this._sdkService.forkSession(sourceSdkId, { upToMessageId });
    const anchorIndex = messages.findIndex((message) => message.uuid === upToMessageId);
    const inheritedTurns = mapSessionMessagesToTurns(messages.slice(0, anchorIndex + 1), fork2.source, this._logService);
    return { sessionId, inheritedTurnId: inheritedTurns.at(-1)?.id };
  }
  /** Resolves the SDK conversation recorded for an exact source chat. */
  _sourceChatSdkId(source) {
    return this._chatBackings.get(source.toString())?.sdkSessionId;
  }
  /**
   * Returns the live {@link ClaudeAgentSession} for an exact chat, resuming
   * its provider backing when necessary. The caller holds the chat sequencer.
   */
  async _resolveOrResumeChatSessionLocked(context, workingDirectories) {
    const { configurationResource, chat, chatKey, resource } = context;
    const existing = this._findChatByUri(chatKey);
    if (existing?.isPipelineReady) {
      return existing;
    }
    const chatSession = existing ?? await this._createProvisionalChatSession(configurationResource, chat, resource, workingDirectories);
    const sdkInfo = await this._sdkService.getSessionInfo(chatSession.sessionId);
    const transport = this._ensureAuthenticated(chatSession.provisionalModel);
    const canUseTool = this._makeCanUseTool(chatSession.sessionId, configurationResource);
    const onElicitation = this._makeOnElicitation(chatSession.sessionId);
    this._recordChatScope(chat, configurationResource, resource);
    try {
      await chatSession.materialize({
        transport,
        canUseTool,
        onElicitation,
        isResume: !!sdkInfo,
        resource,
        configResource: configurationResource,
        customizations: context.customizations,
        workingDirectories,
        serverToolHost: this._serverToolHost
      });
      await this._persistSessionOverlay(resource, configurationResource, chatSession, transport.kind);
    } catch (err) {
      this._deleteLiveChat(chatKey);
      throw err;
    }
    this._onDidMaterializeChat.fire({
      chat: context.chat,
      project: chatSession.project,
      workingDirectories: workingDirectories ?? chatSession.workingDirectories
    });
    return chatSession;
  }
  /**
   * Resolves the live runtime for an addressed chat, materializing or
   * cold-resuming its exact backing as needed.
   *
   * Uniform for every chat: there is one provider state to consult (the
   * chat's exact backing) and one shape of resolution. A chat with no
   * backing is a host contract violation — Agent Host creates or
   * re-materializes a backing before addressing any operation to a chat —
   * so it surfaces rather than being guessed at from the session identity.
   */
  async _ensureResolvedChatSession(context, workingDirectories) {
    const existing = context.target;
    if (existing?.isPipelineReady) {
      return existing;
    }
    if (existing) {
      return this._materializeProvisional(existing.sessionId, context, workingDirectories);
    }
    return this._resolveOrResumeChatSessionLocked(context, workingDirectories);
  }
  /**
   * Build a provisional {@link ClaudeAgentSession} from an exact chat backing
   * and its provider-owned overlay.
   */
  async _createProvisionalChatSession(configurationResource, chat, resource, fallbackWorkingDirectories) {
    const info = this._chatBackings.get(chat.toString());
    if (!info) {
      throw new Error(`[Claude] no backing chat for chat ${chat.toString()}`);
    }
    let overlay = {};
    try {
      overlay = await this._metadataStore.read(resource);
    } catch (err) {
      this._logService.warn(`[Claude] chat overlay read failed for ${chat.toString()}; continuing with defaults`, err);
    }
    const sdkInfo = await this._sdkService.getSessionInfo(info.sdkSessionId);
    const workingDirectories = sdkInfo?.cwd ? [URI.file(sdkInfo.cwd), ...overlay.workingDirectories?.slice(1) ?? []] : overlay.workingDirectories ?? fallbackWorkingDirectories;
    const workingDirectory = workingDirectories?.[0];
    if (!workingDirectory) {
      throw new Error(`[Claude] cannot materialize chat ${chat.toString()}: working directory missing (no SDK transcript and no persisted overlay)`);
    }
    const additionalDirectories = workingDirectories.slice(1);
    let project;
    try {
      project = await projectFromCopilotContext({ cwd: workingDirectory.fsPath }, this._gitService);
    } catch (err) {
      this._logService.warn(`[Claude] project resolution failed for chat ${chat.toString()}; continuing without project`, err);
    }
    const permissionMode = readClaudePermissionMode(this._configurationService, configurationResource) ?? overlay.permissionMode ?? "default";
    const model = overlay.model ?? info.model;
    const chatSession = ClaudeAgentSession.createProvisional(
      info.sdkSessionId,
      chat,
      workingDirectory,
      project,
      model,
      overlay.agent,
      void 0,
      new PendingRequestRegistry(),
      permissionMode,
      this._instantiationService,
      additionalDirectories
    );
    this._registerLiveChat(chat, chatSession);
    this._recordChatScope(chat, configurationResource, resource);
    this._forEachActiveClientHandleForChat(chat, (handle) => handle.refresh());
    return chatSession;
  }
  /** Visits the active-client handles Agent Host registered for the exact `chat`. */
  _forEachActiveClientHandleForChat(chat, visit2) {
    const prefix = `${chat.toString()}\0`;
    for (const [key, handle] of this._activeClientHandles) {
      if (key.startsWith(prefix)) {
        visit2(handle);
      }
    }
  }
  /** Drops every active-client handle addressed to the exact `chat`, e.g. on dispose. */
  _pruneActiveClientHandlesForChat(chat) {
    const prefix = `${chat.toString()}\0`;
    for (const key of [...this._activeClientHandles.keys()]) {
      if (key.startsWith(prefix)) {
        this._activeClientHandles.delete(key);
      }
    }
  }
  /**
   * Update a concrete chat backing's model and push the refreshed opaque
   * `providerData` blob to the orchestrator (via
   * {@link onDidChangeChatData}) so the durable catalog stays in sync.
   */
  async _updateChatBackingModel(chat, model) {
    const existing = this._chatBackings.get(chat.toString());
    if (!existing) {
      return;
    }
    const updated = { ...existing, model };
    this._chatBackings.set(chat.toString(), updated);
    this._onDidChangeChatData.fire({ chat, providerData: encodeProviderData(_toPersistedChat(updated)) });
  }
  /**
   * Re-attach a concrete chat backing from opaque provider data, recording
   * its exact scope binding (configuration scope AND own persistence
   * resource) so a later fork naming this chat as its source can resolve
   * both without deriving them from URI shape. This is the sole restore
   * path for a chat that was never (re-)created in this process — a cold
   * chat — so it is the only place that scope binding exists for it.
   */
  async materializeChat(chat, context, providerData) {
    const resolved = resolveAgentChatContext(context, chat);
    this._recordChatScope(chat, resolved.configurationResource, resolved.resource);
    if (providerData === void 0) {
      if (!isDefaultChatUri(chat)) {
        return;
      }
      const backing = { sdkSessionId: AgentSession.id(resolved.configurationResource) };
      this._chatBackings.set(chat.toString(), backing);
      return { providerData: encodeProviderData(_toPersistedChat(backing)) };
    }
    const persisted = decodeProviderData(providerData);
    if (!persisted) {
      this._logService.warn(`[Claude] materializeChat: dropping corrupt providerData for ${chat.toString()}`);
      return;
    }
    this._chatBackings.set(chat.toString(), {
      sdkSessionId: persisted.sdkSessionId,
      ...persisted.model ? { model: persisted.model } : {}
    });
  }
  /**
   * Recover the historical implicit default-chat SDK identity for a
   * session that predates the exact-chat catalog's persisted
   * `providerData`: before exact-chat backings existed, a session's
   * primary chat was simply the SDK conversation sharing the session's
   * own id (`AgentSession.id(session)`) — no separate blob was ever
   * written to decode. Uses only the host-supplied
   * `context.configurationResource` (never derives or recognizes a
   * default-chat shape from `chat` itself, per the exact-chat-only
   * restore contract) and records it as a plain, canonical exact backing.
   * From here on the recovered chat resolves, routes, truncates, and
   * releases exactly like every other chat.
   *
   * Performs no SDK I/O and reads no legacy metadata, so it is idempotent
   * (recomputes the same identity on every call, and keeps an
   * already-recorded backing) and non-destructive. Returns the canonical
   * opaque blob so the orchestrator can persist it additively going
   * forward.
   */
  async recoverLegacyChat(chat, context) {
    const { configurationResource, resource } = resolveAgentChatContext(context, chat);
    const chatKey = chat.toString();
    const backing = this._chatBackings.get(chatKey) ?? { sdkSessionId: AgentSession.id(configurationResource) };
    this._chatBackings.set(chatKey, backing);
    this._recordChatScope(chat, configurationResource, resource);
    return { providerData: encodeProviderData(_toPersistedChat(backing)) };
  }
  async _getChatMessages(chat, context) {
    return this._readChatMessages(this._resolveChatContext(chat, context));
  }
  // #endregion
  /**
   * Test-only accessor for the materialized {@link ClaudeAgentSession}, so
   * tests can inspect `_isResumed` directly. Marked `ForTesting` so the
   * production surface stays unaware of its existence; the protocol
   * surface (`IAgent`) does not include it.
   */
  getSessionForTesting(session) {
    const sess = this._findChatByUri(URI.parse(buildDefaultChatUri(session))) ?? this._findAnySession(AgentSession.id(session));
    return sess?.isPipelineReady ? sess : void 0;
  }
  async _readChatMessages(context) {
    if (!await this._sdkService.canLoadWithoutDownload()) {
      this._logService.info("[Claude] SDK not downloaded yet; deferring session messages until a session triggers the download");
      return [];
    }
    if (context.spawnedFrom) {
      return this._readSubagentMessages(context);
    }
    const sess = context.target;
    if (sess && !sess.isPipelineReady) {
      this._logService.info(`[Claude] getMessages: chat ${context.chatKey} is not materialized yet; returning no turns`);
      return [];
    }
    if (!context.sdkSessionId) {
      return [];
    }
    return this._reconstructTurns(context.sdkSessionId, context.chat, sess?.subagents);
  }
  /**
   * Reconstruct a provider-spawned subagent chat's transcript.
   *
   * A subagent has no backing of its own: its turns live inside the spawning
   * chat's SDK transcript, keyed by the tool call that delegated to it. Both
   * halves of that spawn edge come from the host-supplied origin
   * ({@link IResolvedClaudeChatContext.spawnedFrom}) — the provider neither
   * recovers them from shared host state nor re-derives them from URI shape.
   * Without an origin (or without the spawning chat's backing) there is
   * nothing to read, and the transcript is empty.
   */
  async _readSubagentMessages(context) {
    const spawnedFrom = context.spawnedFrom;
    if (!spawnedFrom) {
      return [];
    }
    const parentChat = spawnedFrom.chat;
    const parentSessionId = this._chatBackings.get(parentChat.toString())?.sdkSessionId;
    if (!parentSessionId) {
      return [];
    }
    const parentSession = this._findAnySession(parentSessionId);
    const store = new DisposableStore();
    const subagents = parentSession?.subagents ?? store.add(new SubagentRegistry());
    try {
      if (!parentSession) {
        await this._reconstructTurns(parentSessionId, parentChat, subagents);
      }
      return await getSubagentTranscript(context.chat, parentChat, parentSessionId, spawnedFrom.toolCallId, subagents, this._sdkService, this._logService, CancellationToken.None);
    } catch (err) {
      this._logService.warn(`[Claude] getSubagentTranscript threw for ${context.chatKey}`, err);
      return [];
    } finally {
      store.dispose();
    }
  }
  /**
   * Fetch a chat's SDK transcript ({@link sdkSessionId}) and map it to
   * protocol {@link Turn}s routed to {@link routingUri} (the session or chat
   * channel URI). When {@link subagents} is supplied, it is primed from the agentId suffixes the
   * SDK encoded in Task tool_result blocks. Resilient: any failure warn-logs
   * and returns `[]` rather than propagating.
   */
  async _reconstructTurns(sdkSessionId, routingUri, subagents) {
    let messages;
    try {
      messages = await this._sdkService.getSessionMessages(sdkSessionId, { includeSystemMessages: true });
    } catch (err) {
      this._logService.warn(`[Claude] getSessionMessages SDK fetch failed for ${sdkSessionId}`, err);
      return [];
    }
    let turns;
    try {
      turns = mapSessionMessagesToTurns(messages, routingUri, this._logService);
    } catch (err) {
      this._logService.warn(`[Claude] replay mapper threw for ${sdkSessionId}`, err);
      return [];
    }
    if (turns.length === 0 && messages.length > 0) {
      this._logService.warn(`[Claude] replay produced no turns from ${messages.length} transcript message(s) for ${sdkSessionId}; chat will render empty`);
    }
    try {
      subagents?.primeFromTranscript(turns);
    } catch (err) {
      this._logService.warn(`[Claude] primeFromTranscript threw for ${sdkSessionId}`, err);
    }
    return turns;
  }
  async _listClaudeCodeChats() {
    let sdkEntries;
    try {
      sdkEntries = await this._sdkService.listSessions();
    } catch (err) {
      this._logService.warn("[Claude] SDK listSessions failed; deferring chat discovery", err);
      return void 0;
    }
    return Promise.all(sdkEntries.map((entry) => {
      const session = AgentSession.uri(this.id, entry.sessionId);
      const chat = URI.parse(buildDefaultChatUri(session));
      return this._withPersistedWorkingDirectories(session, { chat, ...this._metadataStore.project(entry) });
    }));
  }
  startChatDiscovery() {
    return this._startClaudeCodeChatDiscovery();
  }
  async listChatsToMigrate() {
    if (!await this._sdkService.canLoadWithoutDownload()) {
      this._logService.info("[Claude] SDK not downloaded yet; deferring the migratable chat list");
      return AgentChatMigrationDeferred;
    }
    const chats = await this._listClaudeCodeChats();
    if (!chats) {
      return void 0;
    }
    const limiter = new Limiter(4);
    const known = await Promise.all(chats.map((chat) => limiter.queue(async () => {
      return await this._isKnownClaudeCodeChat(chat) ? chat : void 0;
    })));
    return known.filter((chat) => chat !== void 0);
  }
  _startClaudeCodeChatDiscovery() {
    if (!this._claudeCodeChatDiscovery) {
      this._claudeCodeChatDiscovery = retry(async () => {
        if (!await this._sdkService.canLoadWithoutDownload()) {
          this._logService.info("[Claude] SDK not downloaded yet; deferring chat discovery");
          return;
        }
        if (!await this._emitClaudeCodeChats()) {
          throw new Error("Claude chat catalog is not available");
        }
      }, 5e3, 3).catch((err) => this._logService.warn("[Claude] Chat discovery failed", err));
    }
    return this._claudeCodeChatDiscovery;
  }
  /** Runs discovery again for whoever is still subscribed, after it deferred for want of an SDK. */
  _restartChatDiscovery() {
    if (this._claudeCodeChatDiscovery) {
      this._claudeCodeChatDiscovery = void 0;
      void this._startClaudeCodeChatDiscovery();
    }
  }
  async _emitClaudeCodeChats() {
    try {
      const chats = await this._listClaudeCodeChats();
      if (chats) {
        const limiter = new Limiter(4);
        const unknown = await Promise.all(chats.map((chat) => limiter.queue(async () => {
          return await this._isKnownClaudeCodeChat(chat) ? void 0 : { ...chat, external: true };
        })));
        this._onDidDiscoverChats.fire(unknown.filter((chat) => chat !== void 0));
        return true;
      }
    } catch (err) {
      this._logService.warn("[Claude] Failed to emit discovered chats", err);
    }
    return false;
  }
  async _isKnownClaudeCodeChat(chat) {
    try {
      const session = URI.parse(parseRequiredSessionUriFromChatUri(chat.chat));
      return await this._metadataStore.hasKnownSession(session);
    } catch (err) {
      this._logService.warn(`[Claude] Failed to inspect stored metadata for ${chat.chat.toString()}`, err);
      return false;
    }
  }
  /**
   * Per-chat lookup. Accepts the external-CLI case: a session that exists
   * on disk via the raw Anthropic CLI has no per-session DB, so this MUST
   * NOT gate on the sidecar. The SDK is the source of truth for existence.
   *
   * The SDK entry supplies the authoritative primary directory; an optional
   * per-session overlay hydrates the additional-directory tail. External
   * sessions without an overlay remain valid single-root entries. Failures in
   * the SDK lookup propagate (the caller is doing a single targeted fetch and
   * should learn that the SDK module is broken).
   */
  async getChatMetadata(chat, context, providerData) {
    if (!await this._sdkService.canLoadWithoutDownload()) {
      this._logService.info("[Claude] SDK not downloaded yet; deferring chat metadata until a session triggers the download");
      return void 0;
    }
    const { configurationResource } = resolveAgentChatContext(context, chat);
    const sessionId = providerData ? decodeProviderData(providerData)?.sdkSessionId : AgentSession.id(configurationResource);
    if (!sessionId) {
      return void 0;
    }
    const sdkInfo = await this._sdkService.getSessionInfo(sessionId);
    if (!sdkInfo) {
      return void 0;
    }
    return this._withPersistedWorkingDirectories(configurationResource, { chat, ...this._metadataStore.project(sdkInfo) });
  }
  /**
   * Merge the persisted additional working directories (index 1..N) onto a
   * projected metadata's `workingDirectories`, keeping the SDK-derived `cwd`
   * as the authoritative primary. The SDK catalog only stores `cwd`, so the
   * tail of a multi-root session lives in the per-session overlay. Sessions
   * without an overlay (external Claude CLI, single-root) are returned as-is.
   */
  async _withPersistedWorkingDirectories(session, meta) {
    const primary = meta.workingDirectories?.[0];
    if (!primary) {
      return meta;
    }
    let overlay = {};
    try {
      overlay = await this._metadataStore.read(session);
    } catch (err) {
      this._logService.warn(`[Claude] overlay read failed while hydrating working directories for ${session.toString()}; using SDK cwd only`, err);
    }
    const tail = overlay.workingDirectories?.slice(1) ?? [];
    if (tail.length === 0) {
      return meta;
    }
    return { ...meta, workingDirectories: [primary, ...tail] };
  }
  resolveChatConfig(_params) {
    const sessionSchema = createSchema({
      ["permissionMode" /* PermissionMode */]: schemaProperty({
        type: "string",
        title: localize(2292, null),
        description: localize(2303, null),
        enum: ["default", "acceptEdits", "plan", "auto", "bypassPermissions"],
        enumLabels: [
          localize(2299, null),
          localize(2293, null),
          localize(2301, null),
          localize(2295, null),
          localize(2297, null)
        ],
        enumDescriptions: [
          localize(2300, null),
          localize(2294, null),
          localize(2302, null),
          localize(2296, null),
          localize(2298, null)
        ],
        default: "default",
        sessionMutable: true
      }),
      ["permissions" /* Permissions */]: platformSessionSchema.definition["permissions" /* Permissions */]
    });
    const values = sessionSchema.validateOrDefault(_params.config, {
      ["permissionMode" /* PermissionMode */]: "default"
      // Permissions intentionally omitted from defaults — leave
      // unset so auto-approval falls through to the host-level
      // default, materializing on the session only once the user
      // approves a tool "in this Session".
    });
    return Promise.resolve({
      schema: sessionSchema.toProtocol(),
      values
    });
  }
  getInheritedChatConfig(config) {
    const inherited = {};
    for (const key of ["permissionMode" /* PermissionMode */, "permissions" /* Permissions */]) {
      if (config[key] !== void 0) {
        inherited[key] = config[key];
      }
    }
    return Object.keys(inherited).length > 0 ? inherited : void 0;
  }
  getAutonomousSessionConfig(_config) {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostAutoApprovePolicyRestrictedConfigKey) !== true ? { ["permissionMode" /* PermissionMode */]: "auto" } : void 0;
  }
  chatConfigCompletions(_params) {
    return Promise.resolve({ items: [] });
  }
  shutdown() {
    return this._shutdownPromise ??= (async () => {
      const sessions = this._allLiveSessions();
      for (const chat of sessions) {
        if (!chat.isPipelineReady) {
          chat.abortController.abort();
        }
      }
      await Promise.all(sessions.map(
        (chat) => this._disposeSequencer.queue(chat.sessionId, async () => {
          await this._disposeLiveSession(chat);
        })
      ));
      this._chatBackings.clear();
      this._activeClientHandles.clear();
    })();
  }
  async _sendMessage(chat, prompt, workingDirectories, attachments, turnId, _senderClientId, operationContext) {
    const effectiveTurnId = turnId ?? generateUuid();
    const sendContext = this._requireChatContext(chat, operationContext, "sendMessage");
    const clientTelemetryContext = URI.isUri(operationContext) ? void 0 : operationContext?.clientTelemetryContext;
    const context = this._resolveChatContext(chat, sendContext);
    return this._sessionSequencer.queue(context.sequencerKey, async () => {
      const current = this._resolveChatContext(chat, sendContext);
      const session = await this._ensureResolvedChatSession(current, workingDirectories);
      if (current.customizations) {
        session.setHostCustomizations(current.customizations);
      }
      const switchTransport = session.hasPendingTransportSwitch ? this._ensureAuthenticated(session.provisionalModel) : void 0;
      await session.send(this._buildSdkPrompt(session.sessionId, prompt, attachments, effectiveTurnId), effectiveTurnId, current.configurationResource, workingDirectories, switchTransport, resolveAgentHostInstructions(operationContext), clientTelemetryContext);
      if (workingDirectories) {
        await this._metadataStore.write(current.resource, { workingDirectories });
      }
    });
  }
  /** Builds the SDK user message for a send, addressed to `sdkSessionId`. */
  _buildSdkPrompt(sdkSessionId, prompt, attachments, turnId) {
    const contentBlocks = resolvePromptToContentBlocks(prompt, attachments);
    return {
      type: "user",
      message: { role: "user", content: contentBlocks },
      session_id: sdkSessionId,
      parent_tool_use_id: null,
      // M1 / Glossary: `Turn.id ↔ SDKUserMessage.uuid`. The SDK types this
      // as a branded `${string}-…` template-literal alias of Node's
      // `crypto.UUID`; cast at the boundary rather than threading the brand
      // up to every caller.
      uuid: turnId
    };
  }
  respondToPermissionRequest(requestId, approved) {
    for (const sess of this._allLiveSessions()) {
      if (sess.respondToPermissionRequest(requestId, approved)) {
        return;
      }
    }
  }
  respondToUserInputRequest(requestId, response, answers) {
    for (const sess of this._allLiveSessions()) {
      if (sess.respondToUserInputRequest(requestId, response, answers)) {
        return;
      }
    }
  }
  /** Every live or direct-create provisional SDK conversation. */
  _allLiveSessions() {
    return [...this._chatEntriesBySdkId.values()].map((entry) => entry.chatSession);
  }
  async _abortSession(chat, context) {
    resolveAgentChatContext(context, chat);
    const sess = this._findChatByUri(chat);
    if (!sess) {
      return;
    }
    if (!sess.isPipelineReady) {
      sess.abortController.abort();
      return;
    }
    sess.abort();
  }
  setPendingMessages(chat, steeringMessage, _queuedMessages) {
    const target = this._findChatByUri(chat);
    this._logService.info(`[Claude] setPendingMessages for ${chat.toString()}: steering=${steeringMessage?.id ?? "none"} queued=${_queuedMessages.length}`);
    if (!target) {
      this._logService.warn(`[Claude] setPendingMessages: target not found for ${chat.toString()}`);
      return;
    }
    if (steeringMessage) {
      target.injectSteering(steeringMessage);
    }
  }
  async _changeModel(chat, model, operationContext) {
    const context = this._resolveChatContext(chat, operationContext);
    await this._sessionSequencer.queue(context.sequencerKey, async () => {
      const current = this._resolveChatContext(chat, operationContext);
      await this._metadataStore.write(current.resource, { model });
      const sess = current.target;
      if (sess) {
        await sess.setModel(model);
      }
      if (current.sdkSessionId !== current.sessionId) {
        await this._updateChatBackingModel(chat, model);
      }
    });
  }
  /**
   * Switch (or clear with `undefined`) the selected custom agent for an
   * existing session. Mirrors {@link changeModel}: session owns its
   * provisional/runtime branching and metadata write
   * (see {@link ClaudeAgentSession.setAgent}). For external-only
   * sessions (no in-memory record), the agent is persisted directly to
   * the overlay so a later resume picks it up. When `chat` is an additional
   * chat, the change targets that chat's own overlay.
   */
  async _changeAgent(chat, agent, operationContext) {
    const context = this._resolveChatContext(chat, operationContext);
    await this._sessionSequencer.queue(context.sequencerKey, async () => {
      const current = this._resolveChatContext(chat, operationContext);
      await this._metadataStore.write(current.resource, { agent: agent ?? null });
      const sess = current.target;
      if (sess) {
        await sess.setAgent(agent);
      }
    });
  }
  setServerToolHost(host) {
    this._serverToolHost = host;
  }
  /**
   * `chat` is the exact chat this client's contributions are addressed to.
   * There is no membership to fan out — a client contributing to several
   * chats of the same session gets one independent call (and handle) per
   * chat, so nothing here synthesizes, extends, or remembers a chat set of
   * its own.
   */
  getOrCreateActiveClient(chat, context, client, hostCustomizations) {
    const { configurationResource } = resolveAgentChatContext(context, chat);
    const key = `${chat.toString()}\0${client.clientId}`;
    let handle = this._activeClientHandles.get(key);
    if (!handle) {
      handle = new ClaudeActiveClientHandle(
        client.clientId,
        client.displayName,
        chat,
        (targetChat, tools) => {
          this._logService.info(`[Claude:${AgentSession.id(configurationResource)}] active client ${client.clientId} tools=[${tools.map((t) => t.name).join(", ") || "(none)"}] chat=${targetChat.toString()}`);
          this._findChatByUri(targetChat)?.setClientTools(client.clientId, tools);
        },
        (targetChat, customizations, snapshot) => {
          void this._syncClientCustomizations(targetChat, configurationResource, client.clientId, [...customizations], snapshot);
        }
      );
      this._activeClientHandles.set(key, handle);
    }
    handle.setHostCustomizations(hostCustomizations);
    return handle;
  }
  removeActiveClient(chat, _context, clientId) {
    const key = `${chat.toString()}\0${clientId}`;
    if (!this._activeClientHandles.delete(key)) {
      return;
    }
    const target = this._findChatByUri(chat);
    if (!target) {
      return;
    }
    target.removeClientTools(clientId);
    void this._sessionSequencer.queue(target.sessionId, async () => target.removeClientCustomizations(clientId)).catch(() => {
    });
  }
  /**
   * `chat` is the host-resolved routing target — already the ancestor chat
   * when the completion was addressed to a subagent. When its runtime is not
   * resident (a released ancestor, or a subagent whose spawning chat differs
   * from the routing target), the spawn edge on the addressed chat's
   * host-supplied origin names the conversation that owns the pending call.
   */
  onClientToolCallComplete(chat, toolCallId, result, context) {
    const addressed = this._findChatByUri(chat);
    if (addressed) {
      addressed.completeClientToolCall(toolCallId, result);
      return;
    }
    const spawnedFrom = resolveSubagentChatParent(context);
    if (!spawnedFrom) {
      return;
    }
    this._findChatByUri(spawnedFrom.chat)?.completeClientToolCall(toolCallId, result);
  }
  /**
   * `hostCustomizations` is the host's last published snapshot for the
   * chat's owning configuration scope, or `undefined` when it has published
   * none yet. The public entry point reuses whatever the host last handed to
   * this client's handle rather than reading it back from shared state.
   */
  async syncClientCustomizations(chat, context, clientId, customizations, options) {
    const { configurationResource } = resolveAgentChatContext(context, chat);
    const handle = this._activeClientHandles.get(`${chat.toString()}\0${clientId}`);
    return this._syncClientCustomizations(chat, configurationResource, clientId, customizations, handle?.hostCustomizations, options);
  }
  async _syncClientCustomizations(chat, configurationResource, clientId, customizations, hostCustomizations, options) {
    const sync = () => this._pluginManager.syncCustomizations(
      clientId,
      customizations,
      options?.quiet ? void 0 : (status) => this._fireCustomizationUpdated(configurationResource, { customization: status })
    );
    const target = this._findChatByUri(chat);
    if (target) {
      return this._sessionSequencer.queue(target.sessionId, async () => {
        const synced = await sync();
        if (hostCustomizations) {
          target.setHostCustomizations(hostCustomizations);
        }
        target.adoptClientCustomizations(clientId, synced, customizations);
        return synced;
      });
    }
    return sync();
  }
  /**
   * Project a per-item sync result onto a `SessionCustomizationUpdated`
   * action and emit it on {@link onDidChatProgress}. Lets the workbench
   * flip each row to `Loaded` / `Error` as the underlying
   * {@link IAgentPluginManager.syncCustomizations} resolves it.
   */
  _fireCustomizationUpdated(session, item) {
    this._onDidChatProgress.fire({
      kind: "action",
      resource: session,
      action: {
        type: "session/customizationUpdated" /* SessionCustomizationUpdated */,
        customization: item.customization
      }
    });
  }
  getCustomizations() {
    return [];
  }
  /**
   * `hostCustomizations` is the host's last published snapshot for `chat`,
   * supplied explicitly at this boundary. `undefined` means the host has
   * published none yet, which is deliberately distinct from an empty list:
   * the session keeps its own reconciled view rather than clearing it.
   *
   * Resolves `chat` through its exact backing only ({@link _findChatByUri}) —
   * never falls back to guessing the SDK conversation id from the
   * configuration scope, since a fresh chat's SDK id is independent of it.
   */
  async getChatCustomizations(chat, _context, hostCustomizations) {
    const sess = this._findChatByUri(chat);
    if (!sess) {
      return [];
    }
    if (hostCustomizations) {
      sess.setHostCustomizations(hostCustomizations);
    }
    return sess.getSessionCustomizations();
  }
  /**
   * Hides the multi-root Folder picker unless several working directories carry
   * Claude configuration that would pin them as the primary — an `.mcp.json`
   * manifest or a non-empty `hooks` block in `.claude/settings.json` /
   * `settings.local.json` (see {@link claudeDirectoryQualifiesForPrimary}). With
   * one qualifying directory it pins that folder; with several it shows the
   * picker so the user chooses. This only reads files to decide the picker — it
   * never surfaces them as customizations.
   */
  async computeFolderPickerDecision(workingDirectories, token = CancellationToken.None) {
    if (!this._isMultiRootEnabled()) {
      return void 0;
    }
    return computeFolderPickerDecisionForRoots(workingDirectories, (directory, t) => claudeDirectoryQualifiesForPrimary(this._fileService, directory, this._environmentService.userHome, t), token);
  }
  async startMcpServer(session, id2) {
    const sess = this._findAnySession(AgentSession.id(session));
    await sess?.startMcpServer(id2);
  }
  async stopMcpServer(session, id2) {
    const sess = this._findAnySession(AgentSession.id(session));
    await sess?.stopMcpServer(id2);
  }
  // #endregion
  dispose() {
    for (const chat of this._allLiveSessions()) {
      chat.abortController.abort();
    }
    super.dispose();
    this._proxyHandle?.dispose();
    this._proxyHandle = void 0;
    this._githubToken = void 0;
    this._models.set([], void 0);
  }
};

ClaudeAgent = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ICopilotApiService),
  __decorateParam(2, IClaudeProxyService),
  __decorateParam(3, IClaudeAgentSdkService),
  __decorateParam(4, IAgentSdkDownloader),
  __decorateParam(5, IAgentHostSessionTitleSignal),
  __decorateParam(6, IAgentHostOTelService),
  __decorateParam(7, IAgentHostGitService),
  __decorateParam(8, IAgentHostCheckpointService),
  __decorateParam(9, IAgentConfigurationService),
  __decorateParam(10, IAgentHostGitHubEndpointService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IAgentPluginManager),
  __decorateParam(13, IProductService),
  __decorateParam(14, INativeEnvironmentService),
  __decorateParam(15, IFileService)
], ClaudeAgent);

var ClaudeChatEntry = class extends Disposable {
  constructor(chatSession) {
    super();
    this.chatSession = chatSession;
    this._register(chatSession);
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
export { isClaudeModel, toAgentModelInfo, isSdkDefaultModel, fromSdkModelInfo, _toPersistedChat, USER_AGENT_PREFIX2, CLAUDE_SETUP_DOCS_URL, SDK_DEFAULT_MODEL_VALUE, ClaudeActiveClientHandle, ClaudeAgent, ClaudeChatEntry };
