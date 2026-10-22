// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatWorkspaceEditContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderFileWidgets } from "./module-2115.mjs";
import { ChatProgressSubPart } from "./module-2264.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatMarkdownAnchorService } from "./module-2113.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatWorkspaceEditContentPart.ts
var ChatWorkspaceEditContentPart = class extends Disposable {
  constructor(workspaceEdit, _context, chatContentMarkdownRenderer, instantiationService, chatMarkdownAnchorService, labelService) {
    super();
    this.workspaceEdit = workspaceEdit;
    this.instantiationService = instantiationService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.labelService = labelService;
    this.domNode = $(".chat-workspace-edit-content-part");
    const renderEntry = (message, icon2) => {
      const result = this._register(chatContentMarkdownRenderer.render(new MarkdownString(message, { isTrusted: true })));
      result.element.classList.add("progress-step");
      renderFileWidgets(result.element, this.instantiationService, this.chatMarkdownAnchorService, this._store);
      const progressPart = this._register(this.instantiationService.createInstance(ChatProgressSubPart, result.element, icon2, void 0));
      append(this.domNode, progressPart.domNode);
    };
    for (const edit3 of workspaceEdit.edits) {
      if (edit3.oldResource && !edit3.newResource) {
        renderEntry(localize(12183, null, this.labelService.getUriBasenameLabel(edit3.oldResource)), Codicon.trash);
      } else if (!edit3.oldResource && edit3.newResource) {
        renderEntry(localize(12182, null, edit3.newResource.toString()), Codicon.newFile);
      } else if (edit3.oldResource && edit3.newResource) {
        renderEntry(localize(12184, null, this.labelService.getUriBasenameLabel(edit3.oldResource), edit3.newResource.toString()), Codicon.arrowRight);
      }
    }
  }
  hasSameContent(other, _followingContent, _element) {
    if (other.kind !== "workspaceEdit") {
      return false;
    }
    if (other.edits.length !== this.workspaceEdit.edits.length) {
      return false;
    }
    for (let i2 = 0; i2 < other.edits.length; i2++) {
      const a = other.edits[i2];
      const b = this.workspaceEdit.edits[i2];
      if (a.oldResource?.toString() !== b.oldResource?.toString() || a.newResource?.toString() !== b.newResource?.toString()) {
        return false;
      }
    }
    return true;
  }
};

ChatWorkspaceEditContentPart = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IChatMarkdownAnchorService),
  __decorateParam(5, ILabelService)
], ChatWorkspaceEditContentPart);
export { ChatWorkspaceEditContentPart };
