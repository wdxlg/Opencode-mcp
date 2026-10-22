// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/undoRedo/common/undoRedo.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/undoRedo/common/undoRedo.ts
var IUndoRedoService = createDecorator("undoRedoService");

var ResourceEditStackSnapshot = class {
  constructor(resource, elements) {
    this.resource = resource;
    this.elements = elements;
  }
};

var UndoRedoGroup = class _UndoRedoGroup {
  static {
    this._ID = 0;
  }
  constructor() {
    this.id = _UndoRedoGroup._ID++;
    this.order = 1;
  }
  nextOrder() {
    if (this.id === 0) {
      return 0;
    }
    return this.order++;
  }
  static {
    this.None = new _UndoRedoGroup();
  }
};

var UndoRedoSource = class _UndoRedoSource {
  static {
    this._ID = 0;
  }
  constructor() {
    this.id = _UndoRedoSource._ID++;
    this.order = 1;
  }
  nextOrder() {
    if (this.id === 0) {
      return 0;
    }
    return this.order++;
  }
  static {
    this.None = new _UndoRedoSource();
  }
};
export { IUndoRedoService, ResourceEditStackSnapshot, UndoRedoGroup, UndoRedoSource };
