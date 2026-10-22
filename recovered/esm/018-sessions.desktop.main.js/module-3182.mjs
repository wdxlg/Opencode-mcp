// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatActions.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1844.mjs";
import { ACTION_START, CTX_ASK_IN_CHAT_ENABLED, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT, CTX_INLINE_CHAT_HAS_NOTEBOOK_INLINE, CTX_INLINE_CHAT_POSSIBLE, CTX_INLINE_CHAT_V2_ENABLED } from "./module-1978.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { ChatEntitlementContextKeys } from "./module-0954.mjs";
import { EditorAction2 } from "./module-0097.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILogService } from "./module-0095.mjs";
import { InlineChatController } from "./module-2372.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { EmbeddedDiffEditorWidget } from "./module-2958.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatActions.ts
CommandsRegistry.registerCommandAlias("interactiveEditor.start", "inlineChat.start");

var START_INLINE_CHAT = registerIcon("start-inline-chat", Codicon.sparkle, localize(16152, null));

var inlineChatNotebooksOldEnabled = ContextKeyExpr.or(
  ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, CTX_INLINE_CHAT_HAS_NOTEBOOK_INLINE)
);

var inlineChatContextKey = ContextKeyExpr.and(
  ContextKeyExpr.or(inlineChatNotebooksOldEnabled, CTX_INLINE_CHAT_V2_ENABLED),
  CTX_INLINE_CHAT_POSSIBLE,
  EditorContextKeys.writable,
  EditorContextKeys.editorSimpleInput.negate()
);

MenuRegistry.appendMenuItem(MenuId.InlineChatEditorAffordance, {
  group: "0_chat",
  order: 1,
  when: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasNonEmptySelection, ContextKeyExpr.or(CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate(), CTX_ASK_IN_CHAT_ENABLED.negate()), ChatEntitlementContextKeys.Setup.hidden.negate()),
  command: {
    id: ACTION_START,
    title: localize(16144, null),
    shortTitle: localize(16145, null),
    icon: Codicon.sparkle
  }
});

var AbstractInlineChatAction = class _AbstractInlineChatAction extends EditorAction2 {
  static {
    this.category = localize2(16140, "Inline Chat");
  }
  constructor(desc) {
    const massageMenu = (menu) => {
      if (Array.isArray(menu)) {
        for (const entry of menu) {
          entry.when = ContextKeyExpr.and(CTX_INLINE_CHAT_V2_ENABLED, entry.when);
        }
      } else if (menu) {
        menu.when = ContextKeyExpr.and(CTX_INLINE_CHAT_V2_ENABLED, menu.when);
      }
    };
    if (Array.isArray(desc.menu)) {
      massageMenu(desc.menu);
    } else {
      massageMenu(desc.menu);
    }
    super({
      ...desc,
      category: _AbstractInlineChatAction.category,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_V2_ENABLED, desc.precondition)
    });
  }
  runEditorCommand(accessor, editor, ..._args) {
    const editorService = accessor.get(IEditorService);
    const logService = accessor.get(ILogService);
    let ctrl = InlineChatController.get(editor);
    if (!ctrl) {
      const { activeTextEditorControl } = editorService;
      if (isCodeEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl;
      } else if (isDiffEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl.getModifiedEditor();
      }
      ctrl = InlineChatController.get(editor);
    }
    if (!ctrl) {
      logService.warn("[IE] NO controller found for action", this.desc.id, editor.getModel()?.uri);
      return;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
      editor = editor.getParentEditor();
    }
    if (!ctrl) {
      for (const diffEditor of accessor.get(ICodeEditorService).listDiffEditors()) {
        if (diffEditor.getOriginalEditor() === editor || diffEditor.getModifiedEditor() === editor) {
          if (diffEditor instanceof EmbeddedDiffEditorWidget) {
            this.runEditorCommand(accessor, diffEditor.getParentEditor(), ..._args);
          }
        }
      }
      return;
    }
    this.runInlineChatCommand(accessor, ctrl, editor, ..._args);
  }
};
export { START_INLINE_CHAT, inlineChatNotebooksOldEnabled, inlineChatContextKey, AbstractInlineChatAction };
