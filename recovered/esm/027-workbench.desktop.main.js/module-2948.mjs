// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatActions.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1868.mjs";
import { ACTION_ASK_IN_CHAT, ACTION_START, CTX_ASK_IN_CHAT_ENABLED, CTX_FIX_DIAGNOSTICS_ENABLED, CTX_INLINE_CHAT_AFFORDANCE_VISIBLE, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT, CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_HAS_NOTEBOOK_INLINE, CTX_INLINE_CHAT_OUTER_CURSOR_POSITION, CTX_INLINE_CHAT_POSSIBLE, CTX_INLINE_CHAT_TERMINATED, CTX_INLINE_CHAT_V2_ENABLED, CTX_INLINE_CHAT_VISIBLE } from "./module-2001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Action2, MenuId, MenuRegistry } from "./module-0092.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ILogService } from "./module-0095.mjs";
import { InlineChatController, InlineChatRunOptions } from "./module-2397.mjs";
import { ChatEntitlementContextKeys } from "./module-0953.mjs";
import { EditorAction2 } from "./module-0097.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { IEditorService } from "./module-0934.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { EmbeddedDiffEditorWidget } from "./module-2947.mjs";
import { ctxHasEditorModification, ctxHasRequestInProgress } from "./module-2057.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IChatEditingService } from "./module-1081.mjs";
import { IChatWidgetService } from "./module-0981.mjs";


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

var StartSessionAction = class extends Action2 {
  constructor() {
    super({
      id: ACTION_START,
      title: localize2(16150, "Open Inline Chat"),
      shortTitle: localize2(16151, "Inline Chat"),
      category: AbstractInlineChatAction.category,
      f1: true,
      precondition: ContextKeyExpr.and(inlineChatContextKey, ContextKeyExpr.or(CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate(), CTX_ASK_IN_CHAT_ENABLED.negate())),
      keybinding: {
        when: ContextKeyExpr.and(
          EditorContextKeys.focus,
          inlineChatContextKey,
          ContextKeyExpr.or(CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate(), CTX_ASK_IN_CHAT_ENABLED.negate())
        ),
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 39 /* KeyI */
      },
      icon: START_INLINE_CHAT,
      menu: [{
        id: MenuId.EditorContext,
        group: "1_chat",
        order: 3,
        when: ContextKeyExpr.and(inlineChatContextKey, ContextKeyExpr.or(CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate(), CTX_ASK_IN_CHAT_ENABLED.negate()))
      }, {
        id: MenuId.ChatTitleBarMenu,
        group: "a_open",
        order: 3
      }]
    });
  }
  run(accessor, ...args2) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getActiveCodeEditor();
    if (!editor || editor.isSimpleWidget) {
      return;
    }
    return editor.invokeWithinContext((editorAccessor) => {
      const kbService = editorAccessor.get(IContextKeyService);
      const logService = editorAccessor.get(ILogService);
      const enabled = kbService.contextMatchesRules(this.desc.precondition ?? void 0);
      if (!enabled) {
        logService.debug(`[EditorAction2] NOT running command because its precondition is FALSE`, this.desc.id, this.desc.precondition?.serialize());
        return;
      }
      return this._runEditorCommand(editorAccessor, editor, ...args2);
    });
  }
  async _runEditorCommand(accessor, editor, ...args2) {
    const ctrl = InlineChatController.get(editor);
    if (!ctrl) {
      return;
    }
    let options3;
    const arg = args2[0];
    if (arg && InlineChatRunOptions.isInlineChatRunOptions(arg)) {
      options3 = arg;
    }
    await ctrl?.run({ ...options3 });
  }
};

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

var FocusInlineChat = class extends EditorAction2 {
  constructor() {
    super({
      id: "inlineChat.focus",
      title: localize2(16147, "Focus Input"),
      f1: true,
      category: AbstractInlineChatAction.category,
      precondition: ContextKeyExpr.and(EditorContextKeys.editorTextFocus, CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_FOCUSED.negate(), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      keybinding: [{
        weight: 0 /* EditorCore */ + 10,
        // win against core_command
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo("above"), EditorContextKeys.isEmbeddedDiffEditor.negate()),
        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */
      }, {
        weight: 0 /* EditorCore */ + 10,
        // win against core_command
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo("below"), EditorContextKeys.isEmbeddedDiffEditor.negate()),
        primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */
      }]
    });
  }
  runEditorCommand(_accessor, editor, ..._args) {
    InlineChatController.get(editor)?.focus();
  }
};

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

var FixDiagnosticsAction = class extends AbstractInlineChatAction {
  constructor() {
    super({
      id: "inlineChat.fixDiagnostics",
      title: localize2(16146, "Fix"),
      icon: Codicon.editSparkle,
      precondition: ContextKeyExpr.and(CTX_FIX_DIAGNOSTICS_ENABLED, EditorContextKeys.selectionHasDiagnostics, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate()),
      menu: [{
        id: MenuId.InlineChatEditorAffordance,
        group: "1_quickfix",
        order: 100,
        when: ContextKeyExpr.and(CTX_FIX_DIAGNOSTICS_ENABLED, EditorContextKeys.selectionHasDiagnostics, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate())
      }, {
        id: MenuId.ChatEditorInlineMenu,
        group: "2_chat",
        order: 1,
        when: ContextKeyExpr.and(CTX_FIX_DIAGNOSTICS_ENABLED, EditorContextKeys.selectionHasDiagnostics, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate())
      }, {
        id: MenuId.MarkerHoverStatusBar,
        group: "1_fix",
        order: 1,
        when: ContextKeyExpr.and(CTX_FIX_DIAGNOSTICS_ENABLED, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate()),
        precondition: null
      }]
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.run({ autoSend: true, attachDiagnostics: true });
  }
};

var KeepOrUndoSessionAction = class extends AbstractInlineChatAction {
  constructor(_keep, desc) {
    super(desc);
    this._keep = _keep;
  }
  async runInlineChatCommand(_accessor, ctrl, editor, ..._args) {
    if (this._keep) {
      await ctrl.acceptSession();
    } else {
      await ctrl.rejectSession();
    }
    if (editor.hasModel()) {
      editor.setSelection(editor.getSelection().collapseToStart());
    }
  }
};

var KeepSessionAction2 = class extends KeepOrUndoSessionAction {
  constructor() {
    super(true, {
      id: "inlineChat2.keep",
      title: localize2(16148, "Keep"),
      f1: true,
      icon: Codicon.check,
      precondition: ContextKeyExpr.and(
        CTX_INLINE_CHAT_VISIBLE,
        ctxHasRequestInProgress.negate(),
        ctxHasEditorModification
      ),
      keybinding: [{
        when: ContextKeyExpr.and(ChatContextKeys.inputHasFocus, ChatContextKeys.inputHasText.negate()),
        weight: 200 /* WorkbenchContrib */,
        primary: 3 /* Enter */
      }, {
        weight: 200 /* WorkbenchContrib */ + 10,
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */
      }],
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.and(
          ctxHasRequestInProgress.negate(),
          ctxHasEditorModification,
          ChatContextKeys.inputHasText.toNegated()
        )
      }]
    });
  }
};

var UndoAndCloseSessionAction2 = class extends KeepOrUndoSessionAction {
  constructor() {
    super(false, {
      id: "inlineChat2.close",
      title: localize2(16141, "Close"),
      f1: true,
      icon: Codicon.close,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE),
      keybinding: [{
        when: ContextKeyExpr.or(
          ContextKeyExpr.and(EditorContextKeys.focus, ctxHasEditorModification.negate()),
          ChatContextKeys.inputHasFocus
        ),
        weight: 200 /* WorkbenchContrib */ + 1,
        primary: 9 /* Escape */
      }],
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 100
      }]
    });
  }
};

var CancelSessionAction = class extends KeepOrUndoSessionAction {
  constructor() {
    super(false, {
      id: "inlineChat2.cancel",
      title: localize2(16139, "Cancel"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, ctxHasRequestInProgress),
      keybinding: [{
        when: ContextKeyExpr.or(
          EditorContextKeys.focus,
          ChatContextKeys.inputHasFocus
        ),
        weight: 200 /* WorkbenchContrib */ + 1,
        primary: 9 /* Escape */
      }],
      menu: []
    });
  }
};

var ContinueInlineChatInChatViewAction = class extends AbstractInlineChatAction {
  constructor() {
    super({
      id: "inlineChat2.continueInChat",
      title: localize2(16142, "Ask in Chat"),
      icon: Codicon.chatSparkle,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_TERMINATED),
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 2,
        when: CTX_INLINE_CHAT_TERMINATED
      }]
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor) {
    await ctrl.continueSessionInChat();
  }
};

var RephraseInlineChatSessionAction = class extends AbstractInlineChatAction {
  constructor() {
    super({
      id: "inlineChat2.rephrase",
      title: localize2(16149, "Rephrase"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_TERMINATED),
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 1,
        when: CTX_INLINE_CHAT_TERMINATED
      }]
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor) {
    await ctrl.rephraseSession();
  }
};

var AskInChatAction = class extends EditorAction2 {
  constructor() {
    super({
      id: ACTION_ASK_IN_CHAT,
      title: localize2(16138, "Ask in Chat"),
      category: AbstractInlineChatAction.category,
      f1: true,
      precondition: ContextKeyExpr.and(inlineChatContextKey, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT, CTX_ASK_IN_CHAT_ENABLED),
      keybinding: {
        when: EditorContextKeys.focus,
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 39 /* KeyI */
      },
      icon: Codicon.chatSparkle,
      menu: [{
        id: MenuId.EditorContext,
        group: "1_chat",
        order: 3,
        when: ContextKeyExpr.and(inlineChatContextKey, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT, CTX_ASK_IN_CHAT_ENABLED)
      }, {
        id: MenuId.InlineChatEditorAffordance,
        group: "0_chat",
        order: 1,
        when: ContextKeyExpr.and(EditorContextKeys.hasNonEmptySelection, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT, CTX_ASK_IN_CHAT_ENABLED)
      }]
    });
  }
  async runEditorCommand(accessor, editor) {
    const chatEditingService = accessor.get(IChatEditingService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    if (!editor.hasModel()) {
      return;
    }
    const session = chatEditingService.editingSessionsObs.get().find((s) => s.getEntry(editor.getModel().uri));
    if (!session) {
      return;
    }
    const widget = await chatWidgetService.openSession(session.chatSessionResource);
    if (!widget) {
      return;
    }
    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      await widget.attachmentModel.addFile(editor.getModel().uri, selection);
    }
  }
};

var DismissEditorAffordanceAction = class extends EditorAction2 {
  constructor() {
    super({
      id: "inlineChat.dismissEditorAffordance",
      title: localize2(16143, "Dismiss Editor Affordance"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_AFFORDANCE_VISIBLE, ContextKeyExpr.equals("config.inlineChat.affordance", "editor")),
      keybinding: {
        when: EditorContextKeys.editorTextFocus,
        weight: 100 /* EditorContrib */,
        primary: 9 /* Escape */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    InlineChatController.get(editor)?.inputOverlayWidget.dismiss();
  }
};
export { START_INLINE_CHAT, inlineChatNotebooksOldEnabled, inlineChatContextKey, StartSessionAction, FocusInlineChat, AbstractInlineChatAction, FixDiagnosticsAction, KeepOrUndoSessionAction, KeepSessionAction2, UndoAndCloseSessionAction2, CancelSessionAction, ContinueInlineChatInChatViewAction, RephraseInlineChatSessionAction, AskInChatAction, DismissEditorAffordanceAction };
