// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebookDocumentsAndEditors.ts
import { diffMaps, diffSets } from "./module-0003.mjs";
import { DisposableMap, DisposableStore, combinedDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { MainThreadNotebookDocuments } from "./module-1390.mjs";
import { MainThreadNotebookEditors } from "./module-1391.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";
import { SerializableObjectWithBuffers } from "./module-0920.mjs";
import { NotebookDto } from "./module-0994.mjs";
import { editorGroupToColumn } from "./module-1078.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostCustomer } from "./module-0919.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotebookService } from "./module-0926.mjs";
import { INotebookEditorService } from "./module-1386.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/api/browser/mainThreadNotebookDocumentsAndEditors.ts
var NotebookAndEditorState = class {
  constructor(documents, textEditors, activeEditor, visibleEditors) {
    this.documents = documents;
    this.textEditors = textEditors;
    this.activeEditor = activeEditor;
    this.visibleEditors = visibleEditors;
  }
  static delta(before, after2) {
    if (!before) {
      return {
        addedDocuments: [...after2.documents],
        removedDocuments: [],
        addedEditors: [...after2.textEditors.values()],
        removedEditors: [],
        visibleEditors: [...after2.visibleEditors].map((editor) => editor[0])
      };
    }
    const documentDelta = diffSets(before.documents, after2.documents);
    const editorDelta = diffMaps(before.textEditors, after2.textEditors);
    const newActiveEditor = before.activeEditor !== after2.activeEditor ? after2.activeEditor : void 0;
    const visibleEditorDelta = diffMaps(before.visibleEditors, after2.visibleEditors);
    return {
      addedDocuments: documentDelta.added,
      removedDocuments: documentDelta.removed.map((e) => e.uri),
      addedEditors: editorDelta.added,
      removedEditors: editorDelta.removed.map((removed) => removed.getId()),
      newActiveEditor,
      visibleEditors: visibleEditorDelta.added.length === 0 && visibleEditorDelta.removed.length === 0 ? void 0 : [...after2.visibleEditors].map((editor) => editor[0])
    };
  }
};

var MainThreadNotebooksAndEditors = class {
  constructor(extHostContext, instantiationService, _notebookService, _notebookEditorService, _editorService, _editorGroupService, _logService) {
    this._notebookService = _notebookService;
    this._notebookEditorService = _notebookEditorService;
    this._editorService = _editorService;
    this._editorGroupService = _editorGroupService;
    this._logService = _logService;
    this._disposables = new DisposableStore();
    this._editorListeners = new DisposableMap();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebook);
    this._mainThreadNotebooks = instantiationService.createInstance(MainThreadNotebookDocuments, extHostContext);
    this._mainThreadEditors = instantiationService.createInstance(MainThreadNotebookEditors, extHostContext);
    extHostContext.set(MainContext.MainThreadNotebookDocuments, this._mainThreadNotebooks);
    extHostContext.set(MainContext.MainThreadNotebookEditors, this._mainThreadEditors);
    this._notebookService.onWillAddNotebookDocument(() => this._updateState(), this, this._disposables);
    this._notebookService.onDidRemoveNotebookDocument(() => this._updateState(), this, this._disposables);
    this._editorService.onDidActiveEditorChange(() => this._updateState(), this, this._disposables);
    this._editorService.onDidVisibleEditorsChange(() => this._updateState(), this, this._disposables);
    this._notebookEditorService.onDidAddNotebookEditor(this._handleEditorAdd, this, this._disposables);
    this._notebookEditorService.onDidRemoveNotebookEditor(this._handleEditorRemove, this, this._disposables);
    this._updateState();
  }
  dispose() {
    this._mainThreadNotebooks.dispose();
    this._mainThreadEditors.dispose();
    this._disposables.dispose();
    this._editorListeners.dispose();
  }
  _handleEditorAdd(editor) {
    this._editorListeners.set(editor.getId(), combinedDisposable(
      editor.onDidChangeModel(() => this._updateState()),
      editor.onDidFocusWidget(() => this._updateState(editor))
    ));
    this._updateState();
  }
  _handleEditorRemove(editor) {
    this._editorListeners.deleteAndDispose(editor.getId());
    this._updateState();
  }
  _updateState(focusedEditor) {
    const editors = /* @__PURE__ */ new Map();
    const visibleEditorsMap = /* @__PURE__ */ new Map();
    for (const editor of this._notebookEditorService.listNotebookEditors()) {
      if (editor.hasModel()) {
        editors.set(editor.getId(), editor);
      }
    }
    const activeNotebookEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    let activeEditor = null;
    if (activeNotebookEditor) {
      activeEditor = activeNotebookEditor.getId();
    } else if (focusedEditor?.textModel) {
      activeEditor = focusedEditor.getId();
    }
    if (activeEditor && !editors.has(activeEditor)) {
      this._logService.trace("MainThreadNotebooksAndEditors#_updateState: active editor is not in editors list", activeEditor, editors.keys());
      activeEditor = null;
    }
    for (const editorPane of this._editorService.visibleEditorPanes) {
      const notebookEditor = getNotebookEditorFromEditorPane(editorPane);
      if (notebookEditor?.hasModel() && editors.has(notebookEditor.getId())) {
        visibleEditorsMap.set(notebookEditor.getId(), notebookEditor);
      }
    }
    const newState = new NotebookAndEditorState(new Set(this._notebookService.listNotebookDocuments()), editors, activeEditor, visibleEditorsMap);
    this._onDelta(NotebookAndEditorState.delta(this._currentState, newState));
    this._currentState = newState;
  }
  _onDelta(delta2) {
    if (MainThreadNotebooksAndEditors._isDeltaEmpty(delta2)) {
      return;
    }
    const dto = {
      removedDocuments: delta2.removedDocuments,
      removedEditors: delta2.removedEditors,
      newActiveEditor: delta2.newActiveEditor,
      visibleEditors: delta2.visibleEditors,
      addedDocuments: delta2.addedDocuments.map(MainThreadNotebooksAndEditors._asModelAddData),
      addedEditors: delta2.addedEditors.map(this._asEditorAddData, this)
    };
    this._proxy.$acceptDocumentAndEditorsDelta(new SerializableObjectWithBuffers(dto));
    this._mainThreadEditors.handleEditorsRemoved(delta2.removedEditors);
    this._mainThreadNotebooks.handleNotebooksRemoved(delta2.removedDocuments);
    this._mainThreadNotebooks.handleNotebooksAdded(delta2.addedDocuments);
    this._mainThreadEditors.handleEditorsAdded(delta2.addedEditors);
  }
  static _isDeltaEmpty(delta2) {
    if (delta2.addedDocuments !== void 0 && delta2.addedDocuments.length > 0) {
      return false;
    }
    if (delta2.removedDocuments !== void 0 && delta2.removedDocuments.length > 0) {
      return false;
    }
    if (delta2.addedEditors !== void 0 && delta2.addedEditors.length > 0) {
      return false;
    }
    if (delta2.removedEditors !== void 0 && delta2.removedEditors.length > 0) {
      return false;
    }
    if (delta2.visibleEditors !== void 0 && delta2.visibleEditors.length > 0) {
      return false;
    }
    if (delta2.newActiveEditor !== void 0) {
      return false;
    }
    return true;
  }
  static _asModelAddData(e) {
    return {
      viewType: e.viewType,
      uri: e.uri,
      metadata: e.metadata,
      versionId: e.versionId,
      cells: e.cells.map(NotebookDto.toNotebookCellDto)
    };
  }
  _asEditorAddData(add) {
    const pane = this._editorService.visibleEditorPanes.find((pane2) => getNotebookEditorFromEditorPane(pane2) === add);
    return {
      id: add.getId(),
      documentUri: add.textModel.uri,
      selections: add.getSelections(),
      visibleRanges: add.visibleRanges,
      viewColumn: pane && editorGroupToColumn(this._editorGroupService, pane.group),
      viewType: add.getViewModel().viewType
    };
  }
};

MainThreadNotebooksAndEditors = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotebookService),
  __decorateParam(3, INotebookEditorService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, ILogService)
], MainThreadNotebooksAndEditors);
export { NotebookAndEditorState, MainThreadNotebooksAndEditors };
