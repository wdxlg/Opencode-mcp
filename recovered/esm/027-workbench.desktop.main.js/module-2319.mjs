// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTaskContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { ChatCollapsibleListContentPart } from "./module-2154.mjs";
import { $ } from "./module-0075.mjs";
import { ChatProgressContentPart } from "./module-2289.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTaskContentPart.ts
var ChatTaskContentPart = class extends Disposable {
  constructor(task, contentReferencesListPool, chatContentMarkdownRenderer, context2, instantiationService) {
    super();
    this.task = task;
    if (task.progress.length) {
      this.isSettled = true;
      const refsPart = this._register(instantiationService.createInstance(ChatCollapsibleListContentPart, task.progress, task.content.value, context2, contentReferencesListPool, void 0));
      this.domNode = $(".chat-progress-task");
      this.domNode.appendChild(refsPart.domNode);
    } else {
      const isSettled = task.kind === "progressTask" ? task.isSettled() : true;
      this.isSettled = isSettled;
      const showSpinner = !isSettled && !context2.element.isComplete;
      const progressPart = this._register(instantiationService.createInstance(ChatProgressContentPart, task, chatContentMarkdownRenderer, context2, showSpinner, true, void 0, void 0, void 0));
      this.domNode = progressPart.domNode;
    }
  }
  hasSameContent(other) {
    if (other.kind === "progressTask" && this.task.kind === "progressTask" && other.isSettled() !== this.isSettled) {
      return false;
    }
    return other.kind === this.task.kind && other.progress.length === this.task.progress.length;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatTaskContentPart = __decorateClass([
  __decorateParam(4, IInstantiationService)
], ChatTaskContentPart);
export { ChatTaskContentPart };
