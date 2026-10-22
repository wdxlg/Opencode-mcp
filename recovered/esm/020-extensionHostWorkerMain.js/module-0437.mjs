// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostTextEditors.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { MainContext } from "./module-0025.mjs";
import { Range3, Selection2, TextEditorLineNumbersStyle2, ViewColumn2 } from "./module-0239.mjs";
import { TextEditorDecorationType } from "./module-0293.mjs";
import { coalesce } from "./module-0004.mjs";
import { TextEditorSelectionChangeKind } from "./module-0238.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/workbench/api/common/extHostTextEditors.ts
var ExtHostEditors = class extends Disposable {
  constructor(mainContext, _extHostDocumentsAndEditors) {
    super();
    this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
    this._onDidChangeTextEditorSelection = this._register(new Emitter());
    this._onDidChangeTextEditorOptions = this._register(new Emitter());
    this._onDidChangeTextEditorVisibleRanges = this._register(new Emitter());
    this._onDidChangeTextEditorViewColumn = this._register(new Emitter());
    this._onDidChangeTextEditorDiffInformation = this._register(new Emitter());
    this._onDidChangeActiveTextEditor = this._register(new Emitter());
    this._onDidChangeVisibleTextEditors = this._register(new Emitter());
    this.onDidChangeTextEditorSelection = this._onDidChangeTextEditorSelection.event;
    this.onDidChangeTextEditorOptions = this._onDidChangeTextEditorOptions.event;
    this.onDidChangeTextEditorVisibleRanges = this._onDidChangeTextEditorVisibleRanges.event;
    this.onDidChangeTextEditorViewColumn = this._onDidChangeTextEditorViewColumn.event;
    this.onDidChangeTextEditorDiffInformation = this._onDidChangeTextEditorDiffInformation.event;
    this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
    this.onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
    this._proxy = mainContext.getProxy(MainContext.MainThreadTextEditors);
    this._register(this._extHostDocumentsAndEditors.onDidChangeVisibleTextEditors((e) => this._onDidChangeVisibleTextEditors.fire(e)));
    this._register(this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor((e) => this._onDidChangeActiveTextEditor.fire(e)));
  }
  getActiveTextEditor() {
    return this._extHostDocumentsAndEditors.activeEditor();
  }
  getVisibleTextEditors(internal) {
    const editors = this._extHostDocumentsAndEditors.allEditors();
    return internal ? editors : editors.map((editor) => editor.value);
  }
  async showTextDocument(document2, columnOrOptions, preserveFocus) {
    let options2;
    if (typeof columnOrOptions === "number") {
      options2 = {
        position: ViewColumn2.from(columnOrOptions),
        preserveFocus
      };
    } else if (typeof columnOrOptions === "object") {
      options2 = {
        position: ViewColumn2.from(columnOrOptions.viewColumn),
        preserveFocus: columnOrOptions.preserveFocus,
        selection: typeof columnOrOptions.selection === "object" ? Range3.from(columnOrOptions.selection) : void 0,
        pinned: typeof columnOrOptions.preview === "boolean" ? !columnOrOptions.preview : void 0
      };
    } else {
      options2 = {
        preserveFocus: false
      };
    }
    const editorId = await this._proxy.$tryShowTextDocument(document2.uri, options2);
    const editor = editorId && this._extHostDocumentsAndEditors.getEditor(editorId);
    if (editor) {
      return editor.value;
    }
    if (editorId) {
      throw new Error(`Could NOT open editor for "${document2.uri.toString()}" because another editor opened in the meantime.`);
    } else {
      throw new Error(`Could NOT open editor for "${document2.uri.toString()}".`);
    }
  }
  createTextEditorDecorationType(extension, options2) {
    return new TextEditorDecorationType(this._proxy, extension, options2).value;
  }
  // --- called from main thread
  $acceptEditorPropertiesChanged(id2, data2) {
    const textEditor = this._extHostDocumentsAndEditors.getEditor(id2);
    if (!textEditor) {
      throw new Error("unknown text editor");
    }
    if (data2.options) {
      textEditor._acceptOptions(data2.options);
    }
    if (data2.selections) {
      const selections = data2.selections.selections.map(Selection2.to);
      textEditor._acceptSelections(selections);
    }
    if (data2.visibleRanges) {
      const visibleRanges = coalesce(data2.visibleRanges.map(Range3.to));
      textEditor._acceptVisibleRanges(visibleRanges);
    }
    if (data2.options) {
      this._onDidChangeTextEditorOptions.fire({
        textEditor: textEditor.value,
        options: { ...data2.options, lineNumbers: TextEditorLineNumbersStyle2.to(data2.options.lineNumbers) }
      });
    }
    if (data2.selections) {
      const kind = TextEditorSelectionChangeKind.fromValue(data2.selections.source);
      const selections = data2.selections.selections.map(Selection2.to);
      this._onDidChangeTextEditorSelection.fire({
        textEditor: textEditor.value,
        selections,
        kind
      });
    }
    if (data2.visibleRanges) {
      const visibleRanges = coalesce(data2.visibleRanges.map(Range3.to));
      this._onDidChangeTextEditorVisibleRanges.fire({
        textEditor: textEditor.value,
        visibleRanges
      });
    }
  }
  $acceptEditorPositionData(data2) {
    for (const id2 in data2) {
      const textEditor = this._extHostDocumentsAndEditors.getEditor(id2);
      if (!textEditor) {
        throw new Error("Unknown text editor");
      }
      const viewColumn = ViewColumn2.to(data2[id2]);
      if (textEditor.value.viewColumn !== viewColumn) {
        textEditor._acceptViewColumn(viewColumn);
        this._onDidChangeTextEditorViewColumn.fire({ textEditor: textEditor.value, viewColumn });
      }
    }
  }
  $acceptEditorDiffInformation(id2, diffInformation) {
    const textEditor = this._extHostDocumentsAndEditors.getEditor(id2);
    if (!textEditor) {
      throw new Error("unknown text editor");
    }
    if (!diffInformation) {
      textEditor._acceptDiffInformation(void 0);
      this._onDidChangeTextEditorDiffInformation.fire({
        textEditor: textEditor.value,
        diffInformation: void 0
      });
      return;
    }
    const that = this;
    const result = diffInformation.map((diff2) => {
      const original = URI.revive(diff2.original);
      const modified = URI.revive(diff2.modified);
      const changes = diff2.changes.map((change) => {
        const [originalStartLineNumber, originalEndLineNumberExclusive, modifiedStartLineNumber, modifiedEndLineNumberExclusive] = change;
        let kind;
        if (originalStartLineNumber === originalEndLineNumberExclusive) {
          kind = 1 /* Addition */;
        } else if (modifiedStartLineNumber === modifiedEndLineNumberExclusive) {
          kind = 2 /* Deletion */;
        } else {
          kind = 3 /* Modification */;
        }
        return {
          original: {
            startLineNumber: originalStartLineNumber,
            endLineNumberExclusive: originalEndLineNumberExclusive
          },
          modified: {
            startLineNumber: modifiedStartLineNumber,
            endLineNumberExclusive: modifiedEndLineNumberExclusive
          },
          kind
        };
      });
      return Object.freeze({
        documentVersion: diff2.documentVersion,
        original,
        modified,
        changes,
        get isStale() {
          const document2 = that._extHostDocumentsAndEditors.getDocument(modified);
          return document2?.version !== diff2.documentVersion;
        }
      });
    });
    textEditor._acceptDiffInformation(result);
    this._onDidChangeTextEditorDiffInformation.fire({
      textEditor: textEditor.value,
      diffInformation: result
    });
  }
  getDiffInformation(id2) {
    return Promise.resolve(this._proxy.$getDiffInformation(id2));
  }
};
export { ExtHostEditors };
