// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolOutputPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { $, append } from "./module-0075.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { localize } from "./module-0001.mjs";
import { ChatProgressSubPart } from "./module-2264.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatOutputRendererService } from "./module-1308.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatOutputPartStateCache } from "./module-2272.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolOutputPart.ts
var ChatToolOutputSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, context2, onDidRemount, chatOutputItemRendererService, instantiationService, stateCache) {
    super(toolInvocation);
    this.context = context2;
    this.onDidRemount = onDidRemount;
    this.chatOutputItemRendererService = chatOutputItemRendererService;
    this.instantiationService = instantiationService;
    this.stateCache = stateCache;
    this.codeblocks = [];
    this._disposeCts = this._register(new CancellationTokenSource());
    const details = toolInvocation.kind === "toolInvocation" ? IChatToolInvocation.resultDetails(toolInvocation) : {
      output: {
        type: "data",
        mimeType: toolInvocation.resultDetails.output.mimeType,
        value: decodeBase64(toolInvocation.resultDetails.output.base64Data)
      }
    };
    this.domNode = $("div.tool-output-part");
    if (toolInvocation.invocationMessage) {
      const titleEl = $(".output-title");
      this.domNode.appendChild(titleEl);
      if (typeof toolInvocation.invocationMessage === "string") {
        titleEl.textContent = toolInvocation.invocationMessage;
      } else {
        const md = this._register(renderMarkdown(toolInvocation.invocationMessage));
        titleEl.appendChild(md.element);
      }
    }
    this.domNode.appendChild(this.createOutputPart(toolInvocation, details));
  }
  dispose() {
    this._disposeCts.dispose(true);
    super.dispose();
  }
  createOutputPart(toolInvocation, details) {
    const parent = $("div.webview-output");
    parent.style.maxHeight = "80vh";
    const partState = this.stateCache.get(toolInvocation.toolCallId) ?? { height: 0 };
    this.stateCache.set(toolInvocation.toolCallId, partState);
    if (partState.height) {
      parent.style.height = `${partState.height}px`;
    }
    const progressMessage = $("span");
    progressMessage.textContent = localize(12306, null);
    const progressPart = this._register(this.instantiationService.createInstance(ChatProgressSubPart, progressMessage, ThemeIcon.modify(Codicon.loading, "spin"), void 0));
    parent.appendChild(progressPart.domNode);
    this.chatOutputItemRendererService.renderOutputPart(details.output.mimeType, details.output.value.buffer, parent, {
      webviewState: partState.webviewState,
      chatSessionResource: this.context.element.sessionResource
    }, this._disposeCts.token).then((renderedItem) => {
      if (this._disposeCts.token.isCancellationRequested) {
        return;
      }
      this._register(renderedItem);
      progressPart.domNode.remove();
      this._register(renderedItem.webview.onDidUpdateState((e4) => {
        partState.webviewState = e4;
      }));
      this._register(renderedItem.onDidChangeHeight((newHeight) => {
        partState.height = newHeight;
      }));
      this._register(this.context.onDidChangeVisibility((visible) => {
        if (visible) {
          renderedItem.reinitialize();
        }
      }));
      this._register(this.onDidRemount(() => {
        renderedItem.reinitialize();
      }));
    }, (error) => {
      if (isCancellationError(error)) {
        return;
      }
      console.error("Error rendering tool output:", error);
      const errorNode = $(".output-error");
      const errorHeaderNode = $(".output-error-header");
      append(errorNode, errorHeaderNode);
      const iconElement = $("div");
      iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.error));
      errorHeaderNode.append(iconElement);
      const errorTitleNode = $(".output-error-title");
      errorTitleNode.textContent = localize(12305, null);
      errorHeaderNode.append(errorTitleNode);
      const errorMessageNode = $(".output-error-details");
      errorMessageNode.textContent = error?.message || String(error);
      errorNode.append(errorMessageNode);
      progressPart.domNode.replaceWith(errorNode);
    });
    return parent;
  }
};

ChatToolOutputSubPart = __decorateClass([
  __decorateParam(3, IChatOutputRendererService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IChatOutputPartStateCache)
], ChatToolOutputSubPart);
export { ChatToolOutputSubPart };
