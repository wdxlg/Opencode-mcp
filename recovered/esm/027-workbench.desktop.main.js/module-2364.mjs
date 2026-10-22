// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolStreamingSubPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2323.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { autorun } from "./module-0052.mjs";
import { clearNode, reset } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { ChatProgressContentPart } from "./module-2289.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolStreamingSubPart.ts
var ChatToolStreamingSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, context2, renderer, instantiationService) {
    super(toolInvocation);
    this.context = context2;
    this.renderer = renderer;
    this.instantiationService = instantiationService;
    this.codeblocks = [];
    this.domNode = this.createStreamingPart();
  }
  createStreamingPart() {
    const container3 = document.createElement("div");
    if (this.toolInvocation.kind !== "toolInvocation") {
      return container3;
    }
    const toolInvocation = this.toolInvocation;
    const state = toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.Streaming) {
      return container3;
    }
    this._register(autorun((reader) => {
      const currentState = toolInvocation.state.read(reader);
      if (currentState.type !== IChatToolInvocation.StateKind.Streaming) {
        clearNode(container3);
        this._onNeedsRerender.fire();
        return;
      }
      const streamingMessage = currentState.streamingMessage.read(reader);
      const displayMessage = streamingMessage ?? toolInvocation.invocationMessage;
      const messageText2 = typeof displayMessage === "string" ? displayMessage : displayMessage.value;
      if (!messageText2 || messageText2.trim().length === 0) {
        clearNode(container3);
        return;
      }
      const content2 = typeof displayMessage === "string" ? new MarkdownString().appendText(displayMessage) : displayMessage;
      const progressMessage = {
        kind: "progressMessage",
        content: content2
      };
      const shimmer = !toolInvocation.isAttachedToThinking;
      const part = reader.store.add(this.instantiationService.createInstance(
        ChatProgressContentPart,
        progressMessage,
        this.renderer,
        this.context,
        shimmer ? true : void 0,
        true,
        this.getProgressIcon(),
        toolInvocation,
        shimmer
      ));
      reset(container3, part.domNode);
    }));
    return container3;
  }
};

ChatToolStreamingSubPart = __decorateClass([
  __decorateParam(3, IInstantiationService)
], ChatToolStreamingSubPart);
export { ChatToolStreamingSubPart };
