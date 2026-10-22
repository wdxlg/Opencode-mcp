// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostNotebookDocument.ts
import { NotebookRange } from "./module-0231.mjs";
import { URI } from "./module-0023.mjs";
import { NotebookCellExecutionSummary, NotebookCellKind2, NotebookCellOutput2, NotebookCellOutputItem2 } from "./module-0239.mjs";
import { isTextStreamMime } from "./module-0075.mjs";
import { compressOutputItemStreams } from "./module-0181.mjs";
import { Schemas } from "./module-0031.mjs";


// src/vs/workbench/api/common/extHostNotebookDocument.ts
var RawContentChangeEvent = class {
  constructor(start, deletedCount, deletedItems, items) {
    this.start = start;
    this.deletedCount = deletedCount;
    this.deletedItems = deletedItems;
    this.items = items;
  }
  asApiEvent() {
    return {
      range: new NotebookRange(this.start, this.start + this.deletedCount),
      addedCells: this.items.map((cell) => cell.apiCell),
      removedCells: this.deletedItems
    };
  }
};

var ExtHostCell = class {
  constructor(notebook, _extHostDocument, _cellData) {
    this.notebook = notebook;
    this._extHostDocument = _extHostDocument;
    this._cellData = _cellData;
    this.handle = _cellData.handle;
    this.uri = URI.revive(_cellData.uri);
    this.cellKind = _cellData.cellKind;
    this._outputs = _cellData.outputs.map(NotebookCellOutput2.to);
    this._internalMetadata = _cellData.internalMetadata ?? {};
    this._metadata = Object.freeze(_cellData.metadata ?? {});
    this._previousResult = Object.freeze(NotebookCellExecutionSummary.to(_cellData.internalMetadata ?? {}));
  }
  static asModelAddData(cell) {
    return {
      EOL: cell.eol,
      lines: cell.source,
      languageId: cell.language,
      uri: cell.uri,
      isDirty: false,
      versionId: 1,
      encoding: "utf8"
    };
  }
  get internalMetadata() {
    return this._internalMetadata;
  }
  get apiCell() {
    if (!this._apiCell) {
      const that = this;
      const data2 = this._extHostDocument.getDocument(this.uri);
      if (!data2) {
        throw new Error(`MISSING extHostDocument for notebook cell: ${this.uri}`);
      }
      const apiCell = {
        get index() {
          return that.notebook.getCellIndex(that);
        },
        notebook: that.notebook.apiNotebook,
        kind: NotebookCellKind2.to(this._cellData.cellKind),
        document: data2.document,
        get mime() {
          return that._mime;
        },
        set mime(value) {
          that._mime = value;
        },
        get outputs() {
          return that._outputs.slice(0);
        },
        get metadata() {
          return that._metadata;
        },
        get executionSummary() {
          return that._previousResult;
        }
      };
      this._apiCell = Object.freeze(apiCell);
    }
    return this._apiCell;
  }
  setOutputs(newOutputs) {
    this._outputs = newOutputs.map(NotebookCellOutput2.to);
  }
  setOutputItems(outputId, append, newOutputItems) {
    const newItems = newOutputItems.map(NotebookCellOutputItem2.to);
    const output = this._outputs.find((op) => op.id === outputId);
    if (output) {
      if (!append) {
        output.items.length = 0;
      }
      output.items.push(...newItems);
      if (output.items.length > 1 && output.items.every((item) => isTextStreamMime(item.mime))) {
        const mimeOutputs = /* @__PURE__ */ new Map();
        const mimeTypes = [];
        output.items.forEach((item) => {
          let items;
          if (mimeOutputs.has(item.mime)) {
            items = mimeOutputs.get(item.mime);
          } else {
            items = [];
            mimeOutputs.set(item.mime, items);
            mimeTypes.push(item.mime);
          }
          items.push(item.data);
        });
        output.items.length = 0;
        mimeTypes.forEach((mime) => {
          const compressed = compressOutputItemStreams(mimeOutputs.get(mime));
          output.items.push({
            mime,
            data: compressed.data.buffer
          });
        });
      }
    }
  }
  setMetadata(newMetadata) {
    this._metadata = Object.freeze(newMetadata);
  }
  setInternalMetadata(newInternalMetadata) {
    this._internalMetadata = newInternalMetadata;
    this._previousResult = Object.freeze(NotebookCellExecutionSummary.to(newInternalMetadata));
  }
  setMime(newMime) {
  }
};

var ExtHostNotebookDocument = class _ExtHostNotebookDocument {
  constructor(_proxy, _textDocumentsAndEditors, _textDocuments, uri2, data2) {
    this._proxy = _proxy;
    this._textDocumentsAndEditors = _textDocumentsAndEditors;
    this._textDocuments = _textDocuments;
    this.uri = uri2;
    this.handle = _ExtHostNotebookDocument._handlePool++;
    this._cells = [];
    this._versionId = 0;
    this._isDirty = false;
    this._disposed = false;
    this._notebookType = data2.viewType;
    this._metadata = Object.freeze(data2.metadata ?? /* @__PURE__ */ Object.create(null));
    this._spliceNotebookCells([[0, 0, data2.cells]], true, void 0);
    this._versionId = data2.versionId;
  }
  static {
    this._handlePool = 0;
  }
  dispose() {
    this._disposed = true;
  }
  get versionId() {
    return this._versionId;
  }
  get apiNotebook() {
    if (!this._notebook) {
      const that = this;
      const apiObject = {
        get uri() {
          return that.uri;
        },
        get version() {
          return that._versionId;
        },
        get notebookType() {
          return that._notebookType;
        },
        get isDirty() {
          return that._isDirty;
        },
        get isUntitled() {
          return that.uri.scheme === Schemas.untitled;
        },
        get isClosed() {
          return that._disposed;
        },
        get metadata() {
          return that._metadata;
        },
        get cellCount() {
          return that._cells.length;
        },
        cellAt(index) {
          index = that._validateIndex(index);
          return that._cells[index].apiCell;
        },
        getCells(range) {
          const cells = range ? that._getCells(range) : that._cells;
          return cells.map((cell) => cell.apiCell);
        },
        save() {
          return that._save();
        },
        [/* @__PURE__ */ Symbol.for("debug.description")]() {
          return `NotebookDocument(${this.uri.toString()})`;
        }
      };
      this._notebook = Object.freeze(apiObject);
    }
    return this._notebook;
  }
  acceptDocumentPropertiesChanged(data2) {
    if (data2.metadata) {
      this._metadata = Object.freeze({ ...this._metadata, ...data2.metadata });
    }
  }
  acceptDirty(isDirty) {
    this._isDirty = isDirty;
  }
  acceptModelChanged(event, isDirty, newMetadata) {
    this._versionId = event.versionId;
    this._isDirty = isDirty;
    this.acceptDocumentPropertiesChanged({ metadata: newMetadata });
    const result = {
      notebook: this.apiNotebook,
      metadata: newMetadata,
      cellChanges: [],
      contentChanges: []
    };
    const relaxedCellChanges = [];
    for (const rawEvent of event.rawEvents) {
      if (rawEvent.kind === 1 /* ModelChange */) {
        this._spliceNotebookCells(rawEvent.changes, false, result.contentChanges);
      } else if (rawEvent.kind === 2 /* Move */) {
        this._moveCells(rawEvent.index, rawEvent.length, rawEvent.newIdx, result.contentChanges);
      } else if (rawEvent.kind === 8 /* Output */) {
        this._setCellOutputs(rawEvent.index, rawEvent.outputs);
        relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, outputs: this._cells[rawEvent.index].apiCell.outputs });
      } else if (rawEvent.kind === 9 /* OutputItem */) {
        this._setCellOutputItems(rawEvent.index, rawEvent.outputId, rawEvent.append, rawEvent.outputItems);
        relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, outputs: this._cells[rawEvent.index].apiCell.outputs });
      } else if (rawEvent.kind === 5 /* ChangeCellLanguage */) {
        this._changeCellLanguage(rawEvent.index, rawEvent.language);
        relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, document: this._cells[rawEvent.index].apiCell.document });
      } else if (rawEvent.kind === 10 /* ChangeCellContent */) {
        relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, document: this._cells[rawEvent.index].apiCell.document });
      } else if (rawEvent.kind === 13 /* ChangeCellMime */) {
        this._changeCellMime(rawEvent.index, rawEvent.mime);
      } else if (rawEvent.kind === 7 /* ChangeCellMetadata */) {
        this._changeCellMetadata(rawEvent.index, rawEvent.metadata);
        relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, metadata: this._cells[rawEvent.index].apiCell.metadata });
      } else if (rawEvent.kind === 12 /* ChangeCellInternalMetadata */) {
        this._changeCellInternalMetadata(rawEvent.index, rawEvent.internalMetadata);
        relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, executionSummary: this._cells[rawEvent.index].apiCell.executionSummary });
      }
    }
    const map = /* @__PURE__ */ new Map();
    for (let i = 0; i < relaxedCellChanges.length; i++) {
      const relaxedCellChange = relaxedCellChanges[i];
      const existing = map.get(relaxedCellChange.cell);
      if (existing === void 0) {
        const newLen = result.cellChanges.push({
          document: void 0,
          executionSummary: void 0,
          metadata: void 0,
          outputs: void 0,
          ...relaxedCellChange
        });
        map.set(relaxedCellChange.cell, newLen - 1);
      } else {
        result.cellChanges[existing] = {
          ...result.cellChanges[existing],
          ...relaxedCellChange
        };
      }
    }
    Object.freeze(result);
    Object.freeze(result.cellChanges);
    Object.freeze(result.contentChanges);
    return result;
  }
  _validateIndex(index) {
    index = index | 0;
    if (index < 0) {
      return 0;
    } else if (index >= this._cells.length) {
      return this._cells.length - 1;
    } else {
      return index;
    }
  }
  _validateRange(range) {
    let start = range.start | 0;
    let end = range.end | 0;
    if (start < 0) {
      start = 0;
    }
    if (end > this._cells.length) {
      end = this._cells.length;
    }
    return range.with({ start, end });
  }
  _getCells(range) {
    range = this._validateRange(range);
    const result = [];
    for (let i = range.start; i < range.end; i++) {
      result.push(this._cells[i]);
    }
    return result;
  }
  async _save() {
    if (this._disposed) {
      return Promise.reject(new Error("Notebook has been closed"));
    }
    return this._proxy.$trySaveNotebook(this.uri);
  }
  _spliceNotebookCells(splices, initialization, bucket) {
    if (this._disposed) {
      return;
    }
    const contentChangeEvents = [];
    const addedCellDocuments = [];
    const removedCellDocuments = [];
    splices.reverse().forEach((splice) => {
      const cellDtos = splice[2];
      const newCells = cellDtos.map((cell) => {
        const extCell = new ExtHostCell(this, this._textDocumentsAndEditors, cell);
        if (!initialization) {
          addedCellDocuments.push(ExtHostCell.asModelAddData(cell));
        }
        return extCell;
      });
      const changeEvent = new RawContentChangeEvent(splice[0], splice[1], [], newCells);
      const deletedItems = this._cells.splice(splice[0], splice[1], ...newCells);
      for (const cell of deletedItems) {
        removedCellDocuments.push(cell.uri);
        changeEvent.deletedItems.push(cell.apiCell);
      }
      contentChangeEvents.push(changeEvent);
    });
    this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
      addedDocuments: addedCellDocuments,
      removedDocuments: removedCellDocuments
    });
    if (bucket) {
      for (const changeEvent of contentChangeEvents) {
        bucket.push(changeEvent.asApiEvent());
      }
    }
  }
  _moveCells(index, length, newIdx, bucket) {
    const cells = this._cells.splice(index, length);
    this._cells.splice(newIdx, 0, ...cells);
    const changes = [
      new RawContentChangeEvent(index, length, cells.map((c) => c.apiCell), []),
      new RawContentChangeEvent(newIdx, 0, [], cells)
    ];
    for (const change of changes) {
      bucket.push(change.asApiEvent());
    }
  }
  _setCellOutputs(index, outputs) {
    const cell = this._cells[index];
    cell.setOutputs(outputs);
  }
  _setCellOutputItems(index, outputId, append, outputItems) {
    const cell = this._cells[index];
    cell.setOutputItems(outputId, append, outputItems);
  }
  _changeCellLanguage(index, newLanguageId) {
    const cell = this._cells[index];
    if (cell.apiCell.document.languageId !== newLanguageId) {
      this._textDocuments.$acceptModelLanguageChanged(cell.uri, newLanguageId);
    }
  }
  _changeCellMime(index, newMime) {
    const cell = this._cells[index];
    cell.apiCell.mime = newMime;
  }
  _changeCellMetadata(index, newMetadata) {
    const cell = this._cells[index];
    cell.setMetadata(newMetadata);
  }
  _changeCellInternalMetadata(index, newInternalMetadata) {
    const cell = this._cells[index];
    cell.setInternalMetadata(newInternalMetadata);
  }
  getCellFromApiCell(apiCell) {
    return this._cells.find((cell) => cell.apiCell === apiCell);
  }
  getCellFromIndex(index) {
    return this._cells[index];
  }
  getCell(cellHandle) {
    return this._cells.find((cell) => cell.handle === cellHandle);
  }
  getCellIndex(cell) {
    return this._cells.indexOf(cell);
  }
};
export { RawContentChangeEvent, ExtHostCell, ExtHostNotebookDocument };
