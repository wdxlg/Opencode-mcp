// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/cellEditorOptions.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { deepClone } from "./module-0098.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/cellEditorOptions.ts
var BaseCellEditorOptions = class _BaseCellEditorOptions extends Disposable {
  constructor(notebookEditor, notebookOptions, configurationService, language2) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookOptions = notebookOptions;
    this.configurationService = configurationService;
    this.language = language2;
    this._localDisposableStore = this._register(new DisposableStore());
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("editor") || e4.affectsConfiguration("notebook")) {
        this._recomputeOptions();
      }
    }));
    this._register(notebookOptions.onDidChangeOptions((e4) => {
      if (e4.cellStatusBarVisibility || e4.editorTopPadding || e4.editorOptionsCustomizations) {
        this._recomputeOptions();
      }
    }));
    this._register(this.notebookEditor.onDidChangeModel(() => {
      this._localDisposableStore.clear();
      if (this.notebookEditor.hasModel()) {
        this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
          this._recomputeOptions();
        }));
        this._recomputeOptions();
      }
    }));
    if (this.notebookEditor.hasModel()) {
      this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
        this._recomputeOptions();
      }));
    }
    this._value = this._computeEditorOptions();
  }
  static {
    this.fixedEditorOptions = {
      scrollBeyondLastLine: false,
      scrollbar: {
        verticalScrollbarSize: 14,
        horizontal: "auto",
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        alwaysConsumeMouseWheel: false
      },
      renderLineHighlightOnlyWhenFocus: true,
      overviewRulerLanes: 0,
      lineDecorationsWidth: 0,
      folding: true,
      fixedOverflowWidgets: true,
      minimap: { enabled: false },
      renderValidationDecorations: "on",
      lineNumbersMinChars: 3
    };
  }
  get value() {
    return this._value;
  }
  _recomputeOptions() {
    this._value = this._computeEditorOptions();
    this._onDidChange.fire();
  }
  _computeEditorOptions() {
    const editorOptions = deepClone(this.configurationService.getValue("editor", { overrideIdentifier: this.language }));
    const editorOptionsOverrideRaw = this.notebookOptions.getDisplayOptions().editorOptionsCustomizations;
    const editorOptionsOverride = {};
    if (editorOptionsOverrideRaw) {
      for (const key3 in editorOptionsOverrideRaw) {
        if (key3.indexOf("editor.") === 0) {
          editorOptionsOverride[key3.substring(7)] = editorOptionsOverrideRaw[key3];
        }
      }
    }
    const computed = Object.freeze({
      ...editorOptions,
      ..._BaseCellEditorOptions.fixedEditorOptions,
      ...editorOptionsOverride,
      ...{ padding: { top: 12, bottom: 12 } },
      readOnly: this.notebookEditor.isReadOnly
    });
    return computed;
  }
};
export { BaseCellEditorOptions };
