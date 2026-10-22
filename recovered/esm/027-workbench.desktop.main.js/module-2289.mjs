// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatProgressContentPart.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $, append, isHTMLElement } from "./module-0075.mjs";
import { alert } from "./module-0076.mjs";
import { stripIcons } from "./module-0461.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { renderFileWidgets } from "./module-2142.mjs";
import { getToolApprovalMessage, isAskQuestionsToolInvocation } from "./module-2285.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatMarkdownAnchorService } from "./module-2140.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { IHoverService } from "./module-0520.mjs";
import { buildPhrasePool, defaultThinkingMessages, maybePickFunWorkingMessage } from "./module-2288.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatProgressContentPart.ts
var ChatProgressContentPart = class extends Disposable {
  constructor(progress, chatContentMarkdownRenderer, context2, forceShowSpinner, forceShowMessage, icon2, toolInvocation, shimmer, instantiationService, chatMarkdownAnchorService, configurationService) {
    super();
    this.chatContentMarkdownRenderer = chatContentMarkdownRenderer;
    this.toolInvocation = toolInvocation;
    this.instantiationService = instantiationService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.configurationService = configurationService;
    this.renderedMessage = this._register(new MutableDisposable());
    this._fileWidgetStore = this._register(new DisposableStore());
    this.currentContent = progress.content;
    const followingContent = context2.content.slice(context2.contentIndex + 1);
    this.showSpinner = forceShowSpinner ?? shouldShowSpinner(followingContent, context2.element);
    this.isHidden = forceShowMessage !== true && followingContent.some((part) => part.kind !== "progressMessage");
    if (this.isHidden) {
      this.domNode = $("");
      return;
    }
    if (this.showSpinner && this.configurationService.getValue("accessibility.verboseChatProgressUpdates" /* VerboseChatProgressUpdates */)) {
      alert(stripIcons(renderAsPlaintext(progress.content)));
    }
    const isLoadingIcon = icon2 && ThemeIcon.isEqual(icon2, ThemeIcon.modify(Codicon.loading, "spin"));
    const useShimmer = (shimmer ?? (!icon2 || isLoadingIcon)) && this.showSpinner;
    const codicon = useShimmer ? Codicon.check : icon2 ?? (this.showSpinner ? ThemeIcon.modify(Codicon.loading, "spin") : Codicon.check);
    const result = this.chatContentMarkdownRenderer.render(progress.content);
    result.element.classList.add("progress-step");
    renderFileWidgets(result.element, this.instantiationService, this.chatMarkdownAnchorService, this._fileWidgetStore);
    if (useShimmer) {
      syncShimmerPhase(this.applyShimmer(result.element));
    }
    const tooltip = this.createApprovalMessage();
    const progressPart = this._register(instantiationService.createInstance(ChatProgressSubPart, result.element, codicon, tooltip));
    this.domNode = progressPart.domNode;
    if (useShimmer) {
      this.domNode.classList.add("shimmer-progress");
    }
    this.renderedMessage.value = result;
  }
  /**
   * Applies the shimmer treatment and returns the elements that actually animate, so their
   * animation phase can be synced. A partial shimmer wraps only the leading verb in spans;
   * otherwise the whole message paragraph shimmers.
   */
  applyShimmer(element) {
    const firstChild = element.firstElementChild;
    const messageElement = isHTMLElement(firstChild) && firstChild.tagName === "P" ? firstChild : element;
    const boundary = this.toolInvocation ? this.computeShimmerBoundary(messageElement) : -1;
    if (boundary <= 0) {
      return [messageElement];
    }
    element.classList.add("chat-progress-partial-shimmer");
    return this.wrapLeadingText(messageElement, boundary);
  }
  /**
   * How many leading characters of the progress message should shimmer. Ask-question rows
   * shimmer everything before the ` (` summary; streaming rows shimmer only the stable leading
   * verb so moving parts (line counts, file names) stay still. Non-positive skips partial shimmer.
   */
  computeShimmerBoundary(messageElement) {
    if (isAskQuestionsToolInvocation(this.toolInvocation)) {
      return messageElement.textContent?.indexOf(" (") ?? -1;
    }
    if (IChatToolInvocation.isStreaming(this.toolInvocation)) {
      return leadingStableTextLength(messageElement);
    }
    return -1;
  }
  wrapLeadingText(element, length) {
    const spans = [];
    let remaining = length;
    const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (remaining > 0) {
      const node = walker.nextNode();
      if (!node) {
        return spans;
      }
      const text2 = node.nodeValue ?? "";
      if (!text2) {
        continue;
      }
      const shimmerText = text2.slice(0, remaining);
      const suffixText = text2.slice(remaining);
      const span = $("span");
      span.classList.add("chat-progress-shimmer-text");
      span.textContent = shimmerText;
      node.parentNode?.insertBefore(span, node);
      if (suffixText) {
        node.nodeValue = suffixText;
      } else {
        node.parentNode?.removeChild(node);
      }
      spans.push(span);
      remaining -= shimmerText.length;
    }
    return spans;
  }
  updateMessage(content2) {
    if (this.isHidden) {
      return;
    }
    const result = this._register(this.chatContentMarkdownRenderer.render(content2));
    result.element.classList.add("progress-step");
    this._fileWidgetStore.clear();
    renderFileWidgets(result.element, this.instantiationService, this.chatMarkdownAnchorService, this._fileWidgetStore);
    if (this.renderedMessage.value) {
      this.renderedMessage.value.element.replaceWith(result.element);
    } else {
      this.domNode.appendChild(result.element);
    }
    this.renderedMessage.value = result;
  }
  hasSameContent(other, followingContent, element) {
    if (followingContent.some((part) => part.kind !== "progressMessage") && !this.isHidden) {
      return false;
    }
    const showSpinner = shouldShowSpinner(followingContent, element);
    if (other.kind === "progressMessage" && other.content.value !== this.currentContent.value) {
      return false;
    }
    return other.kind === "progressMessage" && this.showSpinner === showSpinner;
  }
  createApprovalMessage() {
    return this.toolInvocation && getToolApprovalMessage(this.toolInvocation);
  }
};

ChatProgressContentPart = __decorateClass([
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IChatMarkdownAnchorService),
  __decorateParam(10, IConfigurationService)
], ChatProgressContentPart);

function shouldShowSpinner(followingContent, element) {
  return isResponseVM(element) && !element.isComplete && followingContent.length === 0;
}

function leadingStableTextLength(messageElement) {
  const fullText = messageElement.textContent ?? "";
  let length = 0;
  for (const node of messageElement.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.nodeValue ?? "";
      const movingPart = /[(\d]/.exec(nodeText);
      if (movingPart) {
        length += movingPart.index;
        break;
      }
      length += nodeText.length;
    } else {
      break;
    }
  }
  while (length > 0 && /\s/.test(fullText[length - 1])) {
    length--;
  }
  return length;
}

var SHIMMER_ANIMATION_DURATION_MS = 2e3;

var shimmerEpochMs = Date.now();

function syncShimmerPhase(animatedElements) {
  const animationDelay = `-${(Date.now() - shimmerEpochMs) % SHIMMER_ANIMATION_DURATION_MS}ms`;
  for (const element of animatedElements) {
    element.style.animationDelay = animationDelay;
  }
}

var ChatProgressSubPart = class extends Disposable {
  constructor(messageElement, icon2, tooltip, hoverService) {
    super();
    this.domNode = $(".progress-container");
    const iconElement = $("div");
    iconElement.classList.add(...ThemeIcon.asClassNameArray(getCompactCodicon(icon2)));
    if (tooltip) {
      this._register(hoverService.setupDelayedHover(iconElement, {
        content: tooltip,
        style: 1 /* Pointer */
      }));
      this._register(hoverService.setupDelayedHover(messageElement, {
        content: tooltip,
        style: 1 /* Pointer */
      }));
    }
    append(this.domNode, iconElement);
    messageElement.classList.add("progress-step");
    append(this.domNode, messageElement);
  }
};

ChatProgressSubPart = __decorateClass([
  __decorateParam(3, IHoverService)
], ChatProgressSubPart);

var WORKING_LABEL_MIN_DWELL_MS = 1200;

var lastPickedWorkingLabelByElement = /* @__PURE__ */ new Map();

function pickWorkingLabel(elementId, configurationService) {
  const now = Date.now();
  for (const [id2, entry] of lastPickedWorkingLabelByElement) {
    if (now - entry.pickedAt >= WORKING_LABEL_MIN_DWELL_MS) {
      lastPickedWorkingLabelByElement.delete(id2);
    }
  }
  const existing = lastPickedWorkingLabelByElement.get(elementId);
  if (existing && now - existing.pickedAt < WORKING_LABEL_MIN_DWELL_MS) {
    existing.pickedAt = now;
    return existing.label;
  }
  const fun = maybePickFunWorkingMessage(configurationService);
  const label3 = fun ?? (() => {
    const pool = buildPhrasePool(defaultThinkingMessages, configurationService);
    return pool[Math.floor(Math.random() * pool.length)];
  })();
  lastPickedWorkingLabelByElement.set(elementId, { label: label3, pickedAt: now });
  return label3;
}

var ChatWorkingProgressContentPart = class extends ChatProgressContentPart {
  constructor(workingProgress, chatContentMarkdownRenderer, context2, instantiationService, chatMarkdownAnchorService, configurationService, languageModelToolsService) {
    const explicitContent = workingProgress.content;
    const progressMessage = {
      kind: "progressMessage",
      content: explicitContent ?? new MarkdownString().appendText(pickWorkingLabel(context2.element.id, configurationService))
    };
    super(progressMessage, chatContentMarkdownRenderer, context2, void 0, void 0, void 0, void 0, true, instantiationService, chatMarkdownAnchorService, configurationService);
    this.explicitContent = explicitContent;
    this._register(languageModelToolsService.onDidPrepareToolCallBecomeUnresponsive((e) => {
      if (isEqual2(context2.element.sessionResource, e.sessionResource)) {
        this.updateMessage(new MarkdownString(localize(11987, null, e.toolData.displayName)));
      }
    }));
  }
  updateWorkingContent(content2) {
    this.explicitContent = content2;
    this.updateMessage(content2);
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "working" && other.content?.value === this.explicitContent?.value;
  }
};

ChatWorkingProgressContentPart = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IChatMarkdownAnchorService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILanguageModelToolsService)
], ChatWorkingProgressContentPart);
export { shouldShowSpinner, leadingStableTextLength, syncShimmerPhase, pickWorkingLabel, ChatProgressContentPart, SHIMMER_ANIMATION_DURATION_MS, shimmerEpochMs, ChatProgressSubPart, WORKING_LABEL_MIN_DWELL_MS, lastPickedWorkingLabelByElement, ChatWorkingProgressContentPart };
