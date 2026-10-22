// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingEditorAccessibility.ts
import { DisposableStore } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatEditingService } from "./module-1082.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingEditorAccessibility.ts
var ChatEditingEditorAccessibility = class {
  constructor(chatEditingService, editorService, accessibilityService) {
    this._store = new DisposableStore();
    const activeUri = observableFromEvent(this, editorService.onDidActiveEditorChange, () => editorService.activeEditorPane?.input?.resource);
    this._store.add(autorun((r2) => {
      const editor = activeUri.read(r2);
      if (!editor) {
        return;
      }
      const entry = chatEditingService.editingSessionsObs.read(r2).find((session) => session.readEntry(editor, r2));
      if (entry) {
        accessibilityService.playSignal(AccessibilitySignal.chatEditModifiedFile);
      }
    }));
  }
  static {
    this.ID = "chat.edits.accessibilty";
  }
  dispose() {
    this._store.dispose();
  }
};

ChatEditingEditorAccessibility = __decorateClass([
  __decorateParam(0, IChatEditingService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IAccessibilitySignalService)
], ChatEditingEditorAccessibility);
export { ChatEditingEditorAccessibility };
