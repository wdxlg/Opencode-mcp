// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolProgressPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { autorun } from "./module-0052.mjs";
import { clearNode, reset } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { shouldShimmerForTool } from "./module-2260.mjs";
import { ChatProgressContentPart } from "./module-2264.mjs";
import { stripIcons } from "./module-0461.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { status } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolProgressPart.ts
var ChatToolProgressSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, context2, renderer, announcedToolProgressKeys, instantiationService, configurationService) {
    super(toolInvocation);
    this.context = context2;
    this.renderer = renderer;
    this.announcedToolProgressKeys = announcedToolProgressKeys;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.codeblocks = [];
    this.domNode = this.createProgressPart();
  }
  createProgressPart() {
    const isComplete = IChatToolInvocation.isComplete(this.toolInvocation);
    if (isComplete && this.toolIsConfirmed && (this.toolInvocation.pastTenseMessage || this.toolInvocation.invocationMessage)) {
      const key3 = this.getAnnouncementKey("complete");
      const completionContent = this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage;
      if (!this.hasMeaningfulContent(completionContent)) {
        return document.createElement("div");
      }
      const shouldAnnounce = this.toolInvocation.kind === "toolInvocation" && this.hasMeaningfulContent(completionContent) ? this.computeShouldAnnounce(key3) : false;
      const part = this.renderProgressContent(completionContent, shouldAnnounce);
      this._register(part);
      return part.domNode;
    } else {
      const container2 = document.createElement("div");
      this._register(autorun((reader) => {
        let progressContent;
        const key3 = this.getAnnouncementKey("progress");
        if (this.toolInvocation.kind === "toolInvocation") {
          const state = this.toolInvocation.state.read(reader);
          if (state.type === IChatToolInvocation.StateKind.Cancelled && state.reasonMessage) {
            progressContent = state.reasonMessage;
          } else if (state.type === IChatToolInvocation.StateKind.Executing) {
            const progressMessage = state.progress.read(reader)?.message;
            progressContent = this.hasMeaningfulContent(progressMessage) ? progressMessage : this.toolInvocation.invocationMessage;
          } else {
            progressContent = this.toolInvocation.invocationMessage;
          }
        } else {
          progressContent = this.toolInvocation.invocationMessage;
        }
        if (!this.hasMeaningfulContent(progressContent)) {
          clearNode(container2);
          return;
        }
        const shouldAnnounce = this.toolInvocation.kind === "toolInvocation" && this.hasMeaningfulContent(progressContent) ? this.computeShouldAnnounce(key3) : false;
        const part = reader.store.add(this.renderProgressContent(progressContent, shouldAnnounce));
        reset(container2, part.domNode);
      }));
      return container2;
    }
  }
  get toolIsConfirmed() {
    const c = IChatToolInvocation.executionConfirmedOrDenied(this.toolInvocation);
    return !!c && c.type !== 0 /* Denied */;
  }
  renderProgressContent(content, shouldAnnounce) {
    if (typeof content === "string") {
      content = new MarkdownString().appendText(content);
    }
    const progressMessage = {
      kind: "progressMessage",
      content
    };
    if (shouldAnnounce) {
      this.provideScreenReaderStatus(content);
    }
    const shouldShimmer = shouldShimmerForTool(this.toolInvocation, content);
    return this.instantiationService.createInstance(ChatProgressContentPart, progressMessage, this.renderer, this.context, shouldShimmer ? true : void 0, true, this.getProgressIcon(), this.toolInvocation, shouldShimmer);
  }
  getAnnouncementKey(kind) {
    return `${kind}:${this.toolInvocation.toolCallId}`;
  }
  computeShouldAnnounce(key3) {
    if (!this.announcedToolProgressKeys) {
      return false;
    }
    if (!this.configurationService.getValue("accessibility.verboseChatProgressUpdates" /* VerboseChatProgressUpdates */)) {
      return false;
    }
    if (this.announcedToolProgressKeys.has(key3)) {
      return false;
    }
    this.announcedToolProgressKeys.add(key3);
    return true;
  }
  provideScreenReaderStatus(content) {
    const message = typeof content === "string" ? content : stripIcons(renderAsPlaintext(content, { useLinkFormatter: true }));
    status(message);
  }
  hasMeaningfulContent(content) {
    if (!content) {
      return false;
    }
    const text2 = typeof content === "string" ? content : content.value;
    return text2.trim().length > 0;
  }
};

ChatToolProgressSubPart = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IConfigurationService)
], ChatToolProgressSubPart);
export { ChatToolProgressSubPart };
