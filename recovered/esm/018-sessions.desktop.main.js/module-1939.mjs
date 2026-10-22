// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/notebookCellEditorPool.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $, prepend } from "./module-0075.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { CellEditorOptions } from "./module-1895.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { createCancelablePromise } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/notebook/browser/view/notebookCellEditorPool.ts
var NotebookCellEditorPool = class extends Disposable {
  constructor(notebookEditor, contextKeyServiceProvider, textModelService, _configurationService, _instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.contextKeyServiceProvider = contextKeyServiceProvider;
    this.textModelService = textModelService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._editorDisposable = this._register(new MutableDisposable());
    this._isInitialized = false;
    this._isDisposed = false;
    this._focusedEditorDOM = this.notebookEditor.getDomNode().appendChild($(".cell-editor-part-cache"));
    this._focusedEditorDOM.style.position = "absolute";
    this._focusedEditorDOM.style.top = "-50000px";
    this._focusedEditorDOM.style.width = "1px";
    this._focusedEditorDOM.style.height = "1px";
  }
  _initializeEditor(cell) {
    this._editorContextKeyService = this._register(this.contextKeyServiceProvider(this._focusedEditorDOM));
    const editorContainer = prepend(this._focusedEditorDOM, $(".cell-editor-container"));
    const editorInstaService = this._register(this._instantiationService.createChild(new ServiceCollection([IContextKeyService, this._editorContextKeyService])));
    EditorContextKeys.inCompositeEditor.bindTo(this._editorContextKeyService).set(true);
    const editorOptions = new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(cell.language), this.notebookEditor.notebookOptions, this._configurationService);
    this._editor = this._register(editorInstaService.createInstance(CodeEditorWidget, editorContainer, {
      ...editorOptions.getDefaultValue(),
      dimension: {
        width: 0,
        height: 0
      },
      scrollbar: {
        vertical: "hidden",
        horizontal: "auto",
        handleMouseWheel: false,
        useShadows: false
      },
      allowVariableLineHeights: false
    }, {
      contributions: this.notebookEditor.creationOptions.cellEditorContributions
    }));
    editorOptions.dispose();
    this._isInitialized = true;
  }
  preserveFocusedEditor(cell) {
    if (!this._isInitialized) {
      this._initializeEditor(cell);
    }
    this._editorDisposable.clear();
    this._focusEditorCancellablePromise?.cancel();
    this._focusEditorCancellablePromise = createCancelablePromise(async (token) => {
      const ref = await this.textModelService.createModelReference(cell.uri);
      if (this._isDisposed || token.isCancellationRequested) {
        ref.dispose();
        return;
      }
      const editorDisposable = new DisposableStore();
      editorDisposable.add(ref);
      this._editor.setModel(ref.object.textEditorModel);
      this._editor.setSelections(cell.getSelections());
      this._editor.focus();
      const _update = () => {
        const editorSelections = this._editor.getSelections();
        if (editorSelections) {
          cell.setSelections(editorSelections);
        }
        this.notebookEditor.revealInView(cell);
        this._editor.setModel(null);
        ref.dispose();
      };
      editorDisposable.add(this._editor.onDidChangeModelContent((e4) => {
        _update();
      }));
      editorDisposable.add(this._editor.onDidChangeCursorSelection((e4) => {
        if (e4.source === "keyboard" || e4.source === "mouse") {
          _update();
        }
      }));
      editorDisposable.add(this.notebookEditor.onDidChangeActiveEditor(() => {
        const latestActiveCell = this.notebookEditor.getActiveCell();
        if (latestActiveCell !== cell || latestActiveCell.focusMode !== 1 /* Editor */) {
          this._editorDisposable.clear();
          this._editor.setModel(null);
          ref.dispose();
        }
      }));
      this._editorDisposable.value = editorDisposable;
    });
  }
  dispose() {
    this._isDisposed = true;
    this._focusEditorCancellablePromise?.cancel();
    super.dispose();
  }
};

NotebookCellEditorPool = __decorateClass([
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService)
], NotebookCellEditorPool);
export { NotebookCellEditorPool };
