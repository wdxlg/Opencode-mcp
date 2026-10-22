// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/workspaceEdit.ts
import { TextEdit } from "./module-0236.mjs";
import { Range2 } from "./module-0227.mjs";
import { coalesceInPlace } from "./module-0004.mjs";
import { NotebookEdit } from "./module-0231.mjs";
import { SnippetTextEdit } from "./module-0234.mjs";
import { ResourceMap } from "./module-0006.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0224.mjs";


// src/vs/workbench/api/common/extHostTypes/workspaceEdit.ts
var WorkspaceEdit = class {
  constructor() {
    this._edits = [];
  }
  _allEntries() {
    return this._edits;
  }
  // --- file
  renameFile(from, to, options2, metadata) {
    this._edits.push({ _type: 1 /* File */, from, to, options: options2, metadata });
  }
  createFile(uri2, options2, metadata) {
    this._edits.push({ _type: 1 /* File */, from: void 0, to: uri2, options: options2, metadata });
  }
  deleteFile(uri2, options2, metadata) {
    this._edits.push({ _type: 1 /* File */, from: uri2, to: void 0, options: options2, metadata });
  }
  // --- notebook
  replaceNotebookMetadata(uri2, value, metadata) {
    this._edits.push({ _type: 3 /* Cell */, metadata, uri: uri2, edit: { editType: 5 /* DocumentMetadata */, metadata: value } });
  }
  replaceNotebookCells(uri2, startOrRange, cellData, metadata) {
    const start = startOrRange.start;
    const end = startOrRange.end;
    if (start !== end || cellData.length > 0) {
      this._edits.push({ _type: 5 /* CellReplace */, uri: uri2, index: start, count: end - start, cells: cellData, metadata });
    }
  }
  replaceNotebookCellMetadata(uri2, index, cellMetadata, metadata) {
    this._edits.push({ _type: 3 /* Cell */, metadata, uri: uri2, edit: { editType: 3 /* Metadata */, index, metadata: cellMetadata } });
  }
  // --- text
  replace(uri2, range, newText, metadata) {
    this._edits.push({ _type: 2 /* Text */, uri: uri2, edit: new TextEdit(range, newText), metadata });
  }
  insert(resource, position, newText, metadata) {
    this.replace(resource, new Range2(position, position), newText, metadata);
  }
  delete(resource, range, metadata) {
    this.replace(resource, range, "", metadata);
  }
  // --- text (Maplike)
  has(uri2) {
    return this._edits.some((edit2) => edit2._type === 2 /* Text */ && edit2.uri.toString() === uri2.toString());
  }
  set(uri2, edits) {
    if (!edits) {
      for (let i = 0; i < this._edits.length; i++) {
        const element = this._edits[i];
        switch (element._type) {
          case 2 /* Text */:
          case 6 /* Snippet */:
          case 3 /* Cell */:
          case 5 /* CellReplace */:
            if (element.uri.toString() === uri2.toString()) {
              this._edits[i] = void 0;
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
        let edit2;
        let metadata;
        if (Array.isArray(editOrTuple)) {
          edit2 = editOrTuple[0];
          metadata = editOrTuple[1];
        } else {
          edit2 = editOrTuple;
        }
        if (NotebookEdit.isNotebookCellEdit(edit2)) {
          if (edit2.newCellMetadata) {
            this.replaceNotebookCellMetadata(uri2, edit2.range.start, edit2.newCellMetadata, metadata);
          } else if (edit2.newNotebookMetadata) {
            this.replaceNotebookMetadata(uri2, edit2.newNotebookMetadata, metadata);
          } else {
            this.replaceNotebookCells(uri2, edit2.range, edit2.newCells, metadata);
          }
        } else if (SnippetTextEdit.isSnippetTextEdit(edit2)) {
          this._edits.push({ _type: 6 /* Snippet */, uri: uri2, range: edit2.range, edit: edit2.snippet, metadata, keepWhitespace: edit2.keepWhitespace });
        } else {
          this._edits.push({ _type: 2 /* Text */, uri: uri2, edit: edit2, metadata });
        }
      }
    }
  }
  get(uri2) {
    const res = [];
    for (const candidate of this._edits) {
      if (candidate._type === 2 /* Text */ && candidate.uri.toString() === uri2.toString()) {
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

WorkspaceEdit = __decorateClass([
  es5ClassCompat
], WorkspaceEdit);
export { WorkspaceEdit };
