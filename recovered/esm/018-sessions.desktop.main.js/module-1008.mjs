// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionState.ts
import { URI } from "./module-0032.mjs";
import { hasKey } from "./module-0010.mjs";
import { readLegacyTurnError } from "./module-1007.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0038.mjs";
import { distinct } from "./module-0007.mjs";


// src/vs/platform/agentHost/common/state/sessionState.ts
function getErrorResponsePart(turn) {
  if (!turn) {
    return void 0;
  }
  const part = turn.responseParts.at(-1);
  return part?.kind === "error" /* Error */ ? part : void 0;
}

var AUTOMATION_CATALOG_URI = "ahp-automations://catalog";

function isAhpAutomationCatalogChannel(uri4) {
  return uri4 === AUTOMATION_CATALOG_URI;
}

function isAhpAutomationRunChannel(uri4) {
  try {
    return URI.parse(uri4).scheme === "ahp-automation-run";
  } catch {
    return false;
  }
}

var MESSAGE_HIDDEN_FROM_TRANSCRIPT_META_KEY = "vscode.chat.hiddenFromTranscript";

var MESSAGE_HIDDEN_FROM_TRANSCRIPT_PREFIX = "<!-- vscode-hidden-from-transcript -->\n";

function readMessageMeta(message) {
  const meta = message._meta;
  return {
    hiddenFromTranscript: meta?.[MESSAGE_HIDDEN_FROM_TRANSCRIPT_META_KEY] === true
  };
}

function isMessageHiddenFromTranscript(message) {
  return readMessageMeta(message).hiddenFromTranscript || message.text.startsWith(MESSAGE_HIDDEN_FROM_TRANSCRIPT_PREFIX);
}

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

function readAccountQuotaSnapshot(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
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
    for (const [quotaType, value2] of Object.entries(quotaSnapshots)) {
      snapshots[quotaType] = readAccountQuotaSnapshot(value2);
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

function readTurnTokenTotals(value2) {
  if (!Array.isArray(value2)) {
    return void 0;
  }
  const totals = [];
  for (const item of value2) {
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

function isTokenCount(value2) {
  return typeof value2 === "number" && Number.isSafeInteger(value2) && value2 >= 0;
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

function readAutoModeResolvedInfo(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
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
    for (const [category9, score3] of Object.entries(categoryScores)) {
      if (typeof score3 === "number") {
        scores[category9] = score3;
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

function readContextAttribution(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
  if (typeof raw["totalTokens"] !== "number" || !Array.isArray(raw["entries"])) {
    return void 0;
  }
  const entries2 = [];
  for (const item of raw["entries"]) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const entry = item;
    if (typeof entry["kind"] !== "string" || typeof entry["id"] !== "string" || typeof entry["label"] !== "string" || typeof entry["tokens"] !== "number") {
      continue;
    }
    entries2.push({
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
  return { totalTokens: raw["totalTokens"], entries: entries2, compactions };
}

function filterStringAttributes(raw) {
  const result = {};
  for (const [key3, value2] of Object.entries(raw)) {
    if (typeof value2 === "string" || value2 === void 0) {
      result[key3] = value2;
    }
  }
  return result;
}

var ROOT_STATE_URI = "ahp-root://";

var AHP_ROOT_SCHEME = "ahp-root";

function isAhpRootChannel(uri4) {
  if (uri4 === ROOT_STATE_URI) {
    return true;
  }
  try {
    return URI.parse(uri4).scheme === AHP_ROOT_SCHEME;
  } catch {
    return false;
  }
}

function customizationId(uri4, range2) {
  if (!range2) {
    return uri4;
  }
  const safeUri = uri4.replace(/#/g, "%23");
  return `${safeUri}#range=${range2.start.line}:${range2.start.character}-${range2.end.line}:${range2.end.character}`;
}

function getToolOutputText(result) {
  if (!result.content || result.content.length === 0) {
    return void 0;
  }
  const textParts = [];
  for (const c of result.content) {
    if (hasKey(c, { type: true }) && c.type === "text" /* Text */) {
      textParts.push(c);
    }
  }
  if (textParts.length === 0) {
    return void 0;
  }
  return textParts.map((p) => p.text).join("\n");
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

function getToolSubagentContent(result) {
  if (!result.content || result.content.length === 0) {
    return void 0;
  }
  for (const c of result.content) {
    if (hasKey(c, { type: true }) && c.type === "subagent" /* Subagent */) {
      return c;
    }
  }
  return void 0;
}

var SUBAGENT_URI_SEGMENT = "subagent";

var SUBAGENT_URI_MARKER = `/${SUBAGENT_URI_SEGMENT}/`;

var SUBAGENT_URI_PATH_REGEX = /^(?<parentPath>.+)\/subagent\/(?<toolCallId>.+)$/;

function asResourceUri(uri4) {
  return typeof uri4 === "string" ? URI.parse(uri4) : uri4;
}

function parseSubagentSessionUri(uri4) {
  const resource = asResourceUri(uri4);
  const match2 = SUBAGENT_URI_PATH_REGEX.exec(resource.path);
  if (!match2?.groups) {
    return void 0;
  }
  return {
    parentSession: resource.with({ path: match2.groups.parentPath }),
    toolCallId: match2.groups.toolCallId
  };
}

var STATUS_ACTIVITY_MASK = (1 << 5) - 1;

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

function getTurnError(turn) {
  if (turn?.state !== "error" /* Error */) {
    return void 0;
  }
  const part = turn.responseParts[turn.responseParts.length - 1];
  return part?.kind === "error" /* Error */ ? part.error : readLegacyTurnError(turn);
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

function buildSubagentChatUri(sessionUri, toolCallId) {
  const session = typeof sessionUri === "string" ? sessionUri : sessionUri.toString();
  const encoded = encodeBase64(VSBuffer.fromString(session), false, true);
  return `${AHP_CHAT_SCHEME}://${SUBAGENT_CHAT_ID}/${encoded}/${encodeURIComponent(toolCallId)}`;
}

function parseChatUri(uri4) {
  let parsed;
  try {
    parsed = typeof uri4 === "string" ? URI.parse(uri4) : uri4;
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

function parseDefaultChatUri(uri4) {
  return parseChatUri(uri4)?.session;
}

function parseRequiredSessionUriFromChatUri(uri4) {
  const session = parseDefaultChatUri(uri4);
  if (session === void 0) {
    throw new Error(`Malformed AHP chat URI: ${typeof uri4 === "string" ? uri4 : uri4.toString()}`);
  }
  return session;
}

function isDefaultChatUri(uri4) {
  return parseChatUri(uri4)?.chatId === DEFAULT_CHAT_ID;
}

function getSessionChatResource(state, chatId) {
  return chatId === DEFAULT_CHAT_ID ? state.defaultChat ?? state.chats.find((chat) => isDefaultChatUri(chat.resource))?.resource : state.chats.find((chat) => parseChatUri(chat.resource)?.chatId === chatId)?.resource;
}

function isAhpChatChannel(uri4) {
  try {
    return URI.parse(uri4).scheme === AHP_CHAT_SCHEME;
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

function withSessionMultiRootMetadata(meta, multiRoot) {
  const next = { ...meta };
  if (multiRoot) {
    next[SESSION_META_MULTI_ROOT_KEY] = multiRoot;
  } else {
    delete next[SESSION_META_MULTI_ROOT_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

function validateSessionMultiRootMetadata(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
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
  const value2 = meta?.[SESSION_META_PROMPT_CACHE_KEY];
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
  return typeof raw["modelId"] === "string" && typeof raw["cacheExpiresAt"] === "string" ? { modelId: raw["modelId"], cacheExpiresAt: raw["cacheExpiresAt"] } : void 0;
}

var SESSION_META_FOLDER_PICKER_KEY = "vscode.folderPicker";

function readSessionFolderPickerDecision(meta) {
  return validateSessionFolderPickerDecision(meta?.[SESSION_META_FOLDER_PICKER_KEY]);
}

function validateSessionFolderPickerDecision(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
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
  const value2 = meta?.[SESSION_META_SOURCE_CONTROL_KEY];
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
  let merge3;
  const rawMerge = raw["merge"];
  if (rawMerge && typeof rawMerge === "object" && !Array.isArray(rawMerge)) {
    const commit = rawMerge["commit"];
    merge3 = typeof commit === "string" && commit.length > 0 ? { commit } : void 0;
  }
  const rawLatestOutcome = raw["latestOutcome"];
  const latestOutcome = rawLatestOutcome === "merge" /* Merge */ || rawLatestOutcome === "pullRequest" /* PullRequest */ ? rawLatestOutcome : void 0;
  if (!merge3 && (!latestOutcome || latestOutcome === "merge" /* Merge */)) {
    return void 0;
  }
  return { merge: merge3, latestOutcome };
}

function getSessionRelatedPullRequestUrls(gitHubState) {
  const pullRequestUrls = gitHubState?.pullRequestUrls ?? [];
  const initialPullRequestUrls = gitHubState?.initialPullRequestUrls;
  const initialUrls = new Set(initialPullRequestUrls?.map((url) => url.toLowerCase()) ?? []);
  const associatedUrls = new Set(gitHubState?.associatedPullRequestUrls?.map((url) => url.toLowerCase()) ?? []);
  return pullRequestUrls.filter((url) => !initialUrls.has(url.toLowerCase()) || associatedUrls.has(url.toLowerCase()));
}

var MAX_SESSION_PULL_REQUEST_REFERENCES = 10;

function normalizeSessionPullRequestUrls(urls) {
  const normalizedUrls = urls.map((url) => {
    const match2 = /^https:\/\/(?<host>[^/]+)\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/pull\/(?<number>\d+)\/?$/.exec(url);
    const groups = match2?.groups;
    return groups ? `https://${groups["host"].toLowerCase()}/${groups["owner"]}/${groups["repo"]}/pull/${groups["number"]}` : url;
  });
  return distinct(normalizedUrls, (url) => url.toLowerCase()).slice(0, MAX_SESSION_PULL_REQUEST_REFERENCES);
}

function readSessionGitState(meta) {
  const value2 = meta?.[SESSION_META_GIT_KEY];
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
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

function readSessionGitHubState(meta) {
  const value2 = meta?.[SESSION_META_GITHUB_KEY];
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
  const result = {};
  if (typeof raw["owner"] === "string") {
    result.owner = raw["owner"];
  }
  if (typeof raw["repo"] === "string") {
    result.repo = raw["repo"];
  }
  const pullRequestUrls = Array.isArray(raw["pullRequestUrls"]) ? raw["pullRequestUrls"].filter((url) => typeof url === "string") : typeof raw["pullRequestUrl"] === "string" ? [raw["pullRequestUrl"]] : [];
  if (pullRequestUrls.length > 0) {
    result.pullRequestUrls = normalizeSessionPullRequestUrls(pullRequestUrls);
  }
  if (Array.isArray(raw["initialPullRequestUrls"])) {
    result.initialPullRequestUrls = normalizeSessionPullRequestUrls(raw["initialPullRequestUrls"].filter((url) => typeof url === "string"));
  }
  if (Array.isArray(raw["associatedPullRequestUrls"])) {
    const associatedPullRequestUrls = normalizeSessionPullRequestUrls(raw["associatedPullRequestUrls"].filter((url) => typeof url === "string"));
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

var SESSION_META_CREATED_BY_SESSION_KEY = "agentHost/createdBySession";

function readSessionCreationReference(meta) {
  return parseSessionCreationReferenceValue(meta?.[SESSION_META_CREATED_BY_SESSION_KEY]);
}

function parseSessionCreationReferenceValue(value2) {
  if (!value2 || typeof value2 !== "object") {
    return void 0;
  }
  const candidate = value2;
  if (typeof candidate.session !== "string") {
    return void 0;
  }
  return {
    session: candidate.session,
    ...typeof candidate.chat === "string" ? { chat: candidate.chat } : {},
    ...typeof candidate.turnId === "string" ? { turnId: candidate.turnId } : {}
  };
}

function withSessionCreationReference(meta, creationReference) {
  return { ...meta, [SESSION_META_CREATED_BY_SESSION_KEY]: creationReference };
}

var SESSION_META_WORKSPACELESS_KEY = "workspaceless";

function withSessionStatusFlag(status2, flag, set) {
  return set ? status2 | flag : status2 & ~flag;
}

function isSessionStatusRead(status2) {
  return status2 !== void 0 && (status2 & 32 /* IsRead */) !== 0;
}

function isSessionStatusArchived(status2) {
  return status2 !== void 0 && (status2 & 64 /* IsArchived */) !== 0;
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

var ROOT_META_HOST_BUILD_KEY = "hostBuild";

function readHostBuildInfo(state) {
  const meta = state?._meta;
  const value2 = meta?.[ROOT_META_HOST_BUILD_KEY];
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
  if (typeof raw["version"] !== "string") {
    return void 0;
  }
  const result = {
    version: raw["version"]
  };
  if (typeof raw["commit"] === "string") {
    result.commit = raw["commit"];
  }
  if (typeof raw["date"] === "string") {
    result.date = raw["date"];
  }
  if (typeof raw["quality"] === "string") {
    result.quality = raw["quality"];
  }
  return result;
}

function formatHostBuildInfo(info) {
  const details = [];
  if (info.commit) {
    details.push(`commit ${info.commit}`);
  }
  if (info.date) {
    details.push(info.date);
  }
  if (info.quality) {
    details.push(info.quality);
  }
  return details.length > 0 ? `${info.version} (${details.join(", ")})` : info.version;
}
export { getErrorResponsePart, isAhpAutomationCatalogChannel, isAhpAutomationRunChannel, readMessageMeta, isMessageHiddenFromTranscript, withMessageHiddenFromTranscript, readAccountQuotaSnapshot, readUsageInfoMeta, readTurnTokenTotals, isTokenCount, hasReportedUsage, readAutoModeResolvedInfo, readContextAttribution, filterStringAttributes, isAhpRootChannel, customizationId, getToolOutputText, getInlineToolInput, getToolFileEdits, getToolSubagentContent, asResourceUri, parseSubagentSessionUri, effectiveChatInteractivity, isChatReadOnly, getTurnError, buildChatUri, buildDefaultChatUri, buildSubagentChatUri, parseChatUri, parseDefaultChatUri, parseRequiredSessionUriFromChatUri, isDefaultChatUri, getSessionChatResource, isAhpChatChannel, mergeSessionWithDefaultChat, readSessionMultiRootMetadata, withSessionMultiRootMetadata, validateSessionMultiRootMetadata, readSessionPromptCacheState, readSessionFolderPickerDecision, validateSessionFolderPickerDecision, withSessionFolderPickerDecision, readSessionSourceControlState, getSessionRelatedPullRequestUrls, normalizeSessionPullRequestUrls, readSessionGitState, readSessionGitHubState, withSessionGitHubState, readSessionCreationReference, parseSessionCreationReferenceValue, withSessionCreationReference, withSessionStatusFlag, isSessionStatusRead, isSessionStatusArchived, readSessionWorkspaceless, withSessionWorkspaceless, readSessionExternal, withSessionExternal, readSessionEhcliAdoptable, readHostBuildInfo, formatHostBuildInfo, AUTOMATION_CATALOG_URI, MESSAGE_HIDDEN_FROM_TRANSCRIPT_META_KEY, MESSAGE_HIDDEN_FROM_TRANSCRIPT_PREFIX, ROOT_STATE_URI, AHP_ROOT_SCHEME, SUBAGENT_URI_SEGMENT, SUBAGENT_URI_MARKER, SUBAGENT_URI_PATH_REGEX, STATUS_ACTIVITY_MASK, AHP_CHAT_SCHEME, DEFAULT_CHAT_ID, SUBAGENT_CHAT_ID, SESSION_META_GIT_KEY, SESSION_META_GITHUB_KEY, SESSION_META_SOURCE_CONTROL_KEY, SESSION_META_PROMPT_CACHE_KEY, SESSION_META_MULTI_ROOT_KEY, SESSION_META_EXTERNAL_KEY, MAX_WORKSPACE_FILE_LENGTH, SESSION_META_FOLDER_PICKER_KEY, MAX_SESSION_PULL_REQUEST_REFERENCES, SESSION_META_CREATED_BY_SESSION_KEY, SESSION_META_WORKSPACELESS_KEY, SESSION_META_EHCLI_ADOPTABLE_KEY, ROOT_META_HOST_BUILD_KEY };
