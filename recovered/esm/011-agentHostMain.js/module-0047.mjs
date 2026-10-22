// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionState.ts
import { URI } from "./module-0023.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0029.mjs";
import { hasKey } from "./module-0008.mjs";
import { readToolCallMeta } from "./module-0046.mjs";
import { distinct } from "./module-0005.mjs";


// src/vs/platform/agentHost/common/state/sessionState.ts
function getErrorResponsePart(turn) {
  if (!turn) {
    return void 0;
  }
  const part = turn.responseParts.at(-1);
  return part?.kind === "error" /* Error */ ? part : void 0;
}

function createErrorResponsePart(error, resumable = false) {
  return {
    kind: "error" /* Error */,
    error,
    ...resumable ? { resumable: true } : {}
  };
}

function mergeLogicalTurnUsage(previous, current) {
  if (!previous) {
    return current;
  }
  if (!current) {
    return previous;
  }
  const previousMeta = readUsageInfoMeta(previous);
  const currentMeta = readUsageInfoMeta(current);
  const cost = sumDefined(previousMeta.cost, currentMeta.cost);
  const totalNanoAiu = sumDefined(previousMeta.copilotUsage?.totalNanoAiu, currentMeta.copilotUsage?.totalNanoAiu);
  const turnTokenTotals = mergeTurnTokenTotals(previousMeta.turnTokenTotals, currentMeta.turnTokenTotals);
  const directTotalNanoAiu = sumDefined(previousMeta.directCopilotUsage?.totalNanoAiu, currentMeta.directCopilotUsage?.totalNanoAiu);
  const directTurnTokenTotals = mergeTurnTokenTotals(previousMeta.directTurnTokenTotals, currentMeta.directTurnTokenTotals);
  const meta = previous._meta !== void 0 || current._meta !== void 0 ? {
    ...previous._meta,
    ...current._meta,
    ...cost !== void 0 ? { cost } : {},
    ...previousMeta.copilotUsage || currentMeta.copilotUsage ? {
      copilotUsage: {
        ...previousMeta.copilotUsage,
        ...currentMeta.copilotUsage,
        ...totalNanoAiu !== void 0 ? { totalNanoAiu } : {}
      }
    } : {},
    ...turnTokenTotals ? { turnTokenTotals } : {},
    ...directTotalNanoAiu !== void 0 ? { directCopilotUsage: { totalNanoAiu: directTotalNanoAiu } } : {},
    ...directTurnTokenTotals ? { directTurnTokenTotals } : {}
  } : void 0;
  return {
    ...previous,
    ...current,
    model: current.model ?? previous.model,
    ...meta ? { _meta: meta } : {}
  };
}

function sumDefined(first, second) {
  return first === void 0 ? second : second === void 0 ? first : first + second;
}

function mergeTurnTokenTotals(previous, current) {
  if (!previous && !current) {
    return void 0;
  }
  const totals = /* @__PURE__ */ new Map();
  for (const total of [...previous ?? [], ...current ?? []]) {
    const existing = totals.get(total.model);
    totals.set(total.model, existing ? {
      model: total.model,
      inputTokens: existing.inputTokens + total.inputTokens,
      cachedTokens: existing.cachedTokens + total.cachedTokens,
      outputTokens: existing.outputTokens + total.outputTokens
    } : { ...total });
  }
  return [...totals.values()];
}

var AUTOMATION_CATALOG_URI = "ahp-automations://catalog";

function isAhpAutomationCatalogChannel(uri) {
  return uri === AUTOMATION_CATALOG_URI;
}

function isAhpAutomationRunChannel(uri) {
  try {
    return URI.parse(uri).scheme === "ahp-automation-run";
  } catch {
    return false;
  }
}

var MESSAGE_HIDDEN_FROM_TRANSCRIPT_META_KEY = "vscode.chat.hiddenFromTranscript";

var MESSAGE_HIDDEN_FROM_TRANSCRIPT_PREFIX = "<!-- vscode-hidden-from-transcript -->\n";

function withMessageHiddenFromTranscript(message, hidden) {
  if (!hidden) {
    return message;
  }
  return {
    ...message,
    text: message.text.startsWith(MESSAGE_HIDDEN_FROM_TRANSCRIPT_PREFIX) ? message.text : MESSAGE_HIDDEN_FROM_TRANSCRIPT_PREFIX + message.text,
    _meta: {
      ...message._meta,
      [MESSAGE_HIDDEN_FROM_TRANSCRIPT_META_KEY]: true
    }
  };
}

function readAccountQuotaSnapshot(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  const snapshot = {};
  if (typeof raw["isUnlimitedEntitlement"] === "boolean") {
    snapshot.isUnlimitedEntitlement = raw["isUnlimitedEntitlement"];
  }
  if (typeof raw["entitlementRequests"] === "number") {
    snapshot.entitlementRequests = raw["entitlementRequests"];
  }
  if (typeof raw["usedRequests"] === "number") {
    snapshot.usedRequests = raw["usedRequests"];
  }
  if (typeof raw["remainingPercentage"] === "number") {
    snapshot.remainingPercentage = raw["remainingPercentage"];
  }
  if (typeof raw["overage"] === "number") {
    snapshot.overage = raw["overage"];
  }
  if (typeof raw["overageAllowedWithExhaustedQuota"] === "boolean") {
    snapshot.overageAllowedWithExhaustedQuota = raw["overageAllowedWithExhaustedQuota"];
  }
  if (typeof raw["resetDate"] === "string") {
    snapshot.resetDate = raw["resetDate"];
  }
  if (typeof raw["tokenBasedBilling"] === "boolean") {
    snapshot.tokenBasedBilling = raw["tokenBasedBilling"];
  }
  if (typeof raw["overageEntitlement"] === "number") {
    snapshot.overageEntitlement = raw["overageEntitlement"];
  }
  return snapshot;
}

function readUsageInfoMeta(usage) {
  const meta = usage?._meta;
  if (!meta) {
    return {};
  }
  const result = {};
  if (typeof meta["cost"] === "number") {
    result.cost = meta["cost"];
  }
  const autoModeResolved = readAutoModeResolvedInfo(meta["autoModeResolved"]);
  if (autoModeResolved) {
    result.autoModeResolved = autoModeResolved;
  }
  const copilotUsage = meta["copilotUsage"];
  if (copilotUsage && typeof copilotUsage === "object" && !Array.isArray(copilotUsage)) {
    const rawUsage = copilotUsage;
    const usage2 = {};
    if (typeof rawUsage["totalNanoAiu"] === "number") {
      usage2.totalNanoAiu = rawUsage["totalNanoAiu"];
    }
    if (typeof rawUsage["sessionTotalNanoAiu"] === "number") {
      usage2.sessionTotalNanoAiu = rawUsage["sessionTotalNanoAiu"];
    }
    result.copilotUsage = usage2;
  }
  const quotaSnapshots = meta["quotaSnapshots"];
  if (quotaSnapshots && typeof quotaSnapshots === "object" && !Array.isArray(quotaSnapshots)) {
    const snapshots = {};
    for (const [quotaType, value] of Object.entries(quotaSnapshots)) {
      snapshots[quotaType] = readAccountQuotaSnapshot(value);
    }
    result.quotaSnapshots = snapshots;
  }
  const contextAttribution = readContextAttribution(meta["contextAttribution"]);
  if (contextAttribution) {
    result.contextAttribution = contextAttribution;
  }
  const turnTokenTotals = readTurnTokenTotals(meta["turnTokenTotals"]);
  if (turnTokenTotals) {
    result.turnTokenTotals = turnTokenTotals;
  }
  const directTurnTokenTotals = readTurnTokenTotals(meta["directTurnTokenTotals"]);
  if (directTurnTokenTotals) {
    result.directTurnTokenTotals = directTurnTokenTotals;
  }
  const directCopilotUsage = meta["directCopilotUsage"];
  if (directCopilotUsage && typeof directCopilotUsage === "object" && !Array.isArray(directCopilotUsage)) {
    const totalNanoAiu = directCopilotUsage["totalNanoAiu"];
    if (typeof totalNanoAiu === "number") {
      result.directCopilotUsage = { totalNanoAiu };
    }
  }
  return result;
}

function readTurnTokenTotals(value) {
  if (!Array.isArray(value)) {
    return void 0;
  }
  const totals = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const raw = item;
    if (typeof raw["model"] !== "string" || !raw["model"] || !isTokenCount(raw["inputTokens"]) || !isTokenCount(raw["cachedTokens"]) || !isTokenCount(raw["outputTokens"])) {
      continue;
    }
    totals.push({
      model: raw["model"],
      inputTokens: raw["inputTokens"],
      cachedTokens: raw["cachedTokens"],
      outputTokens: raw["outputTokens"]
    });
  }
  return totals.length > 0 ? totals : void 0;
}

function isTokenCount(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function hasReportedUsage(usage) {
  if (!usage) {
    return false;
  }
  if (typeof usage.inputTokens === "number" || typeof usage.outputTokens === "number") {
    return true;
  }
  const meta = readUsageInfoMeta(usage);
  return typeof meta.copilotUsage?.totalNanoAiu === "number" && meta.copilotUsage.totalNanoAiu >= 0 || typeof meta.copilotUsage?.sessionTotalNanoAiu === "number" && meta.copilotUsage.sessionTotalNanoAiu >= 0 || typeof meta.cost === "number" && meta.cost >= 0;
}

function readAutoModeResolvedInfo(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  if (typeof raw["chosenModel"] !== "string") {
    return void 0;
  }
  const result = { chosenModel: raw["chosenModel"] };
  const reasoningBucket = raw["reasoningBucket"];
  if (reasoningBucket === "low" || reasoningBucket === "medium" || reasoningBucket === "high") {
    result.reasoningBucket = reasoningBucket;
  }
  const categoryScores = raw["categoryScores"];
  if (categoryScores && typeof categoryScores === "object" && !Array.isArray(categoryScores)) {
    const scores = {};
    for (const [category, score] of Object.entries(categoryScores)) {
      if (typeof score === "number") {
        scores[category] = score;
      }
    }
    result.categoryScores = scores;
  }
  if (typeof raw["predictedLabel"] === "string") {
    result.predictedLabel = raw["predictedLabel"];
  }
  if (typeof raw["confidence"] === "number") {
    result.confidence = raw["confidence"];
  }
  if (Array.isArray(raw["candidateModels"]) && raw["candidateModels"].every((candidate) => typeof candidate === "string")) {
    result.candidateModels = raw["candidateModels"];
  }
  return result;
}

function readContextAttribution(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  if (typeof raw["totalTokens"] !== "number" || !Array.isArray(raw["entries"])) {
    return void 0;
  }
  const entries = [];
  for (const item of raw["entries"]) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const entry = item;
    if (typeof entry["kind"] !== "string" || typeof entry["id"] !== "string" || typeof entry["label"] !== "string" || typeof entry["tokens"] !== "number") {
      continue;
    }
    entries.push({
      kind: entry["kind"],
      id: entry["id"],
      label: entry["label"],
      tokens: entry["tokens"],
      parentId: typeof entry["parentId"] === "string" ? entry["parentId"] : void 0,
      attributes: entry["attributes"] && typeof entry["attributes"] === "object" && !Array.isArray(entry["attributes"]) ? filterStringAttributes(entry["attributes"]) : void 0
    });
  }
  const compactionsRaw = raw["compactions"];
  const compactions = compactionsRaw && typeof compactionsRaw === "object" && !Array.isArray(compactionsRaw) && typeof compactionsRaw["count"] === "number" ? { count: compactionsRaw["count"] } : { count: 0 };
  return { totalTokens: raw["totalTokens"], entries, compactions };
}

function filterStringAttributes(raw) {
  const result = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" || value === void 0) {
      result[key] = value;
    }
  }
  return result;
}

var ROOT_STATE_URI = "ahp-root://";

var AHP_ROOT_SCHEME = "ahp-root";

var AHP_RESOURCE_WATCH_SCHEME = "ahp-resource-watch";

function buildResourceWatchChannelUri(descriptor) {
  const payload = { root: descriptor.root };
  if (descriptor.recursive) {
    payload.recursive = true;
  }
  if (descriptor.excludes && descriptor.excludes.items.length > 0) {
    payload.excludes = [...descriptor.excludes.items];
  }
  if (descriptor.includes && descriptor.includes.items.length > 0) {
    payload.includes = [...descriptor.includes.items];
  }
  const json = encodeBase64(VSBuffer.fromString(JSON.stringify(payload)), false, true);
  return `${AHP_RESOURCE_WATCH_SCHEME}://r/${json}`;
}

function parseResourceWatchChannelUri(uri) {
  let parsed;
  try {
    parsed = URI.parse(uri);
  } catch {
    return void 0;
  }
  if (parsed.scheme !== AHP_RESOURCE_WATCH_SCHEME) {
    return void 0;
  }
  const encoded = parsed.path.replace(/^\//, "");
  if (!encoded) {
    return void 0;
  }
  try {
    const payload = JSON.parse(decodeBase64(encoded).toString());
    if (typeof payload.root !== "string") {
      return void 0;
    }
    return {
      root: payload.root,
      recursive: payload.recursive === true,
      ...Array.isArray(payload.excludes) ? { excludes: { items: payload.excludes.filter((x2) => typeof x2 === "string") } } : {},
      ...Array.isArray(payload.includes) ? { includes: { items: payload.includes.filter((x2) => typeof x2 === "string") } } : {}
    };
  } catch {
    return void 0;
  }
}

function isAhpResourceWatchChannel(uri) {
  try {
    return URI.parse(uri).scheme === AHP_RESOURCE_WATCH_SCHEME;
  } catch {
    return false;
  }
}

function isAhpRootChannel(uri) {
  if (uri === ROOT_STATE_URI) {
    return true;
  }
  try {
    return URI.parse(uri).scheme === AHP_ROOT_SCHEME;
  } catch {
    return false;
  }
}

function customizationId(uri, range) {
  if (!range) {
    return uri;
  }
  const safeUri = uri.replace(/#/g, "%23");
  return `${safeUri}#range=${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
}

function getInlineToolInput(toolInput) {
  return typeof toolInput === "string" ? toolInput : void 0;
}

function getToolFileEdits(result) {
  if (!result.content || result.content.length === 0) {
    return [];
  }
  const edits = [];
  for (const c of result.content) {
    if (hasKey(c, { type: true }) && c.type === "fileEdit" /* FileEdit */) {
      edits.push(c);
    }
  }
  return edits;
}

var SUBAGENT_URI_SEGMENT = "subagent";

var SUBAGENT_URI_MARKER = `/${SUBAGENT_URI_SEGMENT}/`;

var SUBAGENT_URI_PATH_REGEX = /^(?<parentPath>.+)\/subagent\/(?<toolCallId>.+)$/;

function asResourceUri(uri) {
  return typeof uri === "string" ? URI.parse(uri) : uri;
}

function getSubagentBasePath(parentSession) {
  const parent = asResourceUri(parentSession);
  const parentPath = parent.path.endsWith("/") ? parent.path.slice(0, -1) : parent.path;
  return { parent, path: `${parentPath}${SUBAGENT_URI_MARKER}` };
}

function buildSubagentSessionUri(parentSession, toolCallId) {
  const { parent, path } = getSubagentBasePath(parentSession);
  return parent.with({ path: `${path}${toolCallId}` }).toString();
}

function parseSubagentSessionUri(uri) {
  const resource = asResourceUri(uri);
  const match2 = SUBAGENT_URI_PATH_REGEX.exec(resource.path);
  if (!match2?.groups) {
    return void 0;
  }
  return {
    parentSession: resource.with({ path: match2.groups.parentPath }),
    toolCallId: match2.groups.toolCallId
  };
}

function isSubagentSession(uri) {
  return parseSubagentSessionUri(uri) !== void 0;
}

function buildSubagentSessionUriPrefix(parentSession) {
  const { parent, path } = getSubagentBasePath(parentSession);
  return parent.with({ path }).toString();
}

function createRootState() {
  return {
    agents: [],
    activeSessions: 0
  };
}

function createSessionState(summary) {
  const state = {
    provider: summary.provider,
    title: summary.title,
    status: summary.status,
    lifecycle: "creating" /* Creating */,
    activeClients: [],
    chats: [],
    defaultChat: void 0
  };
  if (summary.activity !== void 0) {
    state.activity = summary.activity;
  }
  if (summary.project !== void 0) {
    state.project = summary.project;
  }
  if (summary.workingDirectories !== void 0) {
    state.workingDirectories = summary.workingDirectories;
  }
  if (summary.annotations !== void 0) {
    state.annotations = summary.annotations;
  }
  if (summary._meta !== void 0) {
    state._meta = summary._meta;
  }
  return state;
}

function createChatState(summary) {
  return {
    resource: summary.resource,
    title: summary.title,
    status: summary.status,
    activity: summary.activity,
    modifiedAt: summary.modifiedAt,
    origin: summary.origin,
    interactivity: summary.interactivity,
    workingDirectories: summary.workingDirectories,
    turns: [],
    activeTurn: void 0
  };
}

function createDefaultChatSummary(session, chatUri) {
  const summary = {
    resource: chatUri,
    title: session.title,
    status: session.status,
    modifiedAt: session.modifiedAt,
    origin: { kind: "user" /* User */ }
  };
  if (session.activity !== void 0) {
    summary.activity = session.activity;
  }
  return summary;
}

var STATUS_ACTIVITY_MASK = (1 << 5) - 1;

function hasAutoApprovedPendingConfirmation(state) {
  return !!state.activeTurn?.responseParts.some(
    (part) => part.kind === "toolCall" /* ToolCall */ && part.toolCall.status === "pending-confirmation" /* PendingConfirmation */ && readToolCallMeta(part.toolCall).autoApproveBySetting === true
  );
}

function chatAwaitsUserInput(state) {
  return !!state.activeTurn?.responseParts.some((part) => {
    if (part.kind === "inputRequest" /* InputRequest */) {
      return part.response === void 0;
    }
    if (part.kind !== "toolCall" /* ToolCall */) {
      return false;
    }
    const status = part.toolCall.status;
    if (status === "pending-result-confirmation" /* PendingResultConfirmation */ || status === "auth-required" /* AuthRequired */) {
      return true;
    }
    return status === "pending-confirmation" /* PendingConfirmation */ && readToolCallMeta(part.toolCall).autoApproveBySetting !== true;
  });
}

function chatSummaryStatus(state) {
  const status = state.status;
  if ((status & 24 /* InputNeeded */) !== 24 /* InputNeeded */) {
    return status;
  }
  if (hasAutoApprovedPendingConfirmation(state) && !chatAwaitsUserInput(state)) {
    return status & ~STATUS_ACTIVITY_MASK | 8 /* InProgress */;
  }
  return status;
}

function chatSummaryFromState(state) {
  const summary = {
    resource: state.resource,
    title: state.title,
    status: chatSummaryStatus(state),
    modifiedAt: state.modifiedAt
  };
  if (state.activity !== void 0) {
    summary.activity = state.activity;
  }
  if (state.origin !== void 0) {
    summary.origin = state.origin;
  }
  if (state.interactivity !== void 0) {
    summary.interactivity = state.interactivity;
  }
  if (state.workingDirectories !== void 0) {
    summary.workingDirectories = state.workingDirectories;
  }
  return summary;
}

function effectiveChatInteractivity(interactivity, sessionArchived) {
  if (interactivity === "hidden" /* Hidden */) {
    return "hidden" /* Hidden */;
  }
  if (sessionArchived) {
    return "read-only" /* ReadOnly */;
  }
  return interactivity ?? "full" /* Full */;
}

function isChatReadOnly(interactivity, sessionArchived) {
  return effectiveChatInteractivity(interactivity, sessionArchived) === "read-only" /* ReadOnly */;
}

var AHP_CHAT_SCHEME = "ahp-chat";

var DEFAULT_CHAT_ID = "default";

function buildChatUri(sessionUri, chatId) {
  const session = typeof sessionUri === "string" ? sessionUri : sessionUri.toString();
  const encoded = encodeBase64(VSBuffer.fromString(session), false, true);
  return `${AHP_CHAT_SCHEME}://${chatId}/${encoded}`;
}

function buildDefaultChatUri(sessionUri) {
  return buildChatUri(sessionUri, DEFAULT_CHAT_ID);
}

var SUBAGENT_CHAT_ID = "subagent";

function isSubagentChatUri(uri) {
  const parsed = typeof uri === "string" ? URI.parse(uri) : uri;
  return parsed.scheme === AHP_CHAT_SCHEME && parsed.authority === SUBAGENT_CHAT_ID;
}

function buildSubagentChatUri(sessionUri, toolCallId) {
  const session = typeof sessionUri === "string" ? sessionUri : sessionUri.toString();
  const encoded = encodeBase64(VSBuffer.fromString(session), false, true);
  return `${AHP_CHAT_SCHEME}://${SUBAGENT_CHAT_ID}/${encoded}/${encodeURIComponent(toolCallId)}`;
}

function parseChatUri(uri) {
  let parsed;
  try {
    parsed = typeof uri === "string" ? URI.parse(uri) : uri;
  } catch {
    return void 0;
  }
  if (parsed.scheme !== AHP_CHAT_SCHEME || !parsed.authority) {
    return void 0;
  }
  const encoded = parsed.path.replace(/^\//, "");
  if (!encoded) {
    return void 0;
  }
  try {
    if (parsed.authority === SUBAGENT_CHAT_ID) {
      const [sessionPart, ...toolCallIdParts] = encoded.split("/");
      const toolCallId = toolCallIdParts.join("/");
      if (!sessionPart || !toolCallId) {
        return void 0;
      }
      return { session: decodeBase64(sessionPart).toString(), chatId: `${SUBAGENT_CHAT_ID}/${decodeURIComponent(toolCallId)}` };
    }
    return { session: decodeBase64(encoded).toString(), chatId: parsed.authority };
  } catch {
    return void 0;
  }
}

function parseDefaultChatUri(uri) {
  return parseChatUri(uri)?.session;
}

function parseRequiredSessionUriFromChatUri(uri) {
  const session = parseDefaultChatUri(uri);
  if (session === void 0) {
    throw new Error(`Malformed AHP chat URI: ${typeof uri === "string" ? uri : uri.toString()}`);
  }
  return session;
}

function isDefaultChatUri(uri) {
  return parseChatUri(uri)?.chatId === DEFAULT_CHAT_ID;
}

function resolveChatUri(session, chat) {
  return isDefaultChatUri(chat) ? session : chat;
}

function chatStorageUri(chatChannel) {
  const parsed = parseChatUri(chatChannel);
  if (!parsed) {
    return void 0;
  }
  return resolveChatUri(URI.parse(parsed.session), URI.parse(chatChannel.toString()));
}

function isAhpChatChannel(uri) {
  try {
    return URI.parse(uri).scheme === AHP_CHAT_SCHEME;
  } catch {
    return false;
  }
}

function mergeSessionWithDefaultChat(session, chat) {
  return {
    ...session,
    workingDirectories: chat?.workingDirectories ?? session.workingDirectories,
    turns: chat?.turns ?? [],
    activeTurn: chat?.activeTurn,
    steeringMessage: chat?.steeringMessage,
    queuedMessages: chat?.queuedMessages,
    draft: chat?.draft
  };
}

var SESSION_META_GIT_KEY = "git";

var SESSION_META_GITHUB_KEY = "github";

var SESSION_META_SOURCE_CONTROL_KEY = "vscode.sourceControl";

var SESSION_META_PROMPT_CACHE_KEY = "vscode.promptCache";

var SESSION_META_MULTI_ROOT_KEY = "multiRoot";

var SESSION_META_EXTERNAL_KEY = "vscode.external";

var MAX_WORKSPACE_FILE_LENGTH = 4096;

function readSessionMultiRootMetadata(meta) {
  return validateSessionMultiRootMetadata(meta?.[SESSION_META_MULTI_ROOT_KEY]);
}

function parseSessionMultiRootMetadata(value) {
  if (!value) {
    return void 0;
  }
  try {
    return validateSessionMultiRootMetadata(JSON.parse(value));
  } catch {
    return void 0;
  }
}

function withSessionMultiRootMetadata(meta, multiRoot) {
  const next = { ...meta };
  if (multiRoot) {
    next[SESSION_META_MULTI_ROOT_KEY] = multiRoot;
  } else {
    delete next[SESSION_META_MULTI_ROOT_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

function validateSessionMultiRootMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  if (typeof raw.workspaceFile !== "string" || raw.workspaceFile.length === 0 || raw.workspaceFile.length > MAX_WORKSPACE_FILE_LENGTH) {
    return void 0;
  }
  try {
    if (!URI.parse(raw.workspaceFile, true).scheme) {
      return void 0;
    }
  } catch {
    return void 0;
  }
  return { workspaceFile: raw.workspaceFile };
}

function readSessionPromptCacheState(meta) {
  const value = meta?.[SESSION_META_PROMPT_CACHE_KEY];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  return typeof raw["modelId"] === "string" && typeof raw["cacheExpiresAt"] === "string" ? { modelId: raw["modelId"], cacheExpiresAt: raw["cacheExpiresAt"] } : void 0;
}

function withSessionPromptCacheState(meta, promptCache) {
  const next = { ...meta };
  if (promptCache) {
    next[SESSION_META_PROMPT_CACHE_KEY] = promptCache;
  } else {
    delete next[SESSION_META_PROMPT_CACHE_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

var SESSION_META_FOLDER_PICKER_KEY = "vscode.folderPicker";

function readSessionFolderPickerDecision(meta) {
  return validateSessionFolderPickerDecision(meta?.[SESSION_META_FOLDER_PICKER_KEY]);
}

function parseSessionFolderPickerDecision(value) {
  if (!value) {
    return void 0;
  }
  try {
    return validateSessionFolderPickerDecision(JSON.parse(value));
  } catch {
    return void 0;
  }
}

function validateSessionFolderPickerDecision(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  if (typeof raw["hidden"] !== "boolean") {
    return void 0;
  }
  const primary = raw["primary"];
  if (primary !== void 0 && (typeof primary !== "string" || primary.length === 0 || raw["hidden"] !== true)) {
    return void 0;
  }
  return primary !== void 0 ? { hidden: true, primary } : { hidden: raw["hidden"] };
}

function withSessionFolderPickerDecision(meta, decision) {
  const next = { ...meta };
  if (decision) {
    next[SESSION_META_FOLDER_PICKER_KEY] = decision.primary !== void 0 ? { hidden: decision.hidden, primary: decision.primary } : { hidden: decision.hidden };
  } else {
    delete next[SESSION_META_FOLDER_PICKER_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

function readSessionSourceControlState(meta) {
  const value = meta?.[SESSION_META_SOURCE_CONTROL_KEY];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  let merge2;
  const rawMerge = raw["merge"];
  if (rawMerge && typeof rawMerge === "object" && !Array.isArray(rawMerge)) {
    const commit = rawMerge["commit"];
    merge2 = typeof commit === "string" && commit.length > 0 ? { commit } : void 0;
  }
  const rawLatestOutcome = raw["latestOutcome"];
  const latestOutcome = rawLatestOutcome === "merge" /* Merge */ || rawLatestOutcome === "pullRequest" /* PullRequest */ ? rawLatestOutcome : void 0;
  if (!merge2 && (!latestOutcome || latestOutcome === "merge" /* Merge */)) {
    return void 0;
  }
  return { merge: merge2, latestOutcome };
}

function withSessionSourceControlState(meta, state) {
  const next = { ...meta };
  if (state) {
    next[SESSION_META_SOURCE_CONTROL_KEY] = state;
  } else {
    delete next[SESSION_META_SOURCE_CONTROL_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

function hasSessionPullRequestForBranch(gitHubState, branchName) {
  if (!gitHubState?.pullRequestUrls?.length) {
    return false;
  }
  return gitHubState.pullRequestBranchName === void 0 || gitHubState.pullRequestBranchName === branchName;
}

function getSessionRelatedPullRequestUrls(gitHubState) {
  const pullRequestUrls = gitHubState?.pullRequestUrls ?? [];
  const initialPullRequestUrls = gitHubState?.initialPullRequestUrls;
  const initialUrls = new Set(initialPullRequestUrls?.map((url2) => url2.toLowerCase()) ?? []);
  const associatedUrls = new Set(gitHubState?.associatedPullRequestUrls?.map((url2) => url2.toLowerCase()) ?? []);
  return pullRequestUrls.filter((url2) => !initialUrls.has(url2.toLowerCase()) || associatedUrls.has(url2.toLowerCase()));
}

var MAX_SESSION_PULL_REQUEST_REFERENCES = 10;

function normalizeSessionPullRequestUrls(urls) {
  const normalizedUrls = urls.map((url2) => {
    const match2 = /^https:\/\/(?<host>[^/]+)\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/pull\/(?<number>\d+)\/?$/.exec(url2);
    const groups = match2?.groups;
    return groups ? `https://${groups["host"].toLowerCase()}/${groups["owner"]}/${groups["repo"]}/pull/${groups["number"]}` : url2;
  });
  return distinct(normalizedUrls, (url2) => url2.toLowerCase()).slice(0, MAX_SESSION_PULL_REQUEST_REFERENCES);
}

function withMostRecentSessionPullRequest(gitHubState, pullRequestUrl, branchName) {
  const pullRequestUrls = normalizeSessionPullRequestUrls([
    pullRequestUrl,
    ...gitHubState?.pullRequestUrls ?? []
  ]);
  return {
    pullRequestUrls,
    pullRequestBranchName: branchName
  };
}

function withMostRecentRelatedSessionPullRequest(gitHubState, pullRequestUrl, branchName) {
  const next = withMostRecentSessionPullRequest(gitHubState, pullRequestUrl, branchName);
  const promotedUrl = normalizeSessionPullRequestUrls([pullRequestUrl])[0]?.toLowerCase();
  const initialPullRequestUrls = gitHubState?.initialPullRequestUrls;
  const associatedPullRequestUrls = normalizeSessionPullRequestUrls([
    pullRequestUrl,
    ...gitHubState?.associatedPullRequestUrls ?? []
  ]);
  return {
    ...next,
    associatedPullRequestUrls,
    ...initialPullRequestUrls !== void 0 ? {
      initialPullRequestUrls: initialPullRequestUrls.filter((url2) => url2.toLowerCase() !== promotedUrl)
    } : {}
  };
}

function withInitialSessionPullRequest(gitHubState, pullRequestUrl) {
  return {
    initialPullRequestUrls: normalizeSessionPullRequestUrls([
      ...pullRequestUrl ? [pullRequestUrl] : [],
      ...gitHubState?.initialPullRequestUrls ?? []
    ])
  };
}

function readSessionGitState(meta) {
  const value = meta?.[SESSION_META_GIT_KEY];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  const result = {};
  if (typeof raw["hasGitHubRemote"] === "boolean") {
    result.hasGitHubRemote = raw["hasGitHubRemote"];
  }
  if (typeof raw["branchName"] === "string") {
    result.branchName = raw["branchName"];
  }
  if (typeof raw["isDetachedHead"] === "boolean") {
    result.isDetachedHead = raw["isDetachedHead"];
  }
  if (typeof raw["baseBranchName"] === "string") {
    result.baseBranchName = raw["baseBranchName"];
  }
  if (typeof raw["upstreamBranchName"] === "string") {
    result.upstreamBranchName = raw["upstreamBranchName"];
  }
  if (typeof raw["incomingChanges"] === "number") {
    result.incomingChanges = raw["incomingChanges"];
  }
  if (typeof raw["outgoingChanges"] === "number") {
    result.outgoingChanges = raw["outgoingChanges"];
  }
  if (typeof raw["uncommittedChanges"] === "number") {
    result.uncommittedChanges = raw["uncommittedChanges"];
  }
  if (typeof raw["hasBaseBranchChanges"] === "boolean") {
    result.hasBaseBranchChanges = raw["hasBaseBranchChanges"];
  }
  if (typeof raw["githubOwner"] === "string") {
    result.githubOwner = raw["githubOwner"];
  }
  if (typeof raw["githubHeadOwner"] === "string") {
    result.githubHeadOwner = raw["githubHeadOwner"];
  }
  if (typeof raw["githubRepo"] === "string") {
    result.githubRepo = raw["githubRepo"];
  }
  return result;
}

function needsSessionGitStateRefresh(gitState) {
  return gitState === void 0 || gitState.branchName === void 0 && !gitState.isDetachedHead;
}

function withSessionGitState(meta, gitState) {
  const next = { ...meta };
  if (gitState !== void 0) {
    next[SESSION_META_GIT_KEY] = gitState;
  } else {
    delete next[SESSION_META_GIT_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

function readSessionGitHubState(meta) {
  const value = meta?.[SESSION_META_GITHUB_KEY];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  const result = {};
  if (typeof raw["owner"] === "string") {
    result.owner = raw["owner"];
  }
  if (typeof raw["repo"] === "string") {
    result.repo = raw["repo"];
  }
  const pullRequestUrls = Array.isArray(raw["pullRequestUrls"]) ? raw["pullRequestUrls"].filter((url2) => typeof url2 === "string") : typeof raw["pullRequestUrl"] === "string" ? [raw["pullRequestUrl"]] : [];
  if (pullRequestUrls.length > 0) {
    result.pullRequestUrls = normalizeSessionPullRequestUrls(pullRequestUrls);
  }
  if (Array.isArray(raw["initialPullRequestUrls"])) {
    result.initialPullRequestUrls = normalizeSessionPullRequestUrls(raw["initialPullRequestUrls"].filter((url2) => typeof url2 === "string"));
  }
  if (Array.isArray(raw["associatedPullRequestUrls"])) {
    const associatedPullRequestUrls = normalizeSessionPullRequestUrls(raw["associatedPullRequestUrls"].filter((url2) => typeof url2 === "string"));
    if (associatedPullRequestUrls.length > 0) {
      result.associatedPullRequestUrls = associatedPullRequestUrls;
    }
  }
  if (typeof raw["pullRequestBranchName"] === "string") {
    result.pullRequestBranchName = raw["pullRequestBranchName"];
  }
  return result;
}

function withSessionGitHubState(meta, gitHubState) {
  const next = { ...meta };
  if (gitHubState !== void 0) {
    next[SESSION_META_GITHUB_KEY] = gitHubState;
  } else {
    delete next[SESSION_META_GITHUB_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

var SESSION_META_SPAWN_DEPTH_KEY = "agentHost/sessionSpawnDepth";

function readSessionSpawnDepth(meta) {
  const value = meta?.[SESSION_META_SPAWN_DEPTH_KEY];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function withSessionSpawnDepth(meta, depth) {
  return { ...meta, [SESSION_META_SPAWN_DEPTH_KEY]: depth };
}

var SESSION_META_CREATED_BY_SESSION_KEY = "agentHost/createdBySession";

var AH_META_CREATED_BY_SESSION_DB_KEY = "agentHost.createdBySession";

function readSessionCreationReference(meta) {
  return parseSessionCreationReferenceValue(meta?.[SESSION_META_CREATED_BY_SESSION_KEY]);
}

function parseSessionCreationReferenceValue(value) {
  if (!value || typeof value !== "object") {
    return void 0;
  }
  const candidate = value;
  if (typeof candidate.session !== "string") {
    return void 0;
  }
  return {
    session: candidate.session,
    ...typeof candidate.chat === "string" ? { chat: candidate.chat } : {},
    ...typeof candidate.turnId === "string" ? { turnId: candidate.turnId } : {}
  };
}

function parseSessionCreationReference(value) {
  if (!value) {
    return void 0;
  }
  try {
    return readSessionCreationReference({ [SESSION_META_CREATED_BY_SESSION_KEY]: JSON.parse(value) });
  } catch {
    return void 0;
  }
}

function withSessionCreationReference(meta, creationReference) {
  return { ...meta, [SESSION_META_CREATED_BY_SESSION_KEY]: creationReference };
}

var SESSION_META_WORKSPACELESS_KEY = "workspaceless";

var AH_META_WORKSPACELESS_DB_KEY = "agentHost.workspaceless";

var AH_META_IS_ARCHIVED_DB_KEY = "isArchived";

var AH_META_IS_DONE_DB_KEY = "isDone";

var AH_META_IS_READ_DB_KEY = "isRead";

function withSessionStatusFlag(status, flag, set) {
  return set ? status | flag : status & ~flag;
}

function isSessionStatusRead(status) {
  return status !== void 0 && (status & 32 /* IsRead */) !== 0;
}

function isSessionStatusArchived(status) {
  return status !== void 0 && (status & 64 /* IsArchived */) !== 0;
}

function readSessionWorkspaceless(meta) {
  return meta?.[SESSION_META_WORKSPACELESS_KEY] === true;
}

function withSessionWorkspaceless(meta, workspaceless) {
  const next = { ...meta };
  if (workspaceless) {
    next[SESSION_META_WORKSPACELESS_KEY] = true;
  } else {
    delete next[SESSION_META_WORKSPACELESS_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

function readSessionExternal(meta) {
  return meta?.[SESSION_META_EXTERNAL_KEY] === true;
}

function withSessionExternal(meta, external) {
  const next = { ...meta };
  if (external) {
    next[SESSION_META_EXTERNAL_KEY] = true;
  } else {
    delete next[SESSION_META_EXTERNAL_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

var SESSION_META_EHCLI_ADOPTABLE_KEY = "ehcliAdoptable";

function readSessionEhcliAdoptable(meta) {
  return meta?.[SESSION_META_EHCLI_ADOPTABLE_KEY] === true;
}

function withSessionEhcliAdoptable(meta) {
  return { ...meta, [SESSION_META_EHCLI_ADOPTABLE_KEY]: true };
}

var AH_META_EHCLI_ADOPTED_DB_KEY = "agentHost.ehcliAdopted";

var SESSION_META_EHCLI_ADOPTED_KEY = "ehcliAdopted";

function withSessionEhcliAdopted(meta, adopted) {
  const next = { ...meta };
  if (adopted) {
    next[SESSION_META_EHCLI_ADOPTED_KEY] = true;
  } else {
    delete next[SESSION_META_EHCLI_ADOPTED_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

var ROOT_META_HOST_BUILD_KEY = "hostBuild";

function hostBuildInfoFromProduct(productService) {
  return {
    version: productService.version,
    commit: productService.commit,
    date: productService.date,
    quality: productService.quality
  };
}

function withHostBuildInfo(meta, buildInfo) {
  const next = { ...meta };
  if (buildInfo !== void 0) {
    next[ROOT_META_HOST_BUILD_KEY] = buildInfo;
  } else {
    delete next[ROOT_META_HOST_BUILD_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}
export { getErrorResponsePart, createErrorResponsePart, mergeLogicalTurnUsage, sumDefined, mergeTurnTokenTotals, isAhpAutomationCatalogChannel, isAhpAutomationRunChannel, withMessageHiddenFromTranscript, readAccountQuotaSnapshot, readUsageInfoMeta, readTurnTokenTotals, isTokenCount, hasReportedUsage, readAutoModeResolvedInfo, readContextAttribution, filterStringAttributes, buildResourceWatchChannelUri, parseResourceWatchChannelUri, isAhpResourceWatchChannel, isAhpRootChannel, customizationId, getInlineToolInput, getToolFileEdits, asResourceUri, getSubagentBasePath, buildSubagentSessionUri, parseSubagentSessionUri, isSubagentSession, buildSubagentSessionUriPrefix, createRootState, createSessionState, createChatState, createDefaultChatSummary, hasAutoApprovedPendingConfirmation, chatAwaitsUserInput, chatSummaryStatus, chatSummaryFromState, effectiveChatInteractivity, isChatReadOnly, buildChatUri, buildDefaultChatUri, isSubagentChatUri, buildSubagentChatUri, parseChatUri, parseDefaultChatUri, parseRequiredSessionUriFromChatUri, isDefaultChatUri, resolveChatUri, chatStorageUri, isAhpChatChannel, mergeSessionWithDefaultChat, readSessionMultiRootMetadata, parseSessionMultiRootMetadata, withSessionMultiRootMetadata, validateSessionMultiRootMetadata, readSessionPromptCacheState, withSessionPromptCacheState, readSessionFolderPickerDecision, parseSessionFolderPickerDecision, validateSessionFolderPickerDecision, withSessionFolderPickerDecision, readSessionSourceControlState, withSessionSourceControlState, hasSessionPullRequestForBranch, getSessionRelatedPullRequestUrls, normalizeSessionPullRequestUrls, withMostRecentSessionPullRequest, withMostRecentRelatedSessionPullRequest, withInitialSessionPullRequest, readSessionGitState, needsSessionGitStateRefresh, withSessionGitState, readSessionGitHubState, withSessionGitHubState, readSessionSpawnDepth, withSessionSpawnDepth, readSessionCreationReference, parseSessionCreationReferenceValue, parseSessionCreationReference, withSessionCreationReference, withSessionStatusFlag, isSessionStatusRead, isSessionStatusArchived, readSessionWorkspaceless, withSessionWorkspaceless, readSessionExternal, withSessionExternal, readSessionEhcliAdoptable, withSessionEhcliAdoptable, withSessionEhcliAdopted, hostBuildInfoFromProduct, withHostBuildInfo, AUTOMATION_CATALOG_URI, MESSAGE_HIDDEN_FROM_TRANSCRIPT_META_KEY, MESSAGE_HIDDEN_FROM_TRANSCRIPT_PREFIX, ROOT_STATE_URI, AHP_ROOT_SCHEME, AHP_RESOURCE_WATCH_SCHEME, SUBAGENT_URI_SEGMENT, SUBAGENT_URI_MARKER, SUBAGENT_URI_PATH_REGEX, STATUS_ACTIVITY_MASK, AHP_CHAT_SCHEME, DEFAULT_CHAT_ID, SUBAGENT_CHAT_ID, SESSION_META_GIT_KEY, SESSION_META_GITHUB_KEY, SESSION_META_SOURCE_CONTROL_KEY, SESSION_META_PROMPT_CACHE_KEY, SESSION_META_MULTI_ROOT_KEY, SESSION_META_EXTERNAL_KEY, MAX_WORKSPACE_FILE_LENGTH, SESSION_META_FOLDER_PICKER_KEY, MAX_SESSION_PULL_REQUEST_REFERENCES, SESSION_META_SPAWN_DEPTH_KEY, SESSION_META_CREATED_BY_SESSION_KEY, AH_META_CREATED_BY_SESSION_DB_KEY, SESSION_META_WORKSPACELESS_KEY, AH_META_WORKSPACELESS_DB_KEY, AH_META_IS_ARCHIVED_DB_KEY, AH_META_IS_DONE_DB_KEY, AH_META_IS_READ_DB_KEY, SESSION_META_EHCLI_ADOPTABLE_KEY, AH_META_EHCLI_ADOPTED_DB_KEY, SESSION_META_EHCLI_ADOPTED_KEY, ROOT_META_HOST_BUILD_KEY };
