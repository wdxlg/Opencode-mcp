// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotAgentSession.ts
import { SEMANTIC_SEARCH_TOOL_NAME } from "./module-0185.mjs";
import { localize } from "./module-0012.mjs";
import { hasKey, isDefined, isObject, isString } from "./module-0008.mjs";
import { isAbsolute, join } from "./module-0018.mjs";
import { getCopilotHomePath } from "./module-0138.mjs";
import { extUriBiasedIgnorePathCase, normalizePath } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";
import { getEditFilePaths, getInvocationMessage, getPastTenseMessage, getPermissionDisplay, getShellIntention, getShellLanguage, getStreamingInvocationMessage, getSubagentMetadata, getTaskCompleteMarkdown, getToolDisplayName, getToolInputString, getToolKind, isAgentCoordinationTool, isCopilotSdkToolOutputFile, isEditTool, isHiddenTool, isShellTool, isTaskCompleteTool, parseCopilotStreamingToolInput, synthesizeSkillToolCall, tryStringify } from "./module-0237.mjs";
import { Disposable, DisposableMap, MutableDisposable, toDisposable } from "./module-0010.mjs";
import { StopWatch } from "./module-0015.mjs";
import { DeferredPromise, RunOnceScheduler, Sequencer, SequencerByKey, Throttler, raceCancellation, timeout } from "./module-0027.mjs";
import { PendingRequestRegistry } from "./module-0255.mjs";
import { Emitter } from "./module-0016.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0017.mjs";
import { product_default } from "./module-0144.mjs";
import { CopilotSlashCommandProvider } from "./module-0286.mjs";
import { NonPtyShellTerminalStreams } from "./module-0258.mjs";
import { AgentHostTelemetryReporter, toInitiatorTelemetry } from "./module-0253.mjs";
import { AgentHostRepoInfoTelemetry } from "./module-0254.mjs";
import { clientToolNamesFromSnapshot, isMcpServerExplicitlyProjected } from "./module-0245.mjs";
import { ActiveClientToolSet } from "./module-0158.mjs";
import { FileEditTracker } from "./module-0277.mjs";
import { McpCustomizationController } from "./module-0163.mjs";
import { getSdkMcpServerEnablement, resolveCustomizationEnablement, targetForMcpServer } from "./module-0176.mjs";
import { isChatAction } from "./module-0086.mjs";
import { generateUuid } from "./module-0042.mjs";
import { STREAMING_TOOL_DISPLAY_INTERVAL_MS, streamingToolDisplayText } from "./module-0187.mjs";
import { toToolCallMeta } from "./module-0046.mjs";
import { createUnknownAgentHostClientTelemetryContext } from "./module-0054.mjs";
import { CancellationError, getErrorMessage } from "./module-0002.mjs";
import { buildSubagentSessionUri, createErrorResponsePart, isSubagentSession, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { Schemas } from "./module-0024.mjs";
import { CLIENT_TOOL_SEARCH_REFERENCE_NAME, RUNTIME_TOOL_SEARCH_TOOL_NAME } from "./module-0190.mjs";
import { NON_DEFERRED_CLIENT_TOOL_NAMES } from "./module-0244.mjs";
import { gitHubMcpServerUrl } from "./module-0160.mjs";
import { isAuthorizationProtectedResourceMetadata } from "./module-0181.mjs";
import { isHostSnapshotAttachment } from "./module-0189.mjs";
import { parseLeadingSlashCommand } from "./module-0257.mjs";
import { resolveCopilotConfigSlashCommandOnSend } from "./module-0186.mjs";
import { escapeMarkdownSyntaxTokens } from "./module-0115.mjs";
import { isAgentFeedbackAnnotationsAttachment, renderAgentFeedbackAnnotationsAttachment } from "./module-0188.mjs";
import { VSBuffer, encodeBase64 } from "./module-0029.mjs";
import { addAttachmentDisplayKindToMimeType, addSimpleAttachmentDisplayKindToMimeType } from "./module-0281.mjs";
import { splitLinesIncludeSeparators } from "./module-0021.mjs";
import { AgentHostAutoReplyAnswer, AgentHostAutoReplyEnabledConfigKey, AgentHostDisableRepoInfoTelemetryConfigKey, AgentHostGlobalAutoApproveEnabledConfigKey, platformRootSchema, platformSessionSchema } from "./module-0057.mjs";
import { appendSdkToolResultContent, mapSessionEvents } from "./module-0282.mjs";
import { safeStringify } from "./module-0035.mjs";
import { copilotCliConfigSchema } from "./module-0107.mjs";
import { sandboxConfigSchema } from "./module-0117.mjs";
import { buildSandboxConfigForSdk } from "./module-0243.mjs";
import { buildPendingEditContentUri } from "./module-0284.mjs";
import { withChatInputRequestPurpose } from "./module-0182.mjs";
import { META_DIFF_BASE_BRANCH } from "./module-0162.mjs";
import { buildCopilotSystemNotification } from "./module-0256.mjs";
import { stripRedundantCdPrefix } from "./module-0183.mjs";
import { reportCopilotTodoStoreOperation } from "./module-0289.mjs";
import { createCopilotFailureCorrelation, reportCopilotModelCallFailure, reportCopilotSdkSessionError } from "./module-0288.mjs";
import { buildChatErrorInfoFromCopilotSdkFields } from "./module-0279.mjs";
import { OtelData } from "./module-0184.mjs";
import { AgentSession } from "./module-0048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0044.mjs";
import { ILogService } from "./module-0084.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { IFileService } from "./module-0128.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostCustomizationEnablementService } from "./module-0175.mjs";
import { IAgentHostPromptCache } from "./module-0285.mjs";
import { ITelemetryService } from "./module-0053.mjs";
import { ICopilotApiService } from "./module-0168.mjs";
import { IAgentHostOTelService } from "./module-0137.mjs";


// src/vs/platform/agentHost/node/copilot/copilotAgentSession.ts
import { cp as cp2, rm } from "fs/promises";


// src/vs/platform/agentHost/node/copilot/copilotAgentSession.ts
var DEFAULT_CLIENT_TOOL_SDK_POLICY = {};

var CLIENT_TOOL_SDK_POLICIES = /* @__PURE__ */ new Map([
  [SEMANTIC_SEARCH_TOOL_NAME, { overridesBuiltInTool: true, skipPermission: true }]
]);

function getClientToolSdkPolicy(toolName) {
  return CLIENT_TOOL_SDK_POLICIES.get(toolName) ?? DEFAULT_CLIENT_TOOL_SDK_POLICY;
}

function isCopilotSdkAuthRejection(error) {
  return (error.errorType === "authentication" || error.errorType === "authorization") && error.statusCode === 401;
}

var SESSION_STATE_DIRECTORY = "session-state";

var DEBUG_LOG_COLLECTION_RETRY_ATTEMPTS = 50;

var DEBUG_LOG_COLLECTION_RETRY_DELAY_MS = 20;

var EMPTY_TOOL_RESULT_TEXT = "<empty />";

var USER_DENIED_PERMISSION_RESULT = { kind: "reject", feedback: "The user denied permission." };

function isPermissionDeniedKind(kind) {
  switch (kind) {
    case "cancelled":
    case "denied-by-rules":
    case "denied-no-approval-rule-and-could-not-request-from-user":
    case "denied-interactively-by-user":
    case "denied-by-content-exclusion-policy":
    case "denied-by-permission-request-hook":
      return true;
    default:
      return false;
  }
}

function mapPermissionResultToConfirmKind(kind, resolvedByHook) {
  if (kind === void 0) {
    return "confirmationNotNeeded";
  }
  if (isPermissionDeniedKind(kind)) {
    return "denied";
  }
  if (kind === "approved-for-session" || kind === "approved-for-location") {
    return "setting";
  }
  return resolvedByHook ? "confirmationNotNeeded" : "userAction";
}

function normalizeMcpServerUrl(value) {
  if (!URL.canParse(value)) {
    return void 0;
  }
  const url2 = new URL(value);
  url2.hash = "";
  url2.pathname = url2.pathname.replace(/\/+$/, "");
  return url2.href;
}

function getEmptyToolResultText(binaryResults) {
  if (!binaryResults?.length) {
    return EMPTY_TOOL_RESULT_TEXT;
  }
  const hasImage = binaryResults.some((result) => result.type === "image");
  const hasFile = binaryResults.some((result) => result.type === "resource");
  if (hasImage && hasFile) {
    return "Tool produced the attached image and file";
  }
  if (hasImage) {
    return "Tool produced the attached image";
  }
  return "Tool produced the attached file";
}

function getPlanActionDescription(actionId) {
  switch (actionId) {
    case "autopilot":
      return {
        label: localize(2486, null),
        description: localize(2485, null)
      };
    case "autopilot_fleet":
      return {
        label: localize(2488, null),
        description: localize(2487, null)
      };
    case "interactive":
      return {
        label: localize(2493, null),
        description: localize(2492, null)
      };
    case "exit_only":
      return {
        label: localize(2490, null),
        description: localize(2489, null)
      };
    default:
      return void 0;
  }
}

function getToolCommand(input) {
  const command = isObject(input.toolArgs) ? Reflect.get(input.toolArgs, "command") : void 0;
  return isString(command) ? command : void 0;
}

function toCopilotSdkMode(mode) {
  mode = mode?.toLowerCase() === "goal" ? "plan" : mode;
  switch (mode) {
    case "interactive":
    case "plan":
    case "autopilot":
      return mode;
    default:
      return void 0;
  }
}

function elicitationFieldToQuestion(fieldName, field, required) {
  const base = {
    id: fieldName,
    title: field.title ?? fieldName,
    message: field.description ?? field.title ?? fieldName,
    required
  };
  switch (field.type) {
    case "boolean":
      return { ...base, kind: "boolean" /* Boolean */, defaultValue: field.default };
    case "integer":
    case "number":
      return {
        ...base,
        kind: field.type === "integer" ? "integer" /* Integer */ : "number" /* Number */,
        min: field.minimum,
        max: field.maximum,
        defaultValue: field.default
      };
    case "array": {
      const options = hasKey(field.items, { enum: true }) ? field.items.enum.map((value) => ({ id: value, label: value })) : field.items.anyOf.map((option) => ({ id: option.const, label: option.title }));
      return {
        ...base,
        kind: "multi-select" /* MultiSelect */,
        options,
        min: field.minItems,
        max: field.maxItems
      };
    }
    case "string": {
      if (hasKey(field, { enum: true })) {
        const enumNames = field.enumNames;
        const options = field.enum.map((value, idx) => ({ id: value, label: enumNames?.[idx] ?? value }));
        return { ...base, kind: "single-select" /* SingleSelect */, options };
      }
      if (hasKey(field, { oneOf: true })) {
        const options = field.oneOf.map((option) => ({ id: option.const, label: option.title }));
        return { ...base, kind: "single-select" /* SingleSelect */, options };
      }
      return {
        ...base,
        kind: "text" /* Text */,
        format: field.format,
        min: field.minLength,
        max: field.maxLength,
        defaultValue: field.default
      };
    }
  }
}

function elicitationAnswerToFieldValue(field, answer) {
  if (!answer || answer.state === "skipped" /* Skipped */) {
    return void 0;
  }
  const value = answer.value;
  if (field.type === "boolean") {
    if (value.kind === "boolean" /* Boolean */) {
      return value.value;
    }
    if (value.kind === "text" /* Text */) {
      if (value.value === "true") {
        return true;
      }
      if (value.value === "false") {
        return false;
      }
      return void 0;
    }
    return void 0;
  }
  if (field.type === "number" || field.type === "integer") {
    if (value.kind === "number" /* Number */) {
      return field.type === "integer" ? Math.trunc(value.value) : value.value;
    }
    if (value.kind === "text" /* Text */) {
      if (value.value.trim() === "") {
        return void 0;
      }
      const n = Number(value.value);
      return Number.isFinite(n) ? field.type === "integer" ? Math.trunc(n) : n : void 0;
    }
    return void 0;
  }
  if (field.type === "array") {
    if (value.kind === "selected-many" /* SelectedMany */) {
      return [...value.value, ...value.freeformValues ?? []];
    }
    if (value.kind === "selected" /* Selected */) {
      return value.value ? [value.value, ...value.freeformValues ?? []] : [...value.freeformValues ?? []];
    }
    if (value.kind === "text" /* Text */) {
      return value.value ? [value.value] : [];
    }
    return void 0;
  }
  if (value.kind === "text" /* Text */) {
    return value.value;
  }
  if (value.kind === "selected" /* Selected */) {
    return value.value;
  }
  return void 0;
}

function getCopilotCLISessionStateDir(userHome) {
  return join(getCopilotHomePath(userHome, process.env), SESSION_STATE_DIRECTORY);
}

function isCopilotSdkToolOutputTempFile(filePath, tmpDir) {
  const fileUri = normalizePath(URI.file(filePath));
  const tmpDirUri = normalizePath(URI.file(tmpDir));
  const parentUri = normalizePath(URI.joinPath(fileUri, ".."));
  if (!extUriBiasedIgnorePathCase.isEqual(parentUri, tmpDirUri)) {
    return false;
  }
  return isCopilotSdkToolOutputFile(filePath);
}

var DirectUsageAccumulator = class {
  constructor() {
    this._tokenTotalsByModel = /* @__PURE__ */ new Map();
  }
  add(model, tokens, copilotNanoAiu) {
    if (model) {
      let total = this._tokenTotalsByModel.get(model);
      if (!total) {
        total = { model, inputTokens: 0, cachedTokens: 0, outputTokens: 0 };
        this._tokenTotalsByModel.set(model, total);
      }
      total.inputTokens += toTokenCount(tokens.inputTokens);
      total.cachedTokens += toTokenCount(tokens.cacheReadTokens);
      total.outputTokens += toTokenCount(tokens.outputTokens);
    }
    if (typeof copilotNanoAiu === "number") {
      this._copilotNanoAiu = (this._copilotNanoAiu ?? 0) + copilotNanoAiu;
    }
  }
  get tokenTotals() {
    return this._tokenTotalsByModel.size > 0 ? [...this._tokenTotalsByModel.values()].map((total) => ({ ...total })) : void 0;
  }
  get copilotNanoAiu() {
    return this._copilotNanoAiu;
  }
};

var CopilotTurn = class extends Disposable {
  constructor(id2, ordinal, senderClientId, clientContext) {
    super();
    this.id = id2;
    this.ordinal = ordinal;
    this.senderClientId = senderClientId;
    this.clientContext = clientContext;
    this._state = "pending";
    this._providerCallState = "notStarted";
    this._providerTurnStarted = false;
    this._stopWatch = StopWatch.create(false);
    /**
     * This turn's own Copilot cost in nano-AIU, summed from the `copilotUsage`
     * carried by the model calls the turn caused — its own, every subagent's,
     * and any compaction that ran mid-turn.
     *
     * Accumulated synchronously as each event arrives rather than derived from
     * the SDK's session-wide total: that total is read asynchronously, and the
     * terminal `session.idle` can close the turn while a read is in flight,
     * which would drop the turn's last model call from its reported cost.
     */
    this.copilotNanoAiu = 0;
    this.directUsage = new DirectUsageAccumulator();
    /**
     * Whole-turn token consumption keyed by model id. Every model call in the
     * turn contributes — the parent agent's calls, every subagent's calls, and
     * the summarization call a compaction performs — so the totals describe what
     * the turn as a whole consumed rather than just its last call. Subagents may
     * run on a different model than the parent, hence the per-model keying.
     */
    this._tokenTotalsByModel = /* @__PURE__ */ new Map();
    /**
     * Current markdown response part IDs for this turn, keyed by
     * `parentToolCallId ?? ''`. Parent and subagent text stream through the
     * same SDK session but land in different AHP sessions, so their markdown
     * part state must not mask or append to each other.
     */
    this.markdownPartIds = /* @__PURE__ */ new Map();
    /** Current reasoning response part IDs for this turn, keyed by `parentToolCallId ?? ''`. */
    this.reasoningPartIds = /* @__PURE__ */ new Map();
    /**
     * Per-turn tool-call aggregate accumulated across the turn's `assistant.message` rounds (main
     * agent only), for the restricted `toolCallDetails` telemetry. `toolCounts` is keyed by tool name.
     */
    this.toolCounts = /* @__PURE__ */ new Map();
    this.mainModelCallIds = /* @__PURE__ */ new Set();
    this.toolCallRounds = 0;
    this.totalToolCalls = 0;
    this.parallelToolCallRounds = 0;
    this.parallelToolCallsTotal = 0;
    this.toolCallDetailsReported = false;
    this._eventId = new DeferredPromise();
    this._eventId.p.catch(() => {
    });
  }
  /**
   * Folds one model call's token counts into the turn's per-model totals.
   * Calls without a model id are ignored: they cannot be attributed, and every
   * usage-reporting path this session has carries one.
   */
  addTokenTotals(model, tokens) {
    this._addTokenTotals(this._tokenTotalsByModel, model, tokens);
  }
  _addTokenTotals(totals, model, tokens) {
    if (!model) {
      return;
    }
    let total = totals.get(model);
    if (!total) {
      total = { model, inputTokens: 0, cachedTokens: 0, outputTokens: 0 };
      totals.set(model, total);
    }
    total.inputTokens += toTokenCount(tokens.inputTokens);
    total.cachedTokens += toTokenCount(tokens.cacheReadTokens);
    total.outputTokens += toTokenCount(tokens.outputTokens);
  }
  /**
   * The turn's per-model totals, or `undefined` when nothing has been recorded.
   * Rows are cloned: the map keeps mutating its own copies as further calls are
   * recorded, and an already-emitted or already-compared usage object must not
   * change retroactively underneath its consumers.
   */
  get tokenTotals() {
    return this._cloneTokenTotals(this._tokenTotalsByModel);
  }
  _cloneTokenTotals(totals) {
    return totals?.size ? [...totals.values()].map((total) => ({ ...total })) : void 0;
  }
  /**
   * Resolves with this turn's SDK event id once recorded via
   * {@link completeEventId}, or rejects on disposal if it never was.
   */
  get eventId() {
    return this._eventId.p;
  }
  get clientType() {
    return this.clientContext.clientType;
  }
  get state() {
    return this._state;
  }
  get isPending() {
    return this._state === "pending";
  }
  get isRunning() {
    return this._state === "running";
  }
  get duration() {
    return Math.max(0, this._stopWatch.elapsed());
  }
  get providerCallState() {
    return this._providerCallState;
  }
  get providerTurnStarted() {
    return this._providerTurnStarted;
  }
  markProviderCallPending() {
    this._providerCallState = "pending";
  }
  markProviderCallResolved() {
    this._providerCallState = "resolved";
  }
  markProviderCallRejected() {
    this._providerCallState = "rejected";
  }
  markProviderTurnStarted() {
    this._providerTurnStarted = true;
  }
  /** Transition `pending → running` on the first SDK event. No-op once running/finished. */
  markRunning() {
    if (this._state === "pending") {
      this._state = "running";
    }
  }
  /** Records this turn's SDK event id. Idempotent: only the first call (the root `user.message`) counts. */
  completeEventId(eventId) {
    if (!this._eventId.isSettled) {
      this._eventId.complete(eventId);
    }
  }
  markCompleted() {
    this._state = "completed";
  }
  markAborted() {
    this._state = "aborted";
  }
  /**
   * Rejects {@link eventId} before disposal so pending fork-boundary checks do not hang.
   */
  dispose() {
    if (!this._eventId.isSettled) {
      this._eventId.error(new Error(`Turn ${this.id} was disposed before its SDK event id was recorded`));
    }
    super.dispose();
  }
};

var CopilotAgentSession = class extends Disposable {
  constructor(options, _instantiationService, _logService, _sessionDataService, _fileService, _environmentService, _configurationService, _customizationEnablementService, _promptCache, _telemetryService, _copilotApiService, _otelService) {
    super();
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._sessionDataService = _sessionDataService;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._configurationService = _configurationService;
    this._customizationEnablementService = _customizationEnablementService;
    this._promptCache = _promptCache;
    this._telemetryService = _telemetryService;
    this._copilotApiService = _copilotApiService;
    this._otelService = _otelService;
    /** Tracks active tool invocations so we can produce past-tense messages on completion. */
    this._activeToolCalls = /* @__PURE__ */ new Map();
    this._streamingToolCalls = /* @__PURE__ */ new Map();
    this._streamingToolDisplaySchedulers = this._register(new DisposableMap());
    /**
     * Maps a subagent's stable `agentId` to its parent tool call id. Completion
     * ends the current subagent turn, but steering can start another turn with
     * the same id, so mappings live until session teardown.
     */
    this._parentToolCallIdsByAgentId = /* @__PURE__ */ new Map();
    this._rootTurnIdBySubagentToolCallId = /* @__PURE__ */ new Map();
    this._subagentDirectUsageByToolCallId = /* @__PURE__ */ new Map();
    this._lastSubagentUsageByToolCallId = /* @__PURE__ */ new Map();
    /**
     * Auto's routing decision per subagent. Keyed by tool call rather than turn: a
     * subagent outlives the root turn that spawned it when steering mints a new one.
     */
    this._autoModeResolvedByToolCallId = /* @__PURE__ */ new Map();
    this._activeSubagentAgentIds = /* @__PURE__ */ new Set();
    this._unroutableSubagentToolCallIds = /* @__PURE__ */ new Set();
    this._autoApprovals = /* @__PURE__ */ new Map();
    this._pendingAutoApprovals = new PendingRequestRegistry();
    /** Correlates tool execution with the SDK permission lifecycle for `chat.toolApproval` telemetry. */
    this._toolApprovalRecords = /* @__PURE__ */ new Map();
    /** Pending permission requests awaiting a renderer-side decision. */
    this._pendingPermissions = new PendingRequestRegistry();
    /** Cancels callbacks that began before or during an SDK abort. */
    this._abortCts = this._register(new MutableDisposable());
    /**
     * Signatures ({@link safeStringify}) of user-approved `read`/`write`
     * permission requests, keyed by tool call id. The Copilot CLI runtime emits
     * two identical `permission.requested` events for a single file read or
     * write (an internal `path` prompt followed by a `read`/`write` prompt), so
     * without this the user would be asked to approve the same operation twice
     * (issue #324477). An entry is single-use: it auto-approves exactly one
     * subsequent request that is byte-identical to the approved one, then is
     * removed, so approval never carries across a different tool call, a changed
     * path/diff/contents, or a different kind.
     */
    this._approvedDuplicablePermissionSignatures = /* @__PURE__ */ new Map();
    /** Pending user input requests awaiting a renderer-side answer. */
    this._pendingUserInputs = new PendingRequestRegistry();
    /**
     * Pending elicitation requests awaiting a renderer-side answer. Keyed
     * by request id; the schema is retained so the completion handler can
     * project the submitted {@link ChatInputAnswer}s back into the
     * SDK's {@link ElicitationResult.content} shape.
     */
    this._pendingElicitations = new PendingRequestRegistry();
    /**
     * Pending plan-review requests originating from the CLI's
     * `exitPlanMode.request` RPC. Tracked separately from
     * {@link _pendingUserInputs} so the completion handler can resolve the
     * RPC with a structured {@link CopilotExitPlanModeResponse} (which the CLI
     * forwards to `session.respondToExitPlanMode`) rather than feeding it
     * back through the SDK's `ask_user` callback.
     */
    this._pendingPlanReviews = new PendingRequestRegistry();
    /**
     * The current protocol turn and its per-turn bookkeeping, or `undefined`
     * when the session is idle (no active turn). Replaces the former set of
     * loosely-coupled per-turn fields (`_turnId`, usage counter, streaming
     * part-id maps) with a single object carrying an explicit
     * {@link CopilotTurn.state} lifecycle. A {@link MutableDisposable}:
     * replacing or clearing it disposes the old turn.
     */
    this._currentTurn = this._register(new MutableDisposable());
    this._dropLateRootTurnEvents = false;
    /** Monotonic 0-based ordinal assigned to each turn as it starts, for numeric `turnIndex` telemetry parity. */
    this._nextTurnOrdinal = 0;
    /**
     * Latest session-wide nano-AIU total reported by the SDK's usage metrics
     * (`rpc.usage.getMetrics`), which is authoritative for what the session as a
     * whole has been billed: it folds in every model call plus compaction,
     * covers work billed while no turn was active, and survives resume.
     *
     * Deliberately *not* used to derive per-turn cost. It is session-scoped and
     * read asynchronously, so differencing it against a previous reading races
     * turn boundaries — the SDK's terminal `session.idle` can close a turn while
     * a read is still in flight. Per-turn cost comes from the synchronous
     * per-event `copilotUsage` instead (see {@link CopilotTurn.copilotNanoAiu}).
     */
    this._sessionTotalNanoAiu = 0;
    this._promptCacheRefreshGeneration = 0;
    /**
     * Serializes the metrics reads behind {@link _refreshSessionUsageMetrics}. Several
     * handlers refresh the total, so without this their RPCs overlap and an older
     * one resolving last would publish a session cost that visibly regresses. A
     * high-water mark cannot be used to reject stale reads instead, because the
     * total is legitimately non-monotonic (see the truncation note below). Keeping
     * one read in flight makes out-of-order resolution impossible, and coalesces
     * the redundant reads that a burst of usage events would otherwise issue.
     */
    this._sessionUsageMetricsRefreshThrottler = this._register(new Throttler());
    this._autoApprovalExperimentalModeEnabled = false;
    this._permissionModeSequencer = new Sequencer();
    this._mcpEnablementSequencer = new Sequencer();
    this._mcpServerLifecycleSequencer = new SequencerByKey();
    this._steeringMessagesInFlight = /* @__PURE__ */ new Set();
    /**
     * Steering messages that have been accepted by the SDK but not yet
     * surfaced to the chat UI as a separate user message. When the SDK
     * echoes a steering through a `user.message` event whose `content`
     * matches one of these entries, we finalize the in-flight turn and
     * dispatch a new {@link ActionType.ChatTurnStarted} whose
     * `userMessage` is the steering content. The reducer also removes
     * the pending steering via the action's `queuedMessageId`.
     *
     * Entries left here at abort/dispose time are flushed as
     * `steering_consumed` signals so the chat UI's pending state still
     * clears in cleanup paths where we never observe the echo.
     */
    this._pendingSteeringFlips = /* @__PURE__ */ new Map();
    this._mcpLaunchConfigurationDirty = false;
    /** Tool-search decision supplied by the launcher that built this SDK session. */
    this._toolSearchActive = false;
    /** Deferred promises for pending client tool calls, keyed by toolCallId. */
    this._pendingClientToolCalls = new PendingRequestRegistry();
    /** Pending SDK MCP auth handler promises, keyed by SDK auth request id. */
    this._pendingMcpAuthRequests = new PendingRequestRegistry();
    /** `pending-edit-content:` URIs written during permission requests, keyed
     *  by toolCallId. Cleaned up when the permission resolves or the session
     *  is disposed. */
    this._pendingEditContentUris = /* @__PURE__ */ new Map();
    /**
     * Fans MCP server notifications (today: `notifications/tools/list_changed`)
     * up to the agent and on to the protocol server. Fired by the
     * `onToolsUpdated` listener once per ready MCP channel.
     */
    this._onMcpNotification = this._register(new Emitter());
    this.onMcpNotification = this._onMcpNotification.event;
    this._onDidRequireAuth = this._register(new Emitter());
    this.onDidRequireAuth = this._onDidRequireAuth.event;
    /**
     * Pending MCP `sampling/createMessage` requests received over the
     * AHP `mcp://` channel, keyed by the cancellation handle we passed
     * into {@link rpc.mcp.executeSampling}. Tracked so that session
     * teardown can issue a best-effort
     * {@link rpc.mcp.cancelSamplingExecution} for each one instead of
     * leaving the SDK-side promise (and the upstream App) hanging.
     */
    this._pendingMcpSamplings = /* @__PURE__ */ new Set();
    /** Tracks whether a non-empty activity has been published, so we only emit a clear when needed. */
    this._hasActivity = false;
    /**
     * Last SDK-reported MCP status logged for each server (keyed by server
     * name). Used to suppress duplicate lifecycle log records when the SDK
     * re-reports an unchanged status — the `rpc.mcp.list` seed and the
     * `session.mcp_servers_loaded` event routinely carry the same snapshot.
     */
    this._lastLoggedMcpStatus = /* @__PURE__ */ new Map();
    this._abortCts.value = new CancellationTokenSource();
    this._developmentErrorInjectionEnabled = options.enableDevelopmentErrorInjection ?? !product_default.commit;
    this.sessionId = options.rawSessionId;
    this._ownerSessionUri = options.sessionUri;
    this.resourceUri = options.resource ?? options.sessionUri;
    this._slashCommandProvider = new CopilotSlashCommandProvider(() => this._wrapper.session.rpc.commands.list({ includeBuiltins: true, includeSkills: true, includeClientCommands: true }).then((c) => c.commands), this._logService);
    this._chatChannelUri = options.chatChannelUri;
    this._storageUri = this.resourceUri;
    this._onDidSessionProgress = options.onDidSessionProgress;
    this._sessionLauncher = options.sessionLauncher;
    this._launchPlan = options.launchPlan;
    this._detectInterruptedTurnOnRestore = options.launchPlan.kind === "resume";
    this._isLaunchTokenStillCurrent = options.isLaunchTokenCurrent ?? (() => true);
    this._onTurnEnded = options.onTurnEnded ?? (() => {
    });
    this._shellManager = options.shellManager;
    this._nonPtyShellTerminals = this._register(this._instantiationService.createInstance(NonPtyShellTerminalStreams, options.sessionUri, options.chatChannelUri));
    this._workingDirectory = options.workingDirectory;
    this._customizationDirectory = options.customizationDirectory;
    this._serverToolHost = options.serverToolHost;
    this._hostCustomizations = options.hostCustomizations ?? (() => []);
    this._platform = options.platform ?? process.platform;
    this._telemetryReporter = new AgentHostTelemetryReporter(this._telemetryService);
    this._repoInfoTelemetry = this._register(this._instantiationService.createInstance(AgentHostRepoInfoTelemetry, this._telemetryReporter));
    this._appliedSnapshot = options.clientSnapshot ?? { tools: [], plugins: [], mcpServers: {} };
    this._appliedPluginSources = new Set(this._appliedSnapshot.plugins.flatMap((plugin) => plugin.sourceUri ? [plugin.sourceUri.toString()] : []));
    const disabledMcpServers = /* @__PURE__ */ new Set([
      ...this._appliedSnapshot.plugins.flatMap((plugin) => plugin.disabledMcpServers ?? []),
      ...this._launchPlan.disabledRootMcpServers ?? []
    ]);
    this._projectedMcpServerLaunchEnablement = new Map(this._appliedSnapshot.plugins.flatMap(
      (plugin) => plugin.mcpServers.filter(isMcpServerExplicitlyProjected).map((server) => [server.name, !disabledMcpServers.has(server.name)])
    ));
    this._appliedAdditionalDirectories = [...this._launchPlan.additionalDirectories ?? []];
    this._clientToolNames = clientToolNamesFromSnapshot(this._appliedSnapshot);
    this._activeClientToolSet = options.activeClientToolSet ?? new ActiveClientToolSet();
    this._clientReachesChat = options.clientReachesChat ?? (() => true);
    this._databaseRef = this._sessionDataService.openDatabase(this._storageUri);
    this._register(toDisposable(() => this._databaseRef.dispose()));
    this._editTracker = this._instantiationService.createInstance(
      FileEditTracker,
      this._storageUri.toString(),
      this._databaseRef.object
    );
    const pluginMcpServerSources = new Map((options.clientSnapshot?.plugins ?? []).flatMap((plugin) => {
      const sourceUri = plugin.sourceUri;
      return sourceUri === void 0 ? [] : plugin.mcpServers.map((server) => [server.name, sourceUri.toString()]);
    }));
    this._mcpCustomizations = this._register(this._instantiationService.createInstance(McpCustomizationController, {
      chatUri: this._chatChannelUri,
      emit: (action) => this._emitAction(action),
      pluginMcpServerSources: () => pluginMcpServerSources,
      resolveEnablement: (server, owningPluginUri) => {
        const resolution = this._customizationEnablementService.resolve(this._ownerSessionUri.toString(), targetForMcpServer(server, owningPluginUri, false));
        return resolution.kind === "resolved" ? resolution.enablement : void 0;
      }
    }));
    this._register(toDisposable(() => this._cancelAllPendingInteractions()));
    this._register(toDisposable(() => this._shellManager?.dispose()));
    this._register(toDisposable(() => this._drainPendingSteeringFlips()));
    if (this._shellManager) {
      this._register(this._shellManager.onDidAssociateTerminal(({ toolCallId, terminalUri, displayName }) => {
        const tracked = this._activeToolCalls.get(toolCallId);
        if (!tracked) {
          return;
        }
        tracked.content.push({
          type: "terminal" /* Terminal */,
          resource: terminalUri,
          title: displayName
        });
        this._emitAction({
          type: "chat/toolCallContentChanged" /* ChatToolCallContentChanged */,
          turnId: this._turnId,
          toolCallId,
          content: tracked.content
        });
      }));
    }
  }
  get ownerSessionUri() {
    return this._ownerSessionUri;
  }
  /** @deprecated Compatibility alias for SDK callbacks; this is the exact persistence resource. */
  get sessionUri() {
    return this.resourceUri;
  }
  get chatChannelUri() {
    return this._chatChannelUri;
  }
  /** Working directory this session operates in, if any. */
  get workingDirectory() {
    return this._workingDirectory;
  }
  /**
   * Protocol turn ID of the active turn, or `''` when idle. Used by file
   * edit tracking and emitted on per-turn actions.
   */
  get _turnId() {
    return this._currentTurn.value?.id ?? "";
  }
  /** 0-based ordinal of the active turn within the session, or `0` when idle. */
  get _turnOrdinal() {
    return this._currentTurn.value?.ordinal ?? 0;
  }
  /**
   * Whether the session currently has an in-flight turn. Used by
   * non-destructive idle release to avoid disconnecting mid-turn.
   */
  get hasActiveTurn() {
    return this._currentTurn.value !== void 0;
  }
  get chatUri() {
    return this._chatChannelUri;
  }
  get currentTurnId() {
    return this._currentTurn.value?.id;
  }
  getTurnDiagnosticSnapshot(turnId) {
    const currentTurn = this._currentTurn.value;
    const turn = currentTurn?.id === turnId ? currentTurn : void 0;
    if (!turn) {
      return void 0;
    }
    return {
      state: "available",
      providerCallState: turn.providerCallState,
      providerTurnStarted: turn.providerTurnStarted,
      providerSessionState: this._wrapper.lifecycleState
    };
  }
  get currentTurnClientType() {
    return this._currentTurn.value?.clientType ?? "unknown" /* Unknown */;
  }
  get currentTurnClientContext() {
    return this._currentTurn.value?.clientContext;
  }
  async collectDebugLogs(outputDirectory, includeSessionLogs) {
    let result;
    for (let attempt = 0; ; attempt++) {
      result = await this._wrapper.session.rpc.debug.collectLogs({
        destination: { kind: "directory", outputDirectory: outputDirectory.fsPath },
        include: {
          events: includeSessionLogs,
          processLogs: false,
          shellLogs: includeSessionLogs
        }
      });
      const eventLogPending = includeSessionLogs && result.skippedEntries?.some((entry) => entry.bundlePath === "events.jsonl" && entry.reason === "not found");
      if (!eventLogPending || attempt === DEBUG_LOG_COLLECTION_RETRY_ATTEMPTS - 1) {
        break;
      }
      if (result.kind === "directory" && result.path !== outputDirectory.fsPath) {
        await rm(result.path, { recursive: true, force: true });
      }
      await timeout(DEBUG_LOG_COLLECTION_RETRY_DELAY_MS);
    }
    if (result.kind !== "directory" || result.path === outputDirectory.fsPath) {
      return result.entries.length > 0;
    }
    try {
      await cp2(result.path, outputDirectory.fsPath, { recursive: true });
    } finally {
      await rm(result.path, { recursive: true, force: true });
    }
    return result.entries.length > 0;
  }
  get mcpServerStates() {
    return this._mcpCustomizations.runtimeStates;
  }
  // ---- AgentSignal helpers ------------------------------------------------
  _shouldDropLateRootTurnEvent(eventType) {
    if (!this._dropLateRootTurnEvents) {
      return false;
    }
    this._logService.error(`[Copilot:${this.sessionId}] ${eventType} emitted after cancellation; dropping`);
    return true;
  }
  /** Wraps a {@link SessionAction} in an {@link AgentSignal} envelope and emits it. */
  /** todo@connor4312: AHP is missing a chat activity update action which is needed to drop `SessionAction` here */
  _emitAction(action, parentToolCallId, trustedRootTurn = false) {
    if (!trustedRootTurn && this._dropLateRootTurnEvents && isChatAction(action) && hasKey(action, { turnId: true }) && action.type !== "chat/turnStarted" /* ChatTurnStarted */) {
      this._logService.error(`[Copilot:${this.sessionId}] ${action.type} emitted after cancellation; dropping`);
      return;
    }
    this._onDidSessionProgress.fire({
      kind: "action",
      resource: isChatAction(action) ? this._chatChannelUri : this._ownerSessionUri,
      action,
      parentToolCallId
    });
  }
  _emitModelCallCompleted(turnId, modelCallId, parentToolCallId) {
    this._onDidSessionProgress.fire({
      kind: "model_call_completed",
      resource: this._chatChannelUri,
      turnId,
      modelCallId,
      parentToolCallId
    });
  }
  /**
   * Promotes a pending steering message into its own protocol turn:
   * closes the in-flight turn (so its responseParts settle into history)
   * and dispatches {@link ActionType.ChatTurnStarted} for a fresh
   * turn whose user message is the steering content. The action's
   * `queuedMessageId` atomically clears the corresponding pending
   * steering message from the session state.
   *
   * All subsequent SDK events (message deltas, tool calls, …) emitted
   * by the agent now reference the new `_turnId`, so the steering
   * response lands in the new turn rather than being folded into the
   * original.
   *
   * Returns the new turn id so callers (notably the `user.message`
   * handler) can associate the SDK event id with the steering turn for
   * history.truncate / sessions.fork mapping.
   */
  _beginSteeringTurn(steering) {
    this._completeActiveTurn();
    const newTurnId = generateUuid();
    this._emitAction({
      type: "chat/turnStarted" /* ChatTurnStarted */,
      turnId: newTurnId,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      message: steering.message,
      queuedMessageId: steering.id
    });
    this.resetTurnState(newTurnId);
    const turn = this._currentTurn.value;
    if (turn) {
      turn.messageCharLen = steering.message.text.length;
      turn.markRunning();
    }
    return newTurnId;
  }
  /**
   * Drains any steering messages we acknowledged to the SDK but never
   * promoted to their own turn (e.g. on abort or session dispose). Fires
   * `steering_consumed` so the chat UI removes the lingering pending
   * steering bubble even when no fresh `user.message` arrives.
   */
  _drainPendingSteeringFlips() {
    if (this._pendingSteeringFlips.size === 0) {
      return;
    }
    const ids = [...this._pendingSteeringFlips.keys()];
    this._pendingSteeringFlips.clear();
    for (const id2 of ids) {
      this._onDidSessionProgress.fire({
        kind: "steering_consumed",
        chat: this._chatChannelUri,
        id: id2
      });
    }
  }
  /**
   * Pops the buffered steering message whose text is contained in the SDK
   * `user.message` content we just observed. Matching by content (rather
   * than just popping FIFO) keeps us robust against the SDK reordering
   * or coalescing entries — concurrent steering messages with different
   * texts are still matched to the correct one. Returns `undefined` if
   * no buffered entry matches; the caller treats the `user.message` as
   * an ordinary echo and skips the turn flip.
   */
  _takeMatchingPendingSteering(content) {
    if (this._pendingSteeringFlips.size === 0) {
      return void 0;
    }
    let substringMatch;
    for (const [id2, msg] of this._pendingSteeringFlips) {
      if (msg.message.text === content) {
        this._pendingSteeringFlips.delete(id2);
        return msg;
      }
      if (msg.message.text.length > 0 && content.includes(msg.message.text) && (!substringMatch || msg.message.text.length > substringMatch[1].message.text.length)) {
        substringMatch = [id2, msg];
      }
    }
    if (substringMatch) {
      this._pendingSteeringFlips.delete(substringMatch[0]);
      return substringMatch[1];
    }
    return void 0;
  }
  _parentToolCallIdForSubagentEvent(e) {
    return e.agentId ? this._parentToolCallIdsByAgentId.get(e.agentId) : void 0;
  }
  _resumeSubagentForEvent(e, message) {
    if (this._dropLateRootTurnEvents) {
      return;
    }
    if (!e.agentId || this._activeSubagentAgentIds.has(e.agentId)) {
      return;
    }
    const parentToolCallId = this._parentToolCallIdsByAgentId.get(e.agentId);
    if (!parentToolCallId) {
      return;
    }
    if (this._currentTurn.value) {
      this._rootTurnIdBySubagentToolCallId.set(parentToolCallId, this._currentTurn.value.id);
    }
    this._activeSubagentAgentIds.add(e.agentId);
    this._onDidSessionProgress.fire({
      kind: "subagent_resumed",
      chat: this._chatChannelUri,
      toolCallId: parentToolCallId,
      message
    });
  }
  _completeSubagentTurn(agentId, toolCallId) {
    if (agentId) {
      if (!this._activeSubagentAgentIds.delete(agentId)) {
        return;
      }
    } else if (!toolCallId) {
      return;
    }
    const parentToolCallId = toolCallId ?? (agentId ? this._parentToolCallIdsByAgentId.get(agentId) : void 0);
    if (!parentToolCallId) {
      return;
    }
    if (this._dropLateRootTurnEvents) {
      this._rootTurnIdBySubagentToolCallId.delete(parentToolCallId);
      this._subagentDirectUsageByToolCallId.delete(parentToolCallId);
      this._lastSubagentUsageByToolCallId.delete(parentToolCallId);
      this._autoModeResolvedByToolCallId.delete(parentToolCallId);
      return;
    }
    this._onDidSessionProgress.fire({
      kind: "subagent_completed",
      chat: this._chatChannelUri,
      toolCallId: parentToolCallId
    });
    this._rootTurnIdBySubagentToolCallId.delete(parentToolCallId);
    this._subagentDirectUsageByToolCallId.delete(parentToolCallId);
    this._lastSubagentUsageByToolCallId.delete(parentToolCallId);
    this._autoModeResolvedByToolCallId.delete(parentToolCallId);
  }
  _directUsageFor(parentToolCallId, create) {
    if (!parentToolCallId) {
      return this._currentTurn.value?.directUsage;
    }
    let usage = this._subagentDirectUsageByToolCallId.get(parentToolCallId);
    if (!usage && create) {
      usage = new DirectUsageAccumulator();
      this._subagentDirectUsageByToolCallId.set(parentToolCallId, usage);
    }
    return usage;
  }
  _owningRootTurn(parentToolCallId) {
    const turn = this._currentTurn.value;
    if (!turn || parentToolCallId && this._rootTurnIdBySubagentToolCallId.get(parentToolCallId) !== turn.id) {
      return void 0;
    }
    return turn;
  }
  _shouldDropUnmappedSubagentEvent(e, eventName) {
    const parentToolCallId = this._parentToolCallIdForSubagentEvent(e);
    if (!parentToolCallId && e.agentId) {
      this._logService.warn(`[Copilot:${this.sessionId}] Dropping ${eventName} for unknown subagent agentId=${e.agentId}`);
      return true;
    }
    return false;
  }
  /** Resolves the owning client for a chat-scoped tool call, honoring host-published chat membership. */
  _resolveClientToolOwner(toolName) {
    const chat = this._chatChannelUri;
    const provides = (clientId) => this._activeClientToolSet.get(clientId).some((tool) => tool.name === toolName);
    const preferred = this._currentTurn.value?.senderClientId;
    if (preferred && this._clientReachesChat(preferred, chat) && provides(preferred)) {
      return preferred;
    }
    for (const clientId of this._activeClientToolSet.clientIds()) {
      if (this._clientReachesChat(clientId, chat) && provides(clientId)) {
        return clientId;
      }
    }
    return void 0;
  }
  _getToolCallContributor(toolName, mcpServerName) {
    const clientToolName = this._clientToolName(toolName);
    if (this._clientToolNames.has(clientToolName)) {
      const clientId = this._resolveClientToolOwner(clientToolName);
      return clientId ? { kind: "client" /* Client */, clientId } : void 0;
    }
    if (mcpServerName) {
      const customizationId2 = this._mcpCustomizations.customizationIdForServer(mcpServerName);
      return customizationId2 ? { kind: "mcp" /* MCP */, customizationId: customizationId2 } : void 0;
    }
    return void 0;
  }
  _createToolCallMeta(toolName, parameters) {
    const toolKind = getToolKind(toolName, parameters);
    const subagentMeta = toolKind === "subagent" ? getSubagentMetadata(parameters) : void 0;
    return {
      toolKind,
      language: toolKind === "terminal" ? getShellLanguage(toolName) : void 0,
      subagentDescription: subagentMeta?.description,
      subagentAgentName: subagentMeta?.agentName
    };
  }
  _getStreamingToolCallDisplay(toolName, input) {
    const partialInput = parseCopilotStreamingToolInput(input);
    const parameters = partialInput !== null && typeof partialInput === "object" && !Array.isArray(partialInput) ? partialInput : void 0;
    return {
      parameters,
      meta: this._createToolCallMeta(toolName, parameters),
      invocationMessage: getStreamingInvocationMessage(toolName, getToolDisplayName(toolName), partialInput, (path) => this._resolveEditFilePath(path))
    };
  }
  _emitStreamingToolCallDisplay(toolCallId, streaming) {
    if (!streaming.toolName) {
      return;
    }
    const display = this._getStreamingToolCallDisplay(streaming.toolName, streaming.input);
    streaming.displayedInputLength = streaming.input.length;
    const message = streamingToolDisplayText(display.invocationMessage);
    if (message === streaming.displayedMessage) {
      return;
    }
    streaming.displayedMessage = message;
    this._emitAction({
      type: "chat/toolCallDelta" /* ChatToolCallDelta */,
      turnId: this._turnId,
      toolCallId,
      content: "",
      invocationMessage: display.invocationMessage,
      _meta: toToolCallMeta(display.meta)
    }, streaming.parentToolCallId);
  }
  _scheduleStreamingToolCallDisplay(toolCallId) {
    let scheduler = this._streamingToolDisplaySchedulers.get(toolCallId);
    if (!scheduler) {
      scheduler = new RunOnceScheduler(() => {
        const streaming = this._streamingToolCalls.get(toolCallId);
        if (!streaming?.started || !streaming.toolName) {
          return;
        }
        if (streaming.displayedInputLength === streaming.input.length) {
          return;
        }
        this._emitStreamingToolCallDisplay(toolCallId, streaming);
      }, STREAMING_TOOL_DISPLAY_INTERVAL_MS);
      this._streamingToolDisplaySchedulers.set(toolCallId, scheduler);
    }
    if (!scheduler.isScheduled()) {
      scheduler.schedule();
    }
  }
  _beginToolCallRound(parentToolCallId) {
    const scope = parentToolCallId ?? "";
    this._currentTurn.value?.markdownPartIds.delete(scope);
    this._currentTurn.value?.reasoningPartIds.delete(scope);
  }
  /**
   * Starts a fresh `pending` turn, discarding any per-turn streaming state
   * from a previous turn so the next text/reasoning chunk allocates a new
   * response part. The turn becomes `running` on the first SDK event.
   */
  resetTurnState(turnId, senderClientId, clientType = "unknown" /* Unknown */, clientContext = createUnknownAgentHostClientTelemetryContext(clientType)) {
    this._detectInterruptedTurnOnRestore = false;
    this._streamingToolCalls.clear();
    this._streamingToolDisplaySchedulers.clearAndDisposeAll();
    this._currentTurn.value = new CopilotTurn(turnId, this._nextTurnOrdinal++, senderClientId, clientContext);
  }
  async hasRunningDetachedShells() {
    try {
      await this._wrapper.session.rpc.tasks.refresh();
      const tasks = await this._wrapper.session.rpc.tasks.list();
      return tasks.tasks.some((task) => task.type === "shell" && task.attachmentMode === "detached" && (task.status === "running" || task.status === "idle"));
    } catch (err) {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to read detached shell state; deferring release: ${getErrorMessage(err)}`);
      return true;
    }
  }
  /** Refreshes prompt-cache state and the session-wide nano-AIU total from the SDK's authoritative usage metrics. */
  async _refreshSessionUsageMetrics() {
    try {
      return await this._sessionUsageMetricsRefreshThrottler.queue(async () => {
        const promptCacheRefreshGeneration = this._promptCacheRefreshGeneration;
        const metrics = await this._wrapper.session.rpc.usage.getMetrics();
        const modelId = metrics.currentModel;
        if (!this._store.isDisposed && modelId && promptCacheRefreshGeneration === this._promptCacheRefreshGeneration) {
          const cacheExpiresAt = metrics.modelMetrics[modelId]?.cacheExpiresAt;
          this._setPromptCacheState(cacheExpiresAt ? { modelId, cacheExpiresAt } : void 0);
        }
        const total = metrics.totalNanoAiu;
        if (typeof total !== "number" || !Number.isFinite(total) || total < 0 || total === this._sessionTotalNanoAiu) {
          return false;
        }
        this._sessionTotalNanoAiu = total;
        return true;
      });
    } catch (err) {
      this._logService.trace(`[Copilot:${this.sessionId}] usage.getMetrics RPC failed: ${getErrorMessage(err)}`);
      return false;
    }
  }
  /**
   * The parent-scope Copilot billing metadata for the active turn: the turn's
   * own accumulated cost plus the SDK's session-wide total. Absent until
   * something has actually been billed.
   */
  _parentCopilotUsageMeta() {
    const turnNanoAiu = this._currentTurn.value?.copilotNanoAiu ?? 0;
    if (!turnNanoAiu && !this._sessionTotalNanoAiu) {
      return void 0;
    }
    return {
      ...turnNanoAiu ? { totalNanoAiu: turnNanoAiu } : {},
      ...this._sessionTotalNanoAiu ? { sessionTotalNanoAiu: this._sessionTotalNanoAiu } : {}
    };
  }
  /** Reads the SDK's per-source context-window attribution, or `undefined` when unavailable. */
  async _readContextAttribution() {
    let attribution;
    try {
      attribution = (await this._wrapper.session.rpc.metadata.getContextAttribution())?.contextAttribution ?? void 0;
    } catch (err) {
      this._logService.trace(`[Copilot:${this.sessionId}] contextAttribution RPC failed: ${getErrorMessage(err)}`);
      return void 0;
    }
    if (!attribution) {
      this._logService.trace(`[Copilot:${this.sessionId}] contextAttribution: null/empty`);
      return void 0;
    }
    if (this._logService.getLevel() <= 1 /* Trace */) {
      this._logService.trace(`[Copilot:${this.sessionId}] contextAttribution: totalTokens=${attribution.totalTokens}, entries=${JSON.stringify(attribution.entries.map((e) => ({ kind: e.kind, id: e.id, label: e.label, tokens: e.tokens, parentId: e.parentId })))}`);
    }
    return attribution;
  }
  _completeActiveTurn(trustedRootTurn = false) {
    const turn = this._currentTurn.value;
    if (!turn) {
      return;
    }
    turn.markCompleted();
    this._reportToolCallDetails(turn, "success");
    this._emitAction({
      type: "chat/turnComplete" /* ChatTurnComplete */,
      turnId: turn.id,
      duration: turn.duration
    }, void 0, trustedRootTurn);
    this._clearActiveTurn();
  }
  failActiveTurn(error) {
    const turn = this._currentTurn.value;
    if (!turn) {
      return void 0;
    }
    this._reportToolCallDetails(turn, "failed");
    this._emitAction({
      type: "chat/error" /* ChatError */,
      turnId: turn.id,
      duration: turn.duration,
      part: createErrorResponsePart(error, true)
    });
    this._clearActiveTurn();
    return turn.id;
  }
  discardActiveTurn() {
    if (this._currentTurn.value) {
      this._clearActiveTurn();
    }
  }
  /**
   * Drops the active turn and reports that this chat is now idle. Every
   * transition out of an in-flight turn must go through here so work the
   * agent defers while a turn runs — notably a pending CLI client restart —
   * is not stranded waiting on a turn that already ended.
   */
  _clearActiveTurn() {
    if (this._resumingTurnAwaitingProviderStart === this._currentTurn.value) {
      this._resumingTurnAwaitingProviderStart = void 0;
    }
    this._currentTurn.clear();
    this._streamingToolCalls.clear();
    this._streamingToolDisplaySchedulers.clearAndDisposeAll();
    try {
      this._onTurnEnded();
    } catch (err) {
      this._logService.error(err, `[Copilot:${this.sessionId}] onTurnEnded callback failed`);
    }
  }
  _reportToolCallDetails(turn, responseType) {
    if (turn.toolCallDetailsReported) {
      return;
    }
    turn.toolCallDetailsReported = true;
    void this._telemetryReporter.toolCallDetails({
      clientContext: turn.clientContext,
      provider: this._ownerSessionUri.scheme,
      session: this.resourceUri.toString(),
      turnId: turn.id,
      clientType: turn.clientType,
      model: turn.lastModel,
      responseType,
      toolCounts: Object.fromEntries(turn.toolCounts),
      availableTools: this._appliedSnapshot.tools.map((tool) => tool.name),
      numRequests: turn.toolCallRounds,
      turnIndex: turn.ordinal,
      turnDuration: turn.duration,
      messageCharLen: turn.messageCharLen,
      totalToolCalls: turn.totalToolCalls,
      parallelToolCallRounds: turn.parallelToolCallRounds,
      parallelToolCallsTotal: turn.parallelToolCallsTotal
    }).catch((err) => this._logService.trace(`[Copilot:${this.sessionId}] Telemetry emission failed: ${getErrorMessage(err)}`));
  }
  _reportToolApproval(toolCallId, toolName, mcpServerName) {
    const record = this._toolApprovalRecords.get(toolCallId);
    if (!toolName || isHiddenTool(toolName) || record?.reported) {
      return;
    }
    const confirmKind = mapPermissionResultToConfirmKind(record?.resultKind, record?.resolvedByHook === true);
    this._telemetryReporter.toolApproval({
      clientContext: this._currentTurn.value?.clientContext,
      provider: this._ownerSessionUri.scheme,
      session: this.resourceUri.toString(),
      turnId: this._turnId,
      toolId: toolName,
      toolSourceKind: this._toolSourceKindFor(toolName, mcpServerName),
      confirmKind,
      confirmationNotNeededReason: confirmKind === "confirmationNotNeeded" && record?.resolvedByHook ? "other" : void 0,
      requestUnsandboxedExecution: record?.requestSandboxBypass ? true : void 0
    });
    if (record) {
      record.reported = true;
    }
  }
  _reportToolApprovalIfNoPermission(toolCallId) {
    const record = this._toolApprovalRecords.get(toolCallId);
    if (record && !record.permissionRequested) {
      this._reportToolApproval(toolCallId, record.toolName, record.mcpServerName);
    }
  }
  _toolSourceKindFor(toolName, mcpServerName) {
    if (mcpServerName) {
      return "mcp";
    }
    if (this._clientToolNames.has(this._clientToolName(toolName))) {
      return "client";
    }
    return "internal";
  }
  _getEditFilePaths(parameters) {
    return getEditFilePaths(parameters).map((path) => this._resolveEditFilePath(path));
  }
  _resolveEditFilePath(path) {
    if (isAbsolute(path) || !this._workingDirectory || this._workingDirectory.scheme !== Schemas.file) {
      return path;
    }
    return join(this._workingDirectory.fsPath, path);
  }
  /**
   * Emits a synthetic markdown content block for the active turn and
   * makes it the current markdown response part so that subsequent SDK
   * deltas append to it. Used by the agent to surface one-shot host
   * messages (e.g. the worktree-created announcement) at the top of the
   * first response.
   */
  emitInitialMarkdown(content, trustedRootTurn = false) {
    this._emitMarkdownDelta(content, void 0, trustedRootTurn);
  }
  /**
   * Emits a streaming text delta. The first delta of a turn allocates a
   * markdown response part; subsequent deltas append to it.
   */
  _emitMarkdownDelta(content, parentToolCallId, trustedRootTurn = false) {
    if (parentToolCallId === void 0 && !trustedRootTurn && this._shouldDropLateRootTurnEvent("assistant.message_delta")) {
      return;
    }
    const turn = this._currentTurn.value;
    if (!turn) {
      this._logService.error(`[Copilot:${this.sessionId}] Markdown delta emitted with no active turn; dropping`);
      return;
    }
    const markdownScope = parentToolCallId ?? "";
    let partId = turn.markdownPartIds.get(markdownScope);
    if (!partId) {
      partId = generateUuid();
      turn.markdownPartIds.set(markdownScope, partId);
      this._emitAction({
        type: "chat/responsePart" /* ChatResponsePart */,
        turnId: turn.id,
        part: { kind: "markdown" /* Markdown */, id: partId, content }
      }, parentToolCallId, trustedRootTurn);
      return;
    }
    this._emitAction({
      type: "chat/delta" /* ChatDelta */,
      turnId: turn.id,
      partId,
      content
    }, parentToolCallId, trustedRootTurn);
  }
  /** Emits a reasoning delta, similar to {@link _emitMarkdownDelta} but for reasoning parts. */
  _emitReasoningDelta(content, parentToolCallId) {
    if (parentToolCallId === void 0 && this._shouldDropLateRootTurnEvent("assistant.reasoning_delta")) {
      return;
    }
    const turn = this._currentTurn.value;
    if (!turn) {
      this._logService.error(`[Copilot:${this.sessionId}] Reasoning delta emitted with no active turn; dropping`);
      return;
    }
    const reasoningScope = parentToolCallId ?? "";
    let partId = turn.reasoningPartIds.get(reasoningScope);
    if (!partId) {
      partId = generateUuid();
      turn.reasoningPartIds.set(reasoningScope, partId);
      this._emitAction({
        type: "chat/responsePart" /* ChatResponsePart */,
        turnId: turn.id,
        part: { kind: "reasoning" /* Reasoning */, id: partId, content }
      }, parentToolCallId);
      return;
    }
    this._emitAction({
      type: "chat/reasoning" /* ChatReasoning */,
      turnId: turn.id,
      partId,
      content
    }, parentToolCallId);
  }
  /**
   * The snapshot of client contributions captured when this session was
   * created. Used by the agent to detect when the session is 1stale.
   */
  get appliedSnapshot() {
    return this._appliedSnapshot;
  }
  get requiresMcpLaunchConfigurationRefresh() {
    this._markMcpLaunchConfigurationDirty();
    return this._mcpLaunchConfigurationDirty;
  }
  get appliedDisabledRootMcpServers() {
    return this._launchPlan.disabledRootMcpServers ?? [];
  }
  /**
   * Secondary roots granted when this live SDK session was created or resumed.
   * The primary process root is immutable and therefore excluded.
   */
  get appliedAdditionalDirectories() {
    return this._appliedAdditionalDirectories;
  }
  get customizationDirectory() {
    return this._customizationDirectory;
  }
  /**
   * Creates SDK {@link Tool} objects for the client-provided tools in the
   * applied snapshot. The handler parks a request in
   * {@link _pendingClientToolCalls} and waits for the client to dispatch
   * `session/toolCallComplete`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createClientSdkTools(toolSearchActive) {
    this._toolSearchActive = toolSearchActive;
    const tools = this._appliedSnapshot.tools;
    if (tools.length === 0) {
      return [];
    }
    const sessionTools = toolSearchActive ? tools : tools.filter((def) => def.name !== CLIENT_TOOL_SEARCH_REFERENCE_NAME);
    return sessionTools.map((def) => {
      if (toolSearchActive && def.name === CLIENT_TOOL_SEARCH_REFERENCE_NAME) {
        return {
          name: RUNTIME_TOOL_SEARCH_TOOL_NAME,
          description: def.description ?? "",
          parameters: def.inputSchema ?? { type: "object", properties: {} },
          overridesBuiltInTool: true,
          defer: "never",
          skipPermission: true,
          handler: this._guarded(async (_args, invocation) => {
            try {
              const candidates = this._toToolSearchCandidates(invocation.availableTools);
              const clientResult = await this._pendingClientToolCalls.registerAndFire(
                invocation.toolCallId,
                () => this._emitToolSearchReady(invocation.toolCallId, candidates)
              );
              return this._toToolSearchResult(clientResult, invocation.availableTools);
            } catch (error) {
              this._logService.error(error, `[Copilot:${this.sessionId}] Failed in tool-search handler: toolCallId=${invocation.toolCallId}`);
              return this._toolSearchFailure(getErrorMessage(error));
            }
          }, this._toolSearchFailure("Tool call cancelled: session is aborting"), "tool-search")
        };
      }
      const defer = toolSearchActive ? NON_DEFERRED_CLIENT_TOOL_NAMES.has(def.name) ? "never" : "auto" : void 0;
      const sdkPolicy = getClientToolSdkPolicy(def.name);
      return {
        name: def.name,
        description: def.description ?? "",
        parameters: def.inputSchema ?? { type: "object", properties: {} },
        defer,
        ...sdkPolicy,
        handler: this._guarded(async (_args, { toolCallId }) => {
          try {
            return await this._pendingClientToolCalls.register(toolCallId);
          } catch (error) {
            this._logService.error(error, `[Copilot:${this.sessionId}] Failed in client tool handler: tool=${def.name}, toolCallId=${toolCallId}`);
            throw error;
          }
        }, this._toolSearchFailure("Tool call cancelled: session is aborting"), "client-tool")
      };
    });
  }
  _isToolSearchActive() {
    return this._toolSearchActive;
  }
  get _abortToken() {
    return this._abortCts.value?.token ?? CancellationToken.Cancelled;
  }
  _beginAbort() {
    if (this._abortToken.isCancellationRequested) {
      return;
    }
    this._abortCts.value?.cancel();
    this._cancelAllPendingInteractions();
  }
  _resetAbortToken() {
    this._abortCts.value = new CancellationTokenSource();
  }
  /**
   * Guards SDK callbacks against aborts: the synchronous pre-check avoids the `shortcutEvent` macrotask for already-cancelled tokens, while the race releases callbacks that park after the abort sweep.
   * The post-race check catches handler completions that win the cancellation macrotask because promise continuations run as microtasks.
   */
  _guarded(handler, cancelled, label) {
    return async (...args) => {
      const token = this._abortToken;
      if (token.isCancellationRequested) {
        this._logService.info(`[Copilot:${this.sessionId}] Discarding ${label} callback received while aborting`);
        return cancelled;
      }
      const result = await raceCancellation(handler(...args), token, cancelled);
      if (token.isCancellationRequested) {
        this._logService.info(`[Copilot:${this.sessionId}] Discarding ${label} callback result after abort`);
        return cancelled;
      }
      return result;
    };
  }
  _clientToolName(toolName) {
    return this._isToolSearchActive() && toolName === RUNTIME_TOOL_SEARCH_TOOL_NAME ? CLIENT_TOOL_SEARCH_REFERENCE_NAME : toolName;
  }
  _toToolSearchCandidates(availableTools) {
    return (availableTools ?? []).filter((tool) => tool.deferLoading).map((tool) => ({
      name: tool.name,
      description: tool.description ?? ""
    }));
  }
  _emitToolSearchReady(toolCallId, candidates) {
    const tracked = this._activeToolCalls.get(toolCallId);
    if (!tracked) {
      throw new Error(`Tool-search call '${toolCallId}' was not tracked.`);
    }
    this._emitAction({
      type: "chat/toolCallReady" /* ChatToolCallReady */,
      turnId: this._turnId,
      toolCallId,
      ...tracked.contributor ? { contributor: tracked.contributor } : {},
      ...tracked.intention !== void 0 ? { intention: tracked.intention } : {},
      invocationMessage: getInvocationMessage(tracked.toolName, tracked.displayName, tracked.parameters, (path) => this._resolveEditFilePath(path)),
      toolInput: getToolInputString(tracked.toolName, tracked.parameters, tracked.parameters ? tryStringify(tracked.parameters) : void 0),
      confirmed: "not-needed" /* NotNeeded */,
      _meta: toToolCallMeta({ ...tracked.meta ?? {}, toolSearchCandidates: candidates })
    }, tracked.parentToolCallId);
  }
  _toolSearchFailure(message) {
    return { textResultForLlm: message, resultType: "failure", error: message, toolReferences: [] };
  }
  _toToolSearchResult(clientResult, availableTools) {
    const deferred = /* @__PURE__ */ new Map();
    for (const tool of availableTools ?? []) {
      if (tool.deferLoading) {
        deferred.set(tool.name, tool.name);
        if (tool.namespacedName) {
          deferred.set(tool.namespacedName, tool.name);
        }
      }
    }
    const parsedClientNames = this._parseToolSearchNames(clientResult.textResultForLlm);
    const clientNames = parsedClientNames ?? [];
    const toolReferences = [...new Set(clientNames.map((name) => deferred.get(name)).filter(isDefined))];
    this._logService.info(`[Copilot:${this.sessionId}] tool_search override: availableTools=${availableTools?.length ?? 0}, deferred=${deferred.size}, clientMatched=[${clientNames.join(", ")}] -> toolReferences=[${toolReferences.join(", ")}]`);
    return {
      ...clientResult,
      ...clientResult.resultType === "success" && parsedClientNames !== void 0 ? { textResultForLlm: JSON.stringify(toolReferences) } : {},
      toolReferences
    };
  }
  _parseToolSearchNames(text) {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.filter((name) => typeof name === "string") : void 0;
    } catch {
      return void 0;
    }
  }
  /**
   * Builds SDK tool handlers for the agent host's server tools. Each handler
   * executes the tool against this session's state via the
   * {@link IAgentServerToolHost} and returns its textual result. Returns an
   * empty list when no server-tool host is wired (e.g. test / standalone
   * construction).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createServerSdkTools() {
    const host = this._serverToolHost;
    if (!host) {
      return [];
    }
    const sessionUri = parseRequiredSessionUriFromChatUri(this._chatChannelUri.toString());
    return host.getDefinitionsForSession(sessionUri).filter((def) => !this._launchPlan.isEphemeral || def.enabledForEphemeralSessions).map((def) => ({
      name: def.name,
      description: def.description ?? "",
      parameters: def.inputSchema ?? { type: "object", properties: {} },
      defer: "never",
      handler: async (args) => {
        try {
          const text = host.executeTool(this._chatChannelUri.toString(), def.name, args);
          return { textResultForLlm: await text, resultType: "success" };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this._logService.error(error, `[Copilot:${this.sessionId}] Failed in server tool handler: tool=${def.name}`);
          return { textResultForLlm: message, resultType: "failure", error: message };
        }
      }
    }));
  }
  /**
   * Resolves a pending client tool call. If the SDK handler has not yet
   * registered for `toolCallId`, the result is buffered so the handler
   * resolves immediately once it does.
   */
  handleClientToolCallComplete(toolCallId, result) {
    this._approvedDuplicablePermissionSignatures.delete(toolCallId);
    if (!result.success && this._cancelMcpAuthenticationForToolCall(toolCallId)) {
      this._activeToolCalls.delete(toolCallId);
      return;
    }
    const textContent2 = result.content?.filter((c) => c.type === "text" /* Text */).map((c) => c.text).join("\n") ?? "";
    const binaryResults = result.content?.filter((c) => c.type === "embeddedResource" /* EmbeddedResource */).map((c) => ({ data: c.data, mimeType: c.contentType, type: /^image(\/|$)/.test(c.contentType) ? "image" : "resource" }));
    const textResultForLlm = textContent2.trim() ? textContent2 : getEmptyToolResultText(binaryResults);
    if (result.success) {
      this._pendingClientToolCalls.respondOrBuffer(toolCallId, {
        textResultForLlm,
        resultType: "success",
        binaryResultsForLlm: binaryResults?.length ? binaryResults : void 0
      });
    } else {
      this._pendingClientToolCalls.respondOrBuffer(toolCallId, {
        textResultForLlm: textContent2.trim() ? textContent2 : result.error?.message || "Tool call failed",
        resultType: "failure",
        error: result.error?.message,
        binaryResultsForLlm: binaryResults?.length ? binaryResults : void 0
      });
    }
    if (this._pendingPermissions.getMetadata(toolCallId)?.managedApprovalRequired !== true) {
      this.respondToPermissionRequest(toolCallId, true);
    }
  }
  _cancelMcpAuthenticationForToolCall(toolCallId) {
    for (const [requestId, pending] of this._pendingMcpAuthRequests.entries()) {
      const toolCallIndex = pending.toolCalls.findIndex((toolCall) => toolCall.toolCallId === toolCallId);
      if (toolCallIndex === -1) {
        continue;
      }
      pending.toolCalls.splice(toolCallIndex, 1);
      if (pending.toolCalls.length === 0) {
        this._pendingMcpAuthRequests.respond(requestId, { kind: "cancelled" });
      }
      return true;
    }
    return false;
  }
  /**
   * Creates (or resumes) the SDK session via the injected launcher and
   * wires up all event listeners. Must be called exactly once after
   * construction before using the session.
   */
  async initializeSession() {
    await this._customizationEnablementService.initializeSession(this._ownerSessionUri.toString());
    const wrapper = await this._sessionLauncher.launch(this._launchPlan, this._createRuntimeAdapter());
    if (this._store.isDisposed) {
      wrapper.dispose();
      throw new CancellationError();
    }
    this._wrapper = this._register(wrapper);
    this._register(this._customizationEnablementService.onDidChange((event) => {
      if (!event.sessions.includes(this._ownerSessionUri.toString())) {
        return;
      }
      this._markMcpLaunchConfigurationDirty();
      this._reconcileMcpServerEnablement().catch((error) => this._logService.error(error, `[Copilot:${this.sessionId}] Failed to reconcile MCP enablement after customizations changed`));
    }));
    this._subscribeToEvents();
    this._subscribeForLogging();
    this._subscribeForMemoInvalidation();
    this._subscribeForInstructionsCollectedTelemetry();
    this._subscribeToPermissionConfigChanges();
    this._promptCacheState = this._promptCache.read(this.resourceUri);
    if (this._launchPlan.kind === "resume") {
      await this._refreshSessionUsageMetrics();
      if (this._store.isDisposed) {
        throw new CancellationError();
      }
    }
    this._serverToolHost?.advertise(this._storageUri.toString());
  }
  /** Updates the GitHub credentials used by this live SDK session. */
  async updateGitHubCredentials(host, token) {
    return this._wrapper.session.rpc.gitHubAuth.setCredentials({
      credentials: { type: "token", host, token }
    });
  }
  _setPromptCacheState(promptCache) {
    this._promptCacheState = this._promptCache.write(this.resourceUri, promptCache);
  }
  _createRuntimeAdapter() {
    return {
      chatUri: this._chatChannelUri,
      handlePermissionRequest: this._guarded((request) => this._handlePermissionRequest(request), { kind: "reject" }, "permission"),
      handleExitPlanModeRequest: this._guarded((request, invocation) => this._handleExitPlanModeRequest(request, invocation), { approved: false }, "exit-plan-mode"),
      handleUserInputRequest: this._guarded((request, invocation) => this._handleUserInputRequest(request, invocation), { answer: "", wasFreeform: true }, "user-input"),
      handleElicitationRequest: this._guarded((context) => this._handleElicitationRequest(context), { action: "cancel" }, "elicitation"),
      handleMcpAuthRequest: this._guarded((request) => this._handleMcpAuthRequest(request), { kind: "cancelled" }, "mcp-auth"),
      requestUnsandboxedCommandConfirmation: this._guarded((request) => this._requestUnsandboxedCommandConfirmation(request), false, "unsandboxed-command-confirmation"),
      createClientSdkTools: (toolSearchActive) => this._createClientSdkTools(toolSearchActive),
      createServerSdkTools: () => this._createServerSdkTools(),
      handlePreToolUse: (input) => this._handlePreToolUse(input),
      handlePostToolUse: (input) => this._handlePostToolUse(input),
      handleUserPromptSubmitted: () => this.handleUserPromptSubmitted()
    };
  }
  async resolveMcpAuthentication(params) {
    let resolved = false;
    for (const [requestId, pending] of this._pendingMcpAuthRequests.entries()) {
      if (pending.resource.resource !== params.resource || !this._scopesSatisfy(params.scopes, pending.requiredScopes)) {
        continue;
      }
      for (const toolCall of pending.toolCalls) {
        this._emitAction({
          type: "chat/toolCallAuthResolved" /* ChatToolCallAuthResolved */,
          turnId: toolCall.turnId,
          toolCallId: toolCall.toolCallId
        }, toolCall.parentToolCallId);
      }
      resolved = this._pendingMcpAuthRequests.respond(requestId, { kind: "token", accessToken: params.token }) || resolved;
    }
    return resolved;
  }
  async _handleMcpAuthRequest(request) {
    const customizationId2 = this._mcpCustomizations.customizationIdForServer(request.serverName);
    const enablement = getSdkMcpServerEnablement(resolveCustomizationEnablement(
      this._customizationEnablementService,
      this._ownerSessionUri,
      this._hostCustomizations(),
      void 0,
      void 0,
      this._mcpCustomizations.pluginMcpServerSources
    ));
    if (customizationId2 !== void 0 && enablement.get(customizationId2) === false) {
      this._logService.info(`[Copilot:${this.sessionId}] Suppressed authentication request from disabled MCP server '${request.serverName}'`);
      return null;
    }
    if (customizationId2 === void 0 || enablement.get(customizationId2) === void 0) {
      this._logService.trace(`[Copilot:${this.sessionId}] Allowing authentication request from MCP server '${request.serverName}' without resolved enablement`);
    }
    const githubToken = request.reason === "initial" && this._scopesFromChallenge(request.wwwAuthenticateParams?.scope).length === 0 ? await this._initialGitHubMcpToken(request) : void 0;
    if (githubToken) {
      this._logService.info(`[Copilot:${this.sessionId}] Reusing the existing GitHub token for initial GitHub MCP authentication`);
      return { kind: "token", accessToken: githubToken };
    }
    const resource = this._protectedResourceFromMcpAuthRequest(request);
    const requiredScopes = this._scopesFromChallenge(request.wwwAuthenticateParams?.scope);
    const oauthClient = request.staticClientConfig?.publicClient ? { clientId: request.staticClientConfig.clientId } : request.staticClientConfig?.clientSecret ? { clientId: request.staticClientConfig.clientId, clientSecret: request.staticClientConfig.clientSecret } : void 0;
    const auth = {
      reason: this._mcpAuthRequiredReason(request.reason),
      ...oauthClient ? { oauthClient } : {},
      resource,
      requiredScopes: requiredScopes.length ? [...requiredScopes] : void 0,
      description: request.wwwAuthenticateParams?.error
    };
    const toolCalls = this._activeMcpToolCalls(request.serverName);
    const result = this._pendingMcpAuthRequests.register(request.requestId, {
      serverName: request.serverName,
      resource,
      requiredScopes,
      toolCalls
    });
    this._mcpCustomizations.applyOne({
      name: request.serverName,
      state: {
        kind: "authRequired" /* AuthRequired */,
        ...auth
      }
    });
    for (const toolCall of toolCalls) {
      this._emitAction({
        type: "chat/toolCallAuthRequired" /* ChatToolCallAuthRequired */,
        turnId: toolCall.turnId,
        toolCallId: toolCall.toolCallId,
        auth
      }, toolCall.parentToolCallId);
    }
    this._logService.info(`[Copilot:${this.sessionId}] MCP server '${request.serverName}' requires authentication for ${resource.resource}`);
    return result;
  }
  _activeMcpToolCalls(serverName) {
    if (!this._turnId) {
      return [];
    }
    const result = [];
    for (const [toolCallId, toolCall] of this._activeToolCalls) {
      if (toolCall.mcpServerName === serverName) {
        result.push({ turnId: this._turnId, toolCallId, parentToolCallId: toolCall.parentToolCallId });
      }
    }
    return result;
  }
  async _initialGitHubMcpToken(request) {
    const githubToken = this._launchPlan.githubToken;
    const requestUrl = normalizeMcpServerUrl(request.serverUrl);
    if (!githubToken || requestUrl === void 0) {
      return void 0;
    }
    const configuredUrls = [gitHubMcpServerUrl(void 0)];
    try {
      const resolvedUrl = gitHubMcpServerUrl(await this._copilotApiService.resolveApiEndpoint(githubToken));
      if (resolvedUrl) {
        configuredUrls.push(resolvedUrl);
      }
    } catch (error) {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to resolve the GitHub MCP server URL: ${getErrorMessage(error)}`);
      return void 0;
    }
    return configuredUrls.some((u) => u && requestUrl === normalizeMcpServerUrl(u)) ? githubToken : void 0;
  }
  _protectedResourceFromMcpAuthRequest(request) {
    if (request.resourceMetadata) {
      try {
        const parsed = JSON.parse(request.resourceMetadata);
        if (isAuthorizationProtectedResourceMetadata(parsed)) {
          return parsed;
        }
        this._logService.warn(`[Copilot:${this.sessionId}] Ignoring invalid MCP protected-resource metadata for '${request.serverName}'`);
      } catch (err) {
        this._logService.warn(`[Copilot:${this.sessionId}] Failed to parse MCP protected-resource metadata for '${request.serverName}'`, err);
      }
    }
    const scopes = this._scopesFromChallenge(request.wwwAuthenticateParams?.scope);
    return {
      resource: request.serverUrl,
      resource_name: request.serverName,
      scopes_supported: scopes.length ? scopes.slice() : void 0
    };
  }
  _scopesFromChallenge(scope) {
    return scope?.split(/\s+/).map((s) => s.trim()).filter((s) => s.length > 0) ?? [];
  }
  _mcpAuthRequiredReason(reason) {
    switch (reason) {
      case "refresh":
      case "reauth":
        return "expired" /* Expired */;
      case "upscope":
        return "insufficientScope" /* InsufficientScope */;
      case "initial":
      default:
        return "required" /* Required */;
    }
  }
  _scopesSatisfy(provided, required) {
    if (required.length === 0 || provided === void 0) {
      return true;
    }
    const providedSet = new Set(provided);
    return required.every((scope) => providedSet.has(scope));
  }
  _cancelPendingMcpAuthRequests() {
    this._pendingMcpAuthRequests.denyAll({ kind: "cancelled" });
  }
  _cancelPendingMcpAuthRequestsForServer(serverName) {
    for (const [requestId, pending] of this._pendingMcpAuthRequests.entries()) {
      if (pending.serverName !== serverName) {
        continue;
      }
      for (const toolCall of pending.toolCalls) {
        this._emitAction({
          type: "chat/toolCallAuthResolved" /* ChatToolCallAuthResolved */,
          turnId: toolCall.turnId,
          toolCallId: toolCall.toolCallId
        }, toolCall.parentToolCallId);
      }
      this._pendingMcpAuthRequests.respond(requestId, { kind: "cancelled" });
    }
  }
  // ---- session operations -------------------------------------------------
  async send(prompt, attachments, turnId, mode, senderClientId, clientType = "unknown" /* Unknown */, hostInstructions, clientContext = createUnknownAgentHostClientTelemetryContext(clientType)) {
    this._resetAbortToken();
    if (turnId && this._currentTurn.value?.id !== turnId) {
      this.resetTurnState(turnId, senderClientId, clientType, clientContext);
    }
    const currentTurn = this._currentTurn.value;
    if (currentTurn) {
      currentTurn.messageCharLen = prompt.length;
    }
    const turn = this._currentTurn.value;
    this._hostInstructions = hostInstructions;
    this._pendingSnapshotReminder = this._snapshotReadonlyReminder(attachments);
    if (this._tryStartDevelopmentRecoverableError(prompt)) {
      return;
    }
    try {
      await this._send(prompt, attachments, mode);
    } catch (err) {
      if (turn && this._currentTurn.value === turn) {
        this._clearActiveTurn();
      }
      this._hostInstructions = void 0;
      this._pendingSnapshotReminder = void 0;
      throw err;
    }
  }
  handleUserPromptSubmitted() {
    const parts = [
      ...this._hostInstructions ?? [],
      ...this._pendingSnapshotReminder ? [this._pendingSnapshotReminder] : []
    ];
    this._hostInstructions = void 0;
    this._pendingSnapshotReminder = void 0;
    const additionalContext = parts.length > 0 ? parts.join("\n\n") : void 0;
    return additionalContext ? { additionalContext } : void 0;
  }
  /**
   * Build a read-only reminder naming each host-created snapshot attachment
   * (pasted content, unsaved editor, git: diff, …) so the model treats the
   * on-disk copy as read-only context and does not edit it (#331154). Returns
   * `undefined` when no attachment is a snapshot. The read-only signal rides
   * the prompt (as `additionalContext` on the main turn, a `<reminder>` note
   * on steering) rather than the attachment, because the runtime drops a file
   * attachment's `displayName` for text snapshots.
   */
  _snapshotReadonlyReminder(attachments) {
    if (!attachments?.length) {
      return void 0;
    }
    const paths = [];
    for (const attachment of attachments) {
      if (attachment.type !== "resource" /* Resource */ || !isHostSnapshotAttachment(attachment)) {
        continue;
      }
      const uri = URI.parse(attachment.uri);
      paths.push(uri.scheme === "file" ? uri.fsPath : uri.toString());
    }
    if (paths.length === 0) {
      return void 0;
    }
    return "The following attached files are read-only snapshots of content the user shared (pasted text, an unsaved editor, or a diff view) and must not be edited:\n" + paths.map((path) => `- ${path}`).join("\n");
  }
  async _send(prompt, attachments, mode) {
    this._logService.info(`[Copilot:${this.sessionId}] sendMessage called: "${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}" (${attachments?.length ?? 0} attachments)`);
    const abortToken = this._abortToken;
    const slashCommand = parseLeadingSlashCommand(prompt);
    if (slashCommand?.command === "compact") {
      try {
        const result = await this._wrapper.session.rpc.history.compact();
        const usedTokens = result.contextWindow?.currentTokens;
        if (typeof usedTokens === "number") {
          await this._refreshSessionUsageMetrics();
          const copilotUsage = this._parentCopilotUsageMeta();
          const turnTokenTotals = this._currentTurn.value?.tokenTotals;
          const directTurnTokenTotals = this._currentTurn.value?.directUsage.tokenTotals;
          const directNanoAiu = this._currentTurn.value?.directUsage.copilotNanoAiu;
          const meta = {
            ...copilotUsage ? { copilotUsage } : {},
            ...turnTokenTotals ? { turnTokenTotals } : {},
            ...directTurnTokenTotals ? { directTurnTokenTotals } : {},
            ...directNanoAiu !== void 0 ? { directCopilotUsage: { totalNanoAiu: directNanoAiu } } : {}
          };
          this._emitAction({
            type: "chat/usage" /* ChatUsage */,
            turnId: this._turnId,
            usage: {
              inputTokens: usedTokens,
              outputTokens: 0,
              model: this._lastSeenModelId,
              ...Object.keys(meta).length > 0 ? { _meta: meta } : {}
            }
          }, void 0, true);
        }
        this.emitInitialMarkdown(localize(2501, null), true);
      } catch (err) {
        if (getErrorMessage(err).toLowerCase().includes("nothing to compact")) {
          this.emitInitialMarkdown(localize(2501, null), true);
          this._completeActiveTurn(true);
          return;
        }
        this._logService.error(err, `[Copilot:${this.sessionId}] rpc.history.compact failed`);
        throw err;
      }
      this._completeActiveTurn(true);
      return;
    }
    const configAction = slashCommand ? resolveCopilotConfigSlashCommandOnSend(slashCommand.command, slashCommand.rawRest) : void 0;
    if (configAction) {
      const sdkMode = toCopilotSdkMode(configAction.applyConfig["mode" /* Mode */]);
      if (sdkMode) {
        mode = sdkMode;
      }
      prompt = configAction.strippedPrompt;
    } else if (slashCommand) {
      const runtimeSlashCommand = await this._slashCommandProvider.resolveSlashCommand(slashCommand.command);
      if (runtimeSlashCommand && runtimeSlashCommand.kind === "builtin" && runtimeSlashCommand.name === "fleet") {
        await this._startFleet(slashCommand.rest, attachments, mode, abortToken);
        return;
      }
      if (runtimeSlashCommand && runtimeSlashCommand.kind !== "skill") {
        await this.applyMode(mode);
        let result;
        try {
          result = await this._wrapper.session.rpc.commands.invoke({
            name: runtimeSlashCommand.name,
            ...slashCommand.rawRest.length > 0 ? { input: slashCommand.rawRest } : {}
          });
        } catch (err) {
          this._logService.error(err, `[Copilot:${this.sessionId}] rpc.commands.invoke(${slashCommand.command}) failed`);
          throw err;
        }
        switch (result.kind) {
          case "text":
            this._emitMarkdownDelta(result.markdown === true ? result.text : escapeMarkdownSyntaxTokens(result.text), void 0, true);
            break;
          case "completed":
            if (result.message) {
              this._emitMarkdownDelta(result.message, void 0, true);
            }
            break;
          case "agent-prompt": {
            const runtimeMode = toCopilotSdkMode(result.mode);
            if (runtimeMode) {
              mode = runtimeMode;
            }
            prompt = result.prompt;
            break;
          }
          case "select-subcommand":
            this._emitMarkdownDelta(localize(
              2507,
              null,
              result.command,
              result.options.map((option) => option.name).join(", ")
            ), void 0, true);
            break;
          default:
            this._logService.warn(`[Copilot:${this.sessionId}] Unhandled slash command result kind: ${result.kind}`);
            break;
        }
        if (result.runtimeSettingsChanged === true) {
          this._slashCommandProvider.clearCache();
        }
        if (result.kind !== "agent-prompt") {
          this._completeActiveTurn(true);
          return;
        }
      }
    }
    const sdkAttachments = await this._toSdkAttachments(attachments);
    await this._prepareSdkTurn(mode);
    const traceContext = this._otelService.getSessionTraceContext(this.sessionId, this.resourceUri.toString());
    const sendingTurn = this._currentTurn.value;
    sendingTurn?.markProviderCallPending();
    try {
      await this._otelService.withTraceContext(traceContext, () => {
        if (!this._environmentService.isBuilt && prompt === "$error") {
          return this._wrapper.session.rpc.sendMessages({
            messages: [{ prompt }],
            requestHeaders: { Authorization: "******" }
          });
        }
        return this._wrapper.session.send({ prompt, attachments: sdkAttachments?.length ? sdkAttachments : void 0 });
      });
      sendingTurn?.markProviderCallResolved();
    } catch (error) {
      sendingTurn?.markProviderCallRejected();
      throw error;
    }
    this._logService.info(`[Copilot:${this.sessionId}] session.send() returned`);
  }
  async resume(turnId, mode, senderClientId, clientType = "unknown" /* Unknown */, clientContext = createUnknownAgentHostClientTelemetryContext(clientType)) {
    this._resetAbortToken();
    this.resetTurnState(turnId, senderClientId, clientType, clientContext);
    if (this._tryContinueDevelopmentRecoverableError(turnId)) {
      return;
    }
    const turn = this._currentTurn.value;
    this._resumingTurnAwaitingProviderStart = turn;
    turn?.markProviderCallPending();
    try {
      await this._prepareSdkTurn(mode);
      const traceContext = this._otelService.getSessionTraceContext(this.sessionId, this.resourceUri.toString());
      await this._otelService.withTraceContext(traceContext, () => this._wrapper.session.rpc.sendMessages({ messages: [] }));
      turn?.markProviderCallResolved();
      this._logService.info(`[Copilot:${this.sessionId}] zero-message continuation returned`);
    } catch (error) {
      if (this._resumingTurnAwaitingProviderStart === turn) {
        this._resumingTurnAwaitingProviderStart = void 0;
      }
      if (turn && this._currentTurn.value === turn) {
        turn.markProviderCallRejected();
        this._clearActiveTurn();
      }
      throw error;
    }
  }
  _tryStartDevelopmentRecoverableError(prompt) {
    if (!this._developmentErrorInjectionEnabled) {
      return false;
    }
    const match2 = /^\$error-ui(?<tool>-tool)?(?::(?<count>[1-9]))?$/.exec(prompt);
    const turn = this._currentTurn.value;
    if (!match2 || !turn) {
      return false;
    }
    const totalFailures = match2.groups?.count ? Number(match2.groups.count) : 1;
    this._developmentRecoverableError = {
      turnId: turn.id,
      remainingFailures: totalFailures - 1,
      totalFailures
    };
    this._hostInstructions = void 0;
    this._pendingSnapshotReminder = void 0;
    if (match2.groups?.tool) {
      this._emitDevelopmentCompletedToolCall(turn);
    }
    this._emitDevelopmentRecoverableError(turn, 1, totalFailures);
    return true;
  }
  _tryContinueDevelopmentRecoverableError(turnId) {
    const state = this._developmentRecoverableError;
    const turn = this._currentTurn.value;
    if (!state || state.turnId !== turnId || !turn) {
      return false;
    }
    if (state.remainingFailures > 0) {
      const attempt = state.totalFailures - state.remainingFailures + 1;
      state.remainingFailures--;
      this._emitDevelopmentRecoverableError(turn, attempt, state.totalFailures);
      return true;
    }
    this._developmentRecoverableError = void 0;
    this._emitMarkdownDelta(localize(2503, null, state.totalFailures), void 0, true);
    this._completeActiveTurn(true);
    return true;
  }
  _emitDevelopmentRecoverableError(turn, attempt, totalFailures) {
    this._emitAction({
      type: "chat/error" /* ChatError */,
      turnId: turn.id,
      duration: turn.duration,
      part: createErrorResponsePart({
        errorType: "developmentRecoverableError",
        message: localize(2502, null, attempt, totalFailures)
      }, true)
    });
    this._clearActiveTurn();
  }
  _emitDevelopmentCompletedToolCall(turn) {
    const toolCallId = `${turn.id}-development-tool`;
    this._emitAction({
      type: "chat/toolCallStart" /* ChatToolCallStart */,
      turnId: turn.id,
      toolCallId,
      toolName: "view",
      displayName: "Read",
      intention: "Read README.md before the injected failure"
    });
    this._emitAction({
      type: "chat/toolCallReady" /* ChatToolCallReady */,
      turnId: turn.id,
      toolCallId,
      invocationMessage: "Reading README.md",
      toolInput: '{"path":"README.md"}',
      confirmed: "not-needed" /* NotNeeded */
    });
    this._emitAction({
      type: "chat/toolCallComplete" /* ChatToolCallComplete */,
      turnId: turn.id,
      toolCallId,
      result: {
        success: true,
        pastTenseMessage: "Read README.md",
        content: [{ type: "text" /* Text */, text: "Captured tool output before the injected failure." }]
      }
    });
  }
  /**
   * Applies the per-turn SDK configuration shared by every operation that starts
   * an agent loop (normal `session.send` and the `/fleet` start path): agent mode,
   * permission mode, sandbox, and MCP enablement. Mode and sandbox keep their
   * existing best-effort semantics.
   */
  async _prepareSdkTurn(mode) {
    await this.applyMode(mode);
    await this.syncPermissionMode("turn-start");
    await this._applyEffectiveSandboxConfig();
    await this._reconcileMcpServerEnablement();
  }
  /**
   * Temporary `/fleet` compatibility path (issue #8837): starts the SDK's fleet
   * agent loop via the dedicated `rpc.fleet.start` RPC and keeps the AHP turn open
   * until the SDK's terminal `session.idle`, rather than completing it as `commands.invoke`
   * would. Remove once the runtime returns an `agent-prompt` result for `/fleet`.
   */
  async _startFleet(rest, attachments, mode, abortToken) {
    if (attachments?.length) {
      throw new Error(localize(2504, null));
    }
    const startingTurn = this._currentTurn.value;
    await this._prepareSdkTurn(mode);
    if (!startingTurn || this._currentTurn.value !== startingTurn) {
      this._logService.warn(`[Copilot:${this.sessionId}] fleet turn ended during preflight; not starting fleet`);
      return;
    }
    if (abortToken.isCancellationRequested) {
      this._logService.warn(`[Copilot:${this.sessionId}] aborted during fleet preflight; not starting fleet`);
      this.discardActiveTurn();
      return;
    }
    const traceContext = this._otelService.getSessionTraceContext(this.sessionId, this.resourceUri.toString());
    let result;
    startingTurn.markProviderCallPending();
    try {
      result = await this._otelService.withTraceContext(traceContext, () => this._wrapper.session.rpc.fleet.start(rest ? { prompt: rest } : {}));
      startingTurn.markProviderCallResolved();
    } catch (err) {
      startingTurn.markProviderCallRejected();
      if (!startingTurn || this._currentTurn.value !== startingTurn) {
        this._logService.warn(`[Copilot:${this.sessionId}] rpc.fleet.start rejected after its turn already ended`, err);
        return;
      }
      if (abortToken.isCancellationRequested) {
        this._logService.warn(`[Copilot:${this.sessionId}] rpc.fleet.start rejected after abort; discarding turn`, err);
        this.discardActiveTurn();
        return;
      }
      throw err;
    }
    if (!startingTurn || this._currentTurn.value !== startingTurn) {
      if (!result.started) {
        this._logService.warn(`[Copilot:${this.sessionId}] rpc.fleet.start returned started=false after its turn already ended`);
      }
      return;
    }
    if (abortToken.isCancellationRequested) {
      this._logService.warn(`[Copilot:${this.sessionId}] rpc.fleet.start settled after abort; discarding turn`);
      this.discardActiveTurn();
      return;
    }
    if (result.started) {
      startingTurn.markRunning();
      this._logService.info(`[Copilot:${this.sessionId}] rpc.fleet.start succeeded; retaining turn until session idle`);
      return;
    }
    throw new Error(localize(2505, null));
  }
  async _toSdkAttachments(attachments) {
    const sdkAttachments = attachments?.length ? (await Promise.all(attachments.map((attachment) => this._toSdkAttachment(attachment)))).filter(isDefined) : void 0;
    if (sdkAttachments?.length) {
      this._logService.trace(`[Copilot:${this.sessionId}] Attachments: ${JSON.stringify(sdkAttachments.map((attachment) => ({ type: attachment.type })))}`);
    }
    return sdkAttachments;
  }
  async hasRuntimeSlashCommand(command) {
    try {
      return !!await this._slashCommandProvider.resolveSlashCommand(command);
    } catch (err) {
      this._logService.warn(`[Copilot:${this.sessionId}] rpc.commands.list failed`, err);
      return false;
    }
  }
  async getRuntimeSlashCommands(options) {
    try {
      return await this._slashCommandProvider.getSlashCommands(options);
    } catch (err) {
      this._logService.warn(`[Copilot:${this.sessionId}] rpc.commands.list failed`, err);
      return [];
    }
  }
  /**
   * Translate a protocol {@link MessageAttachment} into the Copilot CLI SDK's `attachments` payload shape. Resource
   * attachments map to the SDK's reference-style `file`/`directory`/`selection` variants (the
   * {@link MessageAttachmentBase.displayKind} advisory hint controls which one). Embedded resources (e.g. inline
   * image bytes, or unsaved editor content) map to the SDK's `blob` variant, and simple attachments with a model
   * representation map to `text/plain` blob attachments.
   *
   * Any Resource attachment carrying a {@link TextSelection} (e.g. `displayKind === 'selection'` or `'symbol'`) is
   * mapped to the SDK's `selection` variant so the range survives the round-trip — keying off the `selection` field
   * rather than just `displayKind` avoids symbol attachments degrading to a plain file reference (#315193). For those
   * we read the resource content from disk and slice it by the carried range (the protocol's {@link TextSelection}
   * only carries the range, not the inline text); on read failure the selection downgrades to a plain file reference.
   * A textual embedded resource already carries the exact inline text to send (the whole live buffer for a document,
   * or just the selected text for a selection), so it is forwarded as-is without further slicing.
   */
  async _toSdkAttachment(attachment) {
    if (isAgentFeedbackAnnotationsAttachment(attachment)) {
      const rendered = renderAgentFeedbackAnnotationsAttachment(attachment);
      if (!rendered) {
        return void 0;
      }
      return {
        type: "blob",
        data: encodeBase64(VSBuffer.fromString(rendered)),
        mimeType: addAttachmentDisplayKindToMimeType(attachment.displayKind),
        displayName: attachment.label
      };
    }
    if (attachment.type === "simple" /* Simple */) {
      if (attachment.modelRepresentation) {
        return {
          type: "blob",
          data: encodeBase64(VSBuffer.fromString(attachment.modelRepresentation)),
          mimeType: addSimpleAttachmentDisplayKindToMimeType(attachment),
          displayName: attachment.label
        };
      }
      return void 0;
    }
    if (attachment.type === "embeddedResource" /* EmbeddedResource */) {
      return { type: "blob", data: attachment.data, mimeType: attachment.contentType, displayName: attachment.label };
    }
    if (attachment.type !== "resource" /* Resource */) {
      return void 0;
    }
    const uri = URI.parse(attachment.uri);
    const path = uri.scheme === "file" ? uri.fsPath : uri.toString();
    const displayName = attachment.label ?? path;
    if (attachment.selection) {
      try {
        const text = await this._readSelectedText(uri, attachment.selection.range);
        return { type: "selection", filePath: path, displayName, text, selection: attachment.selection.range };
      } catch (err) {
        this._logService.warn(`[Copilot:${this.sessionId}] Failed to read selected text for ${uri.toString()}: ${err}`);
        return { type: "file", path, displayName };
      }
    }
    if (attachment.displayKind === "selection") {
      return { type: "file", path, displayName };
    }
    const type = attachment.displayKind === "directory" ? "directory" : "file";
    return { type, path, displayName };
  }
  async _readSelectedText(uri, range) {
    const content = await this._fileService.readFile(uri);
    const text = content.value.toString();
    const lines = splitLinesIncludeSeparators(text);
    const start = this._getOffsetAt(lines, range.start);
    const end = this._getOffsetAt(lines, range.end);
    return text.substring(start, Math.max(start, end));
  }
  _getOffsetAt(lines, position) {
    const line = Math.max(0, Math.min(position.line, lines.length - 1));
    let offset = 0;
    for (let i = 0; i < line; i++) {
      offset += lines[i].length;
    }
    const lineText = lines[line].replace(/\r\n|\r|\n$/, "");
    return offset + Math.max(0, Math.min(position.character, lineText.length));
  }
  /**
   * Pushes `mode` to the SDK via `rpc.mode.set` if it differs from the
   * last applied value. Failures are logged and swallowed so that mode
   * propagation does not block the turn.
   */
  async applyMode(mode) {
    if (!mode || mode === this._lastAppliedMode) {
      return;
    }
    try {
      await this._wrapper.session.rpc.mode.set({ mode });
      this._lastAppliedMode = mode;
      this._logService.info(`[Copilot:${this.sessionId}] rpc.mode.set succeeded: mode=${mode}`);
    } catch (err) {
      this._logService.error(err, `[Copilot:${this.sessionId}] rpc.mode.set failed: mode=${mode}`);
    }
  }
  /**
   * `true` when the session's effective `mode` is `autopilot` — the
   * autonomous, continue-until-done mode in which no user is available to
   * answer questions or fill in elicitation forms.
   */
  _isAutopilotMode() {
    return this._configurationService.getEffectiveValue(this._ownerSessionUri.toString(), platformSessionSchema, "mode" /* Mode */) === "autopilot";
  }
  /**
   * Whether VS Code's auto-reply setting is enabled in the root config.
   */
  _isAutoReplyEnabled() {
    return this._configurationService.getRootValue(platformRootSchema, AgentHostAutoReplyEnabledConfigKey) === true;
  }
  async sendSteering(steeringMessage) {
    if (this._steeringMessagesInFlight.has(steeringMessage.id) || this._pendingSteeringFlips.has(steeringMessage.id)) {
      return;
    }
    this._steeringMessagesInFlight.add(steeringMessage.id);
    this._logService.info(`[Copilot:${this.sessionId}] Sending steering message: "${steeringMessage.message.text.substring(0, 100)}"`);
    try {
      await this._reconcileMcpServerEnablement();
      this._pendingSteeringFlips.set(steeringMessage.id, steeringMessage);
      const sdkAttachments = await this._toSdkAttachments(steeringMessage.message.attachments);
      const snapshotReminder = this._snapshotReadonlyReminder(steeringMessage.message.attachments);
      const steeringPrompt = snapshotReminder ? `${steeringMessage.message.text}

<reminder>
${snapshotReminder}
</reminder>` : steeringMessage.message.text;
      await this._wrapper.session.send({
        prompt: steeringPrompt,
        attachments: sdkAttachments?.length ? sdkAttachments : void 0,
        mode: "immediate"
      });
    } catch (err) {
      this._pendingSteeringFlips.delete(steeringMessage.id);
      this._logService.error(`[Copilot:${this.sessionId}] Steering message failed`, err);
    } finally {
      this._steeringMessagesInFlight.delete(steeringMessage.id);
    }
  }
  async getMessages() {
    const result = await this._getMappedEvents();
    return result.turns;
  }
  async getSubagentMessages(parentToolCallId) {
    const result = await this._getMappedEvents();
    const turns = result.subagentTurnsByToolCallId.get(parentToolCallId) ?? [];
    return turns;
  }
  _getMappedEvents() {
    if (!this._mappedEventsMemo) {
      const pending = this._computeMappedEvents();
      this._mappedEventsMemo = pending;
      pending.catch(() => {
        if (this._mappedEventsMemo === pending) {
          this._mappedEventsMemo = void 0;
        }
      });
    }
    return this._mappedEventsMemo;
  }
  async _computeMappedEvents() {
    this._logService.trace(`[Copilot:${this.sessionId}] Reading persisted session events`);
    const events = await this._wrapper.session.getEvents();
    this._logService.trace(`[Copilot:${this.sessionId}] Read ${events.length} persisted event(s); reconstructing turns`);
    let db;
    try {
      db = this._databaseRef.object;
    } catch {
    }
    const result = await mapSessionEvents(this._storageUri, db, events, this._chatChannelUri, {
      workingDirectory: this._workingDirectory,
      model: this._launchPlan.kind === "create" ? this._launchPlan.model : this._launchPlan.fallback.model,
      ...this._detectInterruptedTurnOnRestore ? {
        interruptedTurnError: {
          errorType: "executionInterrupted",
          message: localize(2506, null)
        }
      } : {}
    });
    this._logService.trace(`[Copilot:${this.sessionId}] Reconstructed ${result.turns.length} turn(s) from ${events.length} event(s)`);
    return result;
  }
  /** Drop the memoized event reconstruction; the next read rebuilds it. */
  _invalidateMappedEvents() {
    this._mappedEventsMemo = void 0;
  }
  async abort() {
    this._logService.info(`[Copilot:${this.sessionId}] Aborting session...`);
    const abortingTurn = this._currentTurn.value;
    const resumingTurn = this._resumingTurnAwaitingProviderStart;
    if (abortingTurn) {
      this._dropLateRootTurnEvents = true;
    }
    this._beginAbort();
    this._drainPendingSteeringFlips();
    try {
      await this._wrapper.session.abort();
    } catch (error) {
      this._resetAbortToken();
      throw error;
    }
    if (resumingTurn && this._resumingTurnAwaitingProviderStart === resumingTurn && this._currentTurn.value === resumingTurn && !resumingTurn.providerTurnStarted) {
      resumingTurn.markAborted();
      this._clearActiveTurn();
    }
  }
  /**
   * Aborts before tearing down so that in-flight {@link _guarded} callbacks
   * settle rather than hang: disposing the {@link _abortCts} would drop each
   * racing `onCancellationRequested` listener without ever firing it, leaving
   * a callback that parks its deferred after the teardown sweep with nothing
   * left to resolve it. The sweep registered in the constructor stays as the
   * backstop, since {@link _beginAbort} no-ops when already aborted.
   */
  dispose() {
    void this._editTracker.flushAttribution().catch((error) => {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to flush edit attribution: ${error}`);
    });
    this._beginAbort();
    super.dispose();
  }
  /**
   * Explicitly destroys the underlying SDK session and waits for cleanup
   * to complete. Call this before {@link dispose} when you need to ensure
   * the session's on-disk data is no longer locked (e.g. before
   * truncation or fork operations that modify the session files).
   */
  async destroySession() {
    try {
      await this._editTracker.flushAttribution();
    } catch (error) {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to flush edit attribution: ${error}`);
    }
    await this._wrapper.disconnect();
  }
  async setModel(model, reasoningEffort, contextTier) {
    this._logService.info(`[Copilot:${this.sessionId}] Changing model to: ${model}`);
    this._lastSeenModelId = model;
    await this._wrapper.session.setModel(model, { reasoningEffort, contextTier });
  }
  /**
   * Dispatches an MCP JSON-RPC method received on the `mcp://` side
   * channel to the Copilot SDK's `session.rpc.mcp.*` surface.
   *
   * Mapping:
   *  - `tools/list` → `rpc.mcp.apps.listTools`
   *  - `tools/call` → `rpc.mcp.apps.callTool`
   *  - `resources/read` → `rpc.mcp.apps.readResource`
   *  - `resources/list` → `rpc.mcp.apps.listResources` (empty list fallback)
   *  - `resources/templates/list` → `rpc.mcp.apps.listResourceTemplates` (empty list fallback)
   *  - `sampling/createMessage` → `rpc.mcp.executeSampling`
   *
   * Other MCP methods are rejected with `Method not found` (the caller
   * translates that into a JSON-RPC `-32601`).
   */
  async handleMcpRequest(serverName, method, params) {
    const apps = this._wrapper.session.rpc.mcp.apps;
    switch (method) {
      case "tools/list":
        return apps.listTools({ serverName, originServerName: serverName });
      case "tools/call": {
        const name = params && typeof params["name"] === "string" ? params["name"] : void 0;
        if (!name) {
          throw new Error(`tools/call missing 'name' parameter`);
        }
        const rawArgs = params ? params["arguments"] : void 0;
        const args = isObject(rawArgs) ? rawArgs : void 0;
        return apps.callTool({ serverName, toolName: name, arguments: args, originServerName: serverName });
      }
      case "resources/read": {
        const uri = params && typeof params["uri"] === "string" ? params["uri"] : void 0;
        if (!uri) {
          throw new Error(`resources/read missing 'uri' parameter`);
        }
        return apps.readResource({ serverName, uri });
      }
      case "resources/list": {
        return { resources: [] };
      }
      case "resources/templates/list": {
        return { resourceTemplates: [] };
      }
      case "sampling/createMessage":
        return this._handleSamplingCreateMessage(serverName, params);
      default:
        throw new Error(`Method not found: ${method}`);
    }
  }
  async startMcpServer(id2) {
    const serverName = this._mcpCustomizations.serverNameForCustomizationId(id2);
    if (!serverName) {
      this._logService.warn(`[Copilot:${this.sessionId}] Cannot start unknown MCP server customization ${id2}`);
      return;
    }
    return this._mcpServerLifecycleSequencer.queue(serverName, async () => {
      try {
        await this._wrapper.session.rpc.mcp.startServer({ serverName });
      } finally {
        this._seedMcpServersFromRpc();
      }
    });
  }
  _reconcileMcpServerEnablement() {
    return this._mcpEnablementSequencer.queue(() => this._doReconcileMcpServerEnablement());
  }
  async _doReconcileMcpServerEnablement() {
    this._markMcpLaunchConfigurationDirty();
    const desiredEnablement = this._getDesiredMcpServerEnablementByName();
    if (desiredEnablement.size === 0) {
      return;
    }
    await this._refreshMcpServersFromRpc();
    let changed = false;
    for (const server of this._mcpCustomizations.serverEnablement()) {
      const desired = desiredEnablement.get(server.serverName);
      if (desired === void 0 || desired === server.enabled) {
        continue;
      }
      try {
        if (desired) {
          if (this._mcpLaunchConfigurationDirty && this._projectedMcpServerLaunchEnablement.has(server.serverName)) {
            continue;
          }
          changed = true;
          await this._wrapper.session.rpc.mcp.enable({ serverName: server.serverName });
        } else {
          await this._disableMcpServer(server.serverName);
          changed = true;
        }
      } catch (e) {
        this._logService.error(e, `[Copilot:${this.sessionId}] Failed to ${desired ? "enable" : "disable"} MCP server ${server.serverName}`);
      }
    }
    if (changed) {
      await this._refreshMcpServersFromRpc();
    }
  }
  _getDesiredMcpServerEnablementByName() {
    const resolved = resolveCustomizationEnablement(
      this._customizationEnablementService,
      this._ownerSessionUri,
      this._hostCustomizations(),
      void 0,
      void 0,
      this._mcpCustomizations.pluginMcpServerSources
    );
    const enabledById = getSdkMcpServerEnablement(resolved);
    const candidates = /* @__PURE__ */ new Map();
    const result = /* @__PURE__ */ new Map();
    for (const customization of resolved.customizations) {
      const servers = customization.type === "mcpServer" /* McpServer */ ? [customization] : (customization.children ?? []).filter((child) => child.type === "mcpServer" /* McpServer */);
      for (const server of servers) {
        const owningPluginSource = this._mcpCustomizations.pluginMcpServerSources?.get(server.name);
        const source = customization.type === "plugin" /* Plugin */ ? customization.uri : owningPluginSource;
        const applied = source === void 0 || this._appliedPluginSources.has(URI.parse(source).toString());
        let namedCandidates = candidates.get(server.name);
        if (!namedCandidates) {
          namedCandidates = [];
          candidates.set(server.name, namedCandidates);
        }
        namedCandidates.push({ server, applied });
      }
    }
    for (const [name, namedCandidates] of candidates) {
      const applicable = namedCandidates.some((candidate) => candidate.applied) ? namedCandidates.filter((candidate) => candidate.applied) : namedCandidates;
      for (const candidate of applicable) {
        const enabled = enabledById.get(candidate.server.id) ?? false;
        result.set(name, (result.get(name) ?? true) && enabled);
      }
    }
    for (const name of this._launchPlan.disabledRootMcpServers ?? []) {
      result.set(name, false);
    }
    return result;
  }
  _markMcpLaunchConfigurationDirty() {
    if (this._mcpLaunchConfigurationDirty || this._projectedMcpServerLaunchEnablement.size === 0) {
      return;
    }
    const desiredEnablement = this._getDesiredMcpServerEnablementByName();
    for (const [serverName, launchEnabled] of this._projectedMcpServerLaunchEnablement) {
      const desired = desiredEnablement.get(serverName);
      if (launchEnabled !== void 0 && desired !== void 0 && desired !== launchEnabled) {
        this._mcpLaunchConfigurationDirty = true;
        return;
      }
    }
  }
  async _disableMcpServer(serverName) {
    this._cancelPendingMcpAuthRequestsForServer(serverName);
    await this._wrapper.session.rpc.mcp.disable({ serverName });
  }
  async stopMcpServer(id2) {
    const serverName = this._mcpCustomizations.serverNameForCustomizationId(id2);
    if (!serverName) {
      this._logService.warn(`[Copilot:${this.sessionId}] Cannot stop unknown MCP server customization ${id2}`);
      return;
    }
    return this._mcpServerLifecycleSequencer.queue(serverName, async () => {
      await this._wrapper.session.rpc.mcp.stopServer({ serverName });
      this._mcpCustomizations.applyOne({ name: serverName, state: { kind: "stopped" /* Stopped */ } });
    });
  }
  /**
   * Forwards an App→host `sampling/createMessage` request received
   * over the AHP `mcp://` channel to `rpc.mcp.executeSampling`. The
   * Copilot runtime owns the MCP→chat-completion conversion and the
   * sampling response shape, so we pass the raw MCP params through
   * untouched and return the SDK's result directly.
   *
   * Resolves the JSON-RPC request with the `CreateMessageResult` on
   * success and rejects on failure/cancellation, mirroring the
   * `sampling/createMessage` MCP contract.
   */
  async _handleSamplingCreateMessage(serverName, params) {
    if (!params) {
      throw new Error(`sampling/createMessage missing params`);
    }
    const requestId = generateUuid();
    const mcpRequestId = generateUuid();
    this._pendingMcpSamplings.add(requestId);
    try {
      const result = await this._wrapper.session.rpc.mcp.executeSampling({
        requestId,
        serverName,
        mcpRequestId,
        request: params
      });
      if (result.action === "success") {
        return result.result ?? null;
      }
      throw new Error(`sampling/createMessage ${result.action}${result.error ? `: ${result.error}` : ""}`);
    } finally {
      this._pendingMcpSamplings.delete(requestId);
    }
  }
  /**
   * Selects (or clears) a custom agent on the live SDK session.
   * Mirrors the SDK's `rpc.agent.select` / `rpc.agent.deselect` pair.
   */
  async setAgent(agentName) {
    if (agentName) {
      const name = agentName;
      this._logService.info(`[Copilot:${this.sessionId}] Selecting custom agent: ${name}`);
      try {
        await this._wrapper.session.rpc.agent.select({ name });
      } catch (err) {
        this._logService.error(err, `[Copilot:${this.sessionId}] rpc.agent.select failed: name=${name}`);
        throw err;
      }
    } else {
      this._logService.info(`[Copilot:${this.sessionId}] Clearing custom agent selection`);
      try {
        await this._wrapper.session.rpc.agent.deselect();
      } catch (err) {
        this._logService.error(err, `[Copilot:${this.sessionId}] rpc.agent.deselect failed`);
        throw err;
      }
    }
  }
  // ---- permission handling ------------------------------------------------
  /**
   * Handles a permission request from the SDK by firing a `tool_ready` event
   * (which transitions the tool to PendingConfirmation) and waiting for the
   * side-effects layer to respond via {@link respondToPermissionRequest}.
   */
  async _handlePermissionRequest(request) {
    try {
      const toolCallId = request.toolCallId;
      if (!toolCallId) {
        this._logService.warn(`[Copilot:${this.sessionId}] Permission request without toolCallId, auto-denying: kind=${request.kind}`);
        return { kind: "reject" };
      }
      if (this._unroutableSubagentToolCallIds.delete(toolCallId)) {
        this._logService.error(`[Copilot:${this.sessionId}] Rejecting permission request for unroutable subagent tool call: toolCallId=${toolCallId}, kind=${request.kind}`);
        return { kind: "reject" };
      }
      const managedApprovalRequired = request.managedApprovalRequired === true;
      const requestSandboxBypass = request.kind === "shell" || request.kind === "write" || request.kind === "read" || request.kind === "url" ? request.requestSandboxBypass : void 0;
      const autoApproval = !managedApprovalRequired && this._lastAppliedPermissionMode === "auto" ? await this._takeAutoApproval(toolCallId) : void 0;
      const recommendation = autoApproval?.recommendation;
      if (recommendation === "approve" && !requestSandboxBypass) {
        if (request.kind === "custom-tool" && typeof request.toolName === "string" && this._clientToolNames.has(this._clientToolName(request.toolName))) {
          const trackedToolCall2 = this._activeToolCalls.get(toolCallId);
          const displayName = trackedToolCall2?.displayName ?? getToolDisplayName(request.toolName);
          const parameters = trackedToolCall2?.parameters;
          const parentToolCallId2 = trackedToolCall2?.parentToolCallId;
          this._onDidSessionProgress.fire({
            kind: "pending_confirmation",
            chat: this._chatChannelUri,
            state: {
              status: "pending-confirmation" /* PendingConfirmation */,
              toolCallId,
              toolName: request.toolName,
              displayName,
              invocationMessage: getInvocationMessage(request.toolName, displayName, parameters, (path) => this._resolveEditFilePath(path)),
              toolInput: getToolInputString(request.toolName, parameters, tryStringify(parameters)),
              riskAssessment: autoApproval?.reason ? {
                kind: "judge" /* Judge */,
                status: "complete" /* Complete */,
                reason: autoApproval.reason,
                safety: 1
              } : void 0
            },
            parentToolCallId: parentToolCallId2
          });
        }
        return { kind: "approve-once" };
      }
      const approvedSignature = this._approvedDuplicablePermissionSignatures.get(toolCallId);
      if (approvedSignature !== void 0) {
        this._approvedDuplicablePermissionSignatures.delete(toolCallId);
        if (!managedApprovalRequired && (request.kind === "write" || request.kind === "read") && safeStringify(request) === approvedSignature) {
          this._logService.info(`[Copilot:${this.sessionId}] Auto-approving duplicate ${request.kind} permission request for tool call ${toolCallId}`);
          return { kind: "approve-once" };
        }
      }
      const sessionResourcePath = this._getInternalSessionResourcePath(request);
      if (!managedApprovalRequired && sessionResourcePath) {
        this._logService.info(`[Copilot:${this.sessionId}] Auto-approving internal session resource ${sessionResourcePath}`);
        return { kind: "approve-once" };
      }
      if (!managedApprovalRequired && request.kind === "read" && typeof request.path === "string") {
        if (isCopilotSdkToolOutputTempFile(request.path, this._environmentService.tmpDir.fsPath)) {
          this._logService.info(`[Copilot:${this.sessionId}] Auto-approving Copilot SDK tool-output temp file ${request.path}`);
          return { kind: "approve-once" };
        }
      }
      const serverToolHost = this._serverToolHost;
      const serverToolName = request.kind === "custom-tool" && typeof request.toolName === "string" && serverToolHost?.toolNames.includes(request.toolName) ? request.toolName : void 0;
      if (serverToolHost && serverToolName) {
        const canRequireConfirmation = serverToolHost.canRequireConfirmation(serverToolName);
        if (canRequireConfirmation && !serverToolHost.requiresConfirmation(this._chatChannelUri.toString(), serverToolName)) {
          this._logService.info(`[Copilot:${this.sessionId}] Auto-approving server tool ${serverToolName} because it has nothing to confirm`);
          return { kind: "approve-once" };
        }
        if (!canRequireConfirmation && !managedApprovalRequired) {
          this._logService.info(`[Copilot:${this.sessionId}] Auto-approving server tool ${serverToolName}`);
          return { kind: "approve-once" };
        }
      }
      const customShellToolName = request.kind === "custom-tool" && typeof request.toolName === "string" && isShellTool(request.toolName) ? request.toolName : void 0;
      const isShellRequest = request.kind === "shell" || customShellToolName !== void 0;
      const trackedToolName = this._activeToolCalls.get(toolCallId)?.toolName;
      const shellToolName = request.kind === "shell" ? trackedToolName : customShellToolName;
      const shellLanguage = isShellRequest && (shellToolName === "bash" || shellToolName === "powershell") ? shellToolName : void 0;
      if (isShellRequest && shellLanguage === void 0) {
        this._logService.warn(`[Copilot:${this.sessionId}] Shell permission request has no recognized shell tool name; requiring confirmation: toolCallId=${toolCallId}, toolName=${shellToolName ?? "(missing)"}`);
      }
      if (!managedApprovalRequired && request.kind === "custom-tool" && typeof request.toolName === "string" && this._clientToolNames.has(this._clientToolName(request.toolName)) && this._pendingClientToolCalls.hasBufferedResult(toolCallId)) {
        this._logService.info(`[Copilot:${this.sessionId}] Auto-approving client tool ${request.toolName} because its result arrived before the permission request`);
        return { kind: "approve-once" };
      }
      this._logService.info(`[Copilot:${this.sessionId}] Requesting confirmation for tool call: ${toolCallId}`);
      const pendingPermission = this._pendingPermissions.register(toolCallId, { managedApprovalRequired });
      if (!managedApprovalRequired && !this._launchPlan.hasScopedEditSurface && isShellRequest && !requestSandboxBypass && await this._isShellSandboxedByDefault()) {
        if (this._pendingPermissions.has(toolCallId)) {
          this._pendingPermissions.respond(toolCallId, { kind: "approve-once" });
          this._logService.info(`[Copilot:${this.sessionId}] Auto-approving sandboxed shell command for tool call ${toolCallId}`);
          return { kind: "approve-once" };
        }
        return { kind: "reject" };
      }
      const edits = await this._buildEditsForPermission(request, toolCallId);
      if (!this._pendingPermissions.has(toolCallId)) {
        return { kind: "reject" };
      }
      const isNewFile = edits?.items.some((edit) => !edit.before && !!edit.after);
      const { confirmationTitle, invocationMessage, toolInput, permissionKind, permissionPath } = getPermissionDisplay(request, this._workingDirectory, isNewFile);
      const toolName = request.kind === "mcp" || request.kind === "custom-tool" || request.kind === "hook" ? request.toolName ?? request.kind : request.kind;
      const trackedToolCall = this._activeToolCalls.get(toolCallId);
      const parentToolCallId = trackedToolCall?.parentToolCallId;
      this._onDidSessionProgress.fire({
        kind: "pending_confirmation",
        chat: this._chatChannelUri,
        state: {
          status: "pending-confirmation" /* PendingConfirmation */,
          toolCallId,
          toolName,
          displayName: getToolDisplayName(toolName),
          contributor: trackedToolCall?.contributor,
          intention: trackedToolCall?.intention,
          invocationMessage,
          toolInput,
          confirmationTitle,
          riskAssessment: autoApproval?.reason ? {
            kind: "judge" /* Judge */,
            status: "complete" /* Complete */,
            reason: autoApproval.reason,
            safety: recommendation === "approve" ? 1 : 0
          } : void 0,
          edits
        },
        permissionKind,
        permissionPath,
        managedApprovalRequired,
        requestSandboxBypass,
        shellLanguage,
        parentToolCallId
      });
      const result = await pendingPermission;
      this._logService.info(`[Copilot:${this.sessionId}] Permission response: toolCallId=${toolCallId}, result=${result.kind}`);
      if (!managedApprovalRequired && result.kind === "approve-once" && (request.kind === "write" || request.kind === "read")) {
        this._approvedDuplicablePermissionSignatures.set(toolCallId, safeStringify(request));
      }
      return result;
    } catch (error) {
      this._logService.error(error, `[Copilot:${this.sessionId}] Failed to handle permission request: kind=${request.kind}, toolCallId=${request.toolCallId ?? "missing"}`);
      throw error;
    }
  }
  _getInternalSessionResourcePath(request) {
    let permissionPath;
    if (request.kind === "read") {
      permissionPath = typeof request.path === "string" ? request.path : void 0;
    } else if (request.kind === "write") {
      permissionPath = typeof request.fileName === "string" ? request.fileName : void 0;
    }
    if (!permissionPath) {
      return void 0;
    }
    const sessionStateDir = normalizePath(URI.file(getCopilotCLISessionStateDir(this._environmentService.userHome.fsPath)));
    const sessionDir = normalizePath(URI.joinPath(sessionStateDir, this.sessionId));
    if (!extUriBiasedIgnorePathCase.isEqualOrParent(sessionDir, sessionStateDir)) {
      return void 0;
    }
    const permissionUri = normalizePath(URI.file(permissionPath));
    return extUriBiasedIgnorePathCase.isEqualOrParent(permissionUri, sessionDir) ? permissionPath : void 0;
  }
  /**
   * Returns true when shell commands run inside a sandbox by default — either
   * through the AgentHost's own {@link TerminalSandboxEngine} (when the custom
   * terminal tool is enabled) or through the SDK's built-in shell tool wrapped
   * by the `sandboxConfig` we pushed via `session.options.update`.
   *
   * Callers use this to auto-approve shell permission prompts that the sandbox
   * already contains. Commands that explicitly opt out of the sandbox
   * (`requestSandboxBypass`) are excluded by the caller, since the
   * sandbox no longer contains them.
   *
   * Returns false when neither sandbox path is configured, so the standard
   * confirmation flow is preserved.
   */
  async _isShellSandboxedByDefault() {
    if (this._isCustomTerminalToolEnabled()) {
      if (!this._shellManager) {
        return false;
      }
      return this._shellManager.getOrCreateSandboxEngine().isEnabled();
    }
    return this._computeSdkSandboxConfig() !== void 0;
  }
  /**
   * `true` when the AgentHost's own shell tools (wrapped by
   * {@link TerminalSandboxEngine}) replace the SDK's built-in shell. In that
   * mode the SDK sandbox config is unused, so we neither forward nor toggle it.
   */
  _isCustomTerminalToolEnabled() {
    return this._configurationService.getRootValue(copilotCliConfigSchema, "enableCustomTerminalTool" /* EnableCustomTerminalTool */) === true;
  }
  /**
   * The SDK-shaped sandbox policy for this session, mirroring
   * {@link CopilotSessionLauncher}'s computation: `undefined` when the custom
   * terminal tool is enabled (the host's own terminal sandbox engine handles
   * containment) or when the host sandbox config evaluates to disabled
   * (including on Windows, where the sandbox is not supported).
   */
  _computeSdkSandboxConfig() {
    if (this._isCustomTerminalToolEnabled()) {
      return void 0;
    }
    const sandbox = this._configurationService.getRootValue(sandboxConfigSchema, "sandbox" /* Sandbox */);
    return buildSandboxConfigForSdk(this._platform, sandbox);
  }
  /**
   * `true` when the session runs with bypass approvals — either the global
   * auto-approve setting or the session's `autoApprove` ("Allow All")
   * level. Agent mode is an orthogonal axis and does not affect approvals.
   */
  _isBypassApprovals() {
    if (this._configurationService.getRootValue(platformRootSchema, AgentHostGlobalAutoApproveEnabledConfigKey) === true) {
      return true;
    }
    return this._configurationService.getEffectiveValue(this._ownerSessionUri.toString(), platformSessionSchema, "autoApprove" /* AutoApprove */) === "autoApprove";
  }
  _getSdkPermissionMode() {
    if (this._isBypassApprovals()) {
      return "on";
    }
    return this._getConfiguredApprovalLevel() === "assisted" ? "auto" : "off";
  }
  _getConfiguredApprovalLevel() {
    return this._configurationService.getEffectiveValue(this._ownerSessionUri.toString(), platformSessionSchema, "autoApprove" /* AutoApprove */) ?? "default";
  }
  _getConfiguredAgentMode() {
    return this._configurationService.getEffectiveValue(this._ownerSessionUri.toString(), platformSessionSchema, "mode" /* Mode */) ?? "interactive";
  }
  _subscribeToPermissionConfigChanges() {
    this._register(this._configurationService.onDidRootConfigChange(() => {
      void this._syncPermissionModeAfterConfigChange();
    }));
    this._register(this._configurationService.onDidSessionConfigChange((event) => {
      if (event.session === this._ownerSessionUri.toString() && Object.hasOwn(event.config, "autoApprove" /* AutoApprove */)) {
        void this._syncPermissionModeAfterConfigChange();
      }
    }));
  }
  async _syncPermissionModeAfterConfigChange() {
    if (!this.hasActiveTurn) {
      return;
    }
    try {
      await this.syncPermissionMode("config-change");
      await this._applyEffectiveSandboxConfig(true);
    } catch (error) {
      this._logService.error(error, `[Copilot:${this.sessionId}] Failed to apply permission config change; aborting active turn`);
      try {
        await this.abort();
      } catch (abortError) {
        this._logService.error(abortError, `[Copilot:${this.sessionId}] Failed to abort after permission config sync failure`);
      }
    }
  }
  async _takeAutoApproval(toolCallId) {
    if (this._autoApprovals.has(toolCallId)) {
      const autoApproval = this._autoApprovals.get(toolCallId) ?? void 0;
      this._autoApprovals.delete(toolCallId);
      return autoApproval;
    }
    return this._pendingAutoApprovals.register(toolCallId);
  }
  _recordAutoApproval(toolCallId, autoApproval) {
    if (this._pendingAutoApprovals.respond(toolCallId, autoApproval)) {
      return;
    }
    this._autoApprovals.set(toolCallId, autoApproval ?? null);
  }
  syncPermissionMode(source) {
    return this._permissionModeSequencer.queue(async () => {
      const mode = this._getSdkPermissionMode();
      const configuredLevel = this._getConfiguredApprovalLevel();
      this._logService.info(`[Copilot:${this.sessionId}] Syncing permission mode: source=${source}, agentMode=${this._getConfiguredAgentMode()}, configuredLevel=${configuredLevel}, sdkMode=${mode}, previousSdkMode=${this._lastAppliedPermissionMode ?? "unknown"}, globalAutoApprove=${this._configurationService.getRootValue(platformRootSchema, AgentHostGlobalAutoApproveEnabledConfigKey) === true}`);
      const experimentalModeEnabled = mode === "auto";
      if (this._autoApprovalExperimentalModeEnabled !== experimentalModeEnabled) {
        const experimentalResult = await this._wrapper.session.rpc.options.update({ isExperimentalMode: experimentalModeEnabled });
        if (!experimentalResult.success) {
          throw new Error(`Copilot SDK rejected experimental mode update required by permission mode '${mode}'`);
        }
        this._autoApprovalExperimentalModeEnabled = experimentalModeEnabled;
        this._logService.info(`[Copilot:${this.sessionId}] ${experimentalModeEnabled ? "Enabled" : "Disabled"} SDK experimental mode for permission mode '${mode}'`);
      }
      if (this._lastAppliedPermissionMode === mode) {
        return;
      }
      const result = await this._wrapper.session.rpc.permissions.setAllowAll({ mode });
      if (!result.success || result.mode !== void 0 && result.mode !== mode) {
        throw new Error(`Copilot SDK rejected permission mode '${mode}'`);
      }
      this._lastAppliedPermissionMode = mode;
    });
  }
  /**
   * Apply the SDK sandbox policy for the request that is about to be sent.
   *
   * Skips the SDK sandbox entirely when the custom terminal tool is enabled
   * (the host's own terminal sandbox engine handles containment and the SDK's
   * built-in shell is unused). Otherwise it always pushes the effective state.
   */
  async _applyEffectiveSandboxConfig(failOnError = false) {
    if (this._isCustomTerminalToolEnabled()) {
      return;
    }
    const sandbox = this._configurationService.getRootValue(sandboxConfigSchema, "sandbox" /* Sandbox */);
    const base = buildSandboxConfigForSdk(this._platform, sandbox);
    const sandboxConfig = base ?? { enabled: false };
    try {
      const result = await this._wrapper.session.rpc.options.update({ sandboxConfig });
      if (!result.success) {
        throw new Error("Copilot SDK rejected sandbox config update");
      }
    } catch (err) {
      if (failOnError) {
        throw err;
      }
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to update sandbox config for request`, err);
    }
  }
  /**
   * Builds an {@link FileEdit} preview for a write permission request.
   *
   * The `before` side references the existing file on disk directly (if it
   * exists); the `after` side is written to the `pending-edit-content:`
   * in-memory filesystem so the client can fetch it via `resourceRead`.
   *
   * Returns `undefined` for permission kinds that don't describe file
   * edits or when the request is missing the fields needed to build a
   * preview. If the permission request is no longer pending by the time
   * the in-memory write completes (e.g. the session was aborted), the
   * just-written entry is deleted so it cannot leak.
   */
  async _buildEditsForPermission(request, toolCallId) {
    if (request.kind !== "write") {
      return void 0;
    }
    const filePath = typeof request.fileName === "string" ? request.fileName : void 0;
    const newFileContents = typeof request.newFileContents === "string" ? request.newFileContents : void 0;
    if (!filePath || newFileContents === void 0) {
      return void 0;
    }
    const fileUri = URI.file(filePath);
    const fileUriStr = fileUri.toString();
    let beforeExists = false;
    try {
      beforeExists = await this._fileService.exists(fileUri);
    } catch (err) {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to check file for edit preview: ${filePath}`, err);
    }
    const afterUri = buildPendingEditContentUri(this._storageUri.toString(), toolCallId, filePath);
    try {
      await this._fileService.writeFile(afterUri, VSBuffer.fromString(newFileContents));
    } catch (err) {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to write pending edit content for ${filePath}`, err);
      return void 0;
    }
    if (!this._pendingPermissions.has(toolCallId)) {
      this._fileService.del(afterUri).catch((err) => {
        this._logService.warn(`[Copilot:${this.sessionId}] Failed to delete orphaned pending edit content: ${afterUri.toString()}`, err);
      });
      return void 0;
    }
    this._pendingEditContentUris.set(toolCallId, afterUri);
    const diffCounts = typeof request.diff === "string" ? countUnifiedDiffLines(request.diff) : void 0;
    const edit = {
      ...beforeExists ? { before: { uri: fileUriStr, content: { uri: fileUriStr } } } : {},
      after: { uri: fileUriStr, content: { uri: afterUri.toString() } },
      ...diffCounts ? { diff: diffCounts } : {}
    };
    return { items: [edit] };
  }
  respondToPermissionRequest(requestId, approved) {
    if (this._pendingPermissions.respond(requestId, approved ? { kind: "approve-once" } : USER_DENIED_PERMISSION_RESULT)) {
      this._deletePendingEditContent(requestId);
      return true;
    }
    return false;
  }
  async _requestUnsandboxedCommandConfirmation(request) {
    const pendingPermission = this._pendingPermissions.register(request.toolCallId, { managedApprovalRequired: false });
    const displayName = getToolDisplayName(request.toolName);
    const blockedDomains = request.blockedDomains?.length ? request.blockedDomains.join(", ") : void 0;
    const confirmationTitle = blockedDomains ? localize(2499, null, blockedDomains) : localize(2500, null);
    const invocationMessage = request.reason ? localize(2498, null, request.reason) : blockedDomains ? localize(2496, null, blockedDomains) : localize(2497, null);
    const parentToolCallId = this._activeToolCalls.get(request.toolCallId)?.parentToolCallId;
    this._onDidSessionProgress.fire({
      kind: "pending_confirmation",
      chat: this._chatChannelUri,
      state: {
        status: "pending-confirmation" /* PendingConfirmation */,
        toolCallId: request.toolCallId,
        toolName: request.toolName,
        displayName,
        invocationMessage,
        toolInput: request.command,
        confirmationTitle
      },
      // Intentionally omit `permissionKind: 'shell'`: that would route this
      // through the shell rule-based auto-approver and silently approve
      // common safe commands (`pwd`, `ls`, etc.) without prompting.
      // Mirrors the workbench's sandbox-aware analyzer, which forces
      // `isAutoApproveAllowed: false` whenever `requiresUnsandboxConfirmation`
      // is set.
      parentToolCallId
    });
    return (await pendingPermission).kind === "approve-once";
  }
  // ---- user input handling ------------------------------------------------
  /**
   * Handles a user input request from the SDK (ask_user tool). Auto-answers when the user is unavailable; otherwise waits for the renderer to respond via {@link respondToUserInputRequest}.
   */
  async _handleUserInputRequest(request, _invocation) {
    const requestId = generateUuid();
    const questionId = generateUuid();
    const inputRequest = {
      id: requestId,
      questions: [
        request.choices && request.choices.length > 0 ? {
          kind: "single-select" /* SingleSelect */,
          id: questionId,
          message: request.question,
          required: true,
          options: request.choices.map((c) => ({ id: c, label: c })),
          allowFreeformInput: request.allowFreeform ?? true
        } : {
          kind: "text" /* Text */,
          id: questionId,
          message: request.question,
          required: true
        }
      ]
    };
    const isAutopilot = this._isAutopilotMode();
    if (isAutopilot || this._isAutoReplyEnabled()) {
      this._emitAction({
        type: "chat/inputRequested" /* ChatInputRequested */,
        request: inputRequest
      });
      this._emitAction({
        type: "chat/inputCompleted" /* ChatInputCompleted */,
        requestId,
        response: "accept" /* Accept */,
        answers: {
          [questionId]: {
            state: "submitted" /* Submitted */,
            value: {
              kind: "text" /* Text */,
              value: AgentHostAutoReplyAnswer
            }
          }
        }
      });
      return {
        answer: AgentHostAutoReplyAnswer,
        wasFreeform: true
      };
    }
    if (!this.hasActiveTurn) {
      this._logService.warn(`[Copilot:${this.sessionId}] Rejecting user input request without an active turn`);
      return { answer: "No active turn", wasFreeform: true };
    }
    const questionPreview = request.question.substring(0, 100);
    try {
      this._logService.info(`[Copilot:${this.sessionId}] User input request: requestId=${requestId}, question="${questionPreview}"`);
      const pendingInput = this._pendingUserInputs.register(requestId, { questionId });
      this._emitAction({
        type: "chat/inputRequested" /* ChatInputRequested */,
        request: withChatInputRequestPurpose(inputRequest, "askUser" /* AskUser */)
      });
      const result = await pendingInput;
      this._logService.info(`[Copilot:${this.sessionId}] User input response: requestId=${requestId}, response=${result.response}`);
      if (result.response !== "accept" /* Accept */ || !result.answers) {
        return { answer: "", wasFreeform: true };
      }
      const answer = result.answers[questionId];
      if (!answer || answer.state === "skipped" /* Skipped */) {
        return { answer: "", wasFreeform: true };
      }
      const { value: val } = answer;
      if (val.kind === "text" /* Text */) {
        return { answer: val.value, wasFreeform: true };
      } else if (val.kind === "selected" /* Selected */) {
        const wasFreeform = !request.choices?.includes(val.value);
        return { answer: val.value, wasFreeform };
      }
      return { answer: "", wasFreeform: true };
    } catch (error) {
      this._logService.error(error, `[Copilot:${this.sessionId}] Failed to handle user input request: question="${questionPreview}"`);
      throw error;
    }
  }
  /**
   * Handles an elicitation request from the SDK (MCP server / tool prompt)
   * by firing a `session/inputRequested` action and waiting for the
   * renderer to respond via {@link respondToUserInputRequest}.
   *
   * - `form` mode requests are projected from the SDK's
   *   {@link ElicitationSchema} into a list of
   *   {@link ChatInputQuestion}s.
   * - `url` mode requests surface as a question-less input request whose
   *   {@link ChatInputRequest.url} drives the renderer's "open URL"
   *   affordance.
   *
   * Under autopilot the request is auto-cancelled — there is no user
   * available to fill in a form, and accepting with empty content would
   * be misleading to the MCP server.
   */
  async _handleElicitationRequest(context) {
    const isAutopilot = this._isAutopilotMode();
    if (isAutopilot) {
      return { action: "cancel" };
    }
    if (!this.hasActiveTurn) {
      this._logService.warn(`[Copilot:${this.sessionId}] Rejecting elicitation request without an active turn`);
      return { action: "decline" };
    }
    const messagePreview = context.message.substring(0, 100);
    try {
      const requestId = generateUuid();
      this._logService.info(`[Copilot:${this.sessionId}] Elicitation request: requestId=${requestId}, mode=${context.mode ?? "form"}, source=${context.elicitationSource ?? "<unknown>"}, message="${messagePreview}"`);
      const schema = context.mode === "url" ? void 0 : context.requestedSchema;
      const requiredSet = new Set(schema?.required ?? []);
      const questions = schema ? Object.entries(schema.properties).map(([fieldName, field]) => elicitationFieldToQuestion(fieldName, field, requiredSet.has(fieldName))) : void 0;
      const pendingElicitation = this._pendingElicitations.register(requestId, { schema });
      const inputRequest = withChatInputRequestPurpose({
        id: requestId,
        message: context.message,
        ...context.mode === "url" && context.url ? { url: context.url } : {},
        ...questions && questions.length > 0 ? { questions } : {}
      }, "elicitation" /* Elicitation */);
      this._emitAction({
        type: "chat/inputRequested" /* ChatInputRequested */,
        request: inputRequest
      });
      const result = await pendingElicitation;
      this._logService.info(`[Copilot:${this.sessionId}] Elicitation response: requestId=${requestId}, response=${result.response}`);
      if (result.response === "decline" /* Decline */) {
        return { action: "decline" };
      }
      if (result.response !== "accept" /* Accept */) {
        return { action: "cancel" };
      }
      const answers = result.answers ?? {};
      if (!schema) {
        const freeform = answers.answer;
        if (freeform && freeform.state !== "skipped" /* Skipped */ && freeform.value.kind === "text" /* Text */) {
          return { action: "accept", content: { answer: freeform.value.value } };
        }
        return { action: "accept" };
      }
      const content = {};
      for (const [fieldName, field] of Object.entries(schema.properties)) {
        const value = elicitationAnswerToFieldValue(field, answers[fieldName]);
        if (value !== void 0) {
          content[fieldName] = value;
        }
      }
      return { action: "accept", content };
    } catch (error) {
      this._logService.error(error, `[Copilot:${this.sessionId}] Failed to handle elicitation request: message="${messagePreview}"`);
      throw error;
    }
  }
  respondToUserInputRequest(requestId, response, answers) {
    const pendingPlanReview = this._pendingPlanReviews.getMetadata(requestId);
    if (pendingPlanReview) {
      return this._pendingPlanReviews.respond(requestId, this._resolveExitPlanMode(pendingPlanReview, response, answers));
    }
    if (this._pendingElicitations.respond(requestId, { response, answers })) {
      return true;
    }
    if (this._pendingUserInputs.respond(requestId, { response, answers })) {
      return true;
    }
    return false;
  }
  /**
   * Maps an `exit_plan_mode` input response back to an
   * {@link CopilotExitPlanModeResponse} that the CLI can feed into
   * `session.respondToExitPlanMode`. Mapping rules:
   *
   *  - Decline / Cancel / no answer → `{ approved: false }` (model gets a
   *    rejection result and stays in plan mode).
   *  - Accept + freeform feedback → `{ approved: false, feedback, selectedAction? }`
   *    (the SDK treats this as a revision request and re-emits
   *    `exit_plan_mode.requested` after revising the plan).
   *  - Accept + selected option → `{ approved: true, selectedAction, autoApproveEdits }`
   *    where `autoApproveEdits` is set for the autopilot variants.
   *
   * `selectedAction` is validated against the SDK's offered `actions`; an
   * unknown value is treated as a decline so the SDK isn't fed a value it
   * cannot handle.
   */
  _resolveExitPlanMode(pending, response, answers) {
    if (response !== "accept" /* Accept */) {
      return { approved: false };
    }
    const answer = answers?.[pending.questionId];
    if (!answer || answer.state === "skipped" /* Skipped */) {
      return { approved: false };
    }
    const value = answer.value;
    let candidateAction;
    let feedback;
    if (value.kind === "selected" /* Selected */) {
      candidateAction = value.value;
      const freeform = value.freeformValues?.find((s) => s.trim().length > 0)?.trim();
      feedback = freeform;
    } else if (value.kind === "text" /* Text */) {
      feedback = value.value.trim() || void 0;
    } else {
      return { approved: false };
    }
    const selectedAction = candidateAction && pending.actions.includes(candidateAction) ? candidateAction : pending.actions.includes(pending.recommendedAction) ? pending.recommendedAction : void 0;
    if (feedback) {
      return {
        approved: false,
        feedback,
        ...selectedAction ? { selectedAction } : {}
      };
    }
    if (!selectedAction) {
      return { approved: false };
    }
    this._syncAhpModeFromExitPlanAction(selectedAction);
    const isAutopilot = selectedAction === "autopilot" || selectedAction === "autopilot_fleet";
    return {
      approved: true,
      selectedAction,
      ...isAutopilot && this._isBypassApprovals() ? { autoApproveEdits: true } : {}
    };
  }
  /**
   * Translates an approved `exit_plan_mode` action into the AHP `mode` axis
   * and writes it so the mode picker reflects the choice immediately:
   *
   *  - `autopilot` / `autopilot_fleet` → `mode='autopilot'`.
   *  - `interactive` → `mode='interactive'`.
   *  - `exit_only` (approve plan without executing) leaves the mode untouched.
   */
  _syncAhpModeFromExitPlanAction(selectedAction) {
    switch (selectedAction) {
      case "autopilot":
      case "autopilot_fleet":
        this._syncAhpConfigFromSdkMode("autopilot");
        break;
      case "interactive":
        this._syncAhpConfigFromSdkMode("interactive");
        break;
    }
  }
  async _handlePreToolUse(input) {
    try {
      if (isEditTool(input.toolName, getToolCommand(input))) {
        const filePaths = this._getEditFilePaths(input.toolArgs);
        const mode = this._getConfiguredAgentMode();
        await Promise.all(filePaths.map((p) => this._editTracker.trackEditStart(p, mode)));
      }
    } catch (error) {
      this._logService.error(error, `[Copilot:${this.sessionId}] Failed in onPreToolUse: tool=${input.toolName}`);
      throw error;
    }
  }
  async _handlePostToolUse(input) {
    try {
      if (isEditTool(input.toolName, getToolCommand(input))) {
        const filePaths = this._getEditFilePaths(input.toolArgs);
        await Promise.all(filePaths.map((p) => this._editTracker.completeEdit(p)));
      }
    } catch (error) {
      this._logService.error(error, `[Copilot:${this.sessionId}] Failed in onPostToolUse: tool=${input.toolName}`);
      throw error;
    }
  }
  async _beginRepoInfoTelemetry(telemetryMessageId, clientType, isCurrent) {
    let resolved;
    try {
      resolved = await this._resolveRepoInfoTelemetryContext();
    } catch (error) {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to resolve repository info telemetry context: ${getErrorMessage(error)}`);
      return void 0;
    }
    if (!resolved || this._store.isDisposed || !isCurrent()) {
      return void 0;
    }
    await this._repoInfoTelemetry.reportBegin(resolved.context, this.resourceUri.toString(), telemetryMessageId, clientType, this._workingDirectory, resolved.baseBranch, isCurrent, (paths) => this._wrapper.session.rpc.contentExclusion.checkPaths({ paths: [...paths] }));
    return resolved;
  }
  async _endRepoInfoTelemetry(telemetryMessageId, resolved, isCurrent) {
    if (!resolved || this._store.isDisposed || !isCurrent()) {
      return;
    }
    await this._repoInfoTelemetry.reportEnd(resolved.context, this.resourceUri.toString(), telemetryMessageId, this._workingDirectory, resolved.baseBranch, isCurrent, (paths) => this._wrapper.session.rpc.contentExclusion.checkPaths({ paths: [...paths] }));
  }
  _completeActiveRepoInfoTelemetry() {
    const turn = this._activeRepoInfoTurn;
    if (!turn) {
      return;
    }
    this._activeRepoInfoTurn = void 0;
    const isCurrent = () => !turn.cancelled && this._isLaunchTokenCurrent();
    void turn.begin.then((resolved) => this._endRepoInfoTelemetry(turn.telemetryMessageId, resolved, isCurrent));
  }
  _cancelActiveRepoInfoTelemetry() {
    const turn = this._activeRepoInfoTurn;
    if (!turn) {
      return;
    }
    this._activeRepoInfoTurn = void 0;
    turn.cancelled = true;
    void turn.begin.finally(() => this._repoInfoTelemetry.clearTurn(turn.telemetryMessageId));
  }
  async _resolveRepoInfoTelemetryContext() {
    if (this._configurationService.getRootValue(platformRootSchema, AgentHostDisableRepoInfoTelemetryConfigKey) === true) {
      return void 0;
    }
    const githubToken = this._launchPlan.githubToken;
    if (!githubToken) {
      return void 0;
    }
    const [rawContext, baseBranch] = await Promise.all([
      this._copilotApiService.resolveRestrictedTelemetryContext(githubToken),
      this._databaseRef.object.getMetadata(META_DIFF_BASE_BRANCH)
    ]);
    if (!rawContext.restrictedTelemetryEnabled && !rawContext.isInternal) {
      return void 0;
    }
    return { context: this._toRepoInfoTelemetryContext(rawContext), baseBranch };
  }
  _isLaunchTokenCurrent() {
    return this._launchPlan.githubToken !== void 0 && this._isLaunchTokenStillCurrent();
  }
  _toRepoInfoTelemetryContext(context) {
    return {
      restrictedTelemetryEnabled: context.restrictedTelemetryEnabled,
      trackingId: context.trackingId,
      telemetryEndpoint: context.telemetryEndpoint ? `${context.telemetryEndpoint.replace(/\/+$/, "")}/telemetry` : void 0,
      isInternal: context.isInternal === true,
      userName: context.userName,
      isVscodeTeamMember: context.isVscodeTeamMember === true,
      copilotIgnoreEnabled: context.copilotIgnoreEnabled
    };
  }
  // ---- event wiring -------------------------------------------------------
  _subscribeToEvents() {
    const wrapper = this._wrapper;
    const sessionId = this.sessionId;
    this._register(wrapper.onSystemNotification((e) => {
      const notification = buildCopilotSystemNotification(e);
      if (!notification) {
        this._logService.trace(`[Copilot:${sessionId}] Ignoring system.notification kind=${e.data.kind.type}`);
        return;
      }
      this._logService.info(`[Copilot:${sessionId}] System notification received: kind=${e.data.kind.type}`);
      if (this._turnId) {
        this._emitAction({
          type: "chat/responsePart" /* ChatResponsePart */,
          turnId: this._turnId,
          part: {
            kind: "systemNotification" /* SystemNotification */,
            content: notification.messageText
          }
        });
        return;
      }
      if (!notification.startsTurn) {
        this._logService.trace(`[Copilot:${sessionId}] Ignoring passive system.notification kind=${e.data.kind.type} without an active turn`);
        return;
      }
      this._dropLateRootTurnEvents = false;
      const turnId = generateUuid();
      this.resetTurnState(turnId);
      this._emitAction({
        type: "chat/turnStarted" /* ChatTurnStarted */,
        turnId,
        startedAt: (/* @__PURE__ */ new Date()).toISOString(),
        message: {
          text: notification.messageText,
          origin: { kind: "systemNotification" /* SystemNotification */ }
        }
      });
    }));
    this._register(wrapper.onUserMessage((e) => {
      if (e.agentId) {
        this._resumeSubagentForEvent(e, { text: e.data.content, origin: { kind: "user" /* User */ } });
        return;
      }
      if (e.data.source && e.data.source.toLowerCase() !== "user") {
        return;
      }
      this._dropLateRootTurnEvents = false;
      this._currentTurn.value?.markRunning();
      const steering = this._takeMatchingPendingSteering(e.data.content);
      if (steering) {
        this._beginSteeringTurn(steering);
      }
      if (this._turnId) {
        this._databaseRef.object.setTurnEventId(this._turnId, e.id);
        this._currentTurn.value?.completeEventId(e.id);
      }
    }));
    this._register(wrapper.onMessageDelta((e) => {
      this._logService.trace(`[Copilot:${sessionId}] delta: ${e.data.deltaContent}`);
      this._resumeSubagentForEvent(e);
      if (this._shouldDropUnmappedSubagentEvent(e, "assistant.message_delta")) {
        return;
      }
      this._emitMarkdownDelta(e.data.deltaContent, this._parentToolCallIdForSubagentEvent(e));
    }));
    this._register(wrapper.onMessage((e) => {
      this._logService.info(`[Copilot:${sessionId}] Full message received: ${e.data.content.length} chars`);
      this._resumeSubagentForEvent(e);
      if (!e.agentId && this._shouldDropLateRootTurnEvent("assistant.message")) {
        return;
      }
      const stableModelCallId = e.data.apiCallId ?? e.data.clientRequestId;
      const isCompleteModelCall = stableModelCallId !== void 0 || e.data.chunkCount === void 0 || e.data.chunkCount <= 1 || e.data.chunkIndex === e.data.chunkCount - 1;
      const modelCallId = stableModelCallId ?? e.data.messageId;
      const parentToolCallId = this._parentToolCallIdForSubagentEvent(e);
      if (isCompleteModelCall && (!e.agentId || parentToolCallId)) {
        this._emitModelCallCompleted(this._turnId, modelCallId, parentToolCallId);
      }
      if (!e.agentId) {
        const clientType = this._currentTurn.value?.clientType ?? "unknown" /* Unknown */;
        void this._telemetryReporter.assistantMessageReceived(this.resourceUri.toString(), clientType, e.data.clientRequestId, this._appliedSnapshot.tools).catch((err) => this._logService.trace(`[Copilot:${this.sessionId}] Telemetry emission failed: ${getErrorMessage(err)}`));
        void this._telemetryReporter.modelMessageText(this.resourceUri.toString(), clientType, e.data.content, this._turnOrdinal, e.data.clientRequestId).catch((err) => this._logService.trace(`[Copilot:${this.sessionId}] Telemetry emission failed: ${getErrorMessage(err)}`));
        const turn = this._currentTurn.value;
        if (turn) {
          if (isCompleteModelCall && !turn.mainModelCallIds.has(modelCallId)) {
            turn.mainModelCallIds.add(modelCallId);
            turn.toolCallRounds++;
          }
          if (e.data.model) {
            turn.lastModel = e.data.model;
          }
          const toolRequests = e.data.toolRequests;
          if (toolRequests?.length) {
            turn.totalToolCalls += toolRequests.length;
            if (toolRequests.length > 1) {
              turn.parallelToolCallRounds++;
              turn.parallelToolCallsTotal += toolRequests.length;
            }
            for (const req of toolRequests) {
              turn.toolCounts.set(req.name, (turn.toolCounts.get(req.name) ?? 0) + 1);
            }
          }
        }
      }
      if (this._shouldDropUnmappedSubagentEvent(e, "assistant.message")) {
        return;
      }
      const markdownScope = parentToolCallId ?? "";
      if (e.data.content && !this._currentTurn.value?.markdownPartIds.has(markdownScope)) {
        const partId = generateUuid();
        this._currentTurn.value?.markdownPartIds.set(markdownScope, partId);
        this._emitAction({
          type: "chat/responsePart" /* ChatResponsePart */,
          turnId: this._turnId,
          part: { kind: "markdown" /* Markdown */, id: partId, content: e.data.content }
        }, parentToolCallId);
      }
      if (e.data.toolRequests?.length) {
        this._beginToolCallRound(parentToolCallId);
      }
    }));
    this._register(wrapper.onPermissionRequested((e) => {
      const toolCallId = e.data.permissionRequest.toolCallId;
      if (!toolCallId) {
        return;
      }
      this._recordAutoApproval(toolCallId, e.data.promptRequest?.autoApproval);
      const existing = this._toolApprovalRecords.get(toolCallId);
      const permissionRequest = e.data.permissionRequest;
      this._toolApprovalRecords.set(toolCallId, {
        permissionRequested: true,
        resolvedByHook: existing?.resolvedByHook || e.data.resolvedByHook === true,
        requestSandboxBypass: existing?.requestSandboxBypass || permissionRequest.requestSandboxBypass === true,
        resultKind: existing?.resultKind,
        toolName: existing?.toolName ?? permissionRequest.toolName,
        mcpServerName: existing?.mcpServerName,
        reported: existing?.reported ?? false
      });
    }));
    this._register(wrapper.onPermissionCompleted((e) => {
      const toolCallId = e.data.toolCallId;
      if (!toolCallId) {
        return;
      }
      const existing = this._toolApprovalRecords.get(toolCallId);
      const record = {
        permissionRequested: existing?.permissionRequested ?? true,
        resolvedByHook: existing?.resolvedByHook ?? false,
        requestSandboxBypass: existing?.requestSandboxBypass ?? false,
        resultKind: e.data.result.kind,
        toolName: existing?.toolName,
        mcpServerName: existing?.mcpServerName,
        reported: existing?.reported ?? false
      };
      this._toolApprovalRecords.set(toolCallId, record);
      this._reportToolApproval(toolCallId, record.toolName, record.mcpServerName);
      if (isPermissionDeniedKind(record.resultKind)) {
        this._toolApprovalRecords.delete(toolCallId);
      }
    }));
    this._register(wrapper.onToolCallDelta((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Tool call delta: ${e.data.toolName ?? "<pending>"} (${e.data.toolCallId})`);
      this._resumeSubagentForEvent(e);
      if (!e.agentId && this._shouldDropLateRootTurnEvent("assistant.tool_call_delta")) {
        return;
      }
      if (this._shouldDropUnmappedSubagentEvent(e, "assistant.tool_call_delta")) {
        return;
      }
      const existing = this._streamingToolCalls.get(e.data.toolCallId);
      const streaming = existing ?? {
        input: "",
        toolName: void 0,
        parentToolCallId: void 0,
        started: false,
        displayedInputLength: 0,
        displayedMessage: void 0
      };
      streaming.input += e.data.inputDelta;
      if (e.data.toolName) {
        if (streaming.toolName && streaming.toolName !== e.data.toolName) {
          this._logService.warn(`[Copilot:${sessionId}] Tool call ${e.data.toolCallId} changed name while streaming from ${streaming.toolName} to ${e.data.toolName}`);
        } else {
          streaming.toolName = e.data.toolName;
        }
      }
      this._streamingToolCalls.set(e.data.toolCallId, streaming);
      const toolName = streaming.toolName;
      if (!toolName || isHiddenTool(toolName) || isTaskCompleteTool(toolName) || this._clientToolNames.has(this._clientToolName(toolName))) {
        return;
      }
      if (!streaming.started) {
        streaming.parentToolCallId = this._parentToolCallIdForSubagentEvent(e);
      }
      if (!streaming.started) {
        streaming.started = true;
        this._emitAction({
          type: "chat/toolCallStart" /* ChatToolCallStart */,
          turnId: this._turnId,
          toolCallId: e.data.toolCallId,
          toolName,
          displayName: getToolDisplayName(toolName),
          contributor: this._getToolCallContributor(toolName, void 0),
          _meta: toToolCallMeta(this._createToolCallMeta(toolName, void 0))
        }, streaming.parentToolCallId);
        this._emitStreamingToolCallDisplay(e.data.toolCallId, streaming);
        return;
      }
      this._scheduleStreamingToolCallDisplay(e.data.toolCallId);
    }));
    this._register(wrapper.onToolStart((e) => {
      if (!e.agentId && this._shouldDropLateRootTurnEvent("tool.execution_start")) {
        return;
      }
      if (isHiddenTool(e.data.toolName)) {
        this._streamingToolDisplaySchedulers.deleteAndDispose(e.data.toolCallId);
        this._streamingToolCalls.delete(e.data.toolCallId);
        this._logService.trace(`[Copilot:${sessionId}] Tool started (hidden): ${e.data.toolName}`);
        return;
      }
      this._logService.info(`[Copilot:${sessionId}] Tool started: ${e.data.toolName}`);
      let toolArgs = e.data.arguments !== void 0 ? tryStringify(e.data.arguments) : void 0;
      let parameters;
      if (toolArgs) {
        try {
          parameters = JSON.parse(toolArgs);
        } catch {
        }
      }
      if (stripRedundantCdPrefix(e.data.toolName, parameters, this._workingDirectory)) {
        toolArgs = tryStringify(parameters);
      }
      const displayName = getToolDisplayName(e.data.toolName);
      const streamed = this._streamingToolCalls.get(e.data.toolCallId);
      this._streamingToolDisplaySchedulers.deleteAndDispose(e.data.toolCallId);
      if (streamed?.started && streamed.displayedInputLength < streamed.input.length) {
        this._emitStreamingToolCallDisplay(e.data.toolCallId, streamed);
      }
      this._streamingToolCalls.delete(e.data.toolCallId);
      if (streamed?.toolName && streamed.toolName !== e.data.toolName) {
        this._logService.warn(`[Copilot:${sessionId}] Tool call ${e.data.toolCallId} started as ${e.data.toolName} after streaming as ${streamed.toolName}`);
      }
      this._resumeSubagentForEvent(e);
      if (!streamed?.started && this._shouldDropUnmappedSubagentEvent(e, "tool.execution_start")) {
        this._unroutableSubagentToolCallIds.add(e.data.toolCallId);
        return;
      }
      const parentToolCallId = streamed?.parentToolCallId ?? this._parentToolCallIdForSubagentEvent(e);
      const clientToolName = this._clientToolName(e.data.toolName);
      const isClientTool = this._clientToolNames.has(clientToolName);
      const isToolSearch = this._isToolSearchActive() && e.data.toolName === RUNTIME_TOOL_SEARCH_TOOL_NAME;
      const contributor = this._getToolCallContributor(e.data.toolName, e.data.mcpServerName);
      const intention = getShellIntention(e.data.toolName, parameters);
      this._activeToolCalls.set(e.data.toolCallId, {
        toolName: e.data.toolName,
        displayName,
        parameters,
        content: [],
        parentToolCallId,
        mcpServerName: e.data.mcpServerName,
        contributor,
        intention,
        meta: void 0
      });
      const existingApproval = this._toolApprovalRecords.get(e.data.toolCallId);
      const approvalRecord = {
        permissionRequested: existingApproval?.permissionRequested ?? false,
        resolvedByHook: existingApproval?.resolvedByHook ?? false,
        requestSandboxBypass: existingApproval?.requestSandboxBypass ?? false,
        resultKind: existingApproval?.resultKind,
        toolName: e.data.toolName,
        mcpServerName: e.data.mcpServerName,
        reported: existingApproval?.reported ?? false
      };
      this._toolApprovalRecords.set(e.data.toolCallId, approvalRecord);
      if (approvalRecord.resultKind !== void 0) {
        this._reportToolApproval(e.data.toolCallId, e.data.toolName, e.data.mcpServerName);
      }
      if (isShellTool(e.data.toolName)) {
        this._nonPtyShellTerminals.track(e.data.toolCallId, displayName);
      }
      if (isTaskCompleteTool(e.data.toolName)) {
        this._beginToolCallRound(parentToolCallId);
        return;
      }
      if (!streamed?.started) {
        this._beginToolCallRound(parentToolCallId);
      }
      const meta = this._createToolCallMeta(e.data.toolName, parameters);
      if (e.data.mcpServerName) {
        meta.mcpServerName = e.data.mcpServerName;
      }
      if (e.data.mcpToolName) {
        meta.mcpToolName = e.data.mcpToolName;
      }
      const resourceUri = e.data.toolDescription?._meta?.ui?.resourceUri;
      this._setToolCallUiMeta(meta, resourceUri, e.data.mcpServerName);
      const tracked = this._activeToolCalls.get(e.data.toolCallId);
      if (tracked) {
        tracked.meta = meta;
      }
      if (!streamed?.started) {
        this._emitAction({
          type: "chat/toolCallStart" /* ChatToolCallStart */,
          turnId: this._turnId,
          toolCallId: e.data.toolCallId,
          toolName: e.data.toolName,
          displayName,
          intention,
          contributor,
          _meta: toToolCallMeta(meta)
        }, parentToolCallId);
      }
      if (isClientTool && !contributor) {
        this._logService.warn(`[Copilot:${sessionId}] Client tool '${e.data.toolName}' started with no connected client; failing it immediately.`);
        this._reportToolApprovalIfNoPermission(e.data.toolCallId);
        this._toolApprovalRecords.delete(e.data.toolCallId);
        this._activeToolCalls.delete(e.data.toolCallId);
        this._emitAction({
          type: "chat/toolCallReady" /* ChatToolCallReady */,
          turnId: this._turnId,
          toolCallId: e.data.toolCallId,
          ...contributor ? { contributor } : {},
          ...intention !== void 0 ? { intention } : {},
          invocationMessage: getInvocationMessage(e.data.toolName, displayName, parameters, (path) => this._resolveEditFilePath(path)),
          toolInput: getToolInputString(e.data.toolName, parameters, toolArgs),
          confirmed: "not-needed" /* NotNeeded */,
          _meta: toToolCallMeta(meta)
        }, parentToolCallId);
        this._emitAction({
          type: "chat/toolCallComplete" /* ChatToolCallComplete */,
          turnId: this._turnId,
          toolCallId: e.data.toolCallId,
          result: {
            success: false,
            pastTenseMessage: `${displayName} failed`,
            error: { message: `No client was connected to run ${displayName}` }
          }
        }, parentToolCallId);
        this._pendingClientToolCalls.respondOrBuffer(e.data.toolCallId, {
          textResultForLlm: `No client was connected to run ${displayName}.`,
          resultType: "failure",
          error: "No client connected"
        });
        return;
      }
      const clientToolAutoApproved = contributor?.kind === "client" /* Client */ && this._lastAppliedPermissionMode === "on";
      if (isToolSearch && clientToolAutoApproved) {
        meta.autoApproveBySetting = true;
      }
      const sdkPolicy = getClientToolSdkPolicy(e.data.toolName);
      const shouldWaitForClientToolReady = contributor?.kind === "client" /* Client */ && !isAgentCoordinationTool(e.data.toolName) && (isToolSearch || !sdkPolicy.skipPermission && !clientToolAutoApproved);
      if (shouldWaitForClientToolReady) {
        return;
      }
      this._emitAction({
        type: "chat/toolCallReady" /* ChatToolCallReady */,
        turnId: this._turnId,
        toolCallId: e.data.toolCallId,
        ...contributor ? { contributor } : {},
        ...intention !== void 0 ? { intention } : {},
        invocationMessage: getInvocationMessage(e.data.toolName, displayName, parameters, (path) => this._resolveEditFilePath(path)),
        toolInput: getToolInputString(e.data.toolName, parameters, toolArgs),
        confirmed: "not-needed" /* NotNeeded */,
        _meta: toToolCallMeta(clientToolAutoApproved ? { ...meta, autoApproveBySetting: true } : meta)
      }, parentToolCallId);
    }));
    this._register(wrapper.onToolComplete(async (e) => {
      this._approvedDuplicablePermissionSignatures.delete(e.data.toolCallId);
      const tracked = this._activeToolCalls.get(e.data.toolCallId);
      if (!tracked) {
        this._unroutableSubagentToolCallIds.delete(e.data.toolCallId);
        return;
      }
      const parentToolCallId = tracked.parentToolCallId ?? this._parentToolCallIdForSubagentEvent(e);
      if (!parentToolCallId && e.agentId) {
        this._logService.warn(`[Copilot:${this.sessionId}] Dropping tool.execution_complete for unknown subagent agentId=${e.agentId}`);
        return;
      }
      if (e.data.success && tracked.contributor === void 0) {
        const telemetrySession = parentToolCallId ? URI.parse(buildSubagentSessionUri(this._storageUri.toString(), parentToolCallId)) : this.resourceUri;
        reportCopilotTodoStoreOperation(this._telemetryService, telemetrySession, e.data.toolCallId, tracked.toolName, tracked.parameters, this._currentTurn.value?.clientContext);
      }
      this._logService.info(`[Copilot:${sessionId}] Tool completed: ${e.data.toolCallId}`);
      this._reportToolApprovalIfNoPermission(e.data.toolCallId);
      this._activeToolCalls.delete(e.data.toolCallId);
      this._autoApprovals.delete(e.data.toolCallId);
      this._toolApprovalRecords.delete(e.data.toolCallId);
      this._pendingAutoApprovals.respond(e.data.toolCallId, void 0);
      if (!parentToolCallId && !e.agentId && this._shouldDropLateRootTurnEvent("tool.execution_complete")) {
        return;
      }
      const displayName = tracked.displayName;
      const toolOutput = e.data.error?.message ?? e.data.result?.content;
      if (isTaskCompleteTool(tracked.toolName)) {
        const summary = getTaskCompleteMarkdown(tracked.parameters, toolOutput);
        if (summary) {
          this._emitAction({
            type: "chat/responsePart" /* ChatResponsePart */,
            turnId: this._turnId,
            part: { kind: "markdown" /* Markdown */, id: generateUuid(), content: summary }
          });
        }
        return;
      }
      const content = [...tracked.content];
      if (toolOutput !== void 0) {
        content.push({ type: "text" /* Text */, text: toolOutput });
      }
      const isShellCommandTool = isShellTool(tracked.toolName);
      const ptyTerminalUri = isShellCommandTool ? this._shellManager?.getTerminalUriForToolCall(e.data.toolCallId) : void 0;
      let retireNonPtyShellTracking = !!ptyTerminalUri;
      if (ptyTerminalUri && !content.some((c) => c.type === "terminal" /* Terminal */)) {
        content.push({
          type: "terminal" /* Terminal */,
          resource: ptyTerminalUri,
          title: tracked.displayName
        });
      }
      const shellExit = appendSdkToolResultContent(
        content,
        e.data.result?.contents,
        isShellCommandTool ? { session: this.resourceUri, toolCallId: e.data.toolCallId, title: tracked.displayName } : void 0
      );
      if (isShellCommandTool && !ptyTerminalUri) {
        const completion = this._nonPtyShellTerminals.completeToolCall(e.data.toolCallId, toolOutput, shellExit);
        if (completion) {
          retireNonPtyShellTracking = completion.shouldRetire;
          const terminalIndex = content.findIndex((c) => c.type === "terminal" /* Terminal */);
          if (terminalIndex === -1) {
            content.push({
              type: "terminal" /* Terminal */,
              resource: completion.uri,
              title: tracked.displayName,
              isPty: false,
              ...completion.result ? { result: completion.result } : {}
            });
          } else if (completion.result) {
            const terminalBlock = content[terminalIndex];
            content[terminalIndex] = { ...terminalBlock, result: completion.result };
          }
        }
      }
      const command = isString(tracked.parameters?.command) ? tracked.parameters.command : void 0;
      const filePaths = isEditTool(tracked.toolName, command) ? this._getEditFilePaths(tracked.parameters) : [];
      for (const filePath of filePaths) {
        try {
          const fileEdit = await this._editTracker.takeCompletedEdit(this._turnId, e.data.toolCallId, filePath, tracked.toolName, tracked.parameters, this._lastSeenModelId, this._currentTurn.value?.clientContext);
          if (fileEdit) {
            content.push(fileEdit);
          }
        } catch (err) {
          this._logService.warn(`[Copilot:${sessionId}] Failed to take completed edit`, err);
        }
      }
      this._emitAction({
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId: this._turnId,
        toolCallId: e.data.toolCallId,
        result: {
          success: e.data.success,
          pastTenseMessage: getPastTenseMessage(tracked.toolName, displayName, tracked.parameters, e.data.success, e.data.success ? toolOutput : void 0, (path) => this._resolveEditFilePath(path)),
          content: content.length > 0 ? content : void 0,
          error: e.data.error
        },
        _meta: tracked.meta ? toToolCallMeta(tracked.meta) : void 0
      }, parentToolCallId);
      if (retireNonPtyShellTracking) {
        this._nonPtyShellTerminals.retire(e.data.toolCallId);
      }
    }));
    this._register(wrapper.onIdle((e) => {
      this._logService.info(`[Copilot:${sessionId}] Session idle`);
      if (e.data.aborted) {
        this._resetAbortToken();
      }
      if (this._hasActivity) {
        this._hasActivity = false;
        this._emitAction({
          type: "session/activityChanged" /* SessionActivityChanged */,
          activity: void 0
        });
      }
      const turn = this._currentTurn.value;
      if (!turn) {
        return;
      }
      if (e.data.aborted) {
        this._cancelActiveRepoInfoTelemetry();
        if (turn.isRunning || turn === this._resumingTurnAwaitingProviderStart) {
          this._logService.trace(`[Copilot:${sessionId}] Idle from abort; tearing down cancelled turn ${turn.id}`);
          if (turn.isRunning) {
            this._reportToolCallDetails(turn, "cancelled");
          }
          this._dropLateRootTurnEvents = true;
          turn.markAborted();
          this._clearActiveTurn();
        } else {
          this._logService.trace(`[Copilot:${sessionId}] Idle from abort; leaving ${turn.state} turn ${turn.id} open`);
        }
        return;
      }
      if (turn === this._resumingTurnAwaitingProviderStart && !turn.providerTurnStarted) {
        this._logService.trace(`[Copilot:${sessionId}] Ignoring idle from the failed execution while resumed turn ${turn.id} awaits provider start`);
        return;
      }
      this._completeActiveRepoInfoTelemetry();
      this._completeActiveTurn();
    }));
    this._register(wrapper.onSkillInvoked((e) => {
      this._logService.info(`[Copilot:${sessionId}] Skill invoked: ${e.data.name} (${e.data.path})`);
      this._resumeSubagentForEvent(e);
      if (this._shouldDropUnmappedSubagentEvent(e, "skill.invoked")) {
        return;
      }
      if (!e.agentId) {
        this._telemetryReporter.skillContentRead({
          clientType: this._currentTurn.value?.clientType ?? "unknown" /* Unknown */,
          name: e.data.name,
          path: e.data.path,
          content: e.data.content,
          source: e.data.source,
          pluginName: e.data.pluginName,
          pluginVersion: e.data.pluginVersion
        });
      }
      const parentToolCallId = this._parentToolCallIdForSubagentEvent(e);
      const synth = synthesizeSkillToolCall(e.data, e.id);
      this._emitAction({
        type: "chat/toolCallStart" /* ChatToolCallStart */,
        turnId: this._turnId,
        toolCallId: synth.toolCallId,
        toolName: synth.toolName,
        displayName: synth.displayName
      }, parentToolCallId);
      this._emitAction({
        type: "chat/toolCallReady" /* ChatToolCallReady */,
        turnId: this._turnId,
        toolCallId: synth.toolCallId,
        invocationMessage: synth.invocationMessage,
        confirmed: "not-needed" /* NotNeeded */
      }, parentToolCallId);
      this._emitAction({
        type: "chat/toolCallComplete" /* ChatToolCallComplete */,
        turnId: this._turnId,
        toolCallId: synth.toolCallId,
        result: {
          success: true,
          pastTenseMessage: synth.pastTenseMessage
        }
      }, parentToolCallId);
    }));
    this._register(wrapper.onSubagentStarted((e) => {
      if (this._dropLateRootTurnEvents) {
        this._logService.error(`[Copilot:${sessionId}] subagent.started emitted after cancellation; dropping`);
        return;
      }
      if (e.agentId) {
        this._parentToolCallIdsByAgentId.set(e.agentId, e.data.toolCallId);
        this._activeSubagentAgentIds.add(e.agentId);
      }
      if (this._currentTurn.value) {
        this._rootTurnIdBySubagentToolCallId.set(e.data.toolCallId, this._currentTurn.value.id);
      }
      this._logService.info(`[Copilot:${sessionId}] Subagent started: toolCallId=${e.data.toolCallId}, agent=${e.data.agentName}`);
      const tracked = this._activeToolCalls.get(e.data.toolCallId);
      this._onDidSessionProgress.fire({
        kind: "subagent_started",
        chat: this._chatChannelUri,
        toolCallId: e.data.toolCallId,
        agentName: e.data.agentName,
        agentDisplayName: e.data.agentDisplayName,
        agentDescription: e.data.agentDescription,
        // Use the spawning Task tool's short description as the subagent chat title.
        taskDescription: tracked?.meta?.subagentDescription,
        // Seed the subagent chat with the spawning tool's full delegated prompt.
        taskPrompt: typeof tracked?.parameters?.prompt === "string" ? tracked.parameters.prompt : void 0,
        // Preserve the immediate parent tool-call edge so discovery content routes to the right ancestor chat.
        parentToolCallId: tracked?.parentToolCallId
      });
    }));
    this._register(wrapper.onSessionError((e) => {
      this._logService.error(`[Copilot:${sessionId}] Session error: ${e.data.errorType} - ${e.data.message}`);
      if (!e.agentId && this._shouldDropLateRootTurnEvent("session.error")) {
        return;
      }
      if (isCopilotSdkAuthRejection(e.data)) {
        this._onDidRequireAuth.fire();
      }
      reportCopilotSdkSessionError(this._telemetryService, e, createCopilotFailureCorrelation(this.resourceUri, this._chatChannelUri, this._turnId, this.sessionId, this._currentTurn.value?.clientContext));
      const parentToolCallId = this._parentToolCallIdForSubagentEvent(e);
      const turn = this._currentTurn.value;
      if (turn) {
        this._reportToolCallDetails(turn, "failed");
      }
      this._emitAction({
        type: "chat/error" /* ChatError */,
        turnId: this._turnId,
        duration: turn?.duration ?? 0,
        part: createErrorResponsePart(buildChatErrorInfoFromCopilotSdkFields(e.data), !e.agentId && turn !== void 0)
      }, parentToolCallId);
      if (!parentToolCallId) {
        this._clearActiveTurn();
      }
    }));
    this._register(wrapper.onModelCallFailure((e) => {
      reportCopilotModelCallFailure(this._telemetryService, e, createCopilotFailureCorrelation(this.resourceUri, this._chatChannelUri, this._turnId, this.sessionId, this._currentTurn.value?.clientContext));
    }));
    let lastParentUsage;
    let lastParentUsageTurnId;
    let autoModeResolved;
    this._register(wrapper.onAutoModeResolved((e) => {
      if (!e.agentId && this._shouldDropLateRootTurnEvent("session.auto_mode_resolved")) {
        return;
      }
      this._lastSeenModelId = e.data.chosenModel;
      const turnId = this._turnId;
      this._logService.info(`[Copilot:${sessionId}] Auto mode resolved to ${e.data.chosenModel}${e.data.reasoningBucket ? ` (${e.data.reasoningBucket})` : ""}`);
      if (!turnId && !e.agentId) {
        return;
      }
      if (!e.agentId) {
        this._telemetryReporter.autoModeRouterDecision({
          session: this.resourceUri.toString(),
          turnId,
          clientType: this._currentTurn.value?.clientType ?? "unknown" /* Unknown */,
          chosenModel: e.data.chosenModel,
          predictedLabel: e.data.predictedLabel,
          confidence: e.data.confidence,
          candidateModels: e.data.candidateModels,
          categoryScores: e.data.categoryScores,
          routingMethod: e.data.routingMethod,
          availableModels: e.data.availableModels,
          fallback: e.data.fallback,
          fallbackReason: e.data.fallbackReason,
          stickyOverride: e.data.stickyOverride,
          routerLatencyMs: e.data.routerLatencyMs,
          endToEndLatencyMs: e.data.endToEndLatencyMs,
          chosenShortfall: e.data.chosenShortfall,
          hasImage: e.data.hasImage
        });
      }
      if (e.agentId) {
        const subagentToolCallId = this._parentToolCallIdForSubagentEvent(e);
        if (!subagentToolCallId) {
          this._logService.warn(`[Copilot:${sessionId}] Unable to attribute Auto mode resolution for unknown subagent agentId=${e.agentId}; leaving the parent turn's routing untouched`);
        } else {
          this._autoModeResolvedByToolCallId.set(subagentToolCallId, e.data);
        }
        return;
      }
      autoModeResolved = { turnId, data: e.data };
      const priorUsage = lastParentUsageTurnId === turnId ? lastParentUsage : void 0;
      const usage = {
        ...priorUsage,
        model: e.data.chosenModel,
        _meta: {
          ...priorUsage?._meta ?? {},
          autoModeResolved: e.data
        }
      };
      lastParentUsage = usage;
      lastParentUsageTurnId = turnId;
      this._emitAction({
        type: "chat/usage" /* ChatUsage */,
        turnId,
        usage
      });
    }));
    this._register(wrapper.onUsage((e) => {
      this._resumeSubagentForEvent(e);
      if (!e.agentId && this._shouldDropLateRootTurnEvent("assistant.usage")) {
        return;
      }
      const mappedParentToolCallId = this._parentToolCallIdForSubagentEvent(e);
      const parentToolCallId = mappedParentToolCallId ?? e.data.parentToolCallId;
      const isUnmappedSubagent = !!e.agentId && !parentToolCallId;
      if (!mappedParentToolCallId && e.data.parentToolCallId && this._currentTurn.value && !this._rootTurnIdBySubagentToolCallId.has(e.data.parentToolCallId)) {
        this._rootTurnIdBySubagentToolCallId.set(e.data.parentToolCallId, this._currentTurn.value.id);
      }
      if (isUnmappedSubagent) {
        this._logService.warn(`[Copilot:${sessionId}] Unable to attribute direct assistant.usage for unknown subagent agentId=${e.agentId}; retaining inclusive root usage`);
      }
      if (!parentToolCallId && !e.agentId) {
        this._promptCacheRefreshGeneration++;
        if (e.data.model && e.data.cacheExpiresAt) {
          this._setPromptCacheState({ modelId: e.data.model, cacheExpiresAt: e.data.cacheExpiresAt });
        } else if (e.data.model && this._promptCacheState?.modelId !== e.data.model) {
          this._setPromptCacheState(void 0);
        }
      }
      const copilotUsage = readCopilotUsage(e.data);
      const quotaSnapshots = normalizeQuotaSnapshots(e.data.quotaSnapshots);
      const turn = isUnmappedSubagent ? this._currentTurn.value : this._owningRootTurn(parentToolCallId);
      if (typeof e.data.model === "string" && e.data.model) {
        this._lastSeenModelId = e.data.model;
      }
      const eventContext = {
        inputTokens: e.data.inputTokens,
        outputTokens: e.data.outputTokens,
        model: e.data.model,
        cacheReadTokens: e.data.cacheReadTokens,
        ...typeof e.data.cost === "number" ? { cost: e.data.cost } : {}
      };
      if (!parentToolCallId && turn) {
        turn.parentContextUsage = eventContext;
      }
      turn?.addTokenTotals(eventContext.model, eventContext);
      const directUsage = isUnmappedSubagent ? void 0 : this._directUsageFor(parentToolCallId, true);
      directUsage?.add(eventContext.model, eventContext, copilotUsage?.totalNanoAiu);
      const buildUsage = (context, scopedCopilotUsage, isParentScope, directOwnerToolCallId) => {
        const metadata = {};
        if (typeof context.cost === "number") {
          metadata.cost = context.cost;
        }
        if (isParentScope && autoModeResolved?.turnId === this._turnId) {
          metadata.autoModeResolved = autoModeResolved.data;
        } else if (!isParentScope && directOwnerToolCallId) {
          const subagentAutoMode = this._autoModeResolvedByToolCallId.get(directOwnerToolCallId);
          if (subagentAutoMode) {
            metadata.autoModeResolved = subagentAutoMode;
          }
        }
        if (scopedCopilotUsage) {
          metadata.copilotUsage = scopedCopilotUsage;
        }
        if (quotaSnapshots) {
          metadata.quotaSnapshots = quotaSnapshots;
        }
        const turnTokenTotals = isParentScope ? turn?.tokenTotals : void 0;
        if (turnTokenTotals) {
          metadata.turnTokenTotals = turnTokenTotals;
        }
        const directUsage2 = this._directUsageFor(directOwnerToolCallId, false);
        const directTurnTokenTotals = directUsage2?.tokenTotals;
        if (directTurnTokenTotals) {
          metadata.directTurnTokenTotals = directTurnTokenTotals;
        }
        const directNanoAiu = directUsage2?.copilotNanoAiu;
        if (directNanoAiu !== void 0) {
          metadata.directCopilotUsage = { totalNanoAiu: directNanoAiu };
        }
        return {
          inputTokens: context.inputTokens,
          outputTokens: context.outputTokens,
          model: context.model,
          cacheReadTokens: context.cacheReadTokens,
          ...Object.keys(metadata).length > 0 ? { _meta: metadata } : {}
        };
      };
      if (turn && copilotUsage) {
        turn.copilotNanoAiu += copilotUsage.totalNanoAiu;
      }
      if (turn) {
        const parentContext = parentToolCallId || isUnmappedSubagent ? turn.parentContextUsage ?? {} : eventContext;
        const parentUsage = buildUsage(parentContext, this._parentCopilotUsageMeta(), true, void 0);
        lastParentUsage = parentUsage;
        lastParentUsageTurnId = this._turnId;
        this._emitAction({
          type: "chat/usage" /* ChatUsage */,
          turnId: this._turnId,
          usage: parentUsage
        });
      }
      if (parentToolCallId) {
        const scopedTotal = directUsage?.copilotNanoAiu;
        const subagentCopilotUsage = copilotUsage && scopedTotal !== void 0 ? { ...copilotUsage, totalNanoAiu: scopedTotal } : void 0;
        const subagentUsage = buildUsage(eventContext, subagentCopilotUsage, false, parentToolCallId);
        this._lastSubagentUsageByToolCallId.set(parentToolCallId, subagentUsage);
        this._emitAction({
          type: "chat/usage" /* ChatUsage */,
          turnId: this._turnId,
          usage: subagentUsage
        }, parentToolCallId);
      }
    }));
    this._register(wrapper.onUsage(async (e) => {
      if (!e.agentId && this._shouldDropLateRootTurnEvent("assistant.usage")) {
        return;
      }
      const isSubagentEvent = !!this._parentToolCallIdForSubagentEvent(e);
      const turnId = this._turnId;
      const baseUsage = lastParentUsageTurnId === turnId ? lastParentUsage : void 0;
      const usage = baseUsage ?? {
        inputTokens: e.data.inputTokens,
        outputTokens: e.data.outputTokens,
        model: e.data.model,
        cacheReadTokens: e.data.cacheReadTokens
      };
      await this._refreshSessionUsageMetrics();
      const attribution = isSubagentEvent ? void 0 : await this._readContextAttribution();
      if (!turnId) {
        return;
      }
      if (turnId !== this._turnId || usage !== lastParentUsage || lastParentUsageTurnId !== turnId) {
        return;
      }
      const copilotUsage = this._parentCopilotUsageMeta();
      if (!attribution && !copilotUsage) {
        return;
      }
      const enriched = {
        ...usage,
        _meta: {
          ...usage._meta ?? {},
          ...copilotUsage ? { copilotUsage } : {},
          ...attribution ? { contextAttribution: attribution } : {}
        }
      };
      lastParentUsage = enriched;
      lastParentUsageTurnId = turnId;
      this._emitAction({
        type: "chat/usage" /* ChatUsage */,
        turnId,
        usage: enriched
      });
    }));
    this._register(wrapper.onSessionCompactionComplete(async (e) => {
      if (e.data.success === false) {
        return;
      }
      this._resumeSubagentForEvent(e);
      const parentToolCallId = this._parentToolCallIdForSubagentEvent(e);
      if (e.agentId && !parentToolCallId) {
        return;
      }
      const copilotUsage = readCopilotUsage(e.data.compactionTokensUsed);
      const turn = this._owningRootTurn(parentToolCallId);
      const compactionTokens = e.data.compactionTokensUsed;
      const model = compactionTokens?.model ?? this._lastSeenModelId;
      const usageContext = {
        inputTokens: compactionTokens?.inputTokens,
        outputTokens: compactionTokens?.outputTokens,
        cacheReadTokens: compactionTokens?.cacheReadTokens
      };
      turn?.addTokenTotals(model, usageContext);
      const directUsage = this._directUsageFor(parentToolCallId, true);
      directUsage?.add(model, usageContext, copilotUsage?.totalNanoAiu);
      if (turn && copilotUsage) {
        turn.copilotNanoAiu += copilotUsage.totalNanoAiu;
      }
      const emitParentUsage = () => {
        const turnId = this._turnId;
        const parentCopilotUsage = this._parentCopilotUsageMeta();
        const turnTokenTotals = this._currentTurn.value?.tokenTotals;
        const directTurnTokenTotals = this._currentTurn.value?.directUsage.tokenTotals;
        const directNanoAiu = this._currentTurn.value?.directUsage.copilotNanoAiu;
        if (!turnId || !parentCopilotUsage && !turnTokenTotals && !directTurnTokenTotals && directNanoAiu === void 0) {
          return void 0;
        }
        const base = lastParentUsageTurnId === turnId ? lastParentUsage : void 0;
        const usage = {
          ...base,
          model: base?.model ?? this._lastSeenModelId,
          _meta: {
            ...base?._meta ?? {},
            ...parentCopilotUsage ? { copilotUsage: parentCopilotUsage } : {},
            ...turnTokenTotals ? { turnTokenTotals } : {},
            ...directTurnTokenTotals ? { directTurnTokenTotals } : {},
            ...directNanoAiu !== void 0 ? { directCopilotUsage: { totalNanoAiu: directNanoAiu } } : {}
          }
        };
        lastParentUsage = usage;
        lastParentUsageTurnId = turnId;
        this._emitAction({
          type: "chat/usage" /* ChatUsage */,
          turnId,
          usage
        });
        return turnId;
      };
      if (parentToolCallId && directUsage) {
        const priorUsage = this._lastSubagentUsageByToolCallId.get(parentToolCallId);
        const metadata = { ...priorUsage?._meta ?? {} };
        metadata.autoModeResolved ??= this._autoModeResolvedByToolCallId.get(parentToolCallId);
        if (directUsage.tokenTotals) {
          metadata.directTurnTokenTotals = directUsage.tokenTotals;
        }
        if (directUsage.copilotNanoAiu !== void 0) {
          metadata.directCopilotUsage = { totalNanoAiu: directUsage.copilotNanoAiu };
          metadata.copilotUsage = {
            ...metadata.copilotUsage ?? {},
            ...copilotUsage ?? {},
            totalNanoAiu: directUsage.copilotNanoAiu
          };
        }
        const usage = {
          ...priorUsage,
          model: priorUsage?.model ?? model,
          ...Object.keys(metadata).length > 0 ? { _meta: metadata } : {}
        };
        this._lastSubagentUsageByToolCallId.set(parentToolCallId, usage);
        this._emitAction({
          type: "chat/usage" /* ChatUsage */,
          turnId: this._turnId,
          usage
        }, parentToolCallId);
      }
      if (turn) {
        emitParentUsage();
      }
      const turnIdBeforeRefresh = this._turnId;
      if (await this._refreshSessionUsageMetrics() && turnIdBeforeRefresh === this._turnId) {
        emitParentUsage();
      }
    }));
    this._register(wrapper.onReasoningDelta((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Reasoning delta: ${e.data.deltaContent.length} chars`);
      this._resumeSubagentForEvent(e);
      if (this._shouldDropUnmappedSubagentEvent(e, "assistant.reasoning_delta")) {
        return;
      }
      this._emitReasoningDelta(e.data.deltaContent, this._parentToolCallIdForSubagentEvent(e));
    }));
    this._register(wrapper.onSessionModeChanged((e) => {
      if (e.agentId) {
        this._logService.trace(`[Copilot:${sessionId}] Ignoring subagent session.mode_changed: agentId=${e.agentId}, ${e.data.previousMode} -> ${e.data.newMode}`);
        return;
      }
      this._logService.info(`[Copilot:${sessionId}] session.mode_changed: ${e.data.previousMode} -> ${e.data.newMode}`);
      const newMode = e.data.newMode;
      if (newMode !== "interactive" && newMode !== "plan" && newMode !== "autopilot") {
        return;
      }
      this._lastAppliedMode = newMode;
      this._syncAhpConfigFromSdkMode(newMode);
    }));
    this._register(wrapper.onMcpServersLoaded((e) => {
      this._logMcpServersSnapshot(e.data.servers.map((s) => ({
        name: s.name,
        status: s.status,
        error: s.error,
        source: s.source,
        transport: s.transport,
        pluginName: s.pluginName,
        pluginVersion: s.pluginVersion
      })), "loaded");
      this._applyMcpServerList(e.data.servers);
    }));
    this._register(wrapper.onMcpServerStatusChanged((e) => {
      this._logMcpServerLifecycle({ name: e.data.serverName, status: e.data.status, error: e.data.error, origin: "statusChanged" });
      const server = this._toSdkMcpServer(e.data.serverName, e.data.status, e.data.error);
      if (!server) {
        this._mcpCustomizations.remove(e.data.serverName);
        return;
      }
      this._mcpCustomizations.applyOne(server);
    }));
    this._register(wrapper.onToolsUpdated(() => {
      this._slashCommandProvider.clearCache();
      this._fireMcpToolsListChanged();
    }));
    this._register(wrapper.onCommandsChanged(() => {
      this._slashCommandProvider.clearCache();
    }));
    this._seedMcpServersFromRpc();
  }
  /**
   * One-shot fetch of `rpc.mcp.list` at subscription time. Best-effort:
   * any failure is logged and the inventory simply stays empty until the
   * next live event arrives.
   */
  _seedMcpServersFromRpc() {
    this._refreshMcpServersFromRpc().catch((err) => {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to seed MCP server inventory`, err);
    });
  }
  async _refreshMcpServersFromRpc() {
    const mcpRpc = this._wrapper.session.rpc?.mcp;
    if (!mcpRpc) {
      return;
    }
    const result = await mcpRpc.list();
    if (!this._store.isDisposed) {
      this._logMcpServersSnapshot(result.servers.map((s) => ({
        name: s.name,
        status: s.status,
        error: s.error,
        source: s.source,
        pluginName: s.sourcePlugin,
        pluginVersion: s.sourcePluginVersion
      })), "inventory");
      this._applyMcpServerList(result.servers);
    }
  }
  _applyMcpServerList(servers) {
    const sdkServers = servers.map((s) => this._toSdkMcpServer(s.name, s.status, s.error));
    this._mcpCustomizations.applyAll(sdkServers);
  }
  /**
   * Logs a full MCP inventory snapshot ({@link _logMcpServerLifecycle} per
   * server), then forgets the dedup entry for any server that dropped out of
   * the snapshot so a later re-add re-logs its arrival.
   */
  _logMcpServersSnapshot(servers, origin) {
    const seen = /* @__PURE__ */ new Set();
    for (const server of servers) {
      seen.add(server.name);
      this._logMcpServerLifecycle({ ...server, origin });
    }
    for (const name of [...this._lastLoggedMcpStatus.keys()]) {
      if (!seen.has(name)) {
        this._lastLoggedMcpStatus.delete(name);
      }
    }
  }
  /**
   * Emits a single structured MCP lifecycle log record for `server`,
   * deduplicated by SDK status so an unchanged re-report stays quiet. Failed
   * servers log at `error` (carrying the failure text in the body and an
   * `errorType` attribute); every other transition logs at `info`. Records
   * flow through {@link ILogService} to the agent host's OTLP log stream.
   */
  _logMcpServerLifecycle(server) {
    if (this._lastLoggedMcpStatus.get(server.name) === server.status) {
      return;
    }
    this._lastLoggedMcpStatus.set(server.name, server.status);
    const state = this._translateSdkMcpStatus(server.name, server.status, server.error);
    const attributes = {
      mcpEvent: server.origin,
      mcpServer: server.name,
      mcpStatus: server.status,
      mcpState: state.kind
    };
    if (server.source) {
      attributes.mcpSource = server.source;
    }
    if (server.transport) {
      attributes.mcpTransport = server.transport;
    }
    if (server.pluginName) {
      attributes.mcpPlugin = server.pluginName;
    }
    if (server.pluginVersion) {
      attributes.mcpPluginVersion = server.pluginVersion;
    }
    if (state.kind === "error" /* Error */) {
      attributes.errorType = state.error.errorType;
    }
    const detail = server.error ? `: ${server.error}` : "";
    const message = `[Copilot:${this.sessionId}] MCP server '${server.name}' ${server.status} (${state.kind})${detail}`;
    if (server.status === "failed") {
      this._logService.error(message, new OtelData(attributes));
    } else {
      this._logService.info(message, new OtelData(attributes));
    }
  }
  _setToolCallUiMeta(meta, resourceUri, mcpServerName) {
    if (!resourceUri) {
      return;
    }
    const ui = { resourceUri };
    if (mcpServerName) {
      const channel = this._mcpCustomizations.channelForServer(mcpServerName);
      if (channel !== void 0) {
        ui.channel = channel;
      }
    }
    meta.ui = ui;
  }
  /**
   * Broadcasts `notifications/tools/list_changed` for every MCP server
   * currently in the `Ready` state. The SDK's `session.tools_updated`
   * event is a coarse "tools refreshed" hint that doesn't identify
   * which server changed, so we fan out to all ready channels. Clients
   * are expected to refetch `tools/list` on each notification.
   */
  _fireMcpToolsListChanged() {
    for (const { channel } of this._mcpCustomizations.readyChannels()) {
      this._onMcpNotification.fire({
        channel,
        method: "notifications/tools/list_changed"
      });
    }
  }
  /** Snapshot of MCP servers that have no plugin-derived child entry. */
  topLevelMcpCustomizations() {
    return this._mcpCustomizations.topLevelCustomizations();
  }
  mcpServerOwners() {
    return this._mcpCustomizations.pluginMcpServerSources;
  }
  /**
   * Translates the SDK's flat MCP status string into AHP's discriminated
   * {@link McpServerState} union.
   */
  _toSdkMcpServer(name, status, error) {
    return {
      name,
      state: this._translateSdkMcpStatus(name, status, error),
      enabled: status !== "disabled"
    };
  }
  _translateSdkMcpStatus(name, status, error) {
    switch (status) {
      case "connected":
        return { kind: "ready" /* Ready */ };
      case "failed":
        return {
          kind: "error" /* Error */,
          error: {
            errorType: "mcp-server-failed",
            message: error ?? "MCP server failed to start"
          }
        };
      case "pending":
      case "needs-auth": {
        const previous = this._mcpCustomizations.stateForServer(name);
        if (previous?.kind === "authRequired" /* AuthRequired */) {
          return previous;
        }
        return { kind: "starting" /* Starting */ };
      }
      case "disabled":
      case "not_configured":
        return { kind: "stopped" /* Stopped */ };
      default:
        return { kind: "stopped" /* Stopped */ };
    }
  }
  /**
   * Translates the SDK's three-mode space (`interactive` / `plan` /
   * `autopilot`) to AHP's `mode` axis directly:
   *
   *  - SDK `plan` → AHP `mode='plan'`.
   *  - SDK `interactive` → AHP `mode='interactive'`.
   *  - SDK `autopilot` → AHP `mode='autopilot'`.
   *
   * Autopilot lives on the `mode` axis; the orthogonal `autoApprove` axis
   * (Default / Bypass) is left untouched so the user's chosen
   * approval level is preserved across SDK mode transitions.
   *
   * Patches that already match the current AHP values are still
   * dispatched (the reducer is a no-op in that case) but written values
   * propagate to all subscribed clients via `session/configChanged`.
   */
  _syncAhpConfigFromSdkMode(sdkMode) {
    const sessionUri = this._ownerSessionUri.toString();
    const patch = {};
    switch (sdkMode) {
      case "plan":
        patch["mode" /* Mode */] = "plan";
        break;
      case "autopilot":
        patch["mode" /* Mode */] = "autopilot";
        break;
      case "interactive":
        patch["mode" /* Mode */] = "interactive";
        break;
    }
    this._configurationService.updateSessionConfig(sessionUri, patch);
  }
  /**
   * Handles the CLI's `exitPlanMode.request` RPC by surfacing it as a
   * {@link ChatInputRequest} and awaiting the client's response. The
   * resolved {@link CopilotExitPlanModeResponse} flows back to the CLI, which
   * calls `session.respondToExitPlanMode` internally — that resumes the
   * paused `exit_plan_mode` tool call and (on accept) updates the SDK's
   * `currentMode` so the model can continue with implementation.
   */
  async _handleExitPlanModeRequest(data, _invocation) {
    const turnId = this._currentTurn.value?.id;
    if (!turnId) {
      this._logService.warn(`[Copilot:${this.sessionId}] Rejecting plan review request without an active turn`);
      return { approved: false };
    }
    const requestId = generateUuid();
    const questionId = generateUuid();
    this._logService.info(`[Copilot:${this.sessionId}] exitPlanMode.request: rpcId=${requestId}, actions=[${data.actions.join(",")}], recommended=${data.recommendedAction}`);
    let planPath = null;
    try {
      const planRead = await this._wrapper.session.rpc.plan.read();
      planPath = planRead.path ?? null;
    } catch (err) {
      this._logService.warn(`[Copilot:${this.sessionId}] rpc.plan.read failed for exit_plan_mode: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (this._currentTurn.value?.id !== turnId) {
      this._logService.warn(`[Copilot:${this.sessionId}] Rejecting plan review request after its turn ended`);
      return { approved: false };
    }
    const options = data.actions.map((actionId) => {
      const desc = getPlanActionDescription(actionId);
      return {
        id: actionId,
        label: desc?.label ?? actionId,
        description: desc?.description,
        recommended: actionId === data.recommendedAction
      };
    });
    const actions = options.map((option) => ({
      id: option.id,
      label: option.label,
      ...option.description ? { description: option.description } : {},
      ...option.recommended ? { default: true } : {}
    }));
    const inputRequest = withChatInputRequestPurpose({
      id: requestId,
      planReview: {
        title: localize(2495, null),
        content: data.summary || localize(2491, null),
        actions,
        canProvideFeedback: true,
        answerQuestionId: questionId,
        ...planPath ? { planUri: URI.file(planPath).toString() } : {}
      },
      questions: [{
        kind: "single-select" /* SingleSelect */,
        id: questionId,
        title: localize(2495, null),
        message: localize(2494, null),
        required: true,
        options,
        allowFreeformInput: true
      }]
    }, "planReview" /* PlanReview */);
    const pendingPlanReview = this._pendingPlanReviews.register(requestId, {
      actions: data.actions,
      recommendedAction: data.recommendedAction,
      questionId
    });
    this._onDidSessionProgress.fire({
      kind: "action",
      resource: this._chatChannelUri,
      action: {
        type: "chat/inputRequested" /* ChatInputRequested */,
        request: inputRequest
      }
    });
    try {
      return await pendingPlanReview;
    } catch (err) {
      this._logService.error(err, `[Copilot:${this.sessionId}] exitPlanMode.request handler failed: rpcId=${requestId}`);
      return { approved: false };
    }
  }
  /**
   * Drop the memoized event reconstruction whenever the persisted event log
   * could have changed, so {@link _getMappedEvents} never serves stale turns
   * once the session resumes activity. While the session is idle (e.g. during
   * a historical session open) none of these fire, so the whole restore wave
   * coalesces to a single reconstruction.
   */
  _subscribeForMemoInvalidation() {
    const wrapper = this._wrapper;
    const invalidate = () => this._invalidateMappedEvents();
    this._register(wrapper.onUserMessage(invalidate));
    this._register(wrapper.onTurnStart(invalidate));
    this._register(wrapper.onMessage(invalidate));
    this._register(wrapper.onToolStart(invalidate));
    this._register(wrapper.onToolComplete(invalidate));
    this._register(wrapper.onSubagentStarted(invalidate));
    this._register(wrapper.onSubagentCompleted(invalidate));
    this._register(wrapper.onSubagentFailed(invalidate));
    this._register(wrapper.onTurnEnd(invalidate));
    this._register(wrapper.onSessionError(invalidate));
    this._register(wrapper.onSessionCompactionComplete(invalidate));
    this._register(wrapper.onSessionTruncation(invalidate));
    this._register(wrapper.onSessionSnapshotRewind(invalidate));
  }
  /**
   * Emits `instructionsCollected` per user message.
   * Attempts to match local chat's `ComputeAutomaticInstructions`
   * emitter (`src/vs/workbench/contrib/chat/common/promptSyntax/computeAutomaticInstructions.ts`)
   */
  _subscribeForInstructionsCollectedTelemetry() {
    const wrapper = this._wrapper;
    const sessionId = this.sessionId;
    this._register(wrapper.onUserMessage((e) => {
      if (e.agentId || e.data.source && e.data.source.toLowerCase() !== "user") {
        return;
      }
      const clientContext = this._currentTurn.value?.clientContext;
      void (async () => {
        let sources;
        try {
          sources = (await wrapper.session.rpc.instructions.getSources()).sources;
        } catch (err) {
          this._logService.trace(`[Copilot:${sessionId}] Failed to fetch instruction sources for telemetry: ${getErrorMessage(err)}`);
          return;
        }
        let agentInstructionsCount = 0;
        let applyingInstructionsCount = 0;
        let referencedInstructionsCount = 0;
        let claudeMdCount = 0;
        for (const s of sources) {
          if (s.type === "home" || s.type === "repo" || s.type === "model") {
            agentInstructionsCount++;
          }
          if (s.applyTo && s.applyTo.length > 0) {
            applyingInstructionsCount++;
          }
          if (s.type === "child-instructions" || s.type === "nested-agents") {
            referencedInstructionsCount++;
          }
          const lastSep = Math.max(s.sourcePath.lastIndexOf("/"), s.sourcePath.lastIndexOf("\\"));
          const filename = lastSep >= 0 ? s.sourcePath.slice(lastSep + 1) : s.sourcePath;
          if (filename === "CLAUDE.md") {
            claudeMdCount++;
          }
        }
        this._telemetryService.publicLog2("agentHost.instructionsCollected", {
          ...toInitiatorTelemetry(clientContext),
          provider: this.resourceUri.scheme,
          agentSessionId: AgentSession.id(this.resourceUri),
          isSubagentSession: isSubagentSession(this.resourceUri),
          totalInstructionsCount: sources.length,
          agentInstructionsCount,
          applyingInstructionsCount,
          referencedInstructionsCount,
          claudeMdCount
        });
      })().catch((err) => {
        this._logService.trace(`[Copilot:${sessionId}] instructionsCollected telemetry failed: ${getErrorMessage(err)}`);
      });
    }));
  }
  _subscribeForLogging() {
    const wrapper = this._wrapper;
    const sessionId = this.sessionId;
    this._register(wrapper.onUnhandledEvent((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Unhandled SDK event: ${safeStringify(e)}`);
    }));
    this._register(wrapper.onSessionStart((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Session started: model=${e.data.selectedModel ?? "default"}, producer=${e.data.producer}`);
    }));
    this._register(wrapper.onSessionResume((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Session resumed: eventCount=${e.data.eventCount}`);
    }));
    this._register(wrapper.onSessionInfo((e) => {
      const attributes = { infoType: e.data.infoType };
      if (e.data.tip) {
        attributes.tip = e.data.tip;
      }
      const message = `[Copilot:${sessionId}] [${e.data.infoType}]: ${e.data.message}`;
      const otelData = new OtelData(attributes);
      if (e.data.infoType === "mcp") {
        this._logService.info(message, otelData);
      } else {
        this._logService.trace(message, otelData);
      }
    }));
    this._register(wrapper.onSessionWarning((e) => {
      this._logService.warn(`[Copilot:${sessionId}] ${e.data.message}`, new OtelData({ warningType: e.data.warningType }));
    }));
    this._register(wrapper.onSessionModelChange((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Model changed: ${e.data.previousModel ?? "(none)"} -> ${e.data.newModel}`);
      if (!e.agentId) {
        this._promptCacheRefreshGeneration++;
        if (e.data.previousModel !== e.data.newModel) {
          this._setPromptCacheState(void 0);
        }
        void this._refreshSessionUsageMetrics();
      }
    }));
    this._register(wrapper.onManagedSettingsResolved((e) => {
      this._logService.info(`[Copilot:${sessionId}] Managed settings resolved: source=${e.data.source}, managedKeys=${e.data.managedKeys.join(",") || "(none)"}, bypassPermissionsDisabled=${e.data.bypassPermissionsDisabled}, failClosed=${e.data.failClosed}`);
    }));
    this._register(wrapper.onManagedSettingsEnforced((e) => {
      this._logService.warn(`[Copilot:${sessionId}] Managed settings enforced: action=${e.data.action}, setting=${e.data.setting}, escalation=${e.data.escalation ?? "(none)"}, failClosed=${e.data.failClosed}, message=${e.data.message}`);
    }));
    this._register(wrapper.onSessionHandoff((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Session handoff: sourceType=${e.data.sourceType}, remoteSessionId=${e.data.remoteSessionId ?? "(none)"}`);
    }));
    this._register(wrapper.onSessionTruncation((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Session truncation: removed ${e.data.tokensRemovedDuringTruncation} tokens, ${e.data.messagesRemovedDuringTruncation} messages`);
    }));
    this._register(wrapper.onSessionSnapshotRewind((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Snapshot rewind: upTo=${e.data.upToEventId}, eventsRemoved=${e.data.eventsRemoved}`);
    }));
    this._register(wrapper.onSessionShutdown((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Session shutdown: type=${e.data.shutdownType}, apiDuration=${e.data.totalApiDurationMs}ms`);
    }));
    this._register(wrapper.onSessionUsageInfo((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Usage info: ${e.data.currentTokens}/${e.data.tokenLimit} tokens, ${e.data.messagesLength} messages`);
    }));
    this._register(wrapper.onSessionCompactionStart(() => {
      this._logService.trace(`[Copilot:${sessionId}] Compaction started`);
    }));
    this._register(wrapper.onSessionCompactionComplete((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Compaction complete: success=${e.data.success}, tokensRemoved=${e.data.tokensRemoved ?? "?"}`);
    }));
    this._register(wrapper.onUserMessage((e) => {
      this._logService.trace(`[Copilot:${sessionId}] User message: ${e.data.content.length} chars, ${e.data.attachments?.length ?? 0} attachments`);
      if (!e.agentId && (!e.data.source || e.data.source.toLowerCase() === "user")) {
        void this._telemetryReporter.userMessageText(this.resourceUri.toString(), this._currentTurn.value?.clientType ?? "unknown" /* Unknown */, e.data.content, this._turnOrdinal).catch((err) => this._logService.trace(`[Copilot:${this.sessionId}] Telemetry emission failed: ${getErrorMessage(err)}`));
      }
    }));
    this._register(wrapper.onPendingMessagesModified(() => {
      this._logService.trace(`[Copilot:${sessionId}] Pending messages modified`);
    }));
    this._register(wrapper.onTurnStart((e) => {
      const turn = this._currentTurn.value;
      turn?.markProviderTurnStarted();
      turn?.markRunning();
      if (!e.agentId) {
        this._dropLateRootTurnEvents = false;
        if (this._resumingTurnAwaitingProviderStart === turn) {
          this._resumingTurnAwaitingProviderStart = void 0;
        }
      }
      this._logService.trace(`[Copilot:${sessionId}] Turn started: ${e.data.turnId}`);
      if (!e.agentId) {
        const telemetryMessageId = this._currentTurn.value?.id ?? e.data.turnId;
        if (this._activeRepoInfoTurn?.telemetryMessageId === telemetryMessageId) {
          return;
        }
        this._cancelActiveRepoInfoTelemetry();
        const turn2 = {
          telemetryMessageId,
          cancelled: false,
          begin: Promise.resolve(void 0)
        };
        const isCurrent = () => !turn2.cancelled && this._isLaunchTokenCurrent();
        turn2.begin = this._beginRepoInfoTelemetry(telemetryMessageId, this._currentTurn.value?.clientType ?? "unknown" /* Unknown */, isCurrent);
        this._activeRepoInfoTurn = turn2;
      }
    }));
    this._register(wrapper.onIntent((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Intent: ${e.data.intent}`);
      const activity = e.data.intent || void 0;
      if (activity === void 0 && !this._hasActivity) {
        return;
      }
      this._hasActivity = activity !== void 0;
      this._emitAction({
        type: "session/activityChanged" /* SessionActivityChanged */,
        activity
      });
    }));
    this._register(wrapper.onReasoning((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Reasoning: ${e.data.content.length} chars`);
    }));
    this._register(wrapper.onTurnEnd((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Turn ended: ${e.data.turnId}`);
    }));
    this._register(wrapper.onAbort((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Aborted: ${e.data.reason}`);
      this._cancelActiveRepoInfoTelemetry();
      const turn = this._currentTurn.value;
      if (turn?.isRunning) {
        this._reportToolCallDetails(turn, "cancelled");
      }
    }));
    this._register(wrapper.onToolUserRequested((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Tool user-requested: ${e.data.toolName} (${e.data.toolCallId})`);
    }));
    this._register(wrapper.onToolPartialResult((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Tool partial result: ${e.data.toolCallId} (${e.data.partialOutput.length} chars)`);
      const tracked = this._activeToolCalls.get(e.data.toolCallId);
      if (!tracked || !isShellTool(tracked.toolName)) {
        return;
      }
      if (this._shellManager?.getTerminalUriForToolCall(e.data.toolCallId)) {
        return;
      }
      const appended = this._nonPtyShellTerminals.append(e.data.toolCallId, e.data.partialOutput);
      if (appended?.created) {
        const { uri } = appended;
        tracked.content.push({
          type: "terminal" /* Terminal */,
          resource: uri,
          title: tracked.displayName,
          isPty: false
        });
        this._emitAction({
          type: "chat/toolCallContentChanged" /* ChatToolCallContentChanged */,
          turnId: this._turnId,
          toolCallId: e.data.toolCallId,
          content: tracked.content
        }, tracked.parentToolCallId);
      }
    }));
    this._register(wrapper.onToolProgress((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Tool progress: ${e.data.toolCallId} - ${e.data.progressMessage}`);
    }));
    this._register(wrapper.onSkillInvoked((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Skill invoked: ${e.data.name} (${e.data.path})`);
    }));
    this._register(wrapper.onSubagentStarted((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Subagent started: ${e.data.agentName} (${e.data.agentDisplayName})`);
    }));
    this._register(wrapper.onSubagentCompleted((e) => {
      this._completeSubagentTurn(e.agentId, e.data.toolCallId);
      this._logService.trace(`[Copilot:${sessionId}] Subagent completed: ${e.data.agentName}`);
    }));
    this._register(wrapper.onSubagentFailed((e) => {
      this._completeSubagentTurn(e.agentId, e.data.toolCallId);
      this._logService.error(`[Copilot:${sessionId}] Subagent failed: ${e.data.agentName} - ${e.data.error}`);
    }));
    this._register(wrapper.onSubagentSelected((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Subagent selected: ${e.data.agentName}`);
    }));
    this._register(wrapper.onHookStart((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Hook started: ${e.data.hookType} (${e.data.hookInvocationId})`);
    }));
    this._register(wrapper.onHookEnd((e) => {
      this._logService.trace(`[Copilot:${sessionId}] Hook ended: ${e.data.hookType} (${e.data.hookInvocationId}), success=${e.data.success}`);
      if (e.data.hookType === "agentStop") {
        this._completeSubagentTurn(e.agentId);
      }
    }));
    this._register(wrapper.onSystemMessage((e) => {
      this._logService.trace(`[Copilot:${sessionId}] System message [${e.data.role}]: ${e.data.content.length} chars`);
    }));
  }
  // ---- SDK event ID tracking & truncation ---------------------------------
  /**
   * Returns the SDK event ID for the turn inserted after the given turn,
   * or `undefined` if it's the last turn.
   */
  getNextTurnEventId(turnId) {
    return this._databaseRef.object.getNextTurnEventId(turnId);
  }
  /**
   * Resolves the exclusive SDK event boundary for a fork after {@link turnId}.
   */
  async getForkBoundaryEventId(turnId) {
    const activeTurn = this._currentTurn.value;
    const activeTurnId = activeTurn?.id;
    const activeTurnEventId = activeTurnId !== turnId ? activeTurn?.eventId : void 0;
    const persistedEventId = await this._databaseRef.object.getNextTurnEventId(turnId);
    if (persistedEventId || !activeTurnEventId) {
      return persistedEventId;
    }
    this._logService.info(`[Copilot:${this.sessionId}] Fork boundary after turn ${turnId} is active turn ${activeTurnId}; waiting for its SDK event id`);
    try {
      return await activeTurnEventId;
    } catch (err) {
      throw new Error(`its next turn (${activeTurnId}) never produced an SDK event id: ${getErrorMessage(err)}`);
    }
  }
  /**
   * Returns the SDK event ID associated with the given protocol turn.
   */
  getTurnEventId(turnId) {
    return this._databaseRef.object.getTurnEventId(turnId);
  }
  /**
   * Returns the SDK event ID of the earliest turn.
   */
  getFirstTurnEventId() {
    return this._databaseRef.object.getFirstTurnEventId();
  }
  /**
   * Truncates the session history via the SDK's RPC and cleans up
   * stale turns from the session database.
   *
   * @param eventId The SDK event ID at which to truncate. This event
   *        and all events after it are removed.
   * @param keepTurnId If provided, turns inserted after this turn are
   *        deleted from the DB. If omitted, all turns are deleted.
   */
  async truncateAtEventId(eventId, keepTurnId) {
    this._logService.info(`[Copilot:${this.sessionId}] Truncating via SDK RPC at eventId=${eventId}`);
    const result = await this._wrapper.session.rpc.history.truncate({ eventId });
    this._logService.info(`[Copilot:${this.sessionId}] SDK truncation removed ${result.eventsRemoved} events`);
    if (keepTurnId) {
      await this._databaseRef.object.deleteTurnsAfter(keepTurnId);
    } else {
      await this._databaseRef.object.deleteAllTurns();
    }
  }
  /**
   * Bulk-remaps turn IDs in this session's database.
   * Used after file-copying a source session's database for a fork.
   */
  async remapTurnIds(mapping) {
    await this._databaseRef.object.remapTurnIds(mapping);
  }
  // ---- cleanup ------------------------------------------------------------
  /**
   * Cancels every pending interaction for abort and dispose. This completes synchronously before any awaiter resumes, so ordering is not significant.
   */
  _cancelAllPendingInteractions() {
    this._cancelPendingAutoApprovals();
    this._denyPendingPermissions();
    this._cancelPendingUserInputs();
    this._cancelPendingElicitations();
    this._cancelPendingPlanReviews();
    this._cancelPendingMcpAuthRequests();
    this._cancelPendingMcpSamplings();
    this._cancelPendingClientToolCalls();
  }
  _cancelPendingAutoApprovals() {
    this._pendingAutoApprovals.denyAll(void 0);
    this._autoApprovals.clear();
  }
  _denyPendingPermissions() {
    for (const [toolCallId] of this._pendingPermissions.entries()) {
      this._deletePendingEditContent(toolCallId);
    }
    this._pendingPermissions.denyAll({ kind: "reject" });
    this._approvedDuplicablePermissionSignatures.clear();
  }
  /**
   * Removes any `pending-edit-content:` entries associated with a resolved
   * (approved, denied, or cancelled) permission request.
   */
  _deletePendingEditContent(toolCallId) {
    const uri = this._pendingEditContentUris.get(toolCallId);
    if (!uri) {
      return;
    }
    this._pendingEditContentUris.delete(toolCallId);
    this._fileService.del(uri).catch((err) => {
      this._logService.warn(`[Copilot:${this.sessionId}] Failed to delete pending edit content: ${uri.toString()}`, err);
    });
  }
  _cancelPendingUserInputs() {
    this._pendingUserInputs.denyAll({ response: "cancel" /* Cancel */ });
  }
  _cancelPendingElicitations() {
    this._pendingElicitations.denyAll({ response: "cancel" /* Cancel */ });
  }
  _cancelPendingPlanReviews() {
    this._pendingPlanReviews.denyAll({ approved: false });
  }
  _cancelPendingMcpSamplings() {
    const pending = Array.from(this._pendingMcpSamplings);
    this._pendingMcpSamplings.clear();
    for (const requestId of pending) {
      this._wrapper.session.rpc.mcp.cancelSamplingExecution({ requestId }).catch(() => {
      });
    }
  }
  _cancelPendingClientToolCalls() {
    this._pendingClientToolCalls.denyAll({ textResultForLlm: "Tool call cancelled: session ended", resultType: "failure", error: "Session ended" });
  }
};

CopilotAgentSession = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ISessionDataService),
  __decorateParam(4, IFileService),
  __decorateParam(5, INativeEnvironmentService),
  __decorateParam(6, IAgentConfigurationService),
  __decorateParam(7, IAgentHostCustomizationEnablementService),
  __decorateParam(8, IAgentHostPromptCache),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, ICopilotApiService),
  __decorateParam(11, IAgentHostOTelService)
], CopilotAgentSession);

function countUnifiedDiffLines(diff) {
  let added = 0;
  let removed = 0;
  for (const line of diff.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) {
      continue;
    }
    if (line.startsWith("+")) {
      added++;
    } else if (line.startsWith("-")) {
      removed++;
    }
  }
  if (added === 0 && removed === 0) {
    return void 0;
  }
  return { added, removed };
}

function readCopilotUsage(raw) {
  if (!raw || typeof raw !== "object") {
    return void 0;
  }
  const usage = raw.copilotUsage;
  if (!usage || typeof usage !== "object") {
    return void 0;
  }
  const totalNanoAiu = usage.totalNanoAiu;
  if (typeof totalNanoAiu !== "number" || !Number.isFinite(totalNanoAiu) || totalNanoAiu < 0) {
    return void 0;
  }
  return { ...usage, totalNanoAiu };
}

function toTokenCount(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : 0;
}

function normalizeQuotaSnapshots(raw) {
  if (!raw || typeof raw !== "object") {
    return void 0;
  }
  const result = {};
  let hasAny = false;
  for (const [quotaType, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object") {
      continue;
    }
    const v = value;
    const resetDateRaw = v.resetDate;
    const resetDate = typeof resetDateRaw === "string" ? resetDateRaw : resetDateRaw instanceof Date ? resetDateRaw.toISOString() : void 0;
    result[quotaType] = {
      isUnlimitedEntitlement: typeof v.isUnlimitedEntitlement === "boolean" ? v.isUnlimitedEntitlement : void 0,
      entitlementRequests: typeof v.entitlementRequests === "number" ? v.entitlementRequests : void 0,
      usedRequests: typeof v.usedRequests === "number" ? v.usedRequests : void 0,
      remainingPercentage: typeof v.remainingPercentage === "number" ? v.remainingPercentage : void 0,
      overage: typeof v.overage === "number" ? v.overage : void 0,
      overageAllowedWithExhaustedQuota: typeof v.overageAllowedWithExhaustedQuota === "boolean" ? v.overageAllowedWithExhaustedQuota : void 0,
      resetDate,
      tokenBasedBilling: typeof v.tokenBasedBilling === "boolean" ? v.tokenBasedBilling : void 0,
      overageEntitlement: typeof v.overageEntitlement === "number" ? v.overageEntitlement : void 0
    };
    hasAny = true;
  }
  return hasAny ? result : void 0;
}
export { getClientToolSdkPolicy, isCopilotSdkAuthRejection, isPermissionDeniedKind, mapPermissionResultToConfirmKind, normalizeMcpServerUrl, getEmptyToolResultText, getPlanActionDescription, getToolCommand, toCopilotSdkMode, elicitationFieldToQuestion, elicitationAnswerToFieldValue, getCopilotCLISessionStateDir, isCopilotSdkToolOutputTempFile, countUnifiedDiffLines, readCopilotUsage, toTokenCount, normalizeQuotaSnapshots, cp2, rm, DEFAULT_CLIENT_TOOL_SDK_POLICY, CLIENT_TOOL_SDK_POLICIES, SESSION_STATE_DIRECTORY, DEBUG_LOG_COLLECTION_RETRY_ATTEMPTS, DEBUG_LOG_COLLECTION_RETRY_DELAY_MS, EMPTY_TOOL_RESULT_TEXT, USER_DENIED_PERMISSION_RESULT, DirectUsageAccumulator, CopilotTurn, CopilotAgentSession };
