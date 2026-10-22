// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/stateToProgressAdapter.ts
import { buildSubagentChatUri, getInlineToolInput, getToolFileEdits, getToolOutputText, getToolSubagentContent, getTurnError, hasReportedUsage, isMessageHiddenFromTranscript, parseChatUri, readUsageInfoMeta } from "./module-1008.mjs";
import { AgentHostAutoReplyAnswer } from "./module-1741.mjs";
import { MarkdownString, escapeMarkdownLinkLabel } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { ChatPlanReviewData } from "./module-1191.mjs";
import { URI } from "./module-0032.mjs";
import { AGENT_HOST_SCHEME, createAgentHostResourceUriMapper, toAgentHostContentUri, toAgentHostUri } from "./module-1001.mjs";
import { readToolCallMeta } from "./module-1006.mjs";
import { readAgentSystemNotificationMeta } from "./module-2213.mjs";
import { Codicon } from "./module-0085.mjs";
import { getToolKind } from "./module-2207.mjs";
import { formatCopilotCreditsLabel } from "./module-0973.mjs";
import { isTerminalCommandPrompt } from "./module-0961.mjs";
import { getChatErrorDetailsFromMeta } from "./module-2208.mjs";
import { readAgentMessageDelegationMeta } from "./module-2212.mjs";
import { hasKey } from "./module-0010.mjs";
import { AGENT_HOST_SESSION_LINK_SCHEME, buildOpenSessionLinkUri, isCreateChatTool, isCreateSessionTool, isSendMessageTool, parseOpenSessionLinkChatId, parseOpenSessionLinkUri } from "./module-2024.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { AgentSession } from "./module-1107.mjs";
import { AgentHostElementAttachmentDisplayKind, getElementAttachmentCorrelationId } from "./module-2209.mjs";
import { getAgentFeedbackAttachmentMetadata, isAgentFeedbackAnnotationsAttachment, isAgentFeedbackAttachment } from "./module-2210.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isSessionReferenceTrajectoryAttachment, restoreSessionReferenceVariableEntryFromAttachment } from "./module-2219.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { restoreChatReferenceVariableEntryFromAttachment } from "./module-2220.mjs";
import { restoreChatTranscriptContextVariableEntry, restorePasteVariableEntryFromAttachment, toAgentHostCompletionVariableEntryFromMetadata } from "./module-0980.mjs";
import { getBrowserViewAttachmentMetadata, isBrowserViewAttachment } from "./module-2211.mjs";
import { ConfigureAutomationToolReferenceName } from "./module-2218.mjs";
import { ToolDataSource } from "./module-0991.mjs";
import { isAddCommentTool, isViewUnreviewedCommentsTool } from "./module-2214.mjs";
import { normalizeFileEdit } from "./module-2217.mjs";
import { Schemas } from "./module-0033.mjs";
import { product_default } from "./module-0139.mjs";
import { rewriteMarkdownLinks } from "./module-2195.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { escapeIcons } from "./module-0461.mjs";
import { ChatToolInvocation } from "./module-1190.mjs";
import { parsePartialToolInputForDisplay } from "./module-2215.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/stateToProgressAdapter.ts
var BOOLEAN_TRUE_OPTION_ID = "true";

var BOOLEAN_FALSE_OPTION_ID = "false";

var agentHostAskUserToolNames = /* @__PURE__ */ new Set(["ask_user", "AskUserQuestion", "request_user_input"]);

var imageGenerationToolName = "image_gen.imagegen";

function isAgentHostAskUserTool(toolName) {
  return agentHostAskUserToolNames.has(toolName);
}

function shouldHideCompletedAgentHostAskUserTool(toolCall) {
  if (!isAgentHostAskUserTool(toolCall.toolName)) {
    return false;
  }
  if (toolCall.status === "completed" /* Completed */) {
    return toolCall.success;
  }
  return toolCall.status === "cancelled" /* Cancelled */ && toolCall.reason === "skipped" /* Skipped */;
}

function isRenameChatTool(toolCall) {
  return toolCall.toolName === "rename_chat" /* RenameChat */ || toolCall.toolName.endsWith(`__${"rename_chat" /* RenameChat */}`);
}

function isAutomaticTitleRename(toolCall) {
  if (!isRenameChatTool(toolCall) || toolCall.status === "streaming" /* Streaming */) {
    return false;
  }
  const toolInput = getInlineToolInput(toolCall.toolInput);
  if (!toolInput) {
    return false;
  }
  try {
    const args2 = JSON.parse(toolInput);
    return args2.automatic === true;
  } catch {
    return false;
  }
}

function shouldHideAutomaticTitleRename(toolCall) {
  return isAutomaticTitleRename(toolCall) && toolCall.status !== "cancelled" /* Cancelled */ && (toolCall.status !== "completed" /* Completed */ || toolCall.success);
}

function makeAhpTerminalToolSessionId(terminalUri, session) {
  return JSON.stringify({ terminal: terminalUri, session: session.toString() });
}

function parseAhpTerminalToolSessionId(id2) {
  try {
    const parsed = JSON.parse(id2);
    if (typeof parsed?.terminal === "string" && typeof parsed?.session === "string") {
      return parsed;
    }
  } catch {
  }
  return void 0;
}

function convertProtocolAnswer(answer) {
  if (answer.state !== "submitted" /* Submitted */) {
    return void 0;
  }
  switch (answer.value.kind) {
    case "text" /* Text */:
      return answer.value.value;
    case "number" /* Number */:
    case "boolean" /* Boolean */:
      return String(answer.value.value);
    case "selected" /* Selected */:
      return {
        selectedValue: answer.value.value,
        freeformValue: answer.value.freeformValues?.[0]
      };
    case "selected-many" /* SelectedMany */:
      return {
        selectedValues: answer.value.value,
        freeformValue: answer.value.freeformValues?.[0]
      };
  }
}

function convertProtocolAnswers(raw) {
  if (!raw) {
    return void 0;
  }
  const answers = {};
  for (const [questionId, answer] of Object.entries(raw)) {
    const converted = convertProtocolAnswer(answer);
    if (converted !== void 0) {
      answers[questionId] = converted;
    }
  }
  return Object.keys(answers).length > 0 ? answers : void 0;
}

function containsAutomaticReplyAnswer(raw) {
  return Object.values(raw ?? {}).some(
    (answer) => answer.state === "submitted" /* Submitted */ && answer.value.kind === "text" /* Text */ && answer.value.value === AgentHostAutoReplyAnswer
  );
}

function getPlanReviewAction(planReview, actionId) {
  return actionId ? planReview.actions.find((action) => action.id === actionId) : void 0;
}

function convertProtocolPlanReviewResult(planReview, response, answers) {
  if (response === "decline" /* Decline */) {
    return { rejected: true };
  }
  if (response !== "accept" /* Accept */) {
    return void 0;
  }
  const answer = answers?.[planReview.answerQuestionId];
  if (!answer || answer.state === "skipped" /* Skipped */) {
    return void 0;
  }
  const value2 = answer.value;
  if (value2.kind === "text" /* Text */) {
    const feedback2 = value2.value.trim();
    return feedback2 ? { rejected: false, feedback: feedback2, feedbackOverall: feedback2 } : void 0;
  }
  if (value2.kind !== "selected" /* Selected */) {
    return void 0;
  }
  const action = getPlanReviewAction(planReview, value2.value);
  const feedback = value2.freeformValues?.find((v2) => v2.trim().length > 0)?.trim();
  return {
    rejected: false,
    action: action?.label ?? value2.value,
    actionId: action?.id ?? value2.value,
    ...feedback ? { feedback, feedbackOverall: feedback } : {}
  };
}

function createInputRequestCarousel(inputReq, connectionAuthority) {
  const questions = (inputReq.questions ?? []).map((question) => {
    let title = question.title;
    let message = question.message;
    if (!title) {
      const endOfLine2 = question.message.indexOf("\n");
      title = endOfLine2 === -1 ? question.message : question.message.substring(0, endOfLine2).trim();
      message = endOfLine2 === -1 ? "" : question.message.substring(endOfLine2 + 1).trim();
    }
    const detailedMessage = new MarkdownString(message, { isTrusted: false });
    switch (question.kind) {
      case "single-select" /* SingleSelect */:
        return {
          id: question.id,
          type: "singleSelect",
          title,
          detailedMessage,
          required: question.required,
          allowFreeformInput: question.allowFreeformInput ?? true,
          options: question.options.map((option2) => ({ id: option2.id, label: option2.label, value: option2.id }))
        };
      case "multi-select" /* MultiSelect */:
        return {
          id: question.id,
          type: "multiSelect",
          title,
          detailedMessage,
          required: question.required,
          allowFreeformInput: question.allowFreeformInput ?? true,
          options: question.options.map((option2) => ({ id: option2.id, label: option2.label, value: option2.id }))
        };
      case "boolean" /* Boolean */:
        return {
          id: question.id,
          type: "singleSelect",
          title,
          detailedMessage,
          required: question.required,
          allowFreeformInput: false,
          defaultValue: question.defaultValue === void 0 ? void 0 : String(question.defaultValue),
          options: [
            { id: BOOLEAN_TRUE_OPTION_ID, label: localize(9050, null), value: BOOLEAN_TRUE_OPTION_ID },
            { id: BOOLEAN_FALSE_OPTION_ID, label: localize(9049, null), value: BOOLEAN_FALSE_OPTION_ID }
          ]
        };
      case "text" /* Text */:
        return {
          id: question.id,
          type: "text",
          title,
          detailedMessage,
          required: question.required,
          defaultValue: question.defaultValue
        };
      default:
        return {
          id: question.id,
          type: "text",
          title,
          detailedMessage,
          required: question.required
        };
    }
  });
  if (questions.length === 0) {
    questions.push({
      id: "answer",
      type: "text",
      title: inputReq.message ?? "",
      required: true
    });
  }
  const carousel = new ChatQuestionCarouselData(
    questions,
    true,
    inputReq.id,
    void 0,
    void 0,
    inputReq.message ? rawMarkdownToString(inputReq.message, connectionAuthority) : void 0
  );
  carousel.answerPresentation = "conversation";
  return carousel;
}

function createInputRequestPlanReview(inputReq, planReview, resourceUris) {
  return new ChatPlanReviewData(
    planReview.title,
    planReview.content,
    planReview.actions.map((action) => ({
      id: action.id,
      label: action.label,
      ...action.description ? { description: action.description } : {},
      ...action.default ? { default: true } : {},
      ...action.permissionLevel ? { permissionLevel: action.permissionLevel } : {}
    })),
    planReview.canProvideFeedback,
    planReview.planUri ? resourceUris.fromAgentHost(URI.parse(planReview.planUri)).toJSON() : void 0,
    inputReq.id
  );
}

function getUrlInputRequestPresentation(inputReq, url) {
  let authority = url;
  try {
    authority = URI.parse(url).authority || url;
  } catch {
  }
  const message = new MarkdownString();
  if (inputReq.message) {
    message.appendText(inputReq.message);
    message.appendMarkdown("\n\n");
  }
  message.appendMarkdown(localize(9044, null));
  message.appendCodeblock("", url);
  return { authority, message };
}

function inputRequestResponsePartToProgress(part, connectionAuthority, resourceUris = createAgentHostResourceUriMapper(connectionAuthority)) {
  const inputReq = part.request;
  const planReview = inputReq.planReview;
  if (planReview) {
    const review = createInputRequestPlanReview(inputReq, planReview, resourceUris);
    review.data = part.response === void 0 ? void 0 : convertProtocolPlanReviewResult(planReview, part.response, inputReq.answers);
    review.isUsed = true;
    return review;
  }
  if (inputReq.url) {
    const presentation2 = getUrlInputRequestPresentation(inputReq, inputReq.url);
    return {
      kind: "elicitationSerialized",
      title: localize(9045, null),
      message: presentation2.message,
      subtitle: "",
      source: void 0,
      state: part.response === "accept" /* Accept */ ? "accepted" /* Accepted */ : "rejected" /* Rejected */,
      isHidden: false
    };
  }
  const carousel = createInputRequestCarousel(inputReq, connectionAuthority);
  const answers = part.response === "accept" /* Accept */ ? convertProtocolAnswers(inputReq.answers) : void 0;
  carousel.data = answers ?? {};
  carousel.isUsed = true;
  carousel.autoReply = containsAutomaticReplyAnswer(inputReq.answers);
  carousel.answeredExternally = part.response === "accept" /* Accept */ && (carousel.autoReply || !answers);
  return carousel;
}

function getSubagentTaskDescription(tc) {
  const v2 = readToolCallMeta(tc).subagentDescription;
  return v2 && v2.length > 0 ? v2 : void 0;
}

function getSubagentAgentName(tc) {
  const v2 = readToolCallMeta(tc).subagentAgentName;
  return v2 && v2.length > 0 ? v2 : void 0;
}

function getSubagentChatResource(tc, subagentContent, sessionResource) {
  return readToolCallMeta(tc).subagentChatUri ?? subagentContent?.resource ?? buildSubagentChatUri(sessionResource.toString(), tc.toolCallId);
}

function getMcpAppData(tc, connectionAuthority) {
  if (tc.contributor?.kind !== "mcp" /* MCP */) {
    return void 0;
  }
  const ui = readToolCallMeta(tc).ui;
  if (!ui) {
    return void 0;
  }
  const resourceUri = ui.resourceUri;
  const channelValue = ui.channel;
  if (channelValue === void 0) {
    return void 0;
  }
  return {
    kind: "agentHost",
    resourceUri,
    connectionAuthority,
    serverId: tc.contributor.customizationId,
    channel: channelValue
  };
}

function getToolRawInput(tc) {
  const toolInput = tc.status === "streaming" /* Streaming */ ? void 0 : getInlineToolInput(tc.toolInput);
  try {
    return toolInput ? JSON.parse(toolInput) : {};
  } catch {
    return { input: toolInput };
  }
}

function buildMcpAppToolInputData(tc, connectionAuthority, existingRawInput) {
  const mcpAppData = getMcpAppData(tc, connectionAuthority);
  if (!mcpAppData) {
    return void 0;
  }
  return {
    kind: "input",
    rawInput: existingRawInput ?? getToolRawInput(tc),
    mcpAppData
  };
}

function isSameMcpAppData(a, b) {
  if (a?.kind !== b?.kind || a?.resourceUri !== b?.resourceUri) {
    return false;
  }
  if (a?.kind === "agentHost" && b?.kind === "agentHost") {
    return a.serverId === b.serverId && a.channel === b.channel && a.connectionAuthority === b.connectionAuthority;
  }
  if (a?.kind === "local" && b?.kind === "local") {
    return a.serverDefinitionId === b.serverDefinitionId && a.collectionId === b.collectionId;
  }
  return a === b;
}

var SUBAGENT_TOOL_NAMES = /* @__PURE__ */ new Set(["task"]);

function isSubagentToolName(toolName) {
  return SUBAGENT_TOOL_NAMES.has(toolName);
}

function systemNotificationToChatPart(content, connectionAuthority, _meta) {
  if (!content) {
    return void 0;
  }
  const value2 = stringOrMarkdownToString(content, connectionAuthority);
  const markdown = typeof value2 === "string" ? new MarkdownString(value2) : value2;
  const meta = readAgentSystemNotificationMeta({ _meta });
  switch (meta.kind) {
    case "worktreeCreationFailure" /* WorktreeCreationFailure */:
      return meta.severity === "warning" /* Warning */ ? { kind: "warning", content: markdown } : { kind: "systemNotification", content: markdown };
    // Agent Merge reports a state change rather than a completed step, so the
    // default check would misdescribe both of these.
    case "agentMergeEnabled" /* AgentMergeEnabled */:
      return { kind: "systemNotification", content: markdown, icon: Codicon.gitMerge };
    case "agentMergeDisabled" /* AgentMergeDisabled */:
      return { kind: "systemNotification", content: markdown, icon: Codicon.circleSlash };
    default:
      return { kind: "systemNotification", content: markdown };
  }
}

function isSubagentTool(tc) {
  return getToolKind(tc) === "subagent" || isSubagentToolName(tc.toolName);
}

function shouldObserveSubagentChat(tc) {
  const hasSubagentContent = (tc.status === "running" /* Running */ || tc.status === "completed" /* Completed */) && getToolSubagentContent(tc) !== void 0;
  if (tc.status === "running" /* Running */) {
    return isSubagentTool(tc) || hasSubagentContent;
  }
  return tc.status === "completed" /* Completed */ && (hasSubagentContent || tc.success && isSubagentTool(tc));
}

function getTerminalContentUri(content) {
  return getTerminalContent(content)?.resource;
}

function getTerminalContent(content) {
  return content?.find(isToolResultTerminalContent);
}

function formatTurnResponseDetails(model, billedModelId, usage) {
  if (!model) {
    return void 0;
  }
  const displayName = formatTurnModelName(model, billedModelId);
  const credits = usageInfoToChatUsage(usage)?.copilotCredits;
  if (credits !== void 0) {
    return [displayName, formatCopilotCreditsLabel(credits)].join(" \u2022 ");
  }
  return [displayName, model.pricing].filter(Boolean).join(" \xB7 ");
}

function usageInfoToAutoModeResolution(usage, resolvedModelName) {
  const resolution = readUsageInfoMeta(usage).autoModeResolved;
  if (!resolution) {
    return void 0;
  }
  return {
    kind: "autoModeResolution",
    resolved: { id: resolution.chosenModel, name: resolvedModelName ?? resolution.chosenModel }
  };
}

function formatTurnModelName(model, billedModelId) {
  if (billedModelId) {
    return localize(9047, null, model.name, billedModelId);
  }
  return model.name;
}

function usageInfoToChatUsage(usage, modelDisplayNameResolver) {
  if (!hasReportedUsage(usage)) {
    return void 0;
  }
  const turnTokenTotals = readUsageInfoMeta(usage).turnTokenTotals;
  return {
    kind: "usage",
    promptTokens: usage?.inputTokens ?? 0,
    completionTokens: usage?.outputTokens ?? 0,
    copilotCredits: getCopilotCredits(usage),
    sessionCopilotCredits: getSessionCopilotCredits(usage),
    promptTokenDetails: contextAttributionToPromptTokenDetails(usage),
    modelTotals: turnTokenTotals?.map((total) => ({
      ...total,
      model: modelDisplayNameResolver?.(total.model) ?? total.model
    }))
  };
}

function getSessionCopilotCredits(usage) {
  const sessionTotalNanoAiu = readUsageInfoMeta(usage).copilotUsage?.sessionTotalNanoAiu;
  return typeof sessionTotalNanoAiu === "number" && sessionTotalNanoAiu >= 0 ? sessionTotalNanoAiu / 1e9 : void 0;
}

function getCopilotCredits(usage) {
  const meta = readUsageInfoMeta(usage);
  const totalNanoAiu = meta?.copilotUsage?.totalNanoAiu;
  if (typeof totalNanoAiu === "number" && totalNanoAiu >= 0) {
    return totalNanoAiu / 1e9;
  }
  const cost = meta?.cost;
  return typeof cost === "number" && cost >= 0 ? cost : void 0;
}

function kindToCategory(kind) {
  switch (kind) {
    case "system":
    case "toolDefinition":
      return localize(9051, null);
    case "tool":
    case "skill":
    case "subagent":
    case "mcpServer":
    case "plugin":
      return localize(9052, null);
    default:
      return localize(9052, null);
  }
}

function kindToAggregateLabel(kind) {
  switch (kind) {
    case "tool":
      return localize(9059, null);
    case "toolDefinition":
      return localize(9058, null);
    case "skill":
      return localize(9056, null);
    case "subagent":
      return localize(9057, null);
    case "mcpServer":
      return localize(9053, null);
    case "plugin":
      return localize(9055, null);
    default:
      return kind;
  }
}

function contextAttributionToPromptTokenDetails(usage) {
  const meta = readUsageInfoMeta(usage);
  const attribution = meta?.contextAttribution;
  if (!attribution || attribution.totalTokens <= 0 || attribution.entries.length === 0) {
    return void 0;
  }
  const details = [];
  const parentIds = /* @__PURE__ */ new Set();
  for (const entry of attribution.entries) {
    if (entry.parentId) {
      parentIds.add(entry.parentId);
    }
  }
  const kindTokens = /* @__PURE__ */ new Map();
  let accountedTokens = 0;
  for (const entry of attribution.entries) {
    if (entry.kind === "system") {
      if (parentIds.has(entry.id)) {
        continue;
      }
      accountedTokens += entry.tokens;
      const percentageOfPrompt = Math.round(entry.tokens / attribution.totalTokens * 100);
      if (percentageOfPrompt > 0) {
        details.push({
          category: kindToCategory("system"),
          label: entry.label,
          percentageOfPrompt
        });
      }
    } else {
      kindTokens.set(entry.kind, (kindTokens.get(entry.kind) ?? 0) + entry.tokens);
    }
  }
  for (const [kind, tokens] of kindTokens) {
    accountedTokens += tokens;
    const percentageOfPrompt = Math.round(tokens / attribution.totalTokens * 100);
    if (percentageOfPrompt <= 0) {
      continue;
    }
    const category9 = kindToCategory(kind);
    const label3 = kindToAggregateLabel(kind);
    details.push({ category: category9, label: label3, percentageOfPrompt });
  }
  const messageTokens = Math.max(0, attribution.totalTokens - accountedTokens);
  if (messageTokens > 0) {
    const percentageOfPrompt = Math.round(messageTokens / attribution.totalTokens * 100);
    if (percentageOfPrompt > 0) {
      details.push({
        category: localize(9052, null),
        label: localize(9054, null),
        percentageOfPrompt
      });
    }
  }
  return details.length > 0 ? details : void 0;
}

function mapAccountQuotaSnapshot(snapshot) {
  const unlimited = snapshot.isUnlimitedEntitlement ?? false;
  const entitlement = typeof snapshot.entitlementRequests === "number" ? snapshot.entitlementRequests : void 0;
  if (!unlimited && entitlement === 0) {
    return void 0;
  }
  if (typeof snapshot.remainingPercentage !== "number") {
    return void 0;
  }
  const used = typeof snapshot.usedRequests === "number" ? snapshot.usedRequests : void 0;
  const resetAtMs = snapshot.resetDate ? Date.parse(snapshot.resetDate) : NaN;
  return {
    percentRemaining: Math.min(100, Math.max(0, snapshot.remainingPercentage)),
    unlimited,
    usageBasedBilling: snapshot.tokenBasedBilling,
    entitlement: !unlimited && entitlement !== void 0 && entitlement >= 0 ? entitlement : void 0,
    quotaRemaining: !unlimited && entitlement !== void 0 && used !== void 0 ? Math.max(0, entitlement - used) : void 0,
    resetAt: Number.isFinite(resetAtMs) ? Math.floor(resetAtMs / 1e3) : void 0
  };
}

function mapRateLimitSnapshot(snapshot) {
  if (!snapshot || typeof snapshot.remainingPercentage !== "number") {
    return void 0;
  }
  return {
    percentRemaining: Math.min(100, Math.max(0, snapshot.remainingPercentage)),
    unlimited: snapshot.isUnlimitedEntitlement ?? false,
    resetDate: snapshot.resetDate
  };
}

function usageInfoToQuotas(usage) {
  const meta = readUsageInfoMeta(usage);
  const snapshots = meta?.quotaSnapshots;
  if (!snapshots) {
    return void 0;
  }
  const update = {};
  let hasAny = false;
  const chatRaw = snapshots["chat"];
  const chat = chatRaw && mapAccountQuotaSnapshot(chatRaw);
  if (chat) {
    update.chat = chat;
    hasAny = true;
  }
  const completions = snapshots["completions"] && mapAccountQuotaSnapshot(snapshots["completions"]);
  if (completions) {
    update.completions = completions;
    hasAny = true;
  }
  const premiumRaw = snapshots["premium_models"] ?? snapshots["premium_interactions"];
  const premiumChat = premiumRaw && mapAccountQuotaSnapshot(premiumRaw);
  if (premiumChat) {
    update.premiumChat = premiumChat;
    hasAny = true;
  }
  if (premiumRaw) {
    update.additionalUsageEnabled = premiumRaw.overageAllowedWithExhaustedQuota ?? false;
    update.additionalUsageCount = typeof premiumRaw.overage === "number" ? premiumRaw.overage : 0;
    if (typeof premiumRaw.overageEntitlement === "number") {
      update.additionalUsageEntitlement = premiumRaw.overageEntitlement;
    }
    hasAny = true;
  }
  const usageBasedBilling = premiumRaw?.tokenBasedBilling ?? chatRaw?.tokenBasedBilling;
  if (usageBasedBilling !== void 0) {
    update.usageBasedBilling = usageBasedBilling;
    hasAny = true;
  }
  const sessionRateLimit = mapRateLimitSnapshot(snapshots["session"]);
  if (sessionRateLimit) {
    update.sessionRateLimit = sessionRateLimit;
    hasAny = true;
  }
  const weeklyRateLimit = mapRateLimitSnapshot(snapshots["weekly"]);
  if (weeklyRateLimit) {
    update.weeklyRateLimit = weeklyRateLimit;
    hasAny = true;
  }
  const resetDate = premiumRaw?.resetDate ?? chatRaw?.resetDate;
  if (resetDate) {
    update.resetDate = resetDate;
  }
  return hasAny ? update : void 0;
}

function turnsToHistory(backendSession, turns, participantId, connectionAuthority, lookup, errorContext, terminalCommandPrefix, resourceUris = createAgentHostResourceUriMapper(connectionAuthority), logicalSessionScheme = backendSession.scheme, errorDetailsProvider) {
  const history = [];
  for (const turn of turns) {
    const rawModelId = turn.usage?.model;
    const modelId = lookup?.toLanguageModelId(rawModelId);
    const details = lookup?.toResponseDetails(rawModelId, turn.usage);
    const variableData = messageToVariableData(turn.message, connectionAuthority);
    const origin = messageToRequestOrigin(backendSession, turn.message, participantId, logicalSessionScheme);
    const isSystemInitiated = turn.message.origin.kind === "systemNotification" /* SystemNotification */;
    const isTerminalRequest = isTerminalCommandPrompt(turn.message.text, terminalCommandPrefix);
    history.push({
      id: turn.id,
      type: "request",
      prompt: turn.message.text,
      participant: participantId,
      modelId,
      ...turn.startedAt !== void 0 && Number.isFinite(Date.parse(turn.startedAt)) ? { timestamp: Date.parse(turn.startedAt) } : {},
      variableData,
      ...isMessageHiddenFromTranscript(turn.message) ? { isHidden: true } : {},
      ...isSystemInitiated ? {
        isSystemInitiated: true
      } : {},
      ...isTerminalRequest ? {
        isTerminalRequest: true
      } : {},
      ...origin ? { origin } : {}
    });
    const parts = [];
    const autoModeResolution = lookup?.toAutoModeResolution?.(turn.usage);
    if (autoModeResolution?.resolved) {
      parts.push(autoModeResolution);
    }
    const usage = usageInfoToChatUsage(turn.usage, lookup?.toModelDisplayName);
    if (usage) {
      parts.push(usage);
    }
    for (const rp of turn.responseParts) {
      switch (rp.kind) {
        case "markdown" /* Markdown */:
          if (rp.content) {
            parts.push({ kind: "markdownContent", content: new MarkdownString(rp.content) });
          }
          break;
        case "toolCall" /* ToolCall */: {
          const tc = rp.toolCall;
          const fileEditParts = completedToolCallToEditParts(tc, connectionAuthority);
          const serialized = completedToolCallToSerialized(tc, void 0, backendSession, connectionAuthority, resourceUris);
          if (fileEditParts.length > 0) {
            serialized.presentation = "hidden" /* Hidden */;
          }
          parts.push(serialized);
          parts.push(...fileEditParts);
          break;
        }
        case "reasoning" /* Reasoning */:
          if (rp.content) {
            parts.push({ kind: "thinking", value: rp.content, id: rp.id });
          }
          break;
        case "systemNotification" /* SystemNotification */:
          {
            const progress = systemNotificationToChatPart(rp.content, connectionAuthority, rp._meta);
            if (progress) {
              parts.push(progress);
            }
          }
          break;
        case "contentRef" /* ContentRef */:
          break;
        case "inputRequest" /* InputRequest */: {
          parts.push(inputRequestResponsePartToProgress(rp, connectionAuthority, resourceUris));
          break;
        }
        case "error" /* Error */:
          break;
      }
    }
    let errorDetails;
    const turnError = getTurnError(turn);
    if (turnError) {
      errorDetails = errorDetailsProvider?.(turn) ?? getChatErrorDetailsFromMeta(turnError, errorContext) ?? { message: `Error: (${turnError.errorType}) ${turnError.message}` };
    }
    const startedAt = turn.startedAt === void 0 ? void 0 : Date.parse(turn.startedAt);
    const completedAt = startedAt !== void 0 && Number.isFinite(startedAt) && typeof turn.duration === "number" && Number.isFinite(turn.duration) && turn.duration >= 0 ? startedAt + turn.duration : void 0;
    history.push({ type: "response", parts, participant: participantId, details, elapsedMs: turn.duration, completedAt, ...errorDetails ? { errorDetails } : {} });
  }
  return history;
}

function messageToRequestOrigin(backendSession, message, participantId, logicalSessionScheme = backendSession.scheme) {
  const delegation = readAgentMessageDelegationMeta(message);
  if (!delegation) {
    return void 0;
  }
  if (hasKey(delegation, { sourceSession: true })) {
    const sourceSession = URI.parse(delegation.sourceSession);
    const logicalSourceSession = sourceSession.scheme === backendSession.scheme ? sourceSession.with({ scheme: logicalSessionScheme }) : sourceSession;
    return {
      kind: "delegation" /* Delegation */,
      sourceSessionResource: URI.parse(buildOpenSessionLinkUri(
        logicalSourceSession,
        delegation.sourceChat ? parseChatUri(delegation.sourceChat)?.chatId : void 0,
        delegation.sourceTurnId
      )),
      delegationScope: isEqual2(sourceSession, backendSession) ? "chat" : "session"
    };
  }
  if (delegation.sourceThreadId === AgentSession.id(backendSession)) {
    return void 0;
  }
  return {
    kind: "delegation" /* Delegation */,
    sourceSessionResource: AgentSession.uri(participantId, delegation.sourceThreadId)
  };
}

function messageToVariableData(message, connectionAuthority) {
  return messageAttachmentsToVariableData(message.attachments, connectionAuthority, message.text);
}

function messageAttachmentsToVariableData(attachments, connectionAuthority, messageText2) {
  if (!attachments?.length) {
    return void 0;
  }
  const variables = [];
  const aggregatedFeedback = aggregateAgentFeedbackAttachments(attachments, connectionAuthority);
  if (aggregatedFeedback) {
    variables.push(aggregatedFeedback);
  }
  const consumedAttachments = /* @__PURE__ */ new Set();
  for (const a of attachments) {
    if (aggregatedFeedback && isAgentFeedbackMessageAttachment(a) || consumedAttachments.has(a)) {
      continue;
    }
    const element = restoreElementVariableEntry(a, a.type === "simple" /* Simple */ ? a.modelRepresentation : void 0);
    if (element) {
      const correlationId = getElementAttachmentCorrelationId(a);
      const imageAttachment = correlationId ? attachments.find((candidate) => candidate.displayKind === "image" && getElementAttachmentCorrelationId(candidate) === correlationId) : void 0;
      const image = imageAttachment ? messageAttachmentToVariableEntry(imageAttachment, connectionAuthority) : void 0;
      if (imageAttachment && image?.kind === "image") {
        consumedAttachments.add(imageAttachment);
      }
      variables.push(image?.kind === "image" ? { ...element, imageData: image.value instanceof Uint8Array || URI.isUri(image.value) ? image.value : void 0, imageMimeType: image.mimeType } : element);
      continue;
    }
    const v2 = messageAttachmentToVariableEntry(a, connectionAuthority, messageText2);
    if (v2) {
      variables.push(v2);
    }
  }
  return variables.length > 0 ? { variables } : void 0;
}

function isAgentFeedbackMessageAttachment(attachment) {
  return isAgentFeedbackAnnotationsAttachment(attachment) || isAgentFeedbackAttachment(attachment);
}

function aggregateAgentFeedbackAttachments(attachments, connectionAuthority) {
  const feedbackAttachments = attachments.filter(isAgentFeedbackMessageAttachment);
  if (feedbackAttachments.length === 0 || feedbackAttachments.length === 1 && isAgentFeedbackAttachment(feedbackAttachments[0])) {
    return void 0;
  }
  let sessionResource;
  let annotationsResource;
  const feedbackItems = /* @__PURE__ */ new Map();
  for (const attachment of feedbackAttachments) {
    if (attachment.type === "annotations" /* Annotations */) {
      annotationsResource ??= attachment.resource;
    }
    const metadata = getAgentFeedbackAttachmentMetadata(attachment);
    if (!metadata) {
      continue;
    }
    sessionResource ??= metadata.sessionResource;
    for (const item of metadata.feedbackItems) {
      feedbackItems.set(item.id, {
        id: item.id,
        text: item.text,
        resourceUri: toAgentHostUri(URI.parse(item.resourceUri), connectionAuthority),
        range: textRangeToIRange(item.range),
        ...item.replies?.length ? { replies: item.replies } : {}
      });
    }
  }
  const firstAttachment = feedbackAttachments[0];
  if (feedbackItems.size === 0 || !sessionResource) {
    return {
      kind: "generic",
      id: generateUuid(),
      name: firstAttachment.label,
      value: firstAttachment.type === "simple" /* Simple */ ? firstAttachment.modelRepresentation || firstAttachment.label : firstAttachment.label,
      _meta: firstAttachment._meta
    };
  }
  return {
    kind: "agentFeedback",
    id: generateUuid(),
    name: feedbackItems.size === 1 ? localize(9038, null) : localize(9037, null, feedbackItems.size),
    value: firstAttachment.type === "simple" /* Simple */ ? firstAttachment.modelRepresentation || firstAttachment.label : firstAttachment.label,
    sessionResource: URI.parse(sessionResource),
    annotationsResource: annotationsResource ? URI.parse(annotationsResource) : void 0,
    feedbackItems: [...feedbackItems.values()],
    _meta: firstAttachment._meta
  };
}

function messageAttachmentToVariableEntry(attachment, connectionAuthority, messageText2) {
  if (isAgentFeedbackAttachment(attachment)) {
    const metadata = getAgentFeedbackAttachmentMetadata(attachment);
    if (metadata) {
      return {
        kind: "agentFeedback",
        id: generateUuid(),
        name: attachment.label,
        value: attachment.modelRepresentation || attachment.label,
        sessionResource: URI.parse(metadata.sessionResource),
        feedbackItems: metadata.feedbackItems.map((item) => ({
          id: item.id,
          text: item.text,
          resourceUri: toAgentHostUri(URI.parse(item.resourceUri), connectionAuthority),
          range: textRangeToIRange(item.range)
        })),
        _meta: attachment._meta
      };
    }
  }
  if (attachment.type === "resource" /* Resource */) {
    if (isSessionReferenceTrajectoryAttachment(attachment)) {
      return void 0;
    }
    const uri4 = toAgentHostUri(URI.parse(attachment.uri), connectionAuthority);
    const name = attachment.label;
    const id2 = uri4.toString() + (attachment.selection ? `:${attachment.selection.range.start.line}-${attachment.selection.range.end.line}` : "");
    const _meta = attachment._meta;
    if (attachment.displayKind === "directory") {
      return { kind: "directory", id: id2, name, value: uri4, _meta };
    }
    if (attachment.displayKind === "image") {
      return {
        kind: "image",
        id: id2,
        name,
        value: uri4,
        isURL: true,
        references: [{ kind: "reference", reference: uri4 }],
        _meta
      };
    }
    if (attachment.selection) {
      return {
        kind: "file",
        id: id2,
        name,
        value: { uri: uri4, range: textRangeToIRange(attachment.selection.range) },
        _meta
      };
    }
    return { kind: "file", id: id2, name, value: uri4, _meta };
  }
  if (attachment.type === "embeddedResource" /* EmbeddedResource */) {
    if (!attachment.contentType.startsWith("image/")) {
      return {
        kind: "generic",
        id: generateUuid(),
        name: attachment.label,
        value: decodeBase64(attachment.data).buffer,
        _meta: attachment._meta
      };
    }
    return {
      kind: "image",
      id: generateUuid(),
      name: attachment.label || "image",
      value: decodeBase64(attachment.data).buffer,
      mimeType: attachment.contentType,
      isURL: false,
      _meta: attachment._meta
    };
  }
  if (attachment.type === "chat" /* Chat */) {
    return restoreChatReferenceVariableEntryFromAttachment(attachment, messageText2);
  }
  const agentHostCompletionKind = getAgentHostCompletionKind(attachment);
  if (agentHostCompletionKind !== void 0) {
    return toAgentHostCompletionVariableEntryFromMetadata(agentHostCompletionKind, attachment.label, attachment._meta);
  }
  const modelRepresentation = attachment.type === "simple" /* Simple */ ? attachment.modelRepresentation : void 0;
  if (isBrowserViewAttachment(attachment) && modelRepresentation !== void 0) {
    const metadata = getBrowserViewAttachmentMetadata(attachment);
    if (metadata) {
      return {
        kind: "browserView",
        id: metadata.browserUri,
        name: attachment.label,
        value: URI.parse(metadata.browserUri),
        browserId: metadata.browserId,
        modelDescription: modelRepresentation,
        _meta: attachment._meta
      };
    }
  }
  if (attachment.type === "simple" /* Simple */ && modelRepresentation !== void 0) {
    const transcriptContextEntry = restoreChatTranscriptContextVariableEntry(attachment.label, modelRepresentation, attachment._meta);
    if (transcriptContextEntry) {
      return transcriptContextEntry;
    }
  }
  if (attachment.displayKind === "workspace" && modelRepresentation !== void 0) {
    return {
      kind: "workspace",
      id: attachment.label,
      name: attachment.label,
      value: modelRepresentation,
      _meta: attachment._meta
    };
  }
  if (attachment.type === "simple" /* Simple */) {
    const sessionReferenceEntry = restoreSessionReferenceVariableEntryFromAttachment(attachment);
    if (sessionReferenceEntry) {
      return sessionReferenceEntry;
    }
  }
  const pasteEntry = restorePasteVariableEntryFromAttachment({
    label: attachment.label,
    displayKind: attachment.displayKind,
    modelRepresentation,
    _meta: attachment._meta
  });
  if (pasteEntry) {
    return pasteEntry;
  }
  return {
    kind: "generic",
    id: generateUuid(),
    name: attachment.label,
    value: modelRepresentation || attachment.label,
    _meta: attachment._meta
  };
}

function restoreElementVariableEntry(attachment, modelRepresentation) {
  if (attachment.displayKind !== AgentHostElementAttachmentDisplayKind || modelRepresentation === void 0) {
    return void 0;
  }
  const fullName = /^Element:\s*(?<name>.+)$/m.exec(modelRepresentation)?.groups?.name;
  return {
    kind: "element",
    id: generateUuid(),
    name: attachment.label,
    ...fullName ? { fullName } : {},
    icon: Codicon.layout,
    value: modelRepresentation,
    _meta: attachment._meta
  };
}

function getAgentHostCompletionKind(attachment) {
  if (attachment.type !== "simple" /* Simple */) {
    return void 0;
  }
  switch (attachment.displayKind) {
    case "command":
      return "command" /* Command */;
    case "skill":
      return "skill" /* Skill */;
  }
  return void 0;
}

function textRangeToIRange(range2) {
  return {
    startLineNumber: range2.start.line + 1,
    startColumn: range2.start.character + 1,
    endLineNumber: range2.end.line + 1,
    endColumn: range2.end.character + 1
  };
}

function activeTurnToProgress(sessionResource, activeTurn, connectionAuthority, mcpServerAuthority = sessionResource.authority, toolInvocationOptions, lookup, resourceUris = createAgentHostResourceUriMapper(connectionAuthority)) {
  const parts = [];
  const usage = usageInfoToChatUsage(activeTurn.usage, lookup?.toModelDisplayName);
  if (usage) {
    parts.push(usage);
  }
  for (const rp of activeTurn.responseParts) {
    switch (rp.kind) {
      case "markdown" /* Markdown */:
        if (rp.content) {
          parts.push({ kind: "markdownContent", content: new MarkdownString(rp.content) });
        }
        break;
      case "reasoning" /* Reasoning */:
        if (rp.content) {
          parts.push({ kind: "thinking", value: rp.content, id: rp.id });
        }
        break;
      case "toolCall" /* ToolCall */: {
        const tc = rp.toolCall;
        const isOtherClientToolCall = tc.contributor?.kind === "client" /* Client */ && toolInvocationOptions && tc.contributor.clientId !== toolInvocationOptions.currentClientId;
        if (tc.status === "completed" /* Completed */ || tc.status === "cancelled" /* Cancelled */) {
          parts.push(completedToolCallToSerialized(tc, void 0, sessionResource, connectionAuthority, resourceUris));
        } else if (tc.status === "streaming" /* Streaming */ && !isOtherClientToolCall) {
          parts.push(toolCallStateToStreamingInvocation(tc, void 0, sessionResource, connectionAuthority, mcpServerAuthority));
        } else if (tc.status === "running" /* Running */ || tc.status === "auth-required" /* AuthRequired */ || tc.status === "streaming" /* Streaming */ || tc.status === "pending-confirmation" /* PendingConfirmation */) {
          parts.push(toolCallStateToInvocation(tc, void 0, sessionResource, connectionAuthority, mcpServerAuthority, toolInvocationOptions, resourceUris));
        }
        break;
      }
      case "systemNotification" /* SystemNotification */:
        {
          const progress = systemNotificationToChatPart(rp.content, connectionAuthority, rp._meta);
          if (progress) {
            parts.push(progress);
          }
        }
        break;
      case "contentRef" /* ContentRef */:
        break;
    }
  }
  return parts;
}

function getTerminalInput(tc) {
  const toolInput = tc.status === "streaming" /* Streaming */ ? void 0 : getInlineToolInput(tc.toolInput);
  if (toolInput) {
    try {
      return JSON.parse(toolInput).command || toolInput;
    } catch {
      return toolInput;
    }
  }
  return void 0;
}

function getTerminalOutput(tc) {
  if (tc.status !== "completed" /* Completed */ && tc.status !== "running" /* Running */) {
    return void 0;
  }
  const terminalContent = getTerminalContent(tc.content);
  const terminalResult = getTerminalCommandResult(tc);
  const fallbackText = tc.content?.find(isToolResultTextContent)?.text;
  let text2 = terminalResult?.truncated === true && fallbackText !== void 0 ? stripLegacyTerminalExitMarkers(fallbackText) : terminalResult?.preview;
  const hasRetainedNonPtySnapshot = terminalContent?.isPty === false && text2 !== void 0;
  if (text2 === void 0 && terminalContent?.isPty !== false) {
    text2 = fallbackText === void 0 ? void 0 : stripLegacyTerminalExitMarkers(fallbackText);
  }
  if (text2 === void 0 || !text2 && !hasRetainedNonPtySnapshot && terminalResult?.truncated !== true) {
    return void 0;
  }
  return {
    text: text2.replace(/\r?\n/g, "\r\n"),
    ...terminalResult?.truncated !== void 0 ? { truncated: terminalResult.truncated } : {}
  };
}

function stripLegacyTerminalExitMarkers(text2) {
  return text2.replace(/<shellId:[^>\r\n]*completed with exit code -?\d+>\s*$/i, "");
}

function isToolResultTextContent(content) {
  return content.type === "text" /* Text */;
}

function getTerminalCommandState(tc, fallbackSuccess) {
  const terminalResult = tc.status === "completed" /* Completed */ || tc.status === "running" /* Running */ ? getTerminalCommandResult(tc) : void 0;
  if (terminalResult?.exitCode !== void 0) {
    return { exitCode: terminalResult.exitCode };
  }
  if ((tc.status === "completed" /* Completed */ || tc.status === "running" /* Running */) && getTerminalContent(tc.content)?.isPty === false) {
    return fallbackSuccess === false ? { exitCode: 1 } : void 0;
  }
  return fallbackSuccess === void 0 ? void 0 : { exitCode: fallbackSuccess ? 0 : 1 };
}

function isToolResultTerminalContent(content) {
  return content.type === "terminal" /* Terminal */;
}

function getTerminalCommandResult(tc) {
  const result = tc.content?.find(isToolResultTerminalContent)?.result;
  if (result) {
    return result;
  }
  return tc.content?.find((c) => c.type === "terminalComplete");
}

function getTerminalLanguage(tc) {
  return tc.toolName === "powershell" ? "powershell" : "shellscript";
}

function isTerminalToolCall(tc, existingKind) {
  if (existingKind === "terminal") {
    return true;
  }
  if (getToolKind(tc) === "terminal" && getTerminalInput(tc) !== void 0) {
    return true;
  }
  if (tc.status === "running" /* Running */ || tc.status === "completed" /* Completed */) {
    return !!getTerminalContentUri(tc.content);
  }
  return false;
}

function buildTerminalToolSpecificData(tc, sessionResource, existing) {
  const terminalContent = tc.status === "running" /* Running */ || tc.status === "completed" /* Completed */ ? getTerminalContent(tc.content) : void 0;
  const terminalContentUri = terminalContent?.resource;
  const nextCommand = getTerminalInput(tc);
  const commandLine = nextCommand ? { ...existing?.commandLine, original: nextCommand } : existing?.commandLine ?? { original: "" };
  const nextOutput = getTerminalOutput(tc);
  return {
    ...existing,
    kind: "terminal",
    commandLine,
    intention: tc.intention ?? existing?.intention,
    language: existing?.language ?? getTerminalLanguage(tc),
    autoApproveRuleResolvable: readToolCallMeta(tc).autoApproveRuleResolvable ?? existing?.autoApproveRuleResolvable,
    terminalToolSessionId: terminalContentUri ? makeAhpTerminalToolSessionId(terminalContentUri, sessionResource) : existing?.terminalToolSessionId,
    terminalCommandUri: terminalContentUri ? URI.parse(terminalContentUri) : existing?.terminalCommandUri,
    isPty: terminalContent?.isPty ?? existing?.isPty,
    terminalCommandOutput: nextOutput ?? existing?.terminalCommandOutput
  };
}

function getToolInputOutputDetails(tc, isError, errorString, includeMcpOutput, connectionAuthority) {
  const toolInput = tc.status === "streaming" /* Streaming */ ? void 0 : getInlineToolInput(tc.toolInput);
  if (!toolInput) {
    return void 0;
  }
  const output = [];
  if (tc.status === "completed" /* Completed */ || tc.status === "running" /* Running */) {
    for (const block2 of tc.content ?? []) {
      switch (block2.type) {
        case "text" /* Text */:
          output.push({ type: "embed", value: block2.text, isText: true, mimeType: "text/plain" });
          break;
        case "embeddedResource" /* EmbeddedResource */:
          output.push({ type: "embed", value: block2.data, mimeType: block2.contentType });
          break;
        case "resource" /* Resource */:
          output.push({ type: "ref", uri: wrapResourceUri(block2.uri, connectionAuthority), mimeType: block2.contentType });
          break;
      }
    }
  }
  if (output.length === 0 && errorString) {
    output.push({ type: "embed", value: errorString, isText: true, mimeType: "text/plain" });
  }
  return {
    input: toolInput,
    inputLanguage: "json",
    output,
    isError,
    mcpOutput: includeMcpOutput ? toMcpCallToolResult(tc, isError, connectionAuthority) : void 0
  };
}

function toMcpCallToolResult(tc, isError, connectionAuthority) {
  if (tc.status !== "completed" /* Completed */ && tc.status !== "running" /* Running */) {
    return void 0;
  }
  const content = [];
  for (const block2 of tc.content ?? []) {
    const mcpBlock = toMcpContentBlock(block2, connectionAuthority);
    if (mcpBlock) {
      content.push(mcpBlock);
    }
  }
  if (content.length === 0 && !isError) {
    return void 0;
  }
  return { content, isError: isError || void 0 };
}

function toMcpContentBlock(block2, connectionAuthority) {
  switch (block2.type) {
    case "text" /* Text */:
      return { type: "text", text: block2.text };
    case "embeddedResource" /* EmbeddedResource */: {
      if (block2.contentType.startsWith("image/")) {
        return { type: "image", data: block2.data, mimeType: block2.contentType };
      }
      if (block2.contentType.startsWith("audio/")) {
        return { type: "audio", data: block2.data, mimeType: block2.contentType };
      }
      return {
        type: "resource",
        resource: {
          uri: `data:${block2.contentType};base64,${block2.data}`,
          mimeType: block2.contentType,
          blob: block2.data
        }
      };
    }
    case "resource" /* Resource */: {
      const wrapped = wrapResourceUri(block2.uri, connectionAuthority);
      return {
        type: "resource_link",
        name: basename2(wrapped) || wrapped.toString(),
        uri: wrapped.toString(),
        mimeType: block2.contentType
      };
    }
    default:
      return void 0;
  }
}

function wrapResourceUri(uri4, connectionAuthority) {
  return toAgentHostUri(URI.parse(uri4), connectionAuthority);
}

function getToolErrorString(tc) {
  if (tc.status === "completed" /* Completed */) {
    return tc.error?.message;
  }
  if (tc.status === "cancelled" /* Cancelled */) {
    return typeof tc.reasonMessage === "string" ? tc.reasonMessage : tc.reasonMessage?.markdown;
  }
  return void 0;
}

function buildSessionCreatedToolData(tc) {
  if (tc.status !== "completed" /* Completed */ || !tc.success) {
    return void 0;
  }
  const isSend = isSendMessageTool(tc.toolName);
  if (!isCreateSessionTool(tc.toolName) && !isCreateChatTool(tc.toolName) && !isSend) {
    return void 0;
  }
  const output = getToolOutputText(tc);
  const match2 = output?.match(/agent-host-session:\/\/[^\s)<>;"']+/);
  const openLink = match2?.[0];
  const backend = openLink ? parseOpenSessionLinkUri(openLink) : void 0;
  if (!openLink || !backend) {
    return void 0;
  }
  const fullTitle = createSessionTitleFromArgs(getInlineToolInput(tc.toolInput)) ?? (backend.path.replace(/^\//, "") || backend.toString());
  const label3 = fullTitle.length > 60 ? `${fullTitle.slice(0, 57)}\u2026` : fullTitle;
  const isChat = isCreateChatTool(tc.toolName) || (isCreateSessionTool(tc.toolName) || isSend) && !!parseOpenSessionLinkChatId(openLink);
  return { kind: "sessionCreated", openLink, label: label3, fullTitle, ...isChat ? { isChat: true } : {} };
}

function buildGeneratedImageToolData(tc) {
  if (tc.status !== "completed" /* Completed */ || !tc.success || tc.toolName !== imageGenerationToolName) {
    return void 0;
  }
  const hasImage = tc.content?.some((block2) => block2.type === "embeddedResource" /* EmbeddedResource */ && block2.contentType.startsWith("image/") && block2.data.length > 0);
  return hasImage ? { kind: "generatedImage" } : void 0;
}

function buildAutomationConfiguredToolData(tc) {
  if (tc.status !== "completed" /* Completed */ || !tc.success || tc.toolName !== ConfigureAutomationToolReferenceName) {
    return void 0;
  }
  const output = getToolOutputText(tc);
  if (!output) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(output);
    const operation = parsed.status === "created" || parsed.status === "updated" ? parsed.status : void 0;
    if (!operation || typeof parsed.automation?.id !== "string" || typeof parsed.automation.name !== "string") {
      return void 0;
    }
    return {
      kind: "automationConfigured",
      automationId: parsed.automation.id,
      automationName: parsed.automation.name,
      operation
    };
  } catch {
    return void 0;
  }
}

function createSessionTitleFromArgs(toolInput) {
  if (!toolInput) {
    return void 0;
  }
  try {
    const args2 = JSON.parse(toolInput);
    const text2 = typeof args2.prompt === "string" ? args2.prompt : typeof args2.message === "string" ? args2.message : void 0;
    if (text2 === void 0) {
      return void 0;
    }
    const firstLine = text2.trim().split("\n")[0].trim();
    if (!firstLine) {
      return void 0;
    }
    return firstLine;
  } catch {
    return void 0;
  }
}

function completedToolCallConfirmedReason(tc) {
  if (tc.status === "completed" /* Completed */) {
    return { type: 1 /* ConfirmationNotNeeded */ };
  }
  return { type: tc.reason === "skipped" /* Skipped */ ? 5 /* Skipped */ : 0 /* Denied */ };
}

function completedToolCallToSerialized(tc, subAgentInvocationId, sessionResource, connectionAuthority, resourceUris = createAgentHostResourceUriMapper(connectionAuthority)) {
  const isTerminal = isTerminalToolCall(tc);
  const isSuccess3 = tc.status === "completed" /* Completed */ && tc.success;
  let invocationMsg = stringOrMarkdownToString(tc.invocationMessage, connectionAuthority) ?? tc.displayName;
  const subagentContent = tc.status === "completed" /* Completed */ ? getToolSubagentContent(tc) : void 0;
  const isSubagent = subagentContent || isSubagentTool(tc);
  if (isSubagent && tc.status === "completed" /* Completed */) {
    const resultText = getToolOutputText(tc);
    const pastTenseMsg2 = isSuccess3 ? stringOrMarkdownToString(tc.pastTenseMessage, connectionAuthority) ?? invocationMsg : invocationMsg;
    return {
      kind: "toolInvocationSerialized",
      toolCallId: tc.toolCallId,
      toolId: tc.toolName,
      source: ToolDataSource.Internal,
      invocationMessage: invocationMsg,
      originMessage: void 0,
      pastTenseMessage: pastTenseMsg2,
      isConfirmed: completedToolCallConfirmedReason(tc),
      isComplete: true,
      presentation: void 0,
      subAgentInvocationId,
      toolSpecificData: {
        kind: "subagent",
        description: getSubagentTaskDescription(tc) ?? tc.displayName,
        ...subagentContent?.title ? { agentDisplayName: subagentContent.title } : {},
        agentName: subagentContent?.agentName ?? getSubagentAgentName(tc),
        result: resultText,
        chatResource: getSubagentChatResource(tc, subagentContent, sessionResource)
      }
    };
  }
  let toolSpecificData;
  if (isTerminal) {
    toolSpecificData = {
      ...buildTerminalToolSpecificData(tc, sessionResource),
      terminalCommandState: getTerminalCommandState(tc, isSuccess3)
    };
  } else if (getToolKind(tc) === "search") {
    toolSpecificData = { kind: "search" };
  } else {
    toolSpecificData = buildSessionCreatedToolData(tc) ?? buildGeneratedImageToolData(tc) ?? buildAutomationConfiguredToolData(tc);
    if (!toolSpecificData) {
      toolSpecificData = buildMcpAppToolInputData(tc, connectionAuthority);
    }
  }
  let pastTenseMsg = isSuccess3 ? stringOrMarkdownToString(tc.pastTenseMessage, connectionAuthority) ?? invocationMsg : invocationMsg;
  if (isAddCommentTool(tc.toolName)) {
    const ref = addCommentReference(tc, resourceUris);
    if (ref) {
      invocationMsg = ref;
      pastTenseMsg = ref;
    }
  }
  const resultDetails = (!toolSpecificData || toolSpecificData.kind === "generatedImage" || toolSpecificData.kind === "input" && toolSpecificData.mcpAppData) && (tc.status !== "completed" /* Completed */ || getToolFileEdits(tc).length === 0) ? getToolInputOutputDetails(tc, !isSuccess3, getToolErrorString(tc), !!(toolSpecificData?.kind === "input" && toolSpecificData.mcpAppData), connectionAuthority) : void 0;
  return {
    kind: "toolInvocationSerialized",
    toolCallId: tc.toolCallId,
    toolId: tc.toolName,
    source: ToolDataSource.Internal,
    invocationMessage: invocationMsg,
    originMessage: void 0,
    pastTenseMessage: isTerminal ? void 0 : pastTenseMsg,
    isConfirmed: completedToolCallConfirmedReason(tc),
    isComplete: true,
    presentation: shouldHideAutomaticTitleRename(tc) ? "hidden" /* Hidden */ : shouldHideCompletedAgentHostAskUserTool(tc) ? "hiddenAfterComplete" /* HiddenAfterComplete */ : void 0,
    subAgentInvocationId,
    toolSpecificData,
    resultDetails
  };
}

function completedToolCallToEditParts(tc, connectionAuthority) {
  if (tc.status !== "completed" /* Completed */) {
    return [];
  }
  const fileEdits = getToolFileEdits(tc);
  if (fileEdits.length === 0) {
    return [];
  }
  const parts = [];
  for (const edit3 of fileEdits) {
    const part = fileEditToExternalEdit(edit3, tc.toolCallId, connectionAuthority);
    if (part) {
      parts.push(part);
    }
  }
  return parts;
}

function fileEditToExternalEdit(edit3, undoStopId, connectionAuthority) {
  const normalized = normalizeFileEdit(edit3);
  if (!normalized) {
    return void 0;
  }
  const diff4 = edit3.diff && (edit3.diff.added !== void 0 || edit3.diff.removed !== void 0) ? { added: edit3.diff.added ?? 0, removed: edit3.diff.removed ?? 0 } : void 0;
  return {
    kind: "externalEdit",
    uri: toAgentHostUri(normalized.resource, connectionAuthority),
    editKind: normalized.kind,
    originalUri: normalized.kind === "rename" /* Rename */ && normalized.beforeUri ? toAgentHostUri(normalized.beforeUri, connectionAuthority) : void 0,
    beforeContentUri: normalized.beforeContentUri ? toAgentHostContentUri(normalized.beforeContentUri, connectionAuthority) : void 0,
    afterContentUri: normalized.afterContentUri ? toAgentHostContentUri(normalized.afterContentUri, connectionAuthority) : void 0,
    diff: diff4,
    undoStopId
  };
}

var EXTERNAL_LINK_SCHEMES = /* @__PURE__ */ new Set([
  "http",
  "https",
  "mailto",
  "ws",
  "wss",
  "ftp",
  "ftps",
  "data",
  "blob",
  "javascript",
  "command",
  "vscode",
  "vscode-insiders",
  Schemas.vscodeBrowser,
  "copilot-skill",
  product_default.urlProtocol,
  AGENT_HOST_SCHEME,
  AGENT_HOST_SESSION_LINK_SCHEME
]);

function rewriteMarkdownLinks2(markdown, connectionAuthority) {
  return rewriteMarkdownLinks(markdown, {
    rewriteLink: (token) => rewriteLinkTokenRaw(token, connectionAuthority)
  });
}

function rewriteLinkTokenRaw(token, connectionAuthority) {
  let parsed;
  try {
    parsed = URI.parse(token.href, true);
  } catch {
    return void 0;
  }
  const scheme = parsed.scheme.toLowerCase();
  if (!scheme || EXTERNAL_LINK_SCHEMES.has(scheme)) {
    return void 0;
  }
  let agentHostUri2 = toAgentHostUri(parsed, connectionAuthority);
  const isSkill = isSkillFileUri(parsed);
  if (isSkill && !agentHostUri2.query.includes("vscodeLinkType=")) {
    const existing = agentHostUri2.query;
    agentHostUri2 = agentHostUri2.with({ query: existing ? `${existing}&vscodeLinkType=skill` : "vscodeLinkType=skill" });
  }
  const prefix = token.type === "image" ? "![" : "[";
  const text2 = isSkill || token.type === "image" ? escapeMarkdownLinkLabel(token.text ?? "") : "";
  return `${prefix}${text2}](${agentHostUri2.toString()})`;
}

function isSkillFileUri(uri4) {
  const name = basename2(uri4);
  return name.toLowerCase() === "skill.md";
}

function rawMarkdownToString(content, connectionAuthority) {
  const rewritten = connectionAuthority ? rewriteMarkdownLinks2(content, connectionAuthority) : content;
  return new MarkdownString(rewritten);
}

function parseAbsoluteFileLinkTarget(href) {
  const fragmentIndex = href.indexOf("#");
  const rawPath = fragmentIndex >= 0 ? href.substring(0, fragmentIndex) : href;
  if (rawPath.includes("?")) {
    return void 0;
  }
  const existingFragment = fragmentIndex >= 0 ? href.substring(fragmentIndex + 1) : "";
  const parsedPath = existingFragment ? { path: rawPath } : parseFileLocation(rawPath);
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(parsedPath.path);
  } catch {
    return void 0;
  }
  const absolutePath2 = decodedPath;
  const isWindowsPath = win32.isAbsolute(absolutePath2);
  if (!posix.isAbsolute(absolutePath2) && !isWindowsPath) {
    return void 0;
  }
  const selectionFragment = formatLocationFragment(parsedPath);
  const normalizedPath = isWindowsPath ? absolutePath2.replaceAll("\\", "/") : absolutePath2;
  return URI.file(normalizedPath).with({ fragment: existingFragment || selectionFragment });
}

function parseFileLocation(path) {
  const match2 = /^(?<path>.+?):(?<line>[1-9]\d*)(?::(?<column>[1-9]\d*))?$/.exec(path);
  if (!match2?.groups) {
    return { path };
  }
  const line = Number(match2.groups.line);
  const column = match2.groups.column ? Number(match2.groups.column) : void 0;
  if (!Number.isSafeInteger(line) || column !== void 0 && !Number.isSafeInteger(column)) {
    return { path };
  }
  return { path: match2.groups.path, line, column };
}

function formatLocationFragment(location2) {
  if (location2.line === void 0) {
    return "";
  }
  return `L${location2.line}${location2.column !== void 0 && location2.column !== 1 ? `,${location2.column}` : ""}`;
}

function normalizeFileUriSelection(uri4, href) {
  if (uri4.scheme.toLowerCase() !== Schemas.file || uri4.query || uri4.fragment) {
    return uri4;
  }
  const parsedPath = parseFileLocation(href);
  if (parsedPath.line === void 0) {
    return uri4;
  }
  const fragment = formatLocationFragment(parsedPath);
  const suffixLength = href.length - parsedPath.path.length;
  return uri4.with({ path: uri4.path.substring(0, uri4.path.length - suffixLength), fragment });
}

function rewriteAgentHostLinkTarget(href, connectionAuthority) {
  let parsed = parseAbsoluteFileLinkTarget(href);
  if (!parsed) {
    try {
      parsed = URI.parse(href, true);
    } catch {
      return href;
    }
    const scheme = parsed.scheme.toLowerCase();
    if (!scheme || EXTERNAL_LINK_SCHEMES.has(scheme)) {
      return href;
    }
    parsed = normalizeFileUriSelection(parsed.with({ scheme }), href);
    if (!parsed.path.startsWith("/")) {
      return href;
    }
  }
  let agentHostUri2;
  try {
    agentHostUri2 = toAgentHostUri(parsed, connectionAuthority);
  } catch {
    return href;
  }
  if (isSkillFileUri(parsed) && !agentHostUri2.query.includes("vscodeLinkType=")) {
    const existing = agentHostUri2.query;
    agentHostUri2 = agentHostUri2.with({ query: existing ? `${existing}&vscodeLinkType=skill` : "vscodeLinkType=skill" });
  }
  return agentHostUri2.toString();
}

function stringOrMarkdownToString(value2, connectionAuthority) {
  if (value2 === void 0) {
    return void 0;
  }
  if (typeof value2 === "string") {
    return value2;
  }
  return rawMarkdownToString(value2.markdown, connectionAuthority);
}

var ADD_COMMENT_PREVIEW_LENGTH = 40;

function addCommentPreview(text2) {
  const singleLine = text2.replace(/\s+/g, " ").trim();
  return singleLine.length > ADD_COMMENT_PREVIEW_LENGTH ? `${singleLine.slice(0, ADD_COMMENT_PREVIEW_LENGTH)}\u2026` : singleLine;
}

function isPositiveInteger(value2) {
  return typeof value2 === "number" && Number.isInteger(value2) && value2 >= 1;
}

function isOneBasedRange(value2) {
  const range2 = value2;
  return !!range2 && typeof range2 === "object" && isPositiveInteger(range2.startLineNumber) && isPositiveInteger(range2.startColumn) && isPositiveInteger(range2.endLineNumber) && isPositiveInteger(range2.endColumn);
}

function addCommentReference(tc, resourceUris) {
  if (tc.status === "streaming" /* Streaming */ || !tc.toolInput) {
    return void 0;
  }
  const toolInput = getInlineToolInput(tc.toolInput);
  if (!toolInput) {
    return void 0;
  }
  let args2;
  try {
    args2 = JSON.parse(toolInput);
  } catch {
    return void 0;
  }
  if (typeof args2.resourceUri !== "string" || typeof args2.text !== "string" || !isOneBasedRange(args2.range)) {
    return void 0;
  }
  const preview = escapeIcons(escapeMarkdownLinkLabel(addCommentPreview(args2.text)));
  const resource = resourceUris.fromAgentHost(URI.parse(args2.resourceUri));
  const commandArgs = encodeURIComponent(JSON.stringify([resource.toString(), args2.range]));
  const link2 = `command:${"_agentFeedbackReview.revealAt" /* RevealAt */}?${commandArgs}`;
  return new MarkdownString(`[addComment "${preview}"](${link2})`, {
    isTrusted: { enabledCommands: ["_agentFeedbackReview.revealAt" /* RevealAt */] },
    supportThemeIcons: true
  });
}

function toolCallStateToInvocation(tc, subAgentInvocationId, sessionResource, connectionAuthority, mcpServerAuthority = sessionResource.authority, options3, resourceUris = createAgentHostResourceUriMapper(connectionAuthority)) {
  const toolData = {
    id: tc.toolName,
    source: ToolDataSource.Internal,
    displayName: tc.displayName,
    modelDescription: tc.toolName
  };
  if (tc.contributor?.kind === "client" /* Client */ && options3 && tc.contributor.clientId !== options3.currentClientId) {
    const invocation2 = new ChatToolInvocation(void 0, toolData, tc.toolCallId, subAgentInvocationId, void 0);
    invocation2.invocationMessage = localize(9046, null, tc.displayName);
    invocation2.otherClientToolCall = {
      cancel: () => options3.cancelOtherClientToolCall(tc)
    };
    return invocation2;
  }
  if (tc.status === "pending-confirmation" /* PendingConfirmation */) {
    const confirmationMessages = toolCallConfirmationMessages(tc, connectionAuthority);
    let toolSpecificData;
    const pendingEdits = tc.edits?.items;
    if (isViewUnreviewedCommentsTool(tc.toolName)) {
      toolSpecificData = {
        kind: "agentFeedbackReviewConfirmation",
        options: [localize(9039, null)]
      };
    } else if (pendingEdits?.length) {
      const wrap = (uri4) => connectionAuthority ? toAgentHostUri(uri4, connectionAuthority) : uri4;
      const wrapContent = (uri4) => connectionAuthority ? toAgentHostContentUri(uri4, connectionAuthority) : uri4;
      const mapped = mapFileEdits(pendingEdits, tc.toolCallId);
      toolSpecificData = {
        kind: "modifiedFilesConfirmation",
        options: ["Allow"],
        modifiedFiles: mapped.map((edit3) => {
          const resource = wrap(edit3.resource);
          const originalResource = edit3.originalResource ? wrap(edit3.originalResource) : void 0;
          const modifiedContent = edit3.afterContentUri ? wrapContent(edit3.afterContentUri) : void 0;
          const originalContent = edit3.beforeContentUri ? wrapContent(edit3.beforeContentUri) : void 0;
          return {
            uri: resource,
            editKind: edit3.kind,
            originalUri: originalResource,
            modifiedContentUri: modifiedContent,
            originalContentUri: originalContent,
            insertions: edit3.diff?.added,
            deletions: edit3.diff?.removed,
            title: basename2(edit3.resource),
            description: edit3.resource.path
          };
        })
      };
    } else if (getToolKind(tc) === "terminal" && getInlineToolInput(tc.toolInput)) {
      toolSpecificData = buildTerminalToolSpecificData(tc, sessionResource);
    } else {
      const toolInput = getInlineToolInput(tc.toolInput);
      if (toolInput) {
        let rawInput;
        try {
          rawInput = JSON.parse(toolInput);
        } catch {
          rawInput = { input: toolInput };
        }
        toolSpecificData = { kind: "input", rawInput };
      }
    }
    return new ChatToolInvocation(
      {
        invocationMessage: stringOrMarkdownToString(tc.invocationMessage, connectionAuthority),
        confirmationMessages,
        presentation: "hiddenAfterComplete" /* HiddenAfterComplete */,
        toolSpecificData
      },
      toolData,
      tc.toolCallId,
      subAgentInvocationId,
      void 0
    );
  }
  const invocation = new ChatToolInvocation(void 0, toolData, tc.toolCallId, subAgentInvocationId, void 0);
  invocation.invocationMessage = stringOrMarkdownToString(tc.invocationMessage, connectionAuthority) ?? tc.displayName;
  if (isAgentHostAskUserTool(tc.toolName)) {
    invocation.invocationMessage = localize(9043, null);
    invocation.presentation = "hiddenAfterComplete" /* HiddenAfterComplete */;
  } else if (shouldHideAutomaticTitleRename(tc)) {
    invocation.presentation = "hidden" /* Hidden */;
  }
  if (tc.status === "auth-required" /* AuthRequired */) {
    invocation.setAuthenticationRequired(toolCallAuthenticationServer(tc, mcpServerAuthority));
  }
  if (isAddCommentTool(tc.toolName)) {
    invocation.invocationMessage = addCommentReference(tc, resourceUris) ?? invocation.invocationMessage;
  }
  if (isTerminalToolCall(tc)) {
    invocation.toolSpecificData = buildTerminalToolSpecificData(tc, sessionResource);
  } else if (isSubagentTool(tc)) {
    const subagentContent = tc.status === "running" /* Running */ || tc.status === "completed" /* Completed */ ? getToolSubagentContent(tc) : void 0;
    invocation.toolSpecificData = {
      kind: "subagent",
      description: getSubagentTaskDescription(tc),
      ...subagentContent?.title ? { agentDisplayName: subagentContent.title } : {},
      agentName: subagentContent?.agentName ?? getSubagentAgentName(tc),
      chatResource: getSubagentChatResource(tc, subagentContent, sessionResource)
    };
  } else if (getToolKind(tc) === "search") {
    invocation.toolSpecificData = { kind: "search" };
  } else if (tc.status !== "streaming" /* Streaming */) {
    invocation.toolSpecificData = buildMcpAppToolInputData(tc, connectionAuthority);
  }
  return invocation;
}

function toolCallConfirmationMessages(tc, connectionAuthority) {
  const riskAssessment = tc.riskAssessment;
  let approvalReason;
  if (riskAssessment?.status === "loading" /* Loading */) {
    approvalReason = { status: "loading" };
  } else if (riskAssessment?.status === "complete" /* Complete */) {
    approvalReason = {
      status: "complete",
      explanation: stringOrMarkdownToString(riskAssessment.reason, connectionAuthority),
      safety: riskAssessment.safety
    };
  }
  return {
    title: isViewUnreviewedCommentsTool(tc.toolName) ? localize(9041, null) : stringOrMarkdownToString(tc.confirmationTitle, connectionAuthority) ?? tc.displayName,
    message: isViewUnreviewedCommentsTool(tc.toolName) ? localize(9040, null) : stringOrMarkdownToString(tc.invocationMessage, connectionAuthority),
    approvalReason,
    ...tc.options ? { customOptions: tc.options } : {}
  };
}

function toolCallAuthenticationServer(tc, sessionAuthority) {
  const metadata = readToolCallMeta(tc);
  return {
    id: `${sessionAuthority}/${tc.contributor.customizationId}`,
    name: tc.auth.resource.resource_name ?? metadata.mcpServerName ?? tc.displayName,
    resource: tc.auth.resource.resource,
    oauthClient: tc.auth.oauthClient,
    authorizationServers: tc.auth.resource.authorization_servers,
    supportedScopes: tc.auth.resource.scopes_supported,
    requiredScopes: tc.auth.requiredScopes,
    reason: tc.auth.reason
  };
}

function toolCallStateToStreamingInvocation(tc, subAgentInvocationId, sessionResource, connectionAuthority, mcpServerAuthority) {
  const invocation = ChatToolInvocation.createStreaming({
    toolCallId: tc.toolCallId,
    toolId: tc.toolName,
    toolData: {
      id: tc.toolName,
      source: ToolDataSource.Internal,
      displayName: tc.displayName,
      modelDescription: tc.toolName
    },
    subagentInvocationId: subAgentInvocationId
  });
  updateStreamingToolInvocation(invocation, tc, connectionAuthority ?? "");
  if (isAgentHostAskUserTool(tc.toolName)) {
    invocation.invocationMessage = localize(9042, null);
    invocation.presentation = "hiddenAfterComplete" /* HiddenAfterComplete */;
  } else if (isRenameChatTool(tc)) {
    invocation.presentation = "hidden" /* Hidden */;
  }
  if (sessionResource && isSubagentTool(tc)) {
    invocation.toolSpecificData = toolCallStateToInvocation(tc, subAgentInvocationId, sessionResource, connectionAuthority ?? "", mcpServerAuthority).toolSpecificData;
  }
  return invocation;
}

function getStreamingToolInputForDisplay(tc) {
  if (tc.status !== "streaming" /* Streaming */ || !tc.partialInput) {
    return void 0;
  }
  return parsePartialToolInputForDisplay(tc.partialInput) ?? tc.partialInput;
}

function updateStreamingToolInvocation(existing, tc, connectionAuthority) {
  if (tc.status !== "streaming" /* Streaming */) {
    return void 0;
  }
  if (getToolKind(tc) === "read") {
    existing.updatePartialInput(void 0);
    existing.updateStreamingMessage(localize(9048, null));
    return void 0;
  }
  const partialInput = getStreamingToolInputForDisplay(tc);
  if (partialInput !== void 0) {
    existing.updatePartialInput(partialInput);
  }
  const invocationMessage = stringOrMarkdownToString(tc.invocationMessage, connectionAuthority);
  if (invocationMessage) {
    existing.updateStreamingMessage(invocationMessage);
  }
  return partialInput;
}

function toolCallStateToPreparedInvocation(tc, sessionResource, connectionAuthority, mcpServerAuthority = sessionResource.authority, options3, resourceUris = createAgentHostResourceUriMapper(connectionAuthority)) {
  const built = toolCallStateToInvocation(tc, void 0, sessionResource, connectionAuthority, mcpServerAuthority, options3, resourceUris);
  return {
    invocationMessage: built.invocationMessage,
    pastTenseMessage: built.pastTenseMessage,
    confirmationMessages: built.confirmationMessages,
    presentation: built.presentation,
    toolSpecificData: built.toolSpecificData
  };
}

function updateRunningToolSpecificData(existing, tc, sessionResource, connectionAuthority, resourceUris = createAgentHostResourceUriMapper(connectionAuthority)) {
  if (tc.status !== "running" /* Running */) {
    return;
  }
  existing.invocationMessage = stringOrMarkdownToString(tc.invocationMessage, connectionAuthority) ?? existing.invocationMessage;
  if (isAgentHostAskUserTool(tc.toolName)) {
    existing.invocationMessage = localize(9043, null);
    existing.presentation = "hiddenAfterComplete" /* HiddenAfterComplete */;
  }
  if (isAddCommentTool(tc.toolName)) {
    existing.invocationMessage = addCommentReference(tc, resourceUris) ?? existing.invocationMessage;
  }
  const subagentContent = getToolSubagentContent(tc);
  if (subagentContent) {
    existing.toolSpecificData = {
      kind: "subagent",
      isActive: existing.toolSpecificData?.kind === "subagent" ? existing.toolSpecificData.isActive : void 0,
      description: getSubagentTaskDescription(tc),
      agentDisplayName: subagentContent.title,
      agentName: subagentContent.agentName,
      credits: existing.toolSpecificData?.kind === "subagent" ? existing.toolSpecificData.credits : void 0,
      modelName: existing.toolSpecificData?.kind === "subagent" ? existing.toolSpecificData.modelName : void 0,
      startedAt: existing.toolSpecificData?.kind === "subagent" ? existing.toolSpecificData.startedAt : void 0,
      duration: existing.toolSpecificData?.kind === "subagent" ? existing.toolSpecificData.duration : void 0,
      chatResource: subagentContent.resource
    };
    existing.notifyToolSpecificDataChanged();
    return;
  }
  if (existing.toolSpecificData?.kind === "subagent") {
    const description = getSubagentTaskDescription(tc) ?? existing.toolSpecificData.description;
    const agentName = getSubagentAgentName(tc) ?? existing.toolSpecificData.agentName;
    if (description !== existing.toolSpecificData.description || agentName !== existing.toolSpecificData.agentName) {
      existing.toolSpecificData = { ...existing.toolSpecificData, description, agentName };
      existing.notifyToolSpecificDataChanged();
    }
    return;
  }
  const existingInput = existing.toolSpecificData?.kind === "input" ? existing.toolSpecificData : void 0;
  const nextInput = buildMcpAppToolInputData(tc, connectionAuthority, existingInput?.rawInput);
  if (nextInput) {
    if (!existingInput || !isSameMcpAppData(existingInput.mcpAppData, nextInput.mcpAppData)) {
      existing.toolSpecificData = nextInput;
      existing.notifyToolSpecificDataChanged();
    }
    return;
  }
  const existingTerminal = existing.toolSpecificData?.kind === "terminal" ? existing.toolSpecificData : void 0;
  if (isTerminalToolCall(tc, existing.toolSpecificData?.kind)) {
    const next = buildTerminalToolSpecificData(tc, sessionResource, existingTerminal);
    const outputChanged = next.terminalCommandOutput?.text !== existingTerminal?.terminalCommandOutput?.text;
    const commandChanged = next.commandLine.original !== existingTerminal?.commandLine.original;
    if (!existingTerminal || outputChanged || commandChanged) {
      existing.toolSpecificData = next;
      existing.notifyToolSpecificDataChanged();
    }
  }
}

function finalizeToolInvocation(invocation, tc, backendSession, connectionAuthority, resourceUris = createAgentHostResourceUriMapper(connectionAuthority)) {
  const isCompleted = tc.status === "completed" /* Completed */;
  const isCancelled = tc.status === "cancelled" /* Cancelled */;
  const isTerminal = isTerminalToolCall(tc, invocation.toolSpecificData?.kind);
  if ((isCompleted || isCancelled) && hasKey(tc, { invocationMessage: true })) {
    invocation.invocationMessage = stringOrMarkdownToString(tc.invocationMessage, connectionAuthority) ?? invocation.invocationMessage;
  }
  if (isAddCommentTool(tc.toolName)) {
    invocation.invocationMessage = addCommentReference(tc, resourceUris) ?? invocation.invocationMessage;
  }
  if (isAgentHostAskUserTool(tc.toolName)) {
    invocation.presentation = "hiddenAfterComplete" /* HiddenAfterComplete */;
  }
  if (isCompleted) {
    const subagentContent = getToolSubagentContent(tc);
    if (subagentContent) {
      const resultText = getToolOutputText(tc);
      invocation.toolSpecificData = {
        kind: "subagent",
        isActive: invocation.toolSpecificData?.kind === "subagent" ? invocation.toolSpecificData.isActive : void 0,
        description: getSubagentTaskDescription(tc),
        agentDisplayName: subagentContent.title,
        agentName: subagentContent.agentName,
        result: resultText,
        credits: invocation.toolSpecificData?.kind === "subagent" ? invocation.toolSpecificData.credits : void 0,
        modelName: invocation.toolSpecificData?.kind === "subagent" ? invocation.toolSpecificData.modelName : void 0,
        startedAt: invocation.toolSpecificData?.kind === "subagent" ? invocation.toolSpecificData.startedAt : void 0,
        duration: invocation.toolSpecificData?.kind === "subagent" ? invocation.toolSpecificData.duration : void 0,
        chatResource: getSubagentChatResource(tc, subagentContent, backendSession)
      };
    } else if (invocation.toolSpecificData?.kind === "subagent") {
      invocation.toolSpecificData = {
        kind: "subagent",
        isActive: invocation.toolSpecificData.isActive,
        description: getSubagentTaskDescription(tc) ?? invocation.toolSpecificData.description,
        ...invocation.toolSpecificData.agentDisplayName ? { agentDisplayName: invocation.toolSpecificData.agentDisplayName } : {},
        agentName: getSubagentAgentName(tc) ?? invocation.toolSpecificData.agentName,
        result: getToolOutputText(tc),
        credits: invocation.toolSpecificData.credits,
        modelName: invocation.toolSpecificData.modelName,
        startedAt: invocation.toolSpecificData.startedAt,
        duration: invocation.toolSpecificData.duration,
        chatResource: invocation.toolSpecificData.chatResource ?? getSubagentChatResource(tc, void 0, backendSession)
      };
    }
  }
  if (isTerminal && (isCompleted || isCancelled)) {
    const existing = invocation.toolSpecificData?.kind === "terminal" ? invocation.toolSpecificData : void 0;
    invocation.presentation = void 0;
    invocation.toolSpecificData = {
      ...buildTerminalToolSpecificData(tc, backendSession, existing),
      terminalCommandState: getTerminalCommandState(tc, isCompleted && tc.success)
    };
  } else if (isCompleted && tc.pastTenseMessage) {
    invocation.pastTenseMessage = stringOrMarkdownToString(tc.pastTenseMessage, connectionAuthority);
  }
  if (isCompleted && isAddCommentTool(tc.toolName)) {
    invocation.pastTenseMessage = addCommentReference(tc, resourceUris) ?? invocation.pastTenseMessage;
  }
  if (isCompleted) {
    const resultToolSpecificData = buildSessionCreatedToolData(tc) ?? buildGeneratedImageToolData(tc) ?? buildAutomationConfiguredToolData(tc);
    if (resultToolSpecificData) {
      invocation.presentation = void 0;
      invocation.toolSpecificData = resultToolSpecificData;
      invocation.notifyToolSpecificDataChanged();
    }
  }
  if (isCompleted) {
    const mcpAppInput = buildMcpAppToolInputData(
      tc,
      connectionAuthority,
      invocation.toolSpecificData?.kind === "input" ? invocation.toolSpecificData.rawInput : void 0
    );
    if (mcpAppInput) {
      const existingInput = invocation.toolSpecificData?.kind === "input" ? invocation.toolSpecificData : void 0;
      invocation.toolSpecificData = mcpAppInput;
      if (!existingInput || !isSameMcpAppData(existingInput.mcpAppData, mcpAppInput.mcpAppData)) {
        invocation.notifyToolSpecificDataChanged();
      }
    }
  }
  const isFailure = isCompleted && !tc.success || isCancelled;
  const errorMessage = isCompleted ? tc.error?.message : isCancelled ? tc.reasonMessage : void 0;
  const errorString = typeof errorMessage === "string" ? errorMessage : errorMessage?.markdown;
  const fileEdits = isCompleted ? fileEditsToExternalEdits(tc) : [];
  if (isAgentHostAskUserTool(tc.toolName)) {
    invocation.presentation = shouldHideCompletedAgentHostAskUserTool(tc) ? "hiddenAfterComplete" /* HiddenAfterComplete */ : void 0;
  } else if (isAutomaticTitleRename(tc)) {
    invocation.presentation = shouldHideAutomaticTitleRename(tc) ? "hidden" /* Hidden */ : void 0;
  }
  if (fileEdits.length > 0 && !isFailure) {
    invocation.presentation = "hidden" /* Hidden */;
  }
  const hasMcpAppData = invocation.toolSpecificData?.kind === "input" && !!invocation.toolSpecificData.mcpAppData;
  const resultDetails = !isTerminal && invocation.toolSpecificData?.kind !== "subagent" && invocation.toolSpecificData?.kind !== "sessionCreated" && getToolKind(tc) !== "search" && fileEdits.length === 0 ? getToolInputOutputDetails(tc, isFailure, errorString, hasMcpAppData, connectionAuthority) : void 0;
  const result = isFailure || resultDetails ? { content: [], toolResultError: isFailure ? errorString : void 0, toolResultDetails: resultDetails } : void 0;
  const cancelledFromStreaming = isCancelled && invocation.cancelFromStreaming(
    tc.reason === "skipped" /* Skipped */ ? 5 /* Skipped */ : 0 /* Denied */,
    tc.reasonMessage ? stringOrMarkdownToString(tc.reasonMessage, connectionAuthority) : void 0
  );
  if (!cancelledFromStreaming) {
    invocation.didExecuteTool(result);
  }
  return fileEdits;
}

function fileEditsToExternalEdits(tc) {
  if (tc.status !== "completed" /* Completed */) {
    return [];
  }
  const edits = getToolFileEdits(tc);
  if (edits.length === 0) {
    return [];
  }
  return mapFileEdits(edits, tc.toolCallId);
}

function mapFileEdits(items, undoStopId) {
  const result = [];
  for (const edit3 of items) {
    const normalized = normalizeFileEdit(edit3);
    if (!normalized) {
      continue;
    }
    result.push({
      kind: normalized.kind,
      resource: normalized.resource,
      originalResource: normalized.kind === "rename" /* Rename */ ? normalized.beforeUri : void 0,
      beforeContentUri: normalized.beforeContentUri,
      afterContentUri: normalized.afterContentUri,
      undoStopId,
      diff: edit3.diff
    });
  }
  return result;
}
export { isAgentHostAskUserTool, shouldHideCompletedAgentHostAskUserTool, isRenameChatTool, isAutomaticTitleRename, shouldHideAutomaticTitleRename, makeAhpTerminalToolSessionId, parseAhpTerminalToolSessionId, convertProtocolAnswer, convertProtocolAnswers, containsAutomaticReplyAnswer, getPlanReviewAction, convertProtocolPlanReviewResult, createInputRequestCarousel, createInputRequestPlanReview, getUrlInputRequestPresentation, inputRequestResponsePartToProgress, getSubagentTaskDescription, getSubagentAgentName, getSubagentChatResource, getMcpAppData, getToolRawInput, buildMcpAppToolInputData, isSameMcpAppData, isSubagentToolName, systemNotificationToChatPart, isSubagentTool, shouldObserveSubagentChat, getTerminalContentUri, getTerminalContent, formatTurnResponseDetails, usageInfoToAutoModeResolution, formatTurnModelName, usageInfoToChatUsage, getSessionCopilotCredits, getCopilotCredits, kindToCategory, kindToAggregateLabel, contextAttributionToPromptTokenDetails, mapAccountQuotaSnapshot, mapRateLimitSnapshot, usageInfoToQuotas, turnsToHistory, messageToRequestOrigin, messageToVariableData, messageAttachmentsToVariableData, isAgentFeedbackMessageAttachment, aggregateAgentFeedbackAttachments, messageAttachmentToVariableEntry, restoreElementVariableEntry, getAgentHostCompletionKind, textRangeToIRange, activeTurnToProgress, getTerminalInput, getTerminalOutput, stripLegacyTerminalExitMarkers, isToolResultTextContent, getTerminalCommandState, isToolResultTerminalContent, getTerminalCommandResult, getTerminalLanguage, isTerminalToolCall, buildTerminalToolSpecificData, getToolInputOutputDetails, toMcpCallToolResult, toMcpContentBlock, wrapResourceUri, getToolErrorString, buildSessionCreatedToolData, buildGeneratedImageToolData, buildAutomationConfiguredToolData, createSessionTitleFromArgs, completedToolCallConfirmedReason, completedToolCallToSerialized, completedToolCallToEditParts, fileEditToExternalEdit, rewriteMarkdownLinks2, rewriteLinkTokenRaw, isSkillFileUri, rawMarkdownToString, parseAbsoluteFileLinkTarget, parseFileLocation, formatLocationFragment, normalizeFileUriSelection, rewriteAgentHostLinkTarget, stringOrMarkdownToString, addCommentPreview, isPositiveInteger, isOneBasedRange, addCommentReference, toolCallStateToInvocation, toolCallConfirmationMessages, toolCallAuthenticationServer, toolCallStateToStreamingInvocation, getStreamingToolInputForDisplay, updateStreamingToolInvocation, toolCallStateToPreparedInvocation, updateRunningToolSpecificData, finalizeToolInvocation, fileEditsToExternalEdits, mapFileEdits, BOOLEAN_TRUE_OPTION_ID, BOOLEAN_FALSE_OPTION_ID, agentHostAskUserToolNames, imageGenerationToolName, SUBAGENT_TOOL_NAMES, EXTERNAL_LINK_SCHEMES, ADD_COMMENT_PREVIEW_LENGTH };
