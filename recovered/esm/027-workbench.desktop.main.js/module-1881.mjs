// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/model/cellEdit.ts



// src/vs/workbench/contrib/notebook/common/model/cellEdit.ts
var MoveCellEdit = class {
  constructor(resource, fromIndex, length, toIndex, editingDelegate, beforedSelections, endSelections) {
    this.resource = resource;
    this.fromIndex = fromIndex;
    this.length = length;
    this.toIndex = toIndex;
    this.editingDelegate = editingDelegate;
    this.beforedSelections = beforedSelections;
    this.endSelections = endSelections;
    this.type = 0 /* Resource */;
    this.code = "undoredo.textBufferEdit";
  }
  get label() {
    return this.length === 1 ? "Move Cell" : "Move Cells";
  }
  undo() {
    if (!this.editingDelegate.moveCell) {
      throw new Error("Notebook Move Cell not implemented for Undo/Redo");
    }
    this.editingDelegate.moveCell(this.toIndex, this.length, this.fromIndex, this.endSelections, this.beforedSelections);
  }
  redo() {
    if (!this.editingDelegate.moveCell) {
      throw new Error("Notebook Move Cell not implemented for Undo/Redo");
    }
    this.editingDelegate.moveCell(this.fromIndex, this.length, this.toIndex, this.beforedSelections, this.endSelections);
  }
};

var SpliceCellsEdit = class {
  constructor(resource, diffs, editingDelegate, beforeHandles, endHandles) {
    this.resource = resource;
    this.diffs = diffs;
    this.editingDelegate = editingDelegate;
    this.beforeHandles = beforeHandles;
    this.endHandles = endHandles;
    this.type = 0 /* Resource */;
    this.code = "undoredo.textBufferEdit";
  }
  get label() {
    if (this.diffs.length === 1 && this.diffs[0][1].length === 0) {
      return this.diffs[0][2].length > 1 ? "Insert Cells" : "Insert Cell";
    }
    if (this.diffs.length === 1 && this.diffs[0][2].length === 0) {
      return this.diffs[0][1].length > 1 ? "Delete Cells" : "Delete Cell";
    }
    return "Insert Cell";
  }
  undo() {
    if (!this.editingDelegate.replaceCell) {
      throw new Error("Notebook Replace Cell not implemented for Undo/Redo");
    }
    this.diffs.forEach((diff4) => {
      this.editingDelegate.replaceCell(diff4[0], diff4[2].length, diff4[1], this.beforeHandles);
    });
  }
  redo() {
    if (!this.editingDelegate.replaceCell) {
      throw new Error("Notebook Replace Cell not implemented for Undo/Redo");
    }
    this.diffs.reverse().forEach((diff4) => {
      this.editingDelegate.replaceCell(diff4[0], diff4[1].length, diff4[2], this.endHandles);
    });
  }
};

var CellMetadataEdit = class {
  constructor(resource, index2, oldMetadata, newMetadata, editingDelegate) {
    this.resource = resource;
    this.index = index2;
    this.oldMetadata = oldMetadata;
    this.newMetadata = newMetadata;
    this.editingDelegate = editingDelegate;
    this.type = 0 /* Resource */;
    this.label = "Update Cell Metadata";
    this.code = "undoredo.textBufferEdit";
  }
  undo() {
    if (!this.editingDelegate.updateCellMetadata) {
      return;
    }
    this.editingDelegate.updateCellMetadata(this.index, this.oldMetadata);
  }
  redo() {
    if (!this.editingDelegate.updateCellMetadata) {
      return;
    }
    this.editingDelegate.updateCellMetadata(this.index, this.newMetadata);
  }
};
export { MoveCellEdit, SpliceCellsEdit, CellMetadataEdit };
