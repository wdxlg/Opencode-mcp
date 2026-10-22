// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/outputEditor/notebookOutputEditorInput.ts
import { EditorInput } from "./module-0929.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookEditorModelResolverService } from "./module-0928.mjs";


// src/vs/workbench/contrib/notebook/browser/outputEditor/notebookOutputEditorInput.ts
var ResolvedNotebookOutputEditorInputModel = class {
  constructor(resolvedNotebookEditorModel, notebookUri, cell, outputId) {
    this.resolvedNotebookEditorModel = resolvedNotebookEditorModel;
    this.notebookUri = notebookUri;
    this.cell = cell;
    this.outputId = outputId;
  }
  dispose() {
    this.resolvedNotebookEditorModel.dispose();
  }
};

var NotebookOutputEditorInput = class extends EditorInput {
  constructor(notebookUri, cellIndex, outputId, outputIndex, notebookEditorModelResolverService) {
    super();
    this.notebookEditorModelResolverService = notebookEditorModelResolverService;
    this._notebookUri = notebookUri;
    this.cellUri = void 0;
    this.cellIndex = cellIndex;
    this.outputId = outputId;
    this.outputIndex = outputIndex;
  }
  static {
    this.ID = "workbench.input.notebookOutputEditorInput";
  }
  get typeId() {
    return NotebookOutputEditorInput.ID;
  }
  async resolve() {
    if (!this._notebookRef) {
      this._notebookRef = await this.notebookEditorModelResolverService.resolve(this._notebookUri);
    }
    const cell = this._notebookRef.object.notebook.cells[this.cellIndex];
    if (!cell) {
      throw new Error("Cell not found");
    }
    this.cellUri = cell.uri;
    const resolvedOutputId = cell.outputs[this.outputIndex]?.outputId;
    if (!resolvedOutputId) {
      throw new Error("Output not found");
    }
    if (!this.outputId) {
      this.outputId = resolvedOutputId;
    }
    return new ResolvedNotebookOutputEditorInputModel(
      this._notebookRef.object,
      this._notebookUri,
      cell,
      resolvedOutputId
    );
  }
  getSerializedData() {
    if (!this._notebookRef) {
      return;
    }
    const cellIndex = this._notebookRef.object.notebook.cells.findIndex((c) => isEqual2(c.uri, this.cellUri));
    const cell = this._notebookRef.object.notebook.cells[cellIndex];
    if (!cell) {
      return;
    }
    const outputIndex = cell.outputs.findIndex((o) => o.outputId === this.outputId);
    if (outputIndex === -1) {
      return;
    }
    return {
      notebookUri: this._notebookUri,
      cellIndex,
      outputIndex
    };
  }
  getName() {
    return localize(17859, null);
  }
  get editorId() {
    return "notebookOutputEditor";
  }
  get resource() {
    return;
  }
  get capabilities() {
    return 2 /* Readonly */;
  }
  dispose() {
    super.dispose();
  }
};

NotebookOutputEditorInput = __decorateClass([
  __decorateParam(4, INotebookEditorModelResolverService)
], NotebookOutputEditorInput);
export { ResolvedNotebookOutputEditorInputModel, NotebookOutputEditorInput };
