// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatWidgetPasteTarget.ts
import { getDynamicVariablesForWidget } from "./module-0993.mjs";
import { toAttachedContextDynamicVariable } from "./module-0984.mjs";
import { ChatDynamicVariableModel } from "./module-0985.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatWidgetPasteTarget.ts
var ChatWidgetPasteTarget = class {
  constructor(widget) {
    this.widget = widget;
  }
  get sessionResource() {
    return this.widget.viewModel?.sessionResource ?? this.widget.input.inputUri;
  }
  get attachments() {
    return this.widget.attachmentModel.attachments;
  }
  get inlineReferences() {
    return getDynamicVariablesForWidget(this.widget);
  }
  addAttachments(entries2) {
    this.widget.attachmentModel.addContext(...entries2);
    this.widget.refreshParsedInput();
  }
  removeAttachments(ids) {
    this.widget.attachmentModel.delete(...ids);
    this.widget.refreshParsedInput();
  }
  addInlineAttachment(entry, _text, range2) {
    this.widget.attachmentModel.addContext(entry);
    this.addInlineReference(toAttachedContextDynamicVariable(entry, range2));
  }
  addInlineReference(reference) {
    this.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference(reference);
    this.widget.refreshParsedInput();
  }
  isTerminalCommandPaste(text2, range2) {
    return this.widget.input.isTerminalCommandPaste(text2, range2);
  }
};
export { ChatWidgetPasteTarget };
