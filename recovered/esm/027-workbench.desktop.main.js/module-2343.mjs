// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatSimpleToolProgressPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2323.mjs";
import { ChatCollapsibleInputOutputContentPart } from "./module-2326.mjs";
import { getToolApprovalMessage, shouldShimmerForTool } from "./module-2285.mjs";
import { toDisposable } from "./module-0012.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { Lazy } from "./module-0028.mjs";
import { ProgressBar } from "./module-1331.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatSimpleToolProgressPart.ts
var ChatSimpleToolProgressPart = class extends BaseChatToolInvocationSubPart {
  static {
    /** Remembers expanded tool parts on re-render */
    this._expandedByDefault = /* @__PURE__ */ new WeakMap();
  }
  get codeblocks() {
    return this.collapsibleListPart.codeblocks;
  }
  constructor(toolInvocation, context2, codeBlockStartIndex, message, subtitle, data, isError, instantiationService, modelService, languageService) {
    super(toolInvocation);
    let codeBlockIndex = codeBlockStartIndex;
    const createIOPart = (content2, label3) => {
      return {
        kind: "code",
        data: content2,
        languageId: "plaintext",
        codeBlockIndex: codeBlockIndex++,
        ownerMarkdownPartId: this.codeblocksPartId,
        options: {
          hideToolbar: false,
          reserveWidth: 19,
          maxHeightInLines: 8,
          verticalPadding: 3,
          editorOptions: {
            wordWrap: "off"
          }
        }
      };
    };
    const inputPart = createIOPart(data.input, "Input");
    const outputParts = data.output ? [createIOPart(data.output, "Output")] : void 0;
    const collapsibleListPart = this.collapsibleListPart = this._register(instantiationService.createInstance(
      ChatCollapsibleInputOutputContentPart,
      message,
      subtitle,
      this.getAutoApprovalMessageContent(),
      context2,
      inputPart,
      outputParts ? { parts: outputParts } : void 0,
      isError,
      ChatSimpleToolProgressPart._expandedByDefault.get(toolInvocation) ?? false,
      shouldShimmerForTool(toolInvocation, message),
      data
    ));
    this._register(toDisposable(() => ChatSimpleToolProgressPart._expandedByDefault.set(toolInvocation, collapsibleListPart.expanded)));
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
  getAutoApprovalMessageContent() {
    return getToolApprovalMessage(this.toolInvocation);
  }
};

ChatSimpleToolProgressPart = __decorateClass([
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IModelService),
  __decorateParam(9, ILanguageService)
], ChatSimpleToolProgressPart);
export { ChatSimpleToolProgressPart };
