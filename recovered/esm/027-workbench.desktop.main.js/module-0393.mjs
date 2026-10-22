// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/editStack.ts
import { TextChange, compressConsecutiveTextChanges } from "./module-0392.mjs";
import { readUInt32BE, readUInt8, writeUInt32BE, writeUInt8 } from "./module-0038.mjs";
import { Selection } from "./module-0107.mjs";
import { URI } from "./module-0032.mjs";
import { basename2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { EditSources } from "./module-0377.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/editor/common/model/editStack.ts
function uriGetComparisonKey(resource) {
  return resource.toString();
}

var SingleModelEditStackData = class _SingleModelEditStackData {
  constructor(beforeVersionId, afterVersionId, beforeEOL, afterEOL, beforeCursorState, afterCursorState, changes) {
    this.beforeVersionId = beforeVersionId;
    this.afterVersionId = afterVersionId;
    this.beforeEOL = beforeEOL;
    this.afterEOL = afterEOL;
    this.beforeCursorState = beforeCursorState;
    this.afterCursorState = afterCursorState;
    this.changes = changes;
  }
  static create(model, beforeCursorState) {
    const alternativeVersionId = model.getAlternativeVersionId();
    const eol = getModelEOL(model);
    return new _SingleModelEditStackData(
      alternativeVersionId,
      alternativeVersionId,
      eol,
      eol,
      beforeCursorState,
      beforeCursorState,
      []
    );
  }
  append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
    if (textChanges.length > 0) {
      this.changes = compressConsecutiveTextChanges(this.changes, textChanges);
    }
    this.afterEOL = afterEOL;
    this.afterVersionId = afterVersionId;
    this.afterCursorState = afterCursorState;
  }
  static _writeSelectionsSize(selections) {
    return 4 + 4 * 4 * (selections ? selections.length : 0);
  }
  static _writeSelections(b, selections, offset) {
    writeUInt32BE(b, selections ? selections.length : 0, offset);
    offset += 4;
    if (selections) {
      for (const selection of selections) {
        writeUInt32BE(b, selection.selectionStartLineNumber, offset);
        offset += 4;
        writeUInt32BE(b, selection.selectionStartColumn, offset);
        offset += 4;
        writeUInt32BE(b, selection.positionLineNumber, offset);
        offset += 4;
        writeUInt32BE(b, selection.positionColumn, offset);
        offset += 4;
      }
    }
    return offset;
  }
  static _readSelections(b, offset, dest) {
    const count2 = readUInt32BE(b, offset);
    offset += 4;
    for (let i2 = 0; i2 < count2; i2++) {
      const selectionStartLineNumber = readUInt32BE(b, offset);
      offset += 4;
      const selectionStartColumn = readUInt32BE(b, offset);
      offset += 4;
      const positionLineNumber = readUInt32BE(b, offset);
      offset += 4;
      const positionColumn = readUInt32BE(b, offset);
      offset += 4;
      dest.push(new Selection(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn));
    }
    return offset;
  }
  serialize() {
    let necessarySize = 4 + 4 + 1 + 1 + _SingleModelEditStackData._writeSelectionsSize(this.beforeCursorState) + _SingleModelEditStackData._writeSelectionsSize(this.afterCursorState) + 4;
    for (const change of this.changes) {
      necessarySize += change.writeSize();
    }
    const b = new Uint8Array(necessarySize);
    let offset = 0;
    writeUInt32BE(b, this.beforeVersionId, offset);
    offset += 4;
    writeUInt32BE(b, this.afterVersionId, offset);
    offset += 4;
    writeUInt8(b, this.beforeEOL, offset);
    offset += 1;
    writeUInt8(b, this.afterEOL, offset);
    offset += 1;
    offset = _SingleModelEditStackData._writeSelections(b, this.beforeCursorState, offset);
    offset = _SingleModelEditStackData._writeSelections(b, this.afterCursorState, offset);
    writeUInt32BE(b, this.changes.length, offset);
    offset += 4;
    for (const change of this.changes) {
      offset = change.write(b, offset);
    }
    return b.buffer;
  }
  static deserialize(source) {
    const b = new Uint8Array(source);
    let offset = 0;
    const beforeVersionId = readUInt32BE(b, offset);
    offset += 4;
    const afterVersionId = readUInt32BE(b, offset);
    offset += 4;
    const beforeEOL = readUInt8(b, offset);
    offset += 1;
    const afterEOL = readUInt8(b, offset);
    offset += 1;
    const beforeCursorState = [];
    offset = _SingleModelEditStackData._readSelections(b, offset, beforeCursorState);
    const afterCursorState = [];
    offset = _SingleModelEditStackData._readSelections(b, offset, afterCursorState);
    const changeCount = readUInt32BE(b, offset);
    offset += 4;
    const changes = [];
    for (let i2 = 0; i2 < changeCount; i2++) {
      offset = TextChange.read(b, offset, changes);
    }
    return new _SingleModelEditStackData(
      beforeVersionId,
      afterVersionId,
      beforeEOL,
      afterEOL,
      beforeCursorState,
      afterCursorState,
      changes
    );
  }
};

var SingleModelEditStackElement = class {
  constructor(label3, code, model, beforeCursorState) {
    this.label = label3;
    this.code = code;
    this.model = model;
    this._data = SingleModelEditStackData.create(model, beforeCursorState);
  }
  get type() {
    return 0 /* Resource */;
  }
  get resource() {
    if (URI.isUri(this.model)) {
      return this.model;
    }
    return this.model.uri;
  }
  toString() {
    const data = this._data instanceof SingleModelEditStackData ? this._data : SingleModelEditStackData.deserialize(this._data);
    return data.changes.map((change) => change.toString()).join(", ");
  }
  matchesResource(resource) {
    const uri5 = URI.isUri(this.model) ? this.model : this.model.uri;
    return uri5.toString() === resource.toString();
  }
  setModel(model) {
    this.model = model;
  }
  canAppend(model) {
    return this.model === model && this._data instanceof SingleModelEditStackData;
  }
  append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
    if (this._data instanceof SingleModelEditStackData) {
      this._data.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
    }
  }
  close() {
    if (this._data instanceof SingleModelEditStackData) {
      this._data = this._data.serialize();
    }
  }
  open() {
    if (!(this._data instanceof SingleModelEditStackData)) {
      this._data = SingleModelEditStackData.deserialize(this._data);
    }
  }
  undo() {
    if (URI.isUri(this.model)) {
      throw new Error(`Invalid SingleModelEditStackElement`);
    }
    if (this._data instanceof SingleModelEditStackData) {
      this._data = this._data.serialize();
    }
    const data = SingleModelEditStackData.deserialize(this._data);
    this.model._applyUndo(data.changes, data.beforeEOL, data.beforeVersionId, data.beforeCursorState);
  }
  redo() {
    if (URI.isUri(this.model)) {
      throw new Error(`Invalid SingleModelEditStackElement`);
    }
    if (this._data instanceof SingleModelEditStackData) {
      this._data = this._data.serialize();
    }
    const data = SingleModelEditStackData.deserialize(this._data);
    this.model._applyRedo(data.changes, data.afterEOL, data.afterVersionId, data.afterCursorState);
  }
  heapSize() {
    if (this._data instanceof SingleModelEditStackData) {
      this._data = this._data.serialize();
    }
    return this._data.byteLength + 168;
  }
};

var MultiModelEditStackElement = class {
  constructor(label3, code, editStackElements) {
    this.label = label3;
    this.code = code;
    this.type = 1 /* Workspace */;
    this._isOpen = true;
    this._editStackElementsArr = editStackElements.slice(0);
    this._editStackElementsMap = /* @__PURE__ */ new Map();
    for (const editStackElement of this._editStackElementsArr) {
      const key3 = uriGetComparisonKey(editStackElement.resource);
      this._editStackElementsMap.set(key3, editStackElement);
    }
    this._delegate = null;
  }
  get resources() {
    return this._editStackElementsArr.map((editStackElement) => editStackElement.resource);
  }
  setDelegate(delegate) {
    this._delegate = delegate;
  }
  prepareUndoRedo() {
    if (this._delegate) {
      return this._delegate.prepareUndoRedo(this);
    }
  }
  getMissingModels() {
    const result = [];
    for (const editStackElement of this._editStackElementsArr) {
      if (URI.isUri(editStackElement.model)) {
        result.push(editStackElement.model);
      }
    }
    return result;
  }
  matchesResource(resource) {
    const key3 = uriGetComparisonKey(resource);
    return this._editStackElementsMap.has(key3);
  }
  setModel(model) {
    const key3 = uriGetComparisonKey(URI.isUri(model) ? model : model.uri);
    if (this._editStackElementsMap.has(key3)) {
      this._editStackElementsMap.get(key3).setModel(model);
    }
  }
  canAppend(model) {
    if (!this._isOpen) {
      return false;
    }
    const key3 = uriGetComparisonKey(model.uri);
    if (this._editStackElementsMap.has(key3)) {
      const editStackElement = this._editStackElementsMap.get(key3);
      return editStackElement.canAppend(model);
    }
    return false;
  }
  append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
    const key3 = uriGetComparisonKey(model.uri);
    const editStackElement = this._editStackElementsMap.get(key3);
    editStackElement.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
  }
  close() {
    this._isOpen = false;
  }
  open() {
  }
  undo() {
    this._isOpen = false;
    for (const editStackElement of this._editStackElementsArr) {
      editStackElement.undo();
    }
  }
  redo() {
    for (const editStackElement of this._editStackElementsArr) {
      editStackElement.redo();
    }
  }
  heapSize(resource) {
    const key3 = uriGetComparisonKey(resource);
    if (this._editStackElementsMap.has(key3)) {
      const editStackElement = this._editStackElementsMap.get(key3);
      return editStackElement.heapSize();
    }
    return 0;
  }
  split() {
    return this._editStackElementsArr;
  }
  toString() {
    const result = [];
    for (const editStackElement of this._editStackElementsArr) {
      result.push(`${basename2(editStackElement.resource)}: ${editStackElement}`);
    }
    return `{${result.join(", ")}}`;
  }
};

function getModelEOL(model) {
  const eol = model.getEOL();
  if (eol === "\n") {
    return 0 /* LF */;
  } else {
    return 1 /* CRLF */;
  }
}

function isEditStackElement(element) {
  if (!element) {
    return false;
  }
  return element instanceof SingleModelEditStackElement || element instanceof MultiModelEditStackElement;
}

var EditStack = class _EditStack {
  constructor(model, undoRedoService) {
    this._model = model;
    this._undoRedoService = undoRedoService;
  }
  pushStackElement() {
    const lastElement = this._undoRedoService.getLastElement(this._model.uri);
    if (isEditStackElement(lastElement)) {
      lastElement.close();
    }
  }
  popStackElement() {
    const lastElement = this._undoRedoService.getLastElement(this._model.uri);
    if (isEditStackElement(lastElement)) {
      lastElement.open();
    }
  }
  clear() {
    this._undoRedoService.removeElements(this._model.uri);
  }
  _getOrCreateEditStackElement(beforeCursorState, group2) {
    const lastElement = this._undoRedoService.getLastElement(this._model.uri);
    if (isEditStackElement(lastElement) && lastElement.canAppend(this._model)) {
      return lastElement;
    }
    const newElement = new SingleModelEditStackElement(localize(925, null), "undoredo.textBufferEdit", this._model, beforeCursorState);
    this._undoRedoService.pushElement(newElement, group2);
    return newElement;
  }
  pushEOL(eol) {
    const editStackElement = this._getOrCreateEditStackElement(null, void 0);
    this._model.setEOL(eol);
    editStackElement.append(this._model, [], getModelEOL(this._model), this._model.getAlternativeVersionId(), null);
  }
  pushEditOperation(beforeCursorState, editOperations, cursorStateComputer, group2, reason = EditSources.unknown({ name: "pushEditOperation" })) {
    const editStackElement = this._getOrCreateEditStackElement(beforeCursorState, group2);
    const inverseEditOperations = this._model.applyEdits(editOperations, true, reason);
    const afterCursorState = _EditStack._computeCursorState(cursorStateComputer, inverseEditOperations);
    const textChanges = inverseEditOperations.map((op, index2) => ({ index: index2, textChange: op.textChange }));
    textChanges.sort((a, b) => {
      if (a.textChange.oldPosition === b.textChange.oldPosition) {
        return a.index - b.index;
      }
      return a.textChange.oldPosition - b.textChange.oldPosition;
    });
    editStackElement.append(this._model, textChanges.map((op) => op.textChange), getModelEOL(this._model), this._model.getAlternativeVersionId(), afterCursorState);
    return afterCursorState;
  }
  static _computeCursorState(cursorStateComputer, inverseEditOperations) {
    try {
      return cursorStateComputer ? cursorStateComputer(inverseEditOperations) : null;
    } catch (e) {
      onUnexpectedError(e);
      return null;
    }
  }
};
export { uriGetComparisonKey, getModelEOL, isEditStackElement, SingleModelEditStackData, SingleModelEditStackElement, MultiModelEditStackElement, EditStack };
