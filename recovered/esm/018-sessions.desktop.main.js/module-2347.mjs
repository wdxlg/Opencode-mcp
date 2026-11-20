// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatListRenderer.ts
import { $, DisposableResizeObserver, EventType, WindowIntervalTimer, addDisposableListener, addStandardDisposableListener, append, clearNode, findParentWithClass, getActiveElement, getWindow, hide, isAncestorOfActiveElement, isHTMLElement, reset, scheduleAtNextAnimationFrame, show } from "./module-0075.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { URI } from "./module-0032.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { formatChatRequestTimestamp, formatChatResponseDetails, formatChatResponseElapsedTime } from "./module-2186.mjs";
import { clamp, formatTokenCount } from "./module-0040.mjs";
import { isChatTurnStatusPillsEnabled } from "./module-2240.mjs";
import { IChatService, IChatToolInvocation, isChatFollowup } from "./module-0973.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { AgentSessionProviders } from "./module-0983.mjs";
import { parseRemoteAgentHostSessionTypeAuthority } from "./module-0959.mjs";
import { SessionType, isAgentHostTarget, localChatSessionType } from "./module-0961.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { ChatContentMarkdownRenderer } from "./module-2117.mjs";
import { ChatMarkdownDecorationsRenderer } from "./module-2250.mjs";
import { DiffEditorPool, EditorPool } from "./module-2276.mjs";
import { ChatTreeContentPart, TreePool } from "./module-2343.mjs";
import { ChatUsedReferencesListContentPart, CollapsibleListPool } from "./module-2127.mjs";
import { InlineTextModelCollection } from "./module-2277.mjs";
import { ChatCodeBlockContentProvider } from "./module-2253.mjs";
import { Iterable } from "./module-0011.mjs";
import { getStickyScrollTargetItem, isPendingDividerVM, isRequestVM, isResponseVM } from "./module-0979.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId, MenuItemAction } from "./module-0092.mjs";
import { RestoreCheckpointActionId, StartOverActionId } from "./module-2050.mjs";
import { ChatRestoreCheckpointActionViewItem } from "./module-2224.mjs";
import { ForkConversationActionId } from "./module-2187.mjs";
import { ChatForkActionViewItem } from "./module-2223.mjs";
import { CodiconActionViewItem } from "./module-1901.mjs";
import { MarkHelpfulActionId } from "./module-2188.mjs";
import { MenuEntryActionViewItem, createActionViewItem } from "./module-0516.mjs";
import { ChatModelFeedbackSurveyWidget } from "./module-2194.mjs";
import { focusChatModelFeedbackSurveyAction } from "./module-2193.mjs";
import { ChatAgentHover, getChatAgentHoverOptions } from "./module-2226.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { AgentHostSnapshotController } from "./module-2222.mjs";
import { coalesce, distinct } from "./module-0007.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { checkModeOption } from "./module-1188.mjs";
import { autorun } from "./module-0052.mjs";
import { chatSubcommandLeader } from "./module-0988.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { Codicon } from "./module-0085.mjs";
import { FileAccess, Schemas } from "./module-0033.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getCompactCodicon } from "./module-2035.mjs";
import { isDark } from "./module-0247.mjs";
import { annotateSpecialMarkdownContent, extractSubAgentInvocationIdFromText, hasCodeblockUriTag, hasEditCodeblockUriTag } from "./module-2185.mjs";
import { canceledName } from "./module-0004.mjs";
import { isAskQuestionsToolInvocation, isMcpToolInvocation } from "./module-2260.mjs";
import { ChatThinkingContentPart, getEffectiveThinkingDisplayMode } from "./module-2263.mjs";
import { ChatProgressContentPart, ChatWorkingProgressContentPart } from "./module-2264.mjs";
import { getExplicitFileOrImageAttachmentSummary, isExplicitFileOrImageVariableEntry, isPasteVariableEntry } from "./module-0980.mjs";
import { ChatRequestOriginPart } from "./module-2293.mjs";
import { ChatAgentCommandContentPart } from "./module-2227.mjs";
import { parseAgentMergePrompt } from "./module-2181.mjs";
import { ChatAgentMergeContentPart } from "./module-2182.mjs";
import { ChatSystemNotificationContentPart } from "./module-2295.mjs";
import { ChatMarkdownContentPart, codeblockHasClosingBackticks } from "./module-2273.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { getNWords } from "./module-0978.mjs";
import { isCreateChatTool, isCreateSessionTool, isSendMessageTool } from "./module-2024.mjs";
import { ChatSubagentContentPart } from "./module-2342.mjs";
import { CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID } from "./module-0965.mjs";
import { ChatToolInvocationPart3 } from "./module-2341.mjs";
import { ChatCommandButtonContentPart } from "./module-2243.mjs";
import { ChatErrorContentPart } from "./module-2283.mjs";
import { ChatMcpAuthenticationContentPart } from "./module-2286.mjs";
import { ChatMcpServersStartingContentPart } from "./module-2287.mjs";
import { ChatWorkspaceEditContentPart } from "./module-2344.mjs";
import { ChatAutoModeResolutionContentPart } from "./module-2231.mjs";
import { alert } from "./module-0076.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ChatQuotaExceededPart } from "./module-2291.mjs";
import { ChatAnonymousRateLimitedPart } from "./module-2228.mjs";
import { ChatErrorConfirmationContentPart } from "./module-2284.mjs";
import { ChatMultiDiffContentPart } from "./module-2289.mjs";
import { ChatCodeCitationContentPart } from "./module-2242.mjs";
import { ChatExtensionsContentPart } from "./module-2259.mjs";
import { ChatHookContentPart } from "./module-2346.mjs";
import { ChatPullRequestContentPart } from "./module-2290.mjs";
import { ChatTaskContentPart } from "./module-2294.mjs";
import { ChatConfirmationContentPart } from "./module-2275.mjs";
import { ChatElicitationContentPart } from "./module-2282.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { ChatQuestionCarouselPart } from "./module-2120.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { ChatPlanReviewData } from "./module-1191.mjs";
import { ChatPlanReviewPart } from "./module-2118.mjs";
import { ChatCheckpointFileChangesSummaryContentPart } from "./module-2234.mjs";
import { ChatTurnPillsContentPart } from "./module-2241.mjs";
import { ChatAttachmentsContentPart } from "./module-2029.mjs";
import { ChatTextEditContentPart } from "./module-2296.mjs";
import { ChatExternalEditContentPart } from "./module-2345.mjs";
import { ChatMcpServersInteractionContentPart } from "./module-2285.mjs";
import { ChatDisabledClaudeHooksContentPart } from "./module-2288.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { IChatBranchService } from "./module-1992.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { CachedListVirtualDelegate } from "./module-0454.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatListRenderer.ts
var $54 = $;

var COPILOT_USERNAME = "GitHub Copilot";

var WORKING_CAUGHT_UP_DEBOUNCE_MS = 750;

var DEFAULT_CHAT_ITEM_HORIZONTAL_PADDING = 40;

function escapeMarkdownLinkLabel2(label3) {
  return label3.replace(/\\/g, "\\\\").replace(/\]/g, "\\]");
}

function buildPlanReviewProgressContent(review, message) {
  const renderedAsUsed = !!review.isUsed;
  const data = renderedAsUsed && !review.data?.rejected ? review.data : void 0;
  const overall = data?.feedbackOverall?.trim();
  const inlineMd = data?.feedbackInlineMarkdown?.trim();
  const feedbackMarkdown = [overall, inlineMd].filter((value2) => !!value2).join("\n\n") || data?.feedback?.trim();
  const content = new MarkdownString(void 0, { supportThemeIcons: true });
  content.appendText(message);
  if (feedbackMarkdown) {
    content.appendMarkdown("\n\n");
    content.appendMarkdown(feedbackMarkdown);
  }
  if (renderedAsUsed) {
    const reviewContent = review.content.trim();
    const planUri = review.planUri ? URI.revive(review.planUri) : void 0;
    if (reviewContent || planUri) {
      content.appendMarkdown("\n\n");
      if (reviewContent) {
        content.appendMarkdown(reviewContent);
      }
      if (planUri) {
        if (reviewContent) {
          content.appendMarkdown("\n\n");
        }
        const planFileName = basename2(planUri);
        const label3 = planFileName ? localize(12367, null, planFileName) : localize(12366, null);
        const planWidgetUri = planUri.with({ query: planUri.query ? `${planUri.query}&vscodeLinkType=file` : "vscodeLinkType=file" });
        content.appendMarkdown(`[${escapeMarkdownLinkLabel2(label3)}](${planWidgetUri.toString(true)})`);
      }
    }
  }
  return content;
}

function shouldScheduleInitialHeightChange(normalizedHeight, allocatedHeight) {
  return typeof allocatedHeight !== "number" || normalizedHeight > allocatedHeight;
}

function getFinalResponseStartIndex(content) {
  let index2 = content.length - 1;
  while (index2 >= 0) {
    const part = content[index2];
    if (part.kind === "markdownContent" && part.content.value.length) {
      break;
    }
    index2--;
  }
  if (index2 < 0) {
    return void 0;
  }
  while (index2 > 0 && content[index2 - 1].kind === "markdownContent") {
    index2--;
  }
  return index2;
}

function isResponseOutcomeTool(part) {
  return (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && (part.toolSpecificData?.kind === "sessionCreated" || part.toolSpecificData?.kind === "generatedImage");
}

function getFinalResponseStartIndexAfterMovingResponseOutcomeTools(content) {
  const finalResponseStartIndex = getFinalResponseStartIndex(content);
  if (finalResponseStartIndex === void 0) {
    return void 0;
  }
  let movedToolCount = 0;
  for (let index2 = 0; index2 < finalResponseStartIndex; index2++) {
    if (isResponseOutcomeTool(content[index2])) {
      movedToolCount++;
    }
  }
  return finalResponseStartIndex - movedToolCount;
}

function isFinalResponseRendered(content, finalResponseStartIndex) {
  return finalResponseStartIndex !== void 0 && content[finalResponseStartIndex]?.kind === "markdownContent";
}

function moveResponseOutcomeToolsAfterFinalResponse(content) {
  const outcomeTools = content.filter(isResponseOutcomeTool);
  if (outcomeTools.length === 0) {
    return [...content];
  }
  const finalResponseStartIndex = getFinalResponseStartIndexAfterMovingResponseOutcomeTools(content);
  if (finalResponseStartIndex === void 0) {
    return [...content];
  }
  const reordered = content.filter((part) => !isResponseOutcomeTool(part));
  let insertionIndex = finalResponseStartIndex;
  while (reordered[insertionIndex]?.kind === "markdownContent") {
    insertionIndex++;
  }
  reordered.splice(insertionIndex, 0, ...outcomeTools);
  return reordered;
}

function formatCompletedResponseDisclosureLabel(stepCount, elapsedMs) {
  const elapsed = formatChatResponseElapsedTime(elapsedMs);
  if (stepCount === 1) {
    return elapsed ? localize(12376, null, elapsed) : localize(12375, null);
  }
  return elapsed ? localize(12378, null, stepCount, elapsed) : localize(12377, null, stepCount);
}

function getVisibleCompletedResponseItemCount(nodes) {
  let visibleItemCount = 0;
  for (const node of nodes) {
    if (isHTMLElement(node) && (node.hidden || node.style.display === "none")) {
      continue;
    }
    visibleItemCount++;
  }
  return visibleItemCount;
}

function formatResponseTokenStats(modelTotals, completedAt) {
  if (!modelTotals?.length) {
    return void 0;
  }
  const title = localize(12384, null);
  const markdown = new MarkdownString();
  markdown.appendMarkdown(`**${escapeMarkdownSyntaxTokens(title)}**

`);
  const formatInputTokens = (count2) => localize(12381, null, count2);
  const formatOutputTokens = (count2) => localize(12383, null, count2);
  const formatCachedInputTokens = (count2) => localize(12379, null, count2);
  const tokenDetailsAriaParts = [];
  const completion = formatChatRequestTimestamp(completedAt);
  let completed;
  if (completion) {
    completed = localize(12380, null, completion.fullText);
    markdown.appendMarkdown(`${escapeMarkdownSyntaxTokens(completed)}

`);
  }
  for (const total of modelTotals) {
    const model = localize(12382, null, total.model);
    const input = formatInputTokens(formatTokenCount(total.inputTokens));
    markdown.appendMarkdown(`${escapeMarkdownSyntaxTokens(model)}

`);
    markdown.appendMarkdown(`- ${escapeMarkdownSyntaxTokens(input)}
`);
    const exactInput = formatInputTokens(total.inputTokens);
    tokenDetailsAriaParts.push(model, exactInput);
    if (total.cachedTokens > 0) {
      const cachedInput = formatCachedInputTokens(formatTokenCount(total.cachedTokens));
      const exactCachedInput = formatCachedInputTokens(total.cachedTokens);
      markdown.appendMarkdown(`- ${escapeMarkdownSyntaxTokens(cachedInput)}
`);
      tokenDetailsAriaParts.push(exactCachedInput);
    }
    const output = formatOutputTokens(formatTokenCount(total.outputTokens));
    const exactOutput = formatOutputTokens(total.outputTokens);
    markdown.appendMarkdown(`- ${escapeMarkdownSyntaxTokens(output)}
`);
    tokenDetailsAriaParts.push(exactOutput);
    markdown.appendMarkdown("\n");
  }
  const footerAriaLabel = [title, ...tokenDetailsAriaParts].join(". ");
  const markdownNotSupportedFallback = [title, completed, ...tokenDetailsAriaParts].filter((value2) => value2 !== void 0).join(". ");
  return { markdown, markdownNotSupportedFallback, footerAriaLabel };
}

function shouldCollapseCompletedResponsePart(part) {
  return part.kind !== "toolInvocation" && part.kind !== "toolInvocationSerialized" || !toolInvocationHasMcpAppData(part);
}

function getCompletedResponseCollapseEndIndex(content, finalResponseStartIndex) {
  for (let index2 = 0; index2 < finalResponseStartIndex; index2++) {
    if (!shouldCollapseCompletedResponsePart(content[index2])) {
      return index2;
    }
  }
  return finalResponseStartIndex;
}

function reconcileChatItemHeight(normalizedHeight, currentRenderedHeight, isBeingRendered, allocatedHeight) {
  if (normalizedHeight === currentRenderedHeight) {
    return { nextRenderedHeight: currentRenderedHeight, kind: "none", height: normalizedHeight };
  }
  if (isBeingRendered) {
    return { nextRenderedHeight: currentRenderedHeight, kind: "deferReMeasure", height: normalizedHeight };
  }
  if (typeof currentRenderedHeight === "number") {
    return { nextRenderedHeight: normalizedHeight, kind: "fire", height: normalizedHeight };
  }
  if (!shouldScheduleInitialHeightChange(normalizedHeight, allocatedHeight)) {
    return { nextRenderedHeight: normalizedHeight, kind: "none", height: normalizedHeight };
  }
  return { nextRenderedHeight: normalizedHeight, kind: "scheduleInitial", height: normalizedHeight };
}

function renderChatResponseDetails(container2, details, completedAt, elapsedMs, verbose, tokenStatsAriaLabel) {
  clearNode(container2);
  container2.classList.remove("chat-response-flip-active", "chat-response-flip-down", "chat-response-flip-reset");
  const completion = verbose ? formatChatRequestTimestamp(completedAt) : void 0;
  const elapsed = completion ? formatChatResponseElapsedTime(elapsedMs) : void 0;
  const alternate = completion?.isRelative ? formatChatResponseDetails(elapsed, completion.fullText) : elapsed;
  const responseDetails = formatChatResponseDetails(details, completion?.text);
  let completedAtElement;
  if (completion) {
    const timing = append(container2, $54("span.chat-response-timing"));
    completedAtElement = append(timing, $54("time.chat-response-completed-at", { datetime: completion.dateTime }, completion.text));
    if (alternate) {
      append(timing, $54("span.chat-response-alternate", void 0, alternate));
    }
    timing.classList.toggle("has-alternate", !!alternate);
  }
  if (completion && details) {
    append(container2, $54("span.chat-response-details-separator", { "aria-hidden": "true" }, "\u2022"));
  }
  if (details) {
    append(container2, $54("span.chat-response-model-details", void 0, details));
  }
  const accessibleTiming = completion ? localize(12391, null, completion.fullText) : void 0;
  const accessibleElapsed = elapsed ? localize(12392, null, elapsed) : void 0;
  container2.ariaLabel = [accessibleTiming, accessibleElapsed, details, tokenStatsAriaLabel].filter(Boolean).join(", ");
  container2.classList.toggle("hidden", !responseDetails);
  container2.tabIndex = responseDetails ? 0 : -1;
  return completedAtElement;
}

// OpenCode turn usage (dsh TurnUsagePanel / RunningStatus style): compact pill in the footer details,
// full breakdown in a hover panel; values come from result.metadata.opencodeTurnUsage written by the extension.
function openCodeUsageNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}
function formatOpenCodeCompactTokens(value) {
  const n = openCodeUsageNumber(value);
  if (n >= 1e6) return `${(Math.round(n / 1e4) / 100).toFixed(2)}M`;
  if (n >= 1e5) return `${Math.round(n / 1e3)}k`;
  if (n >= 1e3) return `${(Math.round(n / 100) / 10).toFixed(1)}k`;
  return String(Math.round(n));
}
function formatOpenCodeExactTokens(value) {
  return `${Math.round(openCodeUsageNumber(value)).toLocaleString("en-US")} tok`;
}
function formatOpenCodeDuration(ms) {
  const total = Math.max(0, Math.floor(openCodeUsageNumber(ms) / 1e3));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;
  return `${hours > 0 ? `${hours}\u5C0F\u65F6` : ""}${total >= 60 ? `${minutes}\u5206` : ""}${seconds}\u79D2`;
}
function formatOpenCodeShortDuration(ms) {
  const n = openCodeUsageNumber(ms);
  return n > 0 && n < 1e4 ? `${(Math.round(n / 100) / 10).toFixed(1)}\u79D2` : formatOpenCodeDuration(n);
}
function openCodeCacheHit(usage) {
  const prompt = openCodeUsageNumber(usage?.input) + openCodeUsageNumber(usage?.cacheRead) + openCodeUsageNumber(usage?.cacheWrite);
  return prompt > 0 ? `${Math.round(openCodeUsageNumber(usage.cacheRead) / prompt * 1e3) / 10}%` : void 0;
}
function openCodeUsageRows(dl, rows) {
  for (const [label, value, extra] of rows) {
    if (value === void 0 || value === "") continue;
    append(dl, $54("dt", void 0, label));
    const dd = append(dl, $54("dd", void 0, value));
    if (extra) append(dd, $54("span.opencode-usage-panel-sub", void 0, extra));
  }
}
function buildOpenCodeUsagePanel(usage) {
  const panel = $54(".opencode-usage-panel");
  const reported = openCodeUsageNumber(usage.reportedSteps) > 0;
  const title = append(panel, $54(".opencode-usage-panel-title"));
  const titleLabel = append(title, $54("span.opencode-usage-panel-title-label"));
  append(titleLabel, $54("span.codicon.codicon-database"));
  append(titleLabel, $54("span", void 0, "\u672C\u8F6E\u7528\u91CF"));
  append(title, $54("span.opencode-usage-panel-title-value", void 0, reported ? formatOpenCodeExactTokens(usage.total) : "\u672A\u8FD4\u56DE"));
  append(panel, $54(".opencode-usage-panel-rule"));
  const details = append(panel, $54("dl.opencode-usage-panel-details"));
  const models = Array.isArray(usage.models) ? usage.models.filter((model) => typeof model === "string" && model).join(", ") : "";
  const route = models ? usage.provider ? `${usage.provider} / ${models}` : models : usage.provider;
  const missing = openCodeUsageNumber(usage.steps) - openCodeUsageNumber(usage.reportedSteps);
  openCodeUsageRows(details, reported ? [
    ["\u63D0\u4F9B\u65B9 / \u6A21\u578B", route],
    ["\u7F13\u5B58\u547D\u4E2D", openCodeCacheHit(usage)],
    ["\u672A\u7F13\u5B58\u8F93\u5165", formatOpenCodeExactTokens(usage.input)],
    ["\u7F13\u5B58\u8BFB\u53D6", openCodeUsageNumber(usage.cacheRead) > 0 ? formatOpenCodeExactTokens(usage.cacheRead) : void 0],
    ["\u7F13\u5B58\u5199\u5165", openCodeUsageNumber(usage.cacheWrite) > 0 ? formatOpenCodeExactTokens(usage.cacheWrite) : void 0],
    ["\u8F93\u51FA", formatOpenCodeExactTokens(usage.output), openCodeUsageNumber(usage.reasoning) > 0 ? `\uFF08\u5176\u4E2D\u63A8\u7406 ${formatOpenCodeExactTokens(usage.reasoning)}\uFF09` : void 0],
    ["\u672A\u8FD4\u56DE\u7528\u91CF", missing > 0 ? `${missing} \u6B65` : void 0]
  ] : [
    ["\u63D0\u4F9B\u65B9 / \u6A21\u578B", route],
    ["\u8BF4\u660E", "\u63D0\u4F9B\u65B9\u672A\u8FD4\u56DE token \u7528\u91CF"]
  ]);
  append(panel, $54(".opencode-usage-panel-section", void 0, "\u6027\u80FD"));
  openCodeUsageRows(append(panel, $54("dl.opencode-usage-panel-details")), [
    ["\u8F93\u51FA\u901F\u5EA6", openCodeUsageNumber(usage.tps) > 0 ? `${usage.tps >= 10 ? Math.round(usage.tps) : usage.tps} tok/s` : void 0],
    ["\u9996 token", usage.ttftMs !== void 0 && usage.ttftMs !== null ? `${formatOpenCodeShortDuration(Math.max(1, usage.ttftMs))}${openCodeUsageNumber(usage.ttftCount) > 1 ? "\uFF08\u5E73\u5747\uFF09" : ""}` : void 0],
    ["\u6A21\u578B\u7528\u65F6", openCodeUsageNumber(usage.llmMs) > 0 ? formatOpenCodeShortDuration(usage.llmMs) : void 0],
    ["\u5DE5\u5177\u8C03\u7528\u7528\u65F6", openCodeUsageNumber(usage.toolMs) > 0 ? formatOpenCodeShortDuration(usage.toolMs) : void 0],
    ["\u672C\u8F6E\u7528\u65F6", openCodeUsageNumber(usage.durationMs) > 0 ? formatOpenCodeDuration(Math.max(1e3, usage.durationMs)) : void 0],
    ["\u6B65\u6570", openCodeUsageNumber(usage.steps) > 0 ? String(usage.steps) : void 0]
  ]);
  const session = usage.session && typeof usage.session === "object" ? usage.session : void 0;
  if (session && openCodeUsageNumber(session.turns) > 0) {
    append(panel, $54(".opencode-usage-panel-section", void 0, "\u4F1A\u8BDD\u7EDF\u8BA1"));
    openCodeUsageRows(append(panel, $54("dl.opencode-usage-panel-details")), [
      ["\u8F6E\u6B21", `${session.turns} \u8F6E \xB7 ${openCodeUsageNumber(session.steps)} \u6B65`],
      ["Token \u7528\u91CF", openCodeUsageNumber(session.reportedSteps) > 0 ? formatOpenCodeExactTokens(session.total) : void 0],
      ["\u7F13\u5B58\u547D\u4E2D", openCodeUsageNumber(session.reportedSteps) > 0 ? openCodeCacheHit(session) : void 0],
      ["\u8F93\u51FA", openCodeUsageNumber(session.reportedSteps) > 0 ? formatOpenCodeExactTokens(session.output) : void 0]
    ]);
  }
  return panel;
}
function renderOpenCodeTurnUsage(container3, usage, hoverRef, hoverService) {
  if (!usage || typeof usage !== "object") {
    hoverRef.clear();
    return;
  }
  const reported = openCodeUsageNumber(usage.reportedSteps) > 0;
  if (container3.childElementCount > 0) {
    append(container3, $54("span.chat-response-details-separator", { "aria-hidden": "true" }, "\u2022"));
  }
  const pill = append(container3, $54("span.opencode-usage-pill", { tabindex: "0", role: "button" }));
  append(pill, $54("span.codicon.codicon-database"));
  append(pill, $54("span.opencode-usage-pill-label", void 0, reported ? `\u7528\u91CF ${formatOpenCodeCompactTokens(usage.total)} tok` : "\u7528\u91CF\u672A\u8FD4\u56DE"));
  const meta = [];
  if (openCodeUsageNumber(usage.tps) > 0) meta.push(`${usage.tps >= 10 ? Math.round(usage.tps) : usage.tps} tok/s`);
  if (openCodeUsageNumber(usage.durationMs) > 0) meta.push(formatOpenCodeDuration(Math.max(1e3, usage.durationMs)));
  if (meta.length) append(container3, $54("span.opencode-usage-meta", void 0, meta.join(" \xB7 ")));
  pill.ariaLabel = `\u672C\u8F6E\u7528\u91CF ${reported ? formatOpenCodeExactTokens(usage.total) : "\u672A\u8FD4\u56DE"}`;
  hoverRef.value = hoverService.setupManagedHover(getDefaultHoverDelegate("element"), pill, { element: () => buildOpenCodeUsagePanel(usage) });
  container3.classList.remove("hidden");
}

function renderChatRequestTimestamp(container2, timestamp) {
  const formatted = formatChatRequestTimestamp(timestamp);
  if (!formatted) {
    return void 0;
  }
  if (!formatted.isRelative) {
    const element2 = append(container2, $54("time.chat-request-timestamp", {
      datetime: formatted.dateTime,
      "aria-label": localize(12390, null, formatted.fullText),
      tabindex: 0
    }, formatted.text));
    return { element: element2, hoverText: formatted.fullText };
  }
  const element = append(container2, $54("span.chat-request-timestamp", {
    "aria-label": localize(12390, null, formatted.fullText),
    tabindex: 0
  }));
  const timing = append(element, $54("span.chat-request-timing.has-alternate"));
  append(timing, $54("time.chat-request-relative", { datetime: formatted.dateTime }, formatted.text));
  append(timing, $54("time.chat-request-full-date", { datetime: formatted.dateTime }, formatted.fullText));
  return { element };
}

function shouldRenderInitialProgressiveContentImmediately(isComplete, hasMarkdownParts, hasRenderData) {
  return !isComplete && hasMarkdownParts && !hasRenderData;
}

function shouldStartNewCollapsedThinkingGroup(displayMode, existingGroup, incomingGroup) {
  return displayMode === "collapsed" /* Collapsed */ && existingGroup !== incomingGroup;
}

function shouldCreateGroupedThinkingPart(collapsedToolsMode, separatedFromReasoning) {
  return collapsedToolsMode === "always" /* Always */ || separatedFromReasoning;
}

function shouldShowFileChangesSummaryForSettings(isComplete, isLocalSession, showFileChanges) {
  return isComplete && isLocalSession && showFileChanges;
}

function shouldShowPillsSummaryForSettings(isComplete, isAgentHostSession2, turnStatusPills) {
  return isComplete && isAgentHostSession2 && isChatTurnStatusPillsEnabled(turnStatusPills);
}

function shouldPinToolInvocationToThinking(state, hasConfirmationMessages, hasMcpAppData) {
  return !hasMcpAppData && state !== IChatToolInvocation.StateKind.WaitingForConfirmation && state !== IChatToolInvocation.StateKind.WaitingForPostApproval && state !== IChatToolInvocation.StateKind.WaitingForAuthentication && !hasConfirmationMessages;
}

function toolInvocationHasMcpAppData(toolInvocation) {
  return toolInvocation.toolSpecificData?.kind === "input" && !!toolInvocation.toolSpecificData.mcpAppData;
}

function isGeneratedImageResultOwner(toolInvocation, content) {
  for (let index2 = content.length - 1; index2 >= 0; index2--) {
    const part = content[index2];
    if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolSpecificData?.kind === "generatedImage") {
      return part.toolCallId === toolInvocation.toolCallId;
    }
  }
  return false;
}

var forceVerboseLayoutTracing = false;

var mostRecentResponseClassName = "chat-most-recent-response";

function shouldHideChatUserIdentity(username, sessionResource, isResponse, isSessionsWindow, isSystemInitiatedRequest) {
  const sessionType = getChatSessionType(sessionResource);
  return username === COPILOT_USERNAME || isResponse && isAgentHostCopilotSessionType(sessionType) || isSessionsWindow || isSystemInitiatedRequest;
}

function isAgentHostCopilotSessionType(sessionType) {
  return sessionType === AgentSessionProviders.AgentHostCopilot || parseRemoteAgentHostSessionTypeAuthority(sessionType, SessionType.CopilotCLI) !== void 0;
}

function upvoteAnimationSettingToEnum(value2) {
  switch (value2) {
    case "confetti":
      return 1 /* Confetti */;
    case "floatingThumbs":
      return 2 /* FloatingIcons */;
    case "pulseWave":
      return 3 /* PulseWave */;
    case "radiantLines":
      return 4 /* RadiantLines */;
    default:
      return void 0;
  }
}

var ChatListItemRenderer = class extends Disposable {
  constructor(editorOptions, rendererOptions, delegate, overflowWidgetsDomNode, viewModel, instantiationService, configService, logService, contextKeyService, themeService, commandService, hoverService, chatWidgetService, chatEntitlementService, chatService, chatBranchService, accessibilitySignalService, accessibilityService, environmentService, telemetryService) {
    super();
    this.rendererOptions = rendererOptions;
    this.delegate = delegate;
    this.viewModel = viewModel;
    this.instantiationService = instantiationService;
    this.configService = configService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.themeService = themeService;
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.chatWidgetService = chatWidgetService;
    this.chatEntitlementService = chatEntitlementService;
    this.chatService = chatService;
    this.chatBranchService = chatBranchService;
    this.accessibilitySignalService = accessibilitySignalService;
    this.accessibilityService = accessibilityService;
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.codeBlocksByResponseId = /* @__PURE__ */ new Map();
    this.codeBlocksByEditorUri = new ResourceMap();
    this.fileTreesByResponseId = /* @__PURE__ */ new Map();
    this.focusedFileTreesByResponseId = /* @__PURE__ */ new Map();
    this.templateDataByRequestId = /* @__PURE__ */ new Map();
    this.responseTemplateDataByRequestId = /* @__PURE__ */ new Map();
    this.stickyScrollTemplateDataByRequestId = /* @__PURE__ */ new Map();
    this.hoveredRequestBubbleByRequestId = /* @__PURE__ */ new Map();
    this.stickyScrollSourceWidthRatioByRequestId = /* @__PURE__ */ new Map();
    this.appliedStickyScrollWidthRatioByBubble = /* @__PURE__ */ new WeakMap();
    this.stickyScrollSourceRangesByRequestId = /* @__PURE__ */ new Map();
    this.stickyScrollRequestContentById = /* @__PURE__ */ new Map();
    this.pendingStickyScrollSourceRangeRefresh = this._register(new MutableDisposable());
    this.pendingStickyScrollStateRefresh = this._register(new MutableDisposable());
    this.templateDataByRow = /* @__PURE__ */ new WeakMap();
    /** Track pending question carousels by session resource for auto-skip on chat submission */
    this.pendingQuestionCarousels = new ResourceMap();
    this._notifiedQuestionCarousels = /* @__PURE__ */ new Set();
    this.workingProgressConfirmationEndListeners = /* @__PURE__ */ new WeakSet();
    this._onDidClickFollowup = this._register(new Emitter());
    this.onDidClickFollowup = this._onDidClickFollowup.event;
    this._onDidClickRerunWithAgentOrCommandDetection = this._register(new Emitter());
    this.onDidClickRerunWithAgentOrCommandDetection = this._onDidClickRerunWithAgentOrCommandDetection.event;
    this._onDidClickRequest = this._register(new Emitter());
    this.onDidClickRequest = this._onDidClickRequest.event;
    this._onDidRerender = this._register(new Emitter());
    this.onDidRerender = this._onDidRerender.event;
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
    this._onDidFocusOutside = this._register(new Emitter());
    this.onDidFocusOutside = this._onDidFocusOutside.event;
    this._onDidChangeItemHeight = this._register(new Emitter());
    this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
    this._onDidUpdateViewModel = this._register(new Emitter());
    this._currentLayoutWidth = observableValue(this, 0);
    this._isVisible = true;
    this._onDidChangeVisibility = this._register(new Emitter());
    /** Whether we have already logged the incremental-rendering telemetry event for this renderer instance. */
    this._incrementalRenderingTelemetryLogged = false;
    /**
     * Prevents re-announcement of already rendered chat progress
     * by screen readers
     */
    this._announcedToolProgressKeys = /* @__PURE__ */ new Set();
    this.chatContentMarkdownRenderer = this.instantiationService.createInstance(ChatContentMarkdownRenderer);
    this.markdownDecorationsRenderer = this._register(this.instantiationService.createInstance(ChatMarkdownDecorationsRenderer));
    this._editorPool = this._register(this.instantiationService.createInstance(EditorPool, editorOptions, delegate, overflowWidgetsDomNode, true));
    this._toolEditorPool = this._register(this.instantiationService.createInstance(EditorPool, editorOptions, delegate, overflowWidgetsDomNode, true));
    this._diffEditorPool = this._register(this.instantiationService.createInstance(DiffEditorPool, editorOptions, delegate, overflowWidgetsDomNode, true));
    this._treePool = this._register(this.instantiationService.createInstance(TreePool, this._onDidChangeVisibility.event));
    this._contentReferencesListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, void 0, void 0));
    this._inlineTextModels = this._register(this.instantiationService.createInstance(InlineTextModelCollection));
    this._register(this.instantiationService.createInstance(ChatCodeBlockContentProvider));
    this._register(this.chatService.onDidSubmitRequest((e4) => {
      const carousels = this.pendingQuestionCarousels.get(e4.chatSessionResource);
      if (carousels) {
        for (const carousel of carousels) {
          carousel.skip();
        }
        carousels.clear();
      }
    }));
    this._register(this.configService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.autoReply" /* AutoReply */) && this.configService.getValue("chat.autoReply" /* AutoReply */)) {
        for (const [, carousels] of this.pendingQuestionCarousels) {
          for (const carousel of carousels) {
            carousel.skip();
          }
          carousels.clear();
        }
      }
    }));
  }
  static {
    this.ID = "item";
  }
  set pendingDragController(controller) {
    this._pendingDragController = controller;
  }
  updateOptions(options3) {
    this.rendererOptions = { ...this.rendererOptions, ...options3 };
  }
  get templateId() {
    return ChatListItemRenderer.ID;
  }
  editorsInUse() {
    return Iterable.concat(this._editorPool.inUse(), this._toolEditorPool.inUse());
  }
  traceLayout(method, message) {
    if (forceVerboseLayoutTracing) {
      this.logService.info(`ChatListItemRenderer#${method}: ${message}`);
    } else {
      this.logService.trace(`ChatListItemRenderer#${method}: ${message}`);
    }
  }
  fireItemHeightChange(template2, measuredHeight) {
    if (!template2.currentElement || !template2.rowContainer.isConnected) {
      return;
    }
    if (findParentWithClass(template2.rowContainer, "monaco-tree-sticky-row")) {
      return;
    }
    if (isRequestVM(template2.currentElement)) {
      this.scheduleStickyScrollSourceRangeRefresh();
    }
    const height = measuredHeight ?? template2.rowContainer.getBoundingClientRect().height;
    if (height === 0 || !height) {
      return;
    }
    const normalizedHeight = Math.ceil(height);
    const element = template2.currentElement;
    const update = reconcileChatItemHeight(
      normalizedHeight,
      element.currentRenderedHeight,
      element === this._elementBeingRendered,
      template2.allocatedHeight
    );
    element.currentRenderedHeight = update.nextRenderedHeight;
    if (update.kind === "fire") {
      this._onDidChangeItemHeight.fire({ element, height: update.height });
    } else if (update.kind === "scheduleInitial") {
      const scheduledHeight = update.height;
      scheduleAtNextAnimationFrame(getWindow(template2.rowContainer), () => {
        if (template2.currentElement !== element || element.currentRenderedHeight !== scheduledHeight) {
          return;
        }
        this._onDidChangeItemHeight.fire({ element, height: scheduledHeight });
      });
    } else if (update.kind === "deferReMeasure") {
      scheduleAtNextAnimationFrame(getWindow(template2.rowContainer), () => {
        if (template2.currentElement === element && element !== this._elementBeingRendered) {
          this.fireItemHeightChange(template2);
        }
      });
    }
  }
  /**
   * Compute a rate to render at in words/s.
   */
  getProgressiveRenderRate(element) {
    let Rate;
    ((Rate2) => {
      Rate2[Rate2["Min"] = 40] = "Min";
      Rate2[Rate2["Max"] = 2e3] = "Max";
    })(Rate || (Rate = {}));
    const minAfterComplete = 80;
    const rate = element.contentUpdateTimings?.impliedWordLoadRate;
    if (element.isComplete) {
      if (typeof rate === "number") {
        return clamp(rate, minAfterComplete, 2e3 /* Max */);
      } else {
        return minAfterComplete;
      }
    }
    if (typeof rate === "number") {
      return clamp(rate, 40 /* Min */, 2e3 /* Max */);
    }
    return 8;
  }
  getCodeBlockInfosForResponse(response) {
    const codeBlocks = this.codeBlocksByResponseId.get(response.id);
    return codeBlocks ?? [];
  }
  getStickyScrollSourceRange(element, defaultRange) {
    if (!isRequestVM(element) || element.isSystemInitiated || !!element.confirmation || !this.requestHasStickyScrollContent(element)) {
      return void 0;
    }
    const sourceRange = this.stickyScrollSourceRangesByRequestId.get(element.id);
    if (sourceRange) {
      return sourceRange;
    }
    return this.stickyScrollSourceRangesByRequestId.has(element.id) ? void 0 : { ...defaultRange, estimated: true };
  }
  refreshStickyScrollSourceRanges(invalidateRejected = false) {
    if (!this.delegate.isStickyScrollEnabled()) {
      this.stickyScrollSourceRangesByRequestId.clear();
      this.stickyScrollSourceWidthRatioByRequestId.clear();
      return;
    }
    if (invalidateRejected) {
      for (const [requestId, sourceRange] of this.stickyScrollSourceRangesByRequestId) {
        if (sourceRange === null) {
          this.stickyScrollSourceRangesByRequestId.delete(requestId);
        }
      }
    }
    for (const templateData of this.templateDataByRequestId.values()) {
      if (isRequestVM(templateData.currentElement)) {
        this.updateStickyScrollSourceRange(templateData.currentElement, templateData);
      }
    }
    for (const templateData of this.stickyScrollTemplateDataByRequestId.values()) {
      if (isRequestVM(templateData.currentElement)) {
        this.updateStickyScrollSourceRange(templateData.currentElement, templateData);
      }
    }
  }
  updateViewModel(viewModel) {
    this.viewModel = viewModel;
    this._announcedToolProgressKeys.clear();
    this._notifiedQuestionCarousels.clear();
    this.codeBlocksByEditorUri.clear();
    this.codeBlocksByResponseId.clear();
    this.fileTreesByResponseId.clear();
    this.focusedFileTreesByResponseId.clear();
    this.responseTemplateDataByRequestId.clear();
    this.templateDataByRequestId.clear();
    this.stickyScrollTemplateDataByRequestId.clear();
    this.hoveredRequestBubbleByRequestId.clear();
    this.stickyScrollSourceWidthRatioByRequestId.clear();
    this.stickyScrollSourceRangesByRequestId.clear();
    this.stickyScrollRequestContentById.clear();
    this._onDidUpdateViewModel.fire();
    this._editorPool.clear();
    this._toolEditorPool.clear();
    this._diffEditorPool.clear();
    this._treePool.clear();
    this._contentReferencesListPool.clear();
  }
  getCodeBlockInfoForEditor(uri4) {
    return this.codeBlocksByEditorUri.get(uri4);
  }
  getFileTreeInfosForResponse(response) {
    const fileTrees = this.fileTreesByResponseId.get(response.id);
    return fileTrees ?? [];
  }
  getLastFocusedFileTreeForResponse(response) {
    const fileTrees = this.fileTreesByResponseId.get(response.id);
    const lastFocusedFileTreeIndex = this.focusedFileTreesByResponseId.get(response.id);
    if (fileTrees?.length && lastFocusedFileTreeIndex !== void 0 && lastFocusedFileTreeIndex < fileTrees.length) {
      return fileTrees[lastFocusedFileTreeIndex];
    }
    return void 0;
  }
  getTemplateDataForRequestId(requestId) {
    if (!requestId) {
      return void 0;
    }
    const templateData = this.templateDataByRequestId.get(requestId);
    if (templateData && templateData.currentElement?.id === requestId) {
      return templateData;
    }
    if (templateData) {
      this.templateDataByRequestId.delete(requestId);
    }
    return void 0;
  }
  setVisible(visible) {
    this._isVisible = visible;
    this._onDidChangeVisibility.fire(visible);
  }
  layout(width2) {
    const newWidth = width2 - (this.rendererOptions.contentHorizontalPadding ?? DEFAULT_CHAT_ITEM_HORIZONTAL_PADDING);
    if (newWidth !== this._currentLayoutWidth.get()) {
      this._currentLayoutWidth.set(newWidth, void 0);
      for (const editor of this._editorPool.inUse()) {
        editor.layout(newWidth);
      }
      for (const toolEditor of this._toolEditorPool.inUse()) {
        toolEditor.layout(newWidth);
      }
      for (const diffEditor of this._diffEditorPool.inUse()) {
        diffEditor.layout(newWidth);
      }
      this.stickyScrollSourceWidthRatioByRequestId.clear();
      this.stickyScrollSourceRangesByRequestId.clear();
      this.scheduleStickyScrollSourceRangeRefresh();
    }
  }
  /**
   * Returns the currently rendered chat item containing the node.
   */
  getElementFromNode(node) {
    let current = node;
    while (current && this.delegate.container.contains(current)) {
      const element = this.templateDataByRow.get(current)?.currentElement;
      if (element) {
        return element;
      }
      current = current.parentElement;
    }
    return void 0;
  }
  renderTemplate(container2) {
    const templateDisposables = new DisposableStore();
    const disabledOverlay = append(container2, $54(".chat-row-disabled-overlay"));
    const rowContainer = append(container2, $54(".interactive-item-container"));
    if (this.rendererOptions.renderStyle === "compact") {
      rowContainer.classList.add("interactive-item-compact");
    }
    let headerParent = rowContainer;
    let valueParent = rowContainer;
    let detailContainerParent;
    if (this.rendererOptions.renderStyle === "minimal") {
      rowContainer.classList.add("interactive-item-compact");
      rowContainer.classList.add("minimal");
      const lhsContainer = append(rowContainer, $54(".column.left"));
      const rhsContainer = append(rowContainer, $54(".column.right"));
      headerParent = lhsContainer;
      detailContainerParent = rhsContainer;
      valueParent = rhsContainer;
    }
    const header2 = append(headerParent, $54(".header"));
    const contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(rowContainer));
    const scopedInstantiationService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const requestHover = append(rowContainer, $54(".request-hover"));
    let titleToolbar;
    if (this.rendererOptions.noHeader) {
      header2.classList.add("hidden");
    } else {
      titleToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, requestHover, MenuId.ChatMessageTitle, {
        menuOptions: {
          shouldForwardArgs: true
        },
        toolbarOptions: {
          shouldInlineSubmenu: (submenu) => submenu.actions.length <= 1
        }
      }));
    }
    this.hoverHidden(requestHover);
    const checkpointContainer = append(rowContainer, $54(".checkpoint-container"));
    append(checkpointContainer, $54(".checkpoint-line-left"));
    const checkpointToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, checkpointContainer, MenuId.ChatMessageCheckpoint, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof MenuItemAction) {
          if (action.item.id === RestoreCheckpointActionId || action.item.id === StartOverActionId) {
            const isStartOver = action.item.id === StartOverActionId;
            const cancelLabel = isStartOver ? localize(12387, null) : localize(12385, null);
            const confirmTooltip = isStartOver ? localize(12388, null) : localize(12386, null);
            return this.instantiationService.createInstance(ChatRestoreCheckpointActionViewItem, action, { hoverDelegate: options3.hoverDelegate }, (context2) => this.discardEditsActionNeedsConfirmation(context2), cancelLabel, confirmTooltip);
          }
          if (action.item.id === ForkConversationActionId) {
            return this.instantiationService.createInstance(ChatForkActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
          }
          return this.instantiationService.createInstance(CodiconActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
        }
        return void 0;
      },
      renderDropdownAsChildElement: true,
      menuOptions: {
        shouldForwardArgs: true
      },
      toolbarOptions: {
        shouldInlineSubmenu: (submenu) => submenu.actions.length <= 1
      }
    }));
    append(checkpointContainer, $54(".checkpoint-line-right"));
    const user = append(header2, $54(".user"));
    const avatarContainer = append(user, $54(".avatar-container"));
    const username = append(user, $54("h3.username"));
    username.tabIndex = 0;
    const detailContainer = append(detailContainerParent ?? user, $54("span.detail-container"));
    const detail2 = append(detailContainer, $54("span.detail"));
    append(detailContainer, $54("span.chat-animated-ellipsis"));
    const value2 = append(valueParent, $54(".value"));
    const requestTimestampContainer = append(valueParent, $54(".chat-request-timestamp-container"));
    const elementDisposables = templateDisposables.add(new DisposableStore());
    const completedResponseDisclosureDisposables = templateDisposables.add(new DisposableStore());
    const responseTokenStatsHover = templateDisposables.add(new MutableDisposable());
    const openCodeUsageHover = templateDisposables.add(new MutableDisposable());
    const openCodeRunClockTimer = templateDisposables.add(new MutableDisposable());
    const openCodeRunClock = append(rowContainer, $54(".opencode-run-clock"));
    const footerToolbarContainer = append(rowContainer, $54(".chat-footer-toolbar"));
    if (this.rendererOptions.noFooter) {
      footerToolbarContainer.classList.add("hidden");
    }
    const footerToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, footerToolbarContainer, MenuId.ChatMessageFooter, {
      menuOptions: { shouldForwardArgs: true, renderShortTitle: true },
      toolbarOptions: { shouldInlineSubmenu: (submenu) => submenu.actions.length <= 1 },
      actionViewItemProvider: (action, options3) => {
        if (action instanceof MenuItemAction && action.item.id === MarkHelpfulActionId) {
          const animation = upvoteAnimationSettingToEnum(this.configService.getValue("chat.upvoteAnimation"));
          return scopedInstantiationService.createInstance(MenuEntryActionViewItem, action, { ...options3, onClickAnimation: animation });
        }
        return createActionViewItem(scopedInstantiationService, action, options3);
      }
    }));
    const footerDetailsContainer = append(footerToolbar.getElement(), $54(".chat-footer-details"));
    footerDetailsContainer.tabIndex = 0;
    const feedbackSurveyContainer = append(rowContainer, $54(".chat-feedback-survey-widget.hidden"));
    const feedbackSurveyWidget = templateDisposables.add(scopedInstantiationService.createInstance(ChatModelFeedbackSurveyWidget, feedbackSurveyContainer, () => focusChatModelFeedbackSurveyAction(footerToolbar)));
    const checkpointRestoreContainer = append(rowContainer, $54(".checkpoint-restore-container"));
    append(checkpointRestoreContainer, $54(".checkpoint-line-left"));
    const label3 = append(checkpointRestoreContainer, $54("span.checkpoint-label-text"));
    label3.textContent = localize(12393, null);
    const dot = append(checkpointRestoreContainer, $54("span.checkpoint-dot-separator"));
    dot.textContent = "\xB7";
    dot.setAttribute("aria-hidden", "true");
    const checkpointRestoreToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, checkpointRestoreContainer, MenuId.ChatMessageRestoreCheckpoint, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(CodiconActionViewItem, action, { hoverDelegate: options3.hoverDelegate });
        }
        return void 0;
      },
      renderDropdownAsChildElement: true,
      menuOptions: {
        shouldForwardArgs: true
      },
      toolbarOptions: {
        shouldInlineSubmenu: (submenu) => submenu.actions.length <= 1
      }
    }));
    append(checkpointRestoreContainer, $54(".checkpoint-line-right"));
    const agentHover = templateDisposables.add(this.instantiationService.createInstance(ChatAgentHover));
    const hoverContent2 = () => {
      if (isResponseVM(template2.currentElement) && template2.currentElement.agent && !template2.currentElement.agent.isDefault) {
        agentHover.setAgent(template2.currentElement.agent.id);
        return agentHover.domNode;
      }
      return void 0;
    };
    const hoverOptions = getChatAgentHoverOptions(() => isResponseVM(template2.currentElement) ? template2.currentElement.agent : void 0, this.commandService);
    templateDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), user, hoverContent2, hoverOptions));
    templateDisposables.add(addDisposableListener(user, EventType.KEY_DOWN, (e4) => {
      const ev = new StandardKeyboardEvent(e4);
      if (ev.equals(10 /* Space */) || ev.equals(3 /* Enter */)) {
        const content = hoverContent2();
        if (content) {
          this.hoverService.showInstantHover({ content, target: user, trapFocus: true, actions: hoverOptions.actions }, true);
        }
      } else if (ev.equals(9 /* Escape */)) {
        this.hoverService.hideHover();
      }
    }));
    const connectionObserver = document.createElement("connection-observer");
    append(container2, connectionObserver);
    const template2 = { header: header2, avatarContainer, requestHover, username, detail: detail2, value: value2, requestTimestampContainer, rowContainer, elementDisposables, templateDisposables, contextKeyService, instantiationService: scopedInstantiationService, agentHover, titleToolbar, footerToolbar, footerToolbarContainer, footerDetailsContainer, disabledOverlay, checkpointToolbar, checkpointRestoreToolbar, checkpointContainer, checkpointRestoreContainer, completedResponseDisclosureDisposables, responseTokenStatsHover, feedbackSurveyWidget, openCodeUsageHover, openCodeRunClockTimer, openCodeRunClock };
    this.templateDataByRow.set(rowContainer, template2);
    templateDisposables.add(this._onDidUpdateViewModel.event(() => {
      if (!template2.currentElement || !this.viewModel?.sessionResource || !isEqual2(template2.currentElement.sessionResource, this.viewModel.sessionResource)) {
        this.clearRenderedParts(template2);
      }
    }));
    templateDisposables.add(addDisposableListener(disabledOverlay, EventType.CLICK, (e4) => {
      if (!this.viewModel?.editing) {
        return;
      }
      const current = template2.currentElement;
      if (!current || current.id === this.viewModel.editing.id) {
        return;
      }
      if (disabledOverlay.classList.contains("disabled")) {
        e4.preventDefault();
        e4.stopPropagation();
        this._onDidFocusOutside.fire();
      }
    }));
    const resizeObserver = templateDisposables.add(new DisposableResizeObserver("ChatListItemRenderer.itemHeight", (entries2) => {
      const entry = entries2[0];
      if (entry) {
        this.fireItemHeightChange(template2, entry.borderBoxSize.at(0)?.blockSize);
      }
    }));
    const resizeObservation = templateDisposables.add(new MutableDisposable());
    connectionObserver.onDidConnect = () => {
      resizeObservation.value = resizeObserver.observe(rowContainer);
    };
    connectionObserver.onDidDisconnect = () => {
      template2.renderedPartsMounted = false;
      resizeObservation.clear();
    };
    if (rowContainer.isConnected) {
      connectionObserver.onDidConnect();
    }
    return template2;
  }
  /**
   * Determines whether an action at the given chat item would discard file
   * edits that the user should confirm in-place.
   */
  discardEditsActionNeedsConfirmation(context2) {
    if (!isRequestVM(context2) && !isResponseVM(context2)) {
      return false;
    }
    const requestId = isRequestVM(context2) ? context2.id : context2.requestId;
    const model = this.chatService.getSession(context2.sessionResource);
    const session = model?.editingSession;
    if (!model || !(session instanceof AgentHostSnapshotController)) {
      return false;
    }
    const requests = model.getRequests();
    const index2 = requests.findIndex((request2) => request2.id === requestId);
    if (index2 === -1) {
      return false;
    }
    return requests.slice(index2).some((request2) => session.hasEditsInRequest(request2.id));
  }
  renderElement(node, index2, templateData, details) {
    templateData.allocatedHeight = details?.height;
    this._elementBeingRendered = node.element;
    try {
      this.renderChatTreeItem(node.element, index2, templateData);
    } finally {
      this._elementBeingRendered = void 0;
    }
  }
  /**
   * Live elapsed clock under a response that is still running (dsh RunningStatus):
   * ticks once a second from the response start and hides itself on completion.
   */
  updateOpenCodeRunClock(element, templateData, onComplete) {
    const clock = templateData.openCodeRunClock;
    if (!clock) {
      return;
    }
    templateData.openCodeRunClockTimer.clear();
    clearNode(clock);
    clock.classList.remove("active");
    if (!isResponseVM(element) || element.isComplete) {
      return;
    }
    const startedAt = typeof element.model.timestamp === "number" ? element.model.timestamp : Date.now();
    append(clock, $54("span.opencode-run-clock-dot", { "aria-hidden": "true" }));
    const label3 = append(clock, $54("span.opencode-run-clock-label"));
    clock.classList.add("active");
    const targetWindow = getWindow(clock);
    let handle;
    const stop = () => {
      if (handle !== void 0) {
        targetWindow.clearInterval(handle);
        handle = void 0;
      }
    };
    const tick = () => {
      if (element.isComplete) {
        stop();
        clock.classList.remove("active");
        clearNode(clock);
        onComplete();
        return;
      }
      label3.textContent = `\u8FD0\u884C\u4E2D\uFF0C\u7528\u65F6 ${formatOpenCodeDuration(Math.max(1e3, Date.now() - startedAt))} \xB7\xB7\xB7`;
    };
    tick();
    handle = targetWindow.setInterval(tick, 1e3);
    templateData.openCodeRunClockTimer.value = toDisposable(stop);
    templateData.elementDisposables.add(toDisposable(() => templateData.openCodeRunClockTimer.clear()));
  }
  /**
   * Renders the branch variant badge (模型 · 分支 i/N · 主线) into the response
   * footer details line. Called after `renderChatResponseDetails` so the badge
   * is re-created whenever the details line is refreshed.
   */
  renderOpenCodeBranchVariantBadge(container2, rowInfo, isResponse) {
    if (!rowInfo || !isResponse || rowInfo.variantCount <= 1) {
      return;
    }
    const parts = [];
    if (rowInfo.modelId) {
      parts.push(rowInfo.modelId);
    }
    const openCodeRoleLabel = { critic: "\u5BA1\u67E5\u8005", alternative: "\u66FF\u4EE3\u65B9\u6848", minimal: "\u6700\u5C0F\u6539\u52A8", verifier: "\u9A8C\u8BC1\u4F18\u5148" }[rowInfo.role ?? ""];
    if (openCodeRoleLabel) {
      parts.push(openCodeRoleLabel);
    }
    parts.push(rowInfo.variantKind === "merge" ? localize(12406, null) : localize(12407, null, rowInfo.variantIndex + 1, rowInfo.variantCount));
    if (rowInfo.isCanonical) {
      parts.push(localize(12405, null));
    }
    if (container2.childElementCount > 0) {
      append(container2, $54("span.chat-response-details-separator", { "aria-hidden": "true" }, "\u2022"));
    }
    append(container2, $54("span.opencode-branch-badge", void 0, parts.join(" \xB7 ")));
    container2.classList.remove("hidden");
  }
  /**
   * Dispose the rendered parts in the template, which aren't done in disposeElement
   * so they can be reused when a new render is started.
   */
  clearRenderedParts(templateData) {
    this.removeCompletedResponseDisclosure(templateData);
    if (templateData.renderedParts) {
      dispose(coalesce(templateData.renderedParts));
      templateData.renderedParts = void 0;
      templateData.renderedContent = void 0;
      clearNode(templateData.value);
    } else if (isPendingDividerVM(templateData.currentElement)) {
      clearNode(templateData.value);
    }
    templateData.stickyScrollSource = void 0;
    templateData.movedOutToolParts?.dispose();
    templateData.movedOutToolParts = void 0;
    if (templateData.titleToolbar) {
      templateData.titleToolbar.context = void 0;
    }
    templateData.footerToolbar.context = void 0;
    templateData.checkpointToolbar.context = void 0;
    templateData.checkpointRestoreToolbar.context = void 0;
    templateData.currentElement = void 0;
    templateData.completedResponseDisclosureOpen = void 0;
    templateData.completedResponseCollapseEndIndex = void 0;
    templateData.wasResponseComplete = void 0;
  }
  renderChatTreeItem(element, index2, templateData) {
    if (templateData.currentElement && templateData.currentElement.id !== element.id) {
      this.traceLayout("renderChatTreeItem", `Rendering a different element into the template, index=${index2}`);
      const mappedTemplateData = this.templateDataByRequestId.get(templateData.currentElement.id);
      if (mappedTemplateData && mappedTemplateData.currentElement?.id !== templateData.currentElement.id) {
        this.templateDataByRequestId.delete(templateData.currentElement.id);
      }
      this.clearRenderedParts(templateData);
    }
    templateData.currentElement = element;
    if (!findParentWithClass(templateData.rowContainer, "monaco-tree-sticky-row")) {
      this.templateDataByRequestId.set(element.id, templateData);
    }
    templateData.rowContainer.classList.remove("pending-item", "pending-divider", "pending-request", "chat-pending-dragging", "terminal-command-request");
    templateData.dragHandle?.remove();
    templateData.dragHandle = void 0;
    delete templateData.rowContainer.dataset.pendingRequestId;
    delete templateData.rowContainer.dataset.pendingKind;
    if (isPendingDividerVM(element)) {
      this.renderPendingDivider(element, templateData);
      return;
    }
    const kind = isRequestVM(element) ? "request" : isResponseVM(element) ? "response" : isPendingDividerVM(element) ? "pendingDivider" : "welcome";
    this.traceLayout("renderElement", `${kind}, index=${index2}`);
    ChatContextKeys.isResponse.bindTo(templateData.contextKeyService).set(isResponseVM(element));
    ChatContextKeys.itemId.bindTo(templateData.contextKeyService).set(element.id);
    ChatContextKeys.isRequest.bindTo(templateData.contextKeyService).set(isRequestVM(element));
    ChatContextKeys.isFirstRequest.bindTo(templateData.contextKeyService).set(isRequestVM(element) && this.viewModel?.model.getRequests()[0]?.id === element.id);
    ChatContextKeys.isPendingRequest.bindTo(templateData.contextKeyService).set(isRequestVM(element) && !!element.pendingKind);
    ChatContextKeys.responseDetectedAgentCommand.bindTo(templateData.contextKeyService).set(isResponseVM(element) && element.agentOrSlashCommandDetected);
    const openCodeBranchRowInfo = this.viewModel ? this.chatBranchService.getRowInfo(this.viewModel.sessionResource, element.id) : void 0;
    ChatContextKeys.openCodeBranchVariant.bindTo(templateData.contextKeyService).set(!!openCodeBranchRowInfo);
    ChatContextKeys.openCodeBranchCanMerge.bindTo(templateData.contextKeyService).set(openCodeBranchRowInfo?.canMerge ?? false);
    ChatContextKeys.openCodeBranchCanAdopt.bindTo(templateData.contextKeyService).set(openCodeBranchRowInfo?.canAdopt ?? false);
    ChatContextKeys.openCodeBranchCanDelete.bindTo(templateData.contextKeyService).set(openCodeBranchRowInfo?.canDelete ?? false);
    ChatContextKeys.openCodeBranchHasPrev.bindTo(templateData.contextKeyService).set(openCodeBranchRowInfo?.hasPrev ?? false);
    ChatContextKeys.openCodeBranchHasNext.bindTo(templateData.contextKeyService).set(openCodeBranchRowInfo?.hasNext ?? false);
    const openCodeLastResponse = this.viewModel && isResponseVM(element) ? this.viewModel.getItems().filter(isResponseVM).at(-1) : void 0;
    ChatContextKeys.openCodeBranchCanRunAll.bindTo(templateData.contextKeyService).set(!!openCodeLastResponse && openCodeLastResponse.id === element.id && !openCodeBranchRowInfo?.group.mergedRequestId);
    ChatContextKeys.openCodeBranchCanCompare.bindTo(templateData.contextKeyService).set(isResponseVM(element) && (openCodeBranchRowInfo?.group.variants.filter((variant) => !variant.canceled).length ?? 0) >= 2);
    if (isResponseVM(element)) {
      ChatContextKeys.responseSupportsIssueReporting.bindTo(templateData.contextKeyService).set(!!element.agent?.metadata.supportIssueReporting);
      ChatContextKeys.responseVote.bindTo(templateData.contextKeyService).set(element.vote === 1 /* Up */ ? "up" : element.vote === 0 /* Down */ ? "down" : "");
      templateData.feedbackSurveyWidget.render(element);
    } else {
      ChatContextKeys.responseVote.bindTo(templateData.contextKeyService).set("");
      templateData.feedbackSurveyWidget.render(void 0);
    }
    if (templateData.titleToolbar) {
      templateData.titleToolbar.context = element;
    }
    templateData.footerToolbar.context = element;
    const responseTimingListeners = templateData.elementDisposables.add(new MutableDisposable());
    const updateResponseDetails = () => {
      const details = isResponseVM(element) ? element.result?.details : void 0;
      const tokenStats = isResponseVM(element) ? formatResponseTokenStats(element.model.usage?.modelTotals, element.model.completionTimestamp) : void 0;
      const completedAtElement = renderChatResponseDetails(
        templateData.footerDetailsContainer,
        details,
        isResponseVM(element) ? element.model.completionTimestamp : void 0,
        isResponseVM(element) ? element.model.elapsedMs : void 0,
        isResponseVM(element) && this.configService.getValue("chat.verbose" /* Verbose */),
        tokenStats?.footerAriaLabel
      );
      const tokenStatsHover = templateData.responseTokenStatsHover;
      if (!tokenStats) {
        tokenStatsHover.clear();
      } else if (tokenStatsHover.value) {
        tokenStatsHover.value.update(tokenStats);
      } else {
        tokenStatsHover.value = this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), templateData.footerDetailsContainer, tokenStats);
      }
      this.renderOpenCodeBranchVariantBadge(templateData.footerDetailsContainer, openCodeBranchRowInfo, isResponseVM(element));
      renderOpenCodeTurnUsage(templateData.footerDetailsContainer, isResponseVM(element) && element.isComplete ? element.result?.metadata?.opencodeTurnUsage : void 0, templateData.openCodeUsageHover, this.hoverService);
      if (!completedAtElement) {
        responseTimingListeners.clear();
        return;
      }
      const listeners = new DisposableStore();
      responseTimingListeners.value = listeners;
      let responseTimingBounds;
      listeners.add(addDisposableListener(completedAtElement, EventType.MOUSE_ENTER, (e4) => {
        const bounds = completedAtElement.getBoundingClientRect();
        responseTimingBounds = bounds;
        templateData.footerDetailsContainer.classList.add("chat-response-flip-reset");
        templateData.footerDetailsContainer.classList.remove("chat-response-flip-active");
        templateData.footerDetailsContainer.classList.toggle("chat-response-flip-down", e4.clientY < bounds.top + bounds.height / 2);
        void templateData.footerDetailsContainer.offsetWidth;
        templateData.footerDetailsContainer.classList.remove("chat-response-flip-reset");
        void templateData.footerDetailsContainer.offsetWidth;
        templateData.footerDetailsContainer.classList.add("chat-response-flip-active");
      }));
      listeners.add(addDisposableListener(templateData.footerDetailsContainer, EventType.MOUSE_MOVE, (e4) => {
        if (responseTimingBounds && (e4.clientX < responseTimingBounds.left || e4.clientX > responseTimingBounds.right || e4.clientY < responseTimingBounds.top || e4.clientY > responseTimingBounds.bottom)) {
          responseTimingBounds = void 0;
          templateData.footerDetailsContainer.classList.remove("chat-response-flip-active");
        }
      }));
      listeners.add(addDisposableListener(templateData.footerDetailsContainer, EventType.MOUSE_LEAVE, () => {
        responseTimingBounds = void 0;
        templateData.footerDetailsContainer.classList.remove("chat-response-flip-active");
      }));
      listeners.add(addDisposableListener(templateData.footerDetailsContainer, EventType.FOCUS, () => {
        templateData.footerDetailsContainer.classList.remove("chat-response-flip-active", "chat-response-flip-down");
      }));
    };
    updateResponseDetails();
    this.updateOpenCodeRunClock(element, templateData, updateResponseDetails);
    ChatContextKeys.responseHasError.bindTo(templateData.contextKeyService).set(isResponseVM(element) && !!element.errorDetails);
    const isFiltered = !!(isResponseVM(element) && element.errorDetails?.responseIsFiltered);
    ChatContextKeys.responseIsFiltered.bindTo(templateData.contextKeyService).set(isFiltered);
    const location2 = this.chatWidgetService.getWidgetBySessionResource(element.sessionResource)?.location;
    templateData.rowContainer.classList.toggle("editing-session", location2 === "panel" /* Chat */);
    templateData.rowContainer.classList.toggle("interactive-request", isRequestVM(element));
    templateData.rowContainer.classList.toggle("interactive-response", isResponseVM(element));
    const progressMessageAtBottomOfResponse = checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse);
    templateData.rowContainer.classList.toggle("show-detail-progress", isResponseVM(element) && !element.isComplete && !element.progressMessages.length && !progressMessageAtBottomOfResponse);
    templateData.rowContainer.classList.toggle("chat-progress-reservable", isResponseVM(element) && !element.isComplete && !!progressMessageAtBottomOfResponse);
    const updateContainerCheckmarks = () => templateData.rowContainer.classList.toggle("show-checkmarks", !!this.configService.getValue("accessibility.chat.showCheckmarks" /* ShowChatCheckmarks */));
    updateContainerCheckmarks();
    const updateVerboseDetails = () => templateData.rowContainer.classList.toggle("show-verbose-details", !!this.configService.getValue("chat.verbose" /* Verbose */));
    updateVerboseDetails();
    templateData.elementDisposables.add(this.configService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("accessibility.chat.showCheckmarks" /* ShowChatCheckmarks */)) {
        updateContainerCheckmarks();
      }
      if (e4.affectsConfiguration("chat.verbose" /* Verbose */)) {
        updateVerboseDetails();
        updateResponseDetails();
      }
      if (e4.affectsConfiguration("chat.agent.collapseCompletedResponses" /* CollapseCompletedResponses */) && isResponseVM(element)) {
        this.updateCompletedResponseDisclosure(element, templateData.renderedContent ?? [], templateData, false);
      }
    }));
    if (!this.rendererOptions.noHeader) {
      this.renderAvatar(element, templateData);
    }
    const isSystemInitiatedRequest = isRequestVM(element) && !!element.isSystemInitiated;
    templateData.username.textContent = element.username;
    const hideChatUserIdentity = shouldHideChatUserIdentity(element.username, element.sessionResource, isResponseVM(element), this.environmentService.isSessionsWindow, isSystemInitiatedRequest);
    templateData.username.classList.toggle("hidden", hideChatUserIdentity);
    templateData.avatarContainer.classList.toggle("hidden", hideChatUserIdentity);
    this.hoverHidden(templateData.requestHover);
    clearNode(templateData.detail);
    clearNode(templateData.requestTimestampContainer);
    if (isResponseVM(element)) {
      this.renderDetail(element, templateData);
    }
    templateData.checkpointToolbar.context = element;
    const supportsForkOrRestoration = this.rendererOptions.supportsFork || (this.rendererOptions.restorable ?? true);
    const checkpointEnabled = this.configService.getValue("chat.checkpoints.enabled" /* CheckpointsEnabled */) && supportsForkOrRestoration;
    const isPendingRequest = isRequestVM(element) && !!element.pendingKind;
    const isStickyScrollRow = !!findParentWithClass(templateData.rowContainer, "monaco-tree-sticky-row");
    templateData.checkpointContainer.classList.toggle("hidden", isStickyScrollRow || isResponseVM(element) || isPendingRequest || isSystemInitiatedRequest || !checkpointEnabled);
    templateData.footerToolbar.refresh();
    templateData.checkpointToolbar.refresh();
    templateData.checkpointRestoreToolbar.refresh();
    if (isResponseVM(element)) {
      this.responseTemplateDataByRequestId.set(element.requestId, templateData);
      templateData.elementDisposables.add(toDisposable(() => this.responseTemplateDataByRequestId.delete(element.requestId)));
    }
    if (!isPendingRequest) {
      const setGroupHover = (hovered) => {
        const requestId = isRequestVM(element) ? element.id : isResponseVM(element) ? element.requestId : void 0;
        if (!requestId) {
          return;
        }
        const reqData = this.templateDataByRequestId.get(requestId);
        const resData = this.responseTemplateDataByRequestId.get(requestId);
        reqData?.rowContainer.classList.toggle("group-hovered", hovered);
        reqData?.checkpointContainer.classList.toggle("group-hovered", hovered);
        resData?.rowContainer.classList.toggle("group-hovered", hovered);
      };
      const hoverTargets = isResponseVM(element) ? [templateData.value, templateData.footerToolbarContainer] : [templateData.rowContainer];
      const isHoverTarget = (target) => isHTMLElement(target) && hoverTargets.some((hoverTarget) => hoverTarget.contains(target));
      for (const hoverTarget of hoverTargets) {
        templateData.elementDisposables.add(addDisposableListener(hoverTarget, EventType.MOUSE_ENTER, () => setGroupHover(true)));
        templateData.elementDisposables.add(addDisposableListener(hoverTarget, EventType.MOUSE_LEAVE, (e4) => {
          if (!isHoverTarget(e4.relatedTarget)) {
            setGroupHover(false);
          }
        }));
      }
      templateData.elementDisposables.add(toDisposable(() => setGroupHover(false)));
    }
    const shouldShowRestore = !isStickyScrollRow && this.viewModel?.model.checkpoint && !this.viewModel?.editing && index2 === this.delegate.getListLength() - 1 && !isPendingRequest;
    templateData.checkpointRestoreContainer.classList.toggle("hidden", !(shouldShowRestore && checkpointEnabled));
    const editing = !isStickyScrollRow && element.id === this.viewModel?.editing?.id;
    const isInput = this.configService.getValue("chat.editRequests") === "input";
    templateData.elementDisposables.add(autorun((r2) => {
      const shouldBeBlocked = element.shouldBeBlocked.read(r2);
      templateData.disabledOverlay.classList.toggle("disabled", shouldBeBlocked && !editing && this.viewModel?.editing !== void 0);
    }));
    templateData.rowContainer.classList.toggle("editing", editing && !isInput);
    templateData.rowContainer.classList.toggle("editing-input", editing && isInput);
    templateData.requestHover.classList.toggle("editing", editing && isInput);
    templateData.requestHover.classList.toggle("hidden", !!this.viewModel?.editing && !editing || isResponseVM(element) || !this.rendererOptions.editable || isSystemInitiatedRequest);
    templateData.requestHover.classList.toggle("expanded", this.configService.getValue("chat.editRequests") === "hover");
    templateData.requestHover.classList.toggle("checkpoints-enabled", checkpointEnabled);
    templateData.elementDisposables.add(addStandardDisposableListener(templateData.rowContainer, EventType.CLICK, (e4) => {
      const current = templateData.currentElement;
      if (current && this.viewModel?.editing && current.id !== this.viewModel.editing.id) {
        e4.stopPropagation();
        e4.preventDefault();
        this._onDidFocusOutside.fire();
      }
    }));
    const rowRoot = templateData.rowContainer.parentElement?.parentElement?.parentElement;
    rowRoot?.classList.toggle("request", isRequestVM(element));
    rowRoot?.classList.toggle("response", isResponseVM(element));
    templateData.rowContainer.classList.toggle(mostRecentResponseClassName, index2 === this.delegate.getListLength() - 1);
    templateData.rowContainer.classList.toggle("confirmation-message", isRequestVM(element) && !!element.confirmation);
    const isStickyScrollTargetItem = getStickyScrollTargetItem(this.viewModel?.getItems() ?? []) === element;
    const shouldShowHeader = isResponseVM(element) && !this.rendererOptions.noHeader && !isSystemInitiatedRequest;
    templateData.header?.classList.toggle("header-disabled", !shouldShowHeader);
    if (isRequestVM(element) && element.confirmation) {
      this.renderConfirmationAction(element, templateData);
    }
    const incrementalRendering = this.configService.getValue("chat.experimental.incrementalRendering.enabled" /* IncrementalRendering */);
    if (isResponseVM(element) && isStickyScrollTargetItem && (!element.isComplete || element.renderData)) {
      this.traceLayout("renderElement", `start progressive render, index=${index2}`);
      if (incrementalRendering && !element.renderData) {
        this.logIncrementalRenderingTelemetry();
        this.doIncrementalRender(element, index2, templateData);
      } else {
        const timer = templateData.elementDisposables.add(new WindowIntervalTimer());
        const runProgressiveRender = (initial) => {
          try {
            if (this.doNextProgressiveRender(element, index2, templateData, !!initial)) {
              timer.cancel();
            }
          } catch (err) {
            timer.cancel();
            this.logService.error(err);
          }
        };
        timer.cancelAndSet(runProgressiveRender, 50, getWindow(templateData.rowContainer));
        runProgressiveRender(true);
      }
    } else {
      if (isResponseVM(element)) {
        if (incrementalRendering) {
          const rate = this.getProgressiveRenderRate(element);
          this._updateMorpherRate(templateData, rate, true);
        }
        this.renderChatResponseBasic(element, index2, templateData);
      } else if (isRequestVM(element)) {
        this.renderChatRequest(element, index2, templateData);
        this.updateStickyScrollSourceRange(element, templateData);
      }
    }
    templateData.renderedPartsMounted = true;
  }
  renderPendingDivider(element, templateData) {
    templateData.rowContainer.classList.add("pending-item");
    templateData.rowContainer.classList.add("pending-divider");
    templateData.rowContainer.classList.remove("interactive-request", "interactive-response", "pending-request");
    templateData.avatarContainer.classList.add("hidden");
    templateData.username.classList.add("hidden");
    templateData.requestHover.classList.add("hidden");
    templateData.checkpointContainer.classList.add("hidden");
    templateData.checkpointRestoreContainer.classList.add("hidden");
    templateData.footerToolbar.getElement().classList.add("hidden");
    if (templateData.titleToolbar) {
      templateData.titleToolbar.getElement().classList.add("hidden");
    }
    clearNode(templateData.value);
    clearNode(templateData.detail);
    clearNode(templateData.requestTimestampContainer);
    const dividerContent = $(".pending-divider-content");
    const label3 = append(dividerContent, $("span.pending-divider-label"));
    if (element.dividerKind === "steering" /* Steering */) {
      if (element.isSystemInitiated) {
        label3.textContent = localize(12410, null);
        label3.title = localize(12411, null);
      } else {
        label3.textContent = localize(12408, null);
        label3.title = localize(12409, null);
      }
    } else {
      label3.textContent = localize(12401, null);
      label3.title = localize(12402, null);
    }
    templateData.value.appendChild(dividerContent);
  }
  renderDetail(element, templateData) {
    clearNode(templateData.detail);
    if (element.agentOrSlashCommandDetected) {
      const msg = element.slashCommand ? localize(12413, null, `${chatSubcommandLeader}${element.slashCommand.name}`) : localize(12412, null);
      reset(templateData.detail, renderFormattedText(msg, {
        actionHandler: {
          disposables: templateData.elementDisposables,
          callback: (content) => {
            this._onDidClickRerunWithAgentOrCommandDetection.fire(element);
          }
        }
      }, $54("span.agentOrSlashCommandDetected")));
    } else if (this.rendererOptions.renderStyle !== "minimal" && !element.isComplete && !checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse)) {
      templateData.detail.textContent = localize(12414, null);
    }
  }
  renderConfirmationAction(element, templateData) {
    clearNode(templateData.detail);
    if (element.confirmation) {
      append(templateData.detail, $54("span.codicon.codicon-check", { "aria-hidden": "true" }));
      append(templateData.detail, $54("span.confirmation-text", void 0, localize(12389, null, element.confirmation)));
      templateData.header?.classList.remove("header-disabled");
      templateData.header?.classList.add("partially-disabled");
    }
  }
  renderAvatar(element, templateData) {
    if (isPendingDividerVM(element)) {
      return;
    }
    let icon2;
    if (isResponseVM(element)) {
      icon2 = this.getAgentIcon(element.agent?.metadata);
    } else if (isRequestVM(element)) {
      icon2 = element.avatarIcon ?? Codicon.account;
    } else {
      icon2 = Codicon.account;
    }
    if (icon2 instanceof URI) {
      const avatarIcon = $("img.icon");
      avatarIcon.src = FileAccess.uriToBrowserUri(icon2).toString(true);
      templateData.avatarContainer.replaceChildren($(".avatar", void 0, avatarIcon));
    } else {
      const avatarIcon = $(ThemeIcon.asCSSSelector(templateData.rowContainer.classList.contains("interactive-item-compact") ? getCompactCodicon(icon2) : icon2));
      templateData.avatarContainer.replaceChildren($(".avatar.codicon-avatar", void 0, avatarIcon));
    }
  }
  getAgentIcon(agent) {
    if (agent?.themeIcon) {
      return agent.themeIcon;
    } else if (agent?.iconDark && isDark(this.themeService.getColorTheme().type)) {
      return agent.iconDark;
    } else if (agent?.icon) {
      return agent.icon;
    } else {
      return Codicon.chatSparkle;
    }
  }
  renderChatResponseBasic(element, index2, templateData) {
    templateData.rowContainer.classList.toggle("chat-response-loading", isResponseVM(element) && !element.isComplete);
    this.finalizeCompletedResponseParts(element, templateData);
    const content = [];
    const isFiltered = !!element.errorDetails?.responseIsFiltered;
    if (!isFiltered) {
      content.push({ kind: "references", references: element.contentReferences });
      const responseContent = annotateSpecialMarkdownContent(element.response.value);
      content.push(...element.isComplete ? moveResponseOutcomeToolsAfterFinalResponse(responseContent) : responseContent);
      if (element.codeCitations.length) {
        content.push({ kind: "codeCitations", citations: element.codeCitations });
      }
    }
    if (element.model.response === element.model.entireResponse && !element.isCanceled && element.errorDetails?.message && element.errorDetails.message !== canceledName) {
      content.push({ kind: "errorDetails", errorDetails: element.errorDetails, isLast: getStickyScrollTargetItem(this.viewModel?.getItems() ?? []) === element });
    }
    const fileChangesSummaryPart = this.getChatFileChangesSummaryPart(element);
    if (fileChangesSummaryPart) {
      content.push(fileChangesSummaryPart);
    }
    const turnPillsPart = this.getChatTurnPillsPart(element);
    if (turnPillsPart) {
      content.push(turnPillsPart);
    }
    const workingProgress = this.shouldShowWorkingProgress(element, content, false, templateData);
    if (workingProgress) {
      content.push(workingProgress);
    }
    const diff4 = this.diff(templateData.renderedParts ?? [], content, element);
    this.renderChatContentDiff(diff4, content, element, index2, templateData);
    this.finalizeCompletedResponseParts(element, templateData);
  }
  finalizeCompletedResponseParts(element, templateData) {
    if (!element.isComplete && !element.isCanceled) {
      return;
    }
    const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
    if (lastThinking?.domNode && lastThinking.getIsActive()) {
      lastThinking.finalizeTitleIfDefault();
      lastThinking.markAsInactive();
    }
    this.finalizeAllSubagentParts(templateData, true);
  }
  shouldShowWorkingProgress(element, partsToRender, moreContentAvailable, templateData) {
    if (element.agentOrSlashCommandDetected || this.rendererOptions.renderStyle === "minimal" || element.isComplete || !checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.progressMessageAtBottomOfResponse)) {
      return void 0;
    }
    if (partsToRender.some((part) => part.kind === "planReview" && !part.isUsed)) {
      return void 0;
    }
    if (endsWithActiveSubagentContent(partsToRender)) {
      return void 0;
    }
    if (isResponseVM(element)) {
      const widget = this.chatWidgetService.getWidgetBySessionResource(element.sessionResource);
      if (widget?.inputPart.hasActiveToolConfirmationCarousel) {
        const nonSubagentConfirmationCount = this.getPendingToolConfirmationCount(partsToRender, false);
        if (nonSubagentConfirmationCount > 0) {
          return {
            kind: "working",
            content: new MarkdownString().appendText(this.getConfirmationPendingLabel(nonSubagentConfirmationCount))
          };
        }
        if (this.getPendingToolConfirmationCount(partsToRender, true) > 0) {
          return void 0;
        }
        return {
          kind: "working",
          content: new MarkdownString().appendText(this.getConfirmationPendingLabel(1))
        };
      }
    }
    if (isWaitingForMcpServers(partsToRender)) {
      return void 0;
    }
    const workingParts = getWorkingProgressRelevantParts(partsToRender);
    const lastPart = findLastMeaningfulPart(workingParts);
    const endsWithCompletedQuestion = endsWithCompletedQuestionInteraction(workingParts);
    if (workingParts.some((part) => part.kind === "toolInvocation" && IChatToolInvocation.isStreaming(part))) {
      return void 0;
    }
    if (workingParts.some((part) => part.kind === "toolInvocation" && !IChatToolInvocation.isComplete(part) && isMcpToolInvocation(part))) {
      return void 0;
    }
    const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
    if (lastThinking && !endsWithCompletedQuestion) {
      return void 0;
    }
    if (lastPart && (lastPart.kind === "toolInvocation" || lastPart.kind === "toolInvocationSerialized")) {
      if (lastPart.isAttachedToThinking) {
        return void 0;
      }
      const isEffectivelyHiddenToolInvocation = IChatToolInvocation.isEffectivelyHidden(lastPart);
      const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
      if (!isEffectivelyHiddenToolInvocation && collapsedToolsMode !== "off" /* Off */ && this.shouldPinPart(lastPart, isResponseVM(element) ? element : void 0)) {
        return void 0;
      }
    }
    const hasRenderedThinkingPart = (templateData.renderedParts ?? []).some((part) => part instanceof ChatThinkingContentPart);
    const hasEditPillMarkdown = workingParts.some((part) => part.kind === "markdownContent" && this.hasEditCodeblockUri(part));
    if (hasRenderedThinkingPart && hasEditPillMarkdown) {
      return void 0;
    }
    if (!lastPart || lastPart.kind === "references" || lastPart.kind === "markdownContent" && !moreContentAvailable && this.hasBeenCaughtUpLongEnough(element) || (lastPart.kind === "toolInvocation" || lastPart.kind === "toolInvocationSerialized") && (IChatToolInvocation.isComplete(lastPart) || IChatToolInvocation.isEffectivelyHidden(lastPart)) || (lastPart.kind === "textEditGroup" || lastPart.kind === "notebookEditGroup") && lastPart.done && !workingParts.some((part) => part.kind === "toolInvocation" && !IChatToolInvocation.isComplete(part)) || lastPart.kind === "externalEdit" && !workingParts.some((part) => part.kind === "toolInvocation" && !IChatToolInvocation.isComplete(part)) || lastPart.kind === "progressTask" && lastPart.deferred.isSettled || endsWithCompletedQuestion || lastPart.kind === "mcpServersStarting" || lastPart.kind === "mcpAuthenticationRequired" || lastPart.kind === "mcpServersStartingSlow" || lastPart.kind === "disabledClaudeHooks" || lastPart.kind === "hook") {
      return { kind: "working" };
    }
    return void 0;
  }
  getPendingToolConfirmationCount(parts, includeSubagentConfirmations) {
    return parts.filter((part) => {
      if (part.kind !== "toolInvocation") {
        return false;
      }
      const state = part.state.get();
      return state.type === IChatToolInvocation.StateKind.WaitingForConfirmation && !!state.confirmationMessages?.title && part.presentation !== "hidden" && part.source.type !== "mcp" && isSubagentToolInvocation(part) === includeSubagentConfirmations;
    }).length;
  }
  getConfirmationPendingLabel(count2) {
    return count2 === 1 ? localize(12394, null) : localize(12395, null, count2);
  }
  removeWorkingProgressContentPart(templateData) {
    const renderedParts = templateData.renderedParts;
    if (!renderedParts) {
      return;
    }
    for (let i2 = renderedParts.length - 1; i2 >= 0; i2--) {
      const part = renderedParts[i2];
      if (part instanceof ChatWorkingProgressContentPart) {
        part.dispose();
        part.domNode?.remove();
        renderedParts.splice(i2, 1);
        this.fireItemHeightChange(templateData);
        return;
      }
    }
  }
  updateWorkingProgressForPendingConfirmations(templateData) {
    const originalElement = templateData.currentElement;
    queueMicrotask(() => {
      if (templateData.currentElement !== originalElement) {
        return;
      }
      this.doUpdateWorkingProgressForPendingConfirmations(templateData);
    });
  }
  doUpdateWorkingProgressForPendingConfirmations(templateData) {
    const element = templateData.currentElement;
    if (!isResponseVM(element)) {
      return;
    }
    const pendingConfirmationCount = this.getPendingToolConfirmationCount(element.response.value, false);
    if (pendingConfirmationCount === 0) {
      this.removeWorkingProgressContentPart(templateData);
      return;
    }
    const workingProgressPart = this.getWorkingProgressContentPart(templateData);
    if (workingProgressPart) {
      workingProgressPart.updateWorkingContent(new MarkdownString().appendText(this.getConfirmationPendingLabel(pendingConfirmationCount)));
    }
  }
  getWorkingProgressContentPart(templateData) {
    const renderedParts = templateData.renderedParts;
    if (!renderedParts) {
      return void 0;
    }
    for (let i2 = renderedParts.length - 1; i2 >= 0; i2--) {
      const part = renderedParts[i2];
      if (part instanceof ChatWorkingProgressContentPart) {
        return part;
      }
    }
    return void 0;
  }
  createUpdateWorkingProgressOnConfirmationEnd(toolInvocation, templateData) {
    if (this.workingProgressConfirmationEndListeners.has(toolInvocation)) {
      return void 0;
    }
    this.workingProgressConfirmationEndListeners.add(toolInvocation);
    let wasWaitingForConfirmation = false;
    const disposable = autorun((reader) => {
      const currentState = toolInvocation.state.read(reader);
      const isWaitingForConfirmation = currentState.type === IChatToolInvocation.StateKind.WaitingForConfirmation;
      if (wasWaitingForConfirmation && !isWaitingForConfirmation) {
        this.updateWorkingProgressForPendingConfirmations(templateData);
        this.workingProgressConfirmationEndListeners.delete(toolInvocation);
        disposable.dispose();
      }
      wasWaitingForConfirmation = isWaitingForConfirmation;
    });
    return toDisposable(() => {
      this.workingProgressConfirmationEndListeners.delete(toolInvocation);
      disposable.dispose();
    });
  }
  hasBeenCaughtUpLongEnough(element) {
    const lastRenderTime = element.renderData?.lastRenderTime;
    if (typeof lastRenderTime !== "number" || lastRenderTime === 0) {
      return false;
    }
    return Date.now() - lastRenderTime >= WORKING_CAUGHT_UP_DEBOUNCE_MS;
  }
  /**
   * Returns the last part that visually contributes to the response, skipping
   * empty markdown placeholders.
   */
  /**
   * True while we have caught up to streamed markdown but are still within the
   * {@link WORKING_CAUGHT_UP_DEBOUNCE_MS} window before the working indicator
   * should appear. The progressive render loop keeps polling in this state so
   * the indicator can still surface after a genuine pause, instead of being
   * dropped when the loop would otherwise stop (the debounce itself avoids
   * flicker during normal token streaming).
   */
  isWorkingProgressDebouncePending(element, partsToRender) {
    if (element.isComplete) {
      return false;
    }
    if (partsToRender.some((part) => part.kind === "working")) {
      return false;
    }
    return findLastMeaningfulPart(getWorkingProgressRelevantParts(partsToRender))?.kind === "markdownContent" && !this.hasBeenCaughtUpLongEnough(element);
  }
  getChatFileChangesSummaryPart(element) {
    if (this.shouldShowPillsSummary(element) || !this.shouldShowFileChangesSummary(element)) {
      return void 0;
    }
    const sessionType = getChatSessionType(element.sessionResource);
    if (!isAgentHostTarget(sessionType) && !element.model.entireResponse.value.some((part) => part.kind === "textEditGroup" || part.kind === "notebookEditGroup")) {
      return void 0;
    }
    return { kind: "changesSummary", requestId: element.requestId, sessionResource: element.sessionResource };
  }
  getChatTurnPillsPart(element) {
    if (!this.shouldShowPillsSummary(element)) {
      return void 0;
    }
    return {
      kind: "turnPills",
      requestId: element.requestId,
      sessionResource: element.sessionResource,
      isLastTurn: element.session.model.lastRequest?.id === element.requestId
    };
  }
  renderChatRequest(element, index2, templateData) {
    templateData.stickyScrollSource = void 0;
    templateData.rowContainer.classList.toggle("chat-response-loading", false);
    templateData.rowContainer.classList.toggle("pending-request", !!element.pendingKind);
    templateData.rowContainer.classList.toggle("system-initiated-request", !!element.isSystemInitiated);
    templateData.rowContainer.classList.toggle("terminal-command-request", !element.isSystemInitiated && element.isTerminalCommand);
    if (element.isSystemInitiated) {
      this.renderSystemInitiatedRequest(element, templateData);
      return;
    }
    if (element.pendingKind && this._pendingDragController) {
      templateData.rowContainer.dataset.pendingRequestId = element.id;
      templateData.rowContainer.dataset.pendingKind = element.pendingKind;
      const sameKindCount = (this.viewModel?.model.getPendingRequests() ?? []).filter((p) => p.kind === element.pendingKind).length;
      if (sameKindCount > 1) {
        const handle2 = $(".chat-pending-drag-handle" + ThemeIcon.asCSSSelector(Codicon.gripper));
        templateData.rowContainer.prepend(handle2);
        templateData.dragHandle = handle2;
        this._pendingDragController.attachDragHandle(element, handle2, templateData.rowContainer, templateData.elementDisposables);
      }
    }
    const isStickyScrollRow = !!findParentWithClass(templateData.rowContainer, "monaco-tree-sticky-row");
    if (element.id === this.viewModel?.editing?.id && !isStickyScrollRow) {
      this._onDidRerender.fire(templateData);
    }
    if (this.configService.getValue("chat.editRequests") !== "none" && this.rendererOptions.editable) {
      templateData.elementDisposables.add(addDisposableListener(templateData.rowContainer, EventType.KEY_DOWN, (e4) => {
        const ev = new StandardKeyboardEvent(e4);
        if (ev.equals(10 /* Space */) || ev.equals(3 /* Enter */)) {
          if (this.viewModel?.editing?.id !== element.id) {
            ev.preventDefault();
            ev.stopPropagation();
            this._onDidClickRequest.fire(templateData);
          }
        }
      }));
    }
    let content = [];
    const explicitFileOrImageVariables = element.variables.filter(isExplicitFileOrImageVariableEntry);
    const explicitImageVariables = explicitFileOrImageVariables.filter((variable) => variable.kind === "image");
    const explicitFileOrDirectoryVariables = element.variables.filter((variable) => variable.kind === "file" || variable.kind === "directory" || isPasteVariableEntry(variable));
    const otherVariables = element.variables.filter((variable) => !isExplicitFileOrImageVariableEntry(variable) && !isPasteVariableEntry(variable));
    const isStickyAndEditing = !element.confirmation && isStickyScrollRow && element.id === this.viewModel?.editing?.id;
    if (!element.confirmation && !isStickyAndEditing) {
      const requestMarkdown = this.getRequestMarkdown(element, explicitFileOrImageVariables);
      if (requestMarkdown) {
        content = [{ content: new MarkdownString(requestMarkdown), kind: "markdownContent" }];
      }
      if (this.rendererOptions.renderStyle === "minimal" && !element.isComplete) {
        templateData.value.classList.add("inline-progress");
        templateData.elementDisposables.add(toDisposable(() => templateData.value.classList.remove("inline-progress")));
        content.push({ content: new MarkdownString("<span></span>", { supportHtml: true }), kind: "markdownContent" });
      } else {
        templateData.value.classList.remove("inline-progress");
      }
    }
    clearNode(templateData.value);
    const isFirstRequest = this.viewModel?.model.getRequests()[0]?.id === element.id;
    if (!isStickyScrollRow && (element.origin || this.environmentService.isSessionsWindow && isFirstRequest)) {
      const requestOriginPart = this.instantiationService.createInstance(ChatRequestOriginPart, element.sessionResource, element.origin);
      templateData.value.appendChild(requestOriginPart.domNode);
      templateData.elementDisposables.add(requestOriginPart);
    }
    const parts = [];
    if (!isStickyScrollRow) {
      const explicitImageAttachmentsPart = explicitImageVariables.length ? this.renderAttachments(explicitImageVariables, element.contentReferences, element.modelId, templateData, element.resolvedModelId) : void 0;
      if (explicitImageAttachmentsPart?.domNode) {
        explicitImageAttachmentsPart.domNode.classList.add("chat-request-attachment-cards", "chat-request-image-attachments");
        templateData.value.appendChild(explicitImageAttachmentsPart.domNode);
        templateData.elementDisposables.add(explicitImageAttachmentsPart);
      }
      const explicitFileAttachmentsPart = explicitFileOrDirectoryVariables.length ? this.renderAttachments(explicitFileOrDirectoryVariables, element.contentReferences, element.modelId, templateData) : void 0;
      if (explicitFileAttachmentsPart?.domNode) {
        explicitFileAttachmentsPart.domNode.classList.add("chat-request-attachment-cards", "chat-request-file-attachments");
        explicitFileAttachmentsPart.domNode.style.display = "flex";
        explicitFileAttachmentsPart.domNode.style.flexDirection = "column";
        explicitFileAttachmentsPart.domNode.style.alignItems = "flex-end";
        explicitFileAttachmentsPart.domNode.style.flexWrap = "nowrap";
        templateData.value.appendChild(explicitFileAttachmentsPart.domNode);
        templateData.elementDisposables.add(explicitFileAttachmentsPart);
      }
      if (otherVariables.length) {
        const otherAttachmentsPart = this.renderAttachments(otherVariables, element.contentReferences, element.modelId, templateData);
        if (otherAttachmentsPart.domNode) {
          templateData.value.appendChild(otherAttachmentsPart.domNode);
        }
        templateData.elementDisposables.add(otherAttachmentsPart);
      }
    }
    const contentContainer = templateData.value;
    if (isStickyAndEditing) {
      const store = new DisposableStore();
      templateData.elementDisposables.add(store);
      const editingText = this.delegate.getEditingValue?.() || "";
      const editingTextContent = $("span", void 0, editingText);
      const container2 = $(".rendered-markdown");
      const innerContent = $(".chat-request-text");
      innerContent.classList.add("sticky-editing");
      innerContent.appendChild(editingTextContent);
      container2.appendChild(innerContent);
      if (this.rendererOptions.renderStyle === "minimal" && !element.isComplete) {
        templateData.value.classList.add("inline-progress");
        templateData.elementDisposables.add(toDisposable(() => templateData.value.classList.remove("inline-progress")));
        container2.appendChild($("span"));
      } else {
        templateData.value.classList.remove("inline-progress");
      }
      container2.tabIndex = 0;
      if (this.configService.getValue("chat.editRequests") === "inline" && this.rendererOptions.editable) {
        container2.classList.add("clickable");
        store.add(addDisposableListener(container2, EventType.CLICK, (e4) => {
          if (this.viewModel?.editing?.id === element.id) {
            return;
          }
          const selection = getWindow(templateData.rowContainer).getSelection();
          if (selection && !selection.isCollapsed && selection.toString().length > 0) {
            return;
          }
          e4.preventDefault();
          e4.stopPropagation();
          this._onDidClickRequest.fire(templateData);
        }));
        store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), container2, localize(12404, null), { trapFocus: true }));
      }
      store.add(addDisposableListener(container2, EventType.FOCUS, () => {
        this.hoverVisible(templateData.requestHover);
      }));
      store.add(addDisposableListener(container2, EventType.BLUR, () => {
        this.hoverHidden(templateData.requestHover);
      }));
      contentContainer.appendChild(container2);
      templateData.stickyScrollSource = container2;
      const editingTextPart = {
        domNode: container2,
        hasSameContent: (other) => other.kind === "markdownContent",
        dispose: () => store.dispose(),
        addDisposable: (disposable) => store.add(disposable)
      };
      parts.push(editingTextPart);
    }
    let inlineSlashCommandRendered = false;
    let codeBlockStartIndex = 0;
    content.forEach((data, contentIndex) => {
      const context2 = {
        element,
        elementIndex: index2,
        contentIndex,
        content,
        container: templateData.rowContainer,
        editorPool: this._editorPool,
        diffEditorPool: this._diffEditorPool,
        currentWidth: this._currentLayoutWidth,
        onDidChangeVisibility: this._onDidChangeVisibility.event,
        inlineTextModels: this._inlineTextModels,
        codeBlockStartIndex,
        treeStartIndex: 0
        // no trees in requests
      };
      const newPart = this.renderChatContentPart(data, templateData, context2);
      if (newPart) {
        if (data.kind === "markdownContent" && newPart.domNode) {
          templateData.stickyScrollSource ??= newPart.domNode;
        }
        if (isStickyScrollRow && data.kind === "markdownContent" && newPart.domNode) {
          const firstBlock = newPart.domNode.firstElementChild;
          newPart.domNode.classList.toggle("chat-request-has-more", !!firstBlock?.nextElementSibling);
        }
        if (!isStickyScrollRow && this.rendererOptions.renderDetectedCommandsWithRequest && !inlineSlashCommandRendered && element.agentOrSlashCommandDetected && element.slashCommand && data.kind === "markdownContent") {
          if (newPart.domNode) {
            newPart.domNode.style.display = "inline-flex";
          }
          const cmdPart = this.instantiationService.createInstance(ChatAgentCommandContentPart, element.slashCommand, () => this._onDidClickRerunWithAgentOrCommandDetection.fire({ sessionResource: element.sessionResource, requestId: element.id }));
          contentContainer.appendChild(cmdPart.domNode);
          parts.push(cmdPart);
          inlineSlashCommandRendered = true;
        }
        if (newPart.domNode && !newPart.domNode.parentElement) {
          contentContainer.appendChild(newPart.domNode);
        }
        parts.push(newPart);
        codeBlockStartIndex += newPart.codeblocks?.length ?? 0;
      }
    });
    if (templateData.renderedParts) {
      dispose(templateData.renderedParts);
    }
    templateData.renderedParts = parts;
    if (isStickyScrollRow && this.stickyScrollTemplateDataByRequestId.get(element.id) !== templateData) {
      this.stickyScrollTemplateDataByRequestId.set(element.id, templateData);
      templateData.elementDisposables.add(toDisposable(() => {
        if (this.stickyScrollTemplateDataByRequestId.get(element.id) === templateData) {
          this.stickyScrollTemplateDataByRequestId.delete(element.id);
        }
      }));
    }
    const stickyScrollSourcePart = parts.find((part) => part.domNode === templateData.stickyScrollSource);
    if (stickyScrollSourcePart?.addDisposable && templateData.stickyScrollSource?.classList.contains("clickable")) {
      stickyScrollSourcePart.addDisposable(this.registerSynchronizedRequestBubbleHover(element.id, templateData, templateData.stickyScrollSource));
    }
    if (!isStickyScrollRow && !element.pendingKind && !element.confirmation && this.rendererOptions.renderStyle !== "minimal" && templateData.value.childElementCount > 0) {
      const timestamp = renderChatRequestTimestamp(templateData.requestTimestampContainer, element.requestTimestamp);
      if (timestamp?.hoverText) {
        templateData.elementDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), timestamp.element, timestamp.hoverText));
      } else if (timestamp) {
        let requestTimingBounds;
        templateData.elementDisposables.add(addDisposableListener(timestamp.element, EventType.MOUSE_OVER, (e4) => {
          const target = isHTMLElement(e4.target) ? e4.target.closest(".chat-request-relative") : void 0;
          if (!isHTMLElement(target) || !timestamp.element.contains(target)) {
            return;
          }
          const bounds = target.getBoundingClientRect();
          requestTimingBounds = bounds;
          timestamp.element.classList.add("chat-request-flip-reset");
          timestamp.element.classList.remove("chat-request-flip-active");
          timestamp.element.classList.toggle("chat-request-flip-down", e4.clientY < bounds.top + bounds.height / 2);
          void timestamp.element.offsetWidth;
          timestamp.element.classList.remove("chat-request-flip-reset");
          void timestamp.element.offsetWidth;
          timestamp.element.classList.add("chat-request-flip-active");
        }));
        templateData.elementDisposables.add(addDisposableListener(timestamp.element, EventType.MOUSE_MOVE, (e4) => {
          if (requestTimingBounds && (e4.clientX < requestTimingBounds.left || e4.clientX > requestTimingBounds.right || e4.clientY < requestTimingBounds.top || e4.clientY > requestTimingBounds.bottom)) {
            requestTimingBounds = void 0;
            timestamp.element.classList.remove("chat-request-flip-active");
          }
        }));
        templateData.elementDisposables.add(addDisposableListener(timestamp.element, EventType.MOUSE_LEAVE, () => {
          requestTimingBounds = void 0;
          timestamp.element.classList.remove("chat-request-flip-active");
        }));
        templateData.elementDisposables.add(addDisposableListener(timestamp.element, EventType.FOCUS, () => {
          timestamp.element.classList.remove("chat-request-flip-active", "chat-request-flip-down");
        }));
      }
    }
  }
  getRequestMarkdown(element, explicitFileOrImageVariables = element.variables.filter(isExplicitFileOrImageVariableEntry)) {
    const markdown = isChatFollowup(element.message) ? element.message.message : this.markdownDecorationsRenderer.convertParsedRequestToMarkdown(element.sessionResource, element.message);
    const attachmentSummary = !element.messageText.trim() && !explicitFileOrImageVariables.length ? getExplicitFileOrImageAttachmentSummary(element.variables) : void 0;
    return markdown.trim() ? markdown : attachmentSummary;
  }
  requestHasStickyScrollContent(element) {
    const isEditing = element.id === this.viewModel?.editing?.id;
    const editingValue = isEditing ? this.delegate.getEditingValue?.() ?? "" : void 0;
    const contentKey = isEditing ? `editing:${editingValue}` : element.dataId;
    const cached = this.stickyScrollRequestContentById.get(element.id);
    if (cached?.contentKey === contentKey) {
      return cached.hasContent;
    }
    const hasContent = isEditing ? !!editingValue?.trim() : !!this.getRequestMarkdown(element)?.trim();
    this.stickyScrollRequestContentById.set(element.id, { contentKey, hasContent });
    this.stickyScrollSourceWidthRatioByRequestId.delete(element.id);
    this.stickyScrollSourceRangesByRequestId.delete(element.id);
    return hasContent;
  }
  updateStickyScrollSourceRange(element, templateData) {
    if (!this.delegate.isStickyScrollEnabled() || templateData.currentElement !== element) {
      return;
    }
    const stickyScrollRow = findParentWithClass(templateData.rowContainer, "monaco-tree-sticky-row");
    const isStickyScrollRow = !!stickyScrollRow;
    const requestBubble = templateData.stickyScrollSource;
    if (!requestBubble?.textContent?.trim()) {
      this.rejectStickyScrollSourceRange(element.id, isStickyScrollRow);
      return;
    }
    if (isStickyScrollRow && !templateData.rowContainer.isConnected) {
      templateData.elementDisposables.add(scheduleAtNextAnimationFrame(getWindow(templateData.rowContainer), () => {
        if (templateData.currentElement === element && templateData.rowContainer.isConnected) {
          this.updateStickyScrollSourceRange(element, templateData);
        }
      }));
      return;
    }
    if (isStickyScrollRow) {
      this.updateStickyScrollRequestWidth(element.id, requestBubble);
    }
    const requestBounds = requestBubble.getBoundingClientRect();
    if (isStickyScrollRow) {
      const stickyRowBounds = stickyScrollRow.getBoundingClientRect();
      const visibleWidth = Math.min(requestBounds.right, stickyRowBounds.right) - Math.max(requestBounds.left, stickyRowBounds.left);
      const visibleHeight = Math.min(requestBounds.bottom, stickyRowBounds.bottom) - Math.max(requestBounds.top, stickyRowBounds.top);
      if (visibleHeight <= 0 || visibleWidth <= 0) {
        this.rejectStickyScrollSourceRange(element.id, true);
        return;
      }
      const previousRange = this.stickyScrollSourceRangesByRequestId.get(element.id);
      const stickyNodeHeight2 = this.delegate.stickyScrollTopPadding + requestBounds.height;
      if (!previousRange || previousRange.stickyNodeHeight !== stickyNodeHeight2) {
        this.stickyScrollSourceRangesByRequestId.set(element.id, {
          start: previousRange?.start ?? 0,
          end: previousRange?.end ?? this.delegate.stickyScrollTopPadding + requestBounds.height,
          stickyNodeHeight: stickyNodeHeight2
        });
        this.scheduleStickyScrollStateRefresh();
      }
      return;
    }
    this.updateStickyScrollSourceWidthRatio(element.id, requestBubble, requestBounds.width);
    const rowBounds = templateData.rowContainer.getBoundingClientRect();
    const start = Math.max(0, requestBounds.top - rowBounds.top - this.delegate.stickyScrollTopPadding);
    const end = requestBounds.bottom - rowBounds.top;
    if (requestBounds.height <= 0 || end <= start) {
      return;
    }
    const stickyNodeHeight = this.stickyScrollSourceRangesByRequestId.get(element.id)?.stickyNodeHeight;
    this.stickyScrollSourceRangesByRequestId.set(element.id, { start, end, stickyNodeHeight });
  }
  updateStickyScrollRequestWidth(requestId, requestBubble) {
    const widthRatio = this.stickyScrollSourceWidthRatioByRequestId.get(requestId);
    if (widthRatio !== void 0) {
      if (this.appliedStickyScrollWidthRatioByBubble.get(requestBubble) !== widthRatio) {
        requestBubble.style.boxSizing = "border-box";
        requestBubble.style.width = `${widthRatio * 100}%`;
        requestBubble.style.maxWidth = "none";
        this.appliedStickyScrollWidthRatioByBubble.set(requestBubble, widthRatio);
      }
    } else if (this.appliedStickyScrollWidthRatioByBubble.delete(requestBubble)) {
      requestBubble.style.removeProperty("box-sizing");
      requestBubble.style.removeProperty("width");
      requestBubble.style.removeProperty("max-width");
    }
  }
  updateStickyScrollSourceWidthRatio(requestId, requestBubble, requestWidth) {
    const requestParentWidth = requestBubble.parentElement?.getBoundingClientRect().width;
    if (requestWidth > 0 && requestParentWidth && requestParentWidth > 0) {
      this.stickyScrollSourceWidthRatioByRequestId.set(requestId, requestWidth / requestParentWidth);
    } else {
      this.stickyScrollSourceWidthRatioByRequestId.delete(requestId);
    }
  }
  registerSynchronizedRequestBubbleHover(requestId, templateData, requestBubble) {
    const disposables = new DisposableStore();
    const setHovered = (hovered) => {
      if (hovered) {
        this.hoveredRequestBubbleByRequestId.set(requestId, requestBubble);
      } else if (this.hoveredRequestBubbleByRequestId.get(requestId) === requestBubble) {
        this.hoveredRequestBubbleByRequestId.delete(requestId);
      } else {
        return;
      }
      this.updateSynchronizedRequestBubbleHover(requestId);
    };
    disposables.add(addDisposableListener(requestBubble, EventType.MOUSE_ENTER, () => setHovered(true)));
    disposables.add(addDisposableListener(requestBubble, EventType.MOUSE_LEAVE, () => setHovered(false)));
    if (requestBubble.matches(":hover")) {
      setHovered(true);
    } else {
      this.updateSynchronizedRequestBubbleHover(requestId);
    }
    disposables.add(toDisposable(() => {
      setHovered(false);
      templateData.rowContainer.classList.remove("request-bubble-hovered");
    }));
    return disposables;
  }
  updateSynchronizedRequestBubbleHover(requestId) {
    const hovered = this.hoveredRequestBubbleByRequestId.has(requestId);
    this.templateDataByRequestId.get(requestId)?.rowContainer.classList.toggle("request-bubble-hovered", hovered);
    this.stickyScrollTemplateDataByRequestId.get(requestId)?.rowContainer.classList.toggle("request-bubble-hovered", hovered);
  }
  rejectStickyScrollSourceRange(requestId, refreshStickyScroll) {
    const alreadyRejected = this.stickyScrollSourceRangesByRequestId.get(requestId) === null;
    this.stickyScrollSourceRangesByRequestId.set(requestId, null);
    if (refreshStickyScroll && !alreadyRejected) {
      this.scheduleStickyScrollStateRefresh();
    }
  }
  scheduleStickyScrollSourceRangeRefresh() {
    if (!this.delegate.isStickyScrollEnabled()) {
      return;
    }
    this.pendingStickyScrollSourceRangeRefresh.value = scheduleAtNextAnimationFrame(getWindow(this.delegate.container), () => {
      this.refreshStickyScrollSourceRanges();
      this.delegate.refreshStickyScroll();
    });
  }
  scheduleStickyScrollStateRefresh() {
    this.pendingStickyScrollStateRefresh.value = scheduleAtNextAnimationFrame(getWindow(this.delegate.container), () => {
      this.delegate.refreshStickyScroll();
    });
  }
  renderSystemInitiatedRequest(element, templateData) {
    clearNode(templateData.value);
    if (templateData.renderedParts) {
      dispose(templateData.renderedParts);
    }
    templateData.renderedParts = [];
    const agentMerge = element.systemInitiatedLabel === void 0 ? parseAgentMergePrompt(element.messageText) : void 0;
    if (agentMerge) {
      const agentMergePart = this.instantiationService.createInstance(ChatAgentMergeContentPart, agentMerge, element.sessionResource, this.chatContentMarkdownRenderer);
      templateData.elementDisposables.add(agentMergePart);
      templateData.value.appendChild(agentMergePart.domNode);
      return;
    }
    const label3 = element.systemInitiatedLabel ?? element.messageText;
    const notificationPart = this.instantiationService.createInstance(
      ChatSystemNotificationContentPart,
      { kind: "systemNotification", content: new MarkdownString(label3) },
      this.chatContentMarkdownRenderer
    );
    templateData.elementDisposables.add(notificationPart);
    templateData.value.appendChild(notificationPart.domNode);
  }
  /**
   * Smooth streaming render path — event-driven, rAF-batched.
   *
   * Does a render pass that feeds the full content through
   * `getNextProgressiveRenderContent` → `diff` → `renderChatContentDiff`,
   * where the morpher intercepts markdown appends and schedules
   * rAF-batched re-renders through the standard markdown pipeline.
   *
   * Called on every `renderElement` invocation (which fires each time
   * the model changes). On completion/cancellation the morpher's
   * content is already correctly rendered, so we do a final diff pass
   * (not a destructive re-render) to finalize non-markdown parts like
   * thinking indicators, error details, and code citations.
   */
  doIncrementalRender(element, index2, templateData) {
    if (!this._isVisible) {
      return;
    }
    const rate = this.getProgressiveRenderRate(element);
    this._updateMorpherRate(templateData, rate, element.isComplete || element.isCanceled);
    if (element.isCanceled || element.isComplete) {
      element.renderData = void 0;
      templateData.rowContainer.classList.toggle("chat-response-loading", false);
      this.renderChatResponseBasic(element, index2, templateData);
      return;
    }
    templateData.rowContainer.classList.toggle("chat-response-loading", true);
    const contentForThisTurn = this.getNextProgressiveRenderContent(element, templateData);
    const partsToRender = this.diff(templateData.renderedParts ?? [], contentForThisTurn.content, element);
    const contentIsAlreadyRendered = partsToRender.every((part) => part === null);
    if (!contentIsAlreadyRendered) {
      this.renderChatContentDiff(partsToRender, contentForThisTurn.content, element, index2, templateData);
    }
  }
  /**
   * Propagate the stream's word-rate estimate to any active morpher's
   * word buffer so it reveals content at the model's speed.
   */
  _updateMorpherRate(templateData, rate, isComplete) {
    const renderedParts = templateData.renderedParts;
    if (!renderedParts) {
      return;
    }
    for (const part of renderedParts) {
      if (part instanceof ChatMarkdownContentPart) {
        part.updateStreamRate(rate, isComplete);
      }
    }
  }
  logIncrementalRenderingTelemetry() {
    if (this._incrementalRenderingTelemetryLogged) {
      return;
    }
    this._incrementalRenderingTelemetryLogged = true;
    this.telemetryService.publicLog2("chatIncrementalRenderingSettings", {
      animationStyle: this.configService.getValue("chat.experimental.incrementalRendering.animationStyle" /* IncrementalRenderingStyle */) ?? "none",
      buffering: this.configService.getValue("chat.experimental.incrementalRendering.buffering" /* IncrementalRenderingBuffering */) ?? "word"
    });
  }
  /**
   *	@returns true if progressive rendering should be considered complete- the element's data is fully rendered or the view is not visible
   */
  doNextProgressiveRender(element, index2, templateData, isInRenderElement) {
    if (!this._isVisible) {
      return true;
    }
    if (element.isCanceled) {
      this.traceLayout("doNextProgressiveRender", `canceled, index=${index2}`);
      element.renderData = void 0;
      this.renderChatResponseBasic(element, index2, templateData);
      return true;
    }
    templateData.rowContainer.classList.toggle("chat-response-loading", true);
    this.traceLayout("doNextProgressiveRender", `START progressive render, index=${index2}`);
    const contentForThisTurn = this.getNextProgressiveRenderContent(element, templateData);
    const partsToRender = this.diff(templateData.renderedParts ?? [], contentForThisTurn.content, element);
    const contentIsAlreadyRendered = partsToRender.every((part) => part === null);
    if (contentIsAlreadyRendered) {
      if (contentForThisTurn.moreContentAvailable) {
        this.traceLayout("doNextProgressiveRender", "not rendering any new content this tick, but more available");
        return false;
      } else if (element.isComplete) {
        this.traceLayout("doNextProgressiveRender", `END progressive render, index=${index2} and clearing renderData, response is complete`);
        element.renderData = void 0;
        this.renderChatResponseBasic(element, index2, templateData);
        return true;
      } else if (this.isWorkingProgressDebouncePending(element, contentForThisTurn.content)) {
        return false;
      } else {
        return true;
      }
    }
    this.traceLayout("doNextProgressiveRender", `doing progressive render, ${partsToRender.length} parts to render`);
    this.renderChatContentDiff(partsToRender, contentForThisTurn.content, element, index2, templateData);
    return false;
  }
  renderChatContentDiff(partsToRender, contentForThisTurn, element, elementIndex, templateData) {
    const renderedParts = templateData.renderedParts ?? [];
    templateData.renderedParts = renderedParts;
    templateData.renderedContent = contentForThisTurn;
    const batchedSubagentParts = /* @__PURE__ */ new Set();
    let codeBlockStartIndex = 0;
    let treeStartIndex = 0;
    let displacedWorkingPart;
    const renderParts = () => partsToRender.forEach((partToRender, contentIndex) => {
      if (contentIndex > 0) {
        const prevPart = renderedParts[contentIndex - 1];
        if (prevPart) {
          codeBlockStartIndex += prevPart.codeblocks?.length ?? 0;
          if (prevPart instanceof ChatTreeContentPart) {
            treeStartIndex++;
          }
        }
      }
      const alreadyRenderedPart = templateData.renderedParts?.[contentIndex];
      if (!partToRender) {
        if (!templateData.renderedPartsMounted) {
          alreadyRenderedPart?.onDidRemount?.();
        }
        return;
      }
      if (partToRender.kind === "working" && displacedWorkingPart?.hasSameContent(partToRender, contentForThisTurn.slice(contentIndex + 1), element)) {
        renderedParts[contentIndex] = displacedWorkingPart;
        displacedWorkingPart = void 0;
        return;
      }
      const preserveWorkingPart = alreadyRenderedPart instanceof ChatWorkingProgressContentPart && partToRender.kind !== "working" && contentForThisTurn.slice(contentIndex + 1).some((part) => part.kind === "working");
      if (alreadyRenderedPart) {
        if (partToRender.kind === "thinking" && alreadyRenderedPart instanceof ChatThinkingContentPart) {
          if (!Array.isArray(partToRender.value)) {
            alreadyRenderedPart.updateThinking(partToRender);
          }
          renderedParts[contentIndex] = alreadyRenderedPart;
          return;
        } else if (alreadyRenderedPart instanceof ChatThinkingContentPart && this.shouldPinPart(partToRender, element)) {
          renderedParts[contentIndex] = alreadyRenderedPart;
          return;
        }
        if (partToRender.kind === "markdownContent" && alreadyRenderedPart instanceof ChatMarkdownContentPart && this.configService.getValue("chat.experimental.incrementalRendering.enabled" /* IncrementalRendering */)) {
          if (alreadyRenderedPart.tryIncrementalUpdate(partToRender)) {
            renderedParts[contentIndex] = alreadyRenderedPart;
            return;
          }
        }
        if (preserveWorkingPart) {
          displacedWorkingPart = alreadyRenderedPart;
        } else {
          alreadyRenderedPart.dispose();
        }
        if (alreadyRenderedPart.domNode) {
          const thinkingToolWrapper = findParentWithClass(alreadyRenderedPart.domNode, "chat-thinking-tool-wrapper");
          if (thinkingToolWrapper) {
            thinkingToolWrapper.replaceWith(alreadyRenderedPart.domNode);
          }
        }
      }
      const context2 = {
        element,
        elementIndex,
        content: contentForThisTurn,
        contentIndex,
        container: templateData.rowContainer,
        editorPool: this._editorPool,
        diffEditorPool: this._diffEditorPool,
        currentWidth: this._currentLayoutWidth,
        onDidChangeVisibility: this._onDidChangeVisibility.event,
        inlineTextModels: this._inlineTextModels,
        codeBlockStartIndex,
        treeStartIndex
      };
      const lastThinking = this.getLastThinkingPart(renderedParts);
      if (lastThinking && (partToRender.kind === "toolInvocation" || partToRender.kind === "toolInvocationSerialized" || partToRender.kind === "markdownContent" || partToRender.kind === "textEditGroup" || partToRender.kind === "externalEdit" || partToRender.kind === "hook") && this.shouldPinPart(partToRender, element)) {
        if (alreadyRenderedPart instanceof ChatMarkdownContentPart) {
          lastThinking.removeEditPillByPartId(alreadyRenderedPart.codeblocksPartId);
        }
        const newPart2 = this.renderChatContentPart(partToRender, templateData, context2, batchedSubagentParts);
        if (newPart2) {
          renderedParts[contentIndex] = newPart2;
          alreadyRenderedPart?.domNode?.remove();
        }
        return;
      }
      const newPart = this.renderChatContentPart(partToRender, templateData, context2, batchedSubagentParts);
      if (newPart) {
        renderedParts[contentIndex] = newPart;
        try {
          if (alreadyRenderedPart?.domNode) {
            if (newPart.domNode) {
              if (preserveWorkingPart) {
                alreadyRenderedPart.domNode.before(newPart.domNode);
              } else {
                alreadyRenderedPart.domNode.replaceWith(newPart.domNode);
              }
            } else {
              if (!preserveWorkingPart) {
                alreadyRenderedPart.domNode.remove();
              }
            }
          } else if (newPart.domNode && !newPart.domNode.parentElement) {
            templateData.value.appendChild(newPart.domNode);
          }
        } catch (err) {
          this.logService.error("ChatListItemRenderer#renderChatContentDiff: error replacing part", err);
        }
      } else {
        alreadyRenderedPart?.domNode?.remove();
      }
    });
    try {
      renderParts();
    } finally {
      for (const subagentPart of batchedSubagentParts) {
        try {
          subagentPart.endToolPresentationBatch();
        } catch (error) {
          this.logService.error("ChatListItemRenderer#renderChatContentDiff: error flushing subagent presentation", error);
        }
      }
    }
    displacedWorkingPart?.dispose();
    displacedWorkingPart?.domNode?.remove();
    for (let i2 = partsToRender.length; i2 < renderedParts.length; i2++) {
      const part = renderedParts[i2];
      if (part) {
        part.dispose();
        part.domNode?.remove();
        delete renderedParts[i2];
      }
    }
    const animateCollapse = templateData.wasResponseComplete === false && element.isComplete;
    this.updateCompletedResponseDisclosure(element, contentForThisTurn, templateData, animateCollapse);
    templateData.wasResponseComplete = element.isComplete;
  }
  updateCompletedResponseDisclosure(element, content, templateData, animateCollapse) {
    if (!element.isComplete || !this.configService.getValue("chat.agent.collapseCompletedResponses" /* CollapseCompletedResponses */)) {
      this.removeCompletedResponseDisclosure(templateData);
      templateData.completedResponseDisclosureOpen = void 0;
      return;
    }
    const responseContent = annotateSpecialMarkdownContent(element.response.value);
    const responseFinalStartIndex = getFinalResponseStartIndexAfterMovingResponseOutcomeTools(responseContent);
    const finalResponseStartIndex = responseFinalStartIndex === void 0 ? void 0 : responseFinalStartIndex + 1;
    if (finalResponseStartIndex === void 0 || !isFinalResponseRendered(content, finalResponseStartIndex) || finalResponseStartIndex === 0 || !content.slice(0, finalResponseStartIndex).some((part) => part.kind !== "references" || part.references.length > 0)) {
      this.removeCompletedResponseDisclosure(templateData);
      return;
    }
    const finalResponsePart = templateData.renderedParts?.[finalResponseStartIndex];
    if (!(finalResponsePart instanceof ChatMarkdownContentPart) || !finalResponsePart.isRenderComplete) {
      this.removeCompletedResponseDisclosure(templateData);
      if (finalResponsePart instanceof ChatMarkdownContentPart) {
        templateData.completedResponseDisclosureDisposables.add(Event2.once(finalResponsePart.onDidFinishRendering)(() => {
          this.updateCompletedResponseDisclosure(element, content, templateData, false);
        }));
      }
      return;
    }
    const collapseEndIndex = getCompletedResponseCollapseEndIndex(content, finalResponseStartIndex);
    if (collapseEndIndex === 0) {
      this.removeCompletedResponseDisclosure(templateData);
      return;
    }
    const collapseEndNode = templateData.renderedParts?.[collapseEndIndex]?.domNode;
    if (!collapseEndNode) {
      this.removeCompletedResponseDisclosure(templateData);
      return;
    }
    let existingDisclosure = templateData.completedResponseDisclosure;
    if (existingDisclosure?.contains(collapseEndNode)) {
      this.removeCompletedResponseDisclosure(templateData);
      existingDisclosure = void 0;
    }
    let collapseEndRoot = collapseEndNode;
    while (collapseEndRoot.parentElement && collapseEndRoot.parentElement !== templateData.value) {
      collapseEndRoot = collapseEndRoot.parentElement;
    }
    if (collapseEndRoot.parentElement !== templateData.value) {
      this.removeCompletedResponseDisclosure(templateData);
      return;
    }
    if (existingDisclosure && templateData.completedResponseCollapseEndIndex === collapseEndIndex && existingDisclosure.nextSibling === collapseEndRoot && templateData.renderedParts?.slice(0, collapseEndIndex).every((part) => !part?.domNode || existingDisclosure.contains(part.domNode))) {
      return;
    }
    this.removeCompletedResponseDisclosure(templateData);
    const valueChildren = Array.from(templateData.value.childNodes);
    const nodesToCollapse = valueChildren.slice(0, valueChildren.indexOf(collapseEndRoot));
    const stepCount = getVisibleCompletedResponseItemCount(nodesToCollapse);
    if (stepCount < 2) {
      return;
    }
    const details = document.createElement("details");
    details.classList.add("completed-response-disclosure");
    const summary = details.appendChild(document.createElement("summary"));
    summary.classList.add("completed-response-summary", "chat-used-context-label");
    const button = summary.appendChild($54("span.monaco-button.monaco-text-button.monaco-icon-button"));
    const label3 = button.appendChild($54("span.monaco-button-mdlabel"));
    const chevron = button.appendChild($54("span.chat-collapsible-hover-chevron", { "aria-hidden": "true" }));
    chevron.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRight));
    const disclosureLabel = formatCompletedResponseDisclosureLabel(stepCount, element.model.elapsedMs);
    label3.textContent = disclosureLabel;
    const activeElement = getActiveElement();
    const keepOpenForFocus = nodesToCollapse.some((node) => node.contains(activeElement));
    const shouldAnimateInitialCollapse = animateCollapse && !keepOpenForFocus && !this.accessibilityService.isMotionReduced() && templateData.completedResponseDisclosureOpen === void 0;
    if (keepOpenForFocus) {
      templateData.completedResponseDisclosureOpen = true;
    }
    details.open = templateData.completedResponseDisclosureOpen ?? shouldAnimateInitialCollapse;
    const updateExpansionState = () => {
      summary.setAttribute("aria-expanded", String(details.open));
      chevron.classList.toggle("expanded", details.open);
    };
    updateExpansionState();
    templateData.value.insertBefore(details, collapseEndRoot);
    details.append(...nodesToCollapse);
    templateData.completedResponseDisclosure = details;
    templateData.completedResponseCollapseEndIndex = collapseEndIndex;
    templateData.completedResponseDisclosureDisposables.add(addDisposableListener(details, "toggle", () => {
      templateData.completedResponseDisclosureOpen = details.open;
      updateExpansionState();
    }));
    templateData.completedResponseDisclosureDisposables.add(addDisposableListener(summary, EventType.CLICK, () => {
      details.dispatchEvent(new CustomEvent(ChatCollapsibleContentPart.userToggleEvent, { bubbles: true }));
    }));
    if (shouldAnimateInitialCollapse) {
      const targetWindow = getWindow(details);
      const animationFrame = targetWindow.requestAnimationFrame(() => {
        if (templateData.completedResponseDisclosure === details && details.open) {
          details.open = false;
        }
      });
      templateData.completedResponseDisclosureDisposables.add(toDisposable(() => targetWindow.cancelAnimationFrame(animationFrame)));
    }
  }
  removeCompletedResponseDisclosure(templateData) {
    templateData.completedResponseDisclosureDisposables.clear();
    const details = templateData.completedResponseDisclosure;
    if (!details) {
      return;
    }
    while (details.childNodes.length > 1) {
      details.before(details.childNodes[1]);
    }
    details.remove();
    templateData.completedResponseDisclosure = void 0;
    templateData.completedResponseCollapseEndIndex = void 0;
  }
  /**
   * Returns all content parts that should be rendered, and trimmed markdown content. We will diff this with the current rendered set.
   */
  getNextProgressiveRenderContent(element, templateData) {
    const data = this.getDataForProgressiveRender(element);
    const incrementalRendering = this.configService.getValue("chat.experimental.incrementalRendering.enabled" /* IncrementalRendering */) === true;
    const responseContent = annotateSpecialMarkdownContent(element.response.value);
    const renderableResponse = element.isComplete ? moveResponseOutcomeToolsAfterFinalResponse(responseContent) : responseContent;
    this.traceLayout("getNextProgressiveRenderContent", `Want to render ${data.numWordsToRender} at ${data.rate} words/s, counting...`);
    let numNeededWords = data.numWordsToRender;
    const partsToRender = [];
    partsToRender.push({ kind: "references", references: element.contentReferences });
    let moreContentAvailable = false;
    for (let i2 = 0; i2 < renderableResponse.length; i2++) {
      const part = renderableResponse[i2];
      if (part.kind === "markdownContent" && !incrementalRendering) {
        const wordCountResult = getNWords(part.content.value, numNeededWords);
        this.traceLayout("getNextProgressiveRenderContent", `  Chunk ${i2}: Want to render ${numNeededWords} words and found ${wordCountResult.returnedWordCount} words. Total words in chunk: ${wordCountResult.totalWordCount}`);
        numNeededWords -= wordCountResult.returnedWordCount;
        if (wordCountResult.isFullString) {
          partsToRender.push(part);
          for (const nextPart of renderableResponse.slice(i2 + 1)) {
            if (nextPart.kind !== "markdownContent") {
              i2++;
              partsToRender.push(nextPart);
            } else {
              break;
            }
          }
        } else {
          moreContentAvailable = true;
          partsToRender.push({ ...part, content: new MarkdownString(wordCountResult.value, part.content) });
        }
        if (numNeededWords <= 0) {
          if (renderableResponse.slice(i2 + 1).some((part2) => part2.kind === "markdownContent")) {
            moreContentAvailable = true;
          }
          break;
        }
      } else {
        partsToRender.push(part);
      }
    }
    const lastWordCount = element.contentUpdateTimings?.lastWordCount ?? 0;
    const newRenderedWordCount = data.numWordsToRender - numNeededWords;
    const bufferWords = lastWordCount - newRenderedWordCount;
    this.traceLayout("getNextProgressiveRenderContent", `Want to render ${data.numWordsToRender} words. Rendering ${newRenderedWordCount} words. Buffer: ${bufferWords} words`);
    if (newRenderedWordCount > 0 && newRenderedWordCount !== element.renderData?.renderedWordCount) {
      element.renderData = { lastRenderTime: Date.now(), renderedWordCount: newRenderedWordCount, renderedParts: partsToRender };
    }
    const workingProgress = this.shouldShowWorkingProgress(element, partsToRender, moreContentAvailable, templateData);
    if (workingProgress) {
      partsToRender.push(workingProgress);
    }
    const fileChangesSummaryPart = this.getChatFileChangesSummaryPart(element);
    if (fileChangesSummaryPart) {
      partsToRender.push(fileChangesSummaryPart);
    }
    const turnPillsPart = this.getChatTurnPillsPart(element);
    if (turnPillsPart) {
      partsToRender.push(turnPillsPart);
    }
    return { content: partsToRender, moreContentAvailable };
  }
  shouldShowFileChangesSummary(element) {
    const sessionType = getChatSessionType(element.sessionResource);
    const isLocalSession = sessionType === localChatSessionType || isAgentHostTarget(sessionType);
    return shouldShowFileChangesSummaryForSettings(
      element.isComplete,
      isLocalSession,
      this.configService.getValue("chat.checkpoints.showFileChanges")
    );
  }
  shouldShowPillsSummary(element) {
    return shouldShowPillsSummaryForSettings(
      element.isComplete,
      isAgentHostTarget(getChatSessionType(element.sessionResource)),
      this.configService.getValue("chat.turnStatusPills" /* TurnStatusPills */)
    );
  }
  getDataForProgressiveRender(element) {
    const hasMarkdownParts = element.response.value.some((part) => part.kind === "markdownContent" && part.content.value.trim().length > 0);
    if (shouldRenderInitialProgressiveContentImmediately(element.isComplete, hasMarkdownParts, element.renderData !== void 0)) {
      return {
        numWordsToRender: Number.MAX_SAFE_INTEGER,
        rate: Number.MAX_SAFE_INTEGER
      };
    }
    const renderData = element.renderData ?? { lastRenderTime: 0, renderedWordCount: 0 };
    const rate = this.getProgressiveRenderRate(element);
    const numWordsToRender = renderData.lastRenderTime === 0 ? 1 : renderData.renderedWordCount + // Additional words to render beyond what's already rendered
    Math.floor((Date.now() - renderData.lastRenderTime) / 1e3 * rate);
    return {
      numWordsToRender,
      rate
    };
  }
  diff(renderedParts, contentToRender, element) {
    const diff4 = [];
    for (let i2 = 0; i2 < contentToRender.length; i2++) {
      const content = contentToRender[i2];
      const renderedPart = renderedParts[i2];
      if (!renderedPart || !renderedPart.hasSameContent(content, contentToRender.slice(i2 + 1), element)) {
        diff4.push(content);
      } else {
        diff4.push(null);
      }
    }
    return diff4;
  }
  hasEditCodeblockUri(part) {
    if (part.kind !== "markdownContent") {
      return false;
    }
    return hasEditCodeblockUriTag(part.content.value);
  }
  isCodeblockComplete(part, element) {
    if (part.kind !== "markdownContent") {
      return true;
    }
    return !isResponseVM(element) || element.isComplete || codeblockHasClosingBackticks(part.content.value);
  }
  // todo @justschen initially split up each of the checks to easily see what should be pinned/not pinned, we can probably consolidate this down by a lot once we're more confident in the logic.
  shouldPinPart(part, element) {
    const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
    if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolSpecificData?.kind === "simpleToolInvocation" && part.toolSpecificData.presentationStyle === "opencode") {
      return false;
    }
    if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolId.startsWith("opencode_") && this.configService.getValue("opencode.chat.bridgeStyleUI") !== false) {
      return false;
    }
    if (part.kind === "thinking" || part.kind === "working") {
      return true;
    }
    if (part.kind === "undoStop") {
      return true;
    }
    if (part.kind === "hook") {
      if (part.subAgentInvocationId) {
        return false;
      }
      return part.hookType === "PreToolUse" /* PreToolUse */ || part.hookType === "PostToolUse" /* PostToolUse */;
    }
    if (collapsedToolsMode === "off" /* Off */) {
      return false;
    }
    if (this.hasEditCodeblockUri(part) || part.kind === "textEditGroup" || part.kind === "externalEdit") {
      return true;
    }
    const isMcpTool = (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && isMcpToolInvocation(part);
    if (isMcpTool) {
      return false;
    }
    const isMermaidTool = (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolId.toLowerCase().includes("mermaid");
    if (isMermaidTool) {
      return false;
    }
    const isAskQuestionsTool = (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && isAskQuestionsToolInvocation(part);
    if (isAskQuestionsTool) {
      return false;
    }
    if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && isSubagentToolInvocation(part)) {
      return false;
    }
    if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && (isCreateSessionTool(part.toolId) || isCreateChatTool(part.toolId) || isSendMessageTool(part.toolId))) {
      return false;
    }
    if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && (part.toolId === "image_gen.imagegen" || part.toolSpecificData?.kind === "generatedImage")) {
      return false;
    }
    const isTerminalTool = (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolSpecificData?.kind === "terminal";
    const isContributedTerminalToolInvocation = element && (element.sessionResource.scheme !== Schemas.vscodeChatInput && getChatSessionType(element.sessionResource) !== localChatSessionType) && part.kind === "toolInvocationSerialized" && part.toolSpecificData?.kind === "terminal";
    if (isTerminalTool && !isContributedTerminalToolInvocation) {
      if (part.kind === "toolInvocation" && IChatToolInvocation.getConfirmationMessages(part)) {
        return false;
      }
      const terminalToolsInThinking = this.configService.getValue("chat.agent.thinking.terminalTools" /* TerminalToolsInThinking */);
      return !!terminalToolsInThinking;
    }
    if (part.kind === "toolInvocation") {
      const state = part.state.get();
      return shouldPinToolInvocationToThinking(state.type, !!IChatToolInvocation.getConfirmationMessages(part), toolInvocationHasMcpAppData(part));
    }
    if (part.kind === "toolInvocationSerialized") {
      return !toolInvocationHasMcpAppData(part);
    }
    return false;
  }
  getLastThinkingPart(renderedParts) {
    if (!renderedParts || renderedParts.length === 0) {
      return void 0;
    }
    for (let i2 = renderedParts.length - 1; i2 >= 0; i2--) {
      const part = renderedParts[i2];
      if (part instanceof ChatThinkingContentPart && part.getIsActive()) {
        return part;
      }
    }
    return void 0;
  }
  getLastThinkingPartForGroupedItem(context2, templateData) {
    const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
    const displayMode = getEffectiveThinkingDisplayMode(this.configService, this.contextKeyService);
    if (lastThinking?.hasReasoningContent() && shouldStartNewCollapsedThinkingGroup(displayMode, "reasoning", "items")) {
      this.finalizeCurrentThinkingPart(context2, templateData);
      return { part: void 0, separatedFromReasoning: true };
    }
    return { part: lastThinking, separatedFromReasoning: false };
  }
  /**
   * Determines if a thinking part at the given content index is "look-ahead complete".
   * A thinking part is look-ahead complete if there are subsequent parts that will NOT
   * be pinned to it, meaning we know this thinking part is already done even though
   * the overall response is still in progress.
   */
  isThinkingLookAheadComplete(context2, element) {
    if (element?.isComplete) {
      return true;
    }
    for (let i2 = context2.contentIndex + 1; i2 < context2.content.length; i2++) {
      const nextPart = context2.content[i2];
      if (!this.shouldPinPart(nextPart, element)) {
        return true;
      }
    }
    return false;
  }
  getSubagentPart(renderedParts, subAgentInvocationId) {
    if (!renderedParts || renderedParts.length === 0) {
      return void 0;
    }
    for (let i2 = renderedParts.length - 1; i2 >= 0; i2--) {
      const part = renderedParts[i2];
      if (part instanceof ChatSubagentContentPart) {
        if (subAgentInvocationId && part.subAgentInvocationId === subAgentInvocationId) {
          return part;
        }
        if (!subAgentInvocationId && part.getIsActive()) {
          return part;
        }
      }
    }
    return void 0;
  }
  finalizeAllSubagentParts(templateData, force = false) {
    if (!templateData.renderedParts) {
      return;
    }
    for (const part of templateData.renderedParts) {
      if (part instanceof ChatSubagentContentPart && part.getIsActive() && (force || !part.shouldRemainActive()) && (force || !part.hasToolsWaitingForConfirmation)) {
        part.markAsInactive(force);
      }
    }
  }
  handleSubagentToolGrouping(toolInvocation, subagentId, context2, templateData, codeBlockStartIndex, batchedSubagentParts) {
    this.finalizeCurrentThinkingPart(context2, templateData);
    const lastSubagent = this.getSubagentPart(templateData.renderedParts, subagentId);
    if (lastSubagent) {
      this.beginSubagentToolPresentationBatch(lastSubagent, batchedSubagentParts);
      this.maybeRouteSubagentToolToCarousel(toolInvocation, lastSubagent, context2, templateData, codeBlockStartIndex);
      if (!isParentSubagentTool(toolInvocation)) {
        lastSubagent.appendToolInvocation(toolInvocation, codeBlockStartIndex);
        return this.renderNoContent((other) => (other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && other.toolCallId === toolInvocation.toolCallId);
      }
      return lastSubagent;
    }
    const subagentPart = this.instantiationService.createInstance(
      ChatSubagentContentPart,
      subagentId,
      toolInvocation,
      context2,
      this.chatContentMarkdownRenderer,
      this._contentReferencesListPool,
      this._toolEditorPool,
      () => this._currentLayoutWidth.get(),
      this._announcedToolProgressKeys
    );
    this.beginSubagentToolPresentationBatch(subagentPart, batchedSubagentParts);
    this.maybeRouteSubagentToolToCarousel(toolInvocation, subagentPart, context2, templateData, codeBlockStartIndex);
    if (!isParentSubagentTool(toolInvocation)) {
      subagentPart.appendToolInvocation(toolInvocation, codeBlockStartIndex);
    }
    return subagentPart;
  }
  beginSubagentToolPresentationBatch(subagentPart, batchedSubagentParts) {
    if (batchedSubagentParts && !batchedSubagentParts.has(subagentPart)) {
      batchedSubagentParts.add(subagentPart);
      subagentPart.beginToolPresentationBatch();
    }
  }
  /** Routes subagent confirmations to the input carousel and leaves a placeholder inline. */
  maybeRouteSubagentToolToCarousel(toolInvocation, subagentPart, context2, templateData, codeBlockStartIndex) {
    if (!this.configService.getValue("chat.tools.confirmationCarousel.enabled" /* ToolConfirmationCarousel */)) {
      return;
    }
    if (toolInvocation.kind !== "toolInvocation" || !isResponseVM(context2.element)) {
      return;
    }
    if (isParentSubagentTool(toolInvocation) || toolInvocation.presentation === "hidden" || toolInvocation.source.type === "mcp") {
      return;
    }
    if (!!this.viewModel?.editing) {
      return;
    }
    const widget = this.chatWidgetService.getWidgetBySessionResource(context2.element.sessionResource);
    if (!widget) {
      return;
    }
    const subAgentInvocationId = subagentPart.subAgentInvocationId;
    const subagentTitle = subagentPart.getSubagentTitle();
    const revealSubagent = (targetSubAgentId) => {
      const currentTemplateData = this.getTemplateDataForRequestId(context2.element.id);
      const currentSubagentPart = this.getSubagentPart(currentTemplateData?.renderedParts, targetSubAgentId) ?? subagentPart;
      const chatResource = currentSubagentPart.getChatResource();
      if (this.environmentService.isSessionsWindow && chatResource) {
        void this.commandService.executeCommand(CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID, { chatResource });
      } else {
        currentSubagentPart.domNode.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    const revealSubagentLabel = this.environmentService.isSessionsWindow ? localize(12400, null, subagentTitle) : void 0;
    const navigateToCarousel = (targetSubAgentId) => {
      widget.inputPart.activateCarouselForSubagent(targetSubAgentId);
    };
    const factory = (tool) => this.instantiationService.createInstance(
      ChatToolInvocationPart3,
      tool,
      context2,
      this.chatContentMarkdownRenderer,
      this._contentReferencesListPool,
      this._toolEditorPool,
      () => this._currentLayoutWidth.get(),
      this._announcedToolProgressKeys,
      codeBlockStartIndex
    );
    const addToolToCarousel = (tool) => {
      widget.inputPart.addToolToConfirmationCarousel(tool, factory, subAgentInvocationId, subagentTitle, revealSubagent, revealSubagentLabel);
      const listener = this.createUpdateWorkingProgressOnConfirmationEnd(tool, templateData);
      if (listener) {
        templateData.elementDisposables.add(listener);
      }
    };
    const shouldUseCarouselForTool = (tool, state) => this.configService.getValue("chat.tools.confirmationCarousel.enabled" /* ToolConfirmationCarousel */) && !this.viewModel?.editing && tool.presentation !== "hidden" && tool.source.type !== "mcp" && state.type === IChatToolInvocation.StateKind.WaitingForConfirmation && !!state.confirmationMessages?.title;
    subagentPart.enableCarouselMode(navigateToCarousel, addToolToCarousel, shouldUseCarouselForTool, widget.inputPart.onDidChangeActiveConfirmationSubagent);
    subagentPart.setConfirmationActive(widget.inputPart.activeConfirmationSubagentId === subAgentInvocationId);
    const toolState = toolInvocation.state.get();
    if (toolState.type === IChatToolInvocation.StateKind.WaitingForConfirmation && toolState.confirmationMessages?.title) {
      addToolToCarousel(toolInvocation);
    }
  }
  finalizeCurrentThinkingPart(context2, templateData) {
    const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
    if (!lastThinking) {
      return;
    }
    const style = getEffectiveThinkingDisplayMode(this.configService, this.contextKeyService);
    if (style === "collapsedPreview" /* CollapsedPreview */) {
      lastThinking.collapseContent();
    }
    lastThinking.finalizeTitleIfDefault();
    lastThinking.resetId();
    lastThinking.markAsInactive();
  }
  renderChatContentPart(content, templateData, context2, batchedSubagentParts) {
    try {
      if (content.kind === "thinking" && (Array.isArray(content.value) ? content.value.length === 0 : content.value === "")) {
        const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
        lastThinking?.resetId();
        return this.renderNoContent((other) => content.kind === other.kind);
      }
      const isResponseElement = isResponseVM(context2.element);
      const shouldPin = this.shouldPinPart(content, isResponseElement ? context2.element : void 0);
      if (context2.element.isComplete && !shouldPin) {
        const elementTemplateData = this.getTemplateDataForRequestId(context2.element.id);
        if (elementTemplateData?.renderedParts) {
          const lastThinking = this.getLastThinkingPart(elementTemplateData.renderedParts);
          if (lastThinking?.getIsActive()) {
            this.finalizeCurrentThinkingPart(context2, elementTemplateData);
          }
        }
      }
      const isSubagentContent = (content.kind === "toolInvocation" || content.kind === "toolInvocationSerialized") && isSubagentToolInvocation(content);
      if (context2.element.isComplete && !isSubagentContent) {
        const elementTemplateData = this.getTemplateDataForRequestId(context2.element.id);
        if (elementTemplateData) {
          this.finalizeAllSubagentParts(elementTemplateData);
        }
      }
      if (content.kind === "treeData") {
        return this.renderTreeData(content, templateData, context2);
      } else if (content.kind === "multiDiffData") {
        return this.renderMultiDiffData(content, templateData, context2);
      } else if (content.kind === "progressMessage") {
        return this.instantiationService.createInstance(ChatProgressContentPart, content, this.chatContentMarkdownRenderer, context2, void 0, void 0, void 0, void 0, content.shimmer);
      } else if (content.kind === "systemNotification") {
        return this.instantiationService.createInstance(ChatSystemNotificationContentPart, content, this.chatContentMarkdownRenderer);
      } else if (content.kind === "working") {
        return this.instantiationService.createInstance(ChatWorkingProgressContentPart, content, this.chatContentMarkdownRenderer, context2);
      } else if (content.kind === "progressTask" || content.kind === "progressTaskSerialized") {
        return this.renderProgressTask(content, templateData, context2);
      } else if (content.kind === "command") {
        return this.instantiationService.createInstance(ChatCommandButtonContentPart, content, context2);
      } else if (content.kind === "textEditGroup") {
        return this.renderTextEdit(context2, content, templateData);
      } else if (content.kind === "confirmation") {
        return this.renderConfirmation(context2, content, templateData);
      } else if (content.kind === "warning") {
        return this.instantiationService.createInstance(ChatErrorContentPart, 1 /* Warning */, content.content, content, this.chatContentMarkdownRenderer);
      } else if (content.kind === "info") {
        return this.instantiationService.createInstance(ChatErrorContentPart, 0 /* Info */, content.content, content, this.chatContentMarkdownRenderer);
      } else if (content.kind === "hook") {
        return this.renderHookPart(content, context2, templateData, batchedSubagentParts);
      } else if (content.kind === "markdownContent") {
        return this.renderMarkdown(content, templateData, context2);
      } else if (content.kind === "references") {
        if (isResponseVM(context2.element) && context2.element.agent?.isDefault && !context2.element.agent.modes.includes("ask" /* Ask */)) {
          return this.renderNoContent((other) => other.kind === content.kind);
        }
        return this.renderContentReferencesListData(content, void 0, context2, templateData);
      } else if (content.kind === "codeCitations") {
        return this.renderCodeCitations(content, context2, templateData);
      } else if (content.kind === "toolInvocation" || content.kind === "toolInvocationSerialized") {
        return this.renderToolInvocation(content, context2, templateData, batchedSubagentParts);
      } else if (content.kind === "extensions") {
        return this.renderExtensionsContent(content, context2, templateData);
      } else if (content.kind === "pullRequest") {
        return this.renderPullRequestContent(content, context2, templateData);
      } else if (content.kind === "undoStop") {
        return this.renderUndoStop(content);
      } else if (content.kind === "errorDetails") {
        return this.renderChatErrorDetails(context2, content, templateData);
      } else if (content.kind === "elicitation2" || content.kind === "elicitationSerialized") {
        return this.renderElicitation(context2, content, templateData);
      } else if (content.kind === "questionCarousel") {
        return this.renderQuestionCarousel(context2, content, templateData);
      } else if (content.kind === "planReview") {
        return this.renderPlanReview(context2, content, templateData);
      } else if (content.kind === "changesSummary") {
        return this.renderChangesSummary(content, context2, templateData);
      } else if (content.kind === "turnPills") {
        return this.renderTurnPills(content, context2);
      } else if (content.kind === "mcpServersStarting") {
        return this.renderMcpServersInteractionRequired(content, context2, templateData);
      } else if (content.kind === "mcpAuthenticationRequired") {
        return this.instantiationService.createInstance(ChatMcpAuthenticationContentPart, content);
      } else if (content.kind === "mcpServersStartingSlow") {
        return this.instantiationService.createInstance(ChatMcpServersStartingContentPart, content, {
          onDidFinishStarting: () => this.showWorkingProgressAfterMcp(context2, templateData)
        });
      } else if (content.kind === "disabledClaudeHooks") {
        return this.renderDisabledClaudeHooks(content, context2);
      } else if (content.kind === "thinking") {
        return this.renderThinkingPart(content, context2, templateData);
      } else if (content.kind === "workspaceEdit") {
        return this.instantiationService.createInstance(ChatWorkspaceEditContentPart, content, context2, this.chatContentMarkdownRenderer);
      } else if (content.kind === "externalEdit") {
        return this.renderExternalEdit(content, context2, templateData);
      } else if (content.kind === "autoModeResolution") {
        if (!content.resolved && context2.element.isComplete) {
          return this.renderNoContent((other) => other.kind === content.kind && !other.resolved);
        }
        return this.instantiationService.createInstance(ChatAutoModeResolutionContentPart, content, context2);
      }
      return this.renderNoContent((other) => content.kind === other.kind);
    } catch (err) {
      alert(`Chat error: ${toErrorMessage(err, false)}`);
      this.logService.error("ChatListItemRenderer#renderChatContentPart: error rendering content", toErrorMessage(err, true));
      const errorPart = this.instantiationService.createInstance(ChatErrorContentPart, 2 /* Error */, new MarkdownString(localize(12403, null) + `: ${toErrorMessage(err, false)}`), content, this.chatContentMarkdownRenderer);
      return {
        dispose: () => errorPart.dispose(),
        domNode: errorPart.domNode,
        hasSameContent: ((other) => content.kind === other.kind)
      };
    }
  }
  showWorkingProgressAfterMcp(context2, templateData) {
    const originalElement = context2.element;
    const originalRenderedParts = templateData.renderedParts;
    queueMicrotask(() => {
      if (!isResponseVM(originalElement) || templateData.currentElement !== originalElement || originalElement.isComplete || originalElement.isCanceled) {
        return;
      }
      if (!originalRenderedParts || templateData.renderedParts !== originalRenderedParts || originalRenderedParts.some((part) => part instanceof ChatWorkingProgressContentPart)) {
        return;
      }
      this.renderChatResponseBasic(originalElement, context2.elementIndex, templateData);
      this.fireItemHeightChange(templateData);
    });
  }
  dispose() {
    this._announcedToolProgressKeys.clear();
    super.dispose();
  }
  renderChatErrorDetails(context2, content, templateData) {
    if (!isResponseVM(context2.element)) {
      return this.renderNoContent((other) => content.kind === other.kind);
    }
    const isLast = content.isLast;
    if (content.errorDetails.isQuotaExceeded) {
      const renderedError = this.instantiationService.createInstance(ChatQuotaExceededPart, context2.element, content, this.chatContentMarkdownRenderer);
      return renderedError;
    } else if (content.errorDetails.isRateLimited && this.chatEntitlementService.anonymous) {
      const renderedError = this.instantiationService.createInstance(ChatAnonymousRateLimitedPart, content);
      return renderedError;
    } else if (content.errorDetails.confirmationButtons && isLast) {
      const level = content.errorDetails.level ?? 2 /* Error */;
      const errorConfirmation = this.instantiationService.createInstance(ChatErrorConfirmationContentPart, level, new MarkdownString(content.errorDetails.message), content, content.errorDetails.confirmationButtons, this.chatContentMarkdownRenderer, context2);
      return errorConfirmation;
    } else {
      const level = content.errorDetails.level ?? 2 /* Error */;
      return this.instantiationService.createInstance(ChatErrorContentPart, level, new MarkdownString(content.errorDetails.message), content, this.chatContentMarkdownRenderer);
    }
  }
  renderUndoStop(content) {
    return this.renderNoContent((other) => other.kind === content.kind && other.id === content.id);
  }
  renderNoContent(equals5) {
    return {
      dispose: () => {
      },
      domNode: void 0,
      hasSameContent: equals5
    };
  }
  renderTreeData(content, templateData, context2) {
    const data = content.treeData;
    const treePart = this.instantiationService.createInstance(ChatTreeContentPart, data, this._treePool);
    if (isResponseVM(context2.element)) {
      const fileTreeFocusInfo = {
        treeDataId: data.uri.toString(),
        treeIndex: context2.treeStartIndex,
        focus() {
          treePart.domFocus();
        }
      };
      treePart.addDisposable(treePart.onDidFocus(() => {
        this.focusedFileTreesByResponseId.set(context2.element.id, fileTreeFocusInfo.treeIndex);
      }));
      const fileTrees = this.fileTreesByResponseId.get(context2.element.id) ?? [];
      fileTrees.push(fileTreeFocusInfo);
      this.fileTreesByResponseId.set(context2.element.id, distinct(fileTrees, (v2) => v2.treeDataId));
      treePart.addDisposable(toDisposable(() => this.fileTreesByResponseId.set(context2.element.id, fileTrees.filter((v2) => v2.treeDataId !== data.uri.toString()))));
    }
    return treePart;
  }
  renderMultiDiffData(content, templateData, context2) {
    const multiDiffPart = this.instantiationService.createInstance(ChatMultiDiffContentPart, content, context2.element);
    return multiDiffPart;
  }
  renderContentReferencesListData(references, labelOverride, context2, templateData) {
    const referencesPart = this.instantiationService.createInstance(ChatUsedReferencesListContentPart, references.references, labelOverride, context2, this._contentReferencesListPool, { expandedWhenEmptyResponse: checkModeOption(this.delegate.currentChatMode(), this.rendererOptions.referencesExpandedWhenEmptyResponse) });
    return referencesPart;
  }
  renderCodeCitations(citations, context2, templateData) {
    const citationsPart = this.instantiationService.createInstance(ChatCodeCitationContentPart, citations, context2);
    return citationsPart;
  }
  handleRenderedCodeblocks(element, part, codeBlockStartIndex) {
    if (!part.addDisposable || part.codeblocksPartId === void 0) {
      return;
    }
    const codeBlocksByResponseId = this.codeBlocksByResponseId.get(element.id) ?? [];
    this.codeBlocksByResponseId.set(element.id, codeBlocksByResponseId);
    part.addDisposable(toDisposable(() => {
      const codeBlocksByResponseId2 = this.codeBlocksByResponseId.get(element.id);
      if (codeBlocksByResponseId2) {
        part.codeblocks?.forEach((info, i2) => {
          const codeblock = codeBlocksByResponseId2[codeBlockStartIndex + i2];
          if (codeblock?.ownerMarkdownPartId === part.codeblocksPartId) {
            delete codeBlocksByResponseId2[codeBlockStartIndex + i2];
          }
        });
      }
    }));
    part.codeblocks?.forEach((info, i2) => {
      codeBlocksByResponseId[codeBlockStartIndex + i2] = info;
      const uri4 = info.uri;
      if (uri4) {
        this.codeBlocksByEditorUri.set(uri4, info);
        part.addDisposable(toDisposable(() => {
          const codeblock = this.codeBlocksByEditorUri.get(uri4);
          if (codeblock?.ownerMarkdownPartId === part.codeblocksPartId) {
            this.codeBlocksByEditorUri.delete(uri4);
          }
        }));
      }
    });
  }
  renderToolInvocation(toolInvocation, context2, templateData, batchedSubagentParts) {
    if (IChatToolInvocation.isComplete(toolInvocation) && IChatToolInvocation.isEffectivelyHidden(toolInvocation)) {
      const msg = toolInvocation.pastTenseMessage ?? toolInvocation.invocationMessage;
      const text2 = typeof msg === "string" ? msg : msg?.value;
      if (!text2 || text2.trim().length === 0) {
        return this.renderNoContent((other) => (other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && other.toolCallId === toolInvocation.toolCallId);
      }
    }
    if (context2.element.isComplete && toolInvocation.toolSpecificData?.kind === "generatedImage" && !isGeneratedImageResultOwner(toolInvocation, context2.content)) {
      return this.renderNoContent((other) => (other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && other.toolCallId === toolInvocation.toolCallId);
    }
    if (this.configService.getValue("chat.agent.thinking.collapsedTools") === "off" /* Off */) {
      this.finalizeCurrentThinkingPart(context2, templateData);
    }
    const codeBlockStartIndex = context2.codeBlockStartIndex;
    let lazilyCreatedPart = void 0;
    const createToolPart = () => {
      lazilyCreatedPart = this.instantiationService.createInstance(ChatToolInvocationPart3, toolInvocation, context2, this.chatContentMarkdownRenderer, this._contentReferencesListPool, this._toolEditorPool, () => this._currentLayoutWidth.get(), this._announcedToolProgressKeys, codeBlockStartIndex);
      lazilyCreatedPart.addDisposable(lazilyCreatedPart.onDidChangeHeight(() => this.fireItemHeightChange(templateData)));
      this.handleRenderedCodeblocks(context2.element, lazilyCreatedPart, codeBlockStartIndex);
      return { domNode: lazilyCreatedPart.domNode, disposable: lazilyCreatedPart, part: lazilyCreatedPart };
    };
    const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
    if (isResponseVM(context2.element) && collapsedToolsMode !== "off" /* Off */) {
      const { part: lastThinking, separatedFromReasoning } = this.getLastThinkingPartForGroupedItem(context2, templateData);
      if (!lastThinking && !IChatToolInvocation.isEffectivelyHidden(toolInvocation) && this.shouldPinPart(toolInvocation, context2.element) && shouldCreateGroupedThinkingPart(collapsedToolsMode, separatedFromReasoning)) {
        const thinkingPart = this.renderThinkingPart({
          kind: "thinking"
        }, context2, templateData);
        if (thinkingPart instanceof ChatThinkingContentPart) {
          toolInvocation.isAttachedToThinking = true;
          thinkingPart.appendItem(createToolPart, toolInvocation.toolId, toolInvocation, templateData.value);
          this.setupConfirmationTransitionWatcher(toolInvocation, thinkingPart, () => lazilyCreatedPart, createToolPart, context2, templateData);
        }
        return thinkingPart;
      }
      if (this.shouldPinPart(toolInvocation, context2.element)) {
        if (lastThinking && !IChatToolInvocation.isEffectivelyHidden(toolInvocation)) {
          toolInvocation.isAttachedToThinking = true;
          lastThinking.appendItem(createToolPart, toolInvocation.toolId, toolInvocation, templateData.value);
          this.setupConfirmationTransitionWatcher(toolInvocation, lastThinking, () => lazilyCreatedPart, createToolPart, context2, templateData);
          return this.renderNoContent((other, followingContent, element) => lazilyCreatedPart ? lazilyCreatedPart.hasSameContent(other, followingContent, element) : toolInvocation.kind === other.kind);
        }
      } else {
        this.finalizeCurrentThinkingPart(context2, templateData);
      }
    }
    const subagentId = getSubagentId(toolInvocation);
    if (subagentId && isResponseVM(context2.element) && !IChatToolInvocation.isEffectivelyHidden(toolInvocation)) {
      return this.handleSubagentToolGrouping(toolInvocation, subagentId, context2, templateData, codeBlockStartIndex, batchedSubagentParts);
    }
    const { part } = createToolPart();
    if (this.configService.getValue("chat.tools.confirmationCarousel.enabled" /* ToolConfirmationCarousel */) && toolInvocation.kind === "toolInvocation" && isResponseVM(context2.element) && toolInvocation.source.type !== "mcp" && !this.viewModel?.editing) {
      const widget = this.chatWidgetService.getWidgetBySessionResource(context2.element.sessionResource);
      if (widget) {
        const factory = (tool) => this.instantiationService.createInstance(
          ChatToolInvocationPart3,
          tool,
          context2,
          this.chatContentMarkdownRenderer,
          this._contentReferencesListPool,
          this._toolEditorPool,
          () => this._currentLayoutWidth.get(),
          this._announcedToolProgressKeys,
          codeBlockStartIndex
        );
        const routePartToCarousel = () => {
          widget.inputPart.addToolToConfirmationCarousel(toolInvocation, factory);
          hide(part.domNode);
          return true;
        };
        let hasScheduledCarouselRoute = false;
        const scheduleRoutePartToCarousel = () => {
          if (hasScheduledCarouselRoute) {
            return;
          }
          hasScheduledCarouselRoute = true;
          part.addDisposable(scheduleAtNextAnimationFrame(getWindow(part.domNode), () => {
            hasScheduledCarouselRoute = false;
            const state = toolInvocation.state.get();
            if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation && state.confirmationMessages?.title && toolInvocation.presentation !== "hidden" && toolInvocation.source.type !== "mcp" && !this.viewModel?.editing) {
              routePartToCarousel();
            }
          }));
        };
        part.addDisposable(autorun((reader) => {
          const state = toolInvocation.state.read(reader);
          const isCarouselConfirmation = state.type === IChatToolInvocation.StateKind.WaitingForConfirmation && !!state.confirmationMessages?.title && toolInvocation.presentation !== "hidden" && toolInvocation.source.type !== "mcp" && !this.viewModel?.editing;
          if (isCarouselConfirmation) {
            if (!routePartToCarousel()) {
              hide(part.domNode);
              scheduleRoutePartToCarousel();
            }
          } else if (IChatToolInvocation.isEffectivelyHidden(toolInvocation, reader)) {
            this.updateWorkingProgressForPendingConfirmations(templateData);
            hide(part.domNode);
          } else {
            this.updateWorkingProgressForPendingConfirmations(templateData);
            show(part.domNode);
          }
        }));
      }
    }
    return part;
  }
  // watch for confirmation part transition when tool invocation is streaming
  setupConfirmationTransitionWatcher(toolInvocation, thinkingPart, getCreatedPart, createToolPart, context2, templateData) {
    if (toolInvocation.kind !== "toolInvocation") {
      return;
    }
    const moveConfirmationWidgetOutOfThinking = () => {
      const createdPart = getCreatedPart();
      toolInvocation.isAttachedToThinking = false;
      let part;
      if (createdPart?.domNode) {
        part = createdPart;
        const wrapper = createdPart.domNode.parentElement;
        if (wrapper?.classList.contains("chat-thinking-tool-wrapper")) {
          wrapper.remove();
        }
        templateData.value.appendChild(createdPart.domNode);
        thinkingPart.removeMaterializedItem(toolInvocation.toolCallId);
        (templateData.movedOutToolParts ??= new DisposableMap()).set(toolInvocation.toolCallId, createdPart);
      } else {
        thinkingPart.removeLazyItem(toolInvocation.toolId);
        const { domNode, part: createdPart2 } = createToolPart();
        part = createdPart2;
        (templateData.movedOutToolParts ??= new DisposableMap()).set(toolInvocation.toolCallId, createdPart2);
        templateData.value.appendChild(domNode);
      }
      this.finalizeCurrentThinkingPart(context2, templateData);
      if (thinkingPart.isEffectivelyEmpty()) {
        thinkingPart.domNode?.remove();
        thinkingPart.dispose();
      }
      return part;
    };
    const isWorkingState = (type) => type === IChatToolInvocation.StateKind.Streaming || type === IChatToolInvocation.StateKind.Executing;
    const tryRouteConfirmationToCarousel = () => {
      if (!this.configService.getValue("chat.tools.confirmationCarousel.enabled" /* ToolConfirmationCarousel */) || !isResponseVM(context2.element) || this.viewModel?.editing || toolInvocation.presentation === "hidden" || toolInvocation.source.type === "mcp") {
        return false;
      }
      const state = toolInvocation.state.get();
      if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation || !state.confirmationMessages?.title) {
        return false;
      }
      const widget = this.chatWidgetService.getWidgetBySessionResource(context2.element.sessionResource);
      if (!widget) {
        return false;
      }
      const part = moveConfirmationWidgetOutOfThinking();
      const factory = (tool) => this.instantiationService.createInstance(
        ChatToolInvocationPart3,
        tool,
        context2,
        this.chatContentMarkdownRenderer,
        this._contentReferencesListPool,
        this._toolEditorPool,
        () => this._currentLayoutWidth.get(),
        this._announcedToolProgressKeys,
        context2.codeBlockStartIndex
      );
      part.addDisposable(autorun((reader) => {
        const currentState2 = toolInvocation.state.read(reader);
        if (currentState2.type === IChatToolInvocation.StateKind.WaitingForConfirmation && currentState2.confirmationMessages?.title) {
          widget.inputPart.addToolToConfirmationCarousel(toolInvocation, factory);
          hide(part.domNode);
        } else if (IChatToolInvocation.isEffectivelyHidden(toolInvocation, reader)) {
          this.updateWorkingProgressForPendingConfirmations(templateData);
          hide(part.domNode);
        } else {
          this.updateWorkingProgressForPendingConfirmations(templateData);
          show(part.domNode);
        }
      }));
      return true;
    };
    const currentState = toolInvocation.state.get();
    if (toolInvocationHasMcpAppData(toolInvocation)) {
      moveConfirmationWidgetOutOfThinking();
      return;
    }
    if (currentState.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
      if (!tryRouteConfirmationToCarousel()) {
        moveConfirmationWidgetOutOfThinking();
      }
      return;
    }
    if (currentState.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
      moveConfirmationWidgetOutOfThinking();
      return;
    }
    if (!isWorkingState(currentState.type)) {
      return;
    }
    let didMoveToolOut = false;
    const disposable = autorun((reader) => {
      const state = toolInvocation.state.read(reader);
      toolInvocation.toolSpecificDataKind.read(reader);
      if (toolInvocationHasMcpAppData(toolInvocation)) {
        if (didMoveToolOut) {
          return;
        }
        didMoveToolOut = true;
        disposable.dispose();
        moveConfirmationWidgetOutOfThinking();
        return;
      }
      if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
        if (didMoveToolOut) {
          return;
        }
        didMoveToolOut = true;
        disposable.dispose();
        if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation || !tryRouteConfirmationToCarousel()) {
          moveConfirmationWidgetOutOfThinking();
        }
      }
    });
    thinkingPart.addDisposable(disposable);
  }
  renderExtensionsContent(extensionsContent, context2, templateData) {
    const part = this.instantiationService.createInstance(ChatExtensionsContentPart, extensionsContent);
    return part;
  }
  renderHookPart(hookPart, context2, templateData, batchedSubagentParts) {
    if (!(hookPart.stopReason || hookPart.systemMessage)) {
      return this.renderNoContent((other) => other.kind === "hook" && other.hookType === hookPart.hookType);
    }
    if (hookPart.subAgentInvocationId) {
      const subagentPart = this.getSubagentPart(templateData.renderedParts, hookPart.subAgentInvocationId);
      if (subagentPart) {
        this.beginSubagentToolPresentationBatch(subagentPart, batchedSubagentParts);
        subagentPart.appendHookItem(() => {
          const part2 = this.instantiationService.createInstance(ChatHookContentPart, hookPart, context2);
          return { domNode: part2.domNode, disposable: part2 };
        }, hookPart);
        return this.renderNoContent((other) => other.kind === "hook" && other.hookType === hookPart.hookType && other.subAgentInvocationId === hookPart.subAgentInvocationId);
      }
    }
    const shouldPinToThinking = hookPart.hookType === "PreToolUse" /* PreToolUse */ || hookPart.hookType === "PostToolUse" /* PostToolUse */;
    if (shouldPinToThinking) {
      const hookTitle = hookPart.stopReason ? hookPart.toolDisplayName ? localize(12396, null, hookPart.toolDisplayName) : localize(12397, null) : hookPart.toolDisplayName ? localize(12398, null, hookPart.toolDisplayName) : localize(12399, null);
      let { part: thinkingPart } = this.getLastThinkingPartForGroupedItem(context2, templateData);
      if (!thinkingPart) {
        const newThinking = this.renderThinkingPart({ kind: "thinking" }, context2, templateData);
        if (newThinking instanceof ChatThinkingContentPart) {
          thinkingPart = newThinking;
        }
      }
      if (thinkingPart) {
        thinkingPart.appendItem(() => {
          const part2 = this.instantiationService.createInstance(ChatHookContentPart, hookPart, context2);
          return { domNode: part2.domNode, disposable: part2 };
        }, hookTitle, void 0, templateData.value);
        return thinkingPart;
      }
    }
    const part = this.instantiationService.createInstance(ChatHookContentPart, hookPart, context2);
    return part;
  }
  renderPullRequestContent(pullRequestContent, context2, templateData) {
    const part = this.instantiationService.createInstance(ChatPullRequestContentPart, pullRequestContent);
    return part;
  }
  renderProgressTask(task, templateData, context2) {
    if (!isResponseVM(context2.element)) {
      return;
    }
    this.finalizeCurrentThinkingPart(context2, templateData);
    const taskPart = this.instantiationService.createInstance(ChatTaskContentPart, task, this._contentReferencesListPool, this.chatContentMarkdownRenderer, context2);
    return taskPart;
  }
  renderConfirmation(context2, confirmation, templateData) {
    const part = this.instantiationService.createInstance(ChatConfirmationContentPart, confirmation, context2);
    return part;
  }
  renderElicitation(context2, elicitation, templateData) {
    if (elicitation.kind === "elicitationSerialized" ? elicitation.isHidden : elicitation.isHidden?.get()) {
      return this.renderNoContent((other) => elicitation.kind === other.kind);
    }
    this.finalizeCurrentThinkingPart(context2, templateData);
    const part = this.instantiationService.createInstance(ChatElicitationContentPart, elicitation, context2);
    return part;
  }
  renderQuestionCarousel(context2, carousel, templateData) {
    this.finalizeCurrentThinkingPart(context2, templateData);
    this._notifyOnQuestionCarousel(context2, carousel);
    if (!carousel.terminalId && isResponseVM(context2.element)) {
      const responseElement = context2.element;
      const model = this.chatService.getSession(responseElement.sessionResource);
      const request2 = model?.getRequests().find((r2) => r2.id === responseElement.requestId);
      if (request2?.terminalExecutionId) {
        carousel.terminalId = request2.terminalExecutionId;
        this.logService.trace(`ChatListItemRenderer#renderQuestionCarousel: backfilled terminalId=${carousel.terminalId} for request=${responseElement.requestId}`);
      } else {
        this.logService.trace(`ChatListItemRenderer#renderQuestionCarousel: no terminalExecutionId to backfill for request=${responseElement.requestId}`);
      }
    }
    const widget = isResponseVM(context2.element) ? this.chatWidgetService.getWidgetBySessionResource(context2.element.sessionResource) : void 0;
    const shouldAutoFocus = !!widget && isAncestorOfActiveElement(widget.domNode) && widget.getInput() === "";
    const responseId = isResponseVM(context2.element) ? context2.element.requestId : void 0;
    const carouselKey = carousel.resolveId ?? `${responseId ?? ""}_${context2.contentIndex}`;
    const handleSubmit = async (answers, part2) => {
      if (carousel.isUsed) {
        return;
      }
      const answersRecord = answers ? Object.fromEntries(answers) : void 0;
      carousel.data = answersRecord ?? {};
      carousel.isUsed = true;
      if (carousel instanceof ChatQuestionCarouselData) {
        carousel.draftAnswers = void 0;
        carousel.draftCurrentIndex = void 0;
        carousel.completion.complete({ answers: answersRecord });
      }
      if (isResponseVM(context2.element) && carousel.resolveId) {
        this.chatService.notifyQuestionCarouselAnswer(context2.element.requestId, carousel.resolveId, answersRecord);
      }
      this.removeCarouselFromTracking(context2, part2);
      widget?.input.clearQuestionCarousel(void 0, carouselKey);
    };
    const responseIsComplete = isResponseVM(context2.element) && context2.element.isComplete;
    const inputPartHasCarousel = widget?.input.questionCarousel !== void 0;
    if (carousel.isUsed || responseIsComplete) {
      if (responseIsComplete && !carousel.isUsed && isResponseVM(context2.element) && carousel.resolveId) {
        carousel.data = {};
        carousel.isUsed = true;
        if (carousel instanceof ChatQuestionCarouselData) {
          carousel.draftAnswers = void 0;
          carousel.draftCurrentIndex = void 0;
          carousel.completion.complete({ answers: void 0 });
        }
        this.chatService.notifyQuestionCarouselAnswer(context2.element.requestId, carousel.resolveId, void 0);
        this.pendingQuestionCarousels.get(context2.element.sessionResource)?.clear();
      }
      if (inputPartHasCarousel) {
        if (carousel.isUsed) {
          widget?.input.clearQuestionCarousel(void 0, carouselKey);
        } else if (responseIsComplete && responseId) {
          widget?.input.clearQuestionCarousel(responseId);
        }
      }
      const part2 = this.instantiationService.createInstance(ChatQuestionCarouselPart, carousel, context2, {
        shouldAutoFocus: false,
        onSubmit: async (answers) => handleSubmit(answers, part2)
      });
      return part2;
    }
    const isEditing = !!this.viewModel?.editing;
    const part = isEditing ? void 0 : widget?.input.renderQuestionCarousel(carousel, context2, {
      shouldAutoFocus,
      onSubmit: async (answers) => handleSubmit(answers, part)
    });
    if (!part) {
      const fallbackPart = this.instantiationService.createInstance(ChatQuestionCarouselPart, carousel, context2, {
        shouldAutoFocus,
        onSubmit: async (answers) => handleSubmit(answers, fallbackPart)
      });
      return fallbackPart;
    }
    if (isResponseVM(context2.element) && carousel.allowSkip && !carousel.isUsed) {
      let carousels = this.pendingQuestionCarousels.get(context2.element.sessionResource);
      if (!carousels) {
        carousels = /* @__PURE__ */ new Set();
        this.pendingQuestionCarousels.set(context2.element.sessionResource, carousels);
      }
      if (!carousels.has(part)) {
        carousels.add(part);
        part.addDisposable({ dispose: () => this.removeCarouselFromTracking(context2, part) });
      }
    }
    return this.renderNoContent((other, _followingContent, element) => {
      if (carousel.isUsed || isResponseVM(element) && element.isComplete) {
        return false;
      }
      if (other.kind === "questionCarousel") {
        const otherCarousel = other;
        if (carousel.resolveId && otherCarousel.resolveId) {
          return carousel.resolveId === otherCarousel.resolveId;
        }
        return other === carousel;
      }
      return false;
    });
  }
  _getCarouselStableKey(context2, carousel) {
    const requestId = isResponseVM(context2.element) ? context2.element.requestId : void 0;
    if (!requestId || !carousel.resolveId) {
      return void 0;
    }
    return `${requestId}::${carousel.resolveId}`;
  }
  _notifyOnQuestionCarousel(context2, carousel) {
    if (carousel.isUsed) {
      return;
    }
    const stableKey = this._getCarouselStableKey(context2, carousel);
    if (stableKey ? this._notifiedQuestionCarousels.has(stableKey) : false) {
      return;
    }
    const questionCount = carousel.questions.length;
    const question = carousel.questions.length > 0 && carousel.questions[0].message ? carousel.questions[0].message : localize(12372, null);
    const stringQuestion = typeof question === "string" ? question : question.value;
    const alertMessage = questionCount === 1 ? localize(12371, null, stringQuestion) : localize(12370, null, questionCount, stringQuestion);
    this.accessibilityService.alert(alertMessage);
    if (stableKey) {
      this._notifiedQuestionCarousels.add(stableKey);
    }
    const signalMessage = questionCount === 1 ? localize(12374, null) : localize(12373, null, questionCount);
    this.accessibilitySignalService.playSignal(AccessibilitySignal.chatUserActionRequired, { allowManyInParallel: true, customAlertMessage: signalMessage });
  }
  renderPlanReview(context2, review, templateData) {
    const widget = isResponseVM(context2.element) ? this.chatWidgetService.getWidgetBySessionResource(context2.element.sessionResource) : void 0;
    const responseId = isResponseVM(context2.element) ? context2.element.requestId : void 0;
    const reviewKey = review.resolveId ?? `${responseId ?? ""}_${context2.contentIndex}`;
    this.finalizeCurrentThinkingPart(context2, templateData);
    const handleSubmit = (result) => {
      review.data = result;
      review.isUsed = true;
      if (review instanceof ChatPlanReviewData) {
        review.completion.complete(result);
      }
      widget?.input.clearPlanReview(void 0, reviewKey);
    };
    const responseIsComplete = isResponseVM(context2.element) && context2.element.isComplete;
    if (responseIsComplete && !review.isUsed) {
      review.isUsed = true;
      if (review instanceof ChatPlanReviewData) {
        review.completion.complete(void 0);
      }
    }
    if (responseIsComplete && responseId) {
      widget?.input.clearPlanReview(responseId);
    }
    const renderProgress = () => {
      const message = this.getPlanReviewProgressMessage(review);
      if (!message) {
        return this.renderNoContent((other) => other.kind === "planReview");
      }
      const renderedAsUsed = !!review.isUsed;
      const isPending = !renderedAsUsed;
      const content = buildPlanReviewProgressContent(review, message);
      const progressPart = this.instantiationService.createInstance(
        ChatProgressContentPart,
        { content },
        this.chatContentMarkdownRenderer,
        context2,
        /* forceShowSpinner */
        isPending,
        /* forceShowMessage */
        true,
        /* icon */
        isPending ? void 0 : Codicon.check,
        void 0,
        /* shimmer */
        isPending
      );
      return {
        domNode: progressPart.domNode,
        dispose: () => progressPart.dispose(),
        hasSameContent: (other, _followingContent, _element) => {
          if (other.kind !== "planReview") {
            return false;
          }
          if (!!review.isUsed !== renderedAsUsed) {
            return false;
          }
          if (review.resolveId && other.resolveId) {
            return review.resolveId === other.resolveId;
          }
          return other === review;
        }
      };
    };
    if (review.isUsed) {
      return renderProgress();
    }
    const isEditing = !!this.viewModel?.editing;
    const dockedPart = isEditing ? void 0 : widget?.input.renderPlanReview(review, context2, {
      onSubmit: handleSubmit
    });
    if (!dockedPart) {
      const fallbackPart = this.instantiationService.createInstance(ChatPlanReviewPart, review, context2, {
        onSubmit: handleSubmit
      });
      return fallbackPart;
    }
    return renderProgress();
  }
  getPlanReviewProgressMessage(review) {
    if (!review.isUsed) {
      return localize(12369, null);
    }
    const result = review.data;
    if (!result) {
      return void 0;
    }
    if (result.rejected) {
      return localize(12368, null);
    }
    if (result.feedback) {
      return localize(12365, null);
    }
    return localize(12363, null);
  }
  removeCarouselFromTracking(context2, part) {
    if (isResponseVM(context2.element)) {
      const carousels = this.pendingQuestionCarousels.get(context2.element.sessionResource);
      if (carousels) {
        carousels.delete(part);
      }
    }
  }
  renderChangesSummary(content, context2, templateData) {
    const part = this.instantiationService.createInstance(ChatCheckpointFileChangesSummaryContentPart, content, context2);
    return part;
  }
  renderTurnPills(content, context2) {
    return this.instantiationService.createInstance(ChatTurnPillsContentPart, content, context2);
  }
  renderAttachments(variables, contentReferences, modelId, templateData, resolvedModelId) {
    return this.instantiationService.createInstance(ChatAttachmentsContentPart, {
      variables,
      contentReferences,
      modelId,
      resolvedModelId,
      domNode: void 0
    });
  }
  renderTextEdit(context2, chatTextEdit, templateData) {
    const textEditPart = this.instantiationService.createInstance(ChatTextEditContentPart, chatTextEdit, context2, this.rendererOptions, this._diffEditorPool, this._currentLayoutWidth.get());
    return textEditPart;
  }
  renderExternalEdit(content, context2, templateData) {
    const editPart = this.instantiationService.createInstance(ChatExternalEditContentPart, content, context2);
    const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
    if (isResponseVM(context2.element) && collapsedToolsMode !== "off" /* Off */ && this.shouldPinPart(content, context2.element)) {
      const partId = `externalEdit-${content.uri.toString()}-${content.undoStopId ?? ""}`;
      const { part: lastThinking, separatedFromReasoning } = this.getLastThinkingPartForGroupedItem(context2, templateData);
      if (!lastThinking && shouldCreateGroupedThinkingPart(collapsedToolsMode, separatedFromReasoning)) {
        const thinkingPart = this.renderThinkingPart({ kind: "thinking" }, context2, templateData);
        if (thinkingPart instanceof ChatThinkingContentPart) {
          thinkingPart.appendItem(
            () => ({ domNode: editPart.domNode, disposable: editPart }),
            partId,
            content,
            templateData.value,
            editPart.onDidChangeDiff,
            editPart
          );
        }
        return thinkingPart;
      }
      if (lastThinking) {
        lastThinking.appendItem(
          () => ({ domNode: editPart.domNode, disposable: editPart }),
          partId,
          content,
          templateData.value,
          editPart.onDidChangeDiff,
          editPart
        );
        return this.renderNoContent((other) => other.kind === content.kind);
      }
    }
    return editPart;
  }
  renderMarkdown(markdown, templateData, context2) {
    const element = context2.element;
    const isBlankMarkdown = !markdown.content.value.trim();
    const hasPendingEditCodeblock = isResponseVM(element) && !element.isComplete && hasCodeblockUriTag(markdown.content.value) && !codeblockHasClosingBackticks(markdown.content.value);
    if (!this.hasEditCodeblockUri(markdown) && !isBlankMarkdown && !hasPendingEditCodeblock) {
      this.finalizeCurrentThinkingPart(context2, templateData);
    }
    const fillInIncompleteTokens2 = isResponseVM(element) && (!element.isComplete || element.isCanceled || element.errorDetails?.responseIsFiltered || element.errorDetails?.responseIsIncomplete || !!element.renderData);
    const codeBlockStartIndex = context2.codeBlockStartIndex;
    const markdownPart = templateData.instantiationService.createInstance(ChatMarkdownContentPart, markdown, context2, this._editorPool, fillInIncompleteTokens2, codeBlockStartIndex, this.chatContentMarkdownRenderer, void 0, this._currentLayoutWidth.get(), { codeBlockRenderOptions: this.rendererOptions.codeBlockRenderOptions });
    markdownPart.addDisposable(markdownPart.onDidChangeHeight(() => this.fireItemHeightChange(templateData)));
    if (isRequestVM(element)) {
      markdownPart.domNode.tabIndex = 0;
      if (this.configService.getValue("chat.editRequests") === "inline" && this.rendererOptions.editable) {
        markdownPart.domNode.classList.add("clickable");
        markdownPart.addDisposable(addDisposableListener(markdownPart.domNode, EventType.CLICK, (e4) => {
          if (this.viewModel?.editing?.id === element.id) {
            return;
          }
          const clickedElement = e4.target;
          if (clickedElement.tagName === "A") {
            return;
          }
          const selection = getWindow(templateData.rowContainer).getSelection();
          if (selection && !selection.isCollapsed && selection.toString().length > 0) {
            return;
          }
          const monacoEditor = findParentWithClass(clickedElement, "monaco-editor");
          if (monacoEditor) {
            const editorPart = Array.from(this.editorsInUse()).find((editor) => editor.element.contains(monacoEditor));
            if (editorPart?.editor.getSelection()?.isEmpty() === false) {
              return;
            }
          }
          e4.preventDefault();
          e4.stopPropagation();
          this._onDidClickRequest.fire(templateData);
        }));
        markdownPart.addDisposable(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), markdownPart.domNode, localize(12404, null), { trapFocus: true }));
      }
      markdownPart.addDisposable(addDisposableListener(markdownPart.domNode, EventType.FOCUS, () => {
        this.hoverVisible(templateData.requestHover);
      }));
      markdownPart.addDisposable(addDisposableListener(markdownPart.domNode, EventType.BLUR, () => {
        this.hoverHidden(templateData.requestHover);
      }));
    }
    if (!findParentWithClass(templateData.rowContainer, "monaco-tree-sticky-row")) {
      this.handleRenderedCodeblocks(element, markdownPart, codeBlockStartIndex);
    }
    const collapsedToolsMode = this.configService.getValue("chat.agent.thinking.collapsedTools");
    if (isResponseVM(context2.element) && collapsedToolsMode !== "off" /* Off */) {
      const isComplete = this.isCodeblockComplete(markdown, context2.element);
      const subAgentInvocationId = extractSubAgentInvocationIdFromText(markdown.content.value);
      if (subAgentInvocationId) {
        const subagentPart = this.getSubagentPart(templateData.renderedParts, subAgentInvocationId);
        if (subagentPart && markdownPart?.domNode && isComplete) {
          subagentPart.appendMarkdownItem(
            () => ({ domNode: markdownPart.domNode, disposable: markdownPart }),
            markdownPart.codeblocksPartId,
            markdown,
            templateData.value,
            markdownPart
          );
          return this.renderNoContent((other) => other.kind === "markdownContent" && other.content.value === markdown.content.value && extractSubAgentInvocationIdFromText(other.content.value) === subAgentInvocationId);
        }
      }
      const shouldPin = this.shouldPinPart(markdown, context2.element);
      if (markdownPart?.domNode && shouldPin && isComplete) {
        const { part: lastThinking, separatedFromReasoning } = this.getLastThinkingPartForGroupedItem(context2, templateData);
        if (!lastThinking && shouldCreateGroupedThinkingPart(collapsedToolsMode, separatedFromReasoning)) {
          const thinkingPart = this.renderThinkingPart({
            kind: "thinking"
          }, context2, templateData);
          if (thinkingPart instanceof ChatThinkingContentPart) {
            thinkingPart.appendItem(
              () => ({ domNode: markdownPart.domNode, disposable: markdownPart }),
              markdownPart.codeblocksPartId,
              markdown,
              templateData.value,
              markdownPart.onDidChangeDiff,
              markdownPart
            );
          }
          return thinkingPart;
        }
        if (lastThinking) {
          lastThinking.appendItem(
            () => ({ domNode: markdownPart.domNode, disposable: markdownPart }),
            markdownPart.codeblocksPartId,
            markdown,
            templateData.value,
            markdownPart.onDidChangeDiff
          );
        }
      } else if (!shouldPin && !isBlankMarkdown && !hasPendingEditCodeblock) {
        this.finalizeCurrentThinkingPart(context2, templateData);
      }
    }
    return markdownPart;
  }
  renderThinkingPart(content, context2, templateData) {
    if (!content.id) {
      content.id = Date.now().toString();
    }
    const element = isResponseVM(context2.element) ? context2.element : void 0;
    const streamingCompleted = this.isThinkingLookAheadComplete(context2, element);
    const lastThinkingPart = this.getLastThinkingPart(templateData.renderedParts);
    if (lastThinkingPart?.hasGroupedItems() && shouldStartNewCollapsedThinkingGroup(getEffectiveThinkingDisplayMode(this.configService, this.contextKeyService), "items", "reasoning")) {
      this.finalizeCurrentThinkingPart(context2, templateData);
    }
    if (Array.isArray(content.value)) {
      if (content.value.length < 1) {
        const lastThinking = this.getLastThinkingPart(templateData.renderedParts);
        lastThinking?.finalizeTitleIfDefault();
        return this.renderNoContent((other) => content.kind === other.kind);
      }
      let lastPart;
      for (const item of content.value) {
        if (item) {
          const lastThinkingPart2 = lastPart instanceof ChatThinkingContentPart && lastPart.getIsActive() ? lastPart : void 0;
          if (lastThinkingPart2) {
            lastThinkingPart2.setupThinkingContainer({ ...content, value: item });
          } else {
            const itemContent = { ...content, value: item };
            const itemPart = templateData.instantiationService.createInstance(ChatThinkingContentPart, itemContent, context2, this.chatContentMarkdownRenderer, streamingCompleted);
            lastPart = itemPart;
          }
        }
      }
      return lastPart ?? this.renderNoContent((other) => content.kind === other.kind);
    } else {
      const lastActiveThinking = this.getLastThinkingPart(templateData.renderedParts);
      if (lastActiveThinking) {
        lastActiveThinking.setupThinkingContainer(content);
        return lastActiveThinking;
      } else {
        const part = templateData.instantiationService.createInstance(ChatThinkingContentPart, content, context2, this.chatContentMarkdownRenderer, streamingCompleted);
        return part;
      }
    }
  }
  disposeElement(node, index2, templateData, details) {
    this.traceLayout("disposeElement", `Disposing element, index=${index2}`);
    templateData.elementDisposables.clear();
    const ownsElementMappings = this.templateDataByRequestId.get(node.element.id) === templateData;
    if (templateData.currentElement && !this.viewModel?.editing) {
      const mapped = this.templateDataByRequestId.get(templateData.currentElement.id);
      if (mapped === templateData) {
        this.templateDataByRequestId.delete(templateData.currentElement.id);
      }
    }
    if (ownsElementMappings) {
      const codeBlocks = this.codeBlocksByResponseId.get(node.element.id);
      if (codeBlocks) {
        for (const info of codeBlocks) {
          if (info?.uri) {
            this.codeBlocksByEditorUri.delete(info.uri);
          }
        }
        this.codeBlocksByResponseId.delete(node.element.id);
      }
    }
    this.fileTreesByResponseId.delete(node.element.id);
    this.focusedFileTreesByResponseId.delete(node.element.id);
    if (isRequestVM(node.element) && node.element.id === this.viewModel?.editing?.id && details?.onScroll) {
      this._onDidDispose.fire(templateData);
    }
    if (templateData.titleToolbar) {
      templateData.titleToolbar.context = void 0;
    }
    templateData.footerToolbar.context = void 0;
    templateData.checkpointToolbar.context = void 0;
    templateData.checkpointRestoreToolbar.context = void 0;
    templateData.responseTokenStatsHover.clear();
  }
  renderMcpServersInteractionRequired(content, context2, templateData) {
    return this.instantiationService.createInstance(ChatMcpServersInteractionContentPart, content, context2);
  }
  renderDisabledClaudeHooks(content, context2) {
    return this.instantiationService.createInstance(ChatDisabledClaudeHooksContentPart, context2);
  }
  disposeTemplate(templateData) {
    this.clearRenderedParts(templateData);
    templateData.templateDisposables.dispose();
  }
  hoverVisible(requestHover) {
    requestHover.style.opacity = "1";
  }
  hoverHidden(requestHover) {
    requestHover.style.opacity = "0";
  }
};

ChatListItemRenderer = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IChatWidgetService),
  __decorateParam(13, IChatEntitlementService),
  __decorateParam(14, IChatService),
  __decorateParam(15, IChatBranchService),
  __decorateParam(16, IAccessibilitySignalService),
  __decorateParam(17, IAccessibilityService),
  __decorateParam(18, IWorkbenchEnvironmentService),
  __decorateParam(19, ITelemetryService)
], ChatListItemRenderer);

var ChatListDelegate = class extends CachedListVirtualDelegate {
  constructor(defaultElementHeight) {
    super();
    this.defaultElementHeight = defaultElementHeight;
  }
  estimateHeight(element) {
    return element.currentRenderedHeight ?? this.defaultElementHeight;
  }
  getTemplateId(element) {
    return ChatListItemRenderer.ID;
  }
  hasDynamicHeight(element) {
    return true;
  }
  getMeasuredHeight(element) {
    return this.getCachedHeight(element);
  }
};

function isParentSubagentTool(invocation) {
  return invocation.toolSpecificData?.kind === "subagent" && !invocation.subAgentInvocationId;
}

function getSubagentId(invocation) {
  if (isParentSubagentTool(invocation)) {
    return invocation.toolCallId;
  }
  return invocation.subAgentInvocationId;
}

function isSubagentToolInvocation(invocation) {
  return !!getSubagentId(invocation);
}

function getWorkingProgressRelevantParts(parts) {
  return parts.filter((part) => {
    if (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") {
      return !isSubagentToolInvocation(part);
    }
    if (part.kind === "hook") {
      return !part.subAgentInvocationId;
    }
    return part.kind !== "markdownContent" || !extractSubAgentInvocationIdFromText(part.content.value);
  });
}

function endsWithActiveSubagentContent(parts) {
  const lastPart = findLastMeaningfulPart(parts.filter((part) => !isNestedSubagentContent(part)));
  if (!lastPart || lastPart.kind !== "toolInvocation" && lastPart.kind !== "toolInvocationSerialized") {
    return false;
  }
  if (!isParentSubagentTool(lastPart)) {
    return false;
  }
  return lastPart.toolSpecificData?.kind === "subagent" && (lastPart.toolSpecificData.isActive ?? !IChatToolInvocation.isComplete(lastPart));
}

function isNestedSubagentContent(part) {
  if (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") {
    return !!part.subAgentInvocationId;
  }
  if (part.kind === "hook") {
    return !!part.subAgentInvocationId;
  }
  return part.kind === "markdownContent" && !!extractSubAgentInvocationIdFromText(part.content.value);
}

function endsWithCompletedQuestionInteraction(parts) {
  const lastPart = findLastMeaningfulPart(parts);
  if (!lastPart) {
    return false;
  }
  if (lastPart.kind === "questionCarousel") {
    return !!lastPart.isUsed;
  }
  return (lastPart.kind === "toolInvocation" || lastPart.kind === "toolInvocationSerialized") && isAskQuestionsToolInvocation(lastPart) && IChatToolInvocation.isComplete(lastPart);
}

function isWaitingForMcpServers(parts) {
  return parts.some((part) => part.kind === "mcpServersStartingSlow" && part.servers.get().length > 0);
}

function findLastMeaningfulPart(parts) {
  for (let i2 = parts.length - 1; i2 >= 0; i2--) {
    const part = parts[i2];
    if (part.kind !== "markdownContent" || part.content.value.trim().length > 0) {
      return part;
    }
  }
  return void 0;
}
export { escapeMarkdownLinkLabel2, buildPlanReviewProgressContent, shouldScheduleInitialHeightChange, getFinalResponseStartIndex, isResponseOutcomeTool, getFinalResponseStartIndexAfterMovingResponseOutcomeTools, isFinalResponseRendered, moveResponseOutcomeToolsAfterFinalResponse, formatCompletedResponseDisclosureLabel, getVisibleCompletedResponseItemCount, formatResponseTokenStats, shouldCollapseCompletedResponsePart, getCompletedResponseCollapseEndIndex, reconcileChatItemHeight, renderChatResponseDetails, renderChatRequestTimestamp, shouldRenderInitialProgressiveContentImmediately, shouldStartNewCollapsedThinkingGroup, shouldCreateGroupedThinkingPart, shouldShowFileChangesSummaryForSettings, shouldShowPillsSummaryForSettings, shouldPinToolInvocationToThinking, toolInvocationHasMcpAppData, isGeneratedImageResultOwner, shouldHideChatUserIdentity, isAgentHostCopilotSessionType, upvoteAnimationSettingToEnum, isParentSubagentTool, getSubagentId, isSubagentToolInvocation, getWorkingProgressRelevantParts, endsWithActiveSubagentContent, isNestedSubagentContent, endsWithCompletedQuestionInteraction, isWaitingForMcpServers, findLastMeaningfulPart, $54, COPILOT_USERNAME, WORKING_CAUGHT_UP_DEBOUNCE_MS, DEFAULT_CHAT_ITEM_HORIZONTAL_PADDING, forceVerboseLayoutTracing, mostRecentResponseClassName, ChatListItemRenderer, ChatListDelegate };
