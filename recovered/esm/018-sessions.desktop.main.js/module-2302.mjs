// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatInputOutputMarkdownProgressPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { ChatCollapsibleInputOutputContentPart } from "./module-2301.mjs";
import { basename2 } from "./module-0034.mjs";
import { getExtensionForMimeType } from "./module-0136.mjs";
import { ChatResponseResource } from "./module-1193.mjs";
import { getToolApprovalMessage, shouldShimmerForTool } from "./module-2260.mjs";
import { toDisposable } from "./module-0012.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { Lazy } from "./module-0028.mjs";
import { ProgressBar } from "./module-1330.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatInputOutputMarkdownProgressPart.ts
var ChatInputOutputMarkdownProgressPart = class extends BaseChatToolInvocationSubPart {
  static {
    /** Remembers expanded tool parts on re-render */
    this._expandedByDefault = /* @__PURE__ */ new WeakMap();
  }
  get codeblocks() {
    return this.collapsibleListPart.codeblocks;
  }
  constructor(toolInvocation, context2, codeBlockStartIndex, message, subtitle, input, inputLanguage, output, isError, instantiationService, modelService, languageService) {
    super(toolInvocation);
    let codeBlockIndex = codeBlockStartIndex;
    const createCodePart = (data, languageId = "json") => ({
      kind: "code",
      data,
      languageId,
      codeBlockIndex: codeBlockIndex++,
      ownerMarkdownPartId: this.codeblocksPartId,
      options: {
        hideToolbar: true,
        reserveWidth: 19,
        maxHeightInLines: 13,
        verticalPadding: 5,
        editorOptions: {
          wordWrap: "on"
        }
      }
    });
    let processedOutput = output;
    if (typeof output === "string") {
      processedOutput = [{ type: "embed", value: output, isText: true }];
    }
    const collapsibleListPart = this.collapsibleListPart = this._register(instantiationService.createInstance(
      ChatCollapsibleInputOutputContentPart,
      message,
      subtitle,
      this.getAutoApproveMessageContent(),
      context2,
      createCodePart(input, inputLanguage),
      processedOutput && processedOutput.length > 0 ? {
        parts: processedOutput.map((o, i2) => {
          const permalinkBasename = o.type === "ref" || o.uri ? basename2(o.uri) : o.mimeType && getExtensionForMimeType(o.mimeType) ? `file${getExtensionForMimeType(o.mimeType)}` : "file" + (o.isText ? ".txt" : ".bin");
          if (o.type === "ref") {
            return { kind: "data", uri: o.uri, mimeType: o.mimeType };
          } else if (o.isText && !o.asResource) {
            return createCodePart(o.value);
          } else {
            const permalinkUri = ChatResponseResource.createUri(context2.element.sessionResource, toolInvocation.toolCallId, i2, permalinkBasename);
            if (!o.isText) {
              return { kind: "data", base64Value: o.value, mimeType: o.mimeType, uri: permalinkUri, audience: o.audience };
            } else {
              return { kind: "data", value: new TextEncoder().encode(o.value), mimeType: o.mimeType, uri: permalinkUri, audience: o.audience };
            }
          }
        })
      } : void 0,
      isError,
      ChatInputOutputMarkdownProgressPart._expandedByDefault.get(toolInvocation) ?? false,
      shouldShimmerForTool(toolInvocation, message),
      void 0
    ));
    this._register(toDisposable(() => ChatInputOutputMarkdownProgressPart._expandedByDefault.set(toolInvocation, collapsibleListPart.expanded)));
    const progressObservable = toolInvocation.kind === "toolInvocation" ? toolInvocation.state.map((s, r2) => s.type === IChatToolInvocation.StateKind.Executing ? s.progress.read(r2) : void 0) : void 0;
    const progressBar = new Lazy(() => this._register(new ProgressBar(collapsibleListPart.domNode)));
    if (progressObservable) {
      this._register(autorun((reader) => {
        const progress = progressObservable?.read(reader);
        if (progress?.message) {
          collapsibleListPart.title = progress.message;
        }
        if (progress?.progress && !IChatToolInvocation.isComplete(toolInvocation, reader)) {
          progressBar.value.setWorked(progress.progress * 100);
        }
      }));
    }
    this.domNode = collapsibleListPart.domNode;
  }
  getAutoApproveMessageContent() {
    return getToolApprovalMessage(this.toolInvocation);
  }
};

ChatInputOutputMarkdownProgressPart = __decorateClass([
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IModelService),
  __decorateParam(11, ILanguageService)
], ChatInputOutputMarkdownProgressPart);
export { ChatInputOutputMarkdownProgressPart };
