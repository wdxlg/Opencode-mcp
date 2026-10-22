// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolInvocationSubPart.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolInvocationSubPart.ts
var BaseChatToolInvocationSubPart = class _BaseChatToolInvocationSubPart extends Disposable {
  constructor(toolInvocation) {
    super();
    this.toolInvocation = toolInvocation;
    this._onNeedsRerender = this._register(new Emitter());
    this.onNeedsRerender = this._onNeedsRerender.event;
    this._codeBlocksPartId = "tool-" + _BaseChatToolInvocationSubPart.idPool++;
  }
  static {
    this.idPool = 0;
  }
  get codeblocksPartId() {
    return this._codeBlocksPartId;
  }
  getIcon() {
    const toolInvocation = this.toolInvocation;
    const confirmState = IChatToolInvocation.executionConfirmedOrDenied(toolInvocation);
    const isSkipped = confirmState?.type === 5 /* Skipped */;
    if (isSkipped) {
      return Codicon.circleSlash;
    }
    return confirmState?.type === 0 /* Denied */ ? Codicon.error : IChatToolInvocation.isComplete(toolInvocation) ? Codicon.check : ThemeIcon.modify(Codicon.loading, "spin");
  }
  /**
   * Like {@link getIcon} but never returns the looping loading spinner — progress rows convey
   * activity via shimmer instead, so an in-progress row uses a (hidden) check rather than a spinner.
   */
  getProgressIcon() {
    const icon2 = this.getIcon();
    return ThemeIcon.isEqual(icon2, ThemeIcon.modify(Codicon.loading, "spin")) ? Codicon.check : icon2;
  }
};
export { BaseChatToolInvocationSubPart };
