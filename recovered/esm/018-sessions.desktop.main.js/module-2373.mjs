// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/notebookIndentationActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { isNotebookEditorInput } from "./module-0940.mjs";
import { NotebookSetting } from "./module-0911.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IBulkEditService, ResourceTextEdit } from "./module-0537.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/notebookIndentationActions.ts
var NotebookIndentUsingTabs = class _NotebookIndentUsingTabs extends Action2 {
  static {
    this.ID = "notebook.action.indentUsingTabs";
  }
  constructor() {
    super({
      id: _NotebookIndentUsingTabs.ID,
      title: localize(17621, null),
      precondition: void 0
    });
  }
  run(accessor, ...args2) {
    changeNotebookIndentation(accessor, false, false);
  }
};

var NotebookIndentUsingSpaces = class _NotebookIndentUsingSpaces extends Action2 {
  static {
    this.ID = "notebook.action.indentUsingSpaces";
  }
  constructor() {
    super({
      id: _NotebookIndentUsingSpaces.ID,
      title: localize(17620, null),
      precondition: void 0
    });
  }
  run(accessor, ...args2) {
    changeNotebookIndentation(accessor, true, false);
  }
};

var NotebookChangeTabDisplaySize = class _NotebookChangeTabDisplaySize extends Action2 {
  static {
    this.ID = "notebook.action.changeTabDisplaySize";
  }
  constructor() {
    super({
      id: _NotebookChangeTabDisplaySize.ID,
      title: localize(17616, null),
      precondition: void 0
    });
  }
  run(accessor, ...args2) {
    changeNotebookIndentation(accessor, true, true);
  }
};

var NotebookIndentationToSpacesAction = class _NotebookIndentationToSpacesAction extends Action2 {
  static {
    this.ID = "notebook.action.convertIndentationToSpaces";
  }
  constructor() {
    super({
      id: _NotebookIndentationToSpacesAction.ID,
      title: localize(17618, null),
      precondition: void 0
    });
  }
  run(accessor, ...args2) {
    convertNotebookIndentation(accessor, true);
  }
};

var NotebookIndentationToTabsAction = class _NotebookIndentationToTabsAction extends Action2 {
  static {
    this.ID = "notebook.action.convertIndentationToTabs";
  }
  constructor() {
    super({
      id: _NotebookIndentationToTabsAction.ID,
      title: localize(17619, null),
      precondition: void 0
    });
  }
  run(accessor, ...args2) {
    convertNotebookIndentation(accessor, false);
  }
};

function changeNotebookIndentation(accessor, insertSpaces, displaySizeOnly) {
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const notebookEditorService = accessor.get(INotebookEditorService);
  const quickInputService = accessor.get(IQuickInputService);
  const activeInput = editorService.activeEditorPane?.input;
  const isNotebook = isNotebookEditorInput(activeInput);
  if (!isNotebook) {
    return;
  }
  const notebookEditor = notebookEditorService.retrieveExistingWidgetFromURI(activeInput.resource)?.value;
  if (!notebookEditor) {
    return;
  }
  const picks = [1, 2, 3, 4, 5, 6, 7, 8].map((n2) => ({
    id: n2.toString(),
    label: n2.toString()
  }));
  const initialConfig = configurationService.getValue(NotebookSetting.cellEditorOptionsCustomizations);
  const initialInsertSpaces = initialConfig["editor.insertSpaces"];
  delete initialConfig["editor.indentSize"];
  delete initialConfig["editor.tabSize"];
  delete initialConfig["editor.insertSpaces"];
  setTimeout(
    () => {
      quickInputService.pick(picks, { placeHolder: localize(17622, null) }).then((pick) => {
        if (pick) {
          const pickedVal = parseInt(pick.label, 10);
          if (displaySizeOnly) {
            configurationService.updateValue(NotebookSetting.cellEditorOptionsCustomizations, {
              ...initialConfig,
              "editor.tabSize": pickedVal,
              "editor.indentSize": pickedVal,
              "editor.insertSpaces": initialInsertSpaces
            });
          } else {
            configurationService.updateValue(NotebookSetting.cellEditorOptionsCustomizations, {
              ...initialConfig,
              "editor.tabSize": pickedVal,
              "editor.indentSize": pickedVal,
              "editor.insertSpaces": insertSpaces
            });
          }
        }
      });
    },
    50
    /* quick input is sensitive to being opened so soon after another */
  );
}

function convertNotebookIndentation(accessor, tabsToSpaces) {
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const logService = accessor.get(ILogService);
  const textModelService = accessor.get(ITextModelService);
  const notebookEditorService = accessor.get(INotebookEditorService);
  const bulkEditService = accessor.get(IBulkEditService);
  const activeInput = editorService.activeEditorPane?.input;
  const isNotebook = isNotebookEditorInput(activeInput);
  if (!isNotebook) {
    return;
  }
  const notebookTextModel = notebookEditorService.retrieveExistingWidgetFromURI(activeInput.resource)?.value?.textModel;
  if (!notebookTextModel) {
    return;
  }
  const disposable = new DisposableStore();
  try {
    Promise.all(notebookTextModel.cells.map(async (cell) => {
      const ref = await textModelService.createModelReference(cell.uri);
      disposable.add(ref);
      const textEditorModel = ref.object.textEditorModel;
      const modelOpts = cell.textModel?.getOptions();
      if (!modelOpts) {
        return;
      }
      const edits = getIndentationEditOperations2(textEditorModel, modelOpts.tabSize, tabsToSpaces);
      bulkEditService.apply(edits, { label: localize(17617, null), code: "undoredo.convertIndentation" });
    })).then(() => {
      const initialConfig = configurationService.getValue(NotebookSetting.cellEditorOptionsCustomizations);
      const initialIndentSize = initialConfig["editor.indentSize"];
      const initialTabSize = initialConfig["editor.tabSize"];
      delete initialConfig["editor.indentSize"];
      delete initialConfig["editor.tabSize"];
      delete initialConfig["editor.insertSpaces"];
      configurationService.updateValue(NotebookSetting.cellEditorOptionsCustomizations, {
        ...initialConfig,
        "editor.tabSize": initialTabSize,
        "editor.indentSize": initialIndentSize,
        "editor.insertSpaces": tabsToSpaces
      });
      disposable.dispose();
    });
  } catch {
    logService.error("Failed to convert indentation to spaces for notebook cells.");
  }
}

function getIndentationEditOperations2(model, tabSize, tabsToSpaces) {
  if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
    return [];
  }
  let spaces2 = "";
  for (let i2 = 0; i2 < tabSize; i2++) {
    spaces2 += " ";
  }
  const spacesRegExp = new RegExp(spaces2, "gi");
  const edits = [];
  for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
    let lastIndentationColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    if (lastIndentationColumn === 0) {
      lastIndentationColumn = model.getLineMaxColumn(lineNumber);
    }
    if (lastIndentationColumn === 1) {
      continue;
    }
    const originalIndentationRange = new Range2(lineNumber, 1, lineNumber, lastIndentationColumn);
    const originalIndentation = model.getValueInRange(originalIndentationRange);
    const newIndentation = tabsToSpaces ? originalIndentation.replace(/\t/ig, spaces2) : originalIndentation.replace(spacesRegExp, "	");
    edits.push(new ResourceTextEdit(model.uri, { range: originalIndentationRange, text: newIndentation }));
  }
  return edits;
}

registerAction2(NotebookIndentUsingSpaces);

registerAction2(NotebookIndentUsingTabs);

registerAction2(NotebookChangeTabDisplaySize);

registerAction2(NotebookIndentationToSpacesAction);

registerAction2(NotebookIndentationToTabsAction);
export { changeNotebookIndentation, convertNotebookIndentation, getIndentationEditOperations2, NotebookIndentUsingTabs, NotebookIndentUsingSpaces, NotebookChangeTabDisplaySize, NotebookIndentationToSpacesAction, NotebookIndentationToTabsAction };
