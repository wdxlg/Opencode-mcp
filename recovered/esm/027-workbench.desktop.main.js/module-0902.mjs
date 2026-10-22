// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/notebooks.ts
import { illegalArgument } from "./module-0004.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0895.mjs";
import { Mimes, isTextStreamMime, normalizeMimeType } from "./module-0136.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/workbench/api/common/extHostTypes/notebooks.ts
var NotebookRange = class _NotebookRange {
  static isNotebookRange(thing) {
    if (thing instanceof _NotebookRange) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return typeof thing.start === "number" && typeof thing.end === "number";
  }
  get start() {
    return this._start;
  }
  get end() {
    return this._end;
  }
  get isEmpty() {
    return this._start === this._end;
  }
  constructor(start, end) {
    if (start < 0) {
      throw illegalArgument("start must be positive");
    }
    if (end < 0) {
      throw illegalArgument("end must be positive");
    }
    if (start <= end) {
      this._start = start;
      this._end = end;
    } else {
      this._start = end;
      this._end = start;
    }
  }
  with(change) {
    let start = this._start;
    let end = this._end;
    if (change.start !== void 0) {
      start = change.start;
    }
    if (change.end !== void 0) {
      end = change.end;
    }
    if (start === this._start && end === this._end) {
      return this;
    }
    return new _NotebookRange(start, end);
  }
};

var NotebookCellData = class _NotebookCellData {
  static validate(data) {
    if (typeof data.kind !== "number") {
      throw new Error("NotebookCellData MUST have 'kind' property");
    }
    if (typeof data.value !== "string") {
      throw new Error("NotebookCellData MUST have 'value' property");
    }
    if (typeof data.languageId !== "string") {
      throw new Error("NotebookCellData MUST have 'languageId' property");
    }
  }
  static isNotebookCellDataArray(value2) {
    return Array.isArray(value2) && value2.every((elem) => _NotebookCellData.isNotebookCellData(elem));
  }
  static isNotebookCellData(value2) {
    return true;
  }
  constructor(kind, value2, languageId, mime, outputs, metadata, executionSummary) {
    this.kind = kind;
    this.value = value2;
    this.languageId = languageId;
    this.mime = mime;
    this.outputs = outputs ?? [];
    this.metadata = metadata;
    this.executionSummary = executionSummary;
    _NotebookCellData.validate(this);
  }
};

var NotebookData = class {
  constructor(cells) {
    this.cells = cells;
  }
};

var NotebookEdit = class {
  static isNotebookCellEdit(thing) {
    if (thing instanceof NotebookEdit) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return NotebookRange.isNotebookRange(thing) && Array.isArray(thing.newCells);
  }
  static replaceCells(range2, newCells) {
    return new NotebookEdit(range2, newCells);
  }
  static insertCells(index2, newCells) {
    return new NotebookEdit(new NotebookRange(index2, index2), newCells);
  }
  static deleteCells(range2) {
    return new NotebookEdit(range2, []);
  }
  static updateCellMetadata(index2, newMetadata) {
    const edit3 = new NotebookEdit(new NotebookRange(index2, index2), []);
    edit3.newCellMetadata = newMetadata;
    return edit3;
  }
  static updateNotebookMetadata(newMetadata) {
    const edit3 = new NotebookEdit(new NotebookRange(0, 0), []);
    edit3.newNotebookMetadata = newMetadata;
    return edit3;
  }
  constructor(range2, newCells) {
    this.range = range2;
    this.newCells = newCells;
  }
};

NotebookEdit = __decorateClass([
  es5ClassCompat
], NotebookEdit);

var NotebookCellOutputItem = class _NotebookCellOutputItem {
  constructor(data, mime) {
    this.data = data;
    this.mime = mime;
    const mimeNormalized = normalizeMimeType(mime, true);
    if (!mimeNormalized) {
      throw new Error(`INVALID mime type: ${mime}. Must be in the format "type/subtype[;optionalparameter]"`);
    }
    this.mime = mimeNormalized;
  }
  static isNotebookCellOutputItem(obj) {
    if (obj instanceof _NotebookCellOutputItem) {
      return true;
    }
    if (!obj) {
      return false;
    }
    return typeof obj.mime === "string" && obj.data instanceof Uint8Array;
  }
  static error(err) {
    const obj = {
      name: err.name,
      message: err.message,
      stack: err.stack
    };
    return _NotebookCellOutputItem.json(obj, "application/vnd.code.notebook.error");
  }
  static stdout(value2) {
    return _NotebookCellOutputItem.text(value2, "application/vnd.code.notebook.stdout");
  }
  static stderr(value2) {
    return _NotebookCellOutputItem.text(value2, "application/vnd.code.notebook.stderr");
  }
  static bytes(value2, mime = "application/octet-stream") {
    return new _NotebookCellOutputItem(value2, mime);
  }
  static #encoder = new TextEncoder();
  static text(value2, mime = Mimes.text) {
    const bytes = _NotebookCellOutputItem.#encoder.encode(String(value2));
    return new _NotebookCellOutputItem(bytes, mime);
  }
  static json(value2, mime = "text/x-json") {
    const rawStr = JSON.stringify(value2, void 0, "	");
    return _NotebookCellOutputItem.text(rawStr, mime);
  }
};

var NotebookCellOutput = class _NotebookCellOutput {
  static isNotebookCellOutput(candidate) {
    if (candidate instanceof _NotebookCellOutput) {
      return true;
    }
    if (!candidate || typeof candidate !== "object") {
      return false;
    }
    return typeof candidate.id === "string" && Array.isArray(candidate.items);
  }
  static ensureUniqueMimeTypes(items, warn = false) {
    const seen = /* @__PURE__ */ new Set();
    const removeIdx = /* @__PURE__ */ new Set();
    for (let i2 = 0; i2 < items.length; i2++) {
      const item = items[i2];
      const normalMime = normalizeMimeType(item.mime);
      if (!seen.has(normalMime) || isTextStreamMime(normalMime)) {
        seen.add(normalMime);
        continue;
      }
      removeIdx.add(i2);
      if (warn) {
        console.warn(`DUPLICATED mime type '${item.mime}' will be dropped`);
      }
    }
    if (removeIdx.size === 0) {
      return items;
    }
    return items.filter((_item, index2) => !removeIdx.has(index2));
  }
  constructor(items, idOrMetadata, metadata) {
    this.items = _NotebookCellOutput.ensureUniqueMimeTypes(items, true);
    if (typeof idOrMetadata === "string") {
      this.id = idOrMetadata;
      this.metadata = metadata;
    } else {
      this.id = generateUuid();
      this.metadata = idOrMetadata ?? metadata;
    }
  }
};
export { NotebookRange, NotebookCellData, NotebookData, NotebookEdit, NotebookCellOutputItem, NotebookCellOutput };
