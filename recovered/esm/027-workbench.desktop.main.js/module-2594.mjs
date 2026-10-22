// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/agentHostChatDebugProvider.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { AgentHostCustomizationRecorder, AgentHostUsageRecorder, buildAgentHostCustomizationsUri, buildAgentHostUsageUri, readAgentHostCustomizationsSnapshot, readAgentHostUsageRecords } from "./module-2593.mjs";
import { AgentHostAgentDebugLogEnabledSettingId, AgentHostAgentDebugLogMaxEventsSettingId } from "./module-0985.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { COPILOT_CLI_EH_SCHEME, COPILOT_CLI_LOCAL_AH_SCHEME, buildLocalSessionStateUri, getCopilotCliSessionRawId, resolveEventsUri } from "./module-1109.mjs";
import { agentHostAuthority } from "./module-1000.mjs";
import { Schemas } from "./module-0033.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { dirname2, joinPath } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { buildDefaultChatUri, readUsageInfoMeta } from "./module-1007.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatDebugService } from "./module-1456.mjs";
import { IFileService } from "./module-0269.mjs";
import { IPathService } from "./module-0938.mjs";
import { IRemoteAgentHostService } from "./module-1808.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IAgentHostCustomizationService } from "./module-2131.mjs";
import { localize } from "./module-0001.mjs";
import { isCustomizationEnabled } from "./module-2112.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/agentHostChatDebugProvider.ts
var MAX_DISCOVERED_SESSIONS = 30;

var TITLE_READ_BYTES = 64 * 1024;

var MAX_RESOLVED_DETAILS = 5e4;

var DEFAULT_MAX_EVENTS_IN_MEMORY = 1e4;

var MAX_EVENT_PAYLOAD = 4e3;

var MAX_DETAIL_PAYLOAD = 1e5;

var AgentHostChatDebugContribution = class extends Disposable {
  constructor(_chatDebugService, _fileService, _pathService, _remoteAgentHostService, _agentHostService, _configurationService, _logService, _environmentService, _customizationService) {
    super();
    this._chatDebugService = _chatDebugService;
    this._fileService = _fileService;
    this._pathService = _pathService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._agentHostService = _agentHostService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._environmentService = _environmentService;
    this._customizationService = _customizationService;
    /** Resolved (expanded) detail for each emitted event id. */
    this._resolved = /* @__PURE__ */ new Map();
    /** Guards against concurrent/overlapping session discovery scans. */
    this._discovering = false;
    /** True once the lazy fetcher has run at least once (i.e. the panel has been opened). */
    this._hasFetchedOnce = false;
    /** Watches the currently-viewed session's events.jsonl for live refresh. */
    this._liveRefresh = this._register(new MutableDisposable());
    const provider = {
      provideChatDebugLog: (sessionResource, token) => this._provideChatDebugLog(sessionResource, token),
      resolveChatDebugLogEvent: async (eventId) => this._resolved.get(eventId)
    };
    this._register(this._chatDebugService.registerProvider(provider));
    this._register(new AgentHostUsageRecorder(
      this._environmentService.userRoamingDataHome,
      () => this._configurationService.getValue(AgentHostAgentDebugLogEnabledSettingId),
      this._fileService,
      this._logService,
      this._agentHostService,
      this._remoteAgentHostService
    ));
    this._register(new AgentHostCustomizationRecorder(
      this._environmentService.userRoamingDataHome,
      () => this._configurationService.getValue(AgentHostAgentDebugLogEnabledSettingId),
      this._fileService,
      this._logService,
      this._agentHostService,
      this._remoteAgentHostService
    ));
    this._register(this._chatDebugService.onDidEndSession((sessionResource) => {
      if (sessionResource.toString() === this._watchedSessionKey) {
        this._liveRefresh.clear();
        this._watchedSessionKey = void 0;
        this._liveRead = void 0;
        this._usageRead = void 0;
      }
    }));
    this._register(this._chatDebugService.registerAvailableSessionsFetcher((token) => this._fetchLocalSessions(token)));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AgentHostAgentDebugLogEnabledSettingId) && this._hasFetchedOnce) {
        this._maybeDiscoverLocalSessions();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.agentHostChatDebug";
  }
  /**
   * Lazy fetcher registered with {@link IChatDebugService}. Invoked (at most
   * once) when the home view first requests the available session list, so no
   * disk scan happens until the panel is opened. Returns nothing when file
   * logging is disabled.
   */
  async _fetchLocalSessions(token) {
    this._hasFetchedOnce = true;
    if (!this._configurationService.getValue(AgentHostAgentDebugLogEnabledSettingId)) {
      return [];
    }
    try {
      return await this._discoverLocalSessions(token);
    } catch (err) {
      this._logService.warn(`[AgentHostChatDebug] session discovery failed: ${toErrorMessage3(err)}`);
      return [];
    }
  }
  /**
   * Runs {@link _discoverLocalSessions} when file logging is enabled and adds
   * the results to the available-sessions list, guarding against overlapping
   * scans. Used for the re-scan when logging is enabled after the panel has
   * already loaded once (the initial load goes through {@link _fetchLocalSessions}).
   * Safe to call repeatedly: {@link IChatDebugService.addAvailableSessionResources}
   * dedupes by URI.
   */
  async _maybeDiscoverLocalSessions() {
    if (this._discovering || !this._configurationService.getValue(AgentHostAgentDebugLogEnabledSettingId)) {
      return;
    }
    this._discovering = true;
    try {
      const sessions = await this._discoverLocalSessions(CancellationToken.None);
      if (sessions.length > 0) {
        this._chatDebugService.addAvailableSessionResources(sessions);
      }
    } catch (err) {
      this._logService.warn(`[AgentHostChatDebug] session discovery failed: ${toErrorMessage3(err)}`);
    } finally {
      this._discovering = false;
    }
  }
  _resolveEventsUri(sessionResource) {
    const userHome = this._pathService.userHome({ preferLocal: true });
    const result = resolveEventsUri(
      sessionResource,
      userHome,
      (authority) => this._remoteAgentHostService.connections.find((c) => agentHostAuthority(c.address) === authority)
    );
    return result.kind === "ok" ? result.resource : void 0;
  }
  /**
   * Watches the given session's events.jsonl and re-invokes providers when it
   * changes, so the panel updates as new turns/requests stream in. Only one
   * session (the one currently shown) is watched at a time. Remote
   * (non-`file`) sessions are not watched; they still load on open.
   */
  _ensureLiveRefresh(sessionResource, eventsUri) {
    const key3 = sessionResource.toString();
    if (this._watchedSessionKey === key3) {
      return;
    }
    if (eventsUri.scheme !== Schemas.file) {
      this._liveRefresh.clear();
      this._watchedSessionKey = void 0;
      return;
    }
    this._watchedSessionKey = key3;
    const store = new DisposableStore();
    const scheduler = store.add(new RunOnceScheduler(() => {
      this._chatDebugService.invokeProviders(sessionResource);
    }, 400));
    const watcher = store.add(this._fileService.createWatcher(dirname2(eventsUri), { recursive: false, excludes: [] }));
    store.add(watcher.onDidChange((e) => {
      const affects = e.affects(eventsUri);
      if (affects) {
        scheduler.schedule();
      }
    }));
    const liveSub = this._sessionChatSubscription(sessionResource);
    if (liveSub) {
      store.add(liveSub.onDidChange(() => scheduler.schedule()));
    }
    store.add(this._customizationService.onDidChangeCustomizations(() => scheduler.schedule()));
    this._liveRefresh.value = store;
  }
  /**
   * Returns the live AHP chat-state subscription for a local Agent Host
   * session, if one is currently active (i.e. the session is open/subscribed).
   * Turns (and their usage) live on the session's default chat channel, so we
   * subscribe to that channel rather than the session. Read-only: never
   * creates a subscription.
   */
  _sessionChatSubscription(sessionResource) {
    if (sessionResource.scheme !== COPILOT_CLI_LOCAL_AH_SCHEME) {
      return void 0;
    }
    const rawId = getCopilotCliSessionRawId(sessionResource);
    if (!rawId) {
      return void 0;
    }
    const backendSession = URI.from({ scheme: COPILOT_CLI_EH_SCHEME, path: `/${rawId}` });
    const chatUri = URI.parse(buildDefaultChatUri(backendSession.toString()));
    return this._agentHostService.getSubscriptionUnmanaged(2 /* Chat */, chatUri);
  }
  /**
   * Reads live Copilot AIU from the AHP session state as a fallback usage
   * source for in-progress sessions (no `session.shutdown` summary yet).
   * Only AIU is reliable live; input/cache need the shutdown summary (F1).
   */
  _getLiveUsageTotals(sessionResource) {
    const chat = this._sessionChatSubscription(sessionResource)?.value;
    if (!chat || chat instanceof Error) {
      return void 0;
    }
    return sumChatStateUsage(chat);
  }
  /**
   * Reads the client-local usage sidecar for a session (exact per-request
   * token metrics captured live). Returns `undefined` when the session has no
   * sidecar (e.g. it ran before capture shipped), so the converter falls back
   * to the session.shutdown summary / live totals.
   */
  async _readUsageRecords(sessionResource) {
    const rawId = getCopilotCliSessionRawId(sessionResource);
    if (!rawId) {
      return void 0;
    }
    const uri5 = buildAgentHostUsageUri(this._environmentService.userRoamingDataHome, rawId);
    const key3 = uri5.toString();
    let size3;
    try {
      const stat = await this._fileService.stat(uri5);
      size3 = stat.size ?? 0;
    } catch {
      this._usageRead = void 0;
      return void 0;
    }
    if (this._usageRead?.key === key3 && this._usageRead.size === size3) {
      return this._usageRead.records.length > 0 ? this._usageRead.records : void 0;
    }
    const records = await readAgentHostUsageRecords(this._fileService, uri5);
    this._usageRead = { key: key3, size: size3, records };
    return records.length > 0 ? records : void 0;
  }
  /**
   * Reads the client-local customization snapshot for a session (the last
   * loaded skills/hooks/agents/MCP captured live). Used as a fallback for
   * historical/closed sessions, where the live customization service has no
   * active state subscription and returns nothing. Returns `undefined` when no
   * snapshot exists (e.g. the session ran before capture shipped).
   */
  async _readCustomizationsSnapshot(sessionResource) {
    const rawId = getCopilotCliSessionRawId(sessionResource);
    if (!rawId) {
      return void 0;
    }
    const uri5 = buildAgentHostCustomizationsUri(this._environmentService.userRoamingDataHome, rawId);
    const snapshot = await readAgentHostCustomizationsSnapshot(this._fileService, uri5);
    return snapshot && snapshot.length > 0 ? snapshot : void 0;
  }
  async _provideChatDebugLog(sessionResource, token) {
    if (!this._configurationService.getValue(AgentHostAgentDebugLogEnabledSettingId)) {
      return void 0;
    }
    const eventsUri = this._resolveEventsUri(sessionResource);
    if (!eventsUri) {
      return void 0;
    }
    this._ensureLiveRefresh(sessionResource, eventsUri);
    const records = await this._readEventRecords(eventsUri, token);
    if (records === void 0) {
      return void 0;
    }
    if (token.isCancellationRequested) {
      return void 0;
    }
    const liveUsageTotals = this._getLiveUsageTotals(sessionResource);
    const usageRecords = await this._readUsageRecords(sessionResource);
    if (token.isCancellationRequested) {
      return void 0;
    }
    let customizations = this._customizationService.getCustomizations(sessionResource);
    if (customizations.length === 0) {
      customizations = await this._readCustomizationsSnapshot(sessionResource) ?? customizations;
      if (token.isCancellationRequested) {
        return void 0;
      }
    }
    const { events, resolved } = convertAgentHostEventsToDebugEvents(records, sessionResource, liveUsageTotals, usageRecords, customizations);
    for (const [id2, detail2] of resolved) {
      this._resolved.set(id2, detail2);
      if (this._resolved.size > MAX_RESOLVED_DETAILS) {
        const first2 = this._resolved.keys().next().value;
        if (first2 !== void 0) {
          this._resolved.delete(first2);
        }
      }
    }
    return events;
  }
  /**
   * Reads the session's `events.jsonl` into parsed records, reading only the
   * bytes appended since the last read for the actively-viewed session.
   *
   * The Copilot CLI appends to `events.jsonl` line-by-line from a separate
   * process, so a live session is an append-only stream. Rather than
   * re-reading and re-`JSON.parse`-ing the whole (potentially multi-MB) file
   * on every change — which is O(N) per tick and O(N^2) over a long session —
   * we cache the parsed records plus the byte offset consumed so far and read
   * only the new tail. A full read is used on first view, a cache miss, or
   * when the file shrank (rotation/truncation).
   *
   * Byte offsets are only ever advanced to a newline boundary (`\n` is a
   * single byte that never appears inside a multi-byte UTF-8 sequence), so a
   * tail read never starts mid-codepoint; any trailing partial line is kept
   * as `pendingBytes` and prepended to the next read.
   *
   * Returns `undefined` when the file does not exist yet or cannot be read.
   */
  /**
   * The configured in-memory event cap for agent host sessions (see
   * {@link AgentHostAgentDebugLogMaxEventsSettingId}). The raw record cache is
   * trimmed to this many entries so a long-running session does not retain an
   * unbounded array, matching the capped public event buffer.
   */
  _maxRecordsInMemory() {
    const configured = this._configurationService.getValue(AgentHostAgentDebugLogMaxEventsSettingId);
    if (typeof configured === "number" && Number.isFinite(configured) && configured >= 1) {
      return Math.floor(configured);
    }
    return DEFAULT_MAX_EVENTS_IN_MEMORY;
  }
  /** Trims `records` in place to the most recent {@link _maxRecordsInMemory} entries. */
  _capRecordsInMemory(records) {
    const max = this._maxRecordsInMemory();
    if (records.length > max) {
      records.splice(0, records.length - max);
    }
  }
  async _readEventRecords(eventsUri, token) {
    const key3 = eventsUri.toString();
    let size3;
    try {
      const stat = await this._fileService.stat(eventsUri);
      size3 = stat.size ?? 0;
    } catch {
      this._liveRead = void 0;
      return void 0;
    }
    if (token.isCancellationRequested) {
      return void 0;
    }
    const cache2 = this._liveRead?.key === key3 ? this._liveRead : void 0;
    if (cache2 && size3 >= cache2.consumedBytes) {
      if (size3 === cache2.consumedBytes) {
        return cache2.records;
      }
      try {
        const content2 = await this._fileService.readFile(eventsUri, { position: cache2.consumedBytes, length: size3 - cache2.consumedBytes });
        if (token.isCancellationRequested) {
          return void 0;
        }
        const combined = cache2.pendingBytes.byteLength ? VSBuffer.concat([cache2.pendingBytes, content2.value]) : content2.value;
        const lastNewline2 = lastIndexOfNewline(combined);
        if (lastNewline2 >= 0) {
          appendJsonlRecords(combined.slice(0, lastNewline2 + 1).toString(), cache2.records);
          cache2.pendingBytes = combined.slice(lastNewline2 + 1);
        } else {
          cache2.pendingBytes = combined;
        }
        cache2.consumedBytes = size3;
        this._capRecordsInMemory(cache2.records);
        return cache2.records;
      } catch {
      }
    }
    let buffer;
    try {
      const content2 = await this._fileService.readFile(eventsUri);
      buffer = content2.value;
    } catch {
      this._liveRead = void 0;
      return void 0;
    }
    if (token.isCancellationRequested) {
      return void 0;
    }
    const lastNewline = lastIndexOfNewline(buffer);
    const records = [];
    if (lastNewline >= 0) {
      appendJsonlRecords(buffer.slice(0, lastNewline + 1).toString(), records);
    }
    this._capRecordsInMemory(records);
    this._liveRead = {
      key: key3,
      consumedBytes: buffer.byteLength,
      pendingBytes: lastNewline >= 0 ? buffer.slice(lastNewline + 1) : buffer,
      records
    };
    return records;
  }
  async _discoverLocalSessions(token) {
    const userHome = this._pathService.userHome({ preferLocal: true });
    const sessionStateDir = buildLocalSessionStateUri(userHome);
    let stat;
    try {
      stat = await this._fileService.resolve(sessionStateDir, { resolveMetadata: true });
    } catch {
      return [];
    }
    if (token.isCancellationRequested) {
      return [];
    }
    const folders = (stat.children ?? []).filter((child) => child.isDirectory).sort((a, b) => b.mtime - a.mtime).slice(0, MAX_DISCOVERED_SESSIONS);
    const found = await Promise.all(folders.map(async (folder) => {
      const eventsUri = joinPath(folder.resource, "events.jsonl");
      let title;
      try {
        const head = await this._fileService.readFile(eventsUri, { length: TITLE_READ_BYTES });
        title = extractSessionTitle(head.value.toString()) ?? fallbackSessionTitle(folder.name);
      } catch {
        return void 0;
      }
      return { uri: URI.from({ scheme: COPILOT_CLI_LOCAL_AH_SCHEME, path: `/${folder.name}` }), title };
    }));
    if (token.isCancellationRequested) {
      return [];
    }
    return found.filter((s) => s !== void 0);
  }
};

AgentHostChatDebugContribution = __decorateClass([
  __decorateParam(0, IChatDebugService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IPathService),
  __decorateParam(3, IRemoteAgentHostService),
  __decorateParam(4, IAgentHostService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IWorkbenchEnvironmentService),
  __decorateParam(8, IAgentHostCustomizationService)
], AgentHostChatDebugContribution);

function convertAgentHostEventsToDebugEvents(records, sessionResource, fallbackUsageTotals, usageRecords, customizations) {
  const completeByToolCallId = /* @__PURE__ */ new Map();
  const turnStartByTurnId = /* @__PURE__ */ new Map();
  const hookEndByInvocationId = /* @__PURE__ */ new Map();
  const permissionCompleteByRequestId = /* @__PURE__ */ new Map();
  const subagentCompleteByToolCallId = /* @__PURE__ */ new Map();
  for (const record of records) {
    if (record.type === "tool.execution_complete") {
      const toolCallId = asString2(record.data.toolCallId);
      if (toolCallId) {
        completeByToolCallId.set(toolCallId, record);
      }
    } else if (record.type === "assistant.turn_start") {
      const turnId = asString2(record.data.turnId);
      if (turnId) {
        turnStartByTurnId.set(turnId, record);
      }
    } else if (record.type === "hook.end") {
      const invocationId = asString2(record.data.hookInvocationId);
      if (invocationId) {
        hookEndByInvocationId.set(invocationId, record);
      }
    } else if (record.type === "permission.completed") {
      const requestId = asString2(record.data.requestId);
      if (requestId) {
        permissionCompleteByRequestId.set(requestId, record);
      }
    } else if (record.type === "subagent.completed") {
      const toolCallId = asString2(record.data.toolCallId);
      if (toolCallId) {
        subagentCompleteByToolCallId.set(toolCallId, record);
      }
    }
  }
  const events = [];
  const resolved = /* @__PURE__ */ new Map();
  const modelTurnRefs = [];
  let rootEventId;
  let rootCreated;
  const currentUserMessageByAgent = /* @__PURE__ */ new Map();
  const currentAssistantMessageByAgent = /* @__PURE__ */ new Map();
  const toolEventByToolCallId = /* @__PURE__ */ new Map();
  const hasConfiguredHooks = !!customizations && flattenCustomizations(customizations).some((c) => c.type === "hook" /* Hook */ && c.enabled);
  for (const record of records) {
    const created = new Date(record.timestamp);
    const agentKey2 = record.agentId ?? "";
    const turnParent = currentAssistantMessageByAgent.get(agentKey2) ?? currentUserMessageByAgent.get(agentKey2) ?? rootEventId;
    switch (record.type) {
      case "session.start": {
        rootEventId = record.id;
        rootCreated = created;
        const model = asString2(record.data.selectedModel);
        const effort = asString2(record.data.reasoningEffort);
        const version2 = asString2(record.data.copilotVersion);
        const context2 = asRecord(record.data.context);
        const repository = asString2(context2?.repository);
        const branch = asString2(context2?.branch);
        const parts = [];
        if (model) {
          parts.push(effort ? localize(10314, null, model, effort) : localize(10315, null, model));
        }
        if (version2) {
          parts.push(localize(10309, null, version2));
        }
        if (repository) {
          parts.push(branch ? localize(10312, null, repository, branch) : repository);
        }
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: void 0,
          name: localize(10313, null),
          details: parts.length ? parts.join(", ") : void 0,
          level: 1 /* Info */,
          category: "session"
        });
        break;
      }
      case "user.message": {
        const content2 = asString2(record.data.content) ?? "";
        const transformed = asString2(record.data.transformedContent);
        const sections = [
          { name: localize(10326, null), content: content2 }
        ];
        if (transformed && transformed !== content2) {
          sections.push({ name: localize(10286, null), content: transformed });
        }
        const message = summarize(content2);
        currentUserMessageByAgent.set(agentKey2, record.id);
        currentAssistantMessageByAgent.delete(agentKey2);
        events.push({ kind: "userMessage", id: record.id, sessionResource, created, parentEventId: rootEventId, message, sections });
        resolved.set(record.id, { kind: "message", type: "user", message, sections });
        break;
      }
      case "assistant.message": {
        const model = asString2(record.data.model);
        const outputTokens = asNumber(record.data.outputTokens);
        const content2 = asString2(record.data.content) ?? "";
        const reasoning = asString2(record.data.reasoningText);
        const parentToolCallId = asString2(record.data.parentToolCallId);
        const spawningTool = parentToolCallId ? toolEventByToolCallId.get(parentToolCallId) : void 0;
        const parentEventId = spawningTool ?? currentUserMessageByAgent.get(agentKey2) ?? rootEventId;
        const turnId = asString2(record.data.turnId);
        const turnStart = turnId ? turnStartByTurnId.get(turnId) : void 0;
        const durationInMillis = turnStart ? diffMillis(turnStart.timestamp, record.timestamp) : void 0;
        currentAssistantMessageByAgent.set(agentKey2, record.id);
        modelTurnRefs.push({ index: events.length, id: record.id, turnId, outputTokens });
        events.push({
          kind: "modelTurn",
          id: record.id,
          sessionResource,
          created,
          parentEventId,
          model,
          requestName: "copilotcli",
          outputTokens,
          durationInMillis
        });
        const sections = [];
        if (content2) {
          sections.push({ name: localize(10307, null), content: content2 });
        }
        if (reasoning) {
          sections.push({ name: localize(10306, null), content: reasoning });
        }
        resolved.set(record.id, { kind: "modelTurn", requestName: "copilotcli", model, outputTokens, durationInMillis, sections });
        break;
      }
      case "tool.execution_start": {
        const toolName = asString2(record.data.toolName) ?? "tool";
        const toolCallId = asString2(record.data.toolCallId);
        const complete = toolCallId ? completeByToolCallId.get(toolCallId) : void 0;
        const success = complete ? asBoolean2(complete.data.success) : void 0;
        const result = success === void 0 ? void 0 : success ? "success" : "error";
        const durationInMillis = complete ? diffMillis(record.timestamp, complete.timestamp) : void 0;
        const fullInput = stringifyPayload(record.data.arguments);
        const fullOutput = complete ? stringifyPayload(complete.data.result) : void 0;
        const parentToolCallId = asString2(record.data.parentToolCallId);
        const parentTool = parentToolCallId ? toolEventByToolCallId.get(parentToolCallId) : void 0;
        const parentEventId = parentTool ?? currentAssistantMessageByAgent.get(agentKey2) ?? currentUserMessageByAgent.get(agentKey2) ?? rootEventId;
        if (toolCallId) {
          toolEventByToolCallId.set(toolCallId, record.id);
        }
        events.push({
          kind: "toolCall",
          id: record.id,
          sessionResource,
          created,
          parentEventId,
          toolName,
          toolCallId,
          result,
          durationInMillis,
          input: truncate3(fullInput, MAX_EVENT_PAYLOAD),
          output: truncate3(fullOutput, MAX_EVENT_PAYLOAD)
        });
        resolved.set(record.id, {
          kind: "toolCall",
          toolName,
          result,
          durationInMillis,
          input: truncate3(fullInput, MAX_DETAIL_PAYLOAD),
          output: truncate3(fullOutput, MAX_DETAIL_PAYLOAD)
        });
        break;
      }
      // `tool.execution_complete` is folded into its start record above.
      case "session.error": {
        const message = asString2(record.data.message) ?? localize(10324, null);
        const errorType = asString2(record.data.errorType);
        const stack = asString2(record.data.stack);
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: turnParent,
          name: errorType ? localize(10311, null, errorType) : localize(10310, null),
          details: truncate3(message, MAX_EVENT_PAYLOAD),
          level: 3 /* Error */,
          category: "session"
        });
        const detailText = stack ? `${message}

${stack}` : message;
        resolved.set(record.id, { kind: "text", value: truncate3(detailText, MAX_DETAIL_PAYLOAD) ?? detailText });
        break;
      }
      case "session.warning": {
        const message = asString2(record.data.message) ?? "";
        const warningType = asString2(record.data.warningType);
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: turnParent,
          name: warningType ? localize(10317, null, warningType) : localize(10316, null),
          details: truncate3(message, MAX_EVENT_PAYLOAD),
          level: 2 /* Warning */,
          category: "session"
        });
        if (message) {
          resolved.set(record.id, { kind: "text", value: truncate3(message, MAX_DETAIL_PAYLOAD) ?? message });
        }
        break;
      }
      case "session.model_change": {
        const previousModel = asString2(record.data.previousModel);
        const newModel = asString2(record.data.newModel);
        const effort = asString2(record.data.reasoningEffort);
        const change = previousModel && newModel ? localize(10297, null, previousModel, newModel) : newModel;
        const details = change && effort ? localize(10296, null, change, effort) : change;
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: turnParent,
          name: localize(10295, null),
          details,
          level: 1 /* Info */,
          category: "session"
        });
        break;
      }
      case "hook.start": {
        const hookType = asString2(record.data.hookType) ?? "hook";
        const invocationId = asString2(record.data.hookInvocationId);
        const end = invocationId ? hookEndByInvocationId.get(invocationId) : void 0;
        const success = end ? asBoolean2(end.data.success) : void 0;
        const isError = hookType === "errorOccurred";
        if ((hookType === "preToolUse" || hookType === "postToolUse") && !hasConfiguredHooks) {
          break;
        }
        const hookParent = hookType === "preToolUse" ? currentUserMessageByAgent.get(agentKey2) ?? rootEventId : turnParent;
        if (!isError && success !== false) {
          events.push({
            kind: "generic",
            id: record.id,
            sessionResource,
            created,
            parentEventId: hookParent,
            name: localize(10291, null, hookType),
            level: 1 /* Info */,
            category: "hook"
          });
          const routineInput = stringifyPayload(record.data.input);
          resolved.set(record.id, {
            kind: "hook",
            hookType,
            result: success === void 0 ? void 0 : success ? 0 /* Success */ : 1 /* Error */,
            input: truncate3(routineInput, MAX_DETAIL_PAYLOAD)
          });
          break;
        }
        const input = asRecord(record.data.input);
        const errorContext = asString2(input?.errorContext);
        const recoverable = asBoolean2(input?.recoverable);
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: hookParent,
          name: isError ? errorContext ? localize(10289, null, errorContext) : localize(10288, null) : localize(10290, null, hookType),
          details: isError && recoverable !== void 0 ? recoverable ? localize(10292, null) : localize(10293, null) : void 0,
          level: isError ? recoverable === false ? 3 /* Error */ : 2 /* Warning */ : 3 /* Error */,
          category: "hook"
        });
        const inputText = stringifyPayload(record.data.input);
        const endError = asRecord(end?.data.error);
        const errorParts = endError ? [asString2(endError.message), asString2(endError.source)].filter((s) => !!s) : [];
        const outputText = end && end.data.output !== void 0 ? stringifyPayload(end.data.output) : void 0;
        resolved.set(record.id, {
          kind: "hook",
          hookType,
          result: success === void 0 ? void 0 : success ? 0 /* Success */ : 1 /* Error */,
          input: truncate3(inputText, MAX_DETAIL_PAYLOAD),
          output: outputText ? truncate3(outputText, MAX_DETAIL_PAYLOAD) : void 0,
          errorMessage: errorParts.length > 0 ? truncate3(errorParts.join("\n"), MAX_DETAIL_PAYLOAD) : void 0
        });
        break;
      }
      // `hook.end` is folded into its `hook.start` above.
      case "permission.requested": {
        const requestId = asString2(record.data.requestId);
        const permissionRequest = asRecord(record.data.permissionRequest);
        const kind = asString2(permissionRequest?.kind) ?? "permission";
        const intention = asString2(permissionRequest?.intention);
        const toolCallId = asString2(permissionRequest?.toolCallId);
        const completed = requestId ? permissionCompleteByRequestId.get(requestId) : void 0;
        const resultKind = completed ? asString2(asRecord(completed.data.result)?.kind) : void 0;
        if (resultKind === "approved") {
          break;
        }
        const parentEventId = (toolCallId ? toolEventByToolCallId.get(toolCallId) : void 0) ?? turnParent;
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId,
          name: resultKind ? localize(10303, null, resultKind, kind) : localize(10301, null, kind),
          details: intention,
          level: 2 /* Warning */,
          category: "permission"
        });
        const path = asString2(permissionRequest?.path);
        const lines = [
          localize(10299, null, kind),
          intention ? localize(10298, null, intention) : void 0,
          path ? localize(10300, null, path) : void 0,
          localize(10304, null, resultKind ?? localize(10302, null))
        ].filter((l) => !!l);
        resolved.set(record.id, { kind: "text", value: lines.join("\n") });
        break;
      }
      // `permission.completed` is folded into its `permission.requested` above.
      case "subagent.started": {
        const toolCallId = asString2(record.data.toolCallId);
        const agentName = asString2(record.data.agentDisplayName) ?? asString2(record.data.agentName) ?? "subagent";
        const description = asString2(record.data.agentDescription);
        const model = asString2(record.data.model);
        const complete = toolCallId ? subagentCompleteByToolCallId.get(toolCallId) : void 0;
        const toolCallCount = complete ? asNumber(complete.data.totalToolCalls) : void 0;
        const totalTokens = complete ? asNumber(complete.data.totalTokens) : void 0;
        const durationInMillis = complete ? asNumber(complete.data.durationMs) : void 0;
        const parentEventId = (toolCallId ? toolEventByToolCallId.get(toolCallId) : void 0) ?? turnParent;
        events.push({
          kind: "subagentInvocation",
          id: record.id,
          sessionResource,
          created,
          parentEventId,
          agentName,
          description,
          status: complete ? "completed" : "running",
          toolCallCount,
          durationInMillis
        });
        const lines = [
          localize(10321, null, agentName),
          model ? localize(10320, null, model) : void 0,
          toolCallCount !== void 0 ? localize(10323, null, toolCallCount) : void 0,
          totalTokens !== void 0 ? localize(10322, null, totalTokens) : void 0,
          description ? `
${description}` : void 0
        ].filter((l) => !!l);
        resolved.set(record.id, { kind: "text", value: lines.join("\n") });
        break;
      }
      // `subagent.completed` is folded into its `subagent.started` above.
      case "session.compaction_start": {
        const systemTokens = asNumber(record.data.systemTokens) ?? 0;
        const conversationTokens = asNumber(record.data.conversationTokens) ?? 0;
        const toolTokens = asNumber(record.data.toolDefinitionsTokens) ?? 0;
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: turnParent,
          name: localize(10277, null),
          details: localize(10279, null, systemTokens, conversationTokens, toolTokens),
          level: 1 /* Info */,
          category: "session"
        });
        break;
      }
      case "session.compaction_complete": {
        if (asBoolean2(record.data.success) !== false) {
          break;
        }
        const error = asString2(record.data.error);
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: turnParent,
          name: localize(10278, null),
          details: truncate3(error, MAX_EVENT_PAYLOAD),
          level: 3 /* Error */,
          category: "session"
        });
        if (error) {
          resolved.set(record.id, { kind: "text", value: truncate3(error, MAX_DETAIL_PAYLOAD) ?? error });
        }
        break;
      }
      case "abort": {
        const reason = asString2(record.data.reason);
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: turnParent,
          name: localize(10275, null),
          details: reason,
          level: 2 /* Warning */,
          category: "session"
        });
        break;
      }
      case "skill.invoked": {
        const name = asString2(record.data.name) ?? "skill";
        const trigger = asString2(record.data.trigger);
        const source = asString2(record.data.pluginName) ?? asString2(record.data.source);
        const content2 = asString2(record.data.content);
        events.push({
          kind: "generic",
          id: record.id,
          sessionResource,
          created,
          parentEventId: turnParent,
          name: localize(10319, null, name),
          details: [trigger, source].filter(Boolean).join(" \xB7 ") || void 0,
          level: 1 /* Info */,
          category: "customization"
        });
        if (content2) {
          resolved.set(record.id, { kind: "text", value: truncate3(content2, MAX_DETAIL_PAYLOAD) ?? content2 });
        }
        break;
      }
    }
  }
  const fillTurnsWithTotals = (targets, totals) => {
    const n2 = targets.length;
    if (n2 === 0) {
      return;
    }
    const inputs = totals.inputTokens !== void 0 ? distributeEvenly(totals.inputTokens, n2) : void 0;
    const cached = totals.cacheReadTokens !== void 0 ? distributeEvenly(totals.cacheReadTokens, n2) : void 0;
    const aiu = distributeEvenly(totals.totalNanoAiu, n2);
    for (let i2 = 0; i2 < n2; i2++) {
      const ref = targets[i2];
      const turn = events[ref.index];
      const inputTokens = inputs?.[i2];
      const cachedTokens = cached?.[i2];
      const totalTokens = inputTokens !== void 0 ? inputTokens + (ref.outputTokens ?? 0) : void 0;
      const copilotUsageNanoAiu = aiu[i2] > 0 ? aiu[i2] : void 0;
      events[ref.index] = { ...turn, inputTokens, cachedTokens, totalTokens, copilotUsageNanoAiu };
      const detail2 = resolved.get(ref.id);
      if (detail2?.kind === "modelTurn") {
        resolved.set(ref.id, { ...detail2, inputTokens, cachedTokens, totalTokens });
      }
    }
  };
  if (usageRecords && usageRecords.length > 0 && modelTurnRefs.length > 0) {
    const coverage = applyPerTurnUsage(events, resolved, modelTurnRefs, usageRecords);
    const uncovered = modelTurnRefs.filter((_ref2, i2) => !coverage.covered.has(i2));
    if (uncovered.length > 0) {
      const totals = extractSessionUsageTotals(records) ?? fallbackUsageTotals;
      if (totals) {
        fillTurnsWithTotals(uncovered, {
          inputTokens: totals.inputTokens !== void 0 ? Math.max(0, totals.inputTokens - coverage.assignedInput) : void 0,
          cacheReadTokens: totals.cacheReadTokens !== void 0 ? Math.max(0, totals.cacheReadTokens - coverage.assignedCache) : void 0,
          totalNanoAiu: Math.max(0, totals.totalNanoAiu - coverage.assignedAiu)
        });
      }
    }
  } else if (modelTurnRefs.length > 0) {
    const totals = extractSessionUsageTotals(records) ?? fallbackUsageTotals;
    if (totals) {
      fillTurnsWithTotals(modelTurnRefs, totals);
    }
  }
  if (customizations && customizations.length > 0) {
    const created = rootCreated ?? (records.length > 0 ? new Date(records[0].timestamp) : /* @__PURE__ */ new Date());
    const { events: customEvents, resolved: customResolved } = buildCustomizationDebugEvents(customizations, sessionResource, rootEventId, created);
    events.push(...customEvents);
    for (const [id2, detail2] of customResolved) {
      resolved.set(id2, detail2);
    }
  }
  return { events, resolved };
}

var CUSTOMIZATION_TYPE_ORDER = [
  "skill" /* Skill */,
  "hook" /* Hook */,
  "agent" /* Agent */,
  "mcpServer" /* McpServer */,
  "rule" /* Rule */,
  "prompt" /* Prompt */
];

function flattenCustomizations(customizations) {
  const out = [];
  const visit2 = (c) => {
    if (c.type === "plugin" /* Plugin */ || c.type === "directory" /* Directory */) {
      for (const child of c.children ?? []) {
        visit2(child);
      }
      return;
    }
    out.push({
      type: c.type,
      name: c.name,
      uri: c.uri,
      enabled: c.type === "mcpServer" /* McpServer */ ? isCustomizationEnabled(c) : c.enabled !== false,
      description: c.description
    });
  };
  for (const c of customizations) {
    visit2(c);
  }
  return out;
}

function customizationDiscoveryName(type) {
  switch (type) {
    case "skill" /* Skill */:
      return localize(10318, null);
    case "hook" /* Hook */:
      return localize(10287, null);
    case "agent" /* Agent */:
      return localize(10276, null);
    case "mcpServer" /* McpServer */:
      return localize(10294, null);
    case "rule" /* Rule */:
      return localize(10308, null);
    case "prompt" /* Prompt */:
      return localize(10305, null);
    default:
      return localize(10281, null);
  }
}

function customizationSummaryCategory(c) {
  if (!c.enabled) {
    return "skipped";
  }
  switch (c.type) {
    case "skill" /* Skill */:
      return "skill";
    case "agent" /* Agent */:
      return "custom-agent";
    case "hook" /* Hook */:
      return "hook";
    case "rule" /* Rule */:
      return "applying";
    default:
      return void 0;
  }
}

function buildCustomizationDebugEvents(customizations, sessionResource, parentEventId, created) {
  const events = [];
  const resolved = /* @__PURE__ */ new Map();
  const flat = flattenCustomizations(customizations);
  if (flat.length === 0) {
    return { events, resolved };
  }
  const byType = /* @__PURE__ */ new Map();
  for (const c of flat) {
    const list2 = byType.get(c.type);
    if (list2) {
      list2.push(c);
    } else {
      byType.set(c.type, [c]);
    }
  }
  const key3 = sessionResource.toString();
  for (const type of CUSTOMIZATION_TYPE_ORDER) {
    const list2 = byType.get(type);
    if (!list2 || list2.length === 0) {
      continue;
    }
    const id2 = `agentHostCustomization:${key3}:${type}`;
    const loadedCount = list2.filter((c) => c.enabled).length;
    const skippedCount = list2.length - loadedCount;
    events.push({
      kind: "generic",
      id: id2,
      sessionResource,
      created,
      parentEventId,
      name: customizationDiscoveryName(type),
      details: skippedCount > 0 ? localize(10283, null, loadedCount, skippedCount) : localize(10282, null, loadedCount),
      level: 1 /* Info */,
      category: "discovery"
    });
    const files = list2.map((c) => ({
      uri: URI.parse(c.uri),
      name: c.name,
      status: c.enabled ? "loaded" : "skipped",
      skipReason: c.enabled ? void 0 : localize(10280, null)
    }));
    resolved.set(id2, { kind: "fileList", discoveryType: type, durationInMillis: 0, files });
  }
  const logs = [];
  for (const c of flat) {
    const category11 = customizationSummaryCategory(c);
    if (!category11) {
      continue;
    }
    logs.push({ category: category11, name: c.name, uri: URI.parse(c.uri), reason: c.description });
  }
  if (logs.length > 0) {
    const id2 = `agentHostCustomization:${key3}:summary`;
    const counts = {
      instructions: logs.filter((e) => e.category === "applying" || e.category === "referenced").length,
      skills: logs.filter((e) => e.category === "skill").length,
      agents: logs.filter((e) => e.category === "custom-agent").length,
      hooks: logs.filter((e) => e.category === "hook").length,
      skipped: logs.filter((e) => e.category === "skipped").length
    };
    events.push({
      kind: "generic",
      id: id2,
      sessionResource,
      created,
      parentEventId,
      name: localize(10284, null),
      details: localize(10285, null, counts.skills, counts.agents, counts.hooks, counts.instructions),
      level: 1 /* Info */,
      category: "customization"
    });
    resolved.set(id2, { kind: "customizationSummary", resolutionLogs: logs, durationInMillis: 0, counts });
  }
  return { events, resolved };
}

function applyPerTurnUsage(events, resolved, modelTurnRefs, usageRecords) {
  const assign = (ref, inputTokens, cachedTokens, copilotUsageNanoAiu) => {
    const turn = events[ref.index];
    const totalTokens = inputTokens !== void 0 ? inputTokens + (ref.outputTokens ?? 0) : void 0;
    events[ref.index] = { ...turn, inputTokens, cachedTokens, totalTokens, copilotUsageNanoAiu };
    const detail2 = resolved.get(ref.id);
    if (detail2?.kind === "modelTurn") {
      resolved.set(ref.id, { ...detail2, inputTokens, cachedTokens, totalTokens });
    }
  };
  const aiuByRecordIndex = new Array(usageRecords.length).fill(void 0);
  for (let start = 0; start < usageRecords.length; ) {
    let end = start;
    while (end + 1 < usageRecords.length && usageRecords[end + 1].turnId === usageRecords[start].turnId) {
      end++;
    }
    let maxAiu = 0;
    for (let i2 = start; i2 <= end; i2++) {
      maxAiu = Math.max(maxAiu, usageRecords[i2].totalNanoAiu ?? 0);
    }
    if (maxAiu > 0) {
      aiuByRecordIndex[end] = maxAiu;
    }
    start = end + 1;
  }
  let recordIndex = 0;
  let assignedInput = 0;
  let assignedCache = 0;
  let assignedAiu = 0;
  const covered = /* @__PURE__ */ new Set();
  for (let refIdx = 0; refIdx < modelTurnRefs.length; refIdx++) {
    if (recordIndex >= usageRecords.length) {
      break;
    }
    const ref = modelTurnRefs[refIdx];
    const record = usageRecords[recordIndex];
    if (ref.outputTokens !== void 0 && record.outputTokens !== void 0 && ref.outputTokens !== record.outputTokens) {
      continue;
    }
    const aiu = aiuByRecordIndex[recordIndex];
    assign(ref, record.inputTokens, record.cacheReadTokens, aiu);
    assignedInput += record.inputTokens ?? 0;
    assignedCache += record.cacheReadTokens ?? 0;
    assignedAiu += aiu ?? 0;
    covered.add(refIdx);
    recordIndex++;
  }
  return { covered, assignedInput, assignedCache, assignedAiu };
}

function extractSessionUsageTotals(records) {
  let shutdown;
  for (const record of records) {
    if (record.type === "session.shutdown") {
      shutdown = record;
    }
  }
  if (!shutdown) {
    return void 0;
  }
  let inputTokens = 0;
  let cacheReadTokens = 0;
  let perModelNanoAiu = 0;
  const modelMetrics = shutdown.data.modelMetrics;
  if (modelMetrics && typeof modelMetrics === "object") {
    for (const metric of Object.values(modelMetrics)) {
      const entry = metric;
      const usage = entry?.usage;
      inputTokens += asNumber(usage?.inputTokens) ?? 0;
      cacheReadTokens += asNumber(usage?.cacheReadTokens) ?? 0;
      perModelNanoAiu += asNumber(entry?.totalNanoAiu) ?? 0;
    }
  }
  const totalNanoAiu = asNumber(shutdown.data.totalNanoAiu) ?? perModelNanoAiu;
  return { inputTokens, cacheReadTokens, totalNanoAiu };
}

function distributeEvenly(total, n2) {
  if (n2 <= 0) {
    return [];
  }
  const base = Math.floor(total / n2);
  const parts = new Array(n2).fill(base);
  let remainder = total - base * n2;
  for (let i2 = n2 - 1; remainder > 0; i2--, remainder--) {
    parts[i2] += 1;
  }
  return parts;
}

function sumChatStateUsage(chat) {
  let totalNanoAiu = 0;
  let hasUsage = false;
  const add = (usage) => {
    if (!usage) {
      return;
    }
    hasUsage = true;
    totalNanoAiu += readCopilotNanoAiu(usage);
  };
  for (const turn of chat.turns) {
    add(turn.usage);
  }
  add(chat.activeTurn?.usage);
  return hasUsage ? { totalNanoAiu } : void 0;
}

function readCopilotNanoAiu(usage) {
  return readUsageInfoMeta(usage).copilotUsage?.totalNanoAiu ?? 0;
}

function parseJsonl(text2) {
  const records = [];
  appendJsonlRecords(text2, records);
  return records;
}

function appendJsonlRecords(text2, records) {
  for (const line of text2.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed.type === "string" && typeof parsed.id === "string" && typeof parsed.timestamp === "string" && (parsed.parentId === null || typeof parsed.parentId === "string") && parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)) {
        records.push(parsed);
      }
    } catch {
    }
  }
}

function lastIndexOfNewline(buffer) {
  const bytes = buffer.buffer;
  for (let i2 = bytes.length - 1; i2 >= 0; i2--) {
    if (bytes[i2] === 10) {
      return i2;
    }
  }
  return -1;
}

function fallbackSessionTitle(sessionId) {
  return localize(10325, null, sessionId.slice(0, 8));
}

function extractSessionTitle(text2) {
  for (const record of parseJsonl(text2)) {
    if (record.type === "user.message") {
      const content2 = asString2(record.data.content);
      if (content2) {
        return summarize(content2);
      }
    }
  }
  return void 0;
}

function asString2(value2) {
  return typeof value2 === "string" ? value2 : void 0;
}

function asNumber(value2) {
  return typeof value2 === "number" && isFinite(value2) ? value2 : void 0;
}

function asBoolean2(value2) {
  return typeof value2 === "boolean" ? value2 : void 0;
}

function asRecord(value2) {
  return value2 && typeof value2 === "object" && !Array.isArray(value2) ? value2 : void 0;
}

function diffMillis(start, end) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return isFinite(a) && isFinite(b) && b >= a ? b - a : void 0;
}

function stringifyPayload(value2) {
  if (value2 === void 0 || value2 === null) {
    return void 0;
  }
  if (typeof value2 === "string") {
    return value2;
  }
  try {
    return JSON.stringify(value2, void 0, 2);
  } catch {
    return void 0;
  }
}

function truncate3(value2, max) {
  if (value2 === void 0) {
    return void 0;
  }
  return value2.length > max ? value2.slice(0, max) + "\u2026" : value2;
}

function summarize(content2) {
  const firstLine3 = content2.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
  return firstLine3.length > 100 ? firstLine3.slice(0, 100) + "\u2026" : firstLine3;
}

function toErrorMessage3(err) {
  return err instanceof Error ? err.message : String(err);
}
export { convertAgentHostEventsToDebugEvents, flattenCustomizations, customizationDiscoveryName, customizationSummaryCategory, buildCustomizationDebugEvents, applyPerTurnUsage, extractSessionUsageTotals, distributeEvenly, sumChatStateUsage, readCopilotNanoAiu, parseJsonl, appendJsonlRecords, lastIndexOfNewline, fallbackSessionTitle, extractSessionTitle, asString2, asNumber, asBoolean2, asRecord, diffMillis, stringifyPayload, truncate3, summarize, toErrorMessage3, MAX_DISCOVERED_SESSIONS, TITLE_READ_BYTES, MAX_RESOLVED_DETAILS, DEFAULT_MAX_EVENTS_IN_MEMORY, MAX_EVENT_PAYLOAD, MAX_DETAIL_PAYLOAD, AgentHostChatDebugContribution, CUSTOMIZATION_TYPE_ORDER };
