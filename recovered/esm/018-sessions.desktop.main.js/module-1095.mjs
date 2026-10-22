// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDocumentsAndEditors.ts
import { diffMaps, diffSets } from "./module-0003.mjs";
import { Disposable, DisposableMap, DisposableStore, combinedDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { shouldSynchronizeModel } from "./module-0117.mjs";
import { AbstractTextEditor } from "./module-1092.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { MainThreadDocuments } from "./module-1077.mjs";
import { MainThreadTextEditors } from "./module-1084.mjs";
import { MainThreadTextEditor } from "./module-1078.mjs";
import { editorGroupToColumn } from "./module-1079.mjs";
import { extHostCustomer } from "./module-0920.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IWorkingCopyFileService } from "./module-1076.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IPathService } from "./module-0939.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickDiffModelService } from "./module-1083.mjs";


// src/vs/workbench/api/browser/mainThreadDocumentsAndEditors.ts
var TextEditorSnapshot = class {
  constructor(editor) {
    this.editor = editor;
    this.id = `${editor.getId()},${editor.getModel().id}`;
  }
};

var DocumentAndEditorStateDelta = class {
  constructor(removedDocuments, addedDocuments, removedEditors, addedEditors, oldActiveEditor, newActiveEditor) {
    this.removedDocuments = removedDocuments;
    this.addedDocuments = addedDocuments;
    this.removedEditors = removedEditors;
    this.addedEditors = addedEditors;
    this.oldActiveEditor = oldActiveEditor;
    this.newActiveEditor = newActiveEditor;
    this.isEmpty = this.removedDocuments.length === 0 && this.addedDocuments.length === 0 && this.removedEditors.length === 0 && this.addedEditors.length === 0 && oldActiveEditor === newActiveEditor;
  }
  toString() {
    let ret = "DocumentAndEditorStateDelta\n";
    ret += `	Removed Documents: [${this.removedDocuments.map((d) => d.uri.toString(true)).join(", ")}]
`;
    ret += `	Added Documents: [${this.addedDocuments.map((d) => d.uri.toString(true)).join(", ")}]
`;
    ret += `	Removed Editors: [${this.removedEditors.map((e4) => e4.id).join(", ")}]
`;
    ret += `	Added Editors: [${this.addedEditors.map((e4) => e4.id).join(", ")}]
`;
    ret += `	New Active Editor: ${this.newActiveEditor}
`;
    return ret;
  }
};

var DocumentAndEditorState = class {
  constructor(documents, textEditors, activeEditor) {
    this.documents = documents;
    this.textEditors = textEditors;
    this.activeEditor = activeEditor;
  }
  static compute(before, after2) {
    if (!before) {
      return new DocumentAndEditorStateDelta(
        [],
        [...after2.documents.values()],
        [],
        [...after2.textEditors.values()],
        void 0,
        after2.activeEditor
      );
    }
    const documentDelta = diffSets(before.documents, after2.documents);
    const editorDelta = diffMaps(before.textEditors, after2.textEditors);
    const oldActiveEditor = before.activeEditor !== after2.activeEditor ? before.activeEditor : void 0;
    const newActiveEditor = before.activeEditor !== after2.activeEditor ? after2.activeEditor : void 0;
    return new DocumentAndEditorStateDelta(
      documentDelta.removed,
      documentDelta.added,
      editorDelta.removed,
      editorDelta.added,
      oldActiveEditor,
      newActiveEditor
    );
  }
};

var MainThreadDocumentAndEditorStateComputer = class {
  constructor(_onDidChangeState, _modelService, _codeEditorService, _editorService, _paneCompositeService) {
    this._onDidChangeState = _onDidChangeState;
    this._modelService = _modelService;
    this._codeEditorService = _codeEditorService;
    this._editorService = _editorService;
    this._paneCompositeService = _paneCompositeService;
    this._toDispose = new DisposableStore();
    this._toDisposeOnEditorRemove = new DisposableMap();
    this._activeEditorOrder = 0 /* Editor */;
    this._modelService.onModelAdded(this._updateStateOnModelAdd, this, this._toDispose);
    this._modelService.onModelRemoved((_) => this._updateState(), this, this._toDispose);
    this._editorService.onDidActiveEditorChange((_) => this._updateState(), this, this._toDispose);
    this._codeEditorService.onCodeEditorAdd(this._onDidAddEditor, this, this._toDispose);
    this._codeEditorService.onCodeEditorRemove(this._onDidRemoveEditor, this, this._toDispose);
    this._codeEditorService.listCodeEditors().forEach(this._onDidAddEditor, this);
    Event2.filter(this._paneCompositeService.onDidPaneCompositeOpen, (event) => event.viewContainerLocation === 1 /* Panel */)((_) => this._activeEditorOrder = 1 /* Panel */, void 0, this._toDispose);
    Event2.filter(this._paneCompositeService.onDidPaneCompositeClose, (event) => event.viewContainerLocation === 1 /* Panel */)((_) => this._activeEditorOrder = 0 /* Editor */, void 0, this._toDispose);
    this._editorService.onDidVisibleEditorsChange((_) => this._activeEditorOrder = 0 /* Editor */, void 0, this._toDispose);
    this._updateState();
  }
  dispose() {
    this._toDispose.dispose();
    this._toDisposeOnEditorRemove.dispose();
  }
  _onDidAddEditor(e4) {
    this._toDisposeOnEditorRemove.set(e4.getId(), combinedDisposable(
      e4.onDidChangeModel(() => this._updateState()),
      e4.onDidFocusEditorText(() => this._updateState()),
      e4.onDidFocusEditorWidget(() => this._updateState(e4))
    ));
    this._updateState();
  }
  _onDidRemoveEditor(e4) {
    const id2 = e4.getId();
    if (this._toDisposeOnEditorRemove.has(id2)) {
      this._toDisposeOnEditorRemove.deleteAndDispose(id2);
      this._updateState();
    }
  }
  _updateStateOnModelAdd(model) {
    if (!shouldSynchronizeModel(model)) {
      return;
    }
    if (!this._currentState) {
      this._updateState();
      return;
    }
    this._currentState = new DocumentAndEditorState(
      this._currentState.documents.add(model),
      this._currentState.textEditors,
      this._currentState.activeEditor
    );
    this._onDidChangeState(new DocumentAndEditorStateDelta(
      [],
      [model],
      [],
      [],
      void 0,
      void 0
    ));
  }
  _updateState(widgetFocusCandidate) {
    const models = /* @__PURE__ */ new Set();
    for (const model of this._modelService.getModels()) {
      if (shouldSynchronizeModel(model)) {
        models.add(model);
      }
    }
    const editors = /* @__PURE__ */ new Map();
    let activeEditor = null;
    for (const editor of this._codeEditorService.listCodeEditors()) {
      if (editor.isSimpleWidget) {
        continue;
      }
      const model = editor.getModel();
      if (editor.hasModel() && model && shouldSynchronizeModel(model) && !model.isDisposed() && Boolean(this._modelService.getModel(model.uri))) {
        const apiEditor = new TextEditorSnapshot(editor);
        editors.set(apiEditor.id, apiEditor);
        if (editor.hasTextFocus() || widgetFocusCandidate === editor && editor.hasWidgetFocus()) {
          activeEditor = apiEditor.id;
        }
      }
    }
    if (!activeEditor) {
      let candidate;
      if (this._activeEditorOrder === 0 /* Editor */) {
        candidate = this._getActiveEditorFromEditorPart() || this._getActiveEditorFromPanel();
      } else {
        candidate = this._getActiveEditorFromPanel() || this._getActiveEditorFromEditorPart();
      }
      if (candidate) {
        for (const snapshot of editors.values()) {
          if (candidate === snapshot.editor) {
            activeEditor = snapshot.id;
          }
        }
      }
    }
    const newState = new DocumentAndEditorState(models, editors, activeEditor);
    const delta2 = DocumentAndEditorState.compute(this._currentState, newState);
    if (!delta2.isEmpty) {
      this._currentState = newState;
      this._onDidChangeState(delta2);
    }
  }
  _getActiveEditorFromPanel() {
    const panel = this._paneCompositeService.getActivePaneComposite(1 /* Panel */);
    if (panel instanceof AbstractTextEditor) {
      const control = panel.getControl();
      if (isCodeEditor(control)) {
        return control;
      }
    }
    return void 0;
  }
  _getActiveEditorFromEditorPart() {
    let activeTextEditorControl = this._editorService.activeTextEditorControl;
    if (isDiffEditor(activeTextEditorControl)) {
      activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
    }
    return activeTextEditorControl;
  }
};

MainThreadDocumentAndEditorStateComputer = __decorateClass([
  __decorateParam(1, IModelService),
  __decorateParam(2, ICodeEditorService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IPaneCompositePartService)
], MainThreadDocumentAndEditorStateComputer);

var MainThreadDocumentsAndEditors = class extends Disposable {
  constructor(extHostContext, _modelService, _textFileService, _editorService, codeEditorService, fileService, textModelResolverService, _editorGroupService, paneCompositeService, environmentService, workingCopyFileService, uriIdentityService, _clipboardService, pathService, configurationService, quickDiffModelService) {
    super();
    this._modelService = _modelService;
    this._textFileService = _textFileService;
    this._editorService = _editorService;
    this._editorGroupService = _editorGroupService;
    this._clipboardService = _clipboardService;
    this._textEditors = this._register(new DisposableMap());
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocumentsAndEditors);
    this._mainThreadDocuments = this._register(new MainThreadDocuments(extHostContext, this._modelService, this._textFileService, fileService, textModelResolverService, environmentService, uriIdentityService, workingCopyFileService, pathService));
    extHostContext.set(MainContext.MainThreadDocuments, this._mainThreadDocuments);
    this._mainThreadEditors = this._register(new MainThreadTextEditors(this, extHostContext, codeEditorService, this._editorService, this._editorGroupService, configurationService, quickDiffModelService, uriIdentityService));
    extHostContext.set(MainContext.MainThreadTextEditors, this._mainThreadEditors);
    this._register(new MainThreadDocumentAndEditorStateComputer((delta2) => this._onDelta(delta2), _modelService, codeEditorService, this._editorService, paneCompositeService));
  }
  _onDelta(delta2) {
    const removedEditors = [];
    const addedEditors = [];
    const removedDocuments = delta2.removedDocuments.map((m) => m.uri);
    for (const apiEditor of delta2.addedEditors) {
      const mainThreadEditor = new MainThreadTextEditor(
        apiEditor.id,
        apiEditor.editor.getModel(),
        apiEditor.editor,
        { onGainedFocus() {
        }, onLostFocus() {
        } },
        this._mainThreadDocuments,
        this._modelService,
        this._clipboardService
      );
      this._textEditors.set(apiEditor.id, mainThreadEditor);
      addedEditors.push(mainThreadEditor);
    }
    for (const { id: id2 } of delta2.removedEditors) {
      const mainThreadEditor = this._textEditors.get(id2);
      if (mainThreadEditor) {
        this._textEditors.deleteAndDispose(id2);
        removedEditors.push(id2);
      }
    }
    const extHostDelta = /* @__PURE__ */ Object.create(null);
    let empty = true;
    if (delta2.newActiveEditor !== void 0) {
      empty = false;
      extHostDelta.newActiveEditor = delta2.newActiveEditor;
    }
    if (removedDocuments.length > 0) {
      empty = false;
      extHostDelta.removedDocuments = removedDocuments;
    }
    if (removedEditors.length > 0) {
      empty = false;
      extHostDelta.removedEditors = removedEditors;
    }
    if (delta2.addedDocuments.length > 0) {
      empty = false;
      extHostDelta.addedDocuments = delta2.addedDocuments.map((m) => this._toModelAddData(m));
    }
    if (delta2.addedEditors.length > 0) {
      empty = false;
      extHostDelta.addedEditors = addedEditors.map((e4) => this._toTextEditorAddData(e4));
    }
    if (!empty) {
      this._proxy.$acceptDocumentsAndEditorsDelta(extHostDelta);
      removedDocuments.forEach(this._mainThreadDocuments.handleModelRemoved, this._mainThreadDocuments);
      delta2.addedDocuments.forEach(this._mainThreadDocuments.handleModelAdded, this._mainThreadDocuments);
      removedEditors.forEach(this._mainThreadEditors.handleTextEditorRemoved, this._mainThreadEditors);
      addedEditors.forEach(this._mainThreadEditors.handleTextEditorAdded, this._mainThreadEditors);
    }
  }
  _toModelAddData(model) {
    return {
      uri: model.uri,
      versionId: model.getVersionId(),
      lines: model.getLinesContent(),
      EOL: model.getEOL(),
      languageId: model.getLanguageId(),
      isDirty: this._textFileService.isDirty(model.uri),
      encoding: this._textFileService.getEncoding(model.uri)
    };
  }
  _toTextEditorAddData(textEditor) {
    const props = textEditor.getProperties();
    return {
      id: textEditor.getId(),
      documentUri: textEditor.getModel().uri,
      options: props.options,
      selections: props.selections,
      visibleRanges: props.visibleRanges,
      editorPosition: this._findEditorPosition(textEditor)
    };
  }
  _findEditorPosition(editor) {
    for (const editorPane of this._editorService.visibleEditorPanes) {
      if (editor.matches(editorPane)) {
        return editorGroupToColumn(this._editorGroupService, editorPane.group);
      }
    }
    return void 0;
  }
  findTextEditorIdFor(editorPane) {
    for (const [id2, editor] of this._textEditors) {
      if (editor.matches(editorPane)) {
        return id2;
      }
    }
    return void 0;
  }
  getIdOfCodeEditor(codeEditor) {
    for (const [id2, editor] of this._textEditors) {
      if (editor.getCodeEditor() === codeEditor) {
        return id2;
      }
    }
    return void 0;
  }
  getEditor(id2) {
    return this._textEditors.get(id2);
  }
};

MainThreadDocumentsAndEditors = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IModelService),
  __decorateParam(2, ITextFileService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, IFileService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IEditorGroupsService),
  __decorateParam(8, IPaneCompositePartService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IWorkingCopyFileService),
  __decorateParam(11, IUriIdentityService),
  __decorateParam(12, IClipboardService),
  __decorateParam(13, IPathService),
  __decorateParam(14, IConfigurationService),
  __decorateParam(15, IQuickDiffModelService)
], MainThreadDocumentsAndEditors);
export { TextEditorSnapshot, DocumentAndEditorStateDelta, DocumentAndEditorState, MainThreadDocumentAndEditorStateComputer, MainThreadDocumentsAndEditors };
