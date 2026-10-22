// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/find/notebookFind.ts
import { registerNotebookContribution } from "./module-1870.mjs";
import { NotebookFindContrib } from "./module-2402.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1844.mjs";
import { CONTEXT_FIND_WIDGET_VISIBLE } from "./module-0595.mjs";
import { IEditorService } from "./module-0935.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { NotebookMultiCellAction } from "./module-1845.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Schemas } from "./module-0033.mjs";
import { CellUri } from "./module-0911.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { NextMatchFindAction, PreviousMatchFindAction, StartFindAction, StartFindReplaceAction, getSelectionSearchString } from "./module-0677.mjs";
import { ICodeEditorService } from "./module-0078.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/find/notebookFind.ts
registerNotebookContribution(NotebookFindContrib.id, NotebookFindContrib);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.hideFind",
      title: localize2(17437, "Hide Find in Notebook"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, CONTEXT_FIND_WIDGET_VISIBLE),
        primary: 9 /* Escape */,
        weight: 100 /* EditorContrib */ + 5
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(NotebookFindContrib.id);
    controller.hide();
    editor.focus();
  }
});

registerAction2(class extends NotebookMultiCellAction {
  constructor() {
    super({
      id: "notebook.find",
      title: localize2(17436, "Find in Notebook"),
      keybinding: {
        when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.or(NOTEBOOK_IS_ACTIVE_EDITOR, INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR), EditorContextKeys.focus.toNegated()),
        primary: 36 /* KeyF */ | 2048 /* CtrlCmd */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async runWithContext(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(NotebookFindContrib.id);
    controller.show(void 0, { findScope: { findScopeType: "none" /* None */ } });
  }
});

function notebookContainsTextModel(uri4, textModel) {
  if (textModel.uri.scheme === Schemas.vscodeNotebookCell) {
    const cellUri = CellUri.parse(textModel.uri);
    if (cellUri && isEqual2(cellUri.notebook, uri4)) {
      return true;
    }
  }
  return false;
}

function getSearchStringOptions(editor, opts) {
  if (opts.seedSearchStringFromSelection === "single") {
    const selectionSearchString = getSelectionSearchString(editor, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
    if (selectionSearchString) {
      return {
        searchString: selectionSearchString,
        selection: editor.getSelection()
      };
    }
  } else if (opts.seedSearchStringFromSelection === "multiple" && !opts.updateSearchScope) {
    const selectionSearchString = getSelectionSearchString(editor, opts.seedSearchStringFromSelection);
    if (selectionSearchString) {
      return {
        searchString: selectionSearchString,
        selection: editor.getSelection()
      };
    }
  }
  return void 0;
}

function isNotebookEditorValidForSearch(accessor, editor, codeEditor) {
  if (!editor) {
    return false;
  }
  if (!codeEditor.hasModel()) {
    return false;
  }
  if (!editor.hasEditorFocus() && !editor.hasWebviewFocus()) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const textEditor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
    if (editor.hasModel() && textEditor && textEditor.hasModel() && notebookContainsTextModel(editor.textModel.uri, textEditor.getModel())) {
      return true;
    } else {
      return false;
    }
  }
  return true;
}

function openFindWidget(controller, editor, codeEditor, focusWidget = true) {
  if (!editor || !codeEditor || !controller) {
    return false;
  }
  if (!codeEditor.hasModel()) {
    return false;
  }
  const searchStringOptions = getSearchStringOptions(codeEditor, {
    forceRevealReplace: false,
    seedSearchStringFromSelection: codeEditor.getOption(50 /* find */).seedSearchStringFromSelection !== "never" ? "single" : "none",
    seedSearchStringFromNonEmptySelection: codeEditor.getOption(50 /* find */).seedSearchStringFromSelection === "selection",
    seedSearchStringFromGlobalClipboard: codeEditor.getOption(50 /* find */).globalFindClipboard,
    shouldFocus: 1 /* FocusFindInput */,
    shouldAnimate: true,
    updateSearchScope: false,
    loop: codeEditor.getOption(50 /* find */).loop
  });
  let options3 = void 0;
  const uri4 = codeEditor.getModel().uri;
  const data = CellUri.parse(uri4);
  if (searchStringOptions?.selection && data) {
    const cell = editor.getCellByHandle(data.handle);
    if (cell) {
      options3 = {
        searchStringSeededFrom: { cell, range: searchStringOptions.selection },
        focus: focusWidget
      };
    }
  } else {
    options3 = { focus: focusWidget };
  }
  controller.show(searchStringOptions?.searchString, options3);
  return true;
}

function findWidgetAction(accessor, codeEditor, next) {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!isNotebookEditorValidForSearch(accessor, editor, codeEditor)) {
    return false;
  }
  const controller = editor?.getContribution(NotebookFindContrib.id);
  if (!controller) {
    return false;
  }
  if (controller.isVisible()) {
    next ? controller.findNext() : controller.findPrevious();
    return true;
  } else {
    return openFindWidget(controller, editor, codeEditor, false);
  }
}

async function runFind(accessor, next) {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!editor) {
    return;
  }
  const controller = editor.getContribution(NotebookFindContrib.id);
  if (controller && controller.isVisible()) {
    next ? controller.findNext() : controller.findPrevious();
  }
}

StartFindAction.addImplementation(100, (accessor, codeEditor, args2) => {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!isNotebookEditorValidForSearch(accessor, editor, codeEditor)) {
    return false;
  }
  const controller = editor?.getContribution(NotebookFindContrib.id);
  return openFindWidget(controller, editor, codeEditor, true);
});

StartFindReplaceAction.addImplementation(100, (accessor, codeEditor, args2) => {
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  if (!editor) {
    return false;
  }
  if (!codeEditor.hasModel()) {
    return false;
  }
  const controller = editor.getContribution(NotebookFindContrib.id);
  const searchStringOptions = getSearchStringOptions(codeEditor, {
    forceRevealReplace: false,
    seedSearchStringFromSelection: codeEditor.getOption(50 /* find */).seedSearchStringFromSelection !== "never" ? "single" : "none",
    seedSearchStringFromNonEmptySelection: codeEditor.getOption(50 /* find */).seedSearchStringFromSelection === "selection",
    seedSearchStringFromGlobalClipboard: codeEditor.getOption(50 /* find */).globalFindClipboard,
    shouldFocus: 1 /* FocusFindInput */,
    shouldAnimate: true,
    updateSearchScope: false,
    loop: codeEditor.getOption(50 /* find */).loop
  });
  if (controller) {
    controller.replace(searchStringOptions?.searchString);
    return true;
  }
  return false;
});

NextMatchFindAction.addImplementation(100, (accessor, codeEditor, args2) => {
  return findWidgetAction(accessor, codeEditor, true);
});

PreviousMatchFindAction.addImplementation(100, (accessor, codeEditor, args2) => {
  return findWidgetAction(accessor, codeEditor, false);
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.findNext.fromWidget",
      title: localize2(17434, "Find Next"),
      keybinding: {
        when: ContextKeyExpr.and(
          NOTEBOOK_EDITOR_FOCUSED,
          CONTEXT_FIND_WIDGET_VISIBLE
        ),
        primary: 61 /* F3 */,
        mac: { primary: 2048 /* CtrlCmd */ | 37 /* KeyG */, secondary: [61 /* F3 */] },
        weight: 200 /* WorkbenchContrib */ + 1
      }
    });
  }
  async run(accessor) {
    return runFind(accessor, true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.findPrevious.fromWidget",
      title: localize2(17435, "Find Previous"),
      keybinding: {
        when: ContextKeyExpr.and(
          NOTEBOOK_EDITOR_FOCUSED,
          CONTEXT_FIND_WIDGET_VISIBLE
        ),
        primary: 1024 /* Shift */ | 61 /* F3 */,
        mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */, secondary: [1024 /* Shift */ | 61 /* F3 */] },
        weight: 200 /* WorkbenchContrib */ + 1
      }
    });
  }
  async run(accessor) {
    return runFind(accessor, false);
  }
});
export { notebookContainsTextModel, getSearchStringOptions, isNotebookEditorValidForSearch, openFindWidget, findWidgetAction, runFind };
