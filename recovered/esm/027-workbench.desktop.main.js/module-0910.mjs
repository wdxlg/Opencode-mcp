// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/workspaceEdit.ts
import { TextEdit3 } from "./module-0907.mjs";
import { Range4 } from "./module-0898.mjs";
import { coalesceInPlace } from "./module-0007.mjs";
import { NotebookEdit } from "./module-0902.mjs";
import { SnippetTextEdit } from "./module-0905.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0895.mjs";


// src/vs/workbench/api/common/extHostTypes/workspaceEdit.ts
var WorkspaceEdit2 = class {
  constructor() {
    this._edits = [];
  }
  _allEntries() {
    return this._edits;
  }
  // --- file
  renameFile(from, to, options3, metadata) {
    this._edits.push({ _type: 1 /* File */, from, to, options: options3, metadata });
  }
  createFile(uri5, options3, metadata) {
    this._edits.push({ _type: 1 /* File */, from: void 0, to: uri5, options: options3, metadata });
  }
  deleteFile(uri5, options3, metadata) {
    this._edits.push({ _type: 1 /* File */, from: uri5, to: void 0, options: options3, metadata });
  }
  // --- notebook
  replaceNotebookMetadata(uri5, value2, metadata) {
    this._edits.push({ _type: 3 /* Cell */, metadata, uri: uri5, edit: { editType: 5 /* DocumentMetadata */, metadata: value2 } });
  }
  replaceNotebookCells(uri5, startOrRange, cellData, metadata) {
    const start = startOrRange.start;
    const end = startOrRange.end;
    if (start !== end || cellData.length > 0) {
      this._edits.push({ _type: 5 /* CellReplace */, uri: uri5, index: start, count: end - start, cells: cellData, metadata });
    }
  }
  replaceNotebookCellMetadata(uri5, index2, cellMetadata, metadata) {
    this._edits.push({ _type: 3 /* Cell */, metadata, uri: uri5, edit: { editType: 3 /* Metadata */, index: index2, metadata: cellMetadata } });
  }
  // --- text
  replace(uri5, range2, newText, metadata) {
    this._edits.push({ _type: 2 /* Text */, uri: uri5, edit: new TextEdit3(range2, newText), metadata });
  }
  insert(resource, position2, newText, metadata) {
    this.replace(resource, new Range4(position2, position2), newText, metadata);
  }
  delete(resource, range2, metadata) {
    this.replace(resource, range2, "", metadata);
  }
  // --- text (Maplike)
  has(uri5) {
    return this._edits.some((edit3) => edit3._type === 2 /* Text */ && edit3.uri.toString() === uri5.toString());
  }
  set(uri5, edits) {
    if (!edits) {
      for (let i2 = 0; i2 < this._edits.length; i2++) {
        const element = this._edits[i2];
        switch (element._type) {
          case 2 /* Text */:
          case 6 /* Snippet */:
          case 3 /* Cell */:
          case 5 /* CellReplace */:
            if (element.uri.toString() === uri5.toString()) {
              this._edits[i2] = void 0;
            }
            break;
        }
      }
      coalesceInPlace(this._edits);
    } else {
      for (const editOrTuple of edits) {
        if (!editOrTuple) {
          continue;
        }
        let edit3;
        let metadata;
        if (Array.isArray(editOrTuple)) {
          edit3 = editOrTuple[0];
          metadata = editOrTuple[1];
        } else {
          edit3 = editOrTuple;
        }
        if (NotebookEdit.isNotebookCellEdit(edit3)) {
          if (edit3.newCellMetadata) {
            this.replaceNotebookCellMetadata(uri5, edit3.range.start, edit3.newCellMetadata, metadata);
          } else if (edit3.newNotebookMetadata) {
            this.replaceNotebookMetadata(uri5, edit3.newNotebookMetadata, metadata);
          } else {
            this.replaceNotebookCells(uri5, edit3.range, edit3.newCells, metadata);
          }
        } else if (SnippetTextEdit.isSnippetTextEdit(edit3)) {
          this._edits.push({ _type: 6 /* Snippet */, uri: uri5, range: edit3.range, edit: edit3.snippet, metadata, keepWhitespace: edit3.keepWhitespace });
        } else {
          this._edits.push({ _type: 2 /* Text */, uri: uri5, edit: edit3, metadata });
        }
      }
    }
  }
  get(uri5) {
    const res = [];
    for (const candidate of this._edits) {
      if (candidate._type === 2 /* Text */ && candidate.uri.toString() === uri5.toString()) {
        res.push(candidate.edit);
      }
    }
    return res;
  }
  entries() {
    const textEdits = new ResourceMap();
    for (const candidate of this._edits) {
      if (candidate._type === 2 /* Text */) {
        let textEdit = textEdits.get(candidate.uri);
        if (!textEdit) {
          textEdit = [candidate.uri, []];
          textEdits.set(candidate.uri, textEdit);
        }
        textEdit[1].push(candidate.edit);
      }
    }
    return [...textEdits.values()];
  }
  get size() {
    return this.entries().length;
  }
  toJSON() {
    return this.entries();
  }
};

WorkspaceEdit2 = __decorateClass([
  es5ClassCompat
], WorkspaceEdit2);
export { WorkspaceEdit2 };
