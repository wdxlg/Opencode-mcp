// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/toggleColumnSelection.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { Position } from "./module-0079.mjs";
import { CoreNavigationCommands } from "./module-0157.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/workbench/contrib/codeEditor/browser/toggleColumnSelection.ts
var ToggleColumnSelectionAction = class _ToggleColumnSelectionAction extends Action2 {
  static {
    this.ID = "editor.action.toggleColumnSelection";
  }
  constructor() {
    super({
      id: _ToggleColumnSelectionAction.ID,
      title: {
        ...localize2(13828, "Toggle Column Selection Mode"),
        mnemonicTitle: localize(13827, null)
      },
      f1: true,
      toggled: ContextKeyExpr.equals("config.editor.columnSelection", true),
      menu: {
        id: MenuId.MenubarSelectionMenu,
        group: "4_config",
        order: 2
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const codeEditorService = accessor.get(ICodeEditorService);
    const oldValue = configurationService.getValue("editor.columnSelection");
    const codeEditor = this._getCodeEditor(codeEditorService);
    await configurationService.updateValue("editor.columnSelection", !oldValue);
    const newValue = configurationService.getValue("editor.columnSelection");
    if (!codeEditor || codeEditor !== this._getCodeEditor(codeEditorService) || oldValue === newValue || !codeEditor.hasModel() || typeof oldValue !== "boolean" || typeof newValue !== "boolean") {
      return;
    }
    const viewModel = codeEditor._getViewModel();
    if (codeEditor.getOption(28 /* columnSelection */)) {
      const selection = codeEditor.getSelection();
      const modelSelectionStart = new Position(selection.selectionStartLineNumber, selection.selectionStartColumn);
      const viewSelectionStart = viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelSelectionStart);
      const modelPosition = new Position(selection.positionLineNumber, selection.positionColumn);
      const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, {
        position: modelSelectionStart,
        viewPosition: viewSelectionStart
      });
      const visibleColumn = viewModel.cursorConfig.visibleColumnFromColumn(viewModel, viewPosition);
      CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
        position: modelPosition,
        viewPosition,
        doColumnSelect: true,
        mouseColumn: visibleColumn + 1
      });
    } else {
      const columnSelectData = viewModel.getCursorColumnSelectData();
      const fromViewColumn = viewModel.cursorConfig.columnFromVisibleColumn(viewModel, columnSelectData.fromViewLineNumber, columnSelectData.fromViewVisualColumn);
      const fromPosition = viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(columnSelectData.fromViewLineNumber, fromViewColumn));
      const toViewColumn = viewModel.cursorConfig.columnFromVisibleColumn(viewModel, columnSelectData.toViewLineNumber, columnSelectData.toViewVisualColumn);
      const toPosition = viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(columnSelectData.toViewLineNumber, toViewColumn));
      codeEditor.setSelection(new Selection(fromPosition.lineNumber, fromPosition.column, toPosition.lineNumber, toPosition.column));
    }
  }
  _getCodeEditor(codeEditorService) {
    const codeEditor = codeEditorService.getFocusedCodeEditor();
    if (codeEditor) {
      return codeEditor;
    }
    return codeEditorService.getActiveCodeEditor();
  }
};

registerAction2(ToggleColumnSelectionAction);
export { ToggleColumnSelectionAction };
