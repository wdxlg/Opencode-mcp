// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newChatInputPasteTarget.ts
import { isTerminalCommandPaste } from "./module-2130.mjs";
import { Range2 } from "./module-0106.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/sessions/contrib/chat/browser/newChatInputPasteTarget.ts
var NewChatInputPasteTarget = class {
  constructor(editor, contextAttachments, completionHandler, getTerminalCommandPrefix, getSessionResource, inputUri) {
    this.editor = editor;
    this.contextAttachments = contextAttachments;
    this.completionHandler = completionHandler;
    this.getTerminalCommandPrefix = getTerminalCommandPrefix;
    this.getSessionResource = getSessionResource;
    this.inputUri = inputUri;
  }
  get sessionResource() {
    return this.getSessionResource() ?? this.inputUri;
  }
  get attachments() {
    return this.contextAttachments.attachments;
  }
  get inlineReferences() {
    return [];
  }
  addAttachments(entries2) {
    this.contextAttachments.addAttachments(...entries2);
  }
  removeAttachments(ids) {
    for (const id2 of ids) {
      this.completionHandler.forgetReference(id2);
      this.contextAttachments.removeAttachment(id2);
    }
  }
  addInlineAttachment(entry, text2, range2) {
    const offsetRange = this.toOffsetRange(range2, text2.length);
    this.completionHandler.acceptCompletion({ ...entry, range: offsetRange }, text2, offsetRange);
  }
  addInlineReference(_reference) {
  }
  isTerminalCommandPaste(text2, range2) {
    const model = this.editor.getModel();
    const prefix = this.getTerminalCommandPrefix();
    if (!model || !prefix) {
      return false;
    }
    return isTerminalCommandPaste({
      prefix,
      pastedText: text2,
      currentValue: model.getValue(),
      selectionStartOffset: model.getOffsetAt(Range2.getStartPosition(range2)),
      selectionEndOffset: model.getOffsetAt(Range2.getEndPosition(range2))
    });
  }
  toOffsetRange(range2, length) {
    const model = this.editor.getModel();
    const start = model ? model.getOffsetAt(Range2.getStartPosition(range2)) : 0;
    return new OffsetRange(start, start + length);
  }
};
export { NewChatInputPasteTarget };
