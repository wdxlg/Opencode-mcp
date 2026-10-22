// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatAccessibilityHelp.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { CTX_INLINE_CHAT_RESPONSE_FOCUSED } from "./module-2001.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { getChatAccessibilityHelpProvider } from "./module-2532.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatAccessibilityHelp.ts
var InlineChatAccessibilityHelp = class {
  constructor() {
    this.priority = 106;
    this.name = "inlineChat";
    this.type = "help" /* Help */;
    this.when = ContextKeyExpr.or(CTX_INLINE_CHAT_RESPONSE_FOCUSED, ChatContextKeys.inputHasFocus);
  }
  getProvider(accessor) {
    const codeEditor = accessor.get(ICodeEditorService).getActiveCodeEditor() || accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (!codeEditor) {
      return;
    }
    return getChatAccessibilityHelpProvider(accessor, codeEditor, "inlineChat");
  }
};
export { InlineChatAccessibilityHelp };
