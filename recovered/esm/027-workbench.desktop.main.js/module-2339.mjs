// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatResultListSubPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2323.mjs";
import { ChatCollapsibleListContentPart } from "./module-2154.mjs";
import { getToolApprovalMessage } from "./module-2285.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatResultListSubPart.ts
var ChatResultListSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, context2, message, toolDetails, listPool, instantiationService) {
    super(toolInvocation);
    this.codeblocks = [];
    const collapsibleListPart = this._register(instantiationService.createInstance(
      ChatCollapsibleListContentPart,
      toolDetails.map((detail2) => ({
        kind: "reference",
        reference: detail2
      })),
      message,
      context2,
      listPool,
      getToolApprovalMessage(toolInvocation)
    ));
    collapsibleListPart.icon = Codicon.check;
    this.domNode = collapsibleListPart.domNode;
  }
};

ChatResultListSubPart = __decorateClass([
  __decorateParam(5, IInstantiationService)
], ChatResultListSubPart);
export { ChatResultListSubPart };
