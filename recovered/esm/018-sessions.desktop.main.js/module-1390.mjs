// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebookEditors.ts
import { DisposableStore, dispose } from "./module-0012.mjs";
import { ExtHostContext } from "./module-0922.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { columnToEditorGroup, editorGroupToColumn } from "./module-1079.mjs";
import { equals4 } from "./module-0098.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/api/browser/mainThreadNotebookEditors.ts
var MainThreadNotebook = class {
  constructor(editor, disposables) {
    this.editor = editor;
    this.disposables = disposables;
  }
  dispose() {
    this.disposables.dispose();
  }
};

var MainThreadNotebookEditors = class {
  constructor(extHostContext, _editorService, _notebookEditorService, _editorGroupService, _configurationService) {
    this._editorService = _editorService;
    this._notebookEditorService = _notebookEditorService;
    this._editorGroupService = _editorGroupService;
    this._configurationService = _configurationService;
    this._disposables = new DisposableStore();
    this._mainThreadEditors = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookEditors);
    this._editorService.onDidActiveEditorChange(() => this._updateEditorViewColumns(), this, this._disposables);
    this._editorGroupService.onDidRemoveGroup(() => this._updateEditorViewColumns(), this, this._disposables);
    this._editorGroupService.onDidMoveGroup(() => this._updateEditorViewColumns(), this, this._disposables);
  }
  dispose() {
    this._disposables.dispose();
    dispose(this._mainThreadEditors.values());
  }
  handleEditorsAdded(editors) {
    for (const editor of editors) {
      const editorDisposables = new DisposableStore();
      editorDisposables.add(editor.onDidChangeVisibleRanges(() => {
        this._proxy.$acceptEditorPropertiesChanged(editor.getId(), { visibleRanges: { ranges: editor.visibleRanges } });
      }));
      editorDisposables.add(editor.onDidChangeSelection(() => {
        this._proxy.$acceptEditorPropertiesChanged(editor.getId(), { selections: { selections: editor.getSelections() } });
      }));
      const wrapper = new MainThreadNotebook(editor, editorDisposables);
      this._mainThreadEditors.set(editor.getId(), wrapper);
    }
  }
  handleEditorsRemoved(editorIds) {
    for (const id2 of editorIds) {
      this._mainThreadEditors.get(id2)?.dispose();
      this._mainThreadEditors.delete(id2);
    }
  }
  _updateEditorViewColumns() {
    const result = /* @__PURE__ */ Object.create(null);
    for (const editorPane of this._editorService.visibleEditorPanes) {
      const candidate = getNotebookEditorFromEditorPane(editorPane);
      if (candidate && this._mainThreadEditors.has(candidate.getId())) {
        result[candidate.getId()] = editorGroupToColumn(this._editorGroupService, editorPane.group);
      }
    }
    if (!equals4(result, this._currentViewColumnInfo)) {
      this._currentViewColumnInfo = result;
      this._proxy.$acceptEditorViewColumns(result);
    }
  }
  async $tryShowNotebookDocument(resource, viewType, options3) {
    const editorOptions = {
      cellSelections: options3.selections,
      preserveFocus: options3.preserveFocus,
      pinned: options3.pinned,
      // selection: options.selection,
      // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
      // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
      activation: options3.preserveFocus ? 2 /* RESTORE */ : void 0,
      label: options3.label,
      override: viewType
    };
    const editorPane = await this._editorService.openEditor({ resource: URI.revive(resource), options: editorOptions }, columnToEditorGroup(this._editorGroupService, this._configurationService, options3.position));
    const notebookEditor = getNotebookEditorFromEditorPane(editorPane);
    if (notebookEditor) {
      return notebookEditor.getId();
    } else {
      throw new Error(`Notebook Editor creation failure for document ${JSON.stringify(resource)}`);
    }
  }
  async $tryRevealRange(id2, range2, revealType) {
    const editor = this._notebookEditorService.getNotebookEditor(id2);
    if (!editor) {
      return;
    }
    const notebookEditor = editor;
    if (!notebookEditor.hasModel()) {
      return;
    }
    if (range2.start >= notebookEditor.getLength()) {
      return;
    }
    const cell = notebookEditor.cellAt(range2.start);
    switch (revealType) {
      case 0 /* Default */:
        return notebookEditor.revealCellRangeInView(range2);
      case 1 /* InCenter */:
        return notebookEditor.revealInCenter(cell);
      case 2 /* InCenterIfOutsideViewport */:
        return notebookEditor.revealInCenterIfOutsideViewport(cell);
      case 3 /* AtTop */:
        return notebookEditor.revealInViewAtTop(cell);
    }
  }
  $trySetSelections(id2, ranges) {
    const editor = this._notebookEditorService.getNotebookEditor(id2);
    if (!editor) {
      return;
    }
    editor.setSelections(ranges);
    if (ranges.length) {
      editor.setFocus({ start: ranges[0].start, end: ranges[0].start + 1 });
    }
  }
};

MainThreadNotebookEditors = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, INotebookEditorService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, IConfigurationService)
], MainThreadNotebookEditors);
export { MainThreadNotebook, MainThreadNotebookEditors };
