// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/eventDispatcher.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/eventDispatcher.ts
var NotebookDiffLayoutChangedEvent = class {
  constructor(source, value2) {
    this.source = source;
    this.value = value2;
    this.type = 1 /* LayoutChanged */;
  }
};

var NotebookDiffEditorEventDispatcher = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeLayout = this._register(new Emitter());
    this.onDidChangeLayout = this._onDidChangeLayout.event;
    this._onDidChangeCellLayout = this._register(new Emitter());
    this.onDidChangeCellLayout = this._onDidChangeCellLayout.event;
  }
  emit(events) {
    for (let i2 = 0, len = events.length; i2 < len; i2++) {
      const e = events[i2];
      switch (e.type) {
        case 1 /* LayoutChanged */:
          this._onDidChangeLayout.fire(e);
          break;
        case 2 /* CellLayoutChanged */:
          this._onDidChangeCellLayout.fire(e);
          break;
      }
    }
  }
};
export { NotebookDiffLayoutChangedEvent, NotebookDiffEditorEventDispatcher };
