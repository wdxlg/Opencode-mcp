// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/chat/cellChatActions.ts
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { NotebookSetting } from "./module-0911.mjs";
import { insertNewCell } from "./module-1977.mjs";
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { NotebookAction, getContextFromActiveEditor, getEditorFromArgsOrActivePane } from "./module-1845.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED } from "./module-1844.mjs";
import { InputFocusedContextKey } from "./module-0635.mjs";
import { CTX_NOTEBOOK_CHAT_HAS_AGENT } from "./module-2392.mjs";
import { KeyChord } from "./module-0019.mjs";
import { Codicon } from "./module-0085.mjs";
import { EditorAction2 } from "./module-0097.mjs";
import { CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, CTX_INLINE_CHAT_VISIBLE } from "./module-1978.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IEditorService } from "./module-0935.mjs";
import { InlineChatController } from "./module-2372.mjs";
import { Iterable } from "./module-0011.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/chat/cellChatActions.ts
async function startChat(accessor, context2, index2, input, autoSend, source) {
  const configurationService = accessor.get(IConfigurationService);
  const commandService = accessor.get(ICommandService);
  if (configurationService.getValue(NotebookSetting.cellGenerate) || configurationService.getValue(NotebookSetting.cellChat)) {
    const activeCell = context2.notebookEditor.getActiveCell();
    const targetCell = activeCell?.getTextLength() === 0 && source !== "insertToolbar" ? activeCell : await insertNewCell(accessor, context2, 2 /* Code */, "below", true);
    if (targetCell) {
      targetCell.enableAutoLanguageDetection();
      await context2.notebookEditor.revealFirstLineIfOutsideViewport(targetCell);
      const codeEditor = context2.notebookEditor.codeEditors.find((ce) => ce[0] === targetCell)?.[1];
      if (codeEditor) {
        codeEditor.focus();
        commandService.executeCommand("inlineChat.start");
      }
    }
  }
}

registerAction2(class extends NotebookAction {
  constructor() {
    super(
      {
        id: "notebook.cell.chat.start",
        title: {
          value: "$(sparkle) " + localize(17526, null),
          original: "$(sparkle) Generate"
        },
        tooltip: localize(17527, null),
        metadata: {
          description: localize(17527, null),
          args: [
            {
              name: "args",
              schema: {
                type: "object",
                required: ["index"],
                properties: {
                  "index": {
                    type: "number"
                  },
                  "input": {
                    type: "string"
                  },
                  "autoSend": {
                    type: "boolean"
                  }
                }
              }
            }
          ]
        },
        f1: false,
        keybinding: {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
            ContextKeyExpr.not(InputFocusedContextKey),
            CTX_NOTEBOOK_CHAT_HAS_AGENT,
            ContextKeyExpr.or(
              ContextKeyExpr.equals(`config.${NotebookSetting.cellChat}`, true),
              ContextKeyExpr.equals(`config.${NotebookSetting.cellGenerate}`, true)
            )
          ),
          weight: 200 /* WorkbenchContrib */,
          primary: 2048 /* CtrlCmd */ | 39 /* KeyI */,
          secondary: [KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 39 /* KeyI */)]
        },
        menu: [
          {
            id: MenuId.NotebookCellBetween,
            group: "inline",
            order: -1,
            when: ContextKeyExpr.and(
              NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
              CTX_NOTEBOOK_CHAT_HAS_AGENT,
              ContextKeyExpr.or(
                ContextKeyExpr.equals(`config.${NotebookSetting.cellChat}`, true),
                ContextKeyExpr.equals(`config.${NotebookSetting.cellGenerate}`, true)
              )
            )
          }
        ]
      }
    );
  }
  getEditorContextFromArgsOrActive(accessor, ...args2) {
    const [firstArg] = args2;
    if (!firstArg) {
      const notebookEditor2 = getEditorFromArgsOrActivePane(accessor);
      if (!notebookEditor2) {
        return void 0;
      }
      const activeCell = notebookEditor2.getActiveCell();
      if (!activeCell) {
        return void 0;
      }
      return {
        cell: activeCell,
        notebookEditor: notebookEditor2,
        input: void 0,
        autoSend: void 0
      };
    }
    if (typeof firstArg !== "object" || typeof firstArg.index !== "number") {
      return void 0;
    }
    const notebookEditor = getEditorFromArgsOrActivePane(accessor);
    if (!notebookEditor) {
      return void 0;
    }
    const cell = firstArg.index <= 0 ? void 0 : notebookEditor.cellAt(firstArg.index - 1);
    return {
      cell,
      notebookEditor,
      input: firstArg.input,
      autoSend: firstArg.autoSend
    };
  }
  async runWithContext(accessor, context2) {
    const index2 = Math.max(0, context2.cell ? context2.notebookEditor.getCellIndex(context2.cell) + 1 : 0);
    await startChat(accessor, context2, index2, context2.input, context2.autoSend, context2.source);
  }
});

registerAction2(class extends NotebookAction {
  constructor() {
    super(
      {
        id: "notebook.cell.chat.startAtTop",
        title: {
          value: "$(sparkle) " + localize(17526, null),
          original: "$(sparkle) Generate"
        },
        tooltip: localize(17527, null),
        f1: false,
        menu: [
          {
            id: MenuId.NotebookCellListTop,
            group: "inline",
            order: -1,
            when: ContextKeyExpr.and(
              NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
              CTX_NOTEBOOK_CHAT_HAS_AGENT,
              ContextKeyExpr.or(
                ContextKeyExpr.equals(`config.${NotebookSetting.cellChat}`, true),
                ContextKeyExpr.equals(`config.${NotebookSetting.cellGenerate}`, true)
              )
            )
          }
        ]
      }
    );
  }
  async runWithContext(accessor, context2) {
    await startChat(accessor, context2, 0, "", false);
  }
});

MenuRegistry.appendMenuItem(MenuId.NotebookToolbar, {
  command: {
    id: "notebook.cell.chat.start",
    icon: Codicon.sparkle,
    title: localize(17524, null),
    tooltip: localize(17525, null)
  },
  order: -10,
  group: "navigation/add",
  when: ContextKeyExpr.and(
    NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
    ContextKeyExpr.notEquals("config.notebook.insertToolbarLocation", "betweenCells"),
    ContextKeyExpr.notEquals("config.notebook.insertToolbarLocation", "hidden"),
    CTX_NOTEBOOK_CHAT_HAS_AGENT,
    ContextKeyExpr.or(
      ContextKeyExpr.equals(`config.${NotebookSetting.cellChat}`, true),
      ContextKeyExpr.equals(`config.${NotebookSetting.cellGenerate}`, true)
    )
  )
});

var AcceptChangesAndRun = class extends EditorAction2 {
  constructor() {
    super({
      id: "notebook.inlineChat.acceptChangesAndRun",
      title: localize2(17521, "Accept and Run"),
      shortTitle: localize(17522, null),
      tooltip: localize(17523, null),
      icon: Codicon.check,
      f1: true,
      precondition: ContextKeyExpr.and(
        NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
        CTX_INLINE_CHAT_VISIBLE
      ),
      keybinding: void 0,
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "0_main",
        order: 2,
        when: ContextKeyExpr.and(
          NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true),
          ChatContextKeys.inputHasText.toNegated(),
          CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated()
        )
      }]
    });
  }
  runEditorCommand(accessor, codeEditor) {
    const editor = getContextFromActiveEditor(accessor.get(IEditorService));
    const ctrl = InlineChatController.get(codeEditor);
    if (!editor || !ctrl) {
      return;
    }
    const matchedCell = editor.notebookEditor.codeEditors.find((e4) => e4[1] === codeEditor);
    const cell = matchedCell?.[0];
    if (!cell) {
      return;
    }
    ctrl.acceptSession();
    return editor.notebookEditor.executeNotebookCells(Iterable.single(cell));
  }
};

registerAction2(AcceptChangesAndRun);
export { startChat, AcceptChangesAndRun };
