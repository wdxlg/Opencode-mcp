// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/cellDiagnostics/cellDiagnosticsActions.ts
import { registerAction2 } from "./module-0092.mjs";
import { NotebookCellAction, findTargetCellEditor } from "./module-1845.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS } from "./module-1844.mjs";
import { CodeCellViewModel } from "./module-1877.mjs";
import { Range2 } from "./module-0106.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { InlineChatController } from "./module-2372.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/cellDiagnostics/cellDiagnosticsActions.ts
var OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID = "notebook.cell.openFailureActions";

var FIX_CELL_ERROR_COMMAND_ID = "notebook.cell.chat.fixError";

var EXPLAIN_CELL_ERROR_COMMAND_ID = "notebook.cell.chat.explainError";

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID,
      title: localize2(17404, "Show Cell Failure Actions"),
      precondition: ContextKeyExpr.and(NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_EDITOR_FOCUSED.toNegated()),
      f1: true,
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_EDITOR_FOCUSED.toNegated()),
        primary: 2048 /* CtrlCmd */ | 89 /* Period */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    if (context2.cell instanceof CodeCellViewModel) {
      const error = context2.cell.executionErrorDiagnostic.get();
      if (error?.location) {
        const location2 = Range2.lift({
          startLineNumber: error.location.startLineNumber + 1,
          startColumn: error.location.startColumn + 1,
          endLineNumber: error.location.endLineNumber + 1,
          endColumn: error.location.endColumn + 1
        });
        context2.notebookEditor.setCellEditorSelection(context2.cell, Range2.lift(location2));
        const editor = findTargetCellEditor(context2, context2.cell);
        if (editor) {
          const controller = CodeActionController.get(editor);
          controller?.manualTriggerAtCurrentPosition(
            localize(17403, null),
            "other (default)" /* Default */,
            { include: CodeActionKind.QuickFix }
          );
        }
      }
    }
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: FIX_CELL_ERROR_COMMAND_ID,
      title: localize2(17406, "Fix Cell Error"),
      precondition: ContextKeyExpr.and(NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_EDITOR_FOCUSED.toNegated()),
      f1: true
    });
  }
  async runWithContext(accessor, context2) {
    if (context2.cell instanceof CodeCellViewModel) {
      const error = context2.cell.executionErrorDiagnostic.get();
      if (error?.location) {
        const location2 = Range2.lift({
          startLineNumber: error.location.startLineNumber + 1,
          startColumn: error.location.startColumn + 1,
          endLineNumber: error.location.endLineNumber + 1,
          endColumn: error.location.endColumn + 1
        });
        context2.notebookEditor.setCellEditorSelection(context2.cell, Range2.lift(location2));
        const editor = findTargetCellEditor(context2, context2.cell);
        if (editor) {
          const controller = InlineChatController.get(editor);
          const message = error.name ? `${error.name}: ${error.message}` : error.message;
          if (controller) {
            await controller.run({ message: "/fix " + message, initialRange: location2, autoSend: true });
          }
        }
      }
    }
  }
});

registerAction2(class extends NotebookCellAction {
  constructor() {
    super({
      id: EXPLAIN_CELL_ERROR_COMMAND_ID,
      title: localize2(17405, "Explain Cell Error"),
      precondition: ContextKeyExpr.and(NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_EDITOR_FOCUSED.toNegated()),
      f1: true
    });
  }
  async runWithContext(accessor, context2) {
    if (context2.cell instanceof CodeCellViewModel) {
      const error = context2.cell.executionErrorDiagnostic.get();
      if (error?.message) {
        const widgetService = accessor.get(IChatWidgetService);
        const chatWidget = await widgetService.revealWidget();
        const message = error.name ? `${error.name}: ${error.message}` : error.message;
        chatWidget?.acceptInput("@workspace /explain " + message);
      }
    }
  }
});
export { OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID, FIX_CELL_ERROR_COMMAND_ID, EXPLAIN_CELL_ERROR_COMMAND_ID };
